/* Real-browser regression scenarios. Automated checks are not user research
   and must never be described as a complete WCAG conformance assessment. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright'),AxeBuilder=require('@axe-core/playwright').default;
const root=path.resolve(__dirname,'..'),config=JSON.parse(fs.readFileSync(path.join(root,'data/reader_pathways.json'),'utf8'));
const base=process.env.CTD_TEST_BASE||'http://127.0.0.1:8128/';
const out=process.env.CTD_READER_QA||'/tmp/ctd-reader-qa';fs.mkdirSync(out,{recursive:true});
const report={scenarios:[],issues:[],humanParticipants:0,scope:'Automated Chromium checks: routes, focus, history, locales, layout and axe. Not a WCAG conformance certificate.'};
const allRoutes=['overview',...Object.keys(config.areas).map(k=>'ia-'+k),...Object.values(config.areas).flat()];
const shots=new Set(['overview','ia-understand','ia-stories','ia-research','how','social','cities','economics','research','resources','governance-access']);
async function load(page,url){await page.goto(url,{waitUntil:'load'});await page.waitForFunction(()=>window.CTD_APP_READY&&window.CTD_READER_READY,null,{timeout:20000});}
async function choose(page,id){
 if(id==='overview'){await page.locator('.brand').click();}
 else{await page.locator('.readerIndexTrigger').click();await page.locator('#reader-index a[data-open-section="'+id+'"]').click();}
 await page.waitForFunction(id=>document.body.dataset.activeTab===id,id);await page.waitForTimeout(60);
}
async function scenario(browser,lang,width){
 const context=await browser.newContext({viewport:{width,height:960},reducedMotion:'reduce',colorScheme:'light'}),page=await context.newPage();
 const jsErrors=[];page.on('pageerror',e=>jsErrors.push(e.message));
 try{
  await load(page,base+lang+'/');
  await page.locator('.skipLink').focus();await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>document.activeElement.id),'main-content','Skip link');
  for(const id of allRoutes){
   const row={lang,width,route:id,themes:[],passed:false};
   try{
    await choose(page,id);
    if(id!=='overview')assert.ok((await page.title()).endsWith('| Connecting the Dots'),'Contextual page title');
    for(const theme of ['light','dark']){
     if(await page.locator('html').getAttribute('data-theme')!==theme)await page.locator('#themeBtn').click();
     const overflow=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,elements:[...document.querySelectorAll('body *')].filter(n=>{const r=n.getBoundingClientRect();return r.height>0&&r.width>0&&(r.right>innerWidth+2||r.left< -2)&&getComputedStyle(n).position!=='fixed'&&!n.closest('.tableWrap,.tableScroll,.explorerDrawer,.tableResponsive,.auditTableScroll,[role="region"]')}).slice(0,8).map(n=>({tag:n.tagName,id:n.id,class:n.className}))}));
     assert.ok(overflow.scroll<=overflow.width+2,'Page overflow '+JSON.stringify(overflow));
     const axeScope=lang==='it'||id.startsWith('ia-')||['overview','how','research','resources'].includes(id);
     if(axeScope){
      const result=await new AxeBuilder({page}).include('#'+id).include('.topbar').include('.iaPrimaryNav').withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();
      const violations=result.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary,html:n.html.slice(0,220)}))}));
      assert.deepEqual(violations,[],JSON.stringify(violations));
     }
     row.themes.push({theme,axe:axeScope?'passed':'not-run',overflow:'none'});
     if(shots.has(id)&&((lang==='it')||(id==='overview'&&theme==='light'))){await page.screenshot({path:path.join(out,lang+'-'+width+'-'+id+'-'+theme+'.png'),fullPage:false});}
    }
    // Follow a local outline with keyboard and test browser Back restoration.
    const outline=page.locator('#'+id+' > .readerOutline');
    if(await outline.count()){
     if(!await outline.evaluate(n=>n.open))await outline.locator('summary').click();
     const a=outline.locator('a').first(),anchor=await a.getAttribute('data-open-anchor');
     await a.focus();await page.keyboard.press('Enter');
     await page.waitForFunction(anchor=>location.hash==='#'+anchor&&document.activeElement.id===anchor,anchor);
     assert.ok(await page.locator('[id="'+anchor+'"]').isVisible(),'Outline focus destination hidden');
     await page.goBack();await page.waitForFunction(id=>document.body.dataset.activeTab===id,id);
    }
    if(config.next[id]){
     const a=page.locator('#'+id+' > .readerNext .readerNextCard').first(),target=await a.getAttribute('data-open-section');
     await a.click();await page.waitForFunction(id=>document.body.dataset.activeTab===id,target);await page.goBack();await page.waitForFunction(id=>document.body.dataset.activeTab===id,id);
    }
    row.passed=true;
   }catch(e){row.error=e.message;report.issues.push(row);try{await page.screenshot({path:path.join(out,lang+'-'+width+'-'+id+'-failure.png')});}catch{}}
   report.scenarios.push(row);console.log('READER_BROWSER '+JSON.stringify(row));
  }
  // Review the actual reading exits and complete index, not just page tops.
  if(lang==='it'){
   await choose(page,'social');await page.locator('#social > .readerNext').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,'it-'+width+'-reading-exits.png')});
   await page.locator('.readerIndexTrigger').click();await page.screenshot({path:path.join(out,'it-'+width+'-complete-index.png')});
  }
  // Three entry intentions, the novice guide and direct citation flow.
  await choose(page,'overview');await page.locator('.readerIntents [data-open-section="overview"]').click();
  assert.equal(await page.locator('#three-minute-guide').evaluate(n=>n.open),true);
  await choose(page,'overview');await page.locator('.readerIntents [data-open-section="research"]').click();
  assert.ok(await page.locator('#research-citation-guide').isVisible());
  // Stable inbound URLs, including old IDs whose order has changed.
  for(const [tab,anchor] of [['how','how-part-1'],['how','how-glossary'],['social','social-part-5'],['disputes','disputes-part-4'],['cemetery','helsinki-termination'],['economics','round-application-fees']]){
   await load(page,base+lang+'/?tab='+tab+'#'+anchor);
   await page.waitForFunction(id=>{const n=document.getElementById(id);if(!n||n.getBoundingClientRect().height===0)return false;for(let p=n;p;p=p.parentElement)if(p.tagName==='DETAILS'&&!p.open)return false;return true},anchor);
   report.scenarios.push({lang,width,legacy:anchor,passed:true});
  }
  await load(page,base+lang+'/?tab=how#how-glossary');const other=lang==='it'?'en':'it';
  await page.selectOption('#langSelect',other);await page.waitForURL('**/'+other+'/**');await page.waitForFunction(()=>window.CTD_APP_READY&&window.CTD_READER_READY);
  assert.equal(new URL(page.url()).hash,'#how-glossary');assert.ok(await page.locator('#how-glossary').isVisible());
  assert.deepEqual(jsErrors,[],'JavaScript errors');
  report.scenarios.push({lang,width,keyboard:true,entryIntents:true,languageSwitch:other,runtimeErrors:jsErrors,passed:true});
 }catch(e){const row={lang,width,fatal:e.stack||String(e),passed:false};report.issues.push(row);console.log('READER_FATAL '+JSON.stringify(row));}
 finally{await context.close();}
}
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 try{
  // Two contexts at a time keep the test bounded on GitHub's standard runner.
  const jobs=config.languages.flatMap(lang=>[390,1440].map(width=>[lang,width]));
  for(let i=0;i<jobs.length;i+=2)await Promise.all(jobs.slice(i,i+2).map(([lang,width])=>scenario(browser,lang,width)));
  // Narrow reflow and 200% text sizing, without synthetic user-study scores.
  const context=await browser.newContext({viewport:{width:320,height:900},reducedMotion:'reduce'}),page=await context.newPage();
  for(const tab of ['overview','ia-stories','how','cities','research']){
   try{await load(page,base+'it/?tab='+tab);await page.addStyleTag({content:'html{font-size:200%!important}'});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'320px / 200% text reflow');report.scenarios.push({reflow:tab,width:320,textSize:'200%',passed:true});}
   catch(e){
    const overflow=await page.evaluate(()=>({viewport:innerWidth,scroll:document.documentElement.scrollWidth,elements:[...document.querySelectorAll('body *')].filter(n=>{const r=n.getBoundingClientRect();return r.width>0&&r.height>0&&(r.right>innerWidth+2||r.left< -2)&&getComputedStyle(n).position!=='fixed'&&!n.closest('[role="region"]')}).slice(0,25).map(n=>{const r=n.getBoundingClientRect(),s=getComputedStyle(n);return {tag:n.tagName,id:n.id,classes:n.className,text:n.textContent.trim().slice(0,90),left:r.left,right:r.right,width:r.width,display:s.display,minWidth:s.minWidth,whiteSpace:s.whiteSpace,fontSize:s.fontSize}})}));
    report.issues.push({reflow:tab,error:e.message,overflow});
    await page.screenshot({path:path.join(out,'reflow-'+tab+'-failure.png'),fullPage:false});
   }
   await page.screenshot({path:path.join(out,'reflow-'+tab+'.png'),fullPage:false});
  }
  await context.close();
  const noJs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:900}}),np=await noJs.newPage();
  await np.goto(base+'it/?tab=how',{waitUntil:'load'});assert.ok(await np.locator('#reader-index summary').isVisible());assert.ok(await np.locator('#how').isVisible());report.scenarios.push({javaScript:false,reading:'available',passed:true});await noJs.close();
 }catch(e){report.issues.push({fatal:e.stack||String(e)});}
 finally{await browser.close();fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));}
 console.log('READER_BROWSER_SUMMARY '+JSON.stringify({scenarios:report.scenarios.length,issues:report.issues.length,humanParticipants:0}));
 if(report.issues.length)process.exitCode=1;
})();
