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
VERSION = "0.6.5"


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
        # The generated bundles are committed so the static site remains usable without Node.
        for bundle in [DATA / "data_bundle.js", DATA / "i18n_bundle.js"]:
            if not bundle.exists():
                raise SystemExit("Node.js is unavailable and a required runtime bundle is missing")
        print("Node.js unavailable: using committed runtime bundles")
    except subprocess.CalledProcessError as exc:
        raise SystemExit(exc.stderr or exc.stdout)


def build_manifest() -> None:
    files = []
    for path in sorted(DATA.glob("*.csv")):
        files.append(
            {
                "path": path.name,
                "bytes": path.stat().st_size,
                "records": csv_records(path),
                "sha256": sha256(path),
            }
        )
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
            "Blank 2026 aggregate values are scaffolding, not observations.",
        ],
        "files": files,
    }
    (DATA / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )


def validate_index() -> None:
    html = INDEX.read_text(encoding="utf-8")
    if "data:" in html:
        raise SystemExit("index.html contains an embedded data: URI; web assets must stay external")

    refs = set(re.findall(r'(?:src|href)="([^"]+)"', html))
    missing = []
    for ref in refs:
        if ref.startswith(("http://", "https://", "#", "mailto:", "tel:")):
            continue
        ref = ref.split("?", 1)[0].split("#", 1)[0]
        if ref and not (ROOT / ref).exists():
            missing.append(ref)
    if missing:
        raise SystemExit("Missing local assets: " + ", ".join(sorted(missing)))

    if csv_records(DATA / "applications_2026.csv") != 0:
        raise SystemExit("Pre-Reveal build must not contain synthetic 2026 application records")

    for js in [ROOT / "assets" / "app.js", DATA / "data_bundle.js", DATA / "i18n_bundle.js", DATA / "publication.js"]:
        try:
            subprocess.run(["node", "--check", str(js)], check=True, capture_output=True, text=True)
        except FileNotFoundError:
            break
        except subprocess.CalledProcessError as exc:
            raise SystemExit(exc.stderr or exc.stdout)

    pack = ROOT / "downloads" / "connecting-the-dots-data-pack.zip"
    with zipfile.ZipFile(pack) as zf:
        for path in [*sorted(DATA.glob("*.csv")), DATA / "manifest.json"]:
            try:
                packed = zf.read(path.name)
            except KeyError:
                raise SystemExit(f"Data pack is missing {path.name}")
            if packed != path.read_bytes():
                raise SystemExit(f"Data pack is stale: {path.name} differs from data/{path.name}")


def main() -> None:
    bundle_runtime()
    shutil.copy2(SRC, INDEX)
    build_manifest()
    validate_index()
    print(f"Built {INDEX.name} from {SRC.relative_to(ROOT)}")
    print("Validated local assets, runtime bundles, JavaScript syntax, pre-Reveal dataset state and data-pack sync")
    print(f"Refreshed data/manifest.json for v{VERSION}")


if __name__ == "__main__":
    main()
