/* Focused axe-core coverage on all 20 main-site sections in four languages and two themes.
 * Runs in real headless Chromium on an audit-only branch.
 */
'use strict';
const {chromium}=require('playwright');
const AxeBuilder=require('@axe-core/playwright').default;
const fs=require('fs');
const base='http://127.0.0.1:8123';
const language=['en','it','de','fr'];
const sections=[...fs.readFileSync('src/index.web.html','utf8').matchAll(/<section class="section" id="([^"]+)"/g)].map(x=>x[1]);
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--disable-dev-shm-usage']});
 const rows=[],summary={pages:0,sections:sections.length,scans:0,critical:0,serious:0,moderate:0,minor:0};
 for(const lang of language){
   const p=await browser.newPage({viewport:{width:1366,height:800}});
   await p.goto(base+'/'+lang+'/',{waitUntil:'load'});
   const tabs=await p.evaluate(()=>[...document.querySelectorAll('.nav [data-target]')].map(x=>x.getAttribute('data-target')));
   const targets=sections.filter(x=>tabs.includes(x));
   for(const theme of ['light','dark']){
     await p.evaluate(d=>{document.documentElement.dataset.theme=d},theme);
     for(const tab of targets){
       await p.evaluate(t=>{let a=document.querySelector('.nav [data-target="'+t+'"]');if(a)a.click()},tab);
       await p.waitForTimeout(10);
       const active=await p.evaluate(t=>{
         let el=document.getElementById(t);
         return {active:!!el?.classList.contains('active'),display:el?getComputedStyle(el).display:'missing'}
       },tab);
       if(!active.active||active.display==='none'){console.log('AUDIT_SECTION_NAV '+JSON.stringify({lang,theme,tab,active}));continue;}
       try{
          let report=await new AxeBuilder({page:p}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
          summary.scans++;
          for(const v of report.violations){
             summary[v.impact]=(summary[v.impact]||0)+1;
             rows.push({lang,theme,tab,id:v.id,impact:v.impact,nodes:v.nodes.length,
                        examples:v.nodes.slice(0,3).map(n=>({target:n.target,summary:n.failureSummary?.slice(0,90)}))});
          }
       }catch(e){console.log('AUDIT_AXE_ERROR '+JSON.stringify({lang,theme,tab,error:e.message.slice(0,200)}));}
     }
   }
   await p.close();summary.pages++;
 }
 await browser.close();
 let unique={};for(const r of rows){
   const k=r.lang+'/'+r.theme+'/'+r.id;let c=unique[k]||(unique[k]={lang:r.lang,theme:r.theme,id:r.id,impact:r.impact,sections:[],totalNodes:0,examples:[]});
   c.sections.push(r.tab);c.totalNodes+=r.nodes;if(c.examples.length<3)c.examples.push(...r.examples.slice(0,3-c.examples.length));
 }
 for(const r of Object.values(unique))console.log('AUDIT_AXE_SUMMARY '+JSON.stringify(r));
 console.log('AUDIT_AXE_RESULT '+JSON.stringify({summary:summary,uniqueRules:[...new Set(rows.map(r=>r.id))],totalViolations:rows.length,groups:Object.values(unique).length}));
})().catch(e=>{console.log('AUDIT_AXE_FATAL '+e.stack);process.exitCode=1});
