#!/usr/bin/env node
"use strict";
/* Connecting the Dots: IA B2 integrated site branch smoke.
   This does not claim to replace real user testing. */
const {chromium}=require("playwright");
const AxeBuilder=require("@axe-core/playwright").default;
const assert=require("node:assert/strict");
const fs=require("node:fs");
const BASE="http://127.0.0.1:8128/";
const languages=["it","en","de","fr"];
const hubs=[
 ["ia-understand",6,"overview"],
 ["ia-explore",3,"explore"],
 ["ia-stories",8,"economics"],
 ["ia-round",4,"behind-round"],
 ["ia-research",4,"research"]
];
const report={kind:"B2 integrated UI smoke test",languages:[],screenshots:[],issues:[],source:"GitHub feature branch build",isHumanUsabilityTest:false};
async function checkAxe(page,label) {
 const axe=await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21a","wcag21aa"]).analyze();
 if(axe.violations.length)throw Error(label+" WCAG "+JSON.stringify(axe.violations.map(x=>({id:x.id,nodes:x.nodes.slice(0,4).map(n=>({target:n.target,why:n.failureSummary}))}))));
}
(async()=>{
 const browser=await chromium.launch({headless:true,args:["--disable-dev-shm-usage"]});
 try {
  for(const lang of languages)for(const width of [390,1440]){
   const context=await browser.newContext({viewport:{width,height:850}});
   const page=await context.newPage();
   const tally={language:lang,width,hubs:[],issues:[],contentSections:0,homePurpose:false,legacyMenu:false};
   const errors=[];
   page.on("pageerror",e=>errors.push(e.message));
   try {
    const resp=await page.goto(BASE+lang+"/",{waitUntil:"load",timeout:35000});
    assert.equal(resp.status(),200,"entry is not 200");
    await page.locator(".iaPrimaryLink").first().waitFor({state:"visible"});
    await page.waitForTimeout(100);
    assert.equal(await page.locator("html").getAttribute("lang"),lang);
    assert.equal(await page.locator(".iaPrimaryLink").count(),5,"five path navigation items");
    assert.equal(await page.locator(".iaHomeJumpList a").count(),5,"home task entries");
    assert.equal(await page.locator(".iaLegacyNavDisclosure[open]").count(),0,"original nav should begin folded");
    assert.ok((await page.locator('.hero p[data-i18n="heroBody"]').innerText()).includes("Connecting the Dots"),"project purpose not visible on Home");
    assert.ok((await page.locator(".iaProjectPrompt").innerText()).length>6,"no question introducing the project");
    assert.ok((await page.locator(".heroPlain").innerText()).includes(".lugano"),"no distinction for candidate .lugano");
    tally.homePurpose=true;
    const visible=await page.evaluate(()=>{
      const r=document.querySelector(".iaPrimaryNav").getBoundingClientRect();
      return [...document.querySelectorAll(".iaPrimaryLink")].map(n=>{const x=n.getBoundingClientRect();return x.width>=45&&x.left>=r.left-2&&x.right<=r.right+2});
    });
    assert.ok(visible.every(Boolean),"not all 5 navigation buttons are on screen "+JSON.stringify(visible));
    await page.locator("#iaLegacyNavDisclosure summary").click();
    const oldSelectCount=await page.locator("#mobileNav option").count();
    assert.ok(oldSelectCount>=25,"old 21 sections / chapter navigation lost");
    await page.locator("#iaLegacyNavDisclosure summary").click();
    tally.legacyMenu=true;
    const oldSections=await page.locator('section.section:not(.iaHub)').count();
    assert.equal(oldSections,21,"the canonical sections were lost or cloned");
    tally.contentSections=oldSections;
    for(const [hub,count,canonical] of hubs){
      await page.locator('.iaPrimaryLink[data-b2-area="'+hub+'"]').click();
      assert.equal(await page.locator("section#"+hub+".active").count(),1,hub+" does not activate");
      assert.equal(await page.locator("#"+hub+" .iaHubCard").count(),count,hub+" cards missing");
      assert.equal(await page.locator('.iaPrimaryLink[aria-current="location"]').count(),1,"multiple primary active links");
      assert.equal(await page.locator('.iaPrimaryLink[data-b2-area="'+hub+'"][aria-current="location"]').count(),1,"active area not highlighted");
      const v=await page.evaluate(()=>({width:document.documentElement.scrollWidth,view:window.innerWidth}));
      assert.ok(v.width<=v.view+3,hub+" horizontal overflow "+JSON.stringify(v));
      const source=page.locator("#"+hub+' .iaHubCard a[data-open-section="'+canonical+'"]').first();
      await source.click();
      assert.equal(await page.locator("#"+canonical+".section.active").count(),1,hub+" destination broken: "+canonical);
      assert.equal(await page.locator('.iaPrimaryLink[data-b2-area="'+hub+'"][aria-current="location"]').count(),1,"cross-link lost parent context "+hub);
      tally.hubs.push({hub,cards:count,target:canonical});
    }
    await page.locator('.iaPrimaryLink[data-b2-area="ia-explore"]').click();
    const atlas=page.locator('#ia-explore a[data-b2-resource="atlas"]');
    const atlasUrl=await atlas.getAttribute("href");
    assert.equal(atlasUrl,"../applications/"+lang+"/","Atlas should not leave the feature branch");
    const guide=page.locator('#ia-understand a[data-b2-resource="access"]');
    assert.equal(await guide.getAttribute("href"),"../behind-the-round/"+lang+"/who-controls-internet-access/","Guide link changed language/branch");
    await page.locator('.iaPrimaryLink[data-b2-area="ia-research"]').click();
    assert.ok((await page.locator('#ia-research .iaHubDoi').innerText()).includes("10.5281/zenodo.23288603"),"research DOI not in landing");
    if(lang==="it"||lang==="en"){
      await page.locator('.iaPrimaryLink[data-b2-area="ia-understand"]').click();
      await checkAxe(page,lang+"/"+width+"/understand");
      await page.locator('.iaPrimaryLink[data-b2-area="ia-explore"]').click();
      await checkAxe(page,lang+"/"+width+"/explore");
    }
    await page.locator('.iaPrimaryLink[data-b2-area="ia-understand"]').focus();
    await page.keyboard.press("Enter");
    assert.equal(await page.evaluate(()=>document.activeElement?.tagName),"H2","keyboard focus not moved to new heading");
    if(lang==="it"&&width===390 || lang==="en"&&width===1440){
      fs.mkdirSync("audit-ia-b2",{recursive:true});
      await page.goto(BASE+lang+"/",{waitUntil:"load"});
      const shot="audit-ia-b2/"+lang+"-"+width+"-home.png";
      await page.screenshot({path:shot,fullPage:true});
      report.screenshots.push(shot);
      await page.locator('.iaPrimaryLink[data-b2-area="ia-stories"]').click();
      const shot2="audit-ia-b2/"+lang+"-"+width+"-stories.png";
      await page.screenshot({path:shot2,fullPage:true});
      report.screenshots.push(shot2);
    }
    assert.equal(errors.length,0,"browser errors "+errors.join("; "));
   }catch(err){tally.issues.push(err.message);report.issues.push({lang,width,message:err.message});}
   finally {report.languages.push(tally);await context.close();}
  }
 }finally {await browser.close();}
 fs.mkdirSync("audit-ia-b2",{recursive:true});
 fs.writeFileSync("audit-ia-b2/report.json",JSON.stringify(report,null,2));
 console.log("IA_B2_AUDIT "+JSON.stringify({scenarios:report.languages.length,successful:report.languages.filter(x=>!x.issues.length).length,issues:report.issues,screenshots:report.screenshots}));
 if(report.issues.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
