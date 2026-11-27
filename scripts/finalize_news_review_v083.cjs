/* Explicit recorder for the inspected 27 November APS follow-up candidate.
   Run after source review and generation; this is never called by build.py. */
'use strict';
const fs = require('node:fs');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const path = require('node:path');
const {execFileSync} = require('node:child_process');
process.chdir(path.resolve(__dirname, '..'));
assert.ok(process.argv.includes('--record-reviewed-candidate'), 'Explicit --record-reviewed-candidate required');
const currentPath = 'docs/editorial-review-2026-11-27-v0.8.3.json';
const previousPath = 'docs/editorial-review-2026-11-22-v0.8.2.json';
const technicalBaseline = '1f8eb058989a2eb3a22f16c431e16fbbed2aa132';
const pub = JSON.parse(fs.readFileSync('publication.json', 'utf8'));
assert.equal(pub.version, '0.8.3');
assert.equal(pub.releasedOn, '2026-11-27');
assert.equal(pub.editorialReviewPath, currentPath);
assert.equal(pub.researchRelease, 'RR3');
assert.equal(pub.paperVersion, '1.4-draft');
assert.match(pub.sourceReviewCommit, /^[a-f0-9]{40}$/);
assert.equal(pub.buildProvenanceCommit, pub.sourceReviewCommit);
execFileSync('git', ['cat-file', '-e', pub.sourceReviewCommit + '^{commit}']);
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const sha = file => digest(fs.readFileSync(file));
const gitFile = (commit, file) => execFileSync('git', ['show', commit + ':' + file], {maxBuffer: 32 * 1024 * 1024});
const prior = JSON.parse(fs.readFileSync(previousPath, 'utf8'));
assert.equal(sha(previousPath), digest(gitFile(technicalBaseline, previousPath)), 'The previous editorial review must remain immutable');
const verify = require('./verify_ia_b2_parity.cjs');
const source = fs.readFileSync('src/index.web.html', 'utf8');
const sections = verify.sectionDigests(source);
for (const [id, value] of Object.entries(sections)) {
  if (id === 'explore') continue;
  assert.equal(value.sha256, prior.sourceSections[id]?.sha256, 'APS follow-up must not rewrite protected source chapter: ' + id);
  assert.equal(value.characters, prior.sourceSections[id]?.characters, 'Protected chapter size changed: ' + id);
}

// The source-review SHA must actually contain the reviewed new inputs. The
// baseline SHA is recorded separately and cannot stand in for this provenance.
const reviewedInputs = [
  'build.py', 'src/index.web.html', 'data/translations.json',
  'data/behind_round_stories.json', 'data/inside_the_round_events.json',
  'data/applications_2026_aps_followup_20261127.csv',
  'data/applications_2026_aps_followup_20261127_provenance.json',
  'data/round_2026_followup_20261127.json',
  'scripts/build_aps_followup_20261127.py',
  'scripts/build_aps_application_graph_current.py',
  'scripts/build_aps_current_analytics.py',
  'scripts/render_behind_round.py', 'scripts/render_news_review_20261122.cjs',
  'scripts/audit_remediation_v07108.cjs', 'scripts/build_agent_catalog.py',
  'scripts/release_check.py', 'scripts/audit_aps_application_atlas.js',
  'scripts/verify_ia_b2_parity.cjs', 'scripts/validate_multilingual.js',
  'scripts/audit_v07108_qa.cjs'
];
for (const file of reviewedInputs) {
  assert.equal(sha(file), digest(gitFile(pub.sourceReviewCommit, file)), 'Source-review commit does not contain the exact reviewed input: ' + file);
}

const graph = JSON.parse(fs.readFileSync('data/aps_2026_application_graph.json', 'utf8'));
assert.equal(graph.snapshotState, 'post-string-confirmation');
assert.equal(graph.sourceCSVFile, 'data/applications_2026_aps_followup_20261127.csv');
for (const [name, value] of Object.entries({
  officialPublishedApplications: 1614,
  officialListingRows: 2783,
  replacementRecords: 1169,
  selectedReplacementRecords: 152,
  visibleProceedingApplications: 1553,
  visibleWithdrawnApplications: 61,
  apsStatisticsTotalApplications: 1615,
  apsStatisticsActiveApplications: 1543,
  apsStatisticsWithdrawnApplications: 72,
  derivedExactPrimaryMatchGroups: 222,
  applicationsInExactPrimaryMatches: 650,
  officialConfirmedContentionSets: 226,
  officialConfirmedContentionApplications: 705,
  unresolvedAnnouncementPublicationGap: 0
})) assert.equal(graph.counts[name], value, 'Current and historical source scopes must remain distinct: ' + name);
assert.equal(sha('downloads/connecting-the-dots-data-pack-v0.8.2.zip'), '93da4df87ecabcc15157c47acf933a1e7a3c15fad20ad28b3a2c206bda0b5f0f');

// Preserve all previously published archives and raw evidence, not just the
// subset inherited from the original A/B manifest.
const baselineFiles = execFileSync('git', ['ls-tree', '-r', '--name-only', technicalBaseline], {encoding: 'utf8'}).trim().split('\n');
const preserved = baselineFiles.filter(file =>
  /^downloads\/.*\.(zip|sha256)$/.test(file) ||
  file.startsWith('data/evidence/') || /^research\/rr[123]_/.test(file) ||
  /^data\/applications_2026_aps_/.test(file) ||
  (/^data\/contention_/.test(file) && file !== 'data/contention_rounds.csv') ||
  Object.hasOwn(prior.immutableFiles, file));
for (const file of preserved) {
  assert.ok(fs.existsSync(file), 'Historical file removed: ' + file);
  assert.equal(sha(file), digest(gitFile(technicalBaseline, file)), 'Historical file rewritten: ' + file);
}
// This derived table retains every historical value. Only the stale future
// wording in the 2026 note is corrected; it is not a raw official export.
const contentionTable = 'data/contention_rounds.csv';
const approvedContentionNote = 'Frozen Reveal Day analytical ranking from the secondary index, observed 7 October 2026. These historical counts are not current APS totals or the official String Confirmation contention list; the current Application Atlas provides a separately dated calculation from the archived official APS export.';
execFileSync('python3', ['-c', [
  'import csv, io, json, sys',
  'payload = json.load(sys.stdin)',
  'before_reader = csv.DictReader(io.StringIO(payload["before"]))',
  'after_reader = csv.DictReader(io.StringIO(payload["after"]))',
  'before, after = list(before_reader), list(after_reader)',
  'assert before_reader.fieldnames == after_reader.fieldnames, "Derived contention CSV columns changed"',
  'assert len(before) == len(after), "Derived contention CSV rows added or removed"',
  'for old, new in zip(before, after):',
  '    expected = dict(old)',
  '    if old["round"] == "2026":',
  '        assert old["note"] == "Derived from public 2026 application records; preliminary during the Replacement Period and until String Confirmation Day.", "Unexpected historical note"',
  '        expected["note"] = payload["approvedNote"]',
  '    assert new == expected, "Derived contention values changed beyond the dated note: " + old["string"]'
].join('\n')], {input: JSON.stringify({before: gitFile(technicalBaseline, contentionTable).toString('utf8'), after: fs.readFileSync(contentionTable, 'utf8'), approvedNote: approvedContentionNote})});
const previousHistory = gitFile(technicalBaseline, 'data/aps_2026_record_observations.csv');
const currentHistory = fs.readFileSync('data/aps_2026_record_observations.csv');
assert.deepEqual(currentHistory.subarray(0, previousHistory.length), previousHistory, 'The full previous observation log must remain an exact prefix');
const oldResearch = JSON.parse(gitFile(technicalBaseline, 'research/research_release_manifest.json'));
const newResearch = JSON.parse(fs.readFileSync('research/research_release_manifest.json', 'utf8'));
assert.deepEqual(newResearch.currentResearchRelease, oldResearch.currentResearchRelease, 'Archived RR3 identity changed');
assert.deepEqual(newResearch.previousResearchReleases, oldResearch.previousResearchReleases, 'Archived RR1/RR2 identities changed');

const review = JSON.parse(JSON.stringify(prior));
review.reviewId = 'aps-followup-2026-11-27-v0.8.3';
review.status = 'reviewed';
review.reviewedOn = pub.releasedOn;
review.publicationVersion = pub.version;
review.parentReview = previousPath;
review.priorTechnicalBaseline = {version: '0.8.2', commit: technicalBaseline, reviewSHA256: sha(previousPath)};
review.reviewInstruction = 'Publish the verified 27 November APS follow-up in four languages, with exact Application ID deltas and dated source scopes, while preserving all historical evidence and research releases.';
Object.assign(review.rationales, {
  APS083: 'Reviewed the complete 27 November raw and normalized APS export against the 22 November source: 42 status transitions and 36 Change Request flag transitions, with stable record IDs. Publish 61 visible withdrawn families separately from 72 in APS Statistics; preserve 152 selected replacements and the dated official contention file. Do not infer event times, withdrawal reasons or official contention outcomes.',
  EDIT083: 'Append the four-language sourced follow-up and all 42 affected application identities; retain prior notes and revisions. Correct stale Atlas and contention timing copy and classify the .official withdrawal as a program event without an undocumented .lugano impact.',
  QA083: 'Advance only current-source count and date expectations; add exact earlier-history prefix protection and current withdrawal card checks. Retain original historical hashes, reviewed source protection, seven required PR contexts and accessibility thresholds.',
  V083: 'Publish a separate deterministic v0.8.3 technical package and synchronized current metadata. Preserve all previous ZIPs, the RR1/RR2/RR3 identities and the scholarly manuscript revision; new observations are outside the frozen RR3 evidence.'
});
review.linkReplacements = (review.linkReplacements || []).map(item => ({
  ...item, publishedPath: item.publishedPath.replace(/v0\.8\.2/g, 'v0.8.3')
}));
for (const [id, value] of Object.entries(sections)) {
  const old = prior.sourceSections[id];
  review.sourceSections[id] = {
    ...value, baselineSHA256: old.baselineSHA256, baselineCharacters: old.baselineCharacters,
    rationaleIds: old.sha256 === value.sha256 ? old.rationaleIds : [...new Set([...(old.rationaleIds || []), 'APS083'])]
  };
}
review.approvedCandidateSHA256 = verify.sha256(source);
const changed = execFileSync('git', ['diff', '--name-only', technicalBaseline], {encoding: 'utf8'}).trim().split('\n').filter(Boolean);
const untracked = execFileSync('git', ['ls-files', '--others', '--exclude-standard'], {encoding: 'utf8'}).trim().split('\n').filter(Boolean);
for (const file of [...new Set([...changed, ...untracked])]) {
  if (file === currentPath || file === 'content-continuity-audit.json') continue;
  assert.ok(fs.existsSync(file), 'No removal authorized in this APS follow-up: ' + file);
  let before = null;
  try { before = gitFile(technicalBaseline, file); } catch (_) {}
  const old = prior.files?.[file];
  const rationale = file.startsWith('downloads/connecting-the-dots-data-pack-v0.8.3') ? 'V083'
    : /^(scripts\/|assets\/|build\.py)/.test(file) ? 'QA083'
    : /aps_|round_2026_followup|round-2026-followup/.test(file) ? 'APS083' : 'EDIT083';
  review.files[file] = {
    ...old,
    baselineSHA256: old ? old.baselineSHA256 : (before === null ? null : digest(before)),
    sha256: sha(file), rationaleIds: [...new Set([...(old?.rationaleIds || []), rationale])]
  };
}
for (const [file, item] of Object.entries(review.files)) {
  assert.ok(fs.existsSync(file), 'Previously reviewed file missing: ' + file);
  const next = sha(file);
  if (item.sha256 !== next) item.rationaleIds = [...new Set([...(item.rationaleIds || []), 'EDIT083'])];
  item.sha256 = next;
}
review.auditSummary = {
  baseline: review.priorTechnicalBaseline,
  evidenceReview: 'docs/aps-followup-2026-11-27.md',
  remediations: [
    'Preserve the complete 22 November export and compare the new source by stable APS record ID, with no added or removed IDs.',
    'Publish 42 newly observed withdrawals and 36 changed Change Request labels, distinguishing aggregate flags from explicit approved requests.',
    'Keep 61 withdrawn export families separate from 72 in APS Statistics; do not attribute the discrepancy to an unproved cause.',
    'Update the current Atlas to 222 groups / 650 applications as project-derived exact-primary overlaps, while the official 17 November contention file remains 226 / 705.',
    'Append the 2,783 current observations after the byte-identical 8,349-observation historical prefix.',
    'Correct Atlas source dates, completed String Confirmation wording and the unrelated .official program-event classification in all four languages.'
  ],
  preservedHistoricalFiles: preserved.length,
  historicalTableNoteCorrection: {file: contentionTable, scope: 'Only the 2026 explanatory note changes; columns, row order, strings, numbers and source URLs are unchanged.'},
  archivePolicy: 'Reveal Day, the 17 and 22 November source files, RR1/RR2/RR3 and every earlier technical package remain immutable. The 27 November evidence is not retroactively covered by the RR3 DOI.'
};
review.verification = {
  status: 'source-and-generated-files-reviewed', reviewedOn: pub.releasedOn,
  sourceCommit: pub.sourceReviewCommit,
  reviewType: 'AI-assisted primary-source reconciliation, archival preservation and generated-output review',
  humanParticipants: 0, protectedSourceSections: Object.keys(sections).length,
  reviewedSourceSections: ['explore'], exactFiles: Object.keys(review.files).length,
  recorderChecks: ['exact source-review commit inputs', 'all prior archives and raw evidence', 'complete observation-history prefix', 'RR1/RR2/RR3 identities', 'source section parity', 'reviewed file fingerprints'],
  qualityGates: 'All seven required PR checks must pass on the final candidate before the protected merge. An actual Pages deployment and verified public bytes for the promoted SHA are required afterwards; this recorder does not certify those executions.'
};
review.signoff = {reviewedOn: pub.releasedOn, reviewType: review.verification.reviewType, sourceCommit: pub.sourceReviewCommit, humanParticipants: 0, scope: review.reviewInstruction};
review.buildProvenancePolicy = {version: pub.version, sourceReviewCommit: pub.sourceReviewCommit, semantics: pub.buildProvenanceRole};
verify.checkProtection(review, source, pub);
verify.validateReviewedFiles(review, pub);
fs.writeFileSync(currentPath, JSON.stringify(review, null, 2) + '\n');
console.log('APS083_REVIEW_RECORDED', JSON.stringify({files: Object.keys(review.files).length, historicalFiles: preserved.length, protectedSections: Object.keys(sections).length, sourceReviewCommit: pub.sourceReviewCommit}));
