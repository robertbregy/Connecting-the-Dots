#!/usr/bin/env python3
from __future__ import annotations
import json, os, re
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
VERSION="0.7.112"
DATE="2026-11-12"
BASELINE="1b70fec8b45d9ef2102573fc3ccd7a0112c3d180"

def read(p): return (ROOT/p).read_text(encoding="utf-8")
def write(p,s): (ROOT/p).write_text(s,encoding="utf-8")
def load(p): return json.loads(read(p))
def dump(p,o): write(p,json.dumps(o,ensure_ascii=False,indent=2)+"\n")

pkg=load("package.json"); pkg["version"]=VERSION; dump("package.json",pkg)
lock=load("package-lock.json"); lock["version"]=VERSION; lock.setdefault("packages",{}).setdefault("",{})["version"]=VERSION; dump("package-lock.json",lock)

source_commit=os.environ.get("SOURCE_COMMIT",BASELINE)
pub=load("publication.json")
pub.update({
  "version":VERSION,
  "releasedOn":DATE,
  "currentDataPackVersion":VERSION,
  "currentDataPackPath":f"downloads/connecting-the-dots-data-pack-v{VERSION}.zip",
  "editorialReviewPath":f"docs/editorial-review-{DATE}-v{VERSION}.json",
  "paperTechnicalSyncOn":DATE,
  "sourceReviewCommit":source_commit,
  "buildProvenanceCommit":source_commit,
  "buildProvenanceRole":"source review commit used for deterministic regeneration; not the published merge commit"
})
dump("publication.json",pub)

frozen=load("data/frozen_technical_packages.json")
frozen["recordedOn"]=DATE
frozen.setdefault("files",{})["downloads/connecting-the-dots-data-pack-v0.7.111.zip"]="d780ad563fa5bb856b976a0fe72da27136f657d19b4fdcf1b8fc8b50363aef85"
dump("data/frozen_technical_packages.json",frozen)

hist=load("data/release_history.json")
hist["releases"]=[x for x in hist["releases"] if x.get("version")!=VERSION]
prev=next(x for x in hist["releases"] if x.get("version")=="0.7.111")
hist["releases"].insert(0,{"version":VERSION,"date":DATE,"summaryKey":"release07112",
  "ianaSnapshot":prev.get("ianaSnapshot"),"researchRelease":prev.get("researchRelease"),
  "ianaEvidenceSha256":prev.get("ianaEvidenceSha256")})
dump("data/release_history.json",hist)

tr=load("data/translations.json")
summaries={
 "en":"Closed the final pre-String-Confirmation audit: localized Research entry pages, separated the working-paper scholarly revision from live technical synchronization, clarified build provenance semantics and deferred off-screen Explorer/map rendering on unrelated routes.",
 "it":"Chiuso l'audit finale prima dello String Confirmation Day: create landing Research localizzate, separata la revisione scientifica del working paper dalla sincronizzazione tecnica, chiarita la provenance di build e rinviato il rendering di Explorer/mappa quando non serve alla pagina richiesta.",
 "de":"Das letzte Audit vor dem String Confirmation Day ist abgeschlossen: lokalisierte Research-Einstiegsseiten, getrennte wissenschaftliche Paper-Revision und technische Synchronisierung, klare Build-Provenienz und verzögertes Rendering von Explorer/Karte auf nicht betroffenen Seiten.",
 "fr":"Clôture de l'audit final avant le String Confirmation Day : pages d'entrée Research localisées, séparation entre révision scientifique du working paper et synchronisation technique, provenance de build clarifiée et rendu différé de l'Explorer/carte hors des pages concernées."
}
for lang,summary in summaries.items(): tr.setdefault(lang,{})["release07112"]=summary
dump("data/translations.json",tr)

readme=read("README.md")
readme=re.sub(r'^# Connecting the Dots — v\d+\.\d+\.\d+',f'# Connecting the Dots — v{VERSION}',readme,count=1)
if "## Current release" in readme:
    start=readme.index("## Current release")
    next_pos=readme.find("## Previous",start)
    if next_pos!=-1:
        block=f"""## Current release

**v{VERSION} - 12 November 2026**

Final pre-String-Confirmation cleanup: localized Research entry pages for IT/DE/FR, explicit separation between scholarly paper revision and technical-reference synchronization, unambiguous source-review provenance semantics, and deferred off-screen Explorer/map rendering on unrelated routes. Frozen RR1/RR2 and the Reveal Day evidence remain unchanged.

"""
        readme=readme[:start]+block+readme[next_pos:]
write("README.md",readme)

changelog=read("CHANGELOG.md")
entry="""# v0.7.112 — 12 November 2026

- Added localized Research & citation entry pages for Italian, German and French while keeping the canonical working paper in English.
- Separated the working paper's scholarly revision date from the live technical-reference synchronization date; technical package pointers no longer silently redate the manuscript.
- Clarified that buildProvenanceCommit/sourceReviewCommit identifies the reviewed source revision used for deterministic regeneration, not the final published merge commit.
- Deferred Explorer and world-map rendering when the requested route does not need them, reducing unnecessary work on pages such as Economics.
- Added release guards for localized Research pages, hreflang, sitemap coverage, paper synchronization semantics and provenance role.
- APS/IANA snapshots, RR1/RR2 and historical archives remain unchanged.

"""
if not changelog.startswith("# v0.7.112"): changelog=entry+changelog
write("CHANGELOG.md",changelog)
print(json.dumps({"prepared":VERSION,"sourceReviewCommit":source_commit,"paperTechnicalSyncOn":DATE,"researchEvidenceChanged":False},ensure_ascii=False))
