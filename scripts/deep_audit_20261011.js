'use strict';
/* Independent read-only audit on GitHub-hosted Chromium; not deployed to site. */
const fs=require('fs'),path=require('path');
const {chromium}=require('playwright');
const {URL}=require('url');
const languages=['it','en','de','fr'];
const prefix='https://robertbregy.github.io/Connecting-the-Dots';
const base='http://127.0.0.1:8123';
const issues=[],counts={routes:0,navChecks:0,profileChecks:0,overflowChecks:0,axeChecks:0,checkedLinks:0,liveChecks:0,locales:4};
function finding(level,kind,where,message,extra){
 const v={level,kind,where,message,extra:extra||{}};
 issues.push(v); console.log('INDEPENDENT_AUDIT '+JSON.stringify(v));
}
function check(ok,level,kind,where,message,extra){if(!ok)finding(level,kind,where,message,extra)}
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--disable-dev-shm-usage']});
 const sitemap=fs.readFileSync('sitemap.xml','utf8');
 const routes=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(x=>x[1].replace(prefix,''));
 const snapshot=JSON.parse(fs.readFileSync('data/application_2026_snapshot.json','utf8'));
 const pub=JSON.parse(fs.readFileSync('publication.json','utf8'));
 const manifest=JSON.parse(fs.readFileSync('data/manifest.json','utf8'));
 const trans=JSON.parse(fs.readFileSync('data/translations.json','utf8'));
 counts.routes=routes.length;
 check(routes.length>=30,'HIGH','SITEMAP','sitemap','Sitemap too small',{count:routes.length});
 for(const route of routes){
    const disk=route.endsWith('/')?route.slice(1)+'index.html':route.slice(1);
    check(fs.existsSync(disk),'HIGH','ROUTE_MISSING',route,'Sitemap route missing',{disk});
 }
 const references=[...fs.readFileSync('src/index.web.html','utf8').matchAll(/data-i18n="([^"]+)"/g)].map(x=>x[1]);
 for(const lang of languages){
   const missing=[...new Set(references)].filter(k=>!(k in trans[lang])||!String(trans[lang][k]).trim());
   check(!missing.length,'HIGH','MISSING_TRANSLATION',lang,'Missing i18n keys',{count:missing.length,examples:missing.slice(0,12)});
 }
 check(pub.version===manifest.version,'HIGH','VERSION', 'repository','Publication and manifest mismatch');
 check(pub.researchRelease==='RR2' && pub.doi==='10.5281/zenodo.23288603','HIGH','RELEASE','repository','Research identity changed unexpectedly');
 check(snapshot.official.activeApplications===1615 && snapshot.stringInventory.representedPrimaryApplications===1608,'HIGH','APS','repository','APS counts unexpected');
 // Historical data pack is intentionally pinned and explicitly labelled in Dataset distributions.
 for(const lang of languages){
   const html=fs.readFileSync(lang+'/index.html','utf8');
   let meta=[...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)].map(x=>x[1]);
   for(const raw of meta){
     try{const j=JSON.parse(raw);if(j['@type']==='Dataset'){
       const dist=Array.isArray(j.distribution)?j.distribution:[j.distribution].filter(Boolean);
       const zip=dist.filter(x=>String(x.contentUrl||'').includes('connecting-the-dots-data-pack.zip'));
       const csv=dist.filter(x=>String(x.contentUrl||'').includes('/data/tld_universe.csv'));
       check(zip.length===1&&zip[0].version===pub.dataPackageVersion&&csv.length===1&&csv[0].version===pub.version,'HIGH','STRUCTURED_DATA_VERSION',lang,'Current CSV and frozen historical ZIP versions differ by design',{zip:zip.map(x=>x.version),csv:csv.map(x=>x.version)});
     }
     }catch(e){finding('HIGH','BROKEN_JSONLD',lang,e.message.slice(0,140));}
   }
 }
 const paper=fs.readFileSync('research/connecting-the-dots-working-paper-v1.md','utf8');
 check(paper.includes('## Suggested citation for RR2')&&paper.includes('zenodo.23262623'),'HIGH','PAPER_IDENTITY','research','Current RR2 and preceding RR1 must both be cited');
 const ctx=await browser.newContext({viewport:{width:1360,height:840}});
 const page=await ctx.newPage();
 for(const route of routes){
   const r=await page.goto(base+route,{waitUntil:'domcontentloaded',timeout:25000});
   check(r && r.status()===200,'HIGH','HTTP',route,'Sitemap page does not return 200',{code:r?.status()});
   const audit=await page.evaluate(()=>{
     const ids=[...document.querySelectorAll('[id]')].map(el=>el.id);
     const dups=[...new Set(ids.filter((id,i)=>ids.indexOf(id)!==i))];
     const wrongLinks=[...document.querySelectorAll('a[target="_blank"]')].filter(el=>!el.rel.includes('noopener')).map(el=>el.href).slice(0,5);
     const brokenAnchors=[...document.querySelectorAll('a[href^="#"]')].filter(el=>{let v=decodeURIComponent(el.getAttribute('href').slice(1));return v && !document.getElementById(v)}).map(el=>el.getAttribute('href')).slice(0,10);
     return {dups,wrongLinks,brokenAnchors,title:document.title,h1:document.querySelectorAll('h1').length,lang:document.documentElement.lang,canonical:[...document.querySelectorAll('link[rel="canonical"]')].map(x=>x.href)};
   });
   check(!audit.dups.length,'HIGH','DUPLICATE_ID',route,'Duplicate ids in DOM',{examples:audit.dups.slice(0,10)});
   check(!audit.wrongLinks.length,'HIGH','TARGET_BLANK',route,'Missing noopener on external link',{examples:audit.wrongLinks});
   check(audit.h1===1,'MED','H1',route,'Expected one h1',{count:audit.h1});
   check(audit.canonical.length===1,'MED','CANONICAL',route,'Invalid canonical count',{urls:audit.canonical});
   if(audit.brokenAnchors.length)finding('MED','BROKEN_FRAGMENT',route,'Fragment links have no matching element',{fragments:audit.brokenAnchors});
   const lang=route.match(/\/(it|en|de|fr)\//);
   if(lang && /^\/(it|en|de|fr)\//.test(route))check(audit.lang===lang[1],'MED','LANG',route,'Incorrect document lang',{value:audit.lang});
   const localLinks=await page.evaluate(()=>[...document.querySelectorAll('a[href],script[src],link[href],img[src]')].map(el=>el.href||el.src).filter(x=>x && x.startsWith('http://127.0.0.1:8123/')));
   for(const link of [...new Set(localLinks)]){
     const u=new URL(link);let file=u.pathname.slice(1);
     file=decodeURIComponent(file);
     if(!file || file.endsWith('/'))file+='index.html';
     if(!path.extname(file) && !fs.existsSync(file))file+='/index.html';
     counts.checkedLinks++;
     check(fs.existsSync(file),'HIGH','BROKEN_LOCAL_ASSET',route,'Linked local file missing',{href:link,file});
   }
 }
 await page.close(); await ctx.close();
 for(const lang of languages){
  for(const width of [320,390,768,1360]){
   const mobile=width<800;
   const context=await browser.newContext({viewport:{width,height:812},isMobile:mobile,hasTouch:mobile});
   const p=await context.newPage();
   const errors=[];p.on('pageerror',e=>errors.push(e.message));
   await p.goto(base+'/'+lang+'/',{waitUntil:'load',timeout:25000});
   const targets=await p.evaluate(mobile=>{
      return mobile?[...document.querySelectorAll('#mobileNav option')].map(x=>x.value).filter(Boolean):
      [...new Set([...document.querySelectorAll('.nav [data-target]')].map(x=>x.dataset.target))].filter(Boolean);
   },mobile);
   for(const tab of targets){
      counts.navChecks++;
      try{
       if(mobile){
         // Preserve the original 26-option shortcut layer in IA B2: open before each selection.
         await p.locator('#iaLegacyNavDisclosure').evaluate(el=>{el.open=true});
         await p.locator('#mobileNav').selectOption(tab,{timeout:3000});
       }
       else await p.evaluate(tab=>{const e=[...document.querySelectorAll('.nav [data-target]')].find(x=>x.dataset.target===tab);if(e)e.click();},tab);
       await p.waitForTimeout(30);
       const d=await p.evaluate(()=>({
          active:[...document.querySelectorAll('section.section.active')].map(x=>x.id),
          width:document.documentElement.clientWidth,
          scroll:document.documentElement.scrollWidth,
          headings:[...document.querySelectorAll('section.section.active h1,section.section.active h2')].map(x=>x.textContent.trim()).filter(Boolean).slice(0,2),
          text:document.querySelector('section.section.active')?.innerText?.length||0
       }));
       check(d.active.length===1 && d.active[0]===tab.split('#')[0],'HIGH','NAVIGATION',lang+'/'+tab,'Navigation fails',{width,active:d.active});
       check(d.text>30,'MED','EMPTY_TAB',lang+'/'+tab,'Active section unexpectedly empty',{width,text:d.text});
       counts.overflowChecks++;
       check(d.scroll<=d.width+3,'HIGH','HORIZONTAL_OVERFLOW',lang+'/'+tab,'Horizontal scroll beyond viewport',{width,content:d.scroll,viewport:d.width});
      }catch(e){finding('HIGH','NAV_EXCEPTION',lang+'/'+tab,e.message.slice(0,250),{width});}
   }
   check(!errors.length,'HIGH','CLIENT_ERROR',lang,'Client JS exceptions',{width,errors:errors.slice(0,6)});
   for(const tab of ['economics','explore','research','behind-round']){
      try{
        if(mobile){
          await p.locator('#iaLegacyNavDisclosure').evaluate(el=>{el.open=true});
          await p.locator('#mobileNav').selectOption(tab,{timeout:2500});
        }
        else await p.evaluate(tab=>{let x=[...document.querySelectorAll('.nav [data-target]')].find(e=>e.dataset.target===tab);x?.click()},tab);
        const view=await p.evaluate(tab=>{const s=document.getElementById(tab);const vis=s?.classList.contains('active'); const empty=[...(s?.querySelectorAll('[data-i18n]')||[])].filter(el=>{const cs=getComputedStyle(el);return cs.display!=='none'&&cs.visibility!=='hidden'&&!el.textContent.trim()&&!el.children.length;}).slice(0,10).map(x=>x.dataset.i18n);return {visible:vis,empty};},tab);
        check(view.visible,'HIGH','SECTION_MISSING',lang+'/'+tab,'Important section hidden',{width});
        if(view.empty.length)finding('MED','EMPTY_I18N',lang+'/'+tab,'Visible i18n elements have no rendered text',{width,keys:view.empty});
        if(width===320 || width===1360){
          await p.screenshot({path:'audit-independent-'+lang+'-'+width+'-'+tab+'.png',fullPage:false});
          const AxeBuilder=require('@axe-core/playwright').default;
          const ax=await new AxeBuilder({page:p}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
          counts.axeChecks++;
          const viol=ax.violations.filter(x=>['critical','serious','moderate'].includes(x.impact)).map(x=>({id:x.id,impact:x.impact,nodes:x.nodes.length,target:x.nodes?.[0]?.target}));
          if(viol.length)finding('HIGH','WCAG',lang+'/'+tab,'Accessibility violations',{width,violations:viol.slice(0,8)});
        }
      }catch(e){finding('HIGH','SECTION_TEST',lang+'/'+tab,e.message.slice(0,220),{width});}
   }
   await p.close();await context.close();
  }
 }

 // Exercise the actual Explorer product, including filters, lazy shards, drawer and keyboard exit.
 for(const lang of languages){
   for(const width of [390,1360]){
     const ctxE=await browser.newContext({viewport:{width,height:850},isMobile:width<800,hasTouch:width<800});
     const ep=await ctxE.newPage();
     const bad=[];
     ep.on('pageerror',e=>bad.push(e.message));
     try{
       await ep.goto(base+'/'+lang+'/?tab=explore',{waitUntil:'load',timeout:30000});
       const ready=await ep.evaluate(()=>({
         count:typeof D==='undefined'?0:D.explorer?.length||0,
         section:document.querySelector('section.section.active')?.id,
         overlay:window.CTD2026_STRING_SNAPSHOT?.data?.rows?.length||0,
         merged:typeof D==='undefined'?false:D.explorerMeta?.application2026StringCoverageComplete===true,
         inventoryCount:typeof D==='undefined'?0:D.explorerMeta?.application2026StringCount||0
       }));
       counts.profileChecks++;
       check(ready.count===2788 && ready.section==='explore' && ready.overlay===980 && ready.merged && ready.inventoryCount===980,
         'HIGH','EXPLORER_LOADED',lang,'Explorer base counts not loaded',{width,ready});
       const input=ep.locator('#explorerSearch');
       for(const term of ['lugano','com','cat']){
         await input.fill(term);
         await ep.waitForTimeout(120);
         const rows=await ep.evaluate(()=>({count:[...document.querySelectorAll('#explorerTableBody [data-explorer-open]')].length,
           text:document.getElementById('explorerResultCount')?.textContent}));
         counts.profileChecks++;
         check(rows.count>0,'HIGH','EXPLORER_SEARCH',lang+'/'+term,'Search returned no results',{width,rows});
         if(term==='lugano' && rows.count>0){
           const selector=width<800?'#explorerCards [data-explorer-open]':'#explorerTableBody [data-explorer-open]';
           await ep.locator(selector).first().click({timeout:5000});
           await ep.waitForTimeout(600);
           const drawer=await ep.evaluate(()=>({
             visible:document.getElementById('explorerDrawer')?.classList.contains('open'),
             title:document.getElementById('profileTitle')?.innerText,
             html:document.getElementById('drawerContent')?.innerText?.length||0,
             loading:document.getElementById('drawerContent')?.getAttribute('aria-busy'),
             hasError:!!document.getElementById('profileRetry'),
             active:document.activeElement?.id
           }));
           counts.profileChecks++;
           check(drawer.visible && !drawer.hasError && drawer.html>100 && !drawer.loading,
             'HIGH','EXPLORER_RECORD',lang,'Lazy TLD detail not loaded',{width,drawer});
           if(drawer.visible){
             await ep.screenshot({path:'audit-independent-profile-'+lang+'-'+width+'.png',fullPage:false});
             await ep.keyboard.press('Escape');
             const closed=await ep.evaluate(()=>!document.getElementById('explorerDrawer')?.classList.contains('open'));
             counts.profileChecks++;
             check(closed,'HIGH','EXPLORER_MODAL',lang,'Escape did not close detail modal',{width});
           }
         }
       }
       await input.fill('');
       await ep.locator('#explorerAdvanced').evaluate(el=>{el.open=true;});
       await ep.locator('#exploreRoundFilter').selectOption('2026',{timeout:3500});
       const filter=await ep.evaluate(()=>({count:document.querySelectorAll('#explorerTableBody [data-explorer-open]').length,
         text:document.getElementById('explorerResultCount')?.textContent}));
       counts.profileChecks++;
       check(filter.count>0,'HIGH','EXPLORER_2026_FILTER',lang,'2026 filter returned no rows',{width,filter});
       await ep.locator('#resetExplorer').click();
       const reset=await ep.evaluate(()=>({query:document.getElementById('explorerSearch')?.value,
         year:document.getElementById('exploreRoundFilter')?.value}));
       check(reset.query==='' && reset.year==='all','HIGH','EXPLORER_RESET',lang,'Reset did not clear search and round filter',{width,reset});
     }catch(e){finding('HIGH','EXPLORER_TEST_EXCEPTION',lang,e.message.slice(0,300),{width});}
     if(bad.length)finding('HIGH','EXPLORER_RUNTIME_ERROR',lang,'JavaScript errors while using Explorer',{width,errors:bad.slice(0,4)});
     await ep.close();await ctxE.close();
   }
 }
 // Structural regression: two Economics panels must not leak onto other tabs.
 for(const language of languages){
   const c=await browser.newContext({viewport:{width:390,height:812}});
   const p=await c.newPage();
   for(const tab of ['overview','social','economics','explore','behind-round']){
     await p.goto(base+'/'+language+'/?tab='+tab,{waitUntil:'load',timeout:25000});
     const actual=await p.evaluate(()=>({active:document.querySelector('section.section.active')?.id,
       panels:['economic-cycles-2026','gtld-cemetery'].map(id=>{
         const el=document.getElementById(id),rect=el?.getBoundingClientRect();
         return {id,parent:el?.closest('section.section')?.id,visible:!!rect&&rect.width>0&&rect.height>0};
       })}));
     check(actual.active===tab&&actual.panels.every(x=>x.parent==='economics'&&x.visible===(tab==='economics')),
       'HIGH','ORPHAN_PANELS',language+'/'+tab,'Economics panels leaked outside their section',{actual});
   }
   await p.close();await c.close();
 }
 // The live website is checked independently of GitHub Pages build status.
 const liveContext=await browser.newContext({viewport:{width:1280,height:840}});
 const lpage=await liveContext.newPage();
 for(const route of ['/it/','/en/','/research/','/behind-the-round/it/','/inside-the-round/it/']){
   counts.liveChecks++;
   try{
     const res=await lpage.goto(prefix+route,{waitUntil:'domcontentloaded',timeout:18000});
     const details=await lpage.evaluate(()=>({title:document.title,version:document.querySelector('meta[name="ctd-version"]')?.content||null,body:document.body?.innerText?.length}));
     check(res && res.status()===200,'HIGH','LIVE_HTTP',route,'Public site does not return 200',{status:res?.status()});
     check(details.body>100,'HIGH','LIVE_CONTENT',route,'Public site missing content',details);
     if(['it/','en/'].includes(route.slice(1))&&details.version!==pub.version) console.log('STAGING_LIVE_VERSION '+JSON.stringify({route,published:details.version,branch:pub.version}));
   }catch(e){finding('HIGH','LIVE_UNREACHABLE',route,e.message.slice(0,250));}
 }
 await lpage.close();await liveContext.close();
 await browser.close();
 const summary={commit:process.env.GITHUB_SHA,version:pub.version,routes:counts.routes,checks:counts,issues:issues.length,levels:issues.reduce((o,x)=>(o[x.level]=(o[x.level]||0)+1,o),{}),items:issues.slice(0,70)};
 fs.writeFileSync('audit-independent-20261011.json',JSON.stringify(summary,null,2));
 console.log('INDEPENDENT_AUDIT_RESULT '+JSON.stringify(summary));
 if(issues.some(x=>x.level==='HIGH'))process.exitCode=2;
})().catch(e=>{console.error('INDEPENDENT_AUDIT_FATAL '+e.stack);process.exitCode=3;});
