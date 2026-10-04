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
const rootLabels=Buffer.from(evidence.files['data/evidence/iana/tlds-alpha-by-domain.txt'],'base64').toString('utf8').split(/\r?\n/).filter(s=>s&&!s.startsWith('#')).map(s=>'.'+s.toLowerCase());
const rootRecords=D.explorer.filter(r=>r.rootListed);
assert.deepEqual(Array.from(rootRecords,r=>r.asciiString).sort(),rootLabels.sort(),'complete root membership');
assert.equal(new Set(D.explorer.map(r=>r.asciiString)).size,D.explorer.length,'unique ASCII identities');
assert.equal(D.explorerMeta.rootIndexedCount,snapshot.rootListCount);
assert.equal(D.explorerMeta.curatedCount,JSON.parse(read('data/explorer_curated.json')).records.length);
assert.equal(D.explorer.filter(r=>r.recordLevel==='curated').length,D.explorerMeta.curatedCount);
const rootDocument=parseHTML(Buffer.from(evidence.files['data/evidence/iana/root-db.html'],'base64').toString('utf8')).document;
const rootFacts=new Map([...rootDocument.querySelectorAll('#tld-table tbody tr')].map(row=>{const cells=row.querySelectorAll('td'),link=cells[0].querySelector('a');return['.'+link.getAttribute('href').split('/').pop().replace(/\.html$/,''),{type:cells[1].textContent.trim(),entity:cells[2].textContent.trim().replace(/\s+/g,' ')}]}));
assert.equal(snapshot.databaseCount,rootFacts.size);assert.equal(D.explorerMeta.ianaProfileCount,rootFacts.size);
assert.deepEqual(Array.from(D.explorer.filter(r=>r.ianaProfile),r=>r.asciiString).sort(),[...rootFacts.keys()].sort(),'complete database profile coverage');
for(const r of D.explorer.filter(r=>r.recordLevel==='iana')){const fact=rootFacts.get(r.asciiString);assert.ok(fact,r.string+' root source');assert.equal(r.formalType,fact.type);assert.equal(r.registryEntity,['Reserved Domain - IANA','Not assigned'].includes(fact.entity)?'':fact.entity);for(const key of ['originRound','round','applicationEntity','representedPlace'])assert.ok(!r[key],r.string+' inferred '+key);assert.equal((r.events||[]).length,0,r.string+' invented history');}
for(const r of D.explorer){const current=snapshot.records[r.string];if(!current)continue;assert.equal(r.formalType,current.formalType,r.string+' formal type');assert.equal(r.registryEntity,current.currentRootStatus==='reserved'||current.registryEntity==='Not assigned'?'':current.registryEntity,r.string+' registry');if(current.currentRootStatus==='delegated'){assert.equal(r.status,'delegated',r.string+' current status');if(r.recordLevel==='curated')assert.ok(r.events.some(e=>e.current&&e.period===snapshot.asOf),r.string+' dated current event');}
 for(const field of ['registryCountry','registryCountryCode','technicalContactOrganization','technicalContactCountry','technicalContactCountryCode','administrativeContactOrganization','administrativeContactCountry','administrativeContactCountryCode','registrationDate','lastUpdated','registryUrl','whoisServer','sourceRetrievedAt'])assert.equal(r[field],current[field],r.string+' official '+field);
 for(const field of ['nameServers','rdapServers','ianaReports'])assert.equal(JSON.stringify(r[field]),JSON.stringify(current[field]),r.string+' official '+field);
 for(const n of r.nameServers){assert.ok(n.hostname.includes('.'),r.string+' nameserver hostname');for(const ip of n.ipAddresses)assert.ok(require('node:net').isIP(ip),r.string+' nameserver address');}
 for(const code of [r.registryCountryCode,r.technicalContactCountryCode,r.administrativeContactCountryCode])assert.ok(!code||/^[A-Z]{2}$/.test(code),r.string+' country code');
}
const ch=D.explorer.find(r=>r.string==='.ch');assert.equal(ch.registryCountryCode,'CH');assert.equal(ch.registrationDate,'1987-05-20');assert.equal(ch.whoisServer,'whois.nic.ch');assert.ok(ch.nameServers.some(n=>n.hostname==='a.nic.ch'&&n.ipAddresses.includes('130.59.31.41')));
assert.equal(D.explorer.find(r=>r.string==='.catholic').technicalContactOrganization,'','absent organization must not become a street address');
assert.equal(D.explorer.find(r=>r.string==='.cba').administrativeContactOrganization,'','absent organization must not become a floor');
assert.equal(D.explorer.find(r=>r.string==='.im').administrativeContactOrganization,'Information Systems Division, Isle of Man Government','multiline organization preserved');
const abarth=D.explorer.find(r=>r.string==='.abarth');assert.equal(abarth.rootListed,false);assert.equal(abarth.registryEntity,'');assert.ok(abarth.ianaReports.some(r=>r.title.startsWith('Revocation')));assert.equal(abarth.nameServers.length,0);
for(const string of ['.app','.health','.kids','.museum','.name','.sucks'])assert.equal(D.explorer.find(r=>r.string===string).currentRootStatus,'delegated');
assert.equal(D.explorer.find(r=>r.string==='.gb').currentRootStatus,'reserved');
const cs=D.explorer.find(r=>r.string==='.cs');assert.equal(cs.currentRootStatus,'retired');assert.ok(cs.events.some(e=>e.geography==='Czechoslovakia'));assert.ok(cs.events.some(e=>e.geography==='Serbia and Montenegro'&&e.status==='notDelegated'));
const lugano=D.explorer.find(r=>r.string==='.lugano');assert.equal(lugano.registryEntity,'');assert.equal(lugano.applicationEntity,'');assert.equal(lugano.provenanceKey,'applicantDisclosure');
// A current root record proves the registration date, not the historical operator.
for(const r of D.explorer){
 let previous=0;let currentCount=0;
 for(const e of r.events||[]){
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
for(let i=0;i<rows.length;i++){const c=Object.fromEntries(headers.map((h,j)=>[h,rows[i][j]])),r=D.explorer[i];for(const [field,key] of [['string','string'],['status','status'],['formal_type','formalType'],['current_root_status','currentRootStatus'],['registry_entity','registryEntity'],['registry_country','registryCountry'],['represented_place','representedPlace'],['origin_round','originRound'],['ascii_string','asciiString'],['record_level','recordLevel'],['registry_country_code','registryCountryCode'],['technical_contact_organization','technicalContactOrganization'],['administrative_contact_organization','administrativeContactOrganization'],['last_updated','lastUpdated'],['source_retrieved_at','sourceRetrievedAt'],['registry_url','registryUrl'],['whois_server','whoisServer']])assert.equal(c[field],String(r[key]||''),r.string+' CSV '+field);assert.equal(c.origin_round_sources,(r.originRoundSources||[]).join(' | '));assert.equal(c.root_listed,r.rootListed?'yes':'no');assert.equal(c.iana_profile,r.ianaProfile?'yes':'no');assert.equal(c.rdap_servers,(r.rdapServers||[]).join(' | '));assert.equal(c.name_server_count,r.ianaProfile?String(r.nameServers.length):'');assert.equal(c.iana_report_count,r.ianaProfile?String(r.ianaReports.length):'');}
const [nsHeaders,...nsRows]=csv(read('data/explorer_nameservers.csv')),servers=D.explorer.flatMap(r=>(r.nameServers||[]).map(n=>({...n,string:r.string,asciiString:r.asciiString})));
assert.equal(nsRows.length,servers.length);for(let i=0;i<nsRows.length;i++){const row=Object.fromEntries(nsHeaders.map((h,j)=>[h,nsRows[i][j]])),n=servers[i];assert.equal(row.hostname,n.hostname);assert.equal(row.ascii_string,n.asciiString);assert.equal(row.ip_addresses,n.ipAddresses.join(' | '));}
const [reportHeaders,...reportRows]=csv(read('data/explorer_iana_reports.csv')),reports=D.explorer.flatMap(r=>(r.ianaReports||[]).map(p=>({...p,asciiString:r.asciiString})));
assert.equal(reportRows.length,reports.length);for(let i=0;i<reportRows.length;i++){const row=Object.fromEntries(reportHeaders.map((h,j)=>[h,reportRows[i][j]])),r=reports[i];assert.equal(row.ascii_string,r.asciiString);assert.equal(row.title,r.title);assert.equal(row.url,r.url);assert.equal(row.publication_date,r.date);}
const [eventHeaders,...csvEvents]=csv(read('data/explorer_events.csv'));const runtimeEvents=D.explorer.flatMap(r=>(r.events||[]).map(e=>({string:r.string,...e})));assert.equal(csvEvents.length,runtimeEvents.length);
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
 for(let shard=0;shard<8;shard++)vm.runInContext(read('data/explorer_profiles_'+shard+'.js'),context);
 for(const id of ['ctd-data-bundle','ctd-i18n-bundle','ctd-worldmap','ctd-publication','ctd-app']){const node=document.getElementById(id),src=node.getAttribute('src'),runtime=src?fs.readFileSync(path.resolve(root,language,src.split('?')[0]),'utf8'):node.textContent;vm.runInContext(runtime,context,{filename:id,timeout:10000});}
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
 const regionKeys={EUR:'regionEurope',AP:'regionAsiaPacific',NA:'regionNorthAmerica',LAC:'regionLatinAmerica',AF:'regionAfrica'};
 for(const mode of ['governance','rsp','applicant2012','applicant2026']){
  b.document.querySelector('[data-mapmode="'+mode+'"]').click();
  assert.equal(b.document.querySelectorAll('.mapToggle[aria-pressed="true"]').length,1);assert.equal(b.document.querySelector('.mapToggle[aria-pressed="true"]').dataset.mapmode,mode);
  assert.equal(b.document.querySelectorAll('.mapToggle[aria-pressed="false"]').length,3);assert.equal(b.document.querySelector('#geoMap svg').getAttribute('role'),'group');
  if(mode==='rsp'||mode==='applicant2012'){
   const rows=D[mode==='rsp'?'rspRegions':'geoApplicantRegions2012'];
   [...b.document.querySelectorAll('#geoMap .mapDatum')].forEach((point,i)=>{
    const name=b.run('t('+JSON.stringify(regionKeys[rows[i].code])+')');
    assert.ok(point.getAttribute('data-tip').startsWith(name+': '),lang+' localized region tooltip');
    assert.ok(point.getAttribute('aria-label').startsWith(name+': '),lang+' accessible region and value');
   });
  }
 }
 for(const key of Object.values(regionKeys))assert.ok(b.document.getElementById('rsp2026Bars').textContent.includes(b.run('t('+JSON.stringify(key)+')')));
 b.run('setExplorerPreset("root")');assert.equal(b.document.querySelectorAll('.presetChip[aria-pressed="true"]').length,1);assert.equal(b.document.querySelector('.presetChip[aria-pressed="true"]').dataset.preset,'root');
 assert.equal(new URL(b.document.querySelector('[data-report-error]').getAttribute('href')).searchParams.get('body').includes('?tab=geography&map=applicant2026'),true);
 b=browser(lang,'?tab=how');b.run("document.querySelector('#how .tocLink[href$=\"#how-part-1\"]').dispatchEvent(new document.defaultView.Event('click',{cancelable:true}))");assert.equal(b.url().hash,'#how-part-1');
 const dictionary=b.run('I18N[lang]');assert.ok(dictionary.oddCsFact.includes(lang==='de'?'Tschechoslowakei':lang==='fr'?'Tchécoslovaquie':lang==='it'?'Cecoslovacchia':'Czechoslovakia'));assert.ok(!/Excel|workbook/.test(dictionary.dataPackSub));
 assert.equal(b.document.body.dataset.build,version,lang+' page version');
 const dateLabel=b.document.querySelector('[data-i18n="exploreIanaDate"]').textContent;assert.ok(dateLabel.includes(b.run('fmtDate(D.explorerMeta.ianaSnapshot)')),lang+' snapshot date');assert.ok(!dateLabel.includes('{date}'));
 b=browser(lang,'?tab=explore&q=post&round=2012');assert.ok(!b.run("explorerFilteredRows().some(r=>r.string==='.post')"),lang+' post excluded from 2012');
 b=browser(lang,'?tab=explore&q=post&round=2004');assert.ok(b.run("explorerFilteredRows().some(r=>r.string==='.post')"),lang+' post included in 2004');
 for(const string of ['health','kids']){b=browser(lang,'?tab=explore&q='+string+'&round=2012');assert.ok(b.run('explorerFilteredRows().some(r=>r.string==='+JSON.stringify('.'+string)+')'),lang+' '+string+' 2012');}
 b=browser(lang,'?tab=explore&q=cs');b.run("openExplorerRecord(D.explorer.findIndex(r=>r.string==='.cs'))");const drawer=b.document.getElementById('drawerContent').textContent;assert.ok(drawer.includes(dictionary.placeCsHistory));if(lang!=='en')assert.ok(!drawer.includes('code reassignment'));
 b.run("openExplorerRecord(D.explorer.findIndex(r=>r.string==='.org'))");assert.ok(b.document.querySelector('.drawerEventPeriod').textContent.includes('1985'));assert.ok(b.document.getElementById('drawerContent').textContent.includes(b.run("fmtCountry('United States')")));
 const localizedBerlin=b.run("fmtPlace('Berlin')");b.run('document.getElementById("explorerSearch").value='+JSON.stringify(localizedBerlin)+';renderExplorer(true)');assert.ok(b.run("explorerFilteredRows().some(r=>r.string==='.berlin')"),lang+' localized place search');
 b=browser(lang,'?tab=explore&q=xn--fiqs8s');assert.ok(b.run("explorerFilteredRows().some(r=>r.string==='.中国')"),lang+' ASCII IDN lookup');b.run("document.getElementById('explorerSearch').value='中国';renderExplorer(true)");assert.ok(b.run("explorerFilteredRows().some(r=>r.asciiString==='.xn--fiqs8s')"),lang+' Unicode lookup');
 b=browser(lang,'?tab=explore&q=ch');b.run("openExplorerRecord(D.explorer.findIndex(r=>r.string==='.ch'))");assert.ok(b.document.getElementById('drawerContent').textContent.includes(dictionary.recordIana));assert.equal(b.document.querySelectorAll('#drawerContent .drawerEvent').length,0,lang+' IANA record must not invent history');assert.ok(!b.document.getElementById('drawerContent').textContent.includes('undefined'));assert.equal(b.document.querySelectorAll('.ianaServers li').length,ch.nameServers.length);assert.ok(b.document.getElementById('drawerContent').textContent.includes('whois.nic.ch'));assert.ok(b.document.getElementById('drawerContent').textContent.includes(b.run("fmtCountry('Switzerland')")));
 b.run("openExplorerRecord(D.explorer.findIndex(r=>r.string==='.abarth'))");assert.equal(b.document.querySelectorAll('.ianaReportList li').length,abarth.ianaReports.length);assert.ok(b.document.getElementById('drawerContent').textContent.includes(dictionary.rootListedNo));
 b=browser(lang,'?tab=explore&country=CH&preset=root');assert.equal(b.run('explorerFilteredRows().length'),D.explorer.filter(r=>r.rootListed&&r.registryCountryCode==='CH').length);assert.ok(b.run("explorerFilteredRows().some(r=>r.string==='.ch')"));assert.equal(b.url().searchParams.get('country'),'CH');assert.ok(b.document.querySelector('[data-language="it"]').getAttribute('href').includes('country=CH'));
 b.run("resetExplorer();document.getElementById('explorerSearch').value='a.nic.ch';renderExplorer(true)");assert.ok(b.run("explorerFilteredRows().some(r=>r.string==='.ch')"),lang+' nameserver search');
 b=browser(lang,'?tab=explore&preset=outsideRoot');assert.ok(b.run('explorerFilteredRows().every(r=>!r.rootListed)'));assert.equal(b.run('explorerFilteredRows().length'),D.explorer.length-rootLabels.length);
 b=browser(lang,'?tab=explore&preset=curated');assert.equal(b.run('explorerFilteredRows().length'),D.explorerMeta.curatedCount,lang+' curated filter');
 b=browser(lang,'?tab=overview');assert.equal(b.document.querySelectorAll('#overview [data-open-section]').length,6);assert.equal(b.document.getElementById('cards').closest('.section').id,'reveal');assert.equal(b.document.getElementById('namespaceDimensions').closest('.section').id,'how');assert.ok(b.document.querySelector('#lugano .authorDisclosure').textContent.includes('Robert Bregy'));
 const click=new b.document.defaultView.Event('click',{cancelable:true});Object.defineProperty(click,'button',{value:0});b.document.querySelector('#overview [data-open-section="explore"]').dispatchEvent(click);assert.equal(b.document.body.dataset.activeTab,'explore',lang+' guided entry link');
 for(const key of ['publicQuestionsIntro','publicNeedBody','publicAdoptionBody','publicRulesBody','publicOpenBody'])assert.ok(!/budget|costi|costs|coûts|Kosten|CHF/.test(dictionary[key]),lang+' public-only editorial criteria');
 // The guided explanation must work in every language without touching research data.
 b=browser(lang,'?tab=overview');
 const enter=new b.document.defaultView.Event('click',{cancelable:true});Object.defineProperty(enter,'button',{value:0});
 b.document.querySelector('.homeJourney [data-open-anchor]').dispatchEvent(enter);
 assert.equal(b.document.body.dataset.activeTab,'how');assert.equal(b.url().hash,'#internet-basics');
 assert.equal(b.document.querySelectorAll('.journeyStep').length,7);assert.equal(b.document.querySelectorAll('[data-journey-go]').length,7);
 for(let step=0;step<7;step++){
  const scene=b.document.querySelector('[data-journey-scene="'+step+'"]');assert.ok(scene.textContent.includes(dictionary['journey'+step+'Title']));assert.ok(scene.textContent.includes(dictionary['journey'+step+'Body']));assert.ok(scene.textContent.includes(dictionary['journey'+step+'Detail']));
  assert.equal(scene.hasAttribute('hidden'),false,'static no-JS reading must remain complete');
 }
 assert.equal(b.document.getElementById('journeyBack').disabled,true);assert.equal(b.document.getElementById('journeyNext').textContent,dictionary.journeyStart);
 for(let step=1;step<7;step++){
  b.document.getElementById('journeyNext').click();
  assert.equal(b.document.querySelectorAll('.journeyStep.is-active').length,1);assert.equal(b.document.querySelector('.journeyStep.is-active').getAttribute('data-journey-scene'),String(step));
  assert.equal(b.document.querySelector('[data-journey-go][aria-current="step"]').getAttribute('data-journey-go'),String(step));
  assert.equal(b.url().searchParams.get('walk'),String(step));assert.ok(b.document.getElementById('journeyAnnounce').textContent.includes(dictionary['journey'+step+'Body']));
  assert.equal(b.document.getElementById('internet-guide').classList.contains('has-address'),step>=3);
  assert.equal(b.document.getElementById('internet-guide').classList.contains('has-connection'),step>=4);
  assert.equal(b.document.getElementById('internet-guide').classList.contains('has-security'),step>=5);
  assert.equal(b.document.getElementById('internet-guide').classList.contains('has-page'),step===6);
  assert.equal(b.document.querySelectorAll('script[src*="explorer_profiles_"]').length,0,'guide does not request Explorer profiles');
 }
 assert.equal(b.document.getElementById('journeyNext').disabled,true);
 b.document.getElementById('journeyBack').click();assert.equal(b.run('journeyStep'),5);
 const guideLanguage=new URL(b.document.querySelector('[data-language="fr"]').getAttribute('href'));assert.equal(guideLanguage.searchParams.get('walk'),'5');assert.equal(guideLanguage.hash,'#internet-basics');
 b.document.querySelector('.journeyStep.is-active details').open=true;b.document.getElementById('journeyRestart').click();assert.equal(b.run('journeyStep'),0);assert.equal(b.document.querySelectorAll('#journeySteps details[open]').length,0);
 b.document.querySelector('[data-journey-go="2"]').click();assert.equal(b.run('journeyStep'),2);assert.equal(b.document.querySelector('[data-journey-node="tld"]').classList.contains('is-active'),true);
 b.run("activateTab('overview',true)");b.back();assert.equal(b.document.body.dataset.activeTab,'how');assert.equal(b.run('journeyStep'),2);
 const labels=['tocHowDimensions','tocHowAnatomy','tocHowRoles','tocHowLifecycle','tocHowEconomics','tocHowBirth','tocHowModels','tocHowTerms','tocHowLevers','tocHowLuganoCase','tocHowLuganoGovernance','tocHowLuganoLanguage'];
 for(let n=1;n<=12;n++){assert.ok(b.document.getElementById('how-part-'+n));assert.equal(b.document.querySelector('#how .tocLink[href$="#how-part-'+n+'"]').textContent,dictionary[labels[n-1]],lang+' stable chapter label '+n);}
 b=browser(lang,'?walk=4#internet-basics');assert.equal(b.document.body.dataset.activeTab,'how');assert.equal(b.run('journeyStep'),4);
 b=browser(lang,'?tab=how&walk=99');assert.equal(b.run('journeyStep'),0,'out-of-range deep link');
 console.log('Validated provenance, chronology, translations, filters, guided journey and URL restoration: '+lang);
}
console.log('Validated '+D.explorer.length+' runtime/CSV records and '+snapshot.files.length+' preserved IANA evidence files.');
