/* One mutable manuscript source and one publication metadata record.
   Historical revision notes and archived research identities are not rewritten. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {marked}=require('marked');
const {parseHTML}=require('linkedom');
const root=path.resolve(__dirname,'..');
const pub=JSON.parse(fs.readFileSync(path.join(root,'publication.json'),'utf8'));
const revised=new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(pub.paperRevisedOn+'T00:00:00Z'));
const technicalSync=new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date((pub.paperTechnicalSyncOn||pub.releasedOn)+'T00:00:00Z'));
const mdPath=path.join(root,'research/connecting-the-dots-working-paper-v1.md');
let md=fs.readFileSync(mdPath,'utf8');
const heading=/\*\*Working Paper v[^*]+\*\*/g;
assert.equal([...md.matchAll(heading)].length,1);
md=md.replace(heading,`**Working Paper v${pub.paperVersion} · living revision ${revised} · current citable research release RR2 (Zenodo: 11 October 2026; evidence cutoff: 10 October)**`);
md=md.replace(/Current technical data package \*\*v[0-9.]+\*\* \(not a new Zenodo release\): https:\/\/robertbregy.github.io\/Connecting-the-Dots\/downloads\/connecting-the-dots-data-pack-v[0-9.]+\.zip/,
 'Current technical data package: see the live Research & citation landing page. This operational reference is synchronized separately and does not change the manuscript revision date.');
fs.writeFileSync(mdPath,md);
const file=path.join(root,pub.paperPath),{document}=parseHTML(fs.readFileSync(file,'utf8'));
const main=document.querySelector('main');assert.ok(main);
main.innerHTML=marked.parse(md,{gfm:true});
document.title='Connecting the Dots · Working Paper v'+pub.paperVersion;
document.querySelector('meta[name="description"]').setAttribute('content','Living working paper on TLD expansion and ICANN applications. Cites archived RR1 and RR2 evidence and distinguishes the later, separately versioned APS analysis.');
for(const tag of document.querySelectorAll('script[type="application/ld+json"]')){
 const value=JSON.parse(tag.textContent);
 if(value['@type']==='ScholarlyArticle'){
  value.dateModified=pub.paperRevisedOn;value.version=pub.paperVersion;
  delete value.isPartOf;
  value.isBasedOn=[
   {'@type':'Dataset',name:'Connecting the Dots · Research Release RR1',identifier:'https://doi.org/10.5281/zenodo.23262623'},
   {'@type':'Dataset',name:'Connecting the Dots · Research Release RR2',identifier:'https://doi.org/10.5281/zenodo.23288603'},
   {'@type':'Dataset',name:'Connecting the Dots · Current APS analytical layer',version:'aps-current-analytics-2026-10-18',url:pub.deployment+'data/aps_2026_current_analytics_manifest.json'}
  ];
  tag.textContent=JSON.stringify(value);
 }
}
let digest=document.querySelector('meta[name="ctd-paper-source-sha256"]');
if(!digest){digest=document.createElement('meta');digest.setAttribute('name','ctd-paper-source-sha256');document.head.append(digest);}
digest.setAttribute('content',crypto.createHash('sha256').update(md).digest('hex'));
let syncMeta=document.querySelector('meta[name="ctd-paper-technical-sync"]');
if(!syncMeta){syncMeta=document.createElement('meta');syncMeta.setAttribute('name','ctd-paper-technical-sync');document.head.append(syncMeta);}
syncMeta.setAttribute('content',(pub.paperTechnicalSyncOn||pub.releasedOn)+'; site '+pub.version+'; data '+pub.currentDataPackVersion);
const syncNote=document.createElement('aside');
syncNote.setAttribute('class','technicalSyncNote');
syncNote.setAttribute('aria-label','Technical reference synchronization');
syncNote.innerHTML='<strong>Technical reference synchronization</strong><p>The manuscript remains <strong>v'+pub.paperVersion+'</strong>, revised '+revised+'. The live site currently points to technical data package <strong>v'+pub.currentDataPackVersion+'</strong>, synchronized '+technicalSync+'. This operational pointer is outside the scholarly manuscript and does not redate its analysis.</p><p><a href="../'+pub.currentDataPackPath+'">Current technical data package</a> · <a href="./">Research &amp; citation</a></p>';
main.append(syncNote);
fs.writeFileSync(file,document.toString().trimEnd()+'\n');

const landingPath=path.join(root,'research/index.html');
let landing=fs.readFileSync(landingPath,'utf8');
landing=landing.replace(/independently revisable v[\d.]+(?:-draft)? draft \(revised [^)]+\)/,`independently revisable v${pub.paperVersion} manuscript (revised ${revised})`);
landing=landing.replace(/independently revisable v[\d.]+-draft manuscript \(revised [^)]+\)/,`independently revisable v${pub.paperVersion} manuscript (revised ${revised})`);
landing=landing.replace(/connecting-the-dots-data-pack-v[\d.]+\.zip/g,path.basename(pub.currentDataPackPath));
landing=landing.replace(/Current technical data pack \(v[\d.]+,/g,`Current technical data pack (v${pub.currentDataPackVersion},`);
landing=landing.replace(/Current technical data ZIP v[\d.]+/g,`Current technical data ZIP v${pub.currentDataPackVersion}`);
const current=`<section id="research-current-analysis"><h2>Current analysis beyond the archived releases</h2><p>The <strong>18 October 2026 analytical layer</strong> is built on 1,614 official APS Application IDs acquired on 11 October. Its comparable subset has 1,608 applications, excluding six existing-TLD variant applications. String theme, documented applicant activity and source naming flags are separate variables; unclassified cases and denominators are retained.</p><p>This new analysis is a working research output and is <strong>not covered by the RR1 or RR2 DOI</strong>. Use its versioned technical package and source hash for reproduction. A future research release must archive the new methods and results before they are cited as a new DOI-backed dataset. The earlier mixed economic reconstruction remains explicitly historical.</p><p><a href="${pub.deployment}data/aps_2026_current_analytics.csv">Current application-level CSV</a> · <a href="${pub.deployment}data/aps_2026_current_analytics_manifest.json">Coverage, provenance and hashes</a> · <a href="${pub.deployment}en/?tab=economics#aps-current-economics">Read the two analytical dimensions</a></p></section>`;
if(landing.includes('id="research-current-analysis"'))landing=landing.replace(/<section id="research-current-analysis">[\s\S]*?<\/section>/,current);
else landing=landing.replace('</main>',current+'</main>');
fs.writeFileSync(landingPath,landing);

const researchLocales={
 it:{
  title:'Ricerca e citazione',eyebrow:'Ricerca · evidenze · riproducibilità',
  intro:'Connecting the Dots è un atlante di ricerca in evoluzione. Questa pagina distingue le release scientifiche archiviate, il working paper e il pacchetto tecnico corrente.',
  archiveTitle:'Release scientifiche archiviate',archiveBody:'RR1 e RR2 sono depositi immutabili con DOI propri. La release tecnica del sito non modifica retroattivamente ciò che è stato archiviato.',
  paperTitle:'Working paper',paperBody:'Il working paper canonico è mantenuto in inglese. La revisione scientifica e la sincronizzazione dei riferimenti tecnici sono due date diverse.',
  currentTitle:'Analisi corrente oltre RR2',currentBody:'Le analisi successive a RR2 restano output di lavoro finché una nuova research release non ne archivia metodi, dati ed evidenze.',
  paperLink:'Leggi il working paper in inglese',packLink:'Pacchetto dati tecnico corrente',rr2Link:'Apri RR2 su Zenodo',home:'Torna all’atlante',method:'Metodo e citazione',
  sync:'Revisione del paper: '+revised+' · sincronizzazione tecnica: '+technicalSync+'.'
 },
 de:{
  title:'Forschung und Zitieren',eyebrow:'Forschung · Evidenz · Reproduzierbarkeit',
  intro:'Connecting the Dots ist ein fortlaufender Forschungsatlas. Diese Seite trennt archivierte Forschungsreleases, Working Paper und das aktuelle technische Datenpaket.',
  archiveTitle:'Archivierte Forschungsreleases',archiveBody:'RR1 und RR2 sind unveränderliche Ablagen mit eigenen DOIs. Eine technische Website-Version ändert archivierte Forschung nicht rückwirkend.',
  paperTitle:'Working Paper',paperBody:'Das kanonische Working Paper wird auf Englisch geführt. Wissenschaftliche Revision und technische Referenz-Synchronisierung haben bewusst getrennte Daten.',
  currentTitle:'Aktuelle Analyse nach RR2',currentBody:'Analysen nach RR2 bleiben Arbeitsstände, bis eine neue Research Release Methoden, Daten und Evidenz archiviert.',
  paperLink:'Working Paper auf Englisch lesen',packLink:'Aktuelles technisches Datenpaket',rr2Link:'RR2 auf Zenodo öffnen',home:'Zurück zum Atlas',method:'Methode und Zitation',
  sync:'Paper-Revision: '+revised+' · technische Synchronisierung: '+technicalSync+'.'
 },
 fr:{
  title:'Recherche et citation',eyebrow:'Recherche · preuves · reproductibilité',
  intro:'Connecting the Dots est un atlas de recherche évolutif. Cette page distingue les versions scientifiques archivées, le working paper et le paquet de données technique courant.',
  archiveTitle:'Versions scientifiques archivées',archiveBody:'RR1 et RR2 sont des dépôts immuables avec leurs propres DOI. Une version technique du site ne réécrit pas rétroactivement les archives de recherche.',
  paperTitle:'Working paper',paperBody:'Le working paper canonique est maintenu en anglais. La révision scientifique et la synchronisation des références techniques utilisent volontairement des dates distinctes.',
  currentTitle:'Analyse courante au-delà de RR2',currentBody:'Les analyses postérieures à RR2 restent des résultats de travail jusqu’à ce qu’une nouvelle research release archive méthodes, données et preuves.',
  paperLink:'Lire le working paper en anglais',packLink:'Paquet de données technique courant',rr2Link:'Ouvrir RR2 sur Zenodo',home:'Retour à l’atlas',method:'Méthode et citation',
  sync:'Révision du paper : '+revised+' · synchronisation technique : '+technicalSync+'.'
 }
};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
for(const [lang,L] of Object.entries(researchLocales)){
 const dir=path.join(root,'research',lang);fs.mkdirSync(dir,{recursive:true});
 const canonical=pub.deployment+'research/'+lang+'/';
 const html='<!doctype html><html lang="'+lang+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="index,follow,max-image-preview:large"><title>'+esc(L.title)+' | Connecting the Dots</title><meta name="description" content="'+esc(L.intro)+'"><link rel="canonical" href="'+canonical+'"><link rel="alternate" hreflang="en" href="'+pub.deployment+'research/"><link rel="alternate" hreflang="it" href="'+pub.deployment+'research/it/"><link rel="alternate" hreflang="de" href="'+pub.deployment+'research/de/"><link rel="alternate" hreflang="fr" href="'+pub.deployment+'research/fr/"><link rel="alternate" hreflang="x-default" href="'+pub.deployment+'research/"><link rel="icon" href="'+pub.deployment+'assets/logo-mark.png" type="image/png"><style>:root{font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#17212e;background:#f5f6f8}*{box-sizing:border-box}body{margin:0;line-height:1.7}a{color:#0759ad;text-underline-offset:3px}a:focus-visible{outline:3px solid #0759ad;outline-offset:3px}header{background:#142b46;color:#fff;border-bottom:4px solid #4d9bc5}header nav,main,footer{max-width:940px;margin:auto;padding:20px 24px}header a{color:#fff}header nav{display:flex;justify-content:space-between;gap:18px;flex-wrap:wrap}main{padding-top:38px;padding-bottom:58px}.eyebrow{font-size:.78rem;text-transform:uppercase;font-weight:800;letter-spacing:.12em;color:#44738d}h1{font-size:clamp(2rem,5vw,3.3rem);line-height:1.12;letter-spacing:-.03em;margin:10px 0 18px}.lead{font-size:1.17rem;color:#42556c;max-width:760px}.actions{display:flex;gap:12px;flex-wrap:wrap;margin:26px 0}.button{display:inline-block;padding:12px 18px;border-radius:9px;background:#1c6395;color:#fff;text-decoration:none;font-weight:700}.button.secondary{background:#fff;color:#1c6395;border:1px solid #b0c6d8}section{background:#fff;border:1px solid #d9e2ea;border-radius:12px;padding:25px 28px;margin:18px 0}.sync{font-size:.92rem;color:#58697b}footer{border-top:1px solid #d9e2ea;color:#58697b;font-size:.9rem}</style><link rel="stylesheet" href="../../assets/editorial-shared.css?v='+pub.version+'"><link rel="describedby" type="text/plain" href="../../llms.txt"><link rel="describedby" type="application/json" href="../../agent-catalog.json"></head><body><header><nav aria-label="'+esc(L.method)+'"><a href="../../'+lang+'/"><strong>Connecting the Dots</strong></a><a href="../">'+esc(L.method)+'</a></nav></header><main><div class="eyebrow">'+esc(L.eyebrow)+'</div><h1>'+esc(L.title)+'</h1><p class="lead">'+esc(L.intro)+'</p><div class="actions"><a class="button" href="https://doi.org/10.5281/zenodo.23288603">'+esc(L.rr2Link)+'</a><a class="button secondary" href="../connecting-the-dots-working-paper-v1.html">'+esc(L.paperLink)+'</a></div><section><h2>'+esc(L.archiveTitle)+'</h2><p>'+esc(L.archiveBody)+'</p><p><a href="https://doi.org/10.5281/zenodo.23262623">RR1</a> · <a href="https://doi.org/10.5281/zenodo.23288603">RR2</a></p></section><section><h2>'+esc(L.paperTitle)+'</h2><p>'+esc(L.paperBody)+'</p><p class="sync">'+esc(L.sync)+'</p></section><section><h2>'+esc(L.currentTitle)+'</h2><p>'+esc(L.currentBody)+'</p><p><a href="../../'+pub.currentDataPackPath+'">'+esc(L.packLink)+' · v'+pub.currentDataPackVersion+'</a></p></section></main><footer><a href="../../'+lang+'/">'+esc(L.home)+'</a> · Connecting the Dots · Robert Bregy</footer></body></html>';
 fs.writeFileSync(path.join(dir,'index.html'),html+'\\n');
}
landing=fs.readFileSync(landingPath,'utf8');
const alternates='<link rel="alternate" hreflang="en" href="'+pub.deployment+'research/"><link rel="alternate" hreflang="it" href="'+pub.deployment+'research/it/"><link rel="alternate" hreflang="de" href="'+pub.deployment+'research/de/"><link rel="alternate" hreflang="fr" href="'+pub.deployment+'research/fr/"><link rel="alternate" hreflang="x-default" href="'+pub.deployment+'research/">';
if(!landing.includes('hreflang="it"'))landing=landing.replace('</head>',alternates+'</head>');
fs.writeFileSync(landingPath,landing);

const readmePath=path.join(root,'research/README.md');
let readme=fs.readFileSync(readmePath,'utf8').replace(/Latest technical site: \*\*v[\d.]+\*\*/,`Latest technical site: **v${pub.version}**`);
readme=readme.replace(/Current working paper: \*\*v[^*]+\*\*, revised \*\*[^*]+\*\*\./,`Current working paper: **v${pub.paperVersion}**, revised **${revised}**.`);
fs.writeFileSync(readmePath,readme);
console.log('RESEARCH_SOURCE_RENDERED '+JSON.stringify({paperVersion:pub.paperVersion,paperRevisedOn:pub.paperRevisedOn,paperTechnicalSyncOn:pub.paperTechnicalSyncOn||pub.releasedOn,currentTechnicalPack:pub.currentDataPackVersion,researchRelease:pub.researchRelease,localizedResearchLandings:3}));
