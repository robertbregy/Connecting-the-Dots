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

# Maintenance release invariants: canonical Git deployment and social-preview accessibility.
deploy_text=(ROOT/'DEPLOY.md').read_text(encoding='utf-8')
if 'GitHub repository is the canonical working master' not in deploy_text or 'Rebuild published site' not in deploy_text:
    fail('DEPLOY.md must describe the canonical Git/GitHub Actions workflow')
source_html=(ROOT/'src'/'index.web.html').read_text(encoding='utf-8')
for token in ['property="og:image:alt"','name="twitter:image:alt"']:
    if token not in source_html:
        fail(f'missing social image alt metadata: {token}')
manifest=json_file('manifest.json')
if manifest.get('version')!=version: fail('manifest/package version mismatch')
publication_meta=json.loads((ROOT/'publication.json').read_text(encoding='utf-8'))
if manifest.get('as_of')!=publication_meta.get('asOf'): fail('manifest/publication snapshot mismatch')
pub=(DATA/'publication.js').read_text()
if f"version:'{version}'" not in pub or f"asOf:'{publication_meta.get('asOf')}'" not in pub or f"state:'{publication_meta.get('state')}'" not in pub: fail('publication.js version/asOf/state mismatch')

# Release-integrity invariants added in v0.7.18.
appjs=(ROOT/'assets/app.js').read_text(encoding='utf-8')
if 'showRepresentedPlace=representedPlace&&norm(representedPlace)!==norm(registryCountry)' not in appjs: fail('Explorer card location deduplication guard missing')
if 'fmtNum(1987)' in appjs or 'fmtNum(57)' in appjs: fail('application archaeology count is hard-coded')
if 'applicationCorpusComplete=true' in appjs: fail('runtime merge may not mark the full application corpus complete directly')
if 'syncApplicationCorpusComplete()' not in appjs: fail('application corpus completeness is not derived')
if "required=['2000','2004','2012','2026']" not in appjs: fail('application corpus completeness does not require all declared historical/current rounds')
if appjs.count('fetch(')!=0: fail('browser-time external fetches reintroduced')
if "renderApplicationCorpusStatus('ready')" not in appjs: fail('local historical application archaeology is not rendered ready')
if '"lifeHistoryGtldContractsRuntime":false' not in (DATA/'data_bundle.js').read_text(encoding='utf-8'): fail('gTLD runtime lifecycle enrichment is not disabled')
arch_manifest=json_file('application_archaeology_manifest.json')
if arch_manifest.get('runtimeTransport2012',{}).get('status')!='disabled-local-corpus-vendored': fail('2012 local-corpus transport state is not declared')

defn=arch_manifest.get('rounds',{}).get('2012',{}).get('revealDayDistinctStringDefinition',{})
if defn.get('value')!=1409 or defn.get('laterActivePopulationExample')!=1388 or defn.get('asOf')!='2012-06-13': fail('2012 Reveal-Day distinct-string definition metadata drift')
source_urls={r.get('url') for r in rows('sources.csv')}
for u in ['https://www.icann.org/en/announcements/details/new-gtld-reveal-day---applied-for-strings-13-6-2012-en','https://gtldresult.icann.org/applicationstatus/viewstatus','https://newgtlds.icann.org/sites/default/files/ie-quality-program-26aug14-en.pdf','https://www.icann.org/en/board-activities-and-meetings/materials/approved-resolutions-regular-meeting-of-the-icann-board-14-09-2025-en']:
    if u not in source_urls: fail('2012 provenance source missing from sources inventory: '+u)

changelog=(ROOT/'CHANGELOG.md').read_text(encoding='utf-8')
for marker in ['v0.7.45','v0.7.44','v0.7.43','v0.7.42','v0.7.41','v0.7.40','v0.7.39','v0.7.38','v0.7.37','v0.7.36','v0.7.35','v0.7.34','v0.7.33','v0.7.32','v0.7.24','v0.7.23','v0.7.22','v0.7.21','v0.7.20','v0.7.19','v0.7.18','v0.7.14','v0.7.13']:
    if marker not in changelog: fail('changelog missing '+marker)
readme=(ROOT/'README.md').read_text(encoding='utf-8')
if "No live refresh occurs in a visitor's browser." in readme: fail('README contains obsolete no-live-refresh claim')

# v0.7.40 release-history integrity: the public history must begin with the package version
# and every published summary key must exist in all four languages.
history=json_file('release_history.json').get('releases',[])
if not history or history[0].get('version')!=version: fail('release history latest version does not match package')
translations=json_file('translations.json')
latest_summary=history[0].get('summaryKey')
if not latest_summary or any(not translations.get(lang,{}).get(latest_summary) for lang in LANGS): fail('latest release-history summary translation missing')


# v0.7.45 current-round integrity: do not confuse official aggregate totals, local APS rows and the secondary string index.
snap=json_file('application_2026_snapshot.json')
if snap.get('official',{}).get('activeApplications')!=1615 or snap.get('official',{}).get('applicants')!=481: fail('2026 official statistics snapshot drift')
if snap.get('stringInventory',{}).get('observedStrings')!=980: fail('2026 observed string inventory count drift')
if snap.get('integrity',{}).get('fullLocalApplicationCorpusClaimed') is not False: fail('2026 local application completeness must remain conservative')
if count('applications_2026.csv')!=1: fail('2026 local official application layer changed without explicit reconciliation')
for lang in LANGS:
    sub=translations.get(lang,{}).get('applications2026DownloadSub','')
    if not sub or ('1' not in sub and 'parti' not in sub.lower()): fail(f'{lang} 2026 application download is not visibly labelled partial')
    if not translations.get(lang,{}).get('exploreSnapshotClocks'): fail(f'{lang} snapshot clocks copy missing')
if 'exploreSnapshotClocks' not in source_html: fail('Explorer three-clock disclosure missing')

# v0.7.40 final pre-Reveal polish invariants.
for lang in LANGS:
    desc=translations.get(lang,{}).get('metaDescription','')
    if not (100 <= len(desc) <= 160): fail(f'{lang} meta description length outside 100-160 chars: {len(desc)}')
if 'ICANN · <span data-number="1615">1,615</span> ↗' not in source_html:
    fail('2026 Reveal Day source-chip count is not locale-aware')
if "new Intl.NumberFormat(localeCode(),{useGrouping:true}).format(Number(v))" not in appjs or '${fmtNum(r.applications)}' not in appjs:
    fail('display counts are not centralized on the locale-aware grouped formatter')
robots=(ROOT/'robots.txt').read_text(encoding='utf-8')
if 'Project-scoped copy:' not in robots or 'host-root /robots.txt' not in robots:
    fail('robots.txt project-path limitation is not documented')
try:
    ds_match=re.search(r'<script id="datasetStructuredData" type="application/ld\+json">(.*?)</script>',source_html,re.S)
    ds=json.loads(ds_match.group(1)) if ds_match else {}
except Exception as exc:
    fail('Dataset JSON-LD cannot be parsed: '+str(exc))
if ds.get('version')!=version or ds.get('dateModified')!=publication_meta.get('releasedOn'):
    fail('Dataset JSON-LD version/date is stale')
expected_based_on={
    'https://www.iana.org/domains/root/db',
    'https://gtldresult.icann.org/applicationstatus/viewstatus',
    'https://www.icann.org/en/announcements/details/new-gtld-reveal-day---applied-for-strings-13-6-2012-en',
}
if not expected_based_on.issubset(set(ds.get('isBasedOn') or [])):
    fail('Dataset JSON-LD primary provenance is incomplete')


# Reader-experience and accessibility invariants. These are intentionally
# structural rather than pixel-perfect so the project can evolve without
# silently losing the novice path, keyboard entry point or search-first UX.
template=(ROOT/'src/index.web.html').read_text(encoding='utf-8')
style=(ROOT/'assets/style.css').read_text(encoding='utf-8')
if '.dnsOdditiesGrid{column-count:2' not in style or '@media(max-width:760px){.dnsOdditiesGrid{column-count:1}' not in style: fail('institutional oddities must use natural-height two-column desktop / one-column mobile layout')
if '#sources > .grid2{align-items:start}' not in style: fail('Sources guardrails panel must keep natural height beside the source inventory')
if '#geography > .grid2,#contention > .grid2{align-items:start}' not in style: fail('Geography and contention comparison panels must keep natural height')
if '.economicModels{align-items:start}' not in style: fail('Economics model tiles must keep natural height')
if '.caseQuestion h3,.caseFact p,.caseReading p,.caseOutcome p,.oddityReadingLine span{min-width:0;overflow-wrap:anywhere;hyphens:auto}' not in style: fail('long translated case text must wrap on narrow screens')
ux_markers=[
    'class="skipLink"',
    'href="#main-content"',
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

# v0.7.34 profile-clarity contract: profiles start with a fact-only summary and
# expose a visible glossary without changing the historical research corpus.
for marker in ['id="how-glossary"','id="domainGlossary"','data-i18n="glossaryTitle"','download="domain_governance_glossary.csv"']:
    if marker not in template: fail('v0.7.34 glossary marker missing: '+marker)
for marker in ['function explorerBriefSection(r)','function curatedContextSection(r)','function renderGlossary()','profileBriefTitle','profileCurrentStateTitle','profileGlossaryLink']:
    if marker not in appjs: fail('v0.7.34 profile-clarity runtime marker missing: '+marker)
glossary_rows=rows('domain_governance_glossary.csv')
if len(glossary_rows)!=28: fail(f'domain glossary count changed: {len(glossary_rows)} != 28')
if sum(1 for r in glossary_rows if r.get('scope')=='project')!=3: fail('project-methodology glossary split changed')
if sum(1 for r in glossary_rows if r.get('scope')=='official')!=25: fail('official glossary split changed')
for r in glossary_rows:
    for key in ['term','it','en','de','fr','scope']:
        if not (r.get(key) or '').strip(): fail(f'blank glossary field {key}: {r.get("term", "?")}')
tr_clarity=json_file('translations.json')
for lang in LANGS:
    for key in ['profileBriefTitle','profileCurrentStateTitle','profileGlossaryLink','glossaryTitle','glossarySub','glossaryOfficial','glossaryProject','release0734']:
        if not tr_clarity[lang].get(key): fail(f'v0.7.34 translation missing {lang}/{key}')

# v0.7.33 accessibility contract: semantic/keyboard hardening without a visual redesign.
if 'aria-haspopup="true"' in template: fail('disclosure navigation still claims popup-menu semantics')
for marker in ['aria-controls="navThemesDropdown"','aria-controls="navRoundDropdown"','aria-controls="navResearchDropdown"','<caption class="srOnly" data-i18n="exploreTitle"','<caption class="srOnly" data-i18n="timeCapsule"','id="profileTitle" tabindex="-1"']:
    if marker not in template: fail('v0.7.33 accessibility marker missing: '+marker)
if template.index('</main>') > template.index('id="explorerDrawer"'): fail('Explorer modal must sit outside inertable main landmark')
for marker in ['function setModalBackgroundInert(on)','setModalBackgroundInert(true)','setModalBackgroundInert(false)',"const focusDialogTitle=()=>","focus({preventScroll:true})",'<h2 class="drawerTld" id="profileTitle" tabindex="-1">','function hardenExternalLinks(root=document)',"t('opensNewTab')","trigger?.focus()",'aria-hidden="true" focusable="false"','class="srOnly geoMapData"']:
    if marker not in appjs: fail('v0.7.33 runtime accessibility invariant missing: '+marker)
if 'role="button" aria-label=' in appjs and 'mapDatum' in appjs: fail('map points still masquerade as keyboard buttons')
if ':where(a,button,input,select,summary,[tabindex]):focus-visible{' not in style: fail('global keyboard focus-visible rule missing')
tr_a11y=json_file('translations.json')
for lang in LANGS:
    if not tr_a11y[lang].get('opensNewTab') or not tr_a11y[lang].get('release0733'): fail(f'v0.7.33 accessibility translation missing for {lang}')

# v0.7.19 mobile journey contract: no fixed-width escape hatch, lesson first,
# narrow diagrams reflow and step changes can recover the current reading position.
for css_marker in [
    '.internetGuide{padding:20px 16px;overflow-x:clip}',
    '.journeyWorkarea{display:flex;flex-direction:column;width:100%;gap:14px}',
    '.journeyLesson{order:1;width:100%;padding:0}',
    '.journeyDiagram{order:2;width:100%;grid-template-columns:1fr;gap:10px}',
    '.journeyDnsTrace{display:flex;flex-direction:column;gap:6px}',
    '.journeyWebPath{grid-template-columns:minmax(0,.8fr) minmax(0,1.3fr) minmax(0,.8fr);gap:4px}',
]:
    if css_marker not in style: fail('mobile journey CSS invariant missing: '+css_marker)
if '.journeyDiagram{grid-template-columns:1fr;order:-1}' in style:
    fail('mobile journey regressed to diagram-first ordering')
if 'function keepJourneyStepInView()' not in appjs or 'keepJourneyStepInView();' not in appjs:
    fail('mobile journey step visibility recovery is missing')

expected_counts={
 'explorer_catalog.csv':1849,'tld_universe.csv':1599,'application_only_strings.csv':250,
 'explorer_events.csv':7679,'tld_life_histories.csv':7679,'applications_2000.csv':47,'applications_2026.csv':1,
 'application_strings_2000.csv':225,'applications_2004.csv':10,'applications_2012.csv':1930,'governance_cases.csv':9,
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
application_only_rows=rows('application_only_strings.csv')
corpus_status_counts={}
for r in application_only_rows:
    corpus_status_counts[r.get('corpus_status','')]=corpus_status_counts.get(r.get('corpus_status',''),0)+1
if corpus_status_counts.get('vendored-historical')!=249 or corpus_status_counts.get('reveal-day-official-partial')!=1:
    fail(f'application-only corpus status split unexpected: {corpus_status_counts}')
if tlds & apps: fail('TLD/application-only overlap')
if len(tlds|apps)!=1849: fail('TLD + application-only universe does not equal Explorer')

# The final audit caught deprecated ISO aliases emitted by Intl.DisplayNames.
current={'France':'FR','Burkina Faso':'BF','Benin':'BJ','Serbia':'RS','Timor-Leste':'TL'}
for r in catalog:
    for cfield,codefield in [('registry_country','registry_country_code'),('administrative_contact_country','administrative_contact_country_code'),('technical_contact_country','technical_contact_country_code')]:
        if r.get(cfield) in current and r.get(codefield)!=current[r[cfield]]:
            fail(f"obsolete country code on {r['string']}: {cfield}={r[cfield]} {r.get(codefield)}")

arch=json_file('application_archaeology_manifest.json')
# v0.7.32 application-outcome model: fields exist on every historical application
# export, but 2012 reasons are populated only where this frozen corpus has primary
# source-backed evidence. Blank is unknown here, never a derived success/failure.
for name in ['applications_2000.csv','applications_2004.csv','applications_2012.csv']:
    rr=rows(name)
    if not rr or not {'outcome','outcome_reason','outcome_source_url'}.issubset(rr[0]): fail(name+' missing outcome model fields')
apps2000=rows('applications_2000.csv')
if sum(bool(r.get('outcome_reason')) for r in apps2000)!=47: fail('2000 outcome reasons are incomplete')
apps2012=rows('applications_2012.csv')
if sum(bool(r.get('outcome_reason')) for r in apps2012)!=27: fail('2012 source-backed outcome-reason count must be 27')
if any(r.get('outcome_reason') and not r.get('outcome_source_url') for r in apps2012): fail('2012 outcome reason lacks source URL')
for field in ['outcome_case_id','contention','contention_case_id','controversy','controversy_case_id']:
    if field not in apps2012[0]: fail('2012 application dimension missing: '+field)
if sum(r.get('contention')=='yes' for r in apps2012)!=755: fail('2012 contention dimension must cover 751 exact-match applications plus 4 non-exact similarity applications')
if not any(r.get('contention')=='yes' and r.get('controversy')=='yes' for r in apps2012): fail('contention and controversy are no longer independent/overlapping dimensions')
if not any(r.get('outcome') and r.get('contention')=='yes' for r in apps2012): fail('outcome and contention are no longer independent/overlapping dimensions')
expected2012={
 '.idn':('excluded-from-further-participation','applicant-support-ineligibility'),
 '.ummah':('excluded-from-further-participation','applicant-support-ineligibility'),
 '.gcc':('not-approved','gac-consensus-advice'),
 '.corp':('did-not-proceed','high-risk-name-collision'),
 '.home':('did-not-proceed','high-risk-name-collision'),
 '.mail':('did-not-proceed','high-risk-name-collision'),
}
for label,(outcome,reason) in expected2012.items():
    subset=[r for r in apps2012 if r.get('ascii_string')==label]
    if not subset or any(r.get('outcome')!=outcome or r.get('outcome_reason')!=reason for r in subset): fail('2012 outcome mapping mismatch: '+label)
known_labels=set(expected2012)
if any(r.get('outcome_reason') for r in apps2012 if r.get('ascii_string') not in known_labels): fail('undocumented 2012 outcome reason was inferred')
local_arch=json_file('application_archaeology_local.json')
if not all(all(k in a for k in ['outcomeReason','outcomeCaseId','outcomeSource','contention','contentionCaseId','controversy','controversyCaseId']) for a in local_arch.get('applications',[])): fail('local archaeology lacks independent outcome/contention/controversy dimensions')
if arch['rounds']['2000']['applications']!=47 or arch['rounds']['2000']['itemE2Links']!=223 or arch['rounds']['2000']['itemE2UniqueStrings']!=188: fail('2000 archaeology totals')
if arch['rounds']['2004']['applications']!=10 or arch['rounds']['2004']['uniqueStrings']!=9: fail('2004 archaeology totals')
r=arch['rounds']['2012']
if (r['applications'],r['uniqueStrings'],r['idn'],r['geographic'],r['community'])!=(1930,1409,116,66,84): fail('2012 locked totals')
if (r.get('approvedStringChanges'),r.get('additionalUniqueReplacementStrings'),r.get('applicationStringLifecycleLabels'))!=(4,3,1412): fail('2012 approved string-change totals')
if r['regions']!={'NA':911,'EUR':675,'AP':303,'LAC':24,'AF':17}: fail('2012 regional totals')
privacy=arch.get('privacy',{})
if privacy.get('excluded2012Fields')!=['Primary Contact','Email'] or not privacy.get('sourceTransportContainsExcludedFields'): fail('2012 privacy handling metadata')
if arch['rounds']['2012'].get('delivery')!='vendored-complete-string-applicant-graph' or arch.get('runtimeSources2012')!=[]: fail('2012 corpus is not locally vendored with runtime transport disabled')
if arch.get('runtimeTransport2012',{}).get('status')!='disabled-local-corpus-vendored': fail('2012 local-corpus transport metadata missing')
sim=r.get('initialStringSimilarityContention',{})
if (sim.get('exactMatchSets'),sim.get('nonExactMatchSets'))!=(230,2): fail('2012 initial string-similarity contention totals')
if sim.get('nonExactMatchPairs')!=[['.hoteis','.hotels'],['.unicom','.unicorn']]: fail('2012 initial non-exact contention pairs')
if sim.get('source')!='https://gtldresult.icann.org/applicationstatus/stringcontentionstatus.downinitialstringsimilaritysetspdf': fail('2012 initial contention provenance')


# v0.7.30 complete local 2012 string/applicant graph contract.
apps2012=rows('applications_2012.csv')
if len(apps2012)!=1930: fail('2012 local application row count')
required_2012_cols={'round','submission_id','official_application_id','string','ascii_string','applicant','idn','a_label','relation_type','status','outcome','outcome_reason','outcome_case_id','outcome_source_url','contention','contention_case_id','controversy','controversy_case_id','string_change_target','string_change_target_ascii','string_change_reason','string_change_source_url','source_url','source_role','official_corpus_source_url','official_corpus_source_role','metadata_scope','source_row'}
if set(apps2012[0])!=required_2012_cols: fail('2012 public export schema drift')
expected_changed_ids={'.dotafrica':'1-1165-42560','.kerrylogisitics':'1-928-31367','.xn--hdb9cza1b':'1-1254-29622','.xn--tqq33ed31aqia':'1-910-25137'}
for r in apps2012:
    expected=expected_changed_ids.get(r['ascii_string'],'')
    if r.get('official_application_id','')!=expected: fail('2012 official application ID scope drift: '+r['ascii_string'])
if len({r['submission_id'] for r in apps2012})!=1930: fail('2012 project record IDs are not unique')
if {r['submission_id'] for r in apps2012}!={f'2012-{i:04d}' for i in range(1,1931)}: fail('2012 project record ID sequence is incomplete')
strings2012={r['ascii_string'] for r in apps2012}
if len(strings2012)!=1409: fail('2012 distinct normalized string count')
if sum(r.get('idn')=='Yes' for r in apps2012)!=116: fail('2012 IDN application count')
from collections import Counter
c2012=Counter(r['ascii_string'] for r in apps2012)
if sum(v>1 for v in c2012.values())!=230 or sum(v for v in c2012.values() if v>1)!=751: fail('2012 contention graph totals')
for key,n in {'.app':13,'.home':11,'.inc':11,'.web':7,'.art':10,'.music':8}.items():
    if c2012[key]!=n: fail(f'2012 known contention count {key}')
if any(r.get('source_role')!='secondary-transcription-of-icann-reveal-table' or r.get('official_corpus_source_url')!='https://gtldresult.icann.org/applicationstatus/viewstatus' or r.get('official_corpus_source_role')!='official-icann-2012-application-status-database' or r.get('metadata_scope')!='complete-string-applicant-graph-plus-approved-string-changes' for r in apps2012): fail('2012 source/scope labels drifted')
changes=[r for r in apps2012 if r.get('string_change_target')]
if len(changes)!=4: fail('2012 approved string-change count')
if len({r['string_change_target_ascii'] for r in changes})!=4: fail('2012 approved string-change target uniqueness')
if len(strings2012|{r['string_change_target_ascii'] for r in changes})!=1412: fail('2012 application-string lifecycle label count')
expected_targets={'.dotafrica':'.africa','.kerrylogisitics':'.kerrylogistics','.xn--hdb9cza1b':'.xn--9dbq2a','.xn--tqq33ed31aqia':'.xn--nqv7fs00ema'}
for r in changes:
    if r['string_change_target_ascii']!=expected_targets[r['ascii_string']] or not r['string_change_source_url']: fail('2012 approved string-change mapping drift')
if not strings2012.issubset(set(keys)): fail('one or more 2012 applied-for strings are missing from Explorer')
round2012=[r for r in catalog if '2012' in {x.strip() for x in (r.get('application_rounds') or '').split('|')}]
if len(round2012)!=1412: fail('Explorer does not expose every 2012 Reveal/replacement string label')
for target in ['.africa','.kerrylogistics','.xn--9dbq2a','.xn--nqv7fs00ema']:
    row=next((r for r in catalog if r['ascii_string']==target),None)
    if not row or '2012' not in {x.strip() for x in (row.get('application_rounds') or '').split('|')}: fail('approved 2012 replacement target missing from Explorer: '+target)
if 'runtimeApplications2012' in appjs or 'csvDownload2012' in appjs or 'enable2012Download' in appjs: fail('obsolete browser-time 2012 machinery remains in app.js')
if "<span class=\"pill\">${esc(a.applicationId||a.submissionId" in appjs: fail('synthetic project application IDs are exposed as if official')
if "detail:a.applicationId||a.submissionId" in appjs: fail('synthetic project IDs leaked into visible history')
if 'download="applications_2012.csv" href="data/applications_2012.csv"' not in template: fail('2012 local CSV is not exposed as a static download')
tr=json_file('translations.json')
for lang in ['en','it','de','fr']:
    app_only_sub=tr[lang].get('downloadApplicationOnlySub','').lower()
    if not app_only_sub or ('complete' not in app_only_sub and 'completa' not in app_only_sub and 'vollständ' not in app_only_sub and 'complète' not in app_only_sub):
        fail(f'{lang} application-only download copy does not state complete historical coverage')

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
# v0.7.32 editorial contract: application outcome is a distinct factual dimension
# from contention and governance controversy. Curated outcome stories must not
# silently duplicate the dispute corpus, and every referenced string must resolve.
refusals=research.get('refusalCases') or {}
if refusals.get('schemaVersion')!=1 or len(refusals.get('taxonomy',[]))!=6 or len(refusals.get('cases',[]))!=6: fail('refusal case schema/count mismatch')
ref_snapshot=refusals.get('snapshot') or {}
if [ref_snapshot.get(k) for k in ['passedInitialEvaluation','eligibleExtendedEvaluation','notApproved','withdrawn','onHold']]!=[1745,32,3,121,29]: fail('2013 Initial Evaluation stop snapshot mismatch')
gov_strings={s.lower() for c in json_file('governance_cases.json').get('cases',[]) for s in c.get('strings',[])}
ref_strings={s.lower() for c in refusals.get('cases',[]) for s in c.get('strings',[])}
if gov_strings & ref_strings: fail('refusal cases overlap governance dispute strings: '+', '.join(sorted(gov_strings & ref_strings)))
catalog_strings={r.get('ascii_string','').lower() for r in catalog}
missing_ref=sorted(s for s in ref_strings if s not in catalog_strings)
if missing_ref: fail('refusal case strings missing from Explorer: '+', '.join(missing_ref))
for c in refusals.get('cases',[]):
    if not c.get('sources') or not all(str(x.get('url','')).startswith('https://') for x in c.get('sources',[])): fail('refusal case lacks primary HTTPS sources: '+str(c.get('id')))
r2026=next((r for r in research.get('rounds',[]) if r.get('round')==2026),{})
if r2026.get('applications')!=1615: fail('round comparison must use the 1,615 Reveal Day applications for 2026')
reveal_active=next((r for r in rows('round_2026.csv') if r.get('metric')=='Applications active at Reveal Day'),{})
if reveal_active.get('value')!='1615': fail('2026 Reveal Day active applications must be 1,615')
summary={r['Round']:r for r in rows('rounds_summary.csv')}
if summary.get('2026',{}).get('Applications')!='1615': fail('rounds_summary 2026 Reveal Day applications mismatch')
if '1,663' not in summary.get('2026',{}).get('Note',''): fail('rounds_summary must preserve the 1,663 pre-Reveal submission count in the note')
if not summary.get('2012',{}).get('Delegations source'): fail('2012 delegation metric lacks dedicated provenance')

# Translation parity.
tr=json_file('translations.json')

# v0.7.24 navigation contract: section changes land at their start on every viewport,
# Home returns to the true document top, and dynamic cross-links stay inside the SPA.
src=(ROOT/'src/index.web.html').read_text(encoding='utf-8')
if '<a aria-label="Home" class="brand brandButton" href="./">' not in src: fail('brand is not a real home link')
for marker in ['function navigationOffset()','function scrollToNavigationTarget(target,smooth=true)','function scrollToDocumentTop(smooth=true)',"activateTab(id,userInitiated=false,historyMode='replace',scrollSection=true)","e.target.closest?.('[data-open-section]')","activateTab('overview',true,'replace',false)"]:
    if marker not in appjs: fail('navigation hardening invariant missing: '+marker)
if 'userInitiated&&window.innerWidth<=960' in appjs: fail('section scrolling is still incorrectly viewport-gated')
if "for(const selector of ['.topbar','.nav','.mobileNavWrap'])" not in appjs: fail('navigation offset does not include every sticky navigation layer')
if tr['it'].get('release0728') is None: fail('release0728 translation missing')
for marker in ['data-open-section="refusals" data-open-anchor="refusal-case-', 'data-open-section="disputes" data-open-anchor="case-', 'data-open-section="economics" data-open-anchor="econ-case-', 'data-open-section="social" data-open-anchor="social-case-', 'data-open-section="sources" data-open-anchor="publication-updates"']:
    if marker not in appjs: fail('dynamic internal navigation marker missing: '+marker)
if tr['it'].get('release0724') is None: fail('release0724 translation missing')
if tr['it'].get('release0725') is None: fail('release0725 translation missing')
if any(not tr[lang].get('applicationCorpusReady') for lang in LANGS): fail('ready-status translation missing')
if tr['it'].get('release0729') is None: fail('release0729 translation missing')
if tr['it'].get('release0730') is None: fail('release0730 translation missing')
if tr['it'].get('release0731') is None: fail('release0731 translation missing')
if tr['it'].get('release0732') is None: fail('release0732 translation missing')
if tr['it'].get('release0733') is None: fail('release0733 translation missing')
if tr['it'].get('release0734') is None: fail('release0734 translation missing')
for lang in LANGS:
    for key in ['tabRefusals','refusalsTitle','refusalsSubtitle','refusalsBoundaryBody','refusalTaxonomyTitle','refusalCasesTitle','refusalCaseBadge','explorePresetRefusals','applicationContention','applicationControversy','outcomeReasonLabel','outcomeEvidence','outcome_excluded_from_further_participation','outcome_not_approved','outcome_did_not_proceed']:
        if not tr[lang].get(key): fail(f'missing application-outcome translation {lang}/{key}')
if tr['it'].get('refusalsTitle')!='Candidature che non ce l’hanno fatta': fail('Italian application-outcome title regression')
if tr['it'].get('refusalsSubtitle')!='Perché alcune stringhe candidate non sono mai entrate nella root DNS': fail('Italian application-outcome subtitle regression')
for forbidden in ['Rifiuti & stop','Rejections & stops']:
    if any(forbidden in str(v) for lang in LANGS for v in tr[lang].values()): fail('obsolete rejection/stop label remains visible: '+forbidden)
if 'id="refusals"' not in src or 'id="refusalTaxonomy"' not in src or 'id="refusalGrid"' not in src: fail('refusal section missing from source template')
if 'data-preset="refusals"' not in src: fail('Explorer refusal preset missing')
for marker in ["function refusalCasesFor(r)","function refusalCaseSection(r)","function renderRefusals()","explorerPreset==='refusals'"]:
    if marker not in appjs: fail('refusal runtime integration missing: '+marker)
if 'non più presenti' not in tr['it'].get('exploreCoverageBody',''): fail('Italian Explorer copy lost the non più correction')
local_2012_copy_expect={
 'en':('all 1,930 applications','all 1,930 applications'),
 'it':('tutte le 1.930 candidature','tutte le 1.930 candidature'),
 'de':('alle 1.930 Bewerbungen','alle 1.930 Bewerbungen'),
 'fr':('les 1 930 candidatures','1 930 candidatures'),
}
for lang,(body_marker,download_marker) in local_2012_copy_expect.items():
    if body_marker not in tr[lang].get('exploreCorpusNoteBody',''): fail(f'2012 local corpus wording is inconsistent in {lang}')
    if download_marker not in tr[lang].get('downloadApplications2012Sub',''): fail(f'2012 local download wording is inconsistent in {lang}')

# v0.7.27 Explorer filtering contract: advanced filters are visibly labelled, raw
# IANA machine values are localized, and editorial macro-topics cover the full corpus.
if tr['it'].get('release0727') is None: fail('release0727 translation missing')
for lang in LANGS:
    for key in ['filterAll','filterRoundShort','filterStatusShort','filterTypeShort','filterCountryShort','filterThemeShort','typeTest',
                'topicGeography','topicTechnology','topicBusiness','topicFinance','topicCultureMedia','topicSociety','topicPublic','topicLifestyle','topicServices','topicSpecial','topicOther']:
        if not tr[lang].get(key): fail(f'missing Explorer filter translation {lang}/{key}')
src=(ROOT/'src/index.web.html').read_text(encoding='utf-8')
if src.count('class="explorerFilterField"')!=5: fail('Explorer advanced filters must expose exactly five visible fields')
for fid in ['exploreRoundFilter','exploreStatusFilter','exploreTypeFilter','exploreCountryFilter','exploreThemeFilter']:
    if f'for="{fid}"' not in src: fail('Explorer visible filter label missing for '+fid)
if "test:'typeTest'" not in appjs: fail('IANA test type is not localized in Explorer')
if "(r.topicFacets||[]).includes(topic)" not in appjs: fail('Explorer topic filter is not using universal topic facets')
if '...(r.topicFacets||[]).map(t)' not in appjs: fail('Explorer search index omits topic facets')
cat_rows=rows('explorer_catalog.csv')
if 'topic_facets' not in (cat_rows[0] if cat_rows else {}): fail('Explorer catalog export lacks topic_facets')
if any(not (r.get('topic_facets') or '').strip() for r in cat_rows): fail('Explorer topic facet coverage is incomplete')
if not any('topicOther' in (r.get('topic_facets') or '') for r in cat_rows): fail('Explorer fallback macro-topic missing')
if all('topicOther' in (r.get('topic_facets') or '') for r in cat_rows): fail('Explorer macro-topic classification collapsed to fallback')


# v0.7.26 information architecture contract: the guided Internet walkthrough belongs
# only to Overview/Home, while the deeper How section starts after it.
if src.count('id="internet-guide"')!=1: fail('Internet walkthrough must exist exactly once')
walk_pos=src.index('id="internet-guide"'); overview_pos=src.index('id="overview"'); explore_pos=src.index('id="explore"'); how_pos=src.index('id="how"')
if not (overview_pos < walk_pos < explore_pos < how_pos): fail('Internet walkthrough is not structurally confined to Overview/Home')
if re.search(r'<a\b(?=[^>]*data-open-section="how")(?=[^>]*data-open-anchor="internet-basics")[^>]*>',src): fail('direct walkthrough links still open the How section')
overview_walk_links=re.findall(r'<a\b(?=[^>]*data-open-section="overview")(?=[^>]*data-open-anchor="internet-basics")[^>]*>',src)
if len(overview_walk_links)<2: fail('Home/hero walkthrough links do not target Overview')
for marker in ["activeTab==='overview'&&location.hash==='#internet-basics'", "hasWalk?'overview'", "url.searchParams.set('tab','overview');url.searchParams.set('walk'", "if(activeTab!=='overview'||location.hash!=='#internet-basics')p.delete('walk')", "previousTab!==id&&(previousTab==='overview'||id==='overview')"]:
    if marker not in appjs: fail('home-only walkthrough runtime invariant missing: '+marker)
if tr['it'].get('release0726') is None: fail('release0726 translation missing')

# v0.7.23 teaching contract: URL anatomy, DNS hierarchy and web delivery remain distinct
# but explicitly connected by one seven-step narrative.
src=(ROOT/'src/index.web.html').read_text(encoding='utf-8')
for marker in ['data-journey-address-part="scheme"','data-journey-address-part="host"','data-journey-address-part="name"','data-journey-address-part="tld"','data-journey-address-part="root"','data-journey-address-part="path"']:
    if marker not in src: fail('guided-address segment missing: '+marker)
for marker in ['id="journeyNow"','id="journeyAddressLane"','class="journeyDnsTrace"','id="journeyRecap"','data-i18n="journeyRecapTitle"']:
    if marker not in src: fail('teaching walkthrough structure missing: '+marker)
for marker in ['JOURNEY_ADDRESS_FOCUS','syncJourneyAddressFocus(guide)','syncJourneyTeachingState(guide)',"t('journeyNow'+journeyStep+'From')",'class="journeyKey"']:
    if marker not in appjs: fail('teaching walkthrough runtime invariant missing: '+marker)
css=(ROOT/'assets/style.css').read_text(encoding='utf-8')
for marker in ['.journeyRootDot{display:none}','.journeyRootDot.is-active{display:inline}','.journeyAddressResult.is-active code','.journeyLane.is-visible{display:block}','.journeyRecapFlow{']:
    if marker not in css: fail('teaching walkthrough CSS invariant missing: '+marker)
if tr['it'].get('journey0Label')!='L’indirizzo' or tr['it'].get('journey1Label')!='Il nome' or tr['it'].get('journey2Label')!='Il TLD' or tr['it'].get('journey3Label')!='Nome → IP':
    fail('Italian teaching sequence regressed')
if tr['it'].get('journey1Label')=='La radice': fail('DNS root returned as a standalone lesson step')
for lang in LANGS:
    for key in ['journeyNowLabel','journeyKeyLabel','journeyRecapTitle',*[f'journey{i}Key' for i in range(7)]]:
        if not tr[lang].get(key): fail(f'missing teaching translation {lang}/{key}')

# v0.7.21 automatic-language contract: detection is root-only, explicit choice persists,
# direct language routes stay stable, and unsupported/missing preferences fall back to English.
routing=(ROOT/'assets/legacy-routing.js').read_text(encoding='utf-8')
for marker in ["navigator.languages", "localStorage.getItem('dotLangChoice')", "return 'en'", "if(!alias&&!query.has('lang'))return"]:
    if marker not in routing: fail('automatic-language routing invariant missing: '+marker)
if "target=valid(requested)?requested:'en'" not in routing: fail('invalid legacy language does not fall back to English')
if "storageSet('dotLangChoice',next)" not in appjs or "[data-language]" not in appjs: fail('explicit language choice is not persisted')
if "storageSet('dotLang',lang)" in appjs: fail('localized page visit still overwrites language preference')

# v0.7.20 Italian navigation terminology contract: contention and disputes must be immediately distinguishable.
if tr['it'].get('tabContention')!='Stringhe contese': fail('Italian contention navigation label regressed')
if tr['it'].get('tabDisputes')!='Controversie': fail('Italian disputes navigation label regressed')
if tr['it'].get('tabContention')==tr['it'].get('tabDisputes'): fail('Italian contention/disputes labels collide')

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

# v0.7.44 post-Reveal editorial integrity: the current round must be visible across
# thematic sections without confusing official ICANN facts, derived measures and editorial readings.
contention_rows=rows('contention_rounds.csv')
if (DATA/'contention_2012.csv').exists(): fail('legacy 2012-only contention export survived v0.7.44')
if len([r for r in contention_rows if r.get('round')=='2026'])<15: fail('2026 contention ranking is incomplete')
agent_rows=[r for r in contention_rows if r.get('round')=='2026' and r.get('string')=='.agent']
if not agent_rows or agent_rows[0].get('applications')!='13': fail('2026 .agent contention benchmark regressed')
strange_rows=rows('strange_internet.csv')
if len([r for r in strange_rows if r.get('round')=='2026'])<8: fail('Strange Internet lacks the post-Reveal 2026 layer')
meow=[r for r in strange_rows if r.get('round')=='2026' and r.get('string')=='.meow']
if not meow or meow[0].get('category')=='community': fail('.meow must not be visually classified as a formal ICANN Community application')
keyfacts=rows('key_facts.csv')
if not any(r.get('value')=='1,615' and '7 October 2026' in r.get('fact_en','') for r in keyfacts): fail('Reveal Day key fact must use the official 1,615 snapshot')
for lang in LANGS:
    if not translations.get(lang,{}).get('derived'): fail(f'missing derived epistemic label: {lang}')
for marker in ['data-i18n="derived"','id="contentionBars2026"','id="strangeGridAll"','data-i18n="outcomes2026StatusTitle"','data-i18n="disputes2026StatusTitle"','data-i18n="economics2026Title"','data-i18n="social2026Title"']:
    if marker not in template: fail('post-Reveal thematic structure missing: '+marker)
for stale in ['The 2026 corpus remains incomplete until official Reveal Day data are published.','Il corpus 2026 resta incompleto fino alla pubblicazione dei dati ufficiali del Reveal Day.']:
    if stale in translations.get('en',{}).values() or stale in translations.get('it',{}).values(): fail('stale pre-Reveal copy survived: '+stale)

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
    if f'"dateModified":"{publication_meta.get("releasedOn")}"' not in text: fail(f'structured-data dateModified mismatch in {rel}')
    if text.count('<h1')!=1: fail(f'expected exactly one h1 in {rel}')
    skip=re.search(r'<a\b(?=[^>]*\bclass=["\'][^"\']*\bskipLink\b[^"\']*["\'])(?=[^>]*\bhref=["\']#main-content["\'])[^>]*>',text,re.I)
    main=re.search(r'<main\b(?=[^>]*\bid=["\']main-content["\'])[^>]*>',text,re.I)
    if not skip or not main: fail(f'skip-to-content path missing in {rel}')
    if 'class="heroPlain"' not in text or 'class="heroActions"' not in text: fail(f'novice entry path missing in {rel}')
    if 'applicationCorpusStatus ready' not in text: fail(f'static local-corpus ready status missing in {rel}')
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
if shard_total!=1849 or len(shard_keys)!=len(set(shard_keys)) or set(shard_keys)!=set(keys): fail('Explorer shard parity')

# Preserved IANA evidence archive integrity.
snapshot=json_file('iana_snapshot.json')
archive=ROOT/snapshot['archive_path']
if not archive.exists(): fail('IANA evidence archive missing')
if hashlib.sha256(archive.read_bytes()).hexdigest()!=snapshot['archive_sha256']: fail('IANA evidence archive hash mismatch')
if snapshot['databaseCount']!=1595 or snapshot['rootListCount']!=1437: fail('IANA snapshot counts')

# Frozen research data pack integrity. Technical site releases may advance without rewriting RR1.
pack=ROOT/'downloads/connecting-the-dots-data-pack.zip'
if not pack.exists(): fail('data pack missing')
with zipfile.ZipFile(pack) as zf:
    if zf.testzip(): fail('data pack ZIP corruption')
    try:
        packed_manifest=json.loads(zf.read('manifest.json'))
    except KeyError:
        fail('data pack manifest missing')
    expected_pack_version=publication_meta.get('dataPackageVersion') or version
    if packed_manifest.get('version')!=expected_pack_version:
        fail(f"data pack version mismatch: {packed_manifest.get('version')} != {expected_pack_version}")

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

# v0.7.60: the live editorial chronicle must remain independent from frozen RR1.
chronicle=json_file('inside_the_round_events.json')
events=chronicle.get('events', [])
if len(events)!=9 or len({event['id'] for event in events})!=9:
    fail('Inside the Round event count or unique ids')
if chronicle.get('lastReviewed')!=publication_meta.get('releasedOn'):
    fail('Inside the Round editorial review date does not match this publication')
if publication_meta.get('researchRelease')!='RR1' or publication_meta.get('doi')!='10.5281/zenodo.23262623':
    fail('Frozen RR1 publication identity drift')
chronicle_states={event['state'] for event in events}
if chronicle_states!={'observed','current','scheduled','evolving','conditional'}:
    fail('Inside the Round status distinctions missing')
for event in events:
    if not event['source'].startswith(('https://www.icann.org/','https://newgtldprogram.icann.org/','https://newgtldprogram-aps.icann.org/','https://www.lugano.ch/')):
        fail('Inside the Round non-primary source for '+event['id'])
    for lang in LANGS:
        if any(not translations.get(lang,{}).get(event[k]) for k in ('dateKey','titleKey','bodyKey')):
            fail('Inside the Round missing event translation: '+lang+'/'+event['id'])
        for extra in event.get('extraSources',[]):
            if not extra.get('source','').startswith(('https://www.icann.org/','https://newgtldprogram.icann.org/','https://newgtldprogram-aps.icann.org/','https://www.lugano.ch/')) or not translations[lang].get(extra.get('labelKey')):
                fail('Inside the Round supplementary source invalid: '+event['id'])
        if event.get('sourceLabelKey') and not translations[lang].get(event['sourceLabelKey']):
            fail('Inside the Round source attribution untranslated: '+event['id'])
if not {'reveal-day','lugano-public-information','community-input'}.issubset({e['id'] for e in events}):
    fail('Required program and .lugano public milestones missing')
reveal=next(e for e in events if e['id']=='reveal-day')
if not any('CDL2651T-T31516/summary' in item.get('source','') for item in reveal.get('extraSources',[])):
    fail('Official .lugano ICANN APS application source missing')
rrmeta=json.loads((ROOT/'research'/'research_release_manifest.json').read_text(encoding='utf-8'))['currentResearchRelease']
citation=(ROOT/'CITATION.cff').read_text(encoding='utf-8')
if f'date-released: "{rrmeta["publishedOn"]}"' not in citation or f'version: "{rrmeta["id"]}"' not in citation:
    fail('CITATION.cff must preserve RR1 original release date independently of site updates')
if rrmeta['doi']!=publication_meta.get('doi') or f'value: "{rrmeta["doi"]}"' not in citation:
    fail('RR1 DOI citation drift')
if publication_meta.get('paperVersion')!='1.1-draft':
    fail('Working paper revision metadata mismatch')
if 'id="inside-round"' not in source_html or 'data-target="inside-round"' not in source_html:
    fail('Inside the Round missing from primary navigation and site source')
if '<!-- CTD_INSIDE_ROUND_EVENTS -->' not in source_html:
    fail('Inside the Round generated timeline placeholder removed from source')
from xml.etree import ElementTree as ET
sitemap_root=ET.parse(ROOT/'sitemap.xml').getroot()
sitemap_ns={'sm':'http://www.sitemaps.org/schemas/sitemap/0.9'}
sitemap_locs=[n.text for n in sitemap_root.findall('sm:url/sm:loc',sitemap_ns)]
site_base='https://robertbregy.github.io/Connecting-the-Dots/'
must_index={site_base+x for x in ['en/','it/','de/','fr/','explorer/','research/','research/connecting-the-dots-working-paper-v1.html']}
must_index.update(site_base+'inside-the-round/'+lang+'/' for lang in LANGS)
must_index.update(site_base+'behind-the-round/'+lang+'/' for lang in LANGS)
must_index.update(site_base+'behind-the-round/'+lang+'/wdo-identity/' for lang in LANGS)
must_index.update(site_base+'behind-the-round/'+lang+'/sanctions-and-dns/' for lang in LANGS)
if set(sitemap_locs)!=must_index or len(sitemap_locs)!=len(must_index):
    fail('Sitemap must preserve all 23 language/research/chronicle/field-note/explainer URLs')
for lang in LANGS:
    page=(ROOT/lang/'index.html').read_text(encoding='utf-8')
    chronicle_page=ROOT/'inside-the-round'/lang/'index.html'
    if page.count('data-event-id=')!=len(events):
        fail('Incomplete main-site 2026 milestone timeline in '+lang)
    if 'data-target="inside-round"' not in page:
        fail('Inside the Round not available in '+lang+' primary navigation')
    if site_base+'inside-the-round/'+lang+'/' not in page:
        fail('Inside the Round localized guide link incorrect for '+lang)
    if not chronicle_page.exists():
        fail('Missing stand-alone Inside the Round page '+lang)
    standalone=chronicle_page.read_text(encoding='utf-8')
    if standalone.count('data-event-id=')!=len(events):
        fail('Incomplete stand-alone milestone timeline in '+lang)
    for event in events:
        for link in [event['source'],*[ex['source'] for ex in event.get('extraSources',[])]]:
            if link not in standalone or link not in page:
                fail('Unlinked Inside the Round primary source: '+lang+'/'+event['id'])
    if f'<html lang="{lang}">' not in standalone:
        fail('Wrong standalone chronicle language: '+lang)
    if f'<link rel="canonical" href="{site_base}inside-the-round/{lang}/">' not in standalone:
        fail('Wrong standalone chronicle canonical: '+lang)
    from html import escape as html_escape
    if any(html_escape(v) not in standalone for v in [translations[lang]['insideIntro'],translations[lang]['insideDisclosureBody']]):
        fail('Standalone chronicle translation missing: '+lang)
    if standalone.count('<link rel="alternate" hreflang=')!=5:
        fail('Standalone chronicle reciprocal hreflang parity: '+lang)
    if '24 hours before' in standalone or '24 ore prima' in standalone:
        fail('Unpublished personal detail must not appear in chronicle')
    check_internal_refs(chronicle_page)

# Behind the Round observations are separate, source-dated and revisable without altering RR1.
fieldnotes=json_file('behind_round_stories.json')
if fieldnotes.get('schemaVersion')!=1 or fieldnotes.get('editorialLayer')!='2026-round-field-notes-not-part-of-frozen-RR1':
    fail('Unversioned/incorrect field-note evidence register')
if fieldnotes.get('lastReviewed')!=publication_meta.get('releasedOn'):
    fail('Field-note review date differs from publication date')
stories=fieldnotes.get('episodes',[])
if len(stories)!=2 or [x['id'] for x in stories]!=['reveal-day-counts','wdo-identity']:
    fail('Reveal Day field-note case missing or duplicated')
case=stories[0]
if case['state']!='partly-explained' or {q['id']:q['status'] for q in case['discrepancies']}!={'paid-to-reveal':'unresolved','aggregate-to-visible':'documented-exclusion'}:
    fail('Counts discrepancy must preserve solved and still-unexplained questions separately')
if {q['id']:q['value'] for q in case['quantities']}!={'paid':1616,'official':1615,'secondary':1614}:
    fail('Reveal Day discrepancy values altered without reviewed evidence')
if case['trackedApplication']['id']!='WDO2627T-T45217' or case['trackedApplication']['string']!='.wdo':
    fail('Officially documented administrative-check record changed')
if not case.get('revisionHistory') or case['revisionHistory'][-1]['date']!=case['revisedOn'] or case['revisionHistory'][-1]['changeKey']!='behindRevisionReconciled':
    fail('Unversioned field-note revision history')
if len(case['sources'])!=12 or not any(s['kind']=='secondary' for s in case['sources']):
    fail('Editorial case lacks provenance distinction')
if not all(s['url'].startswith('https://') and s['labelKey'] for s in case['sources']):
    fail('Incomplete case evidence')
if 'id="behind-round"' not in source_html or 'data-target="behind-round"' not in source_html or '<!-- CTD_BEHIND_ROUND_STORIES -->' not in source_html:
    fail('Independent observation missing from main navigation or build source')
for lang in LANGS:
    page=(ROOT/lang/'index.html').read_text(encoding='utf-8')
    route=ROOT/'behind-the-round'/lang/'index.html'
    if not route.exists(): fail('Missing Behind the Round standalone '+lang)
    standalone=route.read_text(encoding='utf-8')
    if page.count('data-behind-story="reveal-day-counts"')!=1 or standalone.count('data-behind-story="reveal-day-counts"')!=1 or page.count('data-behind-story="wdo-identity"')!=1 or standalone.count('data-behind-story="wdo-identity"')!=1:
        fail('The field-note story is not fully visible in '+lang)
    if page.count('data-source-id=')!=sum(len(entry['sources']) for entry in stories) or standalone.count('data-source-id=')!=sum(len(entry['sources']) for entry in stories):
        fail('Missing direct case evidence links in '+lang)
    if site_base+'behind-the-round/'+lang+'/' not in page:
        fail('Localized Behind the Round guide link missing in '+lang)
    if '"image":"'+site_base+'assets/og-preview.png"' not in standalone:
        fail('Missing Article structured image in '+lang)
    if f'<html lang="{lang}">' not in standalone or f'<link rel="canonical" href="{site_base}behind-the-round/{lang}/">' not in standalone:
        fail('Wrong canonical/locale for Behind the Round '+lang)
    if standalone.count('<link rel="alternate" hreflang=')!=5:
        fail('Missing hreflang reciprocity for Behind the Round '+lang)
    for key in ['behindExplainedBody','behindOpenBody','behindIndependenceBody','behindMethodBody']:
        from html import escape as html_escape
        if not translations.get(lang,{}).get(key) or html_escape(translations[lang][key]) not in standalone:
            fail('Missing/untranslated core field-note '+lang+'/'+key)
    for source in case['sources']:
        if source['url'] not in standalone or source['url'] not in page or not translations[lang].get(source['labelKey']):
            fail('Missing case citation in '+lang+'/'+source['id'])
    for val in ['1,616','1,615','1,614','WDO2627T-T45217']:
        if val not in standalone: fail('Missing dated count or WDO application identifier '+lang)
    if '24 hours before' in standalone or '24 ore prima' in standalone:
        fail('Private application-planning details must not be published')
    if standalone.count('data-editorial-revision=') != sum(len(entry['revisionHistory']) for entry in stories):
        fail('No visible dated editorial change history '+lang)
    if 'data-region="AP" data-gap="1"' not in standalone or standalone.count('data-region=')!=5:
        fail('Regional comparison not fully published: '+lang)
    for new_key in ['behindRegionalConclusion','behindIndependentBody','behindCoverageBody','wdoUnknownBody','wdoTrademarkBody','wdoComplianceBody']:
        from html import escape as html_escape
        if html_escape(translations[lang][new_key]) not in standalone:
            fail('Independently sourced review missing in '+lang+'/'+new_key)
    second=stories[1]
    detail=ROOT/'behind-the-round'/lang/'wdo-identity'/'index.html'
    if not detail.exists(): fail('Missing second field note as standalone article: '+lang)
    detail_html=detail.read_text(encoding='utf-8')
    if f'<link rel="canonical" href="{site_base}behind-the-round/{lang}/wdo-identity/">' not in detail_html:
        fail('Second article canonical missing: '+lang)
    if f'<title>{html_escape(translations[lang]["wdoMetaTitle"])}</title>' not in detail_html:
        fail('Wrong WDO SEO title: '+lang)
    if 'data-behind-story="wdo-identity"' not in detail_html or 'data-behind-story="reveal-day-counts"' in detail_html:
        fail('Standalone second case mixes unrelated articles: '+lang)
    if detail_html.count('data-source-id=')!=len(second['sources']) or detail_html.count('<link rel="alternate" hreflang=')!=5:
        fail('Second article loses evidence or hreflang: '+lang)
    if '<a class="behindStoryLink"' in detail_html or f'<a class="behindStoryLink" href="{site_base}behind-the-round/{lang}/wdo-identity/">' not in standalone:
        fail('Standalone article self-link or missing collection CTA: '+lang)
    for source in second['sources']:
        if source['url'] not in detail_html or source['url'] not in standalone or source['url'] not in page:
            fail('Unlinked second field-note primary evidence: '+lang+'/'+source['id'])
    if 'World Data Organization' not in detail_html or 'World Design Organization' not in detail_html:
        fail('Unverifiable or incomplete WDO identities: '+lang)
    for speculative in ['due to sanctions','blocked by the trademark','wegen Sanktionen zurückgestellt','bloquée par les sanctions','bloccata dalle sanzioni']:
        if speculative in detail_html:
            fail('Unproven causal claim: '+lang)
    check_internal_refs(detail)
    check_internal_refs(route)

# The second observation documents identities, not a confirmed legal dispute or cause of the ICANN check.
second=stories[1]
if second.get('kind')!='identity' or second.get('number')!=2 or second.get('state')!='documented-with-open-questions':
    fail('WDO case identity or evidentiary classification drift')
if len(second.get('sources',[]))!=7 or not all(x['kind']=='primary' for x in second['sources']):
    fail('WDO case should cite seven institutional primary sources')
if {x['id'] for x in second['sources']}!={'wdo-aps','wdo-cas','design-about','design-trademark','icann-guidebook','icann-period','ofac-july'}:
    fail('WDO case lacks an essential checked primary record')
regions=case.get('regionalComparison',[])
if len(regions)!=5 or sum(x['officialApplications'] for x in regions)!=1615 or sum(x['visibleApplications'] for x in regions)!=1614:
    fail('Regional reconciliation lost or altered')
if {x['code'] for x in regions if x['officialApplications']!=x['visibleApplications']}!={'AP'}:
    fail('Incorrect claim that regional discrepancies extend beyond Asia-Pacific')

# OFAC background is an independently indexable explainer, not a case finding or archived RR1.
explainer=json_file('sanctions_explainer.json')
if explainer.get('editorialLayer')!='governance-explainer-not-part-of-frozen-RR1' or explainer.get('classification')!='explainer':
    fail('Sanctions narrative conflated with dated cases or archived RR1')
if explainer.get('reviewedOn')!=publication_meta.get('releasedOn') or explainer.get('publishedOn')!='2026-10-10':
    fail('Unversioned sanctions explainer review')
if len(explainer.get('sources',[]))!=12 or len(explainer.get('sections',[]))!=7 or len(explainer.get('precedents',[]))!=4:
    fail('Incomplete sanctions explainer data or sources')
for lang in LANGS:
    url=site_base+'behind-the-round/'+lang+'/sanctions-and-dns/'
    path=ROOT/'behind-the-round'/lang/'sanctions-and-dns'/'index.html'
    if not path.exists(): fail('Missing localized sanctions explainer: '+lang)
    html=path.read_text(encoding='utf-8')
    tx=explainer['languages'][lang]
    from html import escape as html_escape
    if f'<html lang="{lang}">' not in html or f'<link rel="canonical" href="{url}">' not in html:
        fail('Sanctions explainer canonical/locale mismatch: '+lang)
    if f'<title>{html_escape(tx["metaTitle"])}</title>' not in html:
        fail('Sanctions explainer metadata untranslated: '+lang)
    if html.count('<link rel="alternate" hreflang=')!=5 or 'https://doi.org/10.5281/zenodo.23262623' not in html:
        fail('Sanctions explainer hreflang or archived-source attribution missing: '+lang)
    if html.count('data-explainer-section=')!=7 or html.count('data-explainer-precedent=')!=4:
        fail('Sanctions explainer incomplete topics or chronology: '+lang)
    if html.count('id="governance-source-')!=12:
        fail('Sanctions explainer missing primary source list: '+lang)
    for source in explainer['sources']:
        if source['url'] not in html:
            fail('Unlinked sanctions explainer reference: '+lang+'/'+source['id'])
    for item in explainer['sections']:
        if html_escape(tx['sections'][item['id']]['body']) not in html:
            fail('Untranslated sanctions explainer evidence: '+lang+'/'+item['id'])
    for item in explainer['precedents']:
        if html_escape(tx['precedents'][item['id']]['body']) not in html:
            fail('Untranslated sanctions precedent: '+lang+'/'+item['id'])
    for path2 in (ROOT/lang/'index.html', ROOT/'behind-the-round'/lang/'index.html', ROOT/'behind-the-round'/lang/'wdo-identity'/'index.html'):
        html2=path2.read_text(encoding='utf-8')
        if url not in html2:
            fail('Missing sanctions explainer crosslink: '+str(path2.relative_to(ROOT)))
    index_html=(ROOT/lang/'index.html').read_text(encoding='utf-8')
    if index_html.count('data-governance-explainer-link')!=2:
        fail('Explainer must appear alongside both 2026 main-site Field Notes: '+lang)
    if html.count('data-behind-story=') or html.count('data-event-id='):
        fail('Governance explainer is not a dated field observation')
    check_internal_refs(path)

# Working-paper revisions may evolve, but the dated RR1 evidence and citation do not.
working_md=(ROOT/'research'/'connecting-the-dots-working-paper-v1.md').read_text(encoding='utf-8')
working_html=(ROOT/'research'/'connecting-the-dots-working-paper-v1.html').read_text(encoding='utf-8')
for fragment in ['Working Paper v1.1-draft', 'Editorial revision note (10 October 2026)', 'participant-observer', '6A.3 A first field note', '1,616']:
    if fragment not in working_md or fragment not in working_html:
        fail('Working paper HTML/Markdown methodological revision mismatch: '+fragment)
if 'date-released: "2026-10-09"' not in citation or publication_meta.get('releasedOn')!='2026-10-10':
    fail('Research publication date conflated with current technical release date')

# Search metadata should remain concise without compromising decorative-image accessibility.
for lang in LANGS:
    title=translations[lang].get('metaTitle','')
    if not (28 <= len(title) <= 60):
        fail('Home-page SEO title out of range: '+lang)
explorer_html=(ROOT/'explorer'/'index.html').read_text(encoding='utf-8')
explorer_meta=re.search(r'<meta name="description" content="([^"]+)"', explorer_html)
if not explorer_meta or not (90 <= len(explorer_meta.group(1)) <= 160):
    fail('Explorer SEO description length out of range')
if source_html.count('<img alt="" src="assets/logo-mark.png"/>') != 2:
    fail('Decorative logo images must keep empty alt text and adjacent readable site name')

# Navigation regression: How it works is a disclosure like the other grouped menus.
if '<div class="navMenu" data-label-key="tabHow">' not in source_html or 'id="navHowDropdown"' not in source_html:
    fail('How it works is not a disclosure menu')
how_anchors=['how','how-part-1','how-part-3','how-part-5','how-part-8','how-part-10']
for anchor in how_anchors:
    if f'data-target="how" data-anchor="{anchor}"' not in source_html:
        fail('Missing How chapter target '+anchor)
for lang in LANGS:
    page=(ROOT/lang/'index.html').read_text(encoding='utf-8')
    if page.count('data-target="how" data-anchor=')!=len(how_anchors):
        fail('How dropdown does not preserve six chapter choices: '+lang)
    if 'id="navHowDropdown"' not in page:
        fail('Missing How disclosure in rendered locale: '+lang)
    if 'class="sectionToc"' in page.split('id="how"')[1].split('id="beyond"')[0]:
        fail('Redundant How in-section navigation restored: '+lang)

# Public names are not the same as immutable route identifiers.
public_names={'en':('Timeline','Field Notes'),'it':('Cronologia','Note dal campo'),'de':('Chronologie','Beobachtungen'),'fr':('Chronologie','Carnet de terrain')}
from html import escape as escape_public_name
for locale,(timeline_label,notes_label) in public_names.items():
    dic=translations[locale]
    if (dic.get('insideNav'),dic.get('insideTitle'),dic.get('behindNav'),dic.get('behindTitle'))!=(timeline_label,timeline_label,notes_label,notes_label):
        fail('2026 Timeline/Field Notes naming differs across layers: '+locale)
    homepage=(ROOT/locale/'index.html').read_text(encoding='utf-8')
    timeline=(ROOT/'inside-the-round'/locale/'index.html').read_text(encoding='utf-8')
    notes=(ROOT/'behind-the-round'/locale/'index.html').read_text(encoding='utf-8')
    if f'data-i18n="insideNav">{escape_public_name(timeline_label)}<' not in homepage or f'data-i18n="behindNav">{escape_public_name(notes_label)}<' not in homepage:
        fail('2026 navigation contains obsolete public labels: '+locale)
    if f'<h1>{escape_public_name(timeline_label)}</h1>' not in timeline or f'<h1>{escape_public_name(notes_label)}</h1>' not in notes:
        fail('Standalone page title mismatches navigation: '+locale)
    if f'<title>{escape_public_name(dic["insideMetaTitle"])}</title>' not in timeline or f'<title>{escape_public_name(dic["behindMetaTitle"])}</title>' not in notes:
        fail('SEO title differs from four-language naming: '+locale)
    for old_slug in ['inside-the-round','behind-the-round']:
        if site_base+old_slug+'/'+locale+'/' not in sitemap_locs:
            fail('Canonical URL removed after label-only rename: '+locale+'/'+old_slug)
if 'Field Notes' not in working_md or 'Timeline' not in working_md or 'Field Notes' not in working_html or 'Timeline' not in working_html:
    fail('Working paper was not aligned with current section names')

print(f'RELEASE CHECK PASS · v{version} · 1,849 Explorer records · 7,679 life-history events · 4 languages')
