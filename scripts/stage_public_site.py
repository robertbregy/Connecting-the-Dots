#!/usr/bin/env python3
"""Stage only the reviewed public publication, preserving its committed bytes.

The allowlist is shared by Pages, deploy ZIPs and source-health inventory. Source
code, development prototypes and QA evidence remain available in the repository;
they are not a second, accidentally indexable website. New public route families
must be added here deliberately. Missing local links fail before deployment.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import shutil
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin, urlsplit
from xml.etree import ElementTree

ROOT = Path(__file__).resolve().parents[1]
ROOT_FILES = frozenset({
    '.nojekyll', 'index.html', 'publication.json', 'agent-catalog.json',
    'llms.txt', 'sitemap.xml', 'robots.txt', 'CITATION.cff', 'CONTENT_LICENSE.md',
    'LICENSE', 'googlee97a475969dc49f2.html',
})
PAGE_TREES = frozenset({
    'en', 'it', 'de', 'fr', 'explorer', 'applications', 'behind-the-round',
    'inside-the-round', 'economics', 'guides', 'tlds', 'discovery',
})
RESEARCH_FILES = frozenset({
    'research/index.html', 'research/connecting-the-dots-working-paper-v1.html',
    'research/connecting-the-dots-working-paper-v1.md',
    'research/research_release_manifest.json',
    'research/rr2_publication_verification.json',
})
ASSET_SUFFIXES = frozenset({'.css', '.js', '.mjs', '.png', '.jpg', '.jpeg',
                          '.svg', '.webp', '.avif', '.gif', '.ico', '.woff',
                          '.woff2', '.ttf', '.otf', '.wasm'})
DATA_SUFFIXES = frozenset({'.json', '.js', '.csv', '.tsv', '.md', '.gz'})
FORBIDDEN_LIVE_PATHS = (
    'src/ia-b2-hubs.html', 'scripts/release_check.py', 'build.py',
    'prototype/ia-v1/index.html', 'docs/PUBLISHING_SAFETY.md',
    '.github/workflows/pages-deploy.yml', 'audit-ia-b2/report.json',
    'package.json',
)


def is_public_path(relative: str) -> bool:
    """The public contract; no directory is exposed just because it exists."""
    parts = Path(relative).parts
    if not parts or '..' in parts or Path(relative).is_absolute():
        return False
    if relative in ROOT_FILES:
        return True
    if any(part.startswith('.') or part in {'__pycache__', 'node_modules'}
           for part in parts):
        return False
    suffix = Path(relative).suffix.lower()
    if parts[0] in PAGE_TREES:
        return suffix in {'.html', '.md'} or relative == 'discovery/manifest.json'
    if parts[0] == 'assets':
        return suffix in ASSET_SUFFIXES
    if parts[0] == 'data':
        return len(parts) > 1 and parts[1] != 'qa' and suffix in DATA_SUFFIXES
    if parts[0] == 'downloads':
        return suffix in {'.zip', '.sha256'}
    return (relative in RESEARCH_FILES or
            (len(parts) == 3 and parts[0] == 'research' and parts[1] in {'it','de','fr'} and parts[2] == 'index.html') or
            (relative.startswith('research/reader-study/') and suffix == '.html'))


def public_files(root: Path = ROOT) -> list[Path]:
    """Return absolute Paths, without following symlinks or copying anything."""
    root = root.resolve()
    result = []
    for path in sorted(root.rglob('*')):
        relative = path.relative_to(root).as_posix()
        if not is_public_path(relative):
            continue
        if path.is_symlink() or any(p.is_symlink() for p in path.parents if p != root):
            raise ValueError('Public symlink is not allowed: ' + relative)
        if path.is_file():
            result.append(path)
    return result


def local_target(reference: str, source: str, base: str) -> str | None:
    """Resolve project-local relative/absolute URLs, omitting query/fragment."""
    reference = reference.strip()
    if not reference or reference.startswith('#'):
        return None
    resolved = urlsplit(urljoin(base + source, reference))
    origin = urlsplit(base)
    if resolved.scheme not in {'http', 'https'} or resolved.netloc != origin.netloc:
        return None
    if not resolved.path.startswith(origin.path):
        # Another project at the same GitHub Pages host is not our payload.
        return None
    relative = unquote(resolved.path[len(origin.path):])
    if '\\' in relative or '..' in Path(relative).parts or relative.startswith('/'):
        raise ValueError('Unsafe project-local URL in ' + source + ': ' + reference)
    if not relative or relative.endswith('/'):
        relative += 'index.html'
    return relative


class PageReferences(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.references = []
        self.inline_styles = []
        self._style = False
        self._json_ld = False
        self._json_parts = []

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        for key in ('href', 'src', 'poster'):
            if attrs.get(key):
                self.references.append(attrs[key])
        if tag == 'object' and attrs.get('data'):
            self.references.append(attrs['data'])
        if attrs.get('srcset'):
            # Published images do not use data URLs in srcset. Preserve ordinary
            # width/density candidates; data URLs need no deployed resource.
            if not attrs['srcset'].lstrip().startswith('data:'):
                self.references.extend(part.strip().split()[0]
                                       for part in attrs['srcset'].split(',') if part.strip())
        if attrs.get('style'):
            self.inline_styles.append(attrs['style'])
        if tag == 'meta' and attrs.get('property') in {'og:image', 'og:url'}:
            self.references.append(attrs.get('content', ''))
        if tag == 'meta' and attrs.get('name') == 'twitter:image':
            self.references.append(attrs.get('content', ''))
        if tag == 'style':
            self._style = True
        if tag == 'script' and attrs.get('type') == 'application/ld+json':
            self._json_ld = True
            self._json_parts = []

    def handle_data(self, value):
        if self._style:
            self.inline_styles.append(value)
        if self._json_ld:
            self._json_parts.append(value)

    def handle_endtag(self, tag):
        if tag == 'style':
            self._style = False
        if tag == 'script' and self._json_ld:
            self.references.extend(json_urls(json.loads(''.join(self._json_parts))))
            self._json_ld = False


def json_urls(value):
    """URLs are delivery references; sourcePath fields identify Git provenance."""
    if isinstance(value, dict):
        for key, child in value.items():
            if key in {'url', 'contentUrl', 'downloadUrl', 'encodingUrl', '@id', 'id'} \
                    and isinstance(child, str) and child.startswith(('http:', 'https:', '//')):
                yield child
            else:
                yield from json_urls(child)
    elif isinstance(value, list):
        for child in value:
            yield from json_urls(child)


def css_urls(text):
    yield from (match.group(2).strip() for match in
                re.finditer(r'url\(\s*([\"\']?)(.*?)\1\s*\)', text, re.I))
    yield from (match.group(2) for match in
                re.finditer(r'@import\s+([\"\'])(.*?)\1', text, re.I))


def validate_publication(root: Path = ROOT, files: list[Path] | None = None) -> dict:
    root = root.resolve()
    files = public_files(root) if files is None else files
    allowed = {path.relative_to(root).as_posix() for path in files}
    publication = json.loads((root / 'publication.json').read_text(encoding='utf-8'))
    base = publication['deployment']
    if not base.startswith('https://') or not base.endswith('/'):
        raise ValueError('Publication deployment must be an HTTPS directory URL')
    required = {'index.html', '.nojekyll', 'sitemap.xml', 'publication.json',
                publication['paperPath'], publication['currentDataPackPath']}
    required.add(str(Path(publication['currentDataPackPath']).with_suffix('.sha256')))
    missing = sorted(required - allowed)
    if missing:
        raise ValueError('Public publication missing required files: ' + ', '.join(missing))
    failures = set()
    checked = 0
    html_count = 0
    for path in files:
        source = path.relative_to(root).as_posix()
        references = []
        if path.suffix == '.html':
            html_count += 1
            parser = PageReferences()
            parser.feed(path.read_text(encoding='utf-8'))
            references.extend(parser.references)
            for style in parser.inline_styles:
                references.extend(css_urls(style))
        elif path.suffix == '.css':
            references.extend(css_urls(path.read_text(encoding='utf-8')))
        elif path.suffix == '.md':
            references.extend(match.group(1) for match in re.finditer(
                r'\]\(<?([^\s>)]+)>?(?:\s+[\"\'].*?[\"\'])?\)',
                path.read_text(encoding='utf-8')))
        elif source in {'agent-catalog.json', 'discovery/manifest.json'}:
            references.extend(json_urls(json.loads(path.read_text(encoding='utf-8'))))
        elif source == 'sitemap.xml':
            for element in ElementTree.parse(path).iter():
                if element.tag.rsplit('}', 1)[-1] == 'loc' and element.text:
                    references.append(element.text)
                if element.attrib.get('href'):
                    references.append(element.attrib['href'])
        elif source == 'llms.txt':
            references.extend(re.findall(r'https?://[^\s)<>]+', path.read_text(encoding='utf-8')))
        for reference in references:
            target = local_target(reference, source, base)
            if target is None:
                continue
            checked += 1
            if target not in allowed:
                failures.add(source + ' -> ' + reference + ' [' + target + ']')
    if failures:
        raise ValueError('Unpublished local references:\n' + '\n'.join(sorted(failures)))
    return {'version': publication['version'], 'files': len(files),
            'htmlPages': html_count, 'localReferencesChecked': checked,
            'bytes': sum(path.stat().st_size for path in files),
            'excludedLivePaths': list(FORBIDDEN_LIVE_PATHS)}


def stage_publication(root: Path, output: Path) -> dict:
    root, output = root.resolve(), output.resolve()
    if output == root or root in output.parents and output.relative_to(root).parts[0] != '_site':
        raise ValueError('Output must be a separate directory, or the dedicated _site directory')
    if output in root.parents:
        raise ValueError('Output must not contain the source checkout')
    marker = output.with_name(output.name + '.stage.json')
    files = public_files(root)
    report = validate_publication(root, files)
    if output.exists() and any(output.iterdir()):
        if not marker.is_file() or json.loads(marker.read_text()).get('stagedFrom') != str(root):
            raise ValueError('Refusing to replace an unrecognized nonempty output directory')
        shutil.rmtree(output)
    output.mkdir(parents=True, exist_ok=True)
    digests = {}
    for path in files:
        relative = path.relative_to(root)
        destination = output / relative
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(path, destination)
        expected = hashlib.sha256(path.read_bytes()).hexdigest()
        actual = hashlib.sha256(destination.read_bytes()).hexdigest()
        if actual != expected:
            raise ValueError('Staged byte mismatch: ' + relative.as_posix())
        digests[relative.as_posix()] = actual
    report.update({'stagedFrom': str(root), 'output': str(output),
                   'fileHashes': digests})
    marker.write_text(json.dumps(report, sort_keys=True, indent=2) + '\n', encoding='utf-8')
    return report


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, default=ROOT / '_site')
    parser.add_argument('--check-only', action='store_true')
    args = parser.parse_args()
    try:
        report = validate_publication() if args.check_only else stage_publication(ROOT, args.output)
    except (ValueError, OSError, KeyError, ElementTree.ParseError) as exc:
        raise SystemExit(str(exc)) from exc
    print('PUBLIC_SURFACE_PASS ' + json.dumps({key: value for key, value in report.items()
                                             if key != 'fileHashes'}, sort_keys=True))


if __name__ == '__main__':
    main()
