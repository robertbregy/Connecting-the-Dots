/* Explicit review recorder for the inspected 22 November news candidate.
   This is deliberately separate from build.py and preserves all baselines. */
'use strict';
const fs = require('node:fs');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const path = require('node:path');
const {execFileSync} = require('node:child_process');
process.chdir(path.resolve(__dirname, '..'));
assert.ok(process.argv.includes('--record-reviewed-candidate'), 'Explicit --record-reviewed-candidate required');
const currentPath = 'docs/editorial-review-2026-11-22-v0.8.2.json';
const previousPath = 'docs/editorial-review-2026-11-18-v0.8.1.json';
const technicalBaseline = 'f8f6b6dbd52b800e9f65fca3ef19094aed008d6b';
const pub = JSON.parse(fs.readFileSync('publication.json', 'utf8'));
assert.equal(pub.version, '0.8.2');
assert.equal(pub.releasedOn, '2026-11-22');
assert.equal(pub.editorialReviewPath, currentPath);
assert.equal(pub.researchRelease, 'RR3');
assert.equal(pub.paperVersion, '1.4-draft');
assert.match(pub.sourceReviewCommit, /^[a-f0-9]{40}$/);
assert.equal(pub.buildProvenanceCommit, pub.sourceReviewCommit);
execFileSync('git', ['cat-file', '-e', pub.sourceReviewCommit + '^{commit}']);
const sha = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const prior = JSON.parse(fs.readFileSync(previousPath, 'utf8'));
const verify = require('./verify_ia_b2_parity.cjs');
const source = fs.readFileSync('src/index.web.html', 'utf8');
const sections = verify.sectionDigests(source);
for (const [id, value] of Object.entries(sections)) {
  if (id === 'explore') continue;
  assert.equal(value.sha256, prior.sourceSections[id]?.sha256, 'News additions must not rewrite protected source chapter: ' + id);
  assert.equal(value.characters, prior.sourceSections[id]?.characters, 'Protected chapter size changed: ' + id);
}
const graph = JSON.parse(fs.readFileSync('data/aps_2026_application_graph.json', 'utf8'));
assert.equal(graph.snapshotState, 'post-string-confirmation');
assert.equal(graph.counts.visibleProceedingApplications, 1595);
assert.equal(graph.counts.visibleWithdrawnApplications, 19);
assert.equal(graph.counts.derivedExactPrimaryMatchGroups, 225);
assert.equal(graph.counts.officialConfirmedContentionSets, 226);
assert.equal(graph.counts.unresolvedAnnouncementPublicationGap, 0);
const news = JSON.parse(fs.readFileSync('data/editorial_news_20261122.json', 'utf8'));
assert.equal(news.reviewedOn, pub.releasedOn);
assert.equal(news.panels.length, 8);
assert.equal(sha('downloads/connecting-the-dots-data-pack-v0.8.1.zip'), '422acf0d7577dd309475ce81f6278531e7a0963ba82d30115005482fe2cca417');

const review = JSON.parse(JSON.stringify(prior));
review.reviewId = 'news-review-2026-11-22-v0.8.2';
review.status = 'reviewed';
review.reviewedOn = pub.releasedOn;
review.publicationVersion = pub.version;
review.parentReview = previousPath;
review.priorTechnicalBaseline = {version: '0.8.1', commit: technicalBaseline, reviewSHA256: sha(previousPath)};
review.reviewInstruction = 'Publish the verified news review and separately captured 22 November APS follow-up, including ICANN’s corrected historical announcement, without changing archived evidence or inferring unannounced outcomes.';
Object.assign(review.rationales, {
  NEWS082: 'Reviewed eight sourced four-language editorial additions, .web and .helsinki follow-ups, corrected current calendar wording and explicit links to their existing reading paths. Keep proposals, future launch dates and attributed analysis distinct from established outcomes.',
  APS082: 'Reviewed 22 November raw and normalized APS sources, exact field deltas, append-only observations, nineteen withdrawn application families and 225/695 derived current overlaps. Keep the frozen 17 November official 226/705 file and RR3 unchanged; close only the four-application discrepancy resolved by ICANN’s correction.',
  QA082: 'Adapt source-pinned current counts and exact new economics anchors while retaining original baselines, immutable inventories, required PR checks and validation thresholds. Localize the new source labels and application statuses; preserve selected replacement identity after withdrawal.',
  V082: 'Publish a separate deterministic v0.8.2 technical package and current metadata. Freeze the exact v0.8.1 ZIP and preserve every prior technical and scientific package, DOI and scholarly manuscript revision.'
});
review.linkReplacements = (review.linkReplacements || []).map(item => ({
  ...item, publishedPath: item.publishedPath.replace(/v0\.8\.1/g, 'v0.8.2')
}));
for (const [id, value] of Object.entries(sections)) {
  const old = prior.sourceSections[id];
  review.sourceSections[id] = {
    ...value,
    baselineSHA256: old.baselineSHA256,
    baselineCharacters: old.baselineCharacters,
    rationaleIds: old.sha256 === value.sha256
      ? old.rationaleIds
      : [...new Set([...(old.rationaleIds || []), 'APS082'])]
  };
}
review.approvedCandidateSHA256 = verify.sha256(source);
const changed = execFileSync('git', ['diff', '--name-only', technicalBaseline], {encoding: 'utf8'}).trim().split('\n').filter(Boolean);
const untracked = execFileSync('git', ['ls-files', '--others', '--exclude-standard'], {encoding: 'utf8'}).trim().split('\n').filter(Boolean);
for (const file of [...new Set([...changed, ...untracked])]) {
  if (file === currentPath || file === 'content-continuity-audit.json') continue;
  assert.ok(fs.existsSync(file), 'No removal authorized in this news update: ' + file);
  let before = null;
  try { before = execFileSync('git', ['show', technicalBaseline + ':' + file], {stdio: ['ignore', 'pipe', 'ignore']}); } catch (_) {}
  const old = prior.files?.[file];
  const rationale = file.startsWith('downloads/connecting-the-dots-data-pack-v0.8.2') ? 'V082'
    : /^(scripts\/|assets\/|build\.py)/.test(file) ? 'QA082'
    : /aps_|round_2026_followup|round-2026-followup/.test(file) ? 'APS082' : 'NEWS082';
  review.files[file] = {
    ...old,
    baselineSHA256: old ? old.baselineSHA256 : (before === null ? null : crypto.createHash('sha256').update(before).digest('hex')),
    sha256: sha(file),
    rationaleIds: [...new Set([...(old?.rationaleIds || []), rationale])]
  };
}
for (const [file, item] of Object.entries(review.files)) {
  assert.ok(fs.existsSync(file), 'Previously reviewed file missing: ' + file);
  const next = sha(file);
  if (item.sha256 !== next) item.rationaleIds = [...new Set([...(item.rationaleIds || []), 'NEWS082'])];
  item.sha256 = next;
}
review.auditSummary = {
  baseline: review.priorTechnicalBaseline,
  evidenceReview: 'docs/news-review-2026-11-22.md',
  remediations: [
    'Reconcile the corrected 16 November announcement with its contemporaneous sources, separately from later withdrawals.',
    'Add a source-hashed 22 November public export, exact field deltas and current Atlas; preserve the prior observation log as an unchanged prefix.',
    'Document ten additional withdrawals without inferring exact event times, reasons, private arrangements or an entire string’s disappearance.',
    'Integrate eight localized editorial panels and two existing-case updates with primary sources and explicit dates.',
    'Preserve the original four dated field-note revisions and append the superseding correction and follow-up.',
    'Use direct ordinary economics links and translated source labels; retain all original navigation and preservation contracts.'
  ],
  archivePolicy: 'Reveal Day, the 17 November source files, RR1/RR2/RR3 and every earlier technical package remain immutable. The 22 November evidence is not retroactively covered by the RR3 DOI.'
};
review.verification = {
  status: 'source-and-generated-files-reviewed',
  reviewedOn: pub.releasedOn,
  sourceCommit: pub.sourceReviewCommit,
  reviewType: 'AI-assisted primary-source reconciliation and generated-output review',
  humanParticipants: 0,
  protectedSourceSections: Object.keys(sections).length,
  reviewedSourceSections: ['explore'],
  exactFiles: Object.keys(review.files).length,
  checks: ['python3 build.py', 'python3 scripts/release_check.py', 'node scripts/verify_ia_b2_parity.cjs', 'node scripts/validate_multilingual.js', 'node scripts/validate_discovery.cjs', 'node scripts/validate_economics_order.cjs'],
  qualityGates: 'All seven required PR checks must pass on the final candidate before the protected merge. An actual Pages deployment and verified public bytes for the promoted SHA are required afterwards.'
};
review.signoff = {reviewedOn: pub.releasedOn, reviewType: review.verification.reviewType, sourceCommit: pub.sourceReviewCommit, humanParticipants: 0, scope: review.reviewInstruction};
review.buildProvenancePolicy = {version: pub.version, sourceReviewCommit: pub.sourceReviewCommit, semantics: pub.buildProvenanceRole};
verify.checkProtection(review, source, pub);
verify.validateReviewedFiles(review, pub);
fs.writeFileSync(currentPath, JSON.stringify(review, null, 2) + '\n');
console.log('NEWS082_REVIEW_RECORDED', JSON.stringify({files: Object.keys(review.files).length, protectedSections: Object.keys(sections).length, sourceReviewCommit: pub.sourceReviewCommit}));
