/* Independent Chromium audit of the ICANN 2026 application-level corpus, all locales. */
'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const AxeBuilder=require('@axe-core/playwright').default;
const fs=require('fs');
const base='http://127.0.0.1:8123';
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--disable-dev-shm-usage']});
 const metrics={languages:4,viewports:0,searchChecks:0,linkChecks:0,filterChecks:0,overflows:0,errors:0,wcagScans:0};
 for(const lang of ['it','en','de','fr']){
  for(const width of [320,390,768,1360]){
   const context=await browser.newContext({viewport:{width,height:850}});
   const page=await context.newPage();
   const failures=[];page.on('pageerror',e=>failures.push(e.message));
   const response=await page.goto(base+'/applications/'+lang+'/',{waitUntil:'load',timeout:35000});
   assert.equal(response.status(),200,lang+' must be reachable');
   await page.waitForSelector('.apsCard',{timeout:13000});
   assert.equal(await page.locator('#apsLangSelect').inputValue(),lang,'Main-site language selector must match Atlas locale');
   assert.equal(await page.locator('.apsHeader .apsLanguages').count(),0,'No duplicate language navigation');
   await page.evaluate(()=>localStorage.setItem('dotTheme','light'));
   await page.reload({waitUntil:'load'});
   await page.waitForSelector('.apsCard',{timeout:13000});
   const light=await page.evaluate(()=>({theme:document.documentElement.dataset.theme,bg:getComputedStyle(document.body).backgroundColor,
      foreground:getComputedStyle(document.body).color}));
   assert.equal(light.theme,'light','Atlas must share the main-site saved theme');
   assert.equal(light.bg,'rgb(247, 247, 248)','Light mode must match main site even if OS prefers dark');
   await page.locator('#apsThemeToggle').click();
   assert.equal(await page.evaluate(()=>localStorage.getItem('dotTheme')),'dark','Atlas theme control must update the main-site preference');
   assert.equal(await page.evaluate(()=>document.documentElement.dataset.theme),'dark');
   await page.locator('#apsThemeToggle').click();
   const loaded=await page.evaluate(()=>({
    cards:document.querySelectorAll('.apsCard').length,
    lang:document.documentElement.lang,
    total:window.CTD_APS_2026?.apps?.length,
    replacement:window.CTD_APS_2026?.counts?.replacementRecords,
    exact:window.CTD_APS_2026?.counts?.derivedExactPrimaryMatchGroups,
    docWidth:document.documentElement.scrollWidth,viewport:document.documentElement.clientWidth,
    canonical:document.querySelector('link[rel=canonical]')?.href,
    languageLinks:document.querySelectorAll('link[hreflang]').length
   }));
   assert.equal(loaded.lang,lang);
   assert.equal(loaded.total,1614);
   assert.equal(loaded.replacement,1169);
   assert.equal(loaded.exact,263);
   assert.equal(loaded.cards,30);
   assert.equal(loaded.languageLinks,5);
   assert.ok(loaded.canonical.endsWith('/applications/'+lang+'/'));
   metrics.viewports++;
   if(loaded.docWidth>loaded.viewport+3){metrics.overflows++;throw new Error(lang+' '+width+'px horizontal overflow '+JSON.stringify(loaded));}
   await page.locator('#apsSearch').fill('CDL2651T-T31516');
   await page.waitForTimeout(50);
   assert.equal(await page.locator('.apsCard').count(),1,lang+' ID lookup');
   assert.ok((await page.locator('.apsCard').first().innerText()).includes('lugano'));
   await page.locator('.apsCard summary').first().click();
   const links=await page.locator('.apsCardDetails a[target="_blank"]').evaluateAll(nodes=>nodes.map(n=>n.href));
   assert.ok(links.some(s=>s==='https://newgtldprogram-aps.icann.org/applications/CDL2651T-T31516/summary'));
   assert.ok(links.some(s=>s.endsWith('/CDL2651T-T31516/application-responses')));
   assert.ok(links.some(s=>s.endsWith('/CDL2651T-T31516/documents')));
   metrics.linkChecks+=3;metrics.searchChecks++;
   await page.locator('#apsSearch').fill('agent');
   assert.ok(await page.locator('.apsCard').count()>0,'agent strings must be indexed');
   metrics.searchChecks++;
   await page.locator('#apsSearch').fill('');
   await page.locator('#apsRole').selectOption('exact');
   let shown=await page.locator('#apsResultCount').innerText();
   assert.ok(shown.includes('891'),'All 891 exact primary matches must be filterable '+lang+': '+shown);
   metrics.filterChecks++;
   await page.locator('#apsRole').selectOption('replacement');
   shown=await page.locator('#apsResultCount').innerText();
   assert.ok(shown.replace(/[^0-9]/g,'').endsWith('1169'),'1,169 replacement families missing: '+shown);
   metrics.filterChecks++;
   await page.locator('#apsReset').click();
   assert.equal(await page.locator('#apsSearch').inputValue(),'');
   assert.equal(await page.locator('#apsRole').inputValue(),'all');
   metrics.filterChecks++;
   if(width===320||width===1360){
    const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
    const faults=audit.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.length,
      example:v.nodes[0]?.target?.slice(0,3)}));
    assert.deepEqual(faults,[],lang+' '+width+'px application atlas WCAG A/AA failures');
    metrics.wcagScans++;
   }
   if(width===390)await page.screenshot({path:'audit-aps-atlas-'+lang+'-mobile.png'});
   assert.deepEqual(failures,[],lang+' '+width+'px page errors');
   await page.close();await context.close();
  }
  const ctx=await browser.newContext({viewport:{width:1200,height:850}});
  const p=await ctx.newPage();
  await p.goto(base+'/applications/'+lang+'/?id=CDL2651T-T31516',{waitUntil:'load'});
  await p.waitForSelector('.apsCard',{timeout:10000});
  assert.equal(await p.locator('.apsCard').count(),1);
  assert.ok(await p.locator('.apsCard details').first().evaluate(n=>n.open),'Direct application permalink must expand details');
  await p.close();await ctx.close();metrics.searchChecks++;
 }
 // The embedded Atlas is now a native view of Explore: test the actual B2 route,
 // not only the retained public /applications/{lang}/ permalinks.
 for(const lang of ['it','en','de','fr']){
  for(const width of [320,1360]){
   const ctx=await browser.newContext({viewport:{width,height:850}});
   const p=await ctx.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));
   const res=await p.goto(base+'/'+lang+'/?tab=explore#aps-native',{waitUntil:'load',timeout:35000});
   assert.equal(res.status(),200);
   await p.waitForSelector('#aps-native .apsCard',{timeout:15000});
   assert.equal(await p.locator('#aps-native .apsCard').count(),30,'Native initial card page '+lang);
   assert.equal(await p.locator('#aps-native #apsSearch').count(),1);
   assert.ok(await p.locator('#aps-native').isVisible(),'Atlas panel must be visible inside Explore '+lang);
   await p.locator('#aps-native #apsSearch').fill('CDL2651T-T31516');
   assert.equal(await p.locator('#aps-native .apsCard').count(),1,'Native search must work '+lang);
   assert.ok((await p.locator('#aps-native .apsCard').first().innerText()).toLowerCase().includes('lugano'));
   const widths=await p.evaluate(()=>({viewport:document.documentElement.clientWidth,doc:document.documentElement.scrollWidth}));
   assert.ok(widths.doc<=widths.viewport+3,'Native Atlas overflow '+lang+' '+width+': '+JSON.stringify(widths));
   await p.locator('#aps-native #apsReset').click();
   assert.equal(await p.locator('#aps-native .apsCard').count(),30);
   assert.deepEqual(errors,[],'Native Atlas runtime errors '+lang);
   await p.close();await ctx.close();metrics.viewports++;metrics.searchChecks++;
  }
 }
 await browser.close();
 assert.equal(metrics.overflows,0);assert.equal(metrics.errors,0);
 console.log('APS_ATLAS_BROWSER_AUDIT '+JSON.stringify(metrics));
})().catch(e=>{console.error('APS_ATLAS_BROWSER_FAILURE '+e.stack);process.exitCode=2});
