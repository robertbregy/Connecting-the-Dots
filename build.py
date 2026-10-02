from __future__ import annotations

from pathlib import Path
import csv
import hashlib
import json
import re
import shutil
import subprocess
import zipfile

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "src" / "index.web.html"
INDEX = ROOT / "index.html"
DATA = ROOT / "data"
VERSION = "0.6.8"


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
    files = []
    for path in sorted(DATA.glob("*.csv")):
        files.append({
            "path": path.name,
            "bytes": path.stat().st_size,
            "records": csv_records(path),
            "sha256": sha256(path),
        })
    manifest = {
        "project": "Connecting the Dots",
        "version": VERSION,
        "publication_state": "pre-reveal",
        "as_of": "2026-10-02",
        "temporal_coverage": "1984/2026",
        "reveal_day": "2026-10-07T18:00:00Z",
        "string_confirmation_day": "2026-11-17",
        "notes": [
            "Record counts exclude CSV headers.",
            "applications_2026.csv is intentionally empty before Reveal Day.",
            "explorer_catalog.csv is the latest indexed record view; explorer_events.csv keeps separate historical events for multi-era strings.",
            ".lugano is marked as an applicant disclosure until ICANN publishes the individual application record at Reveal Day.",
            "Blank 2026 aggregate values are scaffolding, not observations.",
        ],
        "files": files,
    }
    (DATA / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def build_data_pack() -> None:
    pack = ROOT / "downloads" / "connecting-the-dots-data-pack.zip"
    pack.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(pack, "w", zipfile.ZIP_DEFLATED) as zf:
        for path in [*sorted(DATA.glob("*.csv")), DATA / "manifest.json", DATA / "README.md"]:
            zf.write(path, path.name)


def build_index() -> None:
    html = SRC.read_text(encoding="utf-8")
    css = (ROOT / "assets" / "style.css").read_text(encoding="utf-8")
    data_js = (DATA / "data_bundle.js").read_text(encoding="utf-8")
    i18n_js = (DATA / "i18n_bundle.js").read_text(encoding="utf-8")
    world_js = (DATA / "worldmap.js").read_text(encoding="utf-8")
    publication_js = (DATA / "publication.js").read_text(encoding="utf-8")
    app_js = (ROOT / "assets" / "app.js").read_text(encoding="utf-8")

    html = html.replace('<link href="assets/style.css" rel="stylesheet"/>', '<style id="ctd-runtime-style">\n' + css + '\n</style>')
    for ref in ['data/data_bundle.js', 'data/i18n_bundle.js', 'data/worldmap.js']:
        html = html.replace(f'<script src="{ref}"></script>', '')
    html = html.replace('<script src="data/publication.js"></script><script src="assets/app.js"></script>', '')

    head_runtime = '\n'.join([
        '<script id="ctd-data-bundle">\n' + data_js + '\n</script>',
        '<script id="ctd-i18n-bundle">\n' + i18n_js + '\n</script>',
        '<script id="ctd-worldmap">\n' + world_js + '\n</script>',
    ])
    html = html.replace('<script id="articleStructuredData"', head_runtime + '\n<script id="articleStructuredData"', 1)
    footer_runtime = '\n'.join([
        '<script id="ctd-publication">\n' + publication_js + '\n</script>',
        '<script id="ctd-app">\n' + app_js + '\n</script>',
    ])
    html = html.replace('</body></html>', footer_runtime + '\n</body></html>')
    html = html.replace('<title>Connecting the Dots</title>', f'<title>Connecting the Dots</title>\n<meta content="{VERSION}" name="ctd-version"/>', 1)
    html = html.replace('<body>', f'<body data-build="{VERSION}">', 1)
    INDEX.write_text(html, encoding="utf-8")


def validate_index() -> None:
    html = INDEX.read_text(encoding="utf-8")
    required = [
        'id="ctd-runtime-style"', 'id="ctd-data-bundle"', 'id="ctd-i18n-bundle"',
        'id="ctd-worldmap"', 'id="ctd-publication"', 'id="ctd-app"',
    ]
    missing_embeds = [x for x in required if x not in html]
    if missing_embeds:
        raise SystemExit("Missing embedded runtime blocks: " + ", ".join(missing_embeds))
    if any(x in html for x in ['href="assets/style.css"', 'src="data/data_bundle.js"', 'src="data/i18n_bundle.js"', 'src="assets/app.js"']):
        raise SystemExit("index.html still depends on external runtime CSS/JS")
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

    if csv_records(DATA / "applications_2026.csv") != 0:
        raise SystemExit("Pre-Reveal build must not contain synthetic 2026 application records")

    for js in [ROOT / "assets" / "app.js", DATA / "data_bundle.js", DATA / "i18n_bundle.js", DATA / "publication.js", DATA / "v068.js", DATA / "i18n_v068.js"]:
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
        if cat[s]["round"] != "2004" or cat[s]["type"] != "sponsored":
            raise SystemExit(f"Explorer origin regression for {s}")
    if "applicantDisclosure" not in cat[".lugano"].get("provenance", ""):
        raise SystemExit(".lugano must remain marked as applicant disclosure before Reveal Day")
    with (DATA / "explorer_events.csv").open(encoding="utf-8-sig", newline="") as fh:
        events = list(csv.DictReader(fh))
    nyc_periods = {r["period"] for r in events if r["string"] == ".nyc"}
    if not {"2000", "2012", "2014"}.issubset(nyc_periods):
        raise SystemExit(".nyc event history is incomplete")

    pack = ROOT / "downloads" / "connecting-the-dots-data-pack.zip"
    with zipfile.ZipFile(pack) as zf:
        for path in [*sorted(DATA.glob("*.csv")), DATA / "manifest.json", DATA / "README.md"]:
            try:
                packed = zf.read(path.name)
            except KeyError:
                raise SystemExit(f"Data pack is missing {path.name}")
            if packed != path.read_bytes():
                raise SystemExit(f"Data pack is stale: {path.name} differs from data/{path.name}")


def main() -> None:
    bundle_runtime()
    build_manifest()
    build_data_pack()
    build_index()
    validate_index()
    print(f"Built self-contained {INDEX.name} from {SRC.relative_to(ROOT)}")
    print("Validated runtime, event history, provenance, local assets, pre-Reveal state and data-pack sync")
    print(f"Refreshed manifest and data pack for v{VERSION}")


if __name__ == "__main__":
    main()
