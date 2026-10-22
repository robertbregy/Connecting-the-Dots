"""Build the exact reviewed candidate; never deploy or grant workflow permissions."""
from pathlib import Path
import base64
import gzip
import hashlib
import json
import os
import subprocess


def run(*args):
    return subprocess.run(args, check=True)


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


parts = [Path('.github/usability-candidate.' + str(i)) for i in range(7)]
if parts[0].exists():
    raw = b''.join(p.read_bytes() for p in parts)
    assert len(raw) == 21540
    assert hashlib.sha256(raw[:10768]).hexdigest() == 'fe75a615505372953b89aa4a3abfb019cef04ab7a857782dc4caeb3a2a1b2037'
    assert hashlib.sha256(raw[10768:]).hexdigest() == 'b8408e6eee05d4887a512a2067fc8ea062c6c7dfe1f4598f6fc3f402f368b026'
    payload = gzip.decompress(base64.b64decode(raw, validate=True))
    assert hashlib.sha256(payload).hexdigest() == '8eeef2468ac18494598a443e1b7a47dea380054050544181db8138e9039e8389'
    files = json.loads(payload)
    assert set(files) == {'scripts/usability_remediation.cjs', 'scripts/usability_remediation_qa.cjs', 'scripts/run_browser_regressions.py', 'scripts/usability_remediation.patch', 'docs/usability-remediation-review.json'}
    for name, text in files.items():
        Path(name).write_text(text, encoding='utf-8')
    # The authorized connector, not GITHUB_TOKEN, commits workflow changes.
    assert sha('.github/workflows/audit-browser.yml') == '5fd164521a8eb890138403066e147570b54041135937e87c65275da4c2bb0585'
    patch = ['git', 'apply', '--exclude=.github/workflows/audit-browser.yml']
    run(*patch, '--check', 'scripts/usability_remediation.patch')
    run(*patch, 'scripts/usability_remediation.patch')
    for p in parts:
        p.unlink()

candidate = json.loads(Path('docs/usability-remediation-review.json').read_text())
for name, digest in candidate['expectedFiles'].items():
    if not name.endswith('.html'):
        assert sha(name) == digest, 'Inspected source mismatch: ' + name

run('python3', 'build.py')
pub = json.loads(Path('publication.json').read_text())
paths = {Path('index.html'), *Path('.').glob('*/index.html'), *Path('applications').rglob('index.html'), *Path('behind-the-round').rglob('index.html'), *Path('inside-the-round').rglob('index.html'), Path(pub['currentDataPackPath'])}
first = {str(p): sha(p) for p in paths}
run('python3', 'build.py')
assert all(sha(p) == digest for p, digest in first.items()), 'Repeated build drift'
print('REPEATED_BUILD_IDENTICAL', len(first), flush=True)
run('node', 'scripts/usability_remediation_qa.cjs', '--static-only')
run('node', 'scripts/validate_multilingual.js')
run('node', 'scripts/validate_internet_access.js')
subprocess.run(['node', 'scripts/validate_delivery.js'], env={**os.environ, 'CTD_STATIC_ONLY': '1'}, check=True)

baseline = candidate['baseline']
for name, digest in candidate['expectedFiles'].items():
    assert sha(name) == digest, 'Candidate drift: ' + name
for name in candidate['independentAssetsOnly']:
    old = subprocess.check_output(['git', 'show', baseline + ':' + name]).decode('utf-8')
    expected = old.replace('reader-first.css?v=0.7.92', 'reader-first.css?v=0.7.92-usability-20261022').replace('reader-first.js?v=0.7.92', 'reader-first.js?v=0.7.92-usability-20261022')
    assert Path(name).read_text(encoding='utf-8') == expected, 'Independent content changed: ' + name
changed = subprocess.check_output(['git', 'diff', '--name-only', baseline, '--', 'data', 'downloads', 'publication.json', 'CITATION.cff']).decode().splitlines()
assert set(changed) <= {'data/publication.js'}, 'Research data drift: ' + str(changed)
review_path = Path(pub['editorialReviewPath'])
review = json.loads(review_path.read_text())
review['rationales']['E13'] = candidate['rationale']
for name, digest in candidate['expectedFiles'].items():
    item = review['files'].setdefault(name, {'baselineSHA256': None, 'rationaleIds': []})
    item['sha256'] = digest
    if 'E13' not in item['rationaleIds']:
        item['rationaleIds'].append('E13')
review['usabilityAuditReview'] = {'reviewedOn': '2026-10-22', 'baseline': baseline, 'type': candidate['reviewType'], 'humanParticipants': 0, 'acceptanceScript': 'scripts/usability_remediation_qa.cjs'}
review_path.write_text(json.dumps(review, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
run('node', 'scripts/verify_ia_b2_parity.cjs')

branch = os.environ['GITHUB_REF_NAME']
assert branch == 'fix/usability-audit-20261022', 'Never write the public branch'
run('git', 'fetch', 'origin', branch)
assert subprocess.check_output(['git', 'rev-parse', 'FETCH_HEAD']) == subprocess.check_output(['git', 'rev-parse', 'HEAD']), 'Branch advanced'
run('git', 'config', 'user.name', 'github-actions[bot]')
run('git', 'config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com')
Path('docs/usability-remediation-static.json').write_bytes(Path('audit-usability/report.json').read_bytes())
run('git', 'add', 'scripts', 'assets', '.github', 'docs', 'data/publication.js', 'index.html', 'it', 'en', 'de', 'fr', 'applications', 'behind-the-round', 'inside-the-round', 'explorer', 'research/index.html')
if subprocess.run(['git', 'diff', '--cached', '--quiet']).returncode:
    run('git', 'commit', '-m', 'Build exact usability audit corrections for browser acceptance [usability artifacts] [skip build]')
    run('git', 'push', 'origin', 'HEAD:' + branch)
commit = subprocess.check_output(['git', 'rev-parse', 'HEAD'], text=True).strip()
with open(os.environ['GITHUB_OUTPUT'], 'a') as out:
    out.write('candidate=' + commit + '\n')
