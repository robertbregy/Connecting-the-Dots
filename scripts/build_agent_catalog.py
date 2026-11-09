#!/usr/bin/env python3
"""Build a small, source-dated entry point to the publication's existing data.

This does not fetch evidence, change crawler permissions, or modify an archive.
Run after render_discovery.cjs.  --check validates inputs without writing files.
"""
from __future__ import annotations

import argparse
import csv
import hashlib
import json
from pathlib import Path
from urllib.parse import urljoin, urlsplit


ROOT = Path(__file__).resolve().parents[1]
LANGUAGES = ("en", "it", "de", "fr")
LICENSE_NOTE = (
    "Original project text and compilation/schema work are CC BY 4.0 unless "
    "otherwise indicated. Original ICANN/IANA and other third-party records "
    "retain their source-specific rights and terms; inclusion does not relicense them."
)


def read_json(root: Path, relative: str) -> dict:
    return json.loads((root / relative).read_text(encoding="utf-8"))


def read_csv(root: Path, relative: str) -> list[dict[str, str]]:
    with (root / relative).open(encoding="utf-8-sig", newline="") as stream:
        return list(csv.DictReader(stream))


def label(value: str) -> str:
    return value.strip().lower().lstrip(".")


def file_digest(root: Path, relative: str) -> str:
    return hashlib.sha256((root / relative).read_bytes()).hexdigest()


def local_path(root: Path, relative: str, *, must_exist: bool = True) -> Path:
    """Manifest entries are project-relative public files, never remote inputs."""
    if not isinstance(relative, str) or not relative or urlsplit(relative).scheme:
        raise ValueError(f"Not a project-relative path: {relative!r}")
    path = (root / relative).resolve()
    if not path.is_relative_to(root.resolve()):
        raise ValueError(f"Path leaves the project: {relative!r}")
    if must_exist:
        check = path / "index.html" if relative.endswith("/") else path
        if not check.is_file():
            raise ValueError(f"Missing public catalog resource: {relative}")
    return path


def derive_counts(root: Path) -> dict:
    """Count different units independently; never interpret UI totals as TLDs."""
    core = read_csv(root, "data/explorer_catalog.csv")
    universe = read_csv(root, "data/tld_universe.csv")
    application_only = read_csv(root, "data/application_only_strings.csv")
    strings = read_csv(root, "data/applications_2026_strings_reveal.csv")
    source_rows = read_csv(root, "data/applications_2026_aps_official_listing.csv")
    graph = read_json(root, "data/aps_2026_application_graph.json")
    graph_manifest = read_json(root, "data/aps_2026_application_graph_manifest.json")
    provenance = read_json(root, "data/applications_2026_aps_official_provenance.json")
    snapshot = read_json(root, "data/application_2026_snapshot.json")
    iana = read_json(root, "data/iana_snapshot.json")

    core_labels = {label(row.get("ascii_string") or row["string"]) for row in core}
    reveal_labels = {label(row["string"]) for row in strings}
    assert len(core_labels) == len(core), "Duplicate identities in the base Explorer catalog"
    assert len(reveal_labels) == len(strings), "Duplicate identities in the 2026 string index"
    assert len(core) == len(universe) + len(application_only), "Explorer base scope changed"

    base_rows = [row for row in source_rows if not row["Application ID"].endswith("-R")]
    replacements = [row for row in source_rows if row["Application ID"].endswith("-R")]
    base_ids = {row["Application ID"] for row in base_rows}
    assert len(base_ids) == len(base_rows), "Duplicate APS base application identifiers"
    assert len({row["Application ID"] for row in source_rows}) == len(source_rows), "Duplicate APS row identifiers"
    assert all(row["Application ID"][:-2] in base_ids for row in replacements), "Unlinked APS replacement row"
    assert {app["id"] for app in graph["apps"]} == base_ids, "APS graph/listing identity mismatch"
    variants = [row for row in base_rows if row["Label: Variant Only (Existing TLD)"].strip().lower() == "true"]
    new_rows = [row for row in base_rows if row not in variants]
    new_labels = {label(row["Primary String"]) for row in new_rows}
    assert new_labels == reveal_labels, "The frozen string inventory and APS scope have diverged"
    assert sum(int(row["applications"]) for row in strings) == len(new_rows), "String-index application weights changed"

    aps = {
        "officialReportedApplications": snapshot["official"]["activeApplications"],
        "officialStatisticsPublishedAt": snapshot["official"]["lastPublished"],
        "publicListingRows": len(source_rows),
        "publishedBaseApplications": len(base_rows),
        "replacementRows": len(replacements),
        "newPrimaryStringApplications": len(new_rows),
        "distinctNewPrimaryStrings": len(new_labels),
        "variantOnlyExistingTldApplications": len(variants),
        "publicListingObservedAt": provenance["retrievedAtUTC"],
        "reportedVersusPublishedGap": snapshot["official"]["activeApplications"] - len(base_rows),
        "unpublishedApplicationIds": [graph["notPublishedApplication"]["id"]],
    }
    expected = graph_manifest["counts"]
    for actual, key in (
        ("publicListingRows", "officialListingRows"),
        ("publishedBaseApplications", "officialPublishedApplications"),
        ("replacementRows", "replacementRecords"),
        ("newPrimaryStringApplications", "newPrimaryStringApplications"),
        ("distinctNewPrimaryStrings", "newPrimaryStrings"),
        ("variantOnlyExistingTldApplications", "variantOnlyExistingTldApplications"),
        ("officialReportedApplications", "officialReportedApplications"),
    ):
        assert aps[actual] == expected[key], f"APS manifest count mismatch: {actual}"
    assert file_digest(root, "data/applications_2026_aps_official_listing.csv") == graph_manifest["sourceSha256"], "APS source digest changed"
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
            "scopeNote": "The combined interface joins the base CSV and the separately frozen 2026 string index. Its name count is not a count of applications or of delegated TLDs.",
        },
        "aps2026": aps,
    }


def build_catalog(root: Path = ROOT, discovery_manifest: dict | None = None) -> dict:
    root = Path(root).resolve()
    pub = read_json(root, "publication.json")
    base = pub["deployment"]
    assert base.endswith("/"), "The deployment base must end with a slash"
    manifest = discovery_manifest if discovery_manifest is not None else read_json(root, "discovery/manifest.json")
    assert manifest["schemaVersion"] == 1, "Unsupported discovery manifest"
    assert manifest["siteVersion"] == pub["version"], "Discovery pages belong to another site version"
    counts = derive_counts(root)
    iana = read_json(root, "data/iana_snapshot.json")
    snapshot = read_json(root, "data/application_2026_snapshot.json")
    aps_provenance = read_json(root, "data/applications_2026_aps_official_provenance.json")
    graph_manifest = read_json(root, "data/aps_2026_application_graph_manifest.json")
    analytics = read_json(root, "data/aps_2026_current_analytics_manifest.json")
    archives = read_json(root, "research/research_release_manifest.json")
    bibliographic = read_json(root, "data/research_bibliographic_corrections.json")

    def resource(relative: str) -> dict:
        local_path(root, relative)
        return {"path": relative, "url": urljoin(base, relative)}

    pages = []
    identities = set()
    for page in manifest["pages"]:
        identity = (page["kind"], page["language"], page["key"])
        assert identity not in identities, f"Duplicate discovery page: {identity}"
        identities.add(identity)
        assert page["language"] in LANGUAGES, "Unknown discovery language"
        entry = {
            **resource(page["path"]),
            "language": page["language"],
            "kind": page["kind"],
            "key": page["key"],
            "title": page["title"],
            "description": page["description"],
            "interactiveUrl": page["interactiveUrl"],
        }
        if page.get("markdownPath"):
            entry["markdown"] = resource(page["markdownPath"])
        pages.append(entry)
    assert pages, "The discovery page collection must not be empty"

    def dataset(identifier, title, relative, unit, count, scope, provenance, observation_date=None, *, layer="derived", note="", **extra):
        item = {
            "id": identifier,
            "title": title,
            **resource(relative),
            "mediaType": "text/csv" if relative.endswith(".csv") else "application/json",
            "sha256": file_digest(root, relative),
            "layer": layer,
            "unit": unit,
            "recordCount": count,
            "scope": scope,
            "observationDate": observation_date,
            "provenance": resource(provenance),
            "licenseNoticeUrl": urljoin(base, "CONTENT_LICENSE.md"),
            "licenseNote": LICENSE_NOTE,
        }
        if note:
            item["interpretationNote"] = note
        item.update(extra)
        return item

    datasets = [
        dataset(
            "tld-universe", "TLD and historical profile universe", "data/tld_universe.csv",
            "TLD/profile identity", counts["explorer"]["tldAndHistoricalProfileRecords"],
            "IANA database profiles plus historically delegated TLDs absent from that database; application-only names are excluded.",
            "data/iana_snapshot.json", iana["asOf"],
            note="root_listed identifies membership in the dated root list; database presence and delegated status are different observations.",
        ),
        dataset(
            "explorer-base", "Base Explorer catalog", "data/explorer_catalog.csv",
            "distinct name", counts["explorer"]["baseCatalogRecords"],
            "Historical TLD/profile catalog and locally preserved application-only names; excludes the separate runtime union with the 2026 string index.",
            "data/manifest.json",
            note="Dates are per record. Combine ASCII-normalized names with frozen-2026-strings only when the combined interface scope is required.",
            dateFields=["current_as_of", "source_retrieved_at", "registration_date"],
        ),
        dataset(
            "frozen-2026-strings", "Frozen secondary Reveal Day primary-string inventory", "data/applications_2026_strings_reveal.csv",
            "distinct new primary string", counts["explorer"]["frozen2026PrimaryStringNames"],
            "Secondary string-level index over public APS records, reconciled to the new-primary-string subset of the later preserved APS export.",
            "data/application_2026_snapshot.json", snapshot["stringInventory"]["observedAt"], layer="secondary-frozen-index",
            evidenceDate=snapshot["stringInventory"]["snapshot"],
            sourceUrl=snapshot["stringInventory"]["source"],
            note="applications is a per-string weight; strings, applications and existing-TLD-variant applications are different units.",
        ),
        dataset(
            "aps-public-listing", "ICANN APS public listing, original fields preserved", "data/applications_2026_aps_official_listing.csv",
            "APS listing row", counts["aps2026"]["publicListingRows"],
            "Complete downloadable public listing at retrieval, including base applications and linked -R replacement records; not the full questionnaires or confidential dossiers.",
            "data/applications_2026_aps_official_provenance.json", aps_provenance["retrievedAtUTC"], layer="source-records",
            sourceUrl=aps_provenance["sourceExportURL"],
            note=aps_provenance["csvPreambleNotice"][0],
        ),
        dataset(
            "aps-application-graph", "Published APS applications and their string relationships", "data/aps_2026_application_graph.json",
            "published base application", counts["aps2026"]["publishedBaseApplications"],
            "Reconciled public listing: base application identities, alternatives, variants and derived exact-primary-string groups.",
            "data/aps_2026_application_graph_manifest.json", graph_manifest["retrievedAtUTC"],
            note="A -R record is an alternative, not an additional application. Derived exact-string groups are not final official contention decisions.",
        ),
        dataset(
            "aps-status-observations", "Source-dated APS status observations", "data/aps_2026_record_observations.csv",
            "source observation of an APS record", len(read_csv(root, "data/aps_2026_record_observations.csv")),
            "Append-only observations tied to a source digest; includes base and replacement records.",
            "data/aps_2026_application_graph_manifest.json", graph_manifest["retrievedAtUTC"],
            note="An observed status is not a prediction. Absence from a later listing would not by itself establish withdrawal.",
        ),
        dataset(
            "aps-local-dossiers", "Separately curated local 2026 application records", "data/applications_2026.csv",
            "locally curated application record", len(read_csv(root, "data/applications_2026.csv")),
            "A small, separately maintained local dossier layer; its count does not describe the coverage of the APS public listing or graph.",
            "data/application_2026_snapshot.json",
            note="Partial coverage. Read source_snapshot and public_application_url in each row. Do not use this file to count the entire round.",
            dateFields=["source_snapshot"],
        ),
        dataset(
            "aps-current-analysis", "Current derived APS analysis", "data/aps_2026_current_analytics.csv",
            "published base application with explicit analysis scopes", len(read_csv(root, "data/aps_2026_current_analytics.csv")),
            "Current derived analysis with all_published and new_primary scopes; string themes and applicant sectors are separate, partially classified variables.",
            "data/aps_2026_current_analytics_manifest.json", analytics["sourceObservedUTC"],
            editorialRevisionDate=analytics["editorialRevisionDate"],
            archivalStatus=analytics["publicationStatus"],
            note="This analysis is not covered by the RR1 or RR2 DOI. Missing sector classifications are not an economic sector or a representative sample.",
        ),
        dataset(
            "applications-2012", "Historical ICANN 2012 application–string–applicant graph", "data/applications_2012.csv",
            "2012 application", len(read_csv(root, "data/applications_2012.csv")),
            "The complete historical string/applicant graph with separately documented later string corrections; richer original metadata is not claimed as complete.",
            "data/application_archaeology_manifest.json", "2012-06-13",
            note="Primary contact and email fields are excluded. Later source-backed outcomes must not be inferred from present-day root status.",
        ),
        dataset(
            "economic-metrics", "Source-backed economic metrics", "data/economic_metrics.csv",
            "economic observation", len(read_csv(root, "data/economic_metrics.csv")),
            "Selected case observations retaining original period, currency and accounting basis.",
            "data/manifest.json",
            note="Revenue, financial results, auction prices, asset transactions and projections are not interchangeable measures. Use each row's source and basis.",
            dateFields=["period"],
        ),
    ]

    def release(record: dict) -> dict:
        result = {
            "id": record["id"], "doi": record["doi"], "doiUrl": record["doiUrl"],
            "publicationDate": record["publishedOn"],
            "evidenceCutoff": record["dataSnapshot"]["publicationAsOf"],
            "sourceSnapshots": record["dataSnapshot"],
            "gitTag": record["githubTag"], "frozenCommit": record["githubFrozenCommit"],
            "immutable": True,
        }
        if record["id"] == bibliographic["researchRelease"]:
            assert record["doi"] == bibliographic["doi"], "Bibliographic correction targets another DOI"
            result.update({
                "publicationDate": bibliographic["zenodoDatePublished"],
                "depositCreatedAt": bibliographic["zenodoDateCreated"],
                "githubReleaseDate": bibliographic["githubReleaseDate"],
                "evidenceCutoff": bibliographic["evidenceCutoff"],
                "bibliographicCorrection": resource("data/research_bibliographic_corrections.json"),
            })
        return result

    origin = urlsplit(base)
    return {
        "schemaVersion": 1,
        "id": urljoin(base, "agent-catalog.json"),
        "title": "Connecting the Dots — source and reading catalog",
        "description": "An independent multilingual research atlas of Internet names and ICANN applications. This catalog distinguishes reading pages, data units, observation dates and archived research releases.",
        "author": {"name": "Robert Bregy", "url": "https://github.com/robertbregy"},
        "websiteRelease": {"version": pub["version"], "releasedOn": pub["releasedOn"], "url": base},
        "dateSemantics": {
            "websiteRelease": "Technical/editorial publication date; it does not redate the underlying observations.",
            "observationDate": "Source snapshot or retrieval date for the stated dataset; null means dates vary and the listed per-row fields must be read.",
            "publicationDate": "Bibliographic publication date of an archived research release, distinct from its evidence cutoff.",
        },
        "entryPoints": {
            "languages": {lang: urljoin(base, lang + "/") for lang in LANGUAGES},
            "discoveryManifest": resource("discovery/manifest.json"),
            "dataManifest": resource("data/manifest.json"),
            "researchGuide": resource("research/"),
            "sitemap": resource("sitemap.xml"),
        },
        "pages": sorted(pages, key=lambda page: (page["kind"], page["key"], page["language"])),
        "snapshotCounts": counts,
        "datasets": datasets,
        "research": {
            "currentArchivedRelease": release(archives["currentResearchRelease"]),
            "previousArchivedReleases": [release(record) for record in archives["previousResearchReleases"]],
            "currentWorkingPaper": {
                "version": pub["paperVersion"], "revisedOn": pub["paperRevisedOn"],
                **resource(pub["paperPath"]),
                "status": "working draft; not peer reviewed",
                "relationshipToArchives": archives["workingPaperRevision"]["relationToRR2"],
            },
            "citationFile": resource("CITATION.cff"),
            "rule": "Cite the specific dated source or dataset used. The latest technical website version and current derived analyses are not automatically part of the archived DOI release.",
        },
        "crawlerPolicy": {
            "authoritativeRobotsUrl": f"{origin.scheme}://{origin.netloc}/robots.txt",
            "projectRobotsCopyUrl": urljoin(base, "robots.txt"),
            "scopeNote": "Only the host-root robots.txt controls Robots Exclusion Protocol crawling. A project-subdirectory copy is informational.",
            "catalogRole": "Navigation and provenance only; this file and llms.txt do not grant permissions, change source licenses, or promise indexing or AI citations.",
        },
        "interpretationNotes": [
            "A TLD in the dated root, a historical name, an application, a primary string, a replacement and a variant are distinct units.",
            "The combined Explorer is a union of two name sets, not another official ICANN application total.",
            "The official reported total and the downloadable public listing have different coverage; retain the published gap rather than inventing a missing row.",
            "A false APS contention flag before String Evaluation is not evidence that no contention exists.",
            "Facts, editorial interpretation and prospective ideas are identified separately in the reading pages.",
            "Current availability of a page does not turn its dated evidence into a live status check.",
        ],
        "licensing": {"notice": resource("CONTENT_LICENSE.md"), "scope": LICENSE_NOTE},
    }


def render_llms(catalog: dict) -> str:
    """A short route map, not an alternative copy of the complete research corpus."""
    base = catalog["websiteRelease"]["url"]
    version = catalog["websiteRelease"]["version"]
    date = catalog["websiteRelease"]["releasedOn"]
    aps = catalog["snapshotCounts"]["aps2026"]
    explorer = catalog["snapshotCounts"]["explorer"]
    rr = catalog["research"]["currentArchivedRelease"]

    def markdown_label(value: str) -> str:
        return " ".join(value.split()).replace("\\", "\\\\").replace("[", "\\[").replace("]", "\\]")

    lines = [
        "# Connecting the Dots", "",
        "> Independent research atlas by Robert Bregy about Internet TLDs, ICANN applications, governance, economics and society. Available in English, Italian, German and French.", "",
        f"Website version {version}, published {date}. This is the technical/editorial release date, not the observation date of every fact. Read the source date and scope beside each claim.", "",
        "## Start here", "",
        f"- [Machine-readable catalog]({base}agent-catalog.json): page URLs, data units, source dates, provenance, licensing and archived releases.",
        f"- [Reading-page index]({base}discovery/manifest.json): focused HTML pages and their available Markdown versions, in all four languages.",
        f"- [Research and citation]({base}research/): method, current working paper, archived evidence and how to cite it.",
        f"- [Complete data manifest]({base}data/manifest.json): existing CSV/JSON resources and integrity information.",
        "",
        "## Reading pages", "",
    ]
    # One locale keeps this entry point compact; the linked manifest exposes the
    # corresponding IT/DE/FR pages without expanding all content into llms.txt.
    for page in catalog["pages"]:
        if page["language"] != "en" or page["kind"] not in ("guide", "tld"):
            continue
        target = page.get("markdown", {}).get("url", page["url"])
        lines.append(f"- [{markdown_label(page['title'])}]({target}): {markdown_label(page['description'])}")
    lines += ["", "## Languages", ""]
    names = {"en": "English", "it": "Italiano", "de": "Deutsch", "fr": "Français"}
    for language, url in catalog["entryPoints"]["languages"].items():
        lines.append(f"- [{names[language]}]({url}): interactive atlas; focused reading URLs are listed in the reading-page index.")
    lines += [
        "", "## Data and scope", "",
        f"The combined Explorer contains {explorer['combinedExplorerNames']:,} names: {explorer['baseCatalogRecords']:,} base records plus {explorer['frozen2026PrimaryStringNames']:,} frozen 2026 primary strings, minus {explorer['overlappingNames']:,} overlapping names. This is not a count of delegated TLDs. The root snapshot contains {explorer['rootListedTlds']:,} TLDs at {explorer['rootObservationDate']}.", "",
        f"The APS export observed at {aps['publicListingObservedAt']} contains {aps['publicListingRows']:,} rows: {aps['publishedBaseApplications']:,} base applications and {aps['replacementRows']:,} linked replacement rows. Its new-primary subset has {aps['newPrimaryStringApplications']:,} applications over {aps['distinctNewPrimaryStrings']:,} strings; {aps['variantOnlyExistingTldApplications']:,} other base applications concern variants of existing TLDs. The separately published official total is {aps['officialReportedApplications']:,}; retain the documented public-listing gap.", "",
    ]
    for dataset in catalog["datasets"]:
        lines.append(f"- [{dataset['title']}]({dataset['url']}): {dataset['recordCount']:,} records; unit: {dataset['unit']}. [Provenance]({dataset['provenance']['url']}).")
    lines += [
        "", "## Interpretation and citation", "",
        "Application, delegation, replacement, variant and derived exact-string grouping have different meanings. A false APS contention flag does not establish absence of contention before String Evaluation. Facts, interpretation and prospective ideas remain separate; undocumented outcomes are not inferred.", "",
        f"The current archived research release is [{rr['id']}]({rr['doiUrl']}), bibliographic publication date {rr['publicationDate']}, evidence cutoff {rr['evidenceCutoff']}. The newer website and current derived APS analysis are not automatically included in this DOI. Previous research releases remain immutable and separately citable.", "",
        f"- [Citation file]({base}CITATION.cff): archived research citation.",
        f"- [Research release manifest]({base}research/research_release_manifest.json): archived versions and working-paper relationship.",
        f"- [Bibliographic date clarification]({base}data/research_bibliographic_corrections.json): deposit creation, GitHub release, evidence cutoff and Zenodo publication date.",
        "", "## Access and reuse", "",
        f"Original project work is CC BY 4.0 unless indicated otherwise. Third-party records retain their original rights and terms; consult the [licensing notice]({base}CONTENT_LICENSE.md) and the linked sources.", "",
        f"The authoritative crawler policy is at [{catalog['crawlerPolicy']['authoritativeRobotsUrl']}]({catalog['crawlerPolicy']['authoritativeRobotsUrl']}). The robots.txt copy under the project path is not authoritative. This index is a navigation aid, not a permission grant or a guarantee of search visibility.", "",
    ]
    return "\n".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Validate sources and construct outputs in memory without writing files")
    parser.add_argument("--root", type=Path, default=ROOT, help=argparse.SUPPRESS)
    args = parser.parse_args()
    catalog = build_catalog(args.root)
    text = render_llms(catalog)
    if not args.check:
        (args.root / "agent-catalog.json").write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        (args.root / "llms.txt").write_text(text, encoding="utf-8")
    print(json.dumps({"agentCatalog": "validated" if args.check else "written", "siteVersion": catalog["websiteRelease"]["version"], "pages": len(catalog["pages"]), "datasets": len(catalog["datasets"]), "llmsBytes": len(text.encode("utf-8")), "counts": catalog["snapshotCounts"]}, ensure_ascii=False))


if __name__ == "__main__":
    main()
