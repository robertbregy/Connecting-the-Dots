/* Audit A01/A03/A04/A05: stable destinations and editorial orientation.
 * Reparent existing content; never change observations, datasets or research archives.
 */
'use strict';
const assert = require('node:assert/strict');
const labels = {
  it: {
    contents: 'In questa pagina', more: 'Approfondimenti', author: 'Trasparenza: la posizione dell\u2019autore',
    lugano: ['Stato e fonti', 'Perch\u00e9 .lugano', 'Governance', 'Usi proposti', 'Rischi e verifiche'],
    sources: ['Come leggere', 'Fonti e metodo', 'Limiti e criteri', 'Versioni e correzioni', 'Segnalare un errore'],
    brief: 'Il punto, in breve', shortcuts: 'Scegli da dove proseguire',
    economicsBrief: 'Registrazioni, siti attivi e candidature non misurano la stessa cosa. Questo capitolo distingue modelli di ricavo, diffusione, casi concreti e aspettative: usa i sei passaggi per seguire il ragionamento oppure vai direttamente ai dati.',
    economicsLinks: ['Capire i modelli', 'Leggere i dati', 'Analisi del round 2026'],
    sourcesBrief: 'Per verificare un\u2019affermazione, parti dalla fonte e dalla data, poi controlla che cosa misura. Metodo e limiti sono separati dalla cronologia delle revisioni; citazioni e dati riutilizzabili sono raggiungibili direttamente.',
    sourcesLinks: ['Come citare', 'Dati e download', 'Cronologia delle revisioni']
  },
  en: {
    contents: 'On this page', more: 'More detail', author: 'Transparency: the author\u2019s position',
    lugano: ['Status and sources', 'Why .lugano', 'Governance', 'Proposed uses', 'Risks and checks'],
    sources: ['How to read', 'Sources and method', 'Limits and criteria', 'Versions and corrections', 'Report an error'],
    brief: 'The point, in brief', shortcuts: 'Choose where to continue',
    economicsBrief: 'Registrations, active websites and applications measure different things. This chapter separates revenue models, reach, concrete cases and expectations: follow the six steps or go straight to the data.',
    economicsLinks: ['Understand the models', 'Read the data', '2026 round analysis'],
    sourcesBrief: 'To verify a claim, start with its source and date, then check what it measures. Methods and limitations are separate from the revision history; citation guidance and reusable data are directly accessible.',
    sourcesLinks: ['How to cite', 'Data and downloads', 'Revision history']
  },
  de: {
    contents: 'Auf dieser Seite', more: 'Vertiefung', author: 'Transparenz: die Position des Autors',
    lugano: ['Stand und Quellen', 'Warum .lugano', 'Governance', 'Vorgeschlagene Nutzung', 'Risiken und Pr\u00fcfung'],
    sources: ['Lesehinweise', 'Quellen und Methode', 'Grenzen und Kriterien', 'Versionen und Korrekturen', 'Fehler melden'],
    brief: 'Das Wichtigste in K\u00fcrze', shortcuts: 'Hier weiterlesen',
    economicsBrief: 'Registrierungen, aktive Websites und Bewerbungen messen unterschiedliche Dinge. Dieses Kapitel trennt Erl\u00f6smodelle, Verbreitung, konkrete F\u00e4lle und Erwartungen: Folgen Sie den sechs Schritten oder gehen Sie direkt zu den Daten.',
    economicsLinks: ['Modelle verstehen', 'Daten einordnen', 'Analyse der Runde 2026'],
    sourcesBrief: 'Um eine Aussage zu pr\u00fcfen, beginnen Sie mit Quelle und Datum und kl\u00e4ren Sie, was gemessen wird. Methode und Grenzen sind vom \u00c4nderungsverlauf getrennt; Zitierhinweise und wiederverwendbare Daten sind direkt erreichbar.',
    sourcesLinks: ['Richtig zitieren', 'Daten und Downloads', '\u00c4nderungsverlauf']
  },
  fr: {
    contents: 'Sur cette page', more: 'Approfondir', author: 'Transparence : la position de l\u2019auteur',
    lugano: ['Statut et sources', 'Pourquoi .lugano', 'Gouvernance', 'Usages propos\u00e9s', 'Risques et v\u00e9rifications'],
    sources: ['Comment lire', 'Sources et m\u00e9thode', 'Limites et crit\u00e8res', 'Versions et corrections', 'Signaler une erreur'],
    brief: 'L\u2019essentiel en bref', shortcuts: 'Choisir la suite de la lecture',
    economicsBrief: 'Enregistrements, sites actifs et candidatures ne mesurent pas la m\u00eame chose. Ce chapitre distingue mod\u00e8les de revenus, diffusion, cas concrets et attentes : suivez les six \u00e9tapes ou acc\u00e9dez directement aux donn\u00e9es.',
    economicsLinks: ['Comprendre les mod\u00e8les', 'Lire les donn\u00e9es', 'Analyse du cycle 2026'],
    sourcesBrief: 'Pour v\u00e9rifier une affirmation, partez de sa source et de sa date, puis examinez ce qui est mesur\u00e9. M\u00e9thode et limites sont s\u00e9par\u00e9es de l\u2019historique des r\u00e9visions ; les indications de citation et les donn\u00e9es r\u00e9utilisables sont directement accessibles.',
    sourcesLinks: ['Comment citer', 'Donn\u00e9es et t\u00e9l\u00e9chargements', 'Historique des r\u00e9visions']
  }
};
const aliases = {
  'social-part-2': '#social .crossRoundDisclosure > summary',
  'contention-part-1': '#contention .crossRoundDisclosure > summary',
  'disputes-part-2': '#disputes .crossRoundDisclosure > summary',
  'strange-part-2': '#strange .semanticDriftPanel'
};
function el(d, tag, text, cls) {
  const n=d.createElement(tag); if(text!=null)n.textContent=text; if(cls)n.className=cls; return n;
}
function jump(d, text, tab, id) {
  assert.ok(d.getElementById(id), 'Missing curated destination: '+id);
  const a=el(d,'a',text); a.href='?tab='+tab+'#'+id; a.dataset.openSection=tab; a.dataset.openAnchor=id; return a;
}
function refine(d, lang) {
  assert.ok(labels[lang]);
  const original = [...d.querySelectorAll('[data-i18n]')].map(n=>[n.dataset.i18n,n.textContent]).sort();
  const oldIds = [...d.querySelectorAll('[id]')].map(n=>n.id);
  for(const [id, selector] of Object.entries(aliases)) {
    const matches=d.querySelectorAll(selector); assert.equal(matches.length,1,selector);
    const target=matches[0]; assert.ok(!target.id || target.id===id,'Existing anchor must not be renamed');
    assert.ok(!d.getElementById(id) || d.getElementById(id)===target,'Duplicate legacy destination');
    target.id=id; target.dataset.usabilityLegacy='20261022';
  }
  // DOM order, not CSS ordering: keyboard and visual reading sequences agree.
  const actions=d.querySelector('.heroActions'), intro=d.querySelector('.hero [data-i18n="heroBody"]');
  assert.ok(actions&&intro); intro.after(actions);
  d.querySelector('.hero').dataset.usabilityEntry='action-first';
  let cleaned=0;
  for(const a of d.querySelectorAll('nav.sectionToc a[title],#iaLegacyNavDisclosure a[title]')) {
    if(/\/\* Normalize legacy language|\(function\(\)\{|document\.documentElement/.test(a.getAttribute('title'))) {
      a.removeAttribute('title'); cleaned++;
    }
  }
  assert.deepEqual([...d.querySelectorAll('[data-i18n]')].map(n=>[n.dataset.i18n,n.textContent]).sort(),original,'Original localized text changed');
  for(const id of oldIds)assert.ok(d.getElementById(id),'Original anchor lost: '+id);
  return {aliases:Object.keys(aliases),homeActionBeforeDefinitions:true,legacyTooltipsCleaned:cleaned};
}
function curatedToc(d, section, lang) {
  if(!['lugano','sources'].includes(section.id))return null;
  const L=labels[lang], id=section.id;
  const heading = selector => {const n=section.querySelector(selector);assert.ok(n&&n.id,selector);return n;};
  const groups = id==='lugano' ? [
    [heading('#lugano-status-sources > h2'), '#lugano-status-sources h2'],
    [heading('[data-i18n="luganoWhyTitle"]'), '.luganoSwissCase h2'],
    [heading('#lugano-governance-decisions > h2'), '#lugano-governance-decisions h2'],
    [heading('#lugano-uses-results > h2'), '#lugano-uses-results h2'],
    [heading('#lugano-risks-checks > h2'), '#lugano-risks-checks h2']
  ] : [
    [heading('#sources-part-3'), null],
    [heading('#sources-part-4'), null],
    [heading('#sources-part-5'), '#sources-part-2'],
    [heading('#sources-part-6'), '#audit-documentary-corrections h3'],
    [heading('#report-error'), null]
  ];
  const nav=el(d,'nav',null,'readerToc readerTocCurated'); nav.dataset.readerUi=''; nav.setAttribute('aria-label',L.contents);
  const disclosure=el(d,'details');disclosure.setAttribute('open','');
  disclosure.append(el(d,'summary',L.contents));
  const list=el(d,'ol',null,'readerTocPrimary');
  for(const [index,[main,selector]] of groups.entries()) {
    const item=el(d,'li');item.append(jump(d,L[id][index],id,main.id));
    const secondary=selector ? [...section.querySelectorAll(selector)].filter(n=>n!==main) : [];
    if(secondary.length) {
      const detail=el(d,'details',null,'readerTocGroup');
      const summary=el(d,'summary',L.more);summary.setAttribute('aria-label',L.more+': '+L[id][index]);
      const sub=el(d,'ol');
      for(const n of secondary) {
        if(!n.id)n.id='reader-detail-'+id+'-'+index+'-'+sub.children.length;
        const li=el(d,'li');li.append(jump(d,n.textContent.trim(),id,n.id));sub.append(li);
      }
      detail.append(summary,sub);item.append(detail);
    }
    list.append(item);
  }
  disclosure.append(list);
  const author=heading('[data-i18n="authorDisclosureTitle"]');
  const transparency=el(d,'p',null,'readerTocTransparency');transparency.append(jump(d,L.author,id,author.id));disclosure.append(transparency);
  nav.append(disclosure);return nav;
}
function brief(d, id, lang) {
  if(!['economics','sources'].includes(id))return null;
  const L=labels[lang], box=el(d,'aside',null,'readerBrief');box.dataset.readerUi='';box.id='reader-brief-'+id;
  const title=el(d,'p',L.brief,'readerBriefTitle');title.id=box.id+'-title';box.setAttribute('aria-labelledby',title.id);
  box.append(title,el(d,'p',L[id+'Brief']));
  const targets=id==='economics' ? [['economics','economics-value'],['economics','economics-reach'],['economics','economics-round2026']] : [['research','research-citation-guide'],['resources','reader-downloads'],['sources','publication-updates']];
  const nav=el(d,'nav',null,'readerBriefLinks');nav.setAttribute('aria-label',L.shortcuts);
  targets.forEach(([tab,anchor],i)=>nav.append(jump(d,L[id+'Links'][i],tab,anchor)));box.append(nav);return box;
}
module.exports={refine,curatedToc,brief,aliases,labels};
