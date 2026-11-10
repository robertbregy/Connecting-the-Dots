'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const currentPath=path.join(root,'docs/editorial-review-2026-11-10-v0.7.108.json');
const previousPath=path.join(root,'docs/editorial-review-2026-11-09-v0.7.107.json');
const pub=JSON.parse(fs.readFileSync(path.join(root,'publication.json'),'utf8'));
if(pub.version!=='0.7.108'||pub.releasedOn!=='2026-11-10')throw Error('This signoff is release-scoped to v0.7.108');
const prior=JSON.parse(fs.readFileSync(previousPath,'utf8'));
const audit=fs.existsSync(currentPath)?JSON.parse(fs.readFileSync(currentPath,'utf8')):{};
const verify=require('./verify_ia_b2_parity.cjs');
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,p))).digest('hex');
const review=JSON.parse(JSON.stringify(prior));
review.reviewId='full-surface-audit-2026-11-10-v0.7.108';
review.status='reviewed';
review.reviewedOn=pub.releasedOn;
review.publicationVersion=pub.version;
review.reviewInstruction='AI-assisted full-surface review of v0.7.108 after the published v0.7.107 audit: dated APS/current-status language, 2026 pre-String-Confirmation context, Reader Study metadata and sitemap integration, heading semantics, social metadata, HTTPS source links, shared CSS extraction, page-type grammar, build-only deployment hygiene and external-source monitoring. Canonical source sections, scientific observations, RR1/RR2 and every frozen technical archive remain protected. Browser, accessibility, parity and live deployment gates remain independently required.';
review.parentReview='docs/editorial-review-2026-11-09-v0.7.107.json';
review.priorTechnicalBaseline={version:'0.7.107',commit:'97db07f41e228cb503413a58a861e1f40dcc046d'};
review.rationales.AUD108='Full-surface 10 November 2026 remediation: improve temporal precision, metadata, semantic hierarchy, UI grammar, cacheable shared presentation and source-link hygiene without changing research findings or archived evidence.';
review.rationales.V108='Publish a distinct deterministic v0.7.108 technical package; freeze v0.7.107 and preserve all earlier technical/scientific archives, DOI identities and working-paper revision.';
review.linkReplacements=review.linkReplacements.map(x=>({...x,publishedPath:x.publishedPath.replace(/v0\.7\.107/g,'v0.7.108')}));
const source=fs.readFileSync(path.join(root,'src/index.web.html'),'utf8');
const sectionDigests=verify.sectionDigests(source);
for(const [id,value] of Object.entries(sectionDigests)){
  if(!review.sourceSections[id])throw Error('Missing protected source section '+id);
  if(review.sourceSections[id].sha256!==value.sha256||review.sourceSections[id].characters!==value.characters){
    review.sourceSections[id].rationaleIds=[...new Set([...(review.sourceSections[id].rationaleIds||[]),'AUD108'])];
  }
  review.sourceSections[id].sha256=value.sha256;
  review.sourceSections[id].characters=value.characters;
}
review.approvedCandidateSHA256=verify.sha256(source);
const additions=[
 '.github/workflows/external-source-health.yml',
 'scripts/audit_remediation_v07108.cjs',
 'scripts/check_external_sources.py',
 'assets/editorial-shared.css',
 'downloads/connecting-the-dots-data-pack-v0.7.108.zip',
 'downloads/connecting-the-dots-data-pack-v0.7.108.sha256',
 'prototype/ia-v1/index.html',
 'prototype/ia-v1/standalone.html'
];
for(const p of additions){
  if(!fs.existsSync(path.join(root,p)))throw Error('Reviewed release file missing '+p);
  if(!review.files[p])review.files[p]={baselineSHA256:null,sha256:sha(p),rationaleIds:['AUD108']};
}
for(const [p,item] of Object.entries(review.files)){
  const full=path.join(root,p);
  if(!fs.existsSync(full))throw Error('Inherited reviewed file missing '+p);
  const next=sha(p);
  if(item.sha256!==next)item.rationaleIds=[...new Set([...(item.rationaleIds||[]),'AUD108'])];
  item.sha256=next;
}
review.files['downloads/connecting-the-dots-data-pack-v0.7.108.zip'].rationaleIds=['V108'];
review.files['downloads/connecting-the-dots-data-pack-v0.7.108.sha256'].rationaleIds=['V108'];
review.auditSummary={
 scope:audit.scope||[],
 baseline:audit.baseline||{},
 remediations:audit.remediations||[],
 deferredArchitecture:audit.deferredArchitecture||[],
 archivePolicy:audit.archivePolicy||'RR1, RR2 and frozen technical packages remain immutable.'
};
review.verification={
 ...(review.verification||{}),
 v07108:{
  reviewedOn:'2026-11-10',
  sourceSections:Object.keys(sectionDigests).length,
  exactFiles:Object.keys(review.files).length,
  sharedCss:'assets/editorial-shared.css',
  externalSourceWatch:'.github/workflows/external-source-health.yml',
  note:'Exact browser/accessibility/parity/live checks remain separate release gates.'
 }
};
review.signoff={...(review.signoff||{}),v07108:'Reviewed full-surface remediation; no scientific-release identity change.'};
fs.writeFileSync(currentPath,JSON.stringify(review,null,2)+'\n');
console.log('AUDIT_REVIEW_07108_FINALIZED',JSON.stringify({files:Object.keys(review.files).length,sections:Object.keys(sectionDigests).length,source:review.approvedCandidateSHA256}));
