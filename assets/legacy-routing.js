/* Normalize legacy language queries and choose the best first-visit language at the root. */
(function(){
  const html=document.documentElement;
  const langs=['en','it','de','fr'];
  const page=html.dataset.ctdLanguage||'en';
  const query=new URLSearchParams(location.search);
  const requested=query.get('lang');
  const alias=html.hasAttribute('data-ctd-alias');
  const valid=value=>langs.includes(value);
  const remembered=()=>{try{const value=localStorage.getItem('dotLangChoice');return valid(value)?value:null}catch(e){return null}};
  const detected=()=>{
    const list=(typeof navigator!=='undefined'&&Array.isArray(navigator.languages)&&navigator.languages.length)
      ? navigator.languages
      : [typeof navigator!=='undefined'?navigator.language:''];
    for(const value of list){
      const primary=String(value||'').trim().toLowerCase().split(/[-_]/)[0];
      if(valid(primary))return primary;
    }
    return 'en';
  };

  if(!alias&&!query.has('lang'))return;
  if(!['http:','https:','file:'].includes(location.protocol))return;

  let target=page;
  if(query.has('lang')){
    target=valid(requested)?requested:'en';
    if(valid(requested)){try{localStorage.setItem('dotLangChoice',requested)}catch(e){}}
  }else if(alias){
    target=remembered()||detected();
  }

  const root=new URL(html.dataset.ctdRoot||'./',location.href);
  const next=new URL(target+(location.protocol==='file:'?'/index.html':'/'),root);
  query.delete('lang');
  next.search=query.toString();
  next.hash=location.hash;
  if(next.href!==location.href)location.replace(next.href);
})();
