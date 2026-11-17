/* Record exact-file review for v0.8.0 String Confirmation candidate. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');process.chdir(root);
assert.ok(process.argv.includes('--record-reviewed-candidate'),'Explicit --record-reviewed-candidate required.');

const currentPath='docs/editorial-review-2026-11-17-v0.8.0.json';
const previousPath='docs/editorial-review-2026-11-12-v0.7.112.json';
const technicalBaseline='218ff4f302dd42ff7abf615cef123bc08f3bcf6b';
const pub=JSON.parse(fs.readFileSync('publication.json','utf8'));
assert.equal(pub.version,'0.8.0');
assert.equal(pub.releasedOn,'2026-11-17');
assert.equal(pub.editorialReviewPath,currentPath);
assert.equal(pub.researchRelease,'RR2');
assert.equal(pub.paperVersion,'1.4-draft');

const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const prior=JSON.parse(fs.readFileSync(previousPath,'utf8'));
const verify=require('./verify_ia_b2_parity.cjs');
const source=fs.readFileSync('src/index.web.html','utf8');
const sections=verify.sectionDigests(source);

const review=JSON.parse(JSON.stringify(prior));
review.reviewId='string-confirmation-2026-11-17-v0.8.0';
review.status='reviewed';
review.reviewedOn=pub.releasedOn;
review.publicationVersion=pub.version;
review.parentReview=previousPath;
review.priorTechnicalBaseline={version:'0.7.112',commit:technicalBaseline,reviewSHA256:sha(previousPath)};
review.reviewInstruction='Publish the separate String Confirmation technical/editorial layer from verified 17 November ICANN evidence while preserving Reveal Day, RR1/RR2 and unresolved discrepancies without inference.';
review.rationales=review.rationales||{};
review.rationales.SC80='Reviewed String Confirmation evidence transition: 17 November APS snapshot, nine withdrawals, 152 selected replacements, 226/705 public contention, timeline state and .lugano current status; preserve the four-application announcement/publication gap as unresolved.';
review.rationales.QA80='Reviewed deterministic v0.8.0 build, current-graph derivation, multilingual guards, evidence capture workflow, provenance, review finalization and publication metadata.';
review.rationales.V80='Publish a separate deterministic v0.8.0 technical package while keeping v0.7.112 and every earlier package, RR1/RR2, Reveal Day evidence and the scholarly paper revision immutable.';
review.rationales.M80='Reviewed methodological boundary: observed APS record status is not the replacement-eligibility denominator; aggregate differences are not converted into application-level identities without an authoritative mapping.';

review.linkReplacements=(review.linkReplacements||[]).map(x=>({
  ...x,
  publishedPath:x.publishedPath.replace(/v0\.7\.112/g,'v0.8.0').replace(/v0\.7\.111/g,'v0.8.0')
}));

for(const [id,value] of Object.entries(sections)){
  const old=review.sourceSections[id];
  assert.ok(old,'Missing protected source section '+id);
  value.baselineSHA256=old.baselineSHA256;
  value.baselineCharacters=old.baselineCharacters;
  value.rationaleIds=(old.sha256===value.sha256&&old.characters===value.characters)
    ? (old.rationaleIds||[])
    : [...new Set([...(old.rationaleIds||[]),'SC80'])];
  review.sourceSections[id]=value;
}
review.approvedCandidateSHA256=verify.sha256(source);

const changed=execFileSync('git',['diff','--name-only',technicalBaseline],{encoding:'utf8'}).trim().split('\n').filter(Boolean);
const untracked=execFileSync('git',['ls-files','--others','--exclude-standard'],{encoding:'utf8'}).trim().split('\n').filter(Boolean);
for(const file of [...new Set([...changed,...untracked])]){
  if(file===currentPath||file==='content-continuity-audit.json')continue;
  if(!fs.existsSync(file))throw new Error('Unreviewed removal in v0.8.0 candidate: '+file);
  let before=null;
  try{before=execFileSync('git',['show',technicalBaseline+':'+file]);}catch(_){}
  const priorItem=prior.files?.[file];
  const rationale=file.startsWith('downloads/connecting-the-dots-data-pack-v0.8.0')?'V80':
    (file.startsWith('.github/workflows/')||file.startsWith('scripts/')||file==='build.py')?'QA80':
    (file.includes('replacement')||file.includes('string_confirmation')||file.includes('string-confirmation'))?'M80':'SC80';
  review.files[file]={
    baselineSHA256:priorItem?.baselineSHA256 ?? (before===null?null:crypto.createHash('sha256').update(before).digest('hex')),
    sha256:sha(file),
    rationaleIds:[...new Set([...(priorItem?.rationaleIds||[]),rationale])]
  };
}
for(const [file,item] of Object.entries(review.files)){
  assert.ok(fs.existsSync(file),'Previously reviewed file missing: '+file);
  const next=sha(file);
  if(item.sha256!==next)item.rationaleIds=[...new Set([...(item.rationaleIds||[]),'SC80'])];
  item.sha256=next;
}

review.auditSummary={
  baseline:review.priorTechnicalBaseline,
  remediations:[
    'Added a separate post-String-Confirmation APS snapshot and current application graph without overwriting the Reveal Day evidence.',
    'Recorded nine withdrawals, 152 selected replacements and the 226/705 public contention state from exact official files.',
    'Preserved the four-application difference between ICANN announcement aggregates and public APS/contention files as an unresolved reconciliation finding.',
    'Advanced .lugano to its observed String Evaluation state with no identical-string contention.',
    'Kept RR2 current and RR3 in prepublication-review with no DOI; the working-paper scholarly revision remains 19 October 2026.',
    'Preserved the newest Field Notes dateModified across later render passes and removed unsupported application-level inference from the replacement-eligibility discussion.'
  ],
  archivePolicy:'Reveal Day evidence, RR1/RR2, v0.7.112 and every earlier technical package remain immutable; v0.8.0 is a new technical/editorial layer.'
};
review.verification={
  status:'source-and-generated-files-reviewed',
  reviewedOn:pub.releasedOn,
  sourceCommit:pub.sourceReviewCommit,
  reviewType:'AI-assisted String Confirmation release review',
  humanParticipants:0,
  protectedSourceSections:Object.keys(sections).length,
  reviewedSourceSections:Object.entries(review.sourceSections).filter(([,x])=>(x.rationaleIds||[]).includes('SC80')).map(([id])=>id),
  exactFiles:Object.keys(review.files).length,
  checks:[
    'python3 build.py',
    'node scripts/finalize_string_confirmation_v0800.cjs --record-reviewed-candidate',
    'python3 scripts/release_check.py',
    'node scripts/verify_ia_b2_parity.cjs',
    'python3 scripts/test_aps_current_analytics.py',
    'python3 -m unittest scripts.tests.test_aps_observatory',
    'node scripts/validate_multilingual.js',
    'node scripts/validate_discovery.cjs',
    'python3 scripts/test_public_surface.py'
  ],
  qualityGates:'Exact candidate review, PR browser/WCAG, focus/mobile, APS longitudinal integrity and archival/editorial parity must pass before merge; live Pages verification follows the protected merge.'
};
review.signoff={
  reviewedOn:pub.releasedOn,
  reviewType:'AI-assisted String Confirmation release review',
  sourceCommit:pub.sourceReviewCommit,
  humanParticipants:0,
  scope:review.reviewInstruction
};
review.buildProvenancePolicy={version:pub.version,sourceReviewCommit:pub.sourceReviewCommit,semantics:pub.buildProvenanceRole};

fs.writeFileSync(currentPath,JSON.stringify(review,null,2)+'\n');
verify.checkProtection(review,source,pub);
verify.validateReviewedFiles(review,pub);
console.log('STRING_CONFIRMATION_0800_REVIEW_RECORDED',JSON.stringify({
  files:Object.keys(review.files).length,
  sections:Object.keys(sections).length,
  sourceReviewCommit:pub.sourceReviewCommit,
  priorTechnicalBaseline:technicalBaseline
}));
