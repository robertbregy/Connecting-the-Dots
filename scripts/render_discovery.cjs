/* Publish focused, citable reading pages from the existing atlas and its real
 * Explorer renderer. No external data, factual rewrites, or archival mutations.
 * Run after all native editorial/reader build steps. --dry-run writes nothing.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const {parseHTML} = require('linkedom');
const {splitEconomics} = require('./render_economics_hub.cjs');

const root = path.resolve(__dirname, '..');
const pub = JSON.parse(fs.readFileSync(path.join(root, 'publication.json'), 'utf8'));
const dict = JSON.parse(fs.readFileSync(path.join(root, 'data/translations.json'), 'utf8'));
const base = pub.deployment;
const languages = ['en', 'it', 'de', 'fr'];
const names = {en: 'English', it: 'Italiano', de: 'Deutsch', fr: 'Français'};
const locale = {en: 'en_US', it: 'it_IT', de: 'de_DE', fr: 'fr_FR'};
const guides = ['how', 'timeline', 'cities', 'economics', 'lugano', 'beyond', 'legal'];
// Deliberately bounded first edition: every selected record already has a
// documented history or editorial context; no automatically padded SEO pages.
const profiles = ['ai', 'lugano', 'amazon', 'music', 'berlin', 'zuerich', 'swiss', 'com', 'cat', 'io'];
const areas = [
  ['understand', 'iaNavUnderstand'], ['explore', 'iaNavExplore'],
  ['stories', 'iaNavStories'], ['outcomes', 'iaNavOutcomes'],
  ['round', 'iaNavRound'], ['research', 'iaNavResearch']
];
const guideAreas = {how: 'understand', beyond: 'understand', timeline: 'explore', cities: 'stories', economics: 'stories', lugano: 'round', legal: 'outcomes'};
const economicsWords = {
  en: {label: 'Domain economics', overview: 'Economics overview', interactive: 'Open economics in the interactive atlas', casesIndex: 'Go to a case', navigation: 'Explore domain economics', reading: 'Explore the economics', share: 'Share this page', copied: 'Link copied', copyManually: 'Copy the address from your browser to share this page.'},
  it: {label: 'Economia dei domini', overview: 'Panoramica sull’economia', interactive: 'Apri l’economia nell’atlante interattivo', casesIndex: 'Vai a un caso', navigation: 'Esplora l’economia dei domini', reading: 'Approfondisci l’economia', share: 'Condividi questa pagina', copied: 'Link copiato', copyManually: 'Copia l’indirizzo dal browser per condividere questa pagina.'},
  de: {label: 'Domainökonomie', overview: 'Wirtschaftlicher Überblick', interactive: 'Wirtschaft im interaktiven Atlas öffnen', casesIndex: 'Direkt zu einem Fall', navigation: 'Domainökonomie erkunden', reading: 'Wirtschaftliche Zusammenhänge vertiefen', share: 'Diese Seite teilen', copied: 'Link kopiert', copyManually: 'Kopieren Sie die Adresse aus Ihrem Browser, um diese Seite zu teilen.'},
  fr: {label: 'Économie des domaines', overview: 'Vue d’ensemble de l’économie', interactive: 'Ouvrir l’économie dans l’atlas interactif', casesIndex: 'Aller à un cas', navigation: 'Explorer l’économie des domaines', reading: 'Approfondir l’économie', share: 'Partager cette page', copied: 'Lien copié', copyManually: 'Copiez l’adresse depuis votre navigateur pour partager cette page.'}
};
const words = {
  en: {home: 'Home', index: 'Guides and profiles', indexDescription: 'Read the main Connecting the Dots guides and selected domain profiles, with dated evidence, original sources and links to the interactive atlas.', guide: 'Guide', profile: 'Domain profile', profileTitle: 'history, status and sources', open: 'Explore in the atlas', chapterList: 'Read a guide', profileList: 'Explore a name', edition: 'Site edition', evidence: 'Observation dates are stated beside the evidence. This site edition does not imply that every source was checked again on this date.', citation: 'Method and citation', text: 'Text version', related: 'Continue reading', sources: 'Sources and data', jump: 'Skip to content', selected: 'Selected profiles', selection: 'These profiles cover documented economic, cultural, geographic and governance cases. The interactive Explorer contains the full catalogue.', observed: 'Status observed on', author: 'By Robert Bregy', filters: 'Use the interactive atlas to filter and compare these records.'},
  it: {home: 'Home', index: 'Guide e schede', indexDescription: 'Leggi le guide principali di Connecting the Dots e una selezione di schede sui domini, con evidenze datate, fonti originali e collegamenti all’atlante interattivo.', guide: 'Guida', profile: 'Scheda del dominio', profileTitle: 'storia, stato e fonti', open: 'Esplora nell’atlante', chapterList: 'Leggi una guida', profileList: 'Esplora un nome', edition: 'Edizione del sito', evidence: 'Le date di osservazione sono indicate accanto alle evidenze. Questa edizione del sito non implica una nuova verifica di tutte le fonti nella stessa data.', citation: 'Metodo e citazione', text: 'Versione testuale', related: 'Continua a leggere', sources: 'Fonti e dati', jump: 'Vai al contenuto', selected: 'Schede selezionate', selection: 'Queste schede raccontano casi documentati di economia, cultura, geografia e governance. L’Explorer interattivo contiene il catalogo completo.', observed: 'Stato osservato al', author: 'Di Robert Bregy', filters: 'Usa l’atlante interattivo per filtrare e confrontare questi record.'},
  de: {home: 'Startseite', index: 'Leitfäden und Profile', indexDescription: 'Die wichtigsten Leitfäden von Connecting the Dots und ausgewählte Domainprofile: datierte Belege, Originalquellen und Verbindungen zum interaktiven Atlas.', guide: 'Leitfaden', profile: 'Domainprofil', profileTitle: 'Geschichte, Status und Quellen', open: 'Im Atlas erkunden', chapterList: 'Einen Leitfaden lesen', profileList: 'Einen Namen erkunden', edition: 'Ausgabe der Website', evidence: 'Beobachtungsdaten stehen bei den jeweiligen Belegen. Diese Website-Ausgabe bedeutet nicht, dass alle Quellen an diesem Tag erneut überprüft wurden.', citation: 'Methode und Zitieren', text: 'Textversion', related: 'Weiterlesen', sources: 'Quellen und Daten', jump: 'Zum Inhalt', selected: 'Ausgewählte Profile', selection: 'Diese Profile zeigen dokumentierte Fälle aus Wirtschaft, Kultur, Geografie und Governance. Der interaktive Explorer enthält den vollständigen Katalog.', observed: 'Status beobachtet am', author: 'Von Robert Bregy', filters: 'Im interaktiven Atlas können Sie diese Datensätze filtern und vergleichen.'},
  fr: {home: 'Accueil', index: 'Guides et fiches', indexDescription: 'Les principaux guides de Connecting the Dots et une sélection de fiches de domaines, avec des preuves datées, les sources originales et des liens vers l’atlas interactif.', guide: 'Guide', profile: 'Fiche du domaine', profileTitle: 'histoire, statut et sources', open: 'Explorer dans l’atlas', chapterList: 'Lire un guide', profileList: 'Explorer un nom', edition: 'Édition du site', evidence: 'Les dates d’observation figurent à côté des preuves. Cette édition du site ne signifie pas que toutes les sources ont été vérifiées à nouveau à cette date.', citation: 'Méthode et citation', text: 'Version texte', related: 'Poursuivre la lecture', sources: 'Sources et données', jump: 'Aller au contenu', selected: 'Fiches sélectionnées', selection: 'Ces fiches présentent des cas documentés d’économie, de culture, de géographie et de gouvernance. L’Explorer interactif contient le catalogue complet.', observed: 'Statut observé le', author: 'Par Robert Bregy', filters: 'Utilisez l’atlas interactif pour filtrer et comparer ces données.'}
};
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
const plain = value => String(value || '').replace(/\s+/g, ' ').trim();
const json = value => JSON.stringify(value).replace(/</g, '\\u003c');
const localizedDate = (date, lang) => new Intl.DateTimeFormat(lang, {year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'}).format(new Date(date + 'T00:00:00Z'));
const route = (kind, lang, key) => kind === 'guide' ? `guides/${lang}/${key}/` : kind === 'tld' ? `tlds/${lang}/${key}/` : kind === 'economics' ? `economics/${lang}/${key}/` : `discovery/${lang}/`;
const relative = (from, to) => {
  if (!to.startsWith(base)) return to;
  const u = new URL(to), target = u.pathname.slice(new URL(base).pathname.length);
  const rel = path.posix.relative(from.replace(/\/$/, ''), target.replace(/\/$/, '')) || '.';
  return rel + (u.pathname.endsWith('/') ? '/' : '') + u.search + u.hash;
};
const outputs = new Map();
const pages = [];

function styleBlocks(document) {
  return [...document.querySelectorAll('head style')]
    .filter(n => ['city-namespace-style', 'tld-cultural-style', 'tld-market-style', 'audit-20261019-style'].includes(n.id))
    .map(n => n.outerHTML).join('\n');
}

function normalizeLinks(node, lang, currentPath, sourceDocument, options = {}) {
  const sourceURL = base + lang + '/';
  const localIds = new Set([node.id, ...[...node.querySelectorAll('[id]')].map(n => n.id)].filter(Boolean));
  for (const element of node.querySelectorAll('[href],[src]')) {
    for (const attr of ['href', 'src']) {
      let raw = element.getAttribute(attr);
      if (!raw || /^(mailto:|tel:|data:)/i.test(raw)) continue;
      if (/^javascript:/i.test(raw)) throw new Error('Unexpected script URL in reading content');
      let url = new URL(raw, sourceURL);
      if (attr === 'href' && url.href.startsWith(base)) {
        const tail = url.pathname.slice(new URL(base).pathname.length);
        const targetLang = /^(en|it|de|fr)\/$/.exec(tail)?.[1] || /^guides\/(en|it|de|fr)\/economics\/$/.exec(tail)?.[1] || lang;
        const name = (url.searchParams.get('tld') || '').replace(/^\./, '').toLowerCase();
        let chapter = url.searchParams.get('tab');
        const native = ['', ...languages.map(l => l + '/')].includes(tail);
        const oldEconomicsGuide = /^guides\/(en|it|de|fr)\/economics\/$/.test(tail);
        const fragment = decodeURIComponent(url.hash.slice(1));
        const destination = options.economicsRedirects?.[fragment];
        if ((native || oldEconomicsGuide) && destination && destination !== 'hub') {
          const previous = url;
          url = new URL(route('economics', targetLang, destination), base);
          url.hash = previous.hash;
          if (destination === 'market') for (const key of ['market', 'origin', 'mq', 'marketall']) {
            if (previous.searchParams.has(key)) url.searchParams.set(key, previous.searchParams.get(key));
          }
          if (url.pathname === new URL(base + currentPath).pathname && localIds.has(fragment)) {
            element.setAttribute(attr, url.search + url.hash); continue;
          }
          element.setAttribute(attr, relative(currentPath, url.href)); continue;
        }
        if (!chapter && url.hash) {
          const id = decodeURIComponent(url.hash.slice(1));
          if (localIds.has(id)) { element.setAttribute(attr, '#' + id); continue; }
          chapter = sourceDocument.getElementById(id)?.closest('section[id]')?.id;
        }
        if (native) {
          // Economic case links open the real Explorer profile and preserve its
          // preset, instead of silently replacing the interactive destination.
          if (name && profiles.includes(name) && url.searchParams.get('preset') !== 'economics') url = new URL(route('tld', targetLang, name), base);
          else if (chapter && guides.includes(chapter)) {
            const hash = url.hash;
            url = new URL(route('guide', targetLang, chapter), base);
            url.hash = hash;
          }
        }
        if (url.pathname === new URL(base + currentPath).pathname && url.hash && localIds.has(decodeURIComponent(url.hash.slice(1)))) {
          element.setAttribute(attr, url.hash); continue;
        }
      }
      element.setAttribute(attr, relative(currentPath, url.href));
    }
  }
}

function replaceEmptyTimelineFilter(node, lang, currentPath, interactive) {
  const location = `${lang}/timeline`;
  assert.equal(node.querySelectorAll('#tld-cultural-results').length, 1, `Expected one cultural filter result marker: ${location}`);
  assert.equal(node.querySelectorAll('#tld-cultural-records').length, 1, `Expected one cultural filter body: ${location}`);
  const results = node.querySelector('#tld-cultural-results');
  const records = node.querySelector('#tld-cultural-records');
  const wrapper = results.nextElementSibling;
  const table = wrapper?.querySelector('table');
  const limit = wrapper?.nextElementSibling;
  const fallback = limit?.nextElementSibling;
  assert.ok(results.parentElement.classList.contains('tldResearch'), `Unexpected cultural filter parent: ${location}`);
  assert.equal(plain(results.textContent), '', `Refusing to remove populated filter results: ${location}`);
  assert.equal(results.children.length, 0, `Refusing to remove structured filter results: ${location}`);
  assert.ok(wrapper?.classList.contains('tldTable') && wrapper.children.length === 1 && table?.contains(records), `Unexpected cultural filter table: ${location}`);
  assert.equal(records.tagName, 'TBODY', `Unexpected cultural record container: ${location}`);
  assert.equal(records.children.length, 0, `Refusing to remove cultural record rows: ${location}`);
  assert.equal(plain(records.textContent), '', `Refusing to remove cultural record data: ${location}`);
  assert.equal(table.querySelectorAll('tr').length, 1, `Only the empty filter header may be removed: ${location}`);
  assert.equal(table.querySelectorAll('th').length, 3, `Unexpected cultural filter header: ${location}`);
  assert.equal(table.querySelectorAll('td,tfoot').length, 0, `Refusing to remove cultural table data: ${location}`);
  assert.ok(limit?.tagName === 'P' && limit.classList.contains('small') && limit.children.length === 0 && /\b60\b/.test(limit.textContent) && /\bCSV\b/.test(limit.textContent), `Unexpected filter limit placeholder: ${location}`);
  assert.ok(fallback?.tagName === 'NOSCRIPT' && fallback.children.length === 1 && fallback.firstElementChild.tagName === 'P' && /JavaScript/.test(fallback.textContent), `Unexpected cultural filter fallback: ${location}`);
  for (const element of [results, wrapper, limit, fallback]) {
    assert.equal(element.querySelectorAll('a,[href],[src],dl,ul,ol').length, 0, `Refusing to remove links or evidence from filter UI: ${location}`);
  }
  // Protect every aggregate table, actual data row, method disclosure and link.
  // The removed table consists solely of its three-column header and empty body.
  const evidence = () => ({
    tables: [...node.querySelectorAll('table')].filter(element => element !== table).map(element => element.outerHTML),
    rows: [...node.querySelectorAll('tbody tr,tfoot tr')].map(element => element.outerHTML),
    methods: [...node.querySelectorAll('details')].map(element => element.outerHTML),
    links: [...node.querySelectorAll('a[href]')].map(element => element.outerHTML)
  });
  const before = evidence();
  const paragraph = node.ownerDocument.createElement('p');
  paragraph.className = 'small';
  results.replaceWith(paragraph);
  for (const element of [wrapper, limit, fallback]) element.remove();
  assert.deepEqual(evidence(), before, `Timeline evidence changed while replacing empty UI: ${location}`);
  const link = node.ownerDocument.createElement('a');
  link.textContent = words[lang].filters;
  link.setAttribute('href', relative(currentPath, interactive));
  paragraph.appendChild(link);
}

function prepareContent(node, lang, key, currentPath, sourceDocument, options = {}) {
  const interactive = `${base}${lang}/?tab=${key}#${key}`;
  const marketControl = n => options.market && n.closest('#tld-market-reach') && (n.closest('.marketViews,.marketFilters') || n.id === 'market-more');
  for (const n of node.querySelectorAll(options.economics ? 'script,style' : 'script,style,.readerTrail,.readerNext,.tldControls')) n.remove();
  if (!options.market) for (const n of node.querySelectorAll('.marketViews,.marketFilters,#market-more')) n.remove();
  for (const n of node.querySelectorAll('input,select,textarea')) if (!marketControl(n)) (n.closest('label') || n).remove();
  for (const n of node.querySelectorAll('button')) {
    if (marketControl(n)) continue;
    const target = n.getAttribute('data-economic-explore') || n.getAttribute('data-governance-explore') || n.getAttribute('data-explorer-string');
    if (n.hasAttribute('hidden')) { n.remove(); continue; }
    const a = node.ownerDocument.createElement('a');
    a.className = n.className;
    a.textContent = n.textContent;
    a.setAttribute('href', target ? `${base}${lang}/?tab=explore${n.hasAttribute('data-economic-explore') ? '&preset=economics' : ''}&tld=${encodeURIComponent(target.replace(/^\./, ''))}` : interactive);
    if (n.hasAttribute('data-economic-explore')) a.setAttribute('data-economic-explore', target);
    const label = n.getAttribute('aria-label');
    if (label) a.setAttribute('aria-label', label);
    n.replaceWith(a);
  }
  for (const n of [node, ...node.querySelectorAll('*')]) {
    for (const name of n.getAttributeNames()) if (/^on/i.test(name) || ['data-i18n', 'data-i18n-placeholder', 'data-open-section', 'data-open-anchor', 'data-reader-ui'].includes(name)) n.removeAttribute(name);
    if (n.getAttribute('role') === 'tab' || n.getAttribute('role') === 'tabpanel') n.removeAttribute('role');
  }
  node.classList.remove('section', 'active');
  node.classList.add('discoveryContent');
  node.removeAttribute('hidden');
  for (const n of node.querySelectorAll('[data-market-panel]')) n.removeAttribute('hidden');
  if (options.market) {
    for (const n of node.querySelectorAll('[data-market-tld]')) n.removeAttribute('hidden');
    for (const n of node.querySelectorAll('.marketViews,.marketFilters,#market-more')) n.setAttribute('hidden', '');
  }
  normalizeLinks(node, lang, currentPath, sourceDocument, options);
  // Create this CTA after normalization so it keeps the interactive destination.
  if (key === 'timeline') replaceEmptyTimelineFilter(node, lang, currentPath, interactive);
  return node;
}

function markdown(main, pageURL) {
  const escCell = s => s.replace(/\|/g, '\\|').replace(/\s*\n\s*/g, ' ').trim();
  function render(node) {
    if (node.nodeType === 3) return node.textContent.replace(/\s+/g, ' ');
    if (node.nodeType !== 1) return '';
    const tag = node.tagName.toLowerCase();
    if (['script', 'style'].includes(tag) || (tag === 'nav' && !node.classList.contains('economicsPathways')) || node.hasAttribute('hidden')) return '';
    // Decorative arrows can disappear, but a visual separator between names
    // still needs a word boundary in text (.io .ac .sh, never .io.ac.sh).
    if (node.getAttribute('aria-hidden') === 'true') return ' ';
    const inner = () => [...node.childNodes].map(render).join('');
    if (/^h[1-6]$/.test(tag)) return '\n\n' + '#'.repeat(Number(tag[1])) + ' ' + plain(inner()) + '\n\n';
    if (tag === 'a' && (node.classList.contains('discoveryCard') || node.hasAttribute('data-economics-path'))) {
      const heading = node.querySelector('h3');
      const description = node.querySelector('p');
      return '\n\n### [' + plain(heading.textContent) + '](' + new URL(node.getAttribute('href'), pageURL).href + ')\n\n' + plain(description.textContent) + '\n\n';
    }
    if (tag === 'a') return '[' + plain(inner()).replace(/[\[\]]/g, '\\$&') + '](' + new URL(node.getAttribute('href') || '', pageURL).href.replace(/\(/g, '%28').replace(/\)/g, '%29') + ') ';
    // CSS separates badges and values visually; preserve that separation in
    // plain text too. The domain illustration's .fade span is intentionally
    // contiguous (www.example.com).
    if ((tag === 'span' && !node.classList.contains('fade')) || tag === 'small') return ' ' + inner().trim() + ' ';
    if (tag === 'bdi' && (node.classList.contains('ianaHostname') || node.classList.contains('ianaAddress'))) return inner() + ' ';
    if (tag === 'br') return '\n';
    if (tag === 'strong' || tag === 'b') return '**' + plain(inner()) + '**';
    if (tag === 'code') return '`' + node.textContent.replace(/`/g, '') + '`';
    if (tag === 'img') return node.getAttribute('alt') ? '\n' + node.getAttribute('alt') + '\n' : '';
    if (tag === 'svg') return node.getAttribute('aria-label') || plain(node.querySelector('title')?.textContent || '');
    if (tag === 'table') {
      const rows = [...node.querySelectorAll('tr')].map(tr => [...tr.children].filter(c => ['TH', 'TD'].includes(c.tagName)).map(c => escCell([...c.childNodes].map(render).join(''))));
      if (!rows.length) return '';
      const width = Math.max(...rows.map(r => r.length));
      const line = cells => '| ' + [...cells, ...Array(width - cells.length).fill('')].join(' | ') + ' |';
      return '\n\n' + (node.querySelector('caption') ? plain(node.querySelector('caption').textContent) + '\n\n' : '') + line(rows[0]) + '\n' + line(Array(width).fill('---')) + '\n' + rows.slice(1).map(line).join('\n') + '\n\n';
    }
    if (tag === 'li') return '\n- ' + inner().trim() + '\n';
    if (tag === 'dt') return '\n**' + plain(inner()) + ':** ';
    if (tag === 'dd') return inner().trim() + '\n';
    if (tag === 'summary') return '\n\n**' + plain(inner()) + '**\n\n';
    if (['p', 'div', 'article', 'section', 'aside', 'ul', 'ol', 'dl', 'details'].includes(tag)) return '\n\n' + inner().trim() + '\n\n';
    return inner();
  }
  return render(main).replace(/[ \t]{2,}/g, ' ').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
}

function pageShell(meta, body, sourceDocument, options = {}) {
  const {language: lang, kind, key} = meta;
  const w = words[lang], t = dict[lang], canonical = base + meta.path;
  const economics = kind === 'economics', economicsHub = kind === 'guide' && key === 'economics';
  const ew = economicsWords[lang];
  const rel = to => relative(meta.path, to.startsWith(base) ? to : base + to);
  const theme = '<script>try{var t=localStorage.getItem("dotTheme");if(t==="dark"||t==="light")document.documentElement.dataset.theme=t}catch(e){}</script>';
  const alternate = [...languages, 'x-default'].map(l => `<link rel="alternate" hreflang="${l}" href="${base}${route(kind, l === 'x-default' ? 'en' : l, key)}">`).join('\n');
  const crumbs = [{name: w.home, item: base + lang + '/'}];
  if (kind !== 'index') crumbs.push({name: w.index, item: base + route('index', lang)});
  if (economics) crumbs.push({name: ew.label, item: base + route('guide', lang, 'economics')});
  crumbs.push({name: meta.headline, item: canonical});
  const structured = {
    '@context': 'https://schema.org', '@graph': [
      {'@type': kind === 'index' ? 'CollectionPage' : 'WebPage', '@id': canonical + '#page', url: canonical, name: meta.headline, description: meta.description,
        inLanguage: lang, dateModified: pub.releasedOn, isAccessibleForFree: true,
        author: {'@type': 'Person', '@id': base + '#author', name: 'Robert Bregy', url: 'https://github.com/robertbregy'},
        isPartOf: {'@type': 'WebSite', '@id': base + '#website', name: 'Connecting the Dots', url: base},
        mainEntity: kind === 'tld' ? {'@type': 'Thing', '@id': canonical + '#domain', name: '.' + key} : undefined,
        citation: options.sources || [],
        image: base + 'assets/og-preview.png'},
      {'@type': 'BreadcrumbList', itemListElement: crumbs.map((c, i) => ({'@type': 'ListItem', position: i + 1, name: c.name, item: c.item}))}
    ]
  };
  const heading = `<div class="discoveryHero"><p class="discoveryEyebrow">${escape(kind === 'index' ? 'Connecting the Dots' : economics ? ew.label : kind === 'guide' ? w.guide : w.profile)}</p><h1 id="discovery-title">${escape(meta.headline)}</h1><p class="discoveryLead">${escape(meta.description)}</p>${options.observed ? `<p class="discoveryObserved">${escape(w.observed)} <time datetime="${escape(options.observed)}">${escape(localizedDate(options.observed, lang))}</time></p>` : ''}<div class="discoveryActions"><a class="discoveryPrimary" data-discovery-interactive href="${escape(rel(meta.interactiveUrl))}">${escape(economics ? ew.interactive : w.open)} <span aria-hidden="true">→</span></a><a href="${escape(rel('research/'))}">${escape(w.citation)}</a><a href="index.md" type="text/markdown">${escape(w.text)}</a>${economics ? `<button id="economics-share" type="button" data-economics-share hidden>${escape(ew.share)}</button><span id="economics-share-status" role="status" aria-live="polite"></span>` : ''}</div></div>`;
  const economicsNav = economics ? `<nav class="economicsPageNav" aria-label="${escape(ew.navigation)}"><a class="economicsOverviewLink" href="${rel(route('guide', lang, 'economics'))}">${escape(ew.overview)}</a><div>${options.economicsPages.map(page => `<a href="${rel(route('economics', lang, page.key))}"${page.key === key ? ' aria-current="page"' : ''}>${escape(page.title)}</a>`).join('')}</div></nav>` : '';
  const economicsHead = economicsHub ? `<link rel="stylesheet" href="${rel('assets/economics-hub.css')}?v=${pub.version}"><script type="application/json" id="economics-route-data">${json({language: lang, anchors: options.economicsRedirects})}</script><script src="${rel('assets/economics-routing.js')}?v=${pub.version}" defer></script>` : economics ? `<script type="application/json" id="economics-page-labels">${json(ew)}</script>${options.marketPayload ? `<script type="application/json" id="rsp-footprint-data">${json(options.marketPayload)}</script><script src="${rel('assets/tld-market.js')}?v=${pub.version}" defer></script>` : ''}<script src="${rel('assets/economics-pages.js')}?v=${pub.version}" defer></script>` : '';
  const output = `<!DOCTYPE html>
<html lang="${lang}" class="no-js" data-reader-first="1" data-ctd-root="${rel('')}"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="index,follow,max-image-preview:large"><meta name="author" content="Robert Bregy"><meta name="ctd-version" content="${pub.version}">
<title>${escape(meta.title)}</title><meta name="description" content="${escape(meta.description)}"><link rel="canonical" href="${canonical}">
${alternate}
<link rel="alternate" type="text/markdown" href="${base}${meta.markdownPath}" title="${escape(w.text)}"><link rel="describedby" href="${base}llms.txt" type="text/plain"><link rel="icon" href="${rel('assets/logo-mark.png')}" type="image/png">
<meta property="og:type" content="${kind === 'index' ? 'website' : 'article'}"><meta property="og:site_name" content="Connecting the Dots"><meta property="og:title" content="${escape(meta.title)}"><meta property="og:description" content="${escape(meta.description)}"><meta property="og:url" content="${canonical}"><meta property="og:locale" content="${locale[lang]}"><meta property="og:image" content="${base}assets/og-preview.png"><meta property="og:image:alt" content="${escape(t.metaSocialImageAlt)}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escape(meta.title)}"><meta name="twitter:description" content="${escape(meta.description)}"><meta name="twitter:image" content="${base}assets/og-preview.png">
<script type="application/ld+json">${json(structured)}</script>${theme}
<link rel="stylesheet" href="${rel('assets/style.css')}?v=${pub.version}"><link rel="stylesheet" href="${rel('assets/audience.css')}?v=${pub.version}"><link rel="stylesheet" href="${rel('assets/reader-first.css')}?v=${pub.version}">
${styleBlocks(sourceDocument)}
<link rel="stylesheet" href="${rel('assets/discovery.css')}?v=${pub.version}">
<script src="${rel('assets/discovery-controls.js')}?v=${pub.version}" defer></script>
${economicsHead}
</head><body class="discoveryPage${economics ? ' economicsPage' : ''}" data-build="${pub.version}"${economics ? ` data-economics-page="${key}"` : ''}>
<a class="discoverySkip" href="#main-content">${escape(w.jump)}</a>
<header class="topbar"><div class="topinner"><a class="brand" href="${rel(lang + '/')}" aria-label="${escape('Connecting the Dots · ' + w.home)}"><img src="${rel('assets/logo-mark.png')}" alt="" width="34" height="34"><span>Connecting the Dots</span></a><div class="discoveryControls"><nav class="discoveryLanguages" aria-label="${escape(t.languageVersions)}">${languages.map(l => `<a href="${rel(route(kind, l, key))}" hreflang="${l}" lang="${l}"${economics ? ` data-language="${l}"` : ''}${l === lang ? ' aria-current="page"' : ''}>${names[l]}</a>`).join('')}</nav><button class="control discoveryTheme" id="themeBtn" data-discovery-theme type="button" aria-label="${escape(t.themeLabel)}" title="${escape(t.themeLabel)}" aria-pressed="false" hidden><svg aria-hidden="true" class="themeIcon" viewBox="0 0 24 24" width="20" height="20"><circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 1 0 16Z" fill="currentColor" stroke="none"/></svg></button></div></div></header>
<nav class="discoveryNav" aria-label="${escape(t.sectionNavLabel)}">${areas.map(([area, label]) => `<a href="${rel(`${lang}/?tab=ia-${area}#ia-${area}`)}"${area === (economics ? 'stories' : kind === 'guide' ? guideAreas[key] : 'explore') ? ' aria-current="location"' : ''}>${escape(t[label])}</a>`).join('')}</nav>
<nav class="discoveryTrail" aria-label="${escape(t.breadcrumbLabel)}">${crumbs.map((c, i) => `${i ? '<span aria-hidden="true">/</span>' : ''}${i === crumbs.length - 1 ? `<span aria-current="page">${escape(c.name)}</span>` : `<a href="${escape(rel(c.item))}">${escape(c.name)}</a>`}`).join('')}</nav>
${economicsNav}
<main id="main-content" class="discoveryMain" aria-labelledby="discovery-title" tabindex="-1">${heading}${body}<aside class="discoveryEdition"><p><strong>${escape(w.author)}</strong> · ${escape(w.edition)} ${pub.version} · <time datetime="${pub.releasedOn}">${escape(localizedDate(pub.releasedOn, lang))}</time></p><p>${escape(w.evidence)}</p></aside></main>
<footer class="discoveryFooter"><a href="${rel(route('index', lang))}">${escape(w.index)}</a><a href="${rel(`${lang}/?tab=resources#resources`)}">${escape(w.sources)}</a><a href="${rel('research/')}">${escape(w.citation)}</a><a href="${rel('CITATION.cff')}">CITATION.cff</a><a href="${rel('data/manifest.json')}">Manifest · JSON</a><a href="${rel('agent-catalog.json')}">Agent catalog · JSON</a><a href="${rel('llms.txt')}">llms.txt</a></footer>
</body></html>\n`;
  const {document} = parseHTML(output);
  assert.equal(document.querySelectorAll('h1').length, 1, `Exactly one H1 required: ${meta.path}`);
  assert.ok(document.querySelector('main').textContent.length > 400, `Empty reading page: ${meta.path}`);
  for (const control of document.querySelectorAll('main button,main input,main select,main textarea')) {
    const share = economics && control.matches('[data-economics-share]');
    const market = economics && key === 'market' && control.closest('#tld-market-reach') &&
      (control.closest('.marketViews,.marketFilters') || control.id === 'market-more');
    assert.ok(share || market, `Inert control on ${meta.path}: ${control.id || control.tagName}`);
  }
  outputs.set(meta.path + 'index.html', output);
  outputs.set(meta.markdownPath, `<!-- Canonical: ${canonical} | Site edition: ${pub.version} | Language: ${lang} -->\n\n` + markdown(document.querySelector('main'), canonical));
  pages.push(meta);
  return output;
}

function addCaseIndex(content, lang) {
  const cards = [...content.querySelectorAll('.economicCase[id^="econ-case-"]')];
  assert.equal(cards.length, 8, `The case index requires all eight documented cases: ${lang}`);
  const before = cards.map(card => card.outerHTML);
  assert.equal(content.querySelectorAll('#economics-case-index').length, 0, 'Case index must be inserted only once');
  const nav = content.ownerDocument.createElement('nav');
  nav.id = 'economics-case-index';
  nav.className = 'economicsCaseIndex';
  nav.setAttribute('aria-label', economicsWords[lang].casesIndex);
  nav.innerHTML = `<p>${escape(economicsWords[lang].casesIndex)}</p><ol>${cards.map(card => {
    const label = [plain(card.querySelector('.caseStrings')?.textContent), plain(card.querySelector('.mechanismPill')?.textContent)].filter(Boolean).join(' · ') || plain(card.querySelector('h3')?.textContent);
    assert.ok(label, `A case index entry needs a visible title: ${card.id}`);
    return `<li><a href="#${escape(card.id)}">${escape(label)}</a></li>`;
  }).join('')}</ol>`;
  content.insertBefore(nav, content.firstChild);
  assert.deepEqual(cards.map(card => card.outerHTML), before, 'Case navigation must preserve evidence bytes');
}

function createRuntime(language, sourceHTML) {
  const {document, HTMLElement} = parseHTML(sourceHTML);
  Object.defineProperty(HTMLElement.prototype, 'dataset', {configurable: true, get() {
    const element = this, attribute = key => 'data-' + key.replace(/[A-Z]/g, c => '-' + c.toLowerCase());
    return new Proxy({}, {get: (_, key) => typeof key === 'string' ? (element.getAttribute(attribute(key)) ?? undefined) : undefined, set: (_, key, value) => {element.setAttribute(attribute(key), String(value)); return true;}});
  }});
  HTMLElement.prototype.getBoundingClientRect = () => ({height: 62, width: 0, left: 0, top: 0, bottom: 62, right: 0});
  for (const select of document.querySelectorAll('select')) {
    Object.defineProperty(select, 'options', {get() {return this.querySelectorAll('option');}});
    Object.defineProperty(select, 'value', {get() {return (this.querySelector('option[selected]') || this.querySelector('option'))?.getAttribute('value') || '';}, set(value) {for (const o of this.querySelectorAll('option')) o.toggleAttribute('selected', o.getAttribute('value') === String(value));}});
  }
  document.documentElement.dataset.ctdLanguage = language;
  document.documentElement.lang = language;
  const url = new URL(base + language + '/');
  const location = {href: url.href, protocol: url.protocol, pathname: url.pathname, search: '', hash: ''};
  const window = {document, innerWidth: 1440, matchMedia: () => ({matches: false}), addEventListener: () => {}};
  const context = vm.createContext({window, document, location, navigator: {language}, localStorage: {getItem: () => null, setItem: () => {}}, history: {pushState: () => {}, replaceState: () => {}}, requestAnimationFrame: () => {}, setTimeout: () => 0, clearTimeout: () => {}, URL, URLSearchParams, Intl, console});
  const scripts = ['data/applications_2026_strings_reveal.js', 'data/site_bundle.js', 'data/i18n_bundle.js', 'data/worldmap.js', 'data/publication.js', 'assets/app.js'];
  for (const file of scripts) vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, {filename: file, timeout: 15000});
  const count = window.DOT_DATA.profileDelivery.shards;
  const shardPaths = Array.from({length: count}, (_, i) => `data/explorer_profiles_${i}.js`);
  for (const file of shardPaths) vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, {filename: file, timeout: 15000});
  return {context, document, sourcePaths: [...scripts, ...shardPaths]};
}

function economicCardEvidence(document) {
  const models = [...document.querySelectorAll('#economicModels .economicModel')].map(node => plain(node.textContent));
  const cases = [...document.querySelectorAll('#economicGrid .economicCase')].map(node => ({
    id: node.id,
    text: plain(node.textContent),
    sources: [...node.querySelectorAll('.caseSources a[href]')].map(anchor => anchor.getAttribute('href'))
  }));
  assert.equal(models.length, 8, 'Economics must retain eight complete economic models');
  assert.equal(cases.length, 8, 'Economics must retain eight complete case cards');
  return {models, cases};
}

async function build() {
  for (const lang of languages) {
    const sourcePath = lang + '/index.html';
    const sourceHTML = fs.readFileSync(path.join(root, sourcePath), 'utf8');
    const {document} = parseHTML(sourceHTML);
    const economics = splitEconomics(document, lang);
    assert.deepEqual(economics.pages.map(page => page.key), ['market', 'cases', 'portfolios', 'round-2026'], `Incomplete Economics pages in ${lang}`);
    const economicsOptions = {economicsRedirects: economics.redirects, economicsPages: economics.pages};
    for (const key of guides) {
      const original = key === 'economics' ? economics.hub : document.getElementById(key);
      assert.ok(original, `Missing source chapter ${lang}/${key}`);
      const section = original.cloneNode(true);
      const title = plain(section.getAttribute('data-reader-title') || section.querySelector('h2')?.textContent);
      const description = plain(section.querySelector('.readerLead')?.textContent);
      assert.ok(title && description, `Missing chapter metadata ${lang}/${key}`);
      const intro = section.querySelector('.readerIntro');
      // Retain the concise evidence note inside the introduction, without a
      // duplicate chapter title, lead or breadcrumb.
      if (intro) for (const n of intro.querySelectorAll('.readerChapterTitle,.readerLead,.readerTrail')) n.remove();
      const pagePath = route('guide', lang, key);
      prepareContent(section, lang, key, pagePath, document, economicsOptions);
      const sources = [...new Set([...section.querySelectorAll('a[href]')].map(a => a.getAttribute('href')).filter(h => /^https?:/.test(h) && !h.startsWith(base)))];
      pageShell({path: pagePath, language: lang, kind: 'guide', key, title: title + ' | Connecting the Dots', headline: title, description, sourcePath, sourceSection: key, interactiveUrl: `${base}${lang}/?tab=${key}#${key}`, markdownPath: pagePath + 'index.md'}, section.outerHTML, document, {...economicsOptions, sources});
    }
    const runtime = createRuntime(lang, sourceHTML);
    await vm.runInContext('Promise.resolve()', runtime.context);
    // The already-published static cards are the deliverable. Independently
    // compare their complete text and sources with the application's renderer.
    assert.deepEqual(economicCardEvidence(document), economicCardEvidence(runtime.document), `Static/runtime Economics evidence differs in ${lang}`);
    const extractedCards = document.createElement('div');
    for (const page of economics.pages) extractedCards.append(page.node.cloneNode(true));
    assert.deepEqual(economicCardEvidence(extractedCards), economicCardEvidence(document), `Economics cards were changed during the split in ${lang}`);
    for (const page of economics.pages) {
      const pagePath = route('economics', lang, page.key);
      const content = page.node.cloneNode(true);
      const market = page.key === 'market';
      prepareContent(content, lang, 'economics', pagePath, document, {...economicsOptions, market, economics: true});
      if (page.key === 'cases') addCaseIndex(content, lang);
      const sources = [...new Set([...content.querySelectorAll('a[href]')].map(anchor => anchor.getAttribute('href')).filter(href => /^https?:/.test(href) && !href.startsWith(base)))];
      assert.ok(sources.length, `Economics page without source evidence: ${lang}/${page.key}`);
      const marketPayload = market ? JSON.parse(document.getElementById('rsp-footprint-data').textContent) : null;
      if (market) {
        assert.ok(marketPayload.audience?.shown && marketPayload.audience?.showAll && marketPayload.audience?.showTen, 'Market control translations are missing');
        for (const key of ['web', 'zones']) assert.equal(content.querySelectorAll(`#market-${key} tbody tr`).length, 50, `Complete ${key} table is required without JavaScript`);
      }
      const sourceDataPaths = [sourcePath, 'src/index.web.html', 'publication.json', 'data/economics_hub.json', 'data/economics_reading_order.json', 'data/economic_cases.json', 'data/translations.json', 'data/audience_editorial.json', 'data/tld_market_snapshot.json', 'data/tld_market_provenance.json', 'data/aps_2026_current_analytics.json', 'data/aps_2026_current_analytics_manifest.json', 'data/round_application_fees.json', 'data/source_method_corrections_20261019.json', 'data/financial_source_verification_20261019.json', 'scripts/reorder_economics.cjs', 'scripts/reader_first.cjs', 'assets/app.js'];
      pageShell({path: pagePath, language: lang, kind: 'economics', key: page.key, title: page.title + ' | Connecting the Dots', headline: page.title, description: page.description, sourcePath: 'scripts/render_economics_hub.cjs', sourceDataPaths, interactiveUrl: `${base}${lang}/?tab=economics#economics`, markdownPath: pagePath + 'index.md'}, content.outerHTML, document, {...economicsOptions, sources, marketPayload});
    }
    for (const key of profiles) {
      const record = vm.runInContext(`cachedExplorerProfile(D.explorer.find(r => r.asciiString === ${JSON.stringify('.' + key)}))`, runtime.context);
      assert.ok(record, `Missing source profile .${key} in ${lang}`);
      runtime.context.discoveryRecord = record;
      vm.runInContext('renderExplorerRecord(discoveryRecord)', runtime.context);
      const content = runtime.document.getElementById('drawerContent').cloneNode(true);
      const description = plain(content.querySelector('.audienceBrief p')?.textContent || content.querySelector('.profileBriefText p')?.textContent);
      const pagePath = route('tld', lang, key);
      const observed = record.currentAsOf || record.provenanceDate || null;
      // Drawer sections sit below h1 in their own page. Promote the original
      // section/subsection headings together, preserving their hierarchy.
      for (const old of [...content.querySelectorAll('h3,h4')]) {
        const heading = content.ownerDocument.createElement(old.tagName === 'H3' ? 'h2' : 'h3');
        for (const a of old.attributes) heading.setAttribute(a.name, a.value);
        heading.innerHTML = old.innerHTML; old.replaceWith(heading);
      }
      content.removeAttribute('id'); content.className = 'discoveryProfile';
      prepareContent(content, lang, 'explore', pagePath, document, economicsOptions);
      const sources = [...new Set([...content.querySelectorAll('a[href]')].map(a => a.getAttribute('href')).filter(h => /^https?:/.test(h) && !h.startsWith(base)))];
      assert.ok(sources.length, `Profile without sources: ${key}`);
      const profileSourcePath = `data/explorer_profiles_${vm.runInContext(`D.explorer.find(r => r.asciiString === ${JSON.stringify('.' + key)}).profileShard`, runtime.context)}.js`;
      // Record the complete runtime input chain, including editorial cases in
      // site_bundle and the 2026 overlay; keep the precise profile shard explicit.
      const sourceDataPaths = [sourcePath, 'publication.json', 'data/translations.json', ...runtime.sourcePaths.filter(file => file !== 'assets/app.js')];
      pageShell({path: pagePath, language: lang, kind: 'tld', key, title: `.${key}: ${words[lang].profileTitle} | Connecting the Dots`, headline: record.string, description, sourcePath: 'assets/app.js', profileSourcePath, sourceDataPaths, interactiveUrl: `${base}${lang}/?tab=explore&tld=${encodeURIComponent(key)}`, markdownPath: pagePath + 'index.md', observationDate: observed}, content.outerHTML, document, {sources, observed});
    }
    const localized = pages.filter(p => p.language === lang), w = words[lang];
    const pagePath = route('index', lang);
    const cards = kind => localized.filter(p => p.kind === kind).map(p => `<a class="discoveryCard" href="${relative(pagePath, base + p.path)}"><h3>${escape(p.headline)}</h3><p>${escape(p.description)}</p><span aria-hidden="true">→</span></a>`).join('');
    const body = `<section class="discoveryGroup" aria-labelledby="discovery-guides"><h2 id="discovery-guides">${escape(w.chapterList)}</h2><div class="discoveryGrid">${cards('guide')}</div></section><section class="discoveryGroup" aria-labelledby="discovery-economics"><h2 id="discovery-economics">${escape(economicsWords[lang].reading)}</h2><div class="discoveryGrid">${cards('economics')}</div></section><section class="discoveryGroup" aria-labelledby="discovery-profiles"><h2 id="discovery-profiles">${escape(w.selected)}</h2><p class="discoverySelection">${escape(w.selection)}</p><div class="discoveryGrid discoveryProfiles">${cards('tld')}</div></section>`;
    pageShell({path: pagePath, language: lang, kind: 'index', key: 'index', title: w.index + ' | Connecting the Dots', headline: w.index, description: w.indexDescription, sourcePath, interactiveUrl: `${base}${lang}/?tab=ia-explore#ia-explore`, markdownPath: pagePath + 'index.md'}, body, document);
  }
  const manifest = {schemaVersion: 1, siteVersion: pub.version, generatedOn: pub.releasedOn, selection: {guideSections: guides, economicsSections: ['market', 'cases', 'portfolios', 'round-2026'], profileAsciiStrings: profiles.map(p => '.' + p), policy: 'A bounded selection of substantial, already documented chapters and profiles; evidence is copied from the existing atlas without changing its observation dates.'}, pages};
  outputs.set('discovery/manifest.json', JSON.stringify(manifest, null, 2) + '\n');
  if (!process.argv.includes('--dry-run')) for (const [file, content] of outputs) {
    const destination = path.join(root, file);
    fs.mkdirSync(path.dirname(destination), {recursive: true});
    fs.writeFileSync(destination, content);
  }
  console.log('DISCOVERY_RENDERED ' + JSON.stringify({pages: pages.length, guides: guides.length * languages.length, economics: 4 * languages.length, profiles: profiles.length * languages.length, indexes: languages.length, markdown: pages.length, siteVersion: pub.version, dryRun: process.argv.includes('--dry-run'), archivedResearchChanged: false}));
}
module.exports = {pageShell, addCaseIndex, markdown};
if (require.main === module) build().catch(error => {console.error(error); process.exitCode = 1;});
