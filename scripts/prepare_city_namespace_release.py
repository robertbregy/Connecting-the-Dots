#!/usr/bin/env python3
"""One-time, fail-closed source migration for the reviewed city-domain analysis.

Run on editorial/city-models-20261017 only. Build and browser tests must succeed
before committing outputs. This script never changes a Git ref or publishes.
"""
from __future__ import annotations

import hashlib
import json
import subprocess
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
OLD='0.7.82'
NEW='0.7.83'
DATE='2026-10-17'
BASE='b7d3b0f39e4addfdaba8c66431ba6529ec67a73b'


def read(path):
    return (ROOT/path).read_text(encoding='utf-8')


def write(path,text):
    (ROOT/path).write_text(text,encoding='utf-8')


def patch(path,before,after):
    text=read(path)
    if text.count(before)!=1:
        raise ValueError('Expected one source marker in '+path+': '+before[:100])
    write(path,text.replace(before,after,1))


def save_json(path,value):
    write(path,json.dumps(value,ensure_ascii=False,indent=2)+'\n')


def main():
    pub=json.loads(read('publication.json'))
    if pub['version']==NEW:
        print('CITY_NAMESPACE_MIGRATION_ALREADY_APPLIED')
        return
    if pub['version']!=OLD or pub['asOf']!='2026-10-10' or pub['researchRelease']!='RR2':
        raise ValueError('Unexpected publication baseline')
    archive='downloads/connecting-the-dots-data-pack-v'+OLD+'.zip'
    old_bytes=(ROOT/archive).read_bytes()
    old_hash=hashlib.sha256(old_bytes).hexdigest()
    if read(archive.replace('.zip','.sha256')).split()[0]!=old_hash:
        raise ValueError('Previous technical archive failed SHA-256 validation')
    if subprocess.check_output(['git','show',BASE+':'+archive],cwd=ROOT)!=old_bytes:
        raise ValueError('Previous technical ZIP differs from published safety baseline')
    for path in ('package.json','package-lock.json'):
        value=json.loads(read(path))
        value['version']=NEW
        if path=='package-lock.json':
            value['packages']['']['version']=NEW
        save_json(path,value)
    pub['version']=NEW
    pub['releasedOn']=DATE
    pub['currentDataPackVersion']=NEW
    pub['currentDataPackPath']='downloads/connecting-the-dots-data-pack-v'+NEW+'.zip'
    save_json('publication.json',pub)
    for path in ('src/index.web.html','research/index.html','research/README.md','research/connecting-the-dots-working-paper-v1.md','research/connecting-the-dots-working-paper-v1.html'):
        text=read(path)
        if OLD not in text:
            raise ValueError('Current technical version not found in '+path)
        write(path,text.replace(OLD,NEW))
    history=json.loads(read('data/release_history.json'))
    if history['releases'][0]['version']!=OLD:
        raise ValueError('Unexpected release history')
    entry=dict(history['releases'][0])
    entry.update(version=NEW,date=DATE,summaryKey='release0783')
    history['releases'].insert(0,entry)
    save_json('data/release_history.json',history)
    translations=json.loads(read('data/translations.json'))
    summaries={
      'it':'v0.7.83: confronto dei modelli di governo dei domini cittadini, indicatori di uso e sostenibilità e caso .lugano approfondito. Fonti, proposte e ricezione esterna distinti; RR1/RR2 invariati.',
      'en':'v0.7.83: city-domain governance comparisons, use and sustainability indicators, and a stronger .lugano case. Sources, design proposals and external reception are distinguished; RR1/RR2 unchanged.',
      'de':'v0.7.83: Governance-Modelle, Nutzung und Tragfähigkeit von Stadtdomains sowie Vertiefung von .lugano. Quellen, Vorschläge und externe Wahrnehmung getrennt; RR1/RR2 unverändert.',
      'fr':'v0.7.83 : modèles de gouvernance, usage et viabilité des domaines urbains et cas .lugano approfondi. Sources, propositions et réception externe distinguées ; RR1/RR2 inchangées.'}
    for lang,text in summaries.items():
        if 'release0783' in translations[lang]:
            raise ValueError('Release summary already exists')
        translations[lang]['release0783']=text
    save_json('data/translations.json',translations)
    patch('build.py','from scripts.render_field_investigations import build_investigations',
          'from scripts.render_field_investigations import build_investigations\nfrom scripts.city_namespace_editorial import render as render_city_namespace')
    patch('build.py','    build_investigations(ROOT)\n    render_aps_application_atlas(ROOT)',
          '    build_investigations(ROOT)\n    render_city_namespace(ROOT)\n    render_aps_application_atlas(ROOT)')
    patch('build.py','DATA / "social_cases.json", ROOT / snapshot["archive_path"]]',
          'DATA / "social_cases.json", DATA / "city_namespace_editorial.json", ROOT / snapshot["archive_path"]]')
    patch('build.py','    (DATA / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\\n", encoding="utf-8")',
          '    manifest["city_namespace_editorial"] = {"path":"city_namespace_editorial.json", "sha256":sha256(DATA / "city_namespace_editorial.json"), "reviewedOn":"2026-10-17", "classification":"source-backed-analysis-and-proposals"}\n    (DATA / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\\n", encoding="utf-8")')
    patch('scripts/release_check.py','    for archive,expected in FROZEN_TECHNICAL_ARCHIVES.items():',
          '    FROZEN_TECHNICAL_ARCHIVES["connecting-the-dots-data-pack-v'+OLD+'.zip"]="'+old_hash+'"\n    for archive,expected in FROZEN_TECHNICAL_ARCHIVES.items():')
    # Keep the previous source-reviewed October 17 additions valid for this
    # technical release. Original stories/metrics, routes and old ZIPs remain
    # independently subject to their existing detailed checks.
    patch('scripts/audit_content_continuity.py',"pub.get('version')!='0.7.82'", "pub.get('version') not in ('0.7.82','0.7.83')")
    patch('.github/workflows/pages-live-smoke.yml','downloads/connecting-the-dots-data-pack-v'+OLD+'.zip',
          'downloads/connecting-the-dots-data-pack-v'+NEW+'.zip')
    patch('.github/workflows/pages-live-smoke.yml','              "research/index.html",',
          '              "research/index.html",\n              "data/city_namespace_editorial.json",')
    patch('.github/workflows/rebuild.yml',"      - 'data/field_investigations.json'",
          "      - 'data/field_investigations.json'\n      - 'data/city_namespace_editorial.json'")
    # Avoid repeating a governance question in the evaluation panel.
    patch('scripts/city_namespace_editorial.py',"body += paragraph(t['governanceQuestion'])+jump(lang,'cemetery'", "body += jump(lang,'cemetery'")
    patch('README.md','# Connecting the Dots — v'+OLD,'# Connecting the Dots — v'+NEW)
    heading='**v'+OLD+' · 17 October 2026 (UTC)**'
    replacement=('**v'+NEW+' · 17 October 2026 (UTC)**\n\n'
       '**City domains: governance, use and public value.** Adds a source-backed comparison of Lugano, Bremen, Paris and New York, four evaluation dimensions and an explicitly qualified industry renewal sample. The Lugano chapter distinguishes documented intentions, proposed commons/identity safeguards and decisions still open. External commercial coverage is assessed against primary sources, including private sponsorship of the application fee. Four languages, native chapters, no additional menu or canonical route; previous technical archives and RR1/RR2 remain unchanged.\n\n'
       '**Previous v'+OLD+' · 17 October 2026 (UTC)**')
    patch('README.md',heading,replacement)
    write('CHANGELOG.md','# v'+NEW+' - 17 October 2026 (UTC)\n\n'
      '- Added city-domain governance models and a four-case comparison; applicant, adopted policy and delegated TLD are explicitly different states.\n'
      '- Added use, persistence, public value and sustainability indicators; renewal sample carries date, source, sector-interest and estimation caveats, including .tokyo.\n'
      '- Expanded .lugano with documented facts, proposed collective-name and machine-verifiability safeguards, phased adoption and outstanding decisions.\n'
      '- Added a dated, critical external-reception observation without claiming another official event or creating a new menu entry.\n'
      '- Preserved historical files, canonical routes, original field-note evidence and RR1/RR2; v0.7.83 has a distinct technical ZIP.\n\n'+read('CHANGELOG.md'))
    write('docs/CITY_NAMESPACE_REVIEW_2026-10-17.md',
      '# City domains: reviewed editorial addition\n\n'
      'Technical release v0.7.83, reviewed 17 October 2026. Sources and all four language versions are in `data/city_namespace_editorial.json`; the original evidence snapshots and research releases are unchanged.\n\n'
      'Native additions: `cities#city-namespace-governance`, `cities#city-namespace-measures`, `lugano#lugano-public-commons`, `lugano#lugano-verifiable-services`, `lugano#lugano-use-before-scale`, `lugano#lugano-external-reading`. Field Notes contains only a dated cross-reference, not a fabricated new event.\n\n'
      'Primary evidence: City of Lugano project FAQ; ICANN APS CDL2651T-T31516; Bremen Senate decision of 14 July 2026, pages 2-4; IANA delegation records for Paris and New York; IETF RFC4033; ICANN Applicant Guidebook sections 2.3 and 2.10 and its preregistration explanation. Sector evidence: geoTLD.group renewal table of 10 September 2026 and Local by Design, with DNIB methodology separately cited. Commercial coverage: Domaintechnik, treated as reception, never independent effectiveness evidence.\n\n'
      'Constraints: no claim of unique municipal status without a separate census; no invented launch date, rules, allocations or operating results; application fee sponsorship is not zero lifetime cost; membership is not official representation; DNSSEC is not identity or business-quality certification. The eight renewal observations remain a mixed geographic/cultural sample with unreconstructed underlying measurement period, not first-year cohort rates.\n\n'
      'The existing A/B source-body guard remains unchanged. The October 17 field-note exception remains narrowly validated; no removal of old content, source keys or routes is accepted. The .82 archive checksum is pinned before any rebuild.\n')
    if hashlib.sha256((ROOT/archive).read_bytes()).hexdigest()!=old_hash:
        raise ValueError('Preparation modified previous archive')
    print('CITY_NAMESPACE_MIGRATION_READY',NEW,old_hash)


if __name__=='__main__':
    main()
