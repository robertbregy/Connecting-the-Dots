#!/usr/bin/env python3
"""Build and verify an unpublished, reproducible RR3 scientific candidate.

Offline after the immutable RR1/RR2 Git tags have been fetched. No tags, commits,
releases, DOI records, website files or public citations are created or changed.
Outputs must be outside this repository. A worktree candidate is useful for
review; --require-frozen additionally requires every selected input at HEAD.
"""
from __future__ import annotations

import argparse
from collections import Counter, defaultdict
import csv
import hashlib
import io
import json
from pathlib import Path, PurePosixPath
import subprocess
import sys
import zipfile

ROOT = Path(__file__).resolve().parents[1]
EVIDENCE = "data/evidence/string-confirmation-2026-11-17/"
LIVE = EVIDENCE + "live/"
ZIP_NAME = "RR3-candidate-scientific-data.zip"
MANIFEST_NAME = "RR3-candidate-manifest.json"
REPORT_NAME = "RR3-preflight-report.md"
CITATION_NAME = "CITATION_RR3_CANDIDATE.cff"
FIXED_ZIP_DATE = (2026, 11, 17, 18, 30, 10)
BASELINES = {
    "RR1": {"commit": "5d52274935cda7712172873f46d456e4c0a09c7e",
            "doi": "10.5281/zenodo.23262623"},
    "RR2": {"commit": "33803aa3fa69f1abb4cce7fbd49a0788ee9a33c9",
            "doi": "10.5281/zenodo.23288603"},
}
RAW_HASHES = {
    LIVE + "aps-export-raw.csv": "f7cb0e7ef1098a3b92a7d337676d8802802df21e31c8f156dafe7c410132b7ee",
    LIVE + "aps-export-normalized.csv": "c41606e8b58f3e469c0e91fab48e25057c0959f9792d4385871d5c70268fe44c",
    LIVE + "reveal-day-contention-sets.csv": "86f2ebd3764d1f3ea21d5d844cff004e271a443a3431e8ac440da7f72c67e2bf",
    LIVE + "string-confirmation-contention-sets.csv": "0c65e67703c57794e3c038607feeae4b9dc8126f4739766737d0066d55d76b4f",
    EVIDENCE + "aps-statistics-2009-raw.json": "6f0e353044297ba99cf6f7facf523138d277f0dc2b91506c32dedbb9c92d7474",
    "data/applications_2026_aps_official_listing.csv": "520ea8433b96322816fb03fa66072acc29e7251e16839093b4446ada401bd887",
}
EXCLUDED_JSON = {
    "tld_cultural_editorial.json", "research_bibliographic_corrections.json",
}
SUPPORT = {
    "CITATION.cff", ".zenodo.json", "publication.json", "package.json",
    "package-lock.json", "build.py", "data/README.md", "data/CONTENT_LICENSE.md",
    "research/README.md", "research/research_release_manifest.json",
    "research/rr2_publication_verification.json", "research/rr3_candidate.json",
    "research/connecting-the-dots-working-paper-v1.md",
    "research/rr3_addendum_20261117.md", "scripts/rr3_preflight.py",
    "scripts/string_confirmation_20261117.py",
    "scripts/contention_confirmation_20261117.py", "scripts/aps_observatory.py",
    "scripts/build_aps_application_graph.py", "scripts/build_aps_application_graph_current.py",
    "scripts/build_aps_current_analytics.py", "scripts/build_application_archaeology.py",
    "scripts/build_tld_cultural_trajectory.py", "scripts/build_tld_market.py",
    "scripts/assemble_data.js", "scripts/normalize_iana.js", "scripts/fetch_iana.py",
    "docs/rr3_publication_runbook.md",
}


def ensure(condition, message):
    if not condition:
        raise ValueError(message)


def sha(data):
    return hashlib.sha256(data).hexdigest()


def encoded(value):
    return (json.dumps(value, ensure_ascii=False, sort_keys=True, indent=2) + "\n").encode("utf-8")


def git(*args):
    return subprocess.check_output(["git", *args], cwd=ROOT, stderr=subprocess.PIPE)


def parsed(files, name):
    return json.loads(files[name].decode("utf-8-sig"))


def csv_rows(files, name, preamble=False):
    text = files[name].decode("utf-8-sig")
    if preamble:
        start = text.find("Priority,")
        ensure(start >= 0, "CSV header missing: " + name)
        text = text[start:]
    reader = csv.DictReader(io.StringIO(text, newline=""))
    rows = list(reader)
    ensure(rows and all(None not in row and None not in row.values() for row in rows),
           "Incomplete or malformed CSV rows: " + name)
    return rows


def family(application_id):
    return application_id.removesuffix("-R")


def validate_science(files):
    """Recompute the core results from preserved bytes, including during verify."""
    for name, expected in RAW_HASHES.items():
        ensure(sha(files[name]) == expected, "Frozen source hash mismatch: " + name)
    candidate = parsed(files, "research/rr3_candidate.json")
    policy = candidate["archivePolicy"]
    ensure(candidate["candidateId"] == "RR3" and candidate["candidateStatus"] == "prepublication-review",
           "The package must identify an unpublished RR3 candidate")
    ensure(policy["doiForRR3"] is None and policy["rr3Publication"] == "blocked-until-verified"
           and policy["preserveExistingCurrentResearchRelease"] == "RR2"
           and policy["conceptDoi"] == "10.5281/zenodo.23262622", "Publication gate or DOI identity changed")
    current = parsed(files, "research/research_release_manifest.json")["currentResearchRelease"]
    publication = parsed(files, "publication.json")
    ensure(current["id"] == publication["researchRelease"] == "RR2"
           and current["doi"] == publication["doi"] == BASELINES["RR2"]["doi"],
           "Public citations must remain the verified RR2 during candidate preparation")
    citation = files["CITATION.cff"].decode()
    ensure('version: "RR2"' in citation and BASELINES["RR2"]["doi"] in citation,
           "Public CITATION.cff was prematurely promoted")
    rows = csv_rows(files, LIVE + "aps-export-normalized.csv")
    ensure(rows == csv_rows(files, LIVE + "aps-export-raw.csv", preamble=True),
           "Normalized APS rows differ from the captured raw CSV")
    ids = {r["Application ID"]: r for r in rows}
    before = {r["Application ID"]: r for r in csv_rows(files, "data/applications_2026_aps_official_listing.csv")}
    ensure(len(rows) == len(ids) == 2783 and set(ids) == set(before),
           "Duplicate, missing or added public application record IDs")
    ensure(Counter(r["Application Status"] for r in rows) ==
           {"Active": 1605, "Withdrawn": 9, "Deactivated": 1169}, "Frozen APS status counts changed")
    families = defaultdict(list)
    for r in rows:
        families[family(r["Application ID"])].append(r)
    ensure(len(families) == 1614, "Public family count changed")
    active = {aid: r for aid, r in ids.items() if r["Application Status"] == "Active"}
    withdrawn = {aid for aid, r in ids.items() if r["Application Status"] == "Withdrawn"}
    replacements = {aid for aid in active if aid.endswith("-R")}
    ensure(len(replacements) == 152 and len(withdrawn) == 9, "Replacement/withdrawal counts changed")
    for aid, members in families.items():
        ensure(sum(r["Application Status"] == "Active" for r in members) == (0 if aid in withdrawn else 1),
               "Application family has inconsistent selected records: " + aid)
    for aid in replacements:
        ensure(ids[family(aid)]["Application Status"] == "Deactivated"
               and before[aid]["Application Status"] == "Active"
               and before[family(aid)]["Application Status"] == "Active",
               "Selected replacement is not supported by before/after states: " + aid)
    ensure("WDO2627T-T45217" not in ids, ".wdo unexpectedly entered the pinned public corpus")
    reveal = csv_rows(files, LIVE + "reveal-day-contention-sets.csv")
    confirmed = csv_rows(files, LIVE + "string-confirmation-contention-sets.csv")
    reveal_groups, confirmed_groups = defaultdict(set), defaultdict(set)
    for r in reveal:
        reveal_groups[r["#"]].add(r["Application ID"])
    for r in confirmed:
        confirmed_groups[r["#"]].add(r["Application ID"])
    confirmed_ids = {r["Application ID"] for r in confirmed}
    ensure(len(reveal) == 891 and len(reveal_groups) == 263, "Reveal contention baseline changed")
    ensure(len(confirmed) == len(confirmed_ids) == 705 and len(confirmed_groups) == 226,
           "Confirmed contention counts or unique IDs changed")
    ensure(confirmed_ids <= set(active), "Contention contains a non-active or unknown record")
    ensure(all(len(group) >= 2 for group in confirmed_groups.values()), "Singleton confirmed contention set")
    ensure(withdrawn <= set().union(*reveal_groups.values()), "Withdrawal reconciliation changed")
    adjusted = [group - withdrawn for group in reveal_groups.values() if len(group - withdrawn) >= 2]
    ensure(len(adjusted) == 262 and sum(map(len, adjusted)) == 881, "Withdrawal-adjusted baseline changed")
    active_primary = [r for r in active.values() if r["Application Type"] != "Existing gTLD with Variants"]
    ensure(len(active_primary) == 1599 and len({r["Primary String"] for r in active_primary}) == 1120,
           "Comparable new-primary population changed")
    ensure(len({r["Primary String"] for r in active.values()}) == 1126,
           "All publicly active labels changed")
    ensure(sum(r["Label: Applicant Support"] == "TRUE" for r in active.values()) == 46
           and sum(r["Region"] == "AP" for r in active.values()) == 210, "Public marginal counts changed")
    observation = parsed(files, EVIDENCE + "official-announcement-observation.json")
    ensure(observation["capture"]["capturedAtUTC"] == "2026-11-17T18:30:10Z", "Pinned cutoff changed")
    early_stats = observation["apsStatistics"]
    ensure((early_stats["totalApplications"], early_stats["activeApplications"], early_stats["withdrawnApplications"])
           == (1615, 1606, 9), "Earlier Statistics was overwritten by a later observation")
    announcement = observation["officialAnnouncement"]
    ensure(announcement["proceedingApplications"] == 1610
           and announcement["confirmedApplicationsInContention"] == 709,
           "Conflicting announcement figures must remain explicit")
    late = parsed(files, EVIDENCE + "aps-statistics-export-recheck-2038.json")
    late_raw = parsed(files, EVIDENCE + "aps-statistics-2009-raw.json")
    late_statuses = {r["status"]: r["count"] for r in late_raw["applications"]["byStatus"]}
    ensure(late_raw["lastPublishedAt"] == "2026-11-17T20:09:15.884Z"
           and late_statuses["Active"] == 1605 and late_statuses["Withdrawn"] == 10,
           "Later Statistics evidence changed")
    ensure(late["exportResponseDateUTC"] == "2026-11-17T20:38:11Z"
           and late["publicExportRecheck"]["rawSHA256"] == RAW_HASHES[LIVE + "aps-export-raw.csv"]
           and late["publicExportRecheck"]["sameBytesAsFrozen1830Capture"] is True,
           "Asynchronous export recheck is not reconciled to preserved bytes")
    lugano = ids["CDL2651T-T31516"]
    ensure(lugano["Primary String"] == "lugano" and lugano["Application Status"] == "Active"
           and lugano["Application Processing Stage"] == "String Evaluation Processing"
           and lugano["Label: Open Comment Period"] == "TRUE"
           and "CDL2651T-T31516" not in confirmed_ids, ".lugano observation changed")
    for manifest_name in ("aps_2026_application_graph_manifest.json", "aps_2026_current_analytics_manifest.json"):
        manifest = parsed(files, "data/" + manifest_name)
        for name, details in manifest.get("files", {}).items():
            path = "data/" + name
            if path in files and isinstance(details, dict) and "sha256" in details:
                ensure(sha(files[path]) == details["sha256"], "Derived dataset manifest mismatch: " + path)
    return {
        "frozenExportCapturedAtUTC": "2026-11-17T18:30:10Z",
        "publicRows": 2783, "publicApplicationFamilies": 1614,
        "publicActive": 1605, "publicWithdrawn": 9, "deactivatedRecords": 1169,
        "selectedReplacements": 152, "comparableNewPrimaryApplications": 1599,
        "comparableNewPrimaryLabels": 1120, "allPublicActiveLabels": 1126,
        "revealContention": {"sets": 263, "applications": 891},
        "afterWithdrawalsBeforeReplacement": {"sets": 262, "applications": 881},
        "confirmedContention": {"sets": 226, "applications": 705},
        "contemporaneousStatistics": {"total": 1615, "active": 1606, "withdrawn": 9},
        "announcement": {"proceeding": 1610, "contentionApplications": 709},
        "announcementMinusContemporaneousStatistics": 4,
        "additionalMissingApplicationsEstablished": False,
        "laterStatistics": {"publishedAtUTC": late_raw["lastPublishedAt"], "active": 1605, "withdrawn": 10},
        "laterExportHTTPDateUTC": late["exportResponseDateUTC"],
        "laterExportByteIdentical": True, "tenthWithdrawalIdentityEstablished": False,
        "luganoActiveInStringEvaluation": True, "luganoInPublishedContentionSets": False,
    }


def collect_sources():
    names = set(SUPPORT)
    for p in (ROOT / "data").glob("*.csv"):
        names.add(p.relative_to(ROOT).as_posix())
    for p in (ROOT / "data").glob("*.json"):
        if p.name not in EXCLUDED_JSON and (p.name.startswith(("application_", "applications_", "aps_2026_", "iana_", "tld_", "cultural_"))
                                             or p.name == "research.json"):
            names.add(p.relative_to(ROOT).as_posix())
    for p in (ROOT / "data/evidence").rglob("*"):
        if p.is_file() and p.suffix.lower() in {".csv", ".json", ".gz", ".txt"}:
            names.add(p.relative_to(ROOT).as_posix())
    for name in names:
        ensure((ROOT / name).is_file() and not (ROOT / name).is_symlink(), "Missing or symlinked input: " + name)
    files = {name: (ROOT / name).read_bytes() for name in sorted(names)}
    ensure(all(files.values()), "A selected source is empty")
    return files


def checked_baselines():
    payload = {}
    for tag, expected in BASELINES.items():
        actual = git("rev-parse", tag + "^{commit}").decode().strip()
        ensure(actual == expected["commit"], "Immutable " + tag + " tag mismatch")
        content = git("show", tag + ":data/research.json")
        payload["baselines/" + tag + "-data-research.json"] = content
    payload["baselines/verified-tag-identities.json"] = encoded(BASELINES)
    return payload


def input_commit_state(files):
    dirty = []
    for name, content in files.items():
        try:
            committed = git("show", "HEAD:" + name)
        except subprocess.CalledProcessError:
            committed = None
        if committed != content:
            dirty.append(name)
    return {"headCommit": git("rev-parse", "HEAD").decode().strip(),
            "selectedInputsMatchHead": not dirty, "uncommittedInputPaths": sorted(dirty),
            "note": "HEAD is a provenance anchor only when selectedInputsMatchHead is false; per-file hashes identify this review candidate."}


def candidate_citation():
    return ('cff-version: 1.2.0\nmessage: "Unpublished RR3 candidate; no RR3 DOI assigned. Public citations remain RR2."\n'
            'title: "Connecting the Dots: String Confirmation 2026 — RR3 candidate"\ntype: dataset\n'
            'authors:\n  - family-names: "Bregy"\n    given-names: "Robert"\n'
            'version: "RR3-candidate"\nlicense: "CC-BY-4.0"\n'
            'repository-code: "https://github.com/robertbregy/Connecting-the-Dots"\n').encode()


def report(manifest):
    return ("# RR3 scientific preflight\n\n"
            "**UNPUBLISHED CANDIDATE — NO RR3 DOI, TAG OR RELEASE CREATED.**\n\n"
            f"Source HEAD: `{manifest['sourceRevision']['headCommit']}`. "
            f"Selected inputs exactly committed at HEAD: **{manifest['sourceRevision']['selectedInputsMatchHead']}**.\n\n"
            "When inputs differ from HEAD, use the per-file manifest to identify this candidate. "
            "A later scientific release requires a frozen reviewed commit and a fresh preflight with `--require-frozen`.\n\n"
            f"Selected source files: **{len(manifest['sources'])}**. Snapshot: **17 November 2026, 18:30:10 UTC**.\n\n"
            "## Verified results\n\n"
            "2,783 public records represent 1,614 application families; 1,605 Active, nine Withdrawn "
            "and 1,169 Deactivated records. There are 152 selected replacements. "
            "Official public contention files change from 263 sets / 891 applications to 226 / 705; "
            "removing withdrawals and singletons first yields 262 / 881.\n\n"
            "The contemporaneous Statistics total reconciles as 1,615 − 9 = 1,606. "
            "The announcement's 1,610 differs by four; this does not establish four missing applications. "
            "The 20:09 Statistics / 20:38 identical-export observations remain separate and do not identify the tenth withdrawal.\n\n"
            "## Scope and limitations\n\n"
            "Raw source hashes and core comparisons are independently recomputed. Supporting historical/analytical "
            "tables are included with checksums; inclusion is not a new validation of every historical assertion. "
            "Mutable editorial Field Notes, interface translations and generated website pages are excluded. "
            "Root public citation and Zenodo metadata are preserved as contextual files, not a claim that RR3 is archived. "
            "The candidate addendum describes the new evidence; the earlier manuscript keeps its own revision date.\n\n"
            "RR1 and RR2 Git identities were verified at package creation and their research JSON is preserved. "
            "Offline ZIP verification validates those recorded identities and all packaged bytes; "
            "it does not independently query GitHub or Zenodo. No network calls occur in this script.\n")


def write_zip(path, payload):
    with zipfile.ZipFile(path, "w") as archive:
        for name, data in sorted(payload.items()):
            info = zipfile.ZipInfo(name, FIXED_ZIP_DATE)
            info.create_system = 3
            info.external_attr = 0o100644 << 16
            info.compress_type = zipfile.ZIP_DEFLATED
            archive.writestr(info, data, compress_type=zipfile.ZIP_DEFLATED, compresslevel=9)


def preflight(out, require_frozen=False):
    files = collect_sources()
    checks = validate_science(files)
    revision = input_commit_state(files)
    ensure(not require_frozen or revision["selectedInputsMatchHead"],
           "Selected inputs differ from HEAD; freeze the reviewed sources before publication")
    files.update(checked_baselines())
    manifest = {"schemaVersion": 1, "candidateId": "RR3", "candidateDoi": None,
                "publicationStatus": "DOI_UNASSIGNED_UNPUBLISHED",
                "sourceRevision": revision, "baselines": BASELINES,
                "conceptDoi": "10.5281/zenodo.23262622", "scientificChecks": checks,
                "sources": [{"path": name, "bytes": len(data), "sha256": sha(data)} for name, data in sorted(files.items())]}
    outputs = {MANIFEST_NAME: encoded(manifest), REPORT_NAME: report(manifest).encode(),
               CITATION_NAME: candidate_citation()}
    out.mkdir(parents=True, exist_ok=True)
    write_zip(out / ZIP_NAME, {**files, **outputs})
    for name, data in outputs.items():
        (out / name).write_bytes(data)
    sums = "".join(sha((out / name).read_bytes()) + "  " + name + "\n" for name in sorted([ZIP_NAME, *outputs]))
    (out / "SHA256SUMS.txt").write_text(sums, encoding="utf-8")
    verify(out)
    print(f"RR3 PREFLIGHT PASS: {len(files)} sources; inputs committed={revision['selectedInputsMatchHead']}; {out}")


def verify(out):
    manifest = json.loads((out / MANIFEST_NAME).read_bytes())
    ensure(manifest["candidateId"] == "RR3" and manifest["candidateDoi"] is None
           and manifest["publicationStatus"] == "DOI_UNASSIGNED_UNPUBLISHED"
           and manifest["baselines"] == BASELINES, "Candidate identity or baseline changed")
    sources = manifest["sources"]
    source_names = {entry["path"] for entry in sources}
    ensure(len(source_names) == len(sources), "Duplicate manifest paths")
    extras = {MANIFEST_NAME, REPORT_NAME, CITATION_NAME}
    expected = source_names | extras
    with zipfile.ZipFile(out / ZIP_NAME) as archive:
        names = archive.namelist()
        ensure(len(names) == len(expected) and set(names) == expected, "ZIP has duplicate, missing or extra entries")
        ensure(all(not PurePosixPath(n).is_absolute() and ".." not in PurePosixPath(n).parts for n in names),
               "Unsafe archive path")
        ensure(archive.testzip() is None, "ZIP CRC failure")
        files = {name: archive.read(name) for name in names}
    for entry in sources:
        data = files[entry["path"]]
        ensure(len(data) == entry["bytes"] and sha(data) == entry["sha256"], "Source checksum failure: " + entry["path"])
    for name in extras:
        ensure(files[name] == (out / name).read_bytes(), "Standalone artifact differs from ZIP: " + name)
    ensure(files[CITATION_NAME] == candidate_citation(), "Candidate citation misstates publication status")
    ensure(parsed(files, "baselines/verified-tag-identities.json") == BASELINES, "Baseline identity evidence changed")
    ensure(validate_science(files) == manifest["scientificChecks"], "Archived source recomputation differs from manifest")
    checksum_names = []
    for line in (out / "SHA256SUMS.txt").read_text().splitlines():
        expected_hash, name = line.split("  ", 1)
        ensure(name in extras | {ZIP_NAME} and sha((out / name).read_bytes()) == expected_hash,
               "Output checksum failure: " + name)
        checksum_names.append(name)
    ensure(set(checksum_names) == extras | {ZIP_NAME} and len(checksum_names) == 4,
           "Output checksum list is incomplete or contains duplicates")
    print("RR3 VERIFY PASS: archive inventory, per-source/output SHA-256 and independently recomputed scientific comparisons")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("mode", choices=("preflight", "verify"), nargs="?", default="preflight")
    parser.add_argument("--output-dir", type=Path, default=ROOT.parent / "rr3-scientific-preflight")
    parser.add_argument("--require-frozen", action="store_true")
    args = parser.parse_args()
    out = args.output_dir.expanduser().resolve()
    ensure(out != ROOT and ROOT not in out.parents, "Output directory must be outside the repository")
    if args.mode == "preflight":
        preflight(out, args.require_frozen)
    else:
        verify(out)


if __name__ == "__main__":
    try:
        main()
    except (ValueError, KeyError, OSError, subprocess.CalledProcessError, zipfile.BadZipFile) as error:
        print("RR3 PREFLIGHT FAILED: " + str(error), file=sys.stderr)
        raise SystemExit(1)
