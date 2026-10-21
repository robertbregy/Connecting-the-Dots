"""Synchronize native accessible headings with the existing navigation router."""
from pathlib import Path
root=Path(__file__).resolve().parents[1]
def patch(name,a,b):
 p=root/name;s=p.read_text()
 if b in s and a not in s:return
 assert s.count(a)==1, 'Non-unique patch in '+name+': '+a[:80]
 p.write_text(s.replace(a,b,1))
p=root/'assets/reader-journeys.js';text=p.read_text()
marker='/* Reader landmarks and native fallback, reviewed 2026-10-21. */'
assert marker in text
text=text[:text.index(marker)]+marker+r'''
(function(){
 function nativeTitle(section){
  let heading=section.querySelector('h1')||section.querySelector('.readerChapterTitle')||section.querySelector('h2');
  if(!heading)return null;
  if(!heading.id)heading.id='reader-active-title-'+section.id;
  if(heading.tagName!=='H1'){
   const native=document.createElement('h1');
   for(const attribute of heading.attributes)native.setAttribute(attribute.name,attribute.value);
   native.removeAttribute('role');native.removeAttribute('aria-level');
   native.classList.add('readerNativeHeading');
   while(heading.firstChild)native.append(heading.firstChild);
   const focused=document.activeElement===heading;
   heading.replaceWith(native);heading=native;
   if(focused)heading.focus({preventScroll:true});
  }
  heading.setAttribute('tabindex','-1');return heading;
 }
 // This deferred script precedes app.js. Prepare stable elements before the
 // router captures fragment targets, avoiding stale references on first entry.
 document.querySelectorAll('.section[id]').forEach(section=>{
  if(section.id!=='overview')nativeTitle(section);
 });
 window.CTD_UPDATE_READING_LANDMARK=function(id){
  const section=document.getElementById(id),main=document.getElementById('main-content');
  if(!section||!main)return;
  const heading=id==='overview'?document.querySelector('.hero h1'):nativeTitle(section);
  if(!heading)return;
  if(!heading.id)heading.id='reader-active-title-'+id;
  heading.setAttribute('tabindex','-1');main.setAttribute('aria-labelledby',heading.id);
  const skip=document.querySelector('.skipLink');if(skip)skip.setAttribute('href','#'+heading.id);
 };
 function ready(){
  window.CTD_UPDATE_READING_LANDMARK(document.body.dataset.activeTab||'overview');
  function restoreDirectory(){
   if(!['#reader-directory','#reader-search'].includes(location.hash))return;
   const directory=document.getElementById('reader-directory');if(!directory)return;
   directory.open=true;document.getElementById('reader-search')?.focus();
  }
  window.addEventListener('hashchange',restoreDirectory);
  window.addEventListener('popstate',restoreDirectory);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});else ready();
})();
'''
p.write_text(text)
p=root/'assets/reader-journeys.css';text=p.read_text()
if 'Native active heading typography' not in text:
 text+='''\n/* Native active heading typography, independent of document outline. */
.readerNativeHeading:not(.readerChapterTitle){font-size:24px;letter-spacing:-.03em;line-height:1.3;margin:0 0 6px;max-width:none}
.iaHubHead .readerNativeHeading{font-size:clamp(29px,4vw,48px);letter-spacing:-.045em;line-height:1.1;margin:12px 0 15px}
.readerNativeHeading:focus-visible{outline:3px solid var(--accent-text);outline-offset:6px}
@media(max-width:700px){.iaHubHead .readerNativeHeading{font-size:30px}}
'''
p.write_text(text)
patch('assets/app.js',"if(id==='geography'&&window.CTD_LOAD_WORLD)window.CTD_LOAD_WORLD()}","if(id==='geography'&&window.CTD_LOAD_WORLD)window.CTD_LOAD_WORLD();window.CTD_UPDATE_READING_LANDMARK?.(id)}")
patch('scripts/audit_reader_journeys.cjs',"const issue={lang,width,message:String(e),stack:e.stack};","const issue={lang,width,message:String(e),stack:e.stack,landmarks:await page.evaluate(()=>({active:document.body.dataset.activeTab,label:document.getElementById('main-content')?.getAttribute('aria-labelledby'),headings:[...document.querySelectorAll('.section.active h1,.section.active [aria-level]')].map(n=>n.outerHTML.slice(0,500))}))};")
# Check the accessible active page, not hidden chapters in the preserved document.
patch('scripts/deep_audit_20261011.js',"h1:document.querySelectorAll('h1').length,", "h1:[...document.querySelectorAll('h1')].filter(n=>n.getClientRects().length&&getComputedStyle(n).visibility!=='hidden'&&!n.closest('[aria-hidden=\"true\"]')).length,")
patch('scripts/audit_ia_b2.cjs','assert.equal(await page.evaluate(()=>document.activeElement?.tagName),"H2","keyboard focus not moved to new heading");','assert.equal(await page.evaluate(()=>document.activeElement?.tagName),await page.evaluate(()=>window.CTD_UPDATE_READING_LANDMARK?"H1":"H2"),"keyboard focus not moved to active chapter heading");')
patch('scripts/prepare_reader_site.py',"allowed={'scripts/validate_multilingual.js',", "allowed={'README.md','scripts/audit_ia_b2.cjs','scripts/deep_audit_20261011.js','scripts/validate_multilingual.js',")
p=root/'README.md';s=p.read_text()
s=s.replace('# Connecting the Dots — v0.7.91','# Connecting the Dots — v0.7.92',1)
marker='## Current release\n\n**v0.7.91 · 20 October 2026**'
replacement='## Current release\n\n**v0.7.92 · 21 October 2026**\n\nReader-first navigation across 23 chapters, with 14 reorganized reading paths, a local topic directory and consistent onward reading. All source evidence and archived releases remain intact. Accessibility checks cover native headings, keyboard navigation and no-JavaScript reading; they are not a claim of human validation.\n\n### Previous technical release\n\n**v0.7.91 · 20 October 2026**'
if marker in s:s=s.replace(marker,replacement,1)
else:assert replacement in s
p.write_text(s)
print('READER_NATIVE_LANDMARK_ROUTER_CONNECTED')
