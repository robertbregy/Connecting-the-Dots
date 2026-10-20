'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const AxeBuilder=require('@axe-core/playwright').default;
const root=path.resolve(__dirname,'..');
const data=JSON.parse(fs.readFileSync(path.join(root,'data/economics_reading_order.json'),'utf8'));
const base=process.env.CTD_TEST_BASE||'http://127.0.0.1:8128/';
const out=process.env.CTD_ECONOMICS_QA||'/tmp/ctd-economics-order';fs.mkdirSync(out,{recursive:true});
const languages=(process.env.CTD_ECONOMICS_LANGS||'it,en,de,fr').split(',');
const widths=(process.env.CTD_ECONOMICS_WIDTHS||'390,1440').split(',').map(Number);
const legacy=['economics-part-1','economics-part-2','economics-part-3','economics-part-4','economics-part-5','economics-part-6','economics-part-7','economics-part-8','economics-part-9','round-application-fees','economy-sectors','tld-market-reach','aps-current-economics','econ-case-ai'];
const report={scenarios:[],errors:[]};
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--no-sandbox','--disable-dev-shm-usage']});
 try{for(const lang of languages)for(const width of widths){
  const context=await browser.newContext({viewport:{width,height:900},colorScheme:'light',reducedMotion:'reduce'});
  const page=await context.newPage(),runtimeErrors=[];page.on('pageerror',e=>runtimeErrors.push(e.message));
  const result={lang,width,passed:false};
  try{
   await page.goto(base+lang+'/?tab=economics',{waitUntil:'load'});
   await page.waitForFunction(()=>window.CTD_APP_READY===true,null,{timeout:20000});
   assert.deepEqual(await page.locator('#economics > .economicsChapter').evaluateAll(ns=>ns.map(n=>n.dataset.economicsStage)),data.order);
   assert.equal(await page.locator('#economics > .sectionToc a').count(),6);
   assert.equal(await page.locator('#economicGrid .economicCase').count(),8);
   assert.equal(await page.locator('#economicModels .economicModel').count(),8);
   assert.equal(await page.locator('#economicGrid h3,#economicModels h3').count(),0,'Runtime reversed the heading hierarchy');
   for(const stage of data.order){
    await page.locator('#economics > .sectionToc a[href$="#economics-'+stage+'"]').click();
    await page.waitForFunction(id=>location.hash==='#'+id&&document.activeElement.id===id,'economics-'+stage);
    assert.ok(await page.locator('#economics-'+stage).isVisible());
   }
   for(const id of legacy){
    await page.goto(base+lang+'/?tab=economics#'+id,{waitUntil:'load'});
    await page.waitForFunction(()=>window.CTD_APP_READY===true);
    await page.waitForFunction(id=>{let n=document.getElementById(id);if(!n||!n.getBoundingClientRect().height)return false;for(;n;n=n.parentElement)if(n.tagName==='DETAILS'&&!n.open)return false;return true;},id);
   }
   await page.goto(base+lang+'/?tab=economics',{waitUntil:'load'});
   await page.waitForFunction(()=>window.CTD_APP_READY===true);
   await page.locator('#economics-historical-link').focus();await page.keyboard.press('Enter');
   await page.waitForFunction(()=>document.querySelector('.historicalEconomy').open);
   await page.goBack();await page.waitForTimeout(80);
   await page.locator('#economics > .sectionToc a[href$="#economics-reach"]').click();
   await page.locator('[data-market-view="zones"]').click();
   assert.equal(await page.locator('[data-market-view="zones"]').getAttribute('aria-pressed'),'true');
   await page.locator('#market-search').fill('xyz');
   assert.ok(await page.locator('#market-zones tbody tr:visible').count()>0);
   await page.locator('#market-search').fill('');
   for(const theme of ['light','dark']){
    if(await page.locator('html').getAttribute('data-theme')!==theme)await page.locator('#themeBtn').click();
    assert.equal(await page.locator('#economics > .sectionToc a').count(),6);
    assert.equal(await page.locator('#economicGrid .economicCase').count(),8);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false,'Horizontal page overflow');
    const axe=await new AxeBuilder({page}).include('#economics').withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
    assert.deepEqual(axe.violations.map(v=>({id:v.id,impact:v.impact,targets:v.nodes.map(n=>n.target)})),[],theme+' accessibility violations');
    await page.locator('#economics').evaluate(n=>n.scrollIntoView({block:'start'}));
    await page.screenshot({path:path.join(out,lang+'-'+width+'-'+theme+'.png'),fullPage:false});
   }
   await page.locator('#economics > .sectionToc a[href$="#economics-cycles"]').click();
   const other=lang==='en'?'it':'en';await page.selectOption('#langSelect',other);await page.waitForURL('**/'+other+'/**');
   await page.waitForFunction(()=>window.CTD_APP_READY===true);
   assert.equal(new URL(page.url()).hash,'#economics-cycles');
   assert.ok(await page.locator('#economics-cycles').isVisible());
   assert.deepEqual(runtimeErrors,[]);result.passed=true;
  }catch(e){result.error=e.stack||String(e);report.errors.push(result);try{await page.screenshot({path:path.join(out,lang+'-'+width+'-failure.png')});}catch{}}
  finally{await context.close();report.scenarios.push(result);console.log('ECONOMICS_BROWSER '+JSON.stringify(result));}
 }}finally{await browser.close();fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));}
 if(report.errors.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=2;});
