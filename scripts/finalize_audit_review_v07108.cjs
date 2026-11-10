/* Release-specific, explicitly invoked recording of a reviewed candidate.
   Never run this from build.py: a rebuild must validate, not approve, its output. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');process.chdir(root);
assert.ok(process.argv.includes('--record-reviewed-candidate'),'Inspect source/generated differences and validation evidence, then explicitly use --record-reviewed-candidate.');
const currentPath='docs/editorial-review-2026-11-10-v0.7.108.json';
const previousPath='docs/editorial-review-2026-11-09-v0.7.107.json';
const pub=JSON.parse(fs.readFileSync('publication.json','utf8'));
assert.equal(pub.version,'0.7.108');assert.equal(pub.releasedOn,'2026-11-10');
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
assert.equal(sha(previousPath),'0be6e941d94d289207912923527438d7c6cbdb169bce087e2be219ac84c7a8bc','The prior editorial review is immutable.');
const prior=JSON.parse(fs.readFileSync(previousPath,'utf8'));
const verify=require('./verify_ia_b2_parity.cjs');
const source=fs.readFileSync('src/index.web.html','utf8');
const sectionDigests=verify.sectionDigests(source);
for(const [id,value]of Object.entries(sectionDigests)){
 assert.equal(value.sha256,prior.sourceSections[id]?.sha256,'Protected chapter text unexpectedly changed: '+id);
 assert.equal(value.characters,prior.sourceSections[id]?.characters,'Protected chapter size unexpectedly changed: '+id);
}
assert.match(pub.buildProvenanceCommit,/^[a-f0-9]{40}$/);
execFileSync('git',['cat-file','-e',pub.buildProvenanceCommit+'^{commit}']);
const sourcePub=JSON.parse(execFileSync('git',['show',pub.buildProvenanceCommit+':publication.json'],{encoding:'utf8'}));
assert.equal(sourcePub.version,pub.version,'Build provenance must identify an actual v0.7.108 source revision.');
const review=JSON.parse(JSON.stringify(prior));
review.reviewId='full-surface-audit-2026-11-10-v0.7.108';
review.status='reviewed';review.reviewedOn=pub.releasedOn;review.publicationVersion=pub.version;
review.parentReview=previousPath;
review.priorTechnicalBaseline={version:'0.7.107',commit:'97db07f41e228cb503413a58a861e1f40dcc046d',reviewSHA256:sha(previousPath)};
review.reviewInstruction='Complete the authorized 10 November audit remediation: clear dated snapshots, consistent reading-page controls and labels, corrected multilingual navigation and copy, discoverable Reader Study and .meow story, shared CSS preserving cascade, explicit public payload, source-health and freshness checks. Preserve scientific evidence and original source section inventories. Required PR, actual deployment and live-byte gates are separate from this AI-assisted source review.';
review.rationales.AUD108='Reviewed technical/editorial audit remediation; no new application outcomes or archived research findings. Source chapter bodies and immutable datasets/archives are preserved.';
review.rationales.V108='Separate deterministic v0.7.108 package, preserving the published v0.7.107 package and every previous archive.';
review.linkReplacements=review.linkReplacements.map(x=>({...x,publishedPath:x.publishedPath.replace(/v0\.7\.107/g,'v0.7.108')}));
review.approvedCandidateSHA256=verify.sha256(source);
// Original baseline fingerprints, sections, source invariants and immutable
// scientific inventories are inherited verbatim, checked before recording.
verify.checkProtection(review,source,pub);
const additions=[
 '.github/workflows/external-source-health.yml',
 'scripts/audit_remediation_v07108.cjs','scripts/check_external_sources.py',
 'scripts/finalize_audit_review_v07108.cjs','scripts/stage_public_site.py',
 'scripts/test_public_surface.py','scripts/test_external_source_health.py',
 'scripts/test_reading_controls.cjs','scripts/audit_v07108_qa.cjs',
 'assets/editorial-shared.css','assets/discovery-controls.js',
 'data/source_freshness_policy.json',
 'downloads/connecting-the-dots-data-pack-v0.7.108.zip',
 'downloads/connecting-the-dots-data-pack-v0.7.108.sha256',
 ...fs.readdirSync('assets/shared').filter(x=>x.endsWith('.css')).map(x=>'assets/shared/'+x)
];
for(const file of additions){assert.ok(fs.existsSync(file),'Missing reviewed addition '+file);if(!review.files[file])review.files[file]={baselineSHA256:null,sha256:sha(file),rationaleIds:['AUD108']};}
// Audit every changed tracked path against the prior published version. Only
// the release-scoped manifest itself and generated comparison report are not
// self-hashed; neither is used as a substitute for the independent gates.
const candidatePaths=execFileSync('git',['diff','--name-only','97db07f41e228cb503413a58a861e1f40dcc046d'],{encoding:'utf8'}).trim().split('\n').filter(Boolean);
for(const file of candidatePaths){
 if(file===currentPath||file==='content-continuity-audit.json')continue;
 assert.ok(fs.existsSync(file),'Removal requires a separate explicit review: '+file);
 if(!review.files[file]){
  const before=execFileSync('git',['show','97db07f41e228cb503413a58a861e1f40dcc046d:'+file]);
  review.files[file]={baselineSHA256:crypto.createHash('sha256').update(before).digest('hex'),sha256:sha(file),rationaleIds:['AUD108']};
 }
}
for(const [file,item]of Object.entries(review.files)){
 const next=sha(file);if(item.sha256!==next)item.rationaleIds=[...new Set([...item.rationaleIds,'AUD108'])];item.sha256=next;
}
for(const file of additions.filter(x=>x.startsWith('downloads/')))review.files[file].rationaleIds=['V108'];
review.historicalReviewEvidence=review.historicalReviewEvidence||{};
review.historicalReviewEvidence.v07107={manifest:previousPath,manifestSHA256:sha(previousPath),verification:prior.verification,signoff:prior.signoff,buildProvenancePolicy:prior.buildProvenancePolicy,scope:'Historical evidence for v0.7.107 only; does not attest this candidate.'};
review.auditSummary={
 baseline:review.priorTechnicalBaseline,
 remediations:['ED01–ED06: historical release labels, language continuity, dated verification labels, consistent German address, localized counts and .lugano application status.','T01–T03: versioned lazy assets, shared reading-page theme controls, confirmed research-tag governance.','Metadata, real heading hierarchy, Reader Study discovery, .meow editorial link and Economics case index.','Shared CSS modules preserve their original cascade positions; public staging excludes development files.','Read-only weekly source-health and dated snapshot freshness, with scientific archives explicitly frozen.'],
 deferredArchitecture:['Full replacement of all legacy page templates and larger application-bundle redesign belong to a separately scoped architecture release.'],
 archivePolicy:'RR1/RR2, official APS/IANA evidence and all previously published technical packages remain immutable.'
};
review.verification={status:'source-and-generated-files-reviewed',reviewedOn:pub.releasedOn,sourceCommit:pub.buildProvenanceCommit,reviewType:'AI-assisted source, output and regression review',humanParticipants:0,protectedSourceSections:Object.keys(sectionDigests).length,exactFiles:Object.keys(review.files).length,checks:['python3 scripts/release_check.py','node scripts/audit_v07108_qa.cjs','python3 scripts/test_public_surface.py','python3 scripts/test_external_source_health.py','node scripts/test_reading_controls.cjs'],qualityGates:'All seven existing required PR checks must pass on the exact final candidate. Actual Pages deployment and verified live bytes must follow the protected merge; this manifest does not claim those results in advance.'};
review.signoff={reviewedOn:pub.releasedOn,reviewType:'AI-assisted authorized audit remediation',sourceCommit:pub.buildProvenanceCommit,humanParticipants:0,scope:review.reviewInstruction};
review.buildProvenancePolicy={version:pub.version,sourceCommit:pub.buildProvenanceCommit,semantics:'Pinned source revision used for deterministic generation; the later promotion/deployment commit is independently verified.'};
verify.checkProtection(review,source,pub);verify.validateReviewedFiles(review,pub);
fs.writeFileSync(currentPath,JSON.stringify(review,null,2)+'\n');
console.log('AUDIT_REVIEW_07108_RECORDED',JSON.stringify({files:Object.keys(review.files).length,sections:Object.keys(sectionDigests).length,sourceCommit:pub.buildProvenanceCommit}));
