/* Browser acceptance for the v0.7.99 experience fixes. No human-study claims.
 * Runs on the built site in CI; --check via Node checks syntax without a browser.
 */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const AxeBuilder=require('@axe-core/playwright').default;
const base=(process.env.CTD_TEST_BASE||'http://127.0.0.1:8123/').replace(/\/?$/,'/');
const out=process.env.CTD_EXPERIENCE_QA||'audit-experience';
const languages=['en','it','de','fr'],widths=[320,390],height=844;
const report={sourceCommit:process.env.GITHUB_SHA||null,base,viewportHeight:height,
 humanParticipants:0,accessibilityMethod:'Chromium CDP computed AX name and description',
 coverageLimits:['Automated checks are not an accessibility certification or a human study.','No actual assistive-technology session or 200% text-zoom test is claimed.'],
 scenarios:[],axeScans:0,errors:[],passed:false};
const flat=value=>String(value??'').replace(/\s+/g,' ').trim();
fs.mkdirSync(out,{recursive:true});

async function elementAX(context,page,selector='.explorerCardButton',role='button'){
 const session=await context.newCDPSession(page);
 try{
  await session.send('Accessibility.enable');
  const {root}=await session.send('DOM.getDocument');
  const {nodeId}=await session.send('DOM.querySelector',{nodeId:root.nodeId,selector});
  assert.ok(nodeId,'Element missing from DOM: '+selector);
  const {node}=await session.send('DOM.describeNode',{nodeId});
  const {nodes}=await session.send('Accessibility.getPartialAXTree',{backendNodeId:node.backendNodeId,fetchRelatives:false});
  const control=nodes.find(n=>n.backendDOMNodeId===node.backendNodeId&&n.role?.value===role&&!n.ignored);
  assert.ok(control,'Element is not exposed as an accessible '+role+': '+selector);
  return {role:control.role.value,name:flat(control.name?.value),description:flat(control.description?.value),
   level:control.properties?.find(property=>property.name==='level')?.value?.value};
 }finally{await session.detach();}
}

async function scenario(browser,lang,width){
 const context=await browser.newContext({viewport:{width,height},colorScheme:'light',reducedMotion:'reduce'});
 const page=await context.newPage(),runtime=[];
 const state={lang,width,height,checks:[],errors:[],passed:false};
 page.on('pageerror',error=>runtime.push(error.message));
 async function check(name,run){
  try{await run();state.checks.push({name,passed:true});}
  catch(error){state.checks.push({name,passed:false});state.errors.push({check:name,error:error.stack||String(error)});}
 }
 try{
  await page.goto(base+lang+'/?tab=explore',{waitUntil:'load'});
  await page.waitForFunction(()=>window.CTD_APP_READY===true,null,{timeout:30000});
  await page.locator('#explore.section.active').waitFor({state:'visible'});
  // Measure before fill/focus/click: Playwright's automatic scrolling must not
  // disguise an entry point that initially sits below the viewport or a header.
  await check('search is initially visible and unobscured',async()=>{
   state.searchEntry=await page.locator('#explorerSearch').evaluate(input=>{
    const r=input.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2;
    const inViewport=r.width>0&&r.height>0&&r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight;
    const hit=inViewport?document.elementFromPoint(x,y):null;
    return {top:r.top,bottom:r.bottom,left:r.left,right:r.right,height:r.height,center:{x,y},scrollY,
     inViewport,unobscured:hit===input||input.contains(hit),hit:hit?{tag:hit.tagName,id:hit.id}:null};
   });
   assert.ok(state.searchEntry.inViewport,'Search field is not fully inside the initial viewport: '+JSON.stringify(state.searchEntry));
   assert.ok(state.searchEntry.unobscured,'Search center is covered: '+JSON.stringify(state.searchEntry));
  });
  await page.screenshot({path:path.join(out,`search-entry-${lang}-${width}.png`),fullPage:false});
  await check('direct view has one accessible level-one title',async()=>{
   state.directHeading=await elementAX(context,page,'#explore .readerChapterTitle','heading');
   assert.equal(state.directHeading.level,1,'The routed title must be exposed at level one');
   assert.equal(state.directHeading.name,flat(await page.locator('#explore .readerChapterTitle').textContent()));
   assert.equal(await page.getByRole('heading',{level:1}).count(),1,'Only the active view has a visible level-one title');
  });

  await page.locator('#explorerSearch').fill('.lugano');
  await page.locator('#explorerSearchScope').selectOption('names');
  await page.waitForFunction(()=>{
   const cards=document.querySelectorAll('#explorerCards .explorerCardButton');
   return cards.length===1&&cards[0].querySelector('.explorerTld')?.textContent.trim()==='.lugano';
  });
  const card=page.locator('#explorerCards .explorerCardButton');
  await card.waitFor({state:'visible'});
  await check('AX exposes every visible record fact and the localized action',async()=>{
   state.visibleFacts=(await card.locator('.explorerTld,.recordLevel,.explorerState,.pill,.explorerCardEntity,[class*="Badge"]').allTextContents()).map(flat).filter(Boolean);
   assert.ok(state.visibleFacts.length>=4,'Insufficient visible record information to validate');
   state.expectedAction=await page.evaluate(language=>window.DOT_I18N[language].exploreOpenRecordLabel.replace('{name}','.lugano'),lang);
   state.ax=await elementAX(context,page);
   for(const fact of state.visibleFacts)assert.ok(state.ax.name.includes(fact),'AX name omits visible record information: '+fact+'; '+JSON.stringify(state.ax));
   assert.equal(state.ax.description,state.expectedAction,'AX description lost the localized open-record action');
  });
  await check('axe WCAG 2 A/AA, 2.1 A/AA and 2.2 AA',async()=>{
   const scan=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();
   report.axeScans++;
   state.axeViolations=scan.violations.map(v=>({id:v.id,impact:v.impact,help:v.help,nodes:v.nodes.map(n=>({target:n.target,failureSummary:n.failureSummary}))}));
   state.axeIncomplete=scan.incomplete.map(v=>({id:v.id,help:v.help,nodes:v.nodes.map(n=>n.target)}));
   assert.deepEqual(state.axeViolations,[],'Automated accessibility violations');
  });
  await check('keyboard activation and Escape restore the result focus',async()=>{
   await card.focus();
   // Check normal tab order as well as programmatic focus before activation.
   await page.keyboard.press('Shift+Tab');
   await page.keyboard.press('Tab');
   assert.ok(await card.evaluate(node=>document.activeElement===node),'Result is not reachable in normal tab order');
   await page.keyboard.press('Enter');
   await page.locator('#explorerDrawer.open').waitFor({state:'visible'});
   await page.waitForFunction(()=>document.getElementById('profileTitle')?.textContent.trim()==='.lugano'&&document.getElementById('explorerDrawer')?.contains(document.activeElement));
   assert.equal(await page.locator('#explorerDrawer').getAttribute('aria-hidden'),'false');
   await page.keyboard.press('Escape');
   await page.waitForFunction(()=>!document.getElementById('explorerDrawer')?.classList.contains('open')&&document.activeElement?.matches('#explorerCards .explorerCardButton'));
   assert.ok(await card.evaluate(node=>document.activeElement===node),'Escape did not restore focus to the triggering record');
   state.focusReturnedToResult=true;
  });
  await check('view switches preserve title nodes and restore the home hierarchy',async()=>{
   let previous=await page.locator('#explore .readerChapterTitle').elementHandle();
   state.headingSwitches=[];
   for(const [view,selector,link] of [
    ['ia-stories','#ia-stories .iaHubHead h2','.iaPrimaryNav [data-open-section="ia-stories"]'],
    ['economics','#economics .readerChapterTitle','#ia-stories [data-open-section="economics"]']
   ]){
    const original=await page.locator(selector).elementHandle();
    await page.locator(link).click();
    await page.waitForFunction(id=>document.body.dataset.activeTab===id,view);
    const ax=await elementAX(context,page,selector,'heading');
    assert.equal(ax.level,1,'The switched title must be exposed at level one');
    assert.equal(await page.getByRole('heading',{level:1}).count(),1);
    assert.ok(await original.evaluate((node,sel)=>node===document.querySelector(sel)&&document.activeElement===node,selector),'Routing must retain and focus the original title node');
    assert.equal(await previous.getAttribute('aria-level'),null,'Previous title must regain its native level');
    state.headingSwitches.push({view,ax,nodeAndFocusPreserved:true});
    previous=original;
   }
   await page.locator('.brand').click();
   await page.waitForFunction(()=>document.body.dataset.activeTab==='overview');
   state.homeHeading=await elementAX(context,page,'.hero h1','heading');
   assert.equal(state.homeHeading.level,1);
   assert.equal(await page.getByRole('heading',{level:1}).count(),1);
   assert.equal(await page.locator('.readerChapterTitle[aria-level],.iaHubHead h2[aria-level]').count(),0,'Home must not retain a routed heading override');
   assert.equal(await previous.getAttribute('aria-level'),null);
  });
  await check('no runtime exception',async()=>assert.deepEqual(runtime,[]));
 }catch(error){state.errors.push({check:'scenario setup',error:error.stack||String(error)});}
 finally{
  state.passed=state.errors.length===0;
  if(!state.passed){try{await page.screenshot({path:path.join(out,`failure-${lang}-${width}.png`),fullPage:false});}catch{}report.errors.push({lang,width,errors:state.errors});}
  report.scenarios.push(state);console.log('EXPERIENCE_SCENARIO '+JSON.stringify(state));
  await context.close();
 }
}

(async()=>{
 let browser;
 try{
  browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--no-sandbox','--disable-dev-shm-usage']});
  for(const lang of languages)for(const width of widths)await scenario(browser,lang,width);
  report.passed=report.errors.length===0&&report.scenarios.length===8&&report.axeScans===8;
 }catch(error){report.errors.push({fatal:error.stack||String(error)});}
 finally{
  if(browser)await browser.close();
  fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');
  console.log('EXPERIENCE_BROWSER_RESULT '+JSON.stringify({passed:report.passed,scenarios:report.scenarios.length,axeScans:report.axeScans,errors:report.errors.length,humanParticipants:0}));
  if(!report.passed)process.exitCode=1;
 }
})();
