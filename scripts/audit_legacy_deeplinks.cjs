#!/usr/bin/env node
"use strict";
const {chromium}=require("playwright");
const fs=require("node:fs");
const assert=require("node:assert/strict");
const BASE=process.env.CTD_TEST_BASE||"http://127.0.0.1:8131/";
const ids=["overview","explore","timeline","how","beyond","cities","geography","economics","social","contention","refusals","disputes","strange","reveal","inside-round","behind-round","lugano","research","paper","resources","sources"];
const extras=[["how","how-glossary"],["economics","economic-cycles-2026"],["cemetery","gtld-cemetery"],["cemetery","helsinki-termination"],["overview","internet-basics"]];
const restoredFragments=[["social","social-part-2"],["contention","contention-part-1"],["disputes","disputes-part-2"],["strange","strange-part-2"]];
extras.push(...restoredFragments);
const oldCemeteryLinks=[["economics","gtld-cemetery"],["economics","helsinki-termination"]];
(async()=>{
 const browser=await chromium.launch({headless:true,args:["--disable-dev-shm-usage"]});
 const report={source:"frozen A v0.7.78 legacy tab route and fragment IDs",total:0,failed:[],languages:4,sections:22,urls:[],viewports:[390,1440]};
 try{
 for(const lang of ["it","en","de","fr"])for(const width of [390,1440]){
   const context=await browser.newContext({viewport:{width,height:850}});
   const page=await context.newPage();
   const errors=[];page.on("pageerror",e=>errors.push(e.message));
   try{
    for(const section of ids){
      // Original social links are often ?tab=... alone; anchored links also
      // must restore exactly the original section without a B2 nav detour.
      const uri=BASE+lang+"/?tab="+encodeURIComponent(section)+(width===1440?"#"+section:"");
      report.total++;
      try{
        const r=await page.goto(uri,{waitUntil:"load",timeout:25000});
        // Playwright returns null when only the fragment changes within a
        // previously loaded document. That is a valid same-document navigation.
        if(r)assert.equal(r.status(),200,"HTTP");
        else assert.equal(new URL(page.url()).pathname,"/"+lang+"/","same-document URL escaped locale");
        await page.locator("#"+section+".section.active").waitFor({state:"visible",timeout:5000});
        const target=await page.evaluate(s=>({act:document.querySelector(".section.active")?.id,title:document.title,hash:location.hash,query:new URLSearchParams(location.search).get("tab"),lang:document.documentElement.lang,sections:document.querySelectorAll("section.section:not(.iaHub)").length}),section);
        assert.equal(target.act,section,"active section");
        assert.equal(target.sections,24,"22 preserved historical sections plus 2 native governance chapters");
        assert.equal(target.lang,lang,"language");
        assert.equal(target.query,section,"query tab");
        if(width===1440)assert.equal(target.hash,"#"+section,"anchor changed");
        report.urls.push(uri);
      }catch(e){report.failed.push({uri,why:e.message.slice(0,330)})}
    }
    for(const [section,anchor] of extras){
      const uri=BASE+lang+"/?tab="+section+"#"+anchor;
      report.total++;
      try{
       const r=await page.goto(uri,{waitUntil:"load",timeout:25000});
       // Playwright returns null when only the fragment changes within a
        // previously loaded document. That is a valid same-document navigation.
        if(r)assert.equal(r.status(),200,"HTTP");
        else assert.equal(new URL(page.url()).pathname,"/"+lang+"/","same-document URL escaped locale");
       await page.locator("#"+section+".section.active").waitFor({state:"visible",timeout:5000});
       const target=await page.locator("#"+anchor).count();
       assert.equal(target,1,"missing historical fragment");
       if(restoredFragments.some(([,id])=>id===anchor)){
        await page.waitForFunction(id=>{if(window.CTD_APP_READY!==true)return false;let n=document.getElementById(id);if(!n)return false;const r=n.getBoundingClientRect();if(r.height<=0||r.top<0||r.top>=innerHeight-24)return false;for(;n;n=n.parentElement)if(n.tagName==='DETAILS'&&!n.open)return false;return true;},anchor,{timeout:5000});
        const state=await page.locator('#'+anchor).evaluate(n=>({top:n.getBoundingClientRect().top,height:n.getBoundingClientRect().height,viewport:innerHeight}));
        assert.ok(state.top>=0&&state.top<state.viewport,'Restored fragment not reached: '+JSON.stringify(state));
       }
       report.urls.push(uri);
      }catch(e){report.failed.push({uri,why:e.message.slice(0,330)})}
    }
    // Legacy economy links with cemetery fragments must open the moved
    // canonical section rather than drop the old anchor or display a blank tab.
    for(const [legacyTab,anchor] of oldCemeteryLinks){
      const uri=BASE+lang+"/?tab="+legacyTab+"#"+anchor;
      report.total++;
      try{
        await page.goto(uri,{waitUntil:"load",timeout:25000});
        await page.locator("#cemetery.section.active").waitFor({state:"visible",timeout:5000});
        assert.equal(await page.locator("#"+anchor).count(),1,"legacy cemetery fragment lost");
        report.urls.push(uri);
      }catch(e){report.failed.push({uri,why:e.message.slice(0,330)})}
    }
    if(errors.length)report.failed.push({lang,width,why:"JS exceptions: "+errors.slice(0,4).join("; ")});
   }finally{await context.close()}
 }
 }finally{await browser.close()}
 fs.mkdirSync("audit-deeplinks",{recursive:true});
 fs.writeFileSync("audit-deeplinks/results.json",JSON.stringify(report,null,2));
 console.log("LEGACY_LINK_AUDIT "+JSON.stringify({tested:report.total,success:report.total-report.failed.length,failed:report.failed}));
 if(report.failed.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
