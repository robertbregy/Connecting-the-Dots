#!/usr/bin/env python3
"""Regression checks for the post-17-November official ICANN correction.

Run from repository root: python3 scripts/check_icann_20261118_correction.py
This checks published source provenance and the localized correction layer.
It deliberately does NOT infer application-level changes from aggregate data.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"

def load(path):
    return json.loads(path.read_text(encoding="utf-8"))

def check():
    evidence = load(DATA / "evidence/icann_20261118_reconciliation.json")
    editorial = load(DATA / "atlas_2026_correction_editorial.json")
    initial = load(DATA / "application_2026_string_confirmation_snapshot.json")
    graph = load(DATA / "aps_2026_application_graph_manifest.json")
    old = evidence["publications"]["announcementOriginal"]
    new = evidence["publications"]["announcementRevised"]
    delta = evidence["verifiedDeltas"]["originalToRevisedAnnouncement"]
    keys = (
        "proceeding", "eligibleReplacement", "selectedReplacement",
        "initialContentionSets", "initialContentionApplications",
        "confirmedContentionSets", "confirmedContentionApplications",
        "aspProceeding", "apRegion", "idn", "variantApplications"
    )
    for key in keys:
        assert delta[key] == new[key] - old[key], ("incorrect official correction delta", key)
    assert new["selectedReplacement"] == 152
    assert new["confirmedContentionSets"] == 226
    assert new["confirmedContentionApplications"] == 705
    assert new["initialContentionSets"] - new["confirmedContentionSets"] == 37
    assert new["proceeding"] == 1606
    assert initial["officialAnnouncement"]["proceedingApplications"] == 1610, "Historical snapshot must stay frozen"
    assert graph["counts"]["officialPublishedApplications"] == 1614
    assert graph["counts"]["selectedReplacementRecords"] == 152
    latest = evidence["publications"]["apsStatistics"]
    prev = initial["laterStatisticsExportObservation"]["apsStatistics"]
    observed = evidence["verifiedDeltas"]["apsSince20261117T2009UTC"]
    assert latest["totalApplications"] == 1615 == initial["apsStatistics"]["totalApplications"]
    assert latest["active"] + latest["withdrawn"] == latest["totalApplications"]
    assert observed["active"] == latest["active"] - prev["activeApplications"]
    assert observed["withdrawn"] == latest["withdrawn"] - prev["withdrawnApplications"]
    assert observed["totalApplications"] == latest["totalApplications"] - prev["totalApplications"]
    assert evidence["evidenceStatus"]["freshCSVDownloaded"] is False
    assert evidence["evidenceStatus"]["applicationIDsChanged"] is None
    assert editorial["sourceEvidence"] == "data/evidence/icann_20261118_reconciliation.json"
    for lang in ("it", "en", "de", "fr"):
        strings = editorial["translations"][lang]
        page = (ROOT / "applications" / lang / "index.html").read_text(encoding="utf-8")
        assert all(strings[k] for k in ("title", "body", "note")), lang
        assert strings["title"] in page, ("missing translated heading", lang)
        assert page.count('id="apsCorrectionHeading"') == 1, ("duplicated correction", lang)
        assert page.count('id="aps-results"') == 1, ("atlas search damaged", lang)
        assert "icann_20261118_reconciliation.json" in page, lang
        assert new["url"] in page, lang
        assert latest["url"] in page, lang
    generator = (ROOT / "scripts/render_aps_application_atlas.py").read_text(encoding="utf-8")
    assert "atlas_2026_correction_editorial.json" in generator
    assert "icann_20261118_reconciliation.json" in generator
    assert "{correction}" in generator
    print("PASS: official ICANN correction, separate clocks, four languages, frozen Atlas graph")

if __name__ == "__main__":
    check()
