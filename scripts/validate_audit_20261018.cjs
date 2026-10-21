#!/usr/bin/env node
'use strict';
// Validate the published files against their source records. Do not run the app
// or renderer here: doing so would conceal stale prerendered content.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const crypto=require('node:crypto'),assert=require('node:assert/strict');
const {domainToASCII}=require('node:url');
const {parseHTML}=require('linkedom');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file));
const json=file=>JSON.parse(read(file).toString('utf8'));
const html=file=>parseHTML(read(file).toString('utf8')).document;
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const clean=text=>String(text??'').replace(/\s+/gu,' ').trim();
const escape=text=>text.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const homePaths=['ia-understand','ia-explore','ia-stories','ia-outcomes','ia-round','ia-research'];
const luganoPaths=['lugano-status-sources','lugano-governance-decisions','lugano-uses-results','lugano-risks-checks'];
const resourceKeys=['resourcesOfficialTitle','resourcesDerivedTitle','resourcesArchivesTitle'];
function one(document,selector){
 const nodes=document.querySelectorAll(selector);
 assert.equal(nodes.length,1,'Expected one '+selector+', found '+nodes.length);
 return nodes[0];
}
function objects(value){
 if(!value||typeof value!=='object')return [];
 return [value,...Object.values(value).flatMap(objects)];
}
function schema(document,type){
 const values=[...document.querySelectorAll('script[type="application/ld+json"]')].flatMap(node=>objects(JSON.parse(node.textContent)));
 const matches=values.filter(value=>[].concat(value['@type']||[]).includes(type));
 assert.equal(matches.length,1,'Expected one JSON-LD '+type);
 return matches[0];
}
function scriptValue(source,key,filename){
 const context=vm.createContext({window:{}},{codeGeneration:{strings:false,wasm:false}});
 vm.runInContext(source,context,{filename,timeout:10000});
 assert.ok(context.window[key],filename+' did not declare '+key);
 return context.window[key];
}
function nameKey(value){
 const raw=String(value??'').trim().replace(/^\./,'').toLowerCase();
 const ascii=domainToASCII(raw);
 assert.ok(ascii&&!ascii.includes('.'),'Invalid name-level key '+JSON.stringify(value));
 return '.'+ascii;
}
function namedSet(values,label){
 const names=new Set(values.map(nameKey));
 assert.ok(names.size>0,label+' is empty');
 assert.equal(names.size,values.length,label+' contains duplicate names');
 return names;
}
function slots(template,actual){
 const keys=[];
 const pattern=clean(template).split(/(\{[a-zA-Z0-9]+\})/g).map(part=>{
  if(/^\{[a-zA-Z0-9]+\}$/.test(part)){keys.push(part.slice(1,-1));return '(.*?)';}
  return escape(part);
 }).join('');
 const match=clean(actual).match(new RegExp('^'+pattern+'$','u'));
 assert.ok(match,'Rendered text does not match its translation template: '+clean(actual).slice(0,180));
 return Object.fromEntries(keys.map((key,i)=>[key,match[i+1]]));
}
function integer(value,label){
 const plain=String(value??'').replace(/[.,\s'’]/gu,'');
 assert.match(plain,/^\d+$/,label+' is not an integer: '+JSON.stringify(value));
 return Number(plain);
}
function integers(text){
 return (text.match(/\d+(?:[.,\u00a0\u202f'’ ]\d{3})*/gu)||[]).map(value=>integer(value,'Displayed number'));
}
function datedReview(time,date){
 assert.equal(time.getAttribute('datetime'),date,'Review datetime differs from the event register');
 assert.equal(clean(time.textContent),date,'Visible review date differs from the event register');
}
function validateExplorer(document,t,expected){
 const rows=[...document.querySelectorAll('#explorerTableBody tr[data-explorer-index]')];
 const cards=[...document.querySelectorAll('#explorerCards .explorerCard')];
 assert.ok(rows.length>0&&rows.length<=expected.total,'Prerendered Explorer rows are missing');
 assert.equal(cards.length,rows.length,'Table and card views disagree');
 const names=rows.map(row=>nameKey(one(row,'.explorerTld bdi').textContent));
 assert.deepEqual(names,expected.names.slice(0,rows.length),'Initial table omits or misorders names from the archived union');
 assert.deepEqual(cards.map(card=>nameKey(one(card,'.explorerTld bdi').textContent)),names,'Initial mobile cards differ from the table');
 assert.deepEqual(integers(one(document,'#explorerResultCount').textContent),[expected.total,rows.length,expected.total],'Prerendered result count does not describe the full union');
 const corpus=one(document,'#applicationCorpusStatus');
 assert.ok(corpus.classList.contains('ready'),'Prerendered corpus is still loading');
 const values=slots(t.applicationCorpusReady,corpus.textContent);
 assert.equal(integer(values.records,'Explorer record count'),expected.total,'Corpus text has a stale Explorer total');
 assert.equal(integer(values.strings2026,'2026 string count'),expected.overlay,'Corpus text has a stale 2026 inventory count');
 const universe=slots(t.explorerUniverseNote,one(document,'#explorerUniverseNote').textContent);
 assert.equal(integer(universe.total,'Universe note'),expected.total);
 const note=slots(t.explorerExportNote,one(document,'#explorerExportNote').textContent);
 assert.equal(integer(note.count,'Export note'),expected.total);
 assert.equal(one(document,'#explorerExport').hasAttribute('disabled'),false,'Initial nonempty export is disabled');
}
function validateStructure(document,t){
 const links=[...document.querySelectorAll('.iaHomeJumpList a')];
 assert.deepEqual(links.map(link=>link.getAttribute('data-open-section')),['overview','explore','research'],'Home must expose three distinct reader intentions');
 assert.deepEqual([...document.querySelectorAll('.iaPrimaryLink')].map(link=>link.dataset.openSection),homePaths,'All six subject areas must remain in primary navigation');
 for(const link of links){
  const target=link.getAttribute('data-open-section');
  one(document,'#'+target+'.section');
  const href=new URL(link.getAttribute('href'),'https://ctd.invalid/');
  assert.equal(href.searchParams.get('tab')||href.hash.slice(1),target,'Home link destination differs from its target');
 }
 const chapters=[...one(document,'#lugano').children].filter(node=>node.classList.contains('luganoChapter'));
 assert.deepEqual(chapters.map(node=>node.id),luganoPaths,'Lugano must retain its four main groups');
 for(const chapter of chapters)assert.ok(clean(one(chapter,':scope > h2').textContent),'Empty Lugano heading');
 const groups=[...document.querySelectorAll('#resources .resourceGroup')];
 assert.equal(groups.length,resourceKeys.length,'Resources must have three provenance groups');
 assert.deepEqual(groups.map(node=>clean(one(node,':scope > h3').textContent)),resourceKeys.map(key=>clean(t[key])),'Resource provenance headings differ from their translations');
 const tables=[...document.querySelectorAll('table.auditDataTable')];
 assert.ok(tables.length>=2,'Analytical tables are missing');
 const captions=tables.map(table=>{
  const caption=clean(one(table,':scope > caption').textContent);
  assert.ok(caption,'An analytical table has an empty caption');
  const region=table.closest('[role="region"]');
  assert.ok(region,'Analytical table lacks a named overflow region');
  assert.equal(clean(region.getAttribute('aria-label')),caption,'Table and its accessible region have different names');
  return caption;
 });
 assert.equal(new Set(captions).size,captions.length,'Analytical table captions must distinguish the dimensions and breakdowns');
}
function validateDownloads(document,filename,t,pub){
 const pageURL=new URL(filename,pub.deployment);
 for(const [selector,file] of [['[data-current-data-pack]',pub.currentDataPackPath],['[data-current-data-checksum]',pub.currentDataPackPath.replace(/\.zip$/,'.sha256')]]){
  const link=one(document,selector);
  assert.equal(link.tagName,'A',selector+' must be a download link');
  assert.equal(new URL(link.getAttribute('href'),pageURL).href,new URL(file,pub.deployment).href,'Stale or incorrectly relative '+selector+' URL');
  assert.equal(link.getAttribute('download'),path.posix.basename(file),'Stale '+selector+' download filename');
 }
 for(const key of ['downloadPack','currentDataPackNote']){
  const label=one(document,'[data-i18n="'+key+'"]');
  assert.ok(label.closest('[data-current-data-pack]'),'Current pack description is detached from its download');
  assert.equal(clean(label.textContent),clean(t[key].replace('{version}',pub.currentDataPackVersion)),'Stale or unresolved '+key+' version');
 }
 const dataset=schema(document,'Dataset');
 assert.equal(dataset.version,pub.version,'Dataset JSON-LD version is stale');
 assert.equal(dataset.dateModified,pub.releasedOn,'Dataset JSON-LD date is stale');
 const current=[].concat(dataset.distribution||[]).filter(item=>item.contentUrl===new URL(pub.currentDataPackPath,pub.deployment).href);
 assert.equal(current.length,1,'Dataset JSON-LD lacks the unique current data pack');
 assert.equal(current[0].version,pub.currentDataPackVersion,'Current data-pack JSON-LD version is stale');
 const runtime=scriptValue(one(document,'#ctd-publication').textContent,'DOT_PUBLICATION',filename+' publication metadata');
 for(const key of ['version','releasedOn','currentDataPackVersion','currentDataPackPath','paperVersion','paperRevisedOn'])assert.equal(runtime[key],pub[key],'Embedded publication metadata is stale: '+key);
}
function validatePaper(document,md,pub,manifest){
 assert.equal(one(document,'meta[name="ctd-paper-source-sha256"]').getAttribute('content'),hash(md),'Paper HTML was not regenerated from the current Markdown');
 const article=schema(document,'ScholarlyArticle');
 assert.equal(article.version,pub.paperVersion,'Paper JSON-LD version is stale');
 assert.equal(article.dateModified,pub.paperRevisedOn,'Paper JSON-LD revision date is stale');
 assert.equal(article.url,new URL(pub.paperPath,pub.deployment).href,'Paper JSON-LD identifies a different document');
 const archived=[manifest.currentResearchRelease,...manifest.previousResearchReleases].find(release=>release.id==='RR2');
 assert.ok(archived?.doi,'RR2 archival identity is missing from the research manifest');
 const parent=JSON.stringify(article.isPartOf||'');
 assert.ok(!/\bRR2\b/.test(parent)&&!parent.includes(archived.doi),'A later working-paper revision must not claim membership in frozen RR2');
 assert.ok(JSON.stringify(article.isBasedOn||'').includes(archived.doi),'The independent paper must retain its RR2 source citation');
 const revision=new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(pub.paperRevisedOn+'T00:00:00Z'));
 assert.ok(document.title.includes(pub.paperVersion),'Visible paper title version is stale');
 const body=clean(one(document,'main').textContent);
 assert.ok(body.includes('Working Paper v'+pub.paperVersion)&&body.includes('living revision '+revision),'Visible manuscript revision differs from publication.json');
 assert.equal(manifest.workingPaperRevision.version,pub.paperVersion,'Research manifest paper version is stale');
 assert.equal(manifest.workingPaperRevision.revisedOn,pub.paperRevisedOn,'Research manifest paper date is stale');
}
function main(){
 const pub=json('publication.json'),translations=json('data/translations.json');
 const register=json('data/inside_the_round_events.json'),manifest=json('research/research_release_manifest.json');
 assert.match(pub.currentDataPackPath,/\.zip$/,'Publication must identify a ZIP data pack');
 assert.ok(path.posix.basename(pub.currentDataPackPath).includes('v'+pub.currentDataPackVersion+'.zip'),'Pack path/version mismatch in publication.json');
 const checksumFile=pub.currentDataPackPath.replace(/\.zip$/,'.sha256');
 const checksum=read(checksumFile).toString('utf8').trim().match(/^([a-f0-9]{64})\s+\*?([^\r\n]+)$/i);
 assert.ok(checksum,'Invalid current data-pack checksum file');
 assert.equal(checksum[2],path.posix.basename(pub.currentDataPackPath),'SHA-256 file identifies a different archive');
 assert.equal(checksum[1].toLowerCase(),hash(read(pub.currentDataPackPath)),'Current ZIP checksum mismatch');
 const base=scriptValue(read('data/site_bundle.js').toString('utf8'),'DOT_DATA','data/site_bundle.js');
 const snapshot=scriptValue(read('data/applications_2026_strings_reveal.js').toString('utf8'),'CTD2026_STRING_SNAPSHOT','data/applications_2026_strings_reveal.js');
 const initial=namedSet(Array.from(base.explorer,row=>row.asciiString||row.string),'Core name catalogue');
 const overlay=namedSet(Array.from(snapshot.data.rows,row=>row.string),'Frozen 2026 inventory');
 assert.equal(initial.size,base.explorerMeta.recordCount,'Core record count disagrees with its name catalogue');
 assert.equal(overlay.size,Number(snapshot.totalStrings),'Snapshot totalStrings is inconsistent');
 assert.equal(overlay.size,Number(snapshot.data.total),'Snapshot row total is inconsistent');
 const union=new Set([...initial,...overlay]);
 const expected={total:union.size,overlay:overlay.size,names:[...union].sort((a,b)=>a.localeCompare(b,'en'))};
 const pages=[...['en','it','de','fr'].map(language=>({language,file:language+'/index.html'})),{language:'en',file:'index.html'}];
 let groups=1;
 for(const {language,file} of pages){
  const document=html(file),t=translations[language];
  assert.equal(document.documentElement.getAttribute('lang'),language,file+' language mismatch');
  try{
   validateDownloads(document,file,t,pub);groups++;
   datedReview(one(document,'#insideRoundReviewedDate'),register.lastReviewed);groups++;
   validateExplorer(document,t,expected);groups++;
   validateStructure(document,t);groups++;
  }catch(error){throw new Error(file+': '+error.message,{cause:error});}
 }
 for(const language of ['en','it','de','fr']){
  const file='inside-the-round/'+language+'/index.html',document=html(file);
  const reviews=[...document.querySelectorAll('p.muted > time')].filter(time=>clean(time.parentElement.textContent).startsWith(translations[language].insideReviewedLabel+':'));
  assert.equal(reviews.length,1,file+' must expose its editorial review date');
  datedReview(reviews[0],register.lastReviewed);
  assert.equal(schema(document,'CollectionPage').dateModified,register.lastReviewed,file+' JSON-LD review date differs from its register');groups++;
 }
 validatePaper(html(pub.paperPath),read(manifest.workingPaperRevision.path),pub,manifest);groups++;
 console.log('AUDIT_20261018_STATIC_PASS '+JSON.stringify({version:pub.version,mainPages:pages.length,standaloneTimelines:4,validationGroups:groups,currentDataPack:pub.currentDataPackPath,paperVersion:pub.paperVersion,reviewedOn:register.lastReviewed,explorer:{core:initial.size,secondary:overlay.size,overlap:initial.size+overlay.size-union.size,union:union.size}}));
}
if(require.main===module){try{main();}catch(error){console.error('AUDIT_20261018_STATIC_FAIL '+(error.stack||error));process.exitCode=1;}}
module.exports={validateExplorer,validateStructure,validateDownloads,validatePaper,datedReview};
