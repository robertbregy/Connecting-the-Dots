/* Run the real Atlas and frozen corpus in a DOM. This is state QA, not browser/AT certification. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {parseHTML}=require('linkedom');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const dictionary=JSON.parse(read('data/translations.json'));
const corpusContext={window:{}};vm.runInNewContext(read('data/aps_2026_application_graph.js'),corpusContext);
const corpus=corpusContext.window.CTD_APS_2026;
const results=[];
function fixture(language,native,url){
 const {document,Event}=parseHTML(read(native?language+'/index.html':'applications/'+language+'/index.html'));
 for(const field of document.querySelectorAll('select')){
  Object.defineProperty(field,'options',{get(){return this.querySelectorAll('option')}});
  Object.defineProperty(field,'value',{get(){return this.querySelector('option[selected]')?.value||this.querySelector('option')?.value||''},set(value){for(const option of this.options)option.toggleAttribute('selected',option.value===value)}});
 }
 let current=new URL(url),historyState={tab:'explore',testMarker:17},notifications=0;
 const location={};for(const key of ['href','protocol','search','hash'])Object.defineProperty(location,key,{get:()=>current[key]});
 const handlers={};
 const window={CTD_APS_2026:corpus,CTD_APS_I18N:dictionary[language],CTD_APS_LANG:language,
  addEventListener:(name,fn)=>(handlers[name]??=[]).push(fn),
  dispatchEvent:event=>{if(event.type==='ctd:atlas-state')notifications++;for(const fn of handlers[event.type]||[])fn(event)}};
 const history={get state(){return historyState},replaceState:(state,title,value)=>{current=new URL(value,current);historyState=state}};
 vm.runInNewContext(read('assets/aps-atlas.js'),{window,document,location,history,URL,URLSearchParams,Intl,Event,console});
 const field=id=>document.getElementById(id);
 return {document,url:()=>new URL(current),state:()=>historyState,notifications:()=>notifications,
  value:id=>field(id).value,
  change:(id,value)=>{field(id).value=value;field(id).dispatchEvent(new Event(id==='apsSearch'?'input':'change'))},
  reset:()=>field('apsReset').dispatchEvent(new Event('click')),
  more:()=>field('apsMore').dispatchEvent(new Event('click')),
  travel:value=>{current=new URL(value,current);for(const fn of handlers.popstate||[])fn()},
  ids:()=>[...document.querySelectorAll('.apsCard')].map(node=>node.getAttribute('data-aps-id')).sort()};
}
for(const language of ['it','en','de','fr'])for(const native of [false,true]){
 const route=native?language+'/':'applications/'+language+'/',prefix=native?'aps_':'';
 const original='https://robertbregy.github.io/Connecting-the-Dots/'+route+
  (native?'?tab=explore&q=.lugano&type=country-code&scope=names#aps-native':'?q=.lugano#aps-results');
 const b=fixture(language,native,original);
 assert.deepEqual(b.ids(),['CDL2651T-T31516'],'Legacy query must keep .lugano lookup');
 b.change('apsSearch','tether');b.change('apsType','brand');b.change('apsRegion','LAC');
 const tether=['TOSD2642T-T84921','TOSD2642T-T92840'];
 assert.deepEqual(b.ids(),tether,'Search and filters must retain both Tether applications');
 assert.equal(b.url().searchParams.get(prefix+'q'),'tether');
 assert.equal(b.url().searchParams.get(prefix+'type'),'brand');
 assert.equal(b.url().searchParams.get(prefix+'region'),'LAC');
 assert.deepEqual(b.state(),{tab:'explore',testMarker:17},'Do not discard existing history state');
 if(native){
  assert.equal(b.url().searchParams.get('q'),'.lugano');assert.equal(b.url().searchParams.get('type'),'country-code');
  assert.equal(b.url().searchParams.get('scope'),'names');assert.equal(b.url().searchParams.get('tab'),'explore');
  assert.equal(b.url().hash,'#aps-native');assert.equal(b.notifications(),3);
 }
 const saved=b.url().href,reloaded=fixture(language,native,saved);
 assert.deepEqual(reloaded.ids(),tether,'Reload must reproduce the shared result set');
 assert.equal(reloaded.value('apsType'),'brand');assert.equal(reloaded.value('apsRegion'),'LAC');
 reloaded.reset();
 assert.equal(reloaded.value('apsSearch'),'');assert.equal(reloaded.value('apsType'),'all');assert.equal(reloaded.value('apsRegion'),'all');
 assert.equal(reloaded.ids().length,30);
 const cleared=fixture(language,native,reloaded.url().href);
 assert.equal(cleared.value('apsSearch'),'','An empty Atlas must not inherit the old Explorer query after reload');
 assert.equal(cleared.ids().length,30);
 const first=cleared.document.querySelector('.apsCard'),firstId=first.getAttribute('data-aps-id');
 first.querySelector('details').setAttribute('open','');cleared.more();
 assert.equal(cleared.ids().length,60);
 assert.ok(cleared.document.getElementById('aps-card-'+firstId).querySelector('details').hasAttribute('open'),'Loading more results must not close the source details being read');
 reloaded.travel(saved);assert.deepEqual(reloaded.ids(),tether,'History restoration must reproduce all filters');
 reloaded.travel(original);assert.deepEqual(reloaded.ids(),['CDL2651T-T31516'],'History must still understand legacy URLs');
 const nextLanguage=language==='fr'?'it':'fr',translated=new URL(saved);
 translated.pathname=translated.pathname.replace('/'+language+'/','/'+nextLanguage+'/');
 const switched=fixture(nextLanguage,native,translated.href);
 assert.deepEqual(switched.ids(),tether,'Language change must preserve the filtered applications');
 const direct=new URL(original);direct.searchParams.set(native?'application':'id','CDL2651T-T31516');
 const single=fixture(language,native,direct.href);
 assert.deepEqual(single.ids(),['CDL2651T-T31516']);
 assert.ok(single.document.querySelector('.apsCard details').hasAttribute('open'));
 single.change('apsSearch','tether');
 assert.equal(single.url().searchParams.has(native?'application':'id'),false,'Editing a direct link must release its ID');
 assert.deepEqual(fixture(language,native,single.url().href).ids(),tether);
 const invalid=new URL(original);invalid.searchParams.set(prefix+'type','not-a-type');invalid.searchParams.set(prefix+'region','not-a-region');
 const safe=fixture(language,native,invalid.href);
 assert.equal(safe.value('apsType'),'all');assert.equal(safe.value('apsRegion'),'all');
 assert.deepEqual(safe.ids(),['CDL2651T-T31516']);
 results.push({language,surface:native?'embedded':'standalone',legacyQuery:true,independentFilters:true,sharedReload:true,emptyReset:true,expandedPagination:true,popstate:true,languageChange:true,directLink:true,invalidFilters:true});
}
const report={surfaces:results.length,checksPerSurface:9,results};
if(process.env.CTD_ATLAS_STATE_QA){fs.mkdirSync(path.dirname(process.env.CTD_ATLAS_STATE_QA),{recursive:true});fs.writeFileSync(process.env.CTD_ATLAS_STATE_QA,JSON.stringify(report,null,2)+'\n');}
console.log('ATLAS_STATE_PASS',JSON.stringify(report));
