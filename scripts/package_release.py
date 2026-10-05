"""Package either the browser-upload publication payload or the complete source release."""
from pathlib import Path
import argparse
import hashlib
import json
import zipfile

ROOT = Path(__file__).resolve().parents[1]
EXCLUDED_DIRS = {'.git', 'node_modules', '__pycache__', '.venv'}
EXCLUDED_NAMES = {'.DS_Store'}
DEPLOY_OMIT = {'DEPLOY.md', 'package-lock.json', 'requirements-fallback.txt'}

ZIP_TIMESTAMP = (2026, 10, 5, 0, 0, 0)
ZIP_FILE_MODE = 0o100644 << 16

def write_deterministic_zip(output: Path, entries):
    """Write a byte-reproducible ZIP from (path, archive-name) entries."""
    output.parent.mkdir(parents=True,exist_ok=True)
    with zipfile.ZipFile(output,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as zf:
        for path, arcname in sorted(entries,key=lambda item:item[1]):
            info=zipfile.ZipInfo(arcname,ZIP_TIMESTAMP)
            info.create_system=3
            info.external_attr=ZIP_FILE_MODE
            info.compress_type=zipfile.ZIP_DEFLATED
            zf.writestr(info,path.read_bytes(),compress_type=zipfile.ZIP_DEFLATED,compresslevel=9)


def files_for(kind: str, output: Path):
    files=[]
    for path in sorted(ROOT.rglob('*')):
        rel=path.relative_to(ROOT)
        if not path.is_file() or path.resolve()==output or any(part in EXCLUDED_DIRS for part in rel.parts) or path.name in EXCLUDED_NAMES or path.suffix=='.pyc':
            continue
        if kind=='deploy' and rel.as_posix() in DEPLOY_OMIT:
            continue
        files.append(path)
    return files


def validate_built(version: str):
    manifest=json.loads((ROOT/'data/manifest.json').read_text())
    if manifest.get('version')!=version:
        raise SystemExit('Run python3 build.py before packaging: manifest version is stale')
    for lang in ['en','it','de','fr']:
        text=(ROOT/lang/'index.html').read_text()
        if f'data-build="{version}"' not in text:
            raise SystemExit(f'Run python3 build.py before packaging: {lang} page is stale')
    snapshot=json.loads((ROOT/'data/iana_snapshot.json').read_text())
    archive=ROOT/snapshot['archive_path']
    if not archive.exists() or hashlib.sha256(archive.read_bytes()).hexdigest()!=snapshot['archive_sha256']:
        raise SystemExit('Missing or altered compressed IANA evidence')
    return archive


def main():
    version=json.loads((ROOT/'package.json').read_text())['version']
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--kind', choices=['deploy','source'], default='deploy')
    parser.add_argument('--output', type=Path)
    args=parser.parse_args()
    suffix='PUBBLICAZIONE' if args.kind=='deploy' else 'SOURCE'
    output=(args.output or (ROOT.parent/f'Connecting-the-Dots-v{version}-{suffix}.zip')).resolve()
    archive=validate_built(version)
    files=files_for(args.kind,output)
    if archive not in files:
        raise SystemExit('IANA evidence archive is missing from package')
    if args.kind=='deploy' and len(files)>100:
        raise SystemExit(f'Deploy release has {len(files)} files; GitHub browser upload allows at most 100')
    if args.kind=='source':
        required={'package-lock.json','DEPLOY.md','requirements-fallback.txt'}
        missing=required-{p.relative_to(ROOT).as_posix() for p in files}
        if missing: raise SystemExit('Source release missing: '+', '.join(sorted(missing)))
    write_deterministic_zip(output,[(path,path.relative_to(ROOT).as_posix()) for path in files])
    digest=hashlib.sha256(output.read_bytes()).hexdigest()
    print(f'{output}\n{len(files)} files · {output.stat().st_size:,} bytes\nSHA-256: {digest}')

if __name__=='__main__': main()
