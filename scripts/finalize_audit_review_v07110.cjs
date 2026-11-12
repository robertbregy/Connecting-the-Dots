/* Explicit review recorder for v0.7.110 audit closure.
   Never call this from build.py. It records an already inspected/generated candidate. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');process.chdir(root);
assert.ok(process.argv.includes('--record-reviewed-candidate'),'Explicit --record-reviewed-candidate required.');
const currentPath='docs/editorial-review-2026-11-12-v0.7.110.json';
const previousPath='docs/editorial-review-2026-11-11-v0.7.109.json';
const baseline='5f1b3853bbbe9ff21f0c6bb689c1f23f96084a82';
const pub=JSON.parse(fs.readFileSync('publication.json','utf8'));
assert.equal(pub.version,'0.7.110');assert.equal(pub.releasedOn,'2026-11-12');assert.equal(pub.editorialReviewPath,currentPath);
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const prior=JSON.parse(fs.readFileSync(previousPath,'utf8'));
const verify=require('./verify_ia_b2_parity.cjs');
const source=fs.readFileSync('src/index.web.html','utf8');
const sectionDigests=verify.sectionDigests(source);
for(const [id,value] of Object.entries(sectionDigests)){
  if(id==='disputes') continue;
  assert.equal(value.sha256,prior.sourceSections[id]?.sha256,'Protected source chapter changed outside audited Disputed Dots bridge: '+id);
  assert.equal(value.characters,prior.sourceSections[id]?.characters,'Protected source chapter size changed outside audited Disputed Dots bridge: '+id);
}
assert.match(pub.buildProvenanceCommit,/^[a-f0-9]{40}$/);
execFileSync('git',['cat-file','-e',pub.buildProvenanceCommit+'^{commit}']);
const review=JSON.parse(JSON.stringify(prior));
review.reviewId='audit-close-2026-11-12-v0.7.110';
review.status='reviewed';review.reviewedOn=pub.releasedOn;review.publicationVersion=pub.version;
review.parentReview=previousPath;
review.priorTechnicalBaseline={version:'0.7.109',commit:baseline,reviewSHA256:sha(previousPath)};
review.reviewInstruction='Close the post-v0.7.109 audit before String Confirmation Day: fix the remaining light-theme contrast defect; align README, changelog and release-history semantics; make source-health versioning dynamic; sharpen the 2026 Legal timing and terminology using primary ICANN procedural sources; and remove duplicated procedural exposition from Disputed Dots while preserving its historical cases. Preserve APS/IANA snapshots, RR1/RR2, historic evidence, all earlier technical packages and every other protected source chapter.';
review.rationales=review.rationales||{};
review.rationales.AUD110='Reviewed audit-close corrections for accessibility, release semantics, maintainability and source-version consistency.';
review.rationales.LEGAL110='Reviewed 2026 Legal timing/glossary clarification and the direct Disputed Dots-to-Legal bridge. Historical dispute cases and frozen evidence remain unchanged.';
review.rationales.V110='Separate deterministic v0.7.110 technical package; v0.7.109 and all earlier packages remain immutable.';
review.rationales.QA110='Add release-integrity guards so the audited semantic mismatches cannot silently recur.';
review.linkReplacements=(review.linkReplacements||[]).map(x=>({...x,publishedPath:x.publishedPath.replace(/v0\.7\.109/g,'v0.7.110')}));
review.approvedCandidateSHA256=verify.sha256(source);
review.sourceSections=review.sourceSections||{};
const disputes=review.sourceSections.disputes;
assert.ok(disputes,'Prior Disputed Dots review record missing');
review.sourceSections.disputes={...disputes,sha256:sectionDigests.disputes.sha256,characters:sectionDigests.disputes.characters,
  rationaleIds:[...new Set([...(disputes.rationaleIds||[]),'LEGAL110'])]};
review.files=review.files||{};
const changed=execFileSync('git',['diff','--name-only',baseline],{encoding:'utf8'}).trim().split('\n').filter(Boolean);
for(const file of changed){
  if(file===currentPath||file==='content-continuity-audit.json') continue;
  assert.ok(fs.existsSync(file),'Audit-close release does not authorize removals: '+file);
  let before=null; try{before=execFileSync('git',['show',baseline+':'+file]);}catch(_){}
  const priorItem=prior.files?.[file];
  const rationale=file.startsWith('downloads/connecting-the-dots-data-pack-v0.7.110')?['V110']:
    file==='data/legal_layer.json'||file==='scripts/render_legal_layer.py'||file==='src/index.web.html'||file==='data/translations.json'?['LEGAL110']:
    file==='scripts/release_check.py'||file==='scripts/check_external_sources.py'||file==='scripts/prepare_audit_v07110.py'?['AUD110','QA110']:
    ['AUD110'];
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
  if(item.sha256!==next)item.rationaleIds=[...new Set([...(item.rationaleIds||[]),'AUD110'])];
  item.sha256=next;
}
review.auditSummary={
  baseline:review.priorTechnicalBaseline,
  remediations:[
    'Correct the remaining light-theme word-mark contrast defect.',
    'Align human-readable and machine-readable release chronology, including the omitted v0.7.107 entry and dedicated v0.7.109/v0.7.110 release keys.',
    'Derive the source-health User-Agent version from package metadata instead of a hard-coded release.',
    'Clarify the multiple 2026 objection clocks, Independent Objector extension, singular/plural timing and five core Legal terms.',
    'Replace duplicated procedural exposition in Disputed Dots with a direct bridge to the dedicated Legal chapter.'
  ],
  deferred:['The post-17-November String Confirmation data reconciliation remains a separate release and must use new official snapshots only when available.'],
  archivePolicy:'APS/IANA evidence, RR1/RR2, historical dispute evidence and every earlier technical package remain immutable.'
};
review.verification={status:'source-and-generated-files-reviewed',reviewedOn:pub.releasedOn,sourceCommit:pub.buildProvenanceCommit,
 reviewType:'AI-assisted full audit closure and generated-output review',humanParticipants:0,
 protectedSourceSections:Object.keys(sectionDigests).length,reviewedSourceSections:['disputes'],exactFiles:Object.keys(review.files).length,
 checks:['python3 build.py','python3 scripts/release_check.py','node scripts/verify_ia_b2_parity.cjs','node scripts/validate_multilingual.js','node scripts/validate_discovery.cjs','python3 scripts/test_public_surface.py','python3 scripts/test_external_source_health.py','node scripts/test_reading_controls.cjs'],
 qualityGates:'All protected PR checks must pass on the exact final candidate. Actual Pages deployment and verified live bytes must follow the protected merge.'};
review.signoff={reviewedOn:pub.releasedOn,reviewType:'AI-assisted authorized audit closure',sourceCommit:pub.buildProvenanceCommit,humanParticipants:0,scope:review.reviewInstruction};
review.buildProvenancePolicy={version:pub.version,sourceCommit:pub.buildProvenanceCommit,semantics:'Pinned branch revision used for deterministic regeneration immediately before explicit review recording.'};
verify.checkProtection(review,source,pub);
verify.validateReviewedFiles(review,pub);
fs.writeFileSync(currentPath,JSON.stringify(review,null,2)+'\n');
console.log('AUDIT_REVIEW_07110_RECORDED',JSON.stringify({files:Object.keys(review.files).length,sections:Object.keys(sectionDigests).length,sourceCommit:pub.buildProvenanceCommit}));
