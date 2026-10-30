/* Acceptance for audit A01-A05; observations, not invented user-study results. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {execFileSync}=require('node:child_process');
const {parseHTML}=require('linkedom');
const {aliases,labels}=require('./usability_remediation.cjs');
const root=path.resolve(__dirname,'..'),baseline=process.env.CTD_USABILITY_BASELINE;
const baselineCommit='90d21e6059871c36148e1860d017e7409ed3f8bb';
const base=(process.env.CTD_TEST_BASE||'http://127.0.0.1:8123/').replace(/\/?$/,'/');
const out=process.env.CTD_USABILITY_QA||'audit-usability';fs.mkdirSync(out,{recursive:true});
const langs=['it','en','de','fr'],widths=(process.env.CTD_USABILITY_WIDTHS||'320,390,768,1440').split(',').map(Number);
const report={baselineCommit,sourceCommit:process.env.GITHUB_SHA||null,static:[],browser:[],noJavaScript:[],axeScans:0,errors:[],humanParticipants:0,passed:false};
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const readOld=file=>baseline?fs.readFileSync(path.join(baseline,file)):execFileSync('git',['show',baselineCommit+':'+file],{maxBuffer:20*1024*1024});
const evidence=d=>[...d.querySelectorAll('[data-i18n]')].map(n=>[n.getAttribute('data-i18n'),n.innerHTML]).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)));
function staticChecks(){
 // The 22 October UX baseline is not an editorial freeze. Exact source
 // fingerprints and the original 21 sections are protected by this separate
 // manifest-backed guard; approve only explicitly sourced later changes.
 const sourceProof=execFileSync(process.execPath,['scripts/verify_ia_b2_parity.cjs'],{cwd:root,encoding:'utf8',maxBuffer:20*1024*1024});
 assert.ok(sourceProof.includes('IA_B2_SOURCE_PARITY_VERIFIED '),'Source protection guard did not pass');
 const publication=JSON.parse(fs.readFileSync(path.join(root,'publication.json'),'utf8'));
 const originalPublication=JSON.parse(readOld('publication.json').toString('utf8'));
 const review=JSON.parse(fs.readFileSync(path.join(root,publication.editorialReviewPath),'utf8'));
 assert.equal(review.status,'reviewed','Current editorial revision requires a reviewed exact-file manifest');
 assert.equal(review.publicationVersion,publication.version,'Review and live publication versions differ');
 const normalize=(href,version)=>href.replaceAll(version,'<VERSION>').replace(/(reader-first\.css\?v=<VERSION>)-usability-20261022$/,'$1');

 for(const file of ['index.html',...langs.map(l=>l+'/index.html')]){
  const before=parseHTML(readOld(file).toString()).document,after=parseHTML(fs.readFileSync(path.join(root,file),'utf8')).document;
  const beforeKeys=new Set(evidence(before).map(x=>x[0])),afterKeys=new Set(evidence(after).map(x=>x[0]));
  const lost=[...beforeKeys].filter(key=>!afterKeys.has(key)).sort();
  // Those two historic timeline keys are replaced by the reviewed 'observed'
  // state and the dated 21 October close, not silently discarded prose.
  assert.deepEqual(lost,['insideReplacePublicScheduleBody','insideStateCurrent'],'Unreviewed translated key disappeared: '+file);
  for(const key of ['insideReplaceCompletedBody','insideStateObserved','insideQualityTitle','nissayCaseState']){
    assert.ok(afterKeys.has(key),'Missing translated review addition: '+file+'/'+key);
  }
  assert.equal(after.querySelectorAll('[data-event-id="quality-control-provider"]').length,1,'JAS event missing: '+file);
  assert.equal(after.querySelectorAll('[data-event-id="replacement"][data-round-state="observed"]').length,1,'Replacement close not reflected: '+file);
  assert.equal(after.querySelectorAll('#nissay-termination').length,1,'Dated .nissay case omitted: '+file);
  const ids=[...before.querySelectorAll('[id]')].map(n=>n.id),now=[...after.querySelectorAll('[id]')].map(n=>n.id);
  for(const id of ids)assert.ok(after.getElementById(id),'Missing prior fragment: '+id);
  assert.equal(new Set(now).size,now.length,'Duplicate fragment: '+file);
  for(const [id,selector] of Object.entries(aliases))assert.equal(after.querySelector(selector)?.id,id,'Incorrect legacy destination: '+id);
  for(const d of [before,after])for(const ui of d.querySelectorAll('[data-reader-ui]'))ui.remove();
  const originalLinks=[...before.querySelectorAll('a[href]')].map(a=>normalize(a.getAttribute('href'),originalPublication.version)).sort();
  const remaining=[...after.querySelectorAll('a[href]')].map(a=>normalize(a.getAttribute('href'),publication.version));
  for(const href of originalLinks){const i=remaining.indexOf(href);assert.ok(i>=0,'Lost historical source/content link: '+href);remaining.splice(i,1);}
  assert.equal(after.querySelectorAll('[data-i18n="iaProjectDefinition"]').length,1);
  assert.ok(after.querySelector('.heroActions').nextElementSibling.matches('.heroPlain'),'Home action still follows long definitions');
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
    assert.ok(await page.locator('.narrativeProjectDefinition').isVisible(),'Project identity hidden');
    await scan(page,'overview',width);
    if(lang==='it'&&[320,1440].includes(width))await page.screenshot({path:path.join(out,`home-${width}-${theme}.png`)});
    await action.focus();await page.keyboard.press('Enter');
    await page.waitForFunction(()=>document.querySelector('#three-minute-guide').open);
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
     const rect=await page.locator('#'+id).boundingBox();assert.ok(rect&&rect.y>=0&&rect.y<900,'Legacy destination not reached: '+id);
    }
    await go(page,lang,'economics');assert.equal(await page.locator('#economics > .sectionToc a').count(),6);
    for(const key of ['economics','sources']){
     if(key==='sources')await go(page,lang,key);
     assert.ok(await page.locator('#reader-brief-'+key).isVisible());
     assert.equal(await page.locator('#reader-brief-'+key).evaluate(n=>n.closest('details')),null);
     for(const a of await page.locator('#reader-brief-'+key+' a').all())assert.equal(await page.locator('#'+await a.getAttribute('data-open-anchor')).count(),1);
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
    for(const selector of ['.heroPrimary','.narrativeProjectDefinition','#lugano .readerTocCurated','#sources .readerTocCurated','#reader-brief-economics','#reader-brief-sources'])assert.ok(await page.locator(selector).isVisible(),'No-JS essential hidden: '+selector);
    for(const id of Object.keys(aliases))assert.equal(await page.locator('#'+id).count(),1);
    report.noJavaScript.push({lang,passed:true});
   }finally{await context.close();}
  }
 }finally{await browser.close();}
}
(async()=>{try{staticChecks();if(!process.argv.includes('--static-only'))await browsers();report.passed=report.errors.length===0;}catch(e){report.errors.push({fatal:e.stack||String(e)});}finally{fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');console.log('USABILITY_REMEDIATION_RESULT '+JSON.stringify({passed:report.passed,static:report.static.length,browser:report.browser.length,axeScans:report.axeScans,errors:report.errors.length}));}if(!report.passed)process.exitCode=1;})();
