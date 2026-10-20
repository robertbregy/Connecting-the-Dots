/* Six-step native Economics reading order. Run after editorial additions.
   Reparent existing nodes, retain evidence and IDs, and fail on unknown blocks. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {parseHTML}=require('linkedom');
const root=path.resolve(__dirname,'..');
const data=JSON.parse(fs.readFileSync(path.join(root,'data/economics_reading_order.json'),'utf8'));
function reorder(document,lang){
 const sec=document.getElementById('economics'),L=data.locales[lang];assert.ok(sec&&L);
 assert.equal(sec.querySelectorAll('.economicsChapter').length,0,'Economics already reordered');
 const before=[...sec.children].filter(n=>!n.matches('nav.sectionToc'));
 const ids=[...sec.querySelectorAll('[id]')].map(n=>n.id);
 const one=s=>{const nodes=sec.querySelectorAll(s);assert.equal(nodes.length,1,'Expected one Economics block: '+s);return nodes[0];};
 const panelFor=key=>one('[data-i18n="'+key+'"]').closest('.panel');
 const nodes={hero:one('.economicsHero'),models:panelFor('economicsModelsTitle'),reach:one('#tld-market-reach'),fees:one('#round-application-fees'),cases:panelFor('economicsCasesGridTitle'),portfolio:one('.portfolioEconomics'),contention:one('#economics-contention-2026'),focus:one('[data-round-focus="economics"]'),cycles:one('#economic-cycles-2026'),cross:one('.crossRoundDisclosure'),round:panelFor('economics2026Title'),analytics:one('#aps-current-economics'),historical:one('.historicalEconomy'),cemetery:one('#economics-cemetery-link')};
 assert.equal(new Set(Object.values(nodes)).size,before.length,'Unknown or duplicate Economics block');
 assert.ok(before.every(n=>Object.values(nodes).includes(n)),'Unassigned Economics content');
 const snapshots=before.map(n=>({node:n,text:n.textContent,links:[...n.querySelectorAll('a[href]')].map(a=>a.getAttribute('href')).sort()}));
 function el(tag,text,cls){const n=document.createElement(tag);if(text)n.textContent=text;if(cls)n.className=cls;return n;}
 function jump(label,tab,anchor){const a=el('a',label,'sourceChip sectionLink');a.href='?tab='+tab+'#'+anchor;a.dataset.openSection=tab;a.dataset.openAnchor=anchor;return a;}
 function disclosure(label,node){const d=el('details',null,'economicsSupporting');d.append(el('summary',label),node);return d;}
 // Preserve stable legacy fragment targets while introducing proper subheadings.
 for(const n of before.filter(n=>n!==nodes.hero)){
  const increase=!!n.querySelector('h2');
  for(const h of [...n.querySelectorAll('h2,h3,h4')]){
   const replacement=el('h'+Math.min(Number(h.tagName.slice(1))+(increase?1:0),6));
   for(const attr of h.attributes)replacement.setAttribute(attr.name,attr.value);
   if(h.tagName==='H2')replacement.classList.add('economicsSubheading');
   while(h.firstChild)replacement.append(h.firstChild);h.replaceWith(replacement);
  }
 }
 if(!document.getElementById('economics-part-2'))nodes.cross.querySelector('summary').id='economics-part-2';
 const chapters=data.order.map((key,i)=>{
  const g=el('div',null,'economicsChapter');g.id='economics-chapter-'+key;g.dataset.economicsStage=key;
  const heading=el('h2',L.titles[i],'sectionTocTarget economicsStageTitle');heading.id='economics-'+key;heading.dataset.economicsStageTitle='';heading.dataset.economicsNavLabel=String(i+1)+'. '+L.labels[i];
  g.append(heading,el('p',L.leads[i],'economicsStageLead'));return g;
 });
 chapters[0].append(nodes.models,jump(L.flow,'how','how-part-5'),disclosure(L.fees,nodes.fees));
 chapters[1].append(nodes.reach);
 chapters[2].append(nodes.cases);
 chapters[3].append(nodes.portfolio,nodes.contention,disclosure(L.additional,nodes.focus));
 chapters[4].append(nodes.cycles,nodes.cross);
 chapters[5].append(nodes.round,nodes.analytics);
 const oldHeading=nodes.historical.querySelector('[data-i18n="sectorEconomyTitle"]');assert.ok(oldHeading.id);
 const historicalLink=jump(L.history,'economics',oldHeading.id);historicalLink.id='economics-historical-link';
 chapters[5].append(historicalLink,nodes.historical);
 const nav=el('nav',null,'sectionToc');nav.setAttribute('aria-label',L.guide);
 for(const g of chapters){const h=g.firstElementChild,a=jump(h.dataset.economicsNavLabel,'economics',h.id);a.className='tocLink sectionLink';nav.append(a);}
 const guide=el('p',L.guide,'economicsReadingGuide');guide.id='economics-reading-guide';
 sec.replaceChildren(nodes.hero,guide,nav,...chapters,nodes.cemetery);
 // Every original block keeps its exact wording and source destinations.
 for(const s of snapshots){assert.equal(s.node.textContent,s.text,'Economics wording changed unexpectedly');assert.deepEqual([...s.node.querySelectorAll('a[href]')].map(a=>a.getAttribute('href')).sort(),s.links,'Source link lost');assert.ok(sec.contains(s.node),'Economics block lost');}
 for(const id of ids)assert.ok(document.getElementById(id),'Lost Economics fragment '+id);
 // The identity strategy belongs with the final analysis, not the portfolio discussion.
 const identity=nodes.contention.querySelector('[data-i18n="econEditorialIdentityTitle"]')?.closest('.note');assert.ok(identity);
 identity.id='economics-brand-strategy';chapters[5].insertBefore(identity,historicalLink);
 sec.dataset.economicsReadingOrder='six-step-v1';
 return {lang,originalBlocks:before.length,retainedFragments:ids.length,stages:data.order};
}
function main(){
 const evidence=[];
 for(const [lang,name] of [['en','index.html'],...['en','it','de','fr'].map(l=>[l,l+'/index.html'])]){
  const file=path.join(root,name),{document}=parseHTML(fs.readFileSync(file,'utf8'));
  evidence.push(reorder(document,lang));fs.writeFileSync(file,'<!DOCTYPE html>\n'+document.documentElement.outerHTML+'\n');
 }
 console.log('ECONOMICS_READING_ORDER_VERIFIED '+JSON.stringify(evidence));
}
module.exports={reorder};if(require.main===module)main();
