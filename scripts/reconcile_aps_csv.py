#!/usr/bin/env python3
"""Validate ICANN APS 2026 Applications 'Download CSV' as a distinct public list.
Never equate UI/export rows, application IDs, primary strings or replacement
records with ICANN's aggregate statistics without explicit reconciliation.
"""
from __future__ import annotations
import csv
import hashlib
import json
from pathlib import Path
from collections import Counter
from datetime import datetime, timezone

ROOT=Path(__file__).resolve().parents[1]
ART=ROOT/"artifacts"/"aps-probe"
source=ART/"aps_official_export.csv"
probe=json.loads((ART/"probe.json").read_text(encoding="utf-8"))
if not source.is_file():
    raise SystemExit("Official APS CSV was not downloaded")

notice=[]
with source.open("r",encoding="utf-8-sig",newline="") as file:
    reader=csv.reader(file)
    header=None
    for item in reader:
        if "Primary String" in item and "Application ID" in item:
            header=item
            break
        if item and any(x.strip() for x in item):
            notice.append(" ".join(item).strip())
    if header is None:
        raise SystemExit("Missing official APS CSV header after introductory notice")
    rows=[]
    malformed=[]
    for line,values in enumerate(reader,1):
        if not values or not any(x.strip() for x in values):
            continue
        if len(values)!=len(header):
            malformed.append({"afterHeaderRow":line,"columnCount":len(values)})
            continue
        rows.append(dict(zip(header,values)))
if malformed:
    raise SystemExit("Malformed CSV rows: "+json.dumps(malformed[:10]))
ids=[x["Application ID"].strip() for x in rows]
if any(not x for x in ids):
    raise SystemExit("Some published APS records have no application ID")
duplicates=[(k,v) for k,v in Counter(ids).items() if v>1]
if duplicates:
    raise SystemExit("Duplicate published APS record IDs: "+json.dumps(duplicates[:20]))
is_replacement=lambda x: x.endswith("-R")
base_ids=[x[:-2] if is_replacement(x) else x for x in ids]
base_count=Counter(base_ids)
cross_types=Counter("replacement+primary" if c>1 else "one-record" for c in base_count.values())
stats={
    "source":probe["source"],
    "exportEndpoint":"https://newgtldprogram-aps.icann.org/aps/applications/export/csv",
    "downloadedAtUtc":probe["attemptedAt"],
    "retrievalFileName":probe.get("filename"),
    "officialStatisticsAtRevealDay":{"applications":1615,"applicants":481,"snapshotLastPublished":"2026-10-07T15:41:00Z"},
    "publiclyOmittedPendingAdministrativeCheckApplicationID":"WDO2627T-T45217",
    "rowCount":len(rows),
    "uniquePublishedApplicationRecordIDs":len(set(ids)),
    "replacementRecordCount":sum(map(is_replacement,ids)),
    "uniquePublishedBaseApplicationIDs":len(base_count),
    "baseIDMultiplicity":dict(cross_types),
    "applicationsDifferenceFromOfficialStatistics":1615-len(base_count),
    "missingWDORecord":("WDO2627T-T45217" not in base_count),
    "columnNames":header,
    "introductoryNotice":notice,
    "rawCSVBytes":source.stat().st_size,
    "rawSHA256":hashlib.sha256(source.read_bytes()).hexdigest(),
    "statusCounts":dict(Counter(x.get("Application Status","").strip() for x in rows)),
    "applicationTypes":dict(Counter(x.get("Application Type","").strip() for x in rows)),
    "uniquePrimaryStrings":len(set(x.get("Primary String","").strip().lower() for x in rows if x.get("Primary String","").strip())),
    "sourceNotes":["Official APS list rows can represent primary and replacement records of one application; -R is a replacement record, not a separate paid application.",
      "The official 1,615 aggregate does not imply all 1,615 application details are publicly listed; ICANN separately identifies an application pending administrative checking.",
      "Introductory CSV notice warns the contention flag is not authoritative before String Evaluation; never interpret false as no contention.",
      "This normalized publication listing is not an archive of individual application details or summary PDFs.",
      "Do not confuse the applicant organization's public details with private application data."]
}
out=ART/"aps_official_export_normalized.csv"
with out.open("w",encoding="utf-8",newline="") as file:
    writer=csv.DictWriter(file,fieldnames=header,lineterminator="\n")
    writer.writeheader()
    writer.writerows(rows)
stats["normalizedSHA256"]=hashlib.sha256(out.read_bytes()).hexdigest()
report=ART/"reconciliation.json"
report.write_text(json.dumps(stats,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print("APS_RECONCILIATION "+json.dumps(stats,ensure_ascii=False))
# Keep this study in a reproducible, explicitly partial state until verified.
if not (len(rows)>=1600 and len(base_count)>=1500 and stats["replacementRecordCount"]>500 and not duplicates):
    raise SystemExit("Official APS export is incomplete, unexpectedly small, or not parseable")
