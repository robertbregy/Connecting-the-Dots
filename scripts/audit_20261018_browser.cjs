#!/usr/bin/env node
'use strict';
// Focused acceptance checks for the 18 October audit corrections. The expected
// application sets and applicant totals come from archived CSVs, not app.js.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const assert=require('node:assert/strict');
let chromium;
try{({chromium}=require('playwright'));}
catch(error){if(error.code!=='MODULE_NOT_FOUND')throw error;({chromium}=require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));}
const root=path.resolve(__dirname,'..');
const base=(process.env.CTD_TEST_BASE||'http://127.0.0.1:8128/').replace(/\/?$/,'/');
const out=process.env.CTD_AUDIT_OUTPUT||path.join(os.tmpdir(),'ctd-audit-20261018');
const languages=(process.env.CTD_AUDIT_LANGUAGES||'it,en,de,fr').split(',');
const widths=(process.env.CTD_AUDIT_WIDTHS||'390,1440').split(',').map(Number);
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const pub=JSON.parse(read('publication.json')),translations=JSON.parse(read('data/translations.json'));
function csvRows(text){
 const rows=[];let row=[],cell='',quoted=false;
 text=text.replace(/^\uFEFF/,'');
 for(let i=0;i<text.length;i++){
  const char=text[i];
  if(quoted){if(char==='"'){if(text[i+1]==='"'){cell+='"';i++;}else quoted=false;}else cell+=char;}
  else if(char==='"')quoted=true;
  else if(char===','){row.push(cell);cell='';}
  else if(char==='\n'||char==='\r'){
   if(char==='\r'&&text[i+1]==='\n')i++;
   row.push(cell);if(row.some(value=>value!==''))rows.push(row);row=[];cell='';
  }else cell+=char;
 }
 assert.equal(quoted,false,'Unclosed CSV field');
 if(cell||row.length){row.push(cell);rows.push(row);}
 const headers=rows.shift();assert.ok(headers?.length,'CSV header missing');
 assert.equal(new Set(headers).size,headers.length,'Duplicate CSV header');
 return rows.map(values=>{assert.equal(values.length,headers.length,'CSV column count');return Object.fromEntries(headers.map((key,i)=>[key,values[i]]));});
}
const inventory=csvRows(read('data/applications_2026_strings_reveal.csv'));
const expected2026=[...new Set(inventory.map(row=>'.'+row.string.replace(/^\./,'').toLowerCase()))].sort();
const applications=csvRows(read('data/applications_2026_aps_official_listing.csv')).filter(row=>!row['Application ID'].endsWith('-R'));
assert.equal(new Set(applications.map(row=>row['Application ID'])).size,applications.length,'Repeated APS base ID');
const applicantCounts=new Map();
for(const row of applications)applicantCounts.set(row['Applicant Name'],(applicantCounts.get(row['Applicant Name'])||0)+1);
const [expectedTopName,expectedTopCount]=[...applicantCounts].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]))[0];
const paths=['ia-understand','ia-explore','ia-stories','ia-outcomes','ia-round','ia-research'];
const luganoGroups=[['lugano-status-sources','luganoSectionStatusTitle'],['lugano-governance-decisions','luganoSectionGovernanceTitle'],['lugano-uses-results','luganoSectionUsesTitle'],['lugano-risks-checks','luganoSectionRisksTitle']];
const report={kind:'18 October audit browser acceptance',base,version:pub.version,expected2026Names:expected2026.length,expectedTopApplicant:{name:expectedTopName,applications:expectedTopCount},scenarios:[],issues:[]};
fs.mkdirSync(out,{recursive:true});
async function settle(page){await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));}
async function goto(page,language,query=''){
 const response=await page.goto(base+language+'/'+query,{waitUntil:'load',timeout:40000});
 // Playwright returns no Response for a same-document hash navigation.
 if(response)assert.equal(response.status(),200,'Native page HTTP status');
 await page.waitForFunction(()=>window.DOT_DATA?.explorerMeta?.runtimeExternalEnrichmentLoaded===true,null,{timeout:15000});
 await settle(page);
}
async function click(page,locator){await locator.evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));await locator.click();await settle(page);}
async function anchorVisible(page,selector){
 await settle(page);
 const result=await page.locator(selector).evaluate(target=>{
  const closed=[];for(let node=target;node;node=node.parentElement)if(node.tagName==='DETAILS'&&!node.open)closed.push(node.id||node.className);
  const bounds=target.getBoundingClientRect();
  const bars=[...document.querySelectorAll('.topbar,.iaPrimaryNav,.nav,.mobileNavWrap')].filter(node=>{const style=getComputedStyle(node);return style.display!=='none'&&['sticky','fixed'].includes(style.position);});
  const bottom=Math.max(0,...bars.map(node=>node.getBoundingClientRect().bottom).filter(value=>value>0));
  return {closed,top:bounds.top,width:bounds.width,height:bounds.height,viewport:innerHeight,barBottom:bottom};
 });
 assert.deepEqual(result.closed,[],selector+' remains inside a closed disclosure');
 assert.ok(result.width>0&&result.height>0,selector+' is not rendered');
 assert.ok(result.top>=result.barBottom-4&&result.top<result.viewport-8,selector+' is obscured or outside the viewport: '+JSON.stringify(result));
}
async function downloadCSV(page,requests){
 const before=requests.length;
 const pending=page.waitForEvent('download',{timeout:15000});
 await click(page,page.locator('#explorerExport'));
 const download=await pending;
 assert.equal(await download.failure(),null,'CSV download failed');
 const stream=await download.createReadStream();assert.ok(stream,'CSV download has no readable stream');
 const chunks=[];for await(const chunk of stream)chunks.push(chunk);
 await settle(page);
 assert.deepEqual(requests.slice(before),[],'Export fetched HTTP resources instead of using the visible dataset');
 return {rows:csvRows(Buffer.concat(chunks).toString('utf8')),filename:download.suggestedFilename()};
}
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--disable-dev-shm-usage']});
 try{
  for(const language of languages)for(const width of widths){
   const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce',colorScheme:'light',acceptDownloads:true});
   const page=await context.newPage(),errors=[],requests=[];
   page.on('pageerror',error=>errors.push(error.message));
   page.on('request',request=>{if(/^https?:/.test(request.url()))requests.push(request.url());});
   const scenario={language,width,checks:[]};
   try{
    await goto(page,language);
    const tocIdentity=await page.evaluate(()=>{
     const ids=()=>[...document.querySelectorAll('[id]')].map(node=>node.id);
     const before=ids();renderSectionTocs();renderSectionTocs();const after=ids();
     return {before,after,duplicates:after.filter((id,index)=>after.indexOf(id)!==index)};
    });
    assert.deepEqual(tocIdentity.duplicates,[],'TOC must not create duplicate IDs');
    assert.deepEqual(tocIdentity.after,tocIdentity.before,'Repeated TOC rendering must preserve every existing ID');
    scenario.checks.push('unique and stable IDs after repeated TOC rendering');
    assert.deepEqual(await page.locator('.iaHomeJumpList a').evaluateAll(links=>links.map(link=>link.dataset.openSection)),paths,'Home must expose all six journeys in navigation order');
    for(const area of paths){
     await click(page,page.locator('.iaHomeJumpList a[data-open-section="'+area+'"]'));
     await page.locator('#'+area+'.section.active').waitFor({state:'visible'});
     assert.equal(await page.locator('.iaPrimaryLink[aria-current="location"]').getAttribute('data-b2-area'),area,'Home entry activates wrong primary area');
     await click(page,page.locator('.brand'));
     await page.locator('#overview.section.active').waitFor({state:'visible'});
    }
    scenario.checks.push('six actionable Home journeys');

    await goto(page,language,'?tab=lugano');
    assert.equal(await page.locator('#lugano > .authorDisclosure').count(),1,'Author role disclosure must appear once');
    assert.equal(await page.locator('#lugano > .luganoChapter').count(),4,'Lugano must have four main groups');
    for(const [id,key] of luganoGroups){assert.equal(await page.locator('#'+id+' > h2').innerText(),translations[language][key]);assert.ok(await page.locator('#'+id).isVisible());}
    assert.ok((await page.locator('#lugano-status-sources').innerText()).includes('CDL2651T-T31516'),'Application identity lost');
    for(const id of ['lugano-public-commons','lugano-verifiable-services','lugano-use-before-scale','lugano-external-reading'])assert.equal(await page.locator('#lugano #'+id).count(),1,'Preserved argument missing: '+id);
    assert.ok(await page.locator('#lugano-status-sources a[href*="lugano.ch"]').count()>0,'Official City source lost');
    assert.ok(await page.locator('#lugano-status-sources a[href*="newgtldprogram-aps.icann.org"]').count()>0,'Official application source lost');
    const contextDetail=page.locator('#lugano-governance-decisions details.editorialDetails');
    assert.equal(await contextDetail.getAttribute('open'),null,'Context should begin collapsed');
    await contextDetail.locator('summary').focus();await page.keyboard.press('Enter');
    assert.equal(await contextDetail.evaluate(node=>node.open),true,'Lugano disclosure is not keyboard operable');
    assert.ok(await page.locator('#lugano [data-i18n="luganoWhyTitle"]').isVisible(),'Original motivations lost inside consolidation');
    scenario.checks.push('four Lugano groups, identity, sources and keyboard disclosure');

    await goto(page,language,'?tab=lugano#luganoRoadmap');
    await anchorVisible(page,'#luganoRoadmap');
    await goto(page,language,'?tab=economics#economy-sectors');
    await anchorVisible(page,'#economy-sectors');
    await goto(page,language,'?tab=economics');
    assert.equal(await page.locator('#economics details.historicalEconomy').getAttribute('open'),null);
    const heading=page.locator('#economy-sectors h2').first(),headingId=await heading.getAttribute('id');
    assert.ok(headingId,'Historical comparison has no TOC target');
    await click(page,page.locator('#economics .sectionToc a[href$="#'+headingId+'"]'));
    await anchorVisible(page,'#'+headingId);
    assert.equal(await page.evaluate(()=>document.activeElement?.id),headingId,'TOC focus did not follow the opened chapter');
    scenario.checks.push('direct links and TOC reveal nested content');

    await goto(page,language,'?tab=geography');
    const checkTop=async()=>{
     const value=await page.locator('#identity2026TopValue').innerText();
     assert.equal(Number(value.replace(/[^0-9]/g,'')),expectedTopCount,'APS legal-applicant count overwritten at runtime');
     assert.equal((await page.locator('#identity2026TopName').innerText()).trim(),expectedTopName,'APS legal-applicant name overwritten at runtime');
     assert.equal(await page.locator('#identity2026TopState').isVisible(),false,'Unavailable badge still covers derived APS value');
    };
    await checkTop();await click(page,page.locator('#themeBtn'));await checkTop();
    assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
    scenario.checks.push('source-derived APS top applicant survives runtime and theme toggle');

    await goto(page,language,'?tab=explore&round=2026');
    assert.equal(await page.locator('#exploreRoundFilter').inputValue(),'2026');
    assert.equal(await page.locator('#explorerTableBody tr[data-explorer-index]').count(),50,'Test must exercise a paginated view');
    const first=await downloadCSV(page,requests);
    assert.deepEqual(first.rows.map(row=>row.ascii_string).sort(),expected2026,'Filtered export differs from archived 2026 name inventory');
    assert.ok(first.filename.includes(pub.version),'CSV filename lacks publication version');
    for(const row of first.rows){
     assert.equal(row.site_version,pub.version);assert.equal(row.data_pack_version,pub.currentDataPackVersion);
     assert.equal(row.result_count,String(expected2026.length));assert.equal(JSON.parse(row.filter_state_json).round,'2026');
     assert.equal(JSON.parse(row.filter_state_json).language,language);
     assert.ok(JSON.parse(row.sources).length>0,'Source omitted for '+row.string);
     assert.ok(JSON.parse(row.source_scope).includes('frozen-secondary-2026-string-inventory'),'Inventory provenance missing for '+row.string);
     assert.ok(row.source_date&&row.source_date_role,'Source date lacks a defined role for '+row.string);
     assert.ok(row.exported_at_utc&&row.root_status_as_of,'Export and record dates missing');
    }
    const agent=first.rows.find(row=>row.ascii_string==='.agent'),lugano=first.rows.find(row=>row.ascii_string==='.lugano');
    assert.ok(agent&&lugano,'Representative application-only names omitted');
    assert.equal(agent.secondary_2026_snapshot,'2026-10-07');
    assert.ok(JSON.parse(lugano.sources).some(url=>url.includes('newgtldprogram-aps.icann.org')),'The independently verified Lugano source is absent from the export');
    await page.locator('#explorerSearch').fill('.lugano');
    const second=await downloadCSV(page,requests);
    assert.deepEqual(second.rows.map(row=>row.ascii_string),['.lugano'],'Export reused stale filter results');
    assert.equal(JSON.parse(second.rows[0].filter_state_json).q,'.lugano');
    await page.locator('#explorerSearch').fill('ctd-audit-no-such-name-20261018');
    assert.equal(await page.locator('#explorerExport').isDisabled(),true,'Empty export should be unavailable');
    assert.ok(!(await page.locator('#explorerUniverseNote').innerText()).includes('{'),'Unresolved universe placeholder');
    scenario.checks.push('all filtered names exported with provenance, no fetch, current filters and empty state');
    scenario.exportedNames=first.rows.length;

    await goto(page,language,'?tab=resources');
    assert.deepEqual(await page.locator('#resources .resourceGroup > h3').allInnerTexts(),['resourcesOfficialTitle','resourcesDerivedTitle','resourcesArchivesTitle'].map(key=>translations[language][key]));
    const current=page.locator('#resources a.downloadCard').filter({has:page.locator('[data-i18n="downloadPack"]')});
    assert.ok((await current.getAttribute('href')).endsWith(pub.currentDataPackPath),'Current data-pack link is stale');
    assert.ok((await current.innerText()).includes(pub.currentDataPackVersion),'Current data-pack label is stale');
    const overflow=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,viewport:innerWidth}));
    assert.ok(overflow.scroll<=overflow.viewport+3,'Horizontal overflow: '+JSON.stringify(overflow));
    assert.deepEqual(errors,[],'Browser runtime errors');
    scenario.checks.push('resource groups and current data-pack version');
    scenario.status='passed';
   }catch(error){
    scenario.status='failed';scenario.error=error.stack||String(error);report.issues.push({language,width,error:scenario.error});
    const screenshot=path.join(out,language+'-'+width+'-failure.png');
    try{await page.screenshot({path:screenshot,fullPage:false});scenario.screenshot=screenshot;}catch{}
   }finally{report.scenarios.push(scenario);await context.close();}
   console.log('AUDIT_20261018_SCENARIO '+JSON.stringify({language,width,status:scenario.status,checks:scenario.checks.length,error:scenario.error?.split('\n')[0]}));
  }
 }finally{await browser.close();}
 report.completedAt=new Date().toISOString();
 fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');
 console.log('AUDIT_20261018_BROWSER_QA '+JSON.stringify({scenarios:report.scenarios.length,passed:report.scenarios.filter(s=>s.status==='passed').length,issues:report.issues.length,report:path.join(out,'report.json')}));
 if(report.issues.length)process.exitCode=1;
})().catch(error=>{console.error(error.stack||error);process.exitCode=2;});
