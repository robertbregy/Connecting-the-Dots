/* Optional navigation enhancement. All links and evidence exist in HTML. */
(function(){
 'use strict';
 const index=document.getElementById('reader-index');
 const labelNode=document.getElementById('reader-navigation-labels');
 if(!index||!labelNode)return;
 let labels;try{labels=JSON.parse(labelNode.textContent)}catch{return}
 // Keep outlines collapsed until requested: no layout shift above a deep link.
 function sync(){
  const active=document.body.dataset.activeTab||'overview';
  const section=document.getElementById(active);
  document.title=(active!=='overview'&&section?.dataset.readerTitle?section.dataset.readerTitle+' | ':'')+labels.siteTitle;
  document.querySelector('.readerIntents')?.setAttribute('aria-label',labels.homeTitle);
 }
 new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['data-active-tab']});
 function openIndex(){
  index.open=true;const target=index.querySelector('summary');target.focus({preventScroll:true});
  const sticky=[document.querySelector('.topbar'),document.querySelector('.iaPrimaryNav')].reduce((height,n)=>height+(n? n.getBoundingClientRect().height:0),24);
  window.scrollTo({top:Math.max(0,window.scrollY+index.getBoundingClientRect().top-sticky),behavior:'auto'});
 }
 document.querySelectorAll('.readerIndexTrigger').forEach(a=>a.addEventListener('click',event=>{
  if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||event.button!==0)return;
  event.preventDefault();openIndex();
 }));
 // Collapse the sitemap after a chapter is selected, without discarding focus.
 index.addEventListener('click',event=>{if(event.target.closest('[data-open-section]'))requestAnimationFrame(()=>{index.open=false;});});
 if(location.hash==='#reader-index')openIndex();
 sync();window.CTD_READER_READY=true;
})();
