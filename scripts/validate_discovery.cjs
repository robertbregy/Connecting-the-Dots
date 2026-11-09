#!/usr/bin/env node
'use strict';

// Check the published documents a crawler receives, independently of the renderer.
// No network requests and no changes to research or publication files.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {parseHTML, DOMParser} = require('linkedom');

const root = path.resolve(__dirname, '..');
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const json = rel => JSON.parse(read(rel));
const pub = json('publication.json');
const base = new URL(pub.deployment);
const manifest = json('discovery/manifest.json');
const languages = ['en', 'it', 'de', 'fr'];
const economicsKeys = ['market', 'cases', 'portfolios', 'round-2026'];
const errors = [];
const results = [];
const cache = new Map();
const flat = value => String(value ?? '').replace(/\s+/g, ' ').trim();

function check(name, work) {
  try { work(); results.push({name, passed: true}); }
  catch (error) { errors.push({name, message: error.message}); }
}

function documentAt(rel) {
  if (!cache.has(rel)) cache.set(rel, parseHTML(read(rel)).document);
  return cache.get(rel);
}

function localPath(url) {
  if (url.origin !== base.origin || !url.pathname.startsWith(base.pathname)) return null;
  const decoded = decodeURIComponent(url.pathname.slice(base.pathname.length));
  const rel = decoded.endsWith('/') || !decoded ? decoded + 'index.html' : decoded;
  const absolute = path.resolve(root, rel);
  assert.ok(absolute.startsWith(root + path.sep), 'Local link escapes the publication: ' + url.href);
  return path.relative(root, absolute);
}

function structuredNodes(document) {
  const nodes = [];
  for (const script of document.querySelectorAll('script[type="application/ld+json"]')) {
    const value = JSON.parse(script.textContent);
    const values = Array.isArray(value) ? value : [value];
    for (const entry of values) nodes.push(...(entry['@graph'] || [entry]));
  }
  return nodes;
}

function identities(node) {
  return [node['@id'], node.url,
    typeof node.mainEntityOfPage === 'string' ? node.mainEntityOfPage : node.mainEntityOfPage?.['@id']]
    .filter(Boolean).map(value => String(value).split('#')[0]);
}

function externalCitation(anchor, pageUrl) {
  const href = anchor.getAttribute('href');
  if (!href) return false;
  const url = new URL(href, pageUrl);
  if (!['http:', 'https:'].includes(url.protocol) || url.origin === base.origin) return false;
  // Site navigation, licences and a generic author link are not source evidence.
  if (['creativecommons.org', 'schema.org'].includes(url.hostname)) return false;
  if (url.hostname === 'github.com' && /^\/robertbregy(?:\/Connecting-the-Dots)?\/?$/.test(url.pathname)) return false;
  return true;
}

check('manifest identifies the current technical publication', () => {
  assert.equal(manifest.schemaVersion, 1);
  assert.equal(manifest.siteVersion, pub.version);
  assert.equal(manifest.generatedOn, pub.releasedOn);
  assert.ok(Array.isArray(manifest.pages) && manifest.pages.length > 0, 'No discovery documents');
  assert.equal(new Set(manifest.pages.map(page => page.path)).size, manifest.pages.length, 'Duplicate page paths');
  assert.equal(manifest.pages.length, 84, 'Preserve the 68 discovery documents and add 16 Economics documents');
  const expectedEconomics = languages.flatMap(lang => economicsKeys.map(key => `economics/${lang}/${key}/`));
  assert.deepEqual(manifest.pages.filter(page => page.kind === 'economics').map(page => page.path).sort(),
    expectedEconomics.sort(), 'Missing or extra Economics destinations');
});

const pages = manifest.pages || [];
const groups = new Map();
for (const page of pages) {
  const group = page.kind + ':' + page.key;
  if (!groups.has(group)) groups.set(group, []);
  groups.get(group).push(page);
}
const titles = new Map();
const descriptions = new Map();
let linksChecked = 0;
let citations = 0;

for (const page of pages) {
  check(page.path, () => {
    assert.ok(languages.includes(page.language), 'Unsupported language');
    assert.ok(['guide', 'tld', 'index', 'economics'].includes(page.kind), 'Unknown document kind');
    if (page.kind === 'economics') {
      assert.ok(economicsKeys.includes(page.key), 'Unknown Economics detail');
      assert.equal(page.path, `economics/${page.language}/${page.key}/`, 'Economics document path differs');
    }
    assert.ok(/^[a-z0-9][a-z0-9/_-]*\/$/.test(page.path), 'Unsafe or non-directory page path');
    const file = page.path + 'index.html';
    const canonical = new URL(page.path, base).href;
    const document = documentAt(file);
    assert.equal(document.documentElement.getAttribute('lang'), page.language, 'Document language differs');
    assert.equal(document.querySelectorAll('h1').length, 1, 'Each document needs one H1');
    assert.ok(flat(document.querySelector('h1').textContent), 'Empty H1');
    assert.equal(document.querySelectorAll('main').length, 1, 'Document needs one main landmark');
    const main = document.querySelector('main');
    assert.ok(flat(main.textContent).length > 150, 'Main content is empty or only a placeholder');
    assert.equal(main.querySelector('noscript'), null, 'Reading content must remain the same with or without JavaScript');
    assert.equal(document.querySelectorAll('link[rel="canonical"]').length, 1, 'Canonical is absent or ambiguous');
    assert.equal(document.querySelector('link[rel="canonical"]').getAttribute('href'), canonical, 'Canonical collapses to another page');
    assert.equal(document.querySelector('meta[property="og:url"]')?.getAttribute('content'), canonical, 'Social URL differs from canonical');
    assert.equal(flat(document.title), flat(page.title), 'Manifest/document title mismatch');
    assert.ok(!titles.has(document.title), 'Duplicate title with ' + titles.get(document.title));
    titles.set(document.title, page.path);
    const description = document.querySelector('meta[name="description"]')?.getAttribute('content');
    assert.ok(flat(description), 'Missing description');
    assert.equal(description, page.description, 'Manifest/document description mismatch');
    assert.ok(!descriptions.has(description), 'Duplicate description with ' + descriptions.get(description));
    descriptions.set(description, page.path);
    for (const meta of document.querySelectorAll('meta[name="robots"],meta[name="googlebot"]'))
      assert.ok(!/\b(noindex|none|nosnippet)\b/i.test(meta.getAttribute('content') || ''), 'Document excludes indexing or snippets');
    assert.equal(document.querySelector('meta[http-equiv="refresh"]'), null, 'Static document must not immediately redirect into the app');
    const readingControls = [...main.querySelectorAll('button,input,select,textarea')];
    if (page.kind === 'economics') {
      const share = main.querySelectorAll('button[data-economics-share]');
      assert.equal(share.length, 1, 'Economics needs one progressively enabled share action');
      assert.ok(share[0].matches('#economics-share[type="button"][hidden]'), 'Share action must wait for its runtime');
      assert.equal(main.querySelector('#economics-share-status')?.getAttribute('role'), 'status', 'Share action lost its status feedback');
      assert.ok(document.querySelector('script[src*="assets/economics-pages.js"]'), 'Economics enhancements runtime is absent');
    }
    const contentControls = readingControls.filter(control => !(page.kind === 'economics' && control.matches('button[data-economics-share]')));
    if (page.kind === 'economics' && page.key === 'market') {
      // Only the market's five progressive controls are permitted here. Other
      // reading documents retain the existing prohibition of inert app UI.
      const permitted = 'button[data-market-view="web"],button[data-market-view="zones"],input#market-search,select#market-origin,button#market-more';
      const controls = contentControls;
      assert.equal(controls.length, 5, 'Market filtering controls are missing or duplicated');
      assert.ok(controls.every(control => control.matches(permitted) && control.closest('#tld-market-reach')),
        'An unsupported application control survived on the market page');
      assert.equal(main.querySelectorAll('[data-market-view]').length, 2, 'Both ranking selectors must remain');
      assert.ok(document.querySelector('script[src*="assets/tld-market.js"]'), 'Market runtime is absent');
      for (const id of ['market-web', 'market-zones'])
        assert.equal(main.querySelectorAll('#'+id+' tbody tr').length, 50, 'The complete market table must remain in HTML');
    } else {
      assert.equal(contentControls.length, 0, 'Static content contains an inert application control');
    }
    if (page.kind === 'economics')
      assert.equal(document.querySelector('script[src*="assets/app.js"]'), null, 'Standalone Economics must not load the native app router');
    assert.equal(document.querySelector('[onclick],[onchange],[onsubmit]'), null, 'Inline app handler survived extraction');
    for (const anchor of main.querySelectorAll('a[href]'))
      assert.ok(flat(anchor.getAttribute('href')) && anchor.getAttribute('href').trim() !== '#', 'Placeholder link survived extraction');

    const equivalents = groups.get(page.kind + ':' + page.key);
    assert.deepEqual(equivalents.map(value => value.language).sort(), [...languages].sort(), 'Equivalent documents are missing');
    const alternates = [...document.querySelectorAll('link[hreflang]')];
    assert.equal(alternates.length, languages.length + 1, 'Expected four locales and x-default');
    for (const lang of [...languages, 'x-default']) {
      const expected = equivalents.find(value => value.language === (lang === 'x-default' ? 'en' : lang));
      const links = alternates.filter(value => value.getAttribute('hreflang') === lang);
      assert.equal(links.length, 1, 'Duplicate or missing hreflang: ' + lang);
      assert.equal(links[0].getAttribute('href'), new URL(expected.path, base).href, 'Wrong language equivalent: ' + lang);
      if (lang !== page.language && lang !== 'x-default')
        assert.ok([...document.querySelectorAll('a[href]')].some(anchor =>
          new URL(anchor.getAttribute('href'), canonical).href === new URL(expected.path, base).href),
        'No usable language link to ' + lang);
    }

    const nodes = structuredNodes(document);
    const identity = nodes.find(node => identities(node).includes(canonical) && node.inLanguage === page.language);
    assert.ok(identity, 'JSON-LD does not describe this page in its own language');
    if (page.kind !== 'index') {
      assert.ok(identity.author || identity.creator, 'Missing author identity');
      assert.ok(/^\d{4}-\d{2}-\d{2}/.test(identity.dateModified || ''), 'Missing document update date');
      const sources = [...main.querySelectorAll('a[href]')].filter(anchor => externalCitation(anchor, canonical));
      assert.ok(sources.length > 0, 'No linked source evidence in the main content');
      citations += sources.length;
    }

    const ids = [...document.querySelectorAll('[id]')].map(node => node.id);
    assert.equal(new Set(ids).size, ids.length, 'Duplicate IDs make fragment targets ambiguous');
    for (const element of document.querySelectorAll('[aria-labelledby],[aria-describedby],[aria-controls]')) {
      for (const attribute of ['aria-labelledby', 'aria-describedby', 'aria-controls']) {
        for (const id of (element.getAttribute(attribute) || '').split(/\s+/).filter(Boolean))
          assert.ok(document.getElementById(id), 'ARIA reference lost during extraction: ' + attribute + '=' + id);
      }
    }
    for (const anchor of document.querySelectorAll('a[href],link[href],img[src],script[src]')) {
      const value = anchor.getAttribute(anchor.hasAttribute('href') ? 'href' : 'src');
      if (!value || /^(mailto:|tel:|data:)/i.test(value)) continue;
      assert.ok(!/^javascript:/i.test(value), 'JavaScript-only link: ' + value);
      const destination = new URL(value, canonical);
      const target = localPath(destination);
      if (target === null) continue;
      linksChecked++;
      assert.ok(fs.existsSync(path.join(root, target)), 'Missing local destination: ' + value + ' (' + target + ')');
      if (destination.hash && /\.html$/.test(target)) {
        const id = decodeURIComponent(destination.hash.slice(1));
        assert.ok(documentAt(target).getElementById(id) || documentAt(target).querySelector(`[name="${id.replace(/["\\]/g, '\\$&')}"]`),
          'Missing fragment: ' + value);
      }
    }

    assert.ok(page.sourcePath && fs.existsSync(path.join(root, page.sourcePath)), 'Source document is not identified');
    for (const source of [page.profileSourcePath, ...(page.sourceDataPaths || [])].filter(Boolean))
      assert.ok(fs.existsSync(path.join(root, source)), 'Missing declared source dependency: ' + source);
    if (page.kind === 'guide') {
      const source = documentAt(page.sourcePath).getElementById(page.sourceSection);
      const extracted = main.querySelector('.discoveryContent');
      assert.ok(source && extracted, 'Guide does not identify its original and published content');
      const sourceUrl = new URL(page.sourcePath, base).href;
      const citedUrls = (content, url) => [...new Set([...content.querySelectorAll('a[href]')]
        .filter(anchor => externalCitation(anchor, url))
        .map(anchor => new URL(anchor.getAttribute('href'), url).href))].sort();
      assert.deepEqual(citedUrls(extracted, canonical), citedUrls(source, sourceUrl),
        'Guide source citations changed during extraction');
    }
    assert.ok(page.markdownPath && fs.existsSync(path.join(root, page.markdownPath)), 'Markdown alternative missing');
    const markdown = read(page.markdownPath);
    assert.ok(/^#\s+\S/m.test(markdown) && markdown.length > 150, 'Markdown alternative lacks content');
    if (page.observationDate) {
      assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(page.observationDate), 'Observed-data date is not an ISO calendar date');
      const observed = new Date(page.observationDate + 'T12:00:00Z');
      assert.equal(observed.toISOString().slice(0, 10), page.observationDate, 'Observed-data date is invalid');
      assert.ok([...document.querySelectorAll('time[datetime]')].some(time =>
        time.getAttribute('datetime') === page.observationDate && flat(time.textContent)),
      'Published profile lost its observed-data date');
      const localized = new Intl.DateTimeFormat(page.language, {
        year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'
      }).format(observed);
      assert.ok(markdown.includes(localized) || markdown.includes(page.observationDate),
        'Markdown profile lost its observed-data date');
    }
    assert.equal(document.querySelector('link[rel="alternate"][type="text/markdown"]')?.getAttribute('href'),
      new URL(page.markdownPath, base).href, 'Markdown alternative is not discoverable');
    assert.ok([...document.querySelectorAll('link[rel="describedby"]')].some(link =>
      new URL(link.getAttribute('href'), canonical).href === new URL('llms.txt', base).href), 'Agent index not linked');
    if (page.interactiveUrl) assert.ok([...document.querySelectorAll('a[href]')].some(anchor =>
      new URL(anchor.getAttribute('href'), canonical).href === page.interactiveUrl), 'Interactive counterpart is not reachable');
  });
}

check('sitemap preserves established pages and lists new canonical documents', () => {
  const sitemap = new DOMParser().parseFromString(read('sitemap.xml'), 'text/xml');
  const locations = [...sitemap.querySelectorAll('url > loc')].map(node => node.textContent);
  assert.equal(locations.length, new Set(locations).size, 'Duplicate sitemap entries');
  const legacy = ['en/', 'it/', 'de/', 'fr/', 'explorer/', 'research/', 'research/connecting-the-dots-working-paper-v1.html'];
  for (const lang of languages) {
    legacy.push('inside-the-round/' + lang + '/', 'behind-the-round/' + lang + '/', 'applications/' + lang + '/');
    for (const slug of ['wdo-identity', 'sanctions-and-dns', 'who-controls-internet-access', 'objectors-eoi', 'replacement-strings', 'background-screening'])
      legacy.push('behind-the-round/' + lang + '/' + slug + '/');
  }
  for (const rel of [...legacy, ...pages.map(page => page.path)])
    assert.ok(locations.includes(new URL(rel, base).href), 'Sitemap omitted ' + rel);
  for (const entry of sitemap.querySelectorAll('url')) {
    const canonical = entry.querySelector('loc')?.textContent;
    if (!pages.some(page => new URL(page.path, base).href === canonical)) continue;
    const document = documentAt(localPath(new URL(canonical)));
    for (const alternate of document.querySelectorAll('link[hreflang]')) {
      const expected = alternate.getAttribute('href');
      const lang = alternate.getAttribute('hreflang');
      const sitemapAlternates = [...entry.children].filter(child => child.getAttribute('hreflang') === lang);
      assert.equal(sitemapAlternates.length, 1, 'Missing sitemap language alternate for ' + canonical + ' / ' + lang);
      assert.equal(sitemapAlternates[0].getAttribute('href'), expected, 'Sitemap/HTML language mismatch');
    }
  }
});

check('agent entry points link to actual current documents', () => {
  const catalog = json('agent-catalog.json');
  assert.ok(catalog && typeof catalog === 'object');
  const llms = read('llms.txt');
  assert.ok(llms.startsWith('# Connecting the Dots'), 'Agent index has no project identity');
  assert.ok(llms.includes('agent-catalog.json'), 'Agent catalog is not linked');
  assert.ok(llms.includes(pub.version), 'Agent index has an outdated site version');
  for (const match of llms.matchAll(/\]\(([^\s)]+)\)/g)) {
    const url = new URL(match[1], base);
    const rel = localPath(url);
    if (rel) assert.ok(fs.existsSync(path.join(root, rel)), 'Agent index links to a missing file: ' + match[1]);
  }
});

check('existing atlas links to the published reading pages', () => {
  const selected = pages.filter(page => page.kind === 'tld' && page.language === 'en').map(page => page.key).sort();
  for (const file of ['index.html', ...languages.map(lang => lang + '/index.html')]) {
    const document = documentAt(file);
    const language = document.documentElement.getAttribute('lang');
    const url = new URL(file === 'index.html' ? '' : language + '/', base);
    const configured = (document.querySelector('meta[name="ctd-discovery-profiles"]')?.getAttribute('content') || '')
      .split(/\s+/).filter(Boolean).sort();
    assert.deepEqual(configured, selected, file + ' must advertise exactly the available static profiles');
    const footerLink = document.querySelector('footer a#discoveryHome');
    assert.ok(footerLink && flat(footerLink.textContent), file + ' has no ordinary discovery link');
    assert.equal(new URL(footerLink.getAttribute('href'), url).href, new URL('discovery/' + language + '/', base).href,
      file + ' links to the wrong language index');
    for (const target of ['llms.txt', 'agent-catalog.json'])
      assert.ok([...document.querySelectorAll('link[rel="describedby"]')].some(link =>
        new URL(link.getAttribute('href'), url).href === new URL(target, base).href), file + ' is missing ' + target);
  }
});

const report = {passed: errors.length === 0, siteVersion: pub.version, pages: pages.length,
  groups: groups.size, localLinksChecked: linksChecked, sourceLinks: citations, checks: results.length, errors};
console.log('DISCOVERY_STATIC_QA ' + JSON.stringify(report));
if (process.env.CTD_DISCOVERY_STATIC_REPORT) {
  const output = path.resolve(process.env.CTD_DISCOVERY_STATIC_REPORT);
  fs.mkdirSync(path.dirname(output), {recursive: true});
  fs.writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
}
if (!report.passed) process.exitCode = 1;
