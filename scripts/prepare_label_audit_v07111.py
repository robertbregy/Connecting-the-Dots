#!/usr/bin/env python3
"""Prepare v0.7.111 multilingual label-consistency correction.

Scope: fix the labels introduced by the Legal layer, remove duplicated source
chips in that renderer, and add a release-wide guard against generic English
editorial badges leaking into non-English pages.
"""
from __future__ import annotations

import json
import os
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
VERSION = "0.7.111"
DATE = "2026-11-12"
BASELINE = "513f64df48fe62f4c2efab73130288c4e13c5708"


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def write(path: str, text: str) -> None:
    (ROOT / path).write_text(text, encoding="utf-8")


def load(path: str):
    return json.loads(read(path))


def dump(path: str, value) -> None:
    write(path, json.dumps(value, ensure_ascii=False, indent=2) + "\n")


# Release identity.
pkg = load("package.json")
pkg["version"] = VERSION
dump("package.json", pkg)

lock = load("package-lock.json")
lock["version"] = VERSION
lock.setdefault("packages", {}).setdefault("", {})["version"] = VERSION
dump("package-lock.json", lock)

pub = load("publication.json")
pub.update({
    "version": VERSION,
    "releasedOn": DATE,
    "currentDataPackVersion": VERSION,
    "currentDataPackPath": f"downloads/connecting-the-dots-data-pack-v{VERSION}.zip",
    "editorialReviewPath": f"docs/editorial-review-{DATE}-v{VERSION}.json",
    "buildProvenanceCommit": os.environ.get("SOURCE_COMMIT", BASELINE),
})
dump("publication.json", pub)

# Once v0.7.111 becomes current, v0.7.110 becomes an immutable historical pack.
frozen = load("data/frozen_technical_packages.json")
frozen["recordedOn"] = DATE
frozen.setdefault("files", {})["downloads/connecting-the-dots-data-pack-v0.7.110.zip"] = "1bc42e76dab917a495dce91746a6e833d359eddc5b56f0d9b01d2ad9612742c8"
dump("data/frozen_technical_packages.json", frozen)

# Release history + localized summary.
history = load("data/release_history.json")
releases = [r for r in history["releases"] if r.get("version") != VERSION]
previous = next(r for r in releases if r.get("version") == "0.7.110")
releases.insert(0, {
    "version": VERSION,
    "date": DATE,
    "summaryKey": "release07111",
    "ianaSnapshot": previous.get("ianaSnapshot"),
    "researchRelease": previous.get("researchRelease"),
    "ianaEvidenceSha256": previous.get("ianaEvidenceSha256"),
})
history["releases"] = releases
dump("data/release_history.json", history)

translations = load("data/translations.json")
summaries = {
    "en": "Localized the Legal layer's editorial badges in all four languages, removed duplicated source chips and added a release-wide regression guard against generic English labels leaking into non-English pages.",
    "it": "Localizzate in tutte e quattro le lingue le etichette editoriali del capitolo Legal, rimossi i link fonte duplicati e aggiunto un controllo generale contro la ricomparsa di etichette inglesi generiche nelle pagine non inglesi.",
    "de": "Die redaktionellen Labels des Legal-Kapitels wurden in allen vier Sprachen lokalisiert, doppelte Quellen-Chips entfernt und eine releaseweite Regression-Prüfung gegen englische Standardlabels auf nichtenglischen Seiten ergänzt.",
    "fr": "Les libellés éditoriaux du chapitre Legal ont été localisés dans les quatre langues, les liens de source dupliqués supprimés et un contrôle global ajouté contre le retour de libellés génériques anglais dans les pages non anglophones.",
}
for lang, summary in summaries.items():
    translations.setdefault(lang, {})["release07111"] = summary
dump("data/translations.json", translations)

# Localized Legal badges.
legal = load("data/legal_layer.json")
legal["reviewedOn"] = DATE
badge_labels = {
    "en": {"badgeProcedure": "PROCEDURE", "badgeReading": "READING", "badgeContract": "CONTRACT"},
    "it": {"badgeProcedure": "PROCEDURA", "badgeReading": "LETTURA", "badgeContract": "CONTRATTO"},
    "de": {"badgeProcedure": "VERFAHREN", "badgeReading": "LEKTÜRE", "badgeContract": "VERTRAG"},
    "fr": {"badgeProcedure": "PROCÉDURE", "badgeReading": "LECTURE", "badgeContract": "CONTRAT"},
}
for lang, labels in badge_labels.items():
    legal["locales"][lang].update(labels)
dump("data/legal_layer.json", legal)

# Fix the renderer at the source.
renderer = read("scripts/render_legal_layer.py")
renderer = renderer.replace(
    "'<article class=\"panel\"><div class=\"panelTop\"><span class=\"ep factBadge\">PROCEDURE</span></div>'",
    "f'<article class=\"panel\"><div class=\"panelTop\"><span class=\"ep factBadge\">{e(L[\"badgeProcedure\"])}</span></div>'",
)
renderer = renderer.replace(
    '<div class="panelTop"><span class="ep factBadge">PROCEDURE</span><span class="ep readingBadge">READING</span></div>',
    '<div class="panelTop"><span class="ep factBadge">{e(L["badgeProcedure"])}</span><span class="ep readingBadge">{e(L["badgeReading"])}</span></div>',
)
renderer = renderer.replace(
    '<div class="panelTop"><span class="ep factBadge">CONTRACT</span></div>',
    '<div class="panelTop"><span class="ep factBadge">{e(L["badgeContract"])}</span></div>',
)

source_block = '''    source_links = "".join([
        source_chip(S["icannCommunityInput"], "ICANN · Community Input"),
        source_chip(S["icannObjections"], "ICANN · Objections & Appeals"),
        source_chip(S["applicantGuidebook"], "ICANN · Applicant Guidebook"),
        source_chip(S["wipoLro"], "WIPO · Legal Rights Objections"),
        source_chip(S["wipoSco"], "WIPO · String Confusion Objections"),
        source_chip(S["icc"], "ICC · New gTLD Dispute Resolution"),
        source_chip(S["rvc"], "ICANN · Registry Voluntary Commitments"),
        source_chip(S["independentObjectors"], "ICANN · Independent Objectors"),
        source_chip(S["singularPlural"], "ICANN · Singular/Plural Evaluation"),
    ])
'''
renderer, n = re.subn(
    r'    source_links = ""\.join\(\[\n.*?\n    \]\)\n',
    source_block,
    renderer,
    count=1,
    flags=re.S,
)
if n != 1:
    raise SystemExit("Could not normalize Legal source_links block")

for literal in ('>PROCEDURE</span>', '>READING</span>', '>CONTRACT</span>'):
    if literal in renderer:
        raise SystemExit("Hard-coded English Legal badge survived: " + literal)
write("scripts/render_legal_layer.py", renderer)

# Global regression guard. It scans the final generated publication, not merely
# the Legal page, because humans have apparently invented copy-paste.
release_check = read("scripts/release_check.py")
marker = "# v0.7.111 multilingual editorial-label integrity"
if marker not in release_check:
    block = r'''
# v0.7.111 multilingual editorial-label integrity.
# Generic editorial badges must be localized on non-English pages. Formal ICANN
# terms and official source titles are deliberately outside this check.
badge_classes = r'(?:factBadge|readingBadge|editorialType|stateBadge|recordLevel|discoveryEyebrow)'
foreign_badges = {
    'it': {'PROCEDURE','READING','CONTRACT','FACT','FIELD NOTE','METHOD','DATA','SOURCE','SOURCES'},
    'de': {'PROCEDURE','READING','CONTRACT','FACT','FIELD NOTE','METHOD','DATA','SOURCE','SOURCES'},
    'fr': {'PROCEDURE','READING','CONTRACT','FACT','FIELD NOTE','METHOD','DATA'},
}
badge_re = re.compile(r'<(?:span|p|div)\b[^>]*class=["\'][^"\']*'+badge_classes+r'[^"\']*["\'][^>]*>([^<]{1,80})</(?:span|p|div)>', re.I)
for html_path in ROOT.rglob('*.html'):
    if '.git' in html_path.parts:
        continue
    page = html_path.read_text(encoding='utf-8')
    lang_match = re.search(r'<html\b[^>]*\blang=["\']([^"\']+)["\']', page, re.I)
    if not lang_match:
        continue
    lang = lang_match.group(1).split('-')[0].lower()
    if lang not in foreign_badges:
        continue
    for value in badge_re.findall(page):
        label = unescape(value).strip().upper()
        if label in foreign_badges[lang]:
            fail('Non-localized editorial badge in '+html_path.relative_to(ROOT).as_posix()+': '+value.strip())

legal_badges = {
    'en': ('PROCEDURE','READING','CONTRACT'),
    'it': ('PROCEDURA','LETTURA','CONTRATTO'),
    'de': ('VERFAHREN','LEKTÜRE','VERTRAG'),
    'fr': ('PROCÉDURE','LECTURE','CONTRAT'),
}
for lang, expected in legal_badges.items():
    page = (ROOT/'guides'/lang/'legal'/'index.html').read_text(encoding='utf-8')
    for label in expected:
        if f'>{label}</span>' not in page:
            fail('Localized Legal badge missing: '+lang+'/'+label)
    if page.count('>ICANN · Independent Objectors ↗</a>') != 2:
        fail('Independent Objectors source-chip count drift: '+lang)
    if page.count('>ICANN · Singular/Plural Evaluation ↗</a>') != 2:
        fail('Singular/Plural source-chip count drift: '+lang)
'''
    release_check = release_check.replace(
        "# The deploy payload is a separate, validated surface; never ship the checkout.",
        marker + "\n" + block + "\n# The deploy payload is a separate, validated surface; never ship the checkout.",
        1,
    )
write("scripts/release_check.py", release_check)

# Human-readable release notes.
readme = read("README.md")
readme = re.sub(r'^# Connecting the Dots — v\d+\.\d+\.\d+', f'# Connecting the Dots — v{VERSION}', readme, count=1)
readme = re.sub(
    r'^\*\*v0\.7\.110 · 12 November 2026\.\*\*.*?$',
    "**v0.7.111 · 12 November 2026.** Localized the new Legal editorial badges across EN/IT/DE/FR, removed duplicated source chips and added a release-wide guard against generic English UI labels leaking into non-English pages. Research evidence and historical archives are unchanged.",
    readme,
    count=1,
    flags=re.M,
)
start = readme.index("## Current release")
next_section = readme.index("## Previous legal release", start) if "## Previous legal release" in readme[start:] else readme.index("## Previous", start)
new_current = '''## Current release

**v0.7.111 - 12 November 2026**

Multilingual label-consistency correction: Legal badges now follow the page language (PROCEDURA/LETTURA/CONTRATTO in Italian; equivalent German and French labels), duplicated Legal source chips are removed, and the release checker scans the full non-English publication for generic English editorial badges.

## Previous audit-close release

**v0.7.110 - 12 November 2026**

Closed the post-Legal audit before String Confirmation Day: remaining WCAG contrast correction, aligned release metadata and chronology, dynamic source-health versioning, sharper 2026 Legal timing and terminology, and a clean boundary between Legal procedure and historical Disputed Dots cases.

'''
readme = readme[:start] + new_current + readme[next_section:]
write("README.md", readme)

changelog = read("CHANGELOG.md")
if not changelog.startswith("# v0.7.111"):
    changelog = '''# v0.7.111 — 12 November 2026

- Localized the new Legal editorial badges in all four languages: PROCEDURE / READING / CONTRACT are no longer leaked into IT, DE or FR pages.
- Removed repeated Independent Objectors and Singular/Plural source chips from the Legal renderer while retaining one reference in the timing section and one in the full source list.
- Added a release-wide generated-HTML regression guard for generic English editorial badges on non-English pages.
- Kept formal ICANN terminology and official source titles in their authoritative names rather than translating them as if they were UI labels.
- APS/IANA snapshots, RR1/RR2, historical dispute evidence and all previous technical packages remain unchanged.

''' + changelog
write("CHANGELOG.md", changelog)

print(json.dumps({
    "prepared": VERSION,
    "releasedOn": DATE,
    "badgeLabels": badge_labels,
    "sourceDuplicatesRemoved": True,
    "globalLabelGuardAdded": True,
    "researchEvidenceChanged": False,
}, ensure_ascii=False))
