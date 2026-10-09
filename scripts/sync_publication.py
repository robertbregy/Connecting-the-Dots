#!/usr/bin/env python3
from pathlib import Path
import json, os, re

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'data'
SRC = ROOT / 'src' / 'index.web.html'
meta = json.loads((ROOT / 'publication.json').read_text(encoding='utf-8'))
version = meta['version']
released = meta['releasedOn']

# Keep package metadata aligned; publication.json is canonical.
pkg_path = ROOT / 'package.json'
pkg = json.loads(pkg_path.read_text(encoding='utf-8'))
pkg['version'] = version
pkg_path.write_text(json.dumps(pkg, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
lock_path = ROOT / 'package-lock.json'
lock = json.loads(lock_path.read_text(encoding='utf-8'))
lock['version'] = version
lock.setdefault('packages', {}).setdefault('', {})['version'] = version
lock_path.write_text(json.dumps(lock, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

# Runtime publication metadata; GitHub Actions can add the actual commit SHA automatically.
commit = (os.environ.get('GITHUB_SHA') or '').strip() or None
def js_value(value):
    if value is None:
        return 'null'
    if isinstance(value, bool):
        return 'true' if value else 'false'
    if isinstance(value, str):
        return "'" + value.replace('\\', '\\\\').replace("'", "\\'") + "'"
    return str(value)

browser_meta = {
    'version': version,
    'releasedOn': released,
    'state': meta['state'],
    'freeze': bool(meta.get('freeze')),
    'asOf': meta['asOf'],
    'revealAt': meta['revealAt'],
    'stringConfirmation': meta['stringConfirmation'],
    'researchRelease': meta['researchRelease'],
    'researchSnapshot': meta.get('researchSnapshot'),
    'paperVersion': meta.get('paperVersion'),
    'paperPath': meta.get('paperPath'),
    'doi': meta.get('doi'),
    'doiUrl': meta.get('doiUrl'),
    'conceptDoi': meta.get('conceptDoi'),
    'archive': meta.get('archive'),
    'commit': commit,
}
lines = ['/* generated from publication.json; do not edit by hand */', 'window.DOT_PUBLICATION={']
for key, value in browser_meta.items():
    lines.append(f"  {key}:{js_value(value)},")
lines[-1] = lines[-1].rstrip(',')
lines.append('};')
(DATA / 'publication.js').write_text('\n'.join(lines) + '\n', encoding='utf-8')

# Citation metadata is tied to the archived RR1 research release, not website updates.
research_manifest = json.loads((ROOT / "research" / "research_release_manifest.json").read_text(encoding="utf-8"))
rr = research_manifest["currentResearchRelease"]
if rr["id"] != meta["researchRelease"] or rr["doi"] != meta.get("doi"):
    raise SystemExit("Research release identity/DOI mismatch: refusing to rewrite CITATION.cff")
research_published_on = rr["publishedOn"]
cff = f'''cff-version: 1.2.0
message: "If you use Connecting the Dots in research, please cite the living research publication and the specific research release used."
title: "Connecting the Dots: A Living Research Atlas of Top-Level Domain Expansion"
type: dataset
authors:
  - family-names: "Bregy"
    given-names: "Robert"
version: "{meta['researchRelease']}"
date-released: "{research_published_on}"
url: "{meta['deployment']}"
repository-code: "{meta['repository']}"
license: "CC-BY-4.0"
identifiers:
  - type: doi
    value: "{meta.get('doi') or ''}"
keywords:
  - DNS
  - ICANN
  - top-level domains
  - gTLD
  - Internet governance
  - domain names
  - digital infrastructure
'''
(ROOT / 'CITATION.cff').write_text(cff, encoding='utf-8')

# Source template structured metadata stays aligned too.
src = SRC.read_text(encoding='utf-8')
src = re.sub(r'("version":")([^"]+)(")', rf'\g<1>{version}\g<3>', src, count=1)
src = re.sub(r'("dateModified":")([^"]+)(")', rf'\g<1>{released}\g<3>', src, count=1)
# Keep DOI in structured Dataset metadata in sync once an archival deposit exists.
doi = meta.get('doi')
if doi:
    if '"identifier":"https://doi.org/' in src:
        src = re.sub(r'"identifier":"https://doi.org/[^"]+"', f'"identifier":"https://doi.org/{doi}"', src, count=1)
    else:
        src = src.replace('"dateModified":"'+released+'"', '"dateModified":"'+released+'","identifier":"https://doi.org/'+doi+'"', 1)
SRC.write_text(src, encoding='utf-8')
