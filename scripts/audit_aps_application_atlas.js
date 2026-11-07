/* Independent Chromium audit of the ICANN 2026 application-level corpus, all locales. */
'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const AxeBuilder=require('@axe-core/playwright').default;
const fs=require('fs');
const base=(process.env.CTD_TEST_BASE||'http://127.0.0.1:8123').replace(/\/$/,'');
const stateScenarios=[];
async function verifyCardHeadings(page,native){
 const level=native?4:3,tag='H'+level;
 const headings=await page.locator('.apsCard').evaluateAll(cards=>cards.map(card=>({
  tag:card.querySelector('.apsCardString')?.tagName,
  count:card.querySelectorAll('h1,h2,h3,h4,h5,h6').length
 })));
 assert.ok(headings.length>0,'Atlas must render headings for its applications');
 for(const heading of headings){assert.equal(heading.tag,tag);assert.equal(heading.count,1);}
 const session=await page.context().newCDPSession(page);
 try{
  await session.send('Accessibility.enable');
  const {root}=await session.send('DOM.getDocument');
  const {nodeId}=await session.send('DOM.querySelector',{nodeId:root.nodeId,selector:'.apsCardString'});
  const {node}=await session.send('DOM.describeNode',{nodeId});
  const {nodes}=await session.send('Accessibility.getPartialAXTree',{backendNodeId:node.backendNodeId,fetchRelatives:false});
  const heading=nodes.find(n=>n.backendDOMNodeId===node.backendNodeId&&!n.ignored&&n.role?.value==='heading');
  assert.ok(heading,'Application title must be exposed as an accessible heading');
  assert.equal(heading.properties?.find(property=>property.name==='level')?.value?.value,level);
  const primary=await page.locator('.apsCardString bdi').first().textContent();
  assert.ok(heading.name?.value.includes(primary),'Application heading must retain its visible string');
  return {cards:headings.length,level,computedAX:true};
 }finally{await session.detach();}
}
async function verifyState(page,language,native){
 const prefix=native?'aps_':'',route=native?language+'/':'applications/'+language+'/';
 await page.goto(base+'/'+route+(native?'?tab=explore&q=.lugano&type=country-code#aps-native':'?q=.lugano#aps-results'),{waitUntil:'load'});
 await page.waitForSelector('.apsCard');
 assert.equal(await page.locator('.apsCard').count(),1,'Legacy query must seed the Atlas');
 const initialHeadings=await verifyCardHeadings(page,native);
 await page.locator('#apsSearch').fill('tether');
 await page.locator('#apsType').selectOption('brand');
 await page.locator('#apsRegion').selectOption('LAC');
 const shared=new URL(page.url());
 assert.equal(shared.searchParams.get(prefix+'q'),'tether');
 assert.equal(shared.searchParams.get(prefix+'type'),'brand');
 assert.equal(shared.searchParams.get(prefix+'region'),'LAC');
 if(native){
  assert.equal(shared.searchParams.get('q'),'.lugano');assert.equal(shared.searchParams.get('type'),'country-code');
  assert.equal(shared.searchParams.get('tab'),'explore');assert.equal(shared.hash,'#aps-native');
  const languageHref=await page.locator('#languageVersions a[data-language="fr"]').getAttribute('href');
  assert.equal(new URL(languageHref,page.url()).searchParams.get('aps_q'),'tether','Language link must carry the current Atlas query');
 }
 await page.reload({waitUntil:'load'});await page.waitForSelector('.apsCard');
 const expected=['TOSD2642T-T84921','TOSD2642T-T92840'];
 const ids=()=>page.locator('.apsCard').evaluateAll(nodes=>nodes.map(n=>n.dataset.apsId).sort());
 assert.deepEqual(await ids(),expected,'Reload must reproduce the two Tether applications');
 assert.equal(await page.locator('#apsType').inputValue(),'brand');assert.equal(await page.locator('#apsRegion').inputValue(),'LAC');
 const next=language==='fr'?'it':'fr';
 await page.locator(native?'#langSelect':'#apsLangSelect').selectOption(next);
 await page.waitForURL(url=>url.pathname.endsWith('/'+next+'/'));
 await page.waitForSelector('.apsCard');
 assert.deepEqual(await ids(),expected,'Changing language must preserve the same filtered applications');
 await page.locator('#apsReset').click();
 assert.equal(await page.locator('#apsSearch').inputValue(),'');
 if(native){const cleared=new URL(page.url());assert.equal(cleared.searchParams.get('q'),'.lugano');assert.equal(cleared.searchParams.get('tab'),'explore');assert.equal(cleared.hash,'#aps-native');}
 await page.reload({waitUntil:'load'});await page.waitForSelector('.apsCard');
 assert.equal(await page.locator('#apsSearch').inputValue(),'','Reset must stay empty despite a legacy Explorer query');
 assert.equal(await page.locator('.apsCard').count(),30);
 const first=page.locator('.apsCard').first(),id=await first.getAttribute('data-aps-id');
 await first.locator('summary').click();
 await page.locator('#apsMore').click();
 assert.equal(await page.locator('.apsCard').count(),60);
 assert.ok(await page.locator('[data-aps-id="'+id+'"] details').evaluate(node=>node.open),'Loading more must preserve open source details');
 const headings=await verifyCardHeadings(page,native);
 stateScenarios.push({language,surface:native?'embedded':'standalone',sharedReload:true,independentFilters:true,languageSwitch:true,reset:true,openDetailsPreserved:true,headings:{initial:initialHeadings,expanded:headings}});
}
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
  await verifyState(p,lang,false);
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
   if(width===320)await verifyState(p,lang,true);
   assert.deepEqual(errors,[],'Native Atlas runtime errors '+lang);
   await p.close();await ctx.close();metrics.viewports++;metrics.searchChecks++;
  }
 }
 await browser.close();
 assert.equal(metrics.overflows,0);assert.equal(metrics.errors,0);
 console.log('APS_ATLAS_BROWSER_AUDIT '+JSON.stringify(metrics));
 fs.writeFileSync('audit-aps-atlas-state.json',JSON.stringify({sourceCommit:process.env.GITHUB_SHA||null,base,metrics,stateScenarios,passed:stateScenarios.length===8,humanParticipants:0},null,2)+'\n');
})().catch(e=>{console.error('APS_ATLAS_BROWSER_FAILURE '+e.stack);process.exit(2)});
