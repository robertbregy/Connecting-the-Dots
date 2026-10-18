#!/usr/bin/env python3
"""Build a reproducible, explicitly incomplete semantic reading of the full corpus.

No network, applicant-sector inference, source rewrites or publication. The same
existing string dictionaries are applied to every distinct label and cohort.
"""
from __future__ import annotations

import argparse
import csv
import hashlib
import io
import json
import re
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
INPUTS = ["tld_universe.csv", "application_strings_2000.csv", "applications_2000.csv",
          "applications_2004.csv", "applications_2012.csv", "applications_2026_aps_official_listing.csv",
          "applications_2026_aps_official_provenance.json", "aps_2026_current_analytics.csv",
          "application_economic_map_2012_2026.csv", "explorer_catalog.csv"]
LABELS = {
    "technology": "Technology", "commerce": "Commerce & finance",
    "professions": "Professions & services", "culture": "Culture, media & education",
    "lifestyle": "Lifestyle, mobility & leisure", "health": "Health",
    "community": "Identity & community", "geography": "Places & territories",
    "brand": "Brand designation (APS 2026)", "institutions": "Institutions & public interest",
    "territorial-code": "Territorial codes", "unclassified": "Unclassified",
}
COMPARABLE = [x for x in LABELS if x not in {"brand", "territorial-code", "unclassified"}]
TOPIC_FAMILY = {"topicTechnology": "technology", "topicBusiness": "commerce", "topicFinance": "commerce",
                "topicCultureMedia": "culture", "topicSociety": "community", "topicPublic": "institutions",
                "topicLifestyle": "lifestyle", "topicServices": "professions", "topicGeography": "geography"}
SECTOR_FAMILY = {
    "Technology, software & infrastructure": "technology", "AI & automation": "technology",
    "Crypto & digital assets": "technology|commerce", "Cybersecurity, identity & trust": "technology",
    "Telecom & connectivity": "technology", "Registry & domain industry": "technology",
    "Retail & commerce": "commerce", "Finance & insurance": "commerce",
    "Energy, industrial & materials": "commerce", "Professional & business services": "professions",
    "Real estate & construction": "professions", "Media, social & communications": "culture",
    "Education & research": "culture", "Consumer & lifestyle": "lifestyle",
    "Gaming, sports & entertainment": "lifestyle", "Automotive & mobility": "lifestyle",
    "Travel & hospitality": "lifestyle", "Food & beverage": "lifestyle",
    "Health & life sciences": "health", "Public, geographic & civic": "institutions",
}
ROUND2000_MANDATES = {
    "biz": ("commerce", "commercial/business namespace", "https://gnso.icann.org/en/issues/new-gtlds/new-tlds-31aug05.htm"),
    "info": ("technology", "unrestricted information namespace; technology is an editorial family, not a registrant restriction", "https://46-9.dc.icann.org/faqs/new-tlds.html"),
    "name": ("community", "personal names and identity", "https://gnso.icann.org/en/issues/new-gtlds/new-tlds-31aug05.htm"),
    "pro": ("professions", "professional namespace", "https://46-9.dc.icann.org/faqs/new-tlds.html"),
    "coop": ("community", "cooperative community", "https://www.icann.org/en/registry-agreements/coop/tld-sponsorship-agreement-attachment-1-coop-05-11-2001-en"),
    "aero": ("lifestyle", "aviation community; grouped with mobility and leisure for this family aggregation", "https://archive.icann.org/en/committees/ntepptf/stld-compliance-report-25feb03.htm"),
    "museum": ("culture", "museum community", "https://archive.icann.org/en/committees/ntepptf/stld-compliance-report-25feb03.htm"),
}
COLUMNS = ["ascii_string", "display_string", "rounds", "comparable_rounds", "category_ids",
           "classification_basis", "source_files", "source_urls", "roles", "is_idn",
           "current_root_status", "iana_registration_date", "inherited_string_themes",
           "explorer_topic_facets", "official_designations_2026", "primary_application_ids_2026"]


def rows(name):
    with (DATA / name).open(encoding="utf-8-sig", newline="") as handle:
        return list(csv.DictReader(handle))


def ascii_label(value):
    value = value.strip().strip(".").lower()
    return value.encode("idna").decode("ascii") if value else ""


def display_label(value):
    try:
        return "." + value.encode("ascii").decode("idna")
    except (UnicodeError, ValueError):
        return "." + value


def split(value):
    return {x.strip() for x in value.split("|") if x.strip()}


def join(values):
    return "|".join(sorted(values))


def build():
    corpus = {}
    cohort = defaultdict(set)
    thematic = defaultdict(set)
    semantic_basis = defaultdict(set)
    semantic_sources = defaultdict(set)
    semantic_urls = defaultdict(set)
    imported_themes = defaultdict(set)

    def add(value, source, *, rnd="", role="", comparable=False, urls=()):
        key = ascii_label(value)
        if not key:
            return None
        if key not in corpus:
            corpus[key] = {"ascii_string": key, "display_string": display_label(key), "rounds": set(),
                           "comparable_rounds": set(), "categories": set(), "basis": set(), "files": set(),
                           "urls": set(), "roles": set(), "root": set(), "dates": set(),
                           "facets": set(), "designations": set(), "application_ids": set()}
        item = corpus[key]
        item["files"].add(source)
        item["urls"].update(u.strip() for u in urls if u and u.strip().startswith("http"))
        if rnd:
            item["rounds"].add(rnd)
        if role:
            item["roles"].add(role)
        if comparable:
            item["comparable_rounds"].add(rnd)
            cohort[rnd].add(key)
        return item

    # Primary rows describe membership. IANA profile dates are not launch dates.
    for row in rows("tld_universe.csv"):
        rnd = row["program_round"]
        item = add(row["ascii_string"], "tld_universe.csv", rnd=rnd, role="iana-root-history",
                   comparable=rnd == "legacy", urls=split(row["sources"]))
        item["root"].add(row["current_root_status"])
        if row["registration_date"]:
            item["dates"].add(row["registration_date"])
        if row["formal_type"] == "country-code":
            item["categories"].add("territorial-code")
            item["basis"].add("IANA formal_type=country-code; territorial code, not observed use")
        if row["formal_type"] == "infrastructure":
            item["categories"].add("technology")
            item["basis"].add("IANA formal_type=infrastructure")
    applications_2000 = {r["submission_id"]: r for r in rows("applications_2000.csv")}
    for row in rows("application_strings_2000.csv"):
        parent = applications_2000[row["submission_id"]]
        item = add(row["string"], "application_strings_2000.csv", rnd="2000", role="2000-requested",
                   comparable=True, urls=[row["source_url"], parent["source_url"]])
        item["files"].add("applications_2000.csv")
    for row in rows("applications_2004.csv"):
        add(row["string"], "applications_2004.csv", rnd="2004", role="2004-requested",
            comparable=True, urls=[row["source_url"]])
    for row in rows("applications_2012.csv"):
        urls = [row["source_url"], row["official_corpus_source_url"]]
        add(row["ascii_string"] or row["string"], "applications_2012.csv", rnd="2012",
            role="2012-requested", comparable=True, urls=urls)
        if row["string_change_target"]:
            add(row["string_change_target_ascii"] or row["string_change_target"], "applications_2012.csv",
                rnd="2012", role="2012-approved-string-change", urls=[row["string_change_source_url"]])
    aps = rows("applications_2026_aps_official_listing.csv")
    provenance = json.loads((DATA / "applications_2026_aps_official_provenance.json").read_text())
    assert hashlib.sha256((DATA / "applications_2026_aps_official_listing.csv").read_bytes()).hexdigest() == provenance["normalizedCSVSHA256"], "Official APS source digest mismatch"
    aps_ids = {row["Application ID"] for row in aps}
    assert len(aps) == len(aps_ids) == 2783, "Review changed APS row identities"
    assert sum(not aid.endswith("-R") for aid in aps_ids) == 1614, "Review changed APS base application count"
    assert all(aid[:-2] in aps_ids for aid in aps_ids if aid.endswith("-R")), "Orphan APS replacement"
    assert sum(row["Label: Variant Only (Existing TLD)"] == "TRUE" and not row["Application ID"].endswith("-R") for row in aps) == 6, "Review changed existing-TLD variant-only scope"
    for row in aps:
        aid = row["Application ID"]
        replacement = aid.endswith("-R")
        variant_only = row["Label: Variant Only (Existing TLD)"] == "TRUE"
        role = "2026-replacement" if replacement else ("2026-existing-variant-only" if variant_only else "2026-new-primary")
        url = provenance["sourcePage"] + "/" + aid + "/summary"
        item = add(row["Primary String"], "applications_2026_aps_official_listing.csv", rnd="2026",
                   role=role, comparable=not replacement and not variant_only, urls=[url])
        if not replacement:
            item["application_ids"].add(aid)
            for field, designation in [("TLD Type: Brand", "brand"), ("TLD Type: Community", "community"),
                                       ("TLD Type: Geo (Self-Designated)", "geographic-self-designated"),
                                       ("TLD Type: Geo (String Review Confirmed)", "geographic-review-confirmed")]:
                if row[field] == "TRUE":
                    item["designations"].add(designation)
            if row["TLD Type: Brand"] == "TRUE":
                item["categories"].add("brand")
                item["basis"].add("APS 2026 positive official brand flag on at least one base application; no historical inference")
        for variant in re.findall(r"xn--[a-z0-9-]+", row["TLD Variants"].lower()):
            add(variant, "applications_2026_aps_official_listing.csv", rnd="2026",
                role="2026-requested-idn-variant", urls=[url])

    # Reuse only lexical dictionaries and explicit editorial themes, not Explorer's
    # registry/applicant-name similarity heuristic, economic-case status or fallback.
    assembly_name = "scripts/assemble_data.js"
    assembly = (ROOT / assembly_name).read_text()
    dictionary_block = assembly.split("const EXPLORER_TOPIC_LABELS={", 1)[1].split("\n};", 1)[0]
    dictionaries = re.findall(r"(topic\w+):new Set\('([^']*)'\.split\(' '\)\)", dictionary_block)
    assert len(dictionaries) == 9, "Review changed Explorer dictionary schema"
    for topic, labels in dictionaries:
        if topic not in TOPIC_FAMILY:
            continue
        for label in labels.split():
            thematic[ascii_label(label)].add(TOPIC_FAMILY[topic])
            semantic_basis[ascii_label(label)].add("inherited Explorer exact-label dictionary: " + topic)
            semantic_sources[ascii_label(label)].add(assembly_name)
    theme_block = assembly.split("const EDITORIAL_THEME_TO_TOPIC={", 1)[1].split("\n};", 1)[0]
    theme_map = dict(re.findall(r"(\w+):'(topic\w+)'", theme_block))
    for row in rows("explorer_catalog.csv"):
        key = ascii_label(row["ascii_string"] or row["string"])
        item = add(key, "explorer_catalog.csv", role="explorer-catalog", urls=split(row["sources"]))
        item["facets"].update(split(row["topic_facets"]))
        for theme in split(row["themes"]):
            # Script/IDN is a separate axis, never a semantic sector.
            topic = theme_map.get(theme)
            if theme == "scripts" or topic not in TOPIC_FAMILY:
                continue
            family = "health" if theme == "health" else TOPIC_FAMILY[topic]
            thematic[key].add(family)
            semantic_basis[key].add("inherited Explorer explicit editorial theme: " + theme)
            semantic_sources[key].add("explorer_catalog.csv")
            semantic_urls[key].update(split(row["sources"]))
        if row["city"] == "yes" or row["editorial_designation"] == "geographic":
            thematic[key].add("geography")
            semantic_basis[key].add("inherited Explorer explicit city/geographic editorial designation")
            semantic_sources[key].add("explorer_catalog.csv")

    # Explicit readings of all seven selected 2000 mandates. These exact-label
    # rules join the shared vocabulary and apply to every cohort, not only 2000.
    for key, (family, purpose, url) in ROUND2000_MANDATES.items():
        thematic[key].add(family)
        semantic_basis[key].add("documented 2000 mandate; editorial family reading: " + purpose)
        semantic_sources[key].add("scripts/build_tld_cultural_trajectory.py")
        semantic_urls[key].update({url, "https://archive.icann.org/en/tlds/new-tld-faq.htm"})

    # A string theme is a reading of a label, never a sector attributed to its
    # applicant. Suppress conflicts and mixed applicant/string classifications.
    legacy = defaultdict(list)
    for row in rows("application_economic_map_2012_2026.csv"):
        legacy[(row["round"], ascii_label(row["string"]))].append(row)
    candidates = defaultdict(set)
    candidate_sources = defaultdict(set)
    for (rnd, key), group in legacy.items():
        if rnd != "2012":
            continue
        if all(r["classification_basis"].split(";")[0] == "string-taxonomy" and r["sector_status"] == "classified" for r in group):
            candidates[key].update(r["sector"] for r in group)
            candidate_sources[key].add("application_economic_map_2012_2026.csv")
    for row in rows("aps_2026_current_analytics.csv"):
        if row["string_theme"] and row["string_theme_status"] == "inherited-editorial":
            key = ascii_label(row["primary_string"])
            candidates[key].add(row["string_theme"])
            candidate_sources[key].update({"aps_2026_current_analytics.csv", row["string_theme_source_file"]})
    conflicts = []
    for key, themes in candidates.items():
        if len(themes) != 1:
            conflicts.append(key)
            continue
        theme = next(iter(themes))
        if theme not in SECTOR_FAMILY:
            continue
        thematic[key].update(split(SECTOR_FAMILY[theme]))
        imported_themes[key].add(theme)
        semantic_basis[key].add("inherited editorial string taxonomy, never applicant sector: " + theme)
        semantic_sources[key].update(s for s in candidate_sources[key] if s)

    output = []
    for key, item in sorted(corpus.items()):
        item["categories"].update(thematic[key])
        item["basis"].update(semantic_basis[key])
        item["files"].update(semantic_sources[key])
        item["urls"].update(semantic_urls[key])
        if not item["categories"]:
            item["categories"].add("unclassified")
            item["basis"].add("no positive supported category; no inference from applicant or registry name")
        output.append({"ascii_string": key, "display_string": item["display_string"], "rounds": join(item["rounds"]),
                       "comparable_rounds": join(item["comparable_rounds"]), "category_ids": join(item["categories"] - {"unclassified"}),
                       "classification_basis": "; ".join(sorted(item["basis"])), "source_files": join(item["files"]),
                       "source_urls": join(item["urls"]), "roles": join(item["roles"]),
                       "is_idn": str(key.startswith("xn--")).lower(), "current_root_status": join(item["root"]),
                       "iana_registration_date": join(item["dates"]), "inherited_string_themes": join(imported_themes[key]),
                       "explorer_topic_facets": join(item["facets"]), "official_designations_2026": join(item["designations"]),
                       "primary_application_ids_2026": join(item["application_ids"])})

    def distribution(keys, rnd=""):
        available = {key: corpus[key]["categories"] - ({"brand"} if rnd and rnd != "2026" else set()) - {"unclassified"}
                     for key in keys}
        counter = Counter(c for categories in available.values() for c in categories)
        total = len(keys)
        unknown = sum(not categories for categories in available.values())
        counter["unclassified"] = unknown
        return {"strings": total, "classified": total - unknown, "unclassified": unknown}, dict(counter)

    counts, totals = distribution(corpus)
    round_data = []
    for rnd in ["legacy", "2000", "2004", "2012", "2026"]:
        keys = cohort[rnd]
        rc, dist = distribution(keys, rnd)
        round_data.append({"round": rnd, **rc, "categories": {c: (None if c == "brand" and rnd != "2026" else dist.get(c, 0)) for c in LABELS},
                           "idn_strings": sum(k.startswith("xn--") for k in keys),
                           "semantic_classified": sum(bool(corpus[k]["categories"] & set(COMPARABLE)) for k in keys),
                           "semantic_unclassified": sum(not bool(corpus[k]["categories"] & set(COMPARABLE)) for k in keys),
                           "scope": "legacy gTLD definitions" if rnd == "legacy" else "distinct requested primary strings; application count is not the denominator",
                           "string_themes": dict(Counter(t for k in keys for t in imported_themes[k]))})
    assert len(cohort["2000"]) == 190 and len(cohort["2004"]) == 9
    assert len(cohort["2012"]) == 1409 and len(cohort["2026"]) == 980
    assert counts["classified"] + counts["unclassified"] == counts["strings"]
    assert len({r["ascii_string"] for r in output}) == len(output)
    assert not any("unclassified" in x["categories"] and len(x["categories"]) > 1 for x in corpus.values())

    sources = []
    for name in INPUTS + [assembly_name, "scripts/build_tld_cultural_trajectory.py"]:
        path = ROOT / name if name.startswith("scripts/") else DATA / name
        sources.append({"file": name, "sha256": hashlib.sha256(path.read_bytes()).hexdigest()})
    summary = {"schemaVersion": 1, "counts": counts,
               "categories": [{"id": c, "label": label, "count": totals.get(c, 0),
                               "availability": ["2026"] if c == "brand" else ["all-corpus"],
                               "dimension": "official-designation" if c == "brand" else "formal-type" if c == "territorial-code" else "editorial-string-theme"}
                              for c, label in LABELS.items() if c != "unclassified"],
               "comparableCategoryIds": COMPARABLE, "rounds": round_data,
               "axes": {"idn": {"strings": sum(k.startswith("xn--") for k in corpus), "basis": "ASCII A-label starts xn--; separate from semantic categories"}},
               "coverage": {"semanticClassified": sum(bool(x["categories"] & set(COMPARABLE)) for x in corpus.values()),
                            "inheritedStringThemeStrings": sum(bool(x) for x in imported_themes.values()), "conflictingStringThemesExcluded": sorted(conflicts),
                            "apsRows": len(aps), "apsNewPrimaryDistinctStrings": len(cohort["2026"]),
                            "roles": dict(Counter(role for x in corpus.values() for role in x["roles"]))},
               "methodology": [
                   "Complete deduplicated union of the pinned IANA/history universe, every recorded 2000 requested string, 2004 and 2012 applications, official 2026 APS listing, variants, approved changes and Explorer catalog. One row per ASCII label; no case-study selection.",
                   "Cohort denominators are distinct requested primary strings: 190 (2000), 9 (2004), 1409 (2012), 980 (2026). The seven legacy gTLDs are a different institutional baseline, not an ICANN application round. Country-code, infrastructure and test labels remain in the corpus.",
                   "2026 replacement records, existing-TLD variant-only applications and requested IDN variants remain searchable with explicit roles. They add no weight to the 980-string main comparison. A label also requested as a new primary string is counted once in that cohort.",
                   "Semantic families reuse the existing Explorer exact-label dictionaries and explicit editorial themes, plus consistently classified 2012 string-taxonomy rows and the separate 2026 string_theme field. Seven exact-label readings of the documented selected 2000 mandates complete biz/info/name/pro/coop/aero/museum. They are applied identically across cohorts as a present editorial reading of labels, not proof of historical intention or observed use. In particular info remains unrestricted and its technology family is an editorial aggregation, never a registrant-sector claim.",
                   "No applicant sectors, parent companies, registry-name matches, Explorer business-name similarity heuristics, fallback topics or status-based special topics are imported as semantic evidence. A word is never used to infer the applicant's industry or identity.",
                   "The family aggregation is explicit in TOPIC_FAMILY and SECTOR_FAMILY in the builder. Culture includes media and education; commerce includes finance; professions includes property services; lifestyle includes mobility and leisure. Categories overlap, so their counts and shares must not be summed.",
                   "Only positive official APS 2026 flags support brand designation. Historic brand values are null, not zero. Official geographic/community flags are retained separately from the semantic categories; their absence is not a negative determination. comparableCategoryIds excludes brand and territorial-code.",
                   "Country-code is a formal territorial-code category and does not describe current use (.ai, for example). IDN is an independent A-label axis and does not automatically imply a technology, cultural or community category.",
                   "Unclassified is explicit (blank category_ids in CSV): it means no positive category in the limited inherited rules, not absence of social meaning. Unequal language/dictionary coverage prevents treating differences as a census of society. Show classified/unclassified coverage and the full cohort denominator beside every percentage. Global classified counts include formal territorial codes and APS brand designations; semantic_classified counts only the comparable editorial families.",
                   "IANA registration dates are profile/root-history dates, never commercial opening dates. Applications record proposals, root records record delegation/history, and neither proves registration volumes, active sites or social adoption. Snapshots are pinned and no future APS confirmation is presumed.",
               ], "sources": sources}
    return output, summary


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Check generated bytes without modifying outputs")
    args = parser.parse_args()
    corpus, summary = build()
    stream = io.StringIO(newline="")
    writer = csv.DictWriter(stream, fieldnames=COLUMNS, lineterminator="\n")
    writer.writeheader()
    writer.writerows(corpus)
    artifacts = {"tld_cultural_corpus.csv": stream.getvalue(),
                 "tld_cultural_patterns.json": json.dumps(summary, ensure_ascii=False, indent=2, sort_keys=True) + "\n"}
    for name, value in artifacts.items():
        if args.check:
            assert (DATA / name).read_text() == value, name + " is stale"
        else:
            (DATA / name).write_text(value, encoding="utf-8")
    print(json.dumps({"counts": summary["counts"], "rounds": [{k: r[k] for k in ["round", "strings", "classified", "unclassified"]} for r in summary["rounds"]]}))


if __name__ == "__main__":
    main()
