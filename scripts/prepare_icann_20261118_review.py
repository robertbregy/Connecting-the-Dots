#!/usr/bin/env python3
"""Prepare a narrowly scoped ICANN correction addendum for the editorial review.

No old SHA or baseline section fingerprint is discarded: each previously
approved SHA is recorded in the addendum, and only named files are refreshed.
Run after the full deterministic build and before checking source parity.
"""
from pathlib import Path
import hashlib
import json
import sys

ROOT = Path(__file__).resolve().parents[1]
REVIEW = ROOT / "docs/editorial-review-2026-11-18-v0.8.2.json"
EVIDENCE = ROOT / "data/evidence/icann_20261118_reconciliation.json"
PATHS = (
    "README.md",
    "publication.json",
    "package.json",
    "data/publication.js",
    "data/release_history.json",
    "data/translations.json",
    "data/frozen_technical_packages.json",
    "data/manifest.json",
    "docs/reader-first-structure.json",
    "applications/de/index.html",
    "applications/en/index.html",
    "applications/fr/index.html",
    "applications/it/index.html",
    "assets/aps-atlas.js",
    "scripts/audit_remediation_v07108.cjs",
    "scripts/audit_v07108_qa.cjs",
    "scripts/render_aps_application_atlas.py",
    "docs/string-confirmation-day-2026-11-17-first-findings.md",
)
RATIONALE = "ICANN1811"
TITLE = ("Verified 18 November ICANN/APS correction; one application-level "
         ".bit withdrawal, retained frozen 17 November source, dated localized "
         "Atlas overlay, corrected snapshot labels, and reproducible build.")

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def main():
    report = json.loads(REVIEW.read_text(encoding="utf-8"))
    evidence = json.loads(EVIDENCE.read_text(encoding="utf-8"))
    if report.get("status") != "reviewed" or report.get("publicationVersion") != "0.8.2":
        raise RuntimeError("Wrong reviewed baseline; no automatic updates")
    status = evidence.get("evidenceStatus") or {}
    if status.get("applicationIDsChanged") != ["INC2624T-T96235"]:
        raise RuntimeError("Unexpected application-level corrections")
    raw = ROOT / status["newCSVRawArchive"]
    normalized = ROOT / status["newCSVArchive"]
    if digest(raw) != status["newCSVRawSHA256"] or digest(normalized) != status["newCSVChecksumSHA256"]:
        raise RuntimeError("Source hashes do not match preserved APS evidence")
    unmatched = []
    for filepath, entry in report["files"].items():
        path = ROOT / filepath
        if path.exists():
            actual = digest(path)
            if actual != entry["sha256"]:
                unmatched.append(filepath)
    print("ICANN_PRE_REVIEW_DRIFT", json.dumps(unmatched, ensure_ascii=False))
    prior = report.get("icann20261118Review", {}).get("priorSHA256", {})
    if prior and set(prior) != set(PATHS):
        raise RuntimeError("Review addendum scope changed")
    if not prior:
        prior = {path: report["files"][path]["sha256"] for path in PATHS}
    report["rationales"][RATIONALE] = TITLE
    changes = {}
    for path in PATHS:
        entry = report["files"].get(path)
        if entry is None:
            raise RuntimeError("Unreviewed path outside approved baseline: " + path)
        sha = digest(ROOT / path)
        if sha != entry["sha256"]:
            changes[path] = {"previousReviewedSHA256": entry["sha256"],
                             "newReviewedSHA256": sha}
        entry["sha256"] = sha
        ids = entry["rationaleIds"]
        if RATIONALE not in ids:
            ids.append(RATIONALE)
    new_zip = ROOT / "downloads/connecting-the-dots-data-pack-v0.8.2.zip"
    sidecar = new_zip.with_suffix(".sha256")
    if not new_zip.exists() or not sidecar.exists():
        raise RuntimeError("The new versioned technical ZIP and checksum are absent")
    new_zip_sha = digest(new_zip)
    if sidecar.read_text(encoding="utf-8").strip() != new_zip_sha + "  " + new_zip.name:
        raise RuntimeError("New v0.8.2 technical checksum mismatch")
    for candidate in (new_zip, sidecar):
        relative = candidate.relative_to(ROOT).as_posix()
        existing = report["files"].get(relative)
        if existing and existing.get("sha256") != digest(candidate):
            raise RuntimeError("Already-reviewed v0.8.2 package has changed: " + relative)
        if not existing:
            report["files"][relative] = {
                "baselineSHA256": None,
                "sha256": digest(candidate),
                "rationaleIds": [RATIONALE]
            }
    report["icann20261118Review"] = {
        "scope": "new v0.8.2 dated ICANN/APS correction; v0.8.1 and RR3 frozen",
        "originalReviewSHAsRetained": True,
        "priorSHA256": prior,
        "changedFilesThisRun": changes,
        "officialSourceEvidence": "data/evidence/icann_20261118_reconciliation.json",
        "rawAPSArchivedSHA256": status["newCSVRawSHA256"],
        "normalizedAPSArchivedSHA256": status["newCSVChecksumSHA256"],
        "applicationIDChange": status["observedChange"],
        "restrictions": [
            "No frozen RR1/RR2/RR3 sources may change.",
            "No change is inferred to other application records.",
            "ICANN statistics and the public CSV remain separate observations.",
            "No general rewrite of editorial review hashes is permitted."
        ]
    }
    REVIEW.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("ICANN_REVIEW_ADDENDUM_OK", json.dumps({"paths":len(PATHS),"changed":list(changes)},ensure_ascii=False))

if __name__ == "__main__":
    main()
