#!/usr/bin/env python3
"""Integrate the two governance explainers as native pages of the main CTD app.

Standalone articles are input sources, not visual shells. Preserve their full
scientific body and simulators; main-site routing, header, language and theme
remain authoritative.
"""
from pathlib import Path
import re
from html import unescape
from scripts.render_internet_access import ACCESS_CSS, JS
from scripts.render_sanctions_explainer import CSS_EXTRA

LANGS = ("en", "it", "de", "fr")
KINDS = (
    ("who-controls-internet-access", "governance-access", "accessArticle"),
    ("sanctions-and-dns", "governance-sanctions", "governanceArticle"),
)
BASE = "https://robertbregy.github.io/Connecting-the-Dots/"


def main_markup(source: str, css_class: str) -> str:
    match = re.search(
        rf'<main\s+class="{re.escape(css_class)}"[^>]*>([\s\S]*?)</main>',
        source,
    )
    if not match:
        raise ValueError("Missing article body: " + css_class)
    article = match.group(1)
    # The parent publication owns the sole H1; each native chapter starts at H2.
    article = article.replace("<h1>", '<h2 class="ctdNativeHeading">', 1).replace("</h1>", "</h2>", 1)
    return article


def native_css() -> str:
    # The standalone article stylesheet has historical top-level styles.
    # Only component-specific declarations are copied into the native page.
    lines = []
    for line in CSS_EXTRA.splitlines():
        if line.startswith((":root{", "body{", ".ctdB2", "@media(max-width:740px){main.")):
            continue
        lines.append(line)
    return """
/* Both chapters belong to the native six-area app, not another site shell. */
.ctdNativeGuide .ctdNativeArticle{max-width:1050px;margin:0 auto;padding:20px 0 55px}
.ctdNativeGuide .ctdNativeArticle>.ctdNativeHeading{font-size:clamp(34px,5vw,62px);letter-spacing:-.05em;line-height:1.08;max-width:23ch;margin:10px 0 24px}
.ctdNativeGuide .ctdNativeArticle>.lead{font-size:clamp(17px,2vw,22px);line-height:1.55;color:var(--muted);max-width:70ch}
.ctdNativeGuide .ctdNativeArticle>.eyebrow{font-size:12px;color:var(--muted);letter-spacing:.14em}
.ctdNativeGuide .ctdNativeArticle .panel{background:var(--surface);border:1px solid var(--border);border-radius:15px;box-shadow:var(--shadow);padding:24px;margin:16px 0}
.ctdNativeGuide .ctdNativeArticle a{overflow-wrap:anywhere;color:var(--accent-text)}
.ctdNativeGuide .ctdNativeArticle button{font-family:inherit}
.ctdNativeGuide .ctdNativeArticle code{overflow-wrap:anywhere}
.ctdNativeGuide .ctdNativeArticle [hidden]{display:none!important}
.ctdNativeGuide .ctdNativeArticle .governanceSources,.ctdNativeGuide .ctdNativeArticle .accessSources{min-width:0}
.ctdNativeGuide .ctdNativeIntro{padding:20px 0 14px;border-bottom:1px solid var(--border);margin-bottom:20px}
.ctdNativeGuide .ctdNativeReturn{display:inline-flex;align-items:center;min-height:40px;color:var(--accent-text);font-size:14px;font-weight:700;text-decoration:none}
.ctdNativeGuide .ctdNativeReturn:hover{text-decoration:underline}
@media(max-width:720px){.ctdNativeGuide .ctdNativeArticle{padding:12px 0 35px}.ctdNativeGuide .ctdNativeArticle .panel{padding:17px}}
""" + ACCESS_CSS + "\n" + "\n".join(lines)


def integrate(root: Path) -> int:
    css = native_css()
    count = 0
    targets = [(lang, root / lang / "index.html") for lang in LANGS]
    targets.append(("en", root / "index.html"))
    for lang, target in targets:
        if not target.exists():
            raise ValueError("Missing rendered main app: " + str(target))
        html = target.read_text(encoding="utf-8")
        sections = []
        for slug, tab, article_class in KINDS:
            source_path = root / "behind-the-round" / lang / slug / "index.html"
            source = source_path.read_text(encoding="utf-8")
            body = main_markup(source, article_class)
            # Internal related reading stays inside the same native navigation.
            for other_slug, other_tab, _ in KINDS:
                body = body.replace(
                    BASE + "behind-the-round/" + lang + "/" + other_slug + "/",
                    "?tab=" + other_tab + "#" + other_tab,
                )
                body = body.replace(
                    "../" + other_slug + "/",
                    "?tab=" + other_tab + "#" + other_tab,
                )
            sections.append(
                '<section class="section ctdNativeGuide" id="' + tab + '"'
                '>'
                '<div class="ctdNativeArticle ' + article_class + '">'
                + body +
                '</div></section>'
            )
        # All entries in the main app, including those from Field Notes, open
        # the native chapters rather than the legacy standalone documents.
        for slug, tab, _ in KINDS:
            destination = BASE + "behind-the-round/" + lang + "/" + slug + "/"
            pattern = re.compile(r'(<a\\b[^>]*?\\bhref=")' + re.escape(destination) + r'("[^>]*>)')
            def redirect_link(match):
                tail = match.group(2)
                if 'data-open-section=' not in tail:
                    tail = tail[:-1] + ' data-open-section="' + tab + '">'
                return match.group(1) + "#" + tab + tail
            html = pattern.sub(redirect_link, html)
        # Each native chapter is a sibling of the main app's editorial sections.
        footer = '<footer class="footer"'
        if html.count(footer) != 1:
            raise ValueError("Missing unique main-site footer in " + lang)
        html = html.replace(footer, "\n".join(sections) + "\n" + footer, 1)
        html = html.replace('</head>', '<style id="ctd-native-governance-css">' + css + '</style></head>', 1)
        # Simulator logic from the existing audited explainer runs in the app.
        html = html.replace('</body>', '<script id="ctd-native-access-simulator">' + JS + '</script></body>', 1)
        target.write_text(html, encoding="utf-8")
        count += 1
    return count


if __name__ == "__main__":
    print("NATIVE_GOVERNANCE_PAGES", integrate(Path(__file__).resolve().parents[1]))
