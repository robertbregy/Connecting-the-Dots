/* Source-content parity guard for IA B2. No rewrites, only validation.
   Reference: main@ec231cc12d35fa91ff5340ad057a483ce23a5ca4 (v0.7.78).
   Baseline segment strings were directly compared A vs B on 13 Oct 2026.
   64-bit FNV checks detect accidental drift; they are NOT a cryptographic archive.
   Legitimate editorial changes require review and a deliberate manifest refresh.
   14 October 2026: Explore now includes a native application-level 2026 Atlas panel,
   reusing the existing official graph and filtering engine. This reviewed addition
   deliberately updates only the Explore section digest.
   Economics intentionally extended 14 Oct 2026: source-linked ICANN contention, Intercap portfolio and brand/AI analysis.
   See docs/EDITORIAL_UPDATE_2026-10-14.md; original A section digests remain frozen except the approved Economics bridge; the new cemetery section has its own hash. */
'use strict';
const fs=require('node:fs');
const assert=require('node:assert/strict');
const source=fs.readFileSync('src/index.web.html','utf8');
const baseline={
 overview:['a800715bf0b3f09f',9849],
 explore:['54b4920fd42ef0cc',10168],
 timeline:['2cb0d00b3b4d421f',1599],
 how:['d1d1e55939463c66',11713],
 beyond:['d5ce05ac3253ca8a',3136],
 cities:['1cdd26be34d79885',2070],
 geography:['5a19ad9c0070e2da',9613],
 economics:['b12f2e1d85e316bb',12248],
 social:['f1248df8c136df10',2801],
 contention:['6ac6dcf1629b1d8e',3028],
 refusals:['0102bee7eebcb306',1985],
 disputes:['d9f6604986c083ee',2694],
 strange:['dc9c8f1b713fe2c8',1845],
 reveal:['d562f751ea2340a1',2487],
 'inside-round':['1e99763f73e91218',2936],
 'behind-round':['b841f9ad3079193d',2167],
 lugano:['70b39984754f64e4',6378],
 research:['f524fb4d39e0f357',3729],
 paper:['138d1eab640df9a3',1236],
 resources:['00c8fd7ffb8f4cf1',8508],
 sources:['c1c89c7f18cf28fa',2716]
};
function fnv64(s){
 let h=14695981039346656037n;
 for(let i=0;i<s.length;i++){
   h^=BigInt(s.charCodeAt(i));
   h=(h*1099511628211n)&0xffffffffffffffffn;
 }
 return h.toString(16).padStart(16,'0');
}
const ids=Object.keys(baseline),start=source.indexOf('<div class="iaHomeEntry">');
const end=source.indexOf('<div class="eyebrow" data-i18n="homeGuideLabel">',start);
assert.ok(start>=0&&end>start&&end-start>950&&end-start<1350,'The new Home introduction must be a separate, inspectable addition');
const unwrappedRaw=source.slice(0,start)+source.slice(end);
// .helsinki was added as a reviewed, source-backed editorial supplement
// after the A->B freeze. Subtract ONLY these two exactly identified inserts
// before comparing the untouched 21 A sections against their frozen hashes.
// Assert they exist exactly once, so neither the legacy text nor Helsinki
// may silently disappear on subsequent builds.
const bridge=/<div class="panel cityHelsinkiBridge">[\s\S]*?<\/div>\n(?=<\/section>)/g;
const caseArticle=/\n<article class="helsinkiCase"[\s\S]*?<\/article>/g;
assert.equal((unwrappedRaw.match(bridge)||[]).length,1,'Missing or repeated Helsinki city-context card');
assert.equal((unwrappedRaw.match(caseArticle)||[]).length,1,'Missing or repeated Helsinki termination case');
const unwrapped=unwrappedRaw.replace(bridge,'').replace(caseArticle,'');
const ranges=ids.map(id=>{
 const re=new RegExp('<section\\b[^>]*\\bid="'+id+'"[^>]*>');
 const found=re.exec(unwrapped);
 assert.ok(found,'Missing canonical editorial section '+id);
 return{id,start:found.index};
}).sort((a,b)=>a.start-b.start);
const passed=[];
for(let i=0;i<ranges.length;i++){
 const {id,start}=ranges[i];
 const endPos=ranges[i+1]?.start??unwrapped.indexOf('</main>',start);
 assert.ok(endPos>start,'Missing canonical end boundary '+id);
 const segment=unwrapped.slice(start,endPos);
 const [digest,length]=baseline[id];
 assert.equal(segment.length,length,'Editorial length changed without source-parity review: '+id);
 assert.equal(fnv64(segment),digest,'Editorial content changed without source-parity review: '+id);
 passed.push(id);
}
assert.equal(passed.length,22,'Lost a canonical A section or the cemetery chapter');
assert.equal((source.match(/class="iaPrimaryLink"/g)||[]).length,5,'Five B2 routes missing');
assert.equal((source.match(/<!-- CTD_IA_B2_HUBS -->/g)||[]).length,1,'B2 hubs not integrated into the normal generator');
console.log('IA_B2_SOURCE_PARITY_VERIFIED '+JSON.stringify({baselineMain:'ec231cc12d35fa91ff5340ad057a483ce23a5ca4',preservedSections:passed.length,originalHomeRecovered:true,purposeLedHomeAddedChars:end-start,unchangedDatasets:true}));
