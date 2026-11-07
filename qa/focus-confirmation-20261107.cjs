'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const out='audit-focus-confirmation';fs.mkdirSync(out,{recursive:true});
const base='https://robertbregy.github.io/Connecting-the-Dots/';
const css=fs.readFileSync('qa/focus-visibility-candidate.css','utf8');
const report={startedAt:new Date().toISOString(),auditCommit:process.env.GITHUB_SHA,productCommit:'fbbbecf7d9f03d65e7e3026afcc083a353f196f0',version:'0.7.99',humanParticipants:0,method:'Real Tab navigation on live pages. Candidate CSS applied only inside disposable browser contexts. Screenshots taken while the reported element actually has focus.',candidateCSS:css,byteChecks:[],cases:[],errors:[],limits:['This candidate is not published and is not a release acceptance.','A geometric hit-test measures occlusion; screenshots must be inspected for translucent overlays.','No screen-reader session, native zoom or full WCAG certification.']};
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const save=()=>{report.finishedAt=new Date().toISOString();fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');};
async function settle(page){await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));}
async function focus(page){return page.evaluate(()=>{
 const e=document.activeElement;if(!e||e===document.body)return null;const r=e.getBoundingClientRect(),hits=[];
 const l=Math.max(0,r.left+2),rr=Math.min(innerWidth-1,r.right-2),t=Math.max(0,r.top+2),b=Math.min(innerHeight-1,r.bottom-2);
 if(rr>=l&&b>=t)for(const [x,y] of [[(l+rr)/2,(t+b)/2],[l,t],[rr,t],[l,b],[rr,b]]){const h=document.elementFromPoint(x,y);hits.push({x,y,visible:!!h&&(h===e||e.contains(h)),coveringTag:h&&h.tagName,coveringId:h&&h.id,coveringClass:h&&h.className,coveringBackground:h&&getComputedStyle(h).backgroundColor});}
 const s=getComputedStyle(e);return {tag:e.tagName,id:e.id,className:e.className,name:(e.getAttribute('aria-label')||e.textContent||e.getAttribute('placeholder')||'').trim().slice(0,160),rect:{x:r.x,y:r.y,width:r.width,height:r.height},hits,fullyObscured:hits.length===0||hits.every(x=>!x.visible),outline:s.outline,position:s.position,zIndex:s.zIndex,scrollY};
});}
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
   const first=before.steps.find(x=>x.fullyObscured);record.sameFocusedControl=!!first&&after.steps.some(x=>x.tab===first.tab&&x.name===first.name&&x.tag===first.tag);
   report.cases.push(record);save();console.log(JSON.stringify({lang,theme,...condition,baseline:before.obscuredCount,candidate:after.obscuredCount,sameControl:record.sameFocusedControl}));
  }
  report.completed=true;report.summary={cases:report.cases.length,baselineCasesReproduced:report.cases.filter(x=>x.baselineReproduced).length,candidateCasesClear:report.cases.filter(x=>x.candidateNoObscuredFocus).length,sameControlCases:report.cases.filter(x=>x.sameFocusedControl).length};
  report.candidatePassed=report.cases.every(x=>x.baselineReproduced&&x.candidateNoObscuredFocus&&x.sameFocusedControl);
  if(!report.candidatePassed)process.exitCode=1;
 }catch(e){report.errors.push(e.stack||String(e));process.exitCode=1;}
 finally{if(browser)await browser.close();save();console.log('FOCUS_CONFIRMATION '+JSON.stringify(report.summary||report.errors));}
})();
