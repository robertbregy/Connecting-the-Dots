/* Automated browser regressions, not a substitute for independent human studies. */
'use strict';
const fs = require('node:fs'), path = require('node:path'), http = require('node:http'), crypto = require('node:crypto');
const {execFileSync} = require('node:child_process');
const {chromium} = require('playwright');
const AxeBuilder = require('@axe-core/playwright').default;
const ROOT = path.resolve(__dirname, '..');
const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/reader_first.json'), 'utf8'));
const chapters = Object.values(data.areas).flat();
const out = '/tmp/reader-first-qa'; fs.mkdirSync(out, {recursive: true});
const result = {schemaVersion: 1, sourceCommit: execFileSync('git', ['rev-parse', 'HEAD'], {cwd: ROOT, encoding: 'utf8'}).trim(), baseline: data.baseline, browser: 'Chromium', routeStates: 0, verifiedThemes: [], journeys: [], independentPages: 0, legacyRedirects: [], noJavaScript: [], errors: [], componentAccessibility: [], fullPageAccessibility: [], preservedArchives: [], preservedEvidenceFiles: [], humanParticipants: 0, limitations: ['Automated Chromium checks, not a WCAG conformance certification.', 'No human participants or independent screen-reader evaluation.']};
function check(ok, message) { if (!ok) result.errors.push(message); }
function compactAxe(violations) { return violations.map(v => ({id: v.id, impact: v.impact, nodes: v.nodes.map(n => n.target)})); }
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.csv':'text/csv'};
const server = http.createServer((req, res) => {
  try {
    let pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname), base = ROOT;
    if (pathname.startsWith('/__baseline__/')) { base = '/tmp/reader-first-baseline'; pathname = pathname.slice('/__baseline__'.length); }
    let file = path.resolve(base, '.' + pathname);
    if (!file.startsWith(base + path.sep) && file !== base) { res.writeHead(403).end(); return; }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (!fs.existsSync(file)) { res.writeHead(404).end('Not found'); return; }
    res.writeHead(200, {'Content-Type': mime[path.extname(file)] || 'application/octet-stream'}); fs.createReadStream(file).pipe(res);
  } catch (e) { res.writeHead(500).end(String(e)); }
});
async function imageEvidence(page, name) {
  const screenshot = await page.screenshot({type: 'jpeg', quality: 45});
  fs.writeFileSync(path.join(out, name + '.jpg'), screenshot);
  const thumb = await page.evaluate(async b64 => {
    const img = new Image(); img.src = 'data:image/jpeg;base64,' + b64; await img.decode();
    const canvas = document.createElement('canvas'); canvas.width = Math.min(img.width, 640); canvas.height = Math.round(img.height * canvas.width / img.width);
    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', .16).split(',')[1];
  }, screenshot.toString('base64'));
  fs.writeFileSync(path.join(ROOT, 'docs', name + '.b64'), thumb.match(/.{1,100}/g).join('\n') + '\n');
}
async function ready(page) { await page.waitForFunction(() => window.CTD_APP_READY === true, null, {timeout: 45000}); }
async function capture(label, fn) { try { await fn(); } catch (error) { result.errors.push(label + ': ' + (error.stack || error.message)); } }
(async () => {
  let browser;
  try {
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const base = 'http://127.0.0.1:' + server.address().port;
    browser = await chromium.launch({headless: true});
    for (const lang of ['it', 'en', 'de', 'fr']) for (const theme of ['light', 'dark']) for (const width of [320, 1280]) {
      const context = await browser.newContext({viewport: {width, height: 900}, reducedMotion: 'reduce'});
      const page = await context.newPage();
      page.on('pageerror', error => result.errors.push(lang + '/' + theme + '/' + width + ': ' + error.message));
      await page.goto(base + '/' + lang + '/', {waitUntil: 'load'}); await ready(page);
      if (await page.evaluate(() => document.documentElement.dataset.theme) !== theme) await page.locator('#themeBtn').click();
      check(await page.evaluate(t => document.documentElement.dataset.theme === t, theme), 'Theme switch failed: ' + theme);
      result.verifiedThemes.push({lang, theme, width});
      for (const id of ['overview', ...Object.keys(data.areas), ...chapters]) {
        await page.evaluate(id => activateTab(id, false, 'replace', false), id); await page.waitForTimeout(35);
        const state = await page.evaluate(id => {
          const section = document.getElementById(id);
          return {active: document.body.dataset.activeTab, visible: [...document.querySelectorAll('.section')].filter(n => getComputedStyle(n).display !== 'none').map(n => n.id), bounds: document.documentElement.scrollWidth <= innerWidth + 2,
            badLinks: [...section.querySelectorAll('[data-reader-ui] [data-open-section]')].filter(a => !document.getElementById(a.dataset.openSection) || (a.dataset.openAnchor && !document.getElementById(a.dataset.openAnchor))).length,
            title: document.title, question: section.dataset.readerTitle || null};
        }, id);
        result.routeStates++;
        check(state.active === id && state.visible.length === 1 && state.visible[0] === id, 'Visibility ' + JSON.stringify({lang, theme, width, id, state}));
        check(state.bounds, 'Horizontal overflow: ' + [lang, theme, width, id].join('/'));
        check(!state.badLinks, 'Broken reader link: ' + lang + '/' + id);
        if (state.question) check(state.title.startsWith(state.question), 'Stale page title: ' + lang + '/' + id);
      }
      if (lang === 'it' && width === 1280) for (const id of ['how', 'cities', 'social', 'disputes', 'governance-access', 'research']) {
        await page.evaluate(id => activateTab(id, false, 'replace', false), id);
        const scan = await new AxeBuilder({page}).include('#' + id + ' .readerIntro').include('#' + id + ' .readerToc').include('#' + id + ' .readerNext').analyze();
        result.componentAccessibility.push({lang, theme, id, violations: compactAxe(scan.violations)});
        check(scan.violations.length === 0, 'Reader accessibility: ' + theme + '/' + id + ' ' + scan.violations.map(v => v.id).join(','));
      }
      if (lang === 'it' && theme === 'light') {
        await page.evaluate(() => { activateTab('cities', false, 'replace', false); window.scrollTo(0, 0); });
        await imageEvidence(page, 'reader-first-preview-cities-' + width);
      }
      await context.close();
    }
    for (const lang of ['it', 'en', 'de', 'fr']) await capture('Keyboard journey ' + lang, async () => {
      const context = await browser.newContext({viewport: {width: 390, height: 844}, reducedMotion: 'reduce'});
      const page = await context.newPage(), startErrors = result.errors.length;
      try {
        await page.goto(base + '/' + lang + '/?tab=how#how-part-1'); await ready(page);
        check(await page.locator('#how-part-1').isVisible(), 'Legacy deep link hidden: ' + lang);
        const details = page.locator('#how .readerToc > details'), summary = details.locator(':scope > summary');
        const initiallyOpen = await details.evaluate(n => n.open);
        await summary.focus(); await page.keyboard.press('Enter');
        check(await details.evaluate(n => n.open) !== initiallyOpen, 'Keyboard disclosure failed to toggle: ' + lang);
        await page.keyboard.press('Enter');
        check(await details.evaluate(n => n.open) === initiallyOpen, 'Keyboard disclosure failed to toggle back: ' + lang);
        if (!(await details.evaluate(n => n.open))) await page.keyboard.press('Enter');
        const local = page.locator('#how .readerToc a').first(), target = await local.getAttribute('data-open-anchor'); await local.click();
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
        result.journeys.push({lang, legacyAnchor: 'how-part-1', localAnchor: target, nextChapter: 'beyond', switchedTo: nextLang, passed: result.errors.length === startErrors});
      } finally { await context.close(); }
    });
    await capture('Explorer and research tasks', async () => {
      const context = await browser.newContext({viewport: {width: 390, height: 844}, reducedMotion: 'reduce'});
      const page = await context.newPage();
      try {
        await page.goto(base + '/it/?tab=explore'); await ready(page);
        await page.selectOption('#explorerSearchScope', 'names');
        await page.locator('#explorerSearch').fill('.cat');
        await page.waitForTimeout(350); await page.reload(); await ready(page);
        check((await page.locator('#explorerSearch').inputValue()) === '.cat', 'Explorer query lost after reload');
        check((await page.locator('#explorerSearchScope').inputValue()) === 'names', 'Explorer scope lost after reload');
        check(await page.locator('#explorerTableBody').innerText().then(t => t.includes('.cat')), 'Explorer matching row missing');
        await page.goto(base + '/it/?tab=research#research-citation-guide'); await ready(page);
        check(await page.locator('#research-citation-guide').isVisible(), 'Research citation shortcut hidden');
      } finally { await context.close(); }
    });
    const structure = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/reader-first-structure.json'), 'utf8'));
    await capture('Independent page paths', async () => {
      const context = await browser.newContext({viewport: {width: 390, height: 844}, reducedMotion: 'reduce'}), page = await context.newPage();
      try { for (const item of structure.independent) {
        await page.goto(base + '/' + item.file, {waitUntil: 'load'});
        check(await page.locator('.readerNext').count() > 0, 'Independent continuation missing: ' + item.file);
        check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2), 'Independent overflow: ' + item.file);
        if (page.url().includes('?tab=governance-')) result.legacyRedirects.push({from: item.file, to: new URL(page.url()).pathname + new URL(page.url()).search});
        else result.independentPages++;
      }} finally { await context.close(); }
    });
    for (const lang of ['it', 'en', 'de', 'fr']) await capture('No JavaScript ' + lang, async () => {
      const context = await browser.newContext({javaScriptEnabled: false, viewport: {width: 390, height: 844}}), page = await context.newPage();
      try {
        await page.goto(base + '/' + lang + '/?tab=how#how-part-2');
        const visible = await page.locator('#how-part-2').isVisible();
        check(visible, 'Non-JavaScript chapter not readable: ' + lang);
        const href = await page.locator('#how .readerNext a').first().getAttribute('href');
        check(href.endsWith('#beyond'), 'Non-JavaScript next link lacks a real fragment: ' + lang);
        result.noJavaScript.push({lang, readable: visible, href});
      } finally { await context.close(); }
    });
    await capture('Baseline accessibility comparison', async () => {
      execFileSync('git', ['worktree', 'add', '--detach', '/tmp/reader-first-baseline', data.baseline], {cwd: ROOT, stdio: 'pipe'});
      const context = await browser.newContext({viewport: {width: 1280, height: 900}, reducedMotion: 'reduce'}), page = await context.newPage();
      try { for (const id of ['overview', 'how', 'cities', 'research']) for (const variant of ['baseline', 'reader']) {
        await page.goto(base + (variant === 'baseline' ? '/__baseline__' : '') + '/it/?tab=' + id); await ready(page);
        const scan = await new AxeBuilder({page}).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
        result.fullPageAccessibility.push({id, variant, violations: compactAxe(scan.violations)});
      }} finally { await context.close(); }
    });
    await capture('Build determinism and research preservation', async () => {
      const pub = JSON.parse(fs.readFileSync(path.join(ROOT, 'publication.json'), 'utf8'));
      const files = [...new Set([...structure.native.map(p => p.file), ...structure.independent.map(p => p.file), pub.currentDataPackPath, 'research/connecting-the-dots-working-paper-v1.md', 'research/connecting-the-dots-working-paper-v1.html'])];
      const digest = f => crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT, f))).digest('hex');
      const before = Object.fromEntries(files.map(f => [f, digest(f)]));
      execFileSync('python3', ['build.py'], {cwd: ROOT, maxBuffer: 32 * 1024 * 1024, stdio: 'pipe'});
      const changed = files.filter(f => before[f] !== digest(f)); result.deterministicBuild = {files: files.length, changed};
      check(changed.length === 0, 'Non-deterministic rebuild: ' + changed.join(', '));
      const originalFiles = execFileSync('git', ['ls-tree', '-r', '--name-only', data.baseline], {cwd: ROOT, encoding: 'utf8'}).trim().split('\n');
      for (const file of originalFiles.filter(f => /^downloads\/.*\.zip$/.test(f) || /^data\/.*\.csv$/.test(f) || /^data\/.*(?:cases|field_investigations|inside_the_round_events|sanctions_explainer|internet_access_explainer)\.json$/.test(f))) {
        const original = execFileSync('git', ['show', data.baseline + ':' + file], {cwd: ROOT, maxBuffer: 128 * 1024 * 1024});
        const same = original.equals(fs.readFileSync(path.join(ROOT, file)));
        check(same, 'Previously published research file changed: ' + file);
        if (same) (file.endsWith('.zip') ? result.preservedArchives : result.preservedEvidenceFiles).push(file);
      }
    });
  } catch (error) { result.errors.push(error.stack || error.message); }
  finally {
    if (browser) await browser.close(); await new Promise(resolve => server.close(resolve));
    result.passed = result.errors.length === 0;
    fs.writeFileSync(path.join(ROOT, 'docs/reader-first-verification.json'), JSON.stringify(result, null, 2) + '\n');
    console.log('READER_FIRST_BROWSER_RESULT', JSON.stringify(result));
    if (!result.passed) process.exitCode = 1;
  }
})();
