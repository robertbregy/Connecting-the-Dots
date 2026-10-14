#!/usr/bin/env node
'use strict';
// Browser contract for the real native integration (never for two detached shells).
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const base = process.env.CTD_TEST_BASE || 'http://127.0.0.1:8128/';

(async () => {
 const browser = await chromium.launch({headless:true,args:['--disable-dev-shm-usage']});
 try {
  for(const lang of ['en','it','de','fr']) {
   for(const width of [390,1440]) {
    const context=await browser.newContext({viewport:{width,height:850},reducedMotion:'reduce'});
    const page=await context.newPage();
    const errors=[];
    page.on('pageerror',err=>errors.push(err.message));
    await page.goto(base+lang+'/?tab=ia-explore',{waitUntil:'load',timeout:40000});
    const hub=page.locator('#ia-explore');
    await hub.waitFor({state:'visible'});
    const access=hub.locator('[data-b2-resource="access"]');
    const sanctions=hub.locator('[data-b2-resource="sanctions"]');
    assert.equal(await access.getAttribute('data-open-section'),'governance-access');
    assert.equal(await sanctions.getAttribute('data-open-section'),'governance-sanctions');
    await access.click();
    await page.locator('#governance-access.active').waitFor({state:'visible'});
    assert.equal(await page.locator('.topbar').count(),1);
    assert.equal(await page.locator('h1').count(),1);
    const buttons=page.locator('#accessSimulator [data-access-select]');
    assert.ok(await buttons.count()>=2,'Simulator choices missing');
    await buttons.nth(1).click();
    assert.equal(await buttons.nth(1).getAttribute('aria-pressed'),'true','Simulator interaction broken');
    assert.equal(await page.locator('.iaPrimaryLink[data-b2-area="ia-explore"][aria-current="location"]').count(),1);
    await page.locator('#themeBtn').click();
    assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
    await page.goto(base+lang+'/?tab=ia-explore',{waitUntil:'load'});
    await page.locator('#ia-explore [data-b2-resource="sanctions"]').click();
    await page.locator('#governance-sanctions.active').waitFor({state:'visible'});
    assert.ok((await page.locator('#governance-sanctions .governanceSources a').count())>0,'Sourced sanctions content missing');
    assert.equal(await page.locator('.iaPrimaryLink[data-b2-area="ia-explore"][aria-current="location"]').count(),1);
    await page.goto(base+'behind-the-round/'+lang+'/who-controls-internet-access/',{waitUntil:'load'});
    await page.waitForURL(url=>url.searchParams.get('tab')==='governance-access');
    await page.locator('#governance-access.active').waitFor({state:'visible'});
    await page.goto(base+'behind-the-round/'+lang+'/sanctions-and-dns/',{waitUntil:'load'});
    await page.waitForURL(url=>url.searchParams.get('tab')==='governance-sanctions');
    await page.locator('#governance-sanctions.active').waitFor({state:'visible'});
    assert.deepEqual(errors,[],'Browser runtime errors: '+errors.join(';'));
    await context.close();
   }
  }
  console.log('NATIVE_GOVERNANCE_BROWSER_QA_PASS all 4 languages x mobile+desktop');
 } finally { await browser.close(); }
})().catch(e=>{console.error(e.stack||e);process.exit(1);});
