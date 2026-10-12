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
            continue
        if not re.search(r"</head\s*>", html, re.I):
            raise ValueError(f"Missing HTML head: {file}")
        if not re.search(r"</header\s*>", html, re.I):
            raise ValueError(f"Missing leading header: {file}")
        navigation = make_navigation(root, file, lang, area, translations[lang])
        updated = re.sub(r"</head\s*>", NAV_STYLE + "</head>", html, count=1, flags=re.I)
        updated = re.sub(r"</header\s*>", "</header>\n" + navigation, updated, count=1, flags=re.I)
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
        total += 1
    return total


if __name__ == "__main__":
    root = Path(__file__).resolve().parent.parent
    generated = apply(root)
    print("IA_B2_CROSS_NAV_INJECTED", generated)
    print("IA_B2_CROSS_NAV_VERIFIED", validate(root))
