/* Produces review candidates, never approvals by itself.
 * Promotion needs a separately committed exact candidate SHA after inspection.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const ROOT = path.resolve(__dirname, '..'); process.chdir(ROOT);
const read = f => JSON.parse(fs.readFileSync(f, 'utf8'));
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const publication = read('publication.json');
const target = publication.editorialReviewPath;
const candidatePath = 'docs/reader-first-review-candidate.json';
const approvalPath = 'docs/reader-first-approval.json';
if (process.argv.includes('--apply-approval')) {
  if (!fs.existsSync(approvalPath)) { console.log('READER_EDITORIAL_APPROVAL_PENDING'); process.exit(0); }
  const approval = read(approvalPath);
  if (fs.existsSync(target) && read(target).status === 'reviewed' && read(target).approvedCandidateSHA256 === approval.candidateSHA256) {
    console.log('READER_EDITORIAL_APPROVAL_ALREADY_APPLIED'); process.exit(0);
  }
  const bytes = fs.readFileSync(candidatePath);
  assert.equal(sha(bytes), approval.candidateSHA256, 'Candidate bytes changed since the explicit review');
  const review = JSON.parse(bytes);
  assert.equal(review.status, 'pending-review');
  assert.equal(review.publicationVersion, publication.version);
  assert.equal(read('docs/reader-first-verification.json').passed, true, 'Browser verification must pass before review promotion');
  assert.equal(read('docs/reader-first-verification.json').sourceCommit, approval.verifiedSourceCommit, 'Approval names a different browser-tested source commit');
  review.status = 'reviewed'; review.approvedCandidateSHA256 = approval.candidateSHA256;
  fs.writeFileSync(target, JSON.stringify(review, null, 2) + '\n');
  console.log('READER_EXPLICIT_REVIEW_APPLIED', approval.candidateSHA256);
  process.exit(0);
}
assert.equal(publication.version, '0.7.92', 'This candidate collector is specific to the inspected reader release');
const original = read('docs/editorial-review-2026-10-20-v0.7.91.json');
const review = JSON.parse(JSON.stringify(original));
review.reviewId = 'reader-first-cross-site-2026-10-21-v0.7.92';
review.publicationVersion = publication.version; review.reviewedOn = publication.releasedOn;
review.status = 'pending-review';
review.rationales.E10 = 'Reader-first editorial navigation in four languages: reorder complete existing blocks, preserve every original body and fragment, add local indexes, breadcrumbs, contextual next links and direct research access. New UI copy contains no new research observations. Preserve all prior archives and research identifiers.';
for (const replacement of review.linkReplacements) replacement.publishedPath = replacement.to === '{{CURRENT_PACK_PATH}}' ? publication.currentDataPackPath : publication.currentDataPackPath.replace(/\.zip$/, '.sha256');
const extra = ['build.py', 'README.md', 'publication.json', 'scripts/reader_first.cjs', 'scripts/reader_first_install.py', 'scripts/reader_first_review.cjs', 'scripts/reader_first_browser.cjs', 'assets/reader-first.js', 'assets/reader-first.css', 'data/reader_first.json', 'data/release_history.json', publication.currentDataPackPath, publication.currentDataPackPath.replace(/\.zip$/, '.sha256')];
const delta = [];
for (const filename of [...new Set([...Object.keys(review.files), ...extra])].sort()) {
  assert.ok(fs.existsSync(filename), 'Reviewed file is missing: ' + filename);
  const value = sha(fs.readFileSync(filename));
  const prior = original.files[filename];
  const entry = review.files[filename] || {baselineSHA256: null, rationaleIds: []};
  if (!prior || value !== prior.sha256) {
    entry.rationaleIds = [...new Set([...entry.rationaleIds, 'E10'])];
    delta.push({file: filename, previous: prior?.sha256 || null, sha256: value});
  }
  entry.sha256 = value; review.files[filename] = entry;
}
const {sectionDigests, checkProtection} = require('./verify_ia_b2_parity.cjs');
const source = fs.readFileSync('src/index.web.html', 'utf8');
for (const [id, value] of Object.entries(sectionDigests(source))) {
  if (review.sourceSections[id].sha256 !== value.sha256) review.sourceSections[id].rationaleIds = [...new Set([...review.sourceSections[id].rationaleIds, 'E10'])];
  Object.assign(review.sourceSections[id], value);
}
// The existing independent invariant guard is deliberately not weakened.
checkProtection(review, source, publication);
review.readerFirstEvidence = {baseline: read('data/reader_first.json').baseline, structureReport: 'docs/reader-first-structure.json', browserReport: 'docs/reader-first-verification.json', humanParticipants: 0};
const serialized = JSON.stringify(review, null, 2) + '\n';
fs.writeFileSync(candidatePath, serialized);
const summary = {status: 'pending-review', candidateSHA256: sha(serialized), target, changedFiles: delta, sourceSections: Object.keys(review.sourceSections).length, immutableFiles: Object.keys(review.immutableFiles).length};
fs.writeFileSync('docs/reader-first-review-delta.json', JSON.stringify(summary, null, 2) + '\n');
console.log('READER_REVIEW_CANDIDATE', JSON.stringify(summary));
