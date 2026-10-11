#!/usr/bin/env python3
"""Vendor an unmodified-column public APS listing after strict snapshot reconciliation.
This is a list of application records, NOT individual application questionnaires.
"""
from pathlib import Path
import json
import shutil
import hashlib

root=Path(__file__).resolve().parents[1]
folder=root/"artifacts"/"aps-probe"
report=json.loads((folder/"reconciliation.json").read_text(encoding="utf-8"))
expected={"rowCount":2783,"uniquePublishedApplicationRecordIDs":2783,
          "uniquePublishedBaseApplicationIDs":1614,"replacementRecordCount":1169,
          "applicationsDifferenceFromOfficialStatistics":1,"missingWDORecord":True}
mismatch={k:{"expected":v,"actual":report.get(k)} for k,v in expected.items() if report.get(k)!=v}
if mismatch:
    raise SystemExit("Official 2026-10-07 snapshot counts changed; no auto-vendoring: "+str(mismatch))
raw=folder/"aps_official_export.csv"
normalized=folder/"aps_official_export_normalized.csv"
if hashlib.sha256(raw.read_bytes()).hexdigest()!=report["rawSHA256"]:
    raise SystemExit("Raw APS source integrity mismatch")
if hashlib.sha256(normalized.read_bytes()).hexdigest()!=report["normalizedSHA256"]:
    raise SystemExit("Normalized APS listing integrity mismatch")
public=root/"data"/"applications_2026_aps_official_listing.csv"
shutil.copyfile(normalized,public)
manifest=root/"data"/"applications_2026_aps_official_provenance.json"
provenance={
    "schemaVersion":1,
    "title":"ICANN New gTLD Program 2026 Round / APS public applications export",
    "sourceAuthority":"ICANN Application Publication and Statistics (APS)",
    "sourcePage":report["source"],
    "sourceExportURL":report["exportEndpoint"],
    "officialStatisticsReference":"https://newgtldprogram-aps.icann.org/statistics",
    "sourceStatisticsLastPublished":report["officialStatisticsAtRevealDay"]["snapshotLastPublished"],
    "retrievedAtUTC":report["downloadedAtUtc"],
    "sourceExportFileName":report["retrievalFileName"],
    "officialRowsFile":"applications_2026_aps_official_listing.csv",
    "originalCSVBytes":report["rawCSVBytes"],
    "originalCSVSHA256":report["rawSHA256"],
    "normalizedCSVSHA256":report["normalizedSHA256"],
    "totalOfficialListingRows":report["rowCount"],
    "uniquePublishedApplicationRecords":report["uniquePublishedBaseApplicationIDs"],
    "replacementStringRecords":report["replacementRecordCount"],
    "officialStatisticsTotalApplications":1615,
    "publishedApplicationGap":report["applicationsDifferenceFromOfficialStatistics"],
    "pendingAdministrativeCheckApplicationID":"WDO2627T-T45217",
    "csvColumns":report["columnNames"],
    "csvPreambleNotice":report["introductoryNotice"],
    "statusCounts":report["statusCounts"],
    "applicationTypeCounts":report["applicationTypes"],
    "coverage":"Complete downloadable public APS Applications listing as retrieved. NOT all official applications or detailed per-application PDF dossiers.",
    "licenseNote":"Public records sourced from ICANN APS. ICANN source terms and attribution apply to original fields; inclusion is not a claim of original authorship or relicensing of ICANN data.",
    "normalization":{
      "rules":["Strip only the introductory CSV notice and empty header-prelude lines","Preserve all 34 official column names and public cell values in original order","Convert UTF-8 BOM to UTF-8 without BOM and standardize row terminators to LF","Do not remove -R records or infer application outcomes"],
      "rowIdentity":"Application ID (unique), group base IDs by stripping a terminal -R ONLY for reconciliation"
    }
}
manifest.write_text(json.dumps(provenance,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print("APS_VENDOR_SUCCESS "+json.dumps({"file":str(public.relative_to(root)),"rows":report["rowCount"],
    "officialUnique":report["uniquePublishedBaseApplicationIDs"],
    "rawSHA256":report["rawSHA256"],"normalizedSHA256":report["normalizedSHA256"]}))
