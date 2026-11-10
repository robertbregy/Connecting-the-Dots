/* The static map remains readable without JS; its interactive geometry is
   requested only when the geography chapter is opened. */
(()=>{'use strict';
 const root=new URL(document.documentElement.dataset.ctdRoot||'./',location.href);let pending=null;
 // Reuse the same URL builder even if this loader initializes first.
 const assetURL=window.CTD_ASSET_URL||(window.CTD_ASSET_URL=path=>{
  const url=new URL(path,root);
  const version=window.DOT_PUBLICATION?.version||document.querySelector('meta[name="ctd-version"]')?.content||document.body?.dataset.build;
  if(version)url.searchParams.set('v',version);
  return url.href;
 });
 window.CTD_LOAD_WORLD=()=>{
  if(window.DOT_WORLD_PATH)return Promise.resolve(true);
  if(pending)return pending;
  pending=new Promise(resolve=>{const s=document.createElement('script');s.src=assetURL('data/worldmap.js');s.onload=()=>{window.CTD_RENDER_GEO?.();resolve(true)};s.onerror=()=>{s.remove();pending=null;resolve(false)};document.head.append(s)});
  return pending;
 };
 const init=()=>{if(document.body.dataset.activeTab==='geography')window.CTD_LOAD_WORLD()};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
