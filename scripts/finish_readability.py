"""Finish the bounded reader migration and strengthen its regression evidence."""
from pathlib import Path
import json
ROOT = Path(__file__).resolve().parents[1]
def read(f): return (ROOT/f).read_text(encoding='utf-8')
def write(f,s): (ROOT/f).write_text(s,encoding='utf-8')
def patch(f,a,b):
    s=read(f)
    if b in s and a not in s: return
    if s.count(a)!=1: raise ValueError('Expected one patch in '+f+': '+a[:70])
    write(f,s.replace(a,b,1))
def save(f,v): write(f,json.dumps(v,ensure_ascii=False,indent=2)+'\n')
# A publication date is not a new observation date for the preserved source data.
p=json.loads(read('publication.json'))
assert p['version']=='0.7.92'
p.update(releasedOn='2026-10-21',editorialReviewPath='docs/editorial-review-2026-10-21-v0.7.92.json')
save('publication.json',p)
h=json.loads(read('data/release_history.json')); assert h['releases'][0]['version']=='0.7.92'
h['releases'][0]['date']='2026-10-21';save('data/release_history.json',h)
c=json.loads(read('data/reader_journeys.json'));c['reviewedOn']='2026-10-21'
for lang,text in {
 'it':'Registro, registrar, root: trova le definizioni e le distinzioni essenziali prima di proseguire.',
 'en':'Registry, registrar, DNS root: find the definitions and the distinctions that matter.',
 'de':'Registry, Registrar, DNS-Root: die wichtigsten Begriffe und Unterschiede nachschlagen.',
 'fr':'Registre, bureau d\u2019enregistrement, racine DNS : retrouvez les d\u00e9finitions et les distinctions essentielles.'
}.items(): c['locales'][lang]['ui']['glossary']=text
save('data/reader_journeys.json',c)
patch('scripts/reorder_reader_journeys.cjs',
 "desc.textContent=L.hooks[dest];", "desc.textContent=card.getAttribute('data-open-anchor')==='how-glossary'?U.glossary:L.hooks[dest];")
# The no-script document retains its native heading outline. The enhanced
# single-page view gets a single active level-one heading and a direct skip link.
js=read('assets/reader-journeys.js')
marker='/* Reader landmarks and native fallback, reviewed 2026-10-21. */'
if marker not in js:
 js+='\n'+marker+r'''
(function(){
 let previousTitle=null,previousAttributes=null;
 function updateLandmark(){
  const id=document.body.dataset.activeTab||'overview';
  const sec=document.getElementById(id),main=document.getElementById('main-content');
  if(!sec||!main)return;
  const heading=id==='overview'?document.querySelector('.hero h1'):sec.querySelector('.readerChapterTitle,h1,h2');
  if(!heading)return;
  if(previousTitle&&previousTitle!==heading){
   for(const [key,value] of Object.entries(previousAttributes))
    if(value===null)previousTitle.removeAttribute(key);else previousTitle.setAttribute(key,value);
  }
  if(previousTitle!==heading){
   previousAttributes={role:heading.getAttribute('role'),'aria-level':heading.getAttribute('aria-level')};
   previousTitle=heading;
  }
  if(!heading.id)heading.id='reader-active-title-'+id;
  if(heading.tagName!=='H1'){heading.setAttribute('role','heading');heading.setAttribute('aria-level','1');}
  heading.setAttribute('tabindex','-1');main.setAttribute('aria-labelledby',heading.id);
  const skip=document.querySelector('.skipLink');if(skip)skip.setAttribute('href','#'+heading.id);
 }
 function initLandmarks(){
  updateLandmark();
  new MutationObserver(updateLandmark).observe(document.body,{attributes:true,attributeFilter:['data-active-tab']});
  const directory=document.getElementById('reader-directory');
  function restoreDirectory(){
   if(!directory||!['#reader-directory','#reader-search'].includes(location.hash))return;
   directory.open=true;document.getElementById('reader-search')?.focus();
  }
  window.addEventListener('hashchange',restoreDirectory);
  window.addEventListener('popstate',restoreDirectory);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initLandmarks,{once:true});else initLandmarks();
})();
'''
 write('assets/reader-journeys.js',js)
css=read('assets/reader-journeys.css')
if 'Native long-document jumps' not in css:
 css+='\n/* Native long-document jumps must not animate through unrelated chapters. */\nhtml.no-js{scroll-behavior:auto!important}\n.readerChapterTitle:focus-visible,[id^="reader-active-title-"]:focus-visible{outline:3px solid var(--accent-text);outline-offset:6px}\n'
 write('assets/reader-journeys.css',css)
# Test actual readiness and visible heading, not merely the URL changing.
audit='scripts/audit_reader_journeys.cjs'
patch(audit,"for(const id of ['how','social','reveal','research','geography','disputes','resources']){", "for(const id of Object.keys(config.related)){")
patch(audit,"automatedAccessibilityChapters:7", "automatedAccessibilityChapters:Object.keys(config.related).length")
patch(audit,"assert.ok(await page.locator('#'+id+' > .readerBreadcrumb').isVisible(),id+' breadcrumb missing');", "assert.ok(await page.locator('#'+id+' > .readerBreadcrumb').isVisible(),id+' breadcrumb missing');\n   await page.waitForFunction(()=>document.querySelector('#main-content[aria-labelledby]'));\n   assert.equal(await page.getByRole('heading',{level:1}).count(),1,id+' needs one active level-one heading');\n   assert.equal(await page.locator('.skipLink').getAttribute('href'),'#'+await page.locator('#main-content').getAttribute('aria-labelledby'),id+' skip-link destination');")
s=read(audit)
if '// READER_NATIVE_NAVIGATION_FINAL' not in s:
 start=s.index('const nojs=');end=s.index('const reflow=',start)
 s=s[:start]+r'''// READER_NATIVE_NAVIGATION_FINAL
report.noJavaScript=[];
for(const lang of langs){
 const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:950},reducedMotion:'reduce'});
 const staticPage=await nojs.newPage();
 try{
  await staticPage.goto(base+lang+'/',{waitUntil:'load'});
  await staticPage.locator('#reader-directory > summary').click();
  assert.equal(await staticPage.locator('#reader-topic-list a:visible').count(),75);
  assert.ok(await staticPage.locator('#reader-topic-list a').evaluateAll(nodes=>nodes.every(n=>new URL(n.href).hash.length>1)),'Directory links need native anchors');
  await staticPage.locator('#reader-topic-list a[data-open-section="how"]').first().click();
  await staticPage.waitForURL('**#how',{waitUntil:'load'});
  await staticPage.waitForFunction(()=>{
   const n=document.querySelector('#how .readerChapterTitle');if(!n)return false;
   const r=n.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight;
  },null,{timeout:10000});
  assert.equal(await staticPage.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false,'No-script page reflow');
  report.noJavaScript.push({lang,chapterJump:true,directoryLinks:75});
 }catch(e){
  const geometry=await staticPage.evaluate(()=>({url:location.href,scrollY,chapter:document.getElementById('how')?.getBoundingClientRect().toJSON(),heading:document.querySelector('#how .readerChapterTitle')?.getBoundingClientRect().toJSON()})).catch(()=>null);
  report.issues.push({lang,mode:'no-javascript',message:String(e),geometry});
  await staticPage.screenshot({path:path.join(out,lang+'-nojs-failure.png')}).catch(()=>{});
 }finally{await nojs.close();}
}
report.noJavaScriptDirectory=report.noJavaScript.length===langs.length;
report.noJavaScriptChapterJump=report.noJavaScriptDirectory;
''' + s[end:]
 write(audit,s)
patch('scripts/prepare_reader_site.py','def navigation_checks():',"def navigation_checks():\n    if 'READER_NATIVE_NAVIGATION_FINAL' in read('scripts/audit_reader_journeys.cjs'): return")
patch('scripts/prepare_reader_site.py',"r.update(reviewId='reader-journeys-2026-10-20-v'+NEW,publicationVersion=NEW,parentReview=PARENT,priorTechnicalBaseline=", "r.update(reviewId='reader-journeys-2026-10-21-v'+NEW,reviewedOn=p['releasedOn'],publicationVersion=NEW,parentReview=PARENT,priorTechnicalBaseline=")
change=read('CHANGELOG.md').replace('# v0.7.92 - 20 October 2026','# v0.7.92 - 21 October 2026',1);write('CHANGELOG.md',change)
print('READER_FINAL_REFINEMENTS_READY')
