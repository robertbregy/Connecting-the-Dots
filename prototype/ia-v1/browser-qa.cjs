#!/usr/bin/env node
"use strict";
/*
 * Real-browser acceptance smoke test for IA Lab.
 * Checks the branch prototype, not production, and does not substitute for human testing.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const {chromium}=require("playwright");
const AxeBuilder=require("@axe-core/playwright").default;
const ROOT="http://127.0.0.1:8128/prototype/ia-v1/index.html";
const langs=["it","en","de","fr"];
const routes=["","capire","esplorare","storie","round","ricerca","guida-accesso","nota-conteggi","test"];
const failures=[],log={routes:0,responsive:0,depth:0,axe:0,anchors:0,errors:0};
const capture=(e)=>failures.push(String(e));
(async()=>{
 const browser=await chromium.launch({headless:true,args:["--disable-dev-shm-usage"]});
 try {
  for(const lang of langs){
   for(const route of routes){
    const mobile=["it","fr"].includes(lang);
    const page=await browser.newPage({viewport:mobile?{width:390,height:844}:{width:1440,height:900}});
    const errors=[];
    page.on("pageerror",e=>errors.push(e.message));
    page.on("console",m=>{if(m.type()==="error")errors.push(m.text())});
    const url=ROOT+"?lang="+lang+"#/"+route;
    try {
     const res=await page.goto(url,{waitUntil:"load",timeout:20000});
     assert.equal(res.status(),200,"http status");
     await page.waitForTimeout(100);
     assert.equal(await page.locator("html").getAttribute("lang"),lang,"language");
     assert.equal(await page.locator("#main h1").count(),1,"single main H1");
     assert.equal(await page.locator(".nav-bar a").count(),5,"five navigation items");
     assert.equal(await page.locator(".site-header").count(),1);
     const w=await page.evaluate(()=>({actual:document.documentElement.scrollWidth,view:window.innerWidth}));
     assert.ok(w.actual<=w.view+3,"horizontal overflow "+JSON.stringify(w));
     if(["guida-accesso","nota-conteggi"].includes(route)) {
      assert.equal(await page.locator(".reading-block summary").count(),2);
      await page.locator("#depth-explain summary").click();
      assert.equal(await page.locator("#depth-explain").getAttribute("open"),"","first disclosure expanded");
      await page.locator("#depth-evidence summary").click();
      assert.equal(await page.locator("#depth-evidence").getAttribute("open"),"","evidence disclosure expanded");
      const links=await page.locator("#depth-evidence a").count();
      assert.ok(links>=2,"missing evidence links");
      log.depth++;
     }
     if(["capire","esplorare","storie","round","ricerca"].includes(route)){
      const nav=await page.locator('.nav-bar a[aria-current="page"]').count();
      assert.equal(nav,1,"single active navigation item");
     }
     assert.equal(errors.length,0,"console errors: "+errors.join(" | "));
     log.routes++;
     if(["","guida-accesso","nota-conteggi"].includes(route)){
      const axe=await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21a","wcag21aa"]).analyze();
      assert.equal(axe.violations.length,0,"axe: "+axe.violations.map(x=>x.id+":"+x.nodes.length).join(", "));
      log.axe++;
     }
     if((lang==="it"&&route==="")||(lang==="it"&&route==="guida-accesso")||(lang==="en"&&route==="nota-conteggi")||(lang==="de"&&route==="esplorare")){
      if(lang==="en")await page.locator("#theme-toggle").click();
      fs.mkdirSync("audit-ia",{recursive:true});
      await page.screenshot({path:"audit-ia/"+lang+"-"+(route||"home")+".png",fullPage:true});
     }
    }catch(e){capture(lang+"/"+(route||"home")+" "+e.message);}
    finally {await page.close();}
   }
  }
  const page=await browser.newPage({viewport:{width:390,height:844}});
  try{
   await page.goto(ROOT+"?lang=it#/",{waitUntil:"load"});
   await page.locator('.nav-bar a[href="#/esplorare"]').click();
   assert.equal(await page.locator('#main h1').count(),1);
   assert.equal(await page.locator(".nav-bar a[aria-current='page']").getAttribute("href"),"#/esplorare");
   log.anchors++;
   await page.locator("#locale").selectOption("fr");
   assert.equal(await page.locator("html").getAttribute("lang"),"fr");
   assert.ok(page.url().includes("lang=fr"));
   assert.equal(await page.locator('.nav-bar a[aria-current="page"]').getAttribute("href"),"#/esplorare");
   log.responsive++;
   await page.locator("#theme-toggle").click();
   assert.equal(await page.locator("html").getAttribute("data-theme"),"dark");
  }catch(e){capture("navigation/language/theme "+e.message)}
  finally{await page.close()}
 }finally{await browser.close();}
 log.errors=failures.length;
 fs.mkdirSync("audit-ia",{recursive:true});
 fs.writeFileSync("audit-ia/report.json",JSON.stringify({log,failures},null,2));
 console.log("IA_BROWSER_QA "+JSON.stringify({log,failures}));
 if(failures.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
