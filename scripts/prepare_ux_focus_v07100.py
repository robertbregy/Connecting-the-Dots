"""Assemble the three reviewed CSS fixes on one isolated release branch."""
from pathlib import Path
import copy
import hashlib
import json
import os
import re
import subprocess

ROOT = Path(__file__).resolve().parents[1]
os.chdir(ROOT)
BASE = 'fbbbecf7d9f03d65e7e3026afcc083a353f196f0'
BRANCH = 'work/ux-release-v07100-20261107'
VERSION = '0.7.100'
REVIEW = 'docs/editorial-review-2026-11-07-v0.7.100.json'
EVIDENCE = 'docs/audits/2026-11-07/ux-focus-release-v0.7.100.json'
BOOTSTRAP = {
    'scripts/prepare_ux_focus_v07100.py', 'scripts/audit_focus_reflow.cjs',
    '.github/workflows/assemble-ux-focus-v07100.yml',
    '.github/workflows/focus-reflow-regression.yml',
}
STYLE = '''/* Preserve usable reading space at high zoom or in short viewports.
   The html qualifier wins over the later audience.css mobile rule. */
@media (max-height: 500px) {
  html .iaPrimaryNav { position: static; }
}
/* Keep long translated labels intact instead of splitting words. */
@media (max-width: 360px) {
  .apsNativePanel .apsMetrics { grid-template-columns: minmax(0, 1fr); }
}
'''
ATLAS = '''/* The keyboard skip link must appear above the sticky Atlas header. */
.apsSkip:focus { z-index: 100; }
'''
SUMMARIES = {
    'it': 'Focus visibile, salto al contenuto e riquadri mobili leggibili. Dati invariati.',
    'en': 'Visible focus, accessible skip link and readable mobile metrics. Data unchanged.',
    'de': 'Sichtbarer Fokus, Sprunglink und lesbare mobile Kennzahlen. Daten unver\u00e4ndert.',
    'fr': 'Focus visible, lien d\u2019\u00e9vitement et indicateurs mobiles lisibles. Donn\u00e9es inchang\u00e9es.',
}

def command(*args):
    return subprocess.check_output(args, text=True).strip()

def run(*args, **kwargs):
    subprocess.run(args, check=True, **kwargs)

def digest(data):
    return hashlib.sha256(data).hexdigest()

def sha(name):
    return digest(Path(name).read_bytes())

def load(name):
    return json.loads(Path(name).read_text(encoding='utf-8'))

def write(name, obj):
    p = Path(name)
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

assert os.environ.get('GITHUB_REF_NAME') == BRANCH, 'Never assemble on main'
HEAD = command('git', 'rev-parse', 'HEAD')
assert HEAD == os.environ['GITHUB_SHA']
assert not command('git', 'status', '--porcelain'), 'Assembly must start clean'
assert command('git', 'merge-base', BASE, HEAD) == BASE
assert set(command('git', 'diff', '--name-only', BASE, HEAD).splitlines()) <= BOOTSTRAP
assert command('git', 'ls-remote', 'origin', 'refs/heads/main').split()[0] == BASE, 'Main advanced'
run('node', 'scripts/verify_ia_b2_parity.cjs')
tracked = command('git', 'ls-tree', '-r', '--name-only', BASE).splitlines()
original = {name: Path(name).read_bytes() for name in tracked}
old_pub = load('publication.json')
assert old_pub['version'] == '0.7.99' and old_pub['releasedOn'] == '2026-11-07'
old_review = load(old_pub['editorialReviewPath'])
assert old_review['status'] == 'reviewed'
for name, addition in [('assets/style.css', STYLE), ('assets/aps-atlas.css', ATLAS)]:
    assert addition not in Path(name).read_text(encoding='utf-8'), 'Patch already applied'
    Path(name).write_bytes(original[name] + b'\n' + addition.encode('utf-8'))
pub = copy.deepcopy(old_pub)
pub.update(version=VERSION, currentDataPackVersion=VERSION,
           currentDataPackPath='downloads/connecting-the-dots-data-pack-v0.7.100.zip',
           editorialReviewPath=REVIEW, buildProvenanceCommit=HEAD)
write('publication.json', pub)
tr = load('data/translations.json')
for lang, text in SUMMARIES.items():
    assert 'release07100' not in tr[lang]
    tr[lang]['release07100'] = text
write('data/translations.json', tr)
history = load('data/release_history.json')
assert history['releases'][0]['version'] == '0.7.99'
history['releases'].insert(0, {**history['releases'][0], 'version': VERSION, 'summaryKey': 'release07100'})
write('data/release_history.json', history)
frozen = load('data/frozen_technical_packages.json')
assert old_pub['currentDataPackPath'] not in frozen['files']
frozen['files'][old_pub['currentDataPackPath']] = sha(old_pub['currentDataPackPath'])
write('data/frozen_technical_packages.json', frozen)
for name in ['research/README.md', 'research/connecting-the-dots-working-paper-v1.md']:
    assert b'0.7.99' in original[name]
    Path(name).write_bytes(original[name].replace(b'0.7.99', b'0.7.100'))
readme = original['README.md'].decode('utf-8')
readme = readme.replace('v0.7.99', 'v0.7.100', 1)
marker = '## Current release\n\n'
assert readme.count(marker) == 1
readme = readme.replace(marker, marker + '**v0.7.100 - 7 November 2026**\n\n'
    'Keyboard focus remains visible in short viewports; the Atlas skip link appears above the header; '
    'embedded Atlas metrics use one column on narrow screens. Scientific data and earlier archives remain unchanged.\n\n'
    '## Previous experience audit\n\n', 1)
Path('README.md').write_text(readme, encoding='utf-8')
Path('CHANGELOG.md').write_bytes((
    '# v0.7.100 - 7 November 2026\n\n'
    '- Keep keyboard focus visible by releasing the sticky primary navigation in short viewports.\n'
    '- Show the focused Atlas skip link above its sticky header.\n'
    '- Preserve complete metric labels with one column in the embedded Atlas at widths up to 360 CSS pixels.\n'
    '- Add permanent focus/reflow regression coverage; retain all research and previous technical archives.\n\n'
).encode('utf-8') + original['CHANGELOG.md'])
review = copy.deepcopy(old_review)
review.update(reviewId='ux-focus-maintenance-2026-11-07-v0.7.100',
              status='candidate-pending-exact-output-review', publicationVersion=VERSION,
              reviewedOn='2026-11-07', parentReview=old_pub['editorialReviewPath'],
              priorTechnicalBaseline=BASE)
review['rationales']['UX100'] = 'Apply only the three CSS fixes tested in runs 42353464063 and 42354145162: short-viewport focus visibility, Atlas skip-link stacking and readable embedded metrics up to 360 CSS pixels. Preserve every destination, scientific record, translated body and historical archive.'
review['rationales']['V100'] = 'Publish a separate deterministic technical package and synchronize current technical references only. Preserve paper revision, RR1/RR2 identities and every older package. Add one dated release-history entry in four languages.'
review['rationales']['QA100'] = 'Retain all existing acceptance checks unchanged and add permanent browser regression coverage of the three CSS corrections at their real stylesheet positions.'
for item in review.get('linkReplacements', []):
    if 'publishedPath' in item:
        item['publishedPath'] = item['publishedPath'].replace('0.7.99', VERSION)
review['buildProvenancePolicy'] = {
    'version': VERSION, 'sourceCommit': HEAD,
    'semantics': 'Pinned assembly-recipe commit. The recipe applies exact reviewed CSS additions and technical metadata changes to the stated production baseline. Final generated bytes are reviewed and committed separately.'
}
write(REVIEW, review)
# All existing validators execute without modifications or weaker budgets.
run('python3', 'build.py')
allowed_mutable = {
    'publication.json', 'package.json', 'package-lock.json', 'README.md', 'CHANGELOG.md',
    'src/index.web.html', 'assets/style.css', 'assets/aps-atlas.css',
    'data/translations.json', 'data/release_history.json', 'data/frozen_technical_packages.json',
    'data/manifest.json', 'data/publication.js', 'data/data_bundle.js', 'data/site_bundle.js',
    'data/i18n_bundle.js', 'docs/reader-first-structure.json',
    'research/README.md', 'research/connecting-the-dots-working-paper-v1.md',
    'research/research_release_manifest.json', 'sitemap.xml',
    *['data/i18n_' + l + '.js' for l in SUMMARIES],
    *['data/explorer_profiles_' + str(i) + '.js' for i in range(8)],
}
changed = [name for name in tracked if Path(name).read_bytes() != original[name]]
for name in changed:
    assert name in allowed_mutable or (name.endswith('.html') and not name.startswith(('docs/', 'prototype/', 'src/'))), 'Unreviewed changed file: ' + name
for name in tracked:
    if name.startswith('downloads/') or name.endswith('.csv') or (name.startswith('data/') and name.endswith('.json') and name not in allowed_mutable):
        assert Path(name).read_bytes() == original[name], 'Scientific or historical data changed: ' + name
for name in ['CITATION.cff', '.zenodo.json', old_pub['editorialReviewPath']]:
    assert Path(name).read_bytes() == original[name], 'Frozen reference changed: ' + name
assert Path('src/index.web.html').read_bytes() == original['src/index.web.html'].replace(b'0.7.99', b'0.7.100'), 'Canonical source changed beyond technical metadata'
for name, addition in [('assets/style.css', STYLE), ('assets/aps-atlas.css', ATLAS)]:
    assert Path(name).read_bytes() == original[name] + b'\n' + addition.encode('utf-8')
for name in tracked:
    if name.startswith(('assets/', 'scripts/')) and name not in {'assets/style.css', 'assets/aps-atlas.css'}:
        assert Path(name).read_bytes() == original[name], 'Original runtime or validator changed: ' + name
now_tr = load('data/translations.json')
for l in SUMMARIES:
    assert now_tr[l].pop('release07100') == SUMMARIES[l]
assert now_tr == json.loads(original['data/translations.json'])
rr = load('research/research_release_manifest.json')
rr['currentSiteVersion'] = old_pub['version']
assert rr == json.loads(original['research/research_release_manifest.json']), 'Research identity or revision changed'
new_pack = pub['currentDataPackPath']
new_paths = {new_pack, new_pack.replace('.zip', '.sha256')}
first = {name: sha(name) for name in set(tracked) | new_paths}
run('python3', 'build.py')
assert all(sha(name) == value for name, value in first.items()), 'Second complete build is not deterministic'
print('REPEATED_BUILD_IDENTICAL', len(first), flush=True)
# Snapshot the inspected whitelist before any exact fingerprint is accepted.
evidence = {
    'schemaVersion': 1, 'version': VERSION, 'baseCommit': BASE, 'assemblyRecipeCommit': HEAD,
    'sourceScope': 'Three exact CSS additions and technical publication metadata only; editorial rewording deferred.',
    'priorQA': [42353464063, 42354145162], 'humanParticipants': 0,
    'cssAdditions': {name: {'bytes': len(text.encode()), 'sha256': digest(text.encode())} for name, text in [('assets/style.css', STYLE), ('assets/aps-atlas.css', ATLAS)]},
    'changedExistingPaths': [{'path': n, 'before': digest(original[n]), 'after': sha(n)} for n in changed],
    'preservation': {
        'allHistoricalDownloadsIdentical': True,
        'allCSVFilesIdentical': True,
        'csvFiles': sum(n.endswith('.csv') for n in tracked),
        'scientificJSONIdentical': True, 'originalValidatorsIdentical': True,
        'existingTranslationKeysIdentical': True, 'canonicalSectionsUnchanged': True,
        'researchReleaseAndPaperRevisionUnchanged': True,
        'twoCompleteBuildsIdentical': True, 'comparedFiles': len(first),
    },
    'currentPackageSHA256': sha(new_pack),
    'acceptance': 'Source whitelist and repeated-build checks executed. Full branch browser, A/B, deployment and live-byte acceptance are separate required gates; no deployment or conformance claim is made here.'
}
write(EVIDENCE, evidence)
for name in [*changed, *new_paths, EVIDENCE, 'scripts/prepare_ux_focus_v07100.py', 'scripts/audit_focus_reflow.cjs', '.github/workflows/focus-reflow-regression.yml', old_pub['editorialReviewPath']]:
    rec = review['files'].setdefault(name, {'baselineSHA256': None, 'rationaleIds': []})
    rec['sha256'] = sha(name)
    reason = 'UX100' if name in {'assets/style.css', 'assets/aps-atlas.css'} else 'QA100' if name.startswith(('scripts/', '.github/')) else 'V100'
    rec['rationaleIds'] = list(dict.fromkeys([*rec['rationaleIds'], reason]))
review['approvedCandidateSHA256'] = sha('src/index.web.html')
review['status'] = 'reviewed'
review['reviewInstruction'] = 'Exact CSS and technical-metadata review against the accepted 0.7.99 source. All original validators and data preserved. This source signoff is not a browser or deployment result.'
review['verification'] = {
    'scope': evidence['sourceScope'], 'baseMain': BASE, 'sourceCommit': HEAD,
    'humanParticipants': 0, 'reviewType': 'AI-assisted exact-diff and explicit source-whitelist review',
    'reviewedPaths': len(review['files']), 'currentArchiveSHA256': sha(new_pack),
    'evidence': [EVIDENCE], 'qualityGates': 'Full original browser/WCAG and A/B acceptance plus new focus regression before main; actual successful Pages deployment and live-byte checks afterwards.',
    'priorReviewEvidenceScope': 'Inherited records describe only their original commits and versions, not fresh v0.7.100 acceptance.'
}
review['signoff'] = {'status': 'reviewed source and deterministic generated bytes', 'reviewDate': '2026-11-07', 'reviewer': 'AI-assisted technical review', 'sourceCommit': HEAD, 'scope': evidence['sourceScope'], 'humanParticipants': 0, 'evidence': [EVIDENCE], 'independentTests': 'All CI and public verification gates remain required.'}
write(REVIEW, review)
run('node', 'scripts/verify_ia_b2_parity.cjs')
run('python3', 'scripts/release_check.py')
run('node', 'scripts/validate_multilingual.js')
run('node', 'scripts/validate_internet_access.js')
run('node', 'scripts/validate_delivery.js', env={**os.environ, 'CTD_STATIC_ONLY': '1'})
run('node', 'scripts/usability_remediation_qa.cjs', '--static-only')
# Write only the isolated assembly branch, and fail on any concurrent source change.
run('git', 'fetch', 'origin', BRANCH)
assert command('git', 'rev-parse', 'FETCH_HEAD') == HEAD, 'Assembly branch advanced'
assert command('git', 'ls-remote', 'origin', 'refs/heads/main').split()[0] == BASE, 'Main advanced'
run('git', 'config', 'user.name', 'github-actions[bot]')
run('git', 'config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com')
run('git', 'add', '--', *sorted(set(changed) | new_paths | {REVIEW, EVIDENCE}))
assert '.github/' not in command('git', 'diff', '--cached', '--name-only'), 'Do not modify workflows through the build token'
run('git', 'diff', '--cached', '--check')
run('git', 'commit', '-m', 'Assemble reviewed v0.7.100 focus and reflow corrections [skip build]')
run('git', 'push', 'origin', 'HEAD:refs/heads/' + BRANCH)
candidate = command('git', 'rev-parse', 'HEAD')
Path('ux-assembly-result.json').write_text(json.dumps({'candidateCommit': candidate, 'tree': command('git', 'rev-parse', 'HEAD^{tree}'), 'version': VERSION, 'review': REVIEW, 'evidence': EVIDENCE, 'dataPackSHA256': sha(new_pack)}, indent=2) + '\n')
print('UX100_ASSEMBLED', candidate, flush=True)
