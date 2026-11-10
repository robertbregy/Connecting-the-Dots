#!/usr/bin/env node
'use strict';
// Targeted regression checks for shared theme state and publication asset URLs.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {parseHTML} = require('linkedom');
const {pageShell, addCaseIndex} = require('./render_discovery.cjs');
const root = path.resolve(__dirname, '..');
const pub = JSON.parse(fs.readFileSync(path.join(root, 'publication.json'), 'utf8'));
const translations = JSON.parse(fs.readFileSync(path.join(root, 'data/translations.json'), 'utf8'));
const cases = JSON.parse(fs.readFileSync(path.join(root, 'data/economic_cases.json'), 'utf8')).cases;
const source = name => fs.readFileSync(path.join(root, 'assets', name), 'utf8');

function themeContext(html, {saved = null, dark = false, blocked = false} = {}) {
  const {document, Event} = parseHTML(html);
  const events = new Map(), mediaEvents = new Map();
  const media = {matches: dark, addEventListener: (name, fn) => mediaEvents.set(name, fn)};
  const window = {matchMedia: () => media, addEventListener: (name, fn) => events.set(name, fn)};
  const storage = new Map(saved ? [['dotTheme', saved]] : []);
  const localStorage = {
    getItem(key) { if (blocked) throw Error('Storage blocked'); return storage.get(key) || null; },
    setItem(key, value) { if (blocked) throw Error('Storage blocked'); storage.set(key, value); }
  };
  vm.runInNewContext(source('discovery-controls.js'), {document, window, localStorage});
  return {document, Event, storage, events, media, mediaEvents};
}

async function lazyContext(order, metadataOnly = false) {
  const requests = [];
  const document = {
    documentElement: {dataset: {ctdRoot: '../'}, lang: 'it'},
    body: {dataset: {activeTab: 'overview', build: pub.version}},
    readyState: 'complete',
    querySelector: selector => selector === 'meta[name="ctd-version"]' ? {content: pub.version} : null,
    querySelectorAll: () => [], getElementById: () => null, addEventListener() {},
    createElement: () => ({remove() {}}),
    head: {append(script) { requests.push(script.src); queueMicrotask(() => script.onload()); }}
  };
  const window = {DOT_PUBLICATION: metadataOnly ? undefined : pub, addEventListener() {}};
  const context = vm.createContext({window, document, location: {href: pub.deployment + 'it/', hash: ''}, URL, Promise});
  for (const name of order) vm.runInContext(source(name), context);
  assert.equal(requests.length, 0, 'Overview must not preload optional data');
  const first = window.CTD_LOAD_APS(true);
  assert.equal(window.CTD_LOAD_APS(true), first, 'Parallel requests must share one APS load');
  assert.equal(await first, true);
  assert.equal(await window.CTD_LOAD_WORLD(), true);
  await window.CTD_LOAD_WORLD();
  assert.deepEqual(requests, [
    pub.deployment + 'data/aps_2026_application_graph.js?v=' + pub.version,
    pub.deployment + 'assets/aps-atlas.js?v=' + pub.version,
    pub.deployment + 'data/worldmap.js?v=' + pub.version
  ], 'Native lazy loads must use the same publication URLs as standalone documents');
}

async function main() {
  for (const lang of ['en', 'it', 'de', 'fr']) {
    const t = translations[lang], {document: seed} = parseHTML('<!doctype html><html><head></head><body></body></html>');
    const fragment = seed.createElement('div');
    fragment.innerHTML = cases.map(c => `<article class="economicCase" id="econ-case-${c.id}"><div class="caseStrings">${c.strings.join(' · ') || t.economicSystemCase}</div><span class="mechanismPill">${t[c.modelKey]}</span><h3>${t[c.questionKey]}</h3><p>${t[c.factKey]}</p></article>`).join('');
    const protectedCards = [...fragment.querySelectorAll('article')].map(card => card.outerHTML);
    addCaseIndex(fragment, lang);
    const links = [...fragment.querySelectorAll('#economics-case-index a')];
    assert.equal(links.length, 8);
    assert.deepEqual(links.map(link => link.getAttribute('href')), cases.map(c => '#econ-case-' + c.id));
    assert.deepEqual([...fragment.querySelectorAll('article')].map(card => card.outerHTML), protectedCards);
    const html = pageShell({language: lang, kind: 'economics', key: 'cases', path: `economics/${lang}/cases/`, title: 'Cases', headline: 'Cases', description: 'Documented case evidence', markdownPath: `economics/${lang}/cases/index.md`, interactiveUrl: pub.deployment + lang + '/?tab=economics#economics'}, fragment.outerHTML, seed, {economicsPages: [{key: 'cases', title: 'Cases'}]});
    const {document: staticDoc} = parseHTML(html);
    const staticButton = staticDoc.querySelector('[data-discovery-theme]');
    assert.equal(staticDoc.querySelectorAll('[data-discovery-theme]').length, 1);
    assert.ok(staticButton.hasAttribute('hidden'), 'No inert theme control without JavaScript');
    assert.equal(staticButton.getAttribute('aria-label'), t.themeLabel);
    assert.notEqual(staticDoc.querySelector('[data-discovery-interactive]').textContent.trim(), staticDoc.querySelector('.economicsOverviewLink').textContent.trim(), 'Interactive and reading links need distinct labels');
    assert.ok(staticDoc.querySelector('script[src*="discovery-controls.js?v=' + pub.version + '"]'));
    const state = themeContext(html, {saved: 'dark'}), button = state.document.querySelector('[data-discovery-theme]');
    assert.equal(button.hidden, false);
    assert.equal(state.document.documentElement.dataset.theme, 'dark');
    assert.equal(button.getAttribute('aria-pressed'), 'true');
    button.dispatchEvent(new state.Event('click'));
    assert.equal(state.document.documentElement.dataset.theme, 'light');
    assert.equal(button.getAttribute('aria-pressed'), 'false');
    assert.equal(state.storage.get('dotTheme'), 'light');
    state.events.get('storage')({key: 'dotTheme', newValue: 'dark'});
    assert.equal(state.document.documentElement.dataset.theme, 'dark');
    const blocked = themeContext(html, {dark: true, blocked: true});
    assert.equal(blocked.document.documentElement.dataset.theme, 'dark');
    blocked.document.querySelector('[data-discovery-theme]').dispatchEvent(new blocked.Event('click'));
    assert.equal(blocked.document.documentElement.dataset.theme, 'light', 'Theme must remain usable without storage');
  }
  await lazyContext(['aps-lazy.js', 'worldmap-lazy.js']);
  await lazyContext(['worldmap-lazy.js', 'aps-lazy.js'], true);
  console.log('READING_CONTROLS_PASS four languages; theme persistence and blocked storage; eight exact case anchors; lazy URLs in both initialization orders');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
