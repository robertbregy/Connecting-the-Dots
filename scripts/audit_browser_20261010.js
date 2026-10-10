/* Browser QA, executed on GitHub Actions audit branch, never on visitors' browsers. */
'use strict';
const {chromium}=require('playwright');
const AxeBuilder=require('@axe-core/playwright').default;
const fs=require('fs');
const base='http://127.0.0.1:8123';
const locales=['en','it','de','fr'];
const issues=[];
function log(level,cat,route,message,extra={}){
 const x={severity:level,category:cat,route:route,message:message,...extra};issues.push(x);console.log('AUDIT '+JSON.stringify(x));
}
function assert(ok,level,cat,route,msg,extra){if(!ok)log(level,cat,route,msg,extra)}
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--disable-dev-shm-usage']});
 const profiles=[
  {id:'desktop',width:1440,height:900,mobile:false},
  {id:'laptop',width:1024,height:768,mobile:false},
  {id:'tablet',width:768,height:1024,mobile:true},
  {id:'mobile',width:390,height:844,mobile:true},
  {id:'small',width:360,height:760,mobile:true}
 ];
 const contexts={};
 for(const c of profiles)contexts[c.id]=await browser.newContext({viewport:{width:c.width,height:c.height},isMobile:c.mobile,hasTouch:c.mobile,deviceScaleFactor:1});
 async function open(route,profile,theme){
  const page=await contexts[profile].newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',msg=>{if(msg.type()==='error')errors.push(msg.text())});
  try {
   const res=await page.goto(base+route,{waitUntil:'load',timeout:25000});
   assert(res&&res.status()===200,'HIGH','HTTP',route,'HTTP '+(res&&res.status()),{viewport:profile});
   await page.waitForTimeout(130);
   if(theme==='dark')await page.evaluate(()=>{document.documentElement.dataset.theme='dark'});
   return {page,errors};
  }catch(e){log('HIGH','LOAD',route,e.message.slice(0,350),{viewport:profile});await page.close();return null}
 }
 async function overflow(page,route,profile){
  const m=await page.evaluate(()=>{
    const w=document.documentElement.clientWidth,scroll=document.documentElement.scrollWidth;
    const over=[...document.querySelectorAll('body *')].filter(el=>{
      if(['STYLE','SCRIPT'].includes(el.tagName))return false;
      const r=el.getBoundingClientRect(),css=getComputedStyle(el);
      return css.display!=='none'&&r.width>0&&(r.right>w+8||r.left < -8);
    }).slice(0,8).map(el=>({tag:el.tagName,id:el.id,cl:String(el.className||'').slice(0,50),right:Math.round(el.getBoundingClientRect().right)}));
    return {scroll,viewport:w,over};
  });
  if(m.scroll>m.viewport+3)log('HIGH','OVERFLOW',route,profile+' width '+m.scroll+' > '+m.viewport,{examples:m.over});
 }
 const sitemap=[...fs.readFileSync('sitemap.xml','utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(x=>x[1].replace('https://robertbregy.github.io/Connecting-the-Dots',''));
 for(const route of sitemap){
  const opened=await open(route,'desktop');if(!opened)continue;
  const p=opened.page;
  const r=await p.evaluate(()=>({lang:document.documentElement.lang,title:document.title,h1:document.querySelectorAll('h1').length,mainH1:document.querySelectorAll('main h1').length,imgNoAlt:[...document.images].filter(x=>!x.hasAttribute('alt')).length,scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
  assert(!!r.title,'MED','META',route,'Empty title');
  assert(r.h1===1,'MED','HEADING',route,'h1 count '+r.h1);
  assert(r.mainH1===1,'MED','HEADING',route,'h1 in main count '+r.mainH1);
  assert(r.imgNoAlt===0,'MED','A11Y',route,'Images lacking alt '+r.imgNoAlt);
  assert(r.scroll<=r.client+3,'MED','OVERFLOW',route,'Desktop scroll width '+r.scroll+' > '+r.client);
  for(const e of opened.errors.filter(x=>!x.includes('2026 Reveal Day string snapshot')))log('MED','JS_CONSOLE',route,e.slice(0,160));
  await p.close();
 }
 for(const locale of locales){
  const route='/'+locale+'/';
  for(const vp of profiles){
   const opened=await open(route,vp.id);if(!opened)continue;
   const p=opened.page;
   const dom=await p.evaluate(()=>({
      lugano:document.getElementById('lugano')?.tagName||null,
      directPanel:document.querySelector('#lugano > .panel.authorDisclosure')?.tagName||null,
      panels:document.querySelectorAll('#lugano .panel').length,
      act:[...document.querySelectorAll('.section.active')].map(x=>x.id),
      luganoHTML:document.querySelector('#lugano')?.outerHTML.slice(0,260)
   }));
   assert(dom.lugano==='SECTION','HIGH','DOM',route,'Missing semantic Lugano section',{viewport:vp.id,dom});
   assert(dom.directPanel==='DIV','HIGH','DOM',route,'Malformed Lugano section lost its direct child disclosure panel',{viewport:vp.id,dom});
   assert(dom.act.length===1,'HIGH','NAV',route,'Multiple/no active sections '+dom.act.join(','),{viewport:vp.id});
   await overflow(p,route,vp.id);
   if(vp.id==='desktop'){
    for(const name of ['tabHow','navThemes']){
      const btn=p.locator('.navMenu[data-label-key="'+name+'"] > button');
      await btn.click();const panel=p.locator(name==='tabHow'?'#navHowDropdown':'#navThemesDropdown');
      assert(await panel.isVisible(),'MED','NAV',route,name+' menu did not open');
      const rect=await panel.boundingBox();
      assert(rect&&rect.x>=-2&&rect.y>=-2&&rect.x+rect.width<=vp.width+2&&rect.y+rect.height<=vp.height+2,'MED','NAV_VIEWPORT',route,name+' menu clipped',{rect});
      await p.keyboard.press('Escape');
      assert(!(await panel.isVisible()),'MED','NAV',route,'Escape did not close '+name);
    }
    await p.locator('.navMenu[data-label-key="navRound"] button').click();
    await p.locator('.navMenu[data-label-key="navRound"] [data-target="lugano"]').click();
    const active=await p.evaluate(()=>[...document.querySelectorAll('.section.active')].map(x=>x.id));
    assert(active.join()==='lugano','HIGH','NAV',route,'Lugano tab activation failed',{active});
    await p.screenshot({path:'audit-'+locale+'-desktop-lugano.png',fullPage:false});
   }
   if(vp.id==='mobile'){
    await p.locator('#mobileNav').selectOption('lugano');
    const active=await p.evaluate(()=>[...document.querySelectorAll('.section.active')].map(x=>x.id));
    assert(active.join()==='lugano','HIGH','NAV',route,'Mobile Lugano tab failed',{active});
    await p.screenshot({path:'audit-'+locale+'-mobile-lugano.png',fullPage:false});
   }
   for(const e of opened.errors.filter(x=>!x.includes('2026 Reveal Day string snapshot')))log('MED','JS_CONSOLE',route,e.slice(0,160),{viewport:vp.id});
   await p.close();
  }
 }
 for(const locale of locales){
  const route='/behind-the-round/'+locale+'/who-controls-internet-access/';
  for(const profile of ['desktop','mobile','small']){
   const opened=await open(route,profile,'dark');if(!opened)continue;
   const p=opened.page;
   await overflow(p,route,profile);
   const contrasts=await p.evaluate(()=>{
    function lum(str){let a=(str.match(/[\d.]+/g)||[]).slice(0,3).map(x=>Number(x)/255).map(x=>x<=.04045?x/12.92:Math.pow((x+.055)/1.055,2.4));return a.length===3?0.2126*a[0]+0.7152*a[1]+0.0722*a[2]:NaN;}
    function ratio(a,b){let x=lum(a),y=lum(b);return Number(((Math.max(x,y)+.05)/(Math.min(x,y)+.05)).toFixed(2));}
    return ['.accessStages li[data-state="passed"] p','.accessStages li[data-state="blocked"] p','.accessRefs a'].map(sel=>{
      let el=document.querySelector(sel);if(!el)return null;let fg=getComputedStyle(el).color,bg=getComputedStyle(el).backgroundColor,par=el.parentElement;
      while((bg==='rgba(0, 0, 0, 0)'||bg==='transparent')&&par){bg=getComputedStyle(par).backgroundColor;par=par.parentElement}
      return {selector:sel,foreground:fg,background:bg,ratio:ratio(fg,bg)}
    }).filter(Boolean);
   });
   for(const c of contrasts)if(c.ratio<4.5)log('HIGH','CONTRAST',route,profile+' '+c.selector+' contrast '+c.ratio,{detail:c});
   if(profile==='desktop'){
     try{
      let a=await new AxeBuilder({page:p}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
      log('INFO','AXE',route,a.violations.length+' axe rule violations',{items:a.violations.map(v=>({id:v.id,impact:v.impact,count:v.nodes.length,selectors:v.nodes.slice(0,3).map(n=>n.target)}))});
     }catch(e){log('MED','AXE',route,'axe error '+e.message.slice(0,250))}
   }
   await p.locator('[data-access-select="resolver"]').click();
   const st=await p.evaluate(()=>({active:[...document.querySelectorAll('[data-access-scenario-panel]')].filter(x=>!x.hidden).map(x=>x.dataset.accessScenarioPanel),blocked:[...document.querySelectorAll('[data-access-stage][data-state="blocked"]')].map(x=>x.dataset.accessStage)}));
   assert(st.active.join()==='resolver'&&st.blocked.join()==='dns','HIGH','SIMULATOR',route,'DNS scenario wrong',{st});
   await p.screenshot({path:'audit-'+locale+'-'+profile+'-dark.png',fullPage:false});
   await p.close();
  }
 }
 const byCategory={};for(const x of issues)byCategory[x.category]=(byCategory[x.category]||0)+1;
 console.log('AUDIT_RESULT '+JSON.stringify({issues:issues.length,categories:byCategory,routes:sitemap.length,locale:locales.length,profiles:profiles.length}));
 await browser.close();
})().catch(e=>{console.error('AUDIT_FATAL '+e.stack);process.exitCode=1});
