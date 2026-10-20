/* Local topic directory and stable chapter navigation. No remote calls or storage. */
'use strict';
window.CTD_REFRESH_READING=function(section){
 for(const box of section.querySelectorAll('#socialModels,#socialGrid,#disputeGrid,#refusalCases')){
  for(const old of [...box.querySelectorAll('h3')]){const n=document.createElement('h4');for(const a of old.attributes)n.setAttribute(a.name,a.value);while(old.firstChild)n.append(old.firstChild);old.replaceWith(n);}
 }
};
(function(){
 function init(){
  document.querySelectorAll('[data-reader-order]').forEach(window.CTD_REFRESH_READING);
  const directory=document.getElementById('reader-directory'),input=document.getElementById('reader-search');if(!directory||!input)return;
  const rows=[...directory.querySelectorAll('[data-reader-topic]')],status=document.getElementById('reader-search-status'),empty=document.getElementById('reader-no-results');
  const norm=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase().trim();
  // Index existing local prose once. Exclude onward links so another chapter's
  // description cannot cause a false match. Subsection results use their own text.
  const texts=new Map();
  function content(row){
   const link=row.querySelector('a[data-open-section]'),anchor=link?.dataset.openAnchor,id=link?.dataset.openSection;
   const key=anchor||id;if(texts.has(key))return texts.get(key);
   const target=anchor?document.getElementById(anchor)?.closest('.readerStage,.economicsChapter'):document.getElementById(id);
   const text=target?[...target.children].filter(n=>!n.matches('nav,.readerNext')).map(n=>n.textContent).join(' '):'';
   const value=norm(text);texts.set(key,value);return value;
  }
  const corpus=rows.map(row=>({row,text:norm(row.dataset.readerSearchText)+' '+content(row),detail:row.hasAttribute('data-reader-detail')}));
  function filter(){const words=norm(input.value).split(/\s+/).filter(Boolean);let count=0;for(const item of corpus){const show=(!item.detail||words.length>0)&&words.every(w=>item.text.includes(w));item.row.hidden=!show;if(show)count++;}empty.hidden=count>0;status.textContent=count+' '+directory.dataset.resultsWord;}
  directory.querySelector('.readerSearchControls').hidden=false;
  input.addEventListener('input',filter);
  document.getElementById('reader-search-clear').addEventListener('click',()=>{input.value='';filter();input.focus();});
  directory.addEventListener('keydown',event=>{if(event.key==='Escape'){directory.open=false;directory.querySelector('summary').focus();}});
  directory.addEventListener('click',event=>{const link=event.target.closest('a[data-open-section]');if(!link||event.ctrlKey||event.metaKey||event.altKey||event.shiftKey)return;directory.open=false;});
  filter();
  if(location.hash==='#reader-search'){directory.open=true;input.focus();}
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
