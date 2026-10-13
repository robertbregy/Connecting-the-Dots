#!/usr/bin/env node
"use strict";
const fs=require("node:fs");
const assert=require("node:assert/strict");
const {chromium}=require("playwright");
const BASE="https://robertbregy.github.io/Connecting-the-Dots";
const locales=["it","en","de","fr"];
const issues=[];
const results={origin:BASE,commit:"90029dc6df929e28037243c26eebb8a9e062ce99",
 sitemapRoutes:0,servedRoutes:0,liveHelsinki:0,checkedLocales:0,staticAssets:0,
 contentVersion:"",issues};
const must=async(url,options={})=>{
 const response=await fetch(url,{redirect:"follow",signal:AbortSignal.timeout(28000),...options});
 assert.equal(response.status,200,"HTTP "+response.status+": "+url);
 return response;
};
(async()=>{
 const expected=[...fs.readFileSync("sitemap.xml","utf8").matchAll(/<loc>([^<]+)<\/loc>/g)].map(x=>x[1]);
 const sitemap=await (await must(BASE+"/sitemap.xml")).text();
 const actual=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(x=>x[1]);
 assert.deepEqual(actual,expected,"Live sitemap must match the deployed commit, not just contain the same count");
 assert.equal(actual.length,39,"Published sitemap entry count");
 results.sitemapRoutes=actual.length;
 for(const url of expected){
   const text=await (await must(url)).text();
   assert.ok(text.toLowerCase().includes("<main"),"Missing primary content at "+url);
   assert.ok(!text.includes("404 - There isn't a GitHub Pages site here"),"GitHub Pages fallback at "+url);
   results.servedRoutes++;
 }
 const publication=await (await must(BASE+"/publication.json")).json();
 assert.equal(publication.version,"0.7.80","wrong live version");
 assert.equal(publication.doi,"10.5281/zenodo.23288603","published RR2 DOI was changed");
 results.contentVersion=publication.version;
 const frozen=await (await must(BASE+"/downloads/connecting-the-dots-data-pack-v0.7.78.sha256")).text();
 assert.ok(frozen.includes("d812e6a01c04c451c4d68e111977a7de7492dce3919ebed48852fc19d224c1fe"),
   "Historical v0.7.78 checksum is not the original");
 for(const file of ["assets/app.js","assets/style.css","data/site_bundle.js","downloads/connecting-the-dots-data-pack-v0.7.80.zip"]){
   const r=await must(BASE+"/"+file,{method:"HEAD"});
   assert.ok(Number(r.headers.get("content-length"))>0,"Empty published asset: "+file);
   results.staticAssets++;
 }
 const browser=await chromium.launch({headless:true,args:["--disable-dev-shm-usage"]});
 try{
   for(const lang of locales)for(const width of [390,1440]){
     const context=await browser.newContext({viewport:{width,height:860},reducedMotion:"reduce"});
     const page=await context.newPage();
     const errors=[];page.on("pageerror",e=>errors.push(e.message));
     try{
       const url=BASE+"/"+lang+"/?tab=economics#helsinki-termination";
       const r=await page.goto(url,{waitUntil:"load",timeout:40000});
       assert.equal(r.status(),200,"Deep link returned non-200 "+lang);
       await page.locator("#economics.section.active").waitFor({state:"visible",timeout:16000});
       await page.locator("#helsinki-termination").waitFor({state:"visible",timeout:16000});
       assert.equal(await page.locator("#helsinki-termination .srcs a").count(),3,"Helsinki's sources incomplete: "+lang);
       const text=await page.locator("#helsinki-termination").innerText();
       assert.ok(text.length>420 && text.includes(".helsinki"),"Case not rendered in "+lang);
       assert.ok(!text.includes("undefined") && !text.includes("helsinkiCaseStatus"),
         "Raw translation key in published case "+lang);
       const oldURL=BASE+"/"+lang+"/?tab=cities#cities";
       await page.goto(oldURL,{waitUntil:"load",timeout:40000});
       await page.locator("#cities.section.active .cityHelsinkiBridge").waitFor({state:"visible",timeout:12000});
       const description=page.locator("#cities .cityHelsinkiBridge p.sub");
       const box=await description.boundingBox();
       assert.ok(box,"Helsinki context paragraph is not present in "+lang);
       await page.mouse.click(box.x+8,box.y+Math.min(box.height/2,8));
       await page.locator("#helsinki-termination").waitFor({state:"visible",timeout:12000});
       assert.equal(await page.locator("#economics.section.active").count(),1,"Full-card click did not navigate "+lang);
       assert.deepEqual(errors,[],"Browser JS errors in "+lang+" "+width);
       results.liveHelsinki++;
     }finally{await context.close()}
   }
 }finally{await browser.close()}
 results.checkedLocales=locales.length;
 console.log("LIVE_PUBLIC_PAGES_AUDIT "+JSON.stringify(results));
})().catch(e=>{issues.push(String(e?.stack||e));console.error("LIVE_PUBLIC_PAGES_AUDIT_FAILURE "+JSON.stringify(results));process.exitCode=1});