'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {parseHTML}=require('linkedom');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const fees=JSON.parse(read('data/round_application_fees.json'));
const summary=JSON.parse(read('data/tld_cultural_patterns.json'));
assert.deepEqual(fees.rounds.map(r=>[r.round,r.fee]),[[2000,50000],[2004,45000],[2012,185000],[2026,227000]]);
assert.equal(fees.rounds[0].collected,null,'A reconstruction must not become a documented receipt');
assert.equal(fees.rounds[1].collected,450000);
assert.equal(fees.rounds[2].collectedKind,'documented-initial');
assert.equal(fees.rounds[3].collected,null,'Do not infer 2026 receipts from the headline application count');
assert.equal(fees.rounds[3].reconstructed,null);
const expected={legacy:7,'2000':190,'2004':9,'2012':1409,'2026':980};
for(const r of summary.rounds){assert.equal(r.strings,expected[r.round]);assert.ok(r.semantic_classified<=r.strings);if(r.round!=='2026')assert.equal(r.categories.brand,null);}
for(const lang of ['en','it','de','fr']){
 const {document,Event}=parseHTML(read(lang+'/index.html'));
 for(const id of ['round-application-fees','tld-cultural-trajectory','tld-cultural-patterns','tld-cultural-home','tld-cultural-social'])assert.equal(document.querySelectorAll('#'+id).length,1,lang+' unique '+id);
 assert.equal(document.querySelectorAll('[data-cultural-stage]').length,8);
 assert.equal(document.querySelectorAll('#cultural-sensitivity-v2').length,1);
 assert.equal(document.querySelectorAll('[data-fee-round]').length,4);
 assert.ok(document.querySelector('[data-fee-round="2026"]').textContent.includes(fees.locales[lang].unknown));
 const script=document.querySelector('script[src$="assets/tld-cultural.js"]');assert.ok(script);assert.equal(script.getAttribute('src'),'../assets/tld-cultural.js');
 const payload=JSON.parse(document.getElementById('tld-cultural-data').textContent);
 assert.equal(payload.records.length,summary.counts.strings);
 assert.equal(new Set(payload.records.map(r=>r[3])).size,payload.records.length);
 // A DOM harness isolates the filtering code from the rest of the publication.
 // The real membership expectations come from the independent archived cohorts.
 for(const select of document.querySelectorAll('.tldControls select')){
  let value='';Object.defineProperty(select,'value',{get:()=>value,set:v=>{value=String(v);}});
 }
 vm.runInNewContext(read('assets/tld-cultural.js'),{document,Intl});
 const count=()=>Number(document.getElementById('tld-cultural-results').textContent.replace(/[^0-9]/g,''));
 assert.equal(count(),summary.counts.strings);
 const round=document.getElementById('tld-cultural-round'),search=document.getElementById('tld-cultural-search'),category=document.getElementById('tld-cultural-category');
 for(const [r,n] of Object.entries(expected)){round.value=r;round.dispatchEvent(new Event('change'));assert.equal(count(),n,lang+' primary cohort '+r);}
 // A brand flag observed in 2026 cannot become a historical designation.
 round.value='2012';category.value='brand';category.dispatchEvent(new Event('change'));assert.equal(count(),0);
 round.value='';category.value='';search.value='xn--';search.dispatchEvent(new Event('input'));assert.ok(count()>100,'A-label lookup must work');
 search.value='مصر';search.dispatchEvent(new Event('input'));assert.equal(count(),1,'Unicode lookup must work');
 assert.equal(document.querySelector('#tld-cultural-records td').getAttribute('dir'),'auto');
 search.value='nonexistent-name-ctd-test';search.dispatchEvent(new Event('input'));assert.equal(count(),0);
 assert.equal(document.querySelectorAll('#tld-cultural-records tr').length,0);
}
console.log('TLD_CULTURAL_VALIDATED',JSON.stringify({languages:4,strings:summary.counts.strings,primaryCohorts:expected,fees:4}));
