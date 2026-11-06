/* Exact-file signed-off candidate after source attribution and generated output review. */
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto'),cp=require('node:child_process');
const {checkProtection,validateReviewedFiles,sectionDigests}=require('./verify_ia_b2_parity.cjs');
const read=p=>fs.readFileSync(p,'utf8'),load=p=>JSON.parse(read(p)),sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const old=p=>cp.execFileSync('git',['show','HEAD:'+p],{maxBuffer:80*1024*1024});
const obj=load('publication.json'),original=JSON.parse(old('publication.json').toString());
assert.equal(obj.version,'0.7.97');assert.equal(obj.releasedOn,'2026-11-06');
const normalized={...obj};
for(const key of ['version','releasedOn','currentDataPackVersion','currentDataPackPath','editorialReviewPath','buildProvenanceCommit'])normalized[key]=original[key];
assert.deepEqual(normalized,original,'New release changed an unrelated publication property');
const source=load('data/round_debate_20261106.json');
assert.equal(source.editorialLayer,'living-commentary-not-official-APS-or-frozen-RR1-RR2');
assert.deepEqual(source.items.map(x=>x.kind),['stakeholder-request','stakeholder-analysis']);
assert.equal(source.items.length,2);assert.equal(source.sources.length,4);
assert.deepEqual(Object.keys(source.languages).sort(),['de','en','fr','it']);
for(const name of ['data/application_2026_snapshot.json','data/field_investigations.json','data/inside_the_round_events.json','data/applications_2026_aps_official_listing.csv','data/applications_2026_aps_official_provenance.json','data/aps_2026_current_analytics.json','research/research_release_manifest.json','CITATION.cff']){
 if(name==='research/research_release_manifest.json')continue; // Website version pointer is mutable; scientific DOI and archive invariants are separately protected.
 assert.deepEqual(fs.readFileSync(name),old(name),'Frozen source touched '+name);
}
const prev=JSON.parse(old('docs/editorial-review-2026-11-06-v0.7.96.json').toString());
const review=load(obj.editorialReviewPath);
assert.equal(review.status,'candidate-pending-editorial-signoff');
assert.deepEqual(review.immutableFiles,prev.immutableFiles);
assert.deepEqual(review.immutableJSON,prev.immutableJSON);
assert.deepEqual(review.sourceInvariants,prev.sourceInvariants);
assert.deepEqual(review.immutableResearchIdentifiers,prev.immutableResearchIdentifiers);
assert.ok(review.rationales.E97&&review.rationales.V97);
const translations=load('data/translations.json'),prevTranslations=JSON.parse(old('data/translations.json').toString());
for(const lang of ['en','it','de','fr']){assert.ok(translations[lang].release0797);delete translations[lang].release0797}
assert.deepEqual(translations,prevTranslations,'Translation keys beyond release note changed');
const history=load('data/release_history.json'),prevHistory=JSON.parse(old('data/release_history.json').toString());
assert.equal(history.releases[0].version,'0.7.97');
assert.deepEqual({...history,releases:history.releases.slice(1)},prevHistory,'Previous release history overwritten');
const frozen=load('data/frozen_technical_packages.json'),baseFrozen=JSON.parse(old('data/frozen_technical_packages.json').toString());
const oldZip='downloads/connecting-the-dots-data-pack-v0.7.96.zip';
assert.equal(frozen.files[oldZip],sha(oldZip),'Previous technical archive hash mismatch');
delete frozen.files[oldZip];assert.deepEqual(frozen,baseFrozen,'Prior locked archives were modified');
const changed=[];
for(const [file,rec] of Object.entries(review.files)){
 assert.ok(fs.existsSync(file),'Previously reviewed source missing: '+file);
 const actual=sha(file);
 if(actual!==rec.sha256){
  changed.push({path:file,previous:rec.sha256,current:actual});
  rec.sha256=actual;
  rec.rationaleIds=[...new Set([...rec.rationaleIds,/behind-the-round\/|(^|\/)index\.html$|build\.py$/.test(file)?'E97':'V97'])];
 }
}
const additional=['data/round_debate_20261106.json','scripts/render_round_debate_v0797.cjs','scripts/prepare_round_debate_v0797.cjs','scripts/review_round_debate_v0797.cjs','scripts/validate_round_debate_v0797.cjs','docs/round-debate-v0797-evidence.json','build.py',obj.currentDataPackPath,obj.currentDataPackPath.replace(/\.zip$/,'.sha256')];
for(const file of additional){
 assert.ok(fs.existsSync(file),'New reviewed source not found '+file);
 if(!review.files[file])review.files[file]={baselineSHA256:null,sha256:sha(file),rationaleIds:[file.includes('round_debate')||file.includes('debate')?'E97':'V97']};
}
const canonical=read('src/index.web.html');
for(const [id,fp] of Object.entries(sectionDigests(canonical))){
 assert.ok(review.sourceSections[id],'Original canonical chapter missing '+id);
 const rec=review.sourceSections[id];
 if(rec.sha256!==fp.sha256||rec.characters!==fp.characters){
  changed.push({path:'src/index.web.html#'+id,previous:rec.sha256,current:fp.sha256});
  rec.sha256=fp.sha256;rec.characters=fp.characters;
  rec.rationaleIds=[...new Set([...rec.rationaleIds,'V97'])];
 }
}
review.approvedCandidateSHA256=sha('src/index.web.html');
review.status='reviewed';
review.reviewInstruction='AI-assisted exact-file and source review: distinguish 4 November BRS/INTA stakeholder positions from pre-existing ICANN contention rules. No APS/2012 scientific data, .lugano outcome, frozen DOI or earlier archive modified. Independent A/B, browser/WCAG and live-byte checks required before main.';
review.verification={...review.verification,reviewedFiles:'Reviewed exact SHA-256 paths and citations for v0.7.97',reviewedPaths:Object.keys(review.files).length,changedPathsWithActualSourceHashes:changed.length,currentArchiveSHA256:sha(obj.currentDataPackPath),qualityGates:'Independent A/B, browser/WCAG and live-byte verification required'};
review.signoff={reviewDate:'2026-11-06',reviewer:'AI-assisted source and technical review',scope:'Two dated stakeholder positions in four languages on existing pages; ICANN rule distinguished from criticism',sources:source.sources.map(x=>x.url),humanParticipants:0,independentTests:'Must pass before main merge'};
const audit=load('docs/round-debate-v0797-evidence.json');
audit.reviewedPaths=Object.keys(review.files).length;audit.changedFingerprints=changed;audit.qualityGates='Exact source SHA-256 and scientific invariants passed; independent CI acceptance pending';
fs.writeFileSync('docs/round-debate-v0797-evidence.json',JSON.stringify(audit,null,2)+'\n');
review.files['docs/round-debate-v0797-evidence.json'].sha256=sha('docs/round-debate-v0797-evidence.json');
checkProtection(review,canonical,obj);
validateReviewedFiles(review,obj);
fs.writeFileSync(obj.editorialReviewPath,JSON.stringify(review,null,2)+'\n');
console.log('ROUND_2026_DEBATE_SOURCE_REVIEWED',JSON.stringify({translations:4,sources:4,changed:changed.length,files:Object.keys(review.files).length,protectedArchives:Object.keys(review.immutableFiles).length}));
