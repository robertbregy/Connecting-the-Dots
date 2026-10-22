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
const evidence=d=>[...d.querySelectorAll('[data-i18n]')].map(n=>[n.dataset.i18n,n.innerHTML]).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)));
function staticChecks(){
 for(const file of ['index.html',...langs.map(l=>l+'/index.html')]){
  const before=parseHTML(readOld(file).toString()).document,after=parseHTML(fs.readFileSync(path.join(root,file),'utf8')).document;
  assert.deepEqual(evidence(after),evidence(before),'Translated evidence changed: '+file);
  const ids=[...before.querySelectorAll('[id]')].map(n=>n.id),now=[...after.querySelectorAll('[id]')].map(n=>n.id);
  for(const id of ids)assert.ok(after.getElementById(id),'Missing prior fragment: '+id);
  assert.equal(new Set(now).size,now.length,'Duplicate fragment: '+file);
  for(const [id,selector] of Object.entries(aliases))assert.equal(after.querySelector(selector)?.id,id,'Incorrect legacy destination: '+id);
  for(const d of [before,after])for(const ui of d.querySelectorAll('[data-reader-ui]'))ui.remove();
  const originalLinks=[...before.querySelectorAll('a[href]')].map(a=>a.getAttribute('href')).sort();
  const remaining=[...after.querySelectorAll('a[href]')].map(a=>a.getAttribute('href'));
  for(const href of originalLinks){const i=remaining.indexOf(href);assert.ok(i>=0,'Lost source/content link: '+href);remaining.splice(i,1);}
  assert.equal(after.querySelectorAll('[data-i18n="iaProjectDefinition"]').length,1);
  assert.ok(after.querySelector('.heroActions').nextElementSibling.matches('.heroPlain'),'Home action still follows long definitions');
  // Normalize only the explicitly identified broken legacy tooltip attributes.
  // Their removal is an audit correction, not an unrelated editorial change.
  for(const a of before.querySelectorAll('nav.sectionToc a[title],#iaLegacyNavDisclosure a[title]'))
    if(/\/\* Normalize legacy language|\(function\(\)\{|document\.documentElement/.test(a.getAttribute('title')))a.removeAttribute('title');
  const changed=['social','contention','disputes','strange','sources','economics','lugano'];let untouched=0;
  for(const s of before.querySelectorAll('section.section'))if(!changed.includes(s.id)){
   assert.equal(after.getElementById(s.id).outerHTML,s.outerHTML,'Unrelated section changed: '+s.id);untouched++;
  }
  assert.equal(after.querySelectorAll('a[title*="Normalize legacy language"]').length,0,'Broken legacy tooltip');
  report.static.push({file,originalTranslatedItems:evidence(after).length,originalAnchors:ids.length,restoredAnchors:4,originalContentLinks:originalLinks.length,untouchedSections:untouched});
 }
 // The current ZIP and all scientific source files must remain byte-identical.
 const pub=JSON.parse(fs.readFileSync(path.join(root,'publication.json'),'utf8'));
 for(const file of ['publication.json','data/manifest.json',pub.currentDataPackPath,pub.currentDataPackPath.replace(/\.zip$/,'.sha256'),'CITATION.cff','research/research_release_manifest.json'])assert.equal(hash(fs.readFileSync(path.join(root,file))),hash(readOld(file)),'Scientific or package bytes changed: '+file);
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
