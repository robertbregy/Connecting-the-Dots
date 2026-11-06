/* Four-language source-to-render chronological acceptance, including native chapters. */
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),path=require('node:path'),crypto=require('node:crypto');
const {parseHTML}=require('linkedom');
const data=JSON.parse(fs.readFileSync('data/internet_access_explainer.json','utf8'));
const wanted=['wikileaks-2008','wikileaks-2010','catalonia-2017','china-2023','russia-2024','iran-2025','swiss-2026'];
assert.deepEqual(data.cases.map(x=>x.id),wanted);
assert.equal(new Set(data.cases.map(x=>x.id)).size,7);
assert.equal(data.reviewedOn,'2026-11-06');
const evidence=JSON.parse(fs.readFileSync('docs/access-chronology-v0796-evidence.json','utf8'));
assert.deepEqual(evidence.after,wanted);
for(const c of data.cases){
 const h=crypto.createHash('sha256').update(JSON.stringify(c)).digest('hex');
 assert.equal(evidence.caseFingerprints[c.id],h,'Canonical historical body/source modified '+c.id);
}
for(const lang of ['it','en','de','fr']){
 const text=data.languages[lang].examplesLead;
 const expected=data.cases.map(c=>c.period);
 for(const file of [path.join('behind-the-round',lang,'who-controls-internet-access','index.html'),path.join(lang,'index.html'),...(lang==='en'?['index.html']:[])]){
  const html=fs.readFileSync(file,'utf8');
  const d=parseHTML(html).document;
  const article=file.includes('who-controls-internet-access')?d.querySelector('main.accessArticle'):d.querySelector('#governance-access');
  assert.ok(article,'Missing native/standalone explainer: '+file);
  const ids=[...article.querySelectorAll('[data-access-case]')].map(x=>x.getAttribute('data-access-case'));
  assert.deepEqual(ids,wanted,'Historical cards not in exact chronological order: '+file);
  const intro=article.querySelector('.accessCaseSection > .intro');
  assert.equal(intro?.textContent,text,'Localized chronological intro missing: '+file);
  for(const [i,card] of [...article.querySelectorAll('[data-access-case]')].entries()){
   assert.ok(card.textContent.includes(expected[i]),'Case date lost: '+file+' / '+wanted[i]);
   const c=data.cases[i];
   assert.equal(card.querySelectorAll('a[href^="#access-source-"]').length,c.sourceIds.length,'Citations drift: '+file+' / '+c.id);
  }
  assert.equal(article.querySelectorAll('[data-access-select]').length,8,'Interactive scenarios changed in '+file);
 }
}
console.log('ACCESS_CASE_CHRONOLOGY_VERIFIED',JSON.stringify({cards:7,langs:4,pages:9,ids:wanted,contents:'preserved',historicalData:'unchanged'}));
