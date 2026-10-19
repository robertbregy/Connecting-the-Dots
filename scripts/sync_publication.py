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
    'paperRevisedOn': meta.get('paperRevisedOn'),
    'dataPackageVersion': meta.get('dataPackageVersion'),
    'currentDataPackVersion': meta.get('currentDataPackVersion'),
    'currentDataPackPath': meta.get('currentDataPackPath'),
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

# Citation metadata follows the verified CURRENT scholarly release (RR2), independently of technical website versions; previous RR1 remains immutable in the archival manifest.
research_manifest = json.loads((ROOT / "research" / "research_release_manifest.json").read_text(encoding="utf-8"))
rr = research_manifest["currentResearchRelease"]
if rr["id"] != meta["researchRelease"] or rr["doi"] != meta.get("doi"):
    raise SystemExit("Research release identity/DOI mismatch: refusing to rewrite CITATION.cff")
research_manifest["currentSiteVersion"] = version
working_paper = research_manifest.setdefault("workingPaperRevision", {})
working_paper["version"] = meta["paperVersion"]
working_paper["revisedOn"] = meta["paperRevisedOn"]
working_paper["relationToRR2"] = "RR2 is the immutable archived dataset. This later working-paper revision includes a separately versioned, current APS analytical layer that is not covered by the RR1 or RR2 DOI; the new methods and results require a future archival research release."
(ROOT / "research" / "research_release_manifest.json").write_text(json.dumps(research_manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
research_published_on = json.loads((DATA / "research_bibliographic_corrections.json").read_text())["zenodoDatePublished"]
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

# Synchronize canonical Dataset, never accidentally overwrite archived ZIP version.
src = SRC.read_text(encoding="utf-8")
src = re.sub(r'("dateModified":")([^"]+)(")', rf'\g<1>{released}\g<3>', src)
dataset_pattern = r'(<script id="datasetStructuredData" type="application/ld\+json">)(.*?)(</script>)'
def sync_dataset(match):
    obj = json.loads(match.group(2))
    obj["version"] = version
    obj["dateModified"] = released
    obj["identifier"] = meta["deployment"] + "data/manifest.json#v" + version
    if meta.get("doi"):
        obj["citation"] = "https://doi.org/" + meta["doi"]
    d = obj.get("distribution", [])
    records = d if isinstance(d, list) else [d]
    for entry in records:
        url = str(entry.get("contentUrl") or "")
        if url.endswith("/connecting-the-dots-data-pack.zip"):
            entry["version"] = meta["dataPackageVersion"]
            entry["name"] = "Historical frozen data pack v" + meta["dataPackageVersion"]
        elif entry.get("name", "").startswith("Current comprehensive site data pack"):
            entry["contentUrl"] = meta["deployment"] + meta["currentDataPackPath"]
            entry["version"] = meta["currentDataPackVersion"]
            entry["name"] = "Current comprehensive site data pack v" + version
        elif (url.endswith("/data/tld_universe.csv") or url.endswith("/data/applications_2026_strings_reveal.csv") or url.endswith("/data/applications_2026_aps_official_listing.csv") or url.endswith("/data/aps_2026_application_graph.json") or url.endswith("/data/aps_2026_application_edges.csv")):
            entry["version"] = version
            if url.endswith("/data/tld_universe.csv"):
                entry["name"] = "Current TLD universe (site v" + version + ")"
    obj["distribution"] = records
    return match.group(1) + json.dumps(obj, ensure_ascii=False, separators=(",", ":")) + match.group(3)
src, replacements = re.subn(dataset_pattern, sync_dataset, src, count=1, flags=re.S)
if replacements != 1:
    raise SystemExit("Canonical Dataset JSON-LD missing")
SRC.write_text(src, encoding="utf-8")
