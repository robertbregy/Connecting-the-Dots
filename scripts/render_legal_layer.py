#!/usr/bin/env python3
"""Render the legal/procedural chapter into the native four-language publication.

The legal layer is editorial and procedural. It does not alter APS/IANA snapshots,
research releases or historic dispute evidence. The chapter is inserted between
contention and Disputed Dots in the reader path, while the historical case cards
remain separate.
"""
from __future__ import annotations

from html import escape
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
DATA = json.loads((ROOT / "data" / "legal_layer.json").read_text(encoding="utf-8"))
LANGS = ("en", "it", "de", "fr")


def e(value: object) -> str:
    return escape(str(value), quote=True)


def source_chip(url: str, label: str) -> str:
    return f'<a class="sourceChip" href="{e(url)}" target="_blank" rel="noopener noreferrer">{e(label)} ↗</a>'


def render_section(lang: str, prefix: str) -> str:
    L = DATA["locales"][lang]
    S = DATA["sources"]
    mechanisms = "".join(
        '<article class="panel"><div class="panelTop"><span class="ep factBadge">PROCEDURE</span></div>'
        f'<h3>{e(title)}</h3><p><b>{e(actor)}</b></p><p>{e(decider)}</p><p class="sub">{e(effect)}</p></article>'
        for title, actor, decider, effect in L["mechanisms"]
    )
    objections = "".join(
        '<article class="panel">'
        f'<div class="panelTop"><span class="pill">{e(provider)}</span></div><h3>{e(title)}</h3>'
        f'<p>{e(test)}</p><div class="note">{e(effect)}</div></article>'
        for title, provider, test, effect in L["objections"]
    )
    process = "".join(
        f'<article class="step"><div class="n">{i:02d}</div><b>{e(title)}</b><p>{e(body)}</p></article>'
        for i, (title, body) in enumerate(L["process"], 1)
    )
    timings = "".join('<article class="panel"><h3>'+e(a)+'</h3><p class="sub">'+e(b)+'</p></article>' for a,b in L["timings"])
    glossary = "".join('<article class="panel"><h3>'+e(a)+'</h3><p class="sub">'+e(b)+'</p></article>' for a,b in L["glossary"])
    source_links = "".join([
        source_chip(S["icannCommunityInput"], "ICANN · Community Input"),
        source_chip(S["icannObjections"], "ICANN · Objections & Appeals"),
        source_chip(S["applicantGuidebook"], "ICANN · Applicant Guidebook"),
        source_chip(S["wipoLro"], "WIPO · Legal Rights Objections"),
        source_chip(S["wipoSco"], "WIPO · String Confusion Objections"),
        source_chip(S["icc"], "ICC · New gTLD Dispute Resolution"),
        source_chip(S["rvc"], "ICANN · Registry Voluntary Commitments"),
        source_chip(S["independentObjectors"], "ICANN · Independent Objectors"),
        source_chip(S["singularPlural"], "ICANN · Singular/Plural Evaluation"),
        source_chip(S["independentObjectors"], "ICANN · Independent Objectors"),
        source_chip(S["singularPlural"], "ICANN · Singular/Plural Evaluation"),
        source_chip(S["independentObjectors"], "ICANN · Independent Objectors"),
        source_chip(S["singularPlural"], "ICANN · Singular/Plural Evaluation"),
    ])
    cms = "".join(source_chip(S[f"cms{i}"], f"CMS · Joining the Dots · Part {i}") for i in range(1, 5))
    return f'''<section class="section" id="legal" data-legal-layer="{e(DATA['reviewedOn'])}">
<div class="panel">
  <div class="panelTop"><span class="ep factBadge">PROCEDURE</span><span class="ep readingBadge">READING</span></div>
  <h2>{e(L["title"])}</h2>
  <div class="disputesKicker">{e(L["kicker"])}</div>
  <p class="sub sectionLead">{e(L["intro"])}</p>
  <div class="note"><b>{e(L["caveatTitle"])}</b><br>{e(L["caveatBody"])}</div>
  <div class="boundaryCrosslink"><span>{e(L["bridgeContention"])}</span><a class="sectionLink" data-open-section="contention" href="#contention">{e(L["readContention"])} →</a></div>
</div>
<div class="panel">
  <div class="panelTop"><span class="ep factBadge">2026</span></div>
  <h2>{e(L["statusTitle"])}</h2><p class="sub sectionLead">{e(L["statusBody"])}</p>
  {source_chip(S["icannCommunityInput"], "ICANN · Community Input & Objections")}
</div>
<div class="panel">
  <h2>{e(L["timingTitle"])}</h2><p class="sub sectionLead">{e(L["timingIntro"])}</p><div class="grid2">{timings}</div>
  <div class="srcs">{source_chip(S["icannObjections"], "ICANN · Objections & Appeals")}{source_chip(S["independentObjectors"], "ICANN · Independent Objectors")}{source_chip(S["singularPlural"], "ICANN · Singular/Plural Evaluation")}</div>
</div>
<div class="panel">
  <h2>{e(L["mapTitle"])}</h2><p class="sub sectionLead">{e(L["mapIntro"])}</p>
  <div class="grid2">{mechanisms}</div>
</div>
<div class="panel">
  <h2>{e(L["objectionsTitle"])}</h2><p class="sub sectionLead">{e(L["objectionsIntro"])}</p>
  <div class="grid2">{objections}</div>
</div>
<div class="panel">
  <h2>{e(L["processTitle"])}</h2><p class="sub sectionLead">{e(L["processIntro"])}</p>
  <div class="processGrid">{process}</div>
</div>
<div class="panel">
  <h2>{e(L["glossaryTitle"])}</h2><p class="sub sectionLead">{e(L["glossaryIntro"])}</p><div class="grid2">{glossary}</div>
</div>
<div class="panel">
  <h2>{e(L["outcomesTitle"])}</h2><p class="sub sectionLead">{e(L["outcomesBody"])}</p>
</div>
<div class="panel">
  <div class="panelTop"><span class="ep factBadge">CONTRACT</span></div>
  <h2>{e(L["rvcTitle"])}</h2><p class="sub sectionLead">{e(L["rvcBody"])}</p>
  {source_chip(S["rvc"], "ICANN · RVC")}
</div>
<div class="panel">
  <h2>{e(L["casesTitle"])}</h2><p class="sub sectionLead">{e(L["casesBody"])}</p>
  <div class="boundaryCrosslink"><span>{e(L["bridgeDisputes"])}</span><a class="sectionLink" data-open-section="disputes" href="#disputes">{e(L["readDisputes"])} →</a></div>
  <p class="small"><a class="sourceChip" href="{e(prefix)}behind-the-round/{lang}/objectors-eoi/" data-legal-objectors-link>{e(L["readObjectors"])} →</a></p>
</div>
<div class="panel">
  <h2>{e(L["sourcesTitle"])}</h2><p class="sub">{e(L["sourcesNote"])}</p>
  <div class="srcs">{source_links}</div>
  <details><summary>CMS · Joining the Dots</summary><div class="srcs">{cms}</div></details>
  <p class="small">{e(L["notAdvice"])}</p>
</div>
</section>'''


def render_card(lang: str) -> str:
    L = DATA["locales"][lang]
    return (
        '<article class="iaHubCard" data-legal-hub-card>'
        f'<h3><a href="#legal" data-open-section="legal">{e(L["nav"])}</a></h3>'
        f'<p>{e(L["card"])}</p></article>'
    )


def inject(path: Path, lang: str) -> None:
    html = path.read_text(encoding="utf-8")
    html = re.sub(r'<section class="section" id="legal" data-legal-layer="[^"]+">.*?</section>(?=<section class="section" id=")', "", html, flags=re.S)
    html = re.sub(r'<article class="iaHubCard" data-legal-hub-card>.*?</article>', "", html, flags=re.S)
    marker = '<section class="section" id="disputes">'
    if html.count(marker) != 1:
        raise SystemExit(f"Legal insertion anchor missing or duplicated: {path}")
    prefix = "" if path.name == "index.html" and path.parent == ROOT else "../"
    html = html.replace(marker, render_section(lang, prefix) + marker, 1)
    hub_start = html.find('<section class="section iaHub" id="ia-outcomes"')
    hub_end = html.find('</section>', hub_start)
    if hub_start < 0 or hub_end < 0:
        raise SystemExit(f"Outcomes hub missing: {path}")
    segment = html[hub_start:hub_end]
    contention = re.search(r'<article class="iaHubCard"><h3><a href="#contention".*?</article>', segment, re.S)
    if not contention:
        raise SystemExit(f"Contention card missing from outcomes hub: {path}")
    absolute_end = hub_start + contention.end()
    html = html[:absolute_end] + "\n" + render_card(lang) + html[absolute_end:]
    path.write_text(html, encoding="utf-8")


def main() -> None:
    targets = [(ROOT / "index.html", "en")] + [(ROOT / lang / "index.html", lang) for lang in LANGS]
    for path, lang in targets:
        inject(path, lang)
    print("LEGAL_LAYER_RENDERED", json.dumps({
        "reviewedOn": DATA["reviewedOn"],
        "pages": len(targets),
        "status": DATA["status"],
        "snapshotChanged": False,
        "researchReleaseChanged": False,
    }, sort_keys=True))


if __name__ == "__main__":
    main()
