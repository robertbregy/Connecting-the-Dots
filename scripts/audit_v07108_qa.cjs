/* Read-only acceptance tests for the concrete 10 November audit findings. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {parseHTML}=require('linkedom');
const {markdown}=require('./render_discovery.cjs');
const root=path.resolve(__dirname,'..'),pub=JSON.parse(fs.readFileSync(path.join(root,'publication.json'),'utf8'));
const langs=['en','it','de','fr'],base=pub.deployment;
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const doc=p=>parseHTML(read(p)).document;
const dictionary=JSON.parse(read('data/translations.json'));
const sitemap=read('sitemap.xml');
const routes=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
const shared=['city-namespace-style','tld-cultural-style','tld-market-style','audit-20261019-style','ctd-b2-cross-style','ctd-native-governance-css'];
let headingsChecked=0,sharedReferences=0,metadataChecked=0,markdownChecked=0;
for(const url of routes){
 const relative=url.slice(base.length),file=relative.endsWith('/')?relative+'index.html':relative;
 const html=read(file),document=doc(file);
 assert.equal(document.querySelector('link[rel="canonical"]').getAttribute('href'),url,'Canonical drift '+file);
 assert.ok(!html.includes('auditHierarchyBridge'),'Invisible hierarchy bridge remains '+file);
 if(/^(guides|tlds|economics|applications|inside-the-round|research\/reader-study)\//.test(file)){
  const d=document.querySelector('meta[name="description"]')?.getAttribute('content');
  assert.ok(d&&d.length>=50,'Missing meaningful description '+file);
  for(const key of ['og:title','og:description','og:url','og:image'])assert.ok(document.querySelector('meta[property="'+key+'"]')?.getAttribute('content'),'Missing '+key+' '+file);
  assert.equal(document.querySelectorAll('.editorialType').length,1,'Page grammar '+file);metadataChecked++;
 }
 if(/^(guides|tlds|economics)\//.test(file)){
  assert.equal(document.querySelectorAll('.discoveryHero > .discoveryEyebrow, .discoveryHero > .editorialType').length,1,'Duplicate page-type label '+file);
  assert.ok(document.querySelector('.discoveryHero > .discoveryEyebrow.editorialType'),'Existing page label must be reused '+file);
 }
 if(/^(guides|tlds|economics|discovery)\//.test(file)){
  const lang=document.documentElement.lang,text=read(file.replace(/\.html$/,'.md'));
  const preface='<!-- Canonical: '+url+' | Site edition: '+pub.version+' | Language: '+lang+' -->\n\n';
  assert.equal(text,preface+markdown(document.querySelector('main'),url),'Text edition differs from final reading page '+file);
  const notice=document.querySelector('.roundStatus');
  if(notice){
   assert.ok(text.includes(notice.querySelector('strong').textContent),'Text edition missing snapshot date '+file);
   assert.ok(text.includes(notice.querySelector('a').getAttribute('href')),'Text edition missing milestone source '+file);
  }
  markdownChecked++;
 }
 for(const link of document.querySelectorAll('link[data-shared-style]')){
  assert.ok(shared.includes(link.getAttribute('data-shared-style')),'Unknown shared module');
  const target=path.resolve(path.dirname(path.join(root,file)),link.getAttribute('href').split('?')[0]);
  assert.ok(fs.existsSync(target),'Missing shared module '+file);sharedReferences++;
 }
 for(const id of shared)assert.ok(!document.querySelector('style#'+id),'Repeated inline CSS '+file);
 if(/^(inside-the-round|economics)\//.test(file)&&(/inside-the-round/.test(file)||/\/round-2026\//.test(file))){
  const headings=[...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(h=>Number(h.tagName.slice(1)));
  assert.ok(headings.length>3&&headings[0]===1,'Empty heading assertion '+file);
  for(let i=1;i<headings.length;i++)assert.ok(headings[i]<=headings[i-1]+1,'Heading jump '+file+' '+headings[i-1]+'→'+headings[i]);
  headingsChecked++;
 }
}
assert.equal(headingsChecked,8);
assert.ok(sharedReferences>20,'Shared module extraction did not run');
for(const lang of langs){
 const native=doc(lang+'/index.html');
 for(const release of JSON.parse(read('data/release_history.json')).releases){
  assert.ok(dictionary[lang][release.summaryKey],lang+' missing '+release.summaryKey);
  assert.ok(!native.querySelector('#releaseHistory').textContent.includes(release.summaryKey),lang+' exposed internal release key');
 }
 const wdo=native.querySelector('#behind-case-wdo-identity .behindStoryLink');
 assert.equal(wdo.getAttribute('href'),base+'behind-the-round/'+lang+'/wdo-identity/','WDO language continuity');
 const wdoPage=doc('behind-the-round/'+lang+'/wdo-identity/index.html');
 assert.equal(wdoPage.querySelector('h1').textContent,dictionary[lang].wdoCaseTitle,'Specific WDO headline');
 assert.ok(native.querySelector('#meow-crowdfunding'),'Stable .meow story anchor missing');
 const reader=doc('research/reader-study/'+lang+'/index.html');
 assert.ok(reader.querySelector('.editorialType').textContent.length>5,'Research protocol type missing');
 for(const alternate of [...langs,'x-default'])assert.ok(reader.querySelector('link[rel="alternate"][hreflang="'+alternate+'"]'),'Reader alternate '+alternate);
 assert.ok(sitemap.includes(base+'research/reader-study/'+lang+'/'),'Reader sitemap');
 assert.ok([...native.querySelectorAll('a[href]')].some(a=>a.getAttribute('href').includes('research/reader-study/'+lang+'/')),'Reader research entry');
 for(const family of ['applications/'+lang,'economics/'+lang+'/round-2026','tlds/'+lang+'/lugano']){
  const p=doc(family+'/index.html');assert.equal(p.querySelector('.roundStatus')?.getAttribute('data-aps-snapshot'),'2026-10-11','Dated snapshot '+family);
 }
 const cases=doc('economics/'+lang+'/cases/index.html');
 for(const card of cases.querySelectorAll('.economicCase[id]'))assert.ok(cases.querySelector('a[href="#'+card.id+'"]'),'Case index missing '+card.id);
}
assert.ok(doc('research/index.html').querySelector('a[href*="research/reader-study/en/"]'),'Research index protocol link');
assert.equal(doc('index.html').querySelector('#behind-case-wdo-identity .behindStoryLink').getAttribute('href'),base+'behind-the-round/en/wdo-identity/','Root WDO destination must use the publication base');
const protectedPackages=JSON.parse(read('data/frozen_technical_packages.json')).files;
for(const [file,digest]of Object.entries(protectedPackages))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex'),digest,'Frozen archive changed '+file);
console.log('AUDIT_V07108_PASS',JSON.stringify({routes:routes.length,metadataChecked,headingsChecked,markdownChecked,sharedReferences,frozenArchives:Object.keys(protectedPackages).length,locales:4}));
