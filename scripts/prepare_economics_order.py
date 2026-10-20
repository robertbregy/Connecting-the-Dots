"""One-time Economics migration. Never moves main or rewrites old archives."""
from pathlib import Path
import hashlib,json,subprocess,sys
ROOT=Path(__file__).resolve().parents[1]
BASE='ad9cb0de2e5f8c0ea9771509f003e4f3011ddcc1'
OLD='0.7.90'
NEW='0.7.91'
PARENT='docs/editorial-review-2026-10-20-v0.7.90.json'
def read(p):return (ROOT/p).read_text(encoding='utf-8')
def write(p,s):(ROOT/p).write_text(s,encoding='utf-8')
def save(p,v):write(p,json.dumps(v,ensure_ascii=False,indent=2)+'\n')
def digest(p):return hashlib.sha256((ROOT/p).read_bytes()).hexdigest()
def patch(p,a,b):
 s=read(p)
 if s.count(a)!=1:raise ValueError('Expected one patch marker in '+p+': '+a[:80])
 write(p,s.replace(a,b,1))
def prepare():
 p=json.loads(read('publication.json'))
 if p['version']!=OLD:raise ValueError('Unexpected source version')
 for f in ['build.py','assets/app.js','assets/audience.css','data/translations.json','scripts/audit_20261018_browser.cjs']:
  if subprocess.check_output(['git','show',BASE+':'+f],cwd=ROOT)!=(ROOT/f).read_bytes():raise ValueError('Source changed since review: '+f)
 p.update(version=NEW,currentDataPackVersion=NEW,currentDataPackPath='downloads/connecting-the-dots-data-pack-v'+NEW+'.zip',editorialReviewPath='docs/editorial-review-2026-10-20-v'+NEW+'.json')
 save('publication.json',p)
 for f in ['package.json','package-lock.json']:
  v=json.loads(read(f));v['version']=NEW
  if f=='package-lock.json':v['packages']['']['version']=NEW
  save(f,v)
 frozen=json.loads(read('data/frozen_technical_packages.json'));archive='downloads/connecting-the-dots-data-pack-v'+OLD+'.zip'
 frozen['files'][archive]=digest(archive);save('data/frozen_technical_packages.json',frozen)
 history=json.loads(read('data/release_history.json'));entry=dict(history['releases'][0]);entry.update(version=NEW,summaryKey='release0791');history['releases'].insert(0,entry);save('data/release_history.json',history)
 config=json.loads(read('data/economics_reading_order.json'));t=json.loads(read('data/translations.json'))
 for lang,L in config['locales'].items():t[lang]['release0791']=L['release']
 save('data/translations.json',t)
 marker='    subprocess.run(["node", str(ROOT / "scripts" / "reconcile_audience.cjs")], check=True)'
 patch('build.py',marker,marker+'\n    subprocess.run(["node", str(ROOT / "scripts" / "reorder_economics.cjs")], check=True)')
 marker='    subprocess.run(["node", str(ROOT / "scripts" / "validate_quick_guide.cjs")], check=True)'
 patch('build.py',marker,marker+'\n    subprocess.run(["node", str(ROOT / "scripts" / "validate_economics_order.cjs")], check=True)')
 patch('build.py','DATA / "audience_editorial.json",','DATA / "audience_editorial.json", DATA / "economics_reading_order.json",')
 patch('assets/app.js',"const headings=[...sec.querySelectorAll('h2')].filter(h=>h.textContent.trim());","const stagedEconomics=id==='economics'&&sec.dataset.economicsReadingOrder==='six-step-v1';if(stagedEconomics){for(const h of sec.querySelectorAll('#economicModels h3,#economicGrid h3')){const next=document.createElement('h4');for(const a of h.attributes)next.setAttribute(a.name,a.value);while(h.firstChild)next.append(h.firstChild);h.replaceWith(next)}}const headings=[...sec.querySelectorAll(stagedEconomics?'[data-economics-stage-title]':'h2')].filter(h=>h.textContent.trim());")
 patch('assets/app.js',"b.textContent=(key?t(key):headingLabel(h)).slice(0,120);","b.textContent=(h.dataset.economicsNavLabel||(key?t(key):headingLabel(h))).slice(0,120);")
 patch('assets/app.js','sec.prepend(nav)}}',"if(stagedEconomics)sec.querySelector('#economics-reading-guide').after(nav);else sec.prepend(nav)}}")
 write('assets/audience.css',read('assets/audience.css')+'''
/* Economics: six native reading steps, with stable deep links. */
.economicsReadingGuide{color:var(--muted);line-height:1.65;margin:14px 0}
.economicsChapter{margin:30px 0;min-width:0}
.economicsStageTitle{font-size:clamp(22px,3vw,28px);line-height:1.3;margin:0 0 10px;overflow-wrap:anywhere}
.economicsStageLead{line-height:1.7;max-width:78ch;color:var(--muted);margin:0 0 18px}
.economicsChapter .economicsSubheading{font-size:20px;line-height:1.4}
.economicsChapter .economicGrid h4,.economicsChapter .economicModels h4{font-size:17px;line-height:1.5;margin:10px 0}
.economicsSupporting{margin:18px 0;padding:16px;border:1px solid var(--border);border-radius:12px;min-width:0}
.economicsSupporting>summary{font-weight:650;line-height:1.5;cursor:pointer}
.economicsSupporting>.panel{margin:16px 0 0}
#economics .sectionToc{position:static}
#economics .sectionToc a{white-space:normal;line-height:1.5}
.economicsChapter a:focus-visible,.economicsSupporting>summary:focus-visible{outline:2px solid var(--accent-text);outline-offset:4px}
@media(max-width:600px){.economicsChapter{margin:24px 0}.economicsSupporting{padding:12px}.economicsStageTitle{font-size:23px}}
''')
 patch('scripts/audit_20261018_browser.cjs',"page.locator('#economy-sectors h2').first()","page.locator('#economy-sectors [data-i18n=\"sectorEconomyTitle\"]').first()")
 patch('scripts/audit_20261018_browser.cjs',"page.locator('#economics .sectionToc a[href$=\"#'+headingId+'\"]')","page.locator('#economics-historical-link')")
 patch('.github/workflows/rebuild.yml',"      - 'data/audience_editorial.json'","      - 'data/audience_editorial.json'\n      - 'data/economics_reading_order.json'")
 patch('.github/workflows/audit-browser.yml','        run: node scripts/audit_20261018_browser.cjs','        run: node scripts/audit_20261018_browser.cjs\n      - name: Verify six-step Economics navigation and preservation\n        env:\n          CTD_TEST_BASE: http://127.0.0.1:8123/\n        run: node scripts/audit_economics_order.cjs')
 write('CHANGELOG.md','# v0.7.91 - 20 October 2026\n\n- Reordered Economics into value, reach, cases, concentration, cycles and the 2026 analysis.\n- Preserved fourteen original blocks, eight models, eight cases, sources and legacy fragments.\n- Six-step table of contents and proper subheading hierarchy in four languages.\n- Historical comparisons remain labelled; the cemetery stays independent. No research dataset or archived release is changed.\n\n'+read('CHANGELOG.md'))
 s=read('README.md').replace('# Connecting the Dots — v0.7.84','# Connecting the Dots — v0.7.91',1)
 s=s.replace('## Current release\n','## Current release\n\n**v0.7.91 · 20 October 2026**\n\nEconomics follows six steps: value, reach, cases, concentration, cycles and the 2026 analysis. All evidence, data and legacy links remain available; this is not a new research release.\n\n## Earlier releases\n',1);write('README.md',s)
 write('docs/ECONOMICS_READING_ORDER_2026-10-20.md','# Economics reading order\n\nTechnical release v0.7.91. Approved six-step path: value, reach, cases, concentration, cycles, 2026.\n\nAll fourteen original blocks are retained. Fee history and secondary portfolio evidence use native disclosures. The earlier mixed economic reconstruction stays explicitly historical. The brand/identity note moves to the final 2026 analysis. The cemetery remains independent.\n\nExisting heading IDs remain stable despite their new hierarchy. Browser tests cover old fragments, language switching, history, keyboard access, rankings and accessibility. No new measurement or classification is introduced.\n')
 print('ECONOMICS_SOURCE_MIGRATION_READY')
def finalize():
 p=json.loads(read('publication.json'));assert p['version']==NEW
 r=json.loads(read(PARENT));r.update(reviewId='economics-reading-order-2026-10-20-v'+NEW,publicationVersion=NEW,parentReview=PARENT,priorTechnicalBaseline=BASE)
 r['rationales']['E09']='Approved six-step Economics order; preserve source facts, all original text, eight models/cases, legacy anchors, archived research and previous ZIPs. Current publication metadata follows v0.7.91.'
 for v in r['linkReplacements']:v['publishedPath']=p['currentDataPackPath'].replace('.zip','.sha256') if 'CHECKSUM' in v['to'] else p['currentDataPackPath']
 expected={'build.py','assets/app.js','assets/audience.css','data/translations.json','data/release_history.json','data/frozen_technical_packages.json','publication.json','package.json','package-lock.json','scripts/audit_20261018_browser.cjs','.github/workflows/rebuild.yml','.github/workflows/audit-browser.yml','CHANGELOG.md','README.md','research/connecting-the-dots-working-paper-v1.html'}
 changed=[]
 for f,item in r['files'].items():
  current=digest(f)
  if current!=item['sha256']:
   if f not in expected:
    old=subprocess.check_output(['git','show',BASE+':'+f],cwd=ROOT).decode('utf-8')
    if old.replace(OLD,NEW)!=read(f):raise ValueError('Unreviewed non-metadata delta: '+f)
   item['sha256']=current;item['rationaleIds']=list(dict.fromkeys(item['rationaleIds']+['E09']));changed.append(f)
 for f in ['scripts/reorder_economics.cjs','scripts/validate_economics_order.cjs','scripts/audit_economics_order.cjs','data/economics_reading_order.json','docs/ECONOMICS_READING_ORDER_2026-10-20.md','README.md']:
  r['files'][f]={'sha256':digest(f),'baselineSHA256':None,'rationaleIds':['E09']}
 r['verification']={'scope':'Four-language six-step order, original text and source links preserved; browser tests and exact live-byte check recorded separately.','humanParticipants':0,'archivedResearch':'RR1/RR2 unchanged; fifteen prior technical ZIPs protected','priorReviewSha256':digest(PARENT)}
 save(p['editorialReviewPath'],r)
 # Original scientific inputs remain byte-identical to the published baseline.
 for f in subprocess.check_output(['git','ls-tree','-r','--name-only',BASE,'data'],cwd=ROOT,text=True).splitlines():
  if f.endswith('.csv') and subprocess.check_output(['git','show',BASE+':'+f],cwd=ROOT)!=(ROOT/f).read_bytes():raise ValueError('Scientific CSV changed: '+f)
 print('ECONOMICS_REVIEW_READY',json.dumps(changed))
if __name__=='__main__':
 if len(sys.argv)>1 and sys.argv[1]=='finalize':finalize()
 else:prepare()
