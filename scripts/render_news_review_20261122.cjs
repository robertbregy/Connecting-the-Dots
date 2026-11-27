/* Dated, source-backed additions to existing chapters. Historical snapshots
   and research releases remain independent of this editorial observation. */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {parseHTML} = require('linkedom');

const root = path.resolve(__dirname, '..');
process.chdir(root);
const evidence = JSON.parse(fs.readFileSync('data/editorial_news_20261122.json', 'utf8'));
const translations = JSON.parse(fs.readFileSync('data/translations.json', 'utf8'));
const publication = JSON.parse(fs.readFileSync('publication.json', 'utf8'));
const helsinki = JSON.parse(fs.readFileSync('data/helsinki_followup_20261122.json', 'utf8')).lifecycleObservation;
assert.equal(evidence.schemaVersion, 1);
assert.equal(evidence.reviewedOn, '2026-11-22');
assert.equal(evidence.layer, 'dated-editorial-followup-outside-frozen-research-releases');
assert.ok(publication.releasedOn >= evidence.reviewedOn);
assert.equal(new Set(evidence.panels.map(item => item.id)).size, evidence.panels.length);
const escape = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const read = (lang, key) => {
  const value = translations[lang]?.[key];
  assert.ok(typeof value === 'string' && value.trim(), 'Missing reviewed translation: ' + lang + '/' + key);
  return escape(value);
};
const sourceLinks = (item, lang) => item.sources.map(source => {
  assert.ok(source.url.startsWith('https://'), 'News evidence needs an HTTPS source');
  return '<a class="sourceChip" href="' + escape(source.url) + '" target="_blank" rel="noopener noreferrer">' + read(lang, source.labelKey) + '</a>';
}).join('');

function panel(document, item, lang) {
  assert.ok(item.sources.length > 0, 'Unsourced editorial addition: ' + item.id);
  assert.ok(!document.getElementById(item.id), 'Duplicate news anchor: ' + item.id);
  const article = document.createElement('article');
  article.id = item.id;
  article.className = 'panel newsUpdate';
  article.setAttribute('data-news-review', evidence.reviewedOn);
  article.setAttribute('aria-labelledby', item.id + '-title');
  const subsections = (item.subsections || []).map(section => '<div><h4>' + read(lang, section.titleKey) + '</h4>' + section.bodyKeys.map(key => '<p>' + read(lang, key) + '</p>').join('') + '</div>').join('');
  article.innerHTML = '<p class="small">' + read(lang, 'news22ReviewedLabel') + ': <time datetime="2026-11-22">2026-11-22</time>' + (item.statusKey ? ' · ' + read(lang, item.statusKey) : '') + '</p>' +
    '<h3 id="' + item.id + '-title">' + read(lang, item.titleKey) + '</h3>' +
    item.bodyKeys.map(key => '<p>' + read(lang, key) + '</p>').join('') + subsections +
    '<div class="sourceCluster">' + sourceLinks(item, lang) + '</div>';
  return article;
}

function index(document, lang, standalone) {
  assert.ok(!document.getElementById('news-review-20261122'), 'Duplicate editorial index');
  const section = document.createElement('section');
  section.id = 'news-review-20261122';
  section.className = 'panel newsReviewIndex';
  section.setAttribute('aria-labelledby', 'news-review-20261122-title');
  const base = standalone ? publication.deployment + lang + '/' : '';
  const economicsPages = {'news22-dnib-q3': 'market', 'news22-domain-options': 'cases'};
  const links = evidence.panels.map(item => {
    const economics = economicsPages[item.id];
    const destination = economics
      ? publication.deployment + 'economics/' + lang + '/' + economics + '/#' + item.id
      : base + '?tab=' + item.section + '#' + item.id;
    const native = !standalone && !economics
      ? ' data-open-section="' + escape(item.section) + '" data-open-anchor="' + escape(item.id) + '"'
      : '';
    return '<li><a href="' + escape(destination) + '"' + native + '>' + read(lang, item.titleKey) + '</a></li>';
  }).join('');
  const heading = standalone ? 'h2' : 'h3';
  section.innerHTML = '<' + heading + ' id="news-review-20261122-title">' + read(lang, 'news22IndexTitle') + '</' + heading + '><p>' + read(lang, 'news22IndexIntro') + '</p><ul>' + links + '</ul>';
  return section;
}

for (const lang of ['en', 'it', 'de', 'fr']) {
  for (const file of [lang + '/index.html', ...(lang === 'en' ? ['index.html'] : [])]) {
    const {document} = parseHTML(fs.readFileSync(file, 'utf8'));
    for (const item of evidence.panels) {
      const chapter = document.getElementById(item.section);
      assert.ok(chapter, 'Missing news chapter: ' + item.section);
      const destination = item.target ? document.querySelector(item.target) : chapter;
      assert.ok(destination && chapter.contains(destination), 'News target is outside its chapter: ' + item.id);
      destination.append(panel(document, item, lang));
    }
    const helsinkiSources = document.querySelector('#helsinki-termination .srcs');
    assert.ok(helsinkiSources, 'Missing Helsinki source cluster');
    const observation = document.querySelector('#helsinki-termination .lifecycleObservation');
    assert.ok(observation, 'Missing Helsinki lifecycle observation');
    const values = observation.querySelectorAll('dd');
    const terms = observation.querySelectorAll('dt');
    assert.equal(values.length, 3);
    assert.equal(terms.length, 3);
    for (const [position, key, href] of [[0, helsinki.contractKey, helsinki.contractSource], [1, helsinki.rootKey, helsinki.rootSource]]) {
      const link = values[position].querySelector('a');
      assert.ok(link, 'Helsinki status must retain its primary source');
      link.href = href;
      link.textContent = translations[lang][key];
    }
    const reviewedDate = new Intl.DateTimeFormat(lang, {year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC'}).format(new Date(helsinki.verifiedOn + 'T00:00:00Z'));
    terms[2].textContent = translations[lang].cemeteryVerified.replace('{date}', reviewedDate);
    values[2].innerHTML = '<time datetime="' + helsinki.verifiedOn + '">' + escape(reviewedDate) + '</time>';
    observation.setAttribute('data-lifecycle-reviewed', helsinki.verifiedOn);
    const termination = document.createElement('a');
    termination.href = helsinki.contractSource;
    termination.setAttribute('target', '_blank');
    termination.setAttribute('rel', 'noopener noreferrer');
    termination.textContent = translations[lang].news22MktHelsinkiSource;
    helsinkiSources.append(termination);
    const firstStory = document.querySelector('#behind-round [data-behind-story="reveal-day-counts"]');
    assert.ok(firstStory, 'Missing field-note entry point');
    firstStory.before(index(document, lang, false));
    fs.writeFileSync(file, '<!DOCTYPE html>\n' + document.documentElement.outerHTML + '\n');
  }
  const file = path.join('behind-the-round', lang, 'index.html');
  const {document} = parseHTML(fs.readFileSync(file, 'utf8'));
  const firstStory = document.querySelector('[data-behind-story="reveal-day-counts"]');
  assert.ok(firstStory, 'Missing standalone field-note entry point');
  firstStory.before(index(document, lang, true));
  for (const script of document.querySelectorAll('script[type="application/ld+json"]')) {
    const structured = JSON.parse(script.textContent);
    if (structured['@type'] === 'CollectionPage') {
      structured.dateModified = [structured.dateModified, evidence.reviewedOn, publication.releasedOn].filter(Boolean).sort().at(-1);
      script.textContent = JSON.stringify(structured);
    }
  }
  fs.writeFileSync(file, '<!DOCTYPE html>\n' + document.documentElement.outerHTML + '\n');
}
console.log('NEWS_REVIEW_20261122_RENDERED', JSON.stringify({languages: 4, panels: evidence.panels.length, newRoutes: 0, frozenResearchChanged: false}));
