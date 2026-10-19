/* Check sourced denominators, cohort joins, translations and shipped tables. */
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const {parseHTML}=require('linkedom');
const data=JSON.parse(fs.readFileSync('data/tld_market_snapshot.json','utf8'));
assert.equal(data.inventoryTLDs,data.zoneMeasuredTLDs+data.missingZoneTLDs);
assert.equal(data.inventoryTLDs,data.unattributedTLDs+data.backends.reduce((n,r)=>n+r.tlds,0));
for(const [key,field] of [['web','top50Web'],['zones','top50Zones']]){
 const rows=data[field];assert.equal(rows.length,50);assert.equal(new Set(rows.map(r=>r.tld)).size,50);
 assert.equal(data.groups[key].reduce((n,r)=>n+r.tlds,0),50);
 assert.ok(rows.every(r=>['legacy','2000','2004','2012','cctld'].includes(r.cohort)));
 if(key==='zones')assert.ok(rows.every((r,i)=>Number.isInteger(r.domains)&&(!i||r.domains<=rows[i-1].domains)));
 else assert.ok(rows.every((r,i)=>r.sharePercent>0&&(!i||r.sharePercent<=rows[i-1].sharePercent)));
}
assert.equal(data.top50Zones[0].tld,'com');
assert.equal(data.top50Web.find(r=>r.tld==='ai').cohort,'cctld');
assert.equal(data.top50Zones.find(r=>r.tld==='mobi').cohort,'2004');
assert.equal(data.top50Zones.find(r=>r.tld==='pro').cohort,'2000');
const named=data.backends.filter(r=>r.attributionKind==='named-fingerprint');
for(const lang of ['', 'en/','it/','de/','fr/']){
 const text=fs.readFileSync(lang+'index.html','utf8'),{document}=parseHTML(text);
 for(const [key,field] of [['web','top50Web'],['zones','top50Zones']]){
  const panel=document.getElementById('market-'+key);assert.ok(panel,lang+key);
  assert.equal(panel.querySelectorAll('tbody tr').length,50);
  for(const r of data[field])assert.ok(panel.querySelector('[data-market-tld="'+r.tld+'"]'),lang+r.tld);
 }
 const payload=JSON.parse(document.getElementById('rsp-footprint-data').textContent);
 assert.equal(payload.rows.length,named.length);
 assert.deepEqual(payload.rows.map(r=>r.tlds),named.map(r=>r.tlds));
 assert.ok(document.querySelector('[data-mapmode="rspFootprint"]'));
 assert.ok(document.querySelector('#rsp-tld-footprint table'));
 assert.ok(document.querySelector('a[href*="tab=economics#tld-market-reach"]'));
 assert.ok(text.includes('tld-market.js'));
}
console.log('TLD_MARKET_VERIFIED',JSON.stringify({gTLDs:data.inventoryTLDs,namedPlatforms:named.length,unattributed:data.unattributedTLDs,rankings:2,rowsPerRanking:50,languages:4}));
