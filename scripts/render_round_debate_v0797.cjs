/* Two dated 4 November stakeholder perspectives. No new application data or standalone pages. */
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const {parseHTML}=require('linkedom');
const path=require('node:path');
const pub=JSON.parse(fs.readFileSync('publication.json','utf8'));
assert.equal(pub.version,'0.7.97','A review and technical release are required for editorial changes');
const d=JSON.parse(fs.readFileSync('data/round_debate_20261106.json','utf8'));
assert.equal(d.editorialLayer,'living-commentary-not-official-APS-or-frozen-RR1-RR2');
assert.equal(d.reviewedOn,pub.releasedOn);
assert.deepEqual(d.items.map(x=>x.id),['brs-cpe-outcomes','inta-private-auctions']);
const sources=new Map(d.sources.map(x=>[x.id,x]));
assert.equal(sources.size,4);
for(const item of d.items){assert.equal(item.publishedOn,'2026-11-04');for(const id of item.sourceIds)assert.ok(sources.has(id),id)}
for(const url of [
 'https://brsmedia.com/cperesponse/',
 'https://www.inta.org/news-and-press/inta-news/icanns-new-generic-top-level-domain-applications-revealed/',
 'https://newgtldprogram-2026-agb.icann.org/en/9-module-5-contention-set-resolution.html'
])assert.ok(d.sources.some(x=>x.url===url));
const escape=x=>String(x).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const css=`
.roundDebate{margin:28px 0;padding:clamp(16px,3vw,28px);border:1px solid var(--border);border-radius:16px;background:var(--surface)}
.roundDebate .roundDebateHead{font-size:clamp(1.25rem,3vw,1.7rem);line-height:1.2;margin:9px 0 10px}
.roundDebate .roundDebateIntro{max-width:86ch;line-height:1.6;color:var(--muted)}
.roundDebateGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin-top:18px}
.roundDebateCard{min-width:0;padding:18px;border:1px solid var(--border);border-radius:12px;background:var(--surface2)}
.roundDebateCard h3{font-size:1.08rem;line-height:1.32;margin:8px 0 12px}
.roundDebateCard p{font-size:.94rem;line-height:1.65}
.roundDebateDate{font-weight:730;font-size:.81rem;color:var(--accent-text)}
.roundDebateLinks{display:flex;gap:8px 18px;flex-wrap:wrap;margin-top:13px}
.roundDebate a{color:var(--accent-text);text-decoration:underline;text-underline-offset:3px;overflow-wrap:anywhere}
.roundDebate a:focus-visible{outline:3px solid #e1a13f;outline-offset:3px}
.roundDebateContext{margin:28px 0;padding:20px;border-left:4px solid var(--accent-text);background:var(--surface2);border-radius:0 12px 12px 0}
.roundDebateContext h3{margin:0 0 12px;font-size:1.14rem}
.roundDebateContext p{font-size:.95rem;line-height:1.65}
.roundDebateContext a{color:var(--accent-text);overflow-wrap:anywhere;text-decoration:underline;text-underline-offset:3px}
@media(max-width:720px){.roundDebateGrid{grid-template-columns:1fr}.roundDebateCard{padding:14px}.roundDebateContext{padding:16px}}
`;
const a=(url,label)=>`<a href="${escape(url)}" target="_blank" rel="noopener noreferrer">${escape(label)}</a>`;
const get=id=>sources.get(id).url;
for(const lang of ['it','en','de','fr']){
 const t=d.languages[lang];assert.ok(t && Object.keys(t).length===17,'Incomplete locale '+lang);
 const file=path.join('behind-the-round',lang,'index.html');
 const html=fs.readFileSync(file,'utf8');
 const {document:doc}=parseHTML(html);
 const main=doc.querySelector('main');
 assert.ok(main&&main.id==='behind-round','Field Notes main missing '+lang);
 assert.ok(!doc.getElementById('round-debate-20261106'),'Duplicate dated field note '+lang);
 assert.equal(main.querySelectorAll('[data-field-investigation-teaser]').length,3);
 const section=doc.createElement('section');
 section.id='round-debate-20261106';section.className='roundDebate';
 section.setAttribute('data-round-debate','2026-11-04');
 section.setAttribute('aria-labelledby','round-debate-title');
 section.innerHTML=`
 <p class="roundDebateDate">${escape(t.sectionEyebrow)}</p>
 <h2 class="roundDebateHead" id="round-debate-title">${escape(t.sectionTitle)}</h2>
 <p class="roundDebateIntro">${escape(t.sectionLead)}</p>
 <div class="roundDebateGrid">
 <article class="roundDebateCard" data-round-perspective="brs-cpe-outcomes">
  <p class="roundDebateDate"><time datetime="2026-11-04">2026-11-04</time> · ${escape(t.brsType)}</p>
  <h3>${escape(t.brsTitle)}</h3>
  <p>${escape(t.brsBody)}</p><p>${escape(t.brsReading)}</p>
  <nav class="roundDebateLinks" aria-label="${escape(t.sourceLabel)}">
   ${a(get('brs-media'),t.sourceLabel+' · BRS Media')}
   ${a(get('icann-agb'),t.ruleLabel)}
  </nav>
 </article>
 <article class="roundDebateCard" data-round-perspective="inta-private-auctions">
  <p class="roundDebateDate"><time datetime="2026-11-04">2026-11-04</time> · ${escape(t.intaType)}</p>
  <h3>${escape(t.intaTitle)}</h3>
  <p>${escape(t.intaBody)}</p><p>${escape(t.intaReading)}</p>
  <nav class="roundDebateLinks" aria-label="${escape(t.sourceLabel)}">
   ${a(get('inta'),t.sourceLabel+' · INTA')}
   ${a(get('icann-faq'),t.ruleLabel)}
  </nav>
 </article>
 </div>`;
 const before=main.querySelector('section.fieldInvestigationIndex');assert.ok(before);
 before.after(section);
 const style=doc.createElement('style');style.setAttribute('data-round-debate-style','');style.textContent=css;doc.head.append(style);
 const structured=doc.querySelector('script[type="application/ld+json"]');assert.ok(structured);
 const meta=JSON.parse(structured.textContent);assert.equal(meta['@type'],'CollectionPage');
 meta.dateModified=pub.releasedOn;structured.textContent=JSON.stringify(meta);
 fs.writeFileSync(file,'<!DOCTYPE html>\n'+doc.documentElement.outerHTML+'\n');
 for(const native of [path.join(lang,'index.html'),...(lang==='en'?['index.html']:[])]){
   const original=fs.readFileSync(native,'utf8');const {document}=parseHTML(original);
   const chapter=document.getElementById('contention');assert.ok(chapter,'Missing native contention chapter '+native);
   assert.ok(!chapter.querySelector('[data-round-debate-context]'),'Duplicate INTA perspective');
   const callout=document.createElement('section');callout.id='round-auctions-debate-20261106';callout.className='roundDebateContext';
   callout.setAttribute('data-round-debate-context','inta-private-auctions');
   callout.innerHTML=`
   <h3>${escape(t.contextTitle)}</h3>
   <p>${escape(t.contextLead)}</p><p>${escape(t.contextBody)}</p>
   <p class="roundDebateLinks">
    ${a(get('inta'),t.sourceLabel+' · INTA')}
    ${a(get('icann-faq'),t.ruleLabel)}
    <a href="https://robertbregy.github.io/Connecting-the-Dots/behind-the-round/${lang}/#round-debate-20261106">${escape(t.backLabel)}</a>
   </p>`;
   chapter.append(callout);
   const style2=document.createElement('style');style2.setAttribute('data-round-debate-style','');style2.textContent=css;document.head.append(style2);
   fs.writeFileSync(native,'<!DOCTYPE html>\n'+document.documentElement.outerHTML+'\n');
 }
}
console.log('ROUND_2026_TWO_DATED_PERSPECTIVES_INSERTED',JSON.stringify({languages:4,fieldNotes:4,nativeChapters:5,addedPages:0,changedOfficialData:0}));
