/* QA106: independently exercise the new home and its retained reading paths.
 * The historical source/parity guard remains unchanged. This suite tests the
 * published document, keyboard actions and old URLs, not the renderer's helpers.
 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {execFileSync} = require('node:child_process');
const {parseHTML} = require('linkedom');
const root = path.resolve(__dirname, '..');
const baselineCommit = '9e6f782494ca856949465e843d87dd257d0b2cea';
const locales = ['it', 'en', 'de', 'fr'];
const pathways = ['ia-understand', 'ia-explore', 'ia-stories', 'ia-outcomes', 'ia-round', 'ia-research'];
const outsideHome = node => !node.closest('.hero,#overview');
const hrefOf = node => node.getAttribute('href');
const homeSources = document => new Set([...document.querySelectorAll('.hero a[href],#overview a[href]')]
  .map(hrefOf).filter(href => /^https?:\/\//.test(href) && !href.startsWith('https://robertbregy.github.io/Connecting-the-Dots/')));

function assertHomeStructure(document, lang) {
  assert.equal(document.documentElement.lang, lang, 'Home language differs from its route');
  const hero = document.querySelector('.hero.homeHero');
  assert.ok(hero, 'Missing explanatory home opening');
  assert.equal(hero.querySelectorAll('h1').length, 1, 'The home opening needs one heading');
  assert.equal(hero.querySelector('h1').id, 'home-title');
  for (const selector of ['h1', '.homeHeroLead', '.homeHeroIntro', '.homeHeroProject']) {
    const text = hero.querySelector(selector)?.textContent.trim();
    assert.ok(text && !/undefined|\[object Object\]/.test(text), 'Missing static introduction: ' + selector);
  }
  const primary = hero.querySelector('.heroPrimary'), secondary = hero.querySelector('.heroSecondary');
  assert.ok(primary && secondary, 'Both reader entry routes must be available');
  assert.equal(primary.dataset.openSection, 'how');
  assert.equal(primary.dataset.openAnchor, 'how-part-2');
  assert.equal(new URL(hrefOf(primary), 'https://example.test/').search, '?tab=how');
  assert.equal(new URL(hrefOf(primary), 'https://example.test/').hash, '#how-part-2');
  assert.equal(secondary.dataset.openSection, 'explore');
  assert.equal(new URL(hrefOf(secondary), 'https://example.test/').search, '?tab=explore');
  assert.equal(new URL(hrefOf(secondary), 'https://example.test/').hash, '#explore');
  assert.ok(document.getElementById('how-part-2'), 'Primary reading destination disappeared');
  assert.equal(hero.querySelectorAll('.audienceDiscovery').length, 0, 'Stories still compete with the introduction');
  assert.equal(document.querySelectorAll('#home-stories .audienceDiscovery.homeStory').length, 3);
  const homePaths = [...document.querySelectorAll('#home-pathways a[data-open-section]')];
  assert.deepEqual(homePaths.map(a => a.dataset.openSection), pathways);
  for (const link of homePaths) {
    const url = new URL(hrefOf(link), 'https://example.test/');
    assert.equal(url.search, '?tab=' + link.dataset.openSection, 'A home path lost its application route');
    assert.equal(url.hash, '#' + link.dataset.openSection, 'A home path cannot reach its static chapter');
  }
  for (const id of pathways) assert.ok(document.getElementById(id), 'Missing established path ' + id);
  const quick = document.getElementById('three-minute-guide'), journey = document.getElementById('internet-guide');
  assert.ok(quick && quick.tagName === 'DETAILS' && quick.closest('#home-stories'), 'Short reading guide must remain an ordinary disclosure among the stories');
  assert.equal(quick.querySelectorAll(':scope > summary').length, 1);
  assert.equal(quick.querySelectorAll('.quickSteps > li').length, 4);
  assert.ok(journey && journey.closest('.homeJourneyDisclosure') && journey.closest('#overview'), 'The Internet walkthrough must remain in the home');
  assert.ok(document.getElementById('internet-basics'), 'Legacy walkthrough destination disappeared');
  assert.equal(document.querySelectorAll('#home-project .projectByline').length, 1, 'Project disclosure must remain available');
  assert.equal(document.querySelectorAll('#home-round .publicationState').length, 1, 'Dated round context must remain available');
  assert.equal(document.querySelectorAll('#home-project .epistemicLegend').length, 1, 'Source/interpretation legend must remain available');
}

function assertRetainedHomeSources(before, after, label) {
  const current = homeSources(after);
  for (const href of homeSources(before)) assert.ok(current.has(href), 'Home source link disappeared: ' + label + '/' + href);
}

function readBaseline(file) {
  if (process.env.CTD_HOME_BASELINE) return fs.readFileSync(path.join(process.env.CTD_HOME_BASELINE, file), 'utf8');
  return execFileSync('git', ['show', baselineCommit + ':' + file], {cwd: root, encoding: 'utf8', maxBuffer: 30 * 1024 * 1024});
}

function staticChecks(report) {
  const sourceProof = execFileSync(process.execPath, ['scripts/verify_ia_b2_parity.cjs'], {cwd: root, encoding: 'utf8', maxBuffer: 20 * 1024 * 1024});
  assert.ok(sourceProof.includes('IA_B2_SOURCE_PARITY_VERIFIED '), 'All 21 protected source sections must pass their existing guard');
  const oldAudience = JSON.parse(readBaseline('data/audience_editorial.json'));
  const audience = JSON.parse(fs.readFileSync(path.join(root, 'data/audience_editorial.json'), 'utf8'));
  for (const lang of locales) assert.deepEqual(audience.locales[lang].quickGuide, oldAudience.locales[lang].quickGuide, 'The existing short reading guide changed: ' + lang);
  assert.deepEqual(audience.everydaySources, oldAudience.everydaySources, 'The short reading guide source inventory changed');
  for (const file of ['index.html', ...locales.map(lang => lang + '/index.html')]) {
    const lang = file === 'index.html' ? 'en' : file.split('/')[0];
    const before = parseHTML(readBaseline(file)).document;
    const after = parseHTML(fs.readFileSync(path.join(root, file), 'utf8')).document;
    assertHomeStructure(after, lang);
    assertRetainedHomeSources(before, after, file);
    const oldIds = [...before.querySelectorAll('.hero [id],#overview [id]')].map(node => node.id);
    for (const id of oldIds) assert.ok(after.getElementById(id), 'Retained home fragment missing: ' + file + '/' + id);
    const allIds = [...after.querySelectorAll('[id]')].map(node => node.id);
    assert.equal(new Set(allIds).size, allIds.length, 'Duplicate document ID: ' + file);
    for (const id of ['three-minute-guide', 'internet-guide']) {
      assert.equal(after.getElementById(id).outerHTML, before.getElementById(id).outerHTML, 'An existing tutorial changed beyond its location: ' + file + '/' + id);
    }
    const previousStories = [...before.querySelectorAll('.audienceDiscovery')].map(node => node.dataset.openSection + '#' + node.dataset.openAnchor).sort();
    const currentStories = [...after.querySelectorAll('.homeStory')].map(node => node.dataset.openSection + '#' + node.dataset.openAnchor).sort();
    assert.deepEqual(currentStories, previousStories, 'A story lost its original destination: ' + file);
    const originalChapters = [...before.querySelectorAll('section.section')].map(node => node.id);
    for (const id of originalChapters) assert.ok(after.querySelector('section.section[id="' + id + '"]'), 'A canonical chapter disappeared: ' + file + '/' + id);
    report.static.push({file, lang, retainedHomeFragments: oldIds.length, unchangedTutorials: 2, canonicalChapters: originalChapters.length, sourceGuard: 'passed'});
  }
}

async function browserChecks(report, out) {
  const {chromium} = require('playwright');
  const AxeBuilder = require('@axe-core/playwright').default;
  const base = (process.env.CTD_TEST_BASE || 'http://127.0.0.1:8123/').replace(/\/?$/, '/');
  const browser = await chromium.launch({headless: true, ...(process.env.CHROMIUM_PATH ? {executablePath: process.env.CHROMIUM_PATH} : {})});
  const ready = page => page.waitForFunction(() => window.CTD_APP_READY === true, null, {timeout: 45000});
  const compact = violations => violations.map(item => ({id: item.id, impact: item.impact, targets: item.nodes.map(node => node.target)}));
  async function fit(page, label) {
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 2), false, 'Horizontal overflow: ' + label);
  }
  async function reached(page, id) {
    await page.waitForFunction(id => {
      let node = document.getElementById(id);
      if (!node || !node.getBoundingClientRect().height) return false;
      for (let parent = node; parent; parent = parent.parentElement) if (parent.tagName === 'DETAILS' && !parent.open) return false;
      const rect = node.getBoundingClientRect();
      return rect.top >= 0 && rect.top < innerHeight;
    }, id, {timeout: 5000});
  }
  try {
    for (const lang of locales) for (const width of [320, 390, 1440]) for (const theme of ['light', 'dark']) {
      const context = await browser.newContext({viewport: {width, height: 900}, colorScheme: theme, reducedMotion: 'reduce'});
      const page = await context.newPage(), errors = [], result = {lang, width, theme, passed: false};
      page.on('pageerror', error => errors.push(error.message));
      try {
        await page.goto(base + lang + '/', {waitUntil: 'load'}); await ready(page);
        if (await page.locator('html').getAttribute('data-theme') !== theme) await page.locator('#themeBtn').click();
        assert.ok(await page.locator('.homeHeroProject').isVisible(), 'The project introduction is hidden');
        assert.equal(await page.locator('h1:visible').count(), 1, 'The first view must have one visible H1');
        assert.equal(await page.locator('#home-stories .homeStory').count(), 3);
        assert.equal(await page.locator('.homeJourneyDisclosure').evaluate(node => node.open), false, 'The optional walkthrough starts expanded');
        assert.equal(await page.locator('#three-minute-guide').evaluate(node => node.open), false, 'The optional short guide starts expanded');
        assert.equal(await page.evaluate(() => !!window.CTD_APS_2026), false, 'The introduction eagerly downloaded the Atlas');
        await fit(page, 'home');
        const action = page.locator('.heroPrimary'), rect = await action.boundingBox();
        assert.ok(rect && rect.y >= 0 && rect.y + rect.height < 900, 'The first action is below the first 900px: ' + JSON.stringify(rect));
        const axe = await new AxeBuilder({page}).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
        report.axeScans++; assert.deepEqual(compact(axe.violations), [], 'Home accessibility');
        if (lang === 'it') await page.screenshot({path: path.join(out, 'home-' + width + '-' + theme + '.png'), fullPage: true});
        await action.focus(); await page.keyboard.press('Enter');
        await reached(page, 'how-part-2');
        assert.equal(new URL(page.url()).searchParams.get('tab'), 'how');
        assert.equal(new URL(page.url()).hash, '#how-part-2');
        assert.ok(await page.locator('#how-part-2').isVisible());
        await page.goBack(); await ready(page);
        await page.locator('.heroSecondary').focus(); await page.keyboard.press('Enter');
        assert.equal(new URL(page.url()).searchParams.get('tab'), 'explore');
        assert.ok(await page.locator('#explore.section.active').isVisible());

        // Direct old fragments exercise disclosure opening, scroll, reload and
        // history, including links copied before this redesign.
        await page.goto(base + lang + '/?tab=overview#three-minute-guide', {waitUntil: 'load'}); await ready(page);
        await reached(page, 'three-minute-guide');
        assert.equal(await page.locator('#three-minute-guide').evaluate(node => node.open), true);
        assert.equal(await page.locator('.quickSteps > li:visible').count(), 4);
        await page.reload(); await ready(page); await reached(page, 'three-minute-guide');
        assert.equal(await page.locator('#three-minute-guide').evaluate(node => node.open), true);
        await page.locator('#three-minute-guide > summary').focus(); await page.keyboard.press('Enter');
        assert.equal(await page.locator('#three-minute-guide').evaluate(node => node.open), false);
        await page.keyboard.press('Enter');
        assert.equal(await page.locator('#three-minute-guide').evaluate(node => node.open), true);
        await page.goto(base + lang + '/?tab=overview#internet-basics', {waitUntil: 'load'}); await ready(page);
        await reached(page, 'internet-basics');
        assert.equal(await page.locator('.homeJourneyDisclosure').evaluate(node => node.open), true);
        assert.equal(await page.locator('#journeyStepper button').count(), 7);
        await page.locator('#journeyNext').focus(); await page.keyboard.press('Enter');
        assert.ok(await page.locator('#journey-title-1').isVisible(), 'The retained walkthrough did not advance');
        await page.reload(); await ready(page); await reached(page, 'internet-basics');
        assert.equal(await page.locator('.homeJourneyDisclosure').evaluate(node => node.open), true);
        const other = lang === 'en' ? 'it' : 'en';
        await page.locator('#langSelect').selectOption(other);
        await page.waitForURL('**/' + other + '/**'); await ready(page); await reached(page, 'internet-basics');
        assert.equal(new URL(page.url()).hash, '#internet-basics', 'Language change lost the old walkthrough link');
        await fit(page, 'expanded walkthrough');
        assert.deepEqual(errors, [], 'Browser runtime errors');
        Object.assign(result, {keyboardEntries: 2, legacyFragments: 2, reloads: 2, walkthroughAdvances: 1, languageChangePreserved: true, passed: true});
      } catch (error) {
        result.error = error.stack || String(error); report.errors.push(result);
        await page.screenshot({path: path.join(out, 'failure-' + lang + '-' + width + '-' + theme + '.png')}).catch(() => {});
      } finally {
        report.browser.push(result); await context.close();
        console.log('HOME_EDITORIAL_SCENARIO ' + JSON.stringify(result));
      }
    }
    for (const lang of locales) for (const theme of ['light', 'dark']) {
      const context = await browser.newContext({javaScriptEnabled: false, viewport: {width: 390, height: 900}, colorScheme: theme});
      const page = await context.newPage(), result = {lang, theme, passed: false};
      try {
        await page.goto(base + lang + '/', {waitUntil: 'load'});
        result.documentTheme = await page.locator('html').getAttribute('data-theme') || 'system';
        assert.ok(await page.locator('.homeHeroProject').isVisible(), 'Static introduction is missing');
        assert.ok(await page.locator('.homeDomain').isVisible(), 'The domain explanation requires JavaScript');
        assert.equal(await page.locator('#home-stories .homeStory:visible').count(), 3);
        assert.equal(await page.locator('#home-pathways a:visible').count(), 6);
        await page.locator('#three-minute-guide > summary').focus(); await page.keyboard.press('Enter');
        assert.equal(await page.locator('.quickSteps > li:visible').count(), 4, 'Native guide disclosure requires JavaScript');
        await page.locator('.homeJourneyDisclosure > summary').focus(); await page.keyboard.press('Enter');
        assert.ok(await page.locator('#internet-guide').isVisible(), 'The retained lesson is not readable without JavaScript');
        await fit(page, 'no-JavaScript home');
        // Native links must move the reader to the content, not merely reload a
        // document in which every no-JavaScript section happens to be visible.
        const ordinaryEntries = [
          {selector: '.heroPrimary', section: 'how', anchor: 'how-part-2'},
          {selector: '.heroSecondary', section: 'explore', anchor: 'explore'},
          ...pathways.map(section => ({selector: '#home-pathways a[data-open-section="' + section + '"]', section, anchor: section}))
        ];
        result.reachedFragments = [];
        for (const {selector, section, anchor} of ordinaryEntries) {
          await page.goto(base + lang + '/', {waitUntil: 'load'});
          await page.locator(selector).click();
          await page.waitForURL(url => url.searchParams.get('tab') === section && url.hash === '#' + anchor);
          await reached(page, anchor);
          assert.ok(await page.evaluate(() => window.scrollY > 0), 'The ordinary link did not scroll to ' + anchor);
          result.reachedFragments.push(anchor);
        }
        result.passed = true;
      } catch (error) { result.error = error.stack || String(error); report.errors.push(result); }
      finally { report.noJavaScript.push(result); await context.close(); }
    }
  } finally { await browser.close(); }
}

module.exports = {outsideHome, assertHomeStructure, assertRetainedHomeSources};
if (require.main === module) {
  const out = path.resolve(root, process.env.CTD_HOME_QA || 'audit-home-editorial');
  fs.mkdirSync(out, {recursive: true});
  const report = {siteVersion: JSON.parse(fs.readFileSync(path.join(root, 'publication.json'), 'utf8')).version, baselineCommit, sourceCommit: process.env.GITHUB_SHA || null, static: [], browser: [], noJavaScript: [], axeScans: 0, errors: [], humanParticipants: 0, passed: false};
  (async () => {
    try { staticChecks(report); if (!process.argv.includes('--static-only')) await browserChecks(report, out); report.passed = report.errors.length === 0; }
    catch (error) { report.errors.push({fatal: error.stack || String(error)}); }
    finally { fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 2) + '\n'); console.log('HOME_EDITORIAL_QA ' + JSON.stringify({passed: report.passed, static: report.static.length, browser: report.browser.length, noJavaScript: report.noJavaScript.length, axeScans: report.axeScans, errors: report.errors.length})); }
    if (!report.passed) process.exitCode = 1;
  })();
}
