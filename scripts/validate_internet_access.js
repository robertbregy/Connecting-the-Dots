/* Test multilingual static articles and the seven local-only access-control scenarios. */
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const {parseHTML}=require('linkedom');
const root=path.resolve(__dirname,'..'),base='https://robertbregy.github.io/Connecting-the-Dots/';
const data=JSON.parse(fs.readFileSync(path.join(root,'data/internet_access_explainer.json'),'utf8'));
const languages=['en','it','de','fr'];
assert.equal(data.cases.length,5);
assert.equal(data.mechanisms.length,7);
assert.equal(data.sources.length,11);
const seenSources=new Set(data.sources.map(x=>x.id));
for(const record of [...data.mechanisms,...data.actors,...data.cases]){
 assert.ok(record.sourceIds.length,record.id+' must reference sources');
 for(const id of record.sourceIds)assert.ok(seenSources.has(id),'Unknown source '+id);
}
for(const lang of languages){
 const pathname='behind-the-round/'+lang+'/who-controls-internet-access/';
 const text=fs.readFileSync(path.join(root,pathname,'index.html'),'utf8');
 const {document,window,HTMLElement}=parseHTML(text);
 const tr=data.languages[lang];
 const expectedUrl=base+pathname;
 assert.equal(document.documentElement.getAttribute('lang'),lang,'Localized html language '+lang);
 assert.equal(document.querySelector('link[rel=canonical]')?.getAttribute('href'),expectedUrl,'Canonical '+lang);
 assert.equal(document.querySelectorAll('link[rel=alternate][hreflang]').length,5,'Reciprocal language links '+lang);
 assert.equal(document.querySelector('meta[name=robots]')?.getAttribute('content'),'index,follow,max-image-preview:large','Indexing '+lang);
 assert.equal(document.title,tr.metaTitle,'Localized SEO title '+lang);
 const schema=JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent);
 assert.equal(schema['@type'],'Article','Article schema '+lang);
 assert.equal(schema.dateModified,data.reviewedOn,'Reviewed date '+lang);
 assert.equal(schema.citation.length,11,'Institutional sources '+lang);
 assert.equal(document.querySelectorAll('[data-access-stage]').length,5,'Access stages '+lang);
 assert.equal(document.querySelectorAll('.accessPrerequisite [data-access-stage]').length,1,'Registration must be a prerequisite, not a network hop '+lang);
 assert.equal(document.querySelectorAll('.accessStages [data-access-stage]').length,4,'Only DNS, IP, TLS and application belong in the request path '+lang);
 assert.equal(document.querySelector('.accessPrerequisite [data-access-stage]')?.getAttribute('data-access-stage'),'registry','The registration precondition is not a network hop '+lang);
 assert.equal(document.querySelectorAll('[data-access-select]').length,7,'Scenario controls '+lang);
 assert.equal(document.querySelectorAll('[data-access-scenario-panel]').length,7,'Scenario panels '+lang);
 assert.equal(document.querySelectorAll('[data-access-case]').length,5,'Documented cases '+lang);
 assert.equal(document.querySelectorAll('[data-access-actor]').length,5,'Actors '+lang);
 assert.equal(document.querySelectorAll('[id^="access-source-"]').length,11,'Evidence links '+lang);
 assert.equal(document.querySelectorAll('a[href^="#access-source-"]').length>15,true,'Inline source refs '+lang);
 assert.equal(document.querySelector('a[href="'+base+'behind-the-round/'+lang+'/sanctions-and-dns/"]')!==null,true,'OFAC link '+lang);
 for(const entry of data.cases){
   const card=document.querySelector('[data-access-case="'+entry.id+'"]');
   assert.ok(card,'Missing case '+entry.id+' '+lang);
   assert.ok(card.textContent.includes(entry.period),'Missing dated context '+entry.id+' '+lang);
   for(const id of entry.sourceIds)assert.ok(card.querySelector('a[href="#access-source-'+id+'"]'),'Missing inline evidence '+id);
 }
 const simulator=document.querySelector('#accessSimulator');
 assert.ok(simulator,'Missing simulator '+lang);
 assert.ok(simulator.getAttribute('data-pass-label'),'Missing localized stage status '+lang);
 const inline=Array.from(document.querySelectorAll('script')).find(x=>x.textContent.includes("data-access-select"));
 assert.ok(inline,'Missing simulator behavior script '+lang);
 const program=inline.textContent;
 assert.ok(!/fetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|localStorage|geolocation/.test(program),'Simulator must not probe or store visitor data');
 // linkedom does not implement the native HTMLElement.hidden property; provide equivalent semantics.
 Object.defineProperty(HTMLElement.prototype,'hidden',{
   configurable:true,
   get(){return this.hasAttribute('hidden');},
   set(value){this.toggleAttribute('hidden',!!value);}
 });
 vm.runInNewContext(program,{document,console},{timeout:2000});
 const buttons=[...simulator.querySelectorAll('[data-access-select]')];
 const stages=[...simulator.querySelectorAll('[data-access-stage]')];
 const panels=[...simulator.querySelectorAll('[data-access-scenario-panel]')];
 assert.equal(buttons.filter(x=>x.getAttribute('aria-pressed')==='true').length,1,'Initial scenario selected '+lang);
 for(const mode of data.mechanisms){
    const button=buttons.find(x=>x.getAttribute('data-access-select')===mode.id);
    assert.ok(button,'Missing scenario button '+mode.id);
    button.dispatchEvent(new window.Event('click',{bubbles:true}));
    const selected=buttons.filter(x=>x.getAttribute('aria-pressed')==='true');
    assert.deepEqual(selected.map(x=>x.getAttribute('data-access-select')),[mode.id],'Scenario selection '+lang+'/'+mode.id);
    assert.deepEqual(panels.filter(x=>!x.hidden).map(x=>x.getAttribute('data-access-scenario-panel')),[mode.id],'Scenario panel '+lang+'/'+mode.id);
    for(let i=0;i<stages.length;i++){
       const expected=mode.blockStage<0||i<mode.blockStage?'passed':i===mode.blockStage?'blocked':'pending';
       assert.equal(stages[i].getAttribute('data-state'),expected,'Flow state '+lang+'/'+mode.id+'/'+i);
    }
 }
 const page=fs.readFileSync(path.join(root,lang,'index.html'),'utf8');
 const main=parseHTML(page).document;
 assert.equal(main.querySelectorAll('[data-access-explainer-link]').length,3,'How, Social and Disputes crosslinks '+lang);
 for(const a of main.querySelectorAll('a[data-access-explainer-link]')){
   assert.equal(a.getAttribute('href'),expectedUrl,'Crosslink must be localized '+lang);
 }
 const ofac=fs.readFileSync(path.join(root,'behind-the-round',lang,'sanctions-and-dns','index.html'),'utf8');
 assert.ok(ofac.includes(expectedUrl),'Related OFAC guide misses access explainer '+lang);
 console.log('Access simulator and sources PASS: '+lang+' / 7 scenarios / 5 cases / 11 sources');
}
console.log('Internet access explainer: all four languages, 28 scenario selections and links validated.');
