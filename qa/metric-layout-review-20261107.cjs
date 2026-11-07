'use strict';
const fs=require('node:fs'),crypto=require('node:crypto'),assert=require('node:assert/strict'),path=require('node:path');
const {chromium}=require('playwright');
const base='https://robertbregy.github.io/Connecting-the-Dots/',out='audit-readable-metrics';fs.mkdirSync(out,{recursive:true});
const files=['assets/style.css','assets/aps-atlas.css'];
const original=Object.fromEntries(files.map(p=>[p,fs.readFileSync(p,'utf8')]));
const additions={'assets/style.css':fs.readFileSync('qa/style-accessibility-additions.css','utf8'),'assets/aps-atlas.css':fs.readFileSync('qa/atlas-accessibility-additions.css','utf8')};
const report={productCommit:'fbbbecf7d9f03d65e7e3026afcc083a353f196f0',auditCommit:process.env.GITHUB_SHA,startedAt:new Date().toISOString(),humanParticipants:0,method:'Live pages with original CSS versus browser-only response overrides. Append the exact candidate rules to each original stylesheet at its original document position. Do not inject a last-in-document override or change server files.',decision:'Reject the earlier overflow-wrap:anywhere candidate despite passing bounds checks: screenshots showed fragmented German words. Use one column only for native metric cards at widths <=360 CSS pixels.',patches:additions,byteChecks:[],scenarios:[],focusPositionChecks:[],errors:[],limits:['Proposed CSS is not deployed.','Metrics checked at widths 320, 360 and 390; not all devices.','No human screen-reader or native zoom session.']};
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const save=()=>{report.finishedAt=new Date().toISOString();fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');};
const settle=p=>p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
async function measure(page){return page.locator('.apsMetrics article').evaluateAll(cards=>cards.map(card=>{
 const cr=card.getBoundingClientRect(),overflow=[],splitWords=[],walk=document.createTreeWalker(card,NodeFilter.SHOW_TEXT);let node;
 while((node=walk.nextNode())){if(!node.textContent.trim())continue;const range=document.createRange();range.selectNodeContents(node);
  for(const r of range.getClientRects())if(r.left<cr.left-1||r.right>cr.right+1||r.top<cr.top-1||r.bottom>cr.bottom+1)overflow.push({text:node.textContent,x:r.x,y:r.y,width:r.width,height:r.height});
  for(const m of node.textContent.matchAll(/\S+/g)){const word=document.createRange();word.setStart(node,m.index);word.setEnd(node,m.index+m[0].length);const lines=[...word.getClientRects()].filter(r=>r.width>0&&r.height>0);if(new Set(lines.map(r=>Math.round(r.top))).size>1)splitWords.push(m[0]);}
 }
 return{text:card.textContent,rect:{x:cr.x,y:cr.y,width:cr.width,height:cr.height},overflow,splitWords};
}));}
(async()=>{let browser;try{
 for(const file of ['publication.json',...files,...['it','en','de','fr'].flatMap(l=>[l+'/index.html','applications/'+l+'/index.html'])]){
  const r=await fetch(base+file+'?metricreview=fbbbecf7',{signal:AbortSignal.timeout(30000)});assert.equal(r.status,200,file);const bytes=Buffer.from(await r.arrayBuffer());assert.equal(hash(bytes),hash(fs.readFileSync(file)),'Published bytes changed: '+file);report.byteChecks.push({file,sha256:hash(bytes),matches:true});
 }
 browser=await chromium.launch({headless:true});
 for(const lang of ['it','en','de','fr'])for(const theme of ['light','dark'])for(const surface of ['native','standalone']){
  const byWidth={};
  for(const state of ['baseline','candidate']){
   const context=await browser.newContext({viewport:{width:320,height:844},colorScheme:theme,reducedMotion:'reduce'});const page=await context.newPage();page.setDefaultTimeout(20000);
   if(state==='candidate')for(const file of files)await page.route('**/'+file+'*',route=>route.fulfill({status:200,contentType:'text/css',body:original[file]+'\n'+additions[file]}));
   const url=surface==='native'?base+lang+'/?tab=explore&q=.lugano':base+'applications/'+lang+'/?q=.lugano';await page.goto(url,{waitUntil:'load',timeout:45000});
   if(surface==='native')await page.waitForFunction(()=>window.CTD_APP_READY===true);else await page.locator('#apsResults .apsCard').first().waitFor();
   for(const width of [320,360,390]){
    await page.setViewportSize({width,height:844});await settle(page);const measured=await measure(page);
    const row={state,cards:measured,globalOverflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),grid:await page.locator('.apsMetrics').evaluate(e=>getComputedStyle(e).gridTemplateColumns)};
    if(width===320&&surface==='native'){
     await page.locator('.apsMetrics').evaluate(e=>window.scrollTo(0,e.getBoundingClientRect().top+scrollY-200));await settle(page);
     row.screenshot=[lang,theme,surface,width,state].join('-')+'.png';await page.screenshot({path:path.join(out,row.screenshot)});
    }
    (byWidth[width]||=([])).push(row);
   }
   if(state==='candidate'){
    await page.setViewportSize({width:320,height:256});await page.reload({waitUntil:'load'});if(surface==='native')await page.waitForFunction(()=>window.CTD_APP_READY===true);else await page.locator('#apsResults .apsCard').first().waitFor();
    await settle(page);const nav=await page.locator('.iaPrimaryNav').evaluateAll(nodes=>nodes.map(n=>getComputedStyle(n).position));
    if(surface==='native')assert.ok(nav.length>0&&nav.every(x=>x==='static'),'Short-viewport rule lost in stylesheet order');
    let skip=null;if(surface==='standalone'){
     await page.keyboard.press('Tab');await settle(page);skip=await page.locator('.apsSkip').evaluate(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e),h=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return{focused:document.activeElement===e,zIndex:s.zIndex,visible:h===e||e.contains(h)};});assert.ok(skip.focused&&skip.visible&&Number(skip.zIndex)>=100,'Skip link still covered');
    }
    report.focusPositionChecks.push({lang,theme,surface,nav,skip,passed:true});
   }
   await context.close();
  }
  for(const width of [320,360,390]){
   const [before,after]=byWidth[width];const r={lang,theme,surface,width,baseline:before,candidate:after};
   r.textAndNumbersPreserved=JSON.stringify(before.cards.map(x=>x.text))===JSON.stringify(after.cards.map(x=>x.text));
   r.baselineOverflows=before.cards.reduce((n,c)=>n+c.overflow.length,0);r.candidateOverflows=after.cards.reduce((n,c)=>n+c.overflow.length,0);r.candidateSplitWords=after.cards.reduce((n,c)=>n+c.splitWords.length,0);
   r.passed=before.cards.length===4&&after.cards.length===4&&r.textAndNumbersPreserved&&r.candidateOverflows===0&&r.candidateSplitWords===0&&!after.globalOverflow;
   report.scenarios.push(r);save();console.log(JSON.stringify({lang,theme,surface,width,passed:r.passed,before:r.baselineOverflows,after:r.candidateOverflows,splitWords:r.candidateSplitWords}));
  }
 }
 report.summary={cases:report.scenarios.length,passed:report.scenarios.filter(x=>x.passed).length,baselineCasesWithOverflow:report.scenarios.filter(x=>x.baselineOverflows>0).length,sourcePositionFocusChecks:report.focusPositionChecks.length};
 report.passed=report.scenarios.length===48&&report.focusPositionChecks.length===16&&report.scenarios.every(x=>x.passed);if(!report.passed)process.exitCode=1;
}catch(e){report.errors.push(e.stack||String(e));process.exitCode=1;}finally{if(browser)await browser.close();save();console.log('READABLE_METRICS '+JSON.stringify(report.summary||report.errors));}})();
