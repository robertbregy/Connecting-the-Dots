/* ECON107: a short introduction and four complete, independently readable
 * chapters. Source blocks are copied intact; this pass never edits the corpus.
 * Discovery calls splitEconomics first, then this executable replaces the five
 * native overviews and checks the published destination of every original block.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const {parseHTML} = require('linkedom');
const root = path.resolve(__dirname, '..');
const pub = JSON.parse(fs.readFileSync(path.join(root, 'publication.json'), 'utf8'));
const copy = JSON.parse(fs.readFileSync(path.join(root, 'data/economics_hub.json'), 'utf8'));
const BASELINE = '4c7ddb62c7601f6971815aef17b7dce0f5f01e73';
const languages = ['en', 'it', 'de', 'fr'];
const keys = ['market', 'cases', 'portfolios', 'round-2026'];
const guideKeys = ['how', 'timeline', 'cities', 'economics', 'lugano', 'beyond'];
const profileKeys = ['ai', 'lugano', 'amazon', 'music', 'berlin', 'zuerich', 'swiss', 'com', 'cat', 'io'];
const plain = value => String(value || '').replace(/\s+/g, ' ').trim();
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
const ids = node => [node.id, ...[...node.querySelectorAll('[id]')].map(n => n.id)].filter(Boolean).sort();
const json = value => JSON.stringify(value).replace(/</g, '\\u003c');
const destination = (lang, key) => key === 'hub' ? `${lang}/index.html` : `economics/${lang}/${key}/index.html`;
const relative = (from, to) => {
  const url = new URL(to, pub.deployment);
  if (!url.href.startsWith(pub.deployment)) return url.href;
  const tail = url.pathname.slice(new URL(pub.deployment).pathname.length);
  const rel = path.posix.relative(path.posix.dirname(from), tail.replace(/\/$/, '')) || '.';
  return rel + (url.pathname.endsWith('/') ? '/' : '') + url.search + url.hash;
};

// A link to an existing native chapter and its equivalent reading document
// identifies the same evidence. Economics fragments have an explicit new home.
function canonicalLink(raw, {lang, pagePath = `${lang}/index.html`, anchors = {}}) {
  const url = new URL(raw, pub.deployment + pagePath);
  if (!url.href.startsWith(pub.deployment)) return url.href;
  const tail = url.pathname.slice(new URL(pub.deployment).pathname.length);
  const match = /^(en|it|de|fr)\/(?:index\.html)?$/.exec(tail);
  const native = tail === '' || tail === 'index.html' || Boolean(match);
  const targetLang = match?.[1] || /^(?:guides|economics)\/(en|it|de|fr)\//.exec(tail)?.[1] || lang;
  const hash = decodeURIComponent(url.hash.slice(1));
  const economicsGuide = /^guides\/(en|it|de|fr)\/economics\/(?:index\.html)?$/.test(tail);
  const economicsPage = /^economics\/(en|it|de|fr)\/[^/]+\/(?:index\.html)?$/.test(tail);
  if ((native || economicsGuide || economicsPage) && anchors[hash] && anchors[hash] !== 'hub') {
    const result = new URL(`economics/${targetLang}/${anchors[hash]}/`, pub.deployment);
    result.hash = url.hash;
    if (anchors[hash] === 'market') for (const key of ['market','origin','mq','marketall']) if (url.searchParams.has(key)) result.searchParams.set(key, url.searchParams.get(key));
    return result.href;
  }
  if (native) {
    const name = (url.searchParams.get('tld') || '').replace(/^\./, '').toLowerCase();
    const chapter = url.searchParams.get('tab');
    if (name && profileKeys.includes(name) && !url.searchParams.has('preset')) return new URL(`tlds/${targetLang}/${name}/`, pub.deployment).href;
    if (chapter && guideKeys.includes(chapter)) {
      const result = new URL(`guides/${targetLang}/${chapter}/`, pub.deployment);
      result.hash = url.hash;
      return result.href;
    }
    // Root English and /en/ are equivalent native entry points.
    url.pathname = new URL(`${targetLang}/`, pub.deployment).pathname;
  }
  url.pathname = url.pathname.replace(/\/index\.html$/, '/');
  return url.href;
}

function snapshot(node, options) {
  assert.ok(node, 'Missing preservation block');
  const text = plain(node.textContent);
  return {
    textSha256: crypto.createHash('sha256').update(text).digest('hex'),
    ids: ids(node),
    links: [...node.querySelectorAll('a[href]:not([data-economic-explore])')].map(a => ({text: plain(a.textContent), url: canonicalLink(a.getAttribute('href'), options)})),
    actions: [...node.querySelectorAll('[data-economic-explore]')].map(a => ({text: plain(a.textContent), url: canonicalLink(a.getAttribute('href') || `${pub.deployment}${options.lang}/?tab=explore&preset=economics&tld=${encodeURIComponent(a.getAttribute('data-economic-explore').replace(/^\./,''))}`, options)})),
    tables: [...node.querySelectorAll('table')].map(table => [...table.querySelectorAll('tr')].map(tr => [...tr.children].filter(c => ['TH','TD'].includes(c.tagName)).map(c => plain(c.textContent)))),
    metrics: [...node.querySelectorAll('.economicMetric')].map(n => plain(n.textContent)),
    marketData: [...node.querySelectorAll('[data-market-tld]')].map(n => Object.fromEntries(n.getAttributeNames().filter(k => k.startsWith('data-market-')).sort().map(k => [k, n.getAttribute(k)]))),
    graphics: [...node.querySelectorAll('svg,[role="img"]')].map(svg => ({text: plain(svg.textContent), elements: [svg, ...svg.querySelectorAll('*')].map(n => ({tag: n.tagName, attributes: Object.fromEntries(n.getAttributeNames().filter(k => !['class','data-i18n'].includes(k)).sort().map(k => [k,n.getAttribute(k)]))}))}))
  };
}

function splitEconomics(document, lang, {sourcePath = `${lang}/index.html`} = {}) {
  assert.ok(languages.includes(lang));
  const original = document.getElementById('economics');
  assert.ok(original && original.getAttribute('data-economics-reading-order') === 'six-step-v1', `Expected full source Economics in ${sourcePath}`);
  const untouched = original.outerHTML;
  const source = original.cloneNode(true);
  const one = selector => {const found = source.querySelectorAll(selector); assert.equal(found.length, 1, `Exactly one ${selector} in ${sourcePath}`); return found[0];};
  const c = copy.locales[lang];
  const pageNodes = Object.fromEntries(keys.map(key => {const n = document.createElement('div'); n.className = 'economicsDetail'; n.setAttribute('data-economics-detail', key); return [key, n];}));
  const retained = [];
  const specs = [
    ['intro', ':scope > .readerIntro', 'hub'],
    ['hero', ':scope > .economicsHero', 'cases'],
    ['value', '#economics-chapter-value', 'cases', [':scope > .economicsSupporting']],
    ['fees', '#economics-chapter-value > .economicsSupporting', 'round-2026'],
    ['reach', '#economics-chapter-reach', 'market'],
    ['cases', '#economics-chapter-cases', 'cases'],
    ['portfolios', '#economics-chapter-concentration', 'portfolios'],
    ['cycles', '#economics-chapter-cycles', 'round-2026'],
    ['round', '#economics-chapter-round2026', 'round-2026'],
    ['cemetery', '#economics-cemetery-link', 'hub'],
    ['next', ':scope > .readerNext', 'hub']
  ];
  const blocks = specs.map(([key, selector, target, excludes = []]) => {
    const n = one(selector).cloneNode(true);
    for (const omit of excludes) for (const child of n.querySelectorAll(omit)) child.remove();
    if (key === 'fees') n.classList.add('economicsFeesDetail');
    if (target === 'hub') retained.push([key, n]); else pageNodes[target].appendChild(n);
    return {key, selector, destination: target, destinationPath: destination(lang, target), destinationSelector: key === 'fees' ? '.economicsFeesDetail' : selector, sourceExcludeSelectors: excludes, node: n};
  });
  const anchors = {};
  for (const block of blocks) for (const id of ids(block.node)) {
    assert.equal(anchors[id], undefined, `Duplicate destination for ${id}`);
    anchors[id] = block.destination;
  }
  anchors['economics-reading-guide'] = 'hub';
  assert.deepEqual(Object.keys(anchors).sort(), ids(original).filter(id => id !== 'economics'), `${lang}: every old fragment needs a destination`);
  for (const block of blocks) block.before = snapshot(block.node, {lang, pagePath: sourcePath, anchors});
  const storySources = Object.fromEntries(c.stories.items.map(item => {const a = original.querySelector('#econ-case-'+item.id+' .caseSources a[href]'); assert.ok(a, 'A documented opening example needs its original source'); return [item.id, a.cloneNode(true).outerHTML];}));
  const targetURL = (key, anchor = '') => new URL(`economics/${lang}/${key}/${anchor ? '#' + anchor : ''}`, pub.deployment).href;
  const link = (url, text, extra = '') => `<a href="${escape(relative(sourcePath, url))}"${extra}>${escape(text)}</a>`;
  const paragraphs = values => values.map(value => `<p>${escape(value)}</p>`).join('');
  const hub = document.createElement('section');
  for (const a of original.attributes) hub.setAttribute(a.name, a.value);
  hub.removeAttribute('data-economics-reading-order');
  hub.classList.add('economicsHub');
  hub.setAttribute('data-economics-layout', 'hub-v1');
  // The established reader title, lead, short evidence note and trail remain
  // intact. The new copy adds explanation after that introduction.
  hub.appendChild(retained.find(([key]) => key === 'intro')[1]);
  const opening = document.createElement('div');
  opening.className = 'economicsOpening';
  opening.innerHTML = paragraphs(c.intro);
  hub.appendChild(opening);
  const paths = document.createElement('nav');
  paths.id = 'economics-reading-guide';
  paths.className = 'economicsPathways';
  paths.setAttribute('aria-labelledby', 'economics-pathways-title');
  paths.innerHTML = `<div class="economicsSectionHead"><p class="economicsEyebrow">${escape(c.eyebrow)}</p><h2 id="economics-pathways-title">${escape(c.pathways.title)}</h2><p>${escape(c.pathways.lead)}</p></div><div class="economicsPathGrid">${c.pathways.items.map((item,i) => `<a data-economics-path="${item.slug}" href="${escape(relative(sourcePath, targetURL(item.slug)))}"><span class="economicsPathNo" aria-hidden="true">0${i+1}</span><h3>${escape(item.title)}</h3><p>${escape(item.body)}</p><span class="economicsPathAction">${escape(item.linkLabel)} <span aria-hidden="true">→</span></span></a>`).join('')}</div>`;
  hub.appendChild(paths);
  const overview = document.createElement('div');
  overview.className = 'economicsOverview';
  overview.innerHTML = `<div class="economicsFlow" aria-labelledby="economics-flow-title"><h2 id="economics-flow-title">${escape(c.flow.title)}</h2><p class="economicsSectionLead">${escape(c.flow.lead)}</p><ol>${c.flow.steps.map((step,i) => `<li><span aria-hidden="true" class="economicsStepNo">${i+1}</span><h3>${escape(step.title)}</h3><p>${escape(step.body)}</p></li>`).join('')}</ol><p class="economicsFurther">${link(`${pub.deployment}${lang}/?tab=how#how-part-5`, c.flow.linkLabel, ' data-open-section="how" data-open-anchor="how-part-5"')}</p></div><div class="economicsStories" aria-labelledby="economics-stories-title"><h2 id="economics-stories-title">${escape(c.stories.title)}</h2><p class="economicsSectionLead">${escape(c.stories.lead)}</p><div class="economicsStoryGrid">${c.stories.items.map(item => `<article><p class="economicsStoryName">${escape(item.name)}</p><h3>${escape(item.title)}</h3><p>${escape(item.body)}</p>${link(targetURL('cases','econ-case-'+item.id),item.linkLabel)}<p class="economicsStorySource">${storySources[item.id]}</p></article>`).join('')}</div></div><aside class="economicsReading" aria-labelledby="economics-reading-title"><h2 id="economics-reading-title">${escape(c.reading.title)}</h2>${paragraphs(c.reading.body)}</aside><div class="economicsClosing"><h2>${escape(c.closing.title)}</h2><p>${escape(c.closing.body)}</p></div>`;
  hub.appendChild(overview);
  hub.appendChild(retained.find(([key]) => key === 'cemetery')[1]);
  hub.appendChild(retained.find(([key]) => key === 'next')[1]);
  // A four-link recovery path remains visible without JavaScript. Original IDs
  // are present in the native HTML, while the early router sends ordinary old
  // links directly to the complete block in its new page.
  const fallback = document.createElement('nav');
  fallback.className = 'economicsLegacy';
  fallback.setAttribute('aria-label', c.pathways.title);
  fallback.innerHTML = `<p>${escape(c.pathways.lead)}</p><ul>${c.pathways.items.map(item => `<li data-economics-destination="${item.slug}">${Object.entries(anchors).filter(([,slug]) => slug === item.slug).map(([id]) => `<span class="economicsLegacyAnchor" id="${escape(id)}" aria-hidden="true"></span>`).join('')}${link(targetURL(item.slug),item.title)}</li>`).join('')}</ul>`;
  hub.appendChild(fallback);
  // Update the three retained brief links, without changing their wording.
  for (const a of hub.querySelectorAll('a[href]')) {
    const url = new URL(a.getAttribute('href'), pub.deployment + sourcePath);
    const id = decodeURIComponent(url.hash.slice(1));
    if (url.origin === new URL(pub.deployment).origin && anchors[id] && anchors[id] !== 'hub') {
      a.setAttribute('href', relative(sourcePath, targetURL(anchors[id], id)));
      a.removeAttribute('data-open-section'); a.removeAttribute('data-open-anchor');
    }
  }
  assert.equal(original.outerHTML, untouched, 'Extraction must not mutate native source');
  const pages = keys.map(key => ({key, title: c.pathways.items.find(x => x.slug === key).title, description: c.pathways.items.find(x => x.slug === key).body, node: pageNodes[key]}));
  const inventory = {
    sourceFile: sourcePath,
    anchors,
    blocks: blocks.map(({node, ...block}) => block),
    replacedNavigation: [
      {selector: ':scope > #economics-reading-guide', reason: 'The six-step orientation is replaced by four complete reading paths.'},
      {selector: ':scope > .sectionToc', reason: 'The six in-page navigation links are replaced by links to the four complete chapters; every old fragment remains mapped.'}
    ],
    summary: {originalIds: original.querySelectorAll('[id]').length, originalLinks: original.querySelectorAll('a[href]').length, protectedLinks: blocks.reduce((sum,b) => sum+b.before.links.length,0), explorerActions: original.querySelectorAll('[data-economic-explore]').length, replacedNavigationLinks: source.querySelector(':scope > .sectionToc').querySelectorAll('a').length, tables: original.querySelectorAll('table').length, models: original.querySelectorAll('.economicModel').length, cases: original.querySelectorAll('.economicCase').length, metrics: original.querySelectorAll('.economicMetric').length}
  };
  return {hub, pages, redirects: anchors, inventory};
}

function build() {
  const inventory = {schemaVersion: 1, siteVersion: pub.version, baseCommit: BASELINE, locales: {}};
  for (const [lang, file] of [['en','index.html'], ...languages.map(l => [l,`${l}/index.html`])]) {
    const source = fs.readFileSync(path.join(root,file), 'utf8');
    const {document} = parseHTML(source);
    const untouched = new Map([...document.querySelectorAll('section.section')].filter(n => n.id !== 'economics').map(n => [n.id,n.outerHTML]));
    const result = splitEconomics(document, lang, {sourcePath:file});
    document.getElementById('economics').replaceWith(result.hub);
    const style = document.createElement('link'); style.rel='stylesheet'; style.href=relative(file,`${pub.deployment}assets/economics-hub.css?v=${pub.version}`); document.head.appendChild(style);
    const data = document.createElement('script'); data.type='application/json'; data.id='economics-route-data'; data.textContent=json({language:lang, anchors:result.redirects});
    const script = document.createElement('script'); script.setAttribute('defer',''); script.src=relative(file,`${pub.deployment}assets/economics-routing.js?v=${pub.version}`);
    // Run compatibility navigation before the native router can consume a hash.
    const first = document.querySelector('script[src]'); first.before(data,script);
    document.documentElement.setAttribute('data-ctd-root', file === 'index.html' ? './' : '../');
    for (const [id,html] of untouched) assert.equal(document.getElementById(id)?.outerHTML,html,`Unexpected change outside Economics: ${file}#${id}`);
    fs.writeFileSync(path.join(root,file),document.toString());
    if (file !== 'index.html') {
      for (const block of result.inventory.blocks) {
        const targetDoc = block.destination === 'hub' ? document : parseHTML(fs.readFileSync(path.join(root,block.destinationPath),'utf8')).document;
        const scope = block.destination === 'hub' ? targetDoc.getElementById('economics') : targetDoc.querySelector('.economicsDetail');
        const n = scope.querySelector(block.destinationSelector);
        block.after = snapshot(n,{lang,pagePath:block.destinationPath,anchors:result.redirects});
        assert.deepEqual(block.after,block.before,`${lang}/${block.key}: published content changed during relocation`);
      }
      inventory.locales[lang] = result.inventory;
    }
  }
  fs.writeFileSync(path.join(root,'data/economics-preservation.json'), JSON.stringify(inventory,null,2)+'\n');
  console.log('ECONOMICS_HUB_RENDERED '+JSON.stringify({nativePages:5,detailPages:16,languages:4,models:8,cases:8,tables:7,inventory:'data/economics-preservation.json'}));
}
module.exports={splitEconomics,snapshot,canonicalLink};
if(require.main===module)build();
