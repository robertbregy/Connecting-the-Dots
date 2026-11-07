'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const out='audit-focus-confirmation';fs.mkdirSync(out,{recursive:true});
const base='https://robertbregy.github.io/Connecting-the-Dots/';
const css=fs.readFileSync('qa/focus-visibility-candidate.css','utf8');
const metricCSS='.apsMetrics article { min-width: 0; overflow-wrap: anywhere; }';
const report={startedAt:new Date().toISOString(),auditCommit:process.env.GITHUB_SHA,productCommit:'fbbbecf7d9f03d65e7e3026afcc083a353f196f0',version:'0.7.99',humanParticipants:0,method:'Real Tab navigation on live pages. Candidate CSS applied only inside disposable browser contexts. Screenshots taken while the reported element actually has focus.',candidateCSS:css,metricCandidateCSS:metricCSS,byteChecks:[],cases:[],metrics:[],errors:[],priorRun:'https://github.com/robertbregy/Connecting-the-Dots/actions/runs/42353155830',acceptanceCorrection:'The first run wrongly required all baseline conditions, including unaffected controls, to fail. Require the known affected surfaces to reproduce; require zero candidate occlusion and the identical complete Tab sequence in every case. Retain the first run and its observations.',limits:['This candidate is not published and is not a release acceptance.','A geometric hit-test measures occlusion; screenshots must be inspected for translucent overlays.','Only the first 14 Tab stops are tested in each focus scenario.','No screen-reader session, native zoom or full WCAG certification.']};
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const save=()=>{report.finishedAt=new Date().toISOString();fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');};
async function settle(page){await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));}
async function focus(page){return page.evaluate(()=>{
 const e=document.activeElement;if(!e||e===document.body)return null;const r=e.getBoundingClientRect(),hits=[];
 const l=Math.max(0,r.left+2),rr=Math.min(innerWidth-1,r.right-2),t=Math.max(0,r.top+2),b=Math.min(innerHeight-1,r.bottom-2);
 if(rr>=l&&b>=t)for(const [x,y] of [[(l+rr)/2,(t+b)/2],[l,t],[rr,t],[l,b],[rr,b]]){const h=document.elementFromPoint(x,y);hits.push({x,y,visible:!!h&&(h===e||e.contains(h)),coveringTag:h&&h.tagName,coveringId:h&&h.id,coveringClass:h&&h.className,coveringBackground:h&&getComputedStyle(h).backgroundColor});}
 const s=getComputedStyle(e);return {tag:e.tagName,id:e.id,className:e.className,name:(e.getAttribute('aria-label')||e.textContent||e.getAttribute('placeholder')||'').trim().slice(0,160),rect:{x:r.x,y:r.y,width:r.width,height:r.height},hits,fullyObscured:hits.length===0||hits.every(x=>!x.visible),outline:s.outline,position:s.position,zIndex:s.zIndex,scrollY};
});}
async function metricBounds(page){return page.locator('.apsMetrics article').evaluateAll(cards=>cards.map(card=>{
 const cr=card.getBoundingClientRect(),problems=[],s=getComputedStyle(card);const w=document.createTreeWalker(card,NodeFilter.SHOW_TEXT);let n;
 while((n=w.nextNode())){if(!n.textContent.trim())continue;const range=document.createRange();range.selectNodeContents(n);for(const r of range.getClientRects())if(r.left<cr.left-1||r.right>cr.right+1||r.top<cr.top-1||r.bottom>cr.bottom+1)problems.push({text:n.textContent,rect:{x:r.x,y:r.y,width:r.width,height:r.height}});}
 return {text:card.textContent,rect:{x:cr.x,y:cr.y,width:cr.width,height:cr.height},overflowWrap:s.overflowWrap,problems};
}));}
(async()=>{let browser;
 try{
  for(const file of ['publication.json','assets/style.css','assets/aps-atlas.css','assets/reader-first.css',...['it','en','de','fr'].flatMap(l=>[l+'/index.html','applications/'+l+'/index.html'])]){
   const r=await fetch(base+file+'?focusaudit=fbbbecf7',{signal:AbortSignal.timeout(30000)});assert.equal(r.status,200,file);const bytes=Buffer.from(await r.arrayBuffer()),ok=hash(bytes)===hash(fs.readFileSync(file));report.byteChecks.push({file,matches:ok,sha256:hash(bytes)});assert.ok(ok,'Published source changed: '+file);
  }
  browser=await chromium.launch({headless:true});
  for(const lang of ['it','en','de','fr'])for(const theme of ['light','dark'])for(const condition of [...['overview','explore','economics','lugano','atlas'].map(view=>({view,width:320,height:256})),{view:'atlas',width:390,height:844}]){
   const record={lang,theme,...condition,states:[]};
   for(const state of ['baseline','candidate']){
    const context=await browser.newContext({viewport:{width:condition.width,height:condition.height},colorScheme:theme,reducedMotion:'reduce'});const page=await context.newPage();page.setDefaultTimeout(20000);
    const url=condition.view==='atlas'?base+'applications/'+lang+'/?q=.lugano':base+lang+'/?tab='+condition.view+(condition.view==='explore'?'&q=.lugano':'');
    await page.goto(url,{waitUntil:'load',timeout:45000});
    if(condition.view!=='atlas')await page.waitForFunction(()=>window.CTD_APP_READY===true);else await page.locator('#apsResults .apsCard').first().waitFor();
    if(state==='candidate')await page.addStyleTag({content:css});
    await settle(page);await page.keyboard.press('Control+Home');
    const result={state,actualTheme:await page.locator('html').getAttribute('data-theme'),steps:[],screenshots:[]};
    for(let i=0;i<14;i++){
     await page.keyboard.press('Tab');await settle(page);const item=await focus(page);if(!item)continue;item.tab=i+1;result.steps.push(item);
     const baselineIndex=record.states[0]&&record.states[0].firstObscuredTab;
     if((state==='baseline'&&item.fullyObscured&&result.firstObscuredTab===undefined)||(state==='candidate'&&i+1===baselineIndex)){
      if(state==='baseline')result.firstObscuredTab=i+1;
      const name=[lang,theme,condition.view,condition.width,condition.height,state].join('-')+'.png';await page.screenshot({path:path.join(out,name)});result.screenshots.push(name);
     }
    }
    result.obscuredCount=result.steps.filter(x=>x.fullyObscured).length;
    record.states.push(result);await context.close();
   }
   const [before,after]=record.states;record.baselineReproduced=before.obscuredCount>0;record.candidateNoObscuredFocus=after.obscuredCount===0;
   const first=before.steps.find(x=>x.fullyObscured);record.sameFocusedControl=first?after.steps.some(x=>x.tab===first.tab&&x.name===first.name&&x.tag===first.tag):null;
   const identities=steps=>steps.map(x=>({tab:x.tab,tag:x.tag,id:x.id,name:x.name}));
   record.fullTabSequencePreserved=JSON.stringify(identities(before.steps))===JSON.stringify(identities(after.steps));
   record.baselineRequiredToReproduce=['overview','economics','atlas'].includes(condition.view);
   report.cases.push(record);save();console.log(JSON.stringify({lang,theme,...condition,baseline:before.obscuredCount,candidate:after.obscuredCount,sequencePreserved:record.fullTabSequencePreserved}));
  }
  report.completed=true;report.summary={cases:report.cases.length,baselineCasesReproduced:report.cases.filter(x=>x.baselineReproduced).length,candidateCasesClear:report.cases.filter(x=>x.candidateNoObscuredFocus).length,preservedTabSequences:report.cases.filter(x=>x.fullTabSequencePreserved).length};
  report.candidatePassed=report.cases.length===48&&report.cases.every(x=>(!x.baselineRequiredToReproduce||x.baselineReproduced)&&x.candidateNoObscuredFocus&&x.fullTabSequencePreserved&&(!x.baselineReproduced||x.sameFocusedControl));
  for(const lang of ['it','en','de','fr'])for(const theme of ['light','dark'])for(const surface of ['native','standalone']){
   const context=await browser.newContext({viewport:{width:320,height:844},colorScheme:theme,reducedMotion:'reduce'});const page=await context.newPage();page.setDefaultTimeout(20000);
   const url=surface==='native'?base+lang+'/?tab=explore&q=.lugano':base+'applications/'+lang+'/?q=.lugano';
   await page.goto(url,{waitUntil:'load',timeout:45000});if(surface==='native')await page.waitForFunction(()=>window.CTD_APP_READY===true);else await page.locator('#apsResults .apsCard').first().waitFor();
   const rec={lang,theme,surface,width:320,baseline:await metricBounds(page)};
   await page.locator('.apsMetrics').evaluate(e=>window.scrollTo(0,e.getBoundingClientRect().top+scrollY-200));await settle(page);
   rec.beforeScreenshot=[lang,theme,surface,'metrics-baseline.png'].join('-');await page.screenshot({path:path.join(out,rec.beforeScreenshot)});
   await page.addStyleTag({content:metricCSS});await settle(page);rec.candidate=await metricBounds(page);
   rec.afterScreenshot=[lang,theme,surface,'metrics-candidate.png'].join('-');await page.screenshot({path:path.join(out,rec.afterScreenshot)});
   rec.textAndNumbersPreserved=JSON.stringify(rec.baseline.map(x=>x.text))===JSON.stringify(rec.candidate.map(x=>x.text));
   rec.baselineOverflow=rec.baseline.reduce((n,x)=>n+x.problems.length,0);rec.candidateOverflow=rec.candidate.reduce((n,x)=>n+x.problems.length,0);
   rec.globalOverflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2);
   if(surface==='native')rec.themeControl=await page.locator('#themeBtn').evaluate(e=>{const s=getComputedStyle(e);return {color:s.color,backgroundColor:s.backgroundColor,outlineColor:s.outlineColor};});
   report.metrics.push(rec);save();console.log('METRICS '+JSON.stringify({lang,theme,surface,before:rec.baselineOverflow,after:rec.candidateOverflow,preserved:rec.textAndNumbersPreserved}));await context.close();
  }
  report.metricCandidatePassed=report.metrics.length===16&&report.metrics.every(x=>x.candidateOverflow===0&&x.textAndNumbersPreserved&&!x.globalOverflow);
  report.summary.metricCases=report.metrics.length;report.summary.metricBaselineCasesWithOverflow=report.metrics.filter(x=>x.baselineOverflow>0).length;
  if(!report.candidatePassed||!report.metricCandidatePassed)process.exitCode=1;
 }catch(e){report.errors.push(e.stack||String(e));process.exitCode=1;}
 finally{if(browser)await browser.close();save();console.log('FOCUS_CONFIRMATION '+JSON.stringify(report.summary||report.errors));}
})();
