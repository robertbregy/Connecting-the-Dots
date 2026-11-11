/* Explicit review recorder for v0.7.109 Legal layer.
   Never call this from build.py. It records an already inspected/generated candidate. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');process.chdir(root);
assert.ok(process.argv.includes('--record-reviewed-candidate'),'Explicit --record-reviewed-candidate required.');
const currentPath='docs/editorial-review-2026-11-11-v0.7.109.json';
const previousPath='docs/editorial-review-2026-11-10-v0.7.108.json';
const baseline='8a0659b2cf1ed5b6d8ca16ac879530d85c6f799f';
const pub=JSON.parse(fs.readFileSync('publication.json','utf8'));
assert.equal(pub.version,'0.7.109');assert.equal(pub.releasedOn,'2026-11-11');
assert.equal(pub.editorialReviewPath,currentPath);
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const prior=JSON.parse(fs.readFileSync(previousPath,'utf8'));
const verify=require('./verify_ia_b2_parity.cjs');
const source=fs.readFileSync('src/index.web.html','utf8');
const sectionDigests=verify.sectionDigests(source);
for(const [id,value]of Object.entries(sectionDigests)){
  assert.equal(value.sha256,prior.sourceSections[id]?.sha256,'Protected legacy source chapter changed: '+id);
  assert.equal(value.characters,prior.sourceSections[id]?.characters,'Protected legacy source chapter size changed: '+id);
}
assert.match(pub.buildProvenanceCommit,/^[a-f0-9]{40}$/);
execFileSync('git',['cat-file','-e',pub.buildProvenanceCommit+'^{commit}']);
const review=JSON.parse(JSON.stringify(prior));
review.reviewId='legal-layer-2026-11-11-v0.7.109';
review.status='reviewed';review.reviewedOn=pub.releasedOn;review.publicationVersion=pub.version;
review.parentReview=previousPath;
review.priorTechnicalBaseline={version:'0.7.108',commit:baseline,reviewSHA256:sha(previousPath)};
review.reviewInstruction='Add a source-backed Legal procedural layer inside Conflicts & outcomes: contention remains competition, Legal explains rights/objections/remedies, Disputed Dots remains the historical case layer, followed by outcomes and lifecycle. Cover public and government input, the four formal objection grounds, standing, WIPO/ICC, Independent Objectors, appeals and the RVC bridge to binding Registry Agreement obligations. Preserve APS/IANA snapshots, RR1/RR2, historical dispute evidence, all legacy source chapter bodies and the six-area B2 navigation.';
review.rationales=review.rationales||{};
review.rationales.LEGAL109='Reviewed four-language Legal procedural chapter and reader-path integration. Primary procedural sources are ICANN, WIPO and ICC; CMS Joining the Dots remains secondary professional reading. No new application outcome is asserted.';
review.rationales.DISC109='Reviewed four new citable Legal discovery guides and exact sitemap/agent-catalog expansion from 84 to 88 discovery documents.';
review.rationales.V109='Separate deterministic v0.7.109 technical package; v0.7.108 and all earlier packages remain immutable.';
review.linkReplacements=(review.linkReplacements||[]).map(x=>({...x,publishedPath:x.publishedPath.replace(/v0\.7\.108/g,'v0.7.109')}));
review.approvedCandidateSHA256=verify.sha256(source);
review.files=review.files||{};
const changed=execFileSync('git',['diff','--name-only',baseline],{encoding:'utf8'}).trim().split('\n').filter(Boolean);
for(const file of changed){
  if(file===currentPath||file==='content-continuity-audit.json')continue;
  assert.ok(fs.existsSync(file),'Reviewed release does not authorize removals: '+file);
  let before=null;
  try{before=execFileSync('git',['show',baseline+':'+file]);}catch(_){}
  const rationale=file.startsWith('downloads/connecting-the-dots-data-pack-v0.7.109')?['V109']:
    file.startsWith('guides/')&&file.includes('/legal/')?['LEGAL109','DISC109']:
    file==='discovery/manifest.json'||file==='agent-catalog.json'||file==='llms.txt'||file==='sitemap.xml'?['DISC109']:
    ['LEGAL109'];
  review.files[file]={baselineSHA256:before===null?null:crypto.createHash('sha256').update(before).digest('hex'),sha256:sha(file),rationaleIds:rationale};
}
for(const [file,item] of Object.entries(review.files)){
  assert.ok(fs.existsSync(file),'Previously reviewed file missing: '+file);
  const next=sha(file);
  if(item.sha256!==next)item.rationaleIds=[...new Set([...(item.rationaleIds||[]),'LEGAL109'])];
  item.sha256=next;
}
review.auditSummary={
  baseline:review.priorTechnicalBaseline,
  remediations:[
    'Add one reviewed Legal card and chapter between contention and historical disputes in the existing Conflicts & outcomes area.',
    'Distinguish seven input/challenge channels and four formal objection grounds without conflating contention, comments, GAC action and formal objections.',
    'Publish four localized Legal discovery guides and retain exact reciprocal sitemap/agent access.',
    'Freeze v0.7.108 before publishing a separate deterministic v0.7.109 package.'
  ],
  deferred:['String Confirmation Day data reconciliation remains a separate post-17-November release.'],
  archivePolicy:'APS/IANA evidence, RR1/RR2 and all historical technical packages remain immutable.'
};
review.verification={status:'source-and-generated-files-reviewed',reviewedOn:pub.releasedOn,sourceCommit:pub.buildProvenanceCommit,reviewType:'AI-assisted source, legal-procedure and generated-output review',humanParticipants:0,protectedSourceSections:Object.keys(sectionDigests).length,exactFiles:Object.keys(review.files).length,checks:['python3 build.py','python3 scripts/release_check.py','node scripts/validate_multilingual.js','node scripts/verify_ia_b2_parity.cjs'],qualityGates:'All required PR checks must pass on the exact final candidate; Pages deployment and live-byte verification remain post-merge gates.'};
review.signoff={reviewedOn:pub.releasedOn,reviewType:'AI-assisted authorized Legal-layer review',sourceCommit:pub.buildProvenanceCommit,humanParticipants:0,scope:review.reviewInstruction};
review.buildProvenancePolicy={version:pub.version,sourceCommit:pub.buildProvenanceCommit,semantics:'Pinned branch revision used for deterministic regeneration immediately before explicit review recording.'};
verify.checkProtection(review,source,pub);
verify.validateReviewedFiles(review,pub);
fs.writeFileSync(currentPath,JSON.stringify(review,null,2)+'\n');
console.log('LEGAL_REVIEW_07109_RECORDED',JSON.stringify({files:Object.keys(review.files).length,sections:Object.keys(sectionDigests).length,sourceCommit:pub.buildProvenanceCommit}));
