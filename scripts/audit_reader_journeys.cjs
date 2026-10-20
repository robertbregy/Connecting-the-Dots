'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const {chromium}=require('playwright'),AxeBuilder=require('@axe-core/playwright').default;
const root=path.resolve(__dirname,'..'),config=JSON.parse(fs.readFileSync(path.join(root,'data/reader_journeys.json'),'utf8'));
const base=process.env.CTD_TEST_BASE||'http://127.0.0.1:8123/';
const out=process.env.CTD_READER_QA||'/tmp/reader-qa';fs.mkdirSync(out,{recursive:true});
const langs=(process.env.CTD_READER_LANGS||'it,en,de,fr').split(',');
const widths=(process.env.CTD_READER_WIDTHS||'390,1440').split(',').map(Number);
const report={scenarios:[],issues:[],humanParticipants:0};
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--no-sandbox','--disable-dev-shm-usage']});
try{for(const lang of langs)for(const width of widths){
 const context=await browser.newContext({viewport:{width,height:950},reducedMotion:'reduce'});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto(base+lang+'/?tab=how',{waitUntil:'load'});await page.waitForFunction(()=>window.CTD_APP_READY);
  for(const id of Object.keys(config.related)){
   await page.evaluate(id=>{const link=document.querySelector('#reader-topic-list a[data-open-section="'+id+'"]');link.click();},id);
   await page.waitForFunction(id=>document.body.dataset.activeTab===id,id);
   assert.ok(await page.locator('#'+id+' > .readerBreadcrumb').isVisible(),id+' breadcrumb missing');
   assert.ok(await page.locator('#'+id+' > .readerNext').isVisible(),id+' next path missing');
   if(config.layouts[id]){
    assert.equal(await page.locator('#'+id+' > .readerStage').count(),config.layouts[id].groups.length);
    const nav=page.locator('#'+id+' > .sectionToc');assert.equal(await nav.locator('a').count(),config.layouts[id].groups.length);
    await nav.locator('a').last().click();
    await page.waitForFunction(id=>document.activeElement.id===id,'read-'+id+'-'+config.layouts[id].groups.length);
   }
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false,id+' horizontal overflow');
  }
  for(const theme of ['light','dark']){
   await page.evaluate(theme=>{if(document.documentElement.dataset.theme!==theme)document.getElementById('themeBtn').click()},theme);
   for(const id of ['how','social','reveal','research','geography','disputes','resources']){
    await page.evaluate(id=>document.querySelector('#reader-topic-list a[data-open-section="'+id+'"]').click(),id);
    await page.waitForFunction(id=>document.body.dataset.activeTab===id,id);
    const result=await new AxeBuilder({page}).include('#'+id).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
    assert.deepEqual(result.violations.map(v=>({id:v.id,impact:v.impact,targets:v.nodes.map(n=>n.target)})),[],id+' '+theme+' accessibility');
   }
   for(const id of ['social','how','research']){
    await page.goto(base+lang+'/?tab='+id,{waitUntil:'load'});await page.waitForFunction(()=>window.CTD_APP_READY);
    await page.evaluate(theme=>{if(document.documentElement.dataset.theme!==theme)document.getElementById('themeBtn').click()},theme);
    await page.screenshot({path:path.join(out,lang+'-'+width+'-'+id+'-'+theme+'.png')});
   }
  }
  await page.locator('#reader-directory > summary').click();await page.locator('#reader-search').fill('zzzz-no-result');await page.waitForTimeout(50);assert.ok(await page.locator('#reader-no-results').isVisible());
  await page.locator('#reader-search-clear').click();assert.equal(await page.locator('#reader-topic-list li:visible').count(),23);await page.locator('#reader-search').fill('DNS');assert.ok(await page.locator('#reader-topic-list li:visible').count()>0);
  const dirAxe=await new AxeBuilder({page}).include('#reader-directory').withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();assert.deepEqual(dirAxe.violations.map(v=>v.id),[],'Directory accessibility');
  await page.keyboard.press('Escape');assert.equal(await page.locator('#reader-directory').evaluate(n=>n.open),false);
  await page.goto(base+lang+'/?tab=how#how-part-5',{waitUntil:'load'});await page.waitForFunction(()=>window.CTD_APP_READY);assert.ok(await page.locator('#how-part-5').isVisible());
  await page.locator('#how > .sectionToc a').first().click();const hash=new URL(page.url()).hash;const other=lang==='en'?'it':'en';
  await page.selectOption('#langSelect',other);await page.waitForURL('**/'+other+'/**');await page.waitForFunction(()=>window.CTD_APP_READY);assert.equal(new URL(page.url()).hash,hash,'Language lost chapter anchor');
  assert.deepEqual(errors,[],'Runtime errors');report.scenarios.push({lang,width,status:'passed',chapters:23,themes:2,automatedAccessibilityChapters:7});
 }catch(e){const issue={lang,width,message:String(e),stack:e.stack};report.issues.push(issue);console.log(JSON.stringify(issue));await page.screenshot({path:path.join(out,lang+'-'+width+'-failure.png')}).catch(()=>{});}
 finally{await context.close();fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));console.log('READER_QA',lang,width,report.issues.length?'issues':'passed');}
}
const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:950}});const staticPage=await nojs.newPage();await staticPage.goto(base+'it/');await staticPage.locator('#reader-directory > summary').click();assert.equal(await staticPage.locator('#reader-topic-list a:visible').count(),75);await nojs.close();report.noJavaScriptDirectory=true;
const reflow=await browser.newContext({viewport:{width:320,height:950},reducedMotion:'reduce'});const small=await reflow.newPage();await small.goto(base+'it/?tab=how');await small.waitForFunction(()=>window.CTD_APP_READY);assert.equal(await small.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false,'320px reflow');await small.addStyleTag({content:'p,li,a{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}p{margin-bottom:2em!important}'});assert.equal(await small.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false,'Text spacing reflow');await reflow.close();report.narrowReflowAndSpacing=true;
}finally{await browser.close();fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));}if(report.issues.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=2});
