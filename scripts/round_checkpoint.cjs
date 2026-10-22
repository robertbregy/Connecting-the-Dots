/* Dated editorial context for the 22 October 2026 phase transition.
 * No network requests, inferred selections, or scientific-record modifications.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {parseHTML}=require('linkedom');
const {serializeBody}=require('./reader_first_serialization.cjs');
const ROOT=path.resolve(__dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(ROOT,p),'utf8'));
const data=read('data/round_2026_checkpoint.json'),dict=read('data/translations.json');
assert.equal(data.checkedOn,'2026-10-22');assert.equal(data.newApplicationExportAcquired,false);
const touched=[];
function apply(file,lang,native){
 const raw=fs.readFileSync(path.join(ROOT,file),'utf8'),d=parseHTML(raw).document,t=dict[lang];
 const oldIds=[...d.querySelectorAll('[id]')].filter(n=>!n.matches('[data-round-checkpoint]')).map(n=>n.id);
 for(const n of d.querySelectorAll('[data-round-checkpoint]'))n.remove();
 const el=(tag,text)=>{const n=d.createElement(tag);if(text)n.textContent=text;return n;};
 function note(id,titleKey,bodyKeys){
  const box=el('aside');box.className='panel roundCheckpoint';box.id=id;box.dataset.roundCheckpoint=data.checkedOn;box.setAttribute('role','note');
  const stamp=el('p');stamp.className='eyebrow';const time=el('time',t.field22ReviewLabel);time.setAttribute('datetime',data.checkedOn);stamp.append(time);box.append(stamp);
  const lead=el('p');lead.append(el('strong',t[titleKey]));box.append(lead);
  for(const key of bodyKeys){assert.ok(t[key],lang+' '+key);box.append(el('p',t[key]));}
  const refs=el('p');refs.className='srcs';
  for(const [label,url] of [['ICANN \u00b7 APS',data.sources.publicationPolicy],['ICANN \u00b7 2026',data.sources.calendar]]){
   if(refs.childNodes.length)refs.append(d.createTextNode(' \u00b7 '));const a=el('a',label);a.href=url;a.target='_blank';a.rel='noopener noreferrer';refs.append(a);
  }
  box.append(refs);return box;
 }
 if(native){
  const hub=d.querySelector('#ia-round .iaHubHead');assert.ok(hub);hub.after(note('round-phase-checkpoint','field22PhaseTitle',['field22PhaseBody']));
  const intro=d.querySelector('#inside-round .readerIntro');assert.ok(intro);intro.after(note('round-timeline-checkpoint','field22PhaseTitle',['field22PhaseBody','field22PhaseLimit']));
  const status=d.querySelector('#lugano-status-sources > h2');assert.ok(status);status.after(note('lugano-calendar-checkpoint','field22PhaseTitle',['field22LuganoBody']));
  const atlas=d.querySelector('#aps-native');assert.ok(atlas);const heading=atlas.querySelector(':scope > h2');
  const box=note('atlas-publication-checkpoint','field22AtlasTitle',['field22AtlasBody']);if(heading)heading.after(box);else atlas.prepend(box);
 }else if(file.startsWith('applications/')){
  const hero=d.querySelector('.apsHero');assert.ok(hero);hero.after(note('atlas-publication-checkpoint','field22AtlasTitle',['field22AtlasBody']));
 }else{
  const main=d.querySelector('main');assert.ok(main);const actions=main.querySelector(':scope > .actions');assert.ok(actions);actions.after(note('round-timeline-checkpoint','field22PhaseTitle',['field22PhaseBody','field22PhaseLimit']));
 }
 for(const id of oldIds)assert.ok(d.getElementById(id),'Lost existing anchor '+file+'#'+id);
 const ids=[...d.querySelectorAll('[id]')].map(n=>n.id);assert.equal(new Set(ids).size,ids.length,'Duplicate IDs '+file);
 if(native)fs.writeFileSync(path.join(ROOT,file),'<!DOCTYPE html>\n'+d.documentElement.outerHTML+'\n');
 else fs.writeFileSync(path.join(ROOT,file),raw.slice(0,raw.search(/<body\b/i))+serializeBody(d.body)+'\n</html>\n');
 touched.push(file);
}
for(const lang of ['en','it','de','fr']){
 apply(lang+'/index.html',lang,true);if(lang==='en')apply('index.html','en',true);
 apply('applications/'+lang+'/index.html',lang,false);apply('inside-the-round/'+lang+'/index.html',lang,false);
}
fs.writeFileSync(path.join(ROOT,'docs/round-checkpoint-render.json'),JSON.stringify({checkedOn:data.checkedOn,pages:touched,oldAnchorsRetained:true,newExport:false},null,2)+'\n');
console.log('ROUND_CHECKPOINT_RENDERED',JSON.stringify({pages:touched.length,checkedOn:data.checkedOn,newExport:false}));
