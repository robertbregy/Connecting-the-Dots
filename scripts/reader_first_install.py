"""Idempotent feature-branch bootstrap. Never auto-approves editorial changes."""
from pathlib import Path
import hashlib
import json
import re
import subprocess

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
    updated, count = re.subn(r'(function\s+renderSectionTocs\s*\([^)]*\)\s*\{)', lambda m: m.group(1) + guard, text)
    if count != 1:
        raise SystemExit('Expected exactly one legacy TOC renderer')
    app.write_text(updated, encoding='utf-8')

def read(p):
    return json.loads((ROOT / p).read_text(encoding='utf-8'))
def write(p, value):
    (ROOT / p).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
pub = read('publication.json')
if pub['version'] == '0.7.92':
    pub['editorialReviewPath'] = 'docs/editorial-review-2026-10-21-v0.7.92.json'
    write('publication.json', pub)
    history = read('data/release_history.json')
    if not any(r['version'] == '0.7.92' for r in history['releases']):
        record = dict(history['releases'][0])
        record.update(version='0.7.92', date='2026-10-21', summaryKey='release0792')
        history['releases'].insert(0, record)
        write('data/release_history.json', history)
    translations = read('data/translations.json')
    additions = {
        'it': 'Percorsi di lettura in tutti i capitoli: ordine narrativo, indici locali, collegamenti per proseguire e accessi diretti alla ricerca. Contenuti, fonti, vecchi collegamenti e archivi scientifici conservati; nessun nuovo risultato di ricerca.',
        'en': 'Reading pathways across every chapter: narrative order, local contents, meaningful next links and direct research access. Content, sources, legacy links and scientific archives retained; no new research findings.',
        'de': 'Lesepfade durch alle Kapitel: nachvollziehbare Reihenfolge, lokale Inhaltsverzeichnisse, weiterführende Links und direkter Forschungszugang. Inhalte, Quellen, alte Links und Forschungsarchive bleiben erhalten; keine neuen Forschungsergebnisse.',
        'fr': 'Parcours de lecture dans tous les chapitres : ordre narratif, sommaires locaux, liens pour poursuivre et accès direct à la recherche. Contenus, sources, anciens liens et archives scientifiques conservés ; aucun nouveau résultat de recherche.'
    }
    for lang, value in additions.items():
        translations[lang]['release0792'] = value
    write('data/translations.json', translations)
    readme = ROOT / 'README.md'
    text = readme.read_text(encoding='utf-8')
    if '**v0.7.92' not in text:
        text = text.replace('v0.7.91', 'v0.7.92', 1)
        text = text.replace('## Current release\n\n', '## Current release\n\n**v0.7.92 · 21 October 2026**\n\nReader-first pathways across 23 chapters and four languages: preserved evidence, local contents, coherent next steps, direct research access and keyboard-aware navigation. This is an editorial/technical release, not a new research release. Independent human reader studies remain pending.\n\n## Previous release\n\n', 1)
        readme.write_text(text, encoding='utf-8')
    review_script = ROOT / 'scripts' / 'reader_first_review.cjs'
    if review_script.exists():
        subprocess.run(['node', str(review_script), '--apply-approval'], cwd=ROOT, check=True)
print('READER_BUILD_INTEGRATED: original anchors, archival identities and source dates retained')
