"""Install the reviewed reader transform without rewriting the legacy source template.

Idempotent bootstrap used by the isolated feature-branch verification workflow.
No publication dates, evidence snapshots or editorial approval hashes are changed.
"""
from pathlib import Path
import hashlib
import re

ROOT = Path(__file__).resolve().parent.parent
build = ROOT / 'build.py'
text = build.read_text(encoding='utf-8')
entry = '    subprocess.run(["node", str(ROOT / "scripts" / "reader_first.cjs")], check=True)'
if entry not in text:
    anchor = '    subprocess.run(["node", str(ROOT / "scripts" / "reorder_economics.cjs")], check=True)'
    if text.count(anchor) != 1:
        raise SystemExit('Reader transform insertion point is missing or ambiguous')
    build.write_text(text.replace(anchor, anchor + '\n' + entry), encoding='utf-8')

app = ROOT / 'assets' / 'app.js'
text = app.read_text(encoding='utf-8')
guard = "if(document.documentElement.hasAttribute('data-reader-first'))return;"
if guard not in text:
    expected = '3d2a18d60ac1d5d71ab97840d600e6667c634c2718636fbedebdb213eb8ed91a'
    if hashlib.sha256(app.read_bytes()).hexdigest() != expected:
        raise SystemExit('Runtime changed since the inspected baseline; review the TOC integration again')
    pattern = r'(function\s+renderSectionTocs\s*\([^)]*\)\s*\{)'
    updated, count = re.subn(pattern, lambda m: m.group(1) + guard, text)
    if count != 1:
        raise SystemExit('Expected exactly one legacy TOC renderer')
    app.write_text(updated, encoding='utf-8')
print('READER_BUILD_INTEGRATED: original prerender anchors retained; browser uses the static reader index')
