/* Regression checks for historical/current data separation and URL restoration. */
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict'),crypto=require('crypto'),zlib=require('zlib');
const {parseHTML}=require('linkedom');const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const dataContext={window:{}};vm.runInNewContext(read('data/data_bundle.js'),dataContext);const D=dataContext.window.DOT_DATA;
const snapshot=JSON.parse(read('data/iana_snapshot.json'));
const archive=fs.readFileSync(path.join(root,snapshot.archive_path));
assert.equal(crypto.createHash('sha256').update(archive).digest('hex'),snapshot.archive_sha256,'evidence archive changed');
const evidence=JSON.parse(zlib.gunzipSync(archive));assert.equal(evidence.format,'ctd-evidence-v1');assert.equal(evidence.encoding,'base64');assert.equal(Object.keys(evidence.files).length,snapshot.files.length);
for(const file of snapshot.files){assert.ok(evidence.files[file.path],file.path+' missing');assert.equal(crypto.createHash('sha256').update(Buffer.from(evidence.files[file.path],'base64')).digest('hex'),file.sha256,file.path+' evidence changed');}
for(const r of D.explorer){const current=snapshot.records[r.string];if(!current)continue;assert.equal(r.formalType,current.formalType,r.string+' formal type');assert.equal(r.registryEntity,current.currentRootStatus==='reserved'||current.registryEntity==='Not assigned'?'':current.registryEntity,r.string+' registry');if(current.currentRootStatus==='delegated'){assert.equal(r.status,'delegated',r.string+' current status');assert.ok(r.events.some(e=>e.current&&e.period===snapshot.asOf),r.string+' dated current event');}}
for(const string of ['.app','.health','.kids','.museum','.name','.sucks'])assert.equal(D.explorer.find(r=>r.string===string).currentRootStatus,'delegated');
assert.equal(D.explorer.find(r=>r.string==='.gb').currentRootStatus,'reserved');
const cs=D.explorer.find(r=>r.string==='.cs');assert.equal(cs.currentRootStatus,'retired');assert.ok(cs.events.some(e=>e.geography==='Czechoslovakia'));assert.ok(cs.events.some(e=>e.geography==='Serbia and Montenegro'&&e.status==='notDelegated'));
const lugano=D.explorer.find(r=>r.string==='.lugano');assert.equal(lugano.registryEntity,'');assert.equal(lugano.applicationEntity,'');assert.equal(lugano.provenanceKey,'applicantDisclosure');
// A current root record proves the registration date, not the historical operator.
for(const r of D.explorer){
 let previous=0;let currentCount=0;
 for(const e of r.events){
  if(e.status==='ianaRegistration')for(const field of ['entity','geography','type'])assert.equal(e[field]||'','',r.string+' backdated '+field);
  if(e.current){currentCount++;assert.equal(e,r.events.at(-1),r.string+' current snapshot must be last');}
  const match=String(e.period).match(/^\d{4}(?:-\d{2}){0,2}/);if(match){const order=Number(match[0].replace(/-/g,'').padEnd(8,'0'));assert.ok(order>=previous,r.string+' history out of order');previous=order;}
  assert.ok(!(e.status==='delegated'&&e.period==='2012'&&r.round==='2012'),r.string+' application round used as delegation date');
 }
 assert.ok(currentCount<=1,r.string+' duplicate current events');
}
const org=D.explorer.find(r=>r.string==='.org');assert.ok(org.events.some(e=>e.status==='registryTransition'&&e.period==='2003-01-01'));assert.ok(!org.events.some(e=>e.entity?.includes('PIR')&&e.period<'2003'));
const health=D.explorer.find(r=>r.string==='.health');assert.ok(health.events.some(e=>e.status==='registryTransferReport'&&e.period==='2023-06-26'));assert.ok(!health.events.some(e=>e.entity==='Registry Services, LLC'&&e.period<'2023'));
for(const string of ['.health','.kids']){const r=D.explorer.find(r=>r.string===string);assert.equal(r.originRound,'2012');assert.ok(r.events.some(e=>e.status==='application'&&e.period==='2012'&&e.source.includes(r.originRoundSources[0])));}
assert.equal(D.explorer.find(r=>r.string==='.post').originRound,'2004');
const version=JSON.parse(read('package.json')).version;assert.equal(JSON.parse(read('data/manifest.json')).version,version);assert.equal(D.normalizationVersion,version);
// The generated CSV and visible runtime must be exports of the same records.
function csv(text){const rows=[];let row=[],cell='',quoted=false;for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}else if(!quoted&&(c===','||c==='\n')){row.push(cell);cell='';if(c==='\n'){rows.push(row);row=[];}}else cell+=c;}return rows;}
const [headers,...rows]=csv(read('data/explorer_catalog.csv'));assert.equal(rows.length,D.explorer.length);
for(let i=0;i<rows.length;i++){const c=Object.fromEntries(headers.map((h,j)=>[h,rows[i][j]])),r=D.explorer[i];for(const [field,key] of [['string','string'],['status','status'],['formal_type','formalType'],['current_root_status','currentRootStatus'],['registry_entity','registryEntity'],['registry_country','registryCountry'],['represented_place','representedPlace'],['origin_round','originRound']])assert.equal(c[field],String(r[key]||''),r.string+' CSV '+field);assert.equal(c.origin_round_sources,r.originRoundSources.join(' | '));}
const [eventHeaders,...csvEvents]=csv(read('data/explorer_events.csv'));const runtimeEvents=D.explorer.flatMap(r=>r.events.map(e=>({string:r.string,...e})));assert.equal(csvEvents.length,runtimeEvents.length);
for(let i=0;i<csvEvents.length;i++){const row=Object.fromEntries(eventHeaders.map((h,j)=>[h,csvEvents[i][j]]));for(const field of ['string','period','status','type','entity','geography'])assert.equal(row[field],String(runtimeEvents[i][field]||''),'event CSV '+field);}
function browser(language,query=''){
 const {document,HTMLElement}=parseHTML(read(language+'/index.html'));
 Object.defineProperty(HTMLElement.prototype,'dataset',{configurable:true,get(){const element=this;const attribute=key=>'data-'+key.replace(/[A-Z]/g,c=>'-'+c.toLowerCase());return new Proxy({},{get:(_,key)=>typeof key==='string'?(element.getAttribute(attribute(key))??undefined):undefined,set:(_,key,value)=>{element.setAttribute(attribute(key),String(value));return true;}})}});
 HTMLElement.prototype.getBoundingClientRect=()=>({height:62,width:0,left:0,top:0,bottom:62,right:0});HTMLElement.prototype.scrollIntoView=()=>{};HTMLElement.prototype.focus=()=>{};
 for(const select of document.querySelectorAll('select')){Object.defineProperty(select,'options',{get(){return this.querySelectorAll('option')}});Object.defineProperty(select,'value',{get(){return this.querySelector('option[selected]')?.getAttribute('value')||this.querySelector('option')?.getAttribute('value')||''},set(value){for(const o of this.querySelectorAll('option'))o.toggleAttribute('selected',o.getAttribute('value')===String(value))}})}
 const base='https://robertbregy.github.io/Connecting-the-Dots/'+language+'/';let url=new URL(query,base),stack=[url.href],at=0,assigned;
 const location={assign:value=>assigned=value};for(const key of ['href','protocol','pathname','search','hash'])Object.defineProperty(location,key,{get:()=>url[key]});
 const handlers={};const window={document,innerWidth:1440,matchMedia:()=>({matches:false}),addEventListener:(type,fn)=>(handlers[type]??=[]).push(fn)};
 const history={replaceState:(_s,_t,value)=>{url=new URL(value,url);stack[at]=url.href},pushState:(_s,_t,value)=>{url=new URL(value,url);stack=stack.slice(0,at+1);stack.push(url.href);at++;}};
 const context=vm.createContext({window,document,location,history,navigator:{},localStorage:{getItem:()=>null,setItem:()=>{}},requestAnimationFrame:fn=>fn(),setTimeout:()=>0,clearTimeout:()=>{},URL,URLSearchParams,Intl,console});
 for(const id of ['ctd-data-bundle','ctd-i18n-bundle','ctd-worldmap','ctd-publication','ctd-app'])vm.runInContext(document.getElementById(id).textContent,context,{filename:id,timeout:10000});
 return{document,run:code=>vm.runInContext(code,context),url:()=>url,back:()=>{assert.ok(at>0);url=new URL(stack[--at]);for(const fn of handlers.popstate||[])fn()},assigned:()=>assigned};
}
for(const lang of ['en','it','de','fr']){
 let b=browser(lang,'?tab=how&q=app');assert.equal(b.document.body.dataset.activeTab,'how',lang+' explicit section beats search');assert.equal(b.document.getElementById('explorerSearch').value,'app');
 const target=lang==='fr'?'de':'fr';b.run('document.getElementById("langSelect").value='+JSON.stringify(target));b.run('document.getElementById("langSelect").dispatchEvent(new document.defaultView.Event("change"))');const switched=new URL(b.assigned());assert.equal(switched.searchParams.get('tab'),'how');assert.equal(switched.searchParams.get('q'),'app');
 b=browser(lang,'?tab=overview#how');assert.equal(b.document.body.dataset.activeTab,'how',lang+' fragment opens owning section');
 b=browser(lang,'?q=app');assert.equal(b.document.body.dataset.activeTab,'explore',lang+' implicit search route');
 b=browser(lang,'?tab=explore&q=app');b.run("activateTab('how',true);activateTab('explore',true);document.getElementById('explorerSearch').value='bank';renderExplorer(true)");assert.equal(b.url().searchParams.get('q'),'bank');b.back();assert.equal(b.document.body.dataset.activeTab,'how');assert.equal(b.document.getElementById('explorerSearch').value,'app');b.back();assert.equal(b.document.body.dataset.activeTab,'explore');assert.equal(b.document.getElementById('explorerSearch').value,'app');
 assert.equal(b.document.querySelector('.tab.active').getAttribute('aria-current'),'location');assert.equal(b.document.getElementById('explorerResultCount').getAttribute('aria-live'),'polite');
 b=browser(lang,'?tab=geography&map=rsp&preset=cities&type=generic&round=2012');assert.equal(b.run('geoMode'),'rsp');assert.equal(b.run('explorerPreset'),'cities');assert.equal(b.document.getElementById('exploreTypeFilter').value,'generic');assert.equal(b.document.getElementById('exploreRoundFilter').value,'2012');
 b=browser(lang,'?tab=how');b.run("document.querySelector('#how .tocLink').dispatchEvent(new document.defaultView.Event('click',{cancelable:true}))");assert.equal(b.url().hash,'#how-part-1');
 const dictionary=b.run('I18N[lang]');assert.ok(dictionary.oddCsFact.includes(lang==='de'?'Tschechoslowakei':lang==='fr'?'Tchécoslovaquie':lang==='it'?'Cecoslovacchia':'Czechoslovakia'));assert.ok(!/Excel|workbook/.test(dictionary.dataPackSub));
 assert.equal(b.document.body.dataset.build,version,lang+' page version');
 const dateLabel=b.document.querySelector('[data-i18n="exploreIanaDate"]').textContent;assert.ok(dateLabel.includes(b.run('fmtDate(D.explorerMeta.ianaSnapshot)')),lang+' snapshot date');assert.ok(!dateLabel.includes('{date}'));
 b=browser(lang,'?tab=explore&q=post&round=2012');assert.ok(!b.run("explorerFilteredRows().some(r=>r.string==='.post')"),lang+' post excluded from 2012');
 b=browser(lang,'?tab=explore&q=post&round=2004');assert.ok(b.run("explorerFilteredRows().some(r=>r.string==='.post')"),lang+' post included in 2004');
 for(const string of ['health','kids']){b=browser(lang,'?tab=explore&q='+string+'&round=2012');assert.ok(b.run('explorerFilteredRows().some(r=>r.string==='+JSON.stringify('.'+string)+')'),lang+' '+string+' 2012');}
 b=browser(lang,'?tab=explore&q=cs');b.run("openExplorerRecord(D.explorer.findIndex(r=>r.string==='.cs'))");const drawer=b.document.getElementById('drawerContent').textContent;assert.ok(drawer.includes(dictionary.placeCsHistory));if(lang!=='en')assert.ok(!drawer.includes('code reassignment'));
 b.run("openExplorerRecord(D.explorer.findIndex(r=>r.string==='.org'))");assert.ok(b.document.querySelector('.drawerEventPeriod').textContent.includes('1985'));assert.ok(b.document.getElementById('drawerContent').textContent.includes(b.run("fmtCountry('United States')")));
 const localizedBerlin=b.run("fmtPlace('Berlin')");b.run('document.getElementById("explorerSearch").value='+JSON.stringify(localizedBerlin)+';renderExplorer(true)');assert.ok(b.run("explorerFilteredRows().some(r=>r.string==='.berlin')"),lang+' localized place search');
 console.log('Validated provenance, chronology, translations, filters and URL restoration: '+lang);
}
console.log('Validated '+D.explorer.length+' runtime/CSV records and '+snapshot.files.length+' preserved IANA evidence files.');
