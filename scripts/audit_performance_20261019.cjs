/* Controlled Chromium measurements, not a field study or Pages network estimate. */
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const base=process.env.CTD_TEST_BASE||'http://127.0.0.1:8123/';
(async()=>{
 const browser=await chromium.launch({headless:true}),runs=[];
 try{for(const tab of ['overview','explore','economics'])for(let repeat=0;repeat<3;repeat++){
  const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'}),page=await context.newPage(),cdp=await context.newCDPSession(page);
  await cdp.send('Network.enable');await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});
  await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:200*1024,uploadThroughput:128*1024,connectionType:'cellular4g'});
  await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
  await page.addInitScript(()=>{window.__auditPerf={lcp:null,layoutShift:0,events:[]};new PerformanceObserver(list=>{const entries=list.getEntries();window.__auditPerf.lcp=entries[entries.length-1]?.startTime||null}).observe({type:'largest-contentful-paint',buffered:true});new PerformanceObserver(list=>{for(const x of list.getEntries())if(!x.hadRecentInput)window.__auditPerf.layoutShift+=x.value}).observe({type:'layout-shift',buffered:true});new PerformanceObserver(list=>{window.__auditPerf.events.push(...list.getEntries().map(x=>x.duration))}).observe({type:'event',buffered:true,durationThreshold:16});});
  await page.goto(base+'it/?tab='+tab,{waitUntil:'load',timeout:90000});
  await page.waitForFunction(()=>!!window.CTD_APP_READY,null,{timeout:90000});
  // A fixed post-load observation window captures late resources and layout.
  await page.waitForTimeout(1500);
  const pre=await page.evaluate(()=>({...window.__auditPerf,resources:performance.getEntriesByType('resource').map(x=>({name:x.name,transferSize:x.transferSize,encodedBodySize:x.encodedBodySize})),navigation:performance.getEntriesByType('navigation')[0]?.toJSON()}));
  const button=page.locator('#themeBtn');await button.click();await page.waitForTimeout(200);
  const interaction=await page.evaluate(()=>Math.max(0,...window.__auditPerf.events));
  assert.ok(Number.isFinite(pre.lcp)&&pre.lcp>0,'No usable LCP observation; do not report an invented timing');
  assert.ok(pre.lcp<12000,'Requested chapter exceeds the controlled lab visibility budget: '+pre.lcp);
  const graph=pre.resources.some(r=>r.name.includes('/data/aps_2026_application_graph.js'));
  assert.equal(graph,false,'A basic name search should not load the optional graph');
  const bytes=pre.resources.reduce((n,r)=>n+r.transferSize,0)+(pre.navigation?.transferSize||0);
  assert.ok(bytes<5_500_000,'Cold-load transfer budget exceeded: '+bytes);
  runs.push({tab,repeat:repeat+1,lcp_ms:pre.lcp,cls:pre.layoutShift,max_observed_event_ms:interaction,transferred_bytes:bytes,optional_graph_loaded:graph,dom_content_loaded_ms:pre.navigation?.domContentLoadedEventEnd});
  await context.close();
 }}finally{await browser.close()}
 const median=xs=>[...xs].sort((a,b)=>a-b)[Math.floor(xs.length/2)];
 const summary=['overview','explore','economics'].map(tab=>{const rows=runs.filter(x=>x.tab===tab);return {tab,median_lcp_ms:median(rows.map(x=>x.lcp_ms)),median_cls:median(rows.map(x=>x.cls)),median_bytes:median(rows.map(x=>x.transferred_bytes)),min_lcp_ms:Math.min(...rows.map(x=>x.lcp_ms)),max_lcp_ms:Math.max(...rows.map(x=>x.lcp_ms))}});
 const report={version:JSON.parse(fs.readFileSync('publication.json','utf8')).version,environment:base.startsWith('https://robertbregy.github.io/')?'GitHub Actions Chromium against published GitHub Pages; controlled synthetic measurement, not field data':'GitHub Actions Chromium against local Python HTTP server; uncompressed responses, not production or field data',conditions:{cache:'cold, disabled',viewport:'390x844',latency_ms:150,download_bytes_per_second:204800,upload_bytes_per_second:131072,cpu_slowdown:4,repeats:3,post_load_observation_ms:1500},limitations:['LCP is a controlled lab observation, not a field percentile.','max_observed_event_ms is the observed theme-toggle event duration, not field INP.',base.startsWith('https://robertbregy.github.io/')?'Published Pages transfer sizes under this controlled test; not visitor field percentiles.':'Uncompressed local responses are not actual GitHub Pages transfer sizes.'],budget:{cold_transfer_bytes:5500000,lab_lcp_ceiling_ms:12000,home_must_not_load_APS_graph:true},summary,runs};
 fs.mkdirSync('audit-20261019',{recursive:true});fs.writeFileSync('audit-20261019/performance.json',JSON.stringify(report,null,2));
 console.log('AUDIT_20261019_PERFORMANCE',JSON.stringify(summary));
})().catch(e=>{console.error(e);process.exitCode=1});
