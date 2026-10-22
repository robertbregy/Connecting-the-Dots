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
  // Ordinary fragments work without the JavaScript router as well.
  if (id === 'overview' && !anchor) { a.href = prefix || './'; return a; }
  a.href = prefix + '?tab=' + encodeURIComponent(id) + '#' + encodeURIComponent(anchor || id);
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
  return {text: clone.textContent, hrefs: [...clone.querySelectorAll('a[href]')].map(a => a.getAttribute('href')).sort()};
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
  const describe = n => n.querySelector('h2')?.textContent.trim() || n.id || n.className;
  const before = original.map(describe);
  for (const n of order) section.append(n);
  for (const r of records) {
    assert.ok(section.contains(r.node), 'Lost original block in ' + section.id);
    assert.deepEqual(bodySnapshot(r.node), {text: r.text, hrefs: r.hrefs}, 'Reorder changed evidence in ' + section.id);
  }
  return {before, after: order.map(describe), originalBlocks: original.length};
}
function refineLugano(d, lang) {
  // Assign legacy heading anchors before this relocation (see nativePage).
  // Motivations belong in the main reading path, not inside an optional panel.
  const labels = {
    en: 'Other city domains and .zuerich: a comparison',
    it: 'Il confronto con gli altri domini cittadini e con .zuerich',
    de: 'Andere Stadtdomains und .zuerich im Vergleich',
    fr: 'Les autres domaines urbains et .zuerich en comparaison'
  };
  assert.ok(labels[lang], 'Missing Lugano comparison label: ' + lang);
  const section = d.getElementById('lugano');
  const governance = d.getElementById('lugano-governance-decisions');
  const why = section?.querySelector('[data-i18n="luganoWhyTitle"]')?.closest('.panel');
  const swiss = section?.querySelector('[data-i18n="luganoSwissTitle"]')?.closest('.panel');
  const context = why?.closest('details.editorialDetails');
  const summary = context?.querySelector(':scope > summary');
  const commons = d.getElementById('lugano-public-commons');
  assert.ok(section && governance && why && swiss && context && summary && commons, 'Incomplete Lugano reading-order source');
  assert.ok(governance.parentElement === section && governance.contains(context) && context.contains(swiss), 'Unexpected Lugano context placement');
  assert.deepEqual([...context.children], [summary, why, swiss], 'Unexpected content in Lugano context; review before relocating');
  const describe = n => n.querySelector('h2')?.textContent.trim() || n.id || n.className;
  const before = [...section.children].map(describe);
  const ids = [...section.querySelectorAll('[id]')].map(n => n.id).sort();
  const hrefs = () => [...section.querySelectorAll('a[href]')].map(n => n.getAttribute('href')).sort();
  const originalLinks = hrefs();
  const evidence = [why, swiss, commons].map(n => ({node: n, html: n.outerHTML}));
  const localizedEvidence = () => [...section.querySelectorAll('[data-i18n]')].map(n => [n.getAttribute('data-i18n'), n.textContent]).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
  const originalEvidence = localizedEvidence();
  const chapterIds = () => [...section.children].filter(n => n.classList.contains('luganoChapter')).map(n => n.id);
  const originalChapters = chapterIds();
  governance.before(why, context);
  summary.textContent = labels[lang];
  if (!context.id) context.id = 'lugano-city-comparison';
  assert.equal(why.parentElement, section, 'Lugano motivations must remain in the main reading path');
  assert.equal(why.closest('details'), null, 'Lugano motivations must not require expansion');
  assert.equal(why.nextElementSibling, context, 'Lugano comparison must follow the motivations');
  assert.equal(context.nextElementSibling, governance, 'Lugano motivations and comparison must precede governance');
  assert.equal(context.hasAttribute('open'), false, 'Only the city comparison remains optional');
  assert.deepEqual([...context.children], [summary, swiss], 'Lugano comparison must contain only the territorial precedents');
  for (const record of evidence) assert.equal(record.node.outerHTML, record.html, 'Lugano evidence was rewritten');
  assert.deepEqual(localizedEvidence(), originalEvidence, 'Lugano translated evidence changed');
  assert.deepEqual(hrefs(), originalLinks, 'Lugano source links changed');
  assert.deepEqual(chapterIds(), originalChapters, 'Lugano main groups or their legacy anchors changed');
  for (const id of ids) assert.ok(section.querySelectorAll('[id]').length && d.getElementById(id) && section.contains(d.getElementById(id)), 'Lost Lugano anchor: ' + id);
  return {before, after: [...section.children].map(describe), originalBlocks: before.length, motivationsVisible: true, comparisonLabel: labels[lang], retainedExistingIds: ids.length, retainedLinks: originalLinks.length, evidenceUnchanged: true};
}
function headingsFor(section) { return [...section.querySelectorAll('h2')].filter(h => !h.closest('[data-reader-ui]')); }
function toc(d, section, lang, independent = false) {
  const curated = !independent && require('./usability_remediation.cjs').curatedToc(d, section, lang);
  if (curated) return curated;
  const L = DATA.locales[lang], headings = headingsFor(section);
  if (headings.length < 2) return null;
  const nav = ui(node(d, 'nav', null, 'readerToc')); nav.setAttribute('aria-label', L.ui.contents);
  const disclosure = node(d, 'details'); disclosure.setAttribute('open', '');
  disclosure.append(node(d, 'summary', L.ui.contents));
  const list = node(d, 'ol'); let remaining;
  for (const [i, heading] of headings.entries()) {
    if (!heading.id) heading.id = 'reader-anchor-' + (section.id || 'article') + '-' + (i + 1);
    const item = node(d, 'li');
    const a = independent ? node(d, 'a', heading.textContent.trim()) : link(d, heading.textContent.trim(), section.id, heading.id);
    if (independent) a.href = '#' + encodeURIComponent(heading.id);
    item.append(a);
    if (i < 5) list.append(item);
    else { if (!remaining) remaining = node(d, 'ol'); remaining.append(item); }
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
    let el = d.querySelector('[data-reader-asset="' + file + '"]');
    if (!el) {
      el = node(d, tag); el.setAttribute('data-reader-asset', file);
      if (tag === 'link') { el.rel = 'stylesheet'; d.head.append(el); }
      else { el.defer = true; d.body.append(el); }
    }
    el.setAttribute(attr, prefix + 'assets/' + file + '?v=' + PUB.version + '-usability-20261022');
  }
  d.documentElement.dataset.readerFirst = '1';
}
function write(file, d) { fs.writeFileSync(file, '<!DOCTYPE html>\n' + d.documentElement.outerHTML + '\n'); }
function nativePage(lang, filename) {
  const file = path.join(ROOT, filename), {document: d} = parseHTML(fs.readFileSync(file, 'utf8'));
  assert.ok(!d.documentElement.hasAttribute('data-reader-first'), 'Native page must be rebuilt before applying reader architecture');
  const L = DATA.locales[lang], prefix = filename === 'index.html' ? '' : '../';
  const oldIds = [...d.querySelectorAll('[id]')].map(n => n.id);
  const main = d.querySelector('main'); assert.ok(main);
  const titles = {};
  for (const id of Object.keys(AREA)) {
    const section = d.getElementById(id); assert.ok(section, 'Missing chapter: ' + id);
    const menu = d.querySelector('.tab[data-target="' + id + '"]');
    titles[id] = menu?.textContent.trim() || section.querySelector('h2')?.textContent.trim() || L.routes[id][0];
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
  const changes = {lugano: refineLugano(d, lang)};
  changes.narrative = require('./narrative_clarity.cjs').refineNarrative(d, lang);
  const atlasLoader = d.querySelector('script[src*="assets/aps-lazy.js"]');
  assert.ok(atlasLoader); atlasLoader.setAttribute('src', prefix + 'assets/aps-lazy.js?v=' + PUB.version + '-narrative-20261022');
  for (const [id, selectors] of Object.entries(reorder)) changes[id] = arrange(d.getElementById(id), selectors);
  const history = d.getElementById('timeline'), patterns = rootBlock(d.getElementById('tld-cultural-patterns'), history);
  assert.ok(patterns, 'Cultural analysis block missing');
  changes.timeline = arrange(history, [...history.children].filter(n => !n.matches('nav.sectionToc') && n !== patterns).map(n => {
    if (!n.id) n.id = 'reader-history-block-' + [...history.children].indexOf(n);
    return '#' + n.id;
  }));
  const resource = d.getElementById('resources');
  const pack = resource.querySelector('a[href*="connecting-the-dots-data-pack-v"]'); assert.ok(pack, 'Current data download missing');
  const downloads = rootBlock(pack, resource); if (!downloads.id) downloads.id = 'reader-downloads';
  changes.resources = arrange(resource, [':first', '#' + downloads.id]);
  changes.usability = require('./usability_remediation.cjs').refine(d, lang);
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
    hub.append(ui(node(d, 'p', L.ui.guide, 'readerHubGuide')));
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
    intro.append(trail, node(d, 'h2', L.routes[id][0], 'readerChapterTitle'), node(d, 'p', L.routes[id][1], 'readerLead'));
    const readingBrief = require('./usability_remediation.cjs').brief(d, id, lang);
    if (readingBrief) intro.append(readingBrief);
    section.prepend(intro);
    if (id !== 'economics') {
      for (const oldNav of section.querySelectorAll(':scope > nav.sectionToc')) { oldNav.setAttribute('hidden', ''); oldNav.setAttribute('inert', ''); }
      const index = toc(d, section, lang); if (index) intro.after(index);
    }
    const next = ui(node(d, 'nav', null, 'readerNext')); next.setAttribute('aria-label', L.ui.articleNext);
    for (const [i, dest] of DATA.next[id].entries()) {
      assert.ok(AREA[dest] && dest !== id, 'Invalid next chapter');
      const card = link(d, '', dest); card.className = 'readerNextCard';
      card.append(node(d, 'span', i === 0 ? L.ui.next : L.ui.verify, 'readerNextLabel'), node(d, 'strong', L.routes[dest][0]), node(d, 'span', titles[dest], 'readerNextTopic'));
      next.append(card);
    }
    section.append(next); section.dataset.readerChapter = id; section.dataset.readerTitle = L.routes[id][0];
    for (const {node: original, snapshot} of beforeBlocks) assert.deepEqual(bodySnapshot(original), snapshot, 'Original chapter content changed: ' + id);
    chapters.push({id, headings: headingsFor(section).length, parent: area, next: DATA.next[id]});
  }
  const researchCta = ui(link(d, L.ui.research, 'research', 'research-citation-guide'));
  researchCta.className = 'control readerResearchCta'; d.querySelector('.heroActions').append(researchCta);
  const directory = ui(node(d, 'details', null, 'readerDirectory')); directory.id = 'reader-pathway-map';
  directory.append(node(d, 'summary', L.ui.directory));
  const groups = node(d, 'div', null, 'readerDirectoryGrid');
  for (const [area, ids] of Object.entries(DATA.areas)) {
    const group = node(d, 'div'), title = node(d, 'h2'); title.append(link(d, hubTitles[area], area)); group.append(title);
    const list = node(d, 'ul');
    for (const id of ids) { const item = node(d, 'li'); item.append(link(d, titles[id], id)); list.append(item); }
    group.append(list); groups.append(group);
  }
  directory.append(groups); main.append(directory);
  const legacy = d.getElementById('iaLegacyNavDisclosure'); if (legacy) { legacy.setAttribute('hidden', ''); legacy.setAttribute('inert', ''); }
  for (const id of oldIds) assert.ok(d.getElementById(id), 'Lost existing fragment ' + id);
  for (const a of d.querySelectorAll('[data-reader-ui] [data-open-section]')) {
    assert.ok(d.getElementById(a.dataset.openSection), 'Invalid reader destination');
    if (a.dataset.openAnchor) assert.ok(d.getElementById(a.dataset.openAnchor), 'Invalid reader anchor');
  }
  assert.equal(d.querySelectorAll('.iaHubCard').length, 26, 'Original navigation card lost');
  addAssets(d, prefix); write(file, d);
  report.native.push({file: filename, lang, retainedExistingIds: oldIds.length, chapters, reorders: changes, originalCards: 26});
}
function walk(dir) { return fs.readdirSync(dir, {withFileTypes: true}).flatMap(e => e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]); }
function independentPage(file) {
  const raw = fs.readFileSync(file, 'utf8');
  if (!raw.includes('ctdB2CrossNav') || /http-equiv=["']refresh/i.test(raw)) return;
  const {document: d} = parseHTML(raw), main = d.querySelector('main'); if (!main) return;
  // Static independent pages can survive a rebuild. Replace only our UI so the
  // operation remains idempotent and never duplicates navigation or old copy.
  for (const n of d.querySelectorAll('[data-reader-ui]')) n.remove();
  const lang = LANGS.includes(d.documentElement.lang) ? d.documentElement.lang : 'en', L = DATA.locales[lang];
  const original = bodySnapshot(main), ids = [...d.querySelectorAll('[id]')].map(n => n.id);
  const originalCount = Number(d.body.dataset.readerOriginalIds || d.documentElement.dataset.readerOriginalIds || ids.length);
  const relative = path.relative(ROOT, file).split(path.sep).join('/'), prefix = '../'.repeat(relative.split('/').length - 1), base = prefix + lang + '/';
  const selected = d.querySelector('.ctdB2CrossNav a[aria-current]')?.getAttribute('href')?.match(/[?&]tab=(ia-[a-z]+)/)?.[1];
  const area = selected && DATA.areas[selected] ? selected : relative.startsWith('applications/') || relative.startsWith('explorer/') ? 'ia-explore' : relative.startsWith('research/') ? 'ia-research' : 'ia-round';
  const trail = ui(node(d, 'nav', null, 'readerTrail readerArticleTrail')); trail.setAttribute('aria-label', L.ui.context);
  trail.append(link(d, L.ui.home, 'overview', null, base), link(d, L.ui.back, area, null, base)); main.prepend(trail);
  // Establish the stable main ID before assigning any contents anchors.
  if (!main.id) main.id = 'reader-main';
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
  d.body.dataset.readerOriginalIds = String(originalCount);
  d.body.dataset.readerFirst = '1';
  addAssets(d, prefix);
  // Keep language, canonical, hreflang and structured metadata byte-for-byte.
  // Preserve the original Python text-entity convention without changing text.
  let head = raw.slice(0, raw.search(/<body\b/i));
  assert.ok(head.includes('</head>'), 'Independent document head missing: ' + relative);
  head = head.replace(/ data-reader-(?:first|original-ids)="[^"]*"/g, '');
  head = head.replace(/<link\b(?=[^>]*data-reader-asset="reader-first\.css")[^>]*>\s*/g, '');
  const style = d.querySelector('link[data-reader-asset="reader-first.css"]');
  head = head.replace('</head>', style.outerHTML + '</head>');
  const {serializeBody} = require('./reader_first_serialization.cjs');
  fs.writeFileSync(file, head + serializeBody(d.body) + '\n</html>\n');
  report.independent.push({file: relative, lang, area, retainedExistingIds: originalCount});
}
for (const lang of LANGS) { nativePage(lang, lang + '/index.html'); if (lang === 'en') nativePage(lang, 'index.html'); }
for (const directory of ['applications', 'behind-the-round', 'inside-the-round', 'explorer', 'research']) {
  const folder = path.join(ROOT, directory); if (!fs.existsSync(folder)) continue;
  for (const file of walk(folder).filter(f => path.basename(f) === 'index.html' && !f.includes('/reader-study/'))) independentPage(file);
}
fs.writeFileSync(path.join(ROOT, 'docs/reader-first-structure.json'), JSON.stringify(report, null, 2) + '\n');
console.log('READER_FIRST_STRUCTURE_VERIFIED', JSON.stringify({nativePages: report.native.length, chaptersPerLanguage: Object.keys(AREA).length, independentPages: report.independent.length, existingContent: 'preserved', humanParticipants: 0}));