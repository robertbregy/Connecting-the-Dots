#!/usr/bin/env node
'use strict';
const fs=require('node:fs');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const AxeBuilder=require('@axe-core/playwright').default;
const BASE=process.env.CTD_CITY_TEST_BASE||'http://127.0.0.1:8128/';
const data=JSON.parse(fs.readFileSync('data/city_namespace_editorial.json','utf8'));
const report={languages:[],viewports:[390,1280],themes:['light','dark'],pageChecks:0,sourceChecks:0,axeScans:0,issues:[],screenshots:[]};
const out='dist/city-namespace-qa';
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--disable-dev-shm-usage']});
 try {
  for(const lang of ['it','en','de','fr']){
   report.languages.push(lang);
   for(const width of report.viewports)for(const theme of report.themes){
    const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
    const page=await context.newPage();
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    try{
     const response=await page.goto(BASE+lang+'/?tab=cities#city-namespace-governance',{waitUntil:'load',timeout:35000});
     assert.equal(response.status(),200);
     await page.locator('#cities.section.active').waitFor({state:'visible'});
     if(await page.locator('html').getAttribute('data-theme')!==theme)await page.locator('#themeBtn').click();
     assert.equal(await page.locator('html').getAttribute('data-theme'),theme);
     assert.equal(await page.locator('[data-city-namespace]').count(),7,'seven native additions');
     assert.equal(await page.locator('#city-namespace-governance > :is(h2,h3)').innerText(),data.locales[lang].governanceTitle);
     assert.equal(await page.locator('#city-namespace-governance .citynsCard').count(),8,'four governance models and four examples');
     assert.equal(await page.locator('#city-namespace-measures .citynsCard').count(),4,'four proposed evaluation dimensions');
     await page.locator('#city-namespace-measures summary').click();
     assert.equal(await page.locator('#city-namespace-measures tbody tr').count(),8,'all benchmark cases, including Tokyo');
     assert.ok((await page.locator('#city-namespace-measures tbody').innerText()).includes('.tokyo'));
     await page.locator('#city-namespace-measures summary').focus();
     await page.keyboard.press('Enter');
     assert.equal(await page.locator('#city-namespace-measures details').getAttribute('open'),null,'benchmark keyboard disclosure');
     for(const [section,anchor,title] of [['cities','city-namespace-governance','governanceTitle'],['lugano','lugano-public-commons','luganoTitle'],['behind-round','city-domain-reception-note','notesTitle']]){
      await page.goto(BASE+lang+'/?tab='+section+'#'+anchor,{waitUntil:'load'});
      await page.locator('#'+section+'.section.active').waitFor({state:'visible'});
      if(await page.locator('html').getAttribute('data-theme')!==theme)await page.locator('#themeBtn').click();
      assert.equal(await page.locator('#'+anchor+' > :is(h2,h3)').innerText(),data.locales[lang][title]);
      const metrics=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,viewport:innerWidth}));
      assert.ok(metrics.scroll<=metrics.viewport+3,lang+' '+width+' '+section+' horizontal overflow');
      const axe=await new AxeBuilder({page}).include('#'+section+' .cityNamespace').withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
      report.axeScans++;
      assert.deepEqual(axe.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)})),[],lang+' '+theme+' '+section+' new-content accessibility');
      report.pageChecks++;
     }
     await page.locator('#city-domain-reception-note a').click();
     await page.locator('#lugano.section.active').waitFor({state:'visible'});
     assert.ok(await page.locator('#lugano-external-reading').isVisible(),'Field Note returns to critical external reception, not commercial reservations');
     await page.locator('#lugano-public-commons a[data-open-section="cities"]').click();
     await page.locator('#cities.section.active').waitFor({state:'visible'});
     const links=await page.locator('#cities .cityNamespace a[data-city-source]').evaluateAll(xs=>xs.map(x=>({key:x.dataset.citySource,url:x.href,kind:x.dataset.sourceClass})));
     for(const link of links){assert.equal(link.url,data.sources[link.key].url);assert.equal(link.kind,data.sources[link.key].kind);report.sourceChecks++;}
     await page.locator('#city-namespace-measures a[data-open-section="cemetery"]').click();
     await page.locator('#cemetery.section.active').waitFor({state:'visible'});
     assert.ok(await page.locator('#helsinki-termination').isVisible(),'existing Helsinki case preserved');
     assert.deepEqual(errors,[],'browser errors');
     if(lang==='it'){
      await page.goto(BASE+lang+'/?tab=cities#city-namespace-governance',{waitUntil:'load'});
      if(await page.locator('html').getAttribute('data-theme')!==theme)await page.locator('#themeBtn').click();
      const path=out+'/'+lang+'-'+theme+'-'+width+'-governance.png';
      await page.locator('#city-namespace-governance').screenshot({path});report.screenshots.push(path);
     }
     const standalone=await page.goto(BASE+'behind-the-round/'+lang+'/',{waitUntil:'load'});
     assert.equal(standalone.status(),200);
     assert.equal(await page.locator('#city-domain-reception-note h2').innerText(),data.locales[lang].notesTitle);
     const metadata=await page.locator('link[rel="canonical"]').getAttribute('href');
     assert.equal(metadata,'https://robertbregy.github.io/Connecting-the-Dots/behind-the-round/'+lang+'/');
    }catch(e){report.issues.push({lang,width,theme,error:e.stack||String(e)});}
    await context.close();
   }
  }
 }finally{await browser.close();}
 fs.writeFileSync(out+'/report.json',JSON.stringify(report,null,2));
 console.log('CITY_NAMESPACE_BROWSER_QA '+JSON.stringify(report));
 if(report.issues.length)process.exitCode=2;
})().catch(e=>{console.error(e);process.exitCode=3;});
