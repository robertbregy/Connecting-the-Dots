#!/usr/bin/env python3
"""Self-contained release integrity check for the browser-upload bundle."""
from pathlib import Path
import csv, hashlib, json, re, subprocess, sys, zipfile

ROOT=Path(__file__).resolve().parents[1]
DATA=ROOT/'data'
LANGS=('en','it','de','fr')

def fail(msg):
    raise SystemExit('RELEASE CHECK FAILED: '+msg)

def rows(name):
    with (DATA/name).open(encoding='utf-8-sig',newline='') as fh:
        return list(csv.DictReader(fh))

def json_file(name):
    return json.loads((DATA/name).read_text(encoding='utf-8'))

def count(name): return len(rows(name))

def check_internal_refs(html_path):
    text=html_path.read_text(encoding='utf-8')
    # Only local static refs; query/hash stripped. Dynamic ?tab links are page-local.
    refs=[]
    for attr,val in re.findall(r'\b(href|src)=["\']([^"\']+)["\']',text):
        if val.startswith(('http:','https:','mailto:','data:','#','?','javascript:')): continue
        clean=val.split('#',1)[0].split('?',1)[0]
        if not clean: continue
        refs.append(clean)
    for ref in refs:
        target=(html_path.parent/ref).resolve()
        if ref.endswith('/'):
            target=target/'index.html'
        if not target.exists(): fail(f'missing local reference from {html_path.relative_to(ROOT)}: {ref}')

pkg=json.loads((ROOT/'package.json').read_text())
version=pkg['version']
lock=json.loads((ROOT/'package-lock.json').read_text()) if (ROOT/'package-lock.json').exists() else fail('package-lock.json missing')
if lock.get('version')!=version or lock.get('packages',{}).get('',{}).get('version')!=version: fail('package-lock/package version mismatch')
if lock.get('packages',{}).get('',{}).get('devDependencies')!=pkg.get('devDependencies'): fail('package-lock dependency root mismatch')
manifest=json_file('manifest.json')
if manifest.get('version')!=version: fail('manifest/package version mismatch')
if manifest.get('as_of')!='2026-10-04': fail('publication snapshot is not 2026-10-04')
pub=(DATA/'publication.js').read_text()
if f"version:'{version}'" not in pub or "asOf:'2026-10-04'" not in pub: fail('publication.js version/asOf mismatch')

# Release-integrity invariants added in v0.7.18.
appjs=(ROOT/'assets/app.js').read_text(encoding='utf-8')
if 'fmtNum(1987)' in appjs or 'fmtNum(57)' in appjs: fail('application archaeology count is hard-coded')
if 'applicationCorpusComplete=true' in appjs: fail('runtime merge may not mark the full application corpus complete directly')
if 'syncApplicationCorpusComplete()' not in appjs: fail('application corpus completeness is not derived')
if "required=['2000','2004','2012','2026']" not in appjs: fail('application corpus completeness does not require all declared historical/current rounds')
if 'GTLD_LIFECYCLE_CACHE_TTL=24*60*60*1000' not in appjs or "cache:'no-cache'" not in appjs: fail('gTLD runtime lifecycle cache is not freshness-bounded')
arch_manifest=json_file('application_archaeology_manifest.json')
if arch_manifest.get('runtimeTransport2012',{}).get('status')!='external-mirror-not-cryptographically-pinned': fail('2012 runtime transport integrity limitation is not declared')
changelog=(ROOT/'CHANGELOG.md').read_text(encoding='utf-8')
for marker in ['v0.7.19','v0.7.18','v0.7.14','v0.7.13']:
    if marker not in changelog: fail('changelog missing '+marker)
readme=(ROOT/'README.md').read_text(encoding='utf-8')
if "No live refresh occurs in a visitor's browser." in readme: fail('README contains obsolete no-live-refresh claim')

# Reader-experience and accessibility invariants. These are intentionally
# structural rather than pixel-perfect so the project can evolve without
# silently losing the novice path, keyboard entry point or search-first UX.
template=(ROOT/'src/index.web.html').read_text(encoding='utf-8')
style=(ROOT/'assets/style.css').read_text(encoding='utf-8')
ux_markers=[
    'class="skipLink" href="#main-content"',
    'id="main-content" tabindex="-1"',
    'class="heroPlain" data-i18n="heroPlain"',
    'data-i18n="heroLearnCta"',
    'data-i18n="heroExploreCta"',
    'class="explorerSearch explorerSearchPrimary"',
    'class="explorerAdvanced explorerFilters"',
    'class="coverageNotes explorerAbout"',
]
for marker in ux_markers:
    if marker not in template: fail('reader-experience marker missing: '+marker)
if template.index('explorerSearchPrimary')>template.index('explorerFilters'):
    fail('Explorer is no longer search-first')
if '>ENG<' in template or '>GER<' in template or '>FRA<' in template or '>ITA<' in template:
    fail('non-standard long language codes returned to the compact selector')
share_match=re.search(r'<button[^>]*id="shareBtn"[^>]*>(.*?)</button>',template,re.S)
if not share_match or 'copyIcon' not in share_match.group(1) or '↗' in share_match.group(1):
    fail('copy-link control has ambiguous external-link iconography')
for css_marker in ['.skipLink{','--vision-text:','#main-content:focus{outline:none}',
                   '.drawerClose{width:44px;height:44px}',
                   '.mobileNav{min-height:44px}',
                   'color:var(--accent-text)']:
    if css_marker not in style: fail('accessibility CSS invariant missing: '+css_marker)
if '.heroActions' not in style or '.explorerSearchPrimary' not in style:
    fail('progressive-disclosure UX styling missing')

# v0.7.19 mobile journey contract: no fixed-width escape hatch, lesson first,
# narrow diagrams reflow and step changes can recover the current reading position.
for css_marker in [
    '.internetGuide{padding:20px 16px;overflow-x:clip}',
    '.journeyWorkarea{display:flex;flex-direction:column;width:100%;gap:14px}',
    '.journeyLesson{order:1;width:100%;padding:0}',
    '.journeyDiagram{order:2;width:100%;grid-template-columns:1fr;gap:10px}',
    '.journeyDnsBranches{grid-template-columns:repeat(3,minmax(0,1fr));gap:5px;padding-top:18px}',
    '.journeyWebPath{grid-template-columns:minmax(0,.8fr) minmax(0,1.3fr) minmax(0,.8fr);gap:4px}',
]:
    if css_marker not in style: fail('mobile journey CSS invariant missing: '+css_marker)
if '.journeyDiagram{grid-template-columns:1fr;order:-1}' in style:
    fail('mobile journey regressed to diagram-first ordering')
if 'function keepJourneyStepInView()' not in appjs or 'keepJourneyStepInView();' not in appjs:
    fail('mobile journey step visibility recovery is missing')

expected_counts={
 'explorer_catalog.csv':1688,'tld_universe.csv':1599,'application_only_strings.csv':89,
 'explorer_events.csv':5583,'tld_life_histories.csv':5583,'applications_2000.csv':47,
 'application_strings_2000.csv':225,'applications_2004.csv':10,'governance_cases.csv':9,
 'governance_case_events.csv':39,'economic_cases.csv':8,'economic_metrics.csv':22,'social_cases.csv':9,
 'explorer_iana_reports.csv':2008,'explorer_nameservers.csv':7563,
}
for name,n in expected_counts.items():
    got=count(name)
    if got!=n: fail(f'{name}: {got} != {n}')

catalog=rows('explorer_catalog.csv')
keys=[r['ascii_string'] for r in catalog]
if len(keys)!=len(set(keys)): fail('duplicate Explorer ASCII string')
tlds={r['ascii_string'] for r in rows('tld_universe.csv')}
apps={r['ascii_string'] for r in rows('application_only_strings.csv')}
if tlds & apps: fail('TLD/application-only overlap')
if len(tlds|apps)!=1688: fail('TLD + application-only universe does not equal Explorer')

# The final audit caught deprecated ISO aliases emitted by Intl.DisplayNames.
current={'France':'FR','Burkina Faso':'BF','Benin':'BJ','Serbia':'RS','Timor-Leste':'TL'}
for r in catalog:
    for cfield,codefield in [('registry_country','registry_country_code'),('administrative_contact_country','administrative_contact_country_code'),('technical_contact_country','technical_contact_country_code')]:
        if r.get(cfield) in current and r.get(codefield)!=current[r[cfield]]:
            fail(f"obsolete country code on {r['string']}: {cfield}={r[cfield]} {r.get(codefield)}")

arch=json_file('application_archaeology_manifest.json')
if arch['rounds']['2000']['applications']!=47 or arch['rounds']['2000']['itemE2Links']!=223 or arch['rounds']['2000']['itemE2UniqueStrings']!=188: fail('2000 archaeology totals')
if arch['rounds']['2004']['applications']!=10 or arch['rounds']['2004']['uniqueStrings']!=9: fail('2004 archaeology totals')
r=arch['rounds']['2012']
if (r['applications'],r['uniqueStrings'],r['idn'],r['geographic'],r['community'])!=(1930,1409,116,66,84): fail('2012 locked totals')
if r['regions']!={'NA':911,'EUR':675,'AP':303,'LAC':24,'AF':17}: fail('2012 regional totals')
privacy=arch.get('privacy',{})
if privacy.get('excluded2012Fields')!=['Primary Contact','Email'] or not privacy.get('sourceTransportContainsExcludedFields'): fail('2012 privacy handling metadata')

# No contact/email column is ever part of the public research exports.
for p in DATA.glob('*.csv'):
    with p.open(encoding='utf-8-sig',newline='') as fh:
        header=next(csv.reader(fh),[])
    low={h.strip().lower() for h in header}
    if 'primary contact' in low or 'email' in low: fail(f'contact field leaked into {p.name}')

for name,n,events in [('governance_cases.json',9,39),('economic_cases.json',8,None),('social_cases.json',9,None)]:
    obj=json_file(name)
    if len(obj.get('cases',[]))!=n: fail(f'{name} case count')
    if events is not None and sum(len(c.get('events',[])) for c in obj['cases'])!=events: fail(f'{name} event count')
if sum(len(c.get('metrics',[])) for c in json_file('economic_cases.json')['cases'])!=22: fail('economic metric count')
econ=json_file('economic_cases.json')
private=next((m for m in econ.get('models',[]) if m.get('id')=='private-settlement'),None)
if not private or private.get('contextKey')!='econHistorical2012Prohibited2026': fail('private-settlement 2026 prohibition context missing')
research=json_file('research.json')
r2026=next((r for r in research.get('rounds',[]) if r.get('round')==2026),{})
if r2026.get('applications')!=1663: fail('round comparison must use 1,663 submitted applications for 2026')
proceeding=next((r for r in rows('round_2026.csv') if r.get('metric')=='Applications proceeding'),{})
if proceeding.get('value')!='1616': fail('2026 proceeding applications must remain 1,616')
summary={r['Round']:r for r in rows('rounds_summary.csv')}
if summary.get('2026',{}).get('Applications')!='1663': fail('rounds_summary 2026 submitted applications mismatch')
if not summary.get('2012',{}).get('Delegations source'): fail('2012 delegation metric lacks dedicated provenance')

# Translation parity.
tr=json_file('translations.json')
base=set(tr['en'])
required_ux_keys={'skipToContent','heroPlain','heroLearnCta','heroExploreCta','exploreAboutTitle','exploreFiltersTitle'}
for lang in LANGS:
    if set(tr[lang])!=base: fail(f'translation key mismatch: {lang}')
    missing_ux=required_ux_keys-set(tr[lang])
    if missing_ux: fail(f'missing reader-experience translations {lang}: {sorted(missing_ux)}')
    blank=[k for k,v in tr[lang].items() if v is None or (isinstance(v,str) and not v.strip())]
    if blank: fail(f'blank translations {lang}: {blank[:5]}')
    for dead in ['disclosed','footerLeft','downloadExcel']:
        if dead in tr[lang]: fail(f'dead translation key survived: {lang}/{dead}')
    if '30 Sep 2026' in tr[lang].get('rootStat3','') or '30 settembre 2026' in tr[lang].get('rootStat3','') or '30. September 2026' in tr[lang].get('rootStat3','') or '30 septembre 2026' in tr[lang].get('rootStat3',''): fail(f'stale root-server observation date: {lang}')
    if any(x in tr[lang].get('publicationState','') for x in ['2026','OCT','OTT','OKT']): fail(f'publicationState duplicates snapshot date instead of deriving it: {lang}')

# Static pages and local references.
for rel in ['index.html',*[f'{x}/index.html' for x in LANGS]]:
    p=ROOT/rel; text=p.read_text(encoding='utf-8')
    if f'data-build="{version}"' not in text or f'<meta content="{version}" name="ctd-version"' not in text: fail(f'stale static page {rel}')
    if text.lower().count('<!doctype html')!=1: fail(f'expected exactly one doctype in {rel}')
    if 'Robert Bregy.This project' in text: fail(f'missing byline spacing in {rel}')
    if '→ ↗' in text: fail(f'duplicate internal/external arrow semantics in {rel}')
    m=re.search(r'<span[^>]*data-i18n="publicationState"[^>]*>(.*?)</span>',text,re.S)
    if not m or '2026' not in re.sub('<[^>]+>','',m.group(1)): fail(f'visible publication snapshot is not derived/rendered in {rel}')
    if any(stale in text for stale in ['SNAPSHOT · 2 OCT 2026','SNAPSHOT PRE-REVEAL · 2 OTT 2026','PRE-REVEAL-SNAPSHOT · 2. OKT 2026','SNAPSHOT PRÉ-REVEAL · 2 OCT 2026']): fail(f'stale 2 October publication state in {rel}')
    if '"dateModified":"2026-10-05"' not in text: fail(f'structured-data dateModified mismatch in {rel}')
    if text.count('<h1')!=1: fail(f'expected exactly one h1 in {rel}')
    skip=re.search(r'<a\b(?=[^>]*\bclass=["\'][^"\']*\bskipLink\b[^"\']*["\'])(?=[^>]*\bhref=["\']#main-content["\'])[^>]*>',text,re.I)
    main=re.search(r'<main\b(?=[^>]*\bid=["\']main-content["\'])[^>]*>',text,re.I)
    if not skip or not main: fail(f'skip-to-content path missing in {rel}')
    if 'class="heroPlain"' not in text or 'class="heroActions"' not in text: fail(f'novice entry path missing in {rel}')
    if text.index('explorerSearchPrimary')>text.index('explorerFilters'): fail(f'Explorer not search-first in {rel}')
    for img_tag in re.findall(r'<img\b[^>]*>',text,re.I):
        if not re.search(r'\balt=["\'][^"\']*["\']',img_tag,re.I): fail(f'image without alt attribute in {rel}')
    check_internal_refs(p)

# Shard parity and version.
shard_total=0; shard_keys=[]
for i in range(8):
    text=(DATA/f'explorer_profiles_{i}.js').read_text(encoding='utf-8')
    m=re.search(r'=({.*});\s*$',text,re.S)
    if not m: fail(f'cannot parse shard {i}')
    obj=json.loads(m.group(1))
    if obj.get('version')!=version: fail(f'shard {i} version mismatch')
    shard_total+=len(obj['records']); shard_keys+=list(obj['records'])
if shard_total!=1688 or len(shard_keys)!=len(set(shard_keys)) or set(shard_keys)!=set(keys): fail('Explorer shard parity')

# Preserved IANA evidence archive integrity.
snapshot=json_file('iana_snapshot.json')
archive=ROOT/snapshot['archive_path']
if not archive.exists(): fail('IANA evidence archive missing')
if hashlib.sha256(archive.read_bytes()).hexdigest()!=snapshot['archive_sha256']: fail('IANA evidence archive hash mismatch')
if snapshot['databaseCount']!=1595 or snapshot['rootListCount']!=1437: fail('IANA snapshot counts')

# Data pack synchronization for every item listed in it.
pack=ROOT/'downloads/connecting-the-dots-data-pack.zip'
if not pack.exists(): fail('data pack missing')
with zipfile.ZipFile(pack) as zf:
    if zf.testzip(): fail('data pack ZIP corruption')
    for info in zf.infolist():
        local=DATA/info.filename if (DATA/info.filename).exists() else ROOT/info.filename
        if local.exists() and local.is_file() and zf.read(info.filename)!=local.read_bytes(): fail(f'stale data pack entry {info.filename}')

# JavaScript syntax where Node is available.
node='node'
try:
    subprocess.run([node,'--version'],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
except Exception:
    node=None
if node:
    for p in [ROOT/'assets/app.js',DATA/'site_bundle.js',DATA/'i18n_bundle.js',DATA/'worldmap.js',DATA/'publication.js',*[DATA/f'explorer_profiles_{i}.js' for i in range(8)]]:
        rc=subprocess.run([node,'--check',str(p)],stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True)
        if rc.returncode: fail(f'JS syntax {p.relative_to(ROOT)}: {rc.stderr.strip()}')

print(f'RELEASE CHECK PASS · v{version} · 1,688 Explorer records · 5,583 life-history events · 4 languages')
