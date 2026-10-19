/* Exercise discovery, provenance and compact results, rather than infer comprehension. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const {chromium}=require('playwright');
const base=process.env.CTD_TEST_BASE||'http://127.0.0.1:8123/';
(async()=>{const browser=await chromium.launch(),results=[];fs.mkdirSync('audit-20261019',{recursive:true});
 try{for(const lang of ['en','it','de','fr'])for(const mobile of [false,true]){
  const page=await browser.newPage({viewport:mobile?{width:390,height:844}:{width:1280,height:900},reducedMotion:'reduce'}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+lang+'/');await page.waitForFunction(()=>!!window.CTD_APP_READY);
  assert.equal(await page.locator('.audienceDiscovery').count(),3);
  await page.locator('.heroPrimary').click();
  assert.equal(new URL(page.url()).searchParams.get('tab'),'timeline');
  assert.ok(await page.locator('#cultural-epoch-map').isVisible());
  assert.equal(await page.locator('#cultural-epoch-map li').count(),6);
  for(const href of await page.locator('#cultural-epoch-map a').evaluateAll(as=>as.map(a=>a.getAttribute('href')))){
   assert.equal(await page.locator(new URL(href,base).hash).count(),1,'Historical source target missing');
  }
  await page.goto(base+lang+'/?tab=economics#tld-market-reach');
  await page.locator('#market-more:visible').waitFor();
  assert.equal(await page.locator('#market-web tbody tr:visible').count(),10);
  if(mobile){const y=await page.locator('#market-web tbody tr:visible').first().evaluate(e=>e.getBoundingClientRect().top);assert.ok(y<1100,'First result is still buried: '+y)}
  await page.locator('[data-market-view="zones"]').click();await page.locator('#market-origin').selectOption('2012');
  assert.equal(await page.locator('#market-zones tbody tr:visible').count(),10);
  await page.locator('#market-more').click();assert.equal(await page.locator('#market-zones tbody tr:visible').count(),42);
  await page.reload();assert.equal(await page.locator('#market-zones tbody tr:visible').count(),42);
  await page.locator('#market-more').click();assert.equal(await page.locator('#market-zones tbody tr:visible').count(),10);
  await page.locator('#market-search').fill('com');assert.equal(await page.locator('#market-zones tbody tr:visible').count(),0);
  await page.locator('#market-origin').selectOption('');assert.equal(await page.locator('#market-zones tbody tr:visible').count(),1);
  await page.goto(base+lang+'/?tab=explore&q=.ai&scope=names');await page.waitForFunction(()=>!!window.CTD_APP_READY);
  assert.equal(await page.locator('#explorerSearchScope').inputValue(),'names');
  assert.equal(await page.evaluate(()=>!!window.CTD_APS_2026),false);
  assert.ok((await page.locator('#explorerResultCount').innerText()).includes('.ai'));
  const exportWait=page.waitForEvent('download');await page.locator('#explorerExport').click();
  const download=await exportWait;const csv=fs.readFileSync(await download.path(),'utf8');assert.ok(csv.includes('searchScope'));
  await page.locator('button[data-explorer-open]:visible').first().click();
  assert.ok(await page.locator('.audienceBrief').isVisible());assert.ok((await page.locator('.audienceBrief').innerText()).includes('2026'));
  await page.locator('#profileTitle').press('Escape');
  await page.locator('.audienceAtlasLink > summary').click();await page.waitForFunction(()=>!!window.CTD_APS_2026);
  await page.goto(base+lang+'/?tab=research#research-citation-guide');
  assert.equal(await page.locator('.audienceCiteGrid article').count(),3);
  assert.ok((await page.locator('#independent-review-status').innerText()).length>100);
  assert.ok(await page.locator('.audienceCiteGrid a[href*="v0.7.89.zip"]').count());
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+2));
  assert.deepEqual(errors,[]);
  await page.screenshot({path:'audit-20261019/audience-research-'+lang+(mobile?'-phone':'-desktop')+'.png'});
  results.push({lang,mobile,status:'pass'});await page.close();
 }}finally{await browser.close()}
 fs.writeFileSync('audit-20261019/audience-report.json',JSON.stringify({version:require('../publication.json').version,results,humanParticipants:0,independentCoding:'pending'},null,2));
 console.log('AUDIENCE_BROWSER_PASS',JSON.stringify({scenarios:results.length,humanParticipants:0}));
})().catch(e=>{console.error(e);process.exitCode=1});
