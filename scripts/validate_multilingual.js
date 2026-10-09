const fs=require('fs');
const path=require('path');
const vm=require('vm');
const assert=require('assert/strict');
const {parseHTML}=require('linkedom');
const root=path.resolve(__dirname,'..');
const base='https://robertbregy.github.io/Connecting-the-Dots/';
assert.ok(fs.existsSync(path.join(root,'assets/og-preview.png')),'Article preview image file missing');
const languages=['en','it','de','fr'];
const rootHtml=fs.readFileSync(path.join(root,'index.html'),'utf8');
const snapshot=JSON.parse(fs.readFileSync(path.join(root,'data/iana_snapshot.json'),'utf8'));
// A green build requires complete translations in every language, not a historical exception list.
const canonicalTranslations=JSON.parse(fs.readFileSync(path.join(root,'data/translations.json'),'utf8'));
const sourceTemplate=fs.readFileSync(path.join(root,'src/index.web.html'),'utf8');
const applicationSource=fs.readFileSync(path.join(root,'assets/app.js'),'utf8');
const requiredKeys=new Set([
  ...Array.from(sourceTemplate.matchAll(/data-i18n="([^"]+)"/g),m=>m[1]),
  ...Array.from(applicationSource.matchAll(/\b(?:t|tx)\(\s*['"]([A-Za-z0-9_]+)['"]\s*[,)]/g),m=>m[1])
]);
for(const theme of ['economics','social','contention','outcomes','disputes','strange'])
  for(const year of ['2000','2004','2012','2026']) requiredKeys.add(theme+'Round'+year);
for(const language of languages){
  const translations=canonicalTranslations[language];
  assert.ok(translations,language+' translation dictionary is missing');
  for(const key of requiredKeys)
    assert.ok(typeof translations[key]==='string'&&translations[key].trim(),language+' missing translation: '+key);
}
const translationKeys=new Set(languages.flatMap(lang=>Object.keys(canonicalTranslations[lang])));



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
  // All four languages must expose the same disclosure and six real how-to anchors.
  const behind=document.getElementById('behind-round');
  const behindMenu=document.querySelector('[data-target="behind-round"]');
  assert.ok(behind&&behindMenu,page+' Behind the Round missing from program navigation');
  assert.equal(behindMenu.textContent.trim(),translations.behindNav,page+' untranslated Behind the Round menu');
  assert.ok(behind.querySelector('[data-behind-story="reveal-day-counts"]'),page+' missing main field note');
  assert.equal(behind.querySelectorAll('[data-source-id]').length,7,page+' incomplete original field note sources');
  const behindGuide=document.querySelector('a[data-behind-round-guide]');
  assert.equal(behindGuide?.getAttribute('href'),base+'behind-the-round/'+language+'/',page+' wrong field-note guide locale');
  assert.ok(behind.textContent.includes('1,616')&&behind.textContent.includes('1,615')&&behind.textContent.includes('1,614'),page+' published numerical facts missing');
  const standalone=fs.readFileSync(path.join(root,'behind-the-round',language,'index.html'),'utf8');
  const standaloneDocument=parseHTML(standalone).document;
  assert.equal(standaloneDocument.documentElement.getAttribute('lang'),language,page+' field-note page lang');
  assert.equal(standaloneDocument.querySelector('link[rel="canonical"]').getAttribute('href'),base+'behind-the-round/'+language+'/',page+' field-note canonical');
  assert.equal(standaloneDocument.querySelectorAll('link[rel="alternate"][hreflang]').length,5,page+' field-note hreflang');
  assert.equal(standaloneDocument.querySelector('meta[name="robots"]').getAttribute('content'),'index,follow,max-image-preview:large',page+' field-note indexing');
  assert.equal(standaloneDocument.querySelectorAll('[data-source-id]').length,7,page+' standalone evidence incomplete');
  assert.equal(standaloneDocument.querySelectorAll('.behindFinding').length,2,page+' explanatory statuses missing');
  assert.equal(standaloneDocument.querySelectorAll('[data-editorial-revision]').length,1,page+' dated correction history missing');
  assert.ok(standalone.includes(translations.behindTitle)&&standalone.includes('WDO2627T-T45217'),page+' translated field note missing');
  const articleSchema=JSON.parse(standaloneDocument.querySelector('script[type="application/ld+json"]').textContent);
  assert.equal(articleSchema.dateModified,'2026-10-10',page+' dated field-note revision missing');
  assert.equal(articleSchema.image,base+'assets/og-preview.png',page+' field-note Article image');
  assert.ok(translations.behindMetaDescription.length<=160,page+' overlong field-note description');
  assert.equal(articleSchema.citation.length,7,page+' schema citation list incomplete');
  const howMenu=document.querySelector('.navMenu[data-label-key="tabHow"]');
  assert.ok(howMenu,page+' missing How disclosure');
  const howTrigger=howMenu.querySelector('.navMenuTrigger');
  assert.equal(howTrigger.getAttribute('aria-controls'),'navHowDropdown',page+' How dropdown target');
  assert.equal(howTrigger.getAttribute('aria-expanded'),'false',page+' closed How disclosure on entry');
  const howLinks=[...howMenu.querySelectorAll('#navHowDropdown .tab')];
  const howIds=['how','how-part-1','how-part-3','how-part-5','how-part-8','how-part-10'];
  assert.deepEqual(howLinks.map(a=>a.dataset.anchor),howIds,page+' complete How table of contents');
  for(const link of howLinks){
    const key=link.getAttribute('data-i18n'),anchor=link.getAttribute('data-anchor');
    assert.equal(link.dataset.target,'how',page+' incorrect How parent');
    assert.equal(link.textContent.trim(),translations[key],page+' untranslated How chapter '+key);
    assert.ok(document.getElementById(anchor),page+' How chapter anchor missing '+anchor);
    assert.ok(link.getAttribute('href').includes('#'+anchor),page+' chapter permalink lost: '+anchor);
  }
  assert.equal(document.querySelector('#how > .sectionToc'),null,page+' redundant How subnavigation boxes');
  const mobileChoices=[...document.querySelectorAll('#mobileNav option')].map(opt=>opt.getAttribute('value'));
  for(const anchor of howIds)assert.ok(mobileChoices.includes('how#'+anchor),page+' missing mobile How chapter '+anchor);
  assert.ok(!mobileChoices.includes('how'),page+' mobile How sections must have unique values');
  const tocLinks=[...document.querySelectorAll('.sectionToc .tocLink')];
  assert.ok(tocLinks.every(n=>(n.getAttribute('title')||'').length<=180),page+' overlong navigation tooltip');
  const seen=new Set();
  for(const n of document.querySelectorAll('[id]')){assert.ok(!seen.has(n.id),page+' duplicate id '+n.id);seen.add(n.id);}
  for(const id of ['cards','curated2000','processGrid','namespaceDimensions','domainLifecycle','dnsCapabilities','applicationModels','accessModels','successFramework','strangeGridAll','semanticDriftGrid','dnsOddities','pressFacts','sourceList','trustLadder','beyondCases','geoMap','demand2012Bars','rsp2026Bars','luganoRoadmap','explorerTableBody']){
    assert.ok(document.getElementById(id)?.innerHTML.trim(),page+' empty prerendered content: '+id);
  }
  for(const n of document.querySelectorAll('[data-i18n]')){
    const key=n.getAttribute('data-i18n');
    assert.ok(Object.hasOwn(translations,key),page+' unlocalized key '+key);
    const value=key==='exploreIanaDate'?translations[key].replace('{date}',new Intl.DateTimeFormat({en:'en-US',it:'it-IT',de:'de-DE',fr:'fr-FR'}[language],{year:'numeric',month:'short',day:'numeric',timeZone:'UTC'}).format(new Date(snapshot.asOf+'T00:00:00Z'))):translations[key];
    const expected=parseHTML('<html><body><div id="value">'+value+'</div></body></html>').document.getElementById('value').textContent;
    assert.ok(n.textContent.includes(expected),page+' unlocalized '+key);
  }
  // Detect unresolved dynamic captions and inaccessible link labels.
  for(const n of document.querySelectorAll('.themeRoundCard p')){
    const value=n.textContent.trim();
    assert.ok(!translationKeys.has(value),page+' raw round-description key '+value);
    assert.ok(value.length>24,page+' empty or truncated round-description text');
  }
  for(const n of document.querySelectorAll('[aria-label]')){
    const value=n.getAttribute('aria-label')||'';
    const tokens=value.match(/\b[a-z][A-Za-z0-9]*[A-Z][A-Za-z0-9]*\b/g)||[];
    assert.ok(!tokens.some(token=>translationKeys.has(token)),page+' unresolved aria-label '+value);
  }
  const reveal=document.getElementById('round2026Grid');
  assert.ok(reveal&&reveal.textContent.includes('263')&&reveal.textContent.includes('333'),page+' stale Reveal Day metrics');
  const home=document.getElementById('cards');
  assert.ok(home&&home.querySelector('.num').textContent.replace(/\D/g,'')==='1615',page+' obsolete 1,616 application total');
  assert.ok(document.getElementById('demand2026Bars')?.textContent.includes('198'),page+' missing official regional applicant counts');
  assert.ok(document.getElementById('research')?.textContent.includes('10.5281/zenodo.23262623'),page+' RR1 DOI is missing');
  for(const n of document.querySelectorAll('[src],[href]'))for(const attr of ['src','href']){
    const ref=n.getAttribute(attr);if(!ref||/^(https?:|data:|mailto:|tel:)/.test(ref))continue;
    if(ref.startsWith('#')){assert.ok(document.getElementById(decodeURIComponent(ref.slice(1))),page+' missing fragment '+ref);continue;}
    const local=ref.split(/[?#]/)[0];if(local)assert.ok(fs.existsSync(path.resolve(root,path.dirname(page),local)),page+' missing asset '+ref);
  }
  const languageLinks=document.querySelectorAll('#languageVersions a');assert.equal(languageLinks.length,4);
  for(const a of languageLinks){const l=a.getAttribute('hreflang');assert.equal(new URL(a.getAttribute('href'),new URL(page,base)).href,base+l+'/');}
  assert.ok(document.documentElement.classList.contains('no-js'));
  assert.ok(document.getElementById('staticReading').innerHTML.includes(translations.staticReading));
  assert.equal(document.querySelectorAll('#journeySteps .journeyStep').length,7,page+' complete static guide');
  assert.ok(document.getElementById('internet-basics').textContent.includes(translations.journeyTitle));
  for(let step=0;step<7;step++){
    const scene=document.querySelector('[data-journey-scene="'+step+'"]');
    assert.ok(scene.textContent.includes(translations['journey'+step+'Body']),page+' static step '+step);
    assert.ok(scene.textContent.includes(translations['journey'+step+'Detail']),page+' static detail '+step);
    assert.ok(!scene.hasAttribute('hidden'),page+' no-JS guide');
  }
  assert.equal(document.querySelectorAll('#internet-guide [href^="https://www.example.com"],#internet-guide [src^="https://www.example.com"]').length,0,page+' illustrative address only');
  assert.equal(document.querySelector('#internet-guide .journeyDiagram').getAttribute('aria-hidden'),'true',page+' diagram has equivalent narrative');
  assert.equal(document.getElementById('journeyAnnounce').getAttribute('aria-live'),'polite');
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
const expectedLocations=[...languages.map(l=>base+l+'/'),base+'explorer/',base+'research/',base+'research/connecting-the-dots-working-paper-v1.html',...languages.map(l=>base+'inside-the-round/'+l+'/'),...languages.map(l=>base+'behind-the-round/'+l+'/')];
assert.deepEqual(locations,expectedLocations,'complete multilingual and research sitemap');
assert.equal((sitemap.match(/xhtml:link/g)||[]).length,60,'main languages, timeline and field notes all use hreflang');
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
  restoringState:false,compatibleHash:()=> '#geography-part-2',syncSectionLinks:()=>{},activeTab:'geography',explorerPreset:'all',explorerProfileId:'',geoMode:'rsp',syncLanguageLinks:()=>{},syncFeedbackLinks:()=>{}
});
assert.equal(historyUrl,'/Connecting-the-Dots/fr/?tab=geography&map=rsp#geography-part-2','UI URL must preserve deep-link fragments');
console.log('Validated legacy redirects, stable page language and reciprocal four-language sitemap.');
