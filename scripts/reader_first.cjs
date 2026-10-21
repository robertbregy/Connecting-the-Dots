/* Reader-first architecture over preserved research content.
 * Run after the native editorial transforms. No source facts or datasets are rewritten.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {parseHTML} = require('linkedom');
const ROOT = path.resolve(__dirname, '..');
const DATA = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/reader_first.json'), 'utf8'));
const PUB = JSON.parse(fs.readFileSync(path.join(ROOT, 'publication.json'), 'utf8'));
const LANGS = ['en', 'it', 'de', 'fr'];
const AREA = Object.fromEntries(Object.entries(DATA.areas).flatMap(([area, ids]) => ids.map(id => [id, area])));
const report = {schemaVersion: 1, baseline: DATA.baseline, version: PUB.version, native: [], independent: [], humanParticipants: 0};
for (const lang of LANGS) {
  assert.deepEqual(Object.keys(DATA.locales[lang].routes).sort(), Object.keys(AREA).sort(), 'Incomplete route translations: ' + lang);
  assert.deepEqual(Object.keys(DATA.locales[lang].hubs).sort(), Object.keys(DATA.areas).sort(), 'Incomplete hub translations: ' + lang);
}
function node(d, tag, text, cls) {
  const n = d.createElement(tag);
  if (text != null) n.textContent = text;
  if (cls) n.className = cls;
  return n;
}
function ui(n) { n.setAttribute('data-reader-ui', ''); return n; }
function link(d, label, id, anchor, prefix = '') {
  const a = node(d, 'a', label);
  a.href = prefix + '?tab=' + encodeURIComponent(id) + (anchor ? '#' + encodeURIComponent(anchor) : '');
  if (!prefix) {
    a.dataset.openSection = id;
    if (anchor) a.dataset.openAnchor = anchor;
  }
  return a;
}
function rootBlock(n, section) {
  if (!n) return null;
  while (n.parentElement && n.parentElement !== section) n = n.parentElement;
  return n.parentElement === section ? n : null;
}
function bodySnapshot(section) {
  const clone = section.cloneNode(true);
  for (const n of clone.querySelectorAll('[data-reader-ui],nav.sectionToc')) n.remove();
  return {
    text: clone.textContent,
    hrefs: [...clone.querySelectorAll('a[href]')].map(a => a.getAttribute('href')).sort()
  };
}
function arrange(section, selectors) {
  const original = [...section.children].filter(n => !n.matches('nav.sectionToc,[data-reader-ui]'));
  const records = original.map(n => ({node: n, ...bodySnapshot(n)}));
  const chosen = [];
  for (const selector of selectors) {
    const n = selector === ':first' ? original[0] : rootBlock(section.querySelector(selector), section);
    assert.ok(n, 'Missing reading-order block ' + section.id + ': ' + selector);
    if (!chosen.includes(n)) chosen.push(n);
  }
  const order = [...chosen, ...original.filter(n => !chosen.includes(n))];
  const before = original.map(n => n.querySelector('h2')?.textContent.trim() || n.id || n.className);
  for (const n of order) section.append(n);
  for (const r of records) {
    assert.ok(section.contains(r.node), 'Lost original block in ' + section.id);
    assert.deepEqual(bodySnapshot(r.node), {text: r.text, hrefs: r.hrefs}, 'Reorder changed evidence in ' + section.id);
  }
  return {before, after: order.map(n => n.querySelector('h2')?.textContent.trim() || n.id || n.className), originalBlocks: original.length};
}
function headingsFor(section) {
  return [...section.querySelectorAll('h2')].filter(h => !h.closest('[data-reader-ui]'));
}
function toc(d, section, lang, independent = false) {
  const L = DATA.locales[lang];
  const headings = headingsFor(section);
  if (headings.length < 2) return null;
  const nav = ui(node(d, 'nav', null, 'readerToc'));
  nav.setAttribute('aria-label', L.ui.contents);
  const disclosure = node(d, 'details'); disclosure.open = true;
  disclosure.append(node(d, 'summary', L.ui.contents));
  const list = node(d, 'ol');
  let remaining;
  for (const [i, heading] of headings.entries()) {
    if (!heading.id) heading.id = 'reader-anchor-' + (section.id || 'article') + '-' + (i + 1);
    const item = node(d, 'li');
    const a = independent ? node(d, 'a', heading.textContent.trim()) : link(d, heading.textContent.trim(), section.id, heading.id);
    if (independent) a.href = '#' + encodeURIComponent(heading.id);
    item.append(a);
    if (i < 5) list.append(item);
    else {
      if (!remaining) remaining = node(d, 'ol');
      remaining.append(item);
    }
  }
  disclosure.append(list);
  if (remaining) {
    const more = node(d, 'details', null, 'readerTocMore');
    more.append(node(d, 'summary', L.ui.more), remaining); disclosure.append(more);
  }
  nav.append(disclosure); return nav;
}
function addAssets(d, prefix) {
  for (const [tag, attr, file] of [['link', 'href', 'reader-first.css'], ['script', 'src', 'reader-first.js']]) {
    if (d.querySelector('[data-reader-asset="' + file + '"]')) continue;
    const el = node(d, tag); el.setAttribute('data-reader-asset', file);
    el.setAttribute(attr, prefix + 'assets/' + file + '?v=' + PUB.version);
    if (tag === 'link') { el.rel = 'stylesheet'; d.head.append(el); }
    else { el.defer = true; d.body.append(el); }
  }
  d.documentElement.dataset.readerFirst = '1';
}
function write(file, d) { fs.writeFileSync(file, '<!DOCTYPE html>\n' + d.documentElement.outerHTML + '\n'); }
function nativePage(lang, filename) {
  const file = path.join(ROOT, filename), {document: d} = parseHTML(fs.readFileSync(file, 'utf8'));
  assert.ok(!d.documentElement.hasAttribute('data-reader-first'), 'Native page must be rebuilt before applying reader architecture');
  const L = DATA.locales[lang];
  const prefix = filename === 'index.html' ? '' : '../';
  const oldIds = [...d.querySelectorAll('[id]')].map(n => n.id);
  const main = d.querySelector('main'); assert.ok(main);
  const titles = {};
  for (const id of Object.keys(AREA)) {
    const section = d.getElementById(id); assert.ok(section, 'Missing chapter: ' + id);
    const menu = d.querySelector('.tab[data-target="' + id + '"]');
    titles[id] = menu?.textContent.trim() || section.querySelector('h2')?.textContent.trim() || L.routes[id][0];
    // Assign stable, language-independent IDs before changing document order.
    headingsFor(section).forEach((h, i) => { if (!h.id) h.id = 'reader-anchor-' + id + '-' + (i + 1); });
  }
  const reorder = {
    how: ['#how-part-2', '#how-part-3', '#how-part-4', '#how-part-1'],
    social: [':first', '#tld-cultural-social', '#socialGrid', '#socialModels'],
    cities: [':first', '#city-namespace-governance', '#city-namespace-measures'],
    contention: [':first', '#contention-part-3', '#contention-part-5', '#contention-part-2', '#contention-part-4', '#contention-part-6'],
    disputes: [':first', '#disputeGrid', '#disputeMechanisms'],
    refusals: [':first', '#refusalGrid', '#refusalTaxonomy', '#refusalSnapshot'],
    sources: [':first', '#sources-part-3', '#sources-part-4', '#sources-part-5', '#sources-part-2']
  };
  const changes = {};
  for (const [id, selectors] of Object.entries(reorder)) changes[id] = arrange(d.getElementById(id), selectors);
  const history = d.getElementById('timeline'), patterns = rootBlock(d.getElementById('tld-cultural-patterns'), history);
  assert.ok(patterns, 'Cultural analysis block missing');
  changes.timeline = arrange(history, [...history.children].filter(n => !n.matches('nav.sectionToc') && n !== patterns).map(n => {
    if (!n.id) n.id = 'reader-history-block-' + [...history.children].indexOf(n);
    return '#' + n.id;
  }));
  const resource = d.getElementById('resources');
  const pack = resource.querySelector('a[href*="connecting-the-dots-data-pack-v"]');
  assert.ok(pack, 'Current data download missing');
  const downloads = rootBlock(pack, resource); if (!downloads.id) downloads.id = 'reader-downloads';
  changes.resources = arrange(resource, [':first', '#' + downloads.id]);

  const hubTitles = {};
  for (const [area, ids] of Object.entries(DATA.areas)) {
    const hub = d.getElementById(area); assert.ok(hub);
    hubTitles[area] = hub.querySelector('.iaHubHead h2').textContent.trim();
    const lead = hub.querySelector('.iaHubHead > p'); assert.ok(lead);
    lead.removeAttribute('data-i18n'); lead.textContent = L.hubs[area];
    const grid = hub.querySelector(':scope > .iaHubGrid');
    if (area === 'ia-stories') for (const id of ids) {
      const card = grid.querySelector('[data-open-section="' + id + '"]')?.closest('.iaHubCard');
      assert.ok(card, 'Missing story card ' + id); grid.append(card);
    }
    if (area === 'ia-understand') {
      const first = grid.querySelector('[data-open-section="overview"]'); assert.ok(first);
      first.dataset.openAnchor = 'three-minute-guide'; first.href = '?tab=overview#three-minute-guide';
    }
    const orientation = ui(node(d, 'p', L.ui.guide, 'readerHubGuide')); hub.append(orientation);
  }
  const chapters = [];
  for (const [id, area] of Object.entries(AREA)) {
    const section = d.getElementById(id);
    const beforeBlocks = [...section.children].map(n => ({node: n, snapshot: bodySnapshot(n)}));
    const intro = ui(node(d, 'div', null, 'readerIntro')); intro.id = 'reader-start-' + id; intro.tabIndex = -1;
    const trail = node(d, 'nav', null, 'readerTrail'); trail.setAttribute('aria-label', L.ui.context);
    trail.append(link(d, L.ui.home, 'overview'));
    const sep = node(d, 'span', ' / '); sep.setAttribute('aria-hidden', 'true'); trail.append(sep);
    trail.append(link(d, hubTitles[area], area));
    const h1 = node(d, 'h1', L.routes[id][0], 'readerSrOnly');
    intro.append(trail, h1, node(d, 'p', L.routes[id][1], 'readerLead'));
    section.prepend(intro);
    if (id !== 'economics') {
      for (const oldNav of section.querySelectorAll(':scope > nav.sectionToc')) {
        oldNav.hidden = true; oldNav.setAttribute('inert', '');
      }
      const index = toc(d, section, lang); if (index) intro.after(index);
    }
    const next = ui(node(d, 'nav', null, 'readerNext')); next.setAttribute('aria-label', L.ui.articleNext);
    for (const [i, dest] of DATA.next[id].entries()) {
      assert.ok(AREA[dest] && dest !== id, 'Invalid next chapter');
      const card = link(d, '', dest); card.className = 'readerNextCard';
      card.append(node(d, 'span', i === 0 ? L.ui.next : L.ui.verify, 'readerNextLabel'));
      card.append(node(d, 'strong', L.routes[dest][0]));
      const caption = node(d, 'span', titles[dest], 'readerNextTopic'); card.append(caption);
      next.append(card);
    }
    section.append(next); section.dataset.readerChapter = id;
    section.dataset.readerTitle = L.routes[id][0];
    for (const {node: original, snapshot} of beforeBlocks) assert.deepEqual(bodySnapshot(original), snapshot, 'Original chapter content changed: ' + id);
    chapters.push({id, headings: headingsFor(section).length, parent: area, next: DATA.next[id]});
  }
  const researchCta = ui(link(d, L.ui.research, 'research', 'research-citation-guide'));
  researchCta.className = 'control readerResearchCta'; d.querySelector('.heroActions').append(researchCta);
  const directory = ui(node(d, 'details', null, 'readerDirectory')); directory.id = 'reader-pathway-map';
  directory.append(node(d, 'summary', L.ui.directory));
  const groups = node(d, 'div', null, 'readerDirectoryGrid');
  for (const [area, ids] of Object.entries(DATA.areas)) {
    const group = node(d, 'div');
    const title = node(d, 'h2'); title.append(link(d, hubTitles[area], area)); group.append(title);
    const list = node(d, 'ul');
    for (const id of ids) { const item = node(d, 'li'); item.append(link(d, titles[id], id)); list.append(item); }
    group.append(list); groups.append(group);
  }
  directory.append(groups); main.append(directory);
  // Keep the legacy runtime elements and every old URL; replace only their visible presentation.
  const legacy = d.getElementById('iaLegacyNavDisclosure'); if (legacy) { legacy.hidden = true; legacy.setAttribute('inert', ''); }
  for (const id of oldIds) assert.ok(d.getElementById(id), 'Lost existing fragment ' + id);
  for (const a of d.querySelectorAll('[data-reader-ui] [data-open-section]')) {
    assert.ok(d.getElementById(a.dataset.openSection), 'Invalid reader destination');
    if (a.dataset.openAnchor) assert.ok(d.getElementById(a.dataset.openAnchor), 'Invalid reader anchor');
  }
  assert.equal(d.querySelectorAll('.iaHubCard').length, 26, 'Original navigation card lost');
  addAssets(d, prefix); write(file, d);
  report.native.push({file: filename, lang, retainedExistingIds: oldIds.length, chapters, reorders: changes, originalCards: 26});
}
function walk(dir) {
  return fs.readdirSync(dir, {withFileTypes: true}).flatMap(e => e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);
}
function independentPage(file) {
  const raw = fs.readFileSync(file, 'utf8');
  if (!raw.includes('ctdB2CrossNav') || /http-equiv=["']refresh/i.test(raw)) return;
  const {document: d} = parseHTML(raw);
  if (d.documentElement.hasAttribute('data-reader-first')) return;
  const main = d.querySelector('main'); if (!main) return;
  const lang = LANGS.includes(d.documentElement.lang) ? d.documentElement.lang : 'en';
  const L = DATA.locales[lang];
  const original = bodySnapshot(main), ids = [...d.querySelectorAll('[id]')].map(n => n.id);
  const relative = path.relative(ROOT, file).split(path.sep).join('/');
  const prefix = '../'.repeat(relative.split('/').length - 1);
  const base = prefix + lang + '/';
  const area = relative.startsWith('applications/') || relative.startsWith('explorer/') ? 'ia-explore' : relative.startsWith('research/') ? 'ia-research' : 'ia-round';
  const trail = ui(node(d, 'nav', null, 'readerTrail readerArticleTrail')); trail.setAttribute('aria-label', L.ui.context);
  trail.append(link(d, L.ui.home, 'overview', null, base), link(d, L.ui.back, area, null, base)); main.prepend(trail);
  const index = toc(d, main, lang, true); if (index) {
    const heading = main.querySelector('h1'); if (heading) heading.after(index); else trail.after(index);
  }
  const end = ui(node(d, 'nav', null, 'readerNext')); end.setAttribute('aria-label', L.ui.articleNext);
  for (const dest of area === 'ia-research' ? ['sources', 'resources'] : area === 'ia-explore' ? ['timeline', 'resources'] : ['reveal', 'sources']) {
    const a = link(d, '', dest, null, base); a.className = 'readerNextCard';
    a.append(node(d, 'span', L.ui.articleNext, 'readerNextLabel'), node(d, 'strong', L.routes[dest][0])); end.append(a);
  }
  main.append(end);
  if (!main.id) main.id = 'reader-main'; main.tabIndex = -1;
  if (!d.querySelector('.skipLink')) {
    const skip = ui(node(d, 'a', L.ui.contents, 'skipLink readerSkip')); skip.href = '#' + main.id; d.body.prepend(skip);
  }
  assert.deepEqual(bodySnapshot(main), original, 'Independent article evidence changed: ' + relative);
  for (const id of ids) assert.ok(d.getElementById(id), 'Lost independent anchor: ' + id);
  addAssets(d, prefix); write(file, d); report.independent.push({file: relative, lang, area, retainedExistingIds: ids.length});
}
for (const lang of LANGS) {
  nativePage(lang, lang + '/index.html');
  if (lang === 'en') nativePage(lang, 'index.html');
}
for (const directory of ['applications', 'behind-the-round', 'inside-the-round', 'explorer', 'research']) {
  const folder = path.join(ROOT, directory); if (!fs.existsSync(folder)) continue;
  for (const file of walk(folder).filter(f => path.basename(f) === 'index.html' && !f.includes('/reader-study/'))) independentPage(file);
}
fs.writeFileSync(path.join(ROOT, 'docs/reader-first-structure.json'), JSON.stringify(report, null, 2) + '\n');
console.log('READER_FIRST_STRUCTURE_VERIFIED', JSON.stringify({nativePages: report.native.length, chaptersPerLanguage: Object.keys(AREA).length, independentPages: report.independent.length, existingContent: 'preserved', humanParticipants: 0}));
