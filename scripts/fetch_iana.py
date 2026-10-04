"""Fetch all public IANA delegation pages using Python's standard library. Builds are offline."""
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from html.parser import HTMLParser
from pathlib import Path
import argparse
import base64
import gzip
import hashlib
import json
import re
import time
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / "data/evidence/iana"
STATE = CACHE / "retrieval-log.json"


class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.names = set()

    def handle_starttag(self, tag, attrs):
        href = dict(attrs).get("href", "")
        if tag == "a" and re.fullmatch(r"/domains/root/db/[a-z0-9-]+\.html", href):
            self.names.add(href.rsplit("/", 1)[1])


def fetch(name, url):
    for attempt in range(4):
        try:
            with urlopen(Request(url, headers={"User-Agent": "Connecting-the-Dots-research/0.7.7"}), timeout=35) as response:
                raw = response.read()
            if name.endswith(".html") and b"Delegation Record for" not in raw:
                raise RuntimeError("Unexpected delegation-page response")
            stamp = datetime.now(timezone.utc).isoformat()
            (CACHE / (name + ".tmp")).write_bytes(raw)
            (CACHE / (name + ".tmp")).replace(CACHE / name)
            return name, {"source": url, "retrievedAt": stamp, "sha256": hashlib.sha256(raw).hexdigest()}
        except HTTPError as exc:
            if exc.code not in (429, 502, 503, 504) or attempt == 3:
                raise
            wait = exc.headers.get("Retry-After", "")
            if wait.isdigit():
                delay = int(wait)
            elif wait:
                try:
                    delay = max(0, (parsedate_to_datetime(wait) - datetime.now(timezone.utc)).total_seconds())
                except (TypeError, ValueError):
                    raise RuntimeError("Unrecognized Retry-After; rerun later") from exc
            else:
                delay = 2 ** attempt
            if delay > 60:
                raise RuntimeError("Server requested a longer retry interval; rerun later") from exc
            time.sleep(delay)
        except (TimeoutError, URLError, ConnectionError):
            if attempt == 3:
                raise
            time.sleep(2 ** attempt)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--workers", type=int, default=8)
    parser.add_argument("--refresh", action="store_true", help="Fetch a new dated root list and all records")
    args = parser.parse_args()
    CACHE.mkdir(parents=True, exist_ok=True)
    snapshot = json.loads((ROOT / "data/iana_snapshot.json").read_text())
    state = json.loads(STATE.read_text()) if STATE.exists() else {}
    evidence = json.loads(gzip.decompress((ROOT / snapshot["archive_path"]).read_bytes()))
    for item in snapshot["files"]:
        name = Path(item["path"]).name
        if not (CACHE / name).exists():
            (CACHE / name).write_bytes(base64.b64decode(evidence["files"][item["path"]]))
        state.setdefault(name, {"retrievedAt": item.get("retrievedAt", snapshot["retrievedAt"]), "sha256": item["sha256"]})
    if args.refresh:
        for name, url in [("root-db.html", "https://www.iana.org/domains/root/db"), ("tlds-alpha-by-domain.txt", snapshot["listSource"])]:
            with urlopen(Request(url, headers={"User-Agent": "Connecting-the-Dots-research/0.7.7"}), timeout=35) as response:
                raw = response.read()
            (CACHE / name).write_bytes(raw)
            state[name] = {"source": url, "retrievedAt": datetime.now(timezone.utc).isoformat(), "sha256": hashlib.sha256(raw).hexdigest()}
    links = Links()
    links.feed((CACHE / "root-db.html").read_text())
    labels = [s.strip() for s in (CACHE / "tlds-alpha-by-domain.txt").read_text().splitlines() if s.strip() and not s.startswith("#")]
    if not labels or len(set(labels)) != len(labels) or any(not re.fullmatch(r"[A-Z0-9-]+", s) for s in labels):
        raise RuntimeError("Invalid root list")
    if not {s.lower() + ".html" for s in labels}.issubset(links.names):
        raise RuntimeError("Root database appears incomplete")
    STATE.write_text(json.dumps(state, indent=2) + "\n")
    todo = [name for name in sorted(links.names) if args.refresh or not (CACHE / name).exists() or name not in state or hashlib.sha256((CACHE / name).read_bytes()).hexdigest() != state[name]["sha256"]]
    print(f"IANA delegation records: {len(links.names)}; cached: {len(links.names)-len(todo)}; to fetch: {len(todo)}", flush=True)
    failures = []
    with ThreadPoolExecutor(max_workers=max(1, min(args.workers, 12))) as pool:
        jobs = {pool.submit(fetch, name, "https://www.iana.org/domains/root/db/" + name): name for name in todo}
        for n, job in enumerate(as_completed(jobs), 1):
            try:
                name, metadata = job.result()
                state[name] = metadata
            except Exception as exc:
                failures.append(jobs[job])
                print(f"Failed {jobs[job]}: {type(exc).__name__}: {exc}", flush=True)
            if n % 50 == 0 or n == len(todo):
                STATE.write_text(json.dumps(state, indent=2) + "\n")
                print(f"Fetched {n}/{len(todo)}; failures {len(failures)}", flush=True)
    STATE.write_text(json.dumps(state, indent=2) + "\n")
    if failures:
        raise SystemExit(f"Incomplete import: {len(failures)} failures; rerun to resume")
    print(f"All {len(links.names)} delegation pages cached. Run node scripts/normalize_iana.js to validate and preserve the snapshot.", flush=True)


if __name__ == "__main__":
    main()
