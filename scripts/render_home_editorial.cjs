/* HOME106: a single explanatory opening over the unchanged research publication. */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {parseHTML} = require('linkedom');
const root = path.resolve(__dirname, '..');
const content = JSON.parse(fs.readFileSync(path.join(root, 'data/home_editorial.json'), 'utf8'));
const publication = JSON.parse(fs.readFileSync(path.join(root, 'publication.json'), 'utf8'));
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
// Keep real fragment targets so the same links also navigate without JavaScript.
const route = (section, anchor = '') => '?tab=' + section + '#' + (anchor || section);
const destination = (section, anchor = '') => 'href="' + route(section, anchor) + '" data-open-section="' + escape(section) + '"' + (anchor ? ' data-open-anchor="' + escape(anchor) + '"' : '');
const sectionHead = (text, id) => '<div class="homeSectionHead"><p class="eyebrow">' + escape(text.eyebrow) + '</p><h2 id="' + id + '">' + escape(text.title) + '</h2>' + (text.lead ? '<p>' + escape(text.lead) + '</p>' : '') + '</div>';
const expectedPathways = ['ia-understand', 'ia-explore', 'ia-stories', 'ia-outcomes', 'ia-round', 'ia-research'];
const report = [];

for (const language of ['en', 'it', 'de', 'fr']) {
  const t = content.locales[language];
  assert.ok(t && t.title && t.project && t.seoDescription, 'Incomplete home copy: ' + language);
  assert.deepEqual(t.pathways.items.map(item => item.id), expectedPathways, 'The six established paths must remain available');
  assert.equal(t.stories.items.length, 3);
  for (const filename of [language + '/index.html', ...(language === 'en' ? ['index.html'] : [])]) {
    const prefix = filename === 'index.html' ? '' : '../';
    const file = path.join(root, filename);
    const {document} = parseHTML(fs.readFileSync(file, 'utf8'));
    const make = html => { const node = document.createElement('div'); node.innerHTML = html; return node.firstElementChild; };
    const oldHero = document.querySelector('.hero');
    const overview = document.getElementById('overview');
    assert.ok(oldHero && overview, 'Missing native home: ' + filename);
    // Deep links and substantive tutorials are retained as real, accessible content.
    const existingIds = [...overview.querySelectorAll('[id]')].map(node => node.id);
    const quickGuide = document.getElementById('three-minute-guide');
    const internetGuide = document.getElementById('internet-guide');
    const byline = document.querySelector('.projectByline');
    const publicationState = document.querySelector('.publicationState');
    const legend = document.querySelector('.epistemicLegend');
    assert.ok(quickGuide && internetGuide && byline && publicationState && legend, 'Missing retained home content');
    const tutorials = [quickGuide, internetGuide].map(node => [node, node.outerHTML]);
    const untouchedSections = [...document.querySelectorAll('section.section')].filter(node => node !== overview).map(node => [node, node.outerHTML]);
    const hero = make('<section class="hero homeHero" aria-labelledby="home-title"><div class="homeHeroGrid"><div class="homeHeroCopy">' +
      '<p class="eyebrow">' + escape(t.eyebrow) + '</p><h1 id="home-title" class="siteTitle">' + escape(t.title) + '</h1>' +
      '<p class="homeHeroLead">' + escape(t.lead) + '</p>' +
      '<div class="heroActions"><a class="control heroPrimary" ' + destination('how', 'how-part-2') + '>' + escape(t.primaryCta) + '</a><a class="control heroSecondary" ' + destination('explore') + '>' + escape(t.secondaryCta) + '</a></div>' +
      '<p class="homeHeroIntro">' + escape(t.intro) + '</p><p class="homeHeroProject">' + escape(t.project) + '</p>' +
      '<p class="homeByline">' + escape(t.byline) + '</p></div>' +
      '<figure class="homeDomain" aria-labelledby="home-domain-title"><figcaption id="home-domain-title" class="homeDomainKicker">' + escape(t.domain.eyebrow) + '</figcaption>' +
      '<div class="homeDomainDrawing"><p class="homeDomainLabel">' + escape(t.domain.label) + '</p><div class="homeDomainName"><span class="homeDomainWord">example</span><span class="homeDomainTld"><span class="homeDomainDot">.</span>com</span></div>' +
      '<div class="homeDomainAnnotation"><strong>' + escape(t.domain.tldLabel) + '</strong><span>' + escape(t.domain.tldBody) + '</span></div></div>' +
      '<p class="homeDomainExplain">' + escape(t.domain.explain) + '</p><ul class="homeDomainExamples">' + t.domain.examples.map(example => '<li><span>' + escape(example.name) + '</span><small>' + escape(example.label) + '</small></li>').join('') + '</ul></figure></div></section>');
    oldHero.replaceWith(hero);

    const origins = make('<section class="homeOrigins homeBlock" id="tld-cultural-home" aria-labelledby="home-origins-title">' + sectionHead(t.origins, 'home-origins-title') +
      '<div class="homeOriginsBody"><p>' + escape(t.origins.body) + '</p><a class="homeTextLink" ' + destination('timeline', 'cultural-epoch-map') + '>' + escape(t.origins.linkLabel) + '<span aria-hidden="true"> →</span></a>' +
      '<details class="homeSource"><summary>' + escape(t.origins.sourceLabel) + '</summary><ul><li><a href="https://www.rfc-editor.org/rfc/rfc882" target="_blank" rel="noopener noreferrer">RFC 882 · Domain names: concepts and facilities · 1983</a></li><li><a href="https://www.rfc-editor.org/rfc/rfc1034" target="_blank" rel="noopener noreferrer">RFC 1034 · Domain names: concepts and facilities · 1987</a></li></ul></details></div>' +
      '<details class="homeJourneyDisclosure"><summary><strong>' + escape(t.origins.journeyTitle) + '</strong><span>' + escape(t.origins.journeyBody) + '</span></summary></details></section>');
    origins.querySelector('.homeJourneyDisclosure').append(internetGuide);

    const stories = make('<section class="homeStories homeBlock" id="home-stories" aria-labelledby="home-stories-title">' + sectionHead(t.stories, 'home-stories-title') +
      '<div class="homeStoryGrid">' + t.stories.items.map(story => '<a class="audienceDiscovery homeStory sectionLink" ' + destination(story.tab, story.anchor) + '><span class="discoveryName">' + escape(story.name) + '</span><div class="homeStoryCopy"><h3>' + escape(story.title) + '</h3><p>' + escape(story.body) + '</p></div><span class="homeStoryArrow" aria-hidden="true">↗</span></a>').join('') + '</div></section>');
    stories.append(quickGuide);

    const pathways = make('<section class="homePathways homeBlock" id="home-pathways" aria-labelledby="home-pathways-title">' + sectionHead(t.pathways, 'home-pathways-title') +
      '<nav class="iaHomeJumpList" aria-labelledby="home-pathways-title">' + t.pathways.items.map(item => '<a class="sectionLink" ' + destination(item.id) + '><span>' + escape(item.title) + '</span><small>' + escape(item.body) + '</small></a>').join('') + '</nav></section>');

    const round = make('<section class="homeRound homeBlock" id="home-round" aria-labelledby="home-round-title">' + sectionHead(t.round, 'home-round-title') +
      '<div class="homeRoundCopy"><p>' + escape(t.round.body) + '</p><a class="homeTextLink" ' + destination('ia-round') + '>' + escape(t.round.linkLabel) + '<span aria-hidden="true"> →</span></a></div></section>');
    publicationState.setAttribute('aria-label', t.round.statusLabel);
    round.append(publicationState);

    const project = make('<section class="homeProject homeBlock" id="home-project" aria-labelledby="home-project-title">' + sectionHead(t.projectInfo, 'home-project-title') +
      '<p class="homeProjectBody">' + escape(t.projectInfo.body) + '</p><details class="homeMethod"><summary>' + escape(t.projectInfo.methodLabel) + '</summary></details>' +
      '<nav class="homeProjectLinks" aria-labelledby="home-project-title"><a ' + destination('sources') + '>' + escape(t.projectInfo.methodLabel) + '</a><a class="readerResearchCta" ' + destination('research', 'research-citation-guide') + '>' + escape(t.projectInfo.researchLabel) + '</a><a href="' + prefix + 'discovery/' + language + '/">' + escape(t.projectInfo.guidesLabel) + '</a></nav></section>');
    project.querySelector('.homeProjectBody').after(byline);
    project.querySelector('.homeMethod').append(legend);
    overview.classList.add('homeEditorial');
    overview.replaceChildren(origins, stories, pathways, round, project);
    for (const id of existingIds) assert.ok(document.getElementById(id), 'Lost home fragment: ' + filename + '/' + id);
    for (const [node, before] of [...tutorials, ...untouchedSections]) assert.equal(node.outerHTML, before, 'Home redesign altered an existing tutorial or chapter');
    for (const link of [...hero.querySelectorAll('[data-open-section]'), ...overview.querySelectorAll('[data-open-section]')]) {
      const target = document.getElementById(link.dataset.openSection);
      assert.ok(target, 'Missing home destination ' + link.dataset.openSection);
      if (link.dataset.openAnchor) assert.ok(document.getElementById(link.dataset.openAnchor), 'Missing home anchor ' + link.dataset.openAnchor);
    }
    for (const selector of ['meta[name="description"]', 'meta[property="og:description"]', 'meta[name="twitter:description"]']) {
      const meta = document.querySelector(selector); if (meta) meta.setAttribute('content', t.seoDescription);
    }
    for (const oldSheet of document.querySelectorAll('link[href*="assets/home-editorial.css"]')) oldSheet.remove();
    const sheet = document.createElement('link'); sheet.rel = 'stylesheet'; sheet.href = prefix + 'assets/home-editorial.css?v=' + publication.version;
    document.head.append(sheet);
    fs.writeFileSync(file, '<!DOCTYPE html>\n' + document.documentElement.outerHTML + '\n');
    report.push({file: filename,language,retainedHomeFragments: existingIds.length,unchangedChapters: untouchedSections.length,unchangedTutorials: tutorials.length});
  }
}
console.log('HOME_EDITORIAL_RENDERED', JSON.stringify({version: publication.version,pages: report}));
