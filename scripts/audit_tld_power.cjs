'use strict';
// Acceptance checks for the new frozen-data controls in actual Chromium.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),rank=JSON.parse(fs.readFileSync(path.join(root,'data/tld_registration_ranking.json'),'utf8'));
const base=process.env.CTD_TEST_BASE||'http://127.0.0.1:8123/';
(async()=>{const browser=await chromium.launch({headless:true,args:['--disable-dev-shm-usage']});let scenarios=0;
 try{for(const lang of ['en','it','de','fr'])for(const width of [390,1280]){
  const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'}),page=await context.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+lang+'/?tab=geography#rsp-tld-portfolios');
  await page.locator('#power-platform-search').fill('.org');
  assert.equal(await page.locator('[data-power-platform]:not([hidden])').count(),1);
  assert.ok((await page.locator('[data-power-platform]:not([hidden])').innerText()).includes('Identity Digital'));
  await page.locator('[data-power-platform]:not([hidden]) summary').click();
  assert.ok(await page.locator('[data-power-platform]:not([hidden]) details').getAttribute('open')!==null);
  await page.locator('#power-platform-search').fill('.fr');assert.equal(await page.locator('[data-power-platform]:not([hidden])').count(),0);
  await page.locator('#power-platform-search').fill('');assert.equal(await page.locator('[data-power-platform]:not([hidden])').count(),23);
  await page.goto(base+lang+'/?tab=economics#tld-registration-top50');
  await page.locator('#power-ranking-era').selectOption('2012');
  assert.equal(await page.locator('[data-power-ranking]:not([hidden])').count(),rank.rows.filter(r=>r.era==='2012').length);
  await page.locator('#power-ranking-era').selectOption('ccTLD');
  assert.equal(await page.locator('[data-power-ranking]:not([hidden])').count(),rank.rows.filter(r=>r.era==='ccTLD').length);
  await page.locator('#power-ranking-era').selectOption('');await page.locator('#power-ranking-search').fill('.com');
  assert.equal(await page.locator('[data-power-ranking]:not([hidden])').count(),1);
  assert.equal(await page.locator('[data-power-ranking]:not([hidden]) td').first().textContent(),'1');
  await page.locator('#power-ranking-search').fill('');
  const overflow=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:innerWidth}));
  assert.ok(overflow.scroll<=overflow.width+3,'Page overflow: '+JSON.stringify({lang,width,...overflow}));assert.deepEqual(errors,[]);
  await page.screenshot({path:path.join(root,'audit-tld-power-'+lang+'-'+width+'.png')});
  await context.close();scenarios++;
 }}finally{await browser.close();}
 console.log('TLD_POWER_BROWSER_PASS',JSON.stringify({scenarios,languages:4,widths:[390,1280],platforms:23,ranking:50}));
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
