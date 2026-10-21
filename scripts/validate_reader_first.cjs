'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {parseHTML}=require('linkedom');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const config=JSON.parse(read('data/reader_pathways.json')),pub=JSON.parse(read('publication.json'));
const chapters=Object.values(config.areas).flat(),counts=[];
for(const [lang,file] of [['en','index.html'],...config.languages.map(l=>[l,l+'/index.html'])]){
 const d=parseHTML(read(file)).document;
 assert.equal(d.documentElement.dataset.readerRelease,pub.version);
 assert.equal(d.querySelectorAll('.iaPrimaryLink').length,6);
 assert.equal(d.querySelectorAll('.iaHubCard').length,26);
 assert.equal(d.querySelectorAll('.readerIntents>a').length,3);
 assert.deepEqual([...d.querySelectorAll('.readerIntents>a')].map(n=>n.dataset.openSection),['overview','explore','research']);
 assert.equal(d.querySelectorAll('.readerFeatured').length,6);
 assert.equal(d.querySelectorAll('.readerTrail').length,chapters.length);
 assert.equal(d.querySelectorAll('.readerNext').length,chapters.length);
 assert.equal(d.querySelectorAll('#reader-index>summary').length,1);
 assert.equal(d.querySelectorAll('#reader-index nav').length,6);
 assert.equal(d.querySelector('.readerResearchLink').dataset.openAnchor,'research-citation-guide');
 assert.equal(d.querySelector('#ia-understand [data-open-section="overview"]').dataset.openAnchor,'three-minute-guide');
 for(const id of chapters){
  const sec=d.getElementById(id);assert.ok(sec);
  assert.equal(sec.querySelectorAll(':scope>.readerTrail').length,1);
  assert.equal(sec.querySelectorAll(':scope>.readerNext .readerNextCard').length,2);
  assert.equal(sec.querySelector('.readerTrail [aria-current]').textContent,config.titles[id][lang]);
  assert.ok(d.querySelector('#reader-index a[data-open-section="'+id+'"]'),'Chapter missing from index '+id);
  assert.equal(sec.querySelector('.readerNext h2').textContent,config.ui.next[lang]);
  if(id!=='economics')assert.equal(sec.querySelectorAll(':scope>.sectionToc').length,0,'Duplicate old/new outline '+id);
 }
 assert.equal(d.querySelectorAll('#economics>.sectionToc a').length,6);
 const storyOrder=[...d.querySelectorAll('#ia-stories .iaHubCard a')].map(n=>n.dataset.openSection);
 assert.deepEqual(storyOrder,config.areas.stories);
 assert.deepEqual([...d.querySelectorAll('#ia-explore .iaExploreGovernance .iaHubCard a')].map(n=>n.dataset.openSection),['geography','governance-access','governance-sanctions']);
 for(const a of d.querySelectorAll('.readerOwned a[data-open-section],.readerIntent,.readerResearchLink')){
  const target=d.getElementById(a.dataset.openSection);assert.ok(target,'Missing reader destination');
  const url=new URL(a.href,'https://ctd.invalid/');assert.equal(url.searchParams.get('tab'),target.id);
  if(a.dataset.openAnchor){const anchor=d.getElementById(a.dataset.openAnchor);assert.ok(anchor,'Missing reader anchor '+a.dataset.openAnchor);assert.equal(anchor.closest('.section')?.id,target.id,'Reader anchor crosses chapters');}
 }
 const ids=[...d.querySelectorAll('[id]')].map(n=>n.id);const duplicates=ids.filter((v,i)=>ids.indexOf(v)!==i);assert.deepEqual(duplicates,[],'Duplicate global IDs');
 const outlineRows=[...d.querySelectorAll('.readerOutline')].map(n=>({id:n.closest('.section').id,links:n.querySelectorAll('a').length}));
 counts.push({file,chapters:chapters.length,outlines:outlineRows,localLinks:d.querySelectorAll('.readerOwned a').length});
}
const frozen=JSON.parse(read('docs/reader-first-frozen-evidence.json'));
for(const [name,sha] of Object.entries(frozen.files))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,name))).digest('hex'),sha,'Frozen evidence changed: '+name);
const preserved=JSON.parse(read('docs/reader-first-content-preservation.json'));
assert.equal(preserved.version,pub.version);assert.equal(preserved.pages.filter(n=>n.protectedTexts>0).length,5);
for(const p of preserved.pages.filter(n=>n.protectedTexts)){assert.ok(p.protectedTexts>7000&&p.protectedLinks>850&&p.protectedIds>250,'Incomplete evidence protection');}
const review={version:pub.version,nativePages:5,chapterRoutes:chapters.length,languageCount:4,independentPages:preserved.pages.filter(n=>n.independentArticle).length,reorderedChapters:10,unchangedCsvAndZipFiles:Object.keys(frozen.files).length,checks:counts,humanParticipants:0,accessibilityConformanceClaim:false};
fs.writeFileSync(path.join(root,'docs/reader-first-static-checks.json'),JSON.stringify(review,null,2)+'\n');
console.log('READER_FIRST_STATIC_PASS '+JSON.stringify(review));
