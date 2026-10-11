#!/usr/bin/env node
"use strict";
/* IA Lab / synthetic cognitive walkthrough evidence probe.
 * This script only checks interface state and scripted navigability.
 * It does not impersonate, recruit or measure any real human participants.
 */
const {chromium}=require("playwright");
const fs=require("node:fs");
const assert=require("node:assert/strict");
const ROOT="http://127.0.0.1:8128/";
const OUT="audit-ia/persona-probes.json";
const scenarios=[
 {id:"P01",role:"Curioso non specialista",language:"it",viewport:390,goal:"Capire che cos'e un TLD"},
 {id:"P02",role:"Studente",language:"it",viewport:390,goal:"Distinguere stringa, candidatura, TLD"},
 {id:"P03",role:"Giornalista",language:"it",viewport:1440,goal:"Spiegare le due discrepanze 2026"},
 {id:"P04",role:"Operatore dei domini",language:"en",viewport:1440,goal:"Aprire Application Atlas 2026"},
 {id:"P05",role:"Ricercatrice",language:"en",viewport:1440,goal:"Trovare DOI scientifico RR2"},
 {id:"P06",role:"Docente",language:"fr",viewport:390,goal:"Trovare controversie e fonti"},
 {id:"P07",role:"Cittadino",language:"de",viewport:390,goal:"Trovare guida su sanzioni e DNS"},
 {id:"P08",role:"Navigazione da tastiera",language:"it",viewport:390,goal:"Orientarsi e ricevere focus dopo cambio vista"}
];
const results=[],metrics=[],errors=[];
const capture=async(page,which)=>{
 return await page.evaluate((which)=>{
   const nav=which==="prototype"?document.querySelector(".nav-bar"):document.querySelector(".mobileNavWrap");
   const tabs=which==="prototype"?[...document.querySelectorAll(".nav-bar a")]:[...document.querySelectorAll(".mobileNavWrap select option")];
   const rect=nav?.getBoundingClientRect();
   const links=tabs.map(x=>{
     const r=x.getBoundingClientRect();
     return {text:x.textContent.trim(),href:x.getAttribute("href"),visible:which==="prototype"?!!rect&&r.left>=rect.left-2&&r.right<=rect.right+2:null}
   });
   return {language:document.documentElement.lang,href:location.href,menu:links,menuVisibleCount:links.filter(x=>x.visible).length,
     menuTotal:links.length,scrollable:!!nav&&nav.scrollWidth>nav.clientWidth+2,
     viewport:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth,
     mainHeading:document.querySelector("#main h1, #main-content h1")?.textContent.trim().slice(0,140)||null};
 },which);
};
(async()=>{
 const browser=await chromium.launch({headless:true,args:["--disable-dev-shm-usage"]});
 try{
  for(const s of scenarios){
   const context=await browser.newContext({viewport:{width:s.viewport,height:844}});
   const page=await context.newPage();
   try{
    await page.goto(ROOT+"prototype/ia-v1/index.html?lang="+s.language+"#/",{waitUntil:"load"});
    const overview=await capture(page,"prototype");
    const r={persona:s.id,role:s.role,goal:s.goal,language:s.language,viewport:s.viewport,
      initialNav:{total:overview.menuTotal,visible:overview.menuVisibleCount,scrollable:overview.scrollable,links:overview.menu},
      path:[],observation:{},notHuman:true};
    const click=async(selector,label)=>{
      await page.locator(selector).first().click();
      await page.waitForTimeout(80);
      r.path.push(label);
    };
    if(s.id==="P01"){
      await click('.hero-actions a[href="#/capire"]',"Home > Capire");
      const card=page.locator(".card").filter({has:page.locator('a[href*="?tab=overview#internet-basics"]')}).first();
      r.observation={cardCount:await card.count(),cardLabel:await card.locator("h3").textContent(),
        href:await card.locator("a").getAttribute("href"),
        handoff:"external-original-site"};
    }else if(s.id==="P02"){
      await click('.hero-actions a[href="#/esplorare"]',"Home > Esplorare");
      r.observation={explanationVisible:await page.getByText(/stringa richiesta|etichetta DNS/i).count()>0,
        referenceCards:await page.locator(".relation-node").count(),
        conceptCards:await page.locator(".grid.two > .card").count()};
    }else if(s.id==="P03"){
      await click('.nav-bar a[href="#/round"]',"Menu > Round 2026");
      await click('.card a[href="#/nota-conteggi"]',"Scheda > Note sui conteggi");
      r.observation={summary:await page.locator(".reading-block.always p").textContent(),
        detailed:await page.locator("#depth-explain summary").count()===1,
        sourcePanel:await page.locator("#depth-evidence summary").count()===1,
        originalLink:await page.locator('.hero-actions a[href^="https"]').getAttribute("href")};
    }else if(s.id==="P04"){
      await click('.nav-bar a[href="#/esplorare"]',"Menu > Esplorare");
      r.observation={appAtlasLink:await page.locator('a[href*="/applications/en/"]').first().getAttribute("href"),
        relationNodes:await page.locator(".relation-node").count()};
    }else if(s.id==="P05"){
      await click('.nav-bar a[href="#/ricerca"]',"Menu > Ricerca");
      r.observation={researchHandoff:await page.locator('a[href="https://robertbregy.github.io/Connecting-the-Dots/research/"]').first().getAttribute("href"),
        doiVisibleOnArea:(await page.locator("#main").innerText()).includes("10.5281/zenodo.23288603")};
    }else if(s.id==="P06"){
      await click('.nav-bar a[href="#/storie"]',"Menu > Storie");
      r.observation={disputeLink:await page.locator('a[href*="?tab=disputes"]').first().getAttribute("href"),
        cardCount:await page.locator(".card").count()};
    }else if(s.id==="P07"){
      await click('.nav-bar a[href="#/capire"]',"Menu > Capire");
      r.observation={sanctionsLink:await page.locator('a[href*="sanctions-and-dns/"]').first().getAttribute("href")};
    }else{
      await page.keyboard.press("Tab");
      const firstTag=await page.evaluate(()=>document.activeElement?.outerHTML.slice(0,150));
      await page.locator('.hero-actions a[href="#/capire"]').focus();
      await page.keyboard.press("Enter");
      await page.waitForTimeout(80);
      r.path.push("Tastiera: Home > Capire (Invio)");
      r.observation={initialFocus:firstTag,focusAfterNavigation:await page.evaluate(()=>({
        active:document.activeElement?.tagName, id:document.activeElement?.id,
        h1:document.querySelector("#main h1")?.textContent
      }))};
    }
    const endpoint=await capture(page,"prototype");
    r.observation.route=page.url().split("#")[1];
    r.observation.mainHeading=endpoint.mainHeading;
    if(s.viewport===390 && r.initialNav.visible!==5)errors.push(s.id+": only "+r.initialNav.visible+"/5 mobile navigation items visible");
    if(s.id==="P08" && r.observation.focusAfterNavigation.active!=="H1")errors.push("P08: focus not transferred to new H1 after route change");
    results.push(r);
   }catch(e){errors.push(s.id+": "+e.message)}
   finally{await context.close();}
  }
  for(const lang of ["it","en","de","fr"]){
   const ctx=await browser.newContext({viewport:{width:390,height:844}});
   const p=await ctx.newPage();
   try{
    await p.goto(ROOT+"prototype/ia-v1/index.html?lang="+lang+"#/",{waitUntil:"load"});
    const newMenu=await capture(p,"prototype");
    await p.goto(ROOT+lang+"/",{waitUntil:"load"});
    const oldMenu=await capture(p,"baseline");
    metrics.push({lang,viewport:390,prototype:{visible:newMenu.menuVisibleCount,total:newMenu.menuTotal,scrollable:newMenu.scrollable,labels:newMenu.menu.map(x=>x.text)},baseline:{mobileSelectOptions:oldMenu.menuTotal,scrollable:oldMenu.scrollable,labels:oldMenu.menu.map(x=>x.text).slice(0,14)}});
   }catch(e){errors.push("nav "+lang+": "+e.message)}finally{await ctx.close()}
  }
  const report={status:errors.length?"INCOMPLETE":"OBSERVED",kind:"scripted interface probes (synthetic personas)",
    generatedBy:"browser automation; role/task assignment authored by assistant",
    personas:results,initialNavigationMetrics:metrics,errors,
    warning:"NO REAL USER EVIDENCE. Only deterministic interface states and preselected scripted click paths have been checked."};
  fs.mkdirSync("audit-ia",{recursive:true});
  fs.writeFileSync(OUT,JSON.stringify(report,null,2));
  console.log("IA_PERSONA_PROBES "+JSON.stringify(report).slice(0,16000));
  if(errors.length)process.exitCode=1;
 } finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
