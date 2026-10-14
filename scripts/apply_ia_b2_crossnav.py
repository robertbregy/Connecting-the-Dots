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
.ctdB2CrossNav{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:6px;padding:9px max(14px,calc((100vw - 1230px)/2));box-sizing:border-box;margin:0 auto 15px;background:var(--surface,#f4f7fa);border-bottom:1px solid var(--border,#d4dfe9);font:700 14px/1.35 system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
.ctdB2CrossNav a{display:flex;align-items:center;justify-content:center;min-width:0;min-height:44px;box-sizing:border-box;text-align:center;text-decoration:none;border-radius:8px;padding:8px 6px;color:var(--text,#142d40);overflow-wrap:anywhere;hyphens:auto}
.ctdB2CrossNav a:hover,.ctdB2CrossNav a:focus-visible{outline-offset:2px;background:var(--surface2,#e5eef5);text-decoration:underline}
.ctdB2CrossNav a[aria-current]{background:var(--accent-soft,#dcecfb);color:var(--accent-text,#124f84)}
.ctdB2Context{box-sizing:border-box;max-width:1030px;margin:7px auto 20px;padding:14px 20px;background:var(--surface2,#eff5f9);color:var(--text,#142d40);border:1px solid var(--border,#d4dfe9);border-radius:12px;font:400 14px/1.55 system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
.ctdB2Context strong{display:block;font-size:12px;letter-spacing:.08em;text-transform:uppercase;margin-bottom:4px}.ctdB2Context p{margin:0;color:var(--muted,#526171)}
.ctdB2Trail{display:flex;align-items:center;flex-wrap:wrap;gap:9px;max-width:1030px;margin:12px auto 20px;padding:0 20px;font:600 13px/1.55 system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:var(--muted,#526171)}
.ctdB2Trail a{color:var(--accent-text,#165d91);text-underline-offset:3px}
.ctdB2Trail span[aria-hidden]{opacity:.6}
body:has(.ctdB2CrossNav){--background:#f7f7f8;--bg:#f7f7f8;--surface:#fff;--surface2:#f1f1f3;--text:#111214;--muted:#45454e;--border:#e4e4e7;--accent-text:#0068d7;--accent-soft:#e9f3ff}
body:has(.ctdB2CrossNav) header{background:#f7f7f8;color:#111214;border-bottom:1px solid #e4e4e7}
body:has(.ctdB2CrossNav) header a{color:inherit}
body:has(.ctdB2CrossNav) .ctdB2CrossNav{margin-bottom:8px}
body:has(.ctdB2CrossNav) main{max-width:1030px}
body:has(.ctdB2CrossNav) .ctdB2CrossNav a:focus-visible,body:has(.ctdB2CrossNav) .ctdB2Trail a:focus-visible{outline:3px solid #0068d7;outline-offset:3px}
@media(max-width:700px){.ctdB2CrossNav{grid-template-columns:repeat(3,minmax(0,1fr));gap:4px;font-size:12px;padding:7px 12px}.ctdB2CrossNav a{min-height:44px;padding:7px 4px}}
@media(prefers-color-scheme:dark){.ctdB2CrossNav{background:var(--surface,#18232e);border-color:var(--border,#435365)}.ctdB2CrossNav a{color:var(--text,#eff5fb)}.ctdB2CrossNav a[aria-current]{color:var(--accent-text,#a4d5ff);background:var(--accent-soft,#214467)}}

html[data-theme="dark"] body:has(main.governanceArticle),html[data-theme="dark"] body:has(main.accessArticle){--background:#0f0f10;--bg:#0f0f10;--surface:#171719;--surface2:#202023;--text:#f5f5f7;--muted:#a1a1a6;--border:#2d2d31;--accent:#2997ff;--accent-text:#61b0ff;--accent-soft:#102a43;--shadow:none;color-scheme:dark}
html[data-theme="dark"] body:has(main.governanceArticle) header,html[data-theme="dark"] body:has(main.accessArticle) header{background:var(--bg);color:var(--text);border-color:var(--border)}
html[data-theme="dark"] body:has(main.governanceArticle) .ctdB2CrossNav,html[data-theme="dark"] body:has(main.accessArticle) .ctdB2CrossNav{background:var(--bg);border-color:var(--border)}
html[data-theme="dark"] body:has(main.governanceArticle) a,html[data-theme="dark"] body:has(main.accessArticle) a{color:var(--accent-text)}
html[data-theme="dark"] body:has(main.governanceArticle) .ctdB2CrossNav a,html[data-theme="dark"] body:has(main.accessArticle) .ctdB2CrossNav a{color:var(--text)}
html[data-theme="dark"] body:has(main.governanceArticle) .ctdB2CrossNav a[aria-current],html[data-theme="dark"] body:has(main.accessArticle) .ctdB2CrossNav a[aria-current]{color:var(--accent-text)}
/* Unified editorial shell for the two evergreen governance guides. */
body:has(main.governanceArticle),body:has(main.accessArticle){--background:#f7f7f8;--bg:#f7f7f8;--surface:#fff;--surface2:#f1f1f3;--text:#111214;--muted:#65656d;--border:#e4e4e7;--accent:#0a84ff;--accent-text:#0068d7;--accent-soft:#e9f3ff;--shadow:0 1px 2px rgba(0,0,0,.025),0 18px 56px rgba(0,0,0,.045);font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display","SF Pro Text",Inter,"Segoe UI",sans-serif;-webkit-font-smoothing:antialiased;background:var(--bg);color:var(--text)}
body:has(main.governanceArticle) header,body:has(main.accessArticle) header{background:var(--bg);color:var(--text);border-bottom:1px solid var(--border)}
body:has(main.governanceArticle) header nav,body:has(main.accessArticle) header nav{max-width:1280px;padding:12px 26px;min-height:64px}
body:has(main.governanceArticle) header .brand,body:has(main.accessArticle) header .brand{font-weight:750;letter-spacing:-.025em;font-size:1.05rem}
body:has(main.governanceArticle) header .lang-links a,body:has(main.accessArticle) header .lang-links a{color:var(--text);padding:7px 10px;border-radius:999px;text-decoration:none}
body:has(main.governanceArticle) header .lang-links a[aria-current],body:has(main.accessArticle) header .lang-links a[aria-current]{background:var(--accent-soft);color:var(--accent-text);font-weight:750}
body:has(main.governanceArticle) .ctdB2CrossNav,body:has(main.accessArticle) .ctdB2CrossNav{max-width:1280px;border:1px solid var(--border);border-radius:14px;background:var(--bg);margin:9px auto 14px;padding:8px;gap:5px}
body:has(main.governanceArticle) main,body:has(main.accessArticle) main{box-sizing:border-box;max-width:1080px;padding:clamp(27px,4vw,54px) clamp(20px,4vw,42px) 72px}
body:has(main.governanceArticle) main h1,body:has(main.accessArticle) main h1{font-size:clamp(2.4rem,5.1vw,4.5rem);line-height:1.07;letter-spacing:-.05em;max-width:20ch;margin:12px 0 22px}
body:has(main.governanceArticle) main .lead,body:has(main.accessArticle) main .lead{font-size:clamp(1.1rem,1.8vw,1.3rem);color:var(--muted);line-height:1.6;max-width:73ch}
body:has(main.governanceArticle) .panel,body:has(main.accessArticle) .panel,body:has(main.accessArticle) .accessSimulator,body:has(main.accessArticle) .accessActorSection,body:has(main.accessArticle) .accessCaseSection{border-radius:16px;border-color:var(--border);background:var(--surface);box-shadow:var(--shadow)}
body:has(main.governanceArticle) .eyebrow,body:has(main.accessArticle) .eyebrow{color:var(--muted)}
body:has(main.governanceArticle) .ctdB2Context,body:has(main.accessArticle) .ctdB2Context{background:var(--surface2);border-color:var(--border)}
body:has(main.governanceArticle) footer,body:has(main.accessArticle) footer{max-width:1280px;border-color:var(--border);color:var(--muted)}
@media(max-width:720px){body:has(main.governanceArticle) header nav,body:has(main.accessArticle) header nav{padding:13px 18px}body:has(main.governanceArticle) main,body:has(main.accessArticle) main{padding:28px 18px 54px}body:has(main.governanceArticle) .ctdB2CrossNav,body:has(main.accessArticle) .ctdB2CrossNav{margin:8px 12px 12px}}
</style>"""

AREAS = [
    ("understand", "iaNavUnderstand"),
    ("explore", "iaNavExplore"),
    ("stories", "iaNavStories"),
    ("outcomes", "iaNavOutcomes"),
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


TRAIL_WORDS = {
    "it": ("Home", "Area", "Pagina"),
    "en": ("Home", "Area", "Page"),
    "de": ("Startseite", "Bereich", "Seite"),
    "fr": ("Accueil", "Rubrique", "Page"),
}


def make_trail(file: Path, lang: str, selected: str, root: Path, texts: dict) -> str:
    prefix = "/".join(".." for _ in file.parent.relative_to(root).parts) or "."
    labels = dict((name, texts[key]) for name, key in AREAS)
    home, _, page = TRAIL_WORDS[lang]
    area_link = f"{prefix}/{lang}/?tab=ia-{selected}#ia-{selected}"
    # The page title remains the authoritative h1; this is a secondary landmark.
    return ('<nav class="ctdB2Trail" aria-label="Breadcrumb">'
            '<a href="' + escape(f"{prefix}/{lang}/", quote=True) + '">' + escape(home) + '</a>'
            '<span aria-hidden="true">/</span><a href="' + escape(area_link, quote=True) + '">'
            + escape(labels[selected]) + '</a><span aria-hidden="true">/</span>'
            '<span aria-current="page">' + escape(page) + '</span></nav>')


def editorial_context(file: Path, lang: str) -> str:
    if file.parent.name not in ("sanctions-and-dns", "who-controls-internet-access"):
        return ""
    label, description = EVERGREEN_GUIDE_CONTEXT[lang]
    return ('<aside class="ctdB2Context" data-b2-editorial-kind="evergreen-guide">'
            '<strong>' + escape(label) + '</strong><p>' + escape(description) + '</p></aside>')


def add_crosspage_features(html: str, file: Path, lang: str, root: Path, selected: str, texts: dict) -> str:
    match = re.search(r'<nav class="ctdB2CrossNav"[^>]*>[\s\S]*?</nav>', html)
    if not match:
        raise ValueError(f"Missing IA B2 navigation: {file}")
    # Existing generated pages retain the original cross-style; update the
    # common shell when its template changes without rewriting article bodies.
    if 'id="ctd-b2-cross-style"' in html:
        html = re.sub(r'<style id="ctd-b2-cross-style">[\s\S]*?</style>',
                      lambda _m: NAV_STYLE, html, count=1)
        match = re.search(r'<nav class="ctdB2CrossNav"[^>]*>[\s\S]*?</nav>', html)
    additions = ""
    if 'class="ctdB2Trail"' not in html:
        additions += make_trail(file, lang, selected, root, texts)
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
            area = "explore" if slug in ("sanctions-and-dns", "who-controls-internet-access") else "round"
            yield root / "behind-the-round" / lang / slug / "index.html", lang, area
    yield root / "explorer" / "index.html", "en", "explore"
    yield root / "research" / "index.html", "en", "research"
    # Mutable working paper: add a navigation landmark without altering its body,
    # scholarly identifier, citation metadata or version-specific RR2 DOI.
    yield root / "research" / "connecting-the-dots-working-paper-v1.html", "en", "research"


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



def unify_governance_shell(html: str, file: Path, lang: str) -> str:
    """Use the actual main-site stylesheet and header controls on evergreen guides."""
    if file.parent.name not in ("sanctions-and-dns", "who-controls-internet-access"):
        return html
    prefix = "/".join(".." for _ in file.parent.relative_to(Path(__file__).resolve().parent.parent).parts)
    home = f"{prefix}/{lang}/"
    # Retain article-specific styling, structured data, sources and interactive simulator.
    css_link = f'<link rel="stylesheet" href="{prefix}/assets/style.css" id="ctd-main-style">'
    if 'id="ctd-main-style"' not in html:
        html = html.replace("</head>", css_link + "</head>", 1)
    controls_labels = {
        "it": ("Copia link", "Collegamento copiato", "Cambia tema", "Torna a Connecting the Dots"),
        "en": ("Copy link", "Link copied", "Toggle theme", "Back to Connecting the Dots"),
        "de": ("Link kopieren", "Link kopiert", "Darstellung wechseln", "Zurück zu Connecting the Dots"),
        "fr": ("Copier le lien", "Lien copié", "Changer de thème", "Retour à Connecting the Dots"),
    }
    copy_label, copied_label, theme_label, home_label = controls_labels[lang]
    shell_header = f'''<a class="skipLink" href="#ctd-article-main">Skip to main content</a>
<header class="topbar"><div class="topinner">
<a class="brand brandButton" href="{home}" aria-label="Home"><img alt="" src="{prefix}/assets/logo-mark.png"><span class="brandTitle">Connecting the Dots</span></a>
<div class="controls"><label class="ctdGuideLang"><span class="sr-only">Language</span><select aria-label="Language" class="control lang" id="ctdGuideLanguage">
<option value="en"{" selected" if lang=="en" else ""}>EN</option><option value="de"{" selected" if lang=="de" else ""}>DE</option><option value="fr"{" selected" if lang=="fr" else ""}>FR</option><option value="it"{" selected" if lang=="it" else ""}>IT</option>
</select></label><button class="control" id="ctdGuideCopy" type="button" aria-label="{copy_label}"><svg aria-hidden="true" class="copyIcon" viewBox="0 0 24 24"><rect x="8" y="8" width="11" height="11" rx="2"></rect><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"></path></svg><span class="shareText">{copy_label}</span></button><button class="control" id="ctdGuideTheme" type="button" aria-label="{theme_label}">◐</button></div>
</div></header>'''
    html, changed = re.subn(r'<header><nav aria-label="Languages">[\s\S]*?</nav></header>',
                           lambda _m: shell_header, html, count=1)
    if changed != 1:
        raise ValueError(f"Cannot apply shared header to {file}")
    html = html.replace('<main class=', '<span id="ctd-article-main" tabindex="-1"></span>\n<main class=', 1)
    # The research article remains unchanged; its framing now shares the site's footer.
    footer_html = f'''<footer class="footer ctdGuideFooter">
<a class="footerFeedback" href="{home}?tab=sources#report-error">{home_label}</a>
<span>Connecting the Dots</span>
<a class="footerDoi" href="https://doi.org/10.5281/zenodo.23288603" target="_blank" rel="noopener">RR2 · DOI 10.5281/zenodo.23288603</a>
<a class="footerGithub" href="https://github.com/robertbregy/Connecting-the-Dots" target="_blank" rel="noopener">GitHub · source</a>
<a href="https://doi.org/10.5281/zenodo.23262623" target="_blank" rel="noopener">RR1</a>
</footer>'''
    html, footer_count = re.subn(r'<footer>[\\s\\S]*?</footer>', lambda _m: footer_html, html, count=1)
    if footer_count != 1:
        raise ValueError(f"Cannot apply shared footer to {file}")
    script = f'''<script id="ctd-guide-controls">(function(){{
"use strict";
var root=document.documentElement;
var themeKey="dotTheme";
function theme(value){{root.setAttribute("data-theme",value==="dark"?"dark":"light");}}
try{{theme(localStorage.getItem(themeKey)||(window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"));}}catch(e){{theme("light");}}
var themeButton=document.getElementById("ctdGuideTheme");
if(themeButton)themeButton.addEventListener("click",function(){{
 var next=root.getAttribute("data-theme")==="dark"?"light":"dark";theme(next);
 try{{localStorage.setItem(themeKey,next);}}catch(e){{}}
}});
var copyButton=document.getElementById("ctdGuideCopy");
if(copyButton)copyButton.addEventListener("click",function(){{
 if(navigator.clipboard&&navigator.clipboard.writeText){{
 navigator.clipboard.writeText(location.href).then(function(){{var label=copyButton.querySelector(".shareText");if(label)label.textContent="{copied_label}";}}).catch(function(){{}});
 }}
}});
var picker=document.getElementById("ctdGuideLanguage");
if(picker)picker.addEventListener("change",function(){{
 var selected=picker.value;
 if(["en","it","de","fr"].indexOf(selected)>=0){{
 window.location.href="{CASE_SENSITIVE_PREFIX}behind-the-round/"+selected+"/{file.parent.name}/";
 }}
}});
}})();</script>'''
    if 'id="ctd-guide-controls"' not in html:
        html=html.replace("</body>",script+"</body>",1)
    return html


def apply(root: Path) -> int:
    translations = json.loads((root / "data" / "translations.json").read_text(encoding="utf-8"))
    patched = 0
    files = list(files_to_patch(root))
    assert len(files) == 35, "Expected 35 independent public pages including working paper"
    for file, lang, area in files:
        if not file.exists():
            raise ValueError(f"Missing independent page: {file.relative_to(root)}")
        html = file.read_text(encoding="utf-8")
        html = unify_governance_shell(html, file, lang)
        if 'class="ctdB2CrossNav"' in html:
            assert html.count('class="ctdB2CrossNav"') == 1, file
            # Refresh navigation in previously generated standalone pages too.
            # These pages may still contain the old five-area menu.
            canonical_nav = make_navigation(root, file, lang, area, translations[lang])
            upgraded, replaced = re.subn(
                r'<nav class="ctdB2CrossNav"[^>]*>[\s\S]*?</nav>',
                lambda _m: canonical_nav, html, count=1,
            )
            if replaced != 1:
                raise ValueError(f"Cannot refresh IA B2 navigation: {file}")
            upgraded = add_crosspage_features(upgraded, file, lang, root, area, translations[lang])
            if upgraded != html:
                file.write_text(upgraded, encoding="utf-8")
                patched += 1
            continue
        if not re.search(r"</head\s*>", html, re.I):
            raise ValueError(f"Missing HTML head: {file}")
        paper = file.name == "connecting-the-dots-working-paper-v1.html"
        if not re.search(r"</header\s*>", html, re.I) and not (paper and '<body>' in html):
            raise ValueError(f"Missing leading header or paper body: {file}")
        navigation = make_navigation(root, file, lang, area, translations[lang])
        updated = re.sub(r"</head\s*>", NAV_STYLE + "</head>", html, count=1, flags=re.I)
        if paper:
            updated = updated.replace("<body>", "<body>\n" + navigation, 1)
        else:
            updated = re.sub(r"</header\s*>", "</header>\n" + navigation, updated, count=1, flags=re.I)
        updated = add_crosspage_features(updated, file, lang, root, area, translations[lang])
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
        if len(re.findall(r'data-b2-cross-area="', nav)) != len(AREAS):
            raise ValueError(f"Broken cross-navigation: {file.relative_to(root)}")
        if nav.count('aria-current="location"') != 1 or f'data-b2-cross-area="{area}" aria-current="location"' not in nav:
            raise ValueError(f"Wrong category: {file.relative_to(root)}")
        for name, _ in AREAS:
            if f'/{lang}/?tab=ia-{name}#ia-{name}' not in nav:
                raise ValueError(f"Cross-language or dead B2 path: {file.relative_to(root)}")
        if html.count('class="ctdB2Trail"') != 1:
            raise ValueError(f"Missing integrated B2 breadcrumb: {file.relative_to(root)}")
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
