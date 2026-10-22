/* Targeted acceptance: evidence preservation, discoverability and real browser behavior. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {parseHTML}=require('linkedom');
const {execFileSync}=require('node:child_process');
const ROOT=path.resolve(__dirname,'..');
const baseline=process.env.CTD_NARRATIVE_BASELINE||'/tmp/narrative-baseline';
const base=process.env.CTD_TEST_BASE||'http://127.0.0.1:8128/';
const out=process.env.CTD_NARRATIVE_QA||'/tmp/narrative-qa';fs.mkdirSync(out,{recursive:true});
const report={baseline:'2038d07df9c491a0fa30e8ff2a9a8da32494b406',sourceCommit:process.env.GITHUB_SHA||null,static:[],preservedFiles:[],browser:[],noJavaScript:[],axeScans:0,errors:[],humanParticipants:0,passed:false};
const read=(root,file)=>fs.readFileSync(path.join(root,file),'utf8');
const dom=(root,file)=>parseHTML(read(root,file)).document;
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const texts=d=>[...d.querySelectorAll('[data-i18n]')].map(n=>[n.dataset.i18n,n.textContent]).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)));
const essential=['project','dns-foundation','atlas-entry','proposal','principles','proposal-conditions','historical-context'];
const locales=['it','en','de','fr'];
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(dir,e.name)):[path.join(dir,e.name)]);}
function staticChecks(){
 for(const file of ['index.html',...locales.map(l=>l+'/index.html')]){
  const before=dom(baseline,file),after=dom(ROOT,file);
  assert.deepEqual(texts(after),texts(before),'Published translated copy changed: '+file);
  const ids=[...before.querySelectorAll('[id]')].map(n=>n.id),newIds=[...after.querySelectorAll('[id]')].map(n=>n.id);
  for(const id of ids)assert.ok(after.getElementById(id),'Original fragment missing: '+id);
  assert.equal(new Set(newIds).size,newIds.length,'Duplicate fragment');
  const remaining=[...after.querySelectorAll('a[href]')].map(a=>a.getAttribute('href'));
  for(const a of before.querySelectorAll('a[href]')){const href=a.getAttribute('href'),i=remaining.indexOf(href);assert.ok(i>=0,'Original link missing: '+href);remaining.splice(i,1);}
  let untouched=0;
  for(const section of before.querySelectorAll('section.section'))if(!['overview','explore','economics','lugano'].includes(section.id)){
   assert.equal(after.getElementById(section.id).outerHTML,section.outerHTML,'Unrelated chapter changed: '+section.id);untouched++;
  }
  for(const key of essential){const n=after.querySelector('[data-narrative-essential="'+key+'"]');assert.ok(n,key);assert.equal(n.closest('details'),null,key+' is still collapsed');}
  assert.equal(after.querySelector('#aps-native').closest('details'),null);
  assert.equal(after.querySelectorAll('.audienceAtlasPanel,.audienceAtlasLink').length,0);
  assert.ok(!after.querySelector('.historicalEconomy').hasAttribute('open'));
  assert.ok(after.querySelector('.historicalEconomy > .note'));
  assert.equal(after.querySelectorAll('#lugano [data-narrative-optional="roadmap"] #luganoRoadmap').length,1);
  report.static.push({file,originalTranslatedItems:texts(before).length,originalAnchors:ids.length,untouchedSections:untouched,allPriorLinksRetained:true});
 }
 const pub=JSON.parse(read(ROOT,'publication.json')),pack=pub.currentDataPackPath;
 const oldManifest=JSON.parse(read(baseline,'data/manifest.json')),newManifest=JSON.parse(read(ROOT,'data/manifest.json'));
 const beforeAsset=oldManifest.web_delivery.assets.find(a=>a.repository_path==='assets/aps-lazy.js');
 const afterAsset=newManifest.web_delivery.assets.find(a=>a.repository_path==='assets/aps-lazy.js');
 assert.ok(beforeAsset&&afterAsset,'Runtime asset provenance missing');
 assert.equal(afterAsset.sha256,sha(fs.readFileSync(path.join(ROOT,'assets/aps-lazy.js'))));
 assert.equal(afterAsset.bytes,fs.statSync(path.join(ROOT,'assets/aps-lazy.js')).size);
 Object.assign(afterAsset,beforeAsset);
 assert.deepEqual(newManifest,oldManifest,'Manifest changed beyond the reviewed runtime asset fingerprint');
 const zipCheck=execFileSync('python3',['-c',
  'import sys,zipfile,json; a=zipfile.ZipFile(sys.argv[1]); b=zipfile.ZipFile(sys.argv[2]); assert a.namelist()==b.namelist(); changed=[n for n in a.namelist() if a.read(n)!=b.read(n)]; assert changed==["manifest.json"],changed; print(json.dumps({"entries":len(a.namelist()),"changed":changed}))',
  path.join(baseline,pack),path.join(ROOT,pack)],{encoding:'utf8'});
 const checksum=read(ROOT,pack.replace(/\.zip$/,'.sha256')).trim().split(/\s+/)[0];
 assert.equal(checksum,sha(fs.readFileSync(path.join(ROOT,pack))));
 report.currentTechnicalPack={...JSON.parse(zipCheck),onlyChange:'Reviewed APS loader fingerprint in manifest; all data payloads unchanged'};
 for(const dir of ['data','downloads','research'])for(const old of files(path.join(baseline,dir))){
  const rel=path.relative(baseline,old);
  if(['data/publication.js','data/manifest.json',pack,pack.replace(/\.zip$/,'.sha256')].includes(rel))continue;
  assert.equal(sha(fs.readFileSync(path.join(ROOT,rel))),sha(fs.readFileSync(old)),'Research, dataset or archive changed: '+rel);
  report.preservedFiles.push(rel);
 }
}
async function browserChecks(){
 const {chromium}=require('playwright'),AxeBuilder=require('@axe-core/playwright').default;
 const browser=await chromium.launch({headless:true});
 const compact=vs=>vs.map(v=>({id:v.id,impact:v.impact,targets:v.nodes.map(n=>n.target)}));
 async function ready(page){await page.waitForFunction(()=>window.CTD_APP_READY===true,null,{timeout:45000});}
 async function checkPage(page,tab){
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false,'Horizontal overflow: '+tab);
  const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();report.axeScans++;
  assert.deepEqual(compact(axe.violations),[],tab+' accessibility');
 }
 async function screenshot(page,lang,width,theme,tab){
  if(lang==='it'&&((width===320&&theme==='dark')||(width===1280&&theme==='light')))await page.screenshot({path:path.join(out,tab+'-'+width+'-'+theme+'.png')});
 }
 try{
  for(const lang of locales)for(const width of [320,1280])for(const theme of ['light','dark']){
   const context=await browser.newContext({viewport:{width,height:900},colorScheme:theme,reducedMotion:'reduce'}),page=await context.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));const result={lang,width,theme,passed:false};
   try{
    await page.goto(base+lang+'/',{waitUntil:'load'});await ready(page);
    if(await page.locator('html').getAttribute('data-theme')!==theme)await page.locator('#themeBtn').click();
    assert.ok(await page.locator('.hero [data-i18n="iaProjectDefinition"]').isVisible());
    assert.ok(await page.locator('.journeyFoundation').isVisible());
    assert.equal(await page.evaluate(()=>!!window.CTD_APS_2026),false,'Home eagerly downloaded the atlas');
    await checkPage(page,'overview');await screenshot(page,lang,width,theme,'home');
    await page.goto(base+lang+'/?tab=lugano',{waitUntil:'load'});await ready(page);
    for(const key of ['proposal','principles','proposal-conditions'])assert.ok(await page.locator('[data-narrative-essential="'+key+'"]').isVisible());
    assert.equal(await page.locator('[data-narrative-optional="roadmap"]').getAttribute('open'),null);
    await page.locator('.luganoHero').scrollIntoViewIfNeeded();await checkPage(page,'lugano');await screenshot(page,lang,width,theme,'lugano');
    await page.goto(base+lang+'/?tab=lugano#luganoRoadmap',{waitUntil:'load'});await ready(page);
    assert.ok(await page.locator('#luganoRoadmap').isVisible(),'Legacy roadmap fragment did not open detail');
    const summary=page.locator('[data-narrative-optional="roadmap"] > summary');await summary.focus();await page.keyboard.press('Enter');
    assert.equal(await page.locator('[data-narrative-optional="roadmap"]').getAttribute('open'),null,'Keyboard could not close roadmap');
    await page.keyboard.press('Enter');assert.ok(await page.locator('#luganoRoadmap').isVisible());
    await page.goto(base+lang+'/?tab=explore&q=.ai&scope=names',{waitUntil:'load'});await ready(page);
    assert.ok(await page.locator('#apsAtlasLink').isVisible());
    assert.equal(await page.evaluate(()=>!!window.CTD_APS_2026),false,'Name search unnecessarily downloaded the atlas');
    await page.locator('#apsAtlasLink').click();
    await page.locator('#aps-native .apsCard').first().waitFor({state:'visible',timeout:45000});
    await page.locator('#apsSearch').fill('.lugano');
    await page.waitForFunction(()=>document.querySelector('#apsResults')?.textContent.includes('.lugano')||[...document.querySelectorAll('#aps-native .apsCard')].some(n=>n.textContent.includes('.lugano')));
    assert.equal(await page.locator('#aps-native').evaluate(n=>n.closest('details')),null);
    await checkPage(page,'explore');await screenshot(page,lang,width,theme,'atlas');
    const other=lang==='en'?'it':'en';await page.selectOption('#langSelect',other);await page.waitForURL('**/'+other+'/**');await ready(page);
    assert.equal(new URL(page.url()).hash,'#aps-native','Language switch lost the atlas destination');
    await page.locator('#aps-native .apsCard').first().waitFor({state:'visible',timeout:45000});
    await page.goto(base+lang+'/?tab=explore&q=.ai&scope=names',{waitUntil:'load'});await ready(page);
    await page.locator('#aps-native').scrollIntoViewIfNeeded();
    await page.locator('#aps-native .apsCard').first().waitFor({state:'visible',timeout:45000});
    result.scrollLoadsAtlas=true;
    await page.goto(base+lang+'/?tab=economics#economics-comparison-guide',{waitUntil:'load'});await ready(page);
    assert.ok(await page.locator('#economics-comparison-guide').isVisible());
    assert.equal(await page.locator('.historicalEconomy').getAttribute('open'),null);
    await checkPage(page,'economics');await screenshot(page,lang,width,theme,'economics');
    await page.locator('#economics-historical-link').focus();await page.keyboard.press('Enter');
    await page.waitForFunction(()=>document.querySelector('.historicalEconomy').open);
    assert.ok(await page.locator('#economy-sectors').isVisible());
    assert.deepEqual(errors,[],'Browser runtime errors');result.passed=true;
   }catch(e){result.error=e.stack||String(e);report.errors.push(result);await page.screenshot({path:path.join(out,'failure-'+lang+'-'+width+'-'+theme+'.png')}).catch(()=>{});}
   finally{report.browser.push(result);await context.close();console.log('NARRATIVE_SCENARIO '+JSON.stringify(result));}
  }
  for(const lang of locales){
   const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}}),page=await context.newPage();
   try{for(const [tab,selector] of [['overview','.hero [data-i18n="iaProjectDefinition"]'],['lugano','.luganoHero'],['explore','#aps-native'],['economics','#economics-comparison-guide']]){
    await page.goto(base+lang+'/?tab='+tab,{waitUntil:'load'});assert.ok(await page.locator(selector).isVisible(),'No-JS essential block missing');
    report.noJavaScript.push({lang,tab,visible:true});
   }}finally{await context.close();}
  }
 }finally{await browser.close();}
}
(async()=>{
 try{staticChecks();if(!process.argv.includes('--static'))await browserChecks();report.passed=report.errors.length===0;}
 catch(e){report.errors.push({error:e.stack||String(e)});}
 fs.writeFileSync(path.join(ROOT,'docs/narrative-clarity-verification.json'),JSON.stringify(report,null,2)+'\n');
 console.log('NARRATIVE_CLARITY_RESULT '+JSON.stringify({passed:report.passed,staticPages:report.static.length,preservedFiles:report.preservedFiles.length,scenarios:report.browser.length,noJavaScript:report.noJavaScript.length,axeScans:report.axeScans,errors:report.errors}));
 if(!report.passed)process.exitCode=1;
})();
