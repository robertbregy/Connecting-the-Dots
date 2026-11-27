#!/usr/bin/env python3
"""Reproduce the 27 November APS observation from archived official sources.

No network is required. Raw responses and earlier snapshots are immutable inputs.
Publication, acquisition and approval dates are deliberately separate. Calculated
CSV counts and exact-string groups are project analyses of official data, not
ICANN totals or new official contention determinations.
"""
from __future__ import annotations

import csv
import hashlib
import io
import json
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
EVIDENCE = DATA / "evidence/round-2026-followup-20261127"
PREVIOUS = DATA / "applications_2026_aps_followup_20261122.csv"
PREVIOUS_PROV = DATA / "applications_2026_aps_followup_20261122_provenance.json"
FROZEN = DATA / "applications_2026_aps_string_confirmation_20261117.csv"
SOURCE = DATA / "applications_2026_aps_followup_20261127.csv"
PROVENANCE = DATA / "applications_2026_aps_followup_20261127_provenance.json"
FOLLOWUP = DATA / "round_2026_followup_20261127.json"
RAW_SHA = "defc901116c1faacdd332530b31f777a1b6865bebc1e08b351e729c08588a50a"
PREVIOUS_SHA = "cd7df94d073ef39206621424aed2d34782f2896a34d589b5d2109e0626288ad7"
STATS_SHA = "df3411018630ff50be484569affb1733c43d677529ccb148e73d812ed5bd6121"
ANALYSIS = "Project analysis of official ICANN APS data; calculated counts are not totals declared by ICANN."
PUBLIC_BASE = "https://newgtldprogram-aps.icann.org/applications/"


def read_json(path):
    return json.loads(path.read_text(encoding="utf-8"))


def sha(contents):
    return hashlib.sha256(contents).hexdigest()


def relative(path):
    return str(path.relative_to(ROOT))


def write_json(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def norm(value):
    return value.strip().lower().lstrip(".")


def base_id(record_id):
    return record_id[:-2] if record_id.endswith("-R") else record_id


def read_csv(path):
    records = list(csv.reader(io.StringIO(path.read_bytes().decode("utf-8-sig"), newline="")))
    header = next(i for i, row in enumerate(records) if "Application ID" in row and "Primary String" in row)
    columns = records[header]
    data = [row for row in records[header + 1:] if row]
    if any(len(row) != len(columns) for row in data):
        raise ValueError("Unexpected CSV row shape: " + str(path))
    rows = [dict(zip(columns, row)) for row in data]
    if len({row["Application ID"] for row in rows}) != len(rows):
        raise ValueError("Duplicate Application ID: " + str(path))
    return columns, rows, [cell for row in records[:header] for cell in row if cell]


def normalize_csv(columns, rows):
    stream = io.StringIO(newline="")
    writer = csv.DictWriter(stream, fieldnames=columns, lineterminator="\n")
    writer.writeheader()
    writer.writerows(rows)
    return stream.getvalue().encode("utf-8")


def effective_rows(rows):
    originals = {row["Application ID"]: row for row in rows if not row["Application ID"].endswith("-R")}
    alternatives = {base_id(row["Application ID"]): row for row in rows if row["Application ID"].endswith("-R")}
    selected = {
        aid for aid, row in originals.items()
        if row["Application Status"] == "Deactivated" and aid in alternatives
        and alternatives[aid]["Application Status"] in ("Active", "Withdrawn")
        and alternatives[aid]["Application Type"] in ("New gTLD", "New gTLD with Variants")
    }
    effective = {aid: alternatives[aid] if aid in selected else row for aid, row in originals.items()}
    return originals, alternatives, selected, effective


def metrics(rows):
    originals, alternatives, selected, effective = effective_rows(rows)
    primary = defaultdict(list)
    active = {aid: row for aid, row in effective.items() if row["Application Status"] == "Active"}
    for aid, row in active.items():
        if row["Application Type"] != "Existing gTLD with Variants":
            primary[norm(row["Primary String"])].append(aid)
    groups = {name: sorted(ids) for name, ids in sorted(primary.items()) if len(ids) > 1}
    return {
        "rowCount": len(rows),
        "completeRecordIds": len(rows),
        "applicationFamilies": len(originals),
        "replacementRecords": len(alternatives),
        "statusCounts": dict(sorted(Counter(row["Application Status"] for row in rows).items())),
        "visibleActiveApplications": len(active),
        "visibleWithdrawnApplications": sum(row["Application Status"] == "Withdrawn" for row in effective.values()),
        "selectedReplacementRecords": len(selected),
        "selectedReplacementApplicationIds": sorted(selected),
        "activeNewPrimaryApplications": sum(len(ids) for ids in primary.values()),
        "activeNewPrimaryStrings": len(primary),
        "exactPrimaryOverlapGroups": len(groups),
        "applicationsInExactPrimaryOverlaps": sum(len(ids) for ids in groups.values()),
        "exactPrimaryOverlapMembers": groups,
    }


def compare(before, after, columns):
    previous = {row["Application ID"]: row for row in before}
    current = {row["Application ID"]: row for row in after}
    changed = []
    for aid in sorted(previous.keys() & current.keys()):
        fields = {name: [previous[aid][name], current[aid][name]] for name in columns if previous[aid][name] != current[aid][name]}
        if fields:
            changed.append({"recordId": aid, "applicationFamilyId": base_id(aid), "string": norm(current[aid]["Primary String"]), "applicant": current[aid]["Applicant Name"], "changes": fields})
    return {
        "comparisonKey": "Application ID, retaining the -R suffix for record-level comparisons",
        "addedRecordIds": sorted(current.keys() - previous.keys()),
        "removedRecordIds": sorted(previous.keys() - current.keys()),
        "changedRecordCount": len(changed),
        "changedApplicationFamilyCount": len({row["applicationFamilyId"] for row in changed}),
        "changedFieldCounts": dict(sorted(Counter(name for row in changed for name in row["changes"]).items())),
        "changedRecords": changed,
    }


def status_changes(comparison):
    return [{"applicationId": row["recordId"], "string": row["string"], "applicant": row["applicant"], "previousStatus": row["changes"]["Application Status"][0], "currentStatus": row["changes"]["Application Status"][1]} for row in comparison["changedRecords"] if "Application Status" in row["changes"]]


def acquisition(meta):
    return meta.get("completed_at_utc") or meta.get("acquired_at_utc")


def source_info(path, public_url=None):
    raw = path.read_bytes()
    meta = read_json(path.with_name(path.name + ".provenance.json"))
    if sha(raw) != meta["sha256"] or meta.get("response_status", meta.get("status")) != 200:
        raise ValueError("Official response checksum/status changed: " + str(path))
    published = None
    if path.suffix == ".json":
        content = json.loads(raw)
        published = content.get("lastPublishedAt") or content.get("applicationDetails", {}).get("lastPublishedAt")
    return {
        "url": meta["url"], "publicURL": public_url or meta["url"], "method": meta["method"],
        "requestJSON": meta.get("request_body"), "publicationOrUpdateAtUTC": published,
        "retrievedAtUTC": acquisition(meta), "requestStartedAtUTC": meta.get("request_started_utc"),
        "httpStatus": 200, "rawFile": relative(path), "rawBytes": len(raw), "rawSHA256": sha(raw),
        "publicationDateNote": "No independently stated publication timestamp was located; acquisition is not publication." if published is None else "Timestamp explicitly published in the official JSON; not the acquisition or effective event date.",
    }


def verify_contention_rechecks():
    """Recheck both archived official files against the immutable older bytes."""
    folder = EVIDENCE / "contention-recheck"
    provenance_path = folder / "provenance-validated.json"
    comparison_path = folder / "contention-byte-and-id-comparison.json"
    metadata = read_json(provenance_path)
    expected_comparisons = read_json(comparison_path)
    acquisitions = {entry["file"]: entry for entry in metadata["current_acquisitions"] if entry.get("http_status") == 200 and entry.get("file", "").endswith(".csv")}
    historical = {entry["historical_file"].removeprefix("baseline-"): entry for entry in metadata["historical_baselines"]}
    expected_counts = {"reveal-day-contention-sets.csv": (891, 263), "string-confirmation-contention-sets.csv": (705, 226)}
    if set(acquisitions) != set(expected_counts) or set(historical) != set(expected_counts):
        raise ValueError("Official contention recheck source coverage changed")
    observed, sources = [], []
    for name, (expected_rows, expected_sets) in expected_counts.items():
        current_path = folder / name
        previous_path = DATA / "evidence/string-confirmation-2026-11-17/live" / name
        current_raw, previous_raw = current_path.read_bytes(), previous_path.read_bytes()
        acquisition_meta, historical_meta = acquisitions[name], historical[name]
        if sha(current_raw) != acquisition_meta["sha256"] or sha(previous_raw) != historical_meta["sha256"] or current_raw != previous_raw:
            raise ValueError("Official contention bytes differ from the reviewed unchanged sources: " + name)
        current_rows = list(csv.DictReader(io.StringIO(current_raw.decode("utf-8-sig"), newline="")))
        previous_rows = list(csv.DictReader(io.StringIO(previous_raw.decode("utf-8-sig"), newline="")))
        before = {row["Application ID"]: row for row in previous_rows}
        after = {row["Application ID"]: row for row in current_rows}
        actual = {
            "source": name, "equal_bytes": current_raw == previous_raw,
            "sha256": sha(current_raw), "baseline_sha256": sha(previous_raw),
            "rows": len(current_rows), "distinct_application_ids": len(after),
            "set_ids": len({row["#"] for row in current_rows}),
            "added_ids": sorted(after.keys() - before.keys()),
            "removed_ids": sorted(before.keys() - after.keys()),
            "changed_fields_by_id": {
                aid: {key: [before[aid][key], after[aid][key]] for key in after[aid] if before[aid][key] != after[aid][key]}
                for aid in sorted(after.keys() & before.keys()) if before[aid] != after[aid]
            },
        }
        if actual["rows"] != expected_rows or actual["distinct_application_ids"] != expected_rows or actual["set_ids"] != expected_sets:
            raise ValueError("Official contention identity census changed: " + name)
        observed.append(actual)
        sources.append({
            "url": acquisition_meta["url"], "publicURL": acquisition_meta["url"],
            "resolvedURL": acquisition_meta["resolved_url"], "method": "GET",
            "publicationOrUpdateAtUTC": None,
            "publicationEventDate": acquisition_meta["publication_event_date"],
            "publicationDateBasis": acquisition_meta["date_basis"],
            "retrievedAtUTC": acquisition_meta.get("completed_at_utc") or acquisition_meta["acquired_at_utc"],
            "requestStartedAtUTC": acquisition_meta["acquired_at_utc"],
            "acquisitionTimeBasis": "Completed HTTP response time" if acquisition_meta.get("completed_at_utc") else "Recorded time immediately before the HTTP request; completion time was not separately recorded",
            "httpStatus": acquisition_meta["http_status"],
            "httpLastModified": acquisition_meta.get("http_headers", {}).get("last-modified"),
            "rawFile": relative(current_path), "rawBytes": len(current_raw), "rawSHA256": sha(current_raw),
            "rawProvenanceFile": relative(provenance_path), "comparisonFile": relative(comparison_path),
            "previousSource": {"url": acquisition_meta["url"], "rawFile": relative(previous_path), "rawSHA256": sha(previous_raw), "publicationEventDate": acquisition_meta["publication_event_date"], "acquiredCollectionAtUTC": historical_meta["original_capture_collection_time_utc"], "acquisitionTimeBasis": historical_meta["capture_time_basis"], "repositoryURL": historical_meta["repository_url"]},
            "sameBytesAsPreviousObservation": True, "newSubstantiveExport": False,
            "publicationDateNote": "The dated publication event is documented by ICANN. HTTP Last-Modified, request time and acquisition time are retained separately and do not independently establish publication time.",
        })
    if observed != expected_comparisons or observed != metadata["comparison"]:
        raise ValueError("Official contention recheck differs from the archived byte/ID comparison")
    return {
        "classification": "Verification of unchanged official contention exports; not a new substantive export or current contention resolution",
        "provenanceFile": relative(provenance_path), "comparisonFile": relative(comparison_path),
        "sources": sources, "comparisons": observed,
    }


def build():
    raw_path = EVIDENCE / "aps-export-raw.csv"
    raw = raw_path.read_bytes()
    if sha(raw) != RAW_SHA or sha(PREVIOUS.read_bytes()) != PREVIOUS_SHA:
        raise ValueError("Pinned 22/27 November CSV source checksum changed")
    columns, rows, preamble = read_csv(raw_path)
    previous_columns, previous_rows, _ = read_csv(PREVIOUS)
    frozen_columns, frozen_rows, _ = read_csv(FROZEN)
    if columns != previous_columns or columns != frozen_columns or len(columns) != 34:
        raise ValueError("Incomparable official schemas")
    normalized = normalize_csv(columns, rows)
    SOURCE.write_bytes(normalized)
    previous_provenance = read_json(PREVIOUS_PROV)
    previous_observations = read_json(DATA / "evidence/round-2026-followup-20261122/source-observations.json")
    previous_stats_source = next(source for source in previous_observations["sources"] if source["id"] == "statistics-api")
    previous_stats = read_json(DATA / "evidence/round-2026-followup-20261122/aps-statistics-raw.json")
    stats_path = EVIDENCE / "aps-statistics-raw.json"
    if sha(stats_path.read_bytes()) != STATS_SHA:
        raise ValueError("Pinned 27 November statistics checksum changed")
    stats = read_json(stats_path)
    stats_status = {item["status"]: item["count"] for item in stats["applications"]["byStatus"]}
    previous_stats_status = {item["status"]: item["count"] for item in previous_stats["applications"]["byStatus"]}
    first_csv_source = source_info(raw_path, "https://newgtldprogram-aps.icann.org/applications")
    first_stats_source = source_info(stats_path, "https://newgtldprogram-aps.icann.org/statistics")
    csv_source = source_info(EVIDENCE / "recheck/export-raw.csv", "https://newgtldprogram-aps.icann.org/applications")
    stats_source = source_info(EVIDENCE / "recheck/statistics.json", "https://newgtldprogram-aps.icann.org/statistics")
    if csv_source["rawSHA256"] != RAW_SHA or stats_source["rawSHA256"] != STATS_SHA:
        raise ValueError("Prepublication recheck no longer matches the archived current snapshot")
    about_source = source_info(EVIDENCE / "recheck/about.html", "https://newgtldprogram-aps.icann.org/about")
    about_text = (EVIDENCE / "recheck/about.html").read_text(encoding="utf-8")
    if "not updated in real time" not in about_text or "not updated until String Confirmation Day" not in about_text:
        raise ValueError("APS public update policy requires a new review")
    update_policy = {
        "source": about_source,
        "beforeStringConfirmation": "APS stated that public information was not updated between Reveal Day and String Confirmation Day.",
        "afterStringConfirmation": "APS states that public information is updated regularly after String Confirmation Day, but not in real time. Applicants are directed to TAMS for their most up-to-date application information.",
        "reconciliationOfCurrentStatisticsAndCSVProvided": False,
    }
    contention_recheck = verify_contention_rechecks()
    wdo_path = EVIDENCE / "aps-wdo-summary.html"
    wdo_source = source_info(wdo_path)
    wdo_html = wdo_path.read_text(encoding="utf-8")
    if "Last published on: 7 October 2026 at 18:00 UTC" not in wdo_html or "Undergoing administrative check" not in wdo_html or "WDO2627T-T45217" not in wdo_html:
        raise ValueError("The separately published .wdo status requires a new review")
    previous_wdo = next(source for source in previous_observations["sources"] if source["id"] == "wdo")
    if wdo_source["rawSHA256"] != previous_wdo["rawSHA256"]:
        raise ValueError("The .wdo summary is no longer byte-identical to the previous observation")
    wdo_source.update({
        "publicationOrUpdateAtUTC": "2026-10-07T18:00:00Z",
        "publicationDateBasis": "Visible Last published on label in the archived official HTML",
        "publicationDateNote": "The last public summary publication is not a current internal-status timestamp.",
        "sameBytesAsPreviousObservation": True,
        "previousSource": {"url": previous_wdo["url"], "publicationOrUpdateAtUTC": "2026-10-07T18:00:00Z", "retrievedAtUTC": previous_wdo["retrievedAtUTC"], "rawSHA256": previous_wdo["rawSHA256"], "evidenceRegister": "data/evidence/round-2026-followup-20261122/source-observations.json"},
    })
    wdo_observation = {
        "applicationId": "WDO2627T-T45217", "source": wdo_source,
        "lastPublishedStatus": "Undergoing administrative check",
        "lastPublishedAtUTC": "2026-10-07T18:00:00Z",
        "currentInternalStatusEstablished": False,
        "attributionToCurrentCountDiscrepanciesDocumented": False,
    }
    before, after = metrics(previous_rows), metrics(rows)
    comparison = compare(previous_rows, rows, columns)
    frozen_comparison = compare(frozen_rows, rows, columns)
    changes = status_changes(comparison)
    frozen_changes = status_changes(frozen_comparison)
    if comparison["addedRecordIds"] or comparison["removedRecordIds"] or comparison["changedFieldCounts"] != {"Application Status": 42, "Label: Change Request": 36} or comparison["changedRecordCount"] != 78 or comparison["changedApplicationFamilyCount"] != 76:
        raise ValueError("27 November record-level comparison differs from verified evidence")
    if len(frozen_changes) != 52 or after["statusCounts"] != {"Active": 1553, "Deactivated": 1169, "Withdrawn": 61}:
        raise ValueError("Current/frozen withdrawal census differs")
    if (after["rowCount"], after["applicationFamilies"], after["replacementRecords"], after["activeNewPrimaryApplications"], after["activeNewPrimaryStrings"], after["exactPrimaryOverlapGroups"], after["applicationsInExactPrimaryOverlaps"]) != (2783, 1614, 1169, 1547, 1119, 222, 650):
        raise ValueError("Current export metrics differ from verified evidence")
    if before["selectedReplacementApplicationIds"] != after["selectedReplacementApplicationIds"] or len(after["selectedReplacementApplicationIds"]) != 152:
        raise ValueError("A new selected replacement requires separate verification")

    summaries = read_json(EVIDENCE / "withdrawals-42-official-summary-corroboration.json")
    summary_by_id = {item["application_id"]: item for item in summaries["records"]}
    if set(summary_by_id) != {item["applicationId"] for item in changes}:
        raise ValueError("Withdrawal corroboration coverage mismatch")
    sources = [first_csv_source, first_stats_source, csv_source, stats_source, about_source, wdo_source, *contention_recheck["sources"]]
    current_by_id = {row["Application ID"]: row for row in rows}
    for aid, item in sorted(summary_by_id.items()):
        path = EVIDENCE / "application-summaries" / (aid + ".json")
        content = read_json(path)
        details = content["applicationDetails"]
        if content["applicationHumanReadableId"] != aid or details["applicationStatus"] != "Withdrawn" or norm(details["primaryString"]["aLabel"]) != norm(current_by_id[aid]["Primary String"]) or content["applicantDetails"]["organizationName"] != current_by_id[aid]["Applicant Name"] or details["lastPublishedAt"] != item["last_published_at_utc"] or sha(path.read_bytes()) != item["raw_sha256"]:
            raise ValueError("Summary does not corroborate withdrawal identity/status: " + aid)
        sources.append(source_info(path, item["public_summary_url"]))

    cr = read_json(EVIDENCE / "change-requests-analysis.json")
    label_rows = [row for row in comparison["changedRecords"] if "Label: Change Request" in row["changes"]]
    label_families = {row["applicationFamilyId"] for row in label_rows}
    if label_families != {item["application_id"] for item in cr["applications"]} or len(label_families) != 34:
        raise ValueError("Change-request coverage mismatch")
    request_ids, approved_families, empty = set(), set(), []
    for item in cr["applications"]:
        aid = item["application_id"]
        path = EVIDENCE / "change-requests" / (aid + ".json")
        content = read_json(path)
        if content["applicationHumanReadableId"] != aid or sha(path.read_bytes()) != item["source_sha256"] or content["applicationDetails"]["applicationStatus"] != "Active":
            raise ValueError("Change-request source identity/status mismatch: " + aid)
        official_crs = content["changeRequests"]["crs"]
        if {value["id"] for value in official_crs} != {value["change_request_id"] for value in item["change_requests"]}:
            raise ValueError("Change-request IDs differ: " + aid)
        if not official_crs:
            empty.append(aid)
        for value in official_crs:
            if not value.get("approvalDate") or "ICANN approving" not in value.get("publicSummary", ""):
                raise ValueError("Approval is not explicitly documented: " + value["id"])
            request_ids.add(value["id"])
            approved_families.add(aid)
        sources.append(source_info(path, item["public_page_url"]))
    if len(request_ids) != 34 or len(approved_families) != 30 or sorted(empty) != sorted(cr["application_families_with_flag_but_empty_request_list"]):
        raise ValueError("Published request detail census mismatch")

    previous_csv_source = {
        "url": previous_provenance["sourceExportURL"], "publicURL": previous_provenance["sourcePage"],
        "publicationOrUpdateAtUTC": None, "retrievedAtUTC": previous_provenance["retrievedAtUTC"],
        "rawFile": previous_provenance["rawFile"], "rawSHA256": previous_provenance["originalCSVSHA256"],
        "normalizedFile": relative(PREVIOUS), "normalizedSHA256": previous_provenance["normalizedCSVSHA256"],
        "publicationDateNote": "No independent export publication timestamp; this is a dated acquisition.",
    }
    previous_stats_reference = {
        "url": previous_stats_source["url"], "publicURL": "https://newgtldprogram-aps.icann.org/statistics",
        "publicationOrUpdateAtUTC": previous_stats["lastPublishedAt"],
        "retrievedAtUTC": previous_stats_source["retrievedAtUTC"],
        "rawFile": "data/evidence/round-2026-followup-20261122/aps-statistics-raw.json",
        "rawSHA256": previous_stats_source["rawSHA256"],
    }
    comparison.update({"classification": ANALYSIS, "previousSource": previous_csv_source, "currentSource": csv_source, "before": before, "after": after, "causalExplanation": None, "effectiveEventDates": None, "statusChanges": changes})
    write_json(EVIDENCE / "comparison-by-application-id.json", comparison)
    gaps = {
        "classification": "Observed cross-source discrepancies; no official causal reconciliation located",
        "statisticsSource": stats_source, "exportSource": csv_source,
        "officialStatisticsTotalApplications": stats["applications"]["totalNumOfApplications"],
        "publicApplicationFamilies": after["applicationFamilies"],
        "statisticsMinusPublicFamilies": stats["applications"]["totalNumOfApplications"] - after["applicationFamilies"],
        "officialStatisticsActiveApplications": stats_status["Active"],
        "visibleProceedingApplications": after["visibleActiveApplications"],
        "statisticsMinusPublicActiveApplications": stats_status["Active"] - after["visibleActiveApplications"],
        "officialStatisticsWithdrawnApplications": stats_status["Withdrawn"],
        "visibleWithdrawnApplications": after["visibleWithdrawnApplications"],
        "statisticsMinusPublicWithdrawnApplications": stats_status["Withdrawn"] - after["visibleWithdrawnApplications"],
        "causalExplanation": None, "additionalWithdrawnApplicationIds": None,
        "knownSeparatelyPublishedApplicationId": "WDO2627T-T45217",
        "attributionToKnownApplicationDocumented": False,
        "note": "The aggregate difference does not identify eleven additional withdrawn Application IDs. The separately published .wdo administrative-check notice only documents its omission from the public listing; it does not explain this withdrawal discrepancy or establish its current internal state.",
    }
    register = {
        "schemaVersion": 1, "observedOn": "2026-11-27",
        "policy": "Original official responses are preserved byte-for-byte with SHA-256 and acquisition provenance; prior snapshots are never overwritten. Acquisition, source publication and event dates are separate.",
        "sources": sources, "previousSources": [previous_csv_source, previous_stats_reference],
        "APSUpdatePolicy": update_policy,
        "officialContentionRecheck": contention_recheck,
        "separatelyPublishedApplicationObservation": wdo_observation,
        "limitations": ["The full CSV response does not state an export publication timestamp.", "Summary lastPublishedAt timestamps are publication times, not effective withdrawal dates.", "Individual change-request pages were first captured on 27 November; the previous verified state is the 22 November export label, not a historical capture of those pages.", "APS public information is not real-time; discrepancies between endpoints are retained, not silently reconciled."]
    }
    write_json(EVIDENCE / "source-observations.json", register)

    provenance = dict(previous_provenance)
    provenance.update({
        "schemaVersion": 3,
        "title": "ICANN APS public applications follow-up captured 27 November 2026",
        "observedOn": "2026-11-27", "retrievedAtUTC": csv_source["retrievedAtUTC"],
        "sourceExportPublicationAtUTC": None,
        "sourceStatisticsLastPublished": stats["lastPublishedAt"],
        "sourceStatisticsRetrievedAtUTC": stats_source["retrievedAtUTC"],
        "rawFile": relative(raw_path), "officialRowsFile": SOURCE.name,
        "firstAcquisition": first_csv_source,
        "latestAcquisitionEvidence": csv_source,
        "originalCSVBytes": len(raw), "originalCSVSHA256": sha(raw),
        "normalizedCSVBytes": len(normalized), "normalizedCSVSHA256": sha(normalized),
        "csvColumns": columns, "csvPreambleNotice": preamble,
        "officialStatisticsTotalApplications": stats["applications"]["totalNumOfApplications"],
        "officialStatisticsApplicants": stats["applicants"]["totalNumOfApplicants"],
        "officialStatisticsActiveApplications": stats_status["Active"],
        "officialStatisticsWithdrawnApplications": stats_status["Withdrawn"],
        "officialStatisticsUniqueStrings": stats["applications"]["totalNumOfUniquePrimaryStrings"],
        "visibleProceedingApplicationFamilies": after["visibleActiveApplications"],
        "visibleWithdrawnApplicationFamilies": after["visibleWithdrawnApplications"],
        "visibleProceedingNewPrimaryApplications": after["activeNewPrimaryApplications"],
        "visibleProceedingNewPrimaryStrings": after["activeNewPrimaryStrings"],
        "effectiveNewPrimaryStrings": after["activeNewPrimaryStrings"],
        "derivedCurrentContentionSets": after["exactPrimaryOverlapGroups"],
        "derivedCurrentContentionApplications": after["applicationsInExactPrimaryOverlaps"],
        "derivedExactPrimaryMatchGroups": after["exactPrimaryOverlapGroups"],
        "applicationsInExactPrimaryMatches": after["applicationsInExactPrimaryOverlaps"],
        "statusCounts": after["statusCounts"],
        "changedStatusRecords": frozen_changes,
        "changedStatusRecordsBasis": "Compared with the immutable 17 November snapshot; use statusChangesSincePreviousObservation for the latest 22-to-27 November change.",
        "statusChangesSincePreviousObservation": changes,
        "changedFieldCounts": comparison["changedFieldCounts"],
        "changedFieldCountsBasis": "22 November to 27 November, compared by complete Application ID",
        "changeRequestLabelChangedRecords": len(label_rows),
        "changeRequestLabelChangedFamilies": len(label_families),
        "previousObservation": previous_csv_source,
        "comparisonSincePreviousObservation": comparison,
        "crossSourceDiscrepancies": gaps,
        "APSUpdatePolicy": update_policy,
        "officialContentionRecheck": contention_recheck,
        "separatelyPublishedApplicationObservation": wdo_observation,
        "withdrawalSummaryCorroboration": relative(EVIDENCE / "withdrawals-42-official-summary-corroboration.json"),
        "changeRequestEvidence": relative(EVIDENCE / "change-requests-analysis.json"),
        "evidenceRegister": relative(EVIDENCE / "source-observations.json"),
        "announcementGapScope": "The corrected 16 November announcement snapshot remains a separate historical comparison with the 17 November sources; it is not compared with later withdrawals.",
        "reconciliation": {**previous_provenance["reconciliation"], "statusChangesSinceFrozen17": frozen_changes},
        "researchBoundary": "Snapshots of 11 October, 17 November and 22 November, all RR1/RR2/RR3 scientific releases, DOI-bearing packages and prior technical archives remain immutable. This is a separate current observation dated 27 November.",
    })
    write_json(PROVENANCE, provenance)
    single_groups = []
    _, _, _, current_effective = effective_rows(rows)
    for label, previous_ids in before["exactPrimaryOverlapMembers"].items():
        remaining = [aid for aid in previous_ids if current_effective[aid]["Application Status"] == "Active"]
        if len(remaining) == 1:
            single_groups.append({"string": label, "previousApplicationIds": previous_ids, "currentActiveApplicationIds": remaining, "newlyWithdrawnApplicationIds": sorted(set(previous_ids) - set(remaining)), "officialResolutionInferred": False})
    if {row["string"] for row in single_groups} != {"loop", "order", "path"}:
        raise ValueError("Analytical group change differs from verified comparison")
    followup = {
        "schemaVersion": 2, "classification": "Source-backed current observation separate from frozen research releases",
        "observedOn": "2026-11-27", "sourceCaptureUTC": csv_source["retrievedAtUTC"],
        "evidenceRegister": relative(EVIDENCE / "source-observations.json"),
        "currentExport": relative(SOURCE), "currentExportProvenance": relative(PROVENANCE),
        "researchBoundary": provenance["researchBoundary"],
        "previousCSV": previous_csv_source, "currentCSV": csv_source,
        "previousStatistics": previous_stats_reference,
        "currentStatistics": {"source": stats_source["publicURL"], "sourceAPI": stats_source["url"], "lastPublishedAt": stats["lastPublishedAt"], "retrievedAtUTC": stats_source["retrievedAtUTC"], "totalApplications": stats["applications"]["totalNumOfApplications"], "applicants": stats["applicants"]["totalNumOfApplicants"], "activeApplications": stats_status["Active"], "withdrawnApplications": stats_status["Withdrawn"], "publicVisibleActive": after["visibleActiveApplications"], "publicVisibleWithdrawn": after["visibleWithdrawnApplications"], "publicApplicationFamilies": after["applicationFamilies"]},
        "statisticsComparison": {"before": previous_stats_status, "after": stats_status, "withdrawnDelta": stats_status["Withdrawn"] - previous_stats_status["Withdrawn"], "activeDelta": stats_status["Active"] - previous_stats_status["Active"], "causalExplanation": None},
        "crossSourceDiscrepancies": gaps,
        "APSUpdatePolicy": update_policy,
        "officialContentionRecheck": contention_recheck,
        "separatelyPublishedApplicationObservation": wdo_observation,
        "comparison": relative(EVIDENCE / "comparison-by-application-id.json"),
        "addedRecordIds": comparison["addedRecordIds"], "removedRecordIds": comparison["removedRecordIds"],
        "changedRecordCount": comparison["changedRecordCount"], "changedApplicationFamilyCount": comparison["changedApplicationFamilyCount"],
        "changedFieldCounts": comparison["changedFieldCounts"],
        "allChangedFieldsSincePreviousObservation": comparison["changedRecords"],
        "statusChangesSincePreviousObservation": changes,
        "statusChangesSinceFrozen17": frozen_changes,
        "withdrawalSummaryEvidence": relative(EVIDENCE / "withdrawals-42-official-summary-corroboration.json"),
        "withdrawalSummaryPublicationDateCounts": summaries["publication_counts_by_date_utc"],
        "withdrawalEffectiveDates": None,
        "currentExactStringOverlap": {"classification": ANALYSIS, "basis": provenance["contentionBasis"], "newPrimaryApplications": after["activeNewPrimaryApplications"], "newPrimaryStrings": after["activeNewPrimaryStrings"], "groups": after["exactPrimaryOverlapGroups"], "applicationsInGroups": after["applicationsInExactPrimaryOverlaps"], "isNewOfficialContentionDetermination": False, "official17NovemberReference": {"sets": 226, "applicationRows": 705, "source": previous_provenance["reconciliation"]["officialContention17File"], "sha256": previous_provenance["reconciliation"]["officialContention17SHA256"]}, "groupsNowWithOneActiveVisibleApplication": single_groups},
        "selectedReplacements": {"previous": before["selectedReplacementRecords"], "current": after["selectedReplacementRecords"], "addedApplicationIds": [], "removedApplicationIds": []},
        "changeRequestLabelFollowup": {"changedRecordCount": len(label_rows), "applicationFamilyCount": len(label_families), "records": label_rows, "publishedRequestFamilyCount": len(approved_families), "publishedApprovedRequestCount": len(request_ids), "publishedApprovedRequestIds": sorted(request_ids), "flagWithEmptyRequestListApplicationIds": sorted(empty), "evidence": relative(EVIDENCE / "change-requests-analysis.json"), "approvalDateRange": cr["approval_date_range"], "requestTypeCounts": cr["request_type_counts"], "interpretation": "A published approved change request is distinct from final application approval or selection of a replacement string. Four true labels have no public request details. Historical individual request pages were not captured; the prior verified state is the 22 November CSV label."},
        "limitations": register["limitations"] + cr["limits"] + [gaps["note"], "The derived exact-string groups do not establish ICANN contention resolution. Objection fields are not contention determinations."]
    }
    write_json(FOLLOWUP, followup)
    print("APS_FOLLOWUP_20261127_VERIFIED " + json.dumps({"rows": len(rows), "changedRecords": len(comparison["changedRecords"]), "newWithdrawn": len(changes), "labelRows": len(label_rows), "publicWithdrawn": after["visibleWithdrawnApplications"], "statisticsWithdrawn": stats_status["Withdrawn"], "sourceSHA256": sha(normalized)}, sort_keys=True))


if __name__ == "__main__":
    build()
