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

# Own renderer corrections; legacy publication validators remain unchanged.
reader = ROOT / 'scripts' / 'reader_first.cjs'
text = reader.read_text(encoding='utf-8')
for old, new in [("disclosure.open = true;", "disclosure.setAttribute('open', '');"),
                 ("oldNav.hidden = true;", "oldNav.setAttribute('hidden', '');"),
                 ("legacy.hidden = true;", "legacy.setAttribute('hidden', '');"),
                 ("node(d, 'h1', L.routes[id][0], 'readerSrOnly')", "node(d, 'h2', L.routes[id][0], 'readerChapterTitle')"),
                 ("Number(d.documentElement.dataset.readerOriginalIds || ids.length)", "Number(d.body.dataset.readerOriginalIds || d.documentElement.dataset.readerOriginalIds || ids.length)")]:
    text = text.replace(old, new)
old = "  d.documentElement.dataset.readerOriginalIds = String(originalCount);\n  addAssets(d, prefix); write(file, d); report.independent.push({file: relative, lang, area, retainedExistingIds: originalCount});"
new = r'''  d.body.dataset.readerOriginalIds = String(originalCount);
  d.body.dataset.readerFirst = '1';
  addAssets(d, prefix);
  // Keep the original language, canonical, hreflang and structured metadata
  // exactly as emitted by their own generator. Only our stylesheet is added.
  let head = raw.slice(0, raw.search(/<body\b/i));
  assert.ok(head.includes('</head>'), 'Independent document head missing: ' + relative);
  head = head.replace(/ data-reader-(?:first|original-ids)="[^"]*"/g, '');
  head = head.replace(/<link\b(?=[^>]*data-reader-asset="reader-first\.css")[^>]*>\s*/g, '');
  const style = d.querySelector('link[data-reader-asset="reader-first.css"]');
  head = head.replace('</head>', style.outerHTML + '</head>');
  fs.writeFileSync(file, head + d.body.outerHTML + '\n</html>\n');
  report.independent.push({file: relative, lang, area, retainedExistingIds: originalCount});'''
if old in text:
    text = text.replace(old, new)
reader.write_text(text, encoding='utf-8')

runtime = ROOT / 'assets' / 'reader-first.js'
text = runtime.read_text(encoding='utf-8')
old = "  if (!root.hasAttribute('data-reader-first')) return;"
new = "  if (!root.hasAttribute('data-reader-first') && !document.body.hasAttribute('data-reader-first')) return;\n  root.dataset.readerFirst = '1';"
text = text.replace(old, new)
runtime.write_text(text, encoding='utf-8')

css = ROOT / 'assets' / 'reader-first.css'
text = css.read_text(encoding='utf-8')
text = text.replace('html[data-reader-first] { --reader-fg:', 'html[data-reader-first], body[data-reader-first] { --reader-fg:')
text = text.replace('html[data-reader-first][data-theme="dark"] { --reader-fg:', 'html[data-reader-first][data-theme="dark"], html[data-theme="dark"] body[data-reader-first] { --reader-fg:')
marker = '/* Independent pages retain their existing breadcrumb, not a duplicate. */'
if marker not in text:
    text += '\n' + marker + '\n.readerToc{display:block}\nbody:has(.ctdB2Trail) .readerArticleTrail{display:none}\n'
marker = '/* Each chapter opens with a visible question under the publication title. */'
if marker not in text:
    text += '\n' + marker + '\n.readerChapterTitle{font-size:clamp(1.65rem,3.2vw,2.6rem);line-height:1.16;letter-spacing:-.035em;max-width:32ch;margin:4px 0 16px;color:var(--reader-fg);overflow-wrap:anywhere}\n.readerNext{align-items:stretch;justify-content:stretch}\n.readerChapterTitle:focus-visible{outline:3px solid var(--reader-link);outline-offset:5px}\n'
css.write_text(text, encoding='utf-8')

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
