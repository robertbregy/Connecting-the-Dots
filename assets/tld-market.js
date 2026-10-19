/* Progressive enhancement: both sourced tables remain readable without JS. */
(()=>{
 'use strict';
 function init(){
  const root=document.getElementById('tld-market-reach');if(!root)return;
  const controls=root.querySelector('.marketViews'),filters=root.querySelector('.marketFilters'),search=document.getElementById('market-search'),origin=document.getElementById('market-origin'),status=document.getElementById('market-result-count');
  const payload=JSON.parse(document.getElementById('rsp-footprint-data').textContent);
  let view='web';
  function restore(){
   const p=new URLSearchParams(location.search);
   view=p.get('market')==='zones'?'zones':'web';search.value=p.get('mq')||'';
   origin.value=[...origin.options].some(o=>o.value===p.get('origin'))?p.get('origin'):'';
   update(false);
  }
  function update(persist=true){
   const needle=search.value.toLocaleLowerCase().trim().replace(/^\./,'');let count=0;
   root.querySelectorAll('[data-market-panel]').forEach(panel=>{
    const active=panel.dataset.marketPanel===view;panel.hidden=!active;
    panel.querySelectorAll('[data-market-tld]').forEach(row=>{row.hidden=!(row.dataset.marketTld.includes(needle)&&(!origin.value||row.dataset.marketCohort===origin.value));if(active&&!row.hidden)count++});
   });
   controls.querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.marketView===view)));
   status.textContent=count+' / 50 · '+payload.results;
   if(persist){
    const url=new URL(location.href);
    for(const [key,value] of [['market',view==='web'?'':view],['origin',origin.value],['mq',search.value.trim()]]){if(value)url.searchParams.set(key,value);else url.searchParams.delete(key)}
    history.replaceState(history.state,'',url);document.dispatchEvent(new Event('ctd:viewchange'));
   }
  }
  controls.querySelectorAll('button').forEach(button=>button.addEventListener('click',()=>{view=button.dataset.marketView;update()}));
  search.addEventListener('input',()=>update());origin.addEventListener('change',()=>update());
  window.addEventListener('popstate',restore);
  controls.hidden=false;filters.hidden=false;restore();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
