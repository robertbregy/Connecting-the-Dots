#!/usr/bin/env python3
"""Regression cases for accidental source exposure and broken staged links."""
import json
from pathlib import Path
import tempfile
import unittest

from stage_public_site import local_target, public_files, stage_publication, validate_publication


class PublicSurfaceTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name) / 'source'
        self.root.mkdir()
        self.base = 'https://example.test/project/'
        self.write('publication.json', json.dumps({
            'version': 'test', 'deployment': self.base,
            'paperPath': 'research/connecting-the-dots-working-paper-v1.html',
            'currentDataPackPath': 'downloads/current.zip',
        }))
        self.write('.nojekyll', '')
        self.write('index.html', '<!doctype html><html><body><a href="en/">Read</a></body></html>')
        self.write('en/index.html', '<html><head><link rel="stylesheet" href="../assets/test.css?v=1"></head>'
                   '<body><a href="../downloads/current.zip#file">Data</a></body></html>')
        self.write('assets/test.css', '.a { background:url("test.png?v=1#image") }')
        self.write('assets/test.png', 'fixture')
        self.write('sitemap.xml', '<urlset><url><loc>' + self.base + 'en/</loc></url></urlset>')
        self.write('research/connecting-the-dots-working-paper-v1.html', '<html><body>Paper</body></html>')
        self.write('downloads/current.zip', 'fixture ZIP')
        self.write('downloads/current.sha256', 'fixture SHA')
        self.write('src/ia-b2-hubs.html', '<html>private build fragment</html>')
        self.write('scripts/release_check.py', 'private build script')
        self.write('docs/PUBLISHING_SAFETY.md', 'repository documentation')
        self.write('prototype/ia-v1/index.html', 'prototype')
        self.write('data/qa/example.json', '{}')
        self.write('data/evidence/fixture.json', '{}')

    def write(self, relative, text):
        path = self.root / relative
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text, encoding='utf-8')
        return path

    def test_allowlist_and_copy_preserve_source_bytes(self):
        output = Path(self.temp.name) / 'public'
        report = stage_publication(self.root, output)
        self.assertGreater(report['localReferencesChecked'], 0)
        self.assertEqual((output / 'assets/test.png').read_bytes(), (self.root / 'assets/test.png').read_bytes())
        for excluded in ['src', 'scripts', 'docs', 'prototype', 'data/qa']:
            self.assertFalse((output / excluded).exists())
        self.assertTrue((output / 'data/evidence/fixture.json').exists())
        self.assertTrue((output / '.nojekyll').exists())
        self.assertTrue((self.root / 'src/ia-b2-hubs.html').exists())
        # Repeat staging is safe and removes an obsolete public file.
        (output / 'obsolete.html').write_text('old')
        stage_publication(self.root, output)
        self.assertFalse((output / 'obsolete.html').exists())

    def test_relative_absolute_queries_and_fragments(self):
        expected = 'downloads/current.zip'
        for reference in ['../downloads/current.zip?v=1#data',
                          '/project/downloads/current.zip#data',
                          self.base + 'downloads/current.zip?v=1',
                          '//example.test/project/downloads/current.zip']:
            self.assertEqual(local_target(reference, 'en/index.html', self.base), expected)
        self.assertIsNone(local_target('#section', 'en/index.html', self.base))
        self.assertIsNone(local_target('https://other.test/file', 'en/index.html', self.base))
        self.assertIsNone(local_target('/other-project/', 'en/index.html', self.base))

    def test_source_link_fails_instead_of_exposing_source(self):
        self.write('en/index.html', '<a href="../docs/PUBLISHING_SAFETY.md">Policy</a>')
        with self.assertRaisesRegex(ValueError, 'Unpublished local references'):
            validate_publication(self.root)
        self.assertNotIn(self.root / 'docs/PUBLISHING_SAFETY.md', public_files(self.root))

    def test_missing_asset_fails_before_copy(self):
        (self.root / 'assets/test.png').unlink()
        with self.assertRaisesRegex(ValueError, 'test.png'):
            stage_publication(self.root, Path(self.temp.name) / 'public')
        self.assertFalse((Path(self.temp.name) / 'public').exists())

    def test_srcset_and_structured_data_are_checked(self):
        self.write('en/index.html', '<img srcset="../assets/test.png 1x, ../assets/missing.png 2x">')
        with self.assertRaisesRegex(ValueError, 'missing.png'):
            validate_publication(self.root)
        self.write('en/index.html', '<script type="application/ld+json">' +
                   json.dumps({'contentUrl': self.base + 'downloads/missing.zip'}) + '</script>')
        with self.assertRaisesRegex(ValueError, 'missing.zip'):
            validate_publication(self.root)

    def test_markdown_and_sitemap_links_are_checked(self):
        self.write('guides/en/example/index.md', '[CSV](../../../data/missing.csv)')
        with self.assertRaisesRegex(ValueError, 'missing.csv'):
            validate_publication(self.root)
        (self.root / 'guides/en/example/index.md').unlink()
        self.write('sitemap.xml', '<urlset><url><loc>' + self.base + 'prototype/</loc></url></urlset>')
        with self.assertRaisesRegex(ValueError, 'prototype'):
            validate_publication(self.root)

    def test_encoded_traversal_is_rejected(self):
        with self.assertRaisesRegex(ValueError, 'Unsafe project-local URL'):
            local_target(self.base + '%2e%2e/private', 'index.html', self.base)

    def test_symlinks_do_not_escape_publication(self):
        (self.root / 'assets/test.png').unlink()
        (self.root / 'assets/test.png').symlink_to(self.root / 'src/ia-b2-hubs.html')
        with self.assertRaisesRegex(ValueError, 'Public symlink'):
            public_files(self.root)

    def test_unowned_output_is_not_overwritten(self):
        output = Path(self.temp.name) / 'unrelated'
        output.mkdir()
        (output / 'keep.txt').write_text('keep')
        with self.assertRaisesRegex(ValueError, 'unrecognized nonempty'):
            stage_publication(self.root, output)
        self.assertEqual((output / 'keep.txt').read_text(), 'keep')
        with self.assertRaisesRegex(ValueError, 'separate directory'):
            stage_publication(self.root, self.root)


if __name__ == '__main__':
    unittest.main()
