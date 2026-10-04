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
manifest=json_file('manifest.json')
if manifest.get('version')!=version: fail('manifest/package version mismatch')
if manifest.get('as_of')!='2026-10-04': fail('publication snapshot is not 2026-10-04')
pub=(DATA/'publication.js').read_text()
if f"version:'{version}'" not in pub or "asOf:'2026-10-04'" not in pub: fail('publication.js version/asOf mismatch')

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

# Translation parity.
tr=json_file('translations.json')
base=set(tr['en'])
for lang in LANGS:
    if set(tr[lang])!=base: fail(f'translation key mismatch: {lang}')
    blank=[k for k,v in tr[lang].items() if v is None or (isinstance(v,str) and not v.strip())]
    if blank: fail(f'blank translations {lang}: {blank[:5]}')

# Static pages and local references.
for rel in ['index.html',*[f'{x}/index.html' for x in LANGS]]:
    p=ROOT/rel; text=p.read_text(encoding='utf-8')
    if f'data-build="{version}"' not in text or f'<meta content="{version}" name="ctd-version"' not in text: fail(f'stale static page {rel}')
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
