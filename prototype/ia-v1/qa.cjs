#!/usr/bin/env node
"use strict";
/* Static and model-level QA for the isolated IA demonstrator.
 * Runs without network, external libraries or browser automation.
 * A passing result is NOT a completed human usability test.
 */
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const assert=require("node:assert/strict");
const root=__dirname;
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
const css=fs.readFileSync(path.join(root,"styles.css"),"utf8");
const js=fs.readFileSync(path.join(root,"app.js"),"utf8");
const script=new vm.Script(js,{filename:"app.js"});
const ctx=vm.createContext({
  document:{readyState:"loading",addEventListener:()=>{}},
  location:{hash:"#/"},
  window:{},
  URL,URLSearchParams,Intl,console
});
script.runInContext(ctx,{timeout:3000});
const get=(name)=>vm.runInContext(name,ctx,{timeout:3000});
const LANG=["it","en","de","fr"];
const AREAS=["capire","esplorare","storie","round","ricerca"];
const ROUTES=new Set(["",...AREAS,"guida-accesso","nota-conteggi","test"]);
const defined=Object.keys(get("I"));
const uiKeys=[...html.matchAll(/data-i18n="([^"]+)"/g)].map(m=>m[1]);
let checkedPages=0,checkedLinks=0,checkedCards=0;
assert.deepEqual(defined.sort(),LANG.slice().sort(),"Four complete locale models required");
assert.match(html,/<meta name="robots" content="noindex,nofollow">/);
assert.match(html,/<a class="skip-link" href="#main"/);
assert.match(html,/<main id="main"/);
assert.match(html,/<nav class="container nav-bar"/);
assert.match(html,/<script src="app\.js" defer>/);
assert.match(html,/<link rel="stylesheet" href="styles\.css">/);
assert.match(css,/:focus-visible/);
assert.match(css,/@media\(max-width:700px\)/);
assert.match(css, /prefers-reduced-motion/);
assert.match(css, /:root\[data-theme="dark"\]/);
assert.match(js,/rel="noopener noreferrer"/);
assert.equal((html.match(/data-section="/g)||[]).length,5,"Five primary navigation items");
const areaResources=get("AREA_RESOURCES");
const targetMap=get("RESOURCE_TARGETS");
for(const area of AREAS)assert.ok(areaResources[area].length>=4,area+" lacks resources");
for(const [area,list] of Object.entries(areaResources)) {
  for(const key of list) {
    assert.ok(targetMap[key],"No target for resource "+key+" in "+area);
    checkedCards++;
  }
}
for(const lang of LANG) {
  get("I")[lang].resources && null;
  const data=get("I")[lang];
  for(const key of uiKeys)assert.ok(typeof data[key]==="string"&&data[key].trim(),"Missing UI translation "+lang+"/"+key);
  for(const area of AREAS) {
    const page=data.sectionPages[area];
    assert.ok(page&&page.length===4,"Missing section "+lang+"/"+area);
    for(const key of areaResources[area]){
      const res=data.resources[key];
      assert.ok(res&&res.length===3&&res.every(Boolean),"Missing resource "+lang+"/"+key);
    }
  }
  assert.equal(data.visualSteps.length,4);
  assert.equal(data.choices.length,3);
  assert.equal(data.terms.length,4);
  assert.equal(data.tasks.length,5);
  assert.equal(data.snapshot.length,3);
  for(const pilot of ["access","counts"]) {
    const d=data.art[pilot];
    assert.ok(d&&d.title&&d.short&&d.deep.length===3&&d.caveat&&d.sourceIntro);
    assert.equal(d.related.length,2);
  }
  get("I")[lang].snapshot.forEach(x=>assert.ok(x));
  vm.runInContext("locale="+JSON.stringify(lang),ctx);
  const pages = [
    ["home",get("home()")],
    ...AREAS.map(id=>[id,vm.runInContext("area("+JSON.stringify(id)+")",ctx)]),
    ["access",get('article("access")')],
    ["counts",get('article("counts")')],
    ["test",get("tasksPage()")]
  ];
  for(const [name,body] of pages){
    assert.ok(body.length>300,name+"/"+lang+" body too small");
    const count=(body.match(/<h1>/g)||[]).length;
    assert.equal(count,1,"Exactly one H1 required: "+lang+"/"+name);
    assert.ok(!body.includes("undefined")&&!body.includes("[object Object]"),lang+"/"+name+" unsafe interpolation");
    for(const m of body.matchAll(/href="#\/([^"]*)"/g)){
      const route=m[1].split("?")[0].replace(/^\/+|\/+$/g,"");
      assert.ok(ROUTES.has(route),"Broken internal route "+lang+"/"+name+"/"+route);
      checkedLinks++;
    }
    for(const m of body.matchAll(/target="_blank" rel="noopener noreferrer"/g))checkedLinks++;
    checkedPages++;
  }
  const articleAccess=get('article("access")');
  assert.ok(articleAccess.includes("/behind-the-round/"+lang+"/who-controls-internet-access/"),"Access deep link missing "+lang);
  const articleCounts=get('article("counts")');
  assert.ok(articleCounts.includes("newgtldprogram-aps.icann.org/applications"),"Official APS link missing "+lang);
  assert.ok(articleCounts.includes("1"),"Scientific figures absent "+lang);
  assert.equal((articleAccess.match(/<summary>/g)||[]).length,2);
  assert.equal((articleCounts.match(/<summary>/g)||[]).length,2);
  for(const area of AREAS) assert.ok(get("home()").includes("#/"+area),"Home missing destination "+area);
}
console.log(JSON.stringify({
  status:"PASS",kind:"static-and-model-qa",locales:LANG.length,areas:AREAS.length,
  prototypePagesChecked:checkedPages,internalAndExternalLinksInspected:checkedLinks,
  curatedResourcesChecked:checkedCards,
  notes:"No human usability study or browser rendering was performed."
},null,2));
