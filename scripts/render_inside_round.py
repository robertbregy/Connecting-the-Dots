#!/usr/bin/env python3
"""Render the 2026 round's public editorial timeline from one small source.

The event register is NOT part of the immutable RR1 evidence release. It is a
living editorial chronology: documented events, future milestones and possible
outcomes remain visibly different. No application-level private information.
"""
from __future__ import annotations

from datetime import date
from html import escape as h
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://robertbregy.github.io/Connecting-the-Dots/"
LANGS = ("en", "it", "de", "fr")
STATUS = {
    "observed": "insideStateObserved",
    "current": "insideStateCurrent",
    "scheduled": "insideStateScheduled",
    "evolving": "insideStateEvolving",
    "conditional": "insideStateConditional",
}
SCOPE = {
    "program": "insideScopeProgram",
    "program-and-case": "insideScopeProgramCase",
    "possibility": "insideScopePossibility",
}

CSS = """
:root{--background:#f6f7fa;--surface:#fff;--surface2:#f1f3f7;--text:#16243c;--muted:#43536c;--border:#ced9e5;--accent:#1568ab;--accent-soft:#e9f3fc;--accent-text:#165d91;color-scheme:light;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
*{box-sizing:border-box}body{margin:0;background:var(--background);color:var(--text);line-height:1.67}
a{color:#195f99;text-underline-offset:3px}a:focus-visible{outline:3px solid #2e78ac;outline-offset:3px}
header{background:#122c4a;color:#fff}header a{color:#fff}
nav,main,footer{max-width:970px;margin:auto;padding:20px 24px}
nav{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:14px}
nav .brand{text-decoration:none;font-weight:800}nav .lang-links{display:flex;flex-wrap:wrap;gap:13px;font-size:.88rem}
main{padding-top:42px;padding-bottom:60px}h1{font-size:clamp(2.1rem,5vw,3.65rem);line-height:1.12;letter-spacing:-.04em;margin:8px 0 18px}
h2{font-size:1.45rem;line-height:1.25}p{margin:0 0 14px}.eyebrow{font-weight:800;color:#276b99;letter-spacing:.12em;text-transform:uppercase;font-size:.79rem}
.lead{color:var(--muted);font-size:1.15rem;max-width:780px}
.actions{display:flex;flex-wrap:wrap;gap:13px;margin:22px 0 32px}
.action{display:inline-block;text-decoration:none;border-radius:9px;padding:10px 15px;font-weight:750;background:#195e93;color:#fff}
.action.secondary{color:#195e93;background:#fff;border:1px solid #9cb6ce}
.panel{background:var(--surface);border:1px solid var(--border);border-radius:15px;padding:25px;margin:18px 0}
.insideRoundLenses{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:22px 0}
.insideRoundLens{border-radius:12px;padding:16px;border:1px solid var(--border);background:var(--surface2)}
.insideRoundLens h3{font-size:1.03rem;margin:0 0 7px}.insideRoundLens p{color:var(--muted);font-size:.9rem}
.insideRoundTimeline{padding:0 0 0 22px;border-left:1px solid var(--border);list-style:none;margin:25px 0 0}
.insideRoundEntry{position:relative;border:1px solid var(--border);border-radius:13px;background:var(--surface);padding:20px;margin:0 0 18px}
.insideRoundEntry:before{content:"";position:absolute;width:10px;height:10px;left:-29px;top:26px;background:var(--accent);border:3px solid var(--surface);border-radius:50%;box-shadow:0 0 0 1px var(--border)}
.insideRoundMeta{display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;margin-bottom:11px}
.insideRoundDate{font-weight:750;font-variant-numeric:tabular-nums;font-size:.85rem}
.insideRoundState,.insideRoundScope{display:inline-block;background:var(--surface2);color:var(--text);border-radius:99px;border:1px solid var(--border);font-size:.72rem;padding:4px 9px;font-weight:750}
.insideRoundEntry[data-round-state="current"]{border-color:var(--accent)}
.insideRoundEntry[data-round-state="current"] .insideRoundState{color:var(--accent-text);background:var(--accent-soft);border-color:var(--accent)}
.insideRoundEntry[data-round-state="scheduled"],.insideRoundEntry[data-round-state="evolving"],.insideRoundEntry[data-round-state="conditional"]{border-style:dashed}
.insideRoundEntry h3{font-size:1.2rem;margin:0 0 8px}
.insideRoundEntry p{font-size:.98rem;color:var(--muted)}
.insideRoundEntry a{font-size:.83rem;overflow-wrap:anywhere}
.muted{color:var(--muted);font-size:.94rem}
footer{border-top:1px solid var(--border);color:var(--muted);font-size:.9rem;padding-bottom:36px}
@media(max-width:760px){.insideRoundLenses{grid-template-columns:1fr}.panel{padding:18px}.insideRoundEntry{padding:15px}}
"""

def load():
    data = json.loads((ROOT / "data/inside_the_round_events.json").read_text(encoding="utf-8"))
    tr = json.loads((ROOT / "data/translations.json").read_text(encoding="utf-8"))
    if data.get("schemaVersion") != 1 or not data.get("lastReviewed"):
        raise ValueError("Unsupported Inside the Round event register")
    date.fromisoformat(data["lastReviewed"])
    if len(data.get("events", [])) < 5:
        raise ValueError("Incomplete 2026 event timeline")
    ids = set()
    for event in data["events"]:
        if event["id"] in ids:
            raise ValueError("Duplicate timeline event id: " + event["id"])
        ids.add(event["id"])
        if event["state"] not in STATUS or event["scope"] not in SCOPE:
            raise ValueError("Invalid timeline state / scope: " + event["id"])
        if not event["source"].startswith(("https://www.icann.org/", "https://newgtldprogram.icann.org/")):
            raise ValueError("Public ICANN source missing: " + event["id"])
        when = date.fromisoformat(event["date"]) if event.get("date") else None
        until = date.fromisoformat(event["endDate"]) if event.get("endDate") else None
        today = date.fromisoformat(data["lastReviewed"])
        if event["state"] == "observed" and not when <= today:
            raise ValueError("Future event marked observed")
        if event["state"] == "current" and not (when <= today <= until):
            raise ValueError("Current event not current as of editorial review")
        if event["state"] == "scheduled" and not (when and when > today):
            raise ValueError("Scheduled event must have a future date")
        if event["state"] in ("evolving", "conditional") and when is not None:
            raise ValueError("Unknown future event must not have a fixed date")
        for language in LANGS:
            for key in (event["dateKey"], event["titleKey"], event["bodyKey"], STATUS[event["state"]], SCOPE[event["scope"]]):
                if not tr.get(language, {}).get(key):
                    raise ValueError("Missing translation " + language + ": " + key)
    return data, tr


def timeline_markup(data, tr, lang, dynamic=False):
    texts = tr[lang]
    out = ['<ol class="insideRoundTimeline" aria-labelledby="' + ("insideRoundTimelineTitle" if dynamic else "timelineTitle") + '">']
    for event in data["events"]:
        eid = h(event["id"], quote=True)
        state = h(event["state"], quote=True)
        def copy(key, tag="span", cls=None):
            attrs = (' class="' + cls + '"' if cls else "")
            if dynamic:
                attrs += ' data-i18n="' + h(key, quote=True) + '"'
            return '<' + tag + attrs + '>' + h(texts[key]) + '</' + tag + '>'
        date_text = copy(event["dateKey"], cls="insideRoundDate")
        if event.get("date"):
            date_text = '<time datetime="' + h(event["date"], quote=True) + '" class="insideRoundDate"' + (' data-i18n="' + event["dateKey"] + '"' if dynamic else '') + '>' + h(texts[event["dateKey"]]) + '</time>'
        out.append('<li class="insideRoundEntry" data-event-id="' + eid + '" data-round-state="' + state + '">')
        out.append('<div class="insideRoundMeta">' + date_text + copy(STATUS[event["state"]], cls="insideRoundState") + copy(SCOPE[event["scope"]], cls="insideRoundScope") + '</div>')
        out.append(copy(event["titleKey"], tag="h3"))
        out.append(copy(event["bodyKey"], tag="p"))
        out.append('<a href="' + h(event["source"], quote=True) + '" rel="noopener noreferrer" target="_blank">ICANN · ' + h(texts["insideSourcesLabel"]) + ' ↗</a>')
        out.append('</li>')
    out.append('</ol>')
    return "\n".join(out)


def render_timeline(root=None):
    data, tr = load()
    return timeline_markup(data, tr, "en", dynamic=True)


def render_page(data, tr, lang, pub):
    t = tr[lang]
    url = BASE + "inside-the-round/" + lang + "/"
    lang_nav = " ".join(
        '<a lang="' + l + '" hreflang="' + l + '" href="' + BASE + 'inside-the-round/' + l + '/"' +
        (' aria-current="page"' if l == lang else "") + '>' +
        {"en": "English", "it": "Italiano", "de": "Deutsch", "fr": "Français"}[l] + '</a>'
        for l in LANGS
    )
    hreflang = "\n".join(
        '<link rel="alternate" hreflang="' + l + '" href="' + BASE + 'inside-the-round/' + l + '/">'
        for l in LANGS
    ) + '\n<link rel="alternate" hreflang="x-default" href="' + BASE + 'inside-the-round/en/">'
    structured = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": t["insideMetaTitle"],
        "description": t["insideMetaDescription"],
        "inLanguage": lang,
        "dateModified": data["lastReviewed"],
        "url": url,
        "isAccessibleForFree": True,
        "author": {"@type": "Person", "name": "Robert Bregy"},
        "isPartOf": {"@type": "WebSite", "name": "Connecting the Dots", "url": BASE},
        "about": [{"@type": "Thing", "name": "ICANN New gTLD Program: 2026 Round"}]
    }
    def lens(title, body):
        return '<article class="insideRoundLens"><h3>' + h(t[title]) + '</h3><p>' + h(t[body]) + '</p></article>'
    lenses = "\n".join([
        lens("insideProgramTitle", "insideProgramBody"),
        lens("insideLandscapeTitle", "insideLandscapeBody"),
        lens("insideCaseTitle", "insideCaseBody")
    ])
    timeline = timeline_markup(data, tr, lang)
    def action(key, href, secondary=False):
        return '<a class="action' + (' secondary' if secondary else '') + '" href="' + h(href, quote=True) + '">' + h(t[key]) + '</a>'
    return f'''<!doctype html>
<html lang="{lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="index,follow,max-image-preview:large">
<title>{h(t["insideMetaTitle"])}</title>
<meta name="description" content="{h(t["insideMetaDescription"], quote=True)}">
<link rel="canonical" href="{url}">
{hreflang}
<link rel="icon" href="{BASE}assets/logo-mark.png" type="image/png">
<meta property="og:type" content="article"><meta property="og:site_name" content="Connecting the Dots">
<meta property="og:title" content="{h(t["insideMetaTitle"], quote=True)}">
<meta property="og:description" content="{h(t["insideMetaDescription"], quote=True)}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{BASE}assets/og-preview.png">
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">{json.dumps(structured, ensure_ascii=False, separators=(",",":"))}</script>
<style>{CSS}</style></head><body>
<header><nav aria-label="Languages"><a class="brand" href="{BASE}{lang}/">Connecting the Dots</a><div class="lang-links">{lang_nav}</div></nav></header>
<main id="inside-round">
<div class="eyebrow">{h(t["insideEyebrow"])}</div><h1>{h(t["insideTitle"])}</h1>
<p class="lead">{h(t["insideIntro"])}</p>
<div class="actions">{action("insideCaseCta", BASE + lang + "/?tab=lugano#lugano")}{action("insideResearchCta", BASE + lang + "/?tab=research#research", True)}</div>
<section class="panel" aria-label="{h(t["insideProgramTitle"], quote=True)}">
<div class="insideRoundLenses">{lenses}</div></section>
<section class="panel" aria-labelledby="timelineTitle">
<h2 id="timelineTitle">{h(t["insideTimelineTitle"])}</h2><p class="muted">{h(t["insideTimelineIntro"])}</p>
{timeline}
<p class="muted">{h(t["insideReviewedLabel"])}: <time datetime="{data["lastReviewed"]}">{data["lastReviewed"]}</time></p>
</section>
<section class="panel"><h2>{h(t["insideDisclosureTitle"])}</h2><p>{h(t["insideDisclosureBody"])}</p>
<p class="muted">{h(t["insideMethodNote"])}</p>
<p><a href="https://newgtldprogram.icann.org/en/application-rounds/round2/applicant-journey">{h(t["insideProgramCta"])}</a> · <a href="{BASE}{lang}/?tab=lugano#lugano">{h(t["insideCaseCta"])}</a></p></section>
</main>
<footer>Connecting the Dots · <a href="{BASE}{lang}/">2026 New gTLD Program</a> ·
<a href="https://doi.org/10.5281/zenodo.23262623">Research Release RR1 (Zenodo DOI)</a></footer></body></html>
'''


def build_inside_round_pages(root=None, publication=None):
    root = Path(root or ROOT)
    data, tr = load()
    pub = publication or json.loads((root / "publication.json").read_text(encoding="utf-8"))
    for lang in LANGS:
        out = root / "inside-the-round" / lang / "index.html"
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(render_page(data, tr, lang, pub), encoding="utf-8")
    sitemap_path = root / "sitemap.xml"
    xml = sitemap_path.read_text(encoding="utf-8")
    if "</urlset>" not in xml or xml.count("<url>") != 4:
        raise ValueError("Expected a freshly regenerated sitemap with four language URLs")
    extras = ["explorer/", "research/", "research/connecting-the-dots-working-paper-v1.html"]
    extras.extend("inside-the-round/" + lang + "/" for lang in LANGS)
    def alt(lang):
        return "\n".join(
            '    <xhtml:link rel="alternate" hreflang="' + l + '" href="' +
            BASE + "inside-the-round/" + ("en" if l == "x-default" else l) + '/"/>'
            for l in (*LANGS, "x-default")
        )
    items = []
    for relative in extras:
        item = f'  <url>\n    <loc>{BASE}{relative}</loc>\n    <lastmod>{pub["releasedOn"]}</lastmod>\n'
        if relative.startswith("inside-the-round/"):
            item += alt(relative.split("/")[1]) + "\n"
        item += "  </url>"
        items.append(item)
    xml = xml.replace("</urlset>", "\n".join(items) + "\n</urlset>")
    sitemap_path.write_text(xml, encoding="utf-8")
    print(f"Generated Inside the Round: {len(LANGS)} languages, {len(data['events'])} milestones, {xml.count('<url>')} sitemap URLs")


if __name__ == "__main__":
    build_inside_round_pages()
