/* One mutable manuscript source and one publication metadata record.
   Historical revision notes and archived research identities are not rewritten. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {marked}=require('marked');
const {parseHTML}=require('linkedom');
const root=path.resolve(__dirname,'..');
const pub=JSON.parse(fs.readFileSync(path.join(root,'publication.json'),'utf8'));
const revised=new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(pub.paperRevisedOn+'T00:00:00Z'));
const mdPath=path.join(root,'research/connecting-the-dots-working-paper-v1.md');
let md=fs.readFileSync(mdPath,'utf8');
const heading=/\*\*Working Paper v[^*]+\*\*/g;
assert.equal([...md.matchAll(heading)].length,1);
md=md.replace(heading,`**Working Paper v${pub.paperVersion} · living revision ${revised} · current citable research release RR2 (10 October 2026)**`);
md=md.replace(/Current technical data package \*\*v[0-9.]+\*\* \(not a new Zenodo release\): https:\/\/robertbregy.github.io\/Connecting-the-Dots\/downloads\/connecting-the-dots-data-pack-v[0-9.]+\.zip/,
 `Current technical data package **v${pub.currentDataPackVersion}** (not a new Zenodo release): ${pub.deployment}${pub.currentDataPackPath}`);
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
const readmePath=path.join(root,'research/README.md');
let readme=fs.readFileSync(readmePath,'utf8').replace(/Latest technical site: \*\*v[\d.]+\*\*/,`Latest technical site: **v${pub.version}**`);
readme=readme.replace(/Current working paper: \*\*v[^*]+\*\*, revised \*\*[^*]+\*\*\./,`Current working paper: **v${pub.paperVersion}**, revised **${revised}**.`);
fs.writeFileSync(readmePath,readme);
console.log('RESEARCH_SOURCE_RENDERED '+JSON.stringify({paperVersion:pub.paperVersion,paperRevisedOn:pub.paperRevisedOn,currentTechnicalPack:pub.currentDataPackVersion,researchRelease:pub.researchRelease}));
