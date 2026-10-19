'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const data=require('../data/tld_market_snapshot.json');

module.exports=async function auditTldMarket(){
 const browser=await chromium.launch({headless:true});
 const base=process.env.CTD_TEST_BASE||'http://127.0.0.1:8123/';
 let scenarios=0;
 try{
  for(const lang of ['en','it','de','fr'])for(const mobile of [false,true]){
   const page=await browser.newPage({viewport:mobile?{width:390,height:844}:{width:1280,height:900},reducedMotion:'reduce'});
   await page.goto(base+lang+'/?tab=economics#tld-market-reach');
   await page.locator('.marketViews:visible').waitFor();
   await page.locator('[data-market-view="zones"]').click();
   await page.locator('#market-origin').selectOption('2012');
   assert.equal(await page.locator('#market-zones tbody tr:visible').count(),42);
   await page.locator('#market-search').fill('com');
   assert.equal(await page.locator('#market-zones tbody tr:visible').count(),0);
   await page.locator('#market-origin').selectOption('');
   assert.equal(await page.locator('#market-zones tbody tr:visible').count(),1);
   assert.equal(await page.locator('#market-zones tbody tr:visible').getAttribute('data-market-tld'),'com');
   await page.locator('[data-market-view="web"]').click();
   await page.locator('#market-search').fill('');
   await page.locator('#market-origin').selectOption('cctld');
   assert.equal(await page.locator('#market-web tbody tr:visible').count(),43);
   await page.locator('#market-search').fill('.ai');
   assert.equal(await page.locator('#market-web tbody tr:visible').count(),1);
   await page.locator('#market-search').fill('');
   await page.locator('#market-origin').selectOption('');
   assert.equal(await page.locator('#market-web tbody tr:visible').count(),50);
   await page.screenshot({path:'audit-tld-market-'+lang+(mobile?'-mobile':'-desktop')+'.png'});
   await page.goto(base+lang+'/?tab=geography&map=rspFootprint#rsp-tld-footprint');
   await page.locator('[data-mapmode="rspFootprint"][aria-pressed="true"]').waitFor();
   assert.equal(await page.locator('#geoMap .geoMapData li').count(),data.backends.filter(r=>r.attributionKind==='named-fingerprint').length);
   assert.ok((await page.locator('#geoMap .geoMapData').textContent()).includes('Identity Digital: 458'));
   assert.ok(new URL(page.url()).searchParams.get('map')==='rspFootprint');
   if(mobile)assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'Market/RSP page overflows the phone viewport');
   await page.locator('[data-mapmode="rsp"]').click();
   assert.equal(await page.locator('#geoMap .geoMapData li').count(),5);
   await page.close();scenarios++;
  }
 }finally{await browser.close()}
 console.log('TLD_MARKET_BROWSER_VERIFIED',JSON.stringify({scenarios,languages:4,viewports:2}));
};
