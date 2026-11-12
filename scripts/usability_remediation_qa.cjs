/* Acceptance for audit A01-A05; observations, not invented user-study results. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {execFileSync}=require('node:child_process');
const {parseHTML}=require('linkedom');
const {aliases,labels}=require('./usability_remediation.cjs');
const {outsideHome,assertHomeStructure,assertRetainedHomeSources}=require('./home_editorial_qa.cjs');
const {validatePreservation}=require('./validate_economics_order.cjs');
const {canonicalLink}=require('./render_economics_hub.cjs');
const root=path.resolve(__dirname,'..'),baseline=process.env.CTD_USABILITY_BASELINE;
const baselineCommit='90d21e6059871c36148e1860d017e7409ed3f8bb';
const base=(process.env.CTD_TEST_BASE||'http://127.0.0.1:8123/').replace(/\/?$/,'/');
const out=process.env.CTD_USABILITY_QA||'audit-usability';fs.mkdirSync(out,{recursive:true});
const langs=['it','en','de','fr'],widths=(process.env.CTD_USABILITY_WIDTHS||'320,390,768,1440').split(',').map(Number);
const report={baselineCommit,sourceCommit:process.env.GITHUB_SHA||null,static:[],browser:[],noJavaScript:[],axeScans:0,errors:[],humanParticipants:0,passed:false};
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const readOld=file=>baseline?fs.readFileSync(path.join(baseline,file)):execFileSync('git',['show',baselineCommit+':'+file],{maxBuffer:20*1024*1024});
// QA106 changes the home framing; QA107 moves exact Economics blocks to real
// documents. Their complete text, links, tables and metrics pass the independent
// preservation gate before the remaining native translation keys are compared.
const evidence=(d,excluded=new Set())=>[...d.querySelectorAll('[data-i18n]')].filter(n=>outsideHome(n)&&!excluded.has(n)).map(n=>[n.getAttribute('data-i18n'),n.innerHTML]).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)));
function assignedNodes(document,blocks){
 const nodes=new Set(),scope=document.getElementById('economics');
 assert.ok(scope,'Economics source section is missing');
 for(const block of blocks){
  const matches=scope.querySelectorAll(block.selector);
  assert.equal(matches.length,1,'Expected one preserved Economics source block: '+block.selector);
  const node=matches[0],excluded=(block.sourceExcludeSelectors||[]).flatMap(selector=>[...node.querySelectorAll(selector)]);
  for(const child of [node,...node.querySelectorAll('*')])if(!excluded.some(parent=>parent===child||parent.contains(child)))nodes.add(child);
 }
 return nodes;
}
function staticChecks(){
 // The 22 October UX baseline is not an editorial freeze. Exact source
 // fingerprints and the original 21 sections are protected by this separate
 // manifest-backed guard; approve only explicitly sourced later changes.
 const sourceProof=execFileSync(process.execPath,['scripts/verify_ia_b2_parity.cjs'],{cwd:root,encoding:'utf8',maxBuffer:20*1024*1024});
 assert.ok(sourceProof.includes('IA_B2_SOURCE_PARITY_VERIFIED '),'Source protection guard did not pass');
 report.economicsPreservation=validatePreservation();
 const economicsInventory=JSON.parse(fs.readFileSync(path.join(root,'data/economics-preservation.json'),'utf8'));
 const publication=JSON.parse(fs.readFileSync(path.join(root,'publication.json'),'utf8'));
 const originalPublication=JSON.parse(readOld('publication.json').toString('utf8'));
 const review=JSON.parse(fs.readFileSync(path.join(root,publication.editorialReviewPath),'utf8'));
 assert.equal(review.status,'reviewed','Current editorial revision requires a reviewed exact-file manifest');
 assert.equal(review.publicationVersion,publication.version,'Review and live publication versions differ');
 // The source guard has already checked the exact approved mapping and rationale.
 const i18nReplacements=review.i18nReplacements??[];
 const operationalLinks=review.operationalLinkReplacements??[];
 const translations=JSON.parse(fs.readFileSync(path.join(root,'data/translations.json'),'utf8'));
 const unchangedAttributes=node=>[...node.attributes].filter(a=>a.name!=='data-i18n').map(a=>[a.name,a.value]).sort((a,b)=>a[0].localeCompare(b[0]));
 const normalize=(href,version)=>href.replaceAll(version,'<VERSION>').replace(/(reader-first\.css\?v=<VERSION>)-usability-20261022$/,'$1');
 // These exact historical STYLE elements became shared CSS modules in v0.7.108.
 // Accept that relocation only when the versioned link and CSS text prove it;
 // every other historical ID remains a required fragment in the document.
 const sharedStyleIds=new Set(['city-namespace-style','tld-cultural-style','tld-market-style','ctd-native-governance-css','audit-20261019-style']);

 for(const file of ['index.html',...langs.map(l=>l+'/index.html')]){
  const before=parseHTML(readOld(file).toString()).document,after=parseHTML(fs.readFileSync(path.join(root,file),'utf8')).document;
  const lang=file==='index.html'?'en':file.split('/')[0],nativePath=file.replace(/index\.html$/,''),migration=economicsInventory.locales[lang];
  const moved=assignedNodes(before,migration.blocks.filter(block=>block.destination!=='hub'));
  const replacedNavigation=assignedNodes(before,migration.replacedNavigation);
  const economicsDocuments=['market','cases','portfolios','round-2026'].map(slug=>{
   const pagePath='economics/'+lang+'/'+slug+'/',document=parseHTML(fs.readFileSync(path.join(root,pagePath,'index.html'),'utf8')).document;
   const ids=[...document.querySelectorAll('[id]')].map(node=>node.id);
   assert.equal(new Set(ids).size,ids.length,'Duplicate fragment in Economics chapter: '+pagePath);
   return {document,pagePath};
  });
  const linkSignature=(href,pagePath)=>canonicalLink(href,{lang,pagePath,anchors:migration.anchors});
  assertHomeStructure(after,lang);
  assertRetainedHomeSources(before,after,file);
  for(const replacement of operationalLinks){
   assert.equal(after.querySelectorAll('a[href="'+replacement.from+'"]').length,0,'Unavailable APS export remains in rendered navigation: '+file);
   for(const selector of ['#aps-native .apsResources','#behind-round [data-source-id="aps-export-20261018"]']){
    assert.equal(before.querySelectorAll(selector+' a[href="'+replacement.from+'"]').length,1,'Reviewed original APS source scope changed: '+file+'/'+selector);
    const links=after.querySelectorAll(selector+' a[href="'+replacement.to+'"]');
    assert.equal(links.length,1,'Reviewed APS source listing must occur once in its original context: '+file+'/'+selector);
    assert.equal(links[0].getAttribute('target'),'_blank','Reviewed source target changed: '+file);
    assert.ok((links[0].getAttribute('rel')||'').split(/\s+/).includes('noopener'),'Reviewed source link lost noopener: '+file);
   }
  }
  const beforeKeys=new Set(evidence(before,moved).map(x=>x[0])),afterKeys=new Set(evidence(after).map(x=>x[0]));
  for(const {elementId,from,to,href} of i18nReplacements){
   const prior=before.querySelectorAll('[id="'+elementId+'"]'),current=after.querySelectorAll('[id="'+elementId+'"]');
   assert.equal(prior.length,1,'Reviewed label baseline anchor must be unique: '+file+'/'+elementId);
   assert.equal(current.length,1,'Reviewed label candidate anchor must be unique: '+file+'/'+elementId);
   assert.equal(prior[0].tagName,'A','Reviewed label baseline must remain an anchor: '+file+'/'+elementId);
   assert.equal(current[0].tagName,'A','Reviewed label candidate must remain an anchor: '+file+'/'+elementId);
   assert.equal(prior[0].getAttribute('data-i18n'),from,'Reviewed label baseline key differs: '+file+'/'+elementId);
   assert.equal(current[0].getAttribute('data-i18n'),to,'Reviewed label candidate key differs: '+file+'/'+elementId);
   assert.equal(before.querySelectorAll('[data-i18n="'+from+'"]').length,1,'Reviewed baseline key must occur once: '+file+'/'+from);
   assert.equal(before.querySelectorAll('[data-i18n="'+to+'"]').length,0,'Reviewed replacement key already present in baseline: '+file+'/'+to);
   assert.equal(after.querySelectorAll('[data-i18n="'+from+'"]').length,0,'Reviewed old key must not survive as a ghost token: '+file+'/'+from);
   assert.equal(after.querySelectorAll('[data-i18n="'+to+'"]').length,1,'Reviewed replacement key must occur once: '+file+'/'+to);
   const lang=file==='index.html'?'en':file.split('/')[0],expectedHref=new URL('../'+lang+'/',href).href;
   assert.equal(prior[0].getAttribute('href'),expectedHref,'Reviewed label baseline destination differs: '+file+'/'+elementId);
   assert.equal(current[0].getAttribute('href'),expectedHref,'Reviewed label candidate destination differs: '+file+'/'+elementId);
   assert.equal(prior[0].textContent,translations[lang][from],'Reviewed baseline label text differs: '+file+'/'+elementId);
   assert.equal(current[0].textContent,translations[lang][to],'Reviewed candidate label text differs: '+file+'/'+elementId);
   assert.deepEqual(unchangedAttributes(current[0]),unchangedAttributes(prior[0]),'Reviewed label changed attributes beyond its translation key: '+file+'/'+elementId);
   // Normalize this one verified visible anchor only; every other lost key fails below.
   beforeKeys.delete(from);beforeKeys.add(to);
  }
  const lost=[...beforeKeys].filter(key=>!afterKeys.has(key)).sort();
  // Those two historic timeline keys are replaced by the reviewed 'observed'
  // state and the dated 21 October close, not silently discarded prose.
  assert.deepEqual(lost,['disputesMechanismsSub','disputesMechanismsTitle','insideReplacePublicScheduleBody','insideStateCurrent'],'Unreviewed translated key disappeared: '+file);
  const legalBridge=after.querySelector('#disputeMechanisms.disputesLegalBridge');
  assert.ok(legalBridge,'Rendered Legal bridge missing: '+file);
  const legalBridgeLink=legalBridge.querySelector('a[href]');
  assert.ok(legalBridgeLink,'Rendered Legal bridge link missing: '+file);
  const legalHref=legalBridgeLink.getAttribute('href')||'';
  const legalTarget=new URL(legalHref,'https://ctd.invalid/');
  assert.ok(legalTarget.hash==='#legal'||legalTarget.searchParams.get('tab')==='legal','Rendered Legal bridge destination missing: '+file+' -> '+legalHref);
  assert.ok(after.getElementById('legal'),'Rendered Legal chapter missing: '+file);
  for(const key of ['disputesLegalBridgeTitle','disputesLegalBridgeBody','disputesLegalBridgeCta']) assert.ok(legalBridge.textContent.includes(translations[lang][key]),'Rendered Legal bridge text missing: '+file+'/'+key);
  for(const key of ['insideReplaceCompletedBody','insideStateObserved','insideQualityTitle','nissayCaseState']){
    assert.ok(afterKeys.has(key),'Missing translated review addition: '+file+'/'+key);
  }
  assert.equal(after.querySelectorAll('[data-event-id="quality-control-provider"]').length,1,'JAS event missing: '+file);
  assert.equal(after.querySelectorAll('[data-event-id="replacement"][data-round-state="observed"]').length,1,'Replacement close not reflected: '+file);
  assert.equal(after.querySelectorAll('#nissay-termination').length,1,'Dated .nissay case omitted: '+file);
  const ids=[...before.querySelectorAll('[id]')].map(n=>n.id),now=[...after.querySelectorAll('[id]')].map(n=>n.id);
  for(const id of ids){
   if(after.getElementById(id))continue;
   const original=before.getElementById(id);
   assert.ok(original.tagName==='STYLE'&&sharedStyleIds.has(id),'Missing prior fragment: '+id);
   const links=after.querySelectorAll('link[data-shared-style="'+id+'"]');
   assert.equal(links.length,1,'Historical shared style requires one replacement link: '+file+'/'+id);
   assert.equal(links[0].getAttribute('rel'),'stylesheet','Historical shared style lost stylesheet relation: '+file+'/'+id);
   const modulePath='assets/shared/'+id+'.css';
   assert.equal(links[0].getAttribute('href'),(file==='index.html'?'':'../')+modulePath+'?v='+publication.version,'Historical shared style requires its versioned module: '+file+'/'+id);
   assert.ok(fs.existsSync(path.join(root,modulePath)),'Historical shared style module is missing: '+modulePath);
   assert.equal(fs.readFileSync(path.join(root,modulePath),'utf8').trim(),original.textContent.trim(),'Historical shared style CSS changed: '+file+'/'+id);
  }
  assert.equal(new Set(now).size,now.length,'Duplicate fragment: '+file);
  for(const [id,selector] of Object.entries(aliases))assert.equal(after.querySelector(selector)?.id,id,'Incorrect legacy destination: '+id);
  for(const d of [before,after])for(const ui of d.querySelectorAll('[data-reader-ui]'))ui.remove();
  // The one WDO story CTA in each non-English index now opens the same case
  // in that index's language. Verify its exact occurrence and sibling pages;
  // never normalize other WDO links or arbitrary locale paths.
  const localizedWdoLinks=new Map();
  if(['it','de','fr'].includes(lang)){
   const from='https://robertbregy.github.io/Connecting-the-Dots/behind-the-round/en/wdo-identity/';
   const to='https://robertbregy.github.io/Connecting-the-Dots/behind-the-round/'+lang+'/wdo-identity/';
   const selector='#behind-case-wdo-identity > a.behindStoryLink';
   const prior=before.querySelectorAll(selector),current=after.querySelectorAll(selector);
   assert.equal(prior.length,1,'Historical WDO story CTA must be unique: '+file);
   assert.equal(current.length,1,'Localized WDO story CTA must be unique: '+file);
   assert.equal(prior[0].getAttribute('href'),from,'Historical WDO story destination differs: '+file);
   assert.equal(current[0].getAttribute('href'),to,'WDO story must open its native-language case: '+file);
   assert.equal(current[0].innerHTML,prior[0].innerHTML,'WDO localization changed the story CTA content: '+file);
   const attributes=node=>[...node.attributes].filter(a=>a.name!=='href').map(a=>[a.name,a.value]).sort((a,b)=>a[0].localeCompare(b[0]));
   assert.deepEqual(attributes(current[0]),attributes(prior[0]),'WDO localization changed unrelated CTA attributes: '+file);
   assert.equal(before.querySelectorAll('a[href="'+from+'"]').length,1,'Historical English WDO occurrence count differs: '+file);
   assert.equal(after.querySelectorAll('a[href="'+from+'"]').length,0,'English WDO destination remains in localized index: '+file);
   assert.equal(before.querySelectorAll('a[href="'+to+'"]').length,1,'Historical native WDO occurrence count differs: '+file);
   assert.equal(after.querySelectorAll('a[href="'+to+'"]').length,2,'Localized WDO occurrence count differs: '+file);
   for(const [locale,href] of [['en',from],[lang,to]]){
    const target=path.join(root,'behind-the-round',locale,'wdo-identity','index.html');
    assert.ok(fs.existsSync(target),'WDO language-equivalent destination is missing: '+target);
    const destination=parseHTML(fs.readFileSync(target,'utf8')).document;
    assert.equal(destination.documentElement.getAttribute('lang'),locale,'WDO destination language differs: '+target);
    assert.deepEqual([...destination.querySelectorAll('link[rel="canonical"]')].map(n=>n.getAttribute('href')),[href],'WDO destination canonical differs: '+target);
    for(const [alternate,expected] of [['en',from],[lang,to]])assert.deepEqual([...destination.querySelectorAll('link[rel="alternate"][hreflang="'+alternate+'"]')].map(n=>n.getAttribute('href')),[expected],'WDO language equivalents are not reciprocal: '+target);
   }
   localizedWdoLinks.set(prior[0],to);
  }
  // Source protection above approves one exact obsolete APS export destination.
  // Match its current official listing and the verified WDO CTA occurrences
  // while retaining every other link occurrence without rewriting its URL.
  const originalLinks=[...before.querySelectorAll('a[href]')].filter(a=>outsideHome(a)&&!replacedNavigation.has(a)).map(a=>{
   const href=localizedWdoLinks.get(a)??a.getAttribute('href'),replacement=operationalLinks.find(link=>link.from===href);
   return normalize(linkSignature(replacement?replacement.to:href,nativePath),originalPublication.version);
  }).sort();
  const remaining=[{document:after,pagePath:nativePath},...economicsDocuments].flatMap(({document,pagePath})=>[...document.querySelectorAll('a[href]')].filter(outsideHome).map(a=>normalize(linkSignature(a.getAttribute('href'),pagePath),publication.version)));
  for(const href of originalLinks){const i=remaining.indexOf(href);assert.ok(i>=0,'Lost historical source/content link: '+href);remaining.splice(i,1);}
  assert.equal(after.querySelectorAll('.hero .homeHeroProject').length,1,'The opening must explain the project once');
  assert.equal(after.querySelectorAll('#home-stories .audienceDiscovery.homeStory').length,3,'The three story destinations must remain available');
  // Normalize only the explicitly identified broken legacy tooltip attributes.
  // Their removal is an audit correction, not an unrelated editorial change.
  for(const a of before.querySelectorAll('nav.sectionToc a[title],#iaLegacyNavDisclosure a[title]'))
    if(/\/\* Normalize legacy language|\(function\(\)\{|document\.documentElement/.test(a.getAttribute('title')))a.removeAttribute('title');
  const changed=['social','contention','disputes','strange','sources','economics','lugano'];let untouched=0;
  for(const section of before.querySelectorAll('section.section')){
   const current=after.getElementById(section.id);
   assert.ok(current,'Lost historic canonical section: '+section.id);
   if(!changed.includes(section.id)&&current.outerHTML===section.outerHTML)untouched++;
  }
  // Generated chronology and articles may change with reviewed sources.
  // Any unreviewed change to the underlying canonical 21 sections has already
  // failed scripts/verify_ia_b2_parity.cjs above.
  assert.equal(after.querySelectorAll('a[title*="Normalize legacy language"]').length,0,'Broken legacy tooltip');
  report.static.push({file,originalTranslatedItems:evidence(after).length,originalAnchors:ids.length,restoredAnchors:4,originalContentLinks:originalLinks.length,untouchedSections:untouched});
 }
 // The technical ZIP and current-site metadata are deliberately versioned.
 // Verify reproducibility against its own sidecar and keep archived RR2 and
 // historical research identifiers fixed rather than comparing new files to
 // pre-release metadata byte-for-byte.
 const archive=fs.readFileSync(path.join(root,publication.currentDataPackPath));
 const checksum=fs.readFileSync(path.join(root,publication.currentDataPackPath.replace(/\.zip$/,'.sha256')),'utf8').trim().split(/\s+/)[0];
 assert.equal(hash(archive),checksum,'Current technical ZIP checksum differs from published sidecar');
 const oldResearch=JSON.parse(readOld('research/research_release_manifest.json').toString('utf8'));
 const newResearch=JSON.parse(fs.readFileSync(path.join(root,'research/research_release_manifest.json'),'utf8'));
 assert.deepEqual(newResearch.currentResearchRelease,oldResearch.currentResearchRelease,'Archived RR2 identity changed');
 assert.equal(publication.doi,'10.5281/zenodo.23288603','RR2 DOI has changed');
 assert.equal(hash(fs.readFileSync(path.join(root,'CITATION.cff'))),hash(readOld('CITATION.cff')),'CITATION.cff immutable research reference changed');
 report.researchDataUnchanged=true;
}
async function browsers(){
 const {chromium}=require('playwright'),AxeBuilder=require('@axe-core/playwright').default;
 const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--no-sandbox','--disable-dev-shm-usage']});
 async function go(page,lang,tab,anchor=''){
  await page.goto(base+lang+'/?tab='+tab+(anchor?'#'+anchor:''),{waitUntil:'load'});
  await page.waitForFunction(()=>window.CTD_APP_READY===true,null,{timeout:30000});
  await page.locator('#'+tab+'.section.active').waitFor({state:'visible'});
 }
 async function scan(page,id,width){
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false,'Horizontal overflow: '+id);
  if(![320,1440].includes(width))return;
  const a=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();report.axeScans++;
  assert.deepEqual(a.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)})),[],id+' accessibility');
 }
 try{
  for(const lang of langs)for(const width of widths)for(const theme of ['light','dark']){
   const context=await browser.newContext({viewport:{width,height:900},colorScheme:theme,reducedMotion:'reduce'});
   const page=await context.newPage(),runtime=[];page.on('pageerror',e=>runtime.push(e.message));
   const state={lang,width,theme,passed:false};
   try{
    await go(page,lang,'overview');
    if(await page.locator('html').getAttribute('data-theme')!==theme)await page.locator('#themeBtn').click();
    const action=page.locator('.heroPrimary');
    const rect=await action.boundingBox();assert.ok(rect&&rect.y>=0&&rect.y+rect.height<900,'Primary action below first 900px: '+JSON.stringify(rect));
    state.homeAction={top:Math.round(rect.y),bottom:Math.round(rect.y+rect.height)};
    assert.ok(await page.locator('.homeHeroProject').isVisible(),'Project identity hidden');
    await scan(page,'overview',width);
    if(lang==='it'&&[320,1440].includes(width))await page.screenshot({path:path.join(out,`home-${width}-${theme}.png`)});
    await action.focus();await page.keyboard.press('Enter');
    await page.waitForFunction(()=>location.hash==='#how-part-2'&&new URL(location.href).searchParams.get('tab')==='how');
    assert.ok(await page.locator('#how-part-2').isVisible(),'The primary entry did not reach its domain explanation');
    for(const tab of ['lugano','sources']){
     await go(page,lang,tab);
     const toc=page.locator('#'+tab+' .readerTocCurated');
     assert.equal(await toc.locator(':scope > details').getAttribute('open'),'');
     assert.deepEqual(await toc.locator('.readerTocPrimary > li > a').allTextContents(),labels[lang][tab]);
     assert.ok(await toc.locator('.readerTocTransparency a').isVisible());
     for(const a of await toc.locator('.readerTocPrimary > li > a').all()){
      const id=await a.getAttribute('data-open-anchor');await a.focus();await page.keyboard.press('Enter');
      await page.waitForFunction(id=>location.hash==='#'+id&&document.activeElement.id===id,id);
      assert.ok(await page.locator('#'+id).isVisible(),'Main destination hidden: '+id);
     }
     const nested=toc.locator('.readerTocGroup').first();await nested.locator(':scope > summary').focus();await page.keyboard.press('Enter');assert.equal(await nested.evaluate(n=>n.open),true);
     await nested.locator(':scope > summary').focus();await page.keyboard.press('Enter');assert.equal(await nested.evaluate(n=>n.open),false);
     await go(page,lang,tab);await scan(page,tab,width);
     if(tab==='lugano'&&lang==='it'&&[320,1440].includes(width)){await page.locator('#lugano').evaluate(n=>n.scrollIntoView());await page.screenshot({path:path.join(out,`lugano-${width}-${theme}.png`)});}
    }
    for(const [id] of Object.entries(aliases)){
     const tab=id.split('-part-')[0];await go(page,lang,tab,id);
     await page.waitForFunction(id=>{let n=document.getElementById(id);if(!n||!n.getBoundingClientRect().height)return false;for(;n;n=n.parentElement)if(n.tagName==='DETAILS'&&!n.open)return false;return true;},id);
      // app.js schedules the actual scroll in requestAnimationFrame. Wait for that scroll,
      // but still fail if the original target does not enter the viewport within 3.5s.
      await page.waitForFunction(id=>{const el=document.getElementById(id);if(!el)return false;const r=el.getBoundingClientRect();return r.height>0&&r.y>=0&&r.y<innerHeight;},id,{timeout:3500});
     const rect=await page.locator('#'+id).boundingBox();assert.ok(rect&&rect.y>=0&&rect.y<900,'Legacy destination not reached: '+id);
    }
    await go(page,lang,'economics');
    assert.ok(await page.locator('#economics.economicsHub').isVisible(),'Economics introduction is hidden');
    const economicsPaths=page.locator('#economics.economicsHub a[data-economics-path]');
    assert.deepEqual(await economicsPaths.evaluateAll(nodes=>nodes.map(n=>n.getAttribute('data-economics-path'))),['market','cases','portfolios','round-2026'],'Economics must expose all four complete chapters');
    for(const link of await economicsPaths.all()){
     const slug=await link.getAttribute('data-economics-path'),href=new URL(await link.getAttribute('href'),page.url());
     assert.ok(await link.isVisible(),'Economics chapter link is hidden: '+slug);
     assert.ok((await link.innerText()).trim(),'Economics chapter link has no accessible label: '+slug);
     assert.equal(href.pathname,new URL('economics/'+lang+'/'+slug+'/',base).pathname,'Wrong Economics chapter destination: '+slug);
    }
    for(const key of ['economics','sources']){
     if(key==='sources')await go(page,lang,key);
     assert.ok(await page.locator('#reader-brief-'+key).isVisible());
     assert.equal(await page.locator('#reader-brief-'+key).evaluate(n=>n.closest('details')),null);
     for(const a of await page.locator('#reader-brief-'+key+' a').all()){
      const id=await a.getAttribute('data-open-anchor')||new URL(await a.getAttribute('href'),page.url()).hash.slice(1);
      assert.ok(id,'Reader shortcut has no destination');
      assert.equal(await page.locator('#'+id).count(),1,'Reader shortcut lost its legacy fragment: '+id);
     }
    }
    await go(page,lang,'economics');await scan(page,'economics',width);
    assert.deepEqual(runtime,[],'Browser runtime errors');state.restoredLinks=4;state.primaryTocLinks=10;state.passed=true;
   }catch(e){state.error=e.stack||String(e);report.errors.push(state);try{await page.screenshot({path:path.join(out,`failure-${lang}-${width}-${theme}.png`)});}catch{}}
   finally{await context.close();report.browser.push(state);console.log('USABILITY_SCENARIO '+JSON.stringify(state));}
  }
  for(const lang of langs){
   const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:900}}),page=await context.newPage();
   try{
    await page.goto(base+lang+'/',{waitUntil:'load'});
    for(const selector of ['.heroPrimary','.homeHeroProject','#lugano .readerTocCurated','#sources .readerTocCurated','#reader-brief-economics','#reader-brief-sources','#economics.economicsHub'])assert.ok(await page.locator(selector).isVisible(),'No-JS essential hidden: '+selector);
    assert.equal(await page.locator('#economics.economicsHub a[data-economics-path]:visible').count(),4,'No-JS Economics chapter paths are incomplete');
    for(const id of Object.keys(aliases))assert.equal(await page.locator('#'+id).count(),1);
    report.noJavaScript.push({lang,passed:true});
   }finally{await context.close();}
  }
 }finally{await browser.close();}
}
(async()=>{try{staticChecks();if(!process.argv.includes('--static-only'))await browsers();report.passed=report.errors.length===0;}catch(e){report.errors.push({fatal:e.stack||String(e)});}finally{fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');console.log('USABILITY_REMEDIATION_RESULT '+JSON.stringify({passed:report.passed,static:report.static.length,browser:report.browser.length,axeScans:report.axeScans,errors:report.errors}));}if(!report.passed)process.exitCode=1;})();
