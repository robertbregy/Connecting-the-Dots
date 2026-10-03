/* Normalize legacy language queries and the root alias before the app starts. */
(function(){
  const html=document.documentElement;
  const langs=['en','it','de','fr'];
  const page=html.dataset.ctdLanguage||'en';
  const query=new URLSearchParams(location.search);
  const requested=query.get('lang');
  const target=langs.includes(requested)?requested:page;
  if(!html.hasAttribute('data-ctd-alias')&&!query.has('lang'))return;
  if(!['http:','https:','file:'].includes(location.protocol))return;
  const root=new URL(html.dataset.ctdRoot||'./',location.href);
  const next=new URL(target+(location.protocol==='file:'?'/index.html':'/'),root);
  query.delete('lang');
  next.search=query.toString();
  next.hash=location.hash;
  if(next.href!==location.href)location.replace(next.href);
})();
