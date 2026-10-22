/* Load the optional application graph only when Explorer is opened. */
(()=>{'use strict';
 const root=new URL(document.documentElement.dataset.ctdRoot||'./',location.href);
 let pending=null;
 const load=path=>new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=new URL(path,root).href;script.onload=resolve;script.onerror=()=>{script.remove();reject(new Error('APS data unavailable'))};document.head.append(script)});
 window.CTD_LOAD_APS=(force=false)=>{
  const panel=document.getElementById('aps-native');
  const requested=location.hash==='#aps-native'||document.getElementById('apsAtlasBridge')?.closest('details')?.open||panel?.closest('details')?.open;
  if(!force&&!requested)return Promise.resolve(false);
  if(pending)return pending;
  const controls=[...(panel?.querySelectorAll('input,select,button')||[])].map(el=>[el,el.disabled]);
  controls.forEach(([el])=>el.disabled=true);panel?.setAttribute('aria-busy','true');
  const language=document.documentElement.lang;
  const loading={it:'Caricamento dell’atlante…',en:'Loading the application atlas…',de:'Bewerbungsatlas wird geladen…',fr:'Chargement de l’atlas des candidatures…'};
  const status=panel?.querySelector('#apsResultCount');if(status)status.textContent=loading[language]||loading.en;
  const release=()=>{controls.forEach(([el,disabled])=>el.disabled=disabled);panel?.setAttribute('aria-busy','false')};
  pending=load('data/aps_2026_application_graph.js').then(()=>load('assets/aps-atlas.js')).then(()=>{release();return true}).catch(()=>{release();if(status)status.textContent=window.DOT_I18N?.[language]?.apsAtlasError||'ICANN APS';pending=null;return false});
  return pending;
 };
 const init=()=>{
  if(document.body.dataset.activeTab==='explore')window.CTD_LOAD_APS();
  document.querySelectorAll('.audienceAtlasLink,.audienceAtlasPanel').forEach(details=>details.addEventListener('toggle',e=>{if(e.currentTarget.open)window.CTD_LOAD_APS(true)}));
  document.addEventListener('click',e=>{if(e.target.closest('a[data-open-anchor="aps-native"]'))window.CTD_LOAD_APS(true)},true);
  // The atlas is visible in the page, but its graph loads only near the reader.
  const panel=document.querySelector('#aps-native[data-narrative-atlas]');
  if(panel){
   const visible=()=>{const r=panel.getBoundingClientRect();return document.body.dataset.activeTab==='explore'&&r.width>0&&r.top<innerHeight+200&&r.bottom>0};
   if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)&&visible())window.CTD_LOAD_APS(true)},{rootMargin:'200px 0px'});observer.observe(panel);}
   else window.addEventListener('scroll',()=>{if(visible())window.CTD_LOAD_APS(true)},{passive:true});
   panel.addEventListener('focusin',()=>window.CTD_LOAD_APS(true));
   window.addEventListener('hashchange',()=>{if(visible())window.CTD_LOAD_APS(true)});
   if(visible())window.CTD_LOAD_APS(true);
  }
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
