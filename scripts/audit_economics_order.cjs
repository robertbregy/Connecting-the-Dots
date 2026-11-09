'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const AxeBuilder=require('@axe-core/playwright').default;
const root=path.resolve(__dirname,'..');
const inventory=JSON.parse(fs.readFileSync(path.join(root,'data/economics-preservation.json'),'utf8'));
const base=process.env.CTD_TEST_BASE||'http://127.0.0.1:8128/';
const out=process.env.CTD_ECONOMICS_QA||'/tmp/ctd-economics-order';fs.mkdirSync(out,{recursive:true});
const languages=(process.env.CTD_ECONOMICS_LANGS||'it,en,de,fr').split(',');
const widths=(process.env.CTD_ECONOMICS_WIDTHS||'390,1440').split(',').map(Number);
const keys=['market','cases','portfolios','round-2026'];
// Keep the original fourteen browser regressions; the static gate proves all
// 53 fragment destinations in every language without 424 redundant page loads.
const legacy=['economics-part-1','economics-part-2','economics-part-3','economics-part-4','economics-part-5','economics-part-6','economics-part-7','economics-part-8','economics-part-9','round-application-fees','economy-sectors','tld-market-reach','aps-current-economics','econ-case-ai'];
const report={scenarios:[],errors:[]};
const nativeURL=lang=>new URL(lang+'/?tab=economics',base).href;
const detailURL=(lang,key,hash='')=>new URL(`economics/${lang}/${key}/${hash?'#'+hash:''}`,base).href;
const ready=page=>page.waitForFunction(()=>document.documentElement.dataset.economicsReady==='true',null,{timeout:15000});
const nativeReady=page=>page.waitForFunction(()=>window.CTD_APP_READY===true,null,{timeout:20000});
const visibleFragment=(page,id)=>page.waitForFunction(id=>{
 let node=document.getElementById(id);if(!node)return false;
 const rect=node.getBoundingClientRect();if(!rect.width||!rect.height)return false;
 for(;node;node=node.parentElement)if((node.tagName==='DETAILS'&&!node.open)||node.hidden)return false;
 return true;
},id,{timeout:10000});

async function auditAppearance(page,selector,lang,width,theme,key){
 assert.equal(await page.locator('html').getAttribute('data-theme'),theme,'Theme preference lost on '+key);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false,'Horizontal page overflow: '+key);
 const axe=await new AxeBuilder({page}).include(key==='hub'?selector:'body').withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
 assert.deepEqual(axe.violations.map(v=>({id:v.id,impact:v.impact,targets:v.nodes.map(n=>n.target)})),[],theme+' accessibility violations: '+key);
 await page.locator(selector).evaluate(node=>node.scrollIntoView({block:'start'}));
 await page.screenshot({path:path.join(out,`${lang}-${width}-${theme}-${key}.png`),fullPage:false});
}

async function assertHub(page){
 assert.equal(await page.locator('#economics[data-economics-layout="hub-v1"]').count(),1);
 assert.deepEqual(await page.locator('#economics a[data-economics-path]').evaluateAll(nodes=>nodes.map(node=>node.dataset.economicsPath)),keys);
 assert.equal(await page.locator('#economics .economicsChapter,#economics .economicModel,#economics .economicCase,#economics table').count(),0,
  'The complete dossier must not be hidden in the short hub');
 assert.ok(await page.locator('#reader-brief-economics').isVisible());
}

async function auditDetail(page,key){
 assert.equal(await page.locator('body').getAttribute('data-economics-page'),key);
 if(key==='cases'){
  assert.equal(await page.locator('#economicGrid .economicCase').count(),8);
  assert.equal(await page.locator('#economicModels .economicModel').count(),8);
  assert.equal(await page.locator('#economicGrid .economicMetric').count(),22);
  assert.equal(await page.locator('#economicGrid h3,#economicModels h3').count(),0,'Runtime reversed the heading hierarchy');
 }else if(key==='market'){
  for(const id of ['market-web','market-zones'])assert.equal(await page.locator('#'+id+' tbody tr').count(),50);
  assert.equal(await page.locator('#market-web tbody tr:visible').count(),10,'Compact first market page');
  await page.locator('[data-market-view="zones"]').click();
  assert.equal(await page.locator('[data-market-view="zones"]').getAttribute('aria-pressed'),'true');
  await page.locator('#market-search').fill('xyz');
  assert.ok(await page.locator('#market-zones tbody tr:visible').count()>0);
  await page.locator('#market-search').fill('');
 }else if(key==='portfolios'){
  assert.ok(await page.locator('.portfolioEconomics').isVisible());
  assert.ok(await page.locator('#economics-contention-2026').isVisible());
  assert.equal(await page.locator('[data-round-focus="economics"]').count(),1);
 }else if(key==='round-2026'){
  assert.ok(await page.locator('#economics-comparison-guide').isVisible());
  assert.equal(await page.locator('#aps-current-economics table').count(),4);
  assert.equal(await page.locator('.historicalEconomy').getAttribute('open'),null);
  await page.locator('#economics-historical-link').focus();await page.keyboard.press('Enter');
  await page.waitForFunction(()=>document.querySelector('.historicalEconomy').open);
  await visibleFragment(page,'economy-sectors');
  await page.goBack();
 }
}

async function auditCasesActions(page,lang){
 const returnURL=page.url();
 // A document-local spy checks the copied URL without writing to a system
 // clipboard or opening an operating-system share dialog.
 await page.evaluate(()=>{
  Object.defineProperty(navigator,'share',{configurable:true,value:undefined});
  Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async value=>{window.__ctdEconomicsCopiedURL=value;}}});
 });
 await page.locator('[data-economics-share]').click();
 await page.waitForFunction(expected=>window.__ctdEconomicsCopiedURL===expected,returnURL);
 assert.equal((await page.locator('#economics-share-status').innerText()).trim(),
  await page.locator('#economics-page-labels').evaluate(node=>JSON.parse(node.textContent).copied));
 try{
  await page.locator('#econ-case-ai a[data-economic-explore]').click();
  await page.waitForURL(url=>url.pathname===new URL(lang+'/',base).pathname&&url.searchParams.get('tab')==='explore'&&url.searchParams.get('preset')==='economics'&&url.searchParams.get('tld')==='ai');
  await nativeReady(page);
  await page.locator('#explorerDrawer.open').waitFor({state:'visible'});
  assert.equal((await page.locator('#profileTitle').innerText()).trim(),'.ai','The case action must open its matching profile');
  assert.ok((await page.locator('#drawerContent').innerText()).trim().length>150,'The matching Explorer profile must contain its evidence');
 }finally{
  await page.goto(returnURL,{waitUntil:'load'});await ready(page);
 }
}

async function auditNoScript(browser,lang,width){
 const context=await browser.newContext({javaScriptEnabled:false,viewport:{width,height:900},colorScheme:'light'});
 const page=await context.newPage();page.setDefaultTimeout(15000);
 try{
  await page.goto(nativeURL(lang),{waitUntil:'load'});
  await assertHub(page);
  assert.ok(await page.locator('#economics .economicsLegacy').isVisible(),'Legacy recovery links must work without JavaScript');
  for(const key of keys){
   await page.goto(nativeURL(lang),{waitUntil:'load'});
   await page.locator(`#economics a[data-economics-path="${key}"]`).click();
   await page.waitForURL(url=>url.pathname===new URL(detailURL(lang,key)).pathname);
   assert.ok(await page.locator('main').isVisible());
   assert.equal(await page.locator('#economics-share:visible').count(),0,'Unavailable share action must not appear without JavaScript');
   if(key==='market'){
    for(const id of ['market-web','market-zones'])assert.equal(await page.locator('#'+id+' tbody tr:visible').count(),50,'Complete market evidence is required without JavaScript');
    assert.equal(await page.locator('.marketViews:visible,.marketFilters:visible,#market-more:visible').count(),0,'Unavailable filters must not appear without JavaScript');
   }else if(key==='cases'){
    assert.equal(await page.locator('.economicModel:visible').count(),8);
    assert.equal(await page.locator('.economicCase:visible').count(),8);
    assert.equal(await page.locator('.economicMetric:visible').count(),22);
   }else if(key==='round-2026'){
    await page.locator('.historicalEconomy > summary').focus();await page.keyboard.press('Enter');
    assert.ok(await page.locator('.historicalEconomy').evaluate(node=>node.open),'Native historical disclosure must work without JavaScript');
   }
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false,'No-JavaScript horizontal page overflow: '+key);
  }
 }finally{await context.close();}
}

(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--no-sandbox','--disable-dev-shm-usage']});
 try{for(const lang of languages)for(const width of widths){
  const context=await browser.newContext({viewport:{width,height:900},colorScheme:'light',reducedMotion:'reduce'});
  const page=await context.newPage(),runtimeErrors=[];page.setDefaultTimeout(15000);page.on('pageerror',error=>runtimeErrors.push(error.message));
  const result={lang,width,passed:false};
  try{
   for(const theme of ['light','dark']){
    await page.goto(nativeURL(lang),{waitUntil:'load'});await nativeReady(page);
    if(await page.locator('html').getAttribute('data-theme')!==theme)await page.locator('#themeBtn').click();
    await assertHub(page);
    await auditAppearance(page,'#economics',lang,width,theme,'hub');
    for(const key of keys){
     await page.goto(nativeURL(lang),{waitUntil:'load'});await nativeReady(page);
     await page.locator(`#economics a[data-economics-path="${key}"]`).focus();await page.keyboard.press('Enter');
     await page.waitForURL(url=>url.pathname===new URL(detailURL(lang,key)).pathname);await ready(page);
     await auditDetail(page,key);
     if(lang==='it'&&width===1440&&theme==='light'&&key==='cases')await auditCasesActions(page,lang);
     await auditAppearance(page,'main',lang,width,theme,key);
    }
   }
   for(const id of legacy){
    const destination=inventory.locales[lang].anchors[id];
    assert.ok(destination,'Legacy regression absent from preservation inventory: '+id);
    await page.goto(nativeURL(lang)+'#'+id,{waitUntil:'load'});
    if(destination==='hub')await nativeReady(page);
    else{await page.waitForURL(url=>url.pathname===new URL(detailURL(lang,destination)).pathname&&url.hash==='#'+id);await ready(page);}
    await visibleFragment(page,id);
   }
   // Old static guide fragments have the same destinations as native links.
   for(const id of ['tld-market-reach','econ-case-ai','economics-concentration','economic-cycles-2026']){
    const destination=inventory.locales[lang].anchors[id];
    await page.goto(new URL(`guides/${lang}/economics/#${id}`,base).href,{waitUntil:'load'});
    await page.waitForURL(url=>url.pathname===new URL(detailURL(lang,destination)).pathname&&url.hash==='#'+id);await ready(page);
    await visibleFragment(page,id);
   }
   // A historical market URL may carry filters without a fragment at all.
   const filtered=new URL(nativeURL(lang));
   for(const [key,value] of Object.entries({market:'zones',origin:'2012',mq:'xyz',marketall:'1'}))filtered.searchParams.set(key,value);
   await page.goto(filtered.href,{waitUntil:'load'});
   await page.waitForURL(url=>url.pathname===new URL(detailURL(lang,'market')).pathname);await ready(page);
   assert.equal(await page.locator('[data-market-view="zones"]').getAttribute('aria-pressed'),'true');
   assert.equal(await page.locator('#market-search').inputValue(),'xyz');
   assert.equal(await page.locator('#market-origin').inputValue(),'2012');
   assert.ok(await page.locator('#market-zones tbody tr:visible').count()>0);
   for(const [key,value] of Object.entries({market:'zones',origin:'2012',mq:'xyz',marketall:'1'}))assert.equal(new URL(page.url()).searchParams.get(key),value,'Market URL state lost: '+key);
   // Language navigation preserves the requested passage on its complete page.
   await page.goto(detailURL(lang,'round-2026','economics-cycles'),{waitUntil:'load'});await ready(page);
   const other=lang==='en'?'it':'en';
   await page.locator(`.discoveryLanguages a[data-language="${other}"]`).click();
   await page.waitForURL(url=>url.pathname===new URL(detailURL(other,'round-2026')).pathname&&url.hash==='#economics-cycles');await ready(page);
   await visibleFragment(page,'economics-cycles');
   assert.equal(await page.locator('html').getAttribute('lang'),other);
   await auditNoScript(browser,lang,width);
   assert.deepEqual(runtimeErrors,[]);result.passed=true;result.legacyFragments=legacy.length;result.completePages=4;result.themes=2;result.noScript=true;
  }catch(error){result.error=error.stack||String(error);report.errors.push(result);try{await page.screenshot({path:path.join(out,lang+'-'+width+'-failure.png')});}catch{}}
  finally{await context.close();report.scenarios.push(result);console.log('ECONOMICS_BROWSER '+JSON.stringify(result));}
 }}finally{await browser.close();fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));}
 if(report.errors.length)process.exitCode=1;
})().catch(error=>{console.error(error);process.exitCode=2;});
