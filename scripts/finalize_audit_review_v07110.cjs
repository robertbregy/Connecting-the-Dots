/* Explicit review recorder for v0.7.110 full-audit closure.
   Never call this from build.py. It records an already inspected/generated candidate. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');process.chdir(root);
assert.ok(process.argv.includes('--record-reviewed-candidate'),'Explicit --record-reviewed-candidate required.');
const currentPath='docs/editorial-review-2026-11-11-v0.7.110.json';
const previousPath='docs/editorial-review-2026-11-11-v0.7.109.json';
const baseline='5f1b3853bbbe9ff21f0c6bb689c1f23f96084a82';
const pub=JSON.parse(fs.readFileSync('publication.json','utf8'));
assert.equal(pub.version,'0.7.110');assert.equal(pub.releasedOn,'2026-11-11');
assert.equal(pub.editorialReviewPath,currentPath);
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const prior=JSON.parse(fs.readFileSync(previousPath,'utf8'));
const verify=require('./verify_ia_b2_parity.cjs');
const source=fs.readFileSync('src/index.web.html','utf8');
const sectionDigests=verify.sectionDigests(source);
const reviewedSourceSections=new Set(['disputes','cemetery']);
for(const [id,value]of Object.entries(sectionDigests)){
  if(reviewedSourceSections.has(id))continue;
  assert.equal(value.sha256,prior.sourceSections[id]?.sha256,'Unreviewed protected legacy source chapter changed: '+id);
  assert.equal(value.characters,prior.sourceSections[id]?.characters,'Unreviewed protected legacy source chapter size changed: '+id);
}
assert.match(pub.buildProvenanceCommit,/^[a-f0-9]{40}$/);
execFileSync('git',['cat-file','-e',pub.buildProvenanceCommit+'^{commit}']);
const review=JSON.parse(JSON.stringify(prior));
review.reviewId='full-audit-closure-2026-11-11-v0.7.110';
review.status='reviewed';review.reviewedOn=pub.releasedOn;review.publicationVersion=pub.version;
review.parentReview=previousPath;
review.priorTechnicalBaseline={version:'0.7.109',commit:baseline,reviewSHA256:sha(previousPath)};
review.reviewInstruction='Close the 11 November full-site audit without changing frozen APS/IANA research snapshots or RR1/RR2: make Legal the single procedural reference, keep Disputed Dots as historical cases, complete standing and filing-window guidance, record the later .helsinki revocation as a dated editorial overlay, make mutable-source freshness review-aware, and repair current-release documentation and machine-readable release history. Preserve the six-area B2 architecture, historical evidence and previous technical archives.';
review.rationales=review.rationales||{};
review.rationales.AUD110='Full-site audit closure: editorial architecture, multilingual consistency, source governance, discovery/agent metadata, accessibility and release integrity reviewed together. No new APS application outcome is asserted.';
review.rationales.LEGAL110='Remove duplicated procedure from Disputed Dots and complete the dedicated Legal chapter with objection-ground standing, additional filing windows and Independent Objector safeguards using the current ICANN Applicant Guidebook and program pages.';
review.rationales.HEL110='Record IANA revocation of .helsinki on 28 October 2026 in a dated current editorial overlay while preserving the frozen 4 October IANA/root snapshot as historical evidence.';
review.rationales.FRESH110='Distinguish evidence observation age from the latest editorial review; mutable sources must be explicitly reviewed within cadence and milestone reconciliation still overrides a pre-milestone review.';
review.rationales.DOC110='Synchronize README, data-phase wording, changelog and release-history summaries with the actual current publication.';
review.rationales.V110='Publish a separate deterministic v0.7.110 technical package while preserving v0.7.109 and all earlier technical/scientific archives.';
review.rationales.QA110='Update validation only where the audited content model changed and add regression coverage for review-aware freshness and current Helsinki revocation evidence.';
review.linkReplacements=(review.linkReplacements||[]).map(x=>({...x,publishedPath:x.publishedPath.replace(/v0\.7\.109/g,'v0.7.110')}));
review.approvedCandidateSHA256=verify.sha256(source);
for(const id of reviewedSourceSections){
  const current=sectionDigests[id], item=review.sourceSections[id];
  assert.ok(item&&current,'Missing source section '+id);
  item.sha256=current.sha256;item.characters=current.characters;
  item.rationaleIds=[...new Set([...(item.rationaleIds||[]),id==='disputes'?'LEGAL110':'HEL110','AUD110'])];
}
review.files=review.files||{};
const changed=execFileSync('git',['diff','--name-only',baseline],{encoding:'utf8'}).trim().split('\n').filter(Boolean);
const rationaleFor=file=>{
  if(file.startsWith('downloads/connecting-the-dots-data-pack-v0.7.110'))return ['V110'];
  if(file==='data/legal_layer.json'||file==='scripts/render_legal_layer.py'||(file.startsWith('guides/')&&file.includes('/legal/')))return ['LEGAL110'];
  if(file==='data/helsinki_editorial_20261111.json'||file==='data/research.json')return ['HEL110'];
  if(file==='data/source_freshness_policy.json'||file==='scripts/check_external_sources.py')return ['FRESH110'];
  if(file==='scripts/test_external_source_health.py')return ['FRESH110','QA110'];
  if(file==='scripts/release_check.py')return ['HEL110','FRESH110','QA110'];
  if(file==='src/index.web.html')return ['LEGAL110','HEL110','AUD110'];
  if(file==='data/translations.json')return ['LEGAL110','HEL110','DOC110'];
  if(file==='build.py')return ['HEL110','V110'];
  if(file.startsWith('docs/audits/2026-11-11/'))return ['AUD110','DOC110'];
  if(['README.md','data/README.md','CHANGELOG.md','data/release_history.json'].includes(file))return ['DOC110'];
  if(['package.json','package-lock.json','publication.json'].includes(file))return ['V110'];
  if(['discovery/manifest.json','agent-catalog.json','llms.txt','sitemap.xml'].includes(file))return ['AUD110'];
  if(file.startsWith('.github/workflows/finalize-audit-v07110')||file==='scripts/finalize_audit_review_v07110.cjs')return ['QA110'];
  return ['AUD110','V110'];
};
for(const file of changed){
  if(file===currentPath||file==='content-continuity-audit.json')continue;
  assert.ok(fs.existsSync(file),'Reviewed release does not authorize removals: '+file);
  let before=null;
  try{before=execFileSync('git',['show',baseline+':'+file]);}catch(_){}
  const previous=prior.files?.[file];
  review.files[file]={
    baselineSHA256:previous?.baselineSHA256??(before===null?null:crypto.createHash('sha256').update(before).digest('hex')),
    sha256:sha(file),
    rationaleIds:[...new Set([...(previous?.rationaleIds||[]),...rationaleFor(file)])],
    ...(previous?.priorTechnicalSHA256?{priorTechnicalSHA256:previous.priorTechnicalSHA256}:{})
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
    'Make Rights, objections & remedies the single procedural chapter and reduce Disputed Dots to cases plus a Legal cross-link.',
    'Add explicit standing by formal objection ground, additional 30-day windows and Independent Objector conditions.',
    'Record completed .helsinki IANA revocation in a dated editorial overlay while preserving the 4 October frozen root snapshot.',
    'Separate source observation age from editorial review age and gate technical releases on mutable-source review state.',
    'Synchronize README, current phase wording and machine-readable release-history summaries.'
  ],
  deferred:[
    'String Confirmation Day APS reconciliation remains a separate post-17-November release.',
    'Per-page sitemap lastmod/dateModified needs content-derived persistence rather than a release-wide timestamp.',
    'Search Console indexing/cannibalization audit was unavailable because the connected GSC service returned payment_required.',
    'Economics synthetic LCP remains the only materially slower tested route and should be optimized without removing evidence.'
  ],
  archivePolicy:'Frozen APS/IANA research evidence, RR1/RR2 and every previous technical package remain immutable.'
};
review.verification={status:'source-and-generated-files-reviewed',reviewedOn:pub.releasedOn,sourceCommit:pub.buildProvenanceCommit,reviewType:'AI-assisted full-site source, legal-procedure, source-governance and generated-output audit',humanParticipants:0,protectedSourceSections:Object.keys(sectionDigests).length,reviewedSourceSections:[...reviewedSourceSections],exactFiles:Object.keys(review.files).length,checks:['python3 build.py','python3 scripts/release_check.py','python3 scripts/test_external_source_health.py','node scripts/validate_multilingual.js','node scripts/verify_ia_b2_parity.cjs','node scripts/validate_discovery.cjs'],qualityGates:'All required PR checks must pass on the exact final candidate; Pages deployment and live-byte verification remain post-merge gates.'};
review.signoff={reviewedOn:pub.releasedOn,reviewType:'AI-assisted authorized full-site audit closure',sourceCommit:pub.buildProvenanceCommit,humanParticipants:0,scope:review.reviewInstruction};
review.buildProvenancePolicy={version:pub.version,sourceCommit:pub.buildProvenanceCommit,semantics:'Pinned branch revision used for deterministic regeneration immediately before explicit review recording.'};
verify.checkProtection(review,source,pub);
verify.validateReviewedFiles(review,pub);
fs.writeFileSync(currentPath,JSON.stringify(review,null,2)+'\n');
console.log('FULL_AUDIT_REVIEW_07110_RECORDED',JSON.stringify({files:Object.keys(review.files).length,sections:Object.keys(sectionDigests).length,reviewedSourceSections:[...reviewedSourceSections],sourceCommit:pub.buildProvenanceCommit}));
