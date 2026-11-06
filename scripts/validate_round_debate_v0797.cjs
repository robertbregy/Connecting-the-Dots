/* Independent source-to-render acceptance: BRS/INTA are stakeholder views, not new APS facts. */
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),cp=require('node:child_process');
const {parseHTML}=require('linkedom');
const d=JSON.parse(fs.readFileSync('data/round_debate_20261106.json','utf8'));
const pub=JSON.parse(fs.readFileSync('publication.json','utf8'));
const version=pub.version.match(/^(\d+)\.(\d+)\.(\d+)$/);
assert.ok(version&&(Number(version[1])>0||Number(version[2])>7||(Number(version[2])===7&&Number(version[3])>=97)),
 'The dated commentary requires technical release v0.7.97 or later');
assert.equal(pub.asOf,'2026-10-10');
assert.equal(d.reviewedOn,'2026-11-06');assert.equal(d.sources.length,4);
assert.ok(d.reviewedOn<=pub.releasedOn,'Publication predates the reviewed commentary');
assert.deepEqual(d.items.map(x=>x.id),['brs-cpe-outcomes','inta-private-auctions']);
for(const p of ['data/field_investigations.json','data/inside_the_round_events.json','data/application_2026_snapshot.json','data/applications_2026_aps_official_listing.csv','data/applications_2026_aps_official_provenance.json','data/aps_2026_current_analytics.json','CITATION.cff']){
 assert.deepEqual(fs.readFileSync(p),cp.execFileSync('git',['show','HEAD:'+p],{maxBuffer:80*1024*1024}),'Frozen application/research data changed: '+p);
}
let standalone=0,native=0;
for(const lang of ['it','en','de','fr']){
 const t=d.languages[lang];
 const filename='behind-the-round/'+lang+'/index.html';
 const {document}=parseHTML(fs.readFileSync(filename,'utf8'));
 assert.equal(document.querySelectorAll('#round-debate-20261106').length,1,'Field note absent or duplicated '+lang);
 const field=document.getElementById('round-debate-20261106');
 assert.equal(field.querySelectorAll('[data-round-perspective]').length,2);
 assert.deepEqual([...field.querySelectorAll('[data-round-perspective]')].map(n=>n.getAttribute('data-round-perspective')),d.items.map(x=>x.id));
 for(const key of ['brsBody','brsReading','intaBody','intaReading'])assert.ok(field.textContent.includes(t[key]),'Translated position missing: '+lang+'/'+key);
 for(const source of d.sources)assert.equal(field.querySelectorAll('a[href="'+source.url+'"]').length,1,'Original cited URL missing '+lang+'/'+source.id);
 const schema=JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent);
 assert.equal(schema.dateModified,'2026-11-06');assert.equal(schema['@type'],'CollectionPage');
 assert.equal(document.querySelectorAll('[data-field-investigation-teaser]').length,3,'Existing investigations changed');
 for(const node of field.querySelectorAll('a'))assert.equal(node.getAttribute('rel'),'noopener noreferrer');
 standalone++;
 for(const nativeFile of [lang+'/index.html',...(lang==='en'?['index.html']:[])]){
  const {document:n}=parseHTML(fs.readFileSync(nativeFile,'utf8'));
  const chapter=n.getElementById('contention');assert.ok(chapter);
  const context=chapter.querySelector('#round-auctions-debate-20261106');
  assert.ok(context,'Missing native chapter note: '+nativeFile);
  assert.equal(chapter.querySelectorAll('[data-round-debate-context]').length,1);
  assert.ok(context.textContent.includes(t.contextLead));
  assert.ok(context.textContent.includes(t.contextBody));
  for(const id of ['inta','icann-faq'])assert.ok(context.querySelector('a[href="'+d.sources.find(s=>s.id===id).url+'"]'));
  assert.ok(context.querySelector('a[href="https://robertbregy.github.io/Connecting-the-Dots/behind-the-round/'+lang+'/#round-debate-20261106"]'));
  native++;
 }
}
console.log('ROUND_DEBATE_V0797_VERIFIED',JSON.stringify({fieldNoteIndexes:standalone,nativeContentionChapters:native,newPages:0,stakeholderCards:2,langs:4,officialAPS:'unchanged'}));
