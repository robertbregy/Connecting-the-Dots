'use strict';

// Economics now has a short introduction and four complete reading pages.
// Verify the published files, not just the renderer's preservation declaration.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {parseHTML}=require('linkedom');
const root=path.resolve(__dirname,'..');
const languages=['it','en','de','fr'];
const keys=['market','cases','portfolios','round-2026'];
const baselineCommit='4c7ddb62c7601f6971815aef17b7dce0f5f01e73';
const baselineIds=[
 'aps-current-economics','econ-case-ai','econ-case-auctions','econ-case-comnet','econ-case-entry-fee',
 'econ-case-io','econ-case-org','econ-case-tv','econ-case-withdrawals','economic-cycles-2026',
 'economicGrid','economicModels','economics-brand-strategy','economics-cases','economics-cemetery-link',
 'economics-chapter-cases','economics-chapter-concentration','economics-chapter-cycles','economics-chapter-reach',
 'economics-chapter-round2026','economics-chapter-value','economics-comparison-guide',
 'economics-comparison-guide-title','economics-concentration','economics-contention-2026','economics-cycles',
 'economics-historical-link','economics-part-1','economics-part-2','economics-part-3','economics-part-4',
 'economics-part-5','economics-part-6','economics-part-7','economics-part-8','economics-part-9',
 'economics-reach','economics-reading-guide','economics-round2026','economics-value','economy-sectors',
 'market-more','market-origin','market-result-count','market-search','market-web','market-zones',
 'reader-brief-economics','reader-brief-economics-title','reader-start-economics','round-application-fees',
 'sector-chart-caption','tld-market-reach'
].sort();
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const json=rel=>JSON.parse(read(rel));
const flat=value=>String(value??'').replace(/\s+/g,' ').trim();
const documentAt=rel=>parseHTML(read(rel)).document;
const destinationPath=(lang,key)=>key==='hub'?lang+'/index.html':`economics/${lang}/${key}/index.html`;
const expected={
 market:['#tld-market-reach'],
 cases:['.economicsHero','#economicModels','#economicGrid'],
 portfolios:['.portfolioEconomics','#economics-contention-2026','[data-round-focus="economics"]'],
 'round-2026':['#round-application-fees','#economic-cycles-2026','.crossRoundDisclosure','.economics2026Stats',
  '#aps-current-economics','#economics-brand-strategy','#economics-comparison-guide','.historicalEconomy']
};

function uniqueIds(document,label){
 const ids=[...document.querySelectorAll('[id]')].map(node=>node.id);
 assert.equal(new Set(ids).size,ids.length,label+' has duplicate IDs');
}

function readingWordCount(node){
 const parts=[];
 function visit(current){
  if(current.nodeType===3){parts.push(current.textContent);return;}
  if(current.nodeType===1&&current.matches('script,style,[aria-hidden="true"],.economicsLegacy'))return;
  for(const child of current.childNodes)visit(child);
 }
 visit(node);
 // Adjacent paragraphs/headings need a word boundary even when the HTML is
 // minified. Decorative labels and the legacy recovery navigation are omitted.
 return flat(parts.join(' ')).split(/\s+/).filter(Boolean).length;
}

function validatePreservation(){
 const inventory=json('data/economics-preservation.json'),publication=json('publication.json');
 const {snapshot}=require('./render_economics_hub.cjs');
 assert.equal(typeof snapshot,'function','The preservation snapshot contract is absent');
 assert.equal(inventory.schemaVersion,1);
 assert.equal(inventory.siteVersion,publication.version);
 assert.equal(inventory.baseCommit,baselineCommit,'The reviewed pre-migration baseline changed');
 assert.deepEqual(Object.keys(inventory.locales).sort(),[...languages].sort());
 let blocksChecked=0,linksChecked=0;
 for(const lang of languages){
  const evidence=inventory.locales[lang];
  assert.equal(evidence.sourceFile,lang+'/index.html');
  assert.deepEqual(Object.keys(evidence.anchors).sort(),baselineIds,lang+' must map all 53 original fragments');
  assert.ok(Object.values(evidence.anchors).every(key=>key==='hub'||keys.includes(key)),lang+' unknown fragment destination');
  assert.equal(evidence.blocks.length,11,lang+' must preserve all eleven content partitions');
  assert.equal(new Set(evidence.blocks.map(block=>block.key)).size,11,lang+' duplicate block ownership');
  assert.deepEqual(Object.fromEntries(['hub',...keys].map(key=>[key,evidence.blocks.filter(block=>block.destination===key).length])),
   {hub:3,market:1,cases:3,portfolios:1,'round-2026':3},lang+' block destinations changed');
  assert.equal(evidence.replacedNavigation.length,2,'Only the reading guide and the old six-link navigation may be replaced');
  const navigationSelectors=evidence.replacedNavigation.map(item=>item.selector.replace(/^:scope\s*>\s*/,''));
  assert.deepEqual(navigationSelectors.sort(),['#economics-reading-guide','.sectionToc'].sort(),'A content block was declared replaceable navigation');
  assert.ok(evidence.replacedNavigation.every(item=>flat(item.reason)),'Navigation replacement needs a stated reason');
  const documents=Object.fromEntries(['hub',...keys].map(key=>[key,documentAt(destinationPath(lang,key))]));
  const originalIds=[],tableInventory=[],metricInventory=[],actionInventory=[],marketInventory=[];
  const matchedNodes=new Map();
  for(const block of evidence.blocks){
   assert.ok(flat(block.key)&&flat(block.selector),lang+' invalid block identity');
   assert.equal(block.destinationPath,destinationPath(lang,block.destination),lang+' unexpected destination path');
   assert.ok(Array.isArray(block.sourceExcludeSelectors),lang+' exclusions must be explicit');
   if(block.sourceExcludeSelectors.length){
    assert.equal(block.selector,'#economics-chapter-value','Only the fee disclosure may leave its former parent');
    assert.deepEqual(block.sourceExcludeSelectors,[':scope > .economicsSupporting']);
   }
   assert.match(block.before.textSha256,/^[a-f0-9]{64}$/,'Invalid content fingerprint');
   assert.deepEqual(block.before.ids,[...new Set(block.before.ids)].sort(),'Original block IDs must be unique and sorted');
   assert.ok(Array.isArray(block.before.links)&&block.before.links.every(link=>typeof link.text==='string'&&typeof link.url==='string'&&link.url),
    'Every original link requires its label and destination');
   assert.ok(Array.isArray(block.before.tables)&&Array.isArray(block.before.metrics),'Table/metric evidence missing');
   assert.deepEqual(block.after,block.before,lang+' content changed while relocating '+block.key);
   const document=documents[block.destination],selector=block.destinationSelector||block.selector;
   const scope=block.destination==='hub'?document.getElementById('economics'):document.querySelector('.economicsDetail');
   assert.ok(scope,lang+' missing content scope for '+block.key);
   const nodes=scope.querySelectorAll(selector);
   assert.equal(nodes.length,1,lang+' missing or duplicated published block '+block.key+' ('+selector+')');
   const node=nodes[0];
   const previous=matchedNodes.get(block.destination)||[];
   assert.ok(previous.every(other=>!other.contains(node)&&!node.contains(other)),lang+' overlapping published content partitions');
   previous.push(node);matchedNodes.set(block.destination,previous);
   const actual=snapshot(node,{lang,pagePath:block.destinationPath,anchors:evidence.anchors});
   assert.deepEqual(actual,block.after,lang+' published bytes do not match preservation evidence for '+block.key);
   originalIds.push(...block.before.ids);tableInventory.push(...block.before.tables);metricInventory.push(...block.before.metrics);
   actionInventory.push(...block.before.actions);marketInventory.push(...block.before.marketData);
   linksChecked+=block.before.links.length;blocksChecked++;
  }
  // The original reading-guide ID remains on the replacement navigation. All
  // other original IDs belong to one preserved content partition.
  assert.equal(new Set(originalIds).size,originalIds.length,lang+' an original fragment belongs to multiple blocks');
  assert.deepEqual([...originalIds,'economics-reading-guide'].sort(),baselineIds,lang+' original content fragment omitted');
  assert.equal(tableInventory.length,7,lang+' original table lost');
  assert.equal(metricInventory.length,22,lang+' original economic metric lost');
  assert.equal(actionInventory.length,6,lang+' original Explorer action lost');
  assert.equal(marketInventory.length,100,lang+' original market row data lost');
  assert.deepEqual(evidence.summary,{originalIds:53,originalLinks:96,protectedLinks:90,explorerActions:6,replacedNavigationLinks:6,tables:7,models:8,cases:8,metrics:22},
   lang+' original content inventory changed');
  for(const [id,key] of Object.entries(evidence.anchors)){
   assert.equal(documents[key].querySelectorAll('[id="'+id+'"]').length,1,lang+' lost canonical fragment '+id);
   assert.equal(documents.hub.querySelectorAll('[id="'+id+'"]').length,1,lang+' lost native legacy fragment '+id);
  }
  for(const [key,document] of Object.entries(documents))uniqueIds(document,lang+'/'+key);
 }
 return {languages:4,blocks:blocksChecked,originalFragmentsPerLanguage:53,tablesPerLanguage:7,metricsPerLanguage:22,linksChecked};
}

function validateEconomicsOrder(){
 const preservation=validatePreservation(),inventory=json('data/economics-preservation.json');
 const publication=json('publication.json'),base=new URL(publication.deployment);
 const paths=[['en','index.html'],...languages.map(lang=>[lang,lang+'/index.html'])];
 const hubWords=[];
 for(const [lang,file] of paths){
  const document=documentAt(file),section=document.getElementById('economics');
  assert.ok(section,'Missing native Economics hub');
  assert.equal(section.dataset.economicsLayout,'hub-v1','Native Economics must use the short reading layout');
  const hub=section.matches('.economicsHub')?section:section.querySelector('.economicsHub');
  assert.ok(hub,'Missing short Economics introduction');
  const words=readingWordCount(hub);
  assert.ok(words>=600&&words<=900,lang+' Economics hub must contain 600–900 words; found '+words);
  hubWords.push({file,words});
  const links=[...section.querySelectorAll('a[data-economics-path]')];
  assert.deepEqual(links.map(link=>link.dataset.economicsPath),keys,lang+' four clear reading paths');
  for(const link of links){
   const url=new URL(link.getAttribute('href'),new URL(file,base));
   assert.equal(url.href,new URL(`economics/${lang}/${link.dataset.economicsPath}/`,base).href,'Hub link points to the wrong detail');
   assert.ok(flat(link.textContent),'A detail link has no accessible label');
  }
  assert.equal(section.querySelectorAll('.economicsChapter,.economicModel,.economicCase,.historicalEconomy,table').length,0,
   'The full dossier must not remain hidden inside the short hub');
  assert.ok(section.querySelector('#reader-brief-economics'),'The brief evidence note must stay in the hub');
  assert.ok(section.querySelector('#economics-cemetery-link'),'The cemetery continuation was lost');
  assert.ok(section.querySelector('.readerNext'),'The next-question links were lost');
  assert.equal(document.getElementById('cemetery').parentNode,section.parentNode,'Cemetery must remain its own chapter');
  uniqueIds(document,file);
  for(const id of baselineIds)assert.ok(document.getElementById(id),file+' missing legacy fragment '+id);
  const fallback=section.querySelector('.economicsLegacy');
  assert.ok(fallback,'Old fragments need ordinary fallback links');
  for(const key of keys)assert.ok([...fallback.querySelectorAll('a[href]')].some(link=>
   new URL(link.getAttribute('href'),new URL(file,base)).pathname===new URL(`economics/${lang}/${key}/`,base).pathname),
   lang+' missing non-JavaScript fallback to '+key);
 }
 assert.equal(flat(documentAt('index.html').getElementById('economics').textContent),
  flat(documentAt('en/index.html').getElementById('economics').textContent),'Root English alias differs from the English hub');
 for(const lang of languages){
  const documents=Object.fromEntries(keys.map(key=>[key,documentAt(destinationPath(lang,key))]));
  for(const [key,selectors] of Object.entries(expected)){
   const document=documents[key];
   for(const selector of selectors)assert.equal(document.querySelectorAll(selector).length,1,lang+'/'+key+' missing '+selector);
   for(const chapter of document.querySelectorAll('.economicsChapter')){
    assert.equal(chapter.closest('details'),null,'Main reading chapters must remain visible');
    assert.ok(chapter.querySelector(':scope > h2'),'A preserved chapter lost its heading');
   }
   assert.equal(document.querySelectorAll('.economicsChapter h2:not([data-economics-stage-title])').length,0,'Unscoped original H2');
  }
  assert.equal(documents.cases.querySelectorAll('#economicModels .economicModel').length,8);
  assert.equal(documents.cases.querySelectorAll('#economicGrid .economicCase').length,8);
  assert.equal(documents.cases.querySelectorAll('#economicGrid .economicMetric').length,22);
  assert.equal(documents.cases.querySelectorAll('#economicModels h3,#economicGrid h3').length,0,'Original heading hierarchy regressed');
  for(const id of ['market-web','market-zones'])assert.equal(documents.market.querySelectorAll('#'+id+' tbody tr').length,50);
  assert.ok(documents['round-2026'].querySelector('#aps-current-economics .note'),'Missing dataset scope');
  assert.ok(documents['round-2026'].querySelector('.historicalEconomy > .note'),'Missing historical-method warning');
  assert.equal(documents['round-2026'].querySelector('.historicalEconomy').hasAttribute('open'),false,'Historical comparison should open on request');
  assert.equal(documents['round-2026'].querySelectorAll('#aps-current-economics table').length,4);
  assert.equal(documents['round-2026'].querySelectorAll('#round-application-fees table').length,1);
  // Inline translation attributes are optional on localized reading documents;
  // their complete wording is checked by the block fingerprints above.
  assert.ok(flat(documents['round-2026'].querySelector('#economics-brand-strategy').textContent));
  assert.ok(flat(documents.portfolios.querySelector('.portfolioEconomics').textContent));
  for(const [id,key] of Object.entries(inventory.locales[lang].anchors))
   if(key!=='hub')assert.equal(documents[key].querySelectorAll('[id="'+id+'"]').length,1);
 }
 return {...preservation,nativePages:5,detailPages:16,modelsPerLanguage:8,casesPerLanguage:8,hubWords};
}

module.exports={validatePreservation,validateEconomicsOrder,readingWordCount,baselineIds,keys};
if(require.main===module)console.log('ECONOMICS_ORDER_STATIC_OK '+JSON.stringify(validateEconomicsOrder()));
