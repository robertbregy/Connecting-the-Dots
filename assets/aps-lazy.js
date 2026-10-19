/* Load the optional application graph only when Explorer is opened. */
(()=>{'use strict';
 const root=new URL(document.documentElement.dataset.ctdRoot||'./',location.href);
 let pending=null;
 const load=path=>new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=new URL(path,root).href;script.onload=resolve;script.onerror=()=>{script.remove();reject(new Error('APS data unavailable'))};document.head.append(script)});
 window.CTD_LOAD_APS=(force=false)=>{
  const requested=location.hash==='#aps-native'||document.getElementById('apsAtlasBridge')?.closest('details')?.open;
  if(!force&&!requested)return Promise.resolve(false);
  if(pending)return pending;
  pending=load('data/aps_2026_application_graph.js').then(()=>load('assets/aps-atlas.js')).catch(()=>{pending=null;return false});
  return pending;
 };
 const init=()=>{
  if(document.body.dataset.activeTab==='explore')window.CTD_LOAD_APS();
  document.getElementById('apsAtlasBridge')?.closest('details')?.addEventListener('toggle',e=>{if(e.currentTarget.open)window.CTD_LOAD_APS(true)});
  document.addEventListener('click',e=>{if(e.target.closest('a[data-open-anchor="aps-native"]'))window.CTD_LOAD_APS(true)},true);
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
