#!/usr/bin/env python3
from __future__ import annotations
import hashlib, json, os, re
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
VERSION="0.7.111"
DATE="2026-11-12"
BASELINE="513f64df48fe62f4c2efab73130288c4e13c5708"

def p(x): return ROOT/x
def read(x): return p(x).read_text(encoding="utf-8")
def write(x,s): p(x).write_text(s,encoding="utf-8")
def load(x): return json.loads(read(x))
def dump(x,v): write(x,json.dumps(v,ensure_ascii=False,indent=2)+"\n")

# Version identity.
pkg=load("package.json"); pkg["version"]=VERSION; dump("package.json",pkg)
lock=load("package-lock.json"); lock["version"]=VERSION; lock.setdefault("packages",{}).setdefault("",{})["version"]=VERSION; dump("package-lock.json",lock)
pub=load("publication.json")
pub.update({
 "version":VERSION,"releasedOn":DATE,
 "currentDataPackVersion":VERSION,
 "currentDataPackPath":f"downloads/connecting-the-dots-data-pack-v{VERSION}.zip",
 "editorialReviewPath":f"docs/editorial-review-{DATE}-v{VERSION}.json",
 "buildProvenanceCommit":os.environ.get("SOURCE_COMMIT",BASELINE),
})
dump("publication.json",pub)

# Freeze the already-published v0.7.110 technical package before generating 0.7.111.
frozen=load("data/frozen_technical_packages.json")
files=frozen.setdefault("files",{})
archive=p("downloads/connecting-the-dots-data-pack-v0.7.110.zip")
if archive.exists():
    files["downloads/connecting-the-dots-data-pack-v0.7.110.zip"]=hashlib.sha256(archive.read_bytes()).hexdigest()
dump("data/frozen_technical_packages.json",frozen)

# Locale-specific editorial UI labels for the Legal layer.
legal=load("data/legal_layer.json")
labels={
 "en":{"badgeProcedure":"PROCEDURE","badgeReading":"READING","badgeContract":"CONTRACT"},
 "it":{"badgeProcedure":"PROCEDURA","badgeReading":"LETTURA","badgeContract":"CONTRATTO"},
 "de":{"badgeProcedure":"VERFAHREN","badgeReading":"LEKTÜRE","badgeContract":"VERTRAG"},
 "fr":{"badgeProcedure":"PROCÉDURE","badgeReading":"LECTURE","badgeContract":"CONTRAT"},
}
for lang,vals in labels.items(): legal["locales"][lang].update(vals)
dump("data/legal_layer.json",legal)

# Fix the renderer at source: no English UI badge hard-coding, no duplicated source chips.
r=read("scripts/render_legal_layer.py")
r=r.replace(
    "'<article class=\"panel\"><div class=\"panelTop\"><span class=\"ep factBadge\">PROCEDURE</span></div>'",
    "'<article class=\"panel\"><div class=\"panelTop\"><span class=\"ep factBadge\">' + e(L[\"badgeProcedure\"]) + '</span></div>'"
)
r=r.replace(
    '<div class="panelTop"><span class="ep factBadge">PROCEDURE</span><span class="ep readingBadge">READING</span></div>',
    '<div class="panelTop"><span class="ep factBadge">{e(L["badgeProcedure"])}</span><span class="ep readingBadge">{e(L["badgeReading"])}</span></div>'
)
r=r.replace(
    '<div class="panelTop"><span class="ep factBadge">CONTRACT</span></div>',
    '<div class="panelTop"><span class="ep factBadge">{e(L["badgeContract"])}</span></div>'
)
# Collapse accidental repeated source entries to one of each.
source_block=re.compile(r'''        source_chip\(S\["independentObjectors"\], "ICANN · Independent Objectors"\),\n        source_chip\(S\["singularPlural"\], "ICANN · Singular/Plural Evaluation"\),\n(?:        source_chip\(S\["independentObjectors"\], "ICANN · Independent Objectors"\),\n        source_chip\(S\["singularPlural"\], "ICANN · Singular/Plural Evaluation"\),\n)+''')
r,n=source_block.subn(
    '        source_chip(S["independentObjectors"], "ICANN · Independent Objectors"),\n'
    '        source_chip(S["singularPlural"], "ICANN · Singular/Plural Evaluation"),\n',r,count=1)
if n!=1: raise SystemExit("Expected duplicated Legal source block not found exactly once")
write("scripts/render_legal_layer.py",r)

# Release history / summaries.
hist=load("data/release_history.json")
prev=next(x for x in hist["releases"] if x["version"]=="0.7.110")
hist["releases"]=[x for x in hist["releases"] if x["version"]!=VERSION]
hist["releases"].insert(0,{
 "version":VERSION,"date":DATE,"summaryKey":"release07111",
 "ianaSnapshot":prev.get("ianaSnapshot"),"researchRelease":prev.get("researchRelease"),
 "ianaEvidenceSha256":prev.get("ianaEvidenceSha256")
})
dump("data/release_history.json",hist)

tr=load("data/translations.json")
summaries={
 "en":"Localized the new Legal-layer editorial labels in all four languages, removed duplicated source chips and added regression checks against English UI leakage on non-English Legal pages.",
 "it":"Localizzate in tutte e quattro le lingue le etichette editoriali del nuovo livello Legal, eliminati i link fonte duplicati e aggiunti controlli contro il ritorno di microcopy inglese nelle pagine Legal non inglesi.",
 "de":"Die redaktionellen Labels der neuen Legal-Ebene wurden in allen vier Sprachen lokalisiert, doppelte Quellenlinks entfernt und Regressionstests gegen englische UI-Texte auf nicht-englischen Legal-Seiten ergänzt.",
 "fr":"Les libellés éditoriaux de la nouvelle couche Legal ont été localisés dans les quatre langues, les liens de source dupliqués supprimés et des contrôles ajoutés contre le retour de microtextes anglais sur les pages Legal non anglophones."
}
for lang,s in summaries.items(): tr[lang]["release07111"]=s
dump("data/translations.json",tr)

# README / changelog.
readme=read("README.md")
readme=re.sub(r'^# Connecting the Dots — v\d+\.\d+\.\d+',f'# Connecting the Dots — v{VERSION}',readme,count=1,flags=re.M)
readme=re.sub(r'^\*\*v0\.7\.110 · 12 November 2026\.\*\*.*$',f'**v{VERSION} · 12 November 2026.** Localized the new Legal-layer interface labels across EN/IT/DE/FR, removed duplicated source chips and added regression checks against cross-language UI leakage.',readme,count=1,flags=re.M)
readme=readme.replace('## Current release\n\n**v0.7.110 - 12 November 2026**','## Current release\n\n**v0.7.111 - 12 November 2026**',1)
write("README.md",readme)
ch=read("CHANGELOG.md")
if not ch.startswith("# v0.7.111"):
    ch='''# v0.7.111 — 12 November 2026

- Localized the new Legal-layer editorial badges in EN/IT/DE/FR: Procedure, Reading and Contract now follow the page language.
- Removed repeated ICANN Independent Objectors and Singular/Plural source chips introduced by the Legal renderer.
- Added regression guards that fail if English Legal UI badges leak into Italian, German or French standalone pages.
- Kept official ICANN/WIPO/ICC procedure names where they are proper names rather than interface labels.
- APS/IANA snapshots, RR1/RR2 and all previous technical packages remain unchanged.

'''+ch
write("CHANGELOG.md",ch)

# Strong regression guard in release check.
rc=read("scripts/release_check.py")
guard='''

# v0.7.111 Legal localization integrity.
legal_labels={
    'en':('PROCEDURE','READING','CONTRACT'),
    'it':('PROCEDURA','LETTURA','CONTRATTO'),
    'de':('VERFAHREN','LEKTÜRE','VERTRAG'),
    'fr':('PROCÉDURE','LECTURE','CONTRAT'),
}
for language,expected in legal_labels.items():
    loc=legal_layer.get('locales',{}).get(language,{})
    actual=(loc.get('badgeProcedure'),loc.get('badgeReading'),loc.get('badgeContract'))
    if actual!=expected: fail('Legal editorial badge localization mismatch: '+language)
    page=(ROOT/'guides'/language/'legal'/'index.html').read_text(encoding='utf-8')
    for label in expected:
        if ('>'+label+'<') not in page: fail('Localized Legal badge missing from standalone page: '+language+'/'+label)
    if language!='en':
        for leaked in ('>PROCEDURE<','>READING<','>CONTRACT<'):
            if leaked in page: fail('English Legal UI badge leaked into '+language+': '+leaked)
renderer=(ROOT/'scripts'/'render_legal_layer.py').read_text(encoding='utf-8')
if renderer.count('source_chip(S["independentObjectors"], "ICANN · Independent Objectors")')!=2:
    fail('Independent Objectors source chip count drifted; expect one in source inventory and one timing citation')
if renderer.count('source_chip(S["singularPlural"], "ICANN · Singular/Plural Evaluation")')!=2:
    fail('Singular/Plural source chip count drifted; expect one in source inventory and one timing citation')
'''
needle="# v0.7.40 release-history integrity:"
if guard not in rc:
    rc=rc.replace(needle,guard+"\n"+needle,1)
write("scripts/release_check.py",rc)

print(json.dumps({"prepared":VERSION,"localizationLabels":labels,"researchEvidenceChanged":False},ensure_ascii=False))
