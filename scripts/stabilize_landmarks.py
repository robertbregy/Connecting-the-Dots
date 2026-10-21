"""Synchronize accessible headings directly with the existing navigation router."""
from pathlib import Path
root=Path(__file__).resolve().parents[1]
p=root/'assets/reader-journeys.js';text=p.read_text()
marker='/* Reader landmarks and native fallback, reviewed 2026-10-21. */'
assert marker in text
text=text[:text.index(marker)]+marker+r'''
(function(){
 window.CTD_UPDATE_READING_LANDMARK=function(id){
  const section=document.getElementById(id),main=document.getElementById('main-content');
  if(!section||!main)return;
  const heading=id==='overview'?document.querySelector('.hero h1'):(section.querySelector('h1')||section.querySelector('.readerChapterTitle')||section.querySelector('h2'));
  if(!heading)return;
  if(!heading.id)heading.id='reader-active-title-'+id;
  if(heading.tagName!=='H1'){heading.setAttribute('role','heading');heading.setAttribute('aria-level','1');}
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
p=root/'assets/app.js';text=p.read_text()
a="if(id==='geography'&&window.CTD_LOAD_WORLD)window.CTD_LOAD_WORLD()}"
b="if(id==='geography'&&window.CTD_LOAD_WORLD)window.CTD_LOAD_WORLD();window.CTD_UPDATE_READING_LANDMARK?.(id)}"
if a in text:
 assert text.count(a)==1;text=text.replace(a,b,1)
else: assert b in text
p.write_text(text)
p=root/'scripts/audit_reader_journeys.cjs';text=p.read_text()
a="const issue={lang,width,message:String(e),stack:e.stack};"
b="const issue={lang,width,message:String(e),stack:e.stack,landmarks:await page.evaluate(()=>({active:document.body.dataset.activeTab,label:document.getElementById('main-content')?.getAttribute('aria-labelledby'),headings:[...document.querySelectorAll('.section.active h1,.section.active [aria-level]')].map(n=>n.outerHTML.slice(0,500))}))};"
if a in text:text=text.replace(a,b,1)
p.write_text(text)
print('READER_LANDMARK_ROUTER_CONNECTED')
