/* Exact-file review and content-preservation proof for v0.7.96 after generation. */
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto'),cp=require('node:child_process');
const {checkProtection,validateReviewedFiles,sectionDigests}=require('./verify_ia_b2_parity.cjs');
const load=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const old=p=>JSON.parse(cp.execFileSync('git',['show','HEAD:'+p],{maxBuffer:60*1024*1024}).toString('utf8'));
const pub=load('publication.json');
const prev=old('data/internet_access_explainer.json'),now=load('data/internet_access_explainer.json');
assert.equal(pub.version,'0.7.96');assert.equal(pub.releasedOn,'2026-11-06');
const sequence=['wikileaks-2008','wikileaks-2010','catalonia-2017','china-2023','russia-2024','iran-2025','swiss-2026'];
assert.deepEqual(now.cases.map(x=>x.id),sequence);
const oldMap=new Map(prev.cases.map(x=>[x.id,JSON.stringify(x)]));
assert.equal(oldMap.size,7);for(const c of now.cases)assert.equal(JSON.stringify(c),oldMap.get(c.id),'Case evidence changed: '+c.id);
const normalized=structuredClone(now);
normalized.cases=prev.cases;
normalized.reviewedOn=prev.reviewedOn;
for(const lang of ['it','en','de','fr']){
 assert.ok(normalized.languages[lang].examplesLead.toLowerCase().includes(lang==='en'?'chronological':lang==='de'?'chronologisch':lang==='fr'?'chronologique':'cronologico'));
 normalized.languages[lang].examplesLead=prev.languages[lang].examplesLead;
}
assert.deepEqual(normalized,prev,'New facts or changes outside case order + localized lead were introduced');
const tr=load('data/translations.json'),baseTr=old('data/translations.json');
for(const lang of ['en','it','de','fr']){
 assert.ok(tr[lang].release0796);
 delete tr[lang].release0796;
}
assert.deepEqual(tr,baseTr,'An unrelated translation changed');
const history=load('data/release_history.json'),baseHistory=old('data/release_history.json');
assert.equal(history.releases[0].version,'0.7.96');
assert.deepEqual({...history,releases:history.releases.slice(1)},baseHistory,'Earlier release history changed');
const frozen=load('data/frozen_technical_packages.json'),baseFrozen=old('data/frozen_technical_packages.json');
const oldPack='downloads/connecting-the-dots-data-pack-v0.7.95.zip';
assert.equal(frozen.files[oldPack],sha(oldPack));
delete frozen.files[oldPack];assert.deepEqual(frozen,baseFrozen,'Existing archive locks changed');
const oldPub=old('publication.json'),normalizedPub=structuredClone(pub);
for(const k of ['version','releasedOn','currentDataPackVersion','currentDataPackPath','editorialReviewPath'])normalizedPub[k]=oldPub[k];
assert.deepEqual(normalizedPub,oldPub,'Unreviewed publication property change');

const review=load(pub.editorialReviewPath);
assert.equal(review.status,'candidate-pending-editorial-signoff');
assert.equal(review.publicationVersion,'0.7.96');
assert.ok(review.rationales.C96 && review.rationales.V96);
const changed=[];
for(const [p,record] of Object.entries(review.files)){
 assert.ok(fs.existsSync(p),'Missing previously reviewed path: '+p);
 const actual=sha(p);
 if(actual!==record.sha256){
  changed.push({path:p,old:record.sha256,new:actual});
  record.sha256=actual;
  record.rationaleIds=[...new Set([...record.rationaleIds,p==='data/internet_access_explainer.json'||p.includes('who-controls-internet-access')?'C96':'V96'])];
 }
}
const additional=['scripts/prepare_access_chronology_v0796.cjs','scripts/review_access_chronology_v0796.cjs','scripts/validate_access_chronology_v0796.cjs','docs/access-chronology-v0796-evidence.json',pub.currentDataPackPath,pub.currentDataPackPath.replace(/\.zip$/,'.sha256')];
for(const p of additional){
 assert.ok(fs.existsSync(p),'Missing new artifact '+p);
 if(!review.files[p])review.files[p]={baselineSHA256:null,sha256:sha(p),rationaleIds:[p.includes('chronology')?'C96':'V96']};
}
const source=fs.readFileSync('src/index.web.html','utf8');
for(const [id,fp] of Object.entries(sectionDigests(source))){
 assert.ok(review.sourceSections[id],'Unreviewed canonical section '+id);
 const record=review.sourceSections[id];
 if(record.sha256!==fp.sha256||record.characters!==fp.characters){
  changed.push({path:'src/index.web.html#'+id,old:record.sha256,new:fp.sha256});
  record.sha256=fp.sha256;record.characters=fp.characters;
  record.rationaleIds=[...new Set([...record.rationaleIds,'V96'])];
 }
}
review.approvedCandidateSHA256=sha('src/index.web.html');
review.status='reviewed';
review.reviewInstruction='Reviewed chronological array and four localized lead changes against previous exact source. Immutable factual cases, citations, DOI, source sections, historical technical ZIPs and 2012/2026 APS datasets protected. Independent browser/WCAG and A/B CI still required before main publication.';
review.verification={...review.verification,reviewedFiles:'Exact 0.7.96 source/content and generated SHA-256 recorded',reviewedPaths:Object.keys(review.files).length,changedPathsWithActualSourceHashes:changed.length,qualityGates:'Independent A/B, browsers and live-byte smoke must pass before closing release',currentArchiveSHA256:sha(pub.currentDataPackPath)};
review.signoff={reviewDate:'2026-11-06',reviewer:'AI-assisted source and layout review',scope:'Existing seven cases sorted without factual modifications; four introductory translations',evidence:'docs/access-chronology-v0796-evidence.json',humanParticipants:0,independentTests:'Required before merging to main'};
checkProtection(review,source,pub);
validateReviewedFiles(review,pub);
fs.writeFileSync(pub.editorialReviewPath,JSON.stringify(review,null,2)+'\n');
const audit=load('docs/access-chronology-v0796-evidence.json');
for(const c of now.cases)assert.equal(audit.caseFingerprints[c.id],crypto.createHash('sha256').update(JSON.stringify(c)).digest('hex'),'Reviewed event fingerprint drift');
audit.changedFileFingerprints=changed;
audit.reviewedPaths=Object.keys(review.files).length;
audit.qualityGates='exact hash and protected research checks passed; independent A/B and browser tests still required';
fs.writeFileSync('docs/access-chronology-v0796-evidence.json',JSON.stringify(audit,null,2)+'\n');
// Recompute exact evidence-document hash after recording the detailed review.
review.files['docs/access-chronology-v0796-evidence.json'].sha256=sha('docs/access-chronology-v0796-evidence.json');
validateReviewedFiles(review,pub);
fs.writeFileSync(pub.editorialReviewPath,JSON.stringify(review,null,2)+'\n');
console.log('ACCESS_CHRONOLOGY_REVIEWED',JSON.stringify({sevenCases:sequence,lang:4,changed:changed.length,protectedFiles:Object.keys(review.immutableFiles).length,reviewFiles:Object.keys(review.files).length}));
