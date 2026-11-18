#!/usr/bin/env python3
"""Prepare a distinct v0.8.2 technical publication, preserving v0.8.1.

Run once on the unmodified v0.8.1 repository checkout, before build.py.
Only metadata for the new publication is changed. Research RR3 stays immutable.
"""
from pathlib import Path
import json,hashlib,copy
R=Path(__file__).resolve().parents[1]
D=R/"data"
def load(p):return json.loads(p.read_text(encoding="utf-8"))
def save(p,o):p.write_text(json.dumps(o,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def main():
    old=R/"downloads/connecting-the-dots-data-pack-v0.8.1.zip"
    old_sha="422acf0d7577dd309475ce81f6278531e7a0963ba82d30115005482fe2cca417"
    if sha(old)!=old_sha:raise RuntimeError("Previously published 0.8.1 archive changed")
    marker=R/"downloads/connecting-the-dots-data-pack-v0.8.1.sha256"
    if marker.read_text().strip()!=old_sha+"  "+old.name:raise RuntimeError("Original checksum differs")
    pub=R/"publication.json"; meta=load(pub)
    if meta["version"] not in ("0.8.1","0.8.2"):raise RuntimeError("Unexpected publication")
    if meta["researchRelease"]!="RR3":raise RuntimeError("RR3 must remain unchanged")
    meta.update(version="0.8.2",currentDataPackVersion="0.8.2",currentDataPackPath="downloads/connecting-the-dots-data-pack-v0.8.2.zip",editorialReviewPath="docs/editorial-review-2026-11-18-v0.8.2.json",technicalAsOf="2026-11-18")
    save(pub,meta)
    package=R/"package.json"; pkg=load(package);pkg["version"]="0.8.2";save(package,pkg)
    lockfile=R/"package-lock.json"
    lock=load(lockfile)
    lock["version"]="0.8.2"
    if "" in lock.get("packages",{}):lock["packages"][""]["version"]="0.8.2"
    save(lockfile,lock)
    frozen_path=D/"frozen_technical_packages.json";frozen=load(frozen_path)
    key="downloads/connecting-the-dots-data-pack-v0.8.1.zip"
    if key in frozen["files"] and frozen["files"][key]!=old_sha:raise RuntimeError("Archived hash mismatch")
    frozen["files"][key]=old_sha
    frozen["recordedOn"]="2026-11-18"
    save(frozen_path,frozen)
    history_path=D/"release_history.json";hist=load(history_path)
    if hist["releases"][0]["version"]=="0.8.1":
        entry=copy.deepcopy(hist["releases"][0]);entry.update(version="0.8.2",date="2026-11-18",summaryKey="release0802")
        hist["releases"].insert(0,entry)
    elif hist["releases"][0]["version"]!="0.8.2":raise RuntimeError("Wrong release-history latest")
    save(history_path,hist)
    trans_path=D/"translations.json";trans=load(trans_path)
    note={
    "it":"Rettifica del comunicato ICANN del 17 novembre e osservazione APS del 18 novembre: stato .bit aggiornato da Active a Withdrawn, fonti e snapshot separati; dati storici e RR3 conservati.",
    "en":"Corrected 17 November ICANN announcement and 18 November APS observation: .bit changed from Active to Withdrawn, with dated sources and frozen historic snapshots and RR3 preserved.",
    "de":"Korrektur der ICANN-Mitteilung vom 17. November und APS-Beobachtung vom 18. November: .bit von Active auf Withdrawn geändert. Quellen, historische Datensätze und RR3 bleiben getrennt erhalten.",
    "fr":"Correction de l’annonce ICANN du 17 novembre et relevé APS du 18 novembre : .bit passe de Active à Withdrawn, avec sources datées et conservation des archives et de RR3."}
    for lang,text in note.items():
        if trans[lang].get("release0802") not in (None,text):raise RuntimeError("New release translated differently")
        trans[lang]["release0802"]=text
    save(trans_path,trans)
    review_old=R/"docs/editorial-review-2026-11-18-v0.8.1.json"
    review_new=R/"docs/editorial-review-2026-11-18-v0.8.2.json"
    if not review_new.exists():
        review=load(review_old)
        review["reviewId"]="2026-11-18-v082-icann-post-confirmation-correction"
        review["publicationVersion"]="0.8.2"
        review["reviewInstruction"]="Review new dated ICANN/APS 18 Nov evidence and localized Atlas; new v0.8.2 package must not change frozen v0.8.1/RR3."
        review["status"]="reviewed"
        save(review_new,review)
    else:
        review=load(review_new)
        if review.get("publicationVersion")!="0.8.2":raise RuntimeError("Review belongs to another release")
    changelog_path=R/"CHANGELOG.md"
    changelog=changelog_path.read_text(encoding="utf-8")
    if not changelog.startswith("# v0.8.2"):
        if not changelog.startswith("# v0.8.1"):
            raise RuntimeError("Unexpected changelog heading")
        latest=(
            "# v0.8.2 — 18 November 2026\n\n"
            "- Corrected ICANN's 17 November String Confirmation aggregates using its revised official announcement.\n"
            "- Archived the 18 November APS export and application-level comparison: .bit (INC2624T-T96235) changed from Active to Withdrawn; .cli remains Deactivated.\n"
            "- Dated the Atlas current-observation overlay and corrected obsolete October snapshot labels in four languages.\n"
            "- Preserved RR3, the frozen 17 November graph and the original v0.8.1 technical ZIP; published a separate versioned data pack.\n\n"
        )
        changelog_path.write_text(latest+changelog,encoding="utf-8")
    readme_path=R/"README.md"
    readme=readme_path.read_text(encoding="utf-8")
    readme=readme.replace("# Connecting the Dots — v0.8.1","# Connecting the Dots — v0.8.2",1)
    if "**v0.8.2 - 18 November 2026**" not in readme:
        readme=readme.replace("## Current release\n","## Current release\n\n**v0.8.2 - 18 November 2026**\n\nThe new technical release records ICANN's revised String Confirmation announcement and the separately archived 18 November APS export. In the public CSV only .bit (INC2624T-T96235) changes from Active to Withdrawn; the historic 17 November graph is retained and the Atlas shows the later observation distinctly. Official APS Statistics still shows 11 withdrawals while 10 are identifiable in that CSV. RR3 and the previous v0.8.1 technical ZIP remain unchanged.\n\n## Previous technical release\n",1)
    readme_path.write_text(readme,encoding="utf-8")
    print("ICANN_082_PREPARED",json.dumps({"publication":"0.8.2","frozen081":old_sha,"RR3":"unchanged"}))
if __name__=="__main__":main()
