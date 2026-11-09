#!/usr/bin/env python3
"""Connect the generated reading documents to the existing publication.

Run after render_discovery.cjs and build_agent_catalog.py. The ordinary HTML
links also work without JavaScript. Existing pages retain their identity and
content; only bounded discovery markup and sitemap entries are added.
"""
import json
import posixpath
import re
from pathlib import Path
from urllib.parse import urlsplit
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
PUB = json.loads((ROOT / "publication.json").read_text())
MANIFEST = json.loads((ROOT / "discovery/manifest.json").read_text())
BASE = PUB["deployment"]
LANGUAGES = ("en", "it", "de", "fr")
SM = "http://www.sitemaps.org/schemas/sitemap/0.9"
XHTML = "http://www.w3.org/1999/xhtml"
ET.register_namespace("", SM)
ET.register_namespace("xhtml", XHTML)


def relative(page, target):
    return posixpath.relpath(target, posixpath.dirname(page) or ".")


def main():
    assert MANIFEST["siteVersion"] == PUB["version"]
    pages = MANIFEST["pages"]
    groups = {}
    for page in pages:
        assert re.fullmatch(r"[a-z0-9][a-z0-9/_-]*/", page["path"])
        assert (ROOT / page["path"] / "index.html").is_file()
        groups.setdefault((page["kind"], page["key"]), {})[page["language"]] = page
    for group in groups.values():
        assert set(group) == set(LANGUAGES)
    sitemap = ET.parse(ROOT / "sitemap.xml")
    urlset = sitemap.getroot()
    new_urls = {BASE + page["path"] for page in pages}
    # Repeated invocation replaces this generated block rather than duplicating it.
    for item in list(urlset):
        if item.findtext(f"{{{SM}}}loc") in new_urls:
            urlset.remove(item)
    legacy_urls = [item.findtext(f"{{{SM}}}loc") for item in urlset]
    assert len(legacy_urls) == len(set(legacy_urls)) == 43, "Established sitemap changed"
    for page in pages:
        item = ET.SubElement(urlset, f"{{{SM}}}url")
        ET.SubElement(item, f"{{{SM}}}loc").text = BASE + page["path"]
        ET.SubElement(item, f"{{{SM}}}lastmod").text = PUB["releasedOn"]
        equivalents = groups[(page["kind"], page["key"])]
        for lang in (*LANGUAGES, "x-default"):
            destination = equivalents["en" if lang == "x-default" else lang]
            ET.SubElement(item, f"{{{XHTML}}}link", {
                "rel": "alternate", "hreflang": lang, "href": BASE + destination["path"]})
    ET.indent(sitemap, space="  ")
    sitemap.write(ROOT / "sitemap.xml", encoding="UTF-8", xml_declaration=True)
    with (ROOT / "sitemap.xml").open("a", encoding="utf-8") as stream:
        stream.write("\n")

    profiles = " ".join(page["key"] for page in pages
                        if page["kind"] == "tld" and page["language"] == "en")
    labels = {"en": "Guides and profiles", "it": "Guide e schede",
              "de": "Leitfäden und Profile", "fr": "Guides et fiches"}
    targets = ["index.html"]
    for url in legacy_urls:
        assert url.startswith(BASE)
        target = url[len(BASE):]
        targets.append(target + "index.html" if target.endswith("/") else target)
    for target in targets:
        file = ROOT / target
        html = file.read_text(encoding="utf-8")
        html = re.sub(r"<!--ctd-discovery-->.*?<!--/ctd-discovery-->", "", html, flags=re.S)
        html = re.sub(r'<a id="discoveryHome"[^>]*>.*?</a>', "", html, flags=re.S)
        main = target == "index.html" or target in [lang + "/index.html" for lang in LANGUAGES]
        metadata = (f'<link rel="describedby" type="text/plain" href="{relative(target, "llms.txt")}">'
                    f'<link rel="describedby" type="application/json" href="{relative(target, "agent-catalog.json")}">')
        if main:
            metadata += f'<meta name="ctd-discovery-profiles" content="{profiles}">'
        assert html.count("</head>") == 1, target
        html = html.replace("</head>", "<!--ctd-discovery-->" + metadata + "<!--/ctd-discovery--></head>")
        if main:
            lang = "en" if target == "index.html" else target.split("/")[0]
            href = relative(target, f"discovery/{lang}/index.html").removesuffix("index.html")
            link = f'<a id="discoveryHome" href="{href}">{labels[lang]}</a>'
            assert html.count("</footer>") == 1, target
            html = html.replace("</footer>", link + "</footer>")
        file.write_text(html, encoding="utf-8")
    print(f"Integrated {len(pages)} discovery documents; sitemap preserves 43 established URLs ({43 + len(pages)} total).")


if __name__ == "__main__":
    main()
