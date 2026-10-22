"""Apply the exact, inspected 22 October editorial candidate, never fetch data."""
from pathlib import Path
import base64
import hashlib
import json
import lzma
import subprocess

ROOT = Path(__file__).resolve().parent.parent
parts = [ROOT / ('.github/round-input.' + str(i)) for i in range(10)]
if parts[0].exists():
    encoded = b''.join(p.read_bytes() for p in parts)
    assert len(encoded) == 27004, 'Source transport length changed'
    raw = lzma.decompress(base64.b64decode(encoded, validate=True))
    assert hashlib.sha256(raw).hexdigest() == 'b88dcbb4c9338795609475ba738fff202d09c87b3681983f81c0d52c816d8678', 'Source transport checksum changed'
    candidate = json.loads(raw)
    assert candidate['baseline'] == 'ba6947fd432f6d5d60019948d182928ad84b10f8'
    for name in candidate['expectedSource']:
        p = Path(name)
        assert not p.is_absolute() and '..' not in p.parts
    old_review = ROOT / 'docs/editorial-review-2026-10-21-v0.7.92.json'
    new_review = ROOT / 'docs/editorial-review-2026-10-22-v0.7.93.json'
    review = json.loads(old_review.read_text(encoding='utf-8'))
    for key in candidate['removeReviewKeys']:
        review.pop(key)
    for key, value in candidate['reviewDelta'].items():
        if key in ('files', 'rationales'):
            review[key].update(value)
        else:
            review[key] = value
    new_review.write_text(json.dumps(review, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    patch = candidate['patch'].encode('utf-8')
    subprocess.run(['git', 'apply', '--unidiff-zero', '--check', '-'], input=patch, cwd=ROOT, check=True)
    subprocess.run(['git', 'apply', '--unidiff-zero', '-'], input=patch, cwd=ROOT, check=True)
    for name, text in candidate['new'].items():
        assert name in candidate['expectedSource']
        (ROOT / name).write_text(text, encoding='utf-8')
    for name, digest in candidate['expectedSource'].items():
        assert hashlib.sha256((ROOT / name).read_bytes()).hexdigest() == digest, 'Inspected source mismatch: ' + name
    for p in parts:
        p.unlink()
else:
    assert json.loads((ROOT / 'publication.json').read_text())['version'] == '0.7.93', 'Missing source candidate'
print('EXACT_ROUND_CHECKPOINT_SOURCE_READY: no new application export; browser acceptance required')
