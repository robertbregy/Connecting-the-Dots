/* Reader-first architecture over canonical evidence. Every old text, link and ID is retained. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {parseHTML}=require('linkedom');
const root=path.resolve(__dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const config=read('data/reader_journeys.json'),translations=read('data/translations.json'),pub=read('publication.json');
const titleKeys={how:'tabHow',timeline:'tabArchaeology',beyond:'tabBeyond',cities:'tabCities',geography:'tabGeo',social:'tabSocial',contention:'tabContention',refusals:'tabRefusals',disputes:'tabDisputes',strange:'tabStrange',reveal:'roundOverviewNav',research:'researchCitationNav',resources:'tabResources',sources:'tabSources',explore:'tabExplore',economics:'tabEconomics',cemetery:'cemeteryTitle','inside-round':'insideNav','behind-round':'behindNav',lugano:'tabLugano',paper:'researchPaperTitle','governance-access':'accessTitle','governance-sanctions':'governanceTitle'};
const areaKeys={'ia-understand':'iaNavUnderstand','ia-explore':'iaNavExplore','ia-stories':'iaNavStories','ia-outcomes':'iaNavOutcomes','ia-round':'iaNavRound','ia-research':'iaNavResearch'};
const report=[];
function inventory(sec){
 const text=new Map(),links=new Map();
 function walk(n){if(n.nodeType===3){const t=n.textContent.replace(/\s+/g,' ').trim();if(t)text.set(t,(text.get(t)||0)+1);}else if(!n.matches?.('nav.sectionToc,nav.readerBreadcrumb,.readerNext'))for(const c of n.childNodes)walk(c);}
 walk(sec);for(const a of sec.querySelectorAll('a[href]'))if(!a.closest('nav.sectionToc,nav.readerBreadcrumb,.readerNext')){const k=a.getAttribute('href');links.set(k,(links.get(k)||0)+1);}
 return {text,links,ids:[...sec.querySelectorAll('[id]')].map(n=>n.id)};
}
function subset(before,after,label){for(const kind of ['text','links'])for(const [value,n] of before[kind])assert.ok((after[kind].get(value)||0)>=n,label+' lost '+kind+': '+value.slice(0,100));for(const id of before.ids)assert.ok(after.ids.includes(id),label+' lost fragment '+id);}
function render(lang,filename){
 const file=path.join(root,filename),{document}=parseHTML(fs.readFileSync(file,'utf8')),L=config.locales[lang],T=translations[lang],U=L.ui,prefix=filename==='index.html'?'':'../';
 assert.ok(!document.getElementById('reader-directory'),'Reader architecture already applied');
 const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text)n.textContent=text;if(cls)n.className=cls;return n;};
 const a=(text,id,anchor)=>{const n=el('a',text,'sectionLink');n.setAttribute('href','?tab='+id+(anchor?'#'+anchor:''));n.setAttribute('data-open-section',id);if(anchor)n.setAttribute('data-open-anchor',anchor);return n;};
 const title=id=>T[titleKeys[id]]||document.getElementById(id)?.querySelector('h1,h2')?.textContent.trim()||id;
 const snapshots=new Map();
 for(const id of Object.keys(config.related)){const sec=document.getElementById(id);assert.ok(sec,'Missing chapter '+id);snapshots.set(id,inventory(sec));}
 const citeRows=document.querySelectorAll('#research-citation-guide .audienceCiteGrid article');
 const correctedCitation=[];
 if(citeRows?.[1]){const date=citeRows[1].querySelector('strong');correctedCitation.push(date.textContent);date.textContent='v'+pub.version+' \u00b7 '+new Intl.DateTimeFormat(lang,{dateStyle:'long',timeZone:'UTC'}).format(new Date(pub.releasedOn+'T00:00:00Z'));}
 for(const old of correctedCitation)snapshots.get('research').text.delete(old);
 for(const [id,layout] of Object.entries(config.layouts)){
  const sec=document.getElementById(id);
  for(const n of sec.querySelectorAll(':scope > nav.sectionToc'))n.remove();
  const children=[...sec.children];assert.equal(children.length,layout.count,id+' block count changed: review new content explicitly');
  const assigned=[...layout.head,...layout.groups.flat()];assert.deepEqual([...assigned].sort((a,b)=>a-b),children.map((_,i)=>i),id+' missing or duplicate assignment');
  assert.equal(L.groups[id].length,layout.groups.length);
  const heading=el('header',null,'readerChapterHead');
  // The actual old title keeps its identity. The question and index now precede
  // long introductions; their evidence is moved, never dropped or hidden.
  const originalTitle=layout.head.length?children[layout.head[0]].querySelector('h2'):null;
  if(originalTitle){originalTitle.classList.add('readerChapterTitle');heading.append(originalTitle);}
  else {const h=el('h2',title(id),'readerChapterTitle');h.id='reader-title-'+id;heading.append(h);}
  heading.append(el('p',L.hooks[id],'readerOpening'));
  const marker=el('div',null,'readerTocPosition');marker.setAttribute('data-reader-toc-position','');
  const nav=el('nav',null,'sectionToc readerToc');nav.id='reader-toc-'+id;nav.setAttribute('aria-label',U.toc);
  const groups=layout.groups.map((indices,i)=>{
   const stage=el('div',null,'readerStage');stage.setAttribute('data-reader-stage',String(i+1));stage.id='reader-'+id+'-step-'+(i+1);
   const h=el('h2',L.groups[id][i],'readerStageTitle');h.id='read-'+id+'-'+(i+1);h.setAttribute('data-reader-stage-title','');stage.append(h);
   for(const idx of (i===0?[...layout.head,...indices]:indices)){const n=children[idx];
    if(n.querySelector('h2'))for(const old of [...n.querySelectorAll('h2,h3,h4')]){const next=el('h'+Math.min(6,Number(old.tagName.slice(1))+1));for(const attr of old.attributes)next.setAttribute(attr.name,attr.value);if(old.tagName==='H2')next.classList.add('readerSubheading');while(old.firstChild)next.append(old.firstChild);old.replaceWith(next);}
    stage.append(n);
   }
   const link=a(String(i+1)+'. '+L.groups[id][i],id,h.id);link.className='tocLink sectionLink';nav.append(link);return stage;
  });
  sec.replaceChildren(heading,marker,nav,...groups);sec.setAttribute('data-reader-order','reader-v1');
 }
 const cards=document.getElementById('cards'),footnote=document.getElementById('metricsFootnote');
 const figures=el('details',null,'readerSupporting');figures.append(el('summary',U.duplicate));cards.before(figures);figures.append(cards,footnote);
 const layers=document.getElementById('topic-layers'),why=document.getElementById('topic-why');if(layers&&why)why.before(layers);
 const topics=[];
 for(const [id,nextIds] of Object.entries(config.related)){
  const sec=document.getElementById(id),area=Object.keys(config.areas).find(k=>config.areas[k].includes(id));assert.ok(area);
  const crumb=el('nav',null,'readerBreadcrumb');crumb.setAttribute('aria-label',U.breadcrumb+' · '+title(id));
  crumb.append(a(U.home,'overview'),el('span','\u203a'),a(T[areaKeys[area]],area),el('span','\u203a'));
  crumb.querySelectorAll('span').forEach(n=>n.setAttribute('aria-hidden','true'));
  const current=el('span',title(id));current.setAttribute('aria-current','page');crumb.append(current);sec.prepend(crumb);
  if(!config.layouts[id]&&id!=='economics')crumb.after(el('p',L.hooks[id],'readerOpening'));
  const next=el('aside',null,'readerNext');next.setAttribute('aria-label',U.next);next.append(el('h2',U.next));
  const row=el('div',null,'readerNextGrid');
  for(const dest of nextIds){const link=a('',dest);link.classList.add('readerNextCard');link.append(el('strong',title(dest)),el('span',L.hooks[dest]),el('span','\u2192','readerArrow'));row.append(link);}
  next.append(row,a(U.up,id));sec.append(next);
  topics.push({id,title:title(id),hook:L.hooks[id]});
  for(const h of sec.querySelectorAll('[data-reader-stage-title],[data-economics-stage-title]'))topics.push({id,anchor:h.id,title:title(id)+' \u00b7 '+h.textContent,hook:L.hooks[id]});
  subset(snapshots.get(id),inventory(sec),filename+' '+id);
 }
 const directory=el('details',null,'readerDirectory');directory.id='reader-directory';directory.append(el('summary',U.search));
 const form=el('div',null,'readerSearchControls');form.hidden=true;
 const label=el('label',U.searchLabel);label.setAttribute('for','reader-search');
 const input=el('input');input.type='search';input.id='reader-search';input.setAttribute('placeholder',U.placeholder);input.setAttribute('autocomplete','off');input.setAttribute('aria-controls','reader-topic-list');
 const clear=el('button',U.clear);clear.type='button';clear.id='reader-search-clear';form.append(label,input,clear);directory.append(form);
 const status=el('p',null,'readerSearchStatus');status.id='reader-search-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');directory.append(status);
 const list=el('ul',null,'readerTopicList');list.id='reader-topic-list';
 for(const item of topics){const li=el('li');li.setAttribute('data-reader-topic','');li.setAttribute('data-reader-search-text',item.title+' '+item.hook);if(item.anchor)li.setAttribute('data-reader-detail','');li.append(a(item.title,item.id,item.anchor));list.append(li);}
 directory.append(list);const empty=el('p',U.none,'readerNoResults');empty.id='reader-no-results';empty.hidden=true;empty.append(document.createTextNode(' '),a(title('explore'),'explore'));directory.append(empty);
 directory.setAttribute('data-results-word',U.results);document.querySelector('.iaPrimaryNav').after(directory);
 document.querySelector('.heroActions').append(a(U.data,'ia-research'));
 for(const area of Object.keys(config.areas)){
  const hub=document.getElementById(area);assert.ok(hub);
  for(const card of hub.querySelectorAll('a[data-open-section]')){const dest=card.getAttribute('data-open-section');if(!L.hooks[dest])continue;const desc=card.closest('.iaHubCard')?.querySelector('p');if(desc){desc.removeAttribute('data-i18n');desc.textContent=L.hooks[dest];}}
 }
 const js=el('script');js.src=prefix+'assets/reader-journeys.js?v='+pub.version;js.setAttribute('defer','');document.getElementById('ctd-app').before(js);
 const css=el('link');css.rel='stylesheet';css.href=prefix+'assets/reader-journeys.css?v='+pub.version;document.head.append(css);
 const ids=[...document.querySelectorAll('[id]')].map(n=>n.id);assert.equal(new Set(ids).size,ids.length,'Duplicate document IDs '+filename);
 fs.writeFileSync(file,'<!DOCTYPE html>\n'+document.documentElement.outerHTML+'\n');
 report.push({file:filename,chapters:snapshots.size,reordered:Object.keys(config.layouts).length,directoryTopics:topics.length,retainedTextSegments:[...snapshots.values()].reduce((a,x)=>a+x.text.size,0),retainedFragments:[...snapshots.values()].reduce((a,x)=>a+x.ids.length,0),navigationDescriptions:'reviewed',metadataCorrection:correctedCitation});
}
for(const lang of ['en','it','de','fr'])for(const file of [lang+'/index.html',...(lang==='en'?['index.html']:[])])render(lang,file);
let standalone=0;
for(const dir of ['applications','inside-the-round','behind-the-round','research','explorer']){
 function walk(p){for(const entry of fs.readdirSync(p,{withFileTypes:true})){const f=path.join(p,entry.name);if(entry.isDirectory())walk(f);else if(entry.name.endsWith('.html')){
  // Research HTML is also a persistent rendering frame. Remove only this
  // renderer's own previous additions before adding exactly one current copy.
  const source=fs.readFileSync(f,'utf8')
   .replace(/<a\b[^>]*\bclass="readerStandaloneSearch"[^>]*>[\s\S]*?<\/a>/g,'')
   .replace(/<link\b[^>]*\bhref="[^"]*assets\/reader-journeys\.css(?:\?[^"]*)?"[^>]*>/g,'');
  if(!source.includes('ctdB2CrossNav'))continue;
  const {document}=parseHTML(source),lang=document.documentElement.lang,L=config.locales[lang];if(!L)continue;
  const title=document.querySelector('main h1,h1')?.textContent.trim();
  const bar=document.querySelector('.ctdB2Trail');if(!bar)continue;
  const a=document.createElement('a');a.textContent=L.ui.search;a.className='readerStandaloneSearch';
  const prefix=path.relative(path.dirname(f),root).split(path.sep).join('/');a.href=prefix+'/'+lang+'/?tab=overview#reader-search';
  const sheet=document.createElement('link');sheet.rel='stylesheet';sheet.href=prefix+'/assets/reader-journeys.css?v='+pub.version;
  const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let output=source.replace(/(<nav[^>]*class="ctdB2Trail"[^>]*>)([\s\S]*?)(<\/nav>)/,(_,open,body,close)=>open+body.replace(/(<span aria-current="page">)[^<]*(<\/span>)/,(_,x,y)=>x+escape(title||L.ui.index)+y)+a.outerHTML+close);
  assert.notEqual(output,source,'Standalone breadcrumb not found '+f);output=output.replace('</head>',sheet.outerHTML+'</head>');
  const checked=parseHTML(output).document;
  assert.equal(checked.querySelectorAll('.readerStandaloneSearch').length,1,'Repeated topic link '+f);
  assert.equal(checked.querySelectorAll('link[href*="reader-journeys.css"]').length,1,'Repeated reader stylesheet '+f);
  fs.writeFileSync(f,output);standalone++;
 }}}
 walk(path.join(root,dir));
}
assert.equal(standalone,39,'Standalone navigation coverage changed');
const out=process.env.CTD_READER_REPORT;if(out)fs.writeFileSync(out,JSON.stringify({pages:report,standalone,participants:0},null,2)+'\n');
console.log('READER_ARCHITECTURE_VERIFIED '+JSON.stringify({pages:report,standalone,participants:0}));
