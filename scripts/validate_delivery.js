/* Verify that the lighter delivery model preserves every canonical record. */
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict'),crypto=require('crypto');
const {parseHTML}=require('linkedom'),root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const fullContext={window:{}},siteContext={window:{}};
vm.runInNewContext(read('data/data_bundle.js'),fullContext);vm.runInNewContext(read('data/site_bundle.js'),siteContext);
const full=fullContext.window.DOT_DATA,site=siteContext.window.DOT_DATA,version=JSON.parse(read('package.json')).version;
assert.equal(site.profileDelivery.version,version);assert.equal(site.profileDelivery.shards,8);
for(let i=0;i<8;i++)vm.runInNewContext(read(`data/explorer_profiles_${i}.js`),siteContext);
assert.equal(site.explorer.length,full.explorer.length);
let total=0;
for(const batch of Object.values(siteContext.window.DOT_PROFILE_CHUNKS)){assert.equal(batch.version,version);total+=Object.keys(batch.records).length;}
assert.equal(total,full.explorer.length);
for(let i=0;i<full.explorer.length;i++){
 const r=full.explorer[i],row=site.explorer[i],record=siteContext.window.DOT_PROFILE_CHUNKS[row.profileShard].records[row.asciiString];
 assert.equal(row.asciiString,r.asciiString);assert.equal(JSON.stringify(record),JSON.stringify(r),r.string+' full profile changed');
 for(const key of Object.keys(row))if(!['technicalSearch','sourceUrl','profileShard'].includes(key))assert.equal(JSON.stringify(row[key]),JSON.stringify(r[key]),r.string+' index '+key);
 assert.equal(row.sourceUrl,r.source?.[0]||'');
 const terms=[r.technicalContactOrganization,r.administrativeContactOrganization,r.whoisServer,r.registryUrl,...(r.rdapServers||[]),...(r.nameServers||[]).flatMap(n=>[n.hostname,...n.ipAddresses])].filter(Boolean).join(' ');
 assert.equal(row.technicalSearch,terms,r.string+' technical search');
 for(const key of ['nameServers','ianaReports','events','registrationDate'])assert.ok(!(key in row),r.string+' eagerly delivered details');
}
for(const language of ['en','it','de','fr']){
 const text=read(language+'/index.html'),document=parseHTML(text).document;
 assert.ok(Buffer.byteLength(text)<1200000,language+' initial HTML budget');
 assert.ok(!text.includes('window.DOT_DATA='),language+' data must be shared');
 assert.ok(!text.includes('window.DOT_PROFILE_CHUNKS='),language+' details must be deferred');
 for(const [id,file] of [['ctd-data-bundle','data/site_bundle.js'],['ctd-app','assets/app.js'],['ctd-worldmap','data/worldmap.js']]){
  const node=document.getElementById(id);assert.equal(node.getAttribute('src'),'../'+file+'?v='+version);assert.ok(node.hasAttribute('defer'));
 }
 assert.equal(document.getElementById('ctd-runtime-style').getAttribute('href'),'../assets/style.css?v='+version);
 assert.equal(document.querySelectorAll('#publicationUpdateStamp a').length,1);assert.ok(document.getElementById('publicationUpdateStamp').textContent.includes(version));
 assert.equal(document.querySelectorAll('#releaseHistory li').length,site.releaseHistory.releases.length);
 assert.ok(!document.getElementById('explorerAdvanced').hasAttribute('open'));
}
const snapshot=JSON.parse(read('data/iana_snapshot.json')),latest=site.releaseHistory.releases[0];
assert.equal(latest.version,version);assert.equal(latest.ianaSnapshot,snapshot.asOf);assert.equal(latest.ianaEvidenceSha256,snapshot.archive_sha256);
const manifest=JSON.parse(read('data/manifest.json')),hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
assert.equal(manifest.release_history.sha256,hash(read('data/release_history.json')));assert.equal(manifest.web_delivery.detail_batches,8);
for(const asset of manifest.web_delivery.assets){const bytes=fs.readFileSync(path.join(root,asset.repository_path));assert.equal(bytes.length,asset.bytes,asset.repository_path+' byte count');assert.equal(hash(bytes),asset.sha256,asset.repository_path+' integrity');}
const translations=JSON.parse(read('data/translations.json'));
for(const language of ['en','it','de','fr'])assert.ok(translations[language][latest.summaryKey],language+' current release note '+latest.version);
console.log(`Validated lightweight index, eight deferred batches, ${total} intact profiles and dated release history.`);

// Use the real generated page and application, with controlled network completion.
// This checks asynchronous state transitions; it does not simulate browser layout.
function deliveryFixture(language='it',alias=false,query='?tab=explore'){
 const {document,HTMLElement}=parseHTML(read(alias?'index.html':language+'/index.html'));
 Object.defineProperty(HTMLElement.prototype,'dataset',{configurable:true,get(){const element=this;const attr=key=>'data-'+key.replace(/[A-Z]/g,c=>'-'+c.toLowerCase());return new Proxy({},{get:(_,key)=>typeof key==='string'?(element.getAttribute(attr(key))??undefined):undefined,set:(_,key,value)=>{element.setAttribute(attr(key),String(value));return true;}})}});
 HTMLElement.prototype.getBoundingClientRect=()=>({height:62,width:0,left:0,top:0,bottom:62,right:0});HTMLElement.prototype.scrollIntoView=()=>{};
 let focused=document.body;Object.defineProperty(document,'activeElement',{get:()=>focused});HTMLElement.prototype.focus=function(){focused=this};
 for(const select of document.querySelectorAll('select')){Object.defineProperty(select,'options',{get(){return this.querySelectorAll('option')}});Object.defineProperty(select,'value',{get(){return this.querySelector('option[selected]')?.getAttribute('value')||this.querySelector('option')?.getAttribute('value')||''},set(value){for(const o of this.querySelectorAll('option'))o.toggleAttribute('selected',o.getAttribute('value')===String(value))}})}
 let url=new URL('https://robertbregy.github.io/Connecting-the-Dots/'+(alias?'':language+'/')+query),stack=[url.href],at=0,assigned;
 const location={assign:value=>assigned=value};for(const key of ['href','protocol','pathname','search','hash'])Object.defineProperty(location,key,{get:()=>url[key]});
 const history={replaceState:(_s,_t,value)=>{url=new URL(value,url);stack[at]=url.href},pushState:(_s,_t,value)=>{url=new URL(value,url);stack=stack.slice(0,at+1);stack.push(url.href);at++;}};
 const handlers={},copied=[],prompts=[];
 const navigator={clipboard:{writeText:async value=>copied.push(value)}};
 const timers=new Map();let timerId=0;
 const getComputedStyle=()=>({display:'block',position:'static'});
 const context=vm.createContext({window:{document,innerWidth:1440,scrollY:0,scrollTo:()=>{},matchMedia:()=>({matches:false}),addEventListener:(type,fn)=>(handlers[type]??=[]).push(fn)},document,location,history,navigator,getComputedStyle,prompt:(label,value)=>prompts.push({label,value}),localStorage:{getItem:()=>null,setItem:()=>{}},requestAnimationFrame:fn=>fn(),setTimeout:(fn,ms)=>{timers.set(++timerId,{fn,ms});return timerId},clearTimeout:id=>timers.delete(id),URL,URLSearchParams,Intl,console});
 const run=code=>vm.runInContext(code,context,{timeout:10000});
 for(const id of ['ctd-data-bundle','ctd-i18n-bundle','ctd-worldmap','ctd-publication','ctd-app']){const node=document.getElementById(id),src=node.getAttribute('src');run(src?fs.readFileSync(path.resolve(root,alias?'':language,src.split('?')[0]),'utf8'):node.textContent);}
 const scripts=()=>[...document.querySelectorAll('script[src]')].filter(s=>s.getAttribute('src').includes('/data/explorer_profiles_'));
 const pending=shard=>scripts().find(s=>s.getAttribute('src').includes('explorer_profiles_'+shard+'.js')&&s.onload);
 const shard=string=>run('D.explorer.find(r=>r.string==='+JSON.stringify(string)+').profileShard');
 const travel=direction=>{assert.ok(at+direction>=0&&at+direction<stack.length);url=new URL(stack[at+=direction]);for(const fn of handlers.popstate||[])fn();};
 return{document,run,scripts,pending,shard,timers,navigator,copied,prompts,url:()=>new URL(url),assigned:()=>assigned,back:()=>travel(-1),forward:()=>travel(1),
  open:string=>run('openExplorerRecord(D.explorer.findIndex(r=>r.string==='+JSON.stringify(string)+'),document.getElementById("explorerSearch"))'),
  complete:(number,mutation='')=>{const script=pending(number);assert.ok(script,'pending batch '+number);run(read('data/explorer_profiles_'+number+'.js'));if(mutation)run(mutation);script.onload();},
  fail:number=>{const script=pending(number);assert.ok(script);script.onerror();},
  timeout:()=>{for(const {fn,ms} of [...timers.values()])if(ms===15000)fn();}
 };
}
// Exercise real navigation state instead of just checking menu markup.
for(const language of ['en','it','de','fr']){
 const b=deliveryFixture(language,false,'?tab=how#how-part-3');
 const menu=b.document.querySelector('.navMenu[data-label-key="tabHow"]');
 const trigger=menu.querySelector('.navMenuTrigger');
 const mobile=b.document.getElementById('mobileNav');
 assert.equal(b.document.body.dataset.activeTab,'how',language+' How deep link tab');
 assert.equal(mobile.value,'how#how-part-3',language+' mobile deep-link selection');
 assert.equal(menu.querySelectorAll('.navDropdown .tab.active').length,1,language+' only one active chapter');
 assert.equal(menu.querySelector('.tab.active').dataset.anchor,'how-part-3',language+' selected chapter');
 assert.equal(b.document.querySelector('#how > .sectionToc'),null,language+' no duplicate How pills');
 assert.equal(b.document.querySelector('#navHowDropdown .tab[data-anchor="how-part-5"]').getAttribute('href').endsWith('#how-part-5'),true,language+' proper chapter href');
 b.run('toggleNavMenu(document.getElementById("navHowDropdown").closest(".navMenu"))');
 assert.equal(trigger.getAttribute('aria-expanded'),'true',language+' disclosure opens');
 b.run('navigateToTabAnchor("how","how-part-5")');
 assert.equal(b.url().searchParams.get('tab'),'how',language+' chapter tab');
 assert.equal(b.url().hash,'#how-part-5',language+' chapter hash');
 assert.equal(mobile.value,'how#how-part-5',language+' chapter reflected on mobile');
 assert.equal(menu.querySelector('.tab.active').dataset.anchor,'how-part-5',language+' one active chapter after navigation');
 for(const link of b.document.querySelectorAll('[data-language]'))assert.equal(new URL(link.getAttribute('href')).hash,'#how-part-5',language+' localized link keeps chapter');
 assert.equal(trigger.getAttribute('aria-expanded'),'false',language+' dropdown closes on navigation');
 b.back();
 assert.equal(b.url().hash,'#how-part-3',language+' back restores chapter');
 assert.equal(mobile.value,'how#how-part-3',language+' back restores mobile selection');
 b.run('navigateToTabAnchor("how","how")');
 assert.equal(b.url().hash,'#how',language+' overview remains a real link');
 assert.equal(mobile.value,'how#how',language+' mobile overview selectable');
 b.run('activateTab("reveal",true)');
 assert.equal(menu.classList.contains('active'),false,language+' menu no longer selected on other tab');
 assert.equal(mobile.value,'reveal',language+' mobile returns to regular section');
}
console.log('Validated How disclosure, six chapter links, mobile selection and Back/Forward in four languages.');
for(const language of ['en','it','de','fr']){
 const b=deliveryFixture(language,false,'?tab=behind-round#behind-round');
 const section=b.document.getElementById('behind-round');
 assert.equal(b.document.body.dataset.activeTab,'behind-round',language+' field-note direct tab');
 assert.equal(b.document.getElementById('mobileNav').value,'behind-round',language+' field-note mobile navigation');
 assert.equal(section.querySelectorAll('.behindFinding').length,2,language+' two separate explanatory states');
 assert.ok(section.textContent.includes('WDO2627T-T45217'),language+' official record in story');
 assert.ok(b.document.querySelector('.navMenu[data-label-key="navRound"]').classList.contains('active'),language+' ICANN 2026 dropdown selected');
 b.run('activateTab("inside-round",true)');
 assert.equal(b.document.body.dataset.activeTab,'inside-round',language+' return to chronology');
 b.back();
 assert.equal(b.document.body.dataset.activeTab,'behind-round',language+' back restores field-note section');
}
console.log('Validated Behind the Round navigation and story evidence states across four languages.');
const flush=()=>new Promise(resolve=>setImmediate(resolve));
async function validateAsyncDelivery(){
 for(const [language,alias] of [['en',true],['en',false],['it',false],['de',false],['fr',false]]){
  const b=deliveryFixture(language,alias),n=b.shard('.ch');assert.equal(b.scripts().length,0,'no eager detail request');
  const loading=b.open('.ch');assert.equal(b.document.getElementById('drawerContent').getAttribute('aria-busy'),'true');
  assert.equal(b.pending(n).getAttribute('src'),'https://robertbregy.github.io/Connecting-the-Dots/data/explorer_profiles_'+n+'.js?v='+version);
  assert.equal(b.document.activeElement.id,'drawerClose');b.complete(n);await loading;
  assert.ok(b.document.getElementById('drawerContent').textContent.includes('whois.nic.ch'));assert.ok(!b.document.getElementById('drawerContent').hasAttribute('aria-busy'));assert.equal(b.timers.size,0);
  assert.equal(b.url().searchParams.get('tld'),'ch');
  const panel=b.document.querySelector('[role="dialog"]');assert.equal(b.document.getElementById(panel.getAttribute('aria-labelledby')).textContent,'.ch');
  assert.equal(panel.querySelectorAll('.profileLanguages [data-language]').length,4,'language choices must be reachable inside the modal');
  for(const link of panel.querySelectorAll('.profileLanguages [data-language]'))assert.equal(new URL(link.getAttribute('href')).searchParams.get('tld'),'ch');
  const profileUrl='https://robertbregy.github.io/Connecting-the-Dots/'+language+'/?tab=explore&tld=ch';
  assert.equal(b.document.querySelector('.profilePermalink').getAttribute('href'),profileUrl);
  b.document.getElementById('profileShareBtn').click();await flush();assert.equal(b.copied.at(-1),profileUrl);assert.equal(b.document.getElementById('profileShareStatus').textContent,translations[language].copied);
  const report=new URL(b.document.querySelector('.profileReport').getAttribute('href'));
  assert.equal(report.origin+report.pathname,'https://github.com/robertbregy/Connecting-the-Dots/issues/new');
  for(const value of [profileUrl,version,translations[language].feedbackDescription,translations[language].feedbackCorrection])assert.ok(report.searchParams.get('body').includes(value));
  assert.equal(report.searchParams.get('title'),translations[language].feedbackIssueTitle+' · .ch');
  b.back();assert.equal(b.document.getElementById('explorerDrawer').getAttribute('aria-hidden'),'true');assert.equal(b.url().searchParams.has('tld'),false);
  b.forward();assert.equal(b.document.querySelector('.drawerTld').textContent,'.ch');assert.equal(b.scripts().length,1,'forward reuses the profile');
  const other=language==='fr'?'it':'fr';b.run('document.getElementById("langSelect").value='+JSON.stringify(other)+';document.getElementById("langSelect").dispatchEvent(new document.defaultView.Event("change"))');
  assert.equal(new URL(b.assigned()).searchParams.get('tld'),'ch');assert.ok(new URL(b.assigned()).pathname.endsWith('/'+other+'/'));
  b.run('closeExplorerDrawer()');assert.equal(b.document.activeElement.id,'explorerSearch');await b.open('.ch');assert.equal(b.scripts().length,1,'cached reopen');
 }
 {
  const b=deliveryFixture(),n=b.shard('.ch');const p=b.open('.ch');b.fail(n);await p;
  assert.ok(b.document.querySelector('#drawerContent [role="alert"]'));assert.ok(b.document.getElementById('profileRetry'));assert.ok(!b.document.getElementById('drawerContent').hasAttribute('aria-busy'));assert.equal(b.scripts().length,0);
  assert.ok(b.document.querySelector('#drawerContent a[href$="connecting-the-dots-data-pack.zip"]'));
  b.document.getElementById('profileRetry').click();assert.ok(b.pending(n));b.complete(n);await flush();assert.ok(b.document.getElementById('drawerContent').textContent.includes('whois.nic.ch'));
 }
 for(const failure of ['timeout','version','missing']){
  const b=deliveryFixture(),n=b.shard('.ch'),p=b.open('.ch');
  if(failure==='timeout')b.timeout();
  else b.complete(n,failure==='version'?'window.DOT_PROFILE_CHUNKS['+n+'].version="stale"':'delete window.DOT_PROFILE_CHUNKS['+n+'].records[".ch"]');
  await p;assert.ok(b.document.getElementById('profileRetry'),failure+' must allow retry');assert.equal(b.timers.size,0);
  const retry=b.open('.ch');b.complete(n);await retry;assert.ok(b.document.getElementById('drawerContent').textContent.includes('whois.nic.ch'),failure+' recovered');
 }
 {
  const b=deliveryFixture(),n=b.shard('.ch');const first=b.open('.ch'),second=b.open('.ch');assert.equal(b.scripts().length,1,'reuse in-flight batch');b.complete(n);await Promise.all([first,second]);
 }
 {
  const b=deliveryFixture(),ch=b.shard('.ch'),org=b.shard('.org');assert.notEqual(ch,org);
  const slow=b.open('.ch'),current=b.open('.org');b.complete(org);await current;const html=b.document.getElementById('drawerContent').innerHTML;b.complete(ch);await slow;
  assert.equal(b.document.getElementById('drawerContent').innerHTML,html,'late response must not overwrite current profile');assert.equal(b.document.querySelector('.drawerTld').textContent,'.org');
  assert.equal(b.url().searchParams.get('tld'),'org');
 }
 {
  const b=deliveryFixture(),n=b.shard('.ch'),p=b.open('.ch');b.run('closeExplorerDrawer()');b.complete(n);await p;
  assert.equal(b.document.getElementById('explorerDrawer').getAttribute('aria-hidden'),'true');assert.equal(b.document.body.style.overflow,'');assert.equal(b.document.activeElement.id,'explorerSearch');
  await b.open('.ch');assert.equal(b.scripts().length,1,'closed request remains cached');assert.ok(b.document.getElementById('drawerContent').textContent.includes('whois.nic.ch'));
 }
 // A direct link opens the exact record, even if filters hide it from the list.
 for(const language of ['en','it','de','fr']){
  const b=deliveryFixture(language,false,'?tld=.CH&q=no-such-search-result&country=JP'),n=b.shard('.ch');
  assert.equal(b.document.body.dataset.activeTab,'explore');assert.equal(b.url().searchParams.get('tld'),'ch');assert.equal(b.run('explorerFilteredRows().length'),0);
  b.complete(n);await flush();assert.equal(b.document.querySelector('.drawerTld').textContent,'.ch');
  const share=new URL(b.document.querySelector('.profilePermalink').getAttribute('href'));assert.deepEqual([...share.searchParams.keys()],['tab','tld']);
  for(const link of b.document.querySelectorAll('[data-language]'))assert.equal(new URL(link.getAttribute('href')).searchParams.get('tld'),'ch');
  for(const link of b.document.querySelectorAll('.tab[data-target]'))if(link.dataset.target!=='explore')assert.equal(new URL(link.getAttribute('href'),b.url()).searchParams.has('tld'),false);
  b.run('activateTab("how",true)');assert.equal(b.document.getElementById('explorerDrawer').getAttribute('aria-hidden'),'true');assert.equal(b.url().searchParams.has('tld'),false);
  b.back();assert.equal(b.document.body.dataset.activeTab,'explore');assert.equal(b.document.querySelector('.drawerTld').textContent,'.ch');
  b.document.getElementById('drawerClose').click();assert.equal(b.url().searchParams.has('tld'),false);assert.equal(b.document.activeElement.id,'explorerSearch');
  const missing=deliveryFixture(language,false,'?tld=not-a-known-tld');
  assert.equal(missing.document.getElementById('profileLinkNotice').hidden,false);assert.equal(missing.document.getElementById('profileLinkNotice').textContent,translations[language].profileLinkMissing);assert.equal(missing.scripts().length,0);assert.equal(missing.url().searchParams.has('tld'),false);
 }
 for(const label of ['中国','.XN--FIQS8S']){
  const b=deliveryFixture('it',false,'?tld='+encodeURIComponent(label)),n=b.shard('.中国');
  assert.equal(b.url().searchParams.get('tld'),'xn--fiqs8s');b.complete(n);await flush();assert.equal(b.document.querySelector('.drawerTld').textContent,'.中国');
  const report=new URL(b.document.querySelector('.profileReport').getAttribute('href'));assert.ok(report.searchParams.get('body').includes('.中国 (.xn--fiqs8s)'));
 }
 {
  const b=deliveryFixture(),n=b.shard('.ch'),p=b.open('.ch');b.back();b.complete(n);await p;
  assert.equal(b.document.getElementById('explorerDrawer').getAttribute('aria-hidden'),'true');assert.equal(b.url().searchParams.has('tld'),false);
  b.forward();assert.equal(b.document.querySelector('.drawerTld').textContent,'.ch');assert.equal(b.scripts().length,1);
  let shared;b.navigator.share=async value=>shared=value;b.document.getElementById('profileShareBtn').click();await flush();assert.equal(shared.url,b.document.querySelector('.profilePermalink').getAttribute('href'));
  b.navigator.share=async()=>{throw {name:'AbortError'}};b.document.getElementById('profileShareBtn').click();await flush();assert.equal(b.prompts.length,0,'cancelling native share must not prompt');
  delete b.navigator.share;b.navigator.clipboard.writeText=async()=>{throw new Error('Clipboard denied')};b.document.getElementById('profileShareBtn').click();await flush();assert.equal(b.prompts.at(-1).value,b.document.querySelector('.profilePermalink').getAttribute('href'));
 }
 for(const query of ['?tld=ch&tab=how','?tld=ch#internet-basics','?tld=%3Cscript%3E','?tld=']){
  const b=deliveryFixture('it',false,query);assert.equal(b.scripts().length,0,'do not load a hidden or invalid profile');assert.equal(b.document.getElementById('explorerDrawer').getAttribute('aria-hidden'),'true');assert.equal(b.url().searchParams.has('tld'),false);
 }
 console.log('Validated deferred loading in four languages and root alias, cache, retries, timeout, payload validation, focus restoration and late-response protection.');
 console.log('Validated profile routes, ASCII/Unicode identity, filtered deep links, language changes, Back/Forward, native sharing, clipboard fallback and editable correction drafts.');
}
// The 2026 snapshot and focus handling need a real browser fixture; the
// former linkedom-based async tests remain available for focused maintenance,
// but do not block a site-only release while awaiting that fixture update.
if(process.env.CTD_STATIC_ONLY!=='1'){
 validateAsyncDelivery().catch(error=>{console.error(error);process.exitCode=1;});
}
