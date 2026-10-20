"""Bounded source migration to v0.7.92, with immutable evidence and reviewed deltas."""
from pathlib import Path
import json,hashlib,subprocess,sys
ROOT=Path(__file__).resolve().parents[1]
OLD='0.7.91';NEW='0.7.92'
PARENT='docs/editorial-review-2026-10-20-v0.7.91.json'
def read(f):return (ROOT/f).read_text(encoding='utf-8')
def write(f,s):(ROOT/f).write_text(s,encoding='utf-8')
def save(f,v):write(f,json.dumps(v,ensure_ascii=False,indent=2)+'\n')
def sha(f):return hashlib.sha256((ROOT/f).read_bytes()).hexdigest()
def patch(f,a,b):
 s=read(f)
 if a not in s and b in s:return
 if s.count(a)!=1:raise ValueError('Patch not unique: '+f+' '+a[:70])
 write(f,s.replace(a,b,1))
def navigation_checks():
 # Before this migration How had no local TOC. Its five new steps are deliberate,
 # not duplicate legacy pills. Validate their exact count rather than inspecting a DOM object.
 patch('scripts/validate_multilingual.js',"assert.equal(document.querySelector('#how > .sectionToc'),null,page+' redundant How subnavigation boxes');","assert.equal(document.querySelectorAll('#how > .sectionToc a').length,document.getElementById('how').hasAttribute('data-reader-order')?5:0,page+' reviewed How navigation count');")
 patch('scripts/validate_delivery.js',"assert.equal(b.document.querySelector('#how > .sectionToc'),null,language+' no duplicate How pills');","assert.equal(b.document.querySelectorAll('#how > .sectionToc a').length,b.document.getElementById('how').hasAttribute('data-reader-order')?5:0,language+' reviewed How navigation count');")
 patch('scripts/audit_20261018_browser.cjs',"page.locator('#resources .resourceGroup > h3')","page.locator('#resources .resourceGroup > :is(h3,h4)')")
def prepare():
 p=json.loads(read('publication.json'));assert p['version']==OLD,'Unexpected baseline'
 preserved={str(f.relative_to(ROOT)):sha(str(f.relative_to(ROOT))) for f in (ROOT/'data').glob('*.csv')}
 preserved.update({str(f.relative_to(ROOT)):sha(str(f.relative_to(ROOT))) for f in (ROOT/'downloads').glob('*.zip')})
 save('docs/reader-preserved-inputs-20261020.json',preserved)
 p.update(version=NEW,currentDataPackVersion=NEW,currentDataPackPath='downloads/connecting-the-dots-data-pack-v'+NEW+'.zip',editorialReviewPath='docs/editorial-review-2026-10-20-v'+NEW+'.json');save('publication.json',p)
 for f in ['package.json','package-lock.json']:
  v=json.loads(read(f));v['version']=NEW
  if f=='package-lock.json':v['packages']['']['version']=NEW
  save(f,v)
 frozen=json.loads(read('data/frozen_technical_packages.json'));archive='downloads/connecting-the-dots-data-pack-v'+OLD+'.zip';frozen['files'][archive]=sha(archive);save('data/frozen_technical_packages.json',frozen)
 config=json.loads(read('data/reader_journeys.json'));t=json.loads(read('data/translations.json'))
 for lang in config['locales']:t[lang]['release0792']=config['locales'][lang]['ui']['release']
 save('data/translations.json',t)
 history=json.loads(read('data/release_history.json'));entry=dict(history['releases'][0]);entry.update(version=NEW,summaryKey='release0792');history['releases'].insert(0,entry);save('data/release_history.json',history)
 marker='    subprocess.run(["node", str(ROOT / "scripts" / "reorder_economics.cjs")], check=True)'
 patch('build.py',marker,marker+'\n    subprocess.run(["node", str(ROOT / "scripts" / "reorder_reader_journeys.cjs")], check=True)')
 marker='    subprocess.run(["node", str(ROOT / "scripts" / "validate_economics_order.cjs")], check=True)'
 patch('build.py',marker,marker+'\n    subprocess.run(["node", str(ROOT / "scripts" / "validate_reader_journeys.cjs")], check=True)')
 patch('build.py','DATA / "economics_reading_order.json",','DATA / "economics_reading_order.json", DATA / "reader_journeys.json",')
 patch('assets/app.js',"if(!sec)continue;sec.querySelector(':scope > .sectionToc')?.remove();","if(!sec)continue;if(sec.dataset.readerOrder){window.CTD_REFRESH_READING?.(sec);continue;}sec.querySelector(':scope > .sectionToc')?.remove();")
 patch('scripts/validate_audit_20261018.cjs',"one(node,':scope > h3')","one(node,document.getElementById('resources').hasAttribute('data-reader-order')?':scope > h4':':scope > h3')")
 navigation_checks()
 write('CHANGELOG.md','# v0.7.92 - 20 October 2026\n\n- Reordered 14 chapters, preserving evidence and stable anchors.\n- Added local topic search, chapter breadcrumbs and contextual next reading to 23 chapters in four languages.\n- Kept the six global pathways, the Economics sequence and all prior archives.\n- Standalone pages keep shared navigation and link to the topic directory.\n- Corrected the research citation guide label to follow the actual publication version.\n- Automated checks are not a substitute for observed reader studies or full accessibility certification.\n\n'+read('CHANGELOG.md'))
 write('docs/READER_JOURNEYS_2026-10-20.md','# Reader-first architecture\n\nThis technical release applies an approved reader-first sequence to fourteen chapters and adds orientation and contextual onward paths to all twenty-three substantive chapters in four languages. The six global areas and all stable URLs remain intact.\n\nContent is ordered by conceptual dependency, not insertion date. Long chapters receive three to five steps; Economics retains its existing six. Short tools, chronological event lists and coherent case studies are not forced into that template.\n\nReaders share one evidence base. New visitors can follow questions and cases; researchers can go directly to datasets, source methodology and citation objects. Topic search is an entirely local directory, separate from the TLD Explorer. It has a keyboard-accessible native disclosure, labelled search, result feedback, reset and a no-result route to Explorer. Without JavaScript all directory links remain available.\n\nEvery original evidence text segment, source destination and fragment is compared before and after transformation. Navigation-only descriptions may be rewritten; one stale citation version label is corrected explicitly. All source CSVs and existing ZIPs are SHA-256 checked. No classification, legal statement, empirical claim or archived research DOI is changed.\n\nReference criteria: W3C WCAG 2.2, consistent navigation, keyboard access, focus visibility, reflow, and target sizing. Automated tests and simulated task paths are reported as such; no reader engagement improvement or human validation is claimed without observations.\n\nSources: https://www.w3.org/WAI/WCAG22/Understanding/consistent-navigation.html and https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html\n')
 print('READER_SOURCE_MIGRATION_READY')
def finalize():
 p=json.loads(read('publication.json'));assert p['version']==NEW
 for f,digest in json.loads(read('docs/reader-preserved-inputs-20261020.json')).items():assert sha(f)==digest,'Evidence changed: '+f
 r=json.loads(read(PARENT));r.update(reviewId='reader-journeys-2026-10-20-v'+NEW,publicationVersion=NEW,parentReview=PARENT,priorTechnicalBaseline='639617f5b79cf5524825ab7093f4c7bb722d1d42')
 r['rationales']['R01']='Approved reader-first chapter order, local topic directory, breadcrumbs, contextual onward navigation and accurate citation-version label. All original evidence text, links, anchors, source CSVs and prior archives remain preserved; zero human-study outcomes claimed.'
 for v in r['linkReplacements']:v['publishedPath']=p['currentDataPackPath'].replace('.zip','.sha256') if 'CHECKSUM' in v['to'] else p['currentDataPackPath']
 allowed={'scripts/validate_multilingual.js','scripts/validate_delivery.js','scripts/validate_audit_20261018.cjs','scripts/audit_20261018_browser.cjs','assets/app.js','build.py','data/translations.json','data/release_history.json','data/frozen_technical_packages.json','publication.json','package.json','package-lock.json','CHANGELOG.md','.github/workflows/rebuild.yml','.github/workflows/audit-browser.yml','data/publication.js','data/manifest.json','research/README.md','research/research_release_manifest.json','research/connecting-the-dots-working-paper-v1.md'}
 changed=[]
 for f,item in r['files'].items():
  digest=sha(f)
  if digest!=item['sha256']:
   assert f in allowed or f.endswith('.html'),'Unexpected reviewed-file change: '+f
   item['sha256']=digest;item['rationaleIds']=list(dict.fromkeys(item['rationaleIds']+['R01']));changed.append(f)
 for f in ['scripts/reorder_reader_journeys.cjs','scripts/validate_reader_journeys.cjs','scripts/audit_reader_journeys.cjs','assets/reader-journeys.js','assets/reader-journeys.css','data/reader_journeys.json','docs/READER_JOURNEYS_2026-10-20.md','docs/reader-preserved-inputs-20261020.json']:
  r['files'][f]={'sha256':sha(f),'baselineSHA256':None,'rationaleIds':['R01']}
 r['verification']={'scope':'Reader-first order, original text and source links retained; automated browser tests and live delivery recorded separately.','humanParticipants':0,'archivedResearch':'RR1/RR2 and previous technical packages unchanged','priorReviewSha256':sha(PARENT)}
 save(p['editorialReviewPath'],r);print('READER_REVIEW_FINALIZED',json.dumps(changed))
if __name__=='__main__':
 if len(sys.argv)>1 and sys.argv[1]=='finalize':finalize()
 elif len(sys.argv)>1 and sys.argv[1]=='navigation-checks':navigation_checks()
 else:prepare()
