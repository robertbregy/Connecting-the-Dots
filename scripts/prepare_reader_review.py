"""Prepare exact fingerprints; approval requires a separate explicit action.

Default output stays pending. --finalize is used only after reviewing the source
changes and browser artifacts. It is not a substitute for that review.
"""
from pathlib import Path
import argparse
import hashlib
import json
import subprocess

ROOT = Path(__file__).resolve().parents[1]
PREVIOUS = 'docs/editorial-review-2026-10-20-v0.7.91.json'
NEW = 'docs/editorial-review-2026-10-21-v0.7.92.json'
ADDED = [
    'assets/reader.css', 'assets/reader.js', 'data/reader_pathways.json',
    'scripts/reconcile_reader_first.cjs', 'scripts/validate_reader_first.cjs',
    'scripts/audit_reader_first.cjs', 'scripts/prepare_reader_review.py',
    'scripts/validate_audit_20261018.cjs',
    'docs/READER_FIRST_2026-10-21.md',
    'docs/reader-first-frozen-evidence.json',
    'docs/reader-first-content-preservation.json',
    'docs/reader-first-static-checks.json',
]

def sha(path):
    return hashlib.sha256((ROOT / path).read_bytes()).hexdigest()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--finalize', action='store_true')
    parser.add_argument('--browser-run', default='pending')
    args = parser.parse_args()
    if args.finalize and args.browser_run == 'pending':
        raise SystemExit('Final review must identify the inspected browser run')
    publication = json.loads((ROOT / 'publication.json').read_text())
    review = json.loads((ROOT / PREVIOUS).read_text())
    review.update(
        reviewId='reader-first-2026-10-21-v0.7.92',
        status='reviewed' if args.finalize else 'pending',
        reviewedOn=publication['releasedOn'],
        publicationVersion=publication['version'],
        parentReview=PREVIOUS,
        priorTechnicalBaseline='639617f5b79cf5524825ab7093f4c7bb722d1d42',
    )
    review['rationales']['R01'] = (
        'Reader-first navigation and ten explicitly checked reorders; retain '
        'original evidence, source links and stable fragments. Four-language '
        'intentions, contextual reading, complete index and keyboard/focus '
        'support. Correct stale current-pack citation metadata. No observed '
        'human study or blanket accessibility conformance claimed.'
    )
    for item in review['linkReplacements']:
        item['publishedPath'] = item['publishedPath'].replace('0.7.91', publication['version'])
    changed = []
    for filename, item in review['files'].items():
        current = sha(filename)
        if current != item['sha256']:
            item['sha256'] = current
            if 'R01' not in item['rationaleIds']:
                item['rationaleIds'].append('R01')
            changed.append(filename)
    for filename in ADDED:
        if filename not in review['files']:
            review['files'][filename] = {
                'baselineSHA256': None,
                'sha256': sha(filename),
                'rationaleIds': ['R01'],
            }
    code = "const fs=require('fs'),p=require('./scripts/verify_ia_b2_parity.cjs');console.log(JSON.stringify(p.sectionDigests(fs.readFileSync('src/index.web.html','utf8'))))"
    digests = json.loads(subprocess.check_output(['node', '-e', code], cwd=ROOT, text=True))
    for section, current in digests.items():
        item = review['sourceSections'][section]
        if item['sha256'] != current['sha256']:
            item['sha256'] = current['sha256']
            item['characters'] = current['characters']
            if 'R01' not in item['rationaleIds']:
                item['rationaleIds'].append('R01')
    review['verification'] = {
        'scope': 'Source diff and generated navigation, four-language static checks, immutable evidence and real-browser artifacts',
        'humanParticipants': 0,
        'accessibilityConformanceClaim': False,
        'browserArtifactRun': args.browser_run,
        'priorReviewSha256': sha(PREVIOUS),
        'changedReviewedFiles': changed,
        'evidenceChecks': 'docs/reader-first-static-checks.json',
        'textPreservation': 'docs/reader-first-content-preservation.json',
    }
    (ROOT / NEW).write_text(json.dumps(review, ensure_ascii=False, indent=2) + '\n')
    print('READER_REVIEW', review['status'], len(changed), 'reviewed-file changes')


if __name__ == '__main__':
    main()
