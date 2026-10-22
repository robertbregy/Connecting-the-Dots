/* Assert dated editorial state independently from the immutable Reveal Day data. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const{parseHTML}=require('linkedom');
const root=path.resolve(__dirname,'..'),BASE=process.env.CTD_ROUND_BASELINE||'ba6947fd432f6d5d60019948d182928ad84b10f8';
const out=path.resolve(process.env.CTD_ROUND_QA||'audit-round-checkpoint');fs.mkdirSync(out,{recursive:true});
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8')),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const old=p=>execFileSync('git',['show',BASE+':'+p],{cwd:root,maxBuffer:30*1024*1024});
const result={checkedOn:'2026-10-22',baseline:BASE,staticPages:0,preservedNativeIDs:[],preservedFiles:[],browser:[],noJavaScript:[],axeScans:0,errors:[],humanParticipants:0};
const pub=read('publication.json'),tr=read('data/translations.json'),c=read('data/round_2026_checkpoint.json');
function check(ok,msg){if(!ok)result.errors.push(msg);}
function staticQA(){
 assert.equal(pub.version,'0.7.93');assert.equal(pub.releasedOn,c.checkedOn);assert.equal(c.newApplicationExportAcquired,false);
 const frozen=read('data/frozen_technical_packages.json').files;
 for(const [file,digest] of Object.entries(frozen)){assert.equal(hash(fs.readFileSync(path.join(root,file))),digest,file);result.preservedFiles.push(file);}
 const protectedFiles=execFileSync('git',['ls-tree','-r','--name-only',BASE,'--','data','research'],{cwd:root,encoding:'utf8'}).trim().split('\n').filter(p=>p.endsWith('.csv')||/data\/(applications_2026_aps_official_provenance|application_2026_snapshot|aps_2026_application_graph|aps_2026_current_analytics|iana_snapshot)\.json$/.test(p)||p.startsWith('research/releases/'));
 for(const file of protectedFiles){assert.equal(hash(fs.readFileSync(path.join(root,file))),hash(old(file)),'Frozen research changed: '+file);result.preservedFiles.push(file);}
 assert.equal(hash(fs.readFileSync(path.join(root,'CITATION.cff'))),hash(old('CITATION.cff')));
 const timeline=read('data/inside_the_round_events.json');assert.equal(timeline.lastReviewed,c.checkedOn);assert.equal(timeline.events.length,11);
 assert.equal(timeline.events.find(e=>e.id==='replacement').state,'observed');assert.equal(timeline.events.find(e=>e.id==='confirmation').date,'2026-11-17');assert.equal(timeline.events.find(e=>e.id==='confirmation').state,'scheduled');
 const before=JSON.parse(old('data/translations.json'));
 for(const lang of ['it','en','de','fr'])for(const[key,value]of Object.entries(before[lang]))assert.equal(tr[lang][key],value,'Historical translation changed '+lang+'/'+key);
 for(const lang of ['it','en','de','fr'])for(const file of [lang+'/index.html',...(lang==='en'?['index.html']:[])]){
  const d=parseHTML(fs.readFileSync(path.join(root,file),'utf8')).document,b=parseHTML(old(file).toString()).document;
  const ids=[...b.querySelectorAll('[id]')].map(n=>n.id);for(const id of ids)assert.ok(d.getElementById(id),'Old fragment lost: '+file+'#'+id);
  const newid=[...d.querySelectorAll('[id]')].map(n=>n.id);assert.equal(new Set(newid).size,newid.length);
  assert.equal(d.querySelectorAll('[data-round-checkpoint]').length,4);
  for(const id of ['counts-check-20261022','wdo-check-20261022'])assert.ok(d.getElementById(id));
  const r=d.querySelector('[data-event-id="replacement"]');assert.equal(r.dataset.roundState,'observed');assert.ok(r.textContent.includes('23:59 UTC'));
  assert.ok(d.querySelector('#lugano-calendar-checkpoint').textContent.includes('01:59'));
  result.preservedNativeIDs.push({file,count:ids.length});result.staticPages++;
 }
 for(const lang of ['it','en','de','fr'])for(const file of ['applications/'+lang+'/index.html','inside-the-round/'+lang+'/index.html','behind-the-round/'+lang+'/index.html','behind-the-round/'+lang+'/wdo-identity/index.html','behind-the-round/'+lang+'/replacement-strings/index.html']){
  const d=parseHTML(fs.readFileSync(path.join(root,file),'utf8')).document;
  assert.equal(d.documentElement.lang,lang);assert.ok(d.querySelector('[data-round-checkpoint],[data-update-date="2026-10-22"]'),file);
  if(file.includes('wdo-identity')||file.includes('replacement-strings')){const schemas=[...d.querySelectorAll('script[type="application/ld+json"]')].map(n=>JSON.parse(n.textContent));assert.ok(schemas.some(s=>s.dateModified==='2026-10-22'),file+' review schema');}
  result.staticPages++;
 }
}
(async()=>{
 let browser;
 try{
  staticQA();
  if(!process.argv.includes('--static-only')){
   const {chromium}=require('playwright'),AxeBuilder=require('@axe-core/playwright').default;
   const base=(process.env.CTD_TEST_BASE||'http://127.0.0.1:8123/').replace(/\/$/,'');
   browser=await chromium.launch({headless:true,...(process.env.CTD_BROWSER_PATH?{executablePath:process.env.CTD_BROWSER_PATH}: {})});
   for(const lang of ['it','en','de','fr'])for(const width of [320,1440])for(const theme of ['light','dark']){
    const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'}),page=await context.newPage();
    page.on('pageerror',e=>result.errors.push(e.message));
    await page.goto(base+'/'+lang+'/?tab=ia-round');await page.waitForFunction(()=>window.CTD_APP_READY===true);
    if(await page.evaluate(()=>document.documentElement.dataset.theme)!==theme)await page.locator('#themeBtn').click();
    for(const[id,note]of [['ia-round','#round-phase-checkpoint'],['inside-round','#round-timeline-checkpoint'],['lugano','#lugano-calendar-checkpoint'],['explore','#atlas-publication-checkpoint'],['behind-round','#counts-check-20261022']]){
     await page.evaluate(id=>activateTab(id,false,'replace',false),id);
     check(await page.locator(note).isVisible(),[lang,width,theme,id,'checkpoint hidden'].join('/'));
     check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),[lang,width,theme,id,'overflow'].join('/'));
     if(width===320&&lang==='it'){
      const scan=await new AxeBuilder({page}).include(note).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();result.axeScans++;check(!scan.violations.length,JSON.stringify(scan.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))));
     }
     if(lang==='it'&&['ia-round','explore','behind-round'].includes(id)){await page.locator(note).scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,id+'-'+width+'-'+theme+'.png')});}
    }
    check(await page.locator('[data-event-id="replacement"]').getAttribute('data-round-state')==='observed','Stale current replacement event');
    for(const slug of ['wdo-identity','replacement-strings']){
     await page.goto(base+'/behind-the-round/'+lang+'/'+slug+'/');
     const note=slug==='wdo-identity'?'#wdo-check-20261022':'#replacement-check-20261022';check(await page.locator(note).isVisible(),lang+'/'+slug);
     check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),lang+'/'+slug+' overflow');
    }
    await page.goto(base+'/applications/'+lang+'/');check(await page.locator('#atlas-publication-checkpoint').isVisible(),'Independent Atlas warning');
    result.browser.push({lang,width,theme,passed:true});await context.close();
   }
   for(const lang of ['it','en','de','fr']){
    const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}}),page=await context.newPage();await page.goto(base+'/'+lang+'/');
    for(const sel of ['#round-phase-checkpoint','#atlas-publication-checkpoint','#counts-check-20261022','#wdo-check-20261022'])check(await page.locator(sel).count()===1,lang+' no-JS missing '+sel);
    await page.goto(base+'/behind-the-round/'+lang+'/replacement-strings/');check(await page.locator('#replacement-check-20261022').isVisible(),lang+' no-JS replacement');result.noJavaScript.push(lang);await context.close();
   }
  }
 }catch(e){result.errors.push(e.stack||String(e));}finally{if(browser)await browser.close();result.passed=result.errors.length===0;fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(result,null,2)+'\n');console.log('ROUND_CHECKPOINT_QA',JSON.stringify({passed:result.passed,staticPages:result.staticPages,browserScenarios:result.browser.length,axeScans:result.axeScans,errors:result.errors}));if(!result.passed)process.exitCode=1;}
})();
