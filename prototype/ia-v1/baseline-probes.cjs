#!/usr/bin/env node
"use strict";
/* Deterministic baseline navigation probes. No invented human observations. */
const {chromium}=require("playwright");
const fs=require("node:fs");
const ROOT="http://127.0.0.1:8128/";
const CASES=[
 {id:"P01",lang:"it",w:390},
 {id:"P02",lang:"it",w:390},
 {id:"P03",lang:"it",w:1440},
 {id:"P04",lang:"en",w:1440},
 {id:"P05",lang:"en",w:1440},
 {id:"P06",lang:"fr",w:390},
 {id:"P07",lang:"de",w:390},
 {id:"P08",lang:"it",w:390}
];
const findings=[],failures=[];
(async()=>{
 const browser=await chromium.launch({headless:true,args:["--disable-dev-shm-usage"]});
 try{
  for(const c of CASES){
   const ctx=await browser.newContext({viewport:{width:c.w,height:844}});
   const page=await ctx.newPage();
   const row={persona:c.id,lang:c.lang,width:c.w,path:[],observations:{},completedScript:false};
   try{
    const response=await page.goto(ROOT+c.lang+"/",{waitUntil:"load",timeout:30000});
    if(!response||response.status()!==200)throw Error("HTTP error for baseline route");
    await page.waitForTimeout(200);
    const act=async(sel,label)=>{
      const locator=page.locator(sel).first();
      await locator.click();
      row.path.push(label);
      await page.waitForTimeout(80);
    };
    const select=async(val,label)=>{
      await page.locator("#mobileNav").selectOption(val);
      row.path.push(label);
      await page.waitForTimeout(80);
    };
    const active=async()=>page.evaluate(()=>[...document.querySelectorAll("section.section.active")].map(e=>e.id));
    row.observations.options=await page.locator("#mobileNav option").count();
    if(c.id==="P01"){
      await act('.heroActions a[data-open-anchor="internet-basics"]',"Hero > Internet in pochi passi");
      row.observations.lessonHeading=await page.locator("#internet-basics").innerText();
      row.observations.active=await active();
      row.observations.focus=await page.evaluate(()=>({tag:document.activeElement?.tagName,id:document.activeElement?.id}));
    }else if(c.id==="P02"){
      await select("explore","Selettore > Cerca TLD");
      row.observations.active=await active();
      row.observations.applicationAtlasLink=await page.locator("#apsAtlasLink").getAttribute("href");
      row.observations.relationLessonPresent=(await page.locator("#how .namespaceMapPanel").count())>0;
    }else if(c.id==="P03"){
      await act('.navMenu[data-label-key="navRound"] .navMenuTrigger',"Menu > ICANN 2026");
      await act('#navRoundDropdown a[data-target="behind-round"]',"Menu aperto > Note dal campo");
      row.observations.active=await active();
      row.observations.heading=await page.locator("#behindRoundTitle").innerText();
      row.observations.handoff=await page.locator('#behind-round a[href*="/behind-the-round/it/"]').first().getAttribute("href");
    }else if(c.id==="P04"){
      await act('.nav > a[data-target="explore"]',"Menu > Explore");
      row.observations.active=await active();
      row.observations.applicationAtlasLink=await page.locator("#apsAtlasLink").getAttribute("href");
    }else if(c.id==="P05"){
      await act('.navMenu[data-label-key="navResearch"] .navMenuTrigger',"Menu > Research");
      await act('#navResearchDropdown a[data-target="research"]',"Sottomenu > Research & citation");
      row.observations.active=await active();
      row.observations.rr2DoiVisible=(await page.locator("#research").innerText()).includes("10.5281/zenodo.23288603");
      row.observations.researchStandalone=await page.locator('a[href*="/research/"]').count();
    }else if(c.id==="P06"){
      await select("disputes","Selettore > Controversie");
      row.observations.active=await active();
      row.observations.heading=await page.locator("#disputes h2").first().innerText();
    }else if(c.id==="P07"){
      await select("how","Selettore > Come funziona");
      row.observations.active=await active();
      row.observations.guideLink=await page.locator('a[data-governance-explainer-link]').first().getAttribute("href");
    }else{
      await page.locator("#mobileNav").focus();
      await page.keyboard.press("h");
      await select("how","Selettore da tastiera > Come funziona");
      row.observations.active=await active();
      row.observations.focus=await page.evaluate(()=>({tag:document.activeElement?.tagName,id:document.activeElement?.id}));
    }
    row.completedScript=true;
   }catch(e){failures.push({persona:c.id,message:e.message})}
   finally{findings.push(row);await ctx.close()}
  }
 }finally{await browser.close()}
 const report={kind:"old-site scripted navigation baseline",source:"repo branch reproduces v0.7.78 before IA migration",humanStudy:false,findings,failures};
 fs.mkdirSync("audit-ia",{recursive:true});
 fs.writeFileSync("audit-ia/baseline-probes.json",JSON.stringify(report,null,2));
 console.log("IA_BASELINE_PROBES "+JSON.stringify(report).slice(0,16000));
 if(failures.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
