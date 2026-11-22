#!/usr/bin/env python3
"""Build the current ICANN 2026 APS graph from a dated post-confirmation export.

This builder is intentionally separate from build_aps_application_graph.py,
which preserves the Reveal Day analytical baseline. One base Application ID is
one application family. A terminal -R record is a related replacement record.
For a selected replacement, the application family's effective string/status is
read from the promoted -R record, including after withdrawal, while the base ID
remains the stable identity. Current exact-string overlaps are derived; the
official String Confirmation contention file remains a separate frozen source.
"""
from __future__ import annotations

import csv
import hashlib
import io
import json
import re
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
D = ROOT / "data"
SOURCE = D / "applications_2026_aps_followup_20261122.csv"
PROV = D / "applications_2026_aps_followup_20261122_provenance.json"
BASELINE = D / "applications_2026_aps_string_confirmation_20261117.csv"
BASELINE_PROV = D / "applications_2026_aps_string_confirmation_20261117_provenance.json"
CONFIRMED_CONTENTION = D / "evidence/string-confirmation-2026-11-17/live/string-confirmation-contention-sets.csv"
GRAPH = D / "aps_2026_application_graph.json"
BROWSER = D / "aps_2026_application_graph.js"
EDGES = D / "aps_2026_application_edges.csv"
HISTORY = D / "aps_2026_record_observations.csv"
REPORT = D / "aps_2026_application_graph_manifest.json"
URL = "https://newgtldprogram-aps.icann.org/applications/"

TYPES = [
    "TLD Type: Brand",
    "TLD Type: Community",
    "TLD Type: Geo (Self-Designated)",
    "TLD Type: Geo (String Review Confirmed)",
    "TLD Type: IDN",
]
LABELS = [
    "Label: GAC Early Warning",
    "Label: GAC Advice",
    "Label: High Risk String",
    "Label: Objection",
    "Label: Safeguard",
    "Label: In Contention",
    "Label: Clarifying Questions",
    "Label: Change Request",
    "Label: Open Comment Period",
    "Label: Comments",
    "Label: RVC",
    "Label: Applicant Support",
    "Label: Variant Only (Existing TLD)",
    "Label: Variant Included",
    "Label: CoC Exemption",
    "Label: Reserved Name",
    "Label: CPE",
    "Label: Singular/Plural",
]
EDGE_COLS = [
    "application_id",
    "aps_record_id",
    "string_ascii",
    "string_unicode",
    "relationship",
    "record_status",
    "source_observed_utc",
    "source_sha256",
]
EVENT_COLS = [
    "application_id",
    "aps_record_id",
    "observed_utc",
    "primary_string",
    "application_type",
    "application_status",
    "processing_stage",
    "source_sha256",
]


def norm(value):
    return str(value or "").strip().lower().lstrip(".")


def digest(contents):
    return hashlib.sha256(contents).hexdigest()


def write(path, contents):
    path.write_text(contents, encoding="utf-8", newline="\n")


def csv_document(rows, columns):
    stream = io.StringIO(newline="")
    writer = csv.DictWriter(stream, fieldnames=columns, lineterminator="\n", extrasaction="ignore")
    writer.writeheader()
    writer.writerows(rows)
    return stream.getvalue()


def base_id(record_id):
    return record_id[:-2] if record_id.endswith("-R") else record_id


def public_link(record_id, section="summary"):
    if not re.fullmatch(r"[A-Za-z0-9-]{8,80}", record_id):
        raise ValueError("Invalid official public APS record ID " + record_id)
    return URL + record_id + "/" + section


def variants(cell):
    found = [
        {"ascii": norm(ascii_label), "unicode": unicode_label.strip()}
        for ascii_label, unicode_label in re.findall(
            r"(xn--[a-z0-9-]+)(?:\s*\(([^)]*)\))?", cell or "", re.I
        )
    ]
    if cell and not found:
        raise ValueError("Unknown APS variant syntax: " + cell)
    return found


def flags(row):
    return [
        key.replace("TLD Type: ", "").replace("Label: ", "")
        for key in TYPES + LABELS
        if row.get(key) == "TRUE"
    ]


def selected_replacement(original, alternative):
    # Promotion changes the -R type from Replacement String to New gTLD. A
    # later withdrawal does not undo that choice or restore the old string.
    return bool(
        alternative
        and original["Application Status"] == "Deactivated"
        and alternative["Application Status"] in ("Active", "Withdrawn")
        and alternative["Application Type"] in ("New gTLD", "New gTLD with Variants")
    )


def effective_record(original, alternative):
    return alternative if selected_replacement(original, alternative) else original


def maintain_events(rows, provenance, source_sha, frozen_rows, frozen_provenance):
    older = []
    if HISTORY.exists():
        with HISTORY.open(encoding="utf-8", newline="") as file:
            reader = csv.DictReader(file)
            if reader.fieldnames != EVENT_COLS:
                raise ValueError("APS historical event schema mismatch")
            older = list(reader)
    seen = {(item["aps_record_id"], item["source_sha256"]): item for item in older}
    if len(seen) != len(older):
        raise ValueError("Duplicate event identity in history")

    # A current rebuild must never silently replace the historical corpus with
    # a latest-only log. Verify every immutable 17 November observation first.
    frozen_sha = frozen_provenance["normalizedCSVSHA256"]
    for row in frozen_rows:
        record_id = row["Application ID"]
        expected = dict(
            application_id=base_id(record_id),
            aps_record_id=record_id,
            observed_utc=frozen_provenance["retrievedAtUTC"],
            primary_string=norm(row["Primary String"]),
            application_type=row["Application Type"],
            application_status=row["Application Status"],
            processing_stage=row["Application Processing Stage"],
            source_sha256=frozen_sha,
        )
        if seen.get((record_id, frozen_sha)) != expected:
            raise ValueError("Frozen APS observation missing or altered: " + record_id)

    additional = []
    for row in sorted(rows, key=lambda item: item["Application ID"]):
        record_id = row["Application ID"]
        current = dict(
            application_id=base_id(record_id),
            aps_record_id=record_id,
            observed_utc=provenance["retrievedAtUTC"],
            primary_string=norm(row["Primary String"]),
            application_type=row["Application Type"],
            application_status=row["Application Status"],
            processing_stage=row["Application Processing Stage"],
            source_sha256=source_sha,
        )
        old = seen.get((record_id, source_sha))
        if old and old != current:
            raise ValueError("Altered state for immutable source digest " + record_id)
        if not old:
            additional.append(current)

    all_events = older + additional
    write(HISTORY, csv_document(all_events, EVENT_COLS))
    return {
        "events": len(all_events),
        "added": len(additional),
        "sourceSnapshots": len({item["source_sha256"] for item in all_events}),
    }


def official_contention_groups():
    with CONFIRMED_CONTENTION.open(encoding="utf-8-sig", newline="") as stream:
        rows = list(csv.DictReader(stream))
    # Group on ICANN's explicit contention-set identifier, not the rendered
    # Applied-for string(s) label. The latter can contain primary + variant
    # notation for IDN cases (for example "xn--kbt444f / xn--kbto70f").
    groups = defaultdict(list)
    for row in rows:
        groups[row["#"]].append(row["Application ID"])
    return {key: sorted(value) for key, value in groups.items()}, rows


def primary_groups(originals, alternatives):
    proceeding = {}
    primary = defaultdict(list)
    for aid, original in originals.items():
        effective = effective_record(original, alternatives.get(aid))
        if effective["Application Status"] != "Active":
            continue
        proceeding[aid] = effective
        if effective["Application Type"] != "Existing gTLD with Variants":
            primary[norm(effective["Primary String"])].append(aid)
    exact = {key: sorted(value) for key, value in primary.items() if len(value) > 1}
    return proceeding, primary, exact


def verify_reconciliation(rows, provenance):
    """Pin both historical inputs and check the exact observed status delta."""
    reconciliation = provenance["reconciliation"]
    frozen_raw = BASELINE.read_bytes()
    frozen_provenance = json.loads(BASELINE_PROV.read_text(encoding="utf-8"))
    if (
        digest(frozen_raw) != reconciliation["frozen17SHA256"]
        or digest(frozen_raw) != frozen_provenance["normalizedCSVSHA256"]
        or reconciliation["frozen17File"] != str(BASELINE.relative_to(ROOT))
        or digest(CONFIRMED_CONTENTION.read_bytes()) != reconciliation["officialContention17SHA256"]
        or reconciliation["officialContention17File"] != str(CONFIRMED_CONTENTION.relative_to(ROOT))
    ):
        raise ValueError("Frozen String Confirmation input checksum or path changed")
    frozen_reader = csv.DictReader(io.StringIO(frozen_raw.decode("utf-8-sig"), newline=""))
    if frozen_reader.fieldnames != frozen_provenance["csvColumns"]:
        raise ValueError("Frozen APS source columns changed")
    frozen_rows = list(frozen_reader)
    before = {row["Application ID"]: row for row in frozen_rows}
    after = {row["Application ID"]: row for row in rows}
    if len(before) != len(frozen_rows) or set(before) != set(after):
        raise ValueError("Current and frozen APS record identities do not reconcile")
    changes = [
        {
            "applicationId": aid,
            "string": norm(after[aid]["Primary String"]),
            "applicant": after[aid]["Applicant Name"],
            "previousStatus": before[aid]["Application Status"],
            "currentStatus": after[aid]["Application Status"],
        }
        for aid in sorted(before)
        if before[aid]["Application Status"] != after[aid]["Application Status"]
    ]
    expected_changes = sorted(reconciliation["statusChangesSinceFrozen17"], key=lambda row: row["applicationId"])
    if changes != expected_changes or changes != sorted(provenance["changedStatusRecords"], key=lambda row: row["applicationId"]):
        raise ValueError("Current APS status transitions differ from pinned reconciliation")
    return frozen_rows, frozen_provenance, changes


def build():
    provenance = json.loads(PROV.read_text(encoding="utf-8"))
    raw = SOURCE.read_bytes()
    source_sha = digest(raw)
    if source_sha != provenance["normalizedCSVSHA256"]:
        raise ValueError("Pinned current APS digest did not match source")
    if provenance["snapshotState"] != "post-string-confirmation" or provenance["officialRowsFile"] != SOURCE.name:
        raise ValueError("Current APS snapshot identity changed")

    reader = csv.DictReader(io.StringIO(raw.decode("utf-8-sig"), newline=""))
    if reader.fieldnames != provenance["csvColumns"]:
        raise ValueError("APS source columns changed")
    rows = list(reader)

    if len(rows) != 2783 or len(rows) != provenance["totalOfficialListingRows"]:
        raise ValueError("Incorrect official listing row count")

    ids = [row["Application ID"] for row in rows]
    if any(not value for value in ids) or len(set(ids)) != 2783:
        raise ValueError("Missing or duplicated official APS record IDs")

    originals = {
        row["Application ID"]: row
        for row in rows
        if not row["Application ID"].endswith("-R")
    }
    alternatives = {
        base_id(row["Application ID"]): row
        for row in rows
        if row["Application ID"].endswith("-R")
    }

    if (
        len(originals) != 1614
        or len(alternatives) != 1169
        or not set(alternatives).issubset(originals)
    ):
        raise ValueError("Official APS 1614/1169 record identity reconciliation failed")

    pending_id = provenance["pendingAdministrativeCheckApplicationID"]
    if pending_id in originals:
        raise ValueError("Withheld administrative-check record unexpectedly entered public listing")

    if any(originals[key]["Applicant Name"] != value["Applicant Name"] for key, value in alternatives.items()):
        raise ValueError("Original/replacement applicant changed")

    selected = {
        aid
        for aid, original in originals.items()
        if selected_replacement(original, alternatives.get(aid))
    }
    if len(selected) != provenance["selectedReplacementRecords"] or len(selected) != 152:
        raise ValueError("Selected replacement count differs from verified String Confirmation evidence")

    proceeding, primary, exact = primary_groups(originals, alternatives)
    frozen_rows, frozen_provenance, status_changes = verify_reconciliation(rows, provenance)
    frozen_originals = {row["Application ID"]: row for row in frozen_rows if not row["Application ID"].endswith("-R")}
    frozen_alternatives = {base_id(row["Application ID"]): row for row in frozen_rows if row["Application ID"].endswith("-R")}
    frozen_proceeding, _, frozen_exact = primary_groups(frozen_originals, frozen_alternatives)
    official_exact, official_contention_rows = official_contention_groups()

    if len(proceeding) != provenance["visibleProceedingApplicationFamilies"]:
        raise ValueError("Public proceeding application-family count changed")
    if len(primary) != provenance["effectiveNewPrimaryStrings"]:
        raise ValueError("Effective public new-primary string count changed")
    if len(exact) != provenance["derivedExactPrimaryMatchGroups"] or sum(map(len, exact.values())) != provenance["applicationsInExactPrimaryMatches"]:
        raise ValueError("Effective exact-string contention census changed")
    frozen_memberships = sorted(tuple(value) for value in frozen_exact.values())
    official_memberships = sorted(tuple(value) for value in official_exact.values())
    if frozen_memberships != official_memberships or len(official_contention_rows) != 705 or len(official_exact) != 226:
        raise ValueError("Frozen 17 November memberships differ from official String Confirmation contention CSV")
    surviving_groups = [sorted(aid for aid in group if aid in proceeding) for group in official_exact.values()]
    surviving_memberships = sorted(tuple(group) for group in surviving_groups if len(group) > 1)
    if sorted(tuple(value) for value in exact.values()) != surviving_memberships:
        raise ValueError("Current derived overlaps do not reconcile with surviving confirmed memberships")
    if provenance["officialStatisticsActiveApplications"] != len(proceeding) + 1:
        raise ValueError("Current public APS count plus the separately disclosed .wdo does not reconcile")
    if (
        provenance["officialStatisticsTotalApplications"] != len(originals) + 1
        or provenance["officialStatisticsActiveApplications"] + provenance["officialStatisticsWithdrawnApplications"] != provenance["officialStatisticsTotalApplications"]
    ):
        raise ValueError("Current APS active/withdrawn totals do not reconcile with published families")
    if provenance["officialAnnouncementProceedingApplications"] != len(frozen_proceeding) + 1:
        raise ValueError("Corrected historical announcement does not reconcile with its dated public snapshot")
    if provenance["officialAnnouncementApplicationsInContention"] != len(official_contention_rows):
        raise ValueError("Corrected historical announcement differs from the frozen official contention CSV")
    if (
        provenance["publicConfirmedContentionSets"] != len(official_exact)
        or provenance["publicConfirmedContentionApplications"] != len(official_contention_rows)
        or provenance["unresolvedAnnouncementPublicationGap"] != 0
    ):
        raise ValueError("Historical correction or frozen contention reconciliation changed")

    observed_status_counts = dict(sorted(Counter(row["Application Status"] for row in rows).items()))
    if observed_status_counts != provenance["statusCounts"]:
        raise ValueError("APS published status counts changed")

    edges = []
    apps = []
    changes_by_record = {change["applicationId"]: change for change in status_changes}

    def edge(application_id, record_id, string, unicode_label, relationship, status):
        edges.append(
            {
                "application_id": application_id,
                "aps_record_id": record_id,
                "string_ascii": norm(string),
                "string_unicode": (unicode_label or "").strip(),
                "relationship": relationship,
                "record_status": status,
                "source_observed_utc": provenance["retrievedAtUTC"],
                "source_sha256": source_sha,
            }
        )

    for aid, original in sorted(
        originals.items(),
        key=lambda item: (
            norm(effective_record(item[1], alternatives.get(item[0]))["Primary String"]),
            item[0],
        ),
    ):
        alternative = alternatives.get(aid)
        is_selected = selected_replacement(original, alternative)
        effective = effective_record(original, alternative)

        effective_primary = norm(effective["Primary String"])
        only_variant = effective["Application Type"] == "Existing gTLD with Variants"
        effective_is_proceeding = effective["Application Status"] == "Active"
        exact_count = (
            len(primary[effective_primary])
            if effective_is_proceeding and not only_variant
            else 0
        )

        app = {
            "id": aid,
            "effectiveRecordId": effective["Application ID"],
            "primary": effective_primary,
            "primaryUnicode": effective["Primary String Unicode Label"].strip(),
            "originalPrimary": norm(original["Primary String"]),
            "originalPrimaryUnicode": original["Primary String Unicode Label"].strip(),
            "applicant": effective["Applicant Name"].strip(),
            "location": effective["Location"],
            "region": effective["Region"],
            "type": effective["Application Type"],
            "status": effective["Application Status"],
            "stage": effective["Application Processing Stage"],
            "types": [key.replace("TLD Type: ", "") for key in TYPES if effective[key] == "TRUE"],
            "flags": flags(effective),
            "variants": [],
            "variantOnlyExistingTld": only_variant,
            "proceeding": effective_is_proceeding,
            "selectedReplacement": is_selected,
            "primarySameStringCount": exact_count,
            "exactPrimaryGroup": (
                effective_primary
                if effective_is_proceeding and not only_variant and exact_count > 1
                else None
            ),
            "original": {
                "id": aid,
                "string": norm(original["Primary String"]),
                "unicode": original["Primary String Unicode Label"].strip(),
                "type": original["Application Type"],
                "status": original["Application Status"],
                "stage": original["Application Processing Stage"],
                "detailUrl": public_link(aid),
            },
            "replacement": None,
            "detailUrl": public_link(aid),
        }
        if effective["Application ID"] in changes_by_record:
            change = changes_by_record[effective["Application ID"]]
            app["observedStatusChange"] = {
                "previousStatus": change["previousStatus"],
                "currentStatus": change["currentStatus"],
                "previousObservedAtUTC": frozen_provenance["retrievedAtUTC"],
                "currentObservedAtUTC": provenance["retrievedAtUTC"],
            }

        original_variants = variants(original["TLD Variants"])
        for variant in original_variants:
            app["variants"].append({**variant, "recordId": aid})
        edge(
            aid,
            aid,
            original["Primary String"],
            original["Primary String Unicode Label"],
            "variant-existing-tld-primary"
            if original["Application Type"] == "Existing gTLD with Variants"
            else "primary",
            original["Application Status"],
        )
        for variant in original_variants:
            edge(aid, aid, variant["ascii"], variant["unicode"], "variant", original["Application Status"])

        if alternative:
            rid = alternative["Application ID"]
            app["replacement"] = {
                "id": rid,
                "string": norm(alternative["Primary String"]),
                "unicode": alternative["Primary String Unicode Label"].strip(),
                "type": alternative["Application Type"],
                "status": alternative["Application Status"],
                "stage": alternative["Application Processing Stage"],
                "flags": flags(alternative),
                "selected": is_selected,
                "detailUrl": public_link(rid),
            }
            edge(
                aid,
                rid,
                alternative["Primary String"],
                alternative["Primary String Unicode Label"],
                "replacement-selected" if is_selected else "replacement",
                alternative["Application Status"],
            )
            for variant in variants(alternative["TLD Variants"]):
                app["variants"].append({**variant, "recordId": rid})
                edge(aid, rid, variant["ascii"], variant["unicode"], "variant", alternative["Application Status"])

        apps.append(app)

    variant_edges = sum(item["relationship"] == "variant" for item in edges)
    if (
        variant_edges != 13
        or len(edges) != 1614 + 1169 + 13
        or sum(item["variantOnlyExistingTld"] for item in apps) != 6
    ):
        raise ValueError("APS variant and relational-edge census changed")
    if len({app["id"] for app in apps}) != 1614 or sum(bool(app["replacement"]) for app in apps) != 1169:
        raise ValueError("Orphan or duplicate application-relationship graph")

    counts = {
        "apsStatisticsTotalApplications": provenance["officialStatisticsTotalApplications"],
        "apsStatisticsActiveApplications": provenance["officialStatisticsActiveApplications"],
        "apsStatisticsWithdrawnApplications": provenance["officialStatisticsWithdrawnApplications"],
        "officialAnnouncementProceedingApplications": provenance["officialAnnouncementProceedingApplications"],
        "officialPublishedApplications": 1614,
        "visibleProceedingApplications": len(proceeding),
        "visibleWithdrawnApplications": sum(app["status"] == "Withdrawn" for app in apps),
        "officialListingRows": 2783,
        "replacementRecords": 1169,
        "selectedReplacementRecords": len(selected),
        "replacementActive": sum(row["Application Status"] == "Active" for row in alternatives.values()),
        "replacementDeactivated": sum(row["Application Status"] == "Deactivated" for row in alternatives.values()),
        "replacementWithdrawn": sum(row["Application Status"] == "Withdrawn" for row in alternatives.values()),
        "proceedingNewPrimaryApplications": sum(
            row["Application Type"] != "Existing gTLD with Variants" for row in proceeding.values()
        ),
        "newPrimaryStrings": len(primary),
        "variantOnlyExistingTldApplications": 6,
        "variantRelationships": variant_edges,
        "derivedExactPrimaryMatchGroups": len(exact),
        "applicationsInExactPrimaryMatches": sum(map(len, exact.values())),
        "officialConfirmedContentionSets": len(official_exact),
        "officialConfirmedContentionApplications": len(official_contention_rows),
        "officialAnnouncementApplicationsInContention": provenance["officialAnnouncementApplicationsInContention"],
        "knownAdministrativeCheckApplications": 1,
        "statisticsVsPublicProceedingGap": provenance["officialStatisticsActiveApplications"] - len(proceeding),
        "unresolvedAnnouncementPublicationGap": provenance["unresolvedAnnouncementPublicationGap"],
        "statusChangesSinceStringConfirmation": len(status_changes),
    }
    if counts["proceedingNewPrimaryApplications"] != provenance["visibleProceedingNewPrimaryApplications"]:
        raise ValueError("Current proceeding new-primary application census changed")
    if counts["visibleWithdrawnApplications"] != provenance["officialStatisticsWithdrawnApplications"]:
        raise ValueError("Current withdrawn application count does not reconcile with statistics")

    event = maintain_events(rows, provenance, source_sha, frozen_rows, frozen_provenance)

    historical_announcement = {
        "sourceURL": provenance["officialAnnouncementReference"],
        "snapshotOn": provenance["officialAnnouncementSnapshotOn"],
        "correctionObservedOn": provenance["officialAnnouncementCorrectionObservedOn"],
        "proceedingApplications": provenance["officialAnnouncementProceedingApplications"],
        "applicationsInContention": provenance["officialAnnouncementApplicationsInContention"],
        "publicListingObservedAtUTC": frozen_provenance["retrievedAtUTC"],
        "publicProceedingApplications": len(frozen_proceeding),
        "knownAdministrativeCheckApplications": 1,
        "residualAggregateDifference": 0,
        "scope": provenance["announcementGapScope"],
    }
    inputs = {
        str(path.relative_to(ROOT)): {"sha256": digest(path.read_bytes()), "bytes": path.stat().st_size}
        for path in (SOURCE, PROV, BASELINE, BASELINE_PROV, CONFIRMED_CONTENTION)
    }

    graph = {
        "schemaVersion": 2,
        "snapshotState": "post-string-confirmation",
        "scope": "current-public-APS-listing-with-stable-base-application-family-identity",
        "sourceURL": provenance["sourcePage"],
        "officialCSVURL": provenance["sourceExportURL"],
        "sourceCSVFile": str(SOURCE.relative_to(ROOT)),
        "sourceProvenanceFile": str(PROV.relative_to(ROOT)),
        "sourceSHA256": source_sha,
        "retrievedAtUTC": provenance["retrievedAtUTC"],
        "statisticsPublishedAtUTC": provenance["sourceStatisticsLastPublished"],
        "counts": counts,
        "notPublishedApplication": {
            "id": pending_id,
            "status": "administrative-check",
            "detailUrl": public_link(pending_id),
        },
        "aggregateGap": {
            "classification": "same-snapshot-current-APS-statistics-reconciliation",
            "officialStatisticsActiveApplications": provenance["officialStatisticsActiveApplications"],
            "visibleProceedingApplications": len(proceeding),
            "knownAdministrativeCheckApplications": 1,
            "residualAggregateDifference": provenance["officialStatisticsActiveApplications"] - len(proceeding) - 1,
            "note": "The current public listing and APS Statistics reconcile after accounting for the separately disclosed .wdo application. Historical announcement figures are compared only with the dated String Confirmation evidence.",
        },
        "historicalAnnouncement": historical_announcement,
        "changesSinceStringConfirmation": {
            "previousObservedAtUTC": frozen_provenance["retrievedAtUTC"],
            "previousSourceSHA256": frozen_provenance["normalizedCSVSHA256"],
            "currentObservedAtUTC": provenance["retrievedAtUTC"],
            "currentSourceSHA256": source_sha,
            "statusChanges": status_changes,
            "limitation": "Changes are observed between the two source captures; exact event times and causes are not established.",
        },
        "contention": {
            "classification": "project-derived-current-exact-primary-string-overlaps",
            "officialRevealListURL": "https://newgtldprogram.icann.org/en/application-rounds/round2/reveal-day-contention-sets.csv",
            "officialConfirmedListURL": "https://newgtldprogram.icann.org/en/application-rounds/round2/string-confirmation-contention-sets.csv",
            "officialConfirmedSnapshotOn": provenance["publicConfirmedContentionSnapshotOn"],
            "officialConfirmedFile": str(CONFIRMED_CONTENTION.relative_to(ROOT)),
            "officialConfirmedSHA256": digest(CONFIRMED_CONTENTION.read_bytes()),
            "publicConfirmedSets": 226,
            "publicConfirmedApplications": 705,
            "currentDerivedSets": len(exact),
            "currentDerivedApplications": sum(map(len, exact.values())),
            "currentDerivedObservedAtUTC": provenance["retrievedAtUTC"],
            "currentDerivedSourceSHA256": source_sha,
            "currentDerivedBasis": provenance["contentionBasis"],
            "officialAnnouncementApplications": provenance["officialAnnouncementApplicationsInContention"],
            "unresolvedAnnouncementPublicationGap": 0,
            "APSInContentionFalseIsNotAuthoritativeBeforeStringEvaluation": True,
        },
        "coverage": {
            "APSListing": True,
            "applicationSummaryPages": "linked-only",
            "questionnairePDFsDownloaded": False,
            "questionnaireFullTextVendored": False,
            "confidentialPortions": "not included",
            "recordHistory": "source-dated observed statuses only; a promoted replacement remains the effective record after withdrawal; earlier observations are preserved",
        },
        "apps": apps,
    }

    write(GRAPH, json.dumps(graph, ensure_ascii=False, indent=2) + "\n")
    write(
        BROWSER,
        "/* generated: dated public ICANN APS follow-up; current overlaps are project-derived */\n"
        + "window.CTD_APS_2026="
        + json.dumps(graph, ensure_ascii=False, separators=(",", ":"))
        + ";\n",
    )

    edges.sort(key=lambda item: (item["application_id"], item["relationship"], item["string_ascii"]))
    write(EDGES, csv_document(edges, EDGE_COLS))

    report = {
        "schemaVersion": 2,
        "snapshotState": "post-string-confirmation",
        "sourceSha256": source_sha,
        "sourceURL": provenance["sourceExportURL"],
        "retrievedAtUTC": provenance["retrievedAtUTC"],
        "counts": counts,
        "inputFiles": inputs,
        "historicalAnnouncement": historical_announcement,
        "contention": graph["contention"],
        "eventHistory": {
            "events": event["events"],
            "sourceSnapshots": event["sourceSnapshots"],
        },
        "files": {
            path.name: {"sha256": digest(path.read_bytes()), "bytes": path.stat().st_size}
            for path in (GRAPH, BROWSER, EDGES, HISTORY)
        },
        "limitations": [
            "The public APS listing still excludes WDO2627T-T45217 while its administrative check continues.",
            "Current APS counts are dated to 22 November 2026. The corrected historical announcement is reconciled separately with the String Confirmation sources, not compared with later withdrawal totals.",
            "The official String Confirmation contention CSV remains frozen at 226 sets / 705 application rows. Current exact-primary overlaps are project-derived from visible Active records and are not a new official contention determination.",
            "A -R record is linked to a stable base Application ID; a selected replacement remains the effective string if its status subsequently becomes Withdrawn.",
            "13 variant links are string relationships, not additional applications.",
            "Application detail/response/documents pages are linked at their official APS routes but not mirrored in full.",
            "The observation log is append-only by source digest.",
            "Observed status changes do not establish their exact event dates, reasons or private arrangements.",
        ],
    }
    write(REPORT, json.dumps(report, ensure_ascii=False, indent=2) + "\n")

    print(
        "APS_CURRENT_GRAPH_VERIFIED "
        + json.dumps(
            {
                "apps": len(apps),
                "proceeding": len(proceeding),
                "selectedReplacements": len(selected),
                "effectiveNewPrimaryStrings": len(primary),
                "contentionSets": len(exact),
                "contentionApplications": sum(map(len, exact.values())),
                "observations": event["events"],
            },
            sort_keys=True,
        )
    )
    return counts


if __name__ == "__main__":
    build()
