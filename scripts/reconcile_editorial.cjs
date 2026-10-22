/* Dated audit corrections over the native publication. No remote data access.
   Original evidence remains available; layout changes retain IDs and links. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {parseHTML}=require('linkedom');
const root=path.resolve(__dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const pub=read('publication.json'),dict=read('data/translations.json');
const edit=read('data/audit_20261018_editorial.json'),analytics=read('data/aps_2026_current_analytics.json');
const manifest=read('data/manifest.json');
const e=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const categoryKeys={'Technology, software & infrastructure':'sectorTech','AI & automation':'sectorAI','Crypto & digital assets':'sectorCrypto','Retail & commerce':'sectorRetail','Finance & insurance':'sectorFinance','Media, social & communications':'sectorMedia','Cybersecurity, identity & trust':'sectorTrust','Health & life sciences':'sectorHealth','Education & research':'sectorEducation','Energy, industrial & materials':'sectorEnergy','Travel & hospitality':'sectorTravel','Consumer & lifestyle':'sectorConsumer','Gaming, sports & entertainment':'sectorGaming','Professional & business services':'sectorProfessional','Food & beverage':'sectorFood','Automotive & mobility':'sectorAutomotive','Telecom & connectivity':'sectorTelecom','Real estate & construction':'sectorRealEstate'};
for(const lang of ['en','it','de','fr']){
 const t=(key,vars={})=>{let out=dict[lang][key];assert.ok(out,'Missing '+lang+' '+key);for(const [k,v] of Object.entries(vars))out=out.split('{'+k+'}').join(v);return out;};
 const L=edit.locales[lang];assert.deepEqual(Object.keys(L).sort(),Object.keys(edit.locales.en).sort());
 const nf=new Intl.NumberFormat(lang),pf=new Intl.NumberFormat(lang,{minimumFractionDigits:1,maximumFractionDigits:1});
 const date=new Intl.DateTimeFormat(lang,{year:'numeric',month:'short',day:'numeric',timeZone:'UTC'});
 const localDate=s=>date.format(new Date(s+'T00:00:00Z'));
 const cat=s=>s==='[not classified or missing]'?L.missing:s==='Registry & domain industry'?L.registry:categoryKeys[s]?t(categoryKeys[s]):s;
 const links=(prefix,items)=>'<div class="downloads">'+items.map(([file,label,desc])=>`<a class="downloadCard" href="${prefix}data/${file}" download><b>${e(label)}</b><span>${e(desc||L.sourceDate)}</span></a>`).join('')+'</div>';
 const scopeRows=(key,scope)=>analytics.distributions[key].filter(x=>x.scope===scope);
 function table(rows,first,share,format=cat,label=first){return `<div class="auditTableWrap" role="region" tabindex="0" aria-label="${e(label)}"><table class="auditDataTable"><caption class="srOnly">${e(label)}</caption><thead><tr><th scope="col">${e(first)}</th><th scope="col">${e(L.applications)}</th><th scope="col">${e(share)}</th></tr></thead><tbody>${rows.map(r=>`<tr${r.category==='[not classified or missing]'?' class="auditMissing"':''}><th scope="row">${e(format(r.category))}</th><td>${nf.format(r.applications)}</td><td>${pf.format(r.share_of_all_pct)}%</td></tr>`).join('')}</tbody></table></div>`;}
 for(const rel of [lang+'/index.html',...(lang==='en'?['index.html']:[])]){
  const file=path.join(root,rel),prefix=rel==='index.html'?'':'../';
  const original=fs.readFileSync(file,'utf8');
  const {document}=parseHTML(original);
  assert.ok(!document.getElementById('aps-current-economics'),'Audit reconciliation already applied');
  const make=markup=>{const box=document.createElement('div');box.innerHTML=markup;return box.firstElementChild;};
  const section=id=>{const n=document.getElementById(id);assert.ok(n,'Missing section '+id);return n;};

  // Put the chapter question before the cross-round comparison; keep every
  // original comparison available in a keyboard-operable native disclosure.
  for(const panel of document.querySelectorAll('.crossRoundPanel')){
   const title=panel.querySelector('h2'),detail=document.createElement('details'),summary=document.createElement('summary');
   detail.className='panel crossRoundDisclosure';summary.textContent=title.textContent;
   detail.append(summary);title.remove();while(panel.firstChild)detail.append(panel.firstChild);panel.replaceWith(detail);
  }
  section('contention').prepend(make(`<div class="panel chapterQuestion"><h2>${e(t('contentionQuestionTitle'))}</h2><p class="sub sectionLead">${e(t('contentionQuestionLead'))}</p></div>`));

  // Separate the new official-ID analysis from the earlier mixed taxonomy.
  const cov=analytics.coverage.new_primary;
  const panel=make(`<div class="panel auditAnalytics" id="aps-current-economics"><div class="panelTop"><span class="ep derivedBadge">${e(t('derived'))}</span></div><h2>${e(L.title)}</h2><p class="sub sectionLead">${e(L.intro)}</p><p class="note">${e(L.scope)}</p><div class="auditTwoColumns"><article><h3>${e(L.themeTitle)}</h3><p class="auditCoverage"><strong>${nf.format(cov.stringThemeClassified)} / ${nf.format(cov.applications)}</strong> ${e(L.classified)}</p><p>${e(L.themeNote)}</p>${table(scopeRows('stringThemes','new_primary').slice(0,9),L.category,L.share,cat,L.themeTitle)}<details><summary>${e(L.allCategories)}</summary>${table(scopeRows('stringThemes','new_primary'),L.category,L.share,cat,L.themeTitle+' · '+L.allCategories)}</details></article><article><h3>${e(L.sectorTitle)}</h3><p class="auditCoverage"><strong>${nf.format(cov.applicantSectorClassified)} / ${nf.format(cov.applications)}</strong> ${e(L.classified)}</p><p>${e(L.sectorNote)}</p>${table(scopeRows('applicantSectors','new_primary'),L.category,L.share,cat,L.sectorTitle)}</article></div><p class="note">${e(L.denominator)}</p><details class="auditMethod"><summary>${e(L.method)}</summary><p>${e(L.methodNote)}</p><h3>${e(L.exampleTitle)}</h3><p>${e(L.exampleNote)}</p><div class="auditTableWrap" role="region" tabindex="0" aria-label="${e(L.exampleTitle)}"><table class="auditDataTable"><caption class="srOnly">${e(L.exampleTitle)}</caption><thead><tr><th scope="col">Application ID</th><th scope="col">${e(L.applicant)}</th><th scope="col">${e(L.sectorTitle)}</th></tr></thead><tbody>${analytics.exampleAgent.map(r=>`<tr><th scope="row"><a href="${prefix}applications/${lang}/?id=${e(r.applicationId)}#aps-results">${e(r.applicationId)}</a></th><td>${e(r.applicant)}</td><td>${e(r.applicantSector?cat(r.applicantSector):L.missing)}</td></tr>`).join('')}</tbody></table></div><p><a href="${prefix}data/aps_2026_current_analytics_manifest.json">${e(L.method)} · JSON</a> · <a href="${prefix}data/aps_2026_applicant_sector_evidence.json">${e(L.sectorTitle)} · ${e(t('source'))}</a></p></details>${links(prefix,[['aps_2026_current_analytics.csv',L.download,L.downloadSub],['aps_2026_string_theme_distribution.csv',L.themeTitle],['aps_2026_applicant_sector_distribution.csv',L.sectorTitle]])}<p class="small">${e(L.snapshot)} · ${e(L.sourceDate)}</p></div>`);
  const legacy=section('economy-sectors');
  legacy.before(panel);
  const old=document.createElement('details');old.className='panel historicalEconomy';
  old.append(make(`<summary>${e(t('historicalEconomyTitle'))}</summary>`));old.append(make(`<p class="note">${e(t('historicalEconomyNote'))}</p>`));
  legacy.before(old);old.append(legacy);

  // Show legal applicants and declared locations as project calculations.
  const regions=new Intl.DisplayNames([lang],{type:'region'});
  const geo=make(`<div class="panel auditAnalytics" id="aps-current-geography"><div class="panelTop"><span class="ep derivedBadge">${e(t('derived'))}</span></div><h2>${e(L.geoTitle)}</h2><p class="sub sectionLead">${e(L.geoIntro)}</p><div class="auditTwoColumns"><article><h3>${e(L.geoApplicant)}</h3>${table(scopeRows('applicants','all_published').slice(0,10),L.applicant,L.sharePublished,s=>s)}</article><article><h3>${e(L.geoLocation)}</h3>${table(scopeRows('locations','all_published').slice(0,10),L.geoLocation,L.sharePublished,s=>{try{return regions.of(s)+' · '+s;}catch{return s;}})}</article></div><p class="note">${e(L.geoNote)}</p>${links(prefix,[['aps_2026_applicant_distribution.csv',L.geoDownload],['aps_2026_location_distribution.csv',L.locationDownload],['aps_2026_region_distribution.csv',L.regionDownload]])}</div>`);
  section('geography').querySelector('.identityCase').before(geo);
  const top=scopeRows('applicants','all_published')[0];
  const val=document.getElementById('identity2026TopValue'),name=document.getElementById('identity2026TopName');
  val.textContent=nf.format(top.applications);val.setAttribute('data-aps-value',String(top.applications));
  name.textContent=top.category;name.setAttribute('data-aps-name',top.category);
  const state=document.getElementById('identity2026TopState');state.hidden=true;state.setAttribute('data-aps-derived','true');
  val.closest('.identityCurrent')?.append(make(`<p class="small">${e(L.sourceDate)} · ${e(t('derived'))} · ${nf.format(1614)} Application ID</p>`));

  // Consolidate Lugano into four readable parts. Every previous evidence block,
  // anchor, source link and interpretation remains in its appropriate part.
  const lug=section('lugano'),disclosure=lug.querySelector('.authorDisclosure');
  const originalChildren=[...lug.children].filter(n=>n!==disclosure);
  const byKey=k=>originalChildren.find(n=>n.querySelector('[data-i18n="'+k+'"]'));
  const assigned=new Set();
  function group(id,key,nodes){const g=make(`<div class="luganoChapter" id="${id}"><h2>${e(t(key))}</h2></div>`);for(const n of nodes.filter(Boolean)){assert.ok(!assigned.has(n),'Lugano block assigned twice');assigned.add(n);g.append(n);}return g;}
  const why=byKey('luganoWhyTitle'),swiss=byKey('luganoSwissTitle'),hero=byKey('luganoTitle'),pillars=originalChildren.find(n=>n.classList.contains('pillarGrid')),road=byKey('lugRoadmap');
  const context=make(`<details class="panel editorialDetails"><summary>${e(t('luganoContextDetails'))}</summary></details>`);
  for(const n of [why,swiss])if(n){assigned.add(n);context.append(n);}
  const vision=make(`<details class="panel editorialDetails"><summary>${e(t('luganoVisionDetails'))}</summary></details>`);
  for(const n of [hero,pillars,road])if(n){assigned.add(n);vision.append(n);}
  const groups=[
   group('lugano-status-sources','luganoSectionStatusTitle',[byKey('luganoStatusTitle'),byKey('luganoTwoPathsTitle')]),
   group('lugano-governance-decisions','luganoSectionGovernanceTitle',[document.getElementById('lugano-public-commons')]),
   group('lugano-uses-results','luganoSectionUsesTitle',[document.getElementById('lugano-verifiable-services'),document.getElementById('lugano-use-before-scale')]),
   group('lugano-risks-checks','luganoSectionRisksTitle',[byKey('publicQuestionsTitle'),document.getElementById('lugano-external-reading')])
  ];
  groups[1].append(context);groups[2].append(vision);
  assert.equal(assigned.size,originalChildren.length,'A Lugano block was not retained');
  lug.replaceChildren(disclosure,...groups);

  // State labels apply to each lifecycle observation, not to the entire chapter.
  const cem=section('gtld-cemetery');
  cem.querySelector('h2').after(make(`<p class="sub">${e(t('cemeterySub'))}</p>`));
  for(const obs of edit.cemetery){
   const heading=[...cem.querySelectorAll('h3')].find(n=>n.textContent===obs.string);assert.ok(heading);
   heading.after(make(`<dl class="lifecycleObservation"><dt>${e(t('cemeteryContractStatus'))}</dt><dd><a href="${e(obs.contractSource)}" target="_blank" rel="noopener noreferrer">${e(t(obs.contractKey))}</a></dd><dt>${e(t('cemeteryRootStatus'))}</dt><dd><a href="${e(obs.rootSource)}" target="_blank" rel="noopener noreferrer">${e(t(obs.rootKey))}</a></dd><dt>${e(t('cemeteryVerified',{date:localDate(edit.reviewedOn)}))}</dt><dd><time datetime="${edit.reviewedOn}">${localDate(edit.reviewedOn)}</time></dd></dl>`));
  }

  // The public-visibility calendar belongs next to the round overview as well
  // as in the dated field investigation; it predicts no individual outcome.
  section('reveal').append(make(`<aside class="panel apsVisibility"><h2>${e(t('field18CalendarTitle'))}</h2><p>${e(t('field22PhaseBody'))}</p><p class="note">${e(t('field22PhaseLimit'))}</p><div class="srcs"><a href="https://newgtldprogram-aps.icann.org/about" target="_blank" rel="noopener noreferrer">ICANN APS · About ↗</a><a href="https://www.icann.org/en/announcements/details/icann-announces-date-for-reveal-day-and-other-2026-round-milestones-29-09-2026-en" target="_blank" rel="noopener noreferrer">ICANN · ${e(t('insideNav'))} ↗</a></div></aside>`));

  // Classify every existing resource and label the date as a file release,
  // without pretending that all underlying observations were made that day.
  const downloads=section('resources').querySelector('.downloads'),cards=[...downloads.children];
  const resourceGroups={official:[],derived:[],archives:[]};
  const official=new Set(['applications_2026_aps_official_listing.csv','applications_2026_aps_official_provenance.json']);
  const frozen=new Set(['applications_2026_strings_reveal.csv','application_economic_map_2012_2026.csv']);
  for(const card of cards){const href=card.getAttribute('href'),base=href.split('/').pop();
   const group=href.includes('/downloads/')||href.startsWith('downloads/')||frozen.has(base)?'archives':official.has(base)?'official':'derived';
   resourceGroups[group].push(card);
   const record=manifest.files.find(x=>x.path===base);
   if(record){const metadata=make(`<small class="resourceMetadata">CSV · ${e(t('resourcesRows',{count:nf.format(record.records)}))} · ${e(t('resourcesFileRelease',{version:pub.version}))}</small>`);card.append(metadata);}
   if(base==='aps_2026_record_observations.csv'){const span=card.querySelector('span');span.removeAttribute('data-i18n');span.textContent=t('apsAtlasDownloadHistorySub');}
  }
  for(const [name,label,desc] of [['aps_2026_current_analytics.csv',L.download,L.downloadSub],['aps_2026_applicant_distribution.csv',L.geoDownload,L.sourceDate],['aps_2026_location_distribution.csv',L.locationDownload,L.sourceDate],['aps_2026_region_distribution.csv',L.regionDownload,L.sourceDate]]){
   const card=make(`<a class="downloadCard" href="${prefix}data/${name}" download><b>${e(label)}</b><span>${e(desc)}</span></a>`);const record=manifest.files.find(x=>x.path===name);assert.ok(record);card.append(make(`<small class="resourceMetadata">CSV · ${e(t('resourcesRows',{count:nf.format(record.records)}))} · ${e(t('resourcesFileRelease',{version:pub.version}))}</small>`));resourceGroups.derived.unshift(card);
  }
  const fragment=document.createDocumentFragment();
  for(const [group,key] of [['official','Official'],['derived','Derived'],['archives','Archives']]){const g=make(`<div class="resourceGroup"><h3>${e(t('resources'+key+'Title'))}</h3><p>${e(t('resources'+key+'Intro'))}</p><div class="downloads"></div></div>`);g.querySelector('.downloads').append(...resourceGroups[group]);fragment.append(g);}
  downloads.replaceWith(fragment);

  // Serialize only the changed native sections so unrelated generated bytes,
  // including structured metadata and independent guides, remain untouched.
  let output=original;
  for(const id of ['contention','economics','social','disputes','refusals','strange','cities','geography','lugano','cemetery','reveal','resources']){
   const tag=new RegExp('<section\\b[^>]*\\bid="'+id+'"[^>]*>'),start=tag.exec(output);if(!start)continue;
   const scan=/<\/?section\b[^>]*>/g;scan.lastIndex=start.index;let depth=0,end;
   for(let match;(match=scan.exec(output));){depth+=match[0].startsWith('</')?-1:1;if(depth===0){end=scan.lastIndex;break;}}
   assert.ok(end>start.index,'Cannot identify original section '+id);
   output=output.slice(0,start.index)+document.getElementById(id).outerHTML+output.slice(end);
  }
  fs.writeFileSync(file,output);
 }
}
console.log('EDITORIAL_AUDIT_RECONCILED '+JSON.stringify({languages:4,officialApplicationIDs:analytics.coverage.all_published.applications,comparableApplications:analytics.coverage.new_primary.applications,archivedResearchChanged:false}));
