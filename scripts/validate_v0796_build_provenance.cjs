/* Standalone source-provenance/chronological acceptance check for v0.7.96.
   This QA helper does not modify source, science or published HTML. */
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),path=require('node:path');
const {parseHTML}=require('linkedom');
const pub=JSON.parse(fs.readFileSync('publication.json','utf8'));
const expected=['wikileaks-2008','wikileaks-2010','catalonia-2017','china-2023','russia-2024','iran-2025','swiss-2026'];
const cases=JSON.parse(fs.readFileSync('data/internet_access_explainer.json','utf8')).cases;
assert.deepEqual(cases.map(x=>x.id),expected);
assert.equal(pub.version,'0.7.96');
assert.match(pub.buildProvenanceCommit,/^[0-9a-f]{40}$/);
const runtime=fs.readFileSync('data/publication.js','utf8');
assert.ok(runtime.includes("commit:'"+pub.buildProvenanceCommit+"'"),'Build source revision must remain reproducible');
for(const lang of ['en','it','de','fr']){
 const html=fs.readFileSync(path.join('behind-the-round',lang,'who-controls-internet-access','index.html'),'utf8');
 const {document:d}=parseHTML(html);
 assert.deepEqual([...d.querySelectorAll('[data-access-case]')].map(e=>e.getAttribute('data-access-case')),expected);
}
console.log('V0796_CHRONOLOGY_AND_BUILD_PROVENANCE_PASS');
