"""Package the complete built project for a single GitHub browser upload."""
from pathlib import Path
import argparse
import hashlib
import json
import zipfile

ROOT = Path(__file__).resolve().parents[1]
EXCLUDED = {".git", "node_modules", "__pycache__", ".venv", ".DS_Store"}


def main() -> None:
    version = json.loads((ROOT / "package.json").read_text())["version"]
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=ROOT.parent / f"Connecting-the-Dots-v{version}-COMPLETO.zip")
    output = parser.parse_args().output.resolve()
    files = []
    for path in sorted(ROOT.rglob("*")):
        rel = path.relative_to(ROOT)
        if not path.is_file() or path.resolve() == output or any(part in EXCLUDED for part in rel.parts):
            continue
        if rel.parts[:3] == ("data", "evidence", "iana") or path.suffix == ".pyc":
            continue
        # Validation scripts are build-time QA and are intentionally omitted from the browser-upload release bundle.
        if len(rel.parts) == 2 and rel.parts[0] == "scripts" and rel.name.startswith("validate_"):
            continue
        # Historical release notes from v0.7.4 are not part of the current browser-upload release.
        if rel.as_posix() == "RELEASE_NOTES_0.7.4.md":
            continue
        files.append(path)
    if len(files) > 100:
        raise SystemExit(f"Release has {len(files)} files; GitHub browser upload allows at most 100")
    manifest = json.loads((ROOT / "data/manifest.json").read_text())
    if manifest["version"] != version:
        raise SystemExit("Run python3 build.py before packaging: manifest version is stale")
    for lang in ["en", "it", "de", "fr"]:
        if f'data-build="{version}"' not in (ROOT / lang / "index.html").read_text():
            raise SystemExit(f"Run python3 build.py before packaging: {lang} page is stale")
    snapshot = json.loads((ROOT / "data/iana_snapshot.json").read_text())
    archive = ROOT / snapshot["archive_path"]
    if archive not in files or hashlib.sha256(archive.read_bytes()).hexdigest() != snapshot["archive_sha256"]:
        raise SystemExit("Missing or altered compressed IANA evidence")
    output.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(output, "w", zipfile.ZIP_DEFLATED) as zf:
        for path in files:
            zf.write(path, path.relative_to(ROOT).as_posix())
    print(f"{output}\n{len(files)} files · {output.stat().st_size:,} bytes")
    print("SHA-256: " + hashlib.sha256(output.read_bytes()).hexdigest())


if __name__ == "__main__":
    main()
