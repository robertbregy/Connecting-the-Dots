'use strict';
/* Public APS list CSV discovery. Read-only; may NOT turn this export into a
   canonical ICANN application corpus until record IDs and replacement variants
   are reconciled against the official APS statistics. */
const fs = require('fs');
const path = require('path');
const {chromium} = require('playwright');
const SITE='https://newgtldprogram-aps.icann.org/applications';
const FOLDER=path.resolve('artifacts/aps-probe');
fs.mkdirSync(FOLDER,{recursive:true});
const details={source:SITE,attemptedAt:new Date().toISOString(),status:'unverified',httpStatus:null,buttons:[],links:[],network:[],csvBytes:null,filename:null,reason:null};
const out=()=>{fs.writeFileSync(path.join(FOLDER,'probe.json'),JSON.stringify(details,null,2));console.log('APS_OFFICIAL_EXPORT_PROBE '+JSON.stringify(details));};
(async()=>{
  const browser=await chromium.launch({headless:true,args:['--disable-dev-shm-usage','--no-sandbox']});
  const context=await browser.newContext({acceptDownloads:true,viewport:{width:1420,height:920},locale:'en-US'});
  const page=await context.newPage();
  let responses=0;
  page.on('response',response=>{
    try{
      const u=new URL(response.url());
      if(u.hostname==='newgtldprogram-aps.icann.org'&& responses<70){
        details.network.push({path:u.pathname,status:response.status(),type:response.headers()['content-type']||''});
        responses++;
      }
    }catch{}
  });
  try{
    let response=await page.goto(SITE,{waitUntil:'domcontentloaded',timeout:60000});
    details.httpStatus=response?.status()||0;
    await page.waitForTimeout(14000);
    const dom=await page.evaluate(()=>({
      title:document.title,
      body:document.body?.innerText?.slice(0,3800),
      buttons:[...document.querySelectorAll('button,[role="button"],a[download]')].slice(0,100).map(x=>({
        text:(x.textContent||'').trim().slice(0,100),
        title:x.getAttribute('title')||'',
        aria:x.getAttribute('aria-label')||'',
        outer:x.outerHTML.slice(0,420)
      })),
      links:[...document.querySelectorAll('a[href]')].filter(x=>/csv|download|export/i.test((x.textContent||'')+' '+x.getAttribute('href')+' '+x.getAttribute('title'))).slice(0,20).map(x=>x.href)
    }));
    details.title=dom.title;
    details.visibleText=dom.body;
    details.buttons=dom.buttons.filter(x=>/csv|download|export/i.test(x.text+' '+x.aria+' '+x.title+' '+x.outer)).slice(0,20);
    details.links=dom.links;
    console.log('APS_DISCOVERY '+JSON.stringify({url:page.url(),httpStatus:details.httpStatus,buttons:details.buttons,links:details.links,network:details.network.slice(0,22),bodyPreview:dom.body.slice(0,1300)}));
    await page.screenshot({path:path.join(FOLDER,'aps-page.png'),fullPage:false});
    let candidate=page.locator('button:has-text("Download CSV"),a:has-text("Download CSV"),button[aria-label*="CSV"],[role="button"][aria-label*="CSV"]').first();
    if(await candidate.count()===0){
      candidate=page.getByText('Download CSV',{exact:false}).first();
    }
    if(await candidate.count()===0){
      details.reason='No clickable Download CSV control detected with Playwright';
      return;
    }
    const download=page.waitForEvent('download',{timeout:35000}).catch(()=>null);
    await candidate.click({timeout:20000});
    const dl=await download;
    if(dl){
      details.filename=dl.suggestedFilename();
      const save=path.join(FOLDER,'aps_official_export.csv');
      await dl.saveAs(save);
      const buf=fs.readFileSync(save);
      details.csvBytes=buf.length;
      details.sha256=require('crypto').createHash('sha256').update(buf).digest('hex');
      details.csvPreview=buf.toString('utf8').slice(0,500);
      details.status=buf.length>30000?'downloaded-requires-reconciliation':'downloaded-insufficient-size';
      if(buf.length<=30000)details.reason='Downloaded file is unexpectedly small; do not claim complete official corpus';
    }else{
      details.reason='Download CSV control clicked, but browser did not emit a download within 35s; inspect network results';
    }
  }catch(error){
    details.status='probe-error';
    details.reason=String(error?.message||error).slice(0,1400);
  }finally{
    out();await context.close();await browser.close();
  }
})().catch(e=>{details.status='fatal-error';details.reason=e.stack;out();process.exitCode=1;});
