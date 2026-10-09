#!/usr/bin/env python3
"""Build public, source-backed editorial field notes distinct from the frozen RR1.

A story can be revised as ICANN publishes better evidence. Every published
revision is tracked in Git. Never infer procedural reasons from count changes.
"""
from __future__ import annotations

from datetime import date
from html import escape as h
from pathlib import Path
import json
from scripts.render_inside_round import BASE, LANGS, CSS

ROOT = Path(__file__).resolve().parents[1]
PRIMARY = (
    "https://www.icann.org/",
    "https://newgtldprogram-aps.icann.org/",
)
SECONDARY = ("https://www.ntlddata.com/",)
RESEARCH = ("https://github.com/robertbregy/Connecting-the-Dots/",)

BEHIND_CSS = """
.behindStory{padding:26px;margin:20px 0}
.behindStory .eyebrow{margin:0 0 8px}
.behindStory h2{font-size:clamp(1.4rem,3vw,2.05rem);line-height:1.2;margin:8px 0 14px;letter-spacing:-.022em}
.behindCaseLead{font-size:1.04rem;line-height:1.68;max-width:78ch;color:var(--muted)}
.behindStatus{display:inline-block;margin:5px 0 16px;border:1px solid #a5bdd5;background:#eaf3fb;color:#164f7b;padding:6px 12px;border-radius:99px;font-size:.79rem;font-weight:760}
.behindFigures{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:25px 0 10px}
.behindFigure{background:var(--surface2);border:1px solid var(--border);border-radius:14px;padding:20px 16px;display:flex;flex-direction:column;gap:8px}
.behindFigure strong{font-variant-numeric:tabular-nums;font-size:clamp(2rem,4vw,3.1rem);font-weight:820;line-height:1.1;letter-spacing:-.05em}
.behindFigure .factLabel{font-size:.88rem;color:var(--muted);line-height:1.42}
.behindCaveat{font-size:.84rem;color:var(--muted);max-width:83ch}
.behindFindings{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:13px;margin:23px 0}
.behindFinding{border:1px solid var(--border);border-radius:14px;padding:22px;background:var(--surface)}
.behindFinding[data-status="documented"]{border-color:#7fb4a5;background:color-mix(in srgb,#e0f5ee 48%,var(--surface))}
.behindFinding[data-status="unresolved"]{border-color:#c3b1d9;background:color-mix(in srgb,#f4eefc 44%,var(--surface))}
.behindFinding .findingPill{font-weight:790;font-size:.73rem;letter-spacing:.01em}
.behindFinding .findingNumbers{font-variant-numeric:tabular-nums;font-weight:780;font-size:1.1rem;margin:7px 0 3px}
.behindFinding h3{font-size:1.16rem;line-height:1.3;margin:10px 0}
.behindFinding p{color:var(--muted);line-height:1.65;font-size:.94rem;margin:0}
.behindReading{border-top:1px solid var(--border);margin-top:18px;padding-top:20px}
.behindReading h3,.behindSourcesBlock h3{font-size:1.18rem;line-height:1.3;margin:0 0 11px}
.behindReading p,.behindSourcesBlock p{line-height:1.65;color:var(--muted);max-width:88ch}
.behindSources{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px 13px;list-style:none;margin:12px 0 0;padding:0}
.behindSources a{display:block;padding:11px 13px;border:1px solid var(--border);border-radius:10px;text-decoration:none;color:var(--accent-text);overflow-wrap:anywhere;line-height:1.42;font-size:.87rem}
.behindSources a:hover,.behindSources a:focus-visible{text-decoration:underline;background:var(--surface2)}
.behindSources [data-source-kind="secondary"] a,.behindSources [data-source-kind="derived"] a{border-style:dashed}
.behindCaseFooter{display:flex;flex-wrap:wrap;gap:10px;align-items:center;border-top:1px solid var(--border);margin-top:21px;padding-top:18px;color:var(--muted);font-size:.83rem}
.behindCaseFooter time{font-variant-numeric:tabular-nums}
.behindRevisionHistory{margin:0;padding:0 0 0 20px;color:var(--muted);font-size:.87rem;line-height:1.55}.behindRevisionHistory time{font-weight:740;color:var(--text);font-variant-numeric:tabular-nums;margin-right:7px}
@media(max-width:720px){.behindFigures{grid-template-columns:1fr}.behindFigure{padding:16px}.behindFigure strong{font-size:2.25rem}.behindFindings{grid-template-columns:1fr}.behindSources{grid-template-columns:1fr}.behindStory{padding:16px}}
"""

CONTENT_KEYS = (
    "behindCaseNumber","behindCaseTitle","behindCaseLead","behindStatusPartial",
    "behindCountPaid","behindCountOfficial","behindCountSecondary",
    "behindCountSecondaryCaveat","behindDifference1","behindDifference2",
    "behindExplainedBadge","behindOpenBadge","behindExplainedTitle",
    "behindExplainedBody","behindOpenTitle","behindOpenBody",
    "behindWhyTitle","behindWhyBody","behindMethodTitle",
    "behindMethodBody","behindSourcesTitle","behindReviewDateLabel",
    "behindUpdateTitle","behindUpdateBody","behindIndependenceTitle",
    "behindIndependenceBody","behindSourcesPreface"
)
def load():
    stories = json.loads((ROOT / "data/behind_round_stories.json").read_text(encoding="utf-8"))
    translations = json.loads((ROOT / "data/translations.json").read_text(encoding="utf-8"))
    if stories.get("schemaVersion") != 1 or stories.get("editorialLayer") != "2026-round-field-notes-not-part-of-frozen-RR1":
        raise ValueError("Unsupported Behind the Round field-note register")
    editorial_date = date.fromisoformat(stories["lastReviewed"])
    ids = set()
    if not stories.get("episodes"):
        raise ValueError("At least one field note is required")
    frozen = json.loads((ROOT / "data/application_2026_snapshot.json").read_text(encoding="utf-8"))
    for case in stories["episodes"]:
        if case["id"] in ids or not case["id"].isascii() or not case["slug"].isascii():
            raise ValueError("Duplicate/non-ASCII field note identity")
        ids.add(case["id"])
        if case["state"] != "partly-explained":
            raise ValueError("Unknown evidentiary state " + case["id"])
        published = date.fromisoformat(case["publishedOn"])
        revised = date.fromisoformat(case["revisedOn"])
        if not (published <= revised <= editorial_date):
            raise ValueError("Field note chronology invalid")
        sources = {s["id"]:s for s in case["sources"]}
        if len(sources) != len(case["sources"]):
            raise ValueError("Duplicate source IDs")
        for source in sources.values():
            prefix = {"primary":PRIMARY,"secondary":SECONDARY,"derived":RESEARCH}.get(source["kind"])
            if not prefix or not source["url"].startswith(prefix):
                raise ValueError("Unreliable/unattributed source URL " + source["id"])
            for language in LANGS:
                if not translations[language].get(source["labelKey"]):
                    raise ValueError("Untranslated evidence " + source["id"] + " " + language)
        facts = {f["id"]:f for f in case["quantities"]}
        if set(facts) != {"paid","official","secondary"}:
            raise ValueError("Missing count observations")
        if tuple(facts[key]["value"] for key in ("paid","official","secondary")) != (1616,1615,1614):
            raise ValueError("Observed count history needs a new reviewed narrative before update")
        if facts["official"]["value"] != frozen["official"]["activeApplications"] or facts["secondary"]["value"] != frozen["stringInventory"]["secondaryApplicationsObserved"]:
            raise ValueError("Field note differs from frozen provenance snapshot")
        if case["trackedApplication"]["id"] != "WDO2627T-T45217":
            raise ValueError("Documented APS administrative-check application changed")
        if case["trackedApplication"]["string"] != ".wdo":
            raise ValueError("Tracked string identity changed")
        if {(q["id"],q["status"]) for q in case["discrepancies"]} != {("paid-to-reveal","unresolved"),("aggregate-to-visible","documented-exclusion")}:
            raise ValueError("The two distinct counting questions must not be conflated")
        if len(case["updateTriggers"]) < 3:
            raise ValueError("Missing review conditions")
        revisions = case.get("revisionHistory", [])
        if not revisions or date.fromisoformat(revisions[-1]["date"]) != revised:
            raise ValueError("Incomplete field-note change history")
        if any(date.fromisoformat(x["date"]) > editorial_date or not x.get("sourceIds") or not x.get("changeKey") for x in revisions):
            raise ValueError("Editorial changes require dated evidence")
        if any(revisions[i]['date'] > revisions[i+1]['date'] for i in range(len(revisions)-1)):
            raise ValueError('Editorial revision history must remain chronological')
        # Sources are revisable, historical observation dates are not.
        if any(any(sid not in sources for sid in x["sourceIds"]) for x in revisions):
            raise ValueError("Editorial change has unknown source")
        for fact in facts.values():
            if fact["sourceId"] not in sources:
                raise ValueError("Untraceable count: " + fact["id"])
        for language in LANGS:
            for key in (*CONTENT_KEYS,"behindNav","behindTitle","behindIntro","behindStandaloneCta","behindChronicleCta","behindMetaTitle","behindMetaDescription","behindRevisionsTitle",*[x["changeKey"] for x in revisions]):
                if not translations[language].get(key):
                    raise ValueError("Untranslated narrative " + language + "/" + key)
    return stories, translations

def episode_markup(data, translations, lang, dynamic=False):
    t = translations[lang]
    def txt(key, tag="span", css=None):
        attrs = (' class="' + css + '"' if css else "")
        if dynamic: attrs += ' data-i18n="' + h(key,quote=True) + '"'
        return "<" + tag + attrs + ">" + h(t[key]) + "</" + tag + ">"
    parts = []
    labels = {"paid":"behindCountPaid","official":"behindCountOfficial","secondary":"behindCountSecondary"}
    for case in data["episodes"]:
        parts.extend([
            '<article class="panel behindStory" data-behind-story="' + h(case["id"],quote=True) + '" id="behind-case-' + h(case["slug"],quote=True) + '">',
            txt("behindCaseNumber",tag="p",css="eyebrow"),
            txt("behindCaseTitle",tag="h2"),
            txt("behindCaseLead",tag="p",css="behindCaseLead"),
            txt("behindStatusPartial",css="behindStatus"),
            '<div class="behindFigures">'
        ])
        for fact in case["quantities"]:
            parts.append('<div class="behindFigure" data-count-type="' + h(fact["id"],quote=True) + '"><strong>' + f'{fact["value"]:,}' + '</strong>' + txt(labels[fact["id"]],css="factLabel") + '</div>')
        parts.extend([
            '</div>',
            txt("behindCountSecondaryCaveat",tag="p",css="behindCaveat"),
            '<div class="behindFindings">',
            '<section class="behindFinding" data-status="documented">',
            txt("behindExplainedBadge",css="findingPill"),
            txt("behindDifference2",css="findingNumbers"),
            txt("behindExplainedTitle",tag="h3"),
            txt("behindExplainedBody",tag="p"),
            '</section>',
            '<section class="behindFinding" data-status="unresolved">',
            txt("behindOpenBadge",css="findingPill"),
            txt("behindDifference1",css="findingNumbers"),
            txt("behindOpenTitle",tag="h3"),
            txt("behindOpenBody",tag="p"),
            '</section></div>'
        ])
        for title,body in (("behindWhyTitle","behindWhyBody"),("behindMethodTitle","behindMethodBody"),("behindUpdateTitle","behindUpdateBody")):
            parts.append('<section class="behindReading">' + txt(title,tag="h3") + txt(body,tag="p") + '</section>')
        parts.extend([
            '<section class="behindReading behindSourcesBlock">',
            txt("behindSourcesTitle",tag="h3"),
            txt("behindSourcesPreface",tag="p"),
            '<ul class="behindSources">'
        ])
        for source in case["sources"]:
            label=source["labelKey"]
            parts.append('<li data-source-id="' + h(source["id"],quote=True) + '" data-source-kind="' + h(source["kind"],quote=True) + '"><a href="' + h(source["url"],quote=True) + '" target="_blank" rel="noopener noreferrer">' + txt(label) + ' ↗</a></li>')
        parts.extend([
            '</ul></section>',
            '<section class="behindReading behindRevisions">',
            txt("behindRevisionsTitle",tag="h3"),
            '<ol class="behindRevisionHistory">'
        ])
        for revision in case["revisionHistory"]:
            parts.append('<li data-editorial-revision="' + h(revision["date"],quote=True) + '"><time datetime="' + h(revision["date"],quote=True) + '">' + h(revision["date"]) + '</time> ' + txt(revision["changeKey"]) + '</li>')
        parts.extend([
            '</ol></section>',
            '<section class="behindReading">',
            txt("behindIndependenceTitle",tag="h3"),
            txt("behindIndependenceBody",tag="p"),
            '</section>',
            '<div class="behindCaseFooter">',
            txt("behindReviewDateLabel"),
            '<time datetime="' + h(case["revisedOn"],quote=True) + '">' + h(case["revisedOn"]) + '</time>',
            '</div></article>'
        ])
    return "\n".join(parts)

def render_stories(root=None):
    stories, translations=load()
    return episode_markup(stories,translations,"en",dynamic=True)

def render_page(data,tr,lang,pub):
    t=tr[lang]
    url=BASE+"behind-the-round/"+lang+"/"
    lang_nav=" ".join('<a lang="'+l+'" hreflang="'+l+'" href="'+BASE+'behind-the-round/'+l+'/"'+(' aria-current="page"' if l==lang else "")+'>'+{"en":"English","it":"Italiano","de":"Deutsch","fr":"Français"}[l]+"</a>" for l in LANGS)
    hreflang="\n".join('<link rel="alternate" hreflang="'+l+'" href="'+BASE+'behind-the-round/'+l+'/">' for l in LANGS)
    hreflang+='\n<link rel="alternate" hreflang="x-default" href="'+BASE+'behind-the-round/en/">'
    case=data["episodes"][0]
    structured={
      "@context":"https://schema.org","@type":"Article",
      "headline":t["behindCaseTitle"],"description":t["behindMetaDescription"],
      "image":BASE+"assets/og-preview.png",
      "inLanguage":lang,"datePublished":case["publishedOn"],"dateModified":case["revisedOn"],
      "mainEntityOfPage":url,"isAccessibleForFree":True,
      "author":{"@type":"Person","name":"Robert Bregy"},
      "isPartOf":{"@type":"WebSite","name":"Connecting the Dots","url":BASE},
      "citation":[s["url"] for s in case["sources"]],
      "about":[{"@type":"Thing","name":"ICANN New gTLD Program 2026 Reveal Day"}]
    }
    content=episode_markup(data,tr,lang)
    chronology=BASE+"inside-the-round/"+lang+"/"
    return f'''<!doctype html>
<html lang="{lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="index,follow,max-image-preview:large">
<title>{h(t["behindMetaTitle"])}</title>
<meta name="description" content="{h(t["behindMetaDescription"],quote=True)}">
<link rel="canonical" href="{url}">
{hreflang}
<link rel="icon" href="{BASE}assets/logo-mark.png" type="image/png">
<meta property="og:type" content="article"><meta property="og:site_name" content="Connecting the Dots">
<meta property="og:title" content="{h(t["behindMetaTitle"],quote=True)}">
<meta property="og:description" content="{h(t["behindMetaDescription"],quote=True)}">
<meta property="og:url" content="{url}"><meta property="og:image" content="{BASE}assets/og-preview.png">
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">{json.dumps(structured,ensure_ascii=False,separators=(",",":"))}</script>
<style>{CSS}\n{BEHIND_CSS}</style></head><body>
<header><nav aria-label="Languages"><a class="brand" href="{BASE}{lang}/">Connecting the Dots</a><div class="lang-links">{lang_nav}</div></nav></header>
<main id="behind-round">
<div class="eyebrow">{h(t["behindEyebrow"])}</div>
<h1>{h(t["behindTitle"])}</h1>
<p class="lead">{h(t["behindIntro"])}</p>
<div class="actions"><a class="action" href="{chronology}">{h(t["behindChronicleCta"])}</a><a class="action secondary" href="{BASE}{lang}/?tab=behind-round#behind-round">{h(t["behindNav"])}</a></div>
{content}
</main>
<footer>Connecting the Dots · <a href="{BASE}{lang}/">ICANN 2026</a> ·
<a href="https://doi.org/10.5281/zenodo.23262623">Research Release RR1 (archived evidence)</a></footer></body></html>
'''

def build_behind_round_pages(root=None,publication=None):
    root=Path(root or ROOT)
    data,tr=load()
    pub=publication or json.loads((root/"publication.json").read_text(encoding="utf-8"))
    for lang in LANGS:
        out=root/"behind-the-round"/lang/"index.html"
        out.parent.mkdir(parents=True,exist_ok=True)
        out.write_text(render_page(data,tr,lang,pub),encoding="utf-8")
    sitemap=root/"sitemap.xml"
    xml=sitemap.read_text(encoding="utf-8")
    if xml.count("<url>")!=11 or "</urlset>" not in xml:
        raise ValueError("Expected 11 existing URLs before Behind the Round extensions")
    items=[]
    for lang in LANGS:
        relative="behind-the-round/"+lang+"/"
        item=f'  <url>\n    <loc>{BASE}{relative}</loc>\n    <lastmod>{pub["releasedOn"]}</lastmod>\n'
        for l in (*LANGS,"x-default"):
            target="en" if l=="x-default" else l
            item+=f'    <xhtml:link rel="alternate" hreflang="{l}" href="{BASE}behind-the-round/{target}/"/>\n'
        items.append(item+"  </url>")
    xml=xml.replace("</urlset>","\n".join(items)+"\n</urlset>")
    sitemap.write_text(xml,encoding="utf-8")
    print(f"Generated Behind the Round: {len(LANGS)} languages, {len(data['episodes'])} evidence-backed cases, {xml.count('<url>')} sitemap URLs")

if __name__=="__main__":
    build_behind_round_pages()
