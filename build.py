from __future__ import annotations

from pathlib import Path
import csv
import hashlib
import json
import os
import re
import shutil
import subprocess
import zipfile
from scripts.package_release import write_deterministic_zip
from scripts.render_inside_round import render_timeline, build_inside_round_pages

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "src" / "index.web.html"
INDEX = ROOT / "index.html"
DATA = ROOT / "data"
PUBLICATION = json.loads((ROOT / "publication.json").read_text(encoding="utf-8"))
VERSION = PUBLICATION["version"]
RELEASED_ON = PUBLICATION["releasedOn"]
AS_OF = PUBLICATION["asOf"]


def csv_records(path: Path) -> int:
    with path.open("r", encoding="utf-8-sig", newline="") as fh:
        return max(sum(1 for _ in csv.reader(fh)) - 1, 0)


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def bundle_runtime() -> None:
    script = ROOT / "scripts" / "bundle_runtime.js"
    try:
        subprocess.run(["node", str(script)], check=True, capture_output=True, text=True)
    except FileNotFoundError:
        for bundle in [DATA / "data_bundle.js", DATA / "i18n_bundle.js"]:
            if not bundle.exists():
                raise SystemExit("Node.js is unavailable and a required runtime bundle is missing")
        print("Node.js unavailable: using committed runtime bundles")
    except subprocess.CalledProcessError as exc:
        raise SystemExit(exc.stderr or exc.stdout)


def build_manifest() -> None:
    shutil.copyfile(ROOT / "CONTENT_LICENSE.md", DATA / "CONTENT_LICENSE.md")
    files = []
    for path in sorted(DATA.glob("*.csv")):
        files.append({
            "path": path.name,
            "bytes": path.stat().st_size,
            "records": csv_records(path),
            "sha256": sha256(path),
        })
    runtime = json.loads((DATA / "data_bundle.js").read_text().split("window.DOT_DATA=", 1)[1].rsplit(";", 1)[0])
    manifest = {
        "project": "Connecting the Dots",
        "version": VERSION,
        "release_date": RELEASED_ON,
        "publication_state": "reveal-day",
        "rendering": "static-prerendered",
        "language_routes": {lang: f"{lang}/" for lang in ("en", "it", "de", "fr")},
        "as_of": AS_OF,
        "temporal_coverage": "1984/2026",
        "reveal_day": PUBLICATION["revealAt"],
        "string_confirmation_day": PUBLICATION["stringConfirmation"],
        "notes": [
            "Record counts exclude CSV headers.",
            "applications_2026.csv contains locally vendored official 2026 APS records; v0.7.46 keeps the independently verified .lugano APS record local, labels the application CSV explicitly as partial, documents the official 7 October statistics snapshot and the 980-string secondary inventory separately, and does not claim full local APS application coverage during the Replacement Period.",
            "explorer_catalog.csv is the latest indexed record view; explorer_events.csv keeps separate historical events for multi-era strings.",
            ".lugano is linked to the official ICANN APS Reveal Day record CDL2651T-T31516 published on 7 October 2026.",
            "dns_oddities.csv distinguishes active legacy, retired, reserved and never-delegated country-code cases.",
            "Blank 2026 aggregate values are scaffolding, not observations.",
            "Every preserved IANA database entry has a normalized profile; root-list membership is separate from database presence.",
            "Application Archaeology separates submissions, applied-for strings and delegated TLD identity; never-delegated applications do not increase the TLD universe.",
            "Application outcome is modeled independently from contention and governance controversy. outcome_reason is populated only where this frozen corpus carries source-backed evidence; blank outcome fields are unknown here, not inferred successes or failures.",
            "The complete 2012 Reveal-Day string/applicant graph is vendored locally: 1,930 applications across 1,409 distinct strings. Primary Contact and Email from the historic richer transport are not stored, exposed or exported; the browser performs no external research fetch.",
            "TLD Life Histories remain deterministic and local. The frozen 2026 Reveal Day string inventory is vendored with the publication; application-level APS facts are included locally only where explicitly vendored. Undocumented phases are never inferred.",
            "Disputed Dots adds nine editorially selected governance cases as a structured layer linked to Explorer strings; FACT and READING remain separate, and case sources are primary ICANN/IANA records.",
            "Economics of the Dot adds eight source-backed economic mechanisms; public revenue, company results, transaction values, auction prices and application fees retain their original accounting basis and are not normalized into one ranking.",
            "The Social Life of the Dot adds nine source-backed social cases and six analytical models covering language, community, identity, protection, locality and script inclusion; registration volume is never used as a proxy for social significance.",
            "explorer_nameservers.csv and explorer_iana_reports.csv preserve technical records and report references by ASCII TLD identity.",
            "tld_universe.csv is the exhaustive TLD/profile universe for this snapshot: the IANA database plus historically delegated TLDs absent from the current IANA database. The Explorer extends that universe with all locally vendored formal application strings from 2000, 2004 and 2012.",
            "application_only_strings.csv is the build-time application-only view. The complete 2012 Reveal-Day string/applicant graph is locally integrated; the 2026 Reveal Day string inventory is frozen locally, while application-level local APS coverage remains intentionally partial until a full official export is vendored and validated.",
        ],
        "current_root_snapshot": json.loads((DATA / "iana_snapshot.json").read_text())["asOf"],
        "iana_evidence": "iana_snapshot.json",
        "explorer_coverage": runtime["explorerMeta"],
        "iana_evidence_archive": json.loads((DATA / "iana_snapshot.json").read_text())["archive_path"].removeprefix("data/"),
        "release_history": {"path": "release_history.json", "sha256": sha256(DATA / "release_history.json")},
        "freeze": {
            "status": "reveal-day-snapshot",
            "frozen_on": "2026-10-07",
            "runtime_external_enrichment": False,
            "browser_time_external_data_fetches": "none",
            "policy": "Core research datasets and the frozen 2026 Reveal Day string inventory are packaged locally for deterministic browsing; no visitor-time 2026 inventory fetch is performed."
        },
        "web_delivery": {
            "profile_loading": "on-demand",
            "detail_batches": 8,
            "assets": [{"repository_path": str(path.relative_to(ROOT)), "bytes": path.stat().st_size, "sha256": sha256(path)}
                       for path in [DATA / "site_bundle.js", ROOT / "assets/app.js", ROOT / "assets/style.css", DATA / "worldmap.js", *sorted(DATA.glob("explorer_profiles_*.js"))]],
        },
        "files": files,
    }
    (DATA / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def data_pack_files() -> list[Path]:
    snapshot = json.loads((DATA / "iana_snapshot.json").read_text())
    return [*sorted(DATA.glob("*.csv")), DATA / "manifest.json", DATA / "README.md", DATA / "iana_snapshot.json", DATA / "release_history.json", DATA / "CONTENT_LICENSE.md", DATA / "application_archaeology_manifest.json", DATA / "application_archaeology_local.json", DATA / "application_2026_snapshot.json", DATA / "tld_life_history_manifest.json", DATA / "governance_cases.json", DATA / "economic_cases.json", DATA / "social_cases.json", ROOT / snapshot["archive_path"]]


def build_data_pack() -> None:
    pack = ROOT / "downloads" / "connecting-the-dots-data-pack.zip"
    if pack.exists() and os.environ.get("CTD_REBUILD_DATA_PACK") != "1":
        print(f"Keeping frozen data pack at v{PUBLICATION.get('dataPackageVersion') or VERSION}")
        return

    # Semantic-drift data should stay grounded in formal ccTLD status plus documented global reinterpretation.
    with (DATA / "semantic_drift.csv").open(encoding="utf-8-sig", newline="") as fh:
        drift_rows = list(csv.DictReader(fh))
    if len(drift_rows) < 6 or {r["string"] for r in drift_rows} != {".io", ".ai", ".tv", ".me", ".co", ".fm"}:
        raise SystemExit("Semantic-drift dataset is incomplete")
    if any(r["formal_type"] != "country-code" for r in drift_rows):
        raise SystemExit("Semantic-drift cases must remain formally identified as ccTLDs")

    with (DATA / "dns_oddities.csv").open(encoding="utf-8-sig", newline="") as fh:
        odd_rows = list(csv.DictReader(fh))
    odd_strings = {r["string"] for r in odd_rows}
    required_oddities = {".su", ".yu", ".an", ".tp", ".cs", ".gb / .uk", ".aq", ".bv", ".sj", ".eu", ".ею / .ευ"}
    if not required_oddities.issubset(odd_strings):
        raise SystemExit("Institutional DNS oddities dataset is incomplete")

    pub = (DATA / "publication.js").read_text(encoding="utf-8")
    if f"version:'{VERSION}'" not in pub:
        raise SystemExit("Publication version does not match build VERSION")

    pack.parent.mkdir(parents=True, exist_ok=True)
    write_deterministic_zip(pack, [(path, str(path.relative_to(DATA))) for path in data_pack_files()])


def build_index() -> None:
    html = SRC.read_text(encoding="utf-8")
    marker = "<!-- CTD_INSIDE_ROUND_EVENTS -->"
    if html.count(marker) != 1:
        raise SystemExit("Inside the Round event placeholder missing or duplicated")
    html = html.replace(marker, render_timeline(ROOT))
    reveal_2026_js = (DATA / "applications_2026_strings_reveal.js").read_text(encoding="utf-8")
    # The prerenderer loads runtime from disk; never inject huge inline bundles.
    html = html.replace('<link href="assets/style.css" rel="stylesheet"/>', '<link id="ctd-runtime-style" href="assets/style.css" rel="stylesheet"/>')
    for ref in ['data/data_bundle.js', 'data/i18n_bundle.js', 'data/worldmap.js']:
        html = html.replace(f'<script src="{ref}"></script>', '')
    html = html.replace('<script src="data/applications_2026_strings_reveal.js"></script>', '<script id="ctd-2026-string-snapshot">\n' + reveal_2026_js + '\n</script>')
    html = html.replace('<script src="data/publication.js"></script><script src="assets/app.js"></script>', '')

    routing_js = (ROOT / "assets" / "legacy-routing.js").read_text(encoding="utf-8")
    html = html.replace('<meta charset="utf-8"/>', '<meta charset="utf-8"/>\n<script id="ctd-legacy-routing">\n' + routing_js + '\n</script>', 1)
    head_runtime = '\n'.join([
        '<script id="ctd-data-bundle"></script>',
        '<script id="ctd-i18n-bundle"></script>',
        '<script id="ctd-worldmap"></script>',
    ])
    html = html.replace('<script id="articleStructuredData"', head_runtime + '\n<script id="articleStructuredData"', 1)
    footer_runtime = '\n'.join([
        '<script id="ctd-publication"></script>',
        '<script id="ctd-app"></script>',
    ])
    html = html.replace('</body></html>', footer_runtime + '\n</body></html>')
    html = html.replace('<title>Connecting the Dots</title>', f'<title>Connecting the Dots</title>\n<meta content="{VERSION}" name="ctd-version"/>', 1)
    html = html.replace('<body>', f'<body data-build="{VERSION}">', 1)
    INDEX.write_text(html, encoding="utf-8")
    try:
        result = subprocess.run(["node", str(ROOT / "scripts" / "render_static.js")], check=False, capture_output=True, text=True)
        if result.returncode != 0:
            missing_linkedom = "Cannot find module 'linkedom'" in (result.stderr or "")
            if not missing_linkedom:
                raise SystemExit(result.stderr or result.stdout or "Static language rendering failed")
            subprocess.run(["python3", str(ROOT / "scripts" / "render_static_fallback.py")], check=True)
            print("linkedom unavailable: used Chromium fallback renderer")
    except FileNotFoundError:
        subprocess.run(["python3", str(ROOT / "scripts" / "render_static_fallback.py")], check=True)
        print("Node.js unavailable: used Chromium fallback renderer")


def validate_index() -> None:
    html = INDEX.read_text(encoding="utf-8")
    required = [
        'id="ctd-runtime-style"', 'id="ctd-data-bundle"', 'id="ctd-i18n-bundle"',
        'id="ctd-worldmap"', 'id="ctd-publication"', 'id="ctd-app"',
    ]
    missing_embeds = [x for x in required if x not in html]
    if missing_embeds:
        raise SystemExit("Missing embedded runtime blocks: " + ", ".join(missing_embeds))
    if 'src="data/data_bundle.js' in html or 'window.DOT_DATA=' in html:
        raise SystemExit("Full data must not be embedded in generated language pages")
    if 'role="menu"' in html or 'role="menuitem"' in html:
        raise SystemExit("Disclosure navigation must not claim the ARIA menu pattern")

    refs = set(re.findall(r'(?:src|href)="([^"]+)"', html))
    missing = []
    for ref in refs:
        if ref.startswith(("http://", "https://", "#", "mailto:", "tel:")) or "${" in ref:
            continue
        ref = ref.split("?", 1)[0].split("#", 1)[0]
        if ref and not (ROOT / ref).exists():
            missing.append(ref)
    if missing:
        raise SystemExit("Missing local assets: " + ", ".join(sorted(missing)))

    if csv_records(DATA / "applications_2026.csv") < 1:
        raise SystemExit("Reveal Day build must contain at least one verified 2026 application record")

    for js in [ROOT / "assets" / "app.js", DATA / "data_bundle.js", DATA / "site_bundle.js", *sorted(DATA.glob("explorer_profiles_*.js")), DATA / "i18n_bundle.js", DATA / "publication.js", ROOT / "assets" / "legacy-routing.js", *sorted((ROOT / "scripts").glob("*.js"))]:
        try:
            subprocess.run(["node", "--check", str(js)], check=True, capture_output=True, text=True)
        except FileNotFoundError:
            break
        except subprocess.CalledProcessError as exc:
            raise SystemExit(exc.stderr or exc.stdout)

    # Data-model invariants introduced in v0.6.8.
    with (DATA / "explorer_catalog.csv").open(encoding="utf-8-sig", newline="") as fh:
        cat = {r["string"]: r for r in csv.DictReader(fh)}
    for s in [".cat", ".post"]:
        if cat[s]["round"] != "2004" or cat[s]["origin_round"] != "2004" or cat[s]["type"] != "sponsored":
            raise SystemExit(f"Explorer origin regression for {s}")
    if "icannRevealRecord" not in cat[".lugano"].get("provenance", ""):
        raise SystemExit(".lugano must be linked to the official ICANN Reveal Day record")
    with (DATA / "explorer_events.csv").open(encoding="utf-8-sig", newline="") as fh:
        events = list(csv.DictReader(fh))
    nyc_periods = {r["period"] for r in events if r["string"] == ".nyc"}
    if not {"2000", "2012", "2014"}.issubset(nyc_periods):
        raise SystemExit(".nyc event history is incomplete")

    # Semantic-drift data should stay grounded in formal ccTLD status plus documented global reinterpretation.
    with (DATA / "semantic_drift.csv").open(encoding="utf-8-sig", newline="") as fh:
        drift_rows = list(csv.DictReader(fh))
    if len(drift_rows) < 6 or {r["string"] for r in drift_rows} != {".io", ".ai", ".tv", ".me", ".co", ".fm"}:
        raise SystemExit("Semantic-drift dataset is incomplete")
    if any(r["formal_type"] != "country-code" for r in drift_rows):
        raise SystemExit("Semantic-drift cases must remain formally identified as ccTLDs")

    expected_v071 = {
        "namespace_dimensions.csv": 8,
        "dns_capabilities.csv": 6,
        "domain_lifecycle.csv": 7,
        "tld_models.csv": 11,
        "success_framework.csv": 7,
        "control_levers.csv": 6,
    }
    for name, minimum in expected_v071.items():
        path = DATA / name
        if not path.exists() or csv_records(path) < minimum:
            raise SystemExit(f"v0.7.1 dataset missing or incomplete: {name}")
    with (DATA / "tld_models.csv").open(encoding="utf-8-sig", newline="") as fh:
        models = list(csv.DictReader(fh))
    app_ids = {r["id"] for r in models if r["axis"] == "application"}
    required_apps = {"general","geographic","reserved","community","brand","idn","variant","government","support"}
    if not required_apps.issubset(app_ids):
        raise SystemExit("2026 application-type model is incomplete")
    forbidden_examples = {".cat", ".中国 / .السعودية", ".berlin / .lugano", ".google"}
    if any(r["example"] in forbidden_examples for r in models if r["axis"] == "application"):
        raise SystemExit("Historical/delegated TLDs must not be presented as 2026 application examples")
    with (DATA / "domain_lifecycle.csv").open(encoding="utf-8-sig", newline="") as fh:
        lifecycle = {r["id"] for r in csv.DictReader(fh)}
    if not {"redemption","pendingDelete","availableAgain"}.issubset(lifecycle):
        raise SystemExit("Lifecycle must distinguish redemptionPeriod, pendingDelete and availability")

    pack = ROOT / "downloads" / "connecting-the-dots-data-pack.zip"
    if not pack.exists():
        raise SystemExit("Data pack is missing")
    with zipfile.ZipFile(pack) as zf:
        if zf.testzip():
            raise SystemExit("Data pack ZIP is corrupt")
        try:
            packed_manifest = json.loads(zf.read("manifest.json"))
        except KeyError:
            raise SystemExit("Data pack is missing manifest.json")
        expected_pack_version = PUBLICATION.get("dataPackageVersion") or VERSION
        if packed_manifest.get("version") != expected_pack_version:
            raise SystemExit(
                f"Frozen data pack version {packed_manifest.get('version')} does not match publication dataPackageVersion {expected_pack_version}"
            )
        if os.environ.get("CTD_REBUILD_DATA_PACK") == "1":
            for path in data_pack_files():
                try:
                    packed = zf.read(str(path.relative_to(DATA)))
                except KeyError:
                    raise SystemExit(f"Data pack is missing {path.name}")
                if packed != path.read_bytes():
                    raise SystemExit(f"Rebuilt data pack is stale: {path.name} differs from data/{path.name}")


def main() -> None:
    subprocess.run(["python3", str(ROOT / "scripts" / "sync_publication.py")], check=True)

    archaeology_source = DATA / "applications_2012_pairs_source.txt"
    archaeology_outputs = [
        DATA / "applications_2000.csv",
        DATA / "applications_2004.csv",
        DATA / "applications_2012.csv",
        DATA / "application_archaeology_local.json",
        DATA / "application_archaeology_manifest.json",
    ]
    if archaeology_source.exists():
        subprocess.run(["python3", str(ROOT / "scripts" / "build_application_archaeology.py")], check=True)
    elif all(path.exists() for path in archaeology_outputs):
        print("2012 ingest source is not in the public repository; using the committed frozen application-archaeology outputs")
    else:
        missing = [str(path.relative_to(ROOT)) for path in archaeology_outputs if not path.exists()]
        raise SystemExit("Application archaeology cannot be rebuilt and required frozen outputs are missing: " + ", ".join(missing))

    bundle_runtime()
    build_manifest()
    build_data_pack()
    build_index()
    build_inside_round_pages(ROOT, PUBLICATION)
    validate_index()
    # Release-level validation is intentionally self-contained so the browser-upload
    # bundle can verify itself even though the larger development QA suite is omitted.
    subprocess.run(["python3", str(ROOT / "scripts" / "release_check.py")], check=True)
    print(f"Built static {INDEX.name} with shared assets and deferred Explorer profiles from {SRC.relative_to(ROOT)}")
    print("Validated runtime, event history, provenance, local assets, Reveal Day state and data-pack sync")
    print(f"Refreshed manifest and data pack for v{VERSION}")


if __name__ == "__main__":
    main()
