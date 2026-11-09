#!/usr/bin/env node
'use strict';

// Focused browser acceptance of the new documents, not a claim of a full site audit.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {chromium} = require('playwright');
const AxeBuilder = require('@axe-core/playwright').default;
const root = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'discovery/manifest.json'), 'utf8'));
const publication = JSON.parse(fs.readFileSync(path.join(root, 'publication.json'), 'utf8'));
const base = (process.env.CTD_TEST_BASE || 'http://127.0.0.1:8123/').replace(/\/?$/, '/');
const output = path.resolve(process.env.CTD_DISCOVERY_QA || path.join(root, 'tmp/discovery-qa'));
fs.mkdirSync(output, {recursive: true});
const report = {siteVersion: publication.version, sourceCommit: process.env.GITHUB_SHA || null,
  base, humanParticipants: 0, passed: false, scenarios: [], errors: [], axeScans: 0, axeMirrorScans: 0,
  execution: {reading: 'JavaScript remains disabled in every no-JavaScript reading scenario.',
    accessibility: 'Axe uses JavaScript. Disabled reading contexts are paired with fresh enabled contexts whose document identity and main DOM must match exactly. Visible main text must also match, apart from the Economics recovery navigation whose exact markup, links, IDs and intended visibility difference are checked separately.'},
  coverageLimits: ['Representative documents and viewport sizes; not all possible devices or assistive technologies.',
    'Automated accessibility results are not a conformance certification.', 'No traffic, ranking or citation-growth measurement.']};
const flat = value => String(value ?? '').replace(/\s+/g, ' ').trim();
const find = (language, kind, key) => manifest.pages.find(page => page.language === language && page.kind === kind && (key === undefined || page.key === key));

const cases = [];
for (const language of ['en', 'it', 'de', 'fr']) {
  for (const [kind, key] of [['guide', 'economics'], ['tld', 'ai'], ['tld', 'lugano'], ['index', undefined]]) {
    const entry = find(language, kind, key);
    if (entry) cases.push({entry, width: 390, javaScriptEnabled: false});
  }
}
for (const [kind, key] of [['guide', 'how'], ['guide', 'timeline'], ['guide', 'cities'], ['guide', 'economics'],
  ['guide', 'lugano'], ['guide', 'beyond'], ['tld', 'ai'], ['tld', 'lugano'], ['index', undefined]]) {
  const entry = find('en', kind, key);
  if (entry) cases.push({entry, width: 1440, javaScriptEnabled: false});
}
for (const [kind, key] of [['guide', 'economics'], ['tld', 'ai']]) {
  const entry = find('it', kind, key);
  if (entry) cases.push({entry, width: 390, javaScriptEnabled: true});
}

async function documentIdentity(page, normalizeEconomicsFallback = false) {
  return page.evaluate(normalizeEconomicsFallback => {
    const main = document.querySelector('main');
    const identity = {url: location.href, language: document.documentElement.lang, title: document.title,
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href'),
      mainCount: document.querySelectorAll('main').length,
      mainHTML: main?.outerHTML || '', mainText: main?.innerText || ''};
    if (normalizeEconomicsFallback) {
      const fallbacks = main.querySelectorAll('.economicsLegacy');
      if (fallbacks.length !== 1) throw new Error('Economics guide must retain exactly one legacy fallback navigation');
      const fallback = fallbacks[0], rect = fallback.getBoundingClientRect();
      identity.economicsFallback = {markup: fallback.outerHTML,
        ids: [...fallback.querySelectorAll('[id]')].map(node => node.id),
        links: [...fallback.querySelectorAll('a[href]')].map(link => ({href: link.getAttribute('href'), text: link.textContent}))};
      identity.economicsFallbackVisible = rect.width > 0 && rect.height > 0;
      // Only this recovery navigation changes visibility with JavaScript. Read
      // the remaining rendered text with it hidden, then restore its exact style
      // in the same evaluation; the full original main markup still must match.
      const style = fallback.getAttribute('style');
      try {
        fallback.style.setProperty('display', 'none', 'important');
        identity.mainTextWithoutEconomicsFallback = main.innerText;
      } finally {
        if (style === null) fallback.removeAttribute('style');
        else fallback.setAttribute('style', style);
      }
    }
    return identity;
  }, normalizeEconomicsFallback);
}

async function scenario(browser, test) {
  const {entry, width, javaScriptEnabled} = test;
  const state = {path: entry.path, language: entry.language, kind: entry.kind, key: entry.key,
    width, javaScriptEnabled, noJavaScriptReading: !javaScriptEnabled, checks: [], errors: [], passed: false};
  const contextOptions = {viewport: {width, height: 900}, colorScheme: 'light', reducedMotion: 'reduce',
    storageState: {cookies: [], origins: []}};
  const context = await browser.newContext({...contextOptions, javaScriptEnabled});
  const page = await context.newPage();
  const runtimeErrors = [];
  const failedLocalResources = [];
  const observePage = target => {
    target.on('pageerror', error => runtimeErrors.push(error.message));
    target.on('response', response => {
      if (response.url().startsWith(base) && response.status() >= 400)
        failedLocalResources.push({url: response.url(), status: response.status()});
    });
  };
  observePage(page);
  const check = async (name, work) => {
    try { await work(); state.checks.push({name, passed: true}); }
    catch (error) { state.errors.push({check: name, message: error.stack || String(error)}); }
  };
  try {
    const response = await page.goto(new URL(entry.path, base).href, {waitUntil: 'load', timeout: 45000});
    assert.equal(response.status(), 200, 'Document was not served successfully');
    await check('content is readable with one accessible title', async () => {
      const headings = page.getByRole('heading', {level: 1});
      assert.equal(await headings.count(), 1);
      assert.ok(await headings.isVisible(), 'Main heading is hidden without JavaScript');
      state.heading = flat(await headings.innerText());
      assert.ok(state.heading.length > 0);
      const main = page.getByRole('main');
      assert.equal(await main.count(), 1);
      state.contentCharacters = flat(await main.innerText()).length;
      assert.ok(state.contentCharacters > 150, 'Only a placeholder is visible');
      if (entry.kind === 'tld') assert.ok((await main.innerText()).includes('.' + entry.key), 'The requested profile is absent');
    });
    await check('canonical and title preserve this document identity', async () => {
      assert.equal(await page.title(), entry.title);
      state.canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      assert.equal(state.canonical, new URL(entry.path, publication.deployment).href);
    });
    if (entry.kind === 'guide' && entry.key === 'economics') {
      await check('economics introduction links to all four complete chapters', async () => {
        const hub = page.locator('main .economicsHub');
        assert.equal(await hub.count(), 1, 'Economics guide must present the short introduction');
        assert.ok(await hub.isVisible(), 'Economics introduction is not readable');
        const paths = hub.locator('a[data-economics-path]');
        assert.deepEqual(await paths.evaluateAll(nodes => nodes.map(node => node.getAttribute('data-economics-path'))),
          ['market', 'cases', 'portfolios', 'round-2026'], 'Economics chapter paths are incomplete');
        for (const link of await paths.all()) {
          const slug = await link.getAttribute('data-economics-path');
          assert.ok(await link.isVisible(), 'Chapter link is hidden: ' + slug);
          assert.ok(flat(await link.innerText()), 'Chapter link has no readable label: ' + slug);
          assert.equal(new URL(await link.getAttribute('href'), page.url()).href,
            new URL('economics/' + entry.language + '/' + slug + '/', base).href,
            'Chapter link has the wrong destination: ' + slug);
        }
        assert.ok(await page.locator('#reader-brief-economics').isVisible(), 'The original economic reading brief is missing');
      });
    }
    await check('content fits the viewport', async () => {
      state.layout = await page.evaluate(() => {
        const width = document.documentElement.clientWidth;
        const overflow = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - width;
        return {viewport: width, overflow, offenders: overflow > 2 ? [...document.querySelectorAll('main *')]
          .filter(element => { const r = element.getBoundingClientRect(); return r.width > 0 && (r.left < -2 || r.right > width + 2); })
          .slice(0, 12).map(element => ({tag: element.tagName, id: element.id, className: String(element.className), text: element.textContent.slice(0, 70)})) : []};
      });
      assert.ok(state.layout.overflow <= 2, 'Horizontal page overflow: ' + JSON.stringify(state.layout));
    });
    await check('native disclosures can be used from the keyboard', async () => {
      const summary = page.locator('main details > summary').first();
      if (!await summary.count()) { state.disclosure = 'not applicable'; return; }
      await summary.focus();
      const before = await summary.evaluate(node => node.parentElement.open);
      await page.keyboard.press('Enter');
      assert.equal(await summary.evaluate(node => node.parentElement.open), !before);
      await page.keyboard.press('Enter');
      assert.equal(await summary.evaluate(node => node.parentElement.open), before);
      state.disclosure = 'keyboard toggle verified';
    });
    // Axe needs JavaScript execution. Reading checks above keep their disabled
    // context; the enabled mirror must preserve its actual content and semantics.
    await check('automated WCAG A/AA checks', async () => {
      let mirrorContext;
      try {
        let axePage = page;
        state.axeContext = {mode: javaScriptEnabled ? 'original-reading-page' : 'javascript-enabled-mirror',
          javaScriptEnabled: true, freshStorage: true};
        if (!javaScriptEnabled) {
          const economicsFallback = entry.kind === 'guide' && entry.key === 'economics';
          const expected = await documentIdentity(page, economicsFallback);
          mirrorContext = await browser.newContext({...contextOptions, javaScriptEnabled: true});
          axePage = await mirrorContext.newPage();
          observePage(axePage);
          const response = await axePage.goto(page.url(), {waitUntil: 'load', timeout: 45000});
          assert.equal(response.status(), 200, 'Axe mirror document was not served successfully');
          const actual = await documentIdentity(axePage, economicsFallback);
          for (const key of ['url', 'language', 'title', 'canonical', 'mainCount'])
            assert.equal(actual[key], expected[key], 'Axe mirror changed document identity: ' + key);
          assert.ok(actual.mainHTML === expected.mainHTML,
            'Axe mirror changed main markup, including text, headings, links, roles or controls');
          if (economicsFallback) {
            assert.deepEqual(actual.economicsFallback, expected.economicsFallback,
              'Axe mirror changed Economics recovery markup, links or legacy fragment IDs');
            assert.equal(expected.economicsFallbackVisible, true, 'Economics recovery navigation must remain visible without JavaScript');
            assert.equal(actual.economicsFallbackVisible, false, 'Active Economics routing must hide only the recovery navigation');
            assert.equal(actual.mainTextWithoutEconomicsFallback, expected.mainTextWithoutEconomicsFallback,
              'Axe mirror changed visible main text outside the explicitly verified Economics recovery navigation');
            state.axeContext.economicsFallbackMatched = true;
            state.axeContext.visibleMainTextScope = 'All main content except the independently verified Economics recovery navigation';
          } else assert.ok(actual.mainText === expected.mainText, 'Axe mirror changed visible main text');
          state.axeContext.documentIdentityMatched = true;
          state.axeContext.mainDOMMatched = true;
          state.axeContext.visibleMainTextMatched = true;
        }
        const scan = await new AxeBuilder({page: axePage}).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
        report.axeScans++;
        if (mirrorContext) report.axeMirrorScans++;
        state.axeViolations = scan.violations.map(violation => ({id: violation.id, impact: violation.impact,
          help: violation.help, nodes: violation.nodes.map(node => ({target: node.target, failureSummary: node.failureSummary}))}));
        state.axeIncomplete = scan.incomplete.map(violation => ({id: violation.id, nodes: violation.nodes.map(node => node.target)}));
        assert.deepEqual(state.axeViolations, []);
      } finally {
        if (mirrorContext) await mirrorContext.close();
      }
    });
    if ((entry.language === 'it' && width === 390 && entry.key === 'economics' && !javaScriptEnabled)
      || (entry.language === 'en' && width === 1440 && entry.kind === 'tld' && entry.key === 'ai')) {
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({path: path.join(output, `${entry.kind}-${entry.language}-${entry.key}-${width}.png`), fullPage: false});
    }
    if (javaScriptEnabled) {
      await check('ordinary link opens the matching interactive view', async () => {
        const link = page.locator('[data-discovery-interactive]').first();
        assert.equal(await link.count(), 1, 'Interactive counterpart link missing');
        const expected = new URL(entry.interactiveUrl);
        await link.click();
        await page.waitForFunction(() => window.CTD_APP_READY === true, null, {timeout: 30000});
        const actual = new URL(page.url());
        for (const [key, value] of expected.searchParams.entries())
          assert.equal(actual.searchParams.get(key), value, 'Interactive routing lost ' + key);
        if (entry.kind === 'tld') {
          await page.locator('#explorerDrawer.open').waitFor({state: 'visible'});
          assert.equal(flat(await page.locator('#profileTitle').innerText()), '.' + entry.key);
          assert.ok(flat(await page.locator('#drawerContent').innerText()).length > 150);
          state.interactiveRoute = page.url();
          const readingLink = page.locator('#explorerDrawer .profileReadingPage');
          assert.equal(await readingLink.count(), 1, 'Explorer does not link back to the published reading page');
          assert.ok(await readingLink.isVisible(), 'Reading-page link is not visible in the Explorer');
          assert.ok(flat(await readingLink.innerText()), 'Reading-page link has no usable name');
          assert.equal(new URL(await readingLink.getAttribute('href'), page.url()).href, new URL(entry.path, base).href);
          await readingLink.click();
          await page.waitForURL(new URL(entry.path, base).href, {waitUntil: 'load'});
          assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), new URL(entry.path, publication.deployment).href);
          assert.ok(await page.getByRole('heading', {level: 1}).isVisible());
          state.readingRoundtrip = page.url();
        } else {
          assert.ok(await page.locator('#' + entry.key + '.active').isVisible());
          if (entry.key === 'economics') {
            assert.ok(await page.locator('#economics.economicsHub').isVisible());
            assert.equal(await page.locator('#economics a[data-economics-path]').count(), 4);
          }
          state.interactiveRoute = page.url();
        }
      });
    }
    await check('no broken local resources or runtime errors', async () => {
      assert.deepEqual(failedLocalResources, []);
      assert.deepEqual(runtimeErrors, []);
    });
  } catch (error) { state.errors.push({check: 'scenario setup', message: error.stack || String(error)}); }
  finally {
    state.passed = state.errors.length === 0;
    if (!state.passed) {
      try { await page.screenshot({path: path.join(output, `failure-${entry.kind}-${entry.language}-${entry.key}-${width}-${javaScriptEnabled}.png`), fullPage: false}); } catch {}
      report.errors.push({path: entry.path, width, javaScriptEnabled, errors: state.errors});
    }
    report.scenarios.push(state);
    console.log('DISCOVERY_BROWSER_SCENARIO ' + JSON.stringify({path: entry.path, width, javaScriptEnabled, passed: state.passed,
      checks: state.checks.length, errors: state.errors}));
    await context.close();
  }
}

(async () => {
  let browser;
  try {
    assert.equal(cases.length, 27, 'The discovery browser corpus must retain all 27 scenarios');
    assert.ok(cases.some(test => test.entry.kind === 'tld' && test.entry.key === 'ai'), '.ai profile is missing from the test corpus');
    assert.ok(cases.some(test => test.entry.kind === 'tld' && test.entry.key === 'lugano'), '.lugano profile is missing from the test corpus');
    browser = await chromium.launch({headless: true,
      ...(process.env.CHROMIUM_PATH ? {executablePath: process.env.CHROMIUM_PATH} : {}),
      args: ['--no-sandbox', '--disable-dev-shm-usage']});
    for (const test of cases) await scenario(browser, test);
    report.passed = report.errors.length === 0 && report.scenarios.length === 27
      && report.axeScans === 27 && report.axeMirrorScans === 25;
  } catch (error) { report.errors.push({fatal: error.stack || String(error)}); }
  finally {
    if (browser) await browser.close();
    fs.writeFileSync(path.join(output, 'report.json'), JSON.stringify(report, null, 2) + '\n');
    console.log('DISCOVERY_BROWSER_QA ' + JSON.stringify({passed: report.passed, scenarios: report.scenarios.length,
      noJavaScriptReadingScenarios: report.scenarios.filter(scenario => scenario.noJavaScriptReading).length,
      axeScans: report.axeScans, axeMirrorScans: report.axeMirrorScans,
      errors: report.errors.length, report: path.join(output, 'report.json')}));
    if (!report.passed) process.exitCode = 1;
  }
})();
