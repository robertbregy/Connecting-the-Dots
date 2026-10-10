#!/usr/bin/env python3
"""RR2 scientific candidate preflight; never creates a GitHub or Zenodo release.

Collects research evidence, compares immutable RR1 with current scientific data,
builds a reproducible ZIP, verifies SHA-256 digests and (later) the Zenodo version
chain. The current public citation remains RR1 until an RR2 DOI is verified.
"""
from __future__ import annotations
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import sys
import urllib.error
import urllib.request
import zipfile

ROOT = Path(__file__).resolve().parents[1]
TAG = "RR1"
TAG_SHA = "5d52274935cda7712172873f46d456e4c0a09c7e"
DOI_RR1 = "10.5281/zenodo.23262623"
RR1_ZENODO_ID = 23262623
ZIP = "RR2-candidate-scientific-data.zip"
MANIFEST = "RR2-candidate-manifest.json"
REPORT = "RR2-preflight-report.md"
SIDE = "SHA256SUMS.txt"
DATE = (2026, 10, 10, 0, 0, 0)
EDITORIAL = {"behind_round_stories.json", "field_investigations.json",
             "inside_the_round_events.json", "sanctions_explainer.json",
             "internet_access_explainer.json"}
TECHNICAL = {"translations.json", "release_history.json", "manifest.json"}
ESSENTIAL = {
    "data/research.json", "data/application_2026_snapshot.json",
    "data/applications_2026_strings_reveal.csv", "data/applications_2000.csv",
    "data/applications_2004.csv", "data/applications_2012.csv",
    "data/application_archaeology_manifest.json",
    "data/application_archaeology_local.json", "data/iana_snapshot.json",
    "data/tld_universe.csv", "data/tld_life_histories.csv",
    "data/explorer_catalog.csv", "data/explorer_events.csv",
    "data/round_2026.csv", "data/rounds_summary.csv",
    "data/sector_evolution_2012_2026.csv",
    "data/application_economic_map_2012_2026.csv",
    "data/evidence/iana-snapshot-2026-10-04.json.gz",
    "research/rr2_candidate.json",
    "research/connecting-the-dots-working-paper-v1.md",
    "research/research_release_manifest.json",
}


def ensure(ok, why):
    if not ok:
        raise ValueError(why)


def load(path):
    return json.loads(path.read_text(encoding="utf-8-sig"))


def cmd(*args):
    return subprocess.check_output(["git", *args], cwd=ROOT,
                                   text=True, stderr=subprocess.PIPE).strip()


def digest(data):
    return hashlib.sha256(data).hexdigest()


def json_bytes(obj):
    return (json.dumps(obj, indent=2, sort_keys=True, ensure_ascii=False) + "\n").encode("utf-8")


def check_science(plan):
    baseline = plan["baseline"]
    policy = plan["archivePolicy"]
    ensure(plan["schemaVersion"] == 1 and plan["candidateId"] == "RR2"
           and plan["candidateStatus"] == "prepublication-review", "RR2 must remain an unpublished candidate")
    ensure(baseline["tag"] == TAG and baseline["tagCommit"] == TAG_SHA
           and baseline["specificDoi"] == DOI_RR1, "RR1 baseline tag or DOI changed")
    ensure(cmd("rev-parse", TAG + "^{commit}") == TAG_SHA, "RR1 tag no longer matches frozen tag commit")
    ensure(policy["doiForRR2"] is None and policy["rr2Publication"] == "blocked-until-verified"
           and policy["zenodoGitHubIntegration"] == "not-verified"
           and policy["preserveExistingCurrentResearchRelease"] == TAG,
           "Zenodo verification gate was silently bypassed")
    ensure(plan["followingMilestone"]["plannedIdIfRR2PublishedNow"] == "RR3",
           "String Confirmation must become RR3 if RR2 is published early")
    previous = json.loads(cmd("show", TAG + ":data/research.json"))
    current = load(ROOT / "data/research.json")
    frozen = load(ROOT / "data/application_2026_snapshot.json")
    manifest = load(ROOT / "research/research_release_manifest.json")
    publication = load(ROOT / "publication.json")
    expect = plan["scientificChange"]
    rr1_summary = next(x for x in previous["rounds"] if x["round"] == 2026)
    now_summary = next(x for x in current["rounds"] if x["round"] == 2026)
    ensure(rr1_summary["applications"] == expect["rr1Summary2026Applications"] == 1663
           and previous["round2026"]["applications"] == expect["rr1Specific2026Applications"] == 1616,
           "RR1 pre-Reveal baselines differ from immutable tag")
    ensure(now_summary["applications"] == current["round2026"]["applications"] ==
           frozen["official"]["activeApplications"] ==
           expect["currentOfficialRevealDayApplications"] == 1615,
           "Official Reveal Day figure not reconciled")
    ensure(current["round2026"]["applicantOrganizations"] == frozen["official"]["applicants"] ==
           expect["currentOfficialApplicants"] == 481, "Official applicant count changed")
    for actual, projected in [
        ("contentionSets", "currentPreliminaryContentionSets"),
        ("geographicApplications", "currentGeographicApplications"),
        ("communityApplications", "currentCommunityApplications"),
        ("brandApplications", "currentBrandApplications"),
        ("idnApplications", "currentIdnApplications"),
    ]:
        ensure(current["round2026"][actual] == expect[projected],
               "The scientific metric no longer matches the candidate plan: " + actual)
    inventory = frozen["stringInventory"]
    for actual, projected in [
        ("secondaryApplicationsObserved", "secondaryIndexApplications"),
        ("representedPrimaryApplications", "primaryStringApplications"),
        ("observedStrings", "primaryStrings"),
        ("variantOnlyApplicationsOutsideStringInventory", "variantOnlyApplications"),
    ]:
        ensure(inventory[actual] == expect[projected],
               "Secondary index changed without an evidence review: " + actual)
    ensure(expect["primaryStringApplications"] + expect["variantOnlyApplications"] ==
           expect["secondaryIndexApplications"] == 1614, "1,608+6 index reconciliation incorrect")
    ensure(frozen["integrity"]["fullLocalApplicationCorpusClaimed"] is False
           and expect["applicantCorpusComplete"] is False,
           "RR2 must not claim a complete local ICANN APS application corpus")
    ensure(frozen["snapshot"] == plan["researchDataSnapshot"] ==
           current["round2026"]["asOf"] == "2026-10-07", "Snapshot chronology changed")
    ensure(manifest["currentResearchRelease"]["id"] == TAG
           and manifest["currentResearchRelease"]["doi"] == DOI_RR1
           and manifest["nextPlannedResearchRelease"]["id"] == "RR2"
           and manifest["currentSiteVersion"] == publication["version"],
           "Public manifest must still cite published RR1 before RR2 archival verification")
    ensure(load(ROOT / ".zenodo.json")["upload_type"] == "dataset",
           "Zenodo metadata must describe a research dataset")
    iana = load(ROOT / "data/iana_snapshot.json")
    iana_source = ROOT / iana["archive_path"]
    ensure(iana_source.is_file() and digest(iana_source.read_bytes()) ==
           iana["archive_sha256"], "Compressed IANA source evidence checksum mismatch")
    changed = cmd("diff", "--name-only", TAG, "HEAD", "--",
                  "data/research.json", "data/round_2026.csv",
                  "data/applications_2026_strings_reveal.csv",
                  "data/sector_evolution_2012_2026.csv").splitlines()
    ensure("data/research.json" in changed, "No material scientific change since RR1")
    return {
        "rr1": {"tagCommit": TAG_SHA, "doi": DOI_RR1, "submitted": 1663, "paid": 1616},
        "rr2Candidate": {
            "officialRevealDayApplications": 1615, "officialApplicants": 481,
            "preliminaryContentionSets": expect["currentPreliminaryContentionSets"],
            "primaryStringsInSecondaryIndex": expect["primaryStrings"],
            "primaryStringApplications": expect["primaryStringApplications"],
            "variantOnlyApplications": expect["variantOnlyApplications"],
            "secondaryIndexApplications": expect["secondaryIndexApplications"],
            "completeOfficialAPS": False, "dataSnapshot": frozen["snapshot"],
        },
        "countWarning": "1,663 submitted, 1,616 paid, 1,615 official and 1,614 secondary-index records count distinct populations/stages.",
        "changedScientificInputs": changed,
        "afterRR2": plan["followingMilestone"],
    }


def files_to_freeze():
    paths = {}
    for p in (ROOT / "data").rglob("*"):
        if p.is_file() and p.suffix.lower() in {".csv", ".json", ".gz"}:
            if p.name not in EDITORIAL | TECHNICAL:
                paths[p.relative_to(ROOT).as_posix()] = p
    for name in [
        "data/README.md", "data/CONTENT_LICENSE.md",
        "research/README.md", "research/rr2_candidate.json",
        "research/connecting-the-dots-working-paper-v1.md",
        "research/research_release_manifest.json",
        "scripts/assemble_data.js", "scripts/release_check.py",
        "scripts/scientific_release.py", "scripts/package_release.py",
        "build.py", "package.json", "package-lock.json",
    ]:
        paths[name] = ROOT / name
    missing = [k for k, p in paths.items() if not p.is_file()]
    ensure(not missing, "Missing reproducibility inputs: " + ", ".join(missing))
    ensure(ESSENTIAL.issubset(paths) and len(paths) >= 45,
           "Scientific evidence selection is missing essential records")
    ensure(not any(Path(k).name in EDITORIAL for k in paths),
           "Editable field-note data must not be counted as frozen scientific evidence")
    return [(name, paths[name]) for name in sorted(paths)]


def citation(plan):
    return (
        'cff-version: 1.2.0\n'
        'message: "Unpublished RR2 candidate. Until Zenodo confirms RR2, cite the established RR1 DOI."\n'
        'title: "Connecting the Dots: A Living Research Atlas of Top-Level Domain Expansion"\n'
        'type: dataset\n'
        'authors:\n'
        '  - family-names: "Bregy"\n'
        '    given-names: "Robert"\n'
        'version: "RR2-candidate"\n'
        'date-released: "' + plan["preparedOn"] + '"\n'
        'url: "https://robertbregy.github.io/Connecting-the-Dots/"\n'
        'repository-code: "https://github.com/robertbregy/Connecting-the-Dots"\n'
        'license: "CC-BY-4.0"\n'
    ).encode("utf-8")


def markdown_report(result):
    science = result["scientificComparison"]
    return "\n".join([
        "# RR2 research publication dry run",
        "",
        "STATUS: CANDIDATE VERIFIED, NO RR2 DOI AND NO GITHUB RELEASE CREATED.",
        "",
        "Frozen candidate commit: " + result["commit"],
        "RR1 Git tag commit (unchanged): " + science["rr1"]["tagCommit"],
        "Citable RR1 version DOI (unchanged): " + science["rr1"]["doi"],
        "Evidence snapshot: " + result["snapshot"],
        "Scientific/reproducibility files: " + str(result["fileCount"]),
        "",
        "## Evidence delta since RR1",
        "",
        "RR1 carried 1,663 submissions / 1,616 paid applications at different stages.",
        "The current scientific layer cites 1,615 official Reveal Day applications",
        "from 481 applicants and 263 preliminary contention sets.",
        "A frozen SECONDARY index holds 980 primary strings, 1,608 primary-string",
        "applications and six variant-only records (1,614 secondary applications).",
        "A complete official APS 2026 application-level corpus is NOT asserted.",
        "",
        "## Publication gates",
        "",
        "The ZIP and per-file SHA-256 are reproducible for this commit.",
        "Zenodo GitHub integration and RR1's concept DOI are NOT YET VERIFIED.",
        "A future RR2 record must have a new DOI within RR1's SAME Zenodo concept series.",
        "Public CITATION.cff and currentResearchRelease remain RR1 until verification.",
        "If RR2 is released before 17 November, the String Confirmation milestone becomes RR3.",
        "The working paper is a revisable draft, not a peer-reviewed journal article.",
        "",
        "## Material input changes",
        "",
        *science["changedScientificInputs"],
        "",
    ]) + "\n"


def zip_info(name):
    info = zipfile.ZipInfo(name, DATE)
    info.create_system = 3
    info.external_attr = 0o100644 << 16
    info.compress_type = zipfile.ZIP_DEFLATED
    return info


def preflight(out):
    plan = load(ROOT / "research/rr2_candidate.json")
    science = check_science(plan)
    commit = cmd("rev-parse", "HEAD")
    ensure(len(commit) == 40, "Missing immutable commit SHA")
    paths = files_to_freeze()
    manifest = {
        "schemaVersion": 1, "candidateId": "RR2",
        "publicationStatus": "DOI_UNASSIGNED_UNPUBLISHED",
        "commit": commit, "snapshot": plan["researchDataSnapshot"],
        "baselineCommit": TAG_SHA, "baselineDoi": DOI_RR1, "candidateDoi": None,
        "fileCount": len(paths), "sources": [],
        "scientificComparison": science, "archivePolicy": plan["archivePolicy"],
    }
    payload = {}
    for name, p in paths:
        data = p.read_bytes()
        ensure(data, "Empty scientific source: " + name)
        payload[name] = data
        manifest["sources"].append({
            "path": name, "bytes": len(data), "sha256": digest(data),
        })
    payload["SCIENTIFIC_MANIFEST.json"] = json_bytes(manifest)
    payload["RELEASE_CANDIDATE_README.md"] = markdown_report(manifest).encode("utf-8")
    payload["CITATION_RR2_CANDIDATE.cff"] = citation(plan)
    out.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(out / ZIP, "w") as zf:
        for name in sorted(payload):
            zf.writestr(zip_info(name), payload[name],
                        compress_type=zipfile.ZIP_DEFLATED, compresslevel=9)
    (out / MANIFEST).write_bytes(payload["SCIENTIFIC_MANIFEST.json"])
    (out / REPORT).write_bytes(payload["RELEASE_CANDIDATE_README.md"])
    (out / SIDE).write_text(
        digest((out / ZIP).read_bytes()) + "  " + ZIP + "\n" +
        digest((out / MANIFEST).read_bytes()) + "  " + MANIFEST + "\n",
        encoding="utf-8",
    )
    verify(out)
    print("RR2 SCIENTIFIC PREFLIGHT PASS: " + str(len(paths)) +
          " sources, commit " + commit + ", RR2 DOI not assigned")


def verify(out):
    for name in (ZIP, MANIFEST, REPORT, SIDE):
        ensure((out / name).is_file(), "Missing preflight artifact: " + name)
    manifest = load(out / MANIFEST)
    ensure(manifest["candidateId"] == "RR2" and manifest["candidateDoi"] is None and
           manifest["publicationStatus"] == "DOI_UNASSIGNED_UNPUBLISHED" and
           manifest["baselineDoi"] == DOI_RR1, "Candidate falsely marked DOI-published")
    with zipfile.ZipFile(out / ZIP, "r") as zf:
        contents = zf.namelist()
        expected = {row["path"] for row in manifest["sources"]} | {
            "SCIENTIFIC_MANIFEST.json", "RELEASE_CANDIDATE_README.md",
            "CITATION_RR2_CANDIDATE.cff",
        }
        ensure(set(contents) == expected and len(contents) == len(expected),
               "ZIP has missing, duplicate or unmanifested scientific sources")
        ensure(zf.testzip() is None, "Archive CRC verification failed")
        ensure(zf.read("SCIENTIFIC_MANIFEST.json") == (out / MANIFEST).read_bytes(),
               "ZIP and standalone manifest differ")
        for row in manifest["sources"]:
            data = zf.read(row["path"])
            ensure(len(data) == row["bytes"] and digest(data) == row["sha256"],
                   "Archive SHA-256 failed for " + row["path"])
        candidate_citation = zf.read("CITATION_RR2_CANDIDATE.cff").decode("utf-8")
        ensure('version: "RR2-candidate"' in candidate_citation and
               DOI_RR1 not in candidate_citation, "Citation conflates RR2 and RR1 DOI")
    sums = {}
    for line in (out / SIDE).read_text(encoding="utf-8").splitlines():
        checksum, name = line.split("  ", 1)
        ensure(name not in sums and len(checksum) == 64,
               "Bad SHA256SUMS record")
        sums[name] = checksum
        ensure(digest((out / name).read_bytes()) == checksum,
               "Candidate output SHA-256 mismatch: " + name)
    ensure(set(sums) == {ZIP, MANIFEST}, "Incomplete SHA256SUMS sidecar")
    print("RR2 SCIENTIFIC VERIFY PASS: ZIP integrity, per-source and artifact SHA-256")


def get_zenodo(record_id):
    req = urllib.request.Request(
        "https://zenodo.org/api/records/" + str(record_id),
        headers={"Accept": "application/json",
                 "User-Agent": "Connecting-the-Dots-Research-Release-Audit/1"},
    )
    with urllib.request.urlopen(req, timeout=25) as stream:
        return json.load(stream)


def verify_zenodo(new_id, out):
    ensure(new_id and new_id > 0 and new_id != RR1_ZENODO_ID,
           "Specify a NEW Zenodo RR2 record ID")
    rr1, rr2 = get_zenodo(RR1_ZENODO_ID), get_zenodo(new_id)
    ensure(rr1.get("doi") == DOI_RR1, "RR1 DOI differs from archived citation")
    a, b = str(rr1.get("conceptrecid") or ""), str(rr2.get("conceptrecid") or "")
    ensure(a and a == b, "RR2 is NOT a new version of RR1's Zenodo concept record")
    ensure(rr2.get("doi") and rr2["doi"] != DOI_RR1 and
           rr2.get("metadata", {}).get("title"),
           "Zenodo has not published a distinct RR2 DOI")
    evidence = {
        "status": "ZENODO_VERSION_SERIES_VERIFIED",
        "rr1RecordId": RR1_ZENODO_ID, "rr1Doi": DOI_RR1,
        "rr2RecordId": new_id, "rr2Doi": rr2["doi"],
        "sharedConceptRecordId": a,
        "conceptDoi": rr2.get("conceptdoi") or rr1.get("conceptdoi"),
        "note": "Only now may the site's currentResearchRelease and CITATION.cff be promoted in a reviewed commit.",
    }
    out.mkdir(parents=True, exist_ok=True)
    (out / "RR2-zenodo-version-verification.json").write_bytes(json_bytes(evidence))
    print("ZENODO VERSION CHAIN VERIFIED: " + rr2["doi"] + ", RR1 concept " + a)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("mode", choices=("preflight", "verify", "verify-zenodo"))
    parser.add_argument("--out-dir", type=Path, default=ROOT / "dist/research/RR2")
    parser.add_argument("--new-record-id", type=int)
    args = parser.parse_args()
    out = args.out_dir.resolve()
    if args.mode == "preflight":
        preflight(out)
    elif args.mode == "verify":
        verify(out)
    else:
        verify_zenodo(args.new_record_id, out)


if __name__ == "__main__":
    try:
        main()
    except (ValueError, KeyError, OSError, subprocess.CalledProcessError,
            urllib.error.URLError, zipfile.BadZipFile) as exc:
        print("SCIENTIFIC PREFLIGHT FAILED: " + str(exc), file=sys.stderr)
        raise SystemExit(1)
