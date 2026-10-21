#!/usr/bin/env node
'use strict';
/* A navigable editorial reading layer over existing canonical research.
 * It never changes a TLD, application, source, original paragraph or URL.
 * The route copy is localised and server-rendered for no-JS readers too.
 */
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {parseHTML}=require('linkedom');
const root=path.resolve(__dirname,'..');
const guide=JSON.parse(fs.readFileSync(path.join(root,'data/reading_routes.json'),'utf8'));
const pub=JSON.parse(fs.readFileSync(path.join(root,'publication.json'),'utf8'));
const primary=['ia-understand','ia-explore','ia-stories','ia-outcomes','ia-round','ia-research'];
const ids=Object.keys(guide.chapters);
assert.equal(ids.length,23,'Unexpected curated chapter count');
const escape=s=>String(s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const link=(id,label,klass='',anchor='')=>'<a class="'+klass+'" href="?tab='+escape(id)+'#'+escape(anchor||id)+'" data-open-section="'+escape(id)+'"'+(anchor?' data-open-anchor="'+escape(anchor)+'"':'')+'>'+escape(label)+'</a>';
const make=(document,html)=>{const holder=document.createElement('div');holder.innerHTML=html;return holder.firstElementChild};
const reports=[];
for(const lang of ['it','en','de','fr']){
 const localized=guide.locales[lang];assert.ok(localized&&localized.ui&&localized.chapters);
 const ui=localized.ui,chapters=localized.chapters;
 assert.deepEqual(Object.keys(chapters).sort(),[...ids].sort(),'Missing translated chapter');
 for(const filename of [lang+'/index.html',...(lang==='en'?['index.html']:[])]){
  const file=path.join(root,filename),prefix=filename==='index.html'?'':'../';
  const {document}=parseHTML(fs.readFileSync(file,'utf8'));
  assert.equal(document.querySelectorAll('.readerOrientation').length,0,'Reading layer inserted twice');
  let outlineCount=0,itemsCount=0;
  for(const id of ids){
   const sec=document.getElementById(id),config=guide.chapters[id],entry=chapters[id],next=chapters[config.next],verify=chapters[config.verify];
   assert.ok(sec&&sec.classList.contains('section'),'Missing chapter '+id);
   assert.ok(primary.includes(config.parent),'Unknown parent '+config.parent);
   assert.ok(next&&verify,'Broken curated navigation from '+id);
   const crumb='<nav class="readerBreadcrumb" aria-label="'+escape(ui.breadcrumbs)+'">'+
     link('overview',ui.home,'readerHome')+
     '<span aria-hidden="true">›</span>'+link(config.parent,ui[config.parent],'readerParent')+
     '<span aria-hidden="true">›</span><span aria-current="page">'+escape(entry.label)+'</span></nav>';
   const kicker='<p class="readerEyebrow">'+escape(ui.questionLabel)+'</p>';
   const orientation=make(document,
     '<div class="readerOrientation" data-reader-orientation="'+escape(id)+'" role="region" aria-label="'+escape(ui.guide)+'">'+
       crumb+'<div class="readerIntro">'+kicker+
       '<p class="readerQuestion">'+escape(entry.question)+'</p>'+
       '<p class="readerLead">'+escape(entry.lead)+'</p></div></div>');
   sec.prepend(orientation);
   // Use the existing curated section TOC when available. An extra menu
   // would be more navigation, not better navigation.
   if(!sec.querySelector('.sectionToc')&&config.anchors.length>1){
     const links=[];
     for(let i=0;i<config.anchors.length;i++){
       const token=config.anchors[i];
       const anchor=token.startsWith('id:')?document.getElementById(token.slice(3)):
         [...sec.querySelectorAll('h2,h3')].find(n=>n.dataset.i18n===token);
       assert.ok(anchor&&sec.contains(anchor),'Missing reading waypoint '+id+' '+token);
       if(!anchor.id)anchor.id='reading-'+id+'-'+(i+1);
       assert.equal(document.querySelectorAll('[id="'+anchor.id+'"]').length,1,'Duplicate waypoint '+anchor.id);
       const label=(anchor.textContent||'').replace(/\s+/g,' ').trim().slice(0,84)||entry.label;
       links.push('<a href="?tab='+escape(id)+'#'+escape(anchor.id)+'" data-open-section="'+escape(id)+'" data-open-anchor="'+escape(anchor.id)+'">'+escape(label)+'</a>');
     }
     const nav=make(document,'<nav class="readerOutline" aria-label="'+escape(ui.contents)+'">'+
       '<p class="readerOutlineLabel">'+escape(ui.contents)+'</p><div class="readerOutlineLinks">'+links.join('')+'</div></nav>');
     orientation.after(nav);outlineCount++;itemsCount+=links.length;
   }
   const onward=make(document,
     '<nav class="readerNext" aria-label="'+escape(ui.trail)+'">'+
       '<div class="readerNextIntro"><span>'+escape(ui.trail)+'</span></div>'+
       '<div class="readerNextLinks">'+
         '<a class="readerNextPrimary" href="?tab='+escape(config.next)+'#'+escape(config.next)+'" data-open-section="'+escape(config.next)+'">'+
           '<span>'+escape(ui.next)+'</span><strong>'+escape(next.question)+'</strong><span aria-hidden="true">→</span></a>'+
         '<a class="readerNextEvidence" href="?tab='+escape(config.verify)+'#'+escape(config.verify)+'" data-open-section="'+escape(config.verify)+'">'+
           '<span>'+escape(ui.verify)+'</span><strong>'+escape(verify.label)+'</strong><span aria-hidden="true">↗</span></a>'+
       '</div></nav>');
   sec.append(onward);
  }
  // A researcher has a direct, non-modal route from the first screen.
  const actions=document.querySelector('.heroActions');
  assert.ok(actions&&actions.querySelector('.heroPrimary'),'Missing original entry CTA');
  actions.append(make(document,'<a class="readerResearchShortcut" href="?tab=research#research-citation-guide" '+
    'data-open-section="research" data-open-anchor="research-citation-guide">'+
    escape(ui.researchShortcut)+' <span aria-hidden="true">↗</span></a>'));
  const sheet=document.createElement('link');sheet.rel='stylesheet';sheet.href=prefix+'assets/reading-paths.css?v='+pub.version;
  document.head.append(sheet);
  fs.writeFileSync(file,'<!DOCTYPE html>\n'+document.documentElement.outerHTML+'\n');
  reports.push({filename,chapters:ids.length,outlines:outlineCount,waypoints:itemsCount,asset:sheet.href});
 }
}
console.log('READER_PATHS_RECONCILED '+JSON.stringify(reports));
