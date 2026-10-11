#!/usr/bin/env python3
"""Static four-language entry points for the ICANN 2026 application-level atlas."""
from __future__ import annotations
import html,json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
SITE="https://robertbregy.github.io/Connecting-the-Dots/"
LANGS=("en","it","de","fr")
LANG_LABEL={"it":"Italiano","en":"English","de":"Deutsch","fr":"Français"}
KEYS=(
 "apsAtlasTitle","apsAtlasIntro","apsAtlasApps","apsAtlasReplacements","apsAtlasStrings",
 "apsAtlasOverlap","apsAtlasOverlapHint","apsAtlasMethod","apsAtlasWdo",
 "apsAtlasSearch","apsAtlasSearchPlaceholder","apsAtlasFilterType",
 "apsAtlasFilterRole","apsAtlasFilterRegion","apsAtlasAll",
 "apsAtlasBrand","apsAtlasCommunity","apsAtlasGeo","apsAtlasIdn","apsAtlasVariant",
 "apsAtlasHasReplacement","apsAtlasExactMatch","apsAtlasExistingVariant",
 "apsAtlasReset","apsAtlasResults","apsAtlasMore","apsAtlasDetails",
 "apsAtlasApplicant","apsAtlasApplicationId","apsAtlasBaseStatus",
 "apsAtlasProcessingStage","apsAtlasReplacement","apsAtlasReplacementStatus",
 "apsAtlasVariants","apsAtlasTypes","apsAtlasPublicDetail","apsAtlasResponses",
 "apsAtlasDocuments","apsAtlasExplorer","apsAtlasSourceDate",
 "apsAtlasSource","apsAtlasDownloadGraph","apsAtlasDownloadEdges",
 "apsAtlasDownloadHistory","apsAtlasDownloadManifest","apsAtlasBack",
 "apsAtlasResearch","apsAtlasNoResults","apsAtlasNoJs","apsAtlasError",
 "apsAtlasScope","apsAtlasWdoLink","apsAtlasPreliminaryList",
 "apsAtlasPermalink","apsAtlasMatchesCount","apsAtlasWithout",
 "apsAtlasPagination","apsAtlasRegionAll","apsAtlasNone","apsAtlasCountOf",
 "apsAtlasObservedStatusNote","apsAtlasFooter","apsAtlasOpen"
)

def q(x):
    return html.escape(str(x),quote=True)

def render(root:Path=ROOT):
    pub=json.loads((root/"publication.json").read_text(encoding="utf-8"))
    translations=json.loads((root/"data/translations.json").read_text(encoding="utf-8"))
    graph=json.loads((root/"data/aps_2026_application_graph.json").read_text(encoding="utf-8"))
    counts=graph["counts"]
    if len(graph["apps"])!=1614 or counts["officialPublishedApplications"]!=1614:
        raise ValueError("Application atlas rendered from incomplete official APS graph")
    rows=[]
    for lang in LANGS:
        t=translations[lang]
        missing=[k for k in KEYS if not isinstance(t.get(k),str) or not t[k].strip()]
        if missing: raise ValueError("Missing APS Atlas translations in "+lang+": "+", ".join(missing))
        label=SITE+"applications/"+lang+"/"
        languages=" ".join(
          f'<a href="{SITE}applications/{other}/" hreflang="{other}" lang="{other}"'
          +(' aria-current="page"' if lang==other else '')
          +'>'+q(LANG_LABEL[other])+'</a>' for other in LANGS)
        alternate="\n".join(f'<link rel="alternate" hreflang="{other}" href="{SITE}applications/{other}/">' for other in LANGS)
        alternate+=f'\n<link rel="alternate" hreflang="x-default" href="{SITE}applications/en/">'
        options_type=[("all","apsAtlasAll"),("brand","apsAtlasBrand"),("community","apsAtlasCommunity"),
                      ("geo","apsAtlasGeo"),("idn","apsAtlasIdn"),("variant","apsAtlasVariant")]
        options_role=[("all","apsAtlasAll"),("replacement","apsAtlasHasReplacement"),
                      ("exact","apsAtlasExactMatch"),("existing-variant","apsAtlasExistingVariant")]
        def options(choices):
            return "".join(f'<option value="{q(value)}">{q(t[key])}</option>' for value,key in choices)
        region_options='<option value="all">'+q(t["apsAtlasRegionAll"])+'</option>'+''.join(
            f'<option value="{k}">{k}</option>' for k in ("AF","AP","EUR","LAC","NA"))
        config=json.dumps({k:t[k] for k in KEYS},ensure_ascii=False,separators=(",",":")).replace("</","<\\/")
        structured=json.dumps({
            "@context":"https://schema.org","@type":"Dataset",
            "name":t["apsAtlasTitle"],"description":t["apsAtlasScope"],
            "version":pub["version"],"dateModified":pub["releasedOn"],
            "isBasedOn":graph["officialCSVURL"],"inLanguage":lang,
            "distribution":[{"@type":"DataDownload","encodingFormat":"application/json",
              "contentUrl":SITE+"data/aps_2026_application_graph.json"},
              {"@type":"DataDownload","encodingFormat":"text/csv",
               "contentUrl":SITE+"data/aps_2026_application_edges.csv"}],
        },ensure_ascii=False,separators=(",",":"))
        page=f'''<!doctype html>
<html lang="{lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta content="{q(pub['version'])}" name="ctd-version">
<title>{q(t['apsAtlasTitle'])} | Connecting the Dots</title>
<meta name="description" content="{q(t['apsAtlasScope'][:200])}">
<meta name="robots" content="index,follow,max-image-preview:large">
<link rel="canonical" href="{label}">{alternate}
<meta property="og:title" content="{q(t['apsAtlasTitle'])}">
<meta property="og:description" content="{q(t['apsAtlasScope'][:200])}">
<meta property="og:url" content="{label}"><meta property="og:type" content="website">
<script type="application/ld+json">{structured}</script>
<link rel="stylesheet" href="../../assets/aps-atlas.css?v={q(pub['version'])}">
</head><body>
<a class="apsSkip" href="#aps-main">{q(t['apsAtlasTitle'])}</a>
<header class="apsHeader"><div class="apsHeaderRow"><a class="apsBrand" href="../../{lang}/?tab=explore">
<span aria-hidden="true">◉</span> Connecting the Dots</a><nav aria-label="Languages" class="apsLanguages">{languages}</nav></div></header>
<main id="aps-main" class="apsMain">
<nav class="apsBreadcrumb" aria-label="Breadcrumb"><a href="../../{lang}/?tab=explore">{q(t['apsAtlasBack'])}</a>
<span aria-hidden="true">/</span><span>ICANN 2026</span></nav>
<div class="apsHero"><div class="apsEyebrow">APPLICATION ARCHAEOLOGY · ICANN 2026</div>
<h1>{q(t['apsAtlasTitle'])}</h1><p class="apsLead">{q(t['apsAtlasIntro'])}</p></div>
<div class="apsMetrics">
<article><strong>{counts['officialPublishedApplications']:,}</strong><span>{q(t['apsAtlasApps'])}</span></article>
<article><strong>{counts['replacementRecords']:,}</strong><span>{q(t['apsAtlasReplacements'])}</span></article>
<article><strong>{counts['newPrimaryStrings']:,}</strong><span>{q(t['apsAtlasStrings'])}</span></article>
<article><strong>{counts['derivedExactPrimaryMatchGroups']:,}</strong><span>{q(t['apsAtlasOverlap'])}</span></article>
</div>
<div class="apsMethod" role="note"><h2>{q(t['apsAtlasMethod'])}</h2>
<p>{q(t['apsAtlasScope'])}</p>
<p>{q(t['apsAtlasOverlapHint'])}</p>
<p><b>{q(t['apsAtlasWdo'])}</b> <a target="_blank" rel="noopener" href="{q(graph['notPublishedApplication']['detailUrl'])}">{q(t['apsAtlasWdoLink'])} ↗</a></p>
<div class="apsSources">
<a target="_blank" rel="noopener" href="{q(graph['officialCSVURL'])}">{q(t['apsAtlasSource'])} ↗</a>
<a target="_blank" rel="noopener" href="{q(graph['contention']['officialRevealListURL'])}">{q(t['apsAtlasPreliminaryList'])} ↗</a>
<a href="../../{lang}/?tab=research">{q(t['apsAtlasResearch'])}</a>
</div>
<p class="apsStamp">{q(t['apsAtlasSourceDate'])}: <time datetime="{q(graph['retrievedAtUTC'])}">{q(graph['retrievedAtUTC'][:10])}</time></p></div>
<section id="aps-results" aria-labelledby="apsSearchHeading" class="apsFinder">
<h2 id="apsSearchHeading">{q(t['apsAtlasSearch'])}</h2>
<div class="apsFilters"><div class="apsFilter apsSearchField"><label for="apsSearch">{q(t['apsAtlasSearch'])}</label>
<input type="search" id="apsSearch" autocomplete="off" placeholder="{q(t['apsAtlasSearchPlaceholder'])}"></div>
<div class="apsFilter"><label for="apsType">{q(t['apsAtlasFilterType'])}</label><select id="apsType">{options(options_type)}</select></div>
<div class="apsFilter"><label for="apsRole">{q(t['apsAtlasFilterRole'])}</label><select id="apsRole">{options(options_role)}</select></div>
<div class="apsFilter"><label for="apsRegion">{q(t['apsAtlasFilterRegion'])}</label><select id="apsRegion">{region_options}</select></div>
<button type="button" id="apsReset" class="apsReset">{q(t['apsAtlasReset'])}</button></div>
<div class="apsResultsTop"><p id="apsResultCount" role="status" aria-live="polite"></p>
<a href="../../data/aps_2026_application_graph.json" download>{q(t['apsAtlasDownloadGraph'])}</a></div>
<div id="apsResults" class="apsResults" aria-label="{q(t['apsAtlasResults'])}"></div>
<div class="apsMoreWrap"><button id="apsMore" type="button">{q(t['apsAtlasMore'])}</button></div>
<noscript><p>{q(t['apsAtlasNoJs'])}
<a href="../../data/applications_2026_aps_official_listing.csv">CSV ICANN</a></p></noscript>
</section>
<section class="apsResources"><h2>{q(t['apsAtlasDownloadManifest'])}</h2>
<div class="apsSources"><a download href="../../data/aps_2026_application_graph_manifest.json">{q(t['apsAtlasDownloadManifest'])}</a>
<a download href="../../data/aps_2026_application_edges.csv">{q(t['apsAtlasDownloadEdges'])}</a>
<a download href="../../data/aps_2026_record_observations.csv">{q(t['apsAtlasDownloadHistory'])}</a></div>
<p>{q(t['apsAtlasObservedStatusNote'])}</p></section>
</main><footer class="apsFooter">{q(t['apsAtlasFooter'])} · <a href="../../{lang}/?tab=explore">Connecting the Dots</a>
· <a href="https://doi.org/10.5281/zenodo.23288603">RR2 · DOI</a>
· v{q(pub['version'])}</footer>
<script>window.CTD_APS_LANG="{lang}";window.CTD_APS_I18N={config};</script>
<script defer src="../../data/aps_2026_application_graph.js?v={q(pub['version'])}"></script>
<script defer src="../../assets/aps-atlas.js?v={q(pub['version'])}"></script></body></html>
'''
        target=root/"applications"/lang/"index.html"
        target.parent.mkdir(parents=True,exist_ok=True)
        target.write_text(page,encoding="utf-8",newline="\n")
        rows.append(f'<url><loc>{label}</loc><lastmod>{pub["releasedOn"]}</lastmod></url>')
    sitemap=root/"sitemap.xml"
    sm=sitemap.read_text(encoding="utf-8")
    for lang in LANGS:
        link=SITE+"applications/"+lang+"/"
        if "<loc>"+link+"</loc>" in sm: raise ValueError("Application page duplicated in sitemap")
    if sm.count("</urlset>")!=1: raise ValueError("Sitemap XML closing tag missing")
    sitemap.write_text(sm.replace("</urlset>","\n".join(rows)+"\n</urlset>"),encoding="utf-8",newline="\n")
    print("APS_ATLAS_PAGES_VERIFIED "+", ".join(LANGS))

if __name__=="__main__":render()
