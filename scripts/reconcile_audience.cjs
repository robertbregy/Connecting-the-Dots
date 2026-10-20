/* Reading layers over the source-backed publication. All original evidence stays available. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {parseHTML}=require('linkedom');
const root=path.resolve(__dirname,'..');
const data=JSON.parse(fs.readFileSync(path.join(root,'data/audience_editorial.json'),'utf8'));
const pub=JSON.parse(fs.readFileSync(path.join(root,'publication.json'),'utf8'));
for(const lang of ['en','it','de','fr'])for(const filename of [lang+'/index.html',...(lang==='en'?['index.html']:[])]){
 const t=data.locales[lang],prefix=filename==='index.html'?'':'../',file=path.join(root,filename);
 const {document}=parseHTML(fs.readFileSync(file,'utf8'));
 const h=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const make=html=>{const n=document.createElement('div');n.innerHTML=html;return n.firstElementChild};
 const route=(tab,anchor)=>'?tab='+tab+(anchor?'#'+anchor:'');
 const stages=[...document.querySelectorAll('[data-cultural-stage]')];
 const stageID=key=>{
  const aliases={origins:0,web_presence:1,community:2,scripts:3,cities_brands:4,reinterpretation:7};
  const n=stages[aliases[key]];assert.ok(n,'Unknown historical stage '+key);
  n.id='cultural-case-'+n.dataset.culturalStage;return n.id;
 };
 for(const n of stages)n.id='cultural-case-'+n.dataset.culturalStage;

 const hero=document.querySelector('.hero');
 const title=hero.querySelector('h1');title.innerHTML='<span class="audienceBrand">Connecting the Dots</span><span>'+h(t.hook)+'</span>';
 hero.querySelector('.iaProjectPrompt')?.remove();
 const primary=hero.querySelector('.heroPrimary');primary.href=route('overview','three-minute-guide');primary.dataset.openSection='overview';primary.dataset.openAnchor='three-minute-guide';
 const visual=hero.querySelector('.heroLogo');visual.className='audienceDiscoveries';visual.innerHTML=t.stories.map(([name,title,body,key],i)=>'<a class="audienceDiscovery sectionLink" href="'+route('timeline',stageID(key))+'" data-open-section="timeline" data-open-anchor="'+stageID(key)+'"><span class="discoveryName">'+h(name)+'</span><span><strong>'+h(title)+'</strong><span>'+h(body)+'</span></span><span aria-hidden="true">↗</span></a>').join('');
 // Put the examples before the authorship metadata when the columns stack.
 const byline=hero.querySelector('.projectByline');hero.append(byline,hero.querySelector('.publicationState'),hero.querySelector('.epistemicLegend'));
 // Native disclosure: readable without a new runtime, opened by the existing
 // anchor navigation on click, reload, history navigation and language switch.
 const q=t.quickGuide;
 const quick=make('<details class="quickGuide" id="three-minute-guide"><summary><h2><span class="eyebrow">'+h(q.eyebrow)+'</span><span class="quickTitle">'+h(q.title)+'</span><span class="quickPreview">'+h(q.preview)+'</span><span class="quickOpen">'+h(q.open)+' →</span></h2></summary><div class="quickBody"><p class="quickLead">'+h(q.lead)+'</p><ol class="quickSteps">'+q.steps.map((s,i)=>'<li id="quick-step-'+(i+1)+'"><div class="quickStepTop"><span class="quickNumber" aria-hidden="true">0'+(i+1)+'</span><bdi class="quickName">'+h(s.name)+'</bdi></div><h3>'+h(s.title)+'</h3><p class="quickHook">'+h(s.hook)+'</p><p>'+h(s.body)+'</p><p class="quickTakeaway">'+h(s.takeaway)+'</p><a class="quickMore" href="'+route(s.tab,s.anchor)+'" data-open-section="'+h(s.tab)+'" data-open-anchor="'+h(s.anchor)+'">'+h(s.more)+' →</a>'+(s.sources.length?'<details class="quickSources"><summary>'+h(q.sourceLabel)+'</summary><ul>'+s.sources.map(id=>{const ref=data.everydaySources[id];assert.ok(ref,'Unknown everyday source '+id);return '<li><a href="'+h(ref.url)+'" target="_blank" rel="noopener noreferrer">'+h(ref.label)+'</a></li>'}).join('')+'</ul></details>':'')+'</li>').join('')+'</ol><p class="small quickStatus">'+h(q.statusNote)+'</p><div class="quickRecall"><h3>'+h(q.takeawayTitle)+'</h3><p>'+h(q.takeawayIntro)+'</p><details><summary>'+h(q.recall)+'</summary><ul>'+q.ideas.map(x=>'<li>'+h(x)+'</li>').join('')+'</ul></details></div><div class="quickNext"><h3>'+h(q.nextTitle)+'</h3><div><a class="control" href="'+route('timeline','cultural-epoch-map')+'" data-open-section="timeline" data-open-anchor="cultural-epoch-map">'+h(q.nextHistory)+' →</a><a class="control" href="'+route('explore')+'" data-open-section="explore">'+h(q.nextSearch)+' →</a><a class="control" href="'+route('lugano','lugano-status-sources')+'" data-open-section="lugano" data-open-anchor="lugano-status-sources">'+h(q.nextCity)+' →</a></div><p><a href="'+route('research','reader-study-protocol')+'" data-open-section="research" data-open-anchor="reader-study-protocol">'+h(q.studyLink)+'</a></p></div></div></details>');
 document.getElementById('overview').prepend(quick);
 const homeIntro=document.querySelector('.iaHomeEntryIntro');homeIntro.querySelector('.eyebrow')?.remove();const projectDefinition=homeIntro.querySelector('[data-i18n="iaProjectDefinition"]');projectDefinition?.remove();
 document.querySelector('.homeJourney')?.classList.add('audienceSecondaryJourney');
 const scope=document.querySelector('.homeScope');
 const introDetail=make('<details class="audienceDetails"><summary>'+h(t.moreContext)+'</summary></details>');
 for(const n of [...scope.children])if(!n.matches('#internet-guide'))introDetail.append(n);
 if(projectDefinition)introDetail.append(projectDefinition);scope.prepend(introDetail);
 const guide=document.getElementById('internet-guide'),refs=guide.querySelector('.journeyReferences');
 const foundation=guide.querySelector('.journeyFoundation');if(foundation&&refs)refs.insertBefore(foundation,refs.children[1]||null);

 // Full reconciliation remains available beside the search, without leading it.
 const corpus=document.getElementById('applicationCorpusStatus'),about=document.querySelector('.explorerAbout');
 about.insertBefore(corpus,about.children[1]);
 const bridge=document.getElementById('apsAtlasBridge');
 const bridgeDisclosure=make('<details class="audienceDetails audienceAtlasLink"><summary>'+h(t.bridge)+'</summary></details>');bridge.before(bridgeDisclosure);bridgeDisclosure.append(bridge);
 const native=document.getElementById('aps-native');
 if(native){const disclosure=make('<details class="audienceDetails audienceAtlasPanel"><summary>'+h(t.bridge)+' · 2026</summary></details>');native.before(disclosure);disclosure.append(native);}
 const search=document.querySelector('.explorerSearchPrimary');
 search.after(make('<div class="audienceSearchScope"><label for="explorerSearchScope">'+h(t.scopeLabel)+'</label><select id="explorerSearchScope"><option value="all">'+h(t.scopeAll)+'</option><option value="names">'+h(t.scopeNames)+'</option></select><p class="small">'+h(t.searchHelp)+'</p></div>'));
 about.querySelector('summary').textContent=t.corpus;

 const trajectory=document.getElementById('tld-cultural-trajectory');
 const map=make('<div class="audienceEpochMap" id="cultural-epoch-map"><span class="eyebrow">'+h(document.querySelector('[data-i18n="reading"]').textContent)+'</span><h3>'+h(t.mapTitle)+'</h3><p>'+h(t.mapLead)+'</p><ol>'+t.epochs.map(([period,title,names,body,key])=>'<li><span class="epochPeriod">'+h(period)+'</span><h4>'+h(title)+'</h4><strong class="epochNames"><bdi>'+h(names)+'</bdi></strong><p>'+h(body)+'</p><a href="'+route('timeline',stageID(key))+'" data-open-section="timeline" data-open-anchor="'+stageID(key)+'">'+h(t.epochMore)+' →</a></li>').join('')+'</ol><p class="audienceEssentialLimit">'+h(t.cultureLimit)+'</p></div>');
 trajectory.querySelector('h2').after(map);
 const warning=trajectory.querySelector(':scope > .auditEvidence');
 if(warning){const disclosure=make('<details class="audienceDetails"><summary>'+h(t.limits)+'</summary></details>');warning.before(disclosure);disclosure.append(warning)}
 // A dated source/editorial review is not independent validation.
 for(const n of document.querySelectorAll('.tldResearch>p.small:last-child'))n.textContent=t.review;
 for(const n of document.querySelectorAll('.tldResearch .small'))if(/Ricerca verificata|Research verified|Recherche vérifiée|Forschung.*geprüft/.test(n.textContent))n.textContent=t.review;

 const market=document.getElementById('tld-market-reach');market.querySelector('.sectionLead').textContent=t.marketIntro;
 for(const key of ['web','zones']){
  const panel=document.getElementById('market-'+key),heading=panel.querySelector('h3'),scopeNote=heading.nextElementSibling;
  const full=make('<details class="audienceMeasureDetails"><summary>'+h(t.measureDetails)+'</summary></details>');scopeNote.before(full);full.append(scopeNote);
  const short=make('<p class="audienceMeasureScope">'+h(t[key==='web'?'webScopeShort':'zoneScopeShort'])+'</p>');full.before(short);
  const summary=make('<details class="audienceMarketSummary"><summary>'+h(t.marketSummary)+'</summary></details>');
  const note=panel.querySelector('.marketSummaryScope'),groups=panel.querySelector('.marketGroups');note.before(summary);summary.append(note,groups);
  // Keep the essential scope before the values, complete methodology after them.
  const table=panel.querySelector('.marketTable');table.after(full,summary);
 }
 const more=make('<button id="market-more" type="button" class="control" aria-controls="market-web market-zones" aria-expanded="false" hidden>'+h(t.showAll)+'</button>');
 document.getElementById('market-zones').after(more);
 const payload=document.getElementById('rsp-footprint-data'),payloadData=JSON.parse(payload.textContent);payloadData.audience={showAll:t.showAll,showTen:t.showTen,shown:t.shown};payload.textContent=JSON.stringify(payloadData).replace(/</g,'\\u003c');

 const refsByType={doi:'https://doi.org/'+pub.doi,pack:prefix+pub.currentDataPackPath,paper:prefix+pub.paperPath};
 const cite=make('<div class="panel audienceCite" id="research-citation-guide"><h3>'+h(t.citeTitle)+'</h3><p>'+h(t.citeIntro)+'</p><div class="audienceCiteGrid">'+t.citeRows.map(([object,date,body,type])=>'<article><h4>'+h(object)+'</h4><strong>'+h(date)+'</strong><p>'+h(body)+'</p><a href="'+h(refsByType[type])+'"'+(type==='doi'||type==='paper'?' target="_blank" rel="noopener noreferrer"':' download')+'>'+h(type==='doi'?pub.doi:type==='pack'?'ZIP · '+pub.version:'HTML · '+pub.paperVersion)+' →</a></article>').join('')+'</div></div>');
 const research=document.getElementById('research');research.prepend(cite);
 research.append(make('<div class="panel audienceValidation" id="independent-review-status"><h3>'+h(t.verificationTitle)+'</h3><p>'+h(t.verificationBody)+'</p><p><a href="'+prefix+'data/independent_review_materials.json">'+h(t.kit)+' · JSON</a> · <a href="'+prefix+'data/cultural_blind_review_v2.csv" download>CSV · '+h(t.kit)+'</a></p></div>'));
 const protocol=JSON.parse(fs.readFileSync(path.join(root,'data/independent_review_materials.json'),'utf8')).readerStudy.locales[lang];
 research.append(make('<div class="panel readerStudyPanel" id="reader-study-protocol"><h3>'+h(protocol.title)+'</h3><p>'+h(protocol.lead)+'</p><p class="readerStudyStatus">'+h(protocol.status)+'</p><p>'+h(protocol.plan)+'</p><div class="downloads"><a class="control" href="'+prefix+'research/reader-study/'+lang+'/">'+h(protocol.title)+' →</a><a class="control" href="'+prefix+'data/reader_observations_blank.csv" download>'+h(protocol.download)+'</a></div></div>'));

 const sheet=document.createElement('link');sheet.rel='stylesheet';sheet.href=prefix+'assets/audience.css?v='+pub.version;document.head.append(sheet);
 // A new HTML release must not execute an older cached enhancement script.
 for(const node of document.querySelectorAll('script[src],link[rel="stylesheet"][href]')){
  const attr=node.tagName==='SCRIPT'?'src':'href',ref=node.getAttribute(attr);
  if(!/^https?:/.test(ref)&&/(?:^|\/)assets\/[^?#]+\.(?:js|css)(?:\?|$)/.test(ref))node.setAttribute(attr,ref.split('?')[0]+'?v='+pub.version);
 }
 // Route styling must precede large inline dictionaries and census payloads.
 const initial=document.getElementById('ctd-initial-route');if(initial)document.head.insertBefore(initial,document.head.children[1]);
 fs.writeFileSync(file,'<!DOCTYPE html>\n'+document.documentElement.outerHTML+'\n');
}
console.log('AUDIENCE_RECONCILED',JSON.stringify({languages:4,humanParticipants:0,independentCoding:'pending',evidence:'preserved'}));
