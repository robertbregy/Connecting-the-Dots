/* Record exact-file review for v0.7.112 pre-String-Confirmation freeze. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');process.chdir(root);
assert.ok(process.argv.includes('--record-reviewed-candidate'),'Explicit --record-reviewed-candidate required.');

const currentPath='docs/editorial-review-2026-11-12-v0.7.112.json';
const previousPath='docs/editorial-review-2026-11-12-v0.7.111.json';
const baseline='1b70fec8b45d9ef2102573fc3ccd7a0112c3d180';
const pub=JSON.parse(fs.readFileSync('publication.json','utf8'));
assert.equal(pub.version,'0.7.112');assert.equal(pub.releasedOn,'2026-11-12');assert.equal(pub.editorialReviewPath,currentPath);
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const prior=JSON.parse(fs.readFileSync(previousPath,'utf8'));
const verify=require('./verify_ia_b2_parity.cjs');
const source=fs.readFileSync('src/index.web.html','utf8');
const sections=verify.sectionDigests(source);

const review=JSON.parse(JSON.stringify(prior));
review.reviewId='pre-string-confirmation-freeze-2026-11-12-v0.7.112';
review.status='reviewed';review.reviewedOn=pub.releasedOn;review.publicationVersion=pub.version;
review.parentReview=previousPath;
review.priorTechnicalBaseline={version:'0.7.111',commit:baseline,reviewSHA256:sha(previousPath)};
review.reviewInstruction='Close the final pre-String-Confirmation audit without changing frozen research evidence: localize Research entry pages, separate scholarly paper revision from operational technical synchronization, clarify provenance semantics.';
review.rationales=review.rationales||{};
review.rationales.FREEZE112='Reviewed final pre-String-Confirmation cleanup: multilingual Research entry, paper/technical date semantics, provenance clarity and bounded performance deferral.';
review.rationales.QA112='Reviewed deterministic guards for sitemap, hreflang, localized Research and release metadata.';
review.rationales.V112='Separate deterministic v0.7.112 technical package; v0.7.111 and all earlier packages remain immutable.';
review.linkReplacements=(review.linkReplacements||[]).map(x=>({...x,publishedPath:x.publishedPath.replace(/v0\.7\.111/g,'v0.7.112')}));

for(const [id,value] of Object.entries(sections)){
 const old=review.sourceSections[id];assert.ok(old,'Missing protected source section '+id);
 value.baselineSHA256=old.baselineSHA256;value.baselineCharacters=old.baselineCharacters;
 value.rationaleIds=old.sha256===value.sha256&&old.characters===value.characters?(old.rationaleIds||[]):[...(old.rationaleIds||[]),'FREEZE112'];
 review.sourceSections[id]=value;
}
review.approvedCandidateSHA256=verify.sha256(source);

const changed=execFileSync('git',['diff','--name-only',baseline],{encoding:'utf8'}).trim().split('\n').filter(Boolean);
for(const file of changed){
 if(file===currentPath||file==='content-continuity-audit.json')continue;
 if(!fs.existsSync(file))throw new Error('Unreviewed removal in freeze release: '+file);
 let before=null;try{before=execFileSync('git',['show',baseline+':'+file]);}catch(_){}
 const priorItem=prior.files?.[file];
 const rationale=file.startsWith('downloads/connecting-the-dots-data-pack-v0.7.112')?'V112':
   (file.includes('release_check')||file.includes('prepare_pre_string')||file.includes('finalize_pre_string')||file.includes('workflow'))?'QA112':'FREEZE112';
 review.files[file]={
   baselineSHA256:priorItem?.baselineSHA256 ?? (before===null?null:crypto.createHash('sha256').update(before).digest('hex')),
   sha256:sha(file),
   rationaleIds:[...new Set([...(priorItem?.rationaleIds||[]),rationale])]
 };
}
for(const [file,item] of Object.entries(review.files)){
 assert.ok(fs.existsSync(file),'Previously reviewed file missing: '+file);
 const next=sha(file);if(item.sha256!==next)item.rationaleIds=[...new Set([...(item.rationaleIds||[]),'FREEZE112'])];item.sha256=next;
}
review.auditSummary={
 baseline:review.priorTechnicalBaseline,
 remediations:[
  'Localized Research & citation entry pages for IT, DE and FR while keeping the canonical working paper in English.',
  'Separated scholarly working-paper revision date from operational technical-reference synchronization.',
  'Made source-review provenance semantics explicit instead of implying that the embedded commit is the published merge commit.',
 ],
 archivePolicy:'APS/IANA evidence, RR1/RR2, Reveal Day snapshots and every earlier technical package remain immutable.'
};
review.verification={status:'source-and-generated-files-reviewed',reviewedOn:pub.releasedOn,sourceCommit:pub.sourceReviewCommit,reviewType:'AI-assisted pre-String-Confirmation release review',humanParticipants:0,protectedSourceSections:Object.keys(sections).length,reviewedSourceSections:[],exactFiles:Object.keys(review.files).length,checks:['python3 build.py','python3 scripts/release_check.py','node scripts/verify_ia_b2_parity.cjs','node scripts/validate_multilingual.js','node scripts/validate_discovery.cjs','python3 scripts/test_public_surface.py','node scripts/test_reading_controls.cjs','node scripts/audit_v07108_qa.cjs','node scripts/audit_performance_20261019.cjs'],qualityGates:'All exact-candidate checks must pass before merge; live Pages verification follows the protected merge.'};
review.signoff={reviewedOn:pub.releasedOn,reviewType:'AI-assisted pre-String-Confirmation freeze review',sourceCommit:pub.sourceReviewCommit,humanParticipants:0,scope:review.reviewInstruction};
review.buildProvenancePolicy={version:pub.version,sourceReviewCommit:pub.sourceReviewCommit,semantics:pub.buildProvenanceRole};
verify.checkProtection(review,source,pub);verify.validateReviewedFiles(review,pub);
fs.writeFileSync(currentPath,JSON.stringify(review,null,2)+'\n');
console.log('PRE_STRING_FREEZE_07112_RECORDED',JSON.stringify({files:Object.keys(review.files).length,sections:Object.keys(sections).length,sourceReviewCommit:pub.sourceReviewCommit}));
