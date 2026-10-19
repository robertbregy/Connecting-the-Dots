'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const {chromium}=require('playwright');
const dict=require('../data/translations.json');
const base=process.env.CTD_TEST_BASE||'http://127.0.0.1:8123/';
(async()=>{const browser=await chromium.launch({headless:true}),results=[];fs.mkdirSync('audit-20261019',{recursive:true});
 try{
 // A chapter must be readable even while its large interactive index is delayed.
 const slow=await browser.newPage();
 await slow.route('**/data/site_bundle.js*',route=>route.abort());
 await slow.route('**/assets/app.js*',route=>route.abort());
 await slow.goto(base+'it/?tab=economics');
 assert.ok(await slow.locator('#economics').isVisible(),'Requested static chapter hidden behind interactive data');
 assert.equal(await slow.locator('#overview').isVisible(),false,'Wrong home chapter flashes while data load');
 await slow.close();
 for(const lang of ['en','it','de','fr'])for(const mobile of [false,true]){
  const page=await browser.newPage({viewport:mobile?{width:390,height:844}:{width:1280,height:900},reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+lang+'/');
  assert.equal(await page.evaluate(()=>!!window.DOT_WORLD_PATH),false,'Home fetched optional map geometry');
  assert.equal(await page.evaluate(()=>!!window.CTD_APS_2026),false,'Home fetched the optional APS graph');
  assert.equal(await page.evaluate(()=>performance.getEntriesByType('resource').some(r=>r.name.includes('/data/aps_2026_application_graph.js'))),false);
  await page.goto(base+lang+'/?tab=economics#tld-market-reach');
  await page.locator('[data-market-view="zones"]').click();await page.locator('#market-origin').selectOption('2012');
  assert.equal(await page.locator('#market-zones tbody tr:visible').count(),42);
  assert.equal(new URL(page.url()).searchParams.get('origin'),'2012');assert.equal(new URL(page.url()).searchParams.get('market'),'zones');
  const languageLink=await page.locator('[data-language="'+(lang==='en'?'it':'en')+'"]').first().getAttribute('href');
  assert.equal(new URL(languageLink,page.url()).searchParams.get('origin'),'2012','Language link discarded ranking state');
  await page.reload();await page.locator('[data-market-view="zones"][aria-pressed="true"]').waitFor();
  assert.equal(await page.locator('#market-zones tbody tr:visible').count(),42);
  assert.ok((await page.locator('#market-zones .marketSummaryScope').innerText()).length>70);
  const first=page.locator('#market-zones tbody tr:visible').first();await first.scrollIntoViewIfNeeded();
  if(mobile){
   const rects=await first.evaluate(row=>[row,...row.querySelectorAll('th,td')].map(n=>{const r=n.getBoundingClientRect();return {x:r.x,right:r.right,width:r.width,font:parseFloat(getComputedStyle(n).fontSize)}}));
   assert.ok(rects.every(r=>r.x>=-1&&r.right<=391&&r.width>0),'Phone row hides origin or metric');
   assert.ok(await first.locator('td:nth-child(4)').isVisible(),'Origin hidden on phone');
   assert.ok(await page.locator('#market-zones .marketTable').evaluate(n=>n.scrollWidth<=n.clientWidth+2),'Phone table needs horizontal scroll');
   assert.ok(await page.locator('#market-zones .marketTable').evaluate(n=>n.scrollHeight<=n.clientHeight+2),'Phone table has nested vertical scroll');
  }
  await page.screenshot({path:'audit-20261019/ranking-'+lang+(mobile?'-mobile':'-desktop')+'.png'});
  await page.goto(base+lang+'/?tab=geography');
  await page.waitForFunction(()=>!!window.DOT_WORLD_PATH);
  assert.ok((await page.locator('#demand2026Bars').innerText()).includes('864'));
  assert.equal(await page.locator('.auditUnitCompare > .panel').count(),2);
  assert.ok((await page.locator('#applicantOrganizations2026Bars').textContent()).includes('198'));
  assert.ok((await page.locator('#rsp-tld-footprint .marketEvidence').innerText()).length>10);
  await page.goto(base+lang+'/?tab=explore&q=.lugano');
  await page.waitForFunction(()=>!!window.CTD_APS_2026&&!!window.CTD_APS_REFRESH);
  await page.locator('button[data-explorer-open]:visible').first().click();
  assert.ok(!(await page.locator('.profileCurrentState').innerText()).includes(dict[lang].exploreApplicantManager));
  assert.ok((await page.locator('[role="dialog"]').innerText()).includes('Lugano'));
  await page.locator('#profileTitle').press('Escape');
  assert.equal(await page.locator('[role="dialog"]:visible').count(),0);
  await page.goto(base+lang+'/?tab=timeline#cultural-sensitivity-v2');
  assert.ok(await page.locator('#cultural-sensitivity-v2').isVisible());
  assert.equal(await page.locator('[data-cultural-stage]').count(),8);
  assert.equal(await page.locator('[data-cultural-stage="governed_access"] .tldSources a').count(),2);
  assert.equal(await page.locator('[data-cultural-stage="publishing"] .tldSources a').count(),2);
  assert.equal(await page.locator('#cultural-sensitivity-v2 > .tldTable tbody tr').count(),3);
  if(mobile){assert.ok(await page.locator('#cultural-sensitivity-v2 > .tldTable').evaluate(n=>n.scrollWidth<=n.clientWidth+2),'Sensitivity table overflows on phone');}
  await page.screenshot({path:'audit-20261019/cultural-'+lang+(mobile?'-mobile':'-desktop')+'.png'});
  await page.locator('#tld-cultural-round').selectOption('2012');
  await page.locator('#tld-cultural-search').fill('商店');
  assert.equal(await page.locator('#tld-cultural-records tr').count(),1);
  await page.locator('#tld-cultural-round').selectOption('2026');
  await page.locator('#tld-cultural-search').fill('人工智能');
  assert.equal(await page.locator('#tld-cultural-records tr').count(),1);
  await page.goto(base+lang+'/?tab=research');
  assert.ok((await page.locator('#research [data-i18n="researchPaperFormat"]').innerText()).includes(JSON.parse(fs.readFileSync('publication.json','utf8')).paperVersion));
  assert.ok((await page.locator('#research .auditEvidence').innerText()).includes('11'));
  assert.deepEqual(errors,[],'Browser runtime errors');
  results.push({lang,mobile,status:'pass'});await page.close();
 }}finally{await browser.close()}
 fs.writeFileSync('audit-20261019/remediation-report.json',JSON.stringify({version:JSON.parse(fs.readFileSync('publication.json','utf8')).version,scenarios:results.length,results,humanParticipants:0},null,2));
 console.log('AUDIT_20261019_BROWSER_PASS',JSON.stringify({scenarios:results.length,languages:4,viewports:2}));
})().catch(e=>{console.error(e);process.exitCode=1});
