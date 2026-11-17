#!/usr/bin/env python3
"""Prepare the v0.8.0 String Confirmation Day candidate.

This is a deterministic source migration. It preserves the Reveal Day APS
listing and RR1/RR2, adds the 17 November public snapshot as a separate layer,
moves the current Application Atlas to effective confirmed strings, and records
the unresolved ICANN aggregate/publication discrepancy without inventing the
four missing application identities.
"""
from __future__ import annotations

import csv
import hashlib
import json
import os
import re
import shutil
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
VERSION = "0.8.0"
DATE = "2026-11-17"
CURRENT_CSV = "applications_2026_aps_string_confirmation_20261117.csv"
CURRENT_PROV = "applications_2026_aps_string_confirmation_20261117_provenance.json"
EVIDENCE = DATA / "evidence/string-confirmation-2026-11-17/live"
SOURCE_COMMIT = os.environ.get("SOURCE_COMMIT", "").strip() or "prep/string-confirmation-2026-11-17"


def load(path):
    return json.loads((ROOT / path).read_text(encoding="utf-8-sig"))


def dump(path, obj):
    p = ROOT / path
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def text(path):
    return (ROOT / path).read_text(encoding="utf-8")


def write(path, value):
    p = ROOT / path
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(value, encoding="utf-8", newline="\n")


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def replace_once(path, old, new):
    value = text(path)
    if old not in value:
        if new in value:
            return
        raise ValueError(f"Expected patch anchor missing in {path}: {old[:120]!r}")
    if value.count(old) != 1:
        raise ValueError(f"Patch anchor not unique in {path}: {old[:120]!r}")
    write(path, value.replace(old, new, 1))


# ---------------------------------------------------------------------------
# 1. Preserve Reveal Day and add a distinct String Confirmation source.
# ---------------------------------------------------------------------------
source = EVIDENCE / "aps-export-normalized.csv"
raw_source = EVIDENCE / "aps-export-raw.csv"
if not source.exists() or not raw_source.exists():
    raise FileNotFoundError("String Confirmation evidence capture is missing")
target = DATA / CURRENT_CSV
shutil.copyfile(source, target)

old_prov = load("data/applications_2026_aps_official_provenance.json")
with target.open(encoding="utf-8-sig", newline="") as stream:
    reader = csv.DictReader(stream)
    columns = reader.fieldnames
    rows = list(reader)
if columns != old_prov["csvColumns"]:
    raise ValueError("String Confirmation APS schema differs from Reveal Day schema")
if len(rows) != 2783 or len({r["Application ID"] for r in rows}) != 2783:
    raise ValueError("String Confirmation APS record identity changed unexpectedly")

base = [r for r in rows if not r["Application ID"].endswith("-R")]
replacement = [r for r in rows if r["Application ID"].endswith("-R")]
if len(base) != 1614 or len(replacement) != 1169:
    raise ValueError("String Confirmation APS 1614/1169 structure changed")

status_counts = dict(sorted(Counter(r["Application Status"] for r in rows).items()))
type_counts = dict(sorted(Counter(r["Application Type"] for r in rows).items()))
if status_counts != {"Active": 1605, "Deactivated": 1169, "Withdrawn": 9}:
    raise ValueError("Unexpected String Confirmation status counts")

current_prov = {
    "schemaVersion": 2,
    "title": "ICANN New gTLD Program 2026 Round / APS public applications export / String Confirmation observation",
    "snapshotState": "string-confirmation",
    "sourceAuthority": "ICANN Application Publication and Statistics (APS)",
    "sourcePage": old_prov["sourcePage"],
    "sourceExportURL": old_prov["sourceExportURL"],
    "officialStatisticsReference": old_prov["officialStatisticsReference"],
    "officialAnnouncementReference": "https://www.icann.org/en/announcements/details/icann-confirms-2026-round-applications-input-and-objections-period-begins-17-11-2026-en",
    "officialContentionReference": "https://newgtldprogram.icann.org/en/application-rounds/round2/string-confirmation-contention-sets.csv",
    "sourceStatisticsLastPublished": "2026-11-17T18:09:00Z",
    "retrievedAtUTC": "2026-11-17T18:30:10Z",
    "sourceExportFileName": "aps-export-raw.csv",
    "officialRowsFile": CURRENT_CSV,
    "originalCSVBytes": raw_source.stat().st_size,
    "originalCSVSHA256": sha(raw_source),
    "normalizedCSVBytes": target.stat().st_size,
    "normalizedCSVSHA256": sha(target),
    "totalOfficialListingRows": 2783,
    "uniquePublishedApplicationRecords": 1614,
    "replacementStringRecords": 1169,
    "selectedReplacementRecords": 152,
    "officialStatisticsTotalApplications": 1615,
    "officialStatisticsActiveApplications": 1606,
    "officialStatisticsUniqueStrings": 1127,
    "officialAnnouncementProceedingApplications": 1610,
    "officialAnnouncementApplicationsInContention": 709,
    "publicConfirmedContentionSets": 226,
    "publicConfirmedContentionApplications": 705,
    "visibleProceedingApplicationFamilies": 1605,
    "unresolvedAnnouncementPublicationGap": 4,
    "pendingAdministrativeCheckApplicationID": "WDO2627T-T45217",
    "csvColumns": columns,
    "csvPreambleNotice": old_prov["csvPreambleNotice"],
    "statusCounts": status_counts,
    "applicationTypeCounts": type_counts,
    "coverage": "Complete downloadable public APS Applications listing as captured after String Confirmation Day; excludes the separately disclosed .wdo administrative-check application and does not reconcile four additional applications present only in ICANN announcement aggregates.",
    "licenseNote": old_prov["licenseNote"],
    "normalization": {
        "rules": old_prov["normalization"]["rules"],
        "rowIdentity": old_prov["normalization"]["rowIdentity"],
        "snapshotRule": "Reveal Day source remains immutable; this file is a separate 17 November 2026 observation.",
    },
}
dump(f"data/{CURRENT_PROV}", current_prov)

# ---------------------------------------------------------------------------
# 2. Current String Confirmation snapshot, separate from Reveal Day snapshot.
# ---------------------------------------------------------------------------
snapshot = {
    "schemaVersion": 1,
    "snapshot": "2026-11-17",
    "state": "string-confirmation",
    "capturedAtUTC": "2026-11-17T18:30:10Z",
    "officialAnnouncement": {
        "source": current_prov["officialAnnouncementReference"],
        "proceedingApplications": 1610,
        "withdrawalsSinceRevealDay": 9,
        "eligibleReplacementApplications": 287,
        "selectedReplacementApplications": 152,
        "contentionSets": 226,
        "applicationsInContention": 709,
        "applicantSupportApplications": 50,
        "regionApplications": {"AF": 16, "AP": 215, "EUR": 504, "LAC": 11, "NA": 864},
    },
    "apsStatistics": {
        "source": old_prov["officialStatisticsReference"],
        "lastPublished": "2026-11-17T18:09:00Z",
        "totalApplicants": 481,
        "totalApplications": 1615,
        "activeApplications": 1606,
        "withdrawnApplications": 9,
        "uniqueStrings": 1127,
        "variants": 9,
        "applicationsInContention": None,
        "contentionSets": None,
    },
    "publicAPS": {
        "source": current_prov["sourceExportURL"],
        "file": CURRENT_CSV,
        "provenance": CURRENT_PROV,
        "rows": 2783,
        "baseApplicationIDs": 1614,
        "replacementRows": 1169,
        "visibleProceedingApplicationFamilies": 1605,
        "selectedReplacementApplications": 152,
        "visibleProceedingNewPrimaryApplications": 1599,
        "visibleProceedingNewPrimaryStrings": 1120,
        "pendingAdministrativeCheckID": "WDO2627T-T45217",
    },
    "publicContention": {
        "revealFile": "evidence/string-confirmation-2026-11-17/live/reveal-day-contention-sets.csv",
        "confirmedFile": "evidence/string-confirmation-2026-11-17/live/string-confirmation-contention-sets.csv",
        "revealSets": 263,
        "revealApplicationRows": 891,
        "afterWithdrawalsSets": 262,
        "afterWithdrawalsApplicationRows": 881,
        "confirmedSets": 226,
        "confirmedApplicationRows": 705,
    },
    "reconciliation": {
        "knownAdministrativeCheckApplication": "WDO2627T-T45217",
        "announcementMinusVisibleProceeding": 5,
        "knownAdministrativeCheckAdjustment": 1,
        "unresolvedResidualApplications": 4,
        "constrainedCharacteristics": ["AP region", "Applicant Support", "contention membership"],
        "status": "unresolved aggregate/publication discrepancy; identities and administrative cause not publicly established",
        "detail": "docs/string-confirmation-day-2026-11-17-first-findings.md",
    },
    "lugano": {
        "applicationID": "CDL2651T-T31516",
        "status": "Active",
        "processingStage": "String Evaluation Processing",
        "inContention": False,
        "openCommentPeriod": True,
    },
}
dump("data/application_2026_string_confirmation_snapshot.json", snapshot)

# ---------------------------------------------------------------------------
# 3. Round-level table: preserve Reveal Day rows and append current evidence.
# ---------------------------------------------------------------------------
round_path = DATA / "round_2026.csv"
with round_path.open(encoding="utf-8-sig", newline="") as stream:
    rd = csv.DictReader(stream)
    round_rows = list(rd)
    fieldnames = rd.fieldnames
new_metrics = [
    {
        "metric": "Applications proceeding — String Confirmation Day announcement",
        "value": "1610",
        "status": "official 17 Nov announcement aggregate",
        "source": current_prov["officialAnnouncementReference"],
        "note": "Does not reconcile to the public APS export at application level; see the separate four-application aggregate/publication gap.",
    },
    {
        "metric": "Applications active — APS Statistics 17 Nov",
        "value": "1606",
        "status": "official APS statistic",
        "source": old_prov["officialStatisticsReference"],
        "note": "APS Statistics was last published 17 Nov 2026 at 18:09 UTC and differs by four from the same-day ICANN proceeding-applications announcement.",
    },
    {
        "metric": "Visible proceeding application families — public APS export",
        "value": "1605",
        "status": "derived from official public APS export",
        "source": current_prov["sourceExportURL"],
        "note": "One stable base Application ID per family; selected replacement is the effective record; withdrawn families excluded. .wdo remains absent under administrative check.",
    },
    {
        "metric": "Selected replacement strings",
        "value": "152",
        "status": "official announcement and verified APS transition",
        "source": current_prov["officialAnnouncementReference"],
        "note": "Original record Deactivated; selected -R record Active and promoted to New gTLD/New gTLD with Variants.",
    },
    {
        "metric": "Eligible replacement applications",
        "value": "287",
        "status": "official 17 Nov announcement aggregate",
        "source": current_prov["officialAnnouncementReference"],
        "note": "The earlier 442 Active replacement-record count is not equivalent to final Replacement Period eligibility.",
    },
    {
        "metric": "Confirmed public contention sets",
        "value": "226",
        "status": "official String Confirmation contention CSV",
        "source": current_prov["officialContentionReference"],
        "note": "Public file contains 226 sets.",
    },
    {
        "metric": "Applications in confirmed public contention sets",
        "value": "705",
        "status": "derived from official String Confirmation contention CSV",
        "source": current_prov["officialContentionReference"],
        "note": "The same-day ICANN announcement reports 709; the four-application gap is preserved as unresolved.",
    },
    {
        "metric": "Applications in contention — ICANN announcement",
        "value": "709",
        "status": "official 17 Nov announcement aggregate",
        "source": current_prov["officialAnnouncementReference"],
        "note": "Four more than the 705 rows in the official public String Confirmation contention CSV.",
    },
    {
        "metric": "Unique strings — APS Statistics 17 Nov",
        "value": "1127",
        "status": "official APS statistic",
        "source": old_prov["officialStatisticsReference"],
        "note": "Includes the statistical application universe used by APS; not interchangeable with the 1,120 visible proceeding new-primary strings after excluding six existing-TLD variant-only applications.",
    },
]
existing = {row["metric"] for row in round_rows}
round_rows.extend(row for row in new_metrics if row["metric"] not in existing)
with round_path.open("w", encoding="utf-8", newline="") as stream:
    wr = csv.DictWriter(stream, fieldnames=fieldnames, lineterminator="\n")
    wr.writeheader()
    wr.writerows(round_rows)

# ---------------------------------------------------------------------------
# 4. Inside the Round: the scheduled milestone is now observed/current.
# ---------------------------------------------------------------------------
timeline = load("data/inside_the_round_events.json")
timeline["lastReviewed"] = DATE
confirmation = next(item for item in timeline["events"] if item["id"] == "confirmation")
confirmation.update({
    "state": "observed",
    "scope": "program-and-case",
    "bodyKey": "insideConfirmObservedBody",
    "source": current_prov["officialAnnouncementReference"],
})
if not any(item.get("date") == DATE for item in confirmation.get("revisionHistory", [])):
    confirmation.setdefault("revisionHistory", []).append({
        "date": DATE,
        "previousBodyKey": "insideConfirmPublicScheduleBody",
        "bodyKey": "insideConfirmObservedBody",
        "reason": "String Confirmation Day occurred; replacement choices, updated contention and the .lugano processing stage are now publicly observable.",
        "sources": [
            current_prov["officialAnnouncementReference"],
            current_prov["sourcePage"],
            current_prov["officialContentionReference"],
        ],
    })
community = next(item for item in timeline["events"] if item["id"] == "community-input")
community.update({
    "state": "current",
    "bodyKey": "insideInputObservedBody",
    "source": current_prov["officialAnnouncementReference"],
})
dump("data/inside_the_round_events.json", timeline)

# ---------------------------------------------------------------------------
# 5. Field Note: revise the count story without rewriting the Reveal observation.
# ---------------------------------------------------------------------------
stories = load("data/behind_round_stories.json")
stories["lastReviewed"] = DATE
counts_case = next(item for item in stories["episodes"] if item["id"] == "reveal-day-counts")
counts_case["revisedOn"] = DATE
new_sources = [
    {
        "id": "icann-scd-announcement",
        "kind": "primary",
        "labelKey": "field17SourceAnnouncement",
        "url": current_prov["officialAnnouncementReference"],
    },
    {
        "id": "icann-scd-contention",
        "kind": "primary",
        "labelKey": "field17SourceContention",
        "url": current_prov["officialContentionReference"],
    },
    {
        "id": "aps-scd-export",
        "kind": "primary",
        "labelKey": "field17SourceCurrentAPS",
        "url": current_prov["sourceExportURL"],
    },
    {
        "id": "project-scd-reconciliation",
        "kind": "derived",
        "labelKey": "field17SourceReconciliation",
        "url": "https://github.com/robertbregy/Connecting-the-Dots/blob/prep/string-confirmation-2026-11-17/data/evidence/string-confirmation-2026-11-17/live/contention-reconciliation.json",
    },
]
source_ids = {item["id"] for item in counts_case["sources"]}
counts_case["sources"].extend(item for item in new_sources if item["id"] not in source_ids)
update_id = "string-confirmation-reconciliation"
if update_id not in {item["id"] for item in counts_case.get("editorialUpdates", [])}:
    counts_case.setdefault("editorialUpdates", []).append({
        "id": update_id,
        "date": DATE,
        "reviewLabelKey": "field17ReviewLabel",
        "titleKey": "field17ConfirmTitle",
        "paragraphKeys": [
            "field17ConfirmBody1",
            "field17ConfirmBody2",
            "field17ConfirmBody3",
        ],
        "sourceIds": [
            "icann-scd-announcement",
            "icann-scd-contention",
            "aps-scd-export",
            "project-scd-reconciliation",
            "icann-aps-stats",
            "icann-aps-wdo",
        ],
    })
if not any(item.get("changeKey") == "behindRevisionStringConfirmation" for item in counts_case["revisionHistory"]):
    counts_case["revisionHistory"].append({
        "date": DATE,
        "changeKey": "behindRevisionStringConfirmation",
        "sourceIds": [
            "icann-scd-announcement",
            "icann-scd-contention",
            "aps-scd-export",
            "project-scd-reconciliation",
            "icann-aps-stats",
            "icann-aps-wdo",
        ],
    })
counts_case["updateTriggers"] = [
    "ICANN publishes a specific explanation for the 22 September 1,616 to 7 October 1,615 change",
    "ICANN changes the WDO application administrative-check status or APS visibility",
    "ICANN reconciles the four-application difference between its 17 November announcement aggregates and the public APS/contention files",
    "The missing four application identities become publicly verifiable in APS, TAMS or another authoritative ICANN publication",
]
dump("data/behind_round_stories.json", stories)

# ---------------------------------------------------------------------------
# 5b. Replacement Strings investigation: preserve the Reveal observation and
# add the verified String Confirmation outcome as a dated editorial layer.
# ---------------------------------------------------------------------------
investigations = load("data/field_investigations.json")
investigations["lastReviewed"] = DATE
replacement_case = next(item for item in investigations["episodes"] if item["id"] == "replacement-strings")
replacement_case["revisedOn"] = DATE
replacement_sources = [
    {
        "id": "rs-scd-announcement",
        "url": current_prov["officialAnnouncementReference"],
        "kind": "primary",
        "labelKey": "field17ReplacementSourceAnnouncement",
    },
    {
        "id": "rs-scd-current-aps",
        "url": current_prov["sourceExportURL"],
        "kind": "primary",
        "labelKey": "field17ReplacementSourceAPS",
    },
    {
        "id": "rs-scd-contention",
        "url": current_prov["officialContentionReference"],
        "kind": "primary",
        "labelKey": "field17ReplacementSourceContention",
    },
    {
        "id": "rs-scd-reconciliation",
        "url": "https://github.com/robertbregy/Connecting-the-Dots/blob/prep/string-confirmation-2026-11-17/data/evidence/string-confirmation-2026-11-17/official-announcement-observation.json",
        "kind": "derived",
        "labelKey": "field17ReplacementSourceReconciliation",
    },
]
replacement_source_ids = {item["id"] for item in replacement_case["sources"]}
replacement_case["sources"].extend(item for item in replacement_sources if item["id"] not in replacement_source_ids)
replacement_update_id = "string-confirmation-replacement-outcome"
if replacement_update_id not in {item["id"] for item in replacement_case.get("editorialUpdates", [])}:
    replacement_case.setdefault("editorialUpdates", []).append({
        "id": replacement_update_id,
        "date": DATE,
        "reviewLabelKey": "field17ReviewLabel",
        "titleKey": "field17ReplacementTitle",
        "paragraphKeys": [
            "field17ReplacementBody1",
            "field17ReplacementBody2",
            "field17ReplacementBody3",
        ],
        "closingKey": "field17ReplacementBoundary",
        "sourceIds": [
            "rs-scd-announcement",
            "rs-scd-current-aps",
            "rs-scd-contention",
            "rs-scd-reconciliation",
        ],
    })
if not any(item.get("changeKey") == "field17ReplacementRevision" for item in replacement_case["revisionHistory"]):
    replacement_case["revisionHistory"].append({
        "date": DATE,
        "changeKey": "field17ReplacementRevision",
        "sourceIds": [
            "rs-scd-announcement",
            "rs-scd-current-aps",
            "rs-scd-contention",
            "rs-scd-reconciliation",
        ],
    })
replacement_case["updateTriggers"] = [
    "ICANN clarifies why 442 Reveal-period Active replacement records differed from the 287 applications ultimately eligible to switch.",
    "ICANN republishes or corrects the String Confirmation APS export, contention CSV or replacement totals.",
    "A later evaluation stage changes the status of an application whose selected replacement is recorded here.",
]
dump("data/field_investigations.json", investigations)

replace_once(
    "scripts/render_field_investigations.py",
    '        if (len(revisions) != (3 if index == 4 else 2 if index == 3 else 1)',
    '        if (len(revisions) != (4 if index == 4 else 2 if index == 3 else 1)',
)
replace_once(
    "scripts/render_field_investigations.py",
    '            if (revisions[0]["date"]!="2026-10-10" or revisions[1]["date"]!="2026-10-17" or\n                    revisions[2]["changeKey"]!="field18ReconciliationRevision"):',
    '            if (revisions[0]["date"]!="2026-10-10" or revisions[1]["date"]!="2026-10-17" or\n                    revisions[2]["changeKey"]!="field18ReconciliationRevision" or\n                    revisions[3]["changeKey"]!="field17ReplacementRevision" or revisions[3]["date"]!="2026-11-17"):',
)

# ---------------------------------------------------------------------------
# 6. i18n additions and current Atlas wording.
# ---------------------------------------------------------------------------
tr = load("data/translations.json")
copy = {
    "en": {
        "insideConfirmObservedBody": "String Confirmation Day confirmed 152 replacement selections. ICANN reported 1,610 applications proceeding, 226 contention sets and 709 applications in contention. The public APS and contention files expose a four-application reconciliation gap against those aggregates; this project records the discrepancy without inventing the missing identities.",
        "insideInputObservedBody": "The Community Input and Objections Period opened on 17 November 2026 and runs through 16 March 2027. The public comment, objection and related community-input surfaces are now part of the observed round rather than a future milestone.",
        "field17ReviewLabel": "Evidence review · 17 November 2026",
        "field17ConfirmTitle": "String Confirmation adds a second counting problem",
        "field17ConfirmBody1": "The public APS export confirms 152 selected replacements and nine withdrawals. The public contention sequence is 263/891 at Reveal Day, 262/881 after the withdrawals and the resulting .src singleton, then 226/705 after replacement choices.",
        "field17ConfirmBody2": "ICANN's 17 November announcement instead reports 262/885 before replacement and 226/709 after it. The four-application difference is constant across both contention states and also appears in the Applicant Support and Asia-Pacific aggregates.",
        "field17ConfirmBody3": "The public APS export yields 1,605 proceeding application families. The separately disclosed .wdo administrative-check application explains one of the five applications needed to reach the announcement's 1,610; four remain unresolved. Their identities and administrative cause are not inferred.",
        "field17SourceAnnouncement": "ICANN · String Confirmation announcement",
        "field17SourceContention": "ICANN · String Confirmation contention CSV",
        "field17SourceCurrentAPS": "ICANN APS · 17 November public export",
        "field17SourceReconciliation": "Project · reproducible 17 November reconciliation",
        "behindRevisionStringConfirmation": "17 November 2026 · String Confirmation evidence reconciliation",
        "apsAtlasIntro": "Application-level view of the ICANN 2026 public APS listing after String Confirmation Day. Selected replacements are treated as the effective current string while the stable base Application ID remains the family identity.",
        "apsAtlasApps": "published base Application IDs",
        "apsAtlasReplacements": "replacement records",
        "apsAtlasStrings": "visible proceeding new-primary strings",
        "apsAtlasOverlap": "confirmed public contention sets",
        "apsAtlasScope": "The Atlas contains all 1,614 public base Application IDs and 1,169 linked replacement records. It identifies 1,605 visible proceeding application families, including 152 selected replacements. Six existing-TLD variant-only applications are outside the 1,120 new-primary-string count.",
        "apsAtlasOverlapHint": "The effective public strings reproduce the official String Confirmation contention CSV exactly: 226 sets and 705 application rows. ICANN's same-day announcement reports 709 applications in contention; the four-application publication gap remains unresolved.",
        "apsAtlasWdo": ".wdo remains under administrative check and absent from the public listing. It explains one separately known missing application, not the further four-application gap in the 17 November announcement aggregates.",
        "apsAtlasPreliminaryList": "ICANN · String Confirmation contention CSV",
        "apsAtlasSelectedReplacement": "selected replacement",
        "apsAtlasBaseStatus": "current application status",
        "release0800": "String Confirmation Day: added a separate 17 November APS snapshot, 152 selected replacements, confirmed public contention data, the reproducible four-application reconciliation gap and the .lugano transition to String Evaluation without altering the frozen Reveal Day evidence or RR1/RR2.",
    },
    "it": {
        "insideConfirmObservedBody": "Lo String Confirmation Day ha confermato 152 scelte di replacement string. ICANN comunica 1.610 candidature che proseguono, 226 contention set e 709 candidature in contention. I file pubblici APS e contention mostrano però uno scarto di riconciliazione di quattro candidature rispetto a questi aggregati; il progetto documenta la discrepanza senza inventare le identità mancanti.",
        "insideInputObservedBody": "Il Community Input and Objections Period si è aperto il 17 novembre 2026 e prosegue fino al 16 marzo 2027. Commenti pubblici, obiezioni e gli altri canali di input della comunità fanno ora parte del round osservato, non più di una tappa futura.",
        "field17ReviewLabel": "Revisione delle evidenze · 17 novembre 2026",
        "field17ConfirmTitle": "Lo String Confirmation apre un secondo problema di conteggio",
        "field17ConfirmBody1": "L'export pubblico APS conferma 152 replacement selezionate e nove ritiri. La sequenza pubblica della contention è 263/891 al Reveal Day, 262/881 dopo i ritiri e il conseguente singleton .src, quindi 226/705 dopo le scelte di replacement.",
        "field17ConfirmBody2": "Il comunicato ICANN del 17 novembre indica invece 262/885 prima delle replacement e 226/709 dopo. Lo scarto di quattro candidature resta costante nei due stati della contention e riappare anche negli aggregati Applicant Support e Asia-Pacifico.",
        "field17ConfirmBody3": "L'export pubblico APS produce 1.605 application family che proseguono. La candidatura .wdo, separatamente dichiarata in administrative check, spiega una delle cinque unità necessarie per arrivare alle 1.610 del comunicato; quattro restano irrisolte. Identità e causa amministrativa non vengono inferite.",
        "field17SourceAnnouncement": "ICANN · comunicato String Confirmation",
        "field17SourceContention": "ICANN · CSV contention String Confirmation",
        "field17SourceCurrentAPS": "ICANN APS · export pubblico 17 novembre",
        "field17SourceReconciliation": "Progetto · riconciliazione riproducibile del 17 novembre",
        "behindRevisionStringConfirmation": "17 novembre 2026 · riconciliazione delle evidenze String Confirmation",
        "apsAtlasIntro": "Vista a livello di candidatura del listing pubblico ICANN APS 2026 dopo lo String Confirmation Day. Le replacement selezionate sono trattate come stringa corrente effettiva, mentre l'Application ID di base resta l'identità stabile della application family.",
        "apsAtlasApps": "Application ID di base pubblicati",
        "apsAtlasReplacements": "record replacement",
        "apsAtlasStrings": "nuove stringhe primarie visibili che proseguono",
        "apsAtlasOverlap": "contention set pubblici confermati",
        "apsAtlasScope": "L'Atlas contiene tutti i 1.614 Application ID di base pubblici e 1.169 record replacement collegati. Identifica 1.605 application family visibili che proseguono, incluse 152 replacement selezionate. Sei candidature variant-only di TLD esistenti restano fuori dal conteggio delle 1.120 nuove stringhe primarie.",
        "apsAtlasOverlapHint": "Le stringhe pubbliche effettive riproducono esattamente il CSV ufficiale di String Confirmation: 226 set e 705 righe di candidatura. Il comunicato ICANN dello stesso giorno indica 709 candidature in contention; lo scarto di quattro resta irrisolto.",
        "apsAtlasWdo": ".wdo resta in administrative check e assente dal listing pubblico. Spiega una candidatura mancante nota e separata, non l'ulteriore scarto di quattro candidature negli aggregati ICANN del 17 novembre.",
        "apsAtlasPreliminaryList": "ICANN · CSV contention String Confirmation",
        "apsAtlasSelectedReplacement": "replacement selezionata",
        "apsAtlasBaseStatus": "stato corrente della candidatura",
        "release0800": "String Confirmation Day: aggiunto uno snapshot APS separato del 17 novembre, 152 replacement selezionate, i dati pubblici confermati sulla contention, la riconciliazione riproducibile dello scarto di quattro candidature e il passaggio di .lugano alla String Evaluation, senza modificare le evidenze congelate del Reveal Day né RR1/RR2.",
    },
    "de": {
        "insideConfirmObservedBody": "Am String Confirmation Day wurden 152 ausgewählte Ersatzstrings bestätigt. ICANN meldet 1.610 fortgeführte Anträge, 226 Contention Sets und 709 Anträge in Contention. Die öffentlichen APS- und Contention-Dateien weisen gegenüber diesen Aggregaten jedoch eine nicht aufgelöste Differenz von vier Anträgen auf; das Projekt dokumentiert sie, ohne fehlende Identitäten zu erfinden.",
        "insideInputObservedBody": "Die Community Input and Objections Period begann am 17. November 2026 und läuft bis zum 16. März 2027. Öffentliche Kommentare, Einwände und die weiteren Community-Input-Verfahren sind damit beobachteter Teil der Runde und kein zukünftiger Meilenstein mehr.",
        "field17ReviewLabel": "Evidenzprüfung · 17. November 2026",
        "field17ConfirmTitle": "String Confirmation schafft ein zweites Zählproblem",
        "field17ConfirmBody1": "Der öffentliche APS-Export bestätigt 152 ausgewählte Ersatzstrings und neun Rückzüge. Die öffentliche Contention-Sequenz lautet 263/891 am Reveal Day, 262/881 nach den Rückzügen und dem daraus entstehenden .src-Singleton, anschließend 226/705 nach den Ersatzentscheidungen.",
        "field17ConfirmBody2": "ICANNs Mitteilung vom 17. November nennt dagegen 262/885 vor und 226/709 nach den Ersatzentscheidungen. Die Differenz von vier Anträgen bleibt in beiden Contention-Zuständen konstant und erscheint auch in den Aggregaten zu Applicant Support und Asien-Pazifik.",
        "field17ConfirmBody3": "Der öffentliche APS-Export ergibt 1.605 fortgeführte Antragsfamilien. Der separat ausgewiesene .wdo-Antrag im Administrative Check erklärt eine der fünf Einheiten bis zu den 1.610 der Mitteilung; vier bleiben ungeklärt. Identitäten und administrativer Grund werden nicht hergeleitet.",
        "field17SourceAnnouncement": "ICANN · String-Confirmation-Mitteilung",
        "field17SourceContention": "ICANN · String-Confirmation-Contention-CSV",
        "field17SourceCurrentAPS": "ICANN APS · öffentlicher Export 17. November",
        "field17SourceReconciliation": "Projekt · reproduzierbare Abstimmung vom 17. November",
        "behindRevisionStringConfirmation": "17. November 2026 · Abstimmung der String-Confirmation-Evidenz",
        "apsAtlasIntro": "Antragsansicht der öffentlichen ICANN-APS-Liste 2026 nach dem String Confirmation Day. Ausgewählte Ersatzstrings gelten als aktueller effektiver String; die Basis-Application-ID bleibt die stabile Identität der Antragsfamilie.",
        "apsAtlasApps": "veröffentlichte Basis-Application-IDs",
        "apsAtlasReplacements": "Ersatzstring-Datensätze",
        "apsAtlasStrings": "sichtbare fortgeführte neue Primärstrings",
        "apsAtlasOverlap": "bestätigte öffentliche Contention Sets",
        "apsAtlasScope": "Der Atlas enthält alle 1.614 öffentlichen Basis-Application-IDs und 1.169 verknüpften Ersatzdatensätze. Er identifiziert 1.605 sichtbare fortgeführte Antragsfamilien, darunter 152 ausgewählte Ersatzstrings. Sechs Variant-only-Anträge bestehender TLDs liegen außerhalb der 1.120 neuen Primärstrings.",
        "apsAtlasOverlapHint": "Die effektiven öffentlichen Strings reproduzieren das offizielle String-Confirmation-CSV exakt: 226 Sets und 705 Antragszeilen. ICANNs Mitteilung desselben Tages nennt 709 Anträge in Contention; die Differenz von vier bleibt ungeklärt.",
        "apsAtlasWdo": ".wdo bleibt im Administrative Check und fehlt in der öffentlichen Liste. Dies erklärt einen separat bekannten fehlenden Antrag, nicht die zusätzliche Differenz von vier Anträgen in ICANNs Aggregaten vom 17. November.",
        "apsAtlasPreliminaryList": "ICANN · String-Confirmation-Contention-CSV",
        "apsAtlasSelectedReplacement": "ausgewählter Ersatzstring",
        "apsAtlasBaseStatus": "aktueller Antragsstatus",
        "release0800": "String Confirmation Day: separater APS-Snapshot vom 17. November, 152 ausgewählte Ersatzstrings, bestätigte öffentliche Contention-Daten, reproduzierbare Vier-Anträge-Differenz und Übergang von .lugano zur String Evaluation; eingefrorene Reveal-Day-Evidenz sowie RR1/RR2 bleiben unverändert.",
    },
    "fr": {
        "insideConfirmObservedBody": "Le String Confirmation Day a confirmé 152 chaînes de remplacement sélectionnées. L'ICANN annonce 1 610 candidatures qui poursuivent le processus, 226 contention sets et 709 candidatures en contention. Les fichiers publics APS et de contention présentent toutefois un écart de rapprochement de quatre candidatures par rapport à ces agrégats ; le projet documente cet écart sans inventer les identités manquantes.",
        "insideInputObservedBody": "La période Community Input and Objections s'est ouverte le 17 novembre 2026 et se poursuit jusqu'au 16 mars 2027. Les commentaires publics, objections et autres mécanismes de contribution communautaire font désormais partie du round observé et non plus d'une étape future.",
        "field17ReviewLabel": "Revue des preuves · 17 novembre 2026",
        "field17ConfirmTitle": "String Confirmation crée un second problème de comptage",
        "field17ConfirmBody1": "L'export public APS confirme 152 remplacements sélectionnés et neuf retraits. La séquence publique de contention est de 263/891 au Reveal Day, 262/881 après les retraits et le singleton .src qui en résulte, puis 226/705 après les choix de remplacement.",
        "field17ConfirmBody2": "Le communiqué ICANN du 17 novembre indique au contraire 262/885 avant les remplacements et 226/709 après. L'écart de quatre candidatures reste constant dans les deux états de contention et apparaît également dans les agrégats Applicant Support et Asie-Pacifique.",
        "field17ConfirmBody3": "L'export public APS produit 1 605 familles de candidatures poursuivant le processus. La candidature .wdo, signalée séparément comme soumise à un contrôle administratif, explique une des cinq unités nécessaires pour atteindre les 1 610 du communiqué ; quatre restent non résolues. Leurs identités et la cause administrative ne sont pas déduites.",
        "field17SourceAnnouncement": "ICANN · communiqué String Confirmation",
        "field17SourceContention": "ICANN · CSV de contention String Confirmation",
        "field17SourceCurrentAPS": "ICANN APS · export public du 17 novembre",
        "field17SourceReconciliation": "Projet · rapprochement reproductible du 17 novembre",
        "behindRevisionStringConfirmation": "17 novembre 2026 · rapprochement des preuves String Confirmation",
        "apsAtlasIntro": "Vue au niveau des candidatures de la liste publique ICANN APS 2026 après le String Confirmation Day. Les remplacements sélectionnés sont traités comme chaîne effective actuelle, tandis que l'Application ID de base reste l'identité stable de la famille de candidature.",
        "apsAtlasApps": "Application ID de base publiés",
        "apsAtlasReplacements": "enregistrements de remplacement",
        "apsAtlasStrings": "nouvelles chaînes primaires visibles poursuivant le processus",
        "apsAtlasOverlap": "contention sets publics confirmés",
        "apsAtlasScope": "L'Atlas contient les 1 614 Application ID de base publics et 1 169 enregistrements de remplacement liés. Il identifie 1 605 familles de candidatures visibles poursuivant le processus, dont 152 remplacements sélectionnés. Six candidatures variant-only de TLD existants sont exclues du total des 1 120 nouvelles chaînes primaires.",
        "apsAtlasOverlapHint": "Les chaînes publiques effectives reproduisent exactement le CSV officiel String Confirmation : 226 sets et 705 lignes de candidature. Le communiqué ICANN du même jour annonce 709 candidatures en contention ; l'écart de quatre reste non résolu.",
        "apsAtlasWdo": ".wdo reste soumise à un contrôle administratif et absente de la liste publique. Cela explique une candidature manquante connue et distincte, mais pas l'écart supplémentaire de quatre candidatures dans les agrégats ICANN du 17 novembre.",
        "apsAtlasPreliminaryList": "ICANN · CSV de contention String Confirmation",
        "apsAtlasSelectedReplacement": "remplacement sélectionné",
        "apsAtlasBaseStatus": "statut actuel de la candidature",
        "release0800": "String Confirmation Day : ajout d'un snapshot APS distinct du 17 novembre, de 152 remplacements sélectionnés, des données publiques de contention confirmées, du rapprochement reproductible de l'écart de quatre candidatures et du passage de .lugano à la String Evaluation, sans modifier les preuves figées du Reveal Day ni RR1/RR2.",
    },
}
for lang, values in copy.items():
    tr.setdefault(lang, {}).update(values)

replacement_copy = {
    "en": {
        "field17ReplacementTitle": "What String Confirmation actually selected",
        "field17ReplacementBody1": "The 442 replacement records marked Active in the Reveal-period APS export were an observed publication state, not the final eligibility denominator. ICANN's 17 November announcement says 287 applications were eligible to switch.",
        "field17ReplacementBody2": "Exactly 152 applications selected their replacement string. In the captured APS export, each selected family shows the original base record Deactivated and the linked -R record Active, with the selected record represented as New gTLD or New gTLD with Variants.",
        "field17ReplacementBody3": "The remaining 135 eligible applications did not switch. Another 155 replacement records that had appeared Active in the Reveal-period export were therefore outside the final eligible population; the public sources do not justify inferring why on an application-by-application basis.",
        "field17ReplacementBoundary": "The historical 1,169 / 442 / 727 observation is retained above as a dated Reveal-period snapshot. It is not rewritten into the later 287 / 152 outcome.",
        "field17ReplacementSourceAnnouncement": "ICANN · String Confirmation announcement",
        "field17ReplacementSourceAPS": "ICANN APS · 17 November export",
        "field17ReplacementSourceContention": "ICANN · String Confirmation contention CSV",
        "field17ReplacementSourceReconciliation": "Project · verified String Confirmation reconciliation",
        "field17ReplacementRevision": "17 November 2026 · final replacement-choice reconciliation",
    },
    "it": {
        "field17ReplacementTitle": "Cosa è stato davvero selezionato allo String Confirmation",
        "field17ReplacementBody1": "I 442 record replacement marcati Active nell'export APS del periodo Reveal erano uno stato di pubblicazione osservato, non il denominatore finale degli eleggibili. Il comunicato ICANN del 17 novembre indica 287 candidature eleggibili al cambio.",
        "field17ReplacementBody2": "Esattamente 152 candidature hanno selezionato la replacement string. Nell'export APS catturato, per ciascuna famiglia selezionata il record base originale risulta Deactivated e il record -R collegato resta Active, rappresentato come New gTLD o New gTLD with Variants.",
        "field17ReplacementBody3": "Le altre 135 candidature eleggibili non hanno effettuato il cambio. Altri 155 record replacement che risultavano Active nell'export del periodo Reveal erano quindi fuori dalla popolazione finale degli eleggibili; le fonti pubbliche non consentono di inferirne il motivo candidatura per candidatura.",
        "field17ReplacementBoundary": "L'osservazione storica 1.169 / 442 / 727 resta sopra come snapshot datato del periodo Reveal. Non viene riscritta retroattivamente nel successivo esito 287 / 152.",
        "field17ReplacementSourceAnnouncement": "ICANN · comunicato String Confirmation",
        "field17ReplacementSourceAPS": "ICANN APS · export 17 novembre",
        "field17ReplacementSourceContention": "ICANN · CSV contention String Confirmation",
        "field17ReplacementSourceReconciliation": "Progetto · riconciliazione verificata String Confirmation",
        "field17ReplacementRevision": "17 novembre 2026 · riconciliazione finale delle scelte replacement",
    },
    "de": {
        "field17ReplacementTitle": "Was am String Confirmation Day tatsächlich ausgewählt wurde",
        "field17ReplacementBody1": "Die 442 im Reveal-Zeitraum als Active markierten Ersatzdatensätze waren ein beobachteter Veröffentlichungsstatus, nicht der endgültige Nenner der Berechtigten. ICANNs Mitteilung vom 17. November nennt 287 zum Wechsel berechtigte Anträge.",
        "field17ReplacementBody2": "Genau 152 Anträge wählten ihren Ersatzstring. Im erfassten APS-Export ist bei jeder ausgewählten Familie der ursprüngliche Basisdatensatz Deactivated und der verknüpfte -R-Datensatz Active; der ausgewählte Datensatz wird als New gTLD oder New gTLD with Variants geführt.",
        "field17ReplacementBody3": "Die übrigen 135 berechtigten Anträge wechselten nicht. Weitere 155 Ersatzdatensätze, die im Reveal-Zeitraum Active erschienen, lagen somit außerhalb der endgültigen Berechtigtenpopulation; die öffentlichen Quellen erlauben keine antragsspezifische Begründung.",
        "field17ReplacementBoundary": "Die historische Beobachtung 1.169 / 442 / 727 bleibt oben als datierter Reveal-Snapshot erhalten. Sie wird nicht rückwirkend in das spätere Ergebnis 287 / 152 umgeschrieben.",
        "field17ReplacementSourceAnnouncement": "ICANN · String-Confirmation-Mitteilung",
        "field17ReplacementSourceAPS": "ICANN APS · Export vom 17. November",
        "field17ReplacementSourceContention": "ICANN · String-Confirmation-Contention-CSV",
        "field17ReplacementSourceReconciliation": "Projekt · verifizierte String-Confirmation-Abstimmung",
        "field17ReplacementRevision": "17. November 2026 · finale Abstimmung der Ersatzstring-Auswahl",
    },
    "fr": {
        "field17ReplacementTitle": "Ce que le String Confirmation Day a réellement sélectionné",
        "field17ReplacementBody1": "Les 442 enregistrements de remplacement marqués Active dans l'export APS de la période Reveal constituaient un état de publication observé, et non le dénominateur final des candidatures éligibles. Le communiqué ICANN du 17 novembre indique 287 candidatures éligibles au changement.",
        "field17ReplacementBody2": "Exactement 152 candidatures ont sélectionné leur chaîne de remplacement. Dans l'export APS capturé, chaque famille sélectionnée présente l'enregistrement de base original Deactivated et l'enregistrement -R lié Active, le record sélectionné étant représenté comme New gTLD ou New gTLD with Variants.",
        "field17ReplacementBody3": "Les 135 autres candidatures éligibles n'ont pas changé de chaîne. Par conséquent, 155 autres enregistrements de remplacement apparus Active pendant la période Reveal étaient hors de la population finale éligible ; les sources publiques ne permettent pas d'en déduire la raison candidature par candidature.",
        "field17ReplacementBoundary": "L'observation historique 1 169 / 442 / 727 est conservée ci-dessus comme snapshot daté de la période Reveal. Elle n'est pas réécrite rétroactivement en fonction du résultat ultérieur 287 / 152.",
        "field17ReplacementSourceAnnouncement": "ICANN · communiqué String Confirmation",
        "field17ReplacementSourceAPS": "ICANN APS · export du 17 novembre",
        "field17ReplacementSourceContention": "ICANN · CSV de contention String Confirmation",
        "field17ReplacementSourceReconciliation": "Projet · rapprochement String Confirmation vérifié",
        "field17ReplacementRevision": "17 novembre 2026 · rapprochement final des choix de remplacement",
    },
}
for lang, values in replacement_copy.items():
    tr.setdefault(lang, {}).update(values)
dump("data/translations.json", tr)

# ---------------------------------------------------------------------------
# 6b. Legal/procedural layer: advance the temporal status only.
# ---------------------------------------------------------------------------
legal = load("data/legal_layer.json")
legal["reviewedOn"] = DATE
legal["status"] = "string-confirmation-community-input-open"
legal.setdefault("sources", {})["icannStringConfirmation"] = current_prov["officialAnnouncementReference"]
legal_status = {
    "en": {
        "statusTitle": "2026 status · String Confirmation completed",
        "statusBody": "At this editorial review on 17 November 2026, String Confirmation Day has occurred and the Community Input and Objections Period is open through 16 March 2027. This is the initial objection window; later 30-day windows can still open after String Evaluation and for eligible .Brand String Change requests. The chapter describes the published procedure and does not infer objections or outcomes that are not publicly recorded.",
    },
    "it": {
        "statusTitle": "Stato 2026 · String Confirmation completato",
        "statusBody": "Alla verifica editoriale del 17 novembre 2026, lo String Confirmation Day si è svolto e il Community Input and Objections Period è aperto fino al 16 marzo 2027. Questa è la finestra iniziale per le obiezioni; successive finestre di 30 giorni possono ancora aprirsi dopo la String Evaluation e per richieste ammissibili di .Brand String Change. Il capitolo descrive la procedura pubblicata e non inferisce obiezioni o esiti che non siano pubblicamente documentati.",
    },
    "de": {
        "statusTitle": "Stand 2026 · String Confirmation abgeschlossen",
        "statusBody": "Zum Redaktionsstand vom 17. November 2026 ist der String Confirmation Day abgeschlossen und die Community Input and Objections Period bis zum 16. März 2027 geöffnet. Dies ist das erste Einwandsfenster; nach der String Evaluation und bei zulässigen .Brand String Change-Anträgen können weiterhin zusätzliche 30-Tage-Fenster folgen. Das Kapitel beschreibt das veröffentlichte Verfahren und leitet keine nicht öffentlich dokumentierten Einwände oder Ergebnisse ab.",
    },
    "fr": {
        "statusTitle": "État 2026 · String Confirmation achevé",
        "statusBody": "À la revue éditoriale du 17 novembre 2026, le String Confirmation Day a eu lieu et la période Community Input and Objections est ouverte jusqu'au 16 mars 2027. Il s'agit de la fenêtre initiale d'objections ; d'autres fenêtres de 30 jours peuvent encore s'ouvrir après la String Evaluation et pour certaines demandes de .Brand String Change. Le chapitre décrit la procédure publiée et ne déduit ni objection ni résultat qui ne soit publiquement documenté.",
    },
}
for lang, values in legal_status.items():
    legal["locales"][lang].update(values)
dump("data/legal_layer.json", legal)

# ---------------------------------------------------------------------------
# 7. Field-note renderer: allow the new dated update while preserving history.
# ---------------------------------------------------------------------------
replace_once(
    "scripts/render_behind_round.py",
    '"reveal-day-counts":["aps-count-reconciliation","aps-publication-calendar"],',
    '"reveal-day-counts":["aps-count-reconciliation","aps-publication-calendar","string-confirmation-reconciliation"],',
)
replace_once(
    "scripts/render_behind_round.py",
    '"replacement-strings":["aps-string-reconciliation"],',
    '"replacement-strings":["aps-string-reconciliation","string-confirmation-replacement-outcome"],',
)
replace_once(
    "scripts/render_behind_round.py",
    '        if item["date"]!="2026-10-18" or item["date"]!=case["revisedOn"]:\n            raise ValueError("Updated evidence must keep its explicit review date")',
    '        if date.fromisoformat(item["date"]) > date.fromisoformat(case["revisedOn"]):\n            raise ValueError("Updated evidence cannot post-date the case revision")',
)
replace_once(
    "scripts/render_behind_round.py",
    '        keys=["field18ReviewLabel",item["titleKey"],*item["paragraphKeys"]]',
    '        keys=[item.get("reviewLabelKey","field18ReviewLabel"),item["titleKey"],*item["paragraphKeys"]]',
)
replace_once(
    "scripts/render_behind_round.py",
    '        parts.append(copy("field18ReviewLabel","time",\' class="eyebrow" datetime="\'+update["date"]+\'"\'))',
    '        parts.append(copy(update.get("reviewLabelKey","field18ReviewLabel"),"time",\' class="eyebrow" datetime="\'+update["date"]+\'"\'))',
)
replace_once(
    "scripts/render_behind_round.py",
    '        if (len(revisions)!=3 or revisions[0]["changeKey"]!="behindRevisionInitial" or\n                revisions[1]["changeKey"]!="behindRevisionReconciled" or\n                any(r["date"]!="2026-10-10" for r in revisions[:2]) or\n                revisions[-1]["changeKey"]!="field18Revision"):',
    '        if (len(revisions)!=4 or revisions[0]["changeKey"]!="behindRevisionInitial" or\n                revisions[1]["changeKey"]!="behindRevisionReconciled" or\n                any(r["date"]!="2026-10-10" for r in revisions[:2]) or\n                revisions[-2]["changeKey"]!="field18Revision" or\n                revisions[-1]["changeKey"]!="behindRevisionStringConfirmation"):',
)

# ---------------------------------------------------------------------------
# 8. Current Atlas presentation and source.
# ---------------------------------------------------------------------------
replace_once(
    "assets/aps-atlas.js",
    ' a.id,a.primary,a.primaryUnicode,a.applicant,a.location,a.region,a.type,a.status,',
    ' a.id,a.primary,a.primaryUnicode,a.originalPrimary,a.originalPrimaryUnicode,a.applicant,a.location,a.region,a.type,a.status,',
)
old_block = """ const replacement=a.replacement;
 const replacements=replacement?'<div class="apsReplacement"><b>'+escape(t('apsAtlasReplacement'))+
  '</b> <bdi>.'+escape(replacement.string)+'</bdi> · '+pill(replacement.status,replacement.status==='Deactivated'?'apsInactive':'apsState')+
  ' <span class="apsMuted">'+escape(replacement.id)+'</span> '+
  '<a target="_blank" rel="noopener" href="'+escape(officialHref(replacement.id))+'">'+escape(t('apsAtlasPublicDetail'))+' ↗</a></div>':'';"""
new_block = """ const replacement=a.replacement;
 const replacementLabel=replacement?.selected?t('apsAtlasSelectedReplacement'):t('apsAtlasReplacement');
 const replacementString=replacement?.selected
  ?'<bdi>.'+escape(a.originalPrimary)+'</bdi> → <bdi>.'+escape(replacement.string)+'</bdi>'
  :'<bdi>.'+escape(replacement?.string)+'</bdi>';
 const replacements=replacement?'<div class="apsReplacement"><b>'+escape(replacementLabel)+
  '</b> '+replacementString+' · '+pill(replacement.status,replacement.status==='Deactivated'?'apsInactive':'apsState')+
  ' <span class="apsMuted">'+escape(replacement.id)+'</span> '+
  '<a target="_blank" rel="noopener" href="'+escape(officialHref(replacement.id))+'">'+escape(t('apsAtlasPublicDetail'))+' ↗</a></div>':'';"""
replace_once("assets/aps-atlas.js", old_block, new_block)

replace_once(
    "scripts/render_aps_application_atlas.py",
    "graph['contention']['officialRevealListURL']",
    "graph['contention'].get('officialCurrentListURL',graph['contention']['officialRevealListURL'])",
)
replace_once(
    "scripts/render_aps_application_atlas.py",
    '<a href="../../data/applications_2026_aps_official_listing.csv">CSV ICANN</a></p></noscript>',
    '<a href="../../data/applications_2026_aps_string_confirmation_20261117.csv">CSV ICANN</a></p></noscript>',
)
replace_once(
    "src/index.web.html",
    '<strong data-number="980">980</strong><span data-i18n="apsAtlasStrings"></span></article><article><strong data-number="263">263</strong>',
    '<strong data-number="1120">1,120</strong><span data-i18n="apsAtlasStrings"></span></article><article><strong data-number="226">226</strong>',
)

# ---------------------------------------------------------------------------
# 9. Build wiring: current graph from 17 Nov, Reveal analytical archive intact.
# ---------------------------------------------------------------------------
replace_once(
    "build.py",
    "from scripts.build_aps_application_graph import build as build_aps_application_graph",
    "from scripts.build_aps_application_graph_current import build as build_aps_application_graph",
)
replace_once(
    "build.py",
    '"publication_state": "reveal-day",',
    '"publication_state": PUBLICATION["state"],',
)
replace_once(
    "build.py",
    '        "as_of": AS_OF,',
    '        "as_of": AS_OF,\n        "technical_as_of": PUBLICATION.get("technicalAsOf", RELEASED_ON),',
)
replace_once(
    "build.py",
    '"aps_2026_application_graph": {"source": "applications_2026_aps_official_listing.csv",',
    '"aps_2026_application_graph": {"source": "applications_2026_aps_string_confirmation_20261117.csv",',
)
replace_once(
    "build.py",
    'DATA / "application_2026_snapshot.json", DATA / "applications_2026_aps_official_provenance.json",',
    'DATA / "application_2026_snapshot.json", DATA / "application_2026_string_confirmation_snapshot.json", DATA / "applications_2026_aps_official_provenance.json", DATA / "applications_2026_aps_string_confirmation_20261117_provenance.json",',
)

# ---------------------------------------------------------------------------
# 9b. Agent/GEO catalog: keep the frozen Reveal inventory and expose a second
# explicit String Confirmation snapshot instead of collapsing the two states.
# ---------------------------------------------------------------------------
agent_path = "scripts/build_agent_catalog.py"
agent = text(agent_path)
start = agent.index("def derive_counts(root: Path) -> dict:")
end = agent.index("\ndef build_catalog(", start)
new_derive = '''def derive_counts(root: Path) -> dict:
    """Count Reveal and String Confirmation units independently."""
    core = read_csv(root, "data/explorer_catalog.csv")
    universe = read_csv(root, "data/tld_universe.csv")
    application_only = read_csv(root, "data/application_only_strings.csv")
    strings = read_csv(root, "data/applications_2026_strings_reveal.csv")

    reveal_rows = read_csv(root, "data/applications_2026_aps_official_listing.csv")
    reveal_provenance = read_json(root, "data/applications_2026_aps_official_provenance.json")
    reveal_snapshot = read_json(root, "data/application_2026_snapshot.json")

    current_rows = read_csv(root, "data/applications_2026_aps_string_confirmation_20261117.csv")
    current_provenance = read_json(root, "data/applications_2026_aps_string_confirmation_20261117_provenance.json")
    graph = read_json(root, "data/aps_2026_application_graph.json")
    graph_manifest = read_json(root, "data/aps_2026_application_graph_manifest.json")
    iana = read_json(root, "data/iana_snapshot.json")

    core_labels = {label(row.get("ascii_string") or row["string"]) for row in core}
    reveal_labels = {label(row["string"]) for row in strings}
    assert len(core_labels) == len(core), "Duplicate identities in the base Explorer catalog"
    assert len(reveal_labels) == len(strings), "Duplicate identities in the 2026 string index"
    assert len(core) == len(universe) + len(application_only), "Explorer base scope changed"

    reveal_base = [row for row in reveal_rows if not row["Application ID"].endswith("-R")]
    reveal_replacements = [row for row in reveal_rows if row["Application ID"].endswith("-R")]
    reveal_ids = {row["Application ID"] for row in reveal_base}
    assert len(reveal_ids) == len(reveal_base) == 1614, "Duplicate Reveal APS base identifiers"
    assert len(reveal_replacements) == 1169, "Reveal replacement-record census changed"
    assert all(row["Application ID"][:-2] in reveal_ids for row in reveal_replacements), "Unlinked Reveal replacement row"
    reveal_variants = [
        row for row in reveal_base
        if row["Label: Variant Only (Existing TLD)"].strip().lower() == "true"
    ]
    reveal_new = [row for row in reveal_base if row not in reveal_variants]
    reveal_new_labels = {label(row["Primary String"]) for row in reveal_new}
    assert reveal_new_labels == reveal_labels and len(reveal_new) == 1608 and len(reveal_labels) == 980
    assert sum(int(row["applications"]) for row in strings) == 1608
    assert file_digest(root, "data/applications_2026_aps_official_listing.csv") == reveal_provenance["normalizedCSVSHA256"]

    aps_reveal = {
        "snapshotState": "reveal-day",
        "officialReportedApplications": reveal_snapshot["official"]["activeApplications"],
        "officialStatisticsPublishedAt": reveal_snapshot["official"]["lastPublished"],
        "publicListingRows": len(reveal_rows),
        "publishedBaseApplications": len(reveal_base),
        "replacementRows": len(reveal_replacements),
        "newPrimaryStringApplications": len(reveal_new),
        "distinctNewPrimaryStrings": len(reveal_new_labels),
        "variantOnlyExistingTldApplications": len(reveal_variants),
        "publicListingObservedAt": reveal_provenance["retrievedAtUTC"],
        "reportedVersusPublishedGap": reveal_snapshot["official"]["activeApplications"] - len(reveal_base),
        "unpublishedApplicationIds": ["WDO2627T-T45217"],
    }

    current_base = [row for row in current_rows if not row["Application ID"].endswith("-R")]
    current_replacements = [row for row in current_rows if row["Application ID"].endswith("-R")]
    current_ids = {row["Application ID"] for row in current_base}
    assert len(current_rows) == 2783 and len(current_base) == 1614 and len(current_replacements) == 1169
    assert current_ids == {app["id"] for app in graph["apps"]}, "Current APS graph/listing identity mismatch"
    assert file_digest(root, "data/applications_2026_aps_string_confirmation_20261117.csv") == current_provenance["normalizedCSVSHA256"]
    assert graph_manifest["sourceSha256"] == current_provenance["normalizedCSVSHA256"]
    counts = graph_manifest["counts"]
    assert counts["visibleProceedingApplications"] == 1605
    assert counts["selectedReplacementRecords"] == 152
    assert counts["proceedingNewPrimaryApplications"] == 1599
    assert counts["newPrimaryStrings"] == 1120
    assert counts["derivedExactPrimaryMatchGroups"] == 226
    assert counts["applicationsInExactPrimaryMatches"] == 705
    assert counts["unresolvedAnnouncementPublicationGap"] == 4

    aps_current = {
        "snapshotState": "string-confirmation",
        "officialReportedApplications": counts["officialAnnouncementProceedingApplications"],
        "officialStatisticsActiveApplications": counts["apsStatisticsActiveApplications"],
        "officialStatisticsPublishedAt": current_provenance["sourceStatisticsLastPublished"],
        "publicListingRows": len(current_rows),
        "publishedBaseApplications": len(current_base),
        "visibleProceedingApplications": counts["visibleProceedingApplications"],
        "replacementRows": len(current_replacements),
        "selectedReplacementApplications": counts["selectedReplacementRecords"],
        "newPrimaryStringApplications": counts["proceedingNewPrimaryApplications"],
        "distinctNewPrimaryStrings": counts["newPrimaryStrings"],
        "variantOnlyExistingTldApplications": counts["variantOnlyExistingTldApplications"],
        "publicListingObservedAt": current_provenance["retrievedAtUTC"],
        "knownAdministrativeCheckApplications": counts["knownAdministrativeCheckApplications"],
        "announcementVersusVisibleProceedingGap": counts["announcementVsPublicProceedingGap"],
        "unresolvedAnnouncementPublicationGap": counts["unresolvedAnnouncementPublicationGap"],
        "confirmedContentionSets": counts["derivedExactPrimaryMatchGroups"],
        "publicApplicationsInContention": counts["applicationsInExactPrimaryMatches"],
        "officialAnnouncementApplicationsInContention": counts["officialAnnouncementApplicationsInContention"],
        "knownUnpublishedApplicationIds": [graph["notPublishedApplication"]["id"]],
    }

    root_count = sum(row["root_listed"] == "yes" for row in universe)
    assert root_count == iana["rootListCount"], "IANA root membership count mismatch"

    return {
        "explorer": {
            "unit": "distinct ASCII-normalized name, not necessarily a delegated TLD",
            "baseCatalogRecords": len(core),
            "tldAndHistoricalProfileRecords": len(universe),
            "baseApplicationOnlyNames": len(application_only),
            "frozen2026PrimaryStringNames": len(reveal_labels),
            "overlappingNames": len(core_labels & reveal_labels),
            "combinedExplorerNames": len(core_labels | reveal_labels),
            "formula": "baseCatalogRecords + frozen2026PrimaryStringNames - overlappingNames",
            "rootListedTlds": root_count,
            "rootObservationDate": iana["asOf"],
            "scopeNote": "The combined interface retains the frozen Reveal Day string index; the current APS Application Atlas is a separately dated String Confirmation layer.",
        },
        "aps2026": aps_reveal,
        "aps2026Current": aps_current,
    }

'''
agent = agent[:start] + new_derive + agent[end:]

agent = agent.replace(
    '    aps_provenance = read_json(root, "data/applications_2026_aps_official_provenance.json")\n',
    '    aps_provenance = read_json(root, "data/applications_2026_aps_official_provenance.json")\n'
    '    current_aps_provenance = read_json(root, "data/applications_2026_aps_string_confirmation_20261117_provenance.json")\n',
    1,
)

old_listing = '''        dataset(
            "aps-public-listing", "ICANN APS public listing, original fields preserved", "data/applications_2026_aps_official_listing.csv",
            "APS listing row", counts["aps2026"]["publicListingRows"],
            "Complete downloadable public listing at retrieval, including base applications and linked -R replacement records; not the full questionnaires or confidential dossiers.",
            "data/applications_2026_aps_official_provenance.json", aps_provenance["retrievedAtUTC"], layer="source-records",
            sourceUrl=aps_provenance["sourceExportURL"],
            note=aps_provenance["csvPreambleNotice"][0],
        ),
'''
new_listing = old_listing + '''        dataset(
            "aps-string-confirmation-listing", "ICANN APS public listing · String Confirmation Day", "data/applications_2026_aps_string_confirmation_20261117.csv",
            "APS listing row", counts["aps2026Current"]["publicListingRows"],
            "Separate 17 November public APS observation. Stable base IDs are preserved while selected -R records represent the effective current string.",
            "data/applications_2026_aps_string_confirmation_20261117_provenance.json", current_aps_provenance["retrievedAtUTC"], layer="source-records",
            sourceUrl=current_aps_provenance["sourceExportURL"],
            note="The same-day ICANN announcement aggregates exceed the reconciled public APS/contention files by four applications after accounting separately for .wdo.",
        ),
'''
if old_listing not in agent:
    raise ValueError("Agent catalog APS listing block changed")
agent = agent.replace(old_listing, new_listing, 1)
agent = agent.replace(
    '"published base application", counts["aps2026"]["publishedBaseApplications"],\n'
    '            "Reconciled public listing: base application identities, alternatives, variants and derived exact-primary-string groups.",',
    '"published base application", counts["aps2026Current"]["publishedBaseApplications"],\n'
    '            "Current String Confirmation graph: stable base application identities, selected replacements, variants and confirmed public contention memberships.",',
    1,
)

agent = agent.replace(
    '            "version": pub["version"], "releasedOn": pub["releasedOn"], "url": base,',
    '            "version": pub["version"], "releasedOn": pub["releasedOn"], "technicalAsOf": pub.get("technicalAsOf", pub["releasedOn"]), "url": base,',
    1,
)
agent = agent.replace(
    '            "websiteRelease": "Technical/editorial publication date; it does not redate the underlying observations.",',
    '            "websiteRelease": "Technical/editorial publication date; it does not redate the underlying observations.",\n'
    '            "technicalAsOf": "Newest evidence state integrated into the technical site; distinct from the current archived research-release cutoff.",',
    1,
)
agent = agent.replace(
    '    aps = catalog["snapshotCounts"]["aps2026"]\n',
    '    aps = catalog["snapshotCounts"]["aps2026Current"]\n'
    '    aps_reveal = catalog["snapshotCounts"]["aps2026"]\n',
    1,
)
old_llms = '''        f"The APS export observed at {aps['publicListingObservedAt']} contains {aps['publicListingRows']:,} rows: {aps['publishedBaseApplications']:,} base applications and {aps['replacementRows']:,} linked replacement rows. Its new-primary subset has {aps['newPrimaryStringApplications']:,} applications over {aps['distinctNewPrimaryStrings']:,} strings; {aps['variantOnlyExistingTldApplications']:,} other base applications concern variants of existing TLDs. The separately published official total is {aps['officialReportedApplications']:,}; retain the documented public-listing gap.", "",
'''
new_llms = '''        f"The frozen Reveal Day APS layer contains {aps_reveal['publishedBaseApplications']:,} public base applications and {aps_reveal['distinctNewPrimaryStrings']:,} primary strings in the reconciled secondary string index. It remains a historical snapshot rather than being overwritten by later applicant choices.", "",
        f"The String Confirmation APS export observed at {aps['publicListingObservedAt']} contains {aps['publicListingRows']:,} public rows and {aps['publishedBaseApplications']:,} stable base Application IDs. Its effective current state yields {aps['visibleProceedingApplications']:,} visible proceeding application families, including {aps['selectedReplacementApplications']:,} selected replacements, and {aps['newPrimaryStringApplications']:,} proceeding new-primary applications over {aps['distinctNewPrimaryStrings']:,} visible strings. The public contention CSV has {aps['confirmedContentionSets']:,} sets / {aps['publicApplicationsInContention']:,} rows, while ICANN's same-day announcement reports {aps['officialAnnouncementApplicationsInContention']:,}; retain the unresolved four-application publication gap.", "",
'''
if old_llms not in agent:
    raise ValueError("Agent llms APS paragraph changed")
agent = agent.replace(old_llms, new_llms, 1)
write(agent_path, agent)

# ---------------------------------------------------------------------------
# 10. Release gates: validate both immutable Reveal baseline and current graph.
# ---------------------------------------------------------------------------
replace_once(
    "scripts/release_check.py",
    "graph_report=json_file('aps_2026_application_graph_manifest.json')",
    "graph_report=json_file('aps_2026_application_graph_manifest.json')\ncurrent_prov=json_file('applications_2026_aps_string_confirmation_20261117_provenance.json')",
)
replace_once(
    "scripts/release_check.py",
    "if graph.get('schemaVersion')!=1 or graph.get('counts',{}).get('officialPublishedApplications')!=1614:",
    "if graph.get('schemaVersion')!=2 or graph.get('snapshotState')!='string-confirmation' or graph.get('counts',{}).get('officialPublishedApplications')!=1614:",
)
replace_once(
    "scripts/release_check.py",
    "if graph['counts'].get('derivedExactPrimaryMatchGroups')!=263 or graph['counts'].get('applicationsInExactPrimaryMatches')!=891:\n    fail('Derived preliminary exact-string overlaps changed unexpectedly')",
    "if graph['counts'].get('derivedExactPrimaryMatchGroups')!=226 or graph['counts'].get('applicationsInExactPrimaryMatches')!=705:\n    fail('Confirmed public exact-string contention must reconcile to 226 sets / 705 application rows')",
)
replace_once(
    "scripts/release_check.py",
    "if graph_report.get('sourceSha256')!=prov['normalizedCSVSHA256']:\n    fail('Graph provenance not pinned to exact official APS CSV checksum')",
    "if graph_report.get('sourceSha256')!=current_prov['normalizedCSVSHA256']:\n    fail('Current graph provenance not pinned to the 17 November APS CSV checksum')",
)
replace_once(
    "scripts/release_check.py",
    "if len(edges)!=2796 or len(observations)<2783:",
    "if len(edges)!=2796 or len(observations)<5566:",
)
replace_once(
    "scripts/release_check.py",
    "if any(x['source_sha256']!=prov['normalizedCSVSHA256'] for x in observations if x['observed_utc']==prov['retrievedAtUTC']):\n    fail('APS observation log refers to wrong source checksum')",
    "if any(x['source_sha256']!=current_prov['normalizedCSVSHA256'] for x in observations if x['observed_utc']==current_prov['retrievedAtUTC']):\n    fail('Current APS observation log refers to wrong source checksum')",
)
replace_once(
    "scripts/release_check.py",
    "if chronicle.get('lastReviewed')!='2026-10-30':\n    fail('Current technical release lacks dated 30 October timeline review')",
    "if chronicle.get('lastReviewed')!='2026-11-17':\n    fail('Current technical release lacks dated 17 November timeline review')\nconfirmation=next((e for e in events if e['id']=='confirmation'),None)\ncommunity_input=next((e for e in events if e['id']=='community-input'),None)\nif not confirmation or confirmation.get('state')!='observed' or confirmation.get('bodyKey')!='insideConfirmObservedBody':\n    fail('String Confirmation Day must be recorded as an observed event')\nif not community_input or community_input.get('state')!='current' or community_input.get('endDate')!='2027-03-16':\n    fail('Community Input and Objections period must be current after 17 November')",
)
replace_once(
    "scripts/release_check.py",
    "if not (publication_meta['asOf'] <= publication_meta.get('paperRevisedOn','') <= publication_meta['releasedOn']):\n    fail('Working paper revision date outside snapshot/publication range')",
    "if not (publication_meta['researchSnapshot'] <= publication_meta.get('paperRevisedOn','') <= publication_meta['releasedOn']):\n    fail('Working paper scholarly revision date outside research-snapshot/publication range')",
)

replace_once(
    "scripts/release_check.py",
    "if not case.get('revisionHistory') or case['revisionHistory'][-1]['date']!=case['revisedOn'] or case['revisionHistory'][-1]['changeKey']!='field18Revision':",
    "if not case.get('revisionHistory') or case['revisionHistory'][-1]['date']!=case['revisedOn'] or case['revisionHistory'][-1]['changeKey']!='behindRevisionStringConfirmation':",
)
replace_once(
    "scripts/release_check.py",
    "if len(case['sources'])!=17 or not any(s['kind']=='secondary' for s in case['sources']):",
    "if len(case['sources'])!=21 or not any(s['kind']=='secondary' for s in case['sources']):",
)

# Browser audit: public confirmed contention replaces preliminary Reveal overlap.
audit = text("scripts/audit_aps_application_atlas.js")
audit = audit.replace("assert.equal(loaded.exact,263);", "assert.equal(loaded.exact,226);")
audit = audit.replace("includes('891')", "includes('705')")
write("scripts/audit_aps_application_atlas.js", audit)

# ---------------------------------------------------------------------------
# 11. Publication/version metadata.
# ---------------------------------------------------------------------------
pkg = load("package.json")
pkg["version"] = VERSION
dump("package.json", pkg)
lock = load("package-lock.json")
lock["version"] = VERSION
lock.setdefault("packages", {}).setdefault("", {})["version"] = VERSION
dump("package-lock.json", lock)

pub = load("publication.json")
pub.update({
    "version": VERSION,
    "releasedOn": DATE,
    "state": "string-confirmation",
    "freeze": True,
    "technicalAsOf": DATE,
    "currentDataPackVersion": VERSION,
    "currentDataPackPath": f"downloads/connecting-the-dots-data-pack-v{VERSION}.zip",
    "paperTechnicalSyncOn": DATE,
    "editorialReviewPath": f"docs/editorial-review-{DATE}-v{VERSION}.json",
    "sourceReviewCommit": SOURCE_COMMIT,
    "buildProvenanceCommit": SOURCE_COMMIT,
    "buildProvenanceRole": "source review commit used for deterministic regeneration; not the published merge commit",
})
dump("publication.json", pub)

manifest = load("research/research_release_manifest.json")
manifest["currentSiteVersion"] = VERSION
manifest["nextPlannedResearchRelease"]["candidatePath"] = "research/rr3_candidate.json"
manifest["nextPlannedResearchRelease"]["status"] = "candidate preparation after observed String Confirmation Day"
manifest["workingPaperRevision"]["technicalReference"].update({
    "siteVersion": VERSION,
    "dataPackageVersion": VERSION,
    "synchronizedOn": DATE,
    "semantics": "Operational pointer only. The site now includes String Confirmation evidence; this does not change the v1.4-draft scholarly revision date or extend RR2 DOI coverage.",
})
dump("research/research_release_manifest.json", manifest)

rr3 = {
    "schemaVersion": 1,
    "candidateId": "RR3",
    "candidateStatus": "prepublication-review",
    "candidateTitle": "Connecting the Dots · Research Release RR3 · String Confirmation 2026",
    "candidateLabel": "String Confirmation 2026: replacement choices, confirmed contention and public-data reconciliation",
    "researchDataSnapshot": DATE,
    "preparedOn": DATE,
    "baseline": {
        "releaseId": "RR2",
        "tag": "RR2",
        "specificDoi": "10.5281/zenodo.23288603",
        "publishedOn": "2026-10-10",
        "researchSnapshot": "2026-10-07",
        "conceptDoi": "10.5281/zenodo.23262622",
    },
    "rationale": "String Confirmation Day materially changed the observable 2026 application graph: 152 replacement selections, nine withdrawals and a reduction in public identical-string contention from 263/891 at Reveal Day to 226/705. The same-day ICANN announcement exposes a reproducible four-application aggregate/publication gap that must be preserved as an unresolved finding rather than normalized away.",
    "scientificChange": {
        "officialAnnouncementProceedingApplications": 1610,
        "publicVisibleProceedingApplicationFamilies": 1605,
        "knownAdministrativeCheckApplication": "WDO2627T-T45217",
        "unresolvedAnnouncementPublicationGap": 4,
        "selectedReplacementApplications": 152,
        "eligibleReplacementApplications": 287,
        "withdrawnApplications": 9,
        "revealPublicContentionSets": 263,
        "revealPublicContentionApplications": 891,
        "confirmedPublicContentionSets": 226,
        "confirmedPublicContentionApplications": 705,
        "officialAnnouncementContentionApplications": 709,
        "visibleProceedingNewPrimaryStrings": 1120,
        "apsStatisticsUniqueStrings": 1127,
    },
    "evidence": {
        "apsNormalizedSHA256": current_prov["normalizedCSVSHA256"],
        "revealContentionSHA256": "86f2ebd3764d1f3ea21d5d844cff004e271a443a3431e8ac440da7f72c67e2bf",
        "confirmedContentionSHA256": "0c65e67703c57794e3c038607feeae4b9dc8126f4739766737d0066d55d76b4f",
        "reconciliation": "data/evidence/string-confirmation-2026-11-17/live/contention-reconciliation.json",
        "observation": "data/evidence/string-confirmation-2026-11-17/official-announcement-observation.json",
    },
    "evidenceLimitations": [
        "ICANN's 17 November announcement aggregates do not fully reconcile with the public APS export and public contention CSV.",
        "The identities and administrative cause of the four residual applications are not publicly established and are not inferred.",
        ".wdo remains a separate known administrative-check case absent from the public Applications listing.",
        "The historical 1,616 paid-to-proceed figure of 22 September and the 1,615 Reveal Day figure remain a distinct unresolved discrepancy.",
        "RR1 and RR2 remain immutable; this candidate has no DOI until archival verification completes.",
    ],
    "archivePolicy": {
        "rr3Publication": "blocked-until-verified",
        "doiForRR3": None,
        "conceptDoi": "10.5281/zenodo.23262622",
        "preserveExistingCurrentResearchRelease": "RR2",
        "publicationGate": [
            "RR3 evidence package passes deterministic integrity and source-reconciliation checks.",
            "The four-application discrepancy is described as unresolved, not repaired through inference.",
            "A reviewed RR3 GitHub tag/release is minted from a frozen commit.",
            "Zenodo returns a real RR3-specific DOI in the existing concept/version chain.",
            "Only after DOI verification are public citation metadata and currentResearchRelease promoted atomically.",
        ],
    },
}
dump("research/rr3_candidate.json", rr3)

hist = load("data/release_history.json")
hist["releases"] = [item for item in hist["releases"] if item.get("version") != VERSION]
prev = next(item for item in hist["releases"] if item.get("version") == "0.7.112")
hist["releases"].insert(0, {
    "version": VERSION,
    "date": DATE,
    "summaryKey": "release0800",
    "ianaSnapshot": prev.get("ianaSnapshot"),
    "researchRelease": "RR2",
    "ianaEvidenceSha256": prev.get("ianaEvidenceSha256"),
})
dump("data/release_history.json", hist)

review = {
    "reviewId": "string-confirmation-2026-11-17-v0.8.0-candidate",
    "status": "candidate-source-review",
    "reviewedOn": DATE,
    "publicationVersion": VERSION,
    "sourceReviewCommit": SOURCE_COMMIT,
    "scope": "String Confirmation evidence transition: separate current APS snapshot, selected replacements, confirmed public contention, aggregate/publication reconciliation, timeline and .lugano state.",
    "protectedHistoricalEvidence": [
        "RR1",
        "RR2",
        "data/applications_2026_aps_official_listing.csv",
        "data/applications_2026_strings_reveal.csv",
        "data/application_2026_snapshot.json",
    ],
    "currentEvidence": [
        f"data/{CURRENT_CSV}",
        f"data/{CURRENT_PROV}",
        "data/application_2026_string_confirmation_snapshot.json",
        "data/evidence/string-confirmation-2026-11-17/live/",
    ],
    "unresolved": [
        "22 September 1,616 to Reveal Day 1,615 discrepancy",
        "four-application gap between 17 November announcement aggregates and public APS/contention files",
        ".wdo administrative check remains pending",
    ],
}
dump(f"docs/editorial-review-{DATE}-v{VERSION}.json", review)

# README and changelog.
readme = text("README.md")
readme = re.sub(r"^# Connecting the Dots — v\d+\.\d+\.\d+", f"# Connecting the Dots — v{VERSION}", readme, count=1)
if "## Current release" in readme:
    start = readme.index("## Current release")
    end = readme.find("## Previous", start)
    if end != -1:
        block = f"""## Current release

**v{VERSION} - 17 November 2026**

String Confirmation Day: a separate current APS snapshot now records 152 selected replacements, nine withdrawals and 226/705 public confirmed contention. The project also preserves the unresolved four-application difference between ICANN's announcement aggregates and its public APS/contention files. .lugano is Active in String Evaluation with no identical-string contention. Reveal Day evidence and RR1/RR2 remain immutable.

"""
        readme = readme[:start] + block + readme[end:]
write("README.md", readme)

changelog = text("CHANGELOG.md")
entry = """# v0.8.0 — 17 November 2026

- Added a separate, hash-pinned ICANN APS String Confirmation Day snapshot while preserving the Reveal Day source unchanged.
- Reconciled 152 selected replacement strings and nine withdrawals from paired public APS records.
- Moved the current Application Atlas to effective confirmed strings: 1,605 visible proceeding application families, 1,120 visible proceeding new-primary strings and 226 public confirmed contention sets / 705 application rows.
- Recorded, without inference, the four-application gap between ICANN's 17 November announcement aggregates and the public APS/contention files; .wdo remains a separate administrative-check case.
- Advanced .lugano to Active / String Evaluation Processing, not in identical-string contention, with the public comment period open.
- Opened RR3 as a prepublication candidate; RR2 remains the current citable research release and the working paper remains v1.4-draft.

"""
if not changelog.startswith("# v0.8.0"):
    changelog = entry + changelog
write("CHANGELOG.md", changelog)

print(json.dumps({
    "prepared": VERSION,
    "currentAPS": CURRENT_CSV,
    "currentAPS_SHA256": current_prov["normalizedCSVSHA256"],
    "selectedReplacements": 152,
    "publicContention": {"sets": 226, "applications": 705},
    "sourceReviewCommit": SOURCE_COMMIT,
    "rr3Status": "prepublication-review",
}, ensure_ascii=False))
