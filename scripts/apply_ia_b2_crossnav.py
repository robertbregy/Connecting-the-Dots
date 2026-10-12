"""Non-destructive IA B2 cross-site navigation on all independent public pages.

This only inserts a compact navigational layer. It never rewrites article bodies,
canonical/hreflang metadata, citations, official APS data or archived research releases.
Idempotent for static explorer/research entry pages and deterministic for generators.
"""
from __future__ import annotations

from html import escape
from pathlib import Path
import json
import re

NAV_STYLE = """<style id="ctd-b2-cross-style">
.ctdB2CrossNav{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px;padding:9px max(14px,calc((100vw - 1230px)/2));box-sizing:border-box;margin:0 auto 15px;background:var(--surface,#f4f7fa);border-bottom:1px solid var(--border,#d4dfe9);font:700 14px/1.35 system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
.ctdB2CrossNav a{display:flex;align-items:center;justify-content:center;min-width:0;min-height:44px;box-sizing:border-box;text-align:center;text-decoration:none;border-radius:8px;padding:8px 6px;color:var(--text,#142d40);overflow-wrap:anywhere;hyphens:auto}
.ctdB2CrossNav a:hover,.ctdB2CrossNav a:focus-visible{outline-offset:2px;background:var(--surface2,#e5eef5);text-decoration:underline}
.ctdB2CrossNav a[aria-current]{background:var(--accent-soft,#dcecfb);color:var(--accent-text,#124f84)}
.ctdB2Context{box-sizing:border-box;max-width:1030px;margin:7px auto 20px;padding:14px 20px;background:var(--surface2,#eff5f9);color:var(--text,#142d40);border:1px solid var(--border,#d4dfe9);border-radius:12px;font:400 14px/1.55 system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
.ctdB2Context strong{display:block;font-size:12px;letter-spacing:.08em;text-transform:uppercase;margin-bottom:4px}.ctdB2Context p{margin:0;color:var(--muted,#526171)}
@media(max-width:700px){.ctdB2CrossNav{grid-template-columns:repeat(3,minmax(0,1fr));gap:4px;font-size:12px;padding:7px 12px}.ctdB2CrossNav a{min-height:44px;padding:7px 4px}}
@media(prefers-color-scheme:dark){.ctdB2CrossNav{background:var(--surface,#18232e);border-color:var(--border,#435365)}.ctdB2CrossNav a{color:var(--text,#eff5fb)}.ctdB2CrossNav a[aria-current]{color:var(--accent-text,#a4d5ff);background:var(--accent-soft,#214467)}}
</style>"""

AREAS = [
    ("understand", "iaNavUnderstand"),
    ("explore", "iaNavExplore"),
    ("stories", "iaNavStories"),
    ("round", "iaNavRound"),
    ("research", "iaNavResearch"),
]
LANGS = ("en", "it", "de", "fr")
CASE_SENSITIVE_PREFIX = "https://robertbregy.github.io/Connecting-the-Dots/"
# The preserved published URL of these evergreen guides still lives below the
# older /behind-the-round/ prefix. The B2 reader-facing classification is distinct:
# governance education, not a 2026 field investigation.
EVERGREEN_GUIDE_CONTEXT = {
    "it": ("GUIDA DI CONTESTO", "Questo è un approfondimento generale sulla governance di Internet, non una nota su un singolo evento del round ICANN 2026. Le note dal campo analizzano invece casi ed eventi specifici."),
    "en": ("BACKGROUND GUIDE", "This is a general guide to Internet governance, not a field note about a particular event in the ICANN 2026 round. Field Notes examine specific cases and events."),
    "de": ("GRUNDLAGEN", "Dies ist ein allgemeiner Beitrag zur Internet-Governance, keine Feldnotiz zu einem bestimmten Ereignis der ICANN-Runde 2026. Die Feldnotizen untersuchen konkrete Fälle und Ereignisse."),
    "fr": ("GUIDE DE CONTEXTE", "Il s'agit d'une explication générale sur la gouvernance d'Internet, et non d'une note portant sur un événement du cycle ICANN 2026. Les notes de terrain examinent des cas et des événements précis."),
}

# Published links remain absolute in static source and in SEO/citation metadata.
# In a branch preview, only existing local project links are switched to that
# preview's document root. External ICANN/IANA/DOI citations are untouched.
LINK_ISOLATION = """<script id="ctd-b2-link-isolation">
(function(){
  "use strict";
  var prod="https://robertbregy.github.io/Connecting-the-Dots/";
  function isolate(){
    var nav=document.querySelector(".ctdB2CrossNav a[data-b2-cross-area]");
    if(!nav)return;
    var hub=new URL(nav.getAttribute("href"),location.href);
    var preview=new URL("../",hub);
    if(preview.href===prod)return;
    document.querySelectorAll("a[href]").forEach(function(link){
      var raw=link.getAttribute("href")||"";
      if(raw.indexOf(prod)!==0)return;
      var tail=raw.slice(prod.length);
      link.setAttribute("href",new URL(tail,preview).href);
    });
  }
  if(document.readyState==="loading")
    document.addEventListener("DOMContentLoaded",isolate,{once:true});
  else isolate();
})();
</script>"""


def editorial_context(file: Path, lang: str) -> str:
    if file.parent.name not in ("sanctions-and-dns", "who-controls-internet-access"):
        return ""
    label, description = EVERGREEN_GUIDE_CONTEXT[lang]
    return ('<aside class="ctdB2Context" data-b2-editorial-kind="evergreen-guide">'
            '<strong>' + escape(label) + '</strong><p>' + escape(description) + '</p></aside>')


def add_crosspage_features(html: str, file: Path, lang: str) -> str:
    match = re.search(r'<nav class="ctdB2CrossNav"[^>]*>[\s\S]*?</nav>', html)
    if not match:
        raise ValueError(f"Missing IA B2 navigation: {file}")
    additions = ""
    if 'id="ctd-b2-link-isolation"' not in html:
        additions += LINK_ISOLATION
    if file.parent.name in ("sanctions-and-dns", "who-controls-internet-access"):
        if 'data-b2-editorial-kind="evergreen-guide"' not in html:
            additions += editorial_context(file, lang)
    if additions:
        html = html[:match.end()] + "\n" + additions + html[match.end():]
    return html



def files_to_patch(root: Path):
    for family in ("applications", "inside-the-round", "behind-the-round"):
        for lang in LANGS:
            yield root / family / lang / "index.html", lang, (
                "explore" if family == "applications" else "round"
            )
    for lang in LANGS:
        for slug in (
            "objectors-eoi",
            "replacement-strings",
            "wdo-identity",
            "sanctions-and-dns",
            "who-controls-internet-access",
        ):
            area = "understand" if slug in ("sanctions-and-dns", "who-controls-internet-access") else "round"
            yield root / "behind-the-round" / lang / slug / "index.html", lang, area
    yield root / "explorer" / "index.html", "en", "explore"
    yield root / "research" / "index.html", "en", "research"


def make_navigation(root: Path, file: Path, lang: str, selected: str, texts: dict) -> str:
    prefix = "/".join(".." for _ in file.parent.relative_to(root).parts)
    if not prefix:
        prefix = "."
    items = []
    for name, key in AREAS:
        target = f"{prefix}/{lang}/?tab=ia-{name}#ia-{name}"
        label = escape(texts[key], quote=False)
        current = ' aria-current="location"' if name == selected else ""
        items.append(f'<a href="{escape(target, quote=True)}" data-b2-cross-area="{name}"{current}>{label}</a>')
    return '<nav class="ctdB2CrossNav" aria-label="' + escape(texts["iaPrimaryLabel"], quote=True) + '">' + "".join(items) + "</nav>"


def apply(root: Path) -> int:
    translations = json.loads((root / "data" / "translations.json").read_text(encoding="utf-8"))
    patched = 0
    files = list(files_to_patch(root))
    assert len(files) == 34, "Expected 34 independent public pages"
    for file, lang, area in files:
        if not file.exists():
            raise ValueError(f"Missing independent page: {file.relative_to(root)}")
        html = file.read_text(encoding="utf-8")
        if 'class="ctdB2CrossNav"' in html:
            assert html.count('class="ctdB2CrossNav"') == 1, file
            upgraded = add_crosspage_features(html, file, lang)
            if upgraded != html:
                file.write_text(upgraded, encoding="utf-8")
                patched += 1
            continue
        if not re.search(r"</head\s*>", html, re.I):
            raise ValueError(f"Missing HTML head: {file}")
        if not re.search(r"</header\s*>", html, re.I):
            raise ValueError(f"Missing leading header: {file}")
        navigation = make_navigation(root, file, lang, area, translations[lang])
        updated = re.sub(r"</head\s*>", NAV_STYLE + "</head>", html, count=1, flags=re.I)
        updated = re.sub(r"</header\s*>", "</header>\n" + navigation, updated, count=1, flags=re.I)
        updated = add_crosspage_features(updated, file, lang)
        if updated.count('class="ctdB2CrossNav"') != 1:
            raise ValueError(f"Navigation injected inconsistently: {file}")
        # Never change title, canonical, alternate languages, or original source claims.
        for exact in ('rel="canonical"', 'hreflang=', 'id="'):
            if html.count(exact) > updated.count(exact):
                raise ValueError(f"Loss of retained metadata {exact}: {file}")
        file.write_text(updated, encoding="utf-8")
        patched += 1
    return patched


def validate(root: Path) -> int:
    total = 0
    for file, lang, area in files_to_patch(root):
        html = file.read_text(encoding="utf-8")
        if html.count('class="ctdB2CrossNav"') != 1:
            raise ValueError(f"Missing cross-navigation: {file.relative_to(root)}")
        start = html.index('class="ctdB2CrossNav"')
        end = html.find("</nav>", start)
        nav = html[start:end]
        if len(re.findall(r'data-b2-cross-area="', nav)) != 5:
            raise ValueError(f"Broken cross-navigation: {file.relative_to(root)}")
        if nav.count('aria-current="location"') != 1 or f'data-b2-cross-area="{area}" aria-current="location"' not in nav:
            raise ValueError(f"Wrong category: {file.relative_to(root)}")
        for name, _ in AREAS:
            if f'/{lang}/?tab=ia-{name}#ia-{name}' not in nav:
                raise ValueError(f"Cross-language or dead B2 path: {file.relative_to(root)}")
        if html.count('id="ctd-b2-link-isolation"') != 1:
            raise ValueError(f"Branch preview link isolation missing: {file.relative_to(root)}")
        if file.parent.name in ("sanctions-and-dns", "who-controls-internet-access"):
            if html.count('data-b2-editorial-kind="evergreen-guide"') != 1:
                raise ValueError(f"Evergreen governance guide classified as a Field Note: {file}")
        total += 1
    return total


if __name__ == "__main__":
    root = Path(__file__).resolve().parent.parent
    generated = apply(root)
    print("IA_B2_CROSS_NAV_INJECTED", generated)
    print("IA_B2_CROSS_NAV_VERIFIED", validate(root))
