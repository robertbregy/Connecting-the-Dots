/* Targeted narrative corrections. Reparent existing evidence; never rewrite data.
 * Called after legacy heading IDs are assigned and before reader indexes are built.
 */
'use strict';
const assert = require('node:assert/strict');
const labels = {
  it: {
    roadmap: 'Percorso proposto: fasi e decisioni da assumere',
    historyTitle: 'Come leggere il confronto 2012-2026',
    historyBody: 'L\u2019analisi corrente distingue il tema della stringa dall\u2019attivit\u00e0 del candidato. Il confronto storico qui sotto usa invece una classificazione precedente mista: resta consultabile per ricostruire l\u2019analisi, ma non misura la crescita o il declino delle industrie. I cicli economici aiutano a leggere le aspettative; le candidature, da sole, non dimostrano adozione o successo.',
    cycles: 'Torna alla lettura dei cicli economici'
  },
  en: {
    roadmap: 'Proposed pathway: stages and decisions still required',
    historyTitle: 'How to read the 2012-2026 comparison',
    historyBody: 'The current analysis separates the theme of a string from the applicant\u2019s activity. The historical comparison below instead uses an earlier mixed classification: it remains available to reconstruct the analysis, but does not measure the growth or decline of industries. Economic cycles help interpret expectations; applications alone do not demonstrate adoption or success.',
    cycles: 'Return to the discussion of economic cycles'
  },
  de: {
    roadmap: 'Vorgeschlagener Weg: Etappen und noch ausstehende Entscheidungen',
    historyTitle: 'Den Vergleich 2012-2026 richtig einordnen',
    historyBody: 'Die aktuelle Analyse trennt das Thema einer Zeichenfolge von der T\u00e4tigkeit des Bewerbers. Der historische Vergleich unten nutzt dagegen eine fr\u00fchere, gemischte Klassifikation. Er bleibt zur Rekonstruktion der Analyse zug\u00e4nglich, misst aber weder Wachstum noch R\u00fcckgang von Branchen. Wirtschaftszyklen helfen, Erwartungen einzuordnen; Bewerbungen allein belegen weder Nutzung noch Erfolg.',
    cycles: 'Zur\u00fcck zur Einordnung der Wirtschaftszyklen'
  },
  fr: {
    roadmap: 'Parcours propos\u00e9 : \u00e9tapes et d\u00e9cisions restant \u00e0 prendre',
    historyTitle: 'Comment lire la comparaison 2012-2026',
    historyBody: 'L\u2019analyse actuelle distingue le th\u00e8me de la cha\u00eene de l\u2019activit\u00e9 du candidat. La comparaison historique ci-dessous utilise une ancienne classification mixte : elle reste consultable pour reconstituer l\u2019analyse, mais ne mesure ni la croissance ni le d\u00e9clin des industries. Les cycles \u00e9conomiques aident \u00e0 lire les attentes ; les candidatures seules ne d\u00e9montrent ni adoption ni succ\u00e8s.',
    cycles: 'Revenir \u00e0 la lecture des cycles \u00e9conomiques'
  }
};
function refineNarrative(d, lang) {
  const L = labels[lang]; assert.ok(L, 'Missing narrative locale: ' + lang);
  assert.ok(!d.querySelector('[data-narrative-essential]'), 'Narrative correction applied twice');
  const one = selector => {
    const nodes = d.querySelectorAll(selector);
    assert.equal(nodes.length, 1, 'Expected exactly one narrative source: ' + selector);
    return nodes[0];
  };
  const originalIds = [...d.querySelectorAll('[id]')].map(n => n.id);
  const translations = () => [...d.querySelectorAll('[data-i18n]')].map(n => [n.dataset.i18n, n.textContent]).sort((a,b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
  const originalTranslations = translations();
  const links = () => [...d.querySelectorAll('a[href]')].map(a => a.getAttribute('href')).sort();
  const originalLinks = links();
  const removedLabels = [];
  const unwrap = detail => {
    assert.equal(detail.localName, 'details');
    assert.ok(!detail.id, 'A disclosure with a published fragment needs an explicit migration');
    const summary = detail.querySelector(':scope > summary'); assert.ok(summary);
    assert.ok(!summary.id && !summary.querySelector('[id]'), 'Do not remove a published summary anchor');
    removedLabels.push(summary.textContent); summary.remove();
    detail.replaceWith(...Array.from(detail.childNodes));
  };
  const el = (tag, text, cls) => {
    const n = d.createElement(tag); if (text) n.textContent = text; if (cls) n.className = cls; return n;
  };

  // Explain what the publication is at its entrance, not inside optional context.
  const definition = one('[data-i18n="iaProjectDefinition"]');
  one('.hero .heroPlain').after(definition);
  definition.classList.add('heroPlain'); definition.dataset.narrativeEssential = 'project';
  unwrap(one('.homeScope > details.audienceDetails'));
  const foundation = one('.journeyFoundation');
  one('#internet-guide [data-i18n="journeyIntro"]').after(foundation);
  foundation.dataset.narrativeEssential = 'dns-foundation';

  // Both the invitation and the tool are visible. Only technical detail remains optional.
  unwrap(one('.audienceAtlasLink'));
  unwrap(one('.audienceAtlasPanel'));
  const atlas = one('#aps-native'); atlas.dataset.narrativeAtlas = 'visible';
  one('#apsAtlasBridge').dataset.narrativeEssential = 'atlas-entry';

  // Keep the proposal and its conditions together in the primary reading path.
  const uses = one('#lugano-uses-results'), vision = one('#lugano .luganoHero');
  const pillars = one('#lugano .pillarGrid'), roadmap = one('#luganoRoadmap').closest('.panel');
  const detail = vision.closest('details.editorialDetails'); assert.ok(detail && detail.contains(roadmap));
  const summary = detail.querySelector(':scope > summary'); assert.ok(summary);
  const guard = one('#lugano .guardrailNote');
  const immutable = [vision, pillars].map(n => [n, n.innerHTML]);
  uses.querySelector(':scope > h2').after(vision, pillars, guard);
  vision.dataset.narrativeEssential = 'proposal'; pillars.dataset.narrativeEssential = 'principles';
  guard.dataset.narrativeEssential = 'proposal-conditions';
  removedLabels.push(summary.textContent); summary.textContent = L.roadmap;
  detail.dataset.narrativeOptional = 'roadmap';
  assert.deepEqual([...detail.children], [summary, roadmap], 'Only the proposed roadmap belongs in this disclosure');
  assert.ok(!detail.hasAttribute('open'), 'The roadmap remains optional');
  for (const [n, html] of immutable) assert.equal(n.innerHTML, html, 'Proposal evidence changed');

  // An earlier classification stays archived, with its limitation visible before opening it.
  const history = one('#economics .historicalEconomy');
  const guide = el('aside', null, 'note narrativeHistoricalGuide'); guide.id = 'economics-comparison-guide';
  guide.dataset.narrativeEssential = 'historical-context';
  const heading = el('h3', L.historyTitle); heading.id = 'economics-comparison-guide-title';
  guide.setAttribute('aria-labelledby', heading.id);
  guide.append(heading, el('p', L.historyBody));
  const a = el('a', L.cycles, 'sourceChip sectionLink');
  a.href = '?tab=economics#economics-cycles'; a.dataset.openSection = 'economics'; a.dataset.openAnchor = 'economics-cycles';
  guide.append(a); one('#economics-historical-link').before(guide);
  assert.ok(!history.hasAttribute('open'), 'Historical percentages must not be presented as current analysis');

  // Preserve all prior translated text, sources and fragment identities.
  assert.deepEqual(translations(), originalTranslations, 'Original four-language copy changed');
  const retainedLinks = links();
  for (const href of originalLinks) { const i = retainedLinks.indexOf(href); assert.ok(i >= 0, 'Original source link lost: ' + href); retainedLinks.splice(i,1); }
  const nowIds = [...d.querySelectorAll('[id]')].map(n => n.id);
  assert.equal(new Set(nowIds).size, nowIds.length, 'Duplicate narrative fragment');
  for (const id of originalIds) assert.ok(d.getElementById(id), 'Published fragment lost: ' + id);
  for (const n of d.querySelectorAll('[data-narrative-essential]')) assert.equal(n.closest('details'), null, 'Essential explanation is still collapsed');
  return {lang, essentialBlocks: 7, originalTranslatedItems: originalTranslations.length, originalLinks: originalLinks.length, originalIds: originalIds.length, removedNavigationLabels: removedLabels, dataChanged: false};
}
module.exports = {refineNarrative, labels};
