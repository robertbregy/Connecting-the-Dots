#!/usr/bin/env python3
"""Render an independent, source-audited ICANN/OFAC explainer (outside frozen RR1)."""
from __future__ import annotations

import json
from datetime import date
from html import escape as h
from pathlib import Path
from xml.etree import ElementTree as ET

from scripts.render_inside_round import BASE, LANGS, CSS
from scripts.render_behind_round import BEHIND_CSS

ROOT = Path(__file__).resolve().parents[1]
SLUG = "sanctions-and-dns"
CSS_EXTRA = """

.governanceHero{margin:25px 0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
.governanceHero>section{background:var(--surface);border:1px solid var(--border);border-radius:13px;padding:20px}
.governanceHero h2{font-size:1.12rem;margin:0 0 10px}
.governanceHero p{margin:0;color:var(--muted)}
.governanceArticle section.panel{padding:25px;margin:17px 0}
.governanceArticle h2{font-size:clamp(1.2rem,2.5vw,1.48rem);margin:0 0 11px}
.governanceArticle .lead{margin-bottom:20px}
.governanceCitations{display:flex;gap:7px;flex-wrap:wrap;margin:9px 0 0}
.governanceCitations a{display:inline-block;border:1px solid #9ebbd0;background:#ecf4fb;color:#195f99;font-size:.78rem;font-weight:720;padding:2px 7px;border-radius:6px;text-decoration:none}
.governanceCitations a:focus-visible,.governanceCitations a:hover{text-decoration:underline}
.governancePrecedents{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin:17px 0 22px}
.governancePrecedents article{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:19px}
.governancePrecedents time{display:block;color:var(--accent-text);font-size:1.15rem;font-weight:830;margin-bottom:8px}
.governancePrecedents h3{font-size:1.04rem;line-height:1.3;margin:0 0 9px}
.governancePrecedents p{font-size:.94rem;margin:0;color:var(--muted)}
.governanceRelated{display:flex;flex-wrap:wrap;gap:10px;margin-top:17px}
.governanceRelated a{display:inline-block;padding:10px 13px;border-radius:10px;border:1px solid var(--border);background:var(--surface2);font-weight:720;text-decoration:none}
.governanceSources{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px 13px;padding:0;list-style:none}
.governanceSources a{display:block;overflow-wrap:anywhere;padding:10px 12px;border:1px solid var(--border);border-radius:10px;text-decoration:none}
.governanceSources a:hover{text-decoration:underline}
.governanceSources small{color:var(--muted);font-weight:790;margin-right:8px}
.governanceDate{font-size:.85rem;color:var(--muted);margin-top:24px}
@media(max-width:700px){.governanceHero,.governancePrecedents,.governanceSources{grid-template-columns:1fr}.governanceArticle section.panel{padding:18px}}

/* Editorial article treatment: consistent with the main site's typography and layout. */
:root{--background:#f6f8fb;--surface:#fff;--surface2:#eef3f8;--text:#16243c;--muted:#455872;--border:#d3dee9;--accent:#1568ab;--accent-soft:#e7f1fa;--accent-text:#155b91}
body{font-size:16px;line-height:1.7}
header nav{max-width:1230px}
main.governanceArticle{max-width:1080px;padding:clamp(26px,4vw,56px) clamp(20px,4vw,48px) 76px}
.governanceArticle>h1{max-width:19ch;font-size:clamp(2.5rem,5.3vw,4.6rem);line-height:1.08;letter-spacing:-.05em;margin:10px 0 24px}
.governanceArticle>.eyebrow{font-size:.74rem;letter-spacing:.14em}
.governanceArticle>.lead{font-size:clamp(1.1rem,1.7vw,1.35rem);line-height:1.65;max-width:70ch;color:var(--muted);margin-bottom:32px}
.governanceArticle>h2{font-size:clamp(1.55rem,2.6vw,2.1rem);letter-spacing:-.035em;line-height:1.2;margin:46px 0 18px}
.governanceHero{grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin:34px 0 44px}
.governanceHero>section{padding:26px;border-radius:16px;border-top:4px solid var(--accent)}
.governanceHero>section:nth-child(2){border-top-color:#6d879d}
.governanceHero h2{font-size:1.15rem;letter-spacing:-.015em}
.governanceHero p{font-size:.97rem;line-height:1.64}
.governanceArticle section.panel{padding:clamp(20px,3vw,33px);margin:12px 0;border-radius:14px;border-color:var(--border)}
.governanceArticle section.panel h2{font-size:clamp(1.2rem,2vw,1.55rem);line-height:1.3}
.governanceArticle section.panel p{max-width:83ch}
.governanceCitations a{border-radius:6px;padding:3px 9px;font-size:.79rem}
.governancePrecedents{gap:14px}
.governancePrecedents article{border-radius:14px;padding:23px}
.governanceArticle a{overflow-wrap:anywhere}
.ctdB2CrossNav{max-width:1230px}
.ctdB2Context,.ctdB2Trail{max-width:1080px}
@media(max-width:740px){main.governanceArticle{padding:27px 18px 55px}.governanceHero{grid-template-columns:1fr;gap:10px;margin:26px 0 34px}.governanceHero>section{padding:20px}.governanceArticle>h2{margin-top:34px}.governanceArticle section.panel{padding:20px}}


.governanceEntryLinks{max-width:none;display:flex;flex-wrap:wrap;justify-content:flex-start;gap:8px;padding:0;margin:0 0 28px}
.governanceEntryLinks a{display:inline-flex;align-items:center;min-height:42px;border:1px solid var(--border);border-radius:10px;padding:9px 13px;background:var(--surface2);color:var(--accent-text);font-size:.86rem;font-weight:750;text-decoration:none}
.governanceEntryLinks a:hover,.governanceEntryLinks a:focus-visible{text-decoration:underline;background:var(--accent-soft)}
"""

def load(root: Path = ROOT) -> dict:
    item = json.loads((root / "data/sanctions_explainer.json").read_text(encoding="utf-8"))
    if item.get("schemaVersion") != 1 or item.get("slug") != SLUG:
        raise ValueError("Invalid sanctions explainer data")
    if item.get("editorialLayer") != "governance-explainer-not-part-of-frozen-RR1":
        raise ValueError("Explainer must remain separate from immutable RR1")
    if item.get("classification") != "explainer":
        raise ValueError("Sanctions background must not be presented as a case finding")
    published = date.fromisoformat(item["publishedOn"])
    reviewed = date.fromisoformat(item["reviewedOn"])
    if published > reviewed:
        raise ValueError("Explainer review date precedes publication")
    if set(item["languages"]) != set(LANGS):
        raise ValueError("Incomplete language coverage")
    sources = {s["id"]: s for s in item["sources"]}
    if len(sources) != len(item["sources"]) or len(sources) < 10:
        raise ValueError("Incomplete/duplicate sanctions explainer evidence")
    valid_hosts = ("https://www.icann.org/", "https://newgtldprogram.icann.org/",
                   "https://newgtldprogram-aps.icann.org/", "https://ofac.treasury.gov/",
                   "https://itp.cdn.icann.org/")
    for s in item["sources"]:
        if not s["url"].startswith(valid_hosts):
            raise ValueError("Unsupported external source: " + s["url"])
    section_ids = [s["id"] for s in item["sections"]]
    precedent_ids = [s["id"] for s in item["precedents"]]
    if len(section_ids) != 7 or len(set(section_ids)) != 7 or len(precedent_ids) != 4:
        raise ValueError("Explainer requires seven topics and four historical precedents")
    for record in (*item["sections"], *item["precedents"]):
        if not record["sourceIds"] or any(sid not in sources for sid in record["sourceIds"]):
            raise ValueError("Unsourced sanctions explainer statement: " + record["id"])
    for lang in LANGS:
        tx = item["languages"][lang]
        for key in ("eyebrow", "title", "lead", "metaTitle", "metaDescription",
                    "legalTitle", "legalBody", "neutralTitle", "neutralBody",
                    "readingTitle", "precedentsTitle", "precedentsLead", "accessCrossTitle", "accessCrossBody", "accessCrossCta",
                    "relatedTitle", "relatedBody", "relatedCounts", "relatedWdo",
                    "sourcesTitle", "sourcesLead", "methodTitle", "methodBody",
                    "dateTitle", "backTitle", "siteTitle"):
            if not tx.get(key):
                raise ValueError("Missing translated sanctions text: " + lang + "/" + key)
        if len(tx["metaDescription"]) > 160:
            raise ValueError("SEO description too long: " + lang)
        for typ, entries in (("sections", section_ids), ("precedents", precedent_ids)):
            if set(tx[typ]) != set(entries):
                raise ValueError("Untranslated explainer topics in " + lang)
            for entry in entries:
                if not tx[typ][entry].get("title") or not tx[typ][entry].get("body"):
                    raise ValueError("Empty translated topic " + lang + "/" + entry)
        if any("sanction" in tx["relatedBody"].lower() and phrase in tx["relatedBody"].lower()
               for phrase in ("due to sanctions", "a causa delle sanzioni", "wegen sanktionen abgelehnt")):
            raise ValueError("Unsupported causal allegation " + lang)
    return item

def page(item: dict, lang: str) -> str:
    t = item["languages"][lang]
    url = BASE + "behind-the-round/" + lang + "/" + SLUG + "/"
    lang_url = lambda l: BASE + "behind-the-round/" + l + "/" + SLUG + "/"
    sources = {s["id"]: (i + 1, s) for i, s in enumerate(item["sources"])}
    def source_refs(ids: list[str]) -> str:
        return '<div class="governanceCitations" aria-label="Sources">' + "".join(
            '<a href="#governance-source-' + h(sid, quote=True) + '" aria-label="Source ' + str(sources[sid][0]) +
            '" title="' + h(sources[sid][1]["label"], quote=True) + '">[' +
            str(sources[sid][0]) + ']</a>' for sid in ids
        ) + '</div>'
    top = "".join(
        '<section><h2>' + h(t[key + "Title"]) + '</h2><p>' + h(t[key + "Body"]) +
        '</p></section>' for key in ("legal", "neutral")
    )
    sections = "".join(
        '<section class="panel" id="topic-' + h(s["id"], quote=True) +
        '" data-explainer-section="' + h(s["id"], quote=True) + '"><h2>' +
        h(t["sections"][s["id"]]["title"]) + '</h2><p>' +
        h(t["sections"][s["id"]]["body"]) + '</p>' +
        source_refs(s["sourceIds"]) + '</section>' for s in item["sections"]
    )
    precedents = "".join(
        '<article data-explainer-precedent="' + h(p["id"], quote=True) + '"><time>' +
        h(p["year"]) + '</time><h3>' + h(t["precedents"][p["id"]]["title"]) +
        '</h3><p>' + h(t["precedents"][p["id"]]["body"]) + '</p>' +
        source_refs(p["sourceIds"]) + '</article>' for p in item["precedents"]
    )
    bibliography = "".join(
        '<li id="governance-source-' + h(s["id"], quote=True) + '"><a target="_blank" rel="noopener noreferrer" href="' +
        h(s["url"], quote=True) + '"><small>[' + str(i + 1) + ']</small>' +
        h(s["label"]) + ' ↗</a></li>' for i, s in enumerate(item["sources"])
    )
    nav = " ".join(
        '<a lang="' + l + '" hreflang="' + l + '" href="' + lang_url(l) + '"' +
        (' aria-current="page"' if l == lang else '') + '>' +
        {"en":"English","it":"Italiano","de":"Deutsch","fr":"Français"}[l] + '</a>' for l in LANGS
    )
    alternates = "\n".join(
        '<link rel="alternate" hreflang="' + l + '" href="' + lang_url("en" if l == "x-default" else l) + '">'
        for l in (*LANGS, "x-default")
    )
    schema = {
        "@context": "https://schema.org", "@type": "Article",
        "headline": t["title"], "description": t["metaDescription"],
        "inLanguage": lang, "datePublished": item["publishedOn"],
        "dateModified": item["reviewedOn"],
        "mainEntityOfPage": url,
        "image": BASE + "assets/og-preview.png",
        "isAccessibleForFree": True,
        "author": {"@type":"Person", "name":"Robert Bregy"},
        "isPartOf":{"@type":"WebSite", "name":"Connecting the Dots", "url":BASE},
        "citation": [s["url"] for s in item["sources"]],
        "about": [
            {"@type":"Thing", "name":"OFAC economic sanctions"},
            {"@type":"Thing", "name":"ICANN"},
            {"@type":"Thing", "name":"Top-level domains and Internet governance"}
        ]
    }
    related_base = BASE + "behind-the-round/" + lang + "/"
    return f'''<!doctype html>
<html lang="{lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="index,follow,max-image-preview:large">
<title>{h(t["metaTitle"])}</title><meta name="description" content="{h(t["metaDescription"],quote=True)}">
<link rel="canonical" href="{url}">
{alternates}
<link rel="icon" href="{BASE}assets/logo-mark.png" type="image/png">
<meta property="og:type" content="article"><meta property="og:site_name" content="Connecting the Dots">
<meta property="og:title" content="{h(t["metaTitle"],quote=True)}">
<meta property="og:description" content="{h(t["metaDescription"],quote=True)}">
<meta property="og:url" content="{url}"><meta property="og:image" content="{BASE}assets/og-preview.png">
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">{json.dumps(schema,ensure_ascii=False,separators=(",",":"))}</script>
<style>{CSS}\n{BEHIND_CSS}\n{CSS_EXTRA}</style></head><body>
<header><nav aria-label="Languages"><a class="brand" href="{BASE}{lang}/">Connecting the Dots</a>
<div class="lang-links">{nav}</div></nav></header>
<nav class="governanceEntryLinks" aria-label="Article pathways">
<a href="{BASE}{lang}/?tab=ia-explore#ia-explore">{h({'it':'← Esplorare','en':'← Explore','de':'← Erkunden','fr':'← Explorer'}[lang])}</a>
<a href="{BASE}behind-the-round/{lang}/">{h({'it':'← Note dal campo','en':'← Field Notes','de':'← Beobachtungen','fr':'← Carnet de terrain'}[lang])}</a>
</nav>
<main class="governanceArticle">
<div class="eyebrow">{h(t["eyebrow"])}</div>
<h1>{h(t["title"])}</h1><p class="lead">{h(t["lead"])}</p>
<div class="governanceHero">{top}</div>
<h2>{h(t["readingTitle"])}</h2>
{sections}
<h2>{h(t["precedentsTitle"])}</h2><p>{h(t["precedentsLead"])}</p>
<div class="governancePrecedents">{precedents}</div>
<section class="panel"><h2>{h(t["relatedTitle"])}</h2><p>{h(t["relatedBody"])}</p>
<div class="governanceRelated"><a href="{related_base}#behind-case-reveal-day-counts">{h(t["relatedCounts"])} ↗</a>
<a href="{related_base}wdo-identity/">{h(t["relatedWdo"])} ↗</a></div></section>
<section class="panel"><h2>{h(t["accessCrossTitle"])}</h2><p>{h(t["accessCrossBody"])}</p>
<div class="governanceRelated"><a href="{related_base}who-controls-internet-access/">{h(t["accessCrossCta"])} ↗</a></div></section>
<section class="panel"><h2>{h(t["sourcesTitle"])}</h2><p>{h(t["sourcesLead"])}</p>
<ol class="governanceSources">{bibliography}</ol></section>
<section class="panel"><h2>{h(t["methodTitle"])}</h2><p>{h(t["methodBody"])}</p></section>
<p class="governanceDate">{h(t["dateTitle"])}: <time datetime="{item["reviewedOn"]}">{item["reviewedOn"]}</time></p>
<div class="actions"><a class="action secondary" href="{related_base}">{h(t["backTitle"])}</a>
<a class="action secondary" href="{BASE}{lang}/">{h(t["siteTitle"])}</a></div>
</main><footer>Connecting the Dots · <a href="{BASE}{lang}/">ICANN 2026</a> ·
<a href="https://doi.org/10.5281/zenodo.23288603">RR2 · latest archived research</a> · <a href="https://doi.org/10.5281/zenodo.23262623">RR1 · original Reveal Day snapshot</a></footer>
</body></html>
'''

def build_sanctions_pages(root: Path = ROOT) -> None:
    item = load(root)
    for lang in LANGS:
        out = root / "behind-the-round" / lang / SLUG / "index.html"
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(page(item, lang), encoding="utf-8")
    sitemap = root / "sitemap.xml"
    xml = sitemap.read_text(encoding="utf-8")
    if xml.count("<url>") != 19:
        raise ValueError("Expected 19 URLs before sanctions explainer extensions")
    blocks = []
    for lang in LANGS:
        loc = BASE + "behind-the-round/" + lang + "/" + SLUG + "/"
        block = f'  <url>\n    <loc>{loc}</loc>\n    <lastmod>{item["reviewedOn"]}</lastmod>\n'
        for l in (*LANGS, "x-default"):
            path = "en" if l == "x-default" else l
            target = BASE + "behind-the-round/" + path + "/" + SLUG + "/"
            block += f'    <xhtml:link rel="alternate" hreflang="{l}" href="{target}"/>\n'
        blocks.append(block + "  </url>")
    xml = xml.replace("</urlset>", "\n".join(blocks) + "\n</urlset>")
    sitemap.write_text(xml, encoding="utf-8")
    ET.parse(sitemap)
    print(f"Generated sourced sanctions explainer: {len(LANGS)} languages, {len(item['sources'])} primary sources, 23 URLs")

if __name__ == "__main__":
    build_sanctions_pages()
