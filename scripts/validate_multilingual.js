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
const iaB2Fragment=fs.readFileSync(path.join(root,'src/ia-b2-hubs.html'),'utf8');
const applicationSource=fs.readFileSync(path.join(root,'assets/app.js'),'utf8');
const requiredKeys=new Set([
  ...Array.from(sourceTemplate.matchAll(/data-i18n="([^"]+)"/g),m=>m[1]),
  ...Array.from(iaB2Fragment.matchAll(/data-i18n="([^"]+)"/g),m=>m[1]),
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
  const luganoSection=document.getElementById('lugano');
  assert.equal(luganoSection?.tagName,'SECTION',page+' must preserve semantic .lugano section');
  assert.equal(luganoSection?.querySelector(':scope > .panel.authorDisclosure')?.tagName,'DIV',page+' must preserve the introductory disclosure card (source markup regression)');
  assert.ok(!luganoSection?.hasAttribute('<div'),page+' invalid .lugano attributes');
  assert.ok(document.getElementById('explorerDrawer')?.hasAttribute('hidden'),page+' closed Explorer must not retain focusable modal controls');
  assert.equal(document.querySelectorAll('.explorerMethodDepth > summary').length,1,page+' must preserve complete methodology in an accessible disclosure');
  assert.equal(document.querySelectorAll('[data-access-explainer-link]').length,3,page+' access explanation links must remain present');
  assert.ok(document.querySelector('.accessReadingLink [data-governance-explainer-link]'),page+' general sanctions explanation is missing from How It Works');
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
  // B2 integrates a new task-first UI with all the former sections, not a separate website.
  const iaAreas=['ia-understand','ia-explore','ia-stories','ia-round','ia-research'];
  const iaNav=[...document.querySelectorAll('.iaPrimaryNav .iaPrimaryLink')];
  assert.equal(iaNav.length,5,page+' must show precisely five primary task areas');
  const hubSections=[...document.querySelectorAll('section.iaHub')];
  assert.deepEqual(hubSections.map(x=>x.id),iaAreas,page+' broken IA hub order');
  for(const [index,id] of iaAreas.entries()){
    assert.equal(iaNav[index].getAttribute('data-open-section'),id,page+' IA route destination');
    assert.ok(document.getElementById(id)?.querySelector('h2'),page+' missing real task landing '+id);
    assert.equal(iaNav[index].textContent.trim(),translations[['iaNavUnderstand','iaNavExplore','iaNavStories','iaNavRound','iaNavResearch'][index]],page+' incomplete IA navigation locale');
  }
  assert.equal(document.querySelectorAll('.iaHubCard').length,26,page+' must preserve 25 original IA cards plus the cemetery chapter');
  const legacySections=['cemetery','overview','explore','timeline','how','beyond','cities','geography','economics','social','contention','refusals','disputes','strange','reveal','inside-round','behind-round','lugano','research','paper','resources','sources'];
  for(const id of legacySections)assert.equal(document.getElementById(id)?.tagName,'SECTION',page+' legacy content deleted: '+id);
  assert.ok(document.querySelector('.iaLegacyNavDisclosure .nav'),page+' original desktop deep links inaccessible');
  assert.ok(document.querySelector('.iaLegacyNavDisclosure #mobileNav'),page+' original mobile deep links inaccessible');
  assert.ok(!document.getElementById('iaLegacyNavDisclosure').hasAttribute('open'),page+' legacy overflow must start folded');
  assert.equal(document.querySelector('.iaPrimaryNav').getAttribute('aria-label'),translations.iaPrimaryLabel,page+' IA primary navigation aria-label');
  assert.ok(document.querySelector('[data-i18n="heroBody"]').textContent.includes('Connecting the Dots'),page+' the project itself must be explained immediately');
  assert.ok(document.querySelector('[data-i18n="heroPlain"]').textContent.includes('.lugano'),page+' the candidate string caveat must be visible');
  assert.ok(document.querySelector('[data-i18n="iaProjectDefinition"]').textContent.length>90,page+' project purpose lacks meaningful detail');
  assert.ok(document.querySelector('.iaHomeJumpList a[href="#ia-research"]'),page+' the novice cannot see direct paths');
  assert.ok(document.querySelector('#ia-research a[href="https://doi.org/10.5281/zenodo.23288603"]'),page+' RR2 version-specific DOI not immediately available');
  assert.equal(document.querySelector('#ia-explore [data-b2-resource="atlas"]').getAttribute('href'),(alias?'./':'../')+'applications/'+language+'/',page+' 2026 Atlas should remain in the same branch and locale');
  assert.equal(document.querySelector('#ia-understand [data-b2-resource="access"]').getAttribute('href'),(alias?'./':'../')+'behind-the-round/'+language+'/who-controls-internet-access/',page+' access guide must stay on the current language route');
  assert.equal(document.querySelector('#ia-understand [data-b2-resource="sanctions"]').getAttribute('href'),(alias?'./':'../')+'behind-the-round/'+language+'/sanctions-and-dns/',page+' sanctions guide must stay on the current language route');
  for(const card of document.querySelectorAll('.iaHubCard a[data-open-section]')){
    const target=card.getAttribute('data-open-section'),anchor=card.getAttribute('data-open-anchor');
    assert.ok(legacySections.includes(target),page+' IA card loses canonical target '+target);
    if(anchor)assert.ok(document.getElementById(anchor),page+' IA link anchor lost '+anchor);
  }

  assert.equal(document.title,translations.metaTitle);
  assert.equal(document.querySelector('meta[name="description"]').getAttribute('content'),translations.metaDescription);
  assert.ok(document.querySelector('[data-i18n="heroBody"]').textContent.length>50);
  assert.equal(document.getElementById('langSelect').value,language);
  // All four languages must expose the same disclosure and six real how-to anchors.
  const behind=document.getElementById('behind-round');
  const behindMenu=document.querySelector('[data-target="behind-round"]');
  assert.ok(behind&&behindMenu,page+' Behind the Round missing from program navigation');
  assert.equal(behindMenu.textContent.trim(),translations.behindNav,page+' localized Field Notes menu');
  const expectedNaming={en:['Timeline','Field Notes'],it:['Cronologia','Note dal campo'],de:['Chronologie','Beobachtungen'],fr:['Chronologie','Carnet de terrain']};
  const [timelineLabel,notesLabel]=expectedNaming[language];
  assert.equal(translations.insideNav,timelineLabel,page+' wrong public Timeline label');
  assert.equal(translations.insideTitle,timelineLabel,page+' wrong Timeline heading');
  assert.equal(translations.behindNav,notesLabel,page+' wrong Field Notes label');
  assert.equal(translations.behindTitle,notesLabel,page+' wrong Field Notes heading');
  assert.equal(document.querySelector('[data-target="inside-round"]')?.textContent.trim(),timelineLabel,page+' Timeline menu missing');
  assert.equal(document.getElementById('insideRoundTitle')?.textContent.trim(),timelineLabel,page+' Timeline section heading');
  assert.equal(document.getElementById('behindRoundTitle')?.textContent.trim(),notesLabel,page+' Field Notes section heading');
  const timelineStandalone=parseHTML(fs.readFileSync(path.join(root,'inside-the-round',language,'index.html'),'utf8')).document;
  assert.equal(timelineStandalone.title,translations.insideMetaTitle,page+' standalone Timeline SEO title');
  assert.equal(timelineStandalone.querySelector('h1')?.textContent.trim(),timelineLabel,page+' standalone Timeline heading');
  assert.equal(timelineStandalone.querySelector('link[rel="canonical"]')?.getAttribute('href'),base+'inside-the-round/'+language+'/',page+' chronology URL changed');
  assert.ok(behind.querySelector('[data-behind-story="reveal-day-counts"]'),page+' missing main field note');
  assert.equal(behind.querySelectorAll('[data-behind-story]').length,2,page+' two research cases not published');
  assert.equal(behind.querySelectorAll('[data-source-id]').length,19,page+' incomplete source audit across two cases');
  assert.equal(behind.querySelectorAll('.behindComparisonTable [data-region]').length,5,page+' regional reconciliation missing');
  assert.ok(behind.querySelector('[data-behind-story="wdo-identity"]'),page+' WDO case omitted');
  const newFieldSlugs=['objectors-eoi','replacement-strings'];
  assert.equal(behind.querySelectorAll('[data-field-investigation-teaser]').length,2,page+' two new 2026 investigations not linked');
  for(const slug of newFieldSlugs){
    const teaser=behind.querySelector('[data-field-investigation-teaser="'+slug+'"]');
    const link=teaser?.querySelector('a[data-field-investigation-slug="'+slug+'"]');
    assert.equal(link?.getAttribute('href'),base+'behind-the-round/'+language+'/'+slug+'/',page+' untranslated investigation href: '+slug);
  }
  const behindGuide=document.querySelector('a[data-behind-round-guide]');
  assert.equal(behindGuide?.getAttribute('href'),base+'behind-the-round/'+language+'/',page+' wrong field-note guide locale');
  const groupSeparator={en:',',it:'.',de:'.',fr:' '}[language];
  const expectedFieldCounts=['1616','1615','1614'].map(n=>n.slice(0,-3)+groupSeparator+n.slice(-3));
  assert.deepEqual([...behind.querySelectorAll('.behindFigure strong')].map(el=>el.textContent.trim()),expectedFieldCounts,page+' unlocalized Reveal Day figures');
  assert.equal(behind.querySelector('[data-status="documented"] h3')?.textContent.trim(),translations.behindExplainedTitle,page+' inaccurate .wdo heading');
  assert.deepEqual([...behind.querySelectorAll('.behindComparisonTable tbody tr:last-child td')].slice(0,2).map(x=>x.textContent.trim()),expectedFieldCounts.slice(1),page+' regional totals not localized');
  assert.ok(behind.textContent.includes(translations.behindExplorerBridge),page+' missing Explorer reconciliation');
  const standalone=fs.readFileSync(path.join(root,'behind-the-round',language,'index.html'),'utf8');
  const standaloneDocument=parseHTML(standalone).document;
  assert.deepEqual([...standaloneDocument.querySelectorAll('.behindFigure strong')].map(el=>el.textContent.trim()),expectedFieldCounts,page+' standalone field count formatting');
  assert.ok(standaloneDocument.body.textContent.includes(translations.behindExplorerBridge),page+' standalone Explorer reconciliation missing');
  assert.deepEqual([...standaloneDocument.querySelectorAll('.behindComparisonTable tbody tr:last-child td')].slice(0,2).map(x=>x.textContent.trim()),expectedFieldCounts.slice(1),page+' standalone regional totals not localized');
  assert.equal(standaloneDocument.documentElement.getAttribute('lang'),language,page+' field-note page lang');
  assert.equal(standaloneDocument.title,translations.behindMetaTitle,page+' standalone Field Notes SEO title');
  assert.equal(standaloneDocument.querySelector('h1')?.textContent.trim(),notesLabel,page+' standalone Field Notes heading');
  assert.equal(standaloneDocument.querySelector('link[rel="canonical"]').getAttribute('href'),base+'behind-the-round/'+language+'/',page+' field-note canonical');
  assert.equal(standaloneDocument.querySelectorAll('link[rel="alternate"][hreflang]').length,5,page+' field-note hreflang');
  assert.equal(standaloneDocument.querySelector('meta[name="robots"]').getAttribute('content'),'index,follow,max-image-preview:large',page+' field-note indexing');
  assert.equal(standaloneDocument.querySelectorAll('[data-source-id]').length,19,page+' all source links must be preserved');
  assert.equal(standaloneDocument.querySelectorAll('.behindFinding').length,2,page+' explanatory statuses missing');
  assert.equal(standaloneDocument.querySelectorAll('[data-editorial-revision]').length,3,page+' dated case histories must remain visible');
  assert.ok(standalone.includes(translations.behindTitle)&&standalone.includes('WDO2627T-T45217'),page+' translated field note missing');
  const articleSchema=JSON.parse(standaloneDocument.querySelector('script[type="application/ld+json"]').textContent);
  assert.equal(articleSchema.dateModified,'2026-10-10',page+' dated field-note revision missing');
  assert.equal(articleSchema.image,base+'assets/og-preview.png',page+' field-note Article image');
  assert.ok(translations.behindMetaDescription.length<=160,page+' overlong field-note description');
  assert.equal(articleSchema.citation.length,19,page+' schema citation list incomplete');
  assert.equal(articleSchema['@type'],'CollectionPage',page+' Field Notes index schema is a collection');
  assert.equal(standaloneDocument.querySelectorAll('.behindComparisonTable [data-region]').length,5,page+' regional comparison rows missing');
  assert.ok(standalone.includes('WDO2627T-T45217')&&standalone.includes('World Design Organization'),page+' case distinctions lost');
  assert.equal(standaloneDocument.querySelectorAll('[data-field-investigation-teaser]').length,2,page+' collection missing two 2026 investigation teasers');
  for(const [slug,sourceCount,sectionCount] of [['objectors-eoi',3,4],['replacement-strings',9,5]]){
    const filename=path.join(root,'behind-the-round',language,slug,'index.html');
    const text=fs.readFileSync(filename,'utf8');
    const article=parseHTML(text).document;
    const expectedTitle=translations[slug==='objectors-eoi'?'field03Title':'field04Title'];
    assert.equal(article.documentElement.lang,language,page+' incorrect investigation locale: '+slug);
    assert.equal(article.title,expectedTitle,page+' untranslated investigation title: '+slug);
    assert.equal(article.querySelector('main h1')?.textContent.trim(),expectedTitle,page+' missing main heading: '+slug);
    assert.equal(article.querySelector('link[rel="canonical"]')?.getAttribute('href'),base+'behind-the-round/'+language+'/'+slug+'/',page+' incorrect investigation canonical: '+slug);
    assert.equal(article.querySelectorAll('link[rel="alternate"][hreflang]').length,5,page+' incomplete hreflang: '+slug);
    assert.equal(article.querySelectorAll('[data-source-id]').length,sourceCount,page+' source audit incomplete: '+slug);
    assert.equal(article.querySelectorAll('[data-referenced-sources]').length,sectionCount,page+' source-backed sections incomplete: '+slug);
    assert.equal(article.querySelectorAll('[data-editorial-revision]').length,1,page+' dated revision missing: '+slug);
    const jsonLD=JSON.parse(article.querySelector('script[type="application/ld+json"]').textContent);
    assert.equal(jsonLD['@type'],'Article',page+' wrong structured investigation type');
    assert.equal(jsonLD.citation.length,sourceCount,page+' unlinked article source: '+slug);
    assert.equal(jsonLD.dateModified,'2026-10-10',page+' wrong investigation source review date');
    assert.ok(text.includes('https://doi.org/10.5281/zenodo.23262623'),page+' missing independent archive attribution: '+slug);
    assert.equal(article.querySelector('meta[name="description"]').getAttribute('content').length<=160,true,page+' lengthy investigation metadata: '+slug);
    if(slug==='replacement-strings'){
      assert.deepEqual([...article.querySelectorAll('[data-field-quantity] strong')].map(el=>el.textContent.trim()),
        [translations.field04ValueTotal,translations.field04ValueActive,translations.field04ValueDeactivated],
        page+' incorrect replacement counts');
      assert.ok(article.body.textContent.includes(translations.field04Disclosure),page+' secondary-index applicant disclosure missing');
    }
  }
  const wdoText=fs.readFileSync(path.join(root,'behind-the-round',language,'wdo-identity','index.html'),'utf8');
  const wdoDocument=parseHTML(wdoText).document;
  assert.equal(wdoDocument.querySelector('link[rel="canonical"]').getAttribute('href'),base+'behind-the-round/'+language+'/wdo-identity/',page+' WDO canonical route');
  assert.equal(wdoDocument.title,translations.wdoMetaTitle,page+' WDO translated metadata');
  assert.equal(wdoDocument.querySelectorAll('link[rel="alternate"][hreflang]').length,5,page+' WDO reciprocal locale links');
  assert.equal(wdoDocument.querySelectorAll('[data-behind-story]').length,1,page+' WDO standalone must be one article');
  assert.equal(wdoDocument.querySelectorAll('[data-source-id]').length,7,page+' WDO article missing primary-source links');
  assert.equal(wdoDocument.querySelector('script[type="application/ld+json"]')===null,false,page+' WDO Article structured data');
  const wdoSchema=JSON.parse(wdoDocument.querySelector('script[type="application/ld+json"]').textContent);
  assert.equal(wdoSchema['@type'],'Article',page+' WDO standalone article structured metadata');
  assert.equal(wdoSchema.citation.length,7,page+' WDO article cites seven primary records');
  assert.equal(wdoSchema.image,base+'assets/og-preview.png',page+' WDO article image');
  assert.equal(wdoDocument.querySelectorAll('[data-editorial-revision]').length,1,page+' WDO editorial revision');
  assert.ok(standalone.includes(base+'behind-the-round/'+language+'/wdo-identity/'),page+' WDO standalone not linked from Field Notes collection');
  const sanctionsHref=base+'behind-the-round/'+language+'/sanctions-and-dns/';
  const sanctionsText=fs.readFileSync(path.join(root,'behind-the-round',language,'sanctions-and-dns','index.html'),'utf8');
  const sanctionsDocument=parseHTML(sanctionsText).document;
  assert.equal(sanctionsDocument.querySelector('link[rel="canonical"]')?.getAttribute('href'),sanctionsHref,page+' explainer canonical wrong');
  assert.equal(sanctionsDocument.documentElement.getAttribute('lang'),language,page+' explainer locale wrong');
  assert.equal(sanctionsDocument.querySelectorAll('link[rel="alternate"][hreflang]').length,5,page+' explainer lacks hreflang');
  assert.equal(sanctionsDocument.querySelectorAll('[data-explainer-section]').length,7,page+' explainer missing topics');
  assert.equal(sanctionsDocument.querySelectorAll('[data-explainer-precedent]').length,4,page+' explainer missing precedents');
  assert.equal(sanctionsDocument.querySelectorAll('[id^="governance-source-"]').length,12,page+' explainer missing primary-source list');
  assert.equal(sanctionsDocument.querySelector('meta[name="robots"]')?.getAttribute('content'),'index,follow,max-image-preview:large',page+' explainer indexing');
  assert.equal(behind.querySelectorAll('a[data-governance-explainer-link]').length,2,page+' missing two Field Note context links');
  assert.equal(standaloneDocument.querySelectorAll('a[data-governance-explainer-link]').length,2,page+' missing standalone Field Note context links');
  for(const link of [...behind.querySelectorAll('a[data-governance-explainer-link]'),...standaloneDocument.querySelectorAll('a[data-governance-explainer-link]')]){
    assert.equal(link.getAttribute('href'),sanctionsHref,page+' wrong localized explainer href');
  }
  const sanctionsSchema=JSON.parse(sanctionsDocument.querySelector('script[type="application/ld+json"]').textContent);
  assert.equal(sanctionsSchema['@type'],'Article',page+' explainer structured data should be Article');
  assert.equal(sanctionsSchema.citation.length,12,page+' structured evidence list must contain all twelve sources');
  const accessHref=base+'behind-the-round/'+language+'/who-controls-internet-access/';
  const accessText=fs.readFileSync(path.join(root,'behind-the-round',language,'who-controls-internet-access','index.html'),'utf8');
  const accessDocument=parseHTML(accessText).document;
  assert.equal(accessDocument.documentElement.getAttribute('lang'),language,page+' access explainer wrong locale');
  assert.equal(accessDocument.querySelector('link[rel="canonical"]')?.getAttribute('href'),accessHref,page+' access explainer canonical');
  assert.equal(accessDocument.querySelectorAll('link[rel="alternate"][hreflang]').length,5,page+' access explainer hreflang');
  assert.equal(accessDocument.querySelectorAll('[data-access-select]').length,7,page+' access simulation missing controls');
  assert.equal(accessDocument.querySelectorAll('[data-access-stage]').length,5,page+' access simulation missing stages');
  assert.equal(accessDocument.querySelectorAll('[data-access-case]').length,5,page+' five historical examples missing');
  assert.equal(accessDocument.querySelectorAll('[id^="access-source-"]').length,11,page+' complete access evidence list missing');
  assert.equal(accessDocument.querySelector('meta[name="robots"]')?.getAttribute('content'),'index,follow,max-image-preview:large',page+' access SEO');
  assert.equal(document.querySelectorAll('[data-access-explainer-link]').length,3,page+' How, Social and Disputes links');
  for(const link of document.querySelectorAll('a[data-access-explainer-link]')){
    assert.equal(link.getAttribute('href'),accessHref,page+' incorrect access explainer locale link');
  }
  assert.ok(sanctionsText.includes(accessHref),page+' sanctions guide must link to access explainer');
  const accessSchema=JSON.parse(accessDocument.querySelector('script[type="application/ld+json"]').textContent);
  assert.equal(accessSchema['@type'],'Article',page+' access structured metadata');
  assert.equal(accessSchema.citation.length,11,page+' access source references incomplete');



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
    const formatted=key==='exploreSnapshotClocks'?value.replace('{updated}',new Intl.DateTimeFormat({en:'en-US',it:'it-IT',de:'de-DE',fr:'fr-FR'}[language],{year:'numeric',month:'short',day:'numeric',timeZone:'UTC'}).format(new Date(JSON.parse(fs.readFileSync(path.join(root,'publication.json'),'utf8')).releasedOn+'T00:00:00Z'))):value;
    const expected=parseHTML('<html><body><div id="value">'+formatted+'</div></body></html>').document.getElementById('value').textContent;
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
  const research=document.getElementById('research');
  assert.ok(research?.textContent.includes('10.5281/zenodo.23288603'),page+' verified current RR2 DOI is missing');
  assert.ok(research?.textContent.includes('10.5281/zenodo.23262623'),page+' archived RR1 DOI is missing');
  assert.ok(research?.textContent.includes('10.5281/zenodo.23262622'),page+' shared Zenodo concept DOI is missing');
  assert.equal(research?.querySelector('a[href="https://doi.org/10.5281/zenodo.23288603"]')?.getAttribute('target'),'_blank',page+' RR2 Zenodo link broken');
  assert.ok(research?.querySelector('.researchPriorPanel'),page+' prior RR1 research version not disclosed');
  assert.ok(research?.textContent.includes(translations.researchPriorBody),page+' RR1 history not localized');
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
const expectedLocations=[...languages.map(l=>base+l+'/'),base+'explorer/',base+'research/',base+'research/connecting-the-dots-working-paper-v1.html',...languages.map(l=>base+'inside-the-round/'+l+'/'),...languages.map(l=>base+'behind-the-round/'+l+'/'),...languages.map(l=>base+'behind-the-round/'+l+'/wdo-identity/'),...languages.map(l=>base+'behind-the-round/'+l+'/sanctions-and-dns/'),...languages.map(l=>base+'behind-the-round/'+l+'/who-controls-internet-access/'),...['objectors-eoi','replacement-strings'].flatMap(slug=>languages.map(l=>base+'behind-the-round/'+l+'/'+slug+'/')),...languages.map(l=>base+'applications/'+l+'/')];
assert.deepEqual(locations,expectedLocations,'complete multilingual and research sitemap');
assert.equal((sitemap.match(/xhtml:link/g)||[]).length,160,'all four-language articles and explainers have reciprocal hreflang');
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
