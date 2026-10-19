/* Load the optional application graph only when Explorer is opened. */
(()=>{'use strict';
 const root=new URL(document.documentElement.dataset.ctdRoot||'./',location.href);
 let pending=null;
 const load=path=>new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=new URL(path,root).href;script.onload=resolve;script.onerror=()=>{script.remove();reject(new Error('APS data unavailable'))};document.head.append(script)});
 window.CTD_LOAD_APS=()=>{
  if(pending)return pending;
  pending=load('data/aps_2026_application_graph.js').then(()=>load('assets/aps-atlas.js')).catch(()=>{pending=null;return false});
  return pending;
 };
 const init=()=>{if(document.body.dataset.activeTab==='explore')window.CTD_LOAD_APS()};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
