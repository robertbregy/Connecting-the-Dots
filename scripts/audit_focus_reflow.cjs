'use strict';
// Exercise deployed CSS, without style injection or response overrides.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const base=(process.env.CTD_TEST_BASE||'http://127.0.0.1:8123/').replace(/\/?$/,'/');
const out=process.env.CTD_FOCUS_QA||'audit-focus-reflow';fs.mkdirSync(out,{recursive:true});
const publication=JSON.parse(fs.readFileSync(path.join(__dirname,'../publication.json'),'utf8'));
const report={version:publication.version,sourceCommit:process.env.GITHUB_SHA||null,base,startedAt:new Date().toISOString(),humanParticipants:0,method:'Actual stylesheet order and real Tab navigation. Low CSS viewports model geometric reflow, not native browser zoom. No style injection.',focus:[],metrics:[],errors:[],limitations:['The focus sweep covers the first fourteen Tab stops, not every interaction.','No physical-device, screen-reader, field-performance or human-reader test.','Passing this regression does not certify full WCAG conformance.']};
function save(){report.finishedAt=new Date().toISOString();fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');}
const settle=p=>p.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
async function load(page,lang,view){
 const url=view==='atlas'?base+'applications/'+lang+'/?q=.lugano':base+lang+'/?tab='+view+(view==='explore'?'&q=.lugano':'');
 await page.goto(url,{waitUntil:'load',timeout:45000});
 if(view==='atlas')await page.locator('#apsResults .apsCard').first().waitFor();else await page.waitForFunction(()=>window.CTD_APP_READY===true);
 await settle(page);
}
async function focusState(page){return page.evaluate(()=>{
 const el=document.activeElement;if(!el||el===document.body)return null;
 const r=el.getBoundingClientRect(),l=Math.max(0,r.left+2),rr=Math.min(innerWidth-1,r.right-2),t=Math.max(0,r.top+2),b=Math.min(innerHeight-1,r.bottom-2),hits=[];
 if(rr>=l&&b>=t)for(const [x,y] of [[(l+rr)/2,(t+b)/2],[l,t],[rr,t],[l,b],[rr,b]]){const top=document.elementFromPoint(x,y);hits.push(Boolean(top&&(top===el||el.contains(top))));}
 return {tag:el.tagName,id:el.id,name:(el.getAttribute('aria-label')||el.textContent||el.getAttribute('placeholder')||'').trim().slice(0,150),rect:{x:r.x,y:r.y,width:r.width,height:r.height},fullyObscured:!hits.length||!hits.some(Boolean)};
});}
async function metricState(page){return page.locator('.apsMetrics article').evaluateAll(cards=>cards.map(card=>{
 const cr=card.getBoundingClientRect(),overflow=[],splitWords=[],walker=document.createTreeWalker(card,NodeFilter.SHOW_TEXT);let node;
 while((node=walker.nextNode())){
  if(!node.textContent.trim())continue;
  const range=document.createRange();range.selectNodeContents(node);
  for(const r of range.getClientRects())if(r.left<cr.left-1||r.right>cr.right+1||r.top<cr.top-1||r.bottom>cr.bottom+1)overflow.push(node.textContent);
  // An authored ASCII hyphen permits wrapping between, not within, components.
  for(const match of node.textContent.matchAll(/[^\s-]+/g)){
   const word=document.createRange();word.setStart(node,match.index);word.setEnd(node,match.index+match[0].length);
   const rects=[...word.getClientRects()].filter(r=>r.width>0&&r.height>0);
   if(new Set(rects.map(r=>Math.round(r.top))).size>1)splitWords.push(match[0]);
  }
 }
 return {text:card.textContent,overflow,splitWords};
}));}
(async()=>{let browser;
 try{
  browser=await chromium.launch({headless:true});report.browser=browser.version();
  for(const lang of ['it','en','de','fr'])for(const theme of ['light','dark']){
   for(const condition of [...['overview','explore','economics','lugano','atlas'].map(view=>({view,width:320,height:256})),{view:'atlas',width:390,height:844}]){
    const c=await browser.newContext({viewport:{width:condition.width,height:condition.height},colorScheme:theme,reducedMotion:'reduce'}),p=await c.newPage();p.setDefaultTimeout(20000);
    const row={lang,theme,...condition,steps:[],passed:false};
    try{
     await load(p,lang,condition.view);
     assert.equal(await p.locator('html').getAttribute('data-theme'),theme,'Requested theme not applied');
     if(condition.view!=='atlas')assert.ok((await p.locator('.iaPrimaryNav').evaluateAll(nodes=>nodes.map(n=>getComputedStyle(n).position))).every(x=>x==='static'),'Short viewport navigation is still sticky');
     await p.keyboard.press('Control+Home');
     for(let i=0;i<14;i++){
      await p.keyboard.press('Tab');await settle(p);const state=await focusState(p);if(!state)continue;
      state.tab=i+1;row.steps.push(state);
      assert.ok(!state.fullyObscured,'Focused control covered: '+JSON.stringify(state));
      if(i===0&&condition.view==='atlas'){
       assert.equal(await p.locator('.apsSkip').evaluate(el=>document.activeElement===el),true,'Skip link is not first');
       assert.ok(await p.locator('.apsSkip').evaluate(el=>Number(getComputedStyle(el).zIndex)>=100),'Skip link below header');
       if(lang==='it'){row.screenshot=`skip-${lang}-${theme}-${condition.width}.png`;await p.screenshot({path:path.join(out,row.screenshot)});}
      }
     }
     assert.ok(row.steps.length>=10,'Keyboard sweep did not exercise enough controls');row.passed=true;
    }catch(e){row.error=e.stack||String(e);report.errors.push(row.error);await p.screenshot({path:path.join(out,`failure-${lang}-${theme}-${condition.view}-${condition.width}.png`)}).catch(()=>{});}
    finally{report.focus.push(row);await c.close();save();}
   }
   for(const surface of ['native','standalone']){
    const c=await browser.newContext({viewport:{width:320,height:844},colorScheme:theme,reducedMotion:'reduce'}),p=await c.newPage();p.setDefaultTimeout(20000);
    try{
     await load(p,lang,surface==='native'?'explore':'atlas');
     for(const width of [320,360,390]){
      await p.setViewportSize({width,height:844});await settle(p);
      const cards=await metricState(p);const row={lang,theme,surface,width,cards,passed:false};
      try{
       assert.equal(cards.length,4,'Metric count changed');
       assert.equal(cards.flatMap(x=>x.overflow).length,0,'Metric text clipped');
       assert.equal(cards.flatMap(x=>x.splitWords).length,0,'Metric word component split');
       assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false,'Horizontal document overflow');
       const columns=await p.locator('.apsMetrics').evaluate(el=>getComputedStyle(el).gridTemplateColumns.trim().split(/\s+/).length);row.columns=columns;
       if(surface==='native'&&width<=360)assert.equal(columns,1,'Narrow native metrics must be one column');
       if(width===390)assert.ok(columns>=2,'Standard mobile grid changed unnecessarily');
       row.passed=true;
      }catch(e){row.error=e.stack||String(e);report.errors.push(row.error);}
      if(width===320&&surface==='native'&&['it','de','fr'].includes(lang)){
       await p.locator('.apsMetrics').evaluate(el=>window.scrollTo(0,el.getBoundingClientRect().top+scrollY-180));await settle(p);
       row.screenshot=`metrics-${lang}-${theme}-${width}.png`;await p.screenshot({path:path.join(out,row.screenshot)});
      }
      report.metrics.push(row);save();
     }
    }finally{await c.close();}
   }
  }
  report.passed=report.focus.length===48&&report.metrics.length===48&&report.errors.length===0;
  report.summary={focusCases:report.focus.length,focusPassed:report.focus.filter(x=>x.passed).length,metricCases:report.metrics.length,metricPassed:report.metrics.filter(x=>x.passed).length};
 }catch(e){report.errors.push(e.stack||String(e));report.passed=false;}
 finally{if(browser)await browser.close();save();console.log('FOCUS_REFLOW_RESULT '+JSON.stringify({passed:report.passed,...report.summary,errors:report.errors.length}));if(!report.passed)process.exitCode=1;}
})();
