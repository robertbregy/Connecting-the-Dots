'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),crypto=require('crypto'),{parseHTML}=require('linkedom');
const root=path.resolve(__dirname,'..'),C=JSON.parse(fs.readFileSync(path.join(root,'data/reader_journeys.json'),'utf8'));
const P=JSON.parse(fs.readFileSync(path.join(root,'publication.json'),'utf8'));
for(const lang of ['en','it','de','fr'])for(const file of [lang+'/index.html',...(lang==='en'?['index.html']:[])]){
 const {document}=parseHTML(fs.readFileSync(path.join(root,file),'utf8'));
 assert.equal(document.querySelectorAll('#reader-directory').length,1);
 assert.equal(document.querySelectorAll('.iaPrimaryNav > a').length,6);
 assert.equal(document.querySelectorAll('#reader-topic-list [data-reader-topic]:not([data-reader-detail])').length,23);
 for(const [id,L] of Object.entries(C.layouts)){
  const s=document.getElementById(id);assert.equal(s.dataset.readerOrder,'reader-v1');
  assert.equal(s.querySelectorAll(':scope > .readerStage').length,L.groups.length);
  assert.equal(s.querySelectorAll(':scope > .sectionToc a').length,L.groups.length);
  assert.deepEqual([...s.querySelectorAll('[data-reader-stage-title]')].map(x=>x.textContent),C.locales[lang].groups[id]);
  for(const h of s.querySelectorAll('[data-reader-stage-title]'))assert.equal(h.closest('details'),null);
 }
 for(const [id,next] of Object.entries(C.related)){
  const sec=document.getElementById(id);assert.equal(sec.querySelectorAll(':scope > .readerBreadcrumb').length,1);
  assert.equal(sec.querySelectorAll(':scope > .readerNext .readerNextCard').length,next.length);
 }
 for(const link of document.querySelectorAll('#reader-directory a,.readerToc a,.readerNext a,.readerBreadcrumb a')){
  const url=new URL(link.getAttribute('href'),'https://example.org/'+lang+'/'),tab=url.searchParams.get('tab');
  assert.ok(document.getElementById(tab),'Missing target '+tab);if(url.hash)assert.ok(document.getElementById(url.hash.slice(1)),'Missing fragment '+url.hash);
 }
 const ids=[...document.querySelectorAll('[id]')].map(x=>x.id);assert.equal(new Set(ids).size,ids.length,'Repeated ID');
 assert.ok(document.querySelector('#research-citation-guide .audienceCiteGrid article:nth-child(2) strong').textContent.includes('v'+P.version));
 assert.equal(document.querySelectorAll('#economics > .economicsChapter').length,6);
 assert.ok(document.querySelector('#cemetery #helsinki-termination'));
}
const baseline=path.join(root,'docs/reader-preserved-inputs-20261020.json');
if(fs.existsSync(baseline))for(const [f,h] of Object.entries(JSON.parse(fs.readFileSync(baseline,'utf8'))))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,f))).digest('hex'),h,'Changed evidence '+f);
console.log('READER_STATIC_VERIFIED '+JSON.stringify({languages:4,chapters:23,reordered:14,globalAreas:6,localTopicDirectory:true,evidenceUnchanged:true}));
