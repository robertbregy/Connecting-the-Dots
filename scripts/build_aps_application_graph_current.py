#!/usr/bin/env python3
"""Build the current ICANN 2026 APS application graph at String Confirmation Day.

This builder is intentionally separate from build_aps_application_graph.py,
which preserves the Reveal Day analytical baseline. One base Application ID is
one application family. A terminal -R record is a related replacement record.
For a selected replacement, the application family's effective string/status is
read from the active -R record while the base ID remains the stable identity.
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
SOURCE = D / "applications_2026_aps_string_confirmation_20261117.csv"
PROV = D / "applications_2026_aps_string_confirmation_20261117_provenance.json"
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
    return bool(
        alternative
        and original["Application Status"] == "Deactivated"
        and alternative["Application Status"] == "Active"
        and alternative["Application Type"] in ("New gTLD", "New gTLD with Variants")
    )


def effective_record(original, alternative):
    return alternative if selected_replacement(original, alternative) else original


def maintain_events(rows, provenance, source_sha):
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

    all_events = sorted(
        older + additional,
        key=lambda item: (item["observed_utc"], item["application_id"], item["aps_record_id"]),
    )
    write(HISTORY, csv_document(all_events, EVENT_COLS))
    return {
        "events": len(all_events),
        "added": len(additional),
        "sourceSnapshots": len({item["source_sha256"] for item in all_events}),
    }


def official_contention_groups():
    with CONFIRMED_CONTENTION.open(encoding="utf-8-sig", newline="") as stream:
        rows = list(csv.DictReader(stream))
    groups = defaultdict(list)
    for row in rows:
        groups[norm(row["Applied-for string(s)"])].append(row["Application ID"])
    return {key: sorted(value) for key, value in groups.items()}, rows


def build():
    provenance = json.loads(PROV.read_text(encoding="utf-8"))
    raw = SOURCE.read_bytes()
    source_sha = digest(raw)
    if source_sha != provenance["normalizedCSVSHA256"]:
        raise ValueError("Pinned String Confirmation APS digest did not match source")

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
    if len(selected) != provenance["selectedReplacementRecords"] != 152:
        raise ValueError("Selected replacement count differs from verified String Confirmation evidence")

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
    official_exact, official_contention_rows = official_contention_groups()

    if len(proceeding) != 1605:
        raise ValueError("Public proceeding application-family count changed")
    if len(primary) != 1120:
        raise ValueError("Effective public new-primary string count changed")
    if len(exact) != 226 or sum(map(len, exact.values())) != 705:
        raise ValueError("Effective exact-string contention census changed")
    if exact != official_exact or len(official_contention_rows) != 705:
        raise ValueError("Derived effective exact-string groups do not match official String Confirmation contention CSV")

    observed_status_counts = dict(sorted(Counter(row["Application Status"] for row in rows).items()))
    if observed_status_counts != provenance["statusCounts"]:
        raise ValueError("APS published status counts changed")

    edges = []
    apps = []

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
        "officialAnnouncementProceedingApplications": provenance["officialAnnouncementProceedingApplications"],
        "officialPublishedApplications": 1614,
        "visibleProceedingApplications": 1605,
        "officialListingRows": 2783,
        "replacementRecords": 1169,
        "selectedReplacementRecords": len(selected),
        "replacementActive": sum(row["Application Status"] == "Active" for row in alternatives.values()),
        "replacementDeactivated": sum(row["Application Status"] == "Deactivated" for row in alternatives.values()),
        "proceedingNewPrimaryApplications": sum(
            row["Application Type"] != "Existing gTLD with Variants" for row in proceeding.values()
        ),
        "newPrimaryStrings": len(primary),
        "variantOnlyExistingTldApplications": 6,
        "variantRelationships": variant_edges,
        "derivedExactPrimaryMatchGroups": len(exact),
        "applicationsInExactPrimaryMatches": sum(map(len, exact.values())),
        "officialAnnouncementApplicationsInContention": provenance["officialAnnouncementApplicationsInContention"],
        "knownAdministrativeCheckApplications": 1,
        "announcementVsPublicProceedingGap": provenance["officialAnnouncementProceedingApplications"] - len(proceeding),
        "unresolvedAnnouncementPublicationGap": provenance["unresolvedAnnouncementPublicationGap"],
    }

    event = maintain_events(rows, provenance, source_sha)

    graph = {
        "schemaVersion": 2,
        "snapshotState": "string-confirmation",
        "scope": "current-public-APS-listing-with-stable-base-application-family-identity",
        "sourceURL": provenance["sourcePage"],
        "officialCSVURL": provenance["sourceExportURL"],
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
            "officialAnnouncementProceedingApplications": provenance["officialAnnouncementProceedingApplications"],
            "visibleProceedingApplications": len(proceeding),
            "knownAdministrativeCheckApplications": 1,
            "unresolvedResidualApplications": provenance["unresolvedAnnouncementPublicationGap"],
            "note": "ICANN's 17 November announcement aggregates exceed the reconciled public APS/contention files by four applications after accounting separately for .wdo.",
        },
        "contention": {
            "classification": "official-public-string-confirmation-identical-string-contention",
            "officialRevealListURL": "https://newgtldprogram.icann.org/en/application-rounds/round2/reveal-day-contention-sets.csv",
            "officialCurrentListURL": "https://newgtldprogram.icann.org/en/application-rounds/round2/string-confirmation-contention-sets.csv",
            "publicConfirmedSets": 226,
            "publicConfirmedApplications": 705,
            "officialAnnouncementApplications": provenance["officialAnnouncementApplicationsInContention"],
            "unresolvedAnnouncementPublicationGap": 4,
            "APSInContentionFalseIsNotAuthoritativeBeforeStringEvaluation": True,
        },
        "coverage": {
            "APSListing": True,
            "applicationSummaryPages": "linked-only",
            "questionnairePDFsDownloaded": False,
            "questionnaireFullTextVendored": False,
            "confidentialPortions": "not included",
            "recordHistory": "source-dated observed statuses only; selected replacement is derived from paired public record status/type transitions",
        },
        "apps": apps,
    }

    write(GRAPH, json.dumps(graph, ensure_ascii=False, indent=2) + "\n")
    write(
        BROWSER,
        "/* generated: public official ICANN APS String Confirmation snapshot */\n"
        + "window.CTD_APS_2026="
        + json.dumps(graph, ensure_ascii=False, separators=(",", ":"))
        + ";\n",
    )

    edges.sort(key=lambda item: (item["application_id"], item["relationship"], item["string_ascii"]))
    write(EDGES, csv_document(edges, EDGE_COLS))

    report = {
        "schemaVersion": 2,
        "snapshotState": "string-confirmation",
        "sourceSha256": source_sha,
        "sourceURL": provenance["sourceExportURL"],
        "retrievedAtUTC": provenance["retrievedAtUTC"],
        "counts": counts,
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
            "The 17 November ICANN announcement reports 1,610 proceeding applications, while the public APS export yields 1,605 proceeding families; .wdo explains one and four remain an unresolved publication/aggregate gap.",
            "The public String Confirmation contention CSV contains 226 sets / 705 application rows, while the announcement reports 226 / 709.",
            "A -R record is a replacement record linked to a stable base Application ID; selected replacements are represented as the application family's effective current string.",
            "13 variant links are string relationships, not additional applications.",
            "Application detail/response/documents pages are linked at their official APS routes but not mirrored in full.",
            "The observation log is append-only by source digest.",
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
