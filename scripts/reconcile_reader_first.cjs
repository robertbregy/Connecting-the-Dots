/* Reader-first navigation over the original publication. Evidence is moved,
   never rewritten. Every retained text node, link and fragment is checked. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {parseHTML}=require('linkedom');
const root=path.resolve(__dirname,'..');
const config=JSON.parse(fs.readFileSync(path.join(root,'data/reader_pathways.json'),'utf8'));
const pub=JSON.parse(fs.readFileSync(path.join(root,'publication.json'),'utf8'));
const report=[];
const shape=n=>({tag:n.tagName,id:n.id,classes:n.className,heading:n.querySelector('h2,h3')?.dataset.i18n||n.querySelector('h2,h3')?.id||null});
const chosen={
 how:['#how-part-2','#how-part-3','#how-part-4','#how-part-6','#how-part-9','#how-glossary','#how-part-10'],
 beyond:['#beyond-part-1','#beyond-part-2','#beyond-part-3','#beyond-part-4'],
 geography:['#geography-part-1','#geography-part-2','#geography-part-3','#geography-part-4','#geography-part-5'],
 social:['[data-i18n="socialModelsTitle"]','[data-i18n="socialCasesGridTitle"]','#tld-cultural-social h2','[data-i18n="social2026Title"]'],
 disputes:['[data-i18n="disputesCasesTitle"]','[data-i18n="disputesMechanismsTitle"]','[data-i18n="disputes2026StatusTitle"]','[data-i18n="disputes2026CaseTitle"]'],
 refusals:['[data-i18n="refusalTaxonomyTitle"]','[data-i18n="refusalCasesTitle"]','[data-i18n="refusalSnapshotTitle"]','[data-i18n="outcomes2026StatusTitle"]'],
 strange:['[data-i18n="driftTitle"]','[data-i18n="odditiesTitle"]','.crossRoundDisclosure>summary'],
 contention:['[data-i18n="wordTitle"]','[data-i18n="contentionResolution2026Title"]','[data-i18n="contentionTitle2026"]','[data-i18n="contentionTitle2012"]','[data-i18n="contentionCompareTitle"]'],
 cities:['#city-namespace-governance h2','#city-namespace-measures h2','.cityHelsinkiBridge h2','[data-i18n="geoLayer2026"]'],
 timeline:['#tld-cultural-trajectory h2','[data-i18n="timeCapsule"]','[data-i18n="roundAtGlance"]','#tld-cultural-patterns h2'],
 sources:['[data-i18n="methodLegendTitle"]','[data-i18n="sourcesTitle"]','[data-i18n="successTitle"]','#publication-updates h2','#report-error'],
 resources:['[data-i18n="downloadsTitle"]','[data-i18n="pressTitle"]','[data-i18n="anglesTitle"]'],
 'governance-access':['#accessSimulatorTitle','#accessActorsTitle','#accessCasesTitle'],
 lugano:['#lugano-status-sources','#lugano-governance-decisions','#lugano-uses-results','#lugano-risks-checks'],
 research:['#research-citation-guide','[data-i18n="researchTitle"]','[data-i18n="citationTitle"]','#independent-review-status'],
 'inside-round':['#insideRoundTimelineTitle'],
 'behind-round':['#behind-case-reveal-day-counts','#behind-case-wdo-identity','.fieldInvestigationIndex h3','#city-domain-reception-note h2'],
 cemetery:['#gtld-cemetery','#helsinki-termination']
};
function improve(document,lang,filename){
 const T=key=>config.ui[key][lang],title=id=>config.titles[id]?.[lang]||id;
 const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined&&text!==null)n.textContent=text;if(cls)n.className=cls;return n;};
 const route=(id,anchor)=>'?tab='+id+(anchor?'#'+anchor:'');
 function link(id,label,anchor,cls){const a=el('a',label,cls);a.href=route(id,anchor);a.dataset.openSection=id;if(anchor)a.dataset.openAnchor=anchor;return a;}
 function navTrail(section,area){
  const nav=el('nav',null,'readerTrail readerOwned');nav.setAttribute('aria-label',T('youAreHere'));
  nav.append(link('overview',T('home')));
  const arrow=()=>{const n=el('span','/');n.setAttribute('aria-hidden','true');return n;};
  const areaLink=document.querySelector('.iaPrimaryLink[data-b2-area="ia-'+area+'"]');
  nav.append(arrow(),link('ia-'+area,areaLink.textContent.trim()),arrow());
  const current=el('span',title(section.id));current.setAttribute('aria-current','page');nav.append(current);return nav;
 }
 function follow(sectionId,edges){
  const block=el('aside',null,'readerNext readerOwned');block.setAttribute('aria-labelledby','reader-next-'+sectionId);
  const h=el('h2',T('next'));h.id='reader-next-'+sectionId;block.append(h);
  const grid=el('div',null,'readerNextGrid');
  for(const [id,reason,anchor] of edges){
   assert.ok(document.getElementById(id),'Unknown reader destination '+id);
   if(anchor)assert.ok(document.getElementById(anchor),'Unknown reader fragment '+anchor);
   const a=link(id,null,anchor,'readerNextCard');a.append(el('span',T(reason),'readerRelation'),el('strong',title(id)));const arrow=el('span','\u2192','readerArrow');arrow.setAttribute('aria-hidden','true');a.append(arrow);grid.append(a);
  }
  block.append(grid);
  const utilities=el('div',null,'readerUtilities');
  utilities.append(link(sectionId,T('backTop'),sectionId),link('sources',T('proof'),'sources-part-4'));
  block.append(utilities);return block;
 }
 const sections=Object.values(config.areas).flat().map(id=>document.getElementById(id));
 assert.ok(sections.every(Boolean),'Missing canonical section');
 assert.equal(document.querySelectorAll('.readerTrail').length,0,'Reader transformation already applied');
 // Snapshot content nodes, original IDs, and links before moving evidence.
 // Navigation text is deliberately outside the protected evidence snapshot.
 const evidence=sections.map(section=>{
  const walker=document.createTreeWalker(section,4);const texts=[];let n;
  while((n=walker.nextNode()))if(n.nodeValue.trim()&&!n.parentElement.closest('nav.sectionToc'))texts.push([n,n.nodeValue]);
  return {section,texts,ids:[...section.querySelectorAll('[id]')].filter(n=>!n.closest('nav.sectionToc')).map(n=>n.id),links:[...section.querySelectorAll('a[href]')].filter(n=>!n.closest('nav.sectionToc')).map(n=>[n,n.getAttribute('href')])};
 });
 for(const [id,order] of Object.entries(config.orders)){
  const section=document.getElementById(id),blocks=[...section.children].filter(n=>!n.matches('.sectionToc'));
  // Generated heading IDs are language invariant; dictionary rendering removes
  // data-i18n on a few nodes, so compare structure and class, then block count.
  assert.equal(blocks.length,order.length,'Unknown '+id+' block');
  assert.deepEqual([...order].sort((a,b)=>a-b),blocks.map((_,i)=>i),'Incomplete '+id+' order');
  for(let i=0;i<blocks.length;i++)for(const key of ['tag','id','classes'])assert.equal(shape(blocks[i])[key],config.shape[id][i][key],id+' unexpected block '+i+' '+key);
  section.querySelector(':scope>.sectionToc')?.remove();
  for(const i of order)section.append(blocks[i]);
  section.dataset.readerOrder=order.join(',');
 }
 // Cities: put governance and public outcomes ahead of inventories. Preserve
 // the two original panels from the grid, including every source and fragment.
 const city=document.getElementById('cities'),cityGrid=city.firstElementChild;
 assert.ok(cityGrid.matches('.grid2')&&cityGrid.children.length===2);
 const [cityIntro,cityHistory]=[...cityGrid.children],cityBlocks=[...city.children];
 cityGrid.replaceWith(cityIntro);city.append(cityBlocks[4],cityBlocks[5],cityBlocks[3],cityHistory,cityBlocks[1],cityBlocks[2]);
 city.dataset.readerOrder='intro,governance,outcomes,helsinki,history,2026,prospects';
 // Every horizontal table region is reachable by keyboard, including tables
 // inside collapsed analytical details. Labels reuse the existing local text.
 let tableNumber=0;
 for(const box of document.querySelectorAll('#timeline .tableWrap,#timeline .tldTable')){
  tableNumber++;
  box.setAttribute('tabindex','0');box.setAttribute('role','region');
  const caption=box.querySelector('caption')?.textContent.trim();
  const heading=box.closest('section,article,.panel')?.querySelector('h2,h3')?.textContent.trim();
  box.setAttribute('aria-label',caption||((heading||title('timeline'))+' ('+tableNumber+')'));
 }
 // Stable IDs are assigned before new navigation is inserted, never derived
 // from translated wording. Existing inbound links remain unchanged.
 for(const section of sections){let count=0;for(const h of section.querySelectorAll('h2,h3')){count++;if(!h.id)h.id='reader-'+section.id+'-heading-'+count;}}
 for(const [area,ids] of Object.entries(config.areas))for(const id of ids){
  const section=document.getElementById(id);section.dataset.readerTitle=title(id);
  const trail=navTrail(section,area);section.prepend(trail);
  if(id!=='economics'){
   section.querySelector(':scope>.sectionToc')?.remove();section.dataset.readerPathways=config.version;
   const selectors=chosen[id]||[];const targets=selectors.map(s=>section.querySelector(s)).filter(Boolean);
   if(targets.length>1){
    const details=el('details',null,'readerOutline readerOwned');
    const summary=el('summary',T('guide'));details.append(summary);
    const nav=el('nav',null,'readerToc');nav.setAttribute('aria-label',T('guide'));
    for(const n of targets){const h=n.matches('h2,h3,summary')?n:n.querySelector('h2,h3')||n;if(!n.id&&!h.id)n.id='reader-'+id+'-outline-'+(targets.indexOf(n)+1);const anchor=n.id||h.id;assert.ok(anchor,id+' unnamed target');
     let label=h.textContent.trim().replace(/\s+/g,' ');
     const a=link(id,label,anchor,'readerTocLink');nav.append(a);
    }
    details.append(nav);trail.after(details);
   }
  }
  section.append(follow(id,config.next[id]));
 }
 // Keep Economics' six-step index intact; only add the same context and exits.
 // Protect scholarly text, source destinations and old inbound links exactly.
 let protectedTexts=0,protectedLinks=0,protectedIds=0;
 for(const snapshot of evidence){
  for(const [node,text] of snapshot.texts){assert.ok(snapshot.section.contains(node),'Lost text in '+snapshot.section.id+': '+text.slice(0,100));assert.equal(node.nodeValue,text,'Rewritten evidence in '+snapshot.section.id);protectedTexts++;}
  for(const [node,href] of snapshot.links){assert.ok(snapshot.section.contains(node),'Lost original link');assert.equal(node.getAttribute('href'),href,'Changed original destination');protectedLinks++;}
  for(const id of snapshot.ids){assert.ok(snapshot.section.querySelector('[id="'+id+'"]'),'Lost original fragment '+id);protectedIds++;}
 }
 // Hubs retain all 26 destinations and separate data from governance.
 for(const [area,ids] of Object.entries(config.areas)){
  const hub=document.getElementById('ia-'+area),lead=hub.querySelector('.iaHubHead>p');lead.removeAttribute('data-i18n');lead.textContent=config.hubLeads[area][lang];
  const grids=[...hub.querySelectorAll('.iaHubGrid')];
  if(area==='stories'){const cards=[...grids[0].children];for(const id of ids){const card=cards.find(c=>c.querySelector('[data-open-section="'+id+'"]'));assert.ok(card);grids[0].append(card);}}
  const first=hub.querySelector('.iaHubCard');first.classList.add('readerFeatured');first.prepend(el('span',T('startHere'),'readerStartHere readerOwned'));
  const context=hub.querySelector('.iaHubContext');if(context)hub.append(context);
  hub.dataset.readerTitle=hub.querySelector('h2').textContent.trim();
 }
 const basics=document.querySelector('#ia-understand .iaHubCard a[data-open-section="overview"]');
 basics.href=route('overview','three-minute-guide');basics.dataset.openAnchor='three-minute-guide';
 const basicsText=basics.closest('.iaHubCard').querySelector('p');basicsText.removeAttribute('data-i18n');basicsText.textContent=T('discoverBody');
 // Three actual intentions instead of a second copy of the six-area menu.
 const home=document.querySelector('.iaHomeEntryIntro');
 for(const [selector,key] of [['h2','homeTitle'],['p','homeLead']]){const n=home.querySelector(selector);n.removeAttribute('data-i18n');n.textContent=T(key);}
 const homeNav=document.querySelector('.iaHomeJumpList');homeNav.classList.add('readerIntents');homeNav.replaceChildren();homeNav.setAttribute('aria-label',T('homeTitle'));
 for(const [key,id,anchor] of [['discover','overview','three-minute-guide'],['explore','explore'],['verify','research','research-citation-guide']]){
  const a=link(id,null,anchor,'readerIntent');a.append(el('strong',T(key)),el('span',T(key+'Body')));homeNav.append(a);
 }
 const researcher=link('research',T('readResearch'),'research-citation-guide','control readerResearchLink');document.querySelector('.heroActions').append(researcher);
 // A discoverable, accessible sitemap replaces reliance on a hidden legacy
 // dropdown. Old DOM hooks remain for old routing code; no content is removed.
 const index=el('details',null,'readerIndex readerOwned');index.id='reader-index';
 index.append(el('summary',T('index')),el('p',T('indexIntro')));
 const indexGrid=el('div',null,'readerIndexGrid');
 for(const [area,ids] of Object.entries(config.areas)){
  const group=el('nav');const label=document.querySelector('.iaPrimaryLink[data-b2-area="ia-'+area+'"]')?.textContent.trim();group.setAttribute('aria-label',label);
  const heading=el('h2');heading.append(link('ia-'+area,label));group.append(heading);
  if(area==='understand')group.append(link('overview',title('overview'),'three-minute-guide'));
  for(const id of ids)group.append(link(id,title(id)));indexGrid.append(group);
 }
 index.append(indexGrid);document.querySelector('main').append(index);
 // The sitemap is linked from the persistent header. It is a real anchor and
 // remains usable without script; the small enhancement opens/focuses it.
 const indexLink=el('a',T('fullIndex'),'control readerIndexTrigger');indexLink.href='#reader-index';indexLink.setAttribute('aria-controls','reader-index');
 document.querySelector('.topbar .controls').prepend(indexLink);
 const prefix=filename==='index.html'?'':'../';
 const css=el('link');css.rel='stylesheet';css.href=prefix+'assets/reader.css?v='+pub.version;document.head.append(css);
 const script=el('script');script.defer=true;script.src=prefix+'assets/reader.js?v='+pub.version;document.body.append(script);
 const payload=el('script');payload.type='application/json';payload.id='reader-navigation-labels';payload.textContent=JSON.stringify({homeTitle:T('homeTitle'),siteTitle:'Connecting the Dots'});document.body.append(payload);
 document.documentElement.dataset.readerRelease=pub.version;
 report.push({file:filename,language:lang,chapters:sections.length,reordered:Object.keys(config.orders).length+1,protectedTexts,protectedLinks,protectedIds,hubs:6,homeIntents:3});
}
function standalone(){
 // Independent investigation pages keep their canonical URLs and manuscript.
 // Add only explicit onward routes using the existing site's own navigation.
 const filenames=[];
 for(const family of ['applications','inside-the-round','behind-the-round'])for(const lang of config.languages){
  const base=path.join(root,family,lang);if(!fs.existsSync(base))continue;
  const walk=dir=>{for(const e of fs.readdirSync(dir,{withFileTypes:true})){if(e.isDirectory())walk(path.join(dir,e.name));else if(e.name==='index.html')filenames.push([lang,path.join(dir,e.name)]);}};walk(base);
 }
 for(const [lang,file] of filenames){const html=fs.readFileSync(file,'utf8'),{document:d}=parseHTML(html);
  if(d.querySelector('meta[http-equiv="refresh"],#ctd-native-redirect')||!d.querySelector('main')||d.querySelector('.readerStandaloneNext'))continue;
  const main=d.querySelector('main');const before=main.textContent,links=[...main.querySelectorAll('a[href]')].map(a=>a.getAttribute('href'));
  const box=d.createElement('aside');box.className='readerStandaloneNext readerNext';
  const heading=d.createElement('h2');heading.textContent=config.ui.next[lang];box.append(heading);
  const base=path.relative(path.dirname(file),path.join(root,lang)).split(path.sep).join('/')+'/';
  const targets=file.includes(path.sep+'applications'+path.sep)?[['explore','data'],['sources','cite']]:[['inside-round','current'],['behind-round','cases']];
  const grid=d.createElement('div');grid.className='readerNextGrid';
  for(const [id,key] of targets){const a=d.createElement('a');a.className='readerNextCard';a.href=base+'?tab='+id;const small=d.createElement('span');small.className='readerRelation';small.textContent=config.ui[key][lang];const strong=d.createElement('strong');strong.textContent=config.titles[id][lang];a.append(small,strong);grid.append(a);}
  box.append(grid);main.append(box);
  const css=d.createElement('link');css.rel='stylesheet';css.href=path.relative(path.dirname(file),path.join(root,'assets/reader.css')).split(path.sep).join('/')+'?v='+pub.version;d.head.append(css);
  box.remove();assert.equal(main.textContent,before);assert.deepEqual([...main.querySelectorAll('a[href]')].map(a=>a.getAttribute('href')),links);main.append(box);
  assert.equal(html.split('</main>').length,2,'Standalone main boundary');
  const output=html.replace('</main>',box.outerHTML+'</main>').replace('</head>',css.outerHTML+'</head>');
  fs.writeFileSync(file,output);
  report.push({file:path.relative(root,file),language:lang,independentArticle:true,body:'preserved'});
 }
}
for(const [lang,name] of [['en','index.html'],...config.languages.map(l=>[l,l+'/index.html'])]){const file=path.join(root,name),{document}=parseHTML(fs.readFileSync(file,'utf8'));improve(document,lang,name);fs.writeFileSync(file,'<!DOCTYPE html>\n'+document.documentElement.outerHTML+'\n');}
standalone();
fs.mkdirSync(path.join(root,'docs'),{recursive:true});
fs.writeFileSync(path.join(root,'docs/reader-first-content-preservation.json'),JSON.stringify({version:pub.version,baseline:'639617f5b79cf5524825ab7093f4c7bb722d1d42',scope:'Original evidence text nodes, source links and fragments; navigation intentionally revised',pages:report},null,2)+'\n');
console.log('READER_FIRST_PRESERVED '+JSON.stringify(report));
