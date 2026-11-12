/* Explicit review recorder for v0.7.111 Legal localization sweep. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');process.chdir(root);
assert.ok(process.argv.includes('--record-reviewed-candidate'),'Explicit --record-reviewed-candidate required.');
const currentPath='docs/editorial-review-2026-11-12-v0.7.111.json';
const previousPath='docs/editorial-review-2026-11-12-v0.7.110.json';
const baseline='513f64df48fe62f4c2efab73130288c4e13c5708';
const pub=JSON.parse(fs.readFileSync('publication.json','utf8'));
assert.equal(pub.version,'0.7.111');assert.equal(pub.releasedOn,'2026-11-12');assert.equal(pub.editorialReviewPath,currentPath);
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const prior=JSON.parse(fs.readFileSync(previousPath,'utf8'));
const verify=require('./verify_ia_b2_parity.cjs');
const source=fs.readFileSync('src/index.web.html','utf8');
const sectionDigests=verify.sectionDigests(source);
for(const [id,value] of Object.entries(sectionDigests)){
  assert.equal(value.sha256,prior.sourceSections[id]?.sha256,'Protected source chapter changed during localization sweep: '+id);
  assert.equal(value.characters,prior.sourceSections[id]?.characters,'Protected source chapter size changed during localization sweep: '+id);
}
assert.match(pub.buildProvenanceCommit,/^[a-f0-9]{40}$/);
execFileSync('git',['cat-file','-e',pub.buildProvenanceCommit+'^{commit}']);
const review=JSON.parse(JSON.stringify(prior));
review.reviewId='legal-localization-2026-11-12-v0.7.111';
review.status='reviewed';review.reviewedOn=pub.releasedOn;review.publicationVersion=pub.version;
review.parentReview=previousPath;
review.priorTechnicalBaseline={version:'0.7.110',commit:baseline,reviewSHA256:sha(previousPath)};
review.reviewInstruction='Perform a complete consistency sweep of the newly created Legal pages after detecting English editorial labels on non-English pages. Localize interface badges in EN/IT/DE/FR, deduplicate repeated source chips, add regression guards against cross-language UI leakage, and preserve official procedural names where they are proper names. Preserve all protected source chapters, APS/IANA snapshots, RR1/RR2 and previous technical packages.';
review.rationales=review.rationales||{};
review.rationales.LOC111='Reviewed four-language Legal interface localization and source-chip deduplication. Official ICANN/WIPO/ICC procedure names remain untranslated where appropriate.';
review.rationales.QA111='Added deterministic checks that reject English Legal UI badge leakage on Italian, German and French standalone pages.';
review.rationales.V111='Separate deterministic v0.7.111 technical package; v0.7.110 and all earlier packages remain immutable.';
review.linkReplacements=(review.linkReplacements||[]).map(x=>({...x,publishedPath:x.publishedPath.replace(/v0\.7\.110/g,'v0.7.111')}));
review.approvedCandidateSHA256=verify.sha256(source);
review.files=review.files||{};
const changed=execFileSync('git',['diff','--name-only',baseline],{encoding:'utf8'}).trim().split('\n').filter(Boolean);
for(const file of changed){
  if(file===currentPath||file==='content-continuity-audit.json')continue;
  assert.ok(fs.existsSync(file),'Localization release does not authorize removals: '+file);
  let before=null;try{before=execFileSync('git',['show',baseline+':'+file]);}catch(_){}
  const priorItem=prior.files?.[file];
  const rationale=file.startsWith('downloads/connecting-the-dots-data-pack-v0.7.111')?['V111']:
    file==='data/legal_layer.json'||file==='scripts/render_legal_layer.py'||file==='data/translations.json'?['LOC111']:
    file==='scripts/release_check.py'||file==='scripts/prepare_localization_v07111.py'?['LOC111','QA111']:
    ['LOC111'];
  review.files[file]={
    baselineSHA256:priorItem?.baselineSHA256 ?? (before===null?null:crypto.createHash('sha256').update(before).digest('hex')),
    sha256:sha(file),
    rationaleIds:[...new Set([...(priorItem?.rationaleIds||[]),...rationale])],
    ...(priorItem?.priorTechnicalSHA256?{priorTechnicalSHA256:priorItem.priorTechnicalSHA256}:{})
  };
}
for(const [file,item] of Object.entries(review.files)){
  assert.ok(fs.existsSync(file),'Previously reviewed file missing: '+file);
  const next=sha(file);
  if(item.sha256!==next)item.rationaleIds=[...new Set([...(item.rationaleIds||[]),'LOC111'])];
  item.sha256=next;
}
review.auditSummary={
 baseline:review.priorTechnicalBaseline,
 remediations:[
  'Localize Procedure, Reading and Contract badges in all four Legal page languages.',
  'Remove accidental repeated Independent Objectors and Singular/Plural source chips.',
  'Add build-time assertions preventing English editorial UI badge leakage into IT/DE/FR Legal pages.'
 ],
 deferred:['Post-17-November String Confirmation data reconciliation remains a separate evidence update.'],
 archivePolicy:'APS/IANA evidence, RR1/RR2 and every earlier technical package remain immutable.'
};
review.verification={status:'source-and-generated-files-reviewed',reviewedOn:pub.releasedOn,sourceCommit:pub.buildProvenanceCommit,
 reviewType:'AI-assisted multilingual consistency and generated-output review',humanParticipants:0,
 protectedSourceSections:Object.keys(sectionDigests).length,reviewedSourceSections:[],exactFiles:Object.keys(review.files).length,
 checks:['python3 build.py','python3 scripts/release_check.py','node scripts/verify_ia_b2_parity.cjs','node scripts/validate_multilingual.js','node scripts/validate_discovery.cjs'],
 qualityGates:'All protected PR checks must pass on the exact candidate; Pages deployment and live-byte verification follow merge.'};
review.signoff={reviewedOn:pub.releasedOn,reviewType:'AI-assisted localization consistency review',sourceCommit:pub.buildProvenanceCommit,humanParticipants:0,scope:review.reviewInstruction};
review.buildProvenancePolicy={version:pub.version,sourceCommit:pub.buildProvenanceCommit,semantics:'Pinned branch revision used for deterministic regeneration immediately before explicit review recording.'};
verify.checkProtection(review,source,pub);verify.validateReviewedFiles(review,pub);
fs.writeFileSync(currentPath,JSON.stringify(review,null,2)+'\n');
console.log('LOCALIZATION_REVIEW_07111_RECORDED',JSON.stringify({files:Object.keys(review.files).length,sections:Object.keys(sectionDigests).length}));
