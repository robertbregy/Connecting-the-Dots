#!/usr/bin/env python3
"""Read-only source reachability and dated-snapshot review, without refreshing evidence.

Only anchors in the staged public HTML are inventoried. In a checkout the same
public_files() allowlist used for Pages staging supplies that HTML inventory.
A successful HTTP response establishes reachability, never editorial currency.
"""
from __future__ import annotations

import argparse
from collections import Counter, defaultdict, deque
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import date, datetime, timezone
from html import escape
from html.parser import HTMLParser
import json
import os
from pathlib import Path
import socket
from threading import BoundedSemaphore
import time
from urllib.error import HTTPError, URLError
from urllib.parse import urldefrag, urljoin, urlsplit, urlunsplit
from urllib.request import Request, urlopen
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[1]
UA = "Connecting-the-Dots-Source-Health/0.7.108 (+https://github.com/robertbregy/Connecting-the-Dots)"
STATES = ("OK", "redirect", "accesso limitato", "errore", "da rivedere")
RESTRICTED = {401, 403, 407, 429, 451}
# Confirm apparent missing pages with GET; do not repeat denied/rate-limited requests.
GET_FALLBACK = {400, 404, 405, 406, 410, 501}


def utc_stamp(value=None):
    return (value or datetime.now(timezone.utc)).astimezone(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")


class AnchorParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.hrefs = []

    def handle_starttag(self, tag, attrs):
        if tag.lower() not in ("a", "area"):
            return
        for key, value in attrs:
            if key.lower() == "href" and value:
                self.hrefs.append(value.strip())


def external_url(raw, page_url, deployment):
    url = urldefrag(urljoin(page_url, raw))[0]
    parts, own = urlsplit(url), urlsplit(deployment)
    if parts.scheme.lower() not in ("http", "https") or not parts.hostname:
        return None
    base_path = own.path.rstrip("/")
    if (parts.hostname.lower() == own.hostname.lower()
            and parts.port == own.port
            and (parts.path == base_path or parts.path.startswith(base_path + "/"))):
        return None
    return urlunsplit((parts.scheme.lower(), parts.netloc, parts.path, parts.query, ""))


def collect_sources(site_root, deployment, html_paths=None):
    """Map each distinct external anchor URL to its actual published referring pages."""
    site_root = Path(site_root).resolve()
    paths = sorted(html_paths if html_paths is not None else site_root.rglob("*.html"))
    inventory = {}
    pages = []
    for path in paths:
        path = Path(path).resolve()
        rel = path.relative_to(site_root).as_posix()
        page_url = urljoin(deployment.rstrip("/") + "/", rel)
        parser = AnchorParser()
        parser.feed(path.read_text(encoding="utf-8"))
        pages.append(rel)
        for raw in parser.hrefs:
            try:
                url = external_url(raw, page_url, deployment)
            except ValueError as exc:
                raise ValueError(f"Invalid anchor URL in {rel}: {raw!r}") from exc
            if url:
                inventory.setdefault(url, set()).add(rel)
    if not pages:
        raise ValueError("No published HTML files found; source inventory would be empty.")
    return {url: sorted(refs) for url, refs in sorted(inventory.items())}, pages


def classify_http(status, redirected=False):
    if status in RESTRICTED:
        return "accesso limitato"
    if 200 <= status < 300:
        return "redirect" if redirected else "OK"
    if status >= 400:
        return "errore"
    return "da rivedere"


def unchecked(url, reason):
    return {"url": url, "state": "da rivedere", "status": None, "finalUrl": None,
            "checkedAtUTC": None, "reason": reason, "checks": [], "hardFailure": False}



def load_url_roles(root, policy, inventory):
    """Exact, evidence-backed roles; no hostname/path heuristic can waive a 404."""
    rules = policy.get("urlRoles", {})
    roles = {}
    rdap = rules.get("rdapServiceBases")
    if rdap:
        data = json.loads((Path(root) / rdap["metadataFile"]).read_text(encoding="utf-8"))
        for record_id, record in data[rdap["recordsField"]].items():
            for base_url in record.get(rdap["urlsField"], []):
                if base_url in inventory:
                    role = roles.setdefault(base_url, {"role": "rdap-service-base", "metadataFile": rdap["metadataFile"],
                                                       "field": rdap["urlsField"], "recordIDs": []})
                    role["recordIDs"].append(record_id)
    for url in inventory:
        parts = urlsplit(url)
        for action in rules.get("excludedActions", []):
            origin = urlsplit(action["origin"])
            if (parts.scheme == origin.scheme and parts.netloc == origin.netloc
                    and parts.path == action["path"]):
                roles[url] = {"role": "feedback-action", "reason": action["reason"],
                              "matchedOrigin": action["origin"], "matchedPath": action["path"]}
    return roles


def apply_url_role(row, role=None):
    row["urlRole"] = role["role"] if role else "document-or-other-link"
    if not role:
        return row
    row["roleEvidence"] = role
    if role["role"] == "feedback-action":
        row.update(state="da rivedere", status=None, finalUrl=None, checkedAtUTC=None,
                   hardFailure=False, checks=[], checkDisposition="excluded-action", reason=role["reason"])
    elif role["role"] == "rdap-service-base" and row.get("status") in (400, 404, 405, 410, 501):
        row.update(state="da rivedere", hardFailure=False,
                   reason="This exact URL is an RDAP service base in the dated IANA corpus. Its HTTP response without an object/help query does not establish a missing document or a failed service; the original status is retained.")
    return row


def probe(url, timeout=12, opener=urlopen):
    started = time.monotonic()
    row = unchecked(url, "")
    row["checkedAtUTC"] = utc_stamp()
    parts = urlsplit(url)
    if parts.username or parts.password:
        row.update(checkedAtUTC=None, reason="URL contains credentials; request not sent.")
        return row
    checks = row["checks"]

    def call(method):
        headers = {"User-Agent": UA, "Accept": "*/*"}
        if method == "GET":
            headers["Range"] = "bytes=0-1023"
        request = Request(url, method=method, headers=headers)
        try:
            # No response body is read, even if a server ignores Range.
            with opener(request, timeout=timeout) as response:
                result = int(response.status), response.geturl()
        except HTTPError as exc:
            result = exc.code, exc.geturl()
            exc.close()
        checks.append({"method": method, "status": result[0], "finalUrl": result[1]})
        return result

    try:
        status, final = call("HEAD")
        if status in GET_FALLBACK:
            status, final = call("GET")
        redirected = urldefrag(final)[0] != urldefrag(url)[0]
        state = classify_http(status, redirected)
        row.update(state=state, status=status, finalUrl=final, redirected=redirected,
                   hardFailure=status in (404, 410) and checks[-1]["method"] == "GET",
                   reason={"OK": "Reachable; content has not been revalidated.",
                           "redirect": "Reachable after redirection; review the citation destination.",
                           "accesso limitato": "Access denied, restricted or rate limited; not evidence of a missing source.",
                           "errore": "HTTP error; see status and request history.",
                           "da rivedere": "HTTP result does not establish reachability."}[state])
    except (URLError, socket.timeout, TimeoutError, OSError, ValueError, UnicodeError) as exc:
        reason = getattr(exc, "reason", exc)
        row.update(state="da rivedere", error=str(exc)[:240],
                   errorType="timeout" if isinstance(reason, (socket.timeout, TimeoutError)) else "network-or-url",
                   reason="Request could not be completed; source availability remains unverified.")
    row["seconds"] = round(time.monotonic() - started, 3)
    return row


def check_inventory(inventory, *, workers=6, per_host=2, timeout=12, max_urls=1500, budget_seconds=600, progress=False, roles=None):
    """Bounded GET/HEAD-only scan; every skipped URL remains explicitly unverified."""
    # Interleave hosts so a large ICANN group cannot exhaust the time budget
    # before smaller source hosts have had a turn; still cap each host at two.
    roles = roles or {}
    excluded = [apply_url_role(unchecked(url, ""), roles[url]) for url in sorted(inventory)
                if roles.get(url, {}).get("role") == "feedback-action"]
    by_host = defaultdict(deque)
    for url in sorted(inventory):
        if roles.get(url, {}).get("role") != "feedback-action":
            by_host[urlsplit(url).netloc].append(url)
    urls = []
    active = deque(by_host.values())
    while active:
        group = active.popleft()
        urls.append(group.popleft())
        if group:
            active.append(group)
    selected = urls[:max_urls]
    gates = {urlsplit(url).netloc: BoundedSemaphore(per_host) for url in selected}
    deadline = time.monotonic() + budget_seconds

    def run(url):
        with gates[urlsplit(url).netloc]:
            if time.monotonic() >= deadline:
                return unchecked(url, "Run time budget exhausted; no request sent.")
            return apply_url_role(probe(url, timeout=timeout), roles.get(url))

    rows = []
    with ThreadPoolExecutor(max_workers=workers) as pool:
        futures = [pool.submit(run, url) for url in selected]
        for future in as_completed(futures):
            rows.append(future.result())
            if progress and (len(rows) % 25 == 0 or rows[-1]["hardFailure"]):
                print(json.dumps({"completed": len(rows), "selected": len(selected),
                                  "states": dict(Counter(row["state"] for row in rows))},
                                 ensure_ascii=False), flush=True)
    rows.extend(unchecked(url, "URL budget exhausted; no request sent.") for url in urls[max_urls:])
    rows.extend(excluded)
    for row in rows:
        apply_url_role(row, roles.get(row["url"]))
        row["referringPages"] = inventory[row["url"]]
    return sorted(rows, key=lambda row: row["url"])


def field_value(document, field):
    value = document
    for part in field.split("."):
        value = value[int(part)] if isinstance(value, list) else value[part]
    return value


def source_date(value):
    # Dates are source observation dates, not the time of an HTTP reachability check.
    if not isinstance(value, str):
        raise ValueError("Observation date must be a string")
    return date.fromisoformat(value[:10])


def evaluate_freshness(root, policy, now=None):
    now = now or datetime.now(timezone.utc)
    today = now.astimezone(ZoneInfo(policy.get("timezone", "Europe/Zurich"))).date()
    root = Path(root)
    rows = []
    for entry in policy["snapshots"]:
        row = {key: entry[key] for key in ("id", "label", "role", "metadataFile", "dateField")}
        row["evaluatedAtUTC"] = utc_stamp(now)
        try:
            data = json.loads((root / entry["metadataFile"]).read_text(encoding="utf-8"))
            if "releaseId" in entry:
                releases = [data["currentResearchRelease"], *data.get("previousResearchReleases", [])]
                matches = [release for release in releases if release.get("id") == entry["releaseId"]]
                if len(matches) != 1:
                    raise ValueError(f"Expected one archived release {entry['releaseId']}")
                data = matches[0]
                row["releaseId"] = entry["releaseId"]
            observed = source_date(field_value(data, entry["dateField"]))
            row.update(observedOn=observed.isoformat(), ageDays=(today - observed).days)
            if "sourceURLField" in entry:
                row["sourceURL"] = field_value(data, entry["sourceURLField"])
            if row["ageDays"] < 0:
                raise ValueError("Observation date is in the future")
            if entry["role"] == "frozen-evidence":
                row.update(state="frozen-evidence", reviewRequired=False,
                           reason="Archived scientific evidence has no age expiry; preserve its dated bytes and citation.")
            else:
                max_age = entry["reviewAfterDays"]
                if not isinstance(max_age, int) or max_age < 1:
                    raise ValueError("reviewAfterDays must be a positive integer")
                row["reviewAfterDays"] = max_age
                reasons = []
                if row["ageDays"] >= max_age:
                    reasons.append("Observation age reached the editorial review threshold.")
                milestone = entry.get("nextReview")
                if milestone:
                    md = json.loads((root / milestone["metadataFile"]).read_text(encoding="utf-8"))
                    due = source_date(field_value(md, milestone["dateField"]))
                    row.update(nextReviewOn=due.isoformat(), reviewMilestone=milestone["label"],
                               daysUntilReview=(due - today).days)
                    if today >= due and observed < due:
                        row["milestoneState"] = "review-due"
                        reasons.append("Milestone reached; reconcile a new official observation before updating the current view.")
                    elif observed >= due:
                        row["milestoneState"] = "observation-on-or-after-milestone"
                    else:
                        row["milestoneState"] = "upcoming"
                row.update(state="review-due" if reasons else "within-review-window",
                           reviewRequired=bool(reasons),
                           reason=" ".join(reasons) if reasons else "Within the configured review window; not a claim of live data.")
        except (OSError, KeyError, IndexError, TypeError, ValueError) as exc:
            row.update(state="metadata-error", reviewRequired=True, reason=str(exc)[:240])
        rows.append(row)
    return rows


def markdown_report(report):
    def cell(value):
        return escape(str(value), quote=False).replace("|", "&#124;").replace("\n", " ")

    lines = ["# External source health", "", f"Run: **{report['checkedAtUTC']}** · mode: **{report['mode']}**", "",
             f"Inventoried **{report['total']}** distinct external anchor URLs across **{report['publishedHTMLPages']}** published HTML pages.",
             f"Attempted **{report['checked']}** URLs; **{report.get('unchecked', report['total'] - report['checked'])}** eligible URLs remain unchecked; **{report.get('excluded', 0)}** feedback actions are excluded from verification.", "",
             "HTTP reachability does not verify the content, factual accuracy or freshness of a source. Access restrictions and timeouts are not missing-page findings.", "",
             "| State | URLs |", "| --- | ---: |"]
    lines += [f"| {state} | {report['summary'].get(state, 0)} |" for state in STATES]
    lines += ["", "## Dated snapshots and scientific archives", "",
              "Review thresholds govern the current site's use of dated observations. They do not expire or rewrite frozen evidence. No dataset is downloaded or updated by this check.", "",
              "| Snapshot | Observed | Age (days) | State | Next review |", "| --- | --- | ---: | --- | --- |"]
    for row in report["freshness"]:
        lines.append("| " + " | ".join(cell(row.get(key, "—")) for key in ("label", "observedOn", "ageDays", "state", "nextReviewOn")) + " |")
    for row in report["freshness"]:
        if row["reviewRequired"]:
            lines.append(f"\n- **{cell(row['label'])}:** {cell(row['reason'])}")
    lines += ["", "## URL results", "", "Every URL includes its attempted check in this run and the published pages that refer to it. An empty check time means no network request was made.", ""]
    # Findings first, while retaining the full inventory in both artifact formats.
    for row in sorted(report["results"], key=lambda item: (item["state"] == "OK", item["url"])):
        lines.extend([f"### {cell(row['url'])}", "",
                      f"- State: **{row['state']}**; HTTP: **{row.get('status') or '—'}**; checked: **{row.get('checkedAtUTC') or '—'}**.",
                      f"- Role: **{row.get('urlRole', 'document-or-other-link')}**.",
                      f"- {cell(row['reason'])}"])
        if row.get("finalUrl") and row["finalUrl"] != row["url"]:
            lines.append(f"- Destination: {cell(row['finalUrl'])}")
        lines.append("- Referring pages: " + ", ".join(f"`{cell(path)}`" for path in row["referringPages"]))
        lines.append("")
    return "\n".join(lines) + "\n"


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--site-root", type=Path, help="Staged public payload; default: the Pages public_files allowlist.")
    parser.add_argument("--policy", type=Path, default=ROOT / "data/source_freshness_policy.json")
    parser.add_argument("--output", type=Path, default=Path(os.environ.get("CTD_LINK_REPORT", "artifacts/external-source-health.json")))
    parser.add_argument("--markdown", type=Path, help="Defaults to the JSON path with .md suffix.")
    parser.add_argument("--inventory-only", action="store_true", help="No network requests; still evaluates local snapshot dates.")
    parser.add_argument("--workers", type=int, default=6)
    parser.add_argument("--per-host", type=int, default=2)
    parser.add_argument("--timeout", type=float, default=12)
    parser.add_argument("--max-urls", type=int, default=1500)
    parser.add_argument("--budget-seconds", type=float, default=600)
    args = parser.parse_args(argv)
    if not (1 <= args.workers <= 12 and 1 <= args.per_host <= 2 and 0 < args.timeout <= 30
            and args.max_urls >= 1 and args.budget_seconds > 0):
        parser.error("Use 1–12 workers, 1–2 per host, timeout <=30s and positive budgets.")
    deployment = json.loads((ROOT / "publication.json").read_text(encoding="utf-8"))["deployment"]
    if args.site_root:
        site_root, paths = args.site_root.resolve(), None
    else:
        from stage_public_site import public_files
        site_root = ROOT
        paths = [path for path in public_files(ROOT) if path.suffix == ".html"]
    inventory, pages = collect_sources(site_root, deployment, paths)
    policy = json.loads(args.policy.read_text(encoding="utf-8"))
    freshness = evaluate_freshness(ROOT, policy)
    roles = load_url_roles(ROOT, policy, inventory)
    if args.inventory_only:
        rows = [dict(apply_url_role(unchecked(url, "Inventory only; no network request sent."), roles.get(url)), referringPages=refs)
                for url, refs in inventory.items()]
    else:
        rows = check_inventory(inventory, workers=args.workers, per_host=args.per_host, timeout=args.timeout,
                               max_urls=args.max_urls, budget_seconds=args.budget_seconds, progress=True, roles=roles)
    checked = sum(row["checkedAtUTC"] is not None for row in rows)
    excluded = sum(row.get("checkDisposition") == "excluded-action" for row in rows)
    eligible = len(rows) - excluded
    report = {"schemaVersion": 2, "checkedAtUTC": utc_stamp(),
              "mode": "inventory-only" if args.inventory_only else "http-reachability",
              "scope": "External a/area href URLs in the staged Pages publication; no source templates, prototypes, metadata links, or unrendered runtime data.",
              "deployment": deployment, "publishedHTMLPages": len(pages), "pages": pages,
              "total": len(rows), "checked": checked, "eligible": eligible, "excluded": excluded,
              "unchecked": eligible - checked, "complete": checked == eligible,
              "summary": {state: Counter(row["state"] for row in rows)[state] for state in STATES},
              "budgets": {"workers": args.workers, "perHost": args.per_host, "timeoutSeconds": args.timeout,
                          "maxURLs": args.max_urls, "runSeconds": args.budget_seconds},
              "freshnessPolicy": str(args.policy.relative_to(ROOT)) if args.policy.is_relative_to(ROOT) else str(args.policy),
              "freshness": freshness, "results": rows}
    markdown = args.markdown or args.output.with_suffix(".md")
    for path, contents in ((args.output, json.dumps(report, ensure_ascii=False, indent=2) + "\n"),
                           (markdown, markdown_report(report))):
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(contents, encoding="utf-8")
    print(json.dumps({key: report[key] for key in ("mode", "total", "eligible", "excluded", "checked", "complete", "summary")}, ensure_ascii=False, indent=2))
    print(f"Reports: {args.output}, {markdown}")
    # CI annotations are deliberately bounded; the artifacts contain every finding.
    missing = [row for row in rows if row["hardFailure"]]
    if os.environ.get("GITHUB_ACTIONS") == "true":
        def annotation(level, title, message):
            safe = message.replace("%", "%25").replace("\r", "%0D").replace("\n", "%0A")
            print(f"::{level} title={title}::{safe}")
        for row in missing[:20]:
            annotation("error", "External source returned 404/410", f"{row['status']} {row['url']}")
        for row in freshness:
            if row["reviewRequired"]:
                annotation("warning", "Dated snapshot needs review", f"{row['label']}: {row['reason']}")
        if not report["complete"] and not args.inventory_only:
            annotation("warning", "Source check incomplete", f"{eligible - checked} eligible URLs unattempted; consult the complete inventory.")
    return 2 if any(row["state"] == "metadata-error" for row in freshness) else int(bool(missing))


if __name__ == "__main__":
    raise SystemExit(main())
