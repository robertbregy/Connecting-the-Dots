/* Reader-first presentation. Existing article nodes are moved, never summarized or replaced.
   This build stage runs after the native chapters and the Economics reading order. */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {parseHTML} = require('linkedom');
const ROOT = path.resolve(__dirname, '..');
const DATA = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/reader_paths.json'), 'utf8'));
const PUB = JSON.parse(fs.readFileSync(path.join(ROOT, 'publication.json'), 'utf8'));
const LANGS = ['en', 'it', 'de', 'fr'];
const AREA_KEYS = Object.keys(DATA.areas);
const CHAPTERS = AREA_KEYS.flatMap(k => DATA.areas[k]);
assert.equal(new Set(CHAPTERS).size, 24);

function element(doc, tag, text, className) {
  const node = doc.createElement(tag);
  if (text) node.textContent = text;
  if (className) node.className = className;
  return node;
}
function localLink(doc, label, chapter, anchor = chapter, prefix = '') {
  const a = element(doc, 'a', label, 'sectionLink');
  a.setAttribute('href', prefix + '?tab=' + encodeURIComponent(chapter) + '#' + encodeURIComponent(anchor));
  if (!prefix) {
    a.dataset.openSection = chapter;
    if (anchor !== chapter) a.dataset.openAnchor = anchor;
  }
  return a;
}
function ensureAssets(doc, relativeRoot) {
  for (const [tag, attr, name] of [['link', 'href', 'reader-paths.css'], ['script', 'src', 'reader-paths.js']]) {
    let node = [...doc.querySelectorAll(tag + '[' + attr + ']')].find(n => n.getAttribute(attr).split('?')[0].endsWith('/' + name));
    if (!node) {
      node = element(doc, tag);
      if (tag === 'link') { node.rel = 'stylesheet'; doc.head.append(node); }
      else { node.setAttribute('defer', ''); doc.body.append(node); }
    }
    node.setAttribute(attr, relativeRoot + 'assets/' + name + '?v=' + PUB.version);
  }
}
function breadcrumb(doc, t, chapter) {
  const key = AREA_KEYS.find(k => DATA.areas[k].includes(chapter));
  assert.ok(key, 'Unclassified chapter ' + chapter);
  const nav = element(doc, 'nav', null, 'readerBreadcrumb');
  nav.setAttribute('aria-label', t.breadcrumb);
  const home = element(doc, 'a', t.home); home.href = './'; nav.append(home);
  const divider = () => { const n = element(doc, 'span', '/'); n.setAttribute('aria-hidden', 'true'); return n; };
  nav.append(divider(), localLink(doc, t.areas[AREA_KEYS.indexOf(key)], 'ia-' + key), divider());
  const current = element(doc, 'span', t.names[chapter]);
  current.setAttribute('aria-current', 'page'); nav.append(current);
  return nav;
}
function nextPaths(doc, t, chapter, prefix = '') {
  const nav = element(doc, 'nav', null, 'readerPaths');
  nav.setAttribute('aria-label', t.nextTitle);
  nav.append(element(doc, 'h3', t.nextTitle, 'readerPathsHeading'));
  const links = element(doc, 'div', null, 'readerPathsLinks');
  DATA.next[chapter].forEach(([target, anchor], i) => {
    if (!prefix) {
      const section = doc.getElementById(target), end = doc.getElementById(anchor);
      assert.ok(section && end && (section === end || section.contains(end)), 'Invalid reader destination ' + target + '#' + anchor);
    }
    const title = anchor === 'aps-native' ? t.atlas : t.names[target];
    const a = localLink(doc, '', target, anchor, prefix); a.classList.add('readerPathsLink');
    a.append(element(doc, 'span', i ? t.deeper : t.next, 'readerPathsLabel'), element(doc, 'strong', title));
    const arrow = element(doc, 'span', '\u2192', 'readerPathArrow'); arrow.setAttribute('aria-hidden', 'true'); a.append(arrow);
    links.append(a);
  });
  nav.append(links); return nav;
}
function makeIndex(doc, t, sec, originalToc) {
  const headings = [...sec.querySelectorAll('h2')].filter(h => h.textContent.trim() && !h.closest('nav'));
  if (headings.length < 4 && !originalToc) return null;
  const details = element(doc, 'details', null, 'readerFullIndex');
  details.dataset.readerIndex = sec.id;
  details.append(element(doc, 'summary', t.allTopics));
  const nav = originalToc || element(doc, 'nav', null, 'readerIndexLinks');
  // Use the original links, in the new reading order, and include every visible heading.
  const links = [...nav.querySelectorAll('a[href]')];
  const unused = new Set(links);
  for (let i = 0; i < headings.length; i++) {
    const h = headings[i];
    if (!h.id) h.id = 'reader-' + sec.id + '-heading-' + (i + 1);
    let a = links.find(n => n.getAttribute('href').split('#')[1] === h.id);
    if (a) { unused.delete(a); a.dataset.openSection=sec.id; a.dataset.openAnchor=h.id; nav.append(a); }
    else { a = localLink(doc, h.textContent.trim(), sec.id, h.id); a.classList.add('tocLink'); nav.append(a); }
  }
  for (const a of unused) nav.append(a);
  nav.setAttribute('aria-label', t.allTopics); details.append(nav); return details;
}
function mainPage(doc, lang, file) {
  assert.ok(!doc.querySelector('[data-reader-revision]'), 'Reader stage applied twice to ' + file);
  const t = DATA.locales[lang];
  const oldIds = [...doc.querySelectorAll('[id]')].map(n => n.id);
  const report = {file, lang, chapters: 0, reordered: [], originalBlocks: 0, retainedFragments: oldIds.length, steps: 0};
  for (const chapter of CHAPTERS) {
    const sec = doc.getElementById(chapter);
    assert.ok(sec && sec.classList.contains('section'), 'Missing native chapter ' + chapter);
    const toc = sec.querySelector(':scope > nav.sectionToc');
    const nodes = [...sec.children].filter(n => n !== toc);
    const snapshots = nodes.map(node => ({node, text: node.textContent, hrefs: [...node.querySelectorAll('a[href]')].map(a => a.getAttribute('href')).sort()}));
    const order = DATA.orders[chapter];
    if (order) {
      assert.equal(order.length, nodes.length, 'Unexpected block count in ' + chapter);
      assert.deepEqual([...order].sort((a,b)=>a-b), nodes.map((_,i)=>i), 'Incomplete order in ' + chapter);
      for (const i of order) sec.append(nodes[i]);
      report.reordered.push(chapter);
    }
    sec.dataset.readerRevision = DATA.revision;
    const stops = DATA.stops[chapter];
    let guide;
    if (stops) {
      assert.equal(stops.length, t.labels[chapter].length, 'Missing localized guide label ' + chapter);
      guide = element(doc, 'div', null, 'readerGuide');
      guide.id = 'reader-guide-' + chapter;
      guide.append(element(doc, 'p', t.leads[chapter], 'readerGuideLead'));
      const nav = element(doc, 'nav', null, 'readerGuideSteps');
      nav.setAttribute('aria-label', t.guide);
      const list = element(doc, 'ol'); list.setAttribute('role','list');
      stops.forEach((index, i) => {
        const target = nodes[index]; assert.ok(target, 'Missing reading stop in ' + chapter);
        if (!target.id) target.id = 'reader-' + chapter + '-block-' + (index + 1);
        target.classList.add('readerStopTarget');
        const li = element(doc, 'li');
        li.append(localLink(doc, t.labels[chapter][i], chapter, target.id)); list.append(li);
      });
      nav.append(list); guide.append(nav); report.steps += stops.length;
    }
    if (chapter !== 'economics') {
      const index = makeIndex(doc, t, sec, toc);
      if (index) {
        sec.dataset.readerHasIndex = '';
        if (guide) guide.append(index);
        else {
          guide = element(doc, 'div', null, 'readerGuide readerGuideCompact');
          guide.id = 'reader-guide-' + chapter; guide.append(index);
        }
      }
    }
    // Keep an existing chapter opener ahead of its index. Mechanical reference
    // chapters start with the guide, so readers need not scroll through a diagram first.
    if (guide) {
      const first = sec.firstElementChild;
      const afterOpener = !['how', 'resources'].includes(chapter) && first;
      if (afterOpener) first.after(guide); else sec.prepend(guide);
    }
    sec.prepend(breadcrumb(doc, t, chapter));
    sec.append(nextPaths(doc, t, chapter));
    for (const saved of snapshots) {
      assert.ok(sec.contains(saved.node), 'Lost block in ' + chapter);
      assert.equal(saved.node.textContent, saved.text, 'Changed original wording in ' + chapter);
      assert.deepEqual([...saved.node.querySelectorAll('a[href]')].map(a => a.getAttribute('href')).sort(), saved.hrefs, 'Lost original source link in ' + chapter);
    }
    report.originalBlocks += nodes.length;
    report.chapters++;
  }
  const heroActions = doc.querySelector('.heroActions');
  assert.ok(heroActions && !heroActions.querySelector('.readerResearchEntry'));
  const research = localLink(doc, t.researchEntry, 'research', 'research-citation-guide');
  research.className = 'control sectionLink readerResearchEntry'; heroActions.append(research);
  // The story landing starts with approachable examples, then social identity,
  // city choices and economics. Every original card and its destination is retained.
  const hub = doc.querySelector('#ia-stories > .iaHubGrid');
  const cards = [...hub.children];
  for (const id of ['strange', 'social', 'cities', 'economics']) {
    const card = cards.find(n => n.querySelector('[data-open-section="' + id + '"]'));
    assert.ok(card); hub.append(card);
  }
  assert.equal(hub.children.length, cards.length);
  for (const id of oldIds) assert.ok(doc.getElementById(id), 'Lost pre-existing fragment ' + id);
  ensureAssets(doc, file === 'index.html' ? '' : '../');
  return report;
}
function independentPage(html, lang, file) {
  if (/id="ctd-native-redirect"/.test(html)) return null;
  // Preserve the byte representation of independent research articles. A full
  // reserialization would silently normalize entities used by archival checks.
  html=html.replace(/<!-- CTD_READER_(?:FOOTER|SKIP|ASSETS) -->[\s\S]*?<!-- \/CTD_READER_(?:FOOTER|SKIP|ASSETS) -->/g,'');
  const {document:doc}=parseHTML(html),main=doc.querySelector('main'); if(!main)return null;
  const t=DATA.locales[lang],prefix=path.posix.relative(path.posix.dirname(file),lang)+'/';
  const chapter=file.startsWith('inside-the-round/')?'inside-round':
    file.startsWith('behind-the-round/')?'behind-round':
    file.startsWith('applications/')||file.startsWith('explorer/')?'explore':'research';
  const originalText=main.textContent;
  let mainId=main.id;
  if(!mainId){mainId='reader-main-content';main.setAttribute('tabindex','-1');html=html.replace(/<main(\s[^>]*)?>/,m=>m.slice(0,-1)+' id="'+mainId+'" tabindex="-1">');}
  if(!doc.querySelector('a[href="#'+mainId+'"]')){
    const skip=element(doc,'a',t.skip,'readerStandaloneSkip');skip.href='#'+mainId;
    if(!main.hasAttribute('tabindex'))html=html.replace(/<main(\s[^>]*)?>/,m=>m.slice(0,-1)+' tabindex="-1">');
    html=html.replace(/<body(\s[^>]*)?>/,m=>m+'<!-- CTD_READER_SKIP -->'+skip.outerHTML+'<!-- /CTD_READER_SKIP -->');
  }
  const title=main.querySelector('h1,h2');
  if(title){
    const safe=element(doc,'span',title.textContent.trim()).innerHTML;
    html=html.replace(/<nav[^>]*class="ctdB2Trail"[^>]*>[\s\S]*?<\/nav>/,nav=>nav.replace(/(<span[^>]*aria-current="page"[^>]*>)[\s\S]*?(<\/span>)/,'$1'+safe.replace(/\$/g,'$$$$')+'$2'));
  }
  const nav=element(doc,'nav',null,'readerPaths readerStandalonePaths');
  nav.setAttribute('aria-label',t.nextTitle);nav.append(element(doc,'h2',t.nextTitle,'readerPathsHeading'));
  const links=element(doc,'div',null,'readerPathsLinks');
  for(const [i,target]of[chapter,'sources'].entries()){
    const a=localLink(doc,'',target,target,prefix);a.className='readerPathsLink';
    a.append(element(doc,'span',i?t.reference:t.back,'readerPathsLabel'),element(doc,'strong',t.names[target]));links.append(a);
  }
  nav.append(links);
  html=html.replace('</main>','<!-- CTD_READER_FOOTER -->'+nav.outerHTML+'<!-- /CTD_READER_FOOTER --></main>');
  const base=path.posix.relative(path.posix.dirname(file),'.')+'/';
  html=html.replace('</head>','<!-- CTD_READER_ASSETS --><link rel="stylesheet" href="'+base+'assets/reader-paths.css?v='+PUB.version+'"><!-- /CTD_READER_ASSETS --></head>');
  const {document:check}=parseHTML(html);check.querySelector('.readerStandalonePaths').remove();
  assert.equal(check.querySelector('main').textContent,originalText,'Independent article text changed: '+file);
  return {html,result:{file,lang,context:chapter}};
}

function walk(dir) {
  return fs.readdirSync(dir, {withFileTypes:true}).flatMap(e => e.isDirectory() ? walk(path.join(dir,e.name)) : e.name.endsWith('.html') ? [path.join(dir,e.name)] : []);
}
function run() {
  const report = {revision:DATA.revision, version:PUB.version, main:[], independent:[], evidence:'All captured article blocks retain exact text and original link destinations. No human usability study is claimed.'};
  for (const [lang, name] of [['en', 'index.html'], ...LANGS.map(l=>[l,l+'/index.html'])]) {
    const f=path.join(ROOT,name), {document}=parseHTML(fs.readFileSync(f,'utf8'));
    report.main.push(mainPage(document,lang,name)); fs.writeFileSync(f,'<!DOCTYPE html>\n'+document.documentElement.outerHTML+'\n');
  }
  for (const dir of ['applications','behind-the-round','inside-the-round','explorer','research']) {
    for (const f of walk(path.join(ROOT,dir))) {
      const html=fs.readFileSync(f,'utf8');
      if (!html.includes('class="ctdB2CrossNav"')) continue;
      const {document}=parseHTML(html), name=path.relative(ROOT,f).split(path.sep).join('/');
      const lang=document.documentElement.lang.slice(0,2)||'en';
      const rendered=independentPage(html,lang,name);
      if (rendered) { report.independent.push(rendered.result); fs.writeFileSync(f,rendered.html); }
    }
  }
  assert.equal(report.independent.length,31,'Independent active page coverage changed');
  fs.mkdirSync(path.join(ROOT,'artifacts/reader-review'),{recursive:true});
  fs.writeFileSync(path.join(ROOT,'artifacts/reader-review/preservation.json'),JSON.stringify(report,null,2)+'\n');
  console.log('READER_PATHS_PRESERVED '+JSON.stringify({pages:report.main.length,chaptersPerPage:24,reorderedPerPage:12,independent:report.independent.length,oldArticleText:'exact',oldLinks:'retained'}));
}
module.exports={mainPage,independentPage};
if(require.main===module)run();
