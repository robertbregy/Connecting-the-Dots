/* Freeze a stable build-provenance source commit in v0.7.96.
 * Avoid embedding a different GITHUB_SHA in reviewed static HTML on each CI run. */
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {checkProtection,validateReviewedFiles}=require('./verify_ia_b2_parity.cjs');
const path='scripts/sync_publication.py',pubPath='publication.json';
const original=fs.readFileSync(path,'utf8');
const from="commit = (os.environ.get('GITHUB_SHA') or '').strip() or None";
assert.equal(original.split(from).length,2,'Unexpected publication metadata generator');
const to=[
"build_commit = (meta.get('buildProvenanceCommit') or '').strip()",
"if build_commit and not re.fullmatch(r'[a-f0-9]{40}', build_commit):",
"    raise SystemExit('Invalid frozen build provenance commit')",
"commit = build_commit or (os.environ.get('GITHUB_SHA') or '').strip() or None",
].join('\n');
fs.writeFileSync(path,original.replace(from,to));
const pub=JSON.parse(fs.readFileSync(pubPath,'utf8'));
assert.equal(pub.version,'0.7.96');
assert.equal(pub.buildProvenanceCommit,undefined);
pub.buildProvenanceCommit='c2da5484d4c4e1cf57361f0b4d3e697258adc415';
fs.writeFileSync(pubPath,JSON.stringify(pub,null,2)+'\n');
const reviewPath=pub.editorialReviewPath,review=JSON.parse(fs.readFileSync(reviewPath,'utf8'));
assert.equal(review.status,'reviewed');
review.rationales.P96='Pin the source commit used to build v0.7.96 so rebuilt HTML contains stable release provenance instead of the ever-changing CI GITHUB_SHA. This only fixes metadata reproducibility and does not change user-visible case content or frozen scientific datasets.';
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
for(const p of [pubPath,path]){
 assert.ok(review.files[p],'Unreviewed publication path '+p);
 review.files[p].sha256=sha(p);
 review.files[p].rationaleIds=[...new Set([...review.files[p].rationaleIds,'P96'])];
}
review.buildProvenancePolicy={version:'0.7.96',sourceCommit:pub.buildProvenanceCommit,semantics:'Stable original GitHub source of reviewed artifact generation, not necessarily the later deployment commit'};
const source=fs.readFileSync('src/index.web.html','utf8');
checkProtection(review,source,pub);validateReviewedFiles(review,pub);
fs.writeFileSync(reviewPath,JSON.stringify(review,null,2)+'\n');
console.log('STABLE_V0796_BUILD_PROVENANCE_LOCKED',pub.buildProvenanceCommit);
