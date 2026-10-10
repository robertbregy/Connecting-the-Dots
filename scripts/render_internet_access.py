#!/usr/bin/env python3
"""Build source-backed Internet access and censorship explainer in four languages.

The living explainer is deliberately distinct from 2026 Field Notes and frozen RR1.
Its interactive walkthrough is a model: no probes, remote requests or visitor tracking.
"""
from __future__ import annotations

from datetime import date
from html import escape as h
from pathlib import Path
from xml.etree import ElementTree as ET
import json

from scripts.render_inside_round import BASE, LANGS, CSS

ROOT = Path(__file__).resolve().parents[1]
SLUG = "who-controls-internet-access"
ACCESS_CSS = """
.accessIntro{padding:20px 24px;border-left:4px solid var(--accent);background:var(--surface2);border-radius:0 13px 13px 0;margin:22px 0 27px}
.accessIntro h2{font-size:1.13rem;margin:0 0 7px}.accessIntro p{margin:0;color:var(--muted)}
.accessSimulator{border:1px solid var(--border);border-radius:18px;background:var(--surface);padding:27px;margin:22px 0 35px}
.accessSimulator h2,.accessActorSection h2,.accessCaseSection h2{font-size:clamp(1.4rem,3.5vw,1.85rem);letter-spacing:-.018em;margin:0 0 9px}
.accessSimulator .intro,.accessCaseSection .intro,.accessActorSection .intro{max-width:82ch;color:var(--muted);margin-bottom:19px}
.accessSample{display:flex;gap:12px;align-items:center;flex-wrap:wrap;background:var(--surface2);border-radius:9px;padding:12px 15px}
.accessSample span{color:var(--muted);font-size:.84rem}.accessSample code{font-size:1rem;overflow-wrap:anywhere}
.accessChoices{display:flex;gap:8px;flex-wrap:wrap;margin:14px 0 25px}
.accessChoices button{font:inherit;font-size:.86rem;min-height:42px;max-width:100%;border-radius:10px;cursor:pointer;border:1px solid #97afc9;background:var(--surface);color:var(--text);padding:9px 12px;text-align:center;transition:background .12s}
.accessChoices button[aria-pressed="true"]{background:var(--accent);border-color:var(--accent);color:#fff;font-weight:750}
.accessChoices button:hover{box-shadow:0 0 0 1px var(--accent)}
.accessChoices button:focus-visible{outline:3px solid #327bb1;outline-offset:2px}
.accessStages{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
.accessPrerequisite{list-style:none;margin:0 0 20px;padding:0;display:grid;grid-template-columns:minmax(0,1fr);gap:8px}
.accessPreconditionsHeading{font-size:1rem;margin:0 0 6px}
.accessPreconditionsBody{color:var(--muted);font-size:.87rem;line-height:1.55;max-width:85ch;margin:0 0 10px}
.accessPrerequisite li{max-width:100%;border-left:4px solid var(--accent)}
.accessFlowLead{font-size:.84rem;color:var(--muted);margin:0 0 12px}
.accessStages li,.accessPrerequisite li{border:1px solid var(--border);border-radius:11px;padding:13px;min-width:0;background:var(--surface2);transition:background .15s}
.accessStages li h3,.accessPrerequisite li h3{font-size:.93rem;line-height:1.25;margin:7px 0}
.accessStages li p,.accessPrerequisite li p{color:var(--muted);font-size:.79rem;line-height:1.48;margin:0}
.accessStages li .state,.accessPrerequisite li .state{font-size:.75rem;font-weight:780}
.accessStages li[data-state="passed"],.accessPrerequisite li[data-state="passed"]{border-color:#82b8a0;background:#e9f8f1;color:#185e45}
.accessStages li[data-state="blocked"],.accessPrerequisite li[data-state="blocked"]{border-color:#b99a5d;background:#fff2d8;color:#76520d}
.accessStages li[data-state="pending"],.accessPrerequisite li[data-state="pending"]{border-color:var(--border);background:var(--surface2);opacity:.67}
.accessScenarios{margin-top:20px}
.accessScenario{border:1px solid var(--border);border-radius:14px;padding:18px 20px}
.accessScenario[data-outcome="blocked"]{border-left:4px solid #af8240}
.accessScenario[data-outcome="open"]{border-left:4px solid #448a6b}
.accessScenario[hidden]{display:none!important}
.accessScenario h3{margin:6px 0 7px;font-size:1.15rem}
.accessScenario p{color:var(--muted);margin:0 0 12px;line-height:1.65}
.accessOutcome{font-size:.75rem;font-weight:800;text-transform:uppercase;letter-spacing:.06em}
.accessImpacts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
.accessImpacts>div{border-radius:10px;padding:10px 12px;background:var(--surface2)}
.accessImpacts strong{font-size:.81rem;display:block;line-height:1.3;margin-bottom:5px}
.accessImpacts span{font-size:.84rem;line-height:1.45}
.accessLive{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}
.accessCaveat{font-size:.83rem;color:var(--muted);margin:13px 0 0}
.accessActors{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:20px 0}
.accessActors article{background:var(--surface);padding:18px;border:1px solid var(--border);border-radius:13px}
.accessActors h3{font-size:1.08rem;margin:0 0 8px}
.accessActors p{color:var(--muted);font-size:.91rem;margin:0}
.accessCases{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:13px;margin:20px 0 33px}
.accessCases article{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:20px;min-width:0}
.accessCases h3{font-size:1.09rem;margin:10px 0}
.accessCases p{line-height:1.6;font-size:.92rem;color:var(--muted);margin:0}
.accessCasePeriod{font-weight:820;color:var(--accent-text);font-size:.83rem}
.accessEvidenceNote{margin-top:10px!important;font-weight:660}
.accessSources{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;list-style:none;padding:0}
.accessSources li{min-width:0}
.accessSources a{display:block;padding:12px 13px;border-radius:10px;border:1px solid var(--border);text-decoration:none;overflow-wrap:anywhere;font-size:.88rem;line-height:1.42}
.accessSources a:hover,.accessSources a:focus-visible{text-decoration:underline;background:var(--surface2)}
.accessRefs{display:flex;flex-wrap:wrap;gap:6px;margin-top:12px}
.accessRefs a{text-decoration:none;color:var(--accent-text);border:1px solid #9ebbd0;border-radius:6px;background:#eaf3fc;padding:2px 7px;font-size:.77rem;font-weight:750}
.accessRefs a:hover,.accessRefs a:focus-visible{text-decoration:underline}
.accessPanel{padding:22px!important}
.accessPanel h2{margin:0 0 10px}
.accessPanel p{max-width:85ch}
.accessRelated{display:flex;flex-wrap:wrap;gap:11px;margin-top:14px}
.accessRelated a{display:inline-block;padding:10px 14px;border-radius:10px;border:1px solid var(--border);text-decoration:none;font-weight:730}
.accessRelated a:hover{text-decoration:underline;background:var(--surface2)}
.accessDate{color:var(--muted);font-size:.83rem;margin:22px 0}
@media(max-width:860px){.accessStages{grid-template-columns:repeat(2,minmax(0,1fr))}.accessImpacts{grid-template-columns:1fr}}
@media(max-width:600px){.accessSimulator{padding:16px}.accessStages,.accessActors,.accessCases,.accessSources{grid-template-columns:1fr}.accessStages li{padding:13px}.accessChoices button{flex:1 1 calc(50% - 8px)}.accessPanel{padding:16px!important}.accessCaseSection,.accessActorSection{margin-top:26px}}
"""

JS = r"""(function(){
  'use strict';
  var root=document.getElementById('accessSimulator');
  if(!root)return;
  var buttons=Array.prototype.slice.call(root.querySelectorAll('[data-access-select]'));
  var steps=Array.prototype.slice.call(root.querySelectorAll('[data-access-stage]'));
  var panels=Array.prototype.slice.call(root.querySelectorAll('[data-access-scenario-panel]'));
  var live=document.getElementById('accessLive');
  var pass=root.getAttribute('data-pass-label')||'passed';
  var blocked=root.getAttribute('data-block-label')||'interrupted';
  var pending=root.getAttribute('data-pending-label')||'not reached';
  function select(button){
    var id=button.getAttribute('data-access-select');
    var target=Number(button.getAttribute('data-block-stage'));
    buttons.forEach(function(b){b.setAttribute('aria-pressed',b===button?'true':'false');});
    steps.forEach(function(step,i){
      var state=target<0||i<target?'passed':(i===target?'blocked':'pending');
      step.setAttribute('data-state',state);
      var label=step.querySelector('[data-access-state-label]');
      if(label)label.textContent=state==='passed'?pass:(state==='blocked'?blocked:pending);
    });
    panels.forEach(function(p){p.hidden=p.getAttribute('data-access-scenario-panel')!==id;});
    var active=panels.find(function(p){return !p.hidden;});
    if(live&&active)live.textContent=button.textContent.trim()+': '+active.querySelector('h3').textContent.trim();
  }
  buttons.forEach(function(b){b.addEventListener('click',function(){select(b);});});
  if(buttons.length)select(buttons[0]);
})();"""

def load(root: Path = ROOT) -> dict:
    obj = json.loads((root / "data/internet_access_explainer.json").read_text(encoding="utf-8"))
    if obj.get("schemaVersion") != 1 or obj.get("slug") != SLUG:
        raise ValueError("Internet access explainer identity/format invalid")
    if obj.get("editorialLayer") != "living-public-explainer-not-frozen-RR1":
        raise ValueError("Internet access explainer must be distinct from RR1")
    if obj.get("classification") != "governance-and-network-access-explainer":
        raise ValueError("An explanatory analysis may not be labelled a country ranking")
    if date.fromisoformat(obj["publishedOn"]) > date.fromisoformat(obj["reviewedOn"]):
        raise ValueError("Access explainer review precedes publication")
    if set(obj.get("languages",{})) != set(LANGS):
        raise ValueError("Incomplete translations for access explainer")
    valid = ("https://ooni.org/", "https://explorer.ooni.org/", "https://www.internetsociety.org/",
             "https://pulse.internetsociety.org/", "https://itp.cdn.icann.org/", "https://www.gespa.ch/")
    src = {r["id"]:r for r in obj.get("sources",[])}
    if len(src) != len(obj["sources"]) or len(src) != 11:
        raise ValueError("Access explainer requires eleven unique source records")
    if any(not r["url"].startswith(valid) for r in src.values()):
        raise ValueError("Unsupported access explainer evidence source")
    if obj["stageIds"] != ["registry","dns","network","tls","service"]:
        raise ValueError("Educational stage ordering changed without review")
    modes = {r["id"]:r for r in obj["mechanisms"]}
    if list(modes)!=["normal","resolver","ip","tls","service","registration","shutdown"] or len(modes)!=7:
        raise ValueError("Access simulation requires seven distinct scenarios")
    if any((not isinstance(r["blockStage"],int) or r["blockStage"] < -1 or r["blockStage"] > 4) for r in modes.values()):
        raise ValueError("Invalid simulation stage")
    if len(obj["cases"]) != 5 or len({x["id"] for x in obj["cases"]}) != 5:
        raise ValueError("Access explainer requires five unique documented historical cases")
    if len(obj["actors"]) != 5 or len({x["id"] for x in obj["actors"]}) != 5:
        raise ValueError("Access explainer requires five distinct responsible roles")
    for r in (*obj["mechanisms"], *obj["actors"], *obj["cases"]):
        if not r["sourceIds"] or any(k not in src for k in r["sourceIds"]):
            raise ValueError("Unsupported/unsourced access claim " + r["id"])
    for lang in LANGS:
        t = obj["languages"][lang]
        required = ("metaTitle","metaDescription","eyebrow","title","lead","introLabel","introBody",
                    "simTitle","simLead","simUrlLabel","simSelectorLabel","simFlowLabel","simPreconditionLabel","simPreconditionBody",
                    "simStatusOpen","simStatusBlocked","simStatusName","simStatusUsers","simStatusActors",
                    "simStagePassed","simStageBlocked","simStagePending","simNote",
                    "actorsTitle","actorsLead","examplesTitle","examplesLead","caseLabel","caseTime",
                    "limitsTitle","limitsBody","sourcesTitle","sourcesLead",
                    "relatedTitle","relatedBody","sanctionsLink","fieldLink","atlasLink",
                    "methodTitle","methodBody","reviewedLabel","sourceLabel")
        if any(not t.get(key) for key in required):
            raise ValueError("Missing translated access overview in " + lang)
        if len(t["metaDescription"]) > 160:
            raise ValueError("Overlong SEO description " + lang)
        for key, entries in (("stages",obj["stageIds"]),("modes",list(modes)),
                             ("actors",[r["id"] for r in obj["actors"]]),
                             ("cases",[r["id"] for r in obj["cases"]])):
            if set(t[key]) != set(entries):
                raise ValueError("Incomplete translated " + key + " / " + lang)
            for entry in entries:
                if not t[key][entry].get("title" if key!="modes" else "label") or not t[key][entry].get("body"):
                    raise ValueError("Missing localized explanatory text " + lang + "/" + key + "/" + entry)
    return obj

def render_page(obj: dict, lang: str) -> str:
    t = obj["languages"][lang]
    url = BASE + "behind-the-round/" + lang + "/" + SLUG + "/"
    sources = {r["id"]:(i+1,r) for i,r in enumerate(obj["sources"])}
    def refs(ids):
        return '<div class="accessRefs" aria-label="References">' + "".join(
            '<a href="#access-source-'+h(k,quote=True)+'" aria-label="'+h(t["sourceLabel"],quote=True)+' '+
            str(sources[k][0])+'" title="'+h(sources[k][1]["label"],quote=True)+'">['+
            str(sources[k][0])+']</a>' for k in ids) + '</div>'
    def stage_card(stage):
        return ('<li data-access-stage="'+h(stage,quote=True)+'" data-state="passed"><span class="state" data-access-state-label>'+
                h(t["simStagePassed"])+'</span><h3>'+h(t["stages"][stage]["title"])+'</h3><p>'+
                h(t["stages"][stage]["body"])+'</p></li>')
    precondition = stage_card(obj["stageIds"][0])
    request_steps = "\n".join(stage_card(stage) for stage in obj["stageIds"][1:])
    scenarios = "\n".join(
        '<button type="button" data-access-select="'+h(s["id"],quote=True)+
        '" data-block-stage="'+str(s["blockStage"])+
        '" aria-controls="accessPanels" aria-pressed="'+("true" if i==0 else "false")+'">'+
        h(t["modes"][s["id"]]["label"])+'</button>' for i,s in enumerate(obj["mechanisms"]))
    descriptions = []
    for i,s in enumerate(obj["mechanisms"]):
        content=t["modes"][s["id"]]
        def impact(key,field):
            return '<div><strong>'+h(t[key])+'</strong><span>'+h(content[field])+'</span></div>'
        descriptions.append(
            '<div class="accessScenario" data-access-scenario-panel="'+h(s["id"],quote=True)+
            '" data-outcome="'+('open' if s["blockStage"] < 0 else 'blocked')+'"'+("" if i==0 else " hidden")+'>'+
            '<span class="accessOutcome">'+h(t["simStatusOpen"] if s["blockStage"]<0 else t["simStatusBlocked"])+
            '</span><h3>'+h(content["title"])+'</h3><p>'+h(content["body"])+'</p>'+
            '<div class="accessImpacts">'+impact("simStatusName","name")+impact("simStatusUsers","users")+
            impact("simStatusActors","actors")+'</div>'+refs(s["sourceIds"])+'</div>'
        )
    actors = "\n".join(
        '<article data-access-actor="'+h(x["id"],quote=True)+'"><h3>'+
        h(t["actors"][x["id"]]["title"])+'</h3><p>'+
        h(t["actors"][x["id"]]["body"])+'</p>'+refs(x["sourceIds"])+'</article>'
        for x in obj["actors"])
    cases = "\n".join(
        '<article data-access-case="'+h(c["id"],quote=True)+'"><span class="accessCasePeriod">'+
        h(c["period"])+'</span><h3>'+h(t["cases"][c["id"]]["title"])+'</h3><p>'+
        h(t["cases"][c["id"]]["body"])+'</p><p class="accessEvidenceNote">'+
        h(t["cases"][c["id"]]["note"])+'</p>'+refs(c["sourceIds"])+'</article>'
        for c in obj["cases"])
    source_list = "\n".join(
        '<li id="access-source-'+h(s["id"],quote=True)+'"><a href="'+
        h(s["url"],quote=True)+'" target="_blank" rel="noopener noreferrer">['+str(i+1)+'] '+
        h(s["label"])+' ↗</a></li>' for i,s in enumerate(obj["sources"]))
    links = " ".join(
        '<a lang="'+l+'" hreflang="'+l+'" href="'+BASE+'behind-the-round/'+l+'/'+SLUG+'/"'+
        (' aria-current="page"' if l==lang else '')+'>'+{"en":"English","it":"Italiano","de":"Deutsch","fr":"Français"}[l]+'</a>' for l in LANGS)
    alternates = "\n".join(
        '<link rel="alternate" hreflang="'+l+'" href="'+BASE+'behind-the-round/'+("en" if l=="x-default" else l)+'/'+SLUG+'/">'
        for l in (*LANGS,"x-default"))
    schema = {
       "@context":"https://schema.org","@type":"Article","headline":t["title"],
       "description":t["metaDescription"],"inLanguage":lang,"datePublished":obj["publishedOn"],
       "dateModified":obj["reviewedOn"],"mainEntityOfPage":url,"isAccessibleForFree":True,
       "image":BASE+"assets/og-preview.png",
       "author":{"@type":"Person","name":"Robert Bregy"},
       "isPartOf":{"@type":"WebSite","name":"Connecting the Dots","url":BASE},
       "citation":[s["url"] for s in obj["sources"]],
       "about":[{"@type":"Thing","name":"DNS filtering"},{"@type":"Thing","name":"Internet shutdown"},
                {"@type":"Thing","name":"ICANN and TLD governance"}]
    }
    related = BASE+"behind-the-round/"+lang+"/"
    return f'''<!doctype html>
<html lang="{lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="index,follow,max-image-preview:large">
<title>{h(t["metaTitle"])}</title><meta name="description" content="{h(t["metaDescription"],quote=True)}">
<link rel="canonical" href="{url}">{alternates}
<link rel="icon" href="{BASE}assets/logo-mark.png" type="image/png">
<meta property="og:type" content="article"><meta property="og:site_name" content="Connecting the Dots">
<meta property="og:title" content="{h(t["metaTitle"],quote=True)}">
<meta property="og:description" content="{h(t["metaDescription"],quote=True)}">
<meta property="og:url" content="{url}"><meta property="og:image" content="{BASE}assets/og-preview.png">
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">{json.dumps(schema,ensure_ascii=False,separators=(",",":"))}</script>
<style>{CSS}\n{ACCESS_CSS}</style></head><body>
<header><nav aria-label="Languages"><a class="brand" href="{BASE}{lang}/">Connecting the Dots</a>
<div class="lang-links">{links}</div></nav></header>
<main class="accessArticle">
<div class="eyebrow">{h(t["eyebrow"])}</div><h1>{h(t["title"])}</h1><p class="lead">{h(t["lead"])}</p>
<div class="accessIntro"><h2>{h(t["introLabel"])}</h2><p>{h(t["introBody"])}</p></div>
<section class="accessSimulator" id="accessSimulator" aria-labelledby="accessSimulatorTitle"
  data-pass-label="{h(t["simStagePassed"],quote=True)}"
  data-block-label="{h(t["simStageBlocked"],quote=True)}"
  data-pending-label="{h(t["simStagePending"],quote=True)}">
<h2 id="accessSimulatorTitle">{h(t["simTitle"])}</h2><p class="intro">{h(t["simLead"])}</p>
<div class="accessSample"><span>{h(t["simUrlLabel"])}</span><code>https://www.example.com/</code></div>
<h3 style="font-size:1rem;margin:20px 0 8px">{h(t["simSelectorLabel"])}</h3>
<div class="accessChoices" role="group" aria-label="{h(t["simSelectorLabel"],quote=True)}">{scenarios}</div>
<h3 class="accessPreconditionsHeading">{h(t["simPreconditionLabel"])}</h3>
<p class="accessPreconditionsBody">{h(t["simPreconditionBody"])}</p>
<ul class="accessPrerequisite" aria-label="{h(t["simPreconditionLabel"],quote=True)}">{precondition}</ul>
<h3 style="font-size:1rem;margin:0 0 10px">{h(t["simFlowLabel"])}</h3>
<ol class="accessStages">{request_steps}</ol>
<div id="accessPanels" class="accessScenarios">{"".join(descriptions)}</div>
<p id="accessLive" class="accessLive" role="status" aria-live="polite" aria-atomic="true"></p>
<p class="accessCaveat">{h(t["simNote"])}</p>
<noscript><p class="accessCaveat">{h(t["simLead"])}</p></noscript>
</section>
<section class="accessActorSection" aria-labelledby="accessActorsTitle"><h2 id="accessActorsTitle">{h(t["actorsTitle"])}</h2>
<p class="intro">{h(t["actorsLead"])}</p><div class="accessActors">{actors}</div></section>
<section class="accessCaseSection" aria-labelledby="accessCasesTitle"><h2 id="accessCasesTitle">{h(t["examplesTitle"])}</h2>
<p class="intro">{h(t["examplesLead"])}</p><div class="accessCases">{cases}</div></section>
<section class="panel accessPanel"><h2>{h(t["limitsTitle"])}</h2><p>{h(t["limitsBody"])}</p>
{refs(["ooni-method","pulse-method"])}</section>
<section class="panel accessPanel"><h2>{h(t["sourcesTitle"])}</h2><p>{h(t["sourcesLead"])}</p>
<ol class="accessSources">{source_list}</ol></section>
<section class="panel accessPanel"><h2>{h(t["relatedTitle"])}</h2><p>{h(t["relatedBody"])}</p>
<div class="accessRelated">
<a href="{related}sanctions-and-dns/">{h(t["sanctionsLink"])} ↗</a>
<a href="{related}">{h(t["fieldLink"])} ↗</a>
<a href="{BASE}{lang}/?tab=how#how">{h(t["atlasLink"])} ↗</a>
</div></section>
<section class="panel accessPanel"><h2>{h(t["methodTitle"])}</h2><p>{h(t["methodBody"])}</p></section>
<p class="accessDate">{h(t["reviewedLabel"])}: <time datetime="{obj["reviewedOn"]}">{obj["reviewedOn"]}</time></p>
</main>
<footer>Connecting the Dots · <a href="{BASE}{lang}/">ICANN 2026</a> ·
<a href="https://doi.org/10.5281/zenodo.23262623">Research Release RR1 (archived evidence)</a></footer>
<script>{JS}</script></body></html>
'''

def build_access_pages(root: Path = ROOT) -> None:
    obj=load(root)
    for lang in LANGS:
        out=root/"behind-the-round"/lang/SLUG/"index.html"
        out.parent.mkdir(parents=True,exist_ok=True)
        out.write_text(render_page(obj,lang),encoding="utf-8")
    sitemap=root/"sitemap.xml"
    text=sitemap.read_text(encoding="utf-8")
    if text.count("<url>")!=23:
        raise ValueError("Access explainer expects 23 existing sitemap URLs, got "+str(text.count("<url>")))
    additions=[]
    for lang in LANGS:
        target=BASE+"behind-the-round/"+lang+"/"+SLUG+"/"
        item=f'  <url>\n    <loc>{target}</loc>\n    <lastmod>{obj["reviewedOn"]}</lastmod>\n'
        for l in (*LANGS,"x-default"):
            to="en" if l=="x-default" else l
            ref=BASE+"behind-the-round/"+to+"/"+SLUG+"/"
            item+=f'    <xhtml:link rel="alternate" hreflang="{l}" href="{ref}"/>\n'
        additions.append(item+"  </url>")
    text=text.replace("</urlset>","\n".join(additions)+"\n</urlset>")
    sitemap.write_text(text,encoding="utf-8")
    ET.parse(sitemap)
    print(f"Built Internet access explainer for {len(LANGS)} languages; {len(obj['sources'])} primary sources; 27 indexable URLs")

if __name__=="__main__":
    build_access_pages()
