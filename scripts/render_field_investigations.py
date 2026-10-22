#!/usr/bin/env python3
"""2026 Field Notes 03–05: separately indexable investigations, outside frozen RR1.

Build after the original two notes and the existing sanctions/access explainers.
The source-of-truth is data/field_investigations.json, not a mutable APS live feed.
"""
from __future__ import annotations

from datetime import date
from html import escape as h
from pathlib import Path
import json
import re
import xml.etree.ElementTree as ET

from scripts.render_behind_round import (BASE, LANGS, CSS, BEHIND_CSS,
                                         validate_editorial_updates, editorial_updates_markup)

ROOT = Path(__file__).resolve().parents[1]
SLUGS = ("objectors-eoi", "replacement-strings", "background-screening")
PRIMARY = ("https://www.icann.org/", "https://newgtldprogram.icann.org/",
           "https://newgtldprogram-aps.icann.org/", "https://newgtldprogram-2026-agb.icann.org/")
SECONDARY = ("https://internet.best/", "https://www.bortzmeyer.org/")
DERIVED = ("https://github.com/robertbregy/Connecting-the-Dots/",)

INVESTIGATION_CSS = """
.fieldInvestigationIndex{margin:22px 0}
.fieldInvestigationIndex h2{font-size:clamp(1.25rem,2.4vw,1.65rem)}
.fieldInvestigationIndex .intro{color:var(--muted);line-height:1.65}
.fieldInvestigationGrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
.fieldInvestigationTeaser{border:1px solid var(--border);border-radius:13px;background:var(--surface2);padding:19px}
.fieldInvestigationTeaser h3{font-size:1.12rem;line-height:1.3;margin:9px 0}
.fieldInvestigationTeaser p{color:var(--muted);font-size:.94rem;line-height:1.6}
.fieldInvestigationTeaser a{color:var(--accent-text);text-decoration:underline;text-underline-offset:3px;font-weight:720}
.fieldEvidenceDisclaimer{font-size:.88rem;line-height:1.6;color:var(--muted);border-left:3px solid var(--border);padding-left:13px}
@media(max-width:1020px){.fieldInvestigationGrid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:720px){.fieldInvestigationGrid{grid-template-columns:1fr}.fieldInvestigationTeaser{padding:15px}}
"""


def load(root: Path = ROOT):
    data = json.loads((root / "data/field_investigations.json").read_text(encoding="utf-8"))
    translations = json.loads((root / "data/translations.json").read_text(encoding="utf-8"))
    frozen = json.loads((root / "data/application_2026_snapshot.json").read_text(encoding="utf-8"))
    if data.get("schemaVersion") != 1 or data.get("editorialLayer") != "2026-round-investigations-not-part-of-frozen-RR1":
        raise ValueError("Unversioned additional Field Notes")
    cases = data.get("episodes", [])
    if [case.get("id") for case in cases] != list(SLUGS):
        raise ValueError("Missing or unordered 2026 investigations")
    reviewed = date.fromisoformat(data["lastReviewed"])
    for index, case in enumerate(cases, 3):
        if (case.get("number"), case.get("slug"), case.get("kind"), case.get("state")) != (
            index, SLUGS[index - 3], "investigation", "documented-with-open-questions"
        ):
            raise ValueError("Investigation identity or evidentiary status changed")
        if not (date.fromisoformat(case["publishedOn"]) <= date.fromisoformat(case["revisedOn"]) <= reviewed):
            raise ValueError("Investigation revision chronology invalid")
        sources = {item["id"]: item for item in case.get("sources", [])}
        if len(sources) != len(case.get("sources", [])) or len(sources) < 3:
            raise ValueError("Duplicate or insufficient attributed sources")
        for item in sources.values():
            prefix = {"primary": PRIMARY, "secondary": SECONDARY, "derived": DERIVED}.get(item["kind"])
            if not prefix or not item["url"].startswith(prefix):
                raise ValueError("Unknown investigation source origin: " + item["id"])
        if len(case.get("sections", [])) != {3: 4, 4: 6, 5: 5}[index]:
            raise ValueError("Incomplete narrative evidence")
        for section in case["sections"]:
            if not section.get("sourceIds") or any(i not in sources for i in section["sourceIds"]):
                raise ValueError("Narrative section lacks identifiable evidence")
        revisions = case.get("revisionHistory", [])
        if (len(revisions) != (4 if index == 4 else 1)
                or revisions[-1]["date"] != case["revisedOn"]
                or any(date.fromisoformat(x["date"]) > reviewed or not x.get("sourceIds")
                       or any(i not in sources for i in x["sourceIds"]) for x in revisions)
                or any(revisions[i]["date"] > revisions[i + 1]["date"] for i in range(len(revisions) - 1))):
            raise ValueError("Dated revision history is not complete or evidence linked")
        if len(case.get("updateTriggers", [])) < 2:
            raise ValueError("Investigation lacks follow-up conditions")
        if index == 4:
            if (revisions[0]["date"]!="2026-10-10" or revisions[1]["date"]!="2026-10-17" or
                    revisions[2]["changeKey"]!="field18ReconciliationRevision" or revisions[2]["date"]!="2026-10-18" or
                    revisions[3]["changeKey"]!="field22Revision" or revisions[3]["date"]!="2026-10-22"):
                raise ValueError("Original 10/17 October replacement reviews must be retained")
            validate_editorial_updates(case,translations,root)
            observed = {item["id"]: item["value"] for item in case.get("quantities", [])}
            if observed != {"replacementTotal": 1169, "replacementActive": 442, "replacementDeactivated": 727}:
                raise ValueError("Secondary replacement evidence altered without new dated review")
            if observed["replacementActive"] + observed["replacementDeactivated"] != observed["replacementTotal"]:
                raise ValueError("Replacement record sum invalid")
            if frozen["stringInventory"]["secondaryApplicationsObserved"] != 1614 or frozen["official"]["activeApplications"] != 1615:
                raise ValueError("Do not equate the official and secondary application counts")
            if any(item["sourceId"] not in sources or sources[item["sourceId"]]["kind"] != "secondary" for item in case["quantities"]):
                raise ValueError("Replacement quantities incorrectly attributed to a primary source")
        for lang in LANGS:
            dictionary = translations[lang]
            keys = [case["titleKey"], case["descriptionKey"], case["statusKey"],
                    "fieldReadInvestigation", "fieldCaseIndex", "fieldSourceDisclaimer", "behindSourcesTitle",
                    "behindRevisionsTitle", "behindReviewDateLabel", "behindIndependenceTitle", "behindIndependenceBody",
                    "field{:02d}Number".format(index),
                    "field{:02d}MetaDescription".format(index),
                    *[revision["changeKey"] for revision in revisions]]
            keys += [key for section in case["sections"] for key in (section["titleKey"], section["bodyKey"])]
            keys += [section["observationLabelKey"] for section in case["sections"] if section.get("observationLabelKey")]
            keys += [item["labelKey"] for item in case["sources"]]
            if index == 4:
                keys += ["field04Disclosure"] + [q[k] for q in case["quantities"] for k in ("valueKey", "labelKey")]
            if any(not isinstance(dictionary.get(k), str) or not dictionary[k].strip() for k in keys):
                raise ValueError("Missing investigation translation: " + lang + " / " + case["id"])
            meta = dictionary["field{:02d}MetaDescription".format(index)]
            if len(meta) > 160:
                raise ValueError("Field note metadata exceeds 160 characters: " + lang)
            if index == 4:
                q = {a["id"]: a for a in case["quantities"]}
                digits = {"en": ",", "it": ".", "de": ".", "fr": " "}[lang]
                if dictionary[q["replacementTotal"]["valueKey"]] != "1" + digits + "169":
                    raise ValueError("Unlocalized replacement total: " + lang)
    return data, translations


def teaser(case, dictionary, lang):
    href = BASE + "behind-the-round/" + lang + "/" + case["slug"] + "/"
    return (
        '<section class="fieldInvestigationTeaser" data-field-investigation-teaser="' + h(case["id"], quote=True) + '">'
        '<p class="eyebrow">' + h(dictionary["field{:02d}Number".format(case["number"])]) + '</p>'
        '<h3><a data-field-investigation-slug="' + h(case["slug"], quote=True) + '" href="' + href + '">' + h(dictionary[case["titleKey"]]) + '</a></h3>'
        '<p>' + h(dictionary[case["descriptionKey"]]) + '</p>'
        '<p class="behindStatus">' + h(dictionary[case["statusKey"]]) + '</p>'
        '</section>'
    )


def collection_markup(data, dictionary, lang):
    cards = "".join(teaser(case, dictionary, lang) for case in data["episodes"])
    return ('<section class="panel fieldInvestigationIndex" id="field-investigations" aria-labelledby="field-investigations-title">'
            '<h2 id="field-investigations-title">' + h(dictionary["fieldCaseCollectionIntro"]) + '</h2>'
            '<p class="intro">' + h(dictionary["fieldSourceDisclaimer"]) + '</p>'
            '<div class="fieldInvestigationGrid">' + cards + '</div></section>')


def render_detail(case, dictionary, lang):
    path = case["slug"] + "/"
    url = BASE + "behind-the-round/" + lang + "/" + path
    title = dictionary[case["titleKey"]]
    summary = dictionary["field{:02d}MetaDescription".format(case["number"])]
    alternatives = "\n".join(
        '<link rel="alternate" hreflang="' + l + '" href="' + BASE + 'behind-the-round/' +
        ("en" if l == "x-default" else l) + '/' + path + '">'
        for l in (*LANGS, "x-default")
    )
    nav = " ".join(
        '<a lang="' + l + '" hreflang="' + l + '" href="' + BASE + 'behind-the-round/' +
        l + '/' + path + '"' + (' aria-current="page"' if l == lang else '') + '>' +
        {"en": "English", "it": "Italiano", "de": "Deutsch", "fr": "Français"}[l] + '</a>'
        for l in LANGS
    )
    schema = {
        "@context": "https://schema.org", "@type": "Article",
        "headline": title, "description": summary, "inLanguage": lang,
        "datePublished": case["publishedOn"], "dateModified": case["revisedOn"],
        "mainEntityOfPage": url, "image": BASE + "assets/og-preview.png", "isAccessibleForFree": True,
        "author": {"@type": "Person", "name": "Robert Bregy"},
        "isPartOf": {"@type": "WebSite", "name": "Connecting the Dots", "url": BASE},
        "citation": [source["url"] for source in case["sources"]],
        "about": [{"@type": "Thing", "name": "ICANN 2026 Round: " + case["id"]}]
    }
    parts = [
        '<article class="panel behindStory" data-field-investigation="' + h(case["id"], quote=True) + '">',
        '<p class="behindStatus">' + h(dictionary[case["statusKey"]]) + '</p>'
    ]
    parts.append(editorial_updates_markup(case,dictionary,lang,heading="h2",placement="lead"))
    if case.get("quantities"):
        parts.append('<div class="behindFigures">')
        for item in case["quantities"]:
            parts.append('<div class="behindFigure" data-field-quantity="' + h(item["id"], quote=True) + '">'
                         '<strong>' + h(dictionary[item["valueKey"]]) + '</strong>'
                         '<span class="factLabel">' + h(dictionary[item["labelKey"]]) + '</span></div>')
        parts.append('</div>')
        parts.append('<p class="fieldEvidenceDisclaimer">' + h(dictionary["field04Disclosure"]) + '</p>')
    for section in case["sections"]:
        parts.extend([
            '<section class="behindReading" data-referenced-sources="' + h(",".join(section["sourceIds"]), quote=True) + '">',
            '<h2>' + h(dictionary[section["titleKey"]]) + '</h2>',
            ('<p class="eyebrow" data-observation-date="'+h(section["observationDate"],quote=True)+'">'+h(dictionary[section["observationLabelKey"]])+'</p>') if section.get("observationLabelKey") else '',
            '<p>' + h(dictionary[section["bodyKey"]]) + '</p></section>'
        ])
    parts.append(editorial_updates_markup(case,dictionary,lang,heading="h2"))
    parts.extend([
        '<section class="behindReading behindSourcesBlock">',
        '<h2>' + h(dictionary["behindSourcesTitle"]) + '</h2>',
        '<p>' + h(dictionary["fieldSourceDisclaimer"]) + '</p>',
        '<ul class="behindSources">'
    ])
    for source in case["sources"]:
        parts.append(
            '<li data-source-id="' + h(source["id"], quote=True) + '" data-source-kind="' + h(source["kind"]) + '">'
            '<a href="' + h(source["url"], quote=True) + '" target="_blank" rel="noopener noreferrer">' +
            h(dictionary[source["labelKey"]]) + ' ↗</a></li>'
        )
    parts.extend(['</ul></section>','<section class="behindReading behindRevisions">',
                  '<h2>' + h(dictionary["behindRevisionsTitle"]) + '</h2>',
                  '<ol class="behindRevisionHistory">'])
    for revision in case["revisionHistory"]:
        parts.append(
            '<li data-editorial-revision="' + h(revision["date"]) + '">'
            '<time datetime="' + h(revision["date"]) + '">' + h(revision["date"]) + '</time> ' +
            h(dictionary[revision["changeKey"]]) + '</li>'
        )
    parts.extend([
        '</ol></section>',
        '<section class="behindReading"><h2>' + h(dictionary["behindIndependenceTitle"]) + '</h2>'
        '<p>' + h(dictionary["behindIndependenceBody"]) + '</p></section>',
        '<div class="behindCaseFooter">' + h(dictionary["behindReviewDateLabel"]) +
        ' <time datetime="' + h(case["revisedOn"]) + '">' + h(case["revisedOn"]) + '</time></div></article>'
    ])
    article = "\n".join(parts)
    back = BASE + "behind-the-round/" + lang + "/"
    timeline = BASE + "inside-the-round/" + lang + "/"
    return f'''<!doctype html>
<html lang="{lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="index,follow,max-image-preview:large">
<title>{h(title)}</title>
<meta name="description" content="{h(summary,quote=True)}">
<link rel="canonical" href="{url}">
{alternatives}
<link rel="icon" href="{BASE}assets/logo-mark.png" type="image/png">
<meta property="og:type" content="article"><meta property="og:site_name" content="Connecting the Dots">
<meta property="og:title" content="{h(title,quote=True)}">
<meta property="og:description" content="{h(summary,quote=True)}">
<meta property="og:url" content="{url}"><meta property="og:image" content="{BASE}assets/og-preview.png">
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">{json.dumps(schema,ensure_ascii=False,separators=(",",":"))}</script>
<style>{CSS}\n{BEHIND_CSS}\n{INVESTIGATION_CSS}</style></head><body>
<header><nav aria-label="Languages"><a class="brand" href="{BASE}{lang}/">Connecting the Dots</a><div class="lang-links">{nav}</div></nav></header>
<main id="behind-round">
<div class="eyebrow">{h(dictionary["field{:02d}Number".format(case["number"])])}</div>
<h1>{h(title)}</h1>
<p class="lead">{h(dictionary[case["descriptionKey"]])}</p>
<div class="actions"><a class="action" href="{back}">{h(dictionary["fieldCaseIndex"])}</a>
<a class="action secondary" href="{timeline}">{h(dictionary["behindChronicleCta"])}</a></div>
{article}
</main>
<footer>Connecting the Dots · <a href="{BASE}{lang}/">ICANN 2026</a> ·
<a href="https://doi.org/10.5281/zenodo.23288603">RR2 · latest archived research</a> · <a href="https://doi.org/10.5281/zenodo.23262623">RR1 · original Reveal Day snapshot</a></footer></body></html>
'''


def build_investigations(root: Path = ROOT):
    data, translations = load(root)
    publication = json.loads((root / "publication.json").read_text(encoding="utf-8"))
    if not (date.fromisoformat(publication["asOf"]) <= date.fromisoformat(data["lastReviewed"])
            <= date.fromisoformat(publication["releasedOn"])):
        raise ValueError("Editorial review must be between frozen research snapshot and technical publication date")
    for lang in LANGS:
        target = root / "behind-the-round" / lang / "index.html"
        html = target.read_text(encoding="utf-8")
        if html.count("</main>") != 1 or "data-field-investigation-teaser" in html:
            raise ValueError("Field Note collection is missing or already modified: " + lang)
        html = html.replace("</main>", collection_markup(data, translations[lang], lang) + "\n</main>")
        # Original cases retain their own revision dates; collection metadata
        # reflects the latest checked episode in this living editorial layer.
        schema_match=re.search(r'(<script type="application/ld\+json">)(.*?)(</script>)',html,re.S)
        if not schema_match:
            raise ValueError("Cannot locate dated Field Notes CollectionPage metadata")
        schema=json.loads(schema_match.group(2))
        if schema.get("@type")!="CollectionPage":
            raise ValueError("Field Notes index must retain its CollectionPage identity")
        existing=date.fromisoformat(schema["dateModified"])
        modified=max(existing,date.fromisoformat(data["lastReviewed"]))
        if modified>date.fromisoformat(publication["releasedOn"]):
            raise ValueError("Collection metadata cannot postdate the technical publication")
        schema["dateModified"]=modified.isoformat()
        html=html[:schema_match.start(2)]+json.dumps(schema,ensure_ascii=False,separators=(",",":"))+html[schema_match.end(2):]
        html = html.replace("</style></head>", INVESTIGATION_CSS + "</style></head>", 1)
        target.write_text(html, encoding="utf-8")
        for case in data["episodes"]:
            dest = root / "behind-the-round" / lang / case["slug"] / "index.html"
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_text(render_detail(case, translations[lang], lang), encoding="utf-8")
    sitemap = root / "sitemap.xml"
    xml = sitemap.read_text(encoding="utf-8")
    if xml.count("<url>") != 27 or xml.count("</urlset>") != 1:
        raise ValueError("New Field Notes expect 27 existing URLs")
    items = []
    for slug in SLUGS:
        for lang in LANGS:
            relative = "behind-the-round/" + lang + "/" + slug + "/"
            item = f'  <url>\n    <loc>{BASE}{relative}</loc>\n    <lastmod>{publication["releasedOn"]}</lastmod>\n'
            for target_lang in (*LANGS, "x-default"):
                locale = "en" if target_lang == "x-default" else target_lang
                item += f'    <xhtml:link rel="alternate" hreflang="{target_lang}" href="{BASE}behind-the-round/{locale}/{slug}/"/>\n'
            items.append(item + "  </url>")
    xml = xml.replace("</urlset>", "\n".join(items) + "\n</urlset>")
    sitemap.write_text(xml, encoding="utf-8")
    ET.parse(sitemap)
    print(f"Generated three additional Field Notes in {len(LANGS)} languages; {xml.count('<url>')} sitemap URLs")


if __name__ == "__main__":
    build_investigations()
