#!/usr/bin/env python3
"""Build a separate current analytical layer from the pinned official APS CSV.

No network; no rewriting archived economic maps, research releases or source data.
The source hashes and snapshot cardinalities are deliberate integrity gates.
"""
from __future__ import annotations

import argparse
import csv
import hashlib
import io
import json
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
SOURCE_NAME = "applications_2026_aps_official_listing.csv"
PROVENANCE_NAME = "applications_2026_aps_official_provenance.json"
LEGACY_NAME = "application_economic_map_2012_2026.csv"
EVIDENCE_NAME = "aps_2026_applicant_sector_evidence.json"
LEGACY_SHA256 = "fd296f84bddca790e9b581c0665c08f5903c2b86758d90d23e8008d434296f28"
SCOPES = ("all_published", "new_primary")
EXISTING_VARIANT_IDS = {
    "BTRT2633T-T83538", "IDOL2621T-T53999", "BTRT2633T-T38161",
    "NHXN2684T-T27476", "IDOL2621T-T12142", "CINI2622T-T81530",
}
CSV_COLUMNS = [
    "application_id", "primary_string", "primary_unicode", "applicant_name",
    "application_type", "application_status", "application_weight", "comparable_scope",
    "exclusion_reason", "location_code", "region_code", "official_brand_flag",
    "official_community_flag", "official_geo_self_designated_flag", "official_geo_confirmed_flag",
    "naming_strategy", "naming_strategy_confidence", "naming_strategy_basis",
    "string_theme", "string_theme_status", "string_theme_confidence", "string_theme_basis",
    "string_theme_source_file", "string_theme_reference_key", "string_theme_source_row_count",
    "applicant_sector", "applicant_sector_status", "applicant_sector_confidence",
    "applicant_sector_basis", "applicant_sector_source_urls", "applicant_sector_reviewed_at",
    "corporate_group", "corporate_group_status", "source_url", "source_observed_utc", "source_sha256",
]
DIST_COLUMNS = ["scope", "category", "applications", "denominator", "share_of_all_pct",
                "distinct_applicant_names", "observed_location_codes", "source_observed_utc", "source_sha256"]


def sha(contents: bytes) -> str:
    return hashlib.sha256(contents).hexdigest()


def csv_rows(path: Path):
    return list(csv.DictReader(io.StringIO(path.read_text(encoding="utf-8-sig"), newline="")))


def csv_text(rows, columns):
    stream = io.StringIO(newline="")
    writer = csv.DictWriter(stream, fieldnames=columns, lineterminator="\n", extrasaction="ignore")
    writer.writeheader()
    writer.writerows({key: (str(value).lower() if isinstance(value, bool) else value)
                     for key, value in row.items()} for row in rows)
    return stream.getvalue()


def json_text(value):
    return json.dumps(value, ensure_ascii=False, indent=2) + "\n"


def label(value):
    return value.strip().lower().lstrip(".")


def require(condition, message):
    if not condition:
        raise ValueError(message)


def share(count, denominator):
    return round(count * 100 / denominator, 6) if denominator else None


def source_inputs(data: Path):
    provenance = json.loads((data / PROVENANCE_NAME).read_text())
    source_bytes = (data / SOURCE_NAME).read_bytes()
    require(sha(source_bytes) == provenance["normalizedCSVSHA256"], "Official APS digest mismatch")
    reader = csv.DictReader(io.StringIO(source_bytes.decode("utf-8-sig"), newline=""))
    require(reader.fieldnames == provenance["csvColumns"], "Official APS column schema changed")
    all_rows = list(reader)
    ids = [row["Application ID"] for row in all_rows]
    require(len(all_rows) == 2783 and len(set(ids)) == 2783 and all(ids), "Official APS row identity failure")
    base = [row for row in all_rows if not row["Application ID"].endswith("-R")]
    replacement = [row for row in all_rows if row["Application ID"].endswith("-R")]
    base_by_id = {row["Application ID"]: row for row in base}
    require(len(base) == 1614 and len(replacement) == 1169, "APS application/record denominator changed")
    for row in replacement:
        original = base_by_id.get(row["Application ID"][:-2])
        require(original is not None, "Orphan replacement record")
        require(original["Applicant Name"] == row["Applicant Name"], "Replacement applicant differs from base")
    excluded = {row["Application ID"] for row in base if row["Application Type"] == "Existing gTLD with Variants"}
    require(excluded == EXISTING_VARIANT_IDS, "The six excluded variant-only base IDs changed")
    require(all((row["Application ID"] in excluded) == (row["Label: Variant Only (Existing TLD)"] == "TRUE") for row in base),
            "Variant-only label/type disagreement")
    new = [row for row in base if row["Application ID"] not in excluded]
    new_strings = {label(row["Primary String"]) for row in new}
    require(len(new) == 1608 and len(new_strings) == 980, "Comparable 1608/980 scope changed")
    require(len({label(row["Primary String"]) for row in base}) == 986, "All-published primary-string scope changed")
    frozen = csv_rows(data / "applications_2026_strings_reveal.csv")
    require(new_strings == {label(row["string"]) for row in frozen}, "APS/frozen 980-string sets differ")
    legacy_bytes = (data / LEGACY_NAME).read_bytes()
    require(sha(legacy_bytes) == LEGACY_SHA256, "Frozen legacy taxonomy changed; review and version this import explicitly")
    legacy = csv_rows(data / LEGACY_NAME)
    require(Counter(row["round"] for row in legacy) == {"2012": 1930, "2026": 1608}, "Legacy map denominator changed")
    evidence = json.loads((data / EVIDENCE_NAME).read_text())
    return provenance, base, excluded, legacy, evidence


def thematic_import(legacy):
    by_string = defaultdict(list)
    all_2026 = defaultdict(list)
    for row in legacy:
        if row["round"] != "2026":
            continue
        all_2026[label(row["string"])].append(row)
        if row["classification_basis"].split(";")[0] == "string-taxonomy" and row["sector_status"] == "classified":
            by_string[label(row["string"])].append(row)
    themes = {}
    for string, rows in by_string.items():
        values = {(row["sector"], row["classification_confidence"]) for row in rows}
        require(len(values) == 1, "Conflicting legacy theme classification for " + string)
        require(len(rows) == len(all_2026[string]), "Mixed applicant/string legacy basis for " + string)
        chosen = min(rows, key=lambda row: row["application_key"])
        themes[string] = {"theme": chosen["sector"], "confidence": chosen["classification_confidence"],
                          "reference": chosen["application_key"], "sourceRows": len(rows)}
    return themes


def make_rows(provenance, base, excluded, legacy, evidence):
    themes = thematic_import(legacy)
    reviewed = {}
    known_names = {row["Applicant Name"].strip() for row in base}
    allowed_sectors = {row["sector"] for row in legacy}
    for entry in evidence["entries"]:
        name = entry["applicant"]
        require(name in known_names and name not in reviewed, "Unknown or duplicate reviewed legal applicant: " + name)
        require(entry["sector"] in allowed_sectors and entry["sources"] and entry["evidence"], "Incomplete sector evidence")
        require(entry["confidence"] in ("high", "medium", "low"), "Unknown sector confidence")
        require(all(url.startswith("https://") for url in entry["sources"]), "Non-public sector evidence URL")
        reviewed[name] = entry
    rows = []
    for source in sorted(base, key=lambda row: row["Application ID"]):
        aid, string = source["Application ID"], label(source["Primary String"])
        theme = themes.get(string) if aid not in excluded else None
        sector = reviewed.get(source["Applicant Name"].strip())
        designations = []
        if source["TLD Type: Brand"] == "TRUE":
            designations.append("brand")
        if source["TLD Type: Community"] == "TRUE":
            designations.append("community")
        if source["TLD Type: Geo (Self-Designated)"] == "TRUE":
            designations.append("geo-self-designated")
        if source["TLD Type: Geo (String Review Confirmed)"] == "TRUE":
            designations.append("geo-review-confirmed")
        rows.append({
            "application_id": aid, "primary_string": string, "primary_unicode": source["Primary String Unicode Label"],
            "applicant_name": source["Applicant Name"], "application_type": source["Application Type"],
            "application_status": source["Application Status"], "application_weight": 1,
            "comparable_scope": aid not in excluded,
            "exclusion_reason": "existing-tld-variant-only" if aid in excluded else "",
            "location_code": source["Location"], "region_code": source["Region"],
            "official_brand_flag": source["TLD Type: Brand"], "official_community_flag": source["TLD Type: Community"],
            "official_geo_self_designated_flag": source["TLD Type: Geo (Self-Designated)"],
            "official_geo_confirmed_flag": source["TLD Type: Geo (String Review Confirmed)"],
            "naming_strategy": "|".join(designations) or "no-positive-APS-designation",
            "naming_strategy_confidence": "source-field-copy", "naming_strategy_basis": "APS-type-flags-not-inferred-generic-status",
            "string_theme": theme["theme"] if theme else "",
            "string_theme_status": "inherited-editorial" if theme else "not-classified",
            "string_theme_confidence": theme["confidence"] if theme else "not-assessed",
            "string_theme_basis": "legacy-string-taxonomy-only" if theme else "no-separate-string-theme-evidence",
            "string_theme_source_file": LEGACY_NAME if theme else "",
            "string_theme_reference_key": theme["reference"] if theme else "",
            "string_theme_source_row_count": theme["sourceRows"] if theme else 0,
            "applicant_sector": sector["sector"] if sector else "",
            "applicant_sector_status": "reviewed-primary-sources" if sector else "not-classified",
            "applicant_sector_confidence": sector["confidence"] if sector else "not-assessed",
            "applicant_sector_basis": sector["basis"] if sector else "no-reviewed-exact-applicant-evidence",
            "applicant_sector_source_urls": " | ".join(sector["sources"]) if sector else "",
            "applicant_sector_reviewed_at": sector["reviewedAt"] if sector else "",
            "corporate_group": "", "corporate_group_status": "not-resolved-no-parent-census",
            "source_url": provenance["sourcePage"] + "/" + aid + "/summary",
            "source_observed_utc": provenance["retrievedAtUTC"], "source_sha256": provenance["normalizedCSVSHA256"],
        })
    return rows, themes


def distribution(rows, scope, field):
    selected = rows if scope == "all_published" else [row for row in rows if row["comparable_scope"]]
    groups = defaultdict(list)
    for row in selected:
        groups[row[field] or "[not classified or missing]"].append(row)
    result = []
    for category, items in sorted(groups.items(), key=lambda pair: (-len(pair[1]), pair[0])):
        result.append({
            "scope": scope, "category": category, "applications": len(items), "denominator": len(selected),
            "share_of_all_pct": share(len(items), len(selected)),
            "distinct_applicant_names": len({item["applicant_name"] for item in items}),
            "observed_location_codes": " | ".join(sorted({item["location_code"] for item in items if item["location_code"]})),
            "source_observed_utc": items[0]["source_observed_utc"], "source_sha256": items[0]["source_sha256"],
        })
    require(sum(item["applications"] for item in result) == len(selected), "Distribution does not conserve applications")
    return result


def coverage(rows):
    return {
        "applications": len(rows), "distinctPrimaryStrings": len({row["primary_string"] for row in rows}),
        "distinctApplicantNames": len({row["applicant_name"] for row in rows}),
        "distinctLocationCodes": len({row["location_code"] for row in rows if row["location_code"]}),
        "stringThemeClassified": sum(bool(row["string_theme"]) for row in rows),
        "stringThemeMissing": sum(not row["string_theme"] for row in rows),
        "applicantSectorClassified": sum(bool(row["applicant_sector"]) for row in rows),
        "applicantSectorMissing": sum(not row["applicant_sector"] for row in rows),
        "reviewedApplicantNames": len({row["applicant_name"] for row in rows if row["applicant_sector"]}),
        "locationMissing": sum(not row["location_code"] for row in rows),
        "regionMissing": sum(not row["region_code"] for row in rows),
        "corporateGroupResolved": 0,
        "officialFlagCounts": {
            "brand": sum(row["official_brand_flag"] == "TRUE" for row in rows),
            "community": sum(row["official_community_flag"] == "TRUE" for row in rows),
            "geoSelfDesignated": sum(row["official_geo_self_designated_flag"] == "TRUE" for row in rows),
            "geoReviewConfirmed": sum(row["official_geo_confirmed_flag"] == "TRUE" for row in rows),
        },
    }


def concentration_document(data, provenance, rows):
    path = data / "registry_concentration_context.csv"
    existing = csv_rows(path)
    columns = list(existing[0])
    # Separate curated context from generated observations: the output is never its own
    # input, and archived concentration files are not read or rewritten.
    generated_layers = {"Largest legal applicant (APS-derived)", "Corporate-group ranking coverage",
                        "Local 2012 corpus applications", "Historical contextual statement"}
    retained = [row for row in existing if row["Entity"] != "[official dataset]" and row["Layer"] not in generated_layers]
    for row in retained:
        if row["Year"] == "2012" and row["Entity"] == "Donuts" and row["Layer"] == "Applications":
            row["Fact"] = "The 2013 WIPO determination recounts Donuts' 307 applied-for strings and Google's 101. Its separate Amazon figure is preserved below as historical context, not substituted for the local corpus count."
            row["Interpretation"] = "Donuts is a group-level historical portfolio statement; it is not directly equivalent to a single-legal-applicant count derived from the 2026 APS listing."
    history = csv_rows(data / "applications_2012.csv")
    amazon_name = "Amazon EU S.à r.l."
    amazon = [row for row in history if row["applicant"] == amazon_name]
    require(len(amazon) == 76, "Amazon local 2012 corpus count changed")
    top = Counter(row["applicant_name"] for row in rows).most_common(1)[0]
    retained.extend([
        dict(Year="2012", Entity=amazon_name, Layer="Local 2012 corpus applications", Value=len(amazon), Unit="applications",
             Fact="76 application records for the exact legal applicant in the locally preserved 1,930-row 2012 corpus; derived by exact applicant-name equality.",
             Source="data/applications_2012.csv", Interpretation="Use this 76-record corpus count in local comparative charts; the 78-string historical statement below has no reconciled list of application IDs."),
        dict(Year="2013", Entity="Amazon (historical reference to the 2012 round)", Layer="Historical contextual statement", Value=78, Unit="strings stated in 2013 proceeding",
             Fact="WIPO determination LRO2013-0021, page 4, recounts 78 Amazon strings with attribution to paragraph 14 of a Donuts executive's declaration; the passage supplies no application-level reconciliation.",
             Source="https://newgtlds.icann.org/sites/default/files/drsp/25sep13/determination-1-1-1462-36448-en.pdf",
             Interpretation="Historical source context only. This is not a second count of the local Amazon EU S.à r.l. corpus; the cause of the 76/78 difference is not established."),
        dict(Year="2026", Entity=top[0], Layer="Largest legal applicant (APS-derived)", Value=top[1], Unit="base applications / 1614 published",
             Fact=f"Project-derived count from the official APS CSV captured {provenance['retrievedAtUTC']}: exact Applicant Name, one base Application ID per application, replacement records excluded.",
             Source=provenance["sourceExportURL"], Interpretation="158/1614 = " + str(share(top[1], len(rows))) + "% of the public listing. The new-primary scope has the same 158 applications over 1608. This is not an official ICANN ranking or an ultimate-parent ranking."),
        dict(Year="2026", Entity="Corporate groups (not resolved)", Layer="Corporate-group ranking coverage", Value="", Unit="applications",
             Fact="Missing: no systematic, source-reviewed direct/ultimate-parent census is included in the current analytical layer.",
             Source="data/aps_2026_current_analytics_manifest.json", Interpretation="Missing is not zero. Legal-applicant counts must not be renamed corporate-group counts or compared directly with group totals."),
    ])
    return csv_text(retained, columns)


def generate(data=DATA):
    provenance, base, excluded, legacy, evidence = source_inputs(data)
    rows, themes = make_rows(provenance, base, excluded, legacy, evidence)
    fields = {"applicants": "applicant_name", "locations": "location_code", "regions": "region_code",
              "stringThemes": "string_theme", "applicantSectors": "applicant_sector", "namingDesignations": "naming_strategy"}
    distributions = {key: [item for scope in SCOPES for item in distribution(rows, scope, field)]
                     for key, field in fields.items()}
    new_rows = [row for row in rows if row["comparable_scope"]]
    summary = {
        "schemaVersion": 1, "layerId": "aps-current-analytics-2026-10-18",
        "publicationStatus": "current-derived-analysis-not-archived-RR1-or-RR2",
        "editorialRevisionDate": evidence["editorialRevisionDate"],
        "sourceURL": provenance["sourceExportURL"], "sourceSHA256": provenance["normalizedCSVSHA256"],
        "retrievedAtUTC": provenance["retrievedAtUTC"],
        "officialReportedApplications": provenance["officialStatisticsTotalApplications"],
        "coverage": {"all_published": coverage(rows), "new_primary": coverage(new_rows)},
        "scopes": {
            "all_published": "1614 unique published base Application IDs; -R replacement records excluded.",
            "new_primary": "1608 published base IDs after excluding six Existing gTLD with Variants applications; 980 primary labels.",
        },
        "excludedExistingVariantApplications": sorted(excluded),
        "absentFromPublicListing": provenance["pendingAdministrativeCheckApplicationID"],
        "legacyImport": {
            "file": LEGACY_NAME, "sha256": LEGACY_SHA256,
            "rule": "Only classified 2026 string-taxonomy rows, collapsed to one theme assertion per primary string, then joined to each official base ID. No applicant-sector, group-override or brand-based legacy classifications are propagated.",
            "distinctImportedThemeStrings": len(themes),
            "legacySourceRowsCollapsed": sum(value["sourceRows"] for value in themes.values()),
            "officialApplicationsWithImportedTheme": sum(bool(row["string_theme"]) for row in rows),
            "legacyMixedClassifiedApplications": sum(row["round"] == "2026" and row["sector_status"] == "classified" for row in legacy),
            "applicationWeight": 1,
        },
        "distributions": distributions,
        "exampleAgent": [{"applicationId": row["application_id"], "applicant": row["applicant_name"],
                          "stringTheme": row["string_theme"], "applicantSector": row["applicant_sector"] or None,
                          "applicantSectorStatus": row["applicant_sector_status"]}
                         for row in rows if row["primary_string"] == "agent"],
        "limitations": [
            "All rankings and shares are project-derived from a dated official listing, not ICANN-published aggregate rankings.",
            "One application has weight 1; no weight is added for a replacement, variant or duplicated legacy theme assertion.",
            "Location and Region are copied APS fields, including ICANN regional assignments; they do not establish headquarters, ultimate ownership, DNS serving location or sovereign jurisdiction over users.",
            "Legal applicants are grouped by exact published name, not by corporate family; display trimming does not merge entities.",
            "String themes retain a selected inherited editorial taxonomy and its per-theme confidence; ICANN does not classify those themes.",
            "Applicant sectors are an intentionally partial evidence-reviewed selection. Missing is not an economic sector and the classified subset is not a representative sample.",
            "The legal applicant's documented activity is distinct from the industry of a parent company. A registry affiliate need not already operate an awarded 2026 TLD.",
            "Naming designations are source flags; a FALSE brand flag does not prove a generic naming strategy or a final eligibility outcome.",
            "Naming-designation combinations partition applications, while individual flags overlap: 331 brand-only plus two brand-and-geo applications give 333 TRUE brand flags.",
            "No ultimate-parent classification is imported. The archived mixed 2012/2026 economic map and RR1/RR2 artifacts are unchanged.",
            "2012 and this new 2026 two-variable model do not yet form a harmonized industry time series; archived mixed-sector charts remain historical context.",
        ],
    }
    outputs = {"aps_2026_current_analytics.csv": csv_text(rows, CSV_COLUMNS),
               "aps_2026_current_analytics.json": json_text(summary),
               "aps_2026_current_analytics.js": "/* generated: derived current APS analysis; not archived RR1/RR2 */\nwindow.CTD_APS_ANALYTICS=" + json.dumps(summary, ensure_ascii=False, separators=(",", ":")) + ";\n",
               "registry_concentration.csv": concentration_document(data, provenance, rows)}
    for key, name in (("applicants", "applicant"), ("locations", "location"), ("regions", "region"),
                      ("stringThemes", "string_theme"), ("applicantSectors", "applicant_sector")):
        outputs[f"aps_2026_{name}_distribution.csv"] = csv_text(distributions[key], DIST_COLUMNS)
    manifest = {
        "schemaVersion": 1, "layerId": summary["layerId"], "publicationStatus": summary["publicationStatus"],
        "editorialRevisionDate": summary["editorialRevisionDate"], "sourceObservedUTC": summary["retrievedAtUTC"],
        "generator": "scripts/build_aps_current_analytics.py", "generatorSHA256": sha(Path(__file__).read_bytes()),
        "inputs": {name: {"sha256": sha((data / name).read_bytes()), "bytes": (data / name).stat().st_size}
                   for name in (SOURCE_NAME, PROVENANCE_NAME, LEGACY_NAME, EVIDENCE_NAME,
                                "applications_2026_strings_reveal.csv", "applications_2012.csv",
                                "registry_concentration_context.csv")},
        "coverage": summary["coverage"], "scopes": summary["scopes"], "legacyImport": summary["legacyImport"],
        "excludedExistingVariantApplications": sorted(excluded), "officialReportedApplications": 1615,
        "absentFromPublicListing": summary["absentFromPublicListing"],
        "files": {name: {"sha256": sha(content.encode("utf-8")), "bytes": len(content.encode("utf-8"))}
                  for name, content in outputs.items()},
        "limitations": summary["limitations"],
        "checks": ["APS source digest and full column schema", "2783 unique records = 1614 base + 1169 linked replacements",
                   "exact six existing-variant-only exclusions", "1608 applications / 980 labels; exact frozen-index label-set equality",
                   "legacy immutable map digest", "one non-conflicting imported assertion per string", "unit application weights",
                   "all distributions conserve their explicit denominator", "no synthesized parent groups", "Amazon exact local corpus count 76"],
    }
    outputs["aps_2026_current_analytics_manifest.json"] = json_text(manifest)
    require(len(rows) == len({row["application_id"] for row in rows}) == 1614, "Current row identity failure")
    require(all(row["application_weight"] == 1 and not row["corporate_group"] for row in rows), "Weight or corporate-group invariant violated")
    return outputs, summary


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Verify generated files without rewriting them")
    args = parser.parse_args()
    outputs, summary = generate()
    stale = []
    for name, content in outputs.items():
        target = DATA / name
        if args.check:
            if not target.exists() or target.read_bytes() != content.encode("utf-8"):
                stale.append(name)
        else:
            target.write_text(content, encoding="utf-8", newline="\n")
    require(not stale, "Generated current analytics differ: " + ", ".join(stale))
    print("APS_CURRENT_ANALYTICS_VERIFIED " + json.dumps({"coverage": summary["coverage"], "files": len(outputs)}, sort_keys=True))


if __name__ == "__main__":
    main()
