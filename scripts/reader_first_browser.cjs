/* Browser regression tests for the reader-first publication.
 * Simulated tasks are not a substitute for independent human reader studies.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const {execFileSync} = require('node:child_process');
const {chromium} = require('playwright');
const AxeBuilder = require('@axe-core/playwright').default;
const ROOT = path.resolve(__dirname, '..');
const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/reader_first.json'), 'utf8'));
const chapters = Object.values(data.areas).flat();
const out = '/tmp/reader-first-qa'; fs.mkdirSync(out, {recursive: true});
const result = {schemaVersion: 1, sourceCommit: execFileSync('git', ['rev-parse', 'HEAD'], {cwd: ROOT, encoding: 'utf8'}).trim(), baseline: data.baseline, browser: 'Chromium', routeStates: 0, journeys: [], independentPages: 0, errors: [], componentAccessibility: [], fullPageAccessibility: [], preservedArchives: [], humanParticipants: 0, limitations: ['Automated Chromium checks, not a WCAG conformance certification.', 'No human participants or independent screen-reader evaluation.']};
function check(ok, message) { if (!ok) result.errors.push(message); }
function compactAxe(violations) { return violations.map(v => ({id: v.id, impact: v.impact, nodes: v.nodes.map(n => n.target)})); }
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.csv':'text/csv'};
const server = http.createServer((req, res) => {
  try {
    let pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    let base = ROOT;
    if (pathname.startsWith('/__baseline__/')) { base = '/tmp/reader-first-baseline'; pathname = pathname.slice('/__baseline__'.length); }
    let file = path.resolve(base, '.' + pathname);
    if (!file.startsWith(base + path.sep) && file !== base) { res.writeHead(403).end(); return; }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (!fs.existsSync(file)) { res.writeHead(404).end('Not found'); return; }
    res.writeHead(200, {'Content-Type': mime[path.extname(file)] || 'application/octet-stream'}); fs.createReadStream(file).pipe(res);
  } catch (e) { res.writeHead(500).end(String(e)); }
});
function imageEvidence(buffer, name) {
  fs.writeFileSync(path.join(out, name + '.jpg'), buffer);
  // Small textual preview can be inspected through the connected repository.
  fs.writeFileSync(path.join(ROOT, 'docs', name + '.b64'), buffer.toString('base64') + '\n');
}
async function ready(page) { await page.waitForFunction(() => window.CTD_APP_READY === true, {timeout: 45000}); }
(async () => {
  let browser;
  try {
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const base = 'http://127.0.0.1:' + server.address().port;
    browser = await chromium.launch({headless: true});
    for (const lang of ['it', 'en', 'de', 'fr']) for (const theme of ['light', 'dark']) for (const width of [320, 1280]) {
      const context = await browser.newContext({viewport: {width, height: 900}, reducedMotion: 'reduce'});
      await context.addInitScript(value => localStorage.setItem('dotTheme', value), theme);
      const page = await context.newPage();
      page.on('pageerror', error => result.errors.push(lang + '/' + theme + '/' + width + ': ' + error.message));
      await page.goto(base + '/' + lang + '/', {waitUntil: 'load'}); await ready(page);
      for (const id of ['overview', ...Object.keys(data.areas), ...chapters]) {
        await page.evaluate(id => activateTab(id, false, 'replace', false), id);
        await page.waitForTimeout(35);
        const state = await page.evaluate(id => {
          const section = document.getElementById(id);
          const visibleSections = [...document.querySelectorAll('.section')].filter(n => getComputedStyle(n).display !== 'none');
          const badLinks = [...section.querySelectorAll('[data-reader-ui] [data-open-section]')].filter(a => !document.getElementById(a.dataset.openSection) || (a.dataset.openAnchor && !document.getElementById(a.dataset.openAnchor))).length;
          const bounds = document.documentElement.scrollWidth <= innerWidth + 2;
          return {active: document.body.dataset.activeTab, visible: visibleSections.map(n => n.id), bounds, badLinks, title: document.title, question: section.dataset.readerTitle || null};
        }, id);
        result.routeStates++;
        check(state.active === id && state.visible.length === 1 && state.visible[0] === id, 'Visibility ' + JSON.stringify({lang, theme, width, id, state}));
        check(state.bounds, 'Horizontal overflow: ' + [lang, theme, width, id].join('/'));
        check(!state.badLinks, 'Broken reader link: ' + lang + '/' + id);
        if (state.question) check(state.title.startsWith(state.question), 'Stale page title: ' + lang + '/' + id);
      }
      if (lang === 'it' && width === 1280) {
        for (const id of ['how', 'cities', 'social', 'disputes', 'governance-access', 'research']) {
          await page.evaluate(id => activateTab(id, false, 'replace', false), id);
          const scan = await new AxeBuilder({page}).include('#' + id + ' .readerIntro').include('#' + id + ' .readerToc').include('#' + id + ' .readerNext').analyze();
          result.componentAccessibility.push({lang, theme, id, violations: compactAxe(scan.violations)});
          check(scan.violations.length === 0, 'Reader accessibility: ' + theme + '/' + id + ' ' + scan.violations.map(v => v.id).join(','));
        }
      }
      if (lang === 'it' && theme === 'light') {
        await page.evaluate(() => activateTab('cities', false, 'replace', false));
        await page.screenshot({path: path.join(out, 'cities-' + width + '.png'), fullPage: false});
        imageEvidence(await page.screenshot({type: 'jpeg', quality: 35}), 'reader-first-preview-cities-' + width);
      }
      await context.close();
    }
    // Real links, keyboard input, disclosure opening, back/forward and language changes.
    for (const lang of ['it', 'en', 'de', 'fr']) {
      const context = await browser.newContext({viewport: {width: 390, height: 844}, reducedMotion: 'reduce'});
      const page = await context.newPage();
      await page.goto(base + '/' + lang + '/?tab=how#how-part-1'); await ready(page);
      check(await page.locator('#how-part-1').isVisible(), 'Legacy deep link hidden: ' + lang);
      const summary = page.locator('#how .readerToc > details > summary');
      await summary.focus(); await page.keyboard.press('Enter');
      check(!(await page.locator('#how .readerToc > details').evaluate(n => n.open)), 'Keyboard disclosure did not close: ' + lang);
      await page.keyboard.press('Enter');
      check(await page.locator('#how .readerToc > details').evaluate(n => n.open), 'Keyboard disclosure did not open: ' + lang);
      const local = page.locator('#how .readerToc a').first();
      const target = await local.getAttribute('data-open-anchor'); await local.click();
      check(await page.evaluate(id => document.activeElement.id === id && location.hash === '#' + id, target), 'Local heading focus/hash: ' + lang);
      await page.reload(); await ready(page);
      check(await page.locator('#' + target).isVisible(), 'Reloaded local target hidden: ' + lang);
      const next = page.locator('#how .readerNext a').first(); await next.focus(); await page.keyboard.press('Enter');
      check(await page.evaluate(() => document.body.dataset.activeTab === 'beyond'), 'Keyboard next link: ' + lang);
      await page.goBack(); await ready(page);
      check(await page.evaluate(() => document.body.dataset.activeTab === 'how'), 'Back history: ' + lang);
      await page.goForward(); await ready(page);
      check(await page.evaluate(() => document.body.dataset.activeTab === 'beyond'), 'Forward history: ' + lang);
      const nextLang = lang === 'en' ? 'it' : 'en';
      await page.selectOption('#langSelect', nextLang); await page.waitForURL('**/' + nextLang + '/**'); await ready(page);
      check(await page.evaluate(() => document.body.dataset.activeTab === 'beyond'), 'Language route changed: ' + lang);
      result.journeys.push({lang, legacyAnchor: 'how-part-1', localAnchor: target, keyboardDisclosure: true, nextChapter: 'beyond', history: true, switchedTo: nextLang});
      await context.close();
    }
    const context = await browser.newContext({viewport: {width: 390, height: 844}, reducedMotion: 'reduce'});
    const page = await context.newPage();
    await page.goto(base + '/it/?tab=explore&q=.cat&scope=names'); await ready(page);
    await page.waitForFunction(() => document.querySelector('#explorerTableBody tr'));
    check((await page.locator('#explorerSearch').inputValue()) === '.cat', 'Explorer query lost');
    check((await page.locator('#explorerSearchScope').inputValue()) === 'names', 'Explorer scope lost');
    check(await page.locator('#explorerTableBody tr').first().innerText().then(t => t.includes('.cat')), 'Explorer matching row changed');
    await page.goto(base + '/it/?tab=research#research-citation-guide'); await ready(page);
    check(await page.locator('#research-citation-guide').isVisible(), 'Research citation shortcut hidden');
    const structure = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/reader-first-structure.json'), 'utf8'));
    for (const item of structure.independent) {
      await page.goto(base + '/' + item.file, {waitUntil: 'load'});
      check(await page.locator('.readerNext').count() > 0, 'Independent continuation missing: ' + item.file);
      check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2), 'Independent overflow: ' + item.file);
      result.independentPages++;
    }
    await context.close();
    // Full-page scans are reported separately; pre-existing issues are not called fixed.
    try {
      execFileSync('git', ['worktree', 'add', '--detach', '/tmp/reader-first-baseline', data.baseline], {cwd: ROOT, stdio: 'pipe'});
      const compareContext = await browser.newContext({viewport: {width: 1280, height: 900}, reducedMotion: 'reduce'});
      const comparePage = await compareContext.newPage();
      for (const id of ['overview', 'how', 'cities', 'research']) for (const variant of ['baseline', 'reader']) {
        await comparePage.goto(base + (variant === 'baseline' ? '/__baseline__' : '') + '/it/?tab=' + id); await ready(comparePage);
        const scan = await new AxeBuilder({page: comparePage}).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
        result.fullPageAccessibility.push({id, variant, violations: compactAxe(scan.violations)});
      }
      await compareContext.close();
    } catch (error) { result.errors.push('Baseline comparison failed: ' + error.message); }
    const archiveFiles = execFileSync('git', ['ls-tree', '-r', '--name-only', data.baseline, 'downloads'], {cwd: ROOT, encoding: 'utf8'}).trim().split('\n').filter(f => f.endsWith('.zip'));
    for (const file of archiveFiles) {
      const original = execFileSync('git', ['show', data.baseline + ':' + file], {cwd: ROOT, maxBuffer: 128 * 1024 * 1024});
      const current = fs.readFileSync(path.join(ROOT, file));
      check(original.equals(current), 'Previously published ZIP changed: ' + file);
      if (original.equals(current)) result.preservedArchives.push(file);
    }
    const changedCsv = execFileSync('git', ['diff', data.baseline, '--name-only', '--', 'data/*.csv'], {cwd: ROOT, encoding: 'utf8'}).trim();
    check(!changedCsv, 'Research CSV changed: ' + changedCsv);
  } catch (error) { result.errors.push(error.stack || error.message); }
  finally {
    if (browser) await browser.close(); await new Promise(resolve => server.close(resolve));
    result.passed = result.errors.length === 0;
    fs.writeFileSync(path.join(ROOT, 'docs/reader-first-verification.json'), JSON.stringify(result, null, 2) + '\n');
    console.log('READER_FIRST_BROWSER_RESULT', JSON.stringify(result));
    if (!result.passed) process.exitCode = 1;
  }
})();
