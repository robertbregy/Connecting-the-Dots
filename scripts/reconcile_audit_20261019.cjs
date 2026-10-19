/* Presentation corrections over the canonical build; no external requests. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {parseHTML}=require('linkedom');
const root=path.resolve(__dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const locales=read('data/audit_20261019_editorial.json').locales;
const translations=read('data/translations.json');
const source=fs.readFileSync(path.join(root,'data/site_bundle.js'),'utf8');
const data=JSON.parse(source.split('window.DOT_DATA=')[1].trim().replace(/;$/,''));
const css=`
.auditEvidence{border-left:3px solid var(--accent-text);padding:14px 18px;background:var(--surface2);line-height:1.7}.auditUnitCompare{grid-template-columns:repeat(2,minmax(0,1fr))}.auditSeparateMeasure{margin:20px 0;padding:18px;border:1px solid var(--border);border-radius:12px}.auditSeparateMeasure>summary{font-weight:700;cursor:pointer}.auditSeparateMeasure>.panel{border:0;padding:18px 0 0;margin:0}.auditCoverage{font-weight:650;line-height:1.65}.auditMoreQuestions{margin:20px 0;border-top:1px solid var(--border);padding-top:16px}.auditMoreQuestions summary{font-weight:650;cursor:pointer}.marketEvidence{font-size:13px;letter-spacing:.04em;font-weight:750;color:var(--accent-text)}.marketSummaryScope{padding:12px 16px;border-left:3px solid var(--accent-text);background:var(--surface2)}.marketTable table{min-width:0!important}.marketTable .marketDateDetails{display:none}.marketTable .marketDateInline{display:inline}
@media(max-width:720px){.auditUnitCompare{grid-template-columns:1fr}.marketResearch .marketTable{max-height:none;overflow:visible;border:0}.marketResearch .marketTable table{display:block;width:100%;min-width:0!important}.marketResearch .marketTable caption{display:block;padding:12px 0}.marketResearch .marketTable thead{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}.marketResearch .marketTable tbody{display:block}.marketResearch .marketTable tr{display:grid;grid-template-columns:1fr 1fr;gap:4px 12px;border:1px solid var(--border);border-radius:12px;padding:14px;margin-bottom:12px;background:var(--surface2)}.marketResearch .marketTable td,.marketResearch .marketTable tbody th{display:block;min-width:0;grid-column:1/-1;border:0;padding:4px 0;font-size:16px;line-height:1.5;overflow-wrap:anywhere}.marketResearch .marketTable td::before{content:attr(data-label);display:block;font-size:13px;line-height:1.5;color:var(--muted)}.marketResearch .marketTable tbody th{font-size:19px}.marketResearch [data-market-panel] tbody td:first-child{grid-column:1;font-size:14px}.marketResearch [data-market-panel] tbody th:nth-child(2){grid-column:2;text-align:right}.marketResearch .marketTable .marketDateInline{display:none}.marketResearch .marketTable .marketDateDetails{display:block;margin:0;padding:4px 0;border:0;border-radius:0}.marketResearch [data-market-panel] tbody td:last-child::before{display:none}.marketResearch [data-market-panel] tbody td:last-child{padding-top:8px;border-top:1px solid var(--border)}.marketResearch .marketTable summary{font-size:14px}.marketGroups{grid-template-columns:repeat(2,minmax(0,1fr))}}
`;
for(const lang of ['en','it','de','fr'])for(const filename of [lang+'/index.html',...(lang==='en'?['index.html']:[])]){
 const file=path.join(root,filename),L=locales[lang],t=translations[lang],prefix=filename==='index.html'?'':'../';
 const {document}=parseHTML(fs.readFileSync(file,'utf8'));
 const make=html=>{const n=document.createElement('div');n.innerHTML=html;return n.firstElementChild};
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const style=document.createElement('style');style.id='audit-20261019-style';style.textContent=css;document.head.append(style);

 // The two dates are a bibliography correction, not a rewrite of archived data.
 const note=()=>make(`<p class="auditEvidence">${esc(L.dates)} <a href="${prefix}data/research_bibliographic_corrections.json">JSON · Zenodo</a></p>`);
 for(const id of ['research','paper'])document.getElementById(id).querySelector('.panel').append(note());
 const correctionPanel=make(`<div class="panel" id="audit-documentary-corrections"><h3>${esc(L.trace)}</h3><p>${esc(L.dates)}</p><p><a href="${prefix}data/research_bibliographic_corrections.json">RR2 · JSON</a> · <a href="${prefix}data/source_method_corrections_20261019.json">W3Techs · SHA-256</a> · <a href="${prefix}data/audit_20261019_resolution.json">Audit · JSON</a></p></div>`);
 document.getElementById('sources').append(correctionPanel);

 // Compare like units. Different populations remain available in separate details.
 const compare=document.getElementById('demand2012Bars').parentElement.parentElement;
 compare.classList.add('auditUnitCompare');
 const rsp=document.getElementById('rsp2026Bars').parentElement;
 const separate=make(`<details class="auditSeparateMeasure"><summary>${esc(L.rsp)}</summary></details>`);separate.append(rsp);compare.after(separate);
 compare.before(make(`<div class="panel auditEvidence"><h3>${esc(L.compare)}</h3><p>${esc(L.units)}</p></div>`));
 const org=make(`<details class="auditSeparateMeasure"><summary>${esc(L.org)}</summary><p>${esc(t.applicantRegion2026Note)}</p><div class="regionBars" id="applicantOrganizations2026Bars"></div><a href="https://newgtldprogram-aps.icann.org/statistics" target="_blank" rel="noopener">ICANN APS ↗</a></details>`);
 const nf=new Intl.NumberFormat(lang);
 for(const row of data.geoApplicantRegions2026){const line=document.createElement('p');line.textContent=row.code+' · '+nf.format(row.count)+' / '+nf.format(481);org.querySelector('.regionBars').append(line)}
 separate.after(org);

 // Partial thematic recognition is not a representative social census.
 const culture=document.getElementById('tld-cultural-patterns');
 culture.querySelector('h2').after(make(`<div class="auditEvidence"><p class="auditCoverage">${esc(L.coverage)}</p><p>${esc(L.science)}</p><a href="${prefix}data/cultural_classification_protocol.json" download>${esc(L.protocol)} · JSON</a></div>`));
 const trajectory=document.getElementById('tld-cultural-trajectory');trajectory.querySelector('h2').after(make(`<p class="auditEvidence">${esc(L.science)}</p>`));

 // The short entry precedes the route map. Keep all six routes immediately usable.
 const intro=document.querySelector('.iaHomeEntryIntro'),journey=document.querySelector('.homeJourney');
 assert.ok(intro&&journey);intro.after(journey);
 const questions=document.querySelector('.homeQuestions');if(questions){const details=make(`<details class="auditMoreQuestions"><summary>${esc(L.more)}</summary></details>`);questions.before(details);details.append(questions);}

 // Compact phone rows keep units and historical origin on screen; explicit
 // table roles retain semantics when the CSS layout switches to cards.
 for(const table of document.querySelectorAll('.marketTable table')){
  table.setAttribute('role','table');
  const headers=[...table.querySelectorAll('thead th')].map(n=>n.textContent);
  for(const n of table.querySelectorAll('thead,tbody'))n.setAttribute('role','rowgroup');
  for(const n of table.querySelectorAll('tr'))n.setAttribute('role','row');
  for(const n of table.querySelectorAll('thead th'))n.setAttribute('role','columnheader');
  for(const row of table.querySelectorAll('tbody tr'))[...row.children].forEach((cell,i)=>{cell.setAttribute('role',cell.tagName==='TH'?'rowheader':'cell');cell.dataset.label=headers[i];});
  if(table.closest('[data-market-panel]'))for(const row of table.querySelectorAll('tbody tr')){
   const cell=row.lastElementChild,date=cell.textContent;cell.textContent='';
   const inline=document.createElement('span');inline.className='marketDateInline';inline.textContent=date;cell.append(inline);
   const detail=make(`<details class="marketDateDetails"><summary>${esc(headers[4])}</summary><span>${esc(date)}</span></details>`);cell.append(detail);
  }
 }
 fs.writeFileSync(file,'<!DOCTYPE html>\n'+document.documentElement.outerHTML+'\n');
}
console.log('AUDIT_20261019_PRESENTATION_RECONCILED',JSON.stringify({languages:4,regionalUnit:'applications',mobileTables:'compact rows',researchArchives:'unchanged'}));
