'use strict';
// Read-only audit of the published product. Style overrides exist only in test pages.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process');
const {chromium}=require('playwright');
const AxeBuilder=require('@axe-core/playwright').default;
const product='fbbbecf7d9f03d65e7e3026afcc083a353f196f0';
const base='https://robertbregy.github.io/Connecting-the-Dots/';
const out='audit-ux-followup';fs.mkdirSync(out,{recursive:true});
const report={schemaVersion:1,startedAt:new Date().toISOString(),productCommit:product,auditCommit:process.env.GITHUB_SHA||null,base,version:JSON.parse(fs.readFileSync('publication.json')).version,method:'Live published pages. CSS viewport equivalents of 200% and 400% zoom; separately, WCAG text-spacing overrides. Not a native zoom or screen-reader session.',humanParticipants:0,byteChecks:[],scenarios:[],errors:[],limits:['Potential clipping and keyboard occlusion require inspection of evidence; no automatic WCAG conformance claim.','No VoiceOver/NVDA, native browser zoom, field performance or real-reader study.','SVG/table scrolling exceptions are excluded from the text-fragment heuristic.']};
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
function save(){report.finishedAt=new Date().toISOString();fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');}
async function settle(page){await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));}
async function geometry(page){return page.evaluate(()=>{
 const issues=[],seen=new Set(),limit=60;
 const visible=e=>{const s=getComputedStyle(e);return e.getClientRects().length&&s.visibility!=='hidden'&&s.display!=='none'&&s.opacity!=='0';};
 const selector=e=>{if(e.id)return '#'+CSS.escape(e.id);let p=e.parentElement;let i=p?[...p.children].indexOf(e)+1:1;return (p&&p.id?'#'+CSS.escape(p.id)+' > ':'')+e.tagName.toLowerCase()+':nth-child('+i+')';};
 const add=(kind,e,text,r,ancestor)=>{const k=kind+'|'+selector(e)+'|'+text;if(seen.has(k)||issues.length>=limit)return;seen.add(k);issues.push({kind,selector:selector(e),text:text.slice(0,130),rect:{x:r.x,y:r.y,width:r.width,height:r.height},ancestor:ancestor?selector(ancestor):null});};
 const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n,textNodes=0;
 while((n=w.nextNode())){
  const text=n.textContent.trim(),e=n.parentElement;if(!text||!e||!visible(e)||e.closest('script,style,svg,canvas,[aria-hidden="true"],.sr-only,.visually-hidden'))continue;
  const es=getComputedStyle(e);if(es.clipPath!=='none'||es.clip!=='auto')continue;
  const range=document.createRange();range.selectNodeContents(n);const rects=[...range.getClientRects()];if(!rects.length)continue;textNodes++;
  for(const r of rects){if(r.width<2||r.height<2)continue;
   let scrollException=false;
   for(let a=e;a&&a!==document.body;a=a.parentElement){const s=getComputedStyle(a),ar=a.getBoundingClientRect();
    if((s.overflowX==='auto'||s.overflowX==='scroll')&&a.scrollWidth>a.clientWidth+2){scrollException=true;break;}
    if((s.overflowX==='hidden'||s.overflowX==='clip')&&(r.left<ar.left-2||r.right>ar.right+2))add('text-clipped-horizontally',e,text,r,a);
    if((s.overflowY==='hidden'||s.overflowY==='clip')&&(r.top<ar.top-2||r.bottom>ar.bottom+2))add('text-clipped-vertically',e,text,r,a);
   }
   if(!scrollException&&(r.left< -2||r.right>innerWidth+2)&&!e.closest('table'))add('text-outside-viewport-width',e,text,r,null);
  }
 }
 return {viewport:{width:innerWidth,height:innerHeight},documentWidth:document.documentElement.scrollWidth,globalOverflow:document.documentElement.scrollWidth>innerWidth+2,textNodes,potentialClipping:issues};
});}
async function focusProbe(page){
 await page.keyboard.press('Control+Home');const steps=[];
 for(let i=0;i<14;i++){
  await page.keyboard.press('Tab');await settle(page);
  const d=await page.evaluate(()=>{const e=document.activeElement;if(!e||e===document.body)return null;const r=e.getBoundingClientRect();let points=0,hits=0;
   const l=Math.max(0,r.left+2),rr=Math.min(innerWidth-1,r.right-2),t=Math.max(0,r.top+2),b=Math.min(innerHeight-1,r.bottom-2);
   if(rr>=l&&b>=t)for(const [x,y] of [[(l+rr)/2,(t+b)/2],[l,t],[rr,t],[l,b],[rr,b]]){points++;const h=document.elementFromPoint(x,y);if(h&&(h===e||e.contains(h)))hits++;}
   const s=getComputedStyle(e);return {tag:e.tagName,id:e.id,name:(e.getAttribute('aria-label')||e.textContent||e.getAttribute('placeholder')||'').trim().slice(0,120),rect:{x:r.x,y:r.y,width:r.width,height:r.height},sampledPoints:points,visiblePoints:hits,fullyObscured:!points||!hits,outline:s.outline,boxShadow:s.boxShadow};});
  if(d)steps.push(d);
 }
 return steps;
}
(async()=>{let browser;
 try{
  const changed=execFileSync('git',['diff','--name-only',product,'HEAD'],{encoding:'utf8'}).trim().split('\n').filter(Boolean);
  assert.ok(changed.every(p=>p==='qa/ux-followup-20261107.cjs'||p==='.github/workflows/ux-followup-20261107.yml'),'Audit branch changed product files');
  assert.equal(report.version,'0.7.99');
  const files=['publication.json',...['en','it','de','fr'].flatMap(l=>[l+'/index.html','applications/'+l+'/index.html','data/i18n_'+l+'.js']),...['style.css','audience.css','reader-first.css','aps-atlas.css','app.js','reader-first.js','aps-atlas.js','aps-lazy.js'].map(x=>'assets/'+x)];
  for(const f of files){const res=await fetch(base+f+'?uxfollowup='+product,{signal:AbortSignal.timeout(30000)});assert.equal(res.status,200,f);const remote=Buffer.from(await res.arrayBuffer()),expected=fs.readFileSync(f);const ok=sha(remote)===sha(expected);report.byteChecks.push({file:f,sha256:sha(remote),matches:ok});assert.ok(ok,'Published bytes differ: '+f);}
  browser=await chromium.launch({headless:true});
  for(const lang of ['it','en','de','fr'])for(const theme of ['light','dark']){
   const context=await browser.newContext({viewport:{width:640,height:512},colorScheme:theme,reducedMotion:'reduce'});
   const page=await context.newPage();page.setDefaultTimeout(15000);
   for(const view of ['overview','explore','economics','lugano','atlas']){
    const url=view==='atlas'?base+'applications/'+lang+'/?q=.lugano':base+lang+'/?tab='+view+(view==='explore'?'&q=.lugano':'');
    await page.goto(url,{waitUntil:'load',timeout:45000});
    if(view!=='atlas')await page.waitForFunction(()=>window.CTD_APP_READY===true);
    else await page.locator('#apsResults .apsCard').first().waitFor();
    if(await page.locator('html').getAttribute('data-theme')!==theme&&await page.locator('#themeBtn').count())await page.locator('#themeBtn').click();
    await settle(page);
    for(const profile of [{name:'reflow-200-equivalent',width:640,height:512},{name:'reflow-400-equivalent',width:320,height:256},{name:'text-spacing',width:390,height:844}]){
     await page.setViewportSize({width:profile.width,height:profile.height});await page.evaluate(()=>window.scrollTo(0,0));await settle(page);
     let style;
     const before=await geometry(page);
     if(profile.name==='text-spacing'){
      style=await page.addStyleTag({content:'*:not(svg):not(svg *) { line-height:1.5 !important; letter-spacing:0.12em !important; word-spacing:0.16em !important; } p { margin-bottom:2em !important; }'});await settle(page);
     }
     const s={lang,theme,view,profile:profile.name,url,baseline:before,geometry:await geometry(page)};
     if(profile.name==='text-spacing'){
      const keys=new Set(before.potentialClipping.map(x=>x.kind+'|'+x.selector+'|'+x.text));
      s.newClipping=s.geometry.potentialClipping.filter(x=>!keys.has(x.kind+'|'+x.selector+'|'+x.text));
     }
     if(profile.name==='reflow-400-equivalent')s.keyboard=await focusProbe(page);
     const warning=s.geometry.globalOverflow||(s.newClipping||[]).length||(s.keyboard||[]).some(x=>x.fullyObscured);
     s.needsReview=Boolean(warning);
     if(warning||lang==='it'){
      await page.evaluate(()=>window.scrollTo(0,0));await settle(page);
      s.screenshot=[lang,theme,view,profile.name].join('-')+'.png';await page.screenshot({path:path.join(out,s.screenshot)});
     }
     report.scenarios.push(s);save();console.log(JSON.stringify({lang,theme,view,profile:profile.name,globalOverflow:s.geometry.globalOverflow,newClipping:(s.newClipping||[]).length,keyboardObscured:(s.keyboard||[]).filter(x=>x.fullyObscured).length}));
     if(style)await style.evaluate(e=>e.remove());
    }
    if(view==='explore'){
     await page.setViewportSize({width:320,height:844});await page.evaluate(()=>window.scrollTo(0,0));await settle(page);
     const a=await new AxeBuilder({page}).withRules(['color-contrast']).analyze();
     report.contrast=report.contrast||[];report.contrast.push({lang,theme,violations:a.violations,incomplete:a.incomplete,passes:a.passes.map(x=>({id:x.id,nodes:x.nodes.length}))});save();
    }
   }
   await context.close();
  }
  report.completed=true;report.summary={scenarios:report.scenarios.length,publicFilesVerified:report.byteChecks.length,reviewScenarios:report.scenarios.filter(s=>s.needsReview).length,globalOverflowScenarios:report.scenarios.filter(s=>s.geometry.globalOverflow).length,contrastScans:(report.contrast||[]).length};
 }catch(e){report.errors.push(e.stack||String(e));process.exitCode=1;}
 finally{if(browser)await browser.close();save();console.log('UX_FOLLOWUP_RESULT '+JSON.stringify(report.summary||report.errors));}
})();
