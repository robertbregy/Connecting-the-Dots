/* 2026 APS Atlas: public ICANN application-ID graph, separately from TLD Explorer. */
(()=>{'use strict';
const corpus=window.CTD_APS_2026||null;
let L=window.CTD_APS_I18N||(window.DOT_I18N&&window.DOT_I18N[document.documentElement.lang])||{};
let lang=window.CTD_APS_LANG||document.documentElement.lang||'en';
const site='https://robertbregy.github.io/Connecting-the-Dots/';
const results=document.getElementById('apsResults'),output=document.getElementById('apsResultCount');
const search=document.getElementById('apsSearch'),type=document.getElementById('apsType');
const role=document.getElementById('apsRole'),region=document.getElementById('apsRegion');
const more=document.getElementById('apsMore'),reset=document.getElementById('apsReset');
let limit=30;
let expandedIds=new Set();
const escape=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const t=k=>L[k]||k;
const normal=x=>String(x??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/^\./,'').trim();
const fmt=n=>new Intl.NumberFormat(lang==='it'?'it-IT':lang==='de'?'de-DE':lang==='fr'?'fr-FR':'en-US',{useGrouping:true}).format(n);
if(!results||!search||!more||!output)return;
if(!corpus||!Array.isArray(corpus.apps)||corpus.apps.length!==1614){
 output.textContent=t('apsAtlasError');more.hidden=true;return;
}
const all=corpus.apps;
const native=!!document.getElementById('aps-native');
const cardHeading=native?'h4':'h3';
const stateKeys=native?{query:'aps_q',type:'aps_type',role:'aps_role',region:'aps_region',id:'application'}:
 {query:'q',type:'type',role:'role',region:'region',id:'id'};
let directId='';
function restoreState(){
 const wanted=new URLSearchParams(location.search);
 directId=(wanted.get(stateKeys.id)||'').trim().toUpperCase();
 // Old Explorer links seed the Atlas once. An explicitly empty Atlas query
 // must stay empty after reset, even when the Explorer still has its own q.
 search.value=directId||(wanted.has(stateKeys.query)?wanted.get(stateKeys.query):native?wanted.get('q'):'')||'';
 for(const [key,field] of [['type',type],['role',role],['region',region]]){
  const value=wanted.get(stateKeys[key])||'all';
  field.value=[...field.options].some(option=>option.value===value)?value:'all';
 }
 limit=30;
}
function saveState(){
 const uri=new URL(location.href);
 uri.searchParams.set(stateKeys.query,search.value);
 for(const [key,field] of [['type',type],['role',role],['region',region]]){
  if(field.value==='all')uri.searchParams.delete(stateKeys[key]);
  else uri.searchParams.set(stateKeys[key],field.value);
 }
 uri.searchParams.delete(stateKeys.id);
 if(location.protocol==='http:'||location.protocol==='https:'){
  history.replaceState(history.state,'',uri);
  // Main-site language and share links must describe the current Atlas view.
  if(native)window.dispatchEvent(new Event('ctd:atlas-state'));
 }
}
restoreState();
const indexes=new Map(all.map(a=>[a.id,a]));
const matcher=a=>normal([
 a.id,a.primary,a.primaryUnicode,a.applicant,a.location,a.region,a.type,a.status,
 ...(a.types||[]),...(a.flags||[]),
 a.replacement?.id,a.replacement?.string,a.replacement?.unicode,a.replacement?.status,
 ...(a.variants||[]).flatMap(v=>[v.ascii,v.unicode])
].join(' '));
const hay=new Map(all.map(a=>[a.id,matcher(a)]));
function filtered(){
 const query=normal(search.value),kind=type.value,relation=role.value,country=region.value;
 return all.filter(a=>{
  const kindOK=kind==='all'||(kind==='brand'&&a.types.includes('Brand'))||
   (kind==='community'&&a.types.includes('Community'))||
   (kind==='geo'&&a.types.some(x=>x.startsWith('Geo')))||
   (kind==='idn'&&a.types.includes('IDN'))||
   (kind==='variant'&&a.variants.length>0);
  const roleOK=relation==='all'||(relation==='replacement'&&!!a.replacement)||
   (relation==='exact'&&a.primarySameStringCount>1)||
   (relation==='existing-variant'&&a.variantOnlyExistingTld);
  return kindOK&&roleOK&&(country==='all'||a.region===country)&&(!query||hay.get(a.id).includes(query));
 });
}
function officialHref(id,section='summary'){
 if(!/^[A-Za-z0-9-]{8,80}$/.test(id))return 'https://newgtldprogram-aps.icann.org/applications';
 return 'https://newgtldprogram-aps.icann.org/applications/'+encodeURIComponent(id)+'/'+section;
}
function linkToExplorer(label){
 return native?'?tab=explore&q='+encodeURIComponent(label):site+lang+'/?tab=explore&q='+encodeURIComponent(label);
}
function pill(x,cl=''){return '<span class="apsTag '+cl+'">'+escape(x)+'</span>';}
function item(a){
 const direct=officialHref(a.id);
 const replacement=a.replacement;
 const replacements=replacement?'<div class="apsReplacement"><b>'+escape(t('apsAtlasReplacement'))+
  '</b> <bdi>.'+escape(replacement.string)+'</bdi> · '+pill(replacement.status,replacement.status==='Deactivated'?'apsInactive':'apsState')+
  ' <span class="apsMuted">'+escape(replacement.id)+'</span> '+
  '<a target="_blank" rel="noopener" href="'+escape(officialHref(replacement.id))+'">'+escape(t('apsAtlasPublicDetail'))+' ↗</a></div>':'';
 const variants=a.variants.length?'<div class="apsVariants"><b>'+escape(t('apsAtlasVariants'))+': </b>'+
  a.variants.map(v=>'<bdi>.'+escape(v.ascii)+(v.unicode?' ('+escape(v.unicode)+')':'')+'</bdi>').join(' · ')+'</div>':'';
 const exact=a.primarySameStringCount>1?pill(escape(t('apsAtlasMatchesCount')).replace('{count}',fmt(a.primarySameStringCount)),'apsMatch'):'';
 const link=native?(site+'applications/'+lang+'/?id='+encodeURIComponent(a.id)+'#aps-results'):('?id='+encodeURIComponent(a.id)+'#aps-results');
 const identifier='<b class="apsId">'+escape(a.id)+'</b>';
 const typeTags=(a.types||[]).map(x=>pill(x)).join('');
 const explorer='<a href="'+escape(linkToExplorer(a.primary))+'">'+escape(t('apsAtlasExplorer'))+'</a>';
 return '<article class="apsCard" id="aps-card-'+escape(a.id)+'" data-aps-id="'+escape(a.id)+'">'+
  '<div class="apsCardHead"><div><'+cardHeading+' class="apsCardString"><bdi>.'+escape(a.primary)+'</bdi>'+
  (a.primaryUnicode?'<small lang="und">'+escape(a.primaryUnicode)+'</small>':'')+'</'+cardHeading+'>'+
  '<div class="apsApplicant">'+escape(a.applicant)+'</div></div><div class="apsCardSide">'+
  pill(a.status,'apsState')+identifier+'</div></div>'+
  '<div class="apsCardMeta">'+pill(a.region)+pill(a.location)+typeTags+exact+
   (replacement?pill(t('apsAtlasHasReplacement')):'')+
   (a.variantOnlyExistingTld?pill(t('apsAtlasExistingVariant')):'')+'</div>'+
  '<details class="apsCardDetails" '+(directId===a.id||expandedIds.has(a.id)?'open':'')+'><summary>'+escape(t('apsAtlasDetails'))+'</summary>'+
  '<dl class="apsFacts"><dt>'+escape(t('apsAtlasApplicationId'))+'</dt><dd>'+escape(a.id)+'</dd>'+
  '<dt>'+escape(t('apsAtlasApplicant'))+'</dt><dd>'+escape(a.applicant)+'</dd>'+
  '<dt>'+escape(t('apsAtlasBaseStatus'))+'</dt><dd>'+escape(a.status)+'</dd>'+
  '<dt>'+escape(t('apsAtlasProcessingStage'))+'</dt><dd>'+escape(a.stage)+'</dd>'+
  '<dt>'+escape(t('apsAtlasTypes'))+'</dt><dd>'+escape(a.type)+'; '+escape(a.types.join(', ')||t('apsAtlasNone'))+'</dd></dl>'+
  replacements+variants+
  '<p class="apsMiniNote">'+escape(t('apsAtlasObservedStatusNote'))+'</p>'+
  '<div class="apsCardLinks">'+
  '<a href="'+escape(direct)+'" target="_blank" rel="noopener">'+escape(t('apsAtlasPublicDetail'))+' ↗</a>'+
  '<a href="'+escape(officialHref(a.id,'application-responses'))+'" target="_blank" rel="noopener">'+escape(t('apsAtlasResponses'))+' ↗</a>'+
  '<a href="'+escape(officialHref(a.id,'documents'))+'" target="_blank" rel="noopener">'+escape(t('apsAtlasDocuments'))+' ↗</a>'+
   explorer+
  '<a href="'+link+'">'+escape(t('apsAtlasPermalink'))+'</a></div></details></article>';
}
function render(preserveOpen=true){
 expandedIds=preserveOpen?new Set([...results.querySelectorAll('.apsCard details[open]')].map(node=>node.closest('.apsCard').getAttribute('data-aps-id'))):new Set();
 const found=filtered(),view=found.slice(0,limit);
 const label=t('apsAtlasCountOf').replace('{shown}',fmt(view.length)).replace('{total}',fmt(found.length));
 output.textContent=label;
 results.innerHTML=view.length?view.map(item).join(''):'<p class="apsEmpty">'+escape(t('apsAtlasNoResults'))+'</p>';
 more.hidden=view.length>=found.length;more.disabled=view.length>=found.length;
 if(directId){const node=document.getElementById('aps-card-'+directId);if(node){node.querySelector('details').open=true;}}
}
for(const field of [search,type,role,region]){
 field.addEventListener(field===search?'input':'change',()=>{limit=30;directId='';saveState();render()});
}
more.addEventListener('click',()=>{limit+=30;render()});
reset.addEventListener('click',()=>{
 search.value='';type.value='all';role.value='all';region.value='all';limit=30;directId='';
 saveState();render(false);
 search.focus();
});
window.addEventListener('popstate',()=>{restoreState();render(false)});
window.CTD_APS_REFRESH=(nextLang,nextDict)=>{lang=nextLang;L=nextDict||L;render();};
render();
})();
