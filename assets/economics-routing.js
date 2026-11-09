/* Keep shared, bookmarked Economics fragments useful after the reading split. */
(()=>{
 'use strict';
 const data=document.getElementById('economics-route-data');
 if(!data)return;
 const config=JSON.parse(data.textContent),anchors=config.anchors;
 const base=new URL(document.documentElement.getAttribute('data-ctd-root')||'../',location.href);
 function destination(url){
  if(url.origin!==base.origin||!url.pathname.startsWith(base.pathname))return null;
  const tail=url.pathname.slice(base.pathname.length);
  if(!/^(?:(?:en|it|de|fr)\/(?:index\.html)?|index\.html|guides\/(?:en|it|de|fr)\/economics\/(?:index\.html)?)?$/.test(tail))return null;
  let id;try{id=decodeURIComponent(url.hash.slice(1))}catch{return null}
  let key=anchors[id];
  if((!key||key==='hub')&&url.searchParams.get('tab')==='economics'&&['market','origin','mq','marketall'].some(k=>url.searchParams.has(k)))key='market';
  if(!key||key==='hub')return null;
  const lang=/^(?:guides\/)?(en|it|de|fr)\//.exec(tail)?.[1]||config.language;
  const next=new URL(`economics/${lang}/${key}/`,base);
  if(key==='market')for(const name of ['market','origin','mq','marketall'])if(url.searchParams.has(name))next.searchParams.set(name,url.searchParams.get(name));
  if(anchors[id]===key)next.hash=url.hash;
  return next;
 }
 function restore(){const next=destination(new URL(location.href));if(next)location.replace(next.href)}
 document.documentElement.dataset.economicsRouting='active';
 // Capture before the atlas' delegated and direct section-link handlers.
 document.addEventListener('click',event=>{
  if(event.defaultPrevented||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||event.button!==0)return;
  const link=event.target.closest?.('a[href]');if(!link||link.target==='_blank'||link.hasAttribute('download'))return;
  const next=destination(new URL(link.href,location.href));if(!next)return;
  event.preventDefault();event.stopImmediatePropagation();location.assign(next.href);
 },true);
 window.addEventListener('hashchange',restore);
 window.addEventListener('popstate',restore);
 // Native entry pages already resolve the root alias and legacy language
 // queries in their inline head script. Let that navigation finish before
 // routing the preserved fragment on the resulting localized page.
 const nativeLanguageRedirect=document.documentElement.hasAttribute('data-ctd-alias')||
  (document.documentElement.hasAttribute('data-ctd-language')&&new URL(location.href).searchParams.has('lang'));
 if(!nativeLanguageRedirect)restore();
})();
