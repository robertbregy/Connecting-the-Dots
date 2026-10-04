const fs=require('fs');
const path=require('path');
const vm=require('vm');
const assert=require('assert/strict');
const {parseHTML}=require('linkedom');
const root=path.resolve(__dirname,'..');
const base='https://robertbregy.github.io/Connecting-the-Dots/';
const languages=['en','it','de','fr'];
const rootHtml=fs.readFileSync(path.join(root,'index.html'),'utf8');
const snapshot=JSON.parse(fs.readFileSync(path.join(root,'data/iana_snapshot.json'),'utf8'));

for(const [language,alias] of [...languages.map(l=>[l,false]),['en',true]]){
  const page=alias?'index.html':language+'/index.html';
  const text=fs.readFileSync(path.join(root,page),'utf8');
  const {document}=parseHTML(text);
  const canonical=base+language+'/';
  assert.equal(document.documentElement.getAttribute('lang'),language,page+' language');
  assert.equal(document.documentElement.getAttribute('data-ctd-language'),language);
  assert.equal(document.querySelectorAll('link[rel="canonical"]').length,1);
  assert.equal(document.querySelector('meta[name="robots"]').getAttribute('content'),'index,follow,max-image-preview:large');
  assert.equal(document.querySelector('link[rel="canonical"]').getAttribute('href'),canonical);
  assert.equal(document.querySelector('meta[property="og:url"]').getAttribute('content'),canonical);
  const alternates=Array.from(document.querySelectorAll('link[hreflang]'));
  assert.equal(alternates.length,5);
  for(const link of alternates){const l=link.getAttribute('hreflang');assert.equal(link.getAttribute('href'),base+(l==='x-default'?'en':l)+'/');}
  const article=JSON.parse(document.getElementById('articleStructuredData').textContent);
  assert.equal(article.inLanguage,language);
  assert.equal(article.mainEntityOfPage,canonical);
  const window={};vm.runInNewContext(document.getElementById('ctd-i18n-bundle').textContent,{window});
  assert.deepEqual(Object.keys(window.DOT_I18N),[language],page+' ships only its own dictionary');
  const translations=window.DOT_I18N[language];
  assert.equal(document.title,translations.metaTitle);
  assert.equal(document.querySelector('meta[name="description"]').getAttribute('content'),translations.metaDescription);
  assert.ok(document.querySelector('[data-i18n="heroBody"]').textContent.length>50);
  assert.equal(document.getElementById('langSelect').value,language);
  const seen=new Set();
  for(const n of document.querySelectorAll('[id]')){assert.ok(!seen.has(n.id),page+' duplicate id '+n.id);seen.add(n.id);}
  for(const id of ['cards','curated2000','processGrid','namespaceDimensions','domainLifecycle','dnsCapabilities','applicationModels','accessModels','successFramework','strangeGrid','semanticDriftGrid','dnsOddities','pressFacts','sourceList','trustLadder','beyondCases','geoMap','demand2012Bars','rsp2026Bars','luganoRoadmap','explorerTableBody']){
    assert.ok(document.getElementById(id)?.innerHTML.trim(),page+' empty prerendered content: '+id);
  }
  for(const n of document.querySelectorAll('[data-i18n]')){
    const key=n.getAttribute('data-i18n');assert.ok(key in translations,page+' missing '+key);
    const value=key==='exploreIanaDate'?translations[key].replace('{date}',new Intl.DateTimeFormat({en:'en-US',it:'it-IT',de:'de-DE',fr:'fr-FR'}[language],{year:'numeric',month:'short',day:'numeric',timeZone:'UTC'}).format(new Date(snapshot.asOf+'T00:00:00Z'))):translations[key];
    const expected=parseHTML('<html><body><div id="value">'+value+'</div></body></html>').document.getElementById('value').textContent;
    assert.equal(n.textContent,expected,page+' unlocalized '+key);
  }
  for(const n of document.querySelectorAll('[src],[href]'))for(const attr of ['src','href']){
    const ref=n.getAttribute(attr);if(!ref||/^(https?:|data:|mailto:|tel:)/.test(ref))continue;
    if(ref.startsWith('#')){assert.ok(document.getElementById(decodeURIComponent(ref.slice(1))),page+' missing fragment '+ref);continue;}
    const local=ref.split(/[?#]/)[0];if(local)assert.ok(fs.existsSync(path.resolve(root,path.dirname(page),local)),page+' missing asset '+ref);
  }
  const languageLinks=document.querySelectorAll('#languageVersions a');assert.equal(languageLinks.length,4);
  for(const a of languageLinks){const l=a.getAttribute('hreflang');assert.equal(new URL(a.getAttribute('href'),new URL(page,base)).href,base+l+'/');}
  assert.ok(document.documentElement.classList.contains('no-js'));
  assert.ok(document.getElementById('staticReading').innerHTML.includes(translations.staticReading));
  console.log('Validated static content, links and metadata: '+page);
}

const routing=fs.readFileSync(path.join(root,'assets/legacy-routing.js'),'utf8');
const cases=[
  ['', 'en/'],
  ['?lang=it&tab=geography&map=rsp&q=AI#geography-part-2','it/?tab=geography&map=rsp&q=AI#geography-part-2'],
  ['?lang=unknown&tab=sources','en/?tab=sources'],
  ['index.html?lang=fr&tab=beyond','fr/?tab=beyond'],
  ['de/?lang=fr&tab=timeline','fr/?tab=timeline'],
  ['it/?lang=it&tab=how','it/?tab=how'],
  ['fr/?tab=beyond',null]
];
for(const [input,target] of cases){
  const url=new URL(input,base);
  const isLocale=languages.some(l=>url.pathname===new URL(l+'/',base).pathname);
  const page=isLocale?languages.find(l=>url.pathname===new URL(l+'/',base).pathname)+'/index.html':'index.html';
  const {document}=parseHTML(page==='index.html'?rootHtml:fs.readFileSync(path.join(root,page),'utf8'));
  let replaced=null;
  const location={href:url.href,protocol:url.protocol,search:url.search,hash:url.hash,replace:v=>replaced=v};
  vm.runInNewContext(routing,{document,location,URL,URLSearchParams});
  assert.equal(replaced,target===null?null:new URL(target,base).href,'legacy route '+input);
}
const sitemap=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
const locations=Array.from(sitemap.matchAll(/<loc>([^<]+)<\/loc>/g),m=>m[1]);
assert.deepEqual(locations,languages.map(l=>base+l+'/'));
assert.equal((sitemap.match(/xhtml:link/g)||[]).length,20);
assert.ok(!/\?lang=/.test(sitemap));
const app=fs.readFileSync(path.join(root,'assets/app.js'),'utf8');
assert.ok(!app.includes('updateSeoLanguage'));
assert.ok(!app.includes('canonicalLink'));
assert.ok(!app.includes('navigator.language'));
const queryFunction=app.split('\n').find(line=>line.startsWith('function setQuery('));
const queryDocument=parseHTML(fs.readFileSync(path.join(root,'fr/index.html'),'utf8')).document;
let historyUrl;
vm.runInNewContext(queryFunction+';setQuery();',{
  document:queryDocument,URLSearchParams,
  location:{protocol:'https:',pathname:'/Connecting-the-Dots/fr/',search:'?lang=fr&tab=geography',hash:'#geography-part-2'},
  history:{replaceState:(_state,_title,url)=>historyUrl=url},
  restoringState:false,compatibleHash:()=> '#geography-part-2',syncSectionLinks:()=>{},activeTab:'geography',explorerPreset:'all',geoMode:'rsp',syncLanguageLinks:()=>{}
});
assert.equal(historyUrl,'/Connecting-the-Dots/fr/?tab=geography&map=rsp#geography-part-2','UI URL must preserve deep-link fragments');
console.log('Validated legacy redirects, stable page language and reciprocal four-language sitemap.');
