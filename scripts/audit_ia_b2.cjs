#!/usr/bin/env node
"use strict";
/* Connecting the Dots: IA B2 integrated site branch smoke.
   This does not claim to replace real user testing. */
const {chromium}=require("playwright");
const AxeBuilder=require("@axe-core/playwright").default;
const assert=require("node:assert/strict");
const fs=require("node:fs");
const BASE=process.env.CTD_TEST_BASE||"http://127.0.0.1:8128/";
const languages=["it","en","de","fr"];
const hubs=[
 ["ia-understand",4,"how"],
 ["ia-explore",6,"explore"],
 ["ia-stories",4,"economics"],
 ["ia-outcomes",4,"refusals"],
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
   const context=await browser.newContext({viewport:{width,height:850},reducedMotion:"reduce"});
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
    assert.equal(await page.locator(".iaPrimaryLink").count(),6,"six path navigation items");
    assert.equal(await page.locator('.iaPrimaryLink[aria-current="location"]').count(),0,"Home must not pretend the reader has chosen Understand");
    // The primary paths and the purpose statement must not be buried beneath
    // the fold on first arrival, especially on mobile.
    const firstViewport=await page.evaluate(()=>{
      const nav=document.querySelector(".iaPrimaryNav").getBoundingClientRect();
      const explanation=document.querySelector('.hero p[data-i18n="heroBody"]').getBoundingClientRect();
      return {navTop:nav.top,navBottom:nav.bottom,explanationTop:explanation.top};
    });
    assert.ok(firstViewport.navTop<240 && firstViewport.navBottom<365,"task-first navigation is buried on first screen: "+JSON.stringify(firstViewport));
    assert.ok(firstViewport.explanationTop<700,"the project purpose is buried below first screen: "+JSON.stringify(firstViewport));

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
    assert.equal(await page.locator("#iaLegacyNavDisclosure").isVisible(),false,"obsolete A navigation must stay hidden");
    const oldSelectCount=await page.locator("#mobileNav option").count();
    assert.ok(oldSelectCount>=25,"old 21 sections / chapter navigation lost");
    tally.legacyMenu=true;
    const oldSections=await page.locator('section.section:not(.iaHub)').count();
    assert.equal(oldSections,22,"the canonical sections and new cemetery chapter were lost or cloned");
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

    // Exhaustive discoverability check: each of the 26 B2 cards must be
    // actionable across languages and desktop/mobile. Click descriptive copy
    // rather than the headline to catch misleading card hit areas.
    tally.checkedCards=0;
    for(const [hub,count] of hubs)for(let i=0;i<count;i++){
      await page.locator('.iaPrimaryLink[data-b2-area="'+hub+'"]').click();
      await page.locator("#"+hub+".section.active").waitFor({state:"visible",timeout:5000});
      await page.waitForTimeout(50);
      const card=page.locator("#"+hub+" .iaHubCard").nth(i);
      const a=card.locator("h3 a");
      assert.equal(await a.count(),1,hub+" card "+i+" has no single destination");
      const dest=await a.getAttribute("data-open-section");
      const desc=card.locator("p").first();
      // A pointer test must scroll the card into the viewport first.
      // page.mouse.click does NOT auto-scroll, unlike locator.click; otherwise
      // cards below the fold falsely fail only on mobile.
      // Scroll to a genuinely visible location. Playwright's default
      // scrollIntoViewIfNeeded can align just beneath a sticky header, so
      // coordinate-based mouse clicks otherwise hit the navigation bar.
      await desc.evaluate(el=>el.scrollIntoView({behavior:"instant",block:"center",inline:"nearest"}));
      await page.waitForTimeout(110);
      let box=await desc.boundingBox();
      // Bring the pointer target below the sticky 76px topbar if a navigation
      // scroll was still being finalized. This checks the actual hit area,
      // rather than clicking on the topbar itself.
      for(let attempt=0;box&&box.y<105&&attempt<3;attempt++){
        await page.evaluate(()=>window.scrollBy({top:-175,behavior:"instant"}));
        await page.waitForTimeout(80);
        box=await desc.boundingBox();
      }
      assert.ok(box&&box.width>20&&box.height>8,hub+" card "+i+" text hidden");
      const view=page.viewportSize();
      assert.ok(box.y>=-1&&box.y+8<view.height&&box.x>=-1&&box.x+8<view.width,
        hub+" card "+i+" body outside viewport after scroll: "+JSON.stringify({box,view}));
      const pointer=await page.evaluate(({x,y})=>{
        const t=document.elementFromPoint(x,y);
        return {tag:t?.tagName,link:t?.closest('a')?.getAttribute('href')||'',className:t?.className||''};
      },{x:box.x+8,y:box.y+Math.min(9,box.height/2)});
      assert.ok(pointer.link,hub+" card "+i+" descriptive area is not an active link: "+JSON.stringify({box,pointer}));
      if(dest){
        const anchor=await a.getAttribute("data-open-anchor");
        const click={x:box.x+8,y:box.y+Math.min(9,box.height/2)};
        const top=await page.evaluate(({x,y})=>{
          const t=document.elementFromPoint(x,y);
          return {tag:t?.tagName,tagClass:t?.className||'',link:t?.closest('a')?.getAttribute('href'),active:document.querySelector('section.section.active')?.id};
        },click);
        await page.mouse.click(click.x,click.y);
        try{
          await page.locator("#"+dest+".section.active").waitFor({state:"visible",timeout:6000});
        }catch(err){
          const now=await page.evaluate(()=>({active:document.querySelector('section.section.active')?.id,hash:location.hash,scrollY:scrollY}));
          throw Error(hub+" card "+i+" failed "+dest+" click "+JSON.stringify({click,top,now})+": "+err.message);
        }
        if(anchor)assert.equal(await page.locator("#"+anchor).count(),1,hub+" card "+i+" lost deep anchor "+anchor);
      }else{
        const href=await a.getAttribute("href");
        assert.ok(href,hub+" external card "+i+" missing href");
        const abs=new URL(href,page.url());
        assert.equal(abs.origin,new URL(BASE).origin,hub+" card "+i+" leaves the B2 publication");
        assert.ok(abs.pathname.includes("/"+lang+"/"),hub+" card "+i+" changes language "+abs.pathname);
        const response=await page.request.get(abs.href);
        assert.equal(response.status(),200,hub+" card "+i+" links to missing page: "+abs.href);
      }
      tally.checkedCards++;
    }
    assert.equal(tally.checkedCards,26,"not all B2 cards tested");
    // The introductory Internet-basics article deliberately returns to the Home
    // overview. Home must not claim that a primary area is selected.
    // The descriptive text is not an anchor. The native title anchor must
    // nevertheless cover the entire card surface for mouse and touch users.
    await page.locator('.iaPrimaryLink[data-b2-area="ia-stories"]').click();
    const economicsCard=page.locator('#ia-stories .iaHubCard').filter({has:page.locator('a[data-open-section="economics"]')});
    const economicsDescription=economicsCard.locator('p');
    await economicsDescription.evaluate(el=>el.scrollIntoView({behavior:"instant",block:"center"}));
    await page.waitForTimeout(100);
    const paragraphBox=await economicsDescription.boundingBox();
    assert.ok(paragraphBox,"economics card description missing");
    await page.mouse.click(paragraphBox.x+8,paragraphBox.y+Math.min(8,paragraphBox.height/2));
    await page.locator('#economics.section.active').waitFor({state:"visible",timeout:5000});
    await page.locator('.iaPrimaryLink[data-b2-area="ia-understand"]').click();
    await page.locator('#ia-understand a[data-open-section="overview"]').first().click();
    assert.equal(await page.locator('#overview.section.active').count(),1,"Understand overview entry broken");
    assert.equal(await page.locator('.iaPrimaryLink[aria-current="location"]').count(),0,"Home overview must not claim a selected area");
    await page.locator('.iaPrimaryLink[data-b2-area="ia-explore"]').click();
    const atlas=page.locator('#ia-explore a[data-b2-resource="atlas"]');
    const atlasUrl=await atlas.getAttribute("href");
    assert.equal(atlasUrl,"../applications/"+lang+"/","Atlas should not leave the feature branch");
    const guide=page.locator('#ia-explore a[data-b2-resource="access"]');
    assert.equal(await guide.getAttribute("href"),"#governance-access","Guide must open native chapter");
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
  // All independent guides and tools share the same six-area navigation.
  const independent=[];
  for(const lang of languages){
    for(const family of ["applications","inside-the-round","behind-the-round"]){
      independent.push({url:family+"/"+lang+"/",lang,selected:family==="applications"?"explore":"round"});
    }
    for(const slug of ["objectors-eoi","replacement-strings","wdo-identity","sanctions-and-dns","who-controls-internet-access"]){
      independent.push({url:"behind-the-round/"+lang+"/"+slug+"/"+(["sanctions-and-dns","who-controls-internet-access"].includes(slug)?"?legacy=1":""),lang,
        selected:["sanctions-and-dns","who-controls-internet-access"].includes(slug)?"explore":"round"});
    }
  }
  independent.push({url:"explorer/",lang:"en",selected:"explore"},{url:"research/",lang:"en",selected:"research"},{url:"research/connecting-the-dots-working-paper-v1.html",lang:"en",selected:"research"});
  report.independentPages=0;
  for(const entry of independent){
    const context=await browser.newContext({viewport:{width:390,height:860}});
    const page=await context.newPage();
    try{
      const response=await page.goto(BASE+entry.url,{waitUntil:"domcontentloaded",timeout:20000});
      assert.equal(response.status(),200,entry.url+" not found");
      assert.equal(await page.locator(".ctdB2CrossNav a").count(),6,entry.url+" missing B2 navigation");
      assert.equal(await page.locator(".ctdB2Trail").count(),1,entry.url+" is outside the integrated B2 shell");
      assert.equal(await page.locator(".ctdB2Trail a").count(),2,entry.url+" has no Home/area breadcrumb");
      assert.equal(await page.locator(".ctdB2Trail [aria-current='page']").count(),1,entry.url+" has no current-page location");
      assert.equal(await page.locator(".ctdB2CrossNav a[aria-current='location']").count(),1,entry.url+" active area mismatch");
      assert.equal(await page.locator('.ctdB2CrossNav a[data-b2-cross-area="'+entry.selected+'"][aria-current="location"]').count(),1,entry.url+" wrong area");
      // Old standalone documents include absolute production links. In branch
      // preview these must stay inside the branch, but canonical/DOI stay intact.
      assert.equal(await page.locator('#ctd-b2-link-isolation').count(),1,entry.url+" lacks preview containment");
      const escaped=await page.evaluate(()=>{
        const prefix="https://robertbregy.github.io/Connecting-the-Dots/";
        return [...document.querySelectorAll("a[href]")].filter(a=>(a.getAttribute("href")||"").startsWith(prefix)).map(a=>a.getAttribute("href")).slice(0,3);
      });
      assert.deepEqual(escaped,[],entry.url+" contains links that escape preview: "+JSON.stringify(escaped));
      const isEvergreen=entry.url.includes("/sanctions-and-dns/")||entry.url.includes("/who-controls-internet-access/");
      assert.equal(await page.locator('[data-b2-editorial-kind="evergreen-guide"]').count(),isEvergreen?1:0,entry.url+" misclassified editorially");
      if(isEvergreen)
        assert.ok((await page.locator('[data-b2-editorial-kind="evergreen-guide"]').innerText()).length>100,entry.url+" lacks editorial explanation");
      if(entry.url==="applications/it/"){
        await page.locator('.ctdB2CrossNav a[data-b2-cross-area="explore"]').click();
        assert.ok(page.url().endsWith("/it/?tab=ia-explore#ia-explore"),"Atlas to B2 path incorrect");
        await page.locator("#ia-explore.section.active").waitFor({state:"visible",timeout:20000});
        assert.equal(await page.locator("#ia-explore.section.active").count(),1,"crosspage link did not restore B hub");
      }
      report.independentPages++;
    }catch(err){report.issues.push({entry:entry.url,message:err.message})}
    finally{await context.close()}
  }
 }finally {await browser.close();}
 fs.mkdirSync("audit-ia-b2",{recursive:true});
 fs.writeFileSync("audit-ia-b2/report.json",JSON.stringify(report,null,2));
 console.log("IA_B2_AUDIT "+JSON.stringify({scenarios:report.languages.length,successful:report.languages.filter(x=>!x.issues.length).length,independentPages:report.independentPages,issues:report.issues,screenshots:report.screenshots}));
 if(report.issues.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
