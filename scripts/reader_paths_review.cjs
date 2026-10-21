/* Functional and automated accessibility checks, not a human usability study. */
'use strict';
const fs=require('node:fs'), path=require('node:path'), http=require('node:http');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const AxeBuilder=require('@axe-core/playwright').default;
const {parseHTML}=require('linkedom');
const ROOT=path.resolve(__dirname,'..'),OUT=path.join(ROOT,'artifacts/reader-review');
const D=JSON.parse(fs.readFileSync(path.join(ROOT,'data/reader_paths.json'),'utf8'));
const chapters=Object.values(D.areas).flat();
const report={kind:'Reader paths functional and automated accessibility review',isHumanUsabilityTest:false,version:JSON.parse(fs.readFileSync(path.join(ROOT,'publication.json'))).version,checks:{staticPages:0,chapterViews:0,onwardLinks:0,guideLinks:0,axePages:0,noJS:0,independentPages:0},issues:[],screenshots:[]};
const ext={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.csv':'text/csv','.png':'image/png','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
 let rel;try{rel=decodeURIComponent(new URL(req.url,'http://localhost').pathname)}catch{res.writeHead(400);res.end();return}
 let file=path.resolve(ROOT,'.'+rel);if(!file.startsWith(ROOT+path.sep)){res.writeHead(403);res.end();return}
 if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
 if(!fs.existsSync(file)){res.writeHead(404);res.end();return}
 res.setHeader('Content-Type',(ext[path.extname(file)]||'application/octet-stream')+'; charset=utf-8');fs.createReadStream(file).pipe(res);
});
function staticCheck(name){
 const {document:doc}=parseHTML(fs.readFileSync(path.join(ROOT,name),'utf8'));
 assert.equal(doc.querySelectorAll('.section > .readerPaths').length,24);
 assert.equal(doc.querySelectorAll('.section > .readerBreadcrumb').length,24);
 assert.equal(doc.querySelectorAll('.heroActions .readerResearchEntry').length,1);
 assert.equal(doc.querySelectorAll('.iaHubCard').length,26);
 const ids=[...doc.querySelectorAll('[id]')].map(n=>n.id);
 assert.equal(new Set(ids).size,ids.length,'Duplicate IDs: '+name);
 for(const a of doc.querySelectorAll('.readerGuide a,.readerPaths a')){
  const href=a.getAttribute('href'),url=new URL(href,'http://localhost/'+name);
  const tab=url.searchParams.get('tab'),anchor=decodeURIComponent(url.hash.slice(1));
  const sec=doc.getElementById(tab),target=doc.getElementById(anchor);
  assert.ok(sec&&target&&(sec===target||sec.contains(target)),name+' '+href);
 }
 report.checks.staticPages++;
}
async function axe(page,label){
 const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();
 report.checks.axePages++;
 for(const v of result.violations)report.issues.push({type:'axe',label,id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,why:n.failureSummary}))});
}
async function activate(page,chapter){
 await page.evaluate(id=>activateTab(id,false,'replace',false),chapter);
 await page.locator('#'+chapter+'.active').waitFor({state:'visible'});
}
async function clickAndCheck(page,selector,chapter){
 const a=page.locator(selector),target=await a.getAttribute('data-open-section'),anchor=await a.getAttribute('data-open-anchor');
 await a.click();
 assert.equal(await page.evaluate(()=>document.body.dataset.activeTab),target,'Wrong chapter from '+chapter);
 if(anchor)assert.ok(await page.locator('[id="'+anchor+'"]').isVisible(),'Hidden deep link '+anchor);
 return target;
}
(async()=>{
 fs.mkdirSync(OUT,{recursive:true});
 for(const name of ['index.html','it/index.html','en/index.html','de/index.html','fr/index.html'])staticCheck(name);
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const BASE='http://127.0.0.1:'+server.address().port+'/';
 const executablePath=process.env.CTD_CHROMIUM_PATH;
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage'],...(executablePath?{executablePath}:{})});
 try{
  for(const lang of ['it','en','de','fr'])for(const theme of ['light','dark']){
   const context=await browser.newContext({viewport:{width:theme==='dark'?390:1360,height:900},reducedMotion:'reduce'});
   await context.addInitScript(t=>localStorage.setItem('dotTheme',t),theme);
   const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(BASE+lang+'/',{waitUntil:'networkidle'});
   await page.waitForFunction(()=>document.documentElement.dataset.readerEnhancement==='ready');
   await page.evaluate(t=>document.documentElement.dataset.theme=t,theme);
   assert.equal(await page.locator('.heroActions a').count(),3);
   await axe(page,lang+' home '+theme);
   for(const chapter of chapters){
    await activate(page,chapter);report.checks.chapterViews++;
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
    assert.ok(overflow<=2,'Horizontal overflow '+lang+' '+theme+' '+chapter+' '+overflow);
    assert.equal(await page.locator('#'+chapter+' > .readerPaths').count(),1);
    if(chapter!=='economics')assert.equal(await page.locator('#'+chapter+' > nav.sectionToc').count(),0,'Duplicate flat index '+chapter);
    for(let i=0;i<2;i++){
     await activate(page,chapter);
     await clickAndCheck(page,'#'+chapter+' > .readerPaths .readerPathsLink:nth-child('+(i+1)+')',chapter);
     report.checks.onwardLinks++;
    }
    if(theme==='light'&&D.stops[chapter]){
     for(let i=0;i<D.stops[chapter].length;i++){
      await activate(page,chapter);
      await clickAndCheck(page,'#'+chapter+' .readerGuideSteps li:nth-child('+(i+1)+') a',chapter);
      report.checks.guideLinks++;
     }
    }
    await activate(page,chapter);await axe(page,lang+' '+theme+' '+chapter);
   }
   if(lang==='it')for(const chapter of ['overview','how','social','cities','research','ia-stories']){
    await activate(page,chapter);await page.evaluate(()=>scrollTo(0,0));
    const filename=lang+'-'+theme+'-'+chapter+'.png';await page.screenshot({path:path.join(OUT,filename)});report.screenshots.push(filename);
   }
   // Onward links must keep Back/Forward useful, not replace the current chapter.
   await page.goto(BASE+lang+'/?tab=cities',{waitUntil:'networkidle'});
   await clickAndCheck(page,'#cities > .readerPaths .readerPathsLink:first-child','cities');
   await page.goBack();await page.waitForFunction(()=>document.body.dataset.activeTab==='cities');
   await page.goForward();await page.waitForFunction(()=>document.body.dataset.activeTab==='lugano');
   const other=lang==='en'?'it':'en';await page.selectOption('#langSelect',other);
   await page.waitForURL('**/'+other+'/**');await page.waitForFunction(()=>window.CTD_APP_READY===true);
   assert.equal(await page.evaluate(()=>document.body.dataset.activeTab),'lugano');
   assert.equal(new URL(page.url()).hash,'#lugano-status-sources');
   assert.deepEqual(errors,[],'Browser errors '+lang+' '+theme);await context.close();
  }
  // Narrow screens and keyboard activation are checked separately from pointer use.
  for(const lang of ['it','en','de','fr']){
   const page=await browser.newPage({viewport:{width:320,height:850},reducedMotion:'reduce'});
   await page.goto(BASE+lang+'/',{waitUntil:'networkidle'});
   for(const chapter of ['how','cities','social','research','ia-stories']){
    await activate(page,chapter);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'320px overflow '+lang+' '+chapter);
   }
   await activate(page,'how');const a=page.locator('#how .readerGuideSteps a').first();await a.focus();await a.press('Enter');
   assert.equal(await page.evaluate(()=>document.body.dataset.activeTab),'how');
   await page.close();
   const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:850}});
   const nojs=await context.newPage();await nojs.goto(BASE+lang+'/');
   assert.equal(await nojs.locator('.section > .readerPaths').count(),24);
   assert.ok((await nojs.locator('#how .readerGuideLead').textContent()).length>20);report.checks.noJS++;await context.close();
  }
  const preservation=JSON.parse(fs.readFileSync(path.join(OUT,'preservation.json')));
  for(const item of preservation.independent){
   const page=await browser.newPage({viewport:{width:390,height:850},reducedMotion:'reduce'});
   await page.goto(BASE+item.file,{waitUntil:'networkidle'});
   assert.equal(await page.locator('.readerStandalonePaths').count(),1);
   assert.ok((await page.locator('.ctdB2Trail [aria-current]').textContent()).length>5);
   const href=await page.locator('.readerStandalonePaths a').first().getAttribute('href');
   const end=await page.goto(new URL(href,page.url()).href,{waitUntil:'networkidle'});assert.equal(end.status(),200);
   assert.equal(await page.evaluate(()=>document.body.dataset.activeTab),item.context);report.checks.independentPages++;await page.close();
  }
 }catch(e){report.issues.push({type:'functional',message:e.stack||String(e)});}
 finally{await browser.close();server.close();fs.writeFileSync(path.join(OUT,'browser.json'),JSON.stringify(report,null,2)+'\n');}
 console.log('READER_REVIEW '+JSON.stringify({checks:report.checks,issues:report.issues.length,humanParticipants:0}));
 if(report.issues.length)process.exitCode=1;
})().catch(e=>{console.error(e);server.close();process.exitCode=1});
