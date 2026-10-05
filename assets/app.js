const D=window.DOT_DATA,I18N=window.DOT_I18N;
let restoringState=true;
let lang='en',theme='light',activeTab='overview',explorerPreset='all',explorerLimit=50,lastDrawerTrigger=null,explorerProfileId='';
const PUB=window.DOT_PUBLICATION||{state:'pre-reveal'};
const qp=new URLSearchParams(location.search),validLang=['en','de','fr','it']; explorerPreset=qp.get('preset')||'all';
function storageGet(k){try{return localStorage.getItem(k)}catch(e){return null}} function storageSet(k,v){try{localStorage.setItem(k,v)}catch(e){}}
const pageLang=document.documentElement.dataset.ctdLanguage||document.documentElement.lang;lang=validLang.includes(pageLang)?pageLang:'en';theme=storageGet('dotTheme')||(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');activeTab=qp.get('tab')||'overview';
function t(k){return (I18N[lang]&&I18N[lang][k])||(I18N.en&&I18N.en[k])||k}
function epBadge(kind){const cls=kind==='fact'?'factBadge':kind==='reading'?'readingBadge':'visionBadgeMini';return `<span class="ep ${cls}">${t(kind)}</span>`}
function setQuery(mode='replace'){if(restoringState)return;try{const p=new URLSearchParams(location.search);p.delete('lang');p.set('tab',activeTab);p.delete('theme');if(activeTab!=='overview'||location.hash!=='#internet-basics')p.delete('walk');const q=document.getElementById('explorerSearch')?.value?.trim();if(q)p.set('q',q);else p.delete('q');const pairs=[['round','exploreRoundFilter'],['status','exploreStatusFilter'],['type','exploreTypeFilter'],['topic','exploreThemeFilter'],['country','exploreCountryFilter']];pairs.forEach(([k,id])=>{const v=document.getElementById(id)?.value;if(v&&v!=='all')p.set(k,v);else p.delete(k)});if(explorerPreset&&explorerPreset!=='all')p.set('preset',explorerPreset);else p.delete('preset');if(geoMode&&geoMode!=='governance')p.set('map',geoMode);else p.delete('map');if(activeTab==='explore'&&explorerProfileId)p.set('tld',explorerProfileId.slice(1));else p.delete('tld');if(location.protocol==='http:'||location.protocol==='https:')history[mode==='push'?'pushState':'replaceState']({tab:activeTab},'',location.pathname+'?'+p.toString()+compatibleHash(activeTab));syncLanguageLinks();syncSectionLinks();syncFeedbackLinks()}catch(e){}}
function hashSection(hash=location.hash){const id=decodeURIComponentSafe(hash.replace(/^#/,''));const target=document.getElementById(id);return target?.closest('.section')?.id||[...document.querySelectorAll('.section')].find(s=>id===s.id||id.startsWith(s.id+'-part-'))?.id||''}
function decodeURIComponentSafe(v){try{return decodeURIComponent(v)}catch(e){return v}}
function compatibleHash(section){return hashSection()&&hashSection()!==section?'':location.hash}
function syncSectionLinks(){document.querySelectorAll('.tab[data-target]').forEach(a=>{const p=new URLSearchParams(location.search);p.set('tab',a.dataset.target);if(a.dataset.target!=='explore')p.delete('tld');a.href='?'+p.toString()+'#'+a.dataset.target})}
function restoreUrlState(){
 const wasRestoring=restoringState;restoringState=true;const p=new URLSearchParams(location.search);
 explorerPreset=['all','root','outsideRoot','curated','2026','strange','cities','contention','disputes','economics','social','trust'].includes(p.get('preset'))?p.get('preset'):'all';
 geoMode=['governance','rsp','applicant2012','applicant2026'].includes(p.get('map'))?p.get('map'):'governance';
 const values={explorerSearch:p.get('q')||'',exploreRoundFilter:p.get('round')||'all',exploreStatusFilter:p.get('status')||'all',exploreTypeFilter:p.get('type')||'all',exploreThemeFilter:normalizeExplorerTopic(p.get('topic')||p.get('category')||'all'),exploreCountryFilter:p.get('country')||'all'};
 for(const [id,v] of Object.entries(values)){const el=document.getElementById(id);if(el)el.value=el.tagName==='INPUT'||[...el.options].some(o=>o.value===v)?v:'all'}
 const advanced=document.getElementById('explorerAdvanced');if(advanced)advanced.open=values.exploreRoundFilter!=='all'||values.exploreThemeFilter!=='all'||!['all','root','outsideRoot','curated'].includes(explorerPreset);
 const hasFilters=[...p.entries()].some(([k,v])=>['q','round','status','type','topic','category','preset','country'].includes(k)&&v&&v!=='all');
 const walk=p.get('walk'),hasWalk=/^[0-6]$/.test(walk||'');
 setJourneyStep(hasWalk?Number(walk):0);
 const section=hashSection()||p.get('tab')||(p.has('tld')?'explore':hasWalk?'overview':hasFilters?'explore':'overview');
 const profileIndex=explorerProfileIndex(p.get('tld'));
 renderExplorer(true);renderGeoMap();activateTab(section,false,'none');
 if(activeTab==='explore'&&profileIndex>=0){if(explorerProfileId!==D.explorer[profileIndex].asciiString||!document.getElementById('explorerDrawer').classList.contains('open'))openExplorerRecord(profileIndex,null,'none');}
 else closeExplorerDrawer({historyMode:'none',restoreFocus:activeTab==='explore'});
 showProfileLinkNotice(activeTab==='explore'&&p.has('tld')&&profileIndex<0);
 restoringState=wasRestoring;if(!restoringState)setQuery();syncLanguageLinks();syncSectionLinks();syncFeedbackLinks();
 const target=document.getElementById(decodeURIComponentSafe(location.hash.slice(1)));if(target)scrollToNavigationTarget(target,false);
}
function languageUrl(nextLang){const root=new URL(document.documentElement.dataset.ctdRoot||'./',location.href);const url=new URL(nextLang+(location.protocol==='file:'?'/index.html':'/'),root);const query=new URLSearchParams(location.search);query.delete('lang');url.search=query.toString();url.hash=location.hash;return url.href}
function syncLanguageLinks(){document.querySelectorAll('[data-language]').forEach(a=>{a.href=languageUrl(a.dataset.language)})}
function syncTopbarHeight(){const h=Math.ceil(document.querySelector('.topbar')?.getBoundingClientRect().height||62);document.documentElement.style.setProperty('--topbar-height',h+'px')}
function reducedMotion(){return !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches}
function navigationOffset(){
 let offset=document.querySelector('.topbar')?.getBoundingClientRect().height||0;
 const mobile=document.querySelector('.mobileNavWrap');
 if(mobile){const cs=getComputedStyle(mobile);if(cs.display!=='none'&&(cs.position==='sticky'||cs.position==='fixed'))offset+=mobile.getBoundingClientRect().height||0}
 return Math.ceil(offset+12);
}
function scrollToNavigationTarget(target,smooth=true){
 if(!target)return;requestAnimationFrame(()=>{const top=Math.max(0,window.scrollY+target.getBoundingClientRect().top-navigationOffset());window.scrollTo({top,behavior:smooth&&!reducedMotion()?'smooth':'auto'})});
}
function scrollToDocumentTop(smooth=true){requestAnimationFrame(()=>window.scrollTo({top:0,behavior:smooth&&!reducedMotion()?'smooth':'auto'}))}
function focusNavigationTarget(target){if(!target)return;target.setAttribute('tabindex','-1');target.focus({preventScroll:true})}
function applyTheme(){document.documentElement.dataset.theme=theme;storageSet('dotTheme',theme);const b=document.getElementById('themeBtn');b.textContent=theme==='dark'?'☀︎':'◐';b.setAttribute('aria-pressed',theme==='dark'?'true':'false');setQuery()}
function applyLanguage(){document.documentElement.lang=lang;document.getElementById('langSelect').value=lang;document.querySelectorAll('[data-i18n]').forEach(el=>{const v=t(el.dataset.i18n);if(v!==undefined)el.innerHTML=v});renderPublicationState();document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>el.placeholder=t(el.dataset.i18nPlaceholder));const ls=document.getElementById('langSelect');if(ls)ls.setAttribute('aria-label',t('languageLabel'));const sh=document.getElementById('shareBtn');if(sh){sh.setAttribute('aria-label',t('shareLabel'));sh.setAttribute('title',t('shareLabel'))}const th=document.getElementById('themeBtn');if(th){th.setAttribute('aria-label',t('themeLabel'));th.setAttribute('title',t('themeLabel'))}const dc=document.getElementById('drawerClose');if(dc)dc.setAttribute('aria-label',t('closeLabel'));const dlg=document.querySelector('#explorerDrawer [role="dialog"]');if(dlg)dlg.setAttribute('aria-label',t('drawerLabel'));const brand=document.querySelector('.brand');if(brand)brand.setAttribute('aria-label',t('homeLabel'));const nav=document.querySelector('.nav');if(nav)nav.setAttribute('aria-label',t('sectionNavLabel'));document.querySelectorAll('.explorerPresets').forEach(p=>p.setAttribute('aria-label',t('explorerPresetsLabel')));const mc=document.querySelector('.mapControls');if(mc)mc.setAttribute('aria-label',t('geoLayersLabel'));const rf=document.getElementById('exploreRoundFilter');if(rf)rf.setAttribute('aria-label',t('roundFilterLabel'));const ctl=document.querySelector('.cityMiniTimeline');if(ctl)ctl.setAttribute('aria-label',t('cityTimelineAria'));document.querySelectorAll('[data-number]').forEach(el=>el.textContent=fmtNum(el.dataset.number));document.querySelectorAll('[data-compact-number]').forEach(el=>el.textContent=(el.dataset.numberPrefix||'')+new Intl.NumberFormat(localeCode(),{notation:'compact',maximumFractionDigits:1}).format(Number(el.dataset.compactNumber)));syncTopbarHeight();renderAll();setQuery()}
function localeCode(){return lang==='en'?'en-US':lang==='de'?'de-DE':lang==='fr'?'fr-FR':'it-IT'}
function fmtNum(v){return(v===null||v===undefined||v==='')?'—':Number(v).toLocaleString(localeCode())}
const regionFormatters=new Map();
function fmtCountry(value){const code=D.ianaCountryCodes?.[value]||{'United States of America (the)':'US','United States':'US','United Kingdom of Great Britain and Northern Ireland (the)':'GB','United Kingdom':'GB','Germany':'DE','Austria':'AT','Switzerland':'CH','France':'FR','Netherlands (the)':'NL','Netherlands':'NL','Belgium':'BE','Finland':'FI','Norway':'NO','Spain':'ES','Hong Kong':'HK','Hong Kong, China':'HK','Anguilla':'AI','Tuvalu':'TV','Montenegro':'ME','Colombia':'CO','Japan':'JP','Canada':'CA','Russian Federation (the)':'RU','Russian Federation':'RU','New Zealand':'NZ','Micronesia (Federated States of)':'FM','Antarctica':'AQ','Barbados':'BB','Bouvet Island':'BV','British Indian Ocean Territory':'IO','British Indian Ocean Territory (the)':'IO','Cayman Islands (the)':'KY','Cyprus':'CY','European Union':'EU','Svalbard and Jan Mayen':'SJ'}[value];if(!code)return value;if(!regionFormatters.has(lang))regionFormatters.set(lang,new Intl.DisplayNames([localeCode()],{type:'region'}));return regionFormatters.get(lang).of(code)}
function fmtDate(v){if(!v)return'';try{return new Intl.DateTimeFormat(localeCode(),{year:'numeric',month:'short',day:'numeric',timeZone:'UTC'}).format(new Date(v+'T00:00:00Z'))}catch(e){return v}}
function fmtDateTimeUtc(v){if(!v)return'';try{const d=new Date(v),date=new Intl.DateTimeFormat(localeCode(),{year:'numeric',month:'short',day:'numeric',timeZone:'UTC'}).format(d),hh=String(d.getUTCHours()).padStart(2,'0'),mm=String(d.getUTCMinutes()).padStart(2,'0');return `${date} · ${hh}:${mm} UTC`}catch(e){return v}}
function renderPublicationState(){const state=document.querySelector('[data-i18n="publicationState"]'),note=document.querySelector('[data-i18n="publicationStateNote"]');if(state)state.textContent=PUB.asOf?`${t('publicationState')} · ${fmtDate(PUB.asOf)}`:t('publicationState');if(note)note.textContent=PUB.revealAt?`${t('publicationStateNote')} · ${fmtDateTimeUtc(PUB.revealAt)}`:t('publicationStateNote')}

function fmtPlace(value){const keys={'Czechoslovakia':'placeCzechoslovakia','Czechoslovakia; Serbia and Montenegro (code reassignment)':'placeCsHistory','Former Soviet Union (legacy code)':'placeSovietLegacy','Serbia and Montenegro':'placeSerbiaMontenegro','Netherlands Antilles':'placeNetherlandsAntilles','Portuguese Timor':'placePortugueseTimor','Yugoslavia':'placeYugoslavia','Catalan-speaking community':'placeCatalanCommunity','Canton of Zurich':'placeZurich','Reserved Domain - IANA':'placeReserved','Berlin':'placeBerlin','London':'placeLondon','Cologne':'placeCologne','Vienna':'placeVienna','Hamburg':'placeHamburg','Paris':'placeParis','Barcelona':'placeBarcelona','Quebec':'placeQuebec'};if(keys[value])return t(keys[value]);if(value==='Lugano, Switzerland')return 'Lugano, '+fmtCountry('Switzerland');if(value?.includes(' / '))return value.split(' / ').map(fmtPlace).join(' / ');return fmtCountry(value)}
function fmtPeriod(value){if(/^\d{4}-\d{2}-\d{2}$/.test(value))return fmtDate(value);return fmtPlace(String(value).replace(/current/g,t('current')).replace(/retirement/g,t('retired')).replace(/^legacy$/,t('legacy')))}
function fmtRounds(r){const intro=r.programRound?escRound(r.programRound):(r.introductionPath?t(r.introductionPath):'\u2014'),apps=(r.applicationRounds||[]).map(String);return apps.length>1?`${intro} · ${apps.join('/')}`:intro}
function escRound(v){return t(String(v))}
function cards(){return [
 {n:fmtNum(D.round2026.applications),label:t('paidApps'),source:D.metricSources['2026'],fact:true,asOf:D.round2026.asOf},
 {n:fmtNum(D.round2026.uniqueStrings),label:t('homeUnique2026'),placeholder:D.round2026.uniqueStrings==null,fact:D.round2026.uniqueStrings!=null},
 {n:fmtNum(D.round2026.countriesTerritories),label:t('homeCountries2026'),placeholder:D.round2026.countriesTerritories==null,fact:D.round2026.countriesTerritories!=null},
 {n:fmtNum(D.round2026.contentionSets),label:t('homeContention2026'),placeholder:D.round2026.contentionSets==null,fact:D.round2026.contentionSets!=null}
]}
function renderCards(){document.getElementById('cards').innerHTML=cards().map(x=>`<div class="metric ${x.placeholder?'metricPlaceholder':''}"><div class="metricMeta">${x.fact?epBadge('fact'):`<span class="stateBadge placeholderState">${t('awaitReveal')}</span>`}${x.source?`<a class="metricSource" href="${x.source}" target="_blank" rel="noopener" aria-label="${t('source')}">${t('source')} ↗</a>`:''}</div><div class="num">${x.n}</div><div class="lab">${x.label}</div>${x.asOf?`<div class="metricAsOf">${esc(t('asOfLabel'))} ${esc(fmtDate(x.asOf))}</div>`:''}</div>`).join('');const f=document.getElementById('metricsFootnote');if(f)f.innerHTML=`<span class="infoDot">i</span><span>${t('homeBenchmark2012')}</span>`}
function renderRoundBars(){const el=document.getElementById('roundBars');if(!el)return;const max=Math.max(...D.rounds.map(x=>x.applications));el.innerHTML=D.rounds.map(r=>{const width=Math.max(3,r.applications/max*100);return `<div class="roundRow"><div class="roundHead"><b>${r.round}</b><span class="roundValue">${r.applications.toLocaleString(localeCode())}${r.asOf?`<small>${esc(t('asOfLabel'))} ${esc(fmtDate(r.asOf))}</small>`:''}</span></div><div class="roundTrack"><div class="roundFill ${r.round===2026?'current':''}" style="width:${width}%"></div></div></div>`}).join('')}
function renderContentionBars(){const el=document.getElementById('contentionBars');if(!el)return;const max=Math.max(...D.contention2012.map(x=>x[1]));el.innerHTML=D.contention2012.map(([name,n])=>`<div class="contentionRow"><span class="contentionName">${name}</span><div class="contentionTrack"><div class="contentionFill" style="width:${n/max*100}%"></div></div><b>${n}</b></div>`).join('')}
function renderTypeStats(){const el=document.getElementById('typeStats');if(!el)return;const stats=[[66,t('geographic')],[84,t('community')],[116,t('idn')]];el.innerHTML=stats.map(([n,label])=>`<div class="statBlock"><div class="statNum">${n}</div><div class="statLabel">${label}</div></div>`).join('')}
const TIMELINE_STAGE={tl1984Title:'timelineStageProtocol',tl1985Title:'timelineStageRoot',tl1999Title:'timelineStageIdea',tl2000Title:'timelineStageRound',tl2004Title:'timelineStageRound',tl2012Title:'timelineStageRound',tl2014Title:'timelineStageLaunch',tl2026Title:'timelineStageRound'};function renderTimeline(){document.getElementById('timelineList').innerHTML=D.timeline.map(e=>{const src=(e.sources||[]).map((u,i)=>`<a href="${u}" target="_blank" rel="noopener">${t('source')}${e.sources.length>1?' '+(i+1):''} ↗</a>`).join(''),stage=TIMELINE_STAGE[e.titleKey];return `<div class="event"><div class="eventHead"><div class="year">${e.year}</div>${stage?`<span class="eventStage">${esc(t(stage))}</span>`:''}</div><b>${t(e.titleKey)}</b><span>${t(e.bodyKey)}</span>${src?`<div class="eventSources">${src}</div>`:''}</div>`}).join('')}
function render2000(){document.getElementById('curated2000').innerHTML=D.curated2000.map(r=>`<tr><td><b>${r.string}</b></td><td>${t(r.themeKey)}</td><td><span class="pill">${t(r.statusKey)}</span></td><td>${t(r.noteKey)}</td></tr>`).join('')}
function renderProcess(){document.getElementById('processGrid').innerHTML=[1,2,3,4,5,6,7,8].map(n=>`<div class="step"><div class="n">0${n}</div><b>${t('step'+n)}</b><p>${t('step'+n+'b')}</p></div>`).join('')}
function norm(s){return(s||'').toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/^\./,'')}
function esc(s){return String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
function explorerTypeKey(v){return ({application:'typeApplication',generic:'typeGeneric',sponsored:'typeSponsored',infrastructure:'typeInfrastructure',test:'typeTest',geographic:'typeGeographic',brand:'typeBrand',community:'typeCommunity','country-code':'typeCountryCode','generic-restricted':'typeGenericRestricted',notApplicable:'typeNotApplicable'})[v]||v}
const LEGACY_TOPIC_MAP={city:'topicGeography',territory:'topicGeography',geography:'topicGeography',geopolitics:'topicGeography',supranational:'topicGeography',technology:'topicTechnology',techFossil:'topicTechnology',infrastructure:'topicTechnology',scripts:'topicTechnology',business:'topicBusiness',personalBrand:'topicBusiness',statusCulture:'topicBusiness',culture:'topicCultureMedia',media:'topicCultureMedia',education:'topicCultureMedia',faith:'topicCultureMedia',identity:'topicSociety',community:'topicSociety',politics:'topicSociety',labour:'topicSociety',socialMirror:'topicSociety',protest:'topicSociety',children:'topicSociety',intimacy:'topicSociety',adult:'topicSociety',government:'topicPublic',publicInfrastructure:'topicPublic',publicInterest:'topicPublic',trust:'topicPublic',lifestyle:'topicLifestyle',health:'topicLifestyle',optimism:'topicLifestyle',oddity:'topicSpecial',history:'topicSpecial',semanticDrift:'topicSpecial'};
function normalizeExplorerTopic(v){return !v||v==='all'?'all':LEGACY_TOPIC_MAP[v]||v}
function explorerThemes(){return [...new Set((D.explorer||[]).flatMap(x=>x.topicFacets||[]))].filter(Boolean).sort((a,b)=>t(a).localeCompare(t(b),lang))}
function explorerStatuses(){return [...new Set((D.explorer||[]).map(x=>x.currentRootStatus||x.status).filter(Boolean))].sort((a,b)=>t(a).localeCompare(t(b),lang))}
function explorerTypes(){return [...new Set((D.explorer||[]).map(x=>x.type).filter(Boolean))].sort((a,b)=>t(explorerTypeKey(a)).localeCompare(t(explorerTypeKey(b)),lang))}
function fillSelect(id,labelKey,vals,labelFn=x=>t(x)){const sel=document.getElementById(id);if(!sel)return;const cur=sel.value||'all';sel.innerHTML=`<option value="all">${t(labelKey)}</option>`+vals.map(v=>`<option value="${esc(v)}">${esc(labelFn(v))}</option>`).join('');sel.value=[...sel.options].some(o=>o.value===cur)?cur:'all';sel.title=sel.options[sel.selectedIndex]?.textContent||''}
function renderExplorerOptions(){fillSelect('exploreStatusFilter','filterAll',explorerStatuses());fillSelect('exploreTypeFilter','filterAll',explorerTypes(),v=>t(explorerTypeKey(v)));fillSelect('exploreThemeFilter','filterAll',explorerThemes());const countries=[...new Set(D.explorer.map(r=>r.registryCountryCode).filter(Boolean))].sort((a,b)=>countryLabel(a).localeCompare(countryLabel(b),lang));fillSelect('exploreCountryFilter','filterAll',countries,countryLabel);}
function countryLabel(code){return new Intl.DisplayNames([localeCode()],{type:'region'}).of(code)}
function governanceAscii(raw){const label=String(raw||'').trim().replace(/^\./,'');try{return '.'+new URL('http://'+label).hostname.toLowerCase()}catch(e){return '.'+label.toLowerCase()}}
const governanceCaseByString=new Map();
for(const c of D.governanceCases?.cases||[])for(const raw of c.strings||[]){const key=governanceAscii(raw);if(!governanceCaseByString.has(key))governanceCaseByString.set(key,[]);governanceCaseByString.get(key).push(c)}
function governanceCasesFor(r){if(!r)return[];const direct=(r.governanceCaseIds||[]).map(id=>(D.governanceCases?.cases||[]).find(c=>c.id===id)).filter(Boolean);if(direct.length)return direct;return governanceCaseByString.get(r.asciiString)||governanceCaseByString.get(governanceAscii(r.string))||[]}
function governanceCaseBadge(r){return governanceCasesFor(r).length?`<span class="governanceCaseBadge">${esc(t('governanceCaseBadge'))}</span>`:''}
const economicCaseByString=new Map();
for(const c of D.economicCases?.cases||[])for(const raw of c.strings||[]){const key=governanceAscii(raw);if(!economicCaseByString.has(key))economicCaseByString.set(key,[]);economicCaseByString.get(key).push(c)}
function economicCasesFor(r){if(!r)return[];const direct=(r.economicCaseIds||[]).map(id=>(D.economicCases?.cases||[]).find(c=>c.id===id)).filter(Boolean);if(direct.length)return direct;return economicCaseByString.get(r.asciiString)||economicCaseByString.get(governanceAscii(r.string))||[]}
function economicCaseBadge(r){return economicCasesFor(r).length?`<span class="economicCaseBadge">${esc(t('economicCaseBadge'))}</span>`:''}
const socialCaseByString=new Map();
for(const c of D.socialCases?.cases||[])for(const raw of c.strings||[]){const key=governanceAscii(raw);if(!socialCaseByString.has(key))socialCaseByString.set(key,[]);socialCaseByString.get(key).push(c)}
function socialCasesFor(r){if(!r)return[];const direct=(r.socialCaseIds||[]).map(id=>(D.socialCases?.cases||[]).find(c=>c.id===id)).filter(Boolean);if(direct.length)return direct;return socialCaseByString.get(r.asciiString)||socialCaseByString.get(governanceAscii(r.string))||[]}
function socialCaseBadge(r){return socialCasesFor(r).length?`<span class="socialCaseBadge">${esc(t('socialCaseBadge'))}</span>`:''}
const explorerTextCache=new WeakMap();
function explorerSearchText(r){const cached=explorerTextCache.get(r);if(cached?.lang===lang)return cached.text;const text=norm([r.string,r.asciiString,r.round,t(r.status),t(explorerTypeKey(r.type)),r.entity,r.applicationEntity,r.registryCountry,r.registryCountryCode,r.technicalSearch||[r.technicalContactOrganization,r.administrativeContactOrganization,r.whoisServer,r.registryUrl,...(r.rdapServers||[]),...(r.nameServers||[]).flatMap(n=>[n.hostname,...n.ipAddresses])].join(' '),r.group,r.representedPlace,r.geography,fmtPlace(r.representedPlace||r.geography),fmtCountry(r.registryCountry),t(explorerTypeKey(r.editorialDesignation)),...(r.themes||[]).map(t),...(r.topicFacets||[]).map(t),r.programRound,...(r.applicationRounds||[]),...(r.applicationApplicants||[]),r.applicationCount||'',r.introductionPath?t(r.introductionPath):'',r.introductionBasis?t(r.introductionBasis):'',r.noteKey?t(r.noteKey):'',r.readingKey?t(r.readingKey):'',...governanceCasesFor(r).flatMap(c=>[c.id,...(c.strings||[]),t(c.questionKey),t(c.factKey),t(c.readingKey),t(c.outcomeKey),...(c.categoryKeys||[]).map(t),...(c.mechanisms||[])]),...economicCasesFor(r).flatMap(c=>[c.id,...(c.strings||[]),t(c.modelKey),t(c.questionKey),t(c.factKey),t(c.readingKey),...(c.metrics||[]).flatMap(m=>[t(m.labelKey),m.display,m.currency,m.basis])]),...socialCasesFor(r).flatMap(c=>[c.id,...(c.strings||[]),...(c.modelKeys||[]).map(t),t(c.questionKey),t(c.factKey),t(c.readingKey),...(c.signals||[]).flatMap(x=>[t(x.labelKey),t(x.valueKey)])])].join(' '));explorerTextCache.set(r,{lang,text});return text;}
function explorerFilteredRows(){const q=norm(document.getElementById('explorerSearch')?.value||''),round=document.getElementById('exploreRoundFilter')?.value||'all',status=document.getElementById('exploreStatusFilter')?.value||'all',type=document.getElementById('exploreTypeFilter')?.value||'all',topic=document.getElementById('exploreThemeFilter')?.value||'all',country=document.getElementById('exploreCountryFilter')?.value||'all';const rows=(D.explorer||[]).filter(r=>{const hay=q?explorerSearchText(r):'';const presetOK=explorerPreset==='all'||(explorerPreset==='root'&&r.rootListed)||(explorerPreset==='outsideRoot'&&!r.rootListed)||(explorerPreset==='curated'&&r.recordLevel==='curated')||(explorerPreset==='2026'&&String(r.programRound)==='2026')||(explorerPreset==='strange'&&r.strange)||(explorerPreset==='cities'&&(r.city||r.editorialDesignation==='geographic'))||(explorerPreset==='contention'&&Number(r.contentionCount||0)>1)||(explorerPreset==='disputes'&&governanceCasesFor(r).length)||(explorerPreset==='economics'&&economicCasesFor(r).length)||(explorerPreset==='social'&&socialCasesFor(r).length)||(explorerPreset==='trust'&&(r.themes||[]).some(x=>['trust','identity'].includes(x)));return(!q||hay.includes(q))&&(round==='all'||String(r.programRound)===round||(r.applicationRounds||[]).map(String).includes(round))&&(status==='all'||(r.currentRootStatus||r.status)===status)&&(type==='all'||r.type===type)&&(topic==='all'||(r.topicFacets||[]).includes(topic))&&(country==='all'||r.registryCountryCode===country)&&presetOK});if(q)rows.sort((a,b)=>{const aa=norm(a.string),bb=norm(b.string),ra=aa===q?0:aa.startsWith(q)?1:2,rb=bb===q?0:bb.startsWith(q)?1:2;return ra-rb||aa.localeCompare(bb)});return rows}
function recordLevelKey(r){return r.recordLevel==='curated'?'recordCurated':r.recordLevel==='application'?'recordApplication':'recordIana'}
function explorerThemePills(r){return (r.topicFacets||[]).slice(0,3).map(x=>`<span class="pill">${esc(t(x))}</span>`).join('')||'—'}
function renderExplorer(resetLimit=false){const table=document.getElementById('explorerTableBody'),cards=document.getElementById('explorerCards'),count=document.getElementById('explorerResultCount');if(!table||!cards)return;document.querySelectorAll('.explorerFilterField select').forEach(sel=>{sel.title=sel.options[sel.selectedIndex]?.textContent||''});if(resetLimit)explorerLimit=50;const allRows=explorerFilteredRows(),rows=allRows.slice(0,explorerLimit);if(count){const msg=t('exploreShowing').replace('{shown}',fmtNum(rows.length)).replace('{total}',fmtNum(allRows.length));count.textContent=`${fmtNum(allRows.length)} ${t('exploreResults')} · ${msg}`};document.querySelectorAll('.presetChip').forEach(b=>{const selected=b.dataset.preset===explorerPreset;b.classList.toggle('active',selected);b.setAttribute('aria-pressed',String(selected))});const rowHtml=rows.map(r=>{const idx=(D.explorer||[]).indexOf(r),label=t('exploreOpenRecordLabel').replace('{name}',r.string);return `<tr data-explorer-index="${idx}"><td><button class="explorerOpenBtn" data-explorer-open="${idx}" type="button" aria-label="${esc(label)}"><span class="explorerTld"><bdi>${esc(r.string)}</bdi></span><span class="recordLevel">${esc(t(recordLevelKey(r)))}</span>${governanceCaseBadge(r)}${economicCaseBadge(r)}${socialCaseBadge(r)}${r.placeholder?` <span class="explorerPlaceholderBadge">${t('explorePlaceholderBadge')}</span>`:''}</button></td><td><span class="explorerState">${esc(t(r.currentRootStatus||r.status))}</span></td><td>${esc(fmtRounds(r))}</td><td>${esc(r.entity||'—')}</td><td>${esc(fmtCountry(r.registryCountry)||'—')}</td><td>${esc(t(explorerTypeKey(r.type))||r.type||'—')}</td><td><div class="explorerThemeCell">${explorerThemePills(r)}</div></td></tr>`}).join('');table.innerHTML=rowHtml||`<tr><td colspan="7"><div class="explorerEmpty">${t('exploreNoResults')}</div></td></tr>`;cards.innerHTML=rows.map(r=>{const idx=(D.explorer||[]).indexOf(r),label=t('exploreOpenRecordLabel').replace('{name}',r.string);return `<article class="explorerCard"><button class="explorerCardButton" data-explorer-open="${idx}" type="button" aria-label="${esc(label)}"><div class="explorerCardTop"><span class="explorerTld"><bdi>${esc(r.string)}</bdi></span><span class="recordLevel">${esc(t(recordLevelKey(r)))}</span>${governanceCaseBadge(r)}${economicCaseBadge(r)}${socialCaseBadge(r)}<span class="explorerState">${esc(t(r.currentRootStatus||r.status))}</span></div><div class="explorerCardMeta"><span class="pill">${esc(fmtRounds(r))}</span><span class="pill">${esc(t(explorerTypeKey(r.type))||r.type)}</span>${explorerThemePills(r)}</div>${r.entity?`<div class="explorerCardEntity">${esc(r.entity)}${r.registryCountry?' · '+esc(fmtCountry(r.registryCountry)):''}${(r.representedPlace||r.geography)?' · '+esc(fmtPlace(r.representedPlace||r.geography)):''}</div>`:''}</button></article>`}).join('')||`<div class="explorerEmpty">${t('exploreNoResults')}</div>`;document.querySelectorAll('[data-explorer-open]').forEach(el=>el.addEventListener('click',()=>openExplorerRecord(Number(el.dataset.explorerOpen),el)));document.querySelectorAll('tr[data-explorer-index]').forEach(row=>row.addEventListener('click',e=>{if(e.target.closest('button,a'))return;const btn=row.querySelector('[data-explorer-open]');btn?.click()}));const more=document.getElementById('explorerLoadMore');if(more){more.hidden=rows.length>=allRows.length;more.textContent=t('exploreLoadMore')}const seed=document.getElementById('exploreSeedCount');if(seed)seed.textContent=fmtNum(D.explorerMeta?.seedCount||0);const root=document.getElementById('exploreIanaCount');if(root)root.textContent=fmtNum(D.explorerMeta?.ianaRootCount||0);const profiles=document.getElementById('exploreProfileCount');if(profiles)profiles.textContent=fmtNum(D.explorerMeta?.ianaProfileCount||0);const date=document.querySelector('[data-i18n="exploreIanaDate"]');if(date)date.textContent=t('exploreIanaDate').replace('{date}',fmtDate(D.explorerMeta?.ianaSnapshot));setQuery()}
function ianaFactFields(r){
 const missing=t('ianaNotReported');
 const fields=[['exploreAscii',r.asciiString],['exploreRootListed',t(r.rootListed?'rootListedYes':'rootListedNo')],['exploreCurrentRoot',t(r.currentRootStatus||r.status)],['exploreCurrentAsOf',fmtDate(r.currentAsOf)],['exploreColType',t(explorerTypeKey(r.formalType))],['exploreApplicantManager',r.registryEntity||missing]];
 if(r.ianaProfile)fields.push(['exploreRegistryCountry',fmtCountry(r.registryCountry)||missing],['exploreRegistrationDate',fmtDate(r.registrationDate)||missing],['ianaLastUpdated',fmtDate(r.lastUpdated)||missing],['ianaRetrieved',fmtDate(r.sourceRetrievedAt?.slice(0,10))||missing]);
 return `<div class="drawerSection"><h3>${epBadge('fact')} ${t('exploreFactFields')}</h3><dl class="drawerFacts">${fields.map(([key,value])=>`<dt>${esc(t(key))}</dt><dd><bdi>${esc(value)}</bdi></dd>`).join('')}</dl>${r.ianaProfile?`<p class="small">${esc(t('ianaDatesNote'))}</p>`:''}</div>`;
}
function explorerIntroductionSection(r){
 if(!r.introductionPath)return'';
 const missing=esc(t('notApplicable'));
 const sources=(r.introductionPathSources||[]).map(u=>`<a href="${esc(u)}" target="_blank" rel="noopener">${esc(t('source'))} &#8599;</a>`).join(' ');
 return `<div class="drawerSection"><h3>${esc(t('exploreIntroductionTitle'))}</h3><dl class="drawerFacts"><dt>${esc(t('exploreIntroductionPath'))}</dt><dd>${esc(t(r.introductionPath))}</dd><dt>${esc(t('exploreProgramRound'))}</dt><dd>${r.programRound?esc(t(r.programRound)):missing}</dd><dt>${esc(t('exploreIntroductionBasis'))}</dt><dd>${esc(t(r.introductionBasis||'basisFormalType'))}</dd></dl><p class="small">${esc(t('exploreIntroductionNote'))}</p>${sources?`<div class="drawerSources">${sources}</div>`:''}</div>`;
}
function ianaProfileSections(r){
 if(!r.ianaProfile)return'';
 const missing=t('ianaNotReported'),link=u=>`<a href="${esc(u)}" target="_blank" rel="noopener"><bdi>${esc(u)}</bdi> ↗</a>`;
 const contacts=[['ianaAdminOrg',r.administrativeContactOrganization],['ianaAdminCountry',fmtCountry(r.administrativeContactCountry)],['exploreTechnicalOrg',r.technicalContactOrganization],['exploreTechnicalCountry',fmtCountry(r.technicalContactCountry)]];
 const servers=r.nameServers||[],reports=r.ianaReports||[];
 return `<div class="drawerSection"><h3>${esc(t('ianaContacts'))}</h3><dl class="drawerFacts">${contacts.map(([key,value])=>`<dt>${esc(t(key))}</dt><dd>${esc(value||missing)}</dd>`).join('')}</dl><p class="small">${esc(t('exploreTechnicalCaveat'))}</p></div>
 <div class="drawerSection"><h3>${esc(t('ianaServices'))}</h3><dl class="drawerFacts"><dt>${esc(t('ianaRegistryWebsite'))}</dt><dd>${r.registryUrl?link(r.registryUrl):esc(missing)}</dd><dt>WHOIS</dt><dd><bdi>${esc(r.whoisServer||missing)}</bdi></dd><dt>RDAP</dt><dd>${r.rdapServers?.length?r.rdapServers.map(link).join('<br>'):esc(missing)}</dd></dl></div>
 <div class="drawerSection"><details class="ianaDetails"><summary>${esc(t('ianaNameServers'))} <span class="small">(${fmtNum(servers.length)})</span></summary>${servers.length?`<ul class="ianaServers">${servers.map(n=>`<li><bdi class="ianaHostname">${esc(n.hostname)}</bdi><span>${n.ipAddresses.map(ip=>`<bdi class="ianaAddress">${esc(ip)}</bdi>`).join('')}</span></li>`).join('')}</ul>`:`<p class="small">${esc(missing)}</p>`}</details></div>
 <div class="drawerSection"><details class="ianaDetails"><summary>${esc(t('ianaReports'))} <span class="small">(${fmtNum(reports.length)})</span></summary><p class="small">${esc(t('ianaReportsNote'))}</p>${reports.length?`<ul class="ianaReportList">${reports.map(report=>`<li>${report.date?`<time datetime="${esc(report.date)}">${esc(fmtDate(report.date))}</time>`:''}<a href="${esc(report.url)}" target="_blank" rel="noopener" lang="en">${esc(report.title)} ↗</a></li>`).join('')}</ul>`:`<p class="small">${esc(missing)}</p>`}</details></div>`;
}
function lifeHistoryEvents(r){
 const events=[...(r.events||[])];
 for(const a of dedupeApplications(r.applications||[]))events.push({period:String(a.round),status:'applicationSubmitted',type:r.formalType||'',entity:a.applicant||'',geography:a.location||'',detail:a.applicationId||a.submissionId||'',outcomeKey:String(a.round)==='2000'?'':(a.outcome?('outcome_'+String(a.outcome).replace(/[ -]/g,'_')):''),eventClass:'application',source:[a.source].filter(Boolean),current:false});
 const g=r.gtldAgreement;
 if(g){
  if(g.dateOfContractSignature)events.push({period:g.dateOfContractSignature,status:'registryAgreementSigned',type:'generic',entity:g.registryOperator||'',detail:g.applicationId||'',eventClass:'icann-contract',source:[D.tldLifeHistory?.gtldContractSource].filter(Boolean),current:false});
  if(g.delegationDate)events.push({period:g.delegationDate,status:'rootDelegation',type:'generic',entity:g.registryOperator||'',detail:g.applicationId||'',eventClass:'icann-contract',source:[D.tldLifeHistory?.gtldContractSource].filter(Boolean),current:false});
  if(g.contractTerminated&&g.removalDate)events.push({period:g.removalDate,status:'registryAgreementTerminated',type:'generic',entity:g.registryOperator||'',detail:g.applicationId||'',eventClass:'icann-contract',source:[D.tldLifeHistory?.gtldContractSource].filter(Boolean),current:false});
  if(g.removalDate)events.push({period:g.removalDate,status:'removedFromRoot',type:'generic',entity:g.registryOperator||'',detail:'',eventClass:'icann-contract',source:[D.tldLifeHistory?.gtldContractSource].filter(Boolean),current:false});
 }
 const seen=new Set();return events.filter(e=>{const k=[e.period,e.status,e.entity||'',e.detail||'',...(e.source||[])].join('|');if(seen.has(k))return false;seen.add(k);return true}).sort((a,b)=>{const da=String(a.period).match(/^\d{4}(?:-\d{2}){0,2}/)?.[0]||'',db=String(b.period).match(/^\d{4}(?:-\d{2}){0,2}/)?.[0]||'';if(a.current&&!b.current)return 1;if(b.current&&!a.current)return-1;return da.localeCompare(db)||String(a.status).localeCompare(String(b.status))});
}
function explorerHistory(r){
 const events=lifeHistoryEvents(r);if(!events.length&&!r.provenanceKey)return'';
 return `<div class="drawerSection lifeHistorySection"><h3>${epBadge('fact')} ${t('exploreHistory')}</h3><div class="small">${t('lifeHistorySub')}</div><div class="drawerTimeline">${events.map(e=>{
 const sources=(e.source||[]).map((u,i)=>`<a href="${esc(u)}" target="_blank" rel="noopener">${t('source')}${e.source.length>1?' '+(i+1):''} ↗</a>`).join('');
 return `<div class="drawerEvent"><div class="drawerEventPeriod">${esc(fmtPeriod(e.period))}</div><div class="drawerEventMain"><div class="drawerEventTop"><span class="explorerState">${esc(t(e.status))}</span>${e.type?`<span class="pill">${esc(t(explorerTypeKey(e.type)))}</span>`:''}${e.outcomeKey?`<span class="pill">${esc(t(e.outcomeKey))}</span>`:''}${e.current?`<span class="drawerEventCurrent">${esc(t('current'))}</span>`:''}</div>${(e.entity||e.geography)?`<div class="drawerEventEntity">${esc(e.entity||'')}${e.entity&&e.geography?' · ':''}${esc(fmtPlace(e.geography)||'')}</div>`:''}${e.detail?`<div class="small lifeEventDetail"><bdi>${esc(e.detail)}</bdi></div>`:''}${e.provenanceKey?`<div class="drawerProvenance">${esc(t(e.provenanceKey))}${e.provenanceDate?' · '+esc(fmtDate(e.provenanceDate)):''}</div>`:''}${sources?`<div class="drawerEventSources">${sources}</div>`:''}</div></div>`;
 }).join('')}</div><p class="small lifeHistoryMethod">${esc(t('lifeHistoryMethod'))}</p></div>`;
}
function gtldAgreementSection(r){
 const g=r.gtldAgreement;if(!g)return'';const missing=esc(t('ianaNotReported')),src=D.tldLifeHistory?.gtldContractSource;
 const yesno=g.contractTerminated?t('yes'):t('no');
 return `<div class="drawerSection"><h3>${epBadge('fact')} ${esc(t('gtldAgreementHistoryTitle'))}</h3><dl class="drawerFacts"><dt>${esc(t('applicationIdLabel'))}</dt><dd><bdi>${esc(g.applicationId||missing)}</bdi></dd><dt>${esc(t('registryOperatorLabel'))}</dt><dd>${esc(g.registryOperator||missing)}</dd><dt>${esc(t('agreementDateLabel'))}</dt><dd>${esc(fmtDate(g.dateOfContractSignature)||missing)}</dd><dt>${esc(t('delegationDateLabel'))}</dt><dd>${esc(fmtDate(g.delegationDate)||missing)}</dd><dt>${esc(t('contractTerminatedLabel'))}</dt><dd>${esc(yesno)}</dd><dt>${esc(t('removalDateLabel'))}</dt><dd>${esc(fmtDate(g.removalDate)||missing)}</dd></dl>${src?`<div class="drawerSources"><a href="${esc(src)}" target="_blank" rel="noopener">ICANN · ${esc(t('source'))} ↗</a></div>`:''}</div>`;
}

// Profile URLs use exact ASCII identities; Unicode input is accepted without
// accent folding, which would confuse distinct internationalized labels.
function explorerProfileIndex(value){
 if(typeof value!=='string'||value.length>256)return -1;
 const key='.'+value.trim().normalize('NFC').toLowerCase().replace(/^\./,'');
 return D.explorer.findIndex(r=>r.asciiString===key||r.string.normalize('NFC').toLowerCase()===key);
}
function showProfileLinkNotice(show){const el=document.getElementById('profileLinkNotice');if(el){el.hidden=!show;el.textContent=show?t('profileLinkMissing'):'';}}
const PUBLIC_SITE='https://robertbregy.github.io/Connecting-the-Dots/';
function publicContextUrl(row=null){
 const url=new URL(lang+'/',PUBLIC_SITE);url.searchParams.set('tab',row?'explore':activeTab);
 if(row)url.searchParams.set('tld',row.asciiString.slice(1));
 else{
  if(activeTab==='geography'&&geoMode!=='governance')url.searchParams.set('map',geoMode);
  if(activeTab==='overview'&&location.hash==='#internet-basics')url.searchParams.set('walk',String(journeyStep));
  url.hash=compatibleHash(activeTab);
 }
 return url.href;
}
function feedbackUrl(row=null){
 const url=new URL('https://github.com/robertbregy/Connecting-the-Dots/issues/new');
 url.searchParams.set('title',t('feedbackIssueTitle')+(row?' · '+row.string:''));
 url.searchParams.set('body',[
  t('feedbackPage')+': '+publicContextUrl(row),
  t('feedbackVersion')+': '+PUB.version,
  t('feedbackLanguage')+': '+lang,
  row?t('feedbackRecord')+': '+row.string+' ('+row.asciiString+')':'',
  '',t('feedbackDescription')+'\n\n',t('feedbackCorrection')+'\n\n',t('feedbackSource')+'\n'
 ].filter(line=>line!==undefined).join('\n'));
 return url.href;
}
function syncFeedbackLinks(){document.querySelectorAll('[data-report-error]').forEach(a=>a.href=feedbackUrl());}
function renderProfileActions(row){
 const actions=document.getElementById('drawerActions');if(!actions)return;
 const url=publicContextUrl(row);
 const names={en:'English',it:'Italiano',de:'Deutsch',fr:'Français'};
 const languages=validLang.map(next=>`<a href="${esc(languageUrl(next))}" data-language="${next}" lang="${next}" hreflang="${next}"${next===lang?' aria-current="page"':''}>${names[next]}</a>`).join('');
 actions.innerHTML=`<h2 class="drawerTld" id="profileTitle"><bdi>${esc(row.string)}</bdi></h2><nav class="languageVersions profileLanguages" aria-label="${esc(t('languageVersions'))}">${languages}</nav><div class="profileActions"><button class="control" type="button" id="profileShareBtn">${esc(t('profileShare'))}</button><a class="profilePermalink" href="${esc(url)}">${esc(t('profilePermalink'))}</a><a class="profileReport" href="${esc(feedbackUrl(row))}" target="_blank" rel="noopener" aria-describedby="profileFeedbackNote">${esc(t('feedbackLink'))} ↗</a></div><p id="profileFeedbackNote" class="small">${esc(t('feedbackNote'))}</p><span id="profileShareStatus" class="profileShareStatus small" role="status" aria-live="polite"></span>`;
 document.getElementById('profileShareBtn').addEventListener('click',async()=>{
  try{
   if(navigator.share){await navigator.share({title:row.string+' · Connecting the Dots',url});return;}
   await navigator.clipboard.writeText(url);
   if(explorerProfileId===row.asciiString)document.getElementById('profileShareStatus').textContent=t('copied');
  }catch(error){if(error?.name!=='AbortError')prompt(t('copyLink'),url);}
 });
}

let drawerLoadId=0;
const profileRequests=new Map(),runtimeApplicationOverlay=new Map(),runtimeGtldLifecycle=new Map();
function dedupeApplications(items){const seen=new Set();return (items||[]).filter(a=>{const key=[a.round,a.applicationId||a.submissionId,a.string,a.relationType].join('|');if(seen.has(key))return false;seen.add(key);return true})}
function mergeApplicationOverlay(record,row){
 const remote=runtimeApplicationOverlay.get(row.asciiString)||[];let merged=record;
 if(remote.length){const applications=dedupeApplications([...(record.applications||[]),...remote]);merged={...record,applications,applicationCount:applications.length,applicationRounds:[...new Set(applications.map(a=>String(a.round)))],applicationApplicants:[...new Set(applications.map(a=>a.applicant).filter(Boolean))]};}
 const gtldAgreement=runtimeGtldLifecycle.get(row.asciiString);if(gtldAgreement)merged={...merged,gtldAgreement};return merged;
}
function cachedExplorerProfile(row){
 if(row.runtimeApplicationRecord)return row;
 if(!D.profileDelivery)return mergeApplicationOverlay(row,row);
 const batch=window.DOT_PROFILE_CHUNKS?.[row.profileShard],record=batch?.version===D.profileDelivery.version?batch.records?.[row.asciiString]:null;
 return record?mergeApplicationOverlay(record,row):null;
}
function fetchExplorerProfile(row){
 const ready=cachedExplorerProfile(row);if(ready)return Promise.resolve(ready);
 const shard=row.profileShard;
 if(!profileRequests.has(shard)){
  const request=new Promise((resolve,reject)=>{
   const script=document.createElement('script');script.async=true;
   const root=new URL(document.documentElement.dataset.ctdRoot||'./',location.href);
   script.src=new URL(`data/explorer_profiles_${shard}.js?v=${encodeURIComponent(D.profileDelivery.version)}`,root).href;
   let settled=false;
   const finish=error=>{if(settled)return;settled=true;clearTimeout(timer);script.onload=null;script.onerror=null;if(error){script.remove();reject(error)}else resolve()};
   const timer=setTimeout(()=>finish(new Error('Profile request timed out')),15000);
   script.onload=()=>{const batch=window.DOT_PROFILE_CHUNKS?.[shard];finish(batch?.version===D.profileDelivery.version&&batch.records?null:new Error('Incompatible profile data'))};
   script.onerror=()=>finish(new Error('Profile request failed'));
   document.head.appendChild(script);
  });
  profileRequests.set(shard,request);
  request.catch(()=>profileRequests.delete(shard));
 }
 return profileRequests.get(shard).then(()=>{const record=cachedExplorerProfile(row);if(!record){profileRequests.delete(shard);throw new Error('Profile missing from response')}return record});
}
function openExplorerRecord(idx,trigger=null,historyMode='push'){
 const row=D.explorer[idx],drawer=document.getElementById('explorerDrawer');if(!row||!drawer)return Promise.resolve();
 const changed=explorerProfileId!==row.asciiString;
 const origin=trigger||document.activeElement;
 if(!drawer.classList.contains('open')||(trigger&&!drawer.contains(trigger)))lastDrawerTrigger=origin?.closest?.('#explore')?origin:document.getElementById('explorerSearch');
 if(activeTab!=='explore')activateTab('explore',false,'none');
 explorerProfileId=row.asciiString;showProfileLinkNotice(false);
 if(historyMode!=='none')setQuery(changed?historyMode:'replace');
 renderProfileActions(row);const requestId=++drawerLoadId;
 drawer.classList.add('open');drawer.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';
 const panel=drawer.querySelector('.explorerDrawerPanel');if(panel)panel.scrollTop=0;
 const content=document.getElementById('drawerContent'),ready=cachedExplorerProfile(row);
 if(ready){renderExplorerRecord(ready);requestAnimationFrame(()=>document.getElementById('drawerClose')?.focus());return Promise.resolve();}
 content.setAttribute('aria-busy','true');content.innerHTML=`<p class="drawerLoadStatus" role="status">${esc(t('profileLoading'))}</p>`;
 requestAnimationFrame(()=>document.getElementById('drawerClose')?.focus());
 return fetchExplorerProfile(row).then(record=>{
  if(requestId!==drawerLoadId||!drawer.classList.contains('open'))return;
  const needsFocus=content.contains(document.activeElement);renderExplorerRecord(record);if(needsFocus)document.getElementById('drawerClose')?.focus();
 }).catch(()=>{
  if(requestId!==drawerLoadId||!drawer.classList.contains('open'))return;
  content.removeAttribute('aria-busy');content.innerHTML=`<p class="drawerLoadStatus" role="alert">${esc(t('profileLoadError'))}</p><button type="button" class="control" id="profileRetry">${esc(t('profileRetry'))}</button><div class="drawerSources">${row.sourceUrl?`<a href="${esc(row.sourceUrl)}" target="_blank" rel="noopener">${esc(t('source'))} ↗</a>`:''}<a href="${esc(new URL('downloads/connecting-the-dots-data-pack.zip',new URL(document.documentElement.dataset.ctdRoot||'./',location.href)).href)}">${esc(t('profileDataDownload'))}</a></div>`;
  document.getElementById('profileRetry')?.addEventListener('click',()=>openExplorerRecord(idx,lastDrawerTrigger));
 });
}
function applicationFlag(value,key){if(value===true)return `<span class="pill">${esc(t(key))}</span>`;return ''}
function applicationArchaeologySection(r){
 const apps=dedupeApplications(r.applications||[]);if(!apps.length)return'';
 const groups=[...new Set(apps.map(a=>String(a.round)))].sort();
 const body=groups.map(round=>{const rows=apps.filter(a=>String(a.round)===round);return `<div class="applicationRound"><h4>${esc(round)} · ${fmtNum(rows.length)} ${esc(t(rows.length===1?'applicationSingular':'applicationsPlural'))}</h4>${rows.map(a=>`<article class="applicationEntry"><div class="applicationEntryTop"><b>${esc(a.applicant||t('unknownApplicant'))}</b><span class="pill">${esc(a.applicationId||a.submissionId||'—')}</span></div><div class="small applicationMeta">${a.location?esc(a.location):''}${a.location&&a.region?' · ':''}${a.region?esc(a.region):''}</div><div class="applicationFlags">${applicationFlag(a.idn,'applicationIdn')}${applicationFlag(a.community,'applicationCommunity')}${applicationFlag(a.geographic,'applicationGeographic')}${a.relationType&&a.relationType!=='requested'?`<span class="pill">${esc(t('relation_'+a.relationType.replace(/-/g,'_')))}</span>`:''}${a.outcome?`<span class="pill">${esc(t('outcome_'+String(a.outcome).replace(/[ -]/g,'_')))}</span>`:''}</div>${a.aLabel?`<div class="small"><b>A-label:</b> <bdi>${esc(a.aLabel)}</bdi>${a.scriptCode?' · '+esc(a.scriptCode):''}</div>`:''}${a.source?`<div class="drawerEventSources"><a href="${esc(a.source)}" target="_blank" rel="noopener">${esc(t('source'))} ↗</a></div>`:''}</article>`).join('')}</div>`}).join('');
 return `<div class="drawerSection applicationArchaeology"><h3>${epBadge('fact')} ${esc(t('applicationArchaeologyTitle'))}</h3><p class="small">${esc(t('applicationArchaeologySub'))}</p>${body}</div>`;
}
function governanceCaseSection(r){
 const cases=governanceCasesFor(r);if(!cases.length)return'';
 return `<div class="drawerSection drawerGovernanceCase"><h3>${epBadge('fact')} ${esc(t('governanceCaseDrawerTitle'))}</h3><p class="small">${esc(t('governanceCaseDrawerSub'))}</p>${cases.map(c=>`<article class="drawerGovernanceEntry"><div class="drawerGovernanceTop"><span class="governanceCaseBadge">${esc(t('governanceCaseBadge'))}</span><strong>${(c.strings||[]).map(x=>`<bdi>${esc(x)}</bdi>`).join(' · ')}</strong></div><p class="caseQuestion">${esc(t(c.questionKey))}</p><div class="drawerGovernanceOutcome"><b>${esc(t('caseOutcome'))}:</b> ${esc(t(c.outcomeKey))}</div><div class="drawerGovernanceMechanisms">${(c.mechanisms||[]).map(id=>{const m=(D.governanceCases?.mechanisms||[]).find(x=>x.id===id);return m?`<span class="pill">${esc(t(m.labelKey))}</span>`:''}).join('')}</div><a class="sourceChip" href="?tab=disputes#case-${esc(c.id)}" data-open-section="disputes" data-open-anchor="case-${esc(c.id)}">${esc(t('governanceCaseOpen'))} →</a></article>`).join('')}</div>`;
}
function economicCaseSection(r){
 const cases=economicCasesFor(r);if(!cases.length)return'';
 return `<div class="drawerSection drawerEconomicCase"><h3>${epBadge('fact')} ${esc(t('economicCaseDrawerTitle'))}</h3><p class="small">${esc(t('economicCaseDrawerSub'))}</p>${cases.map(c=>`<article class="drawerEconomicEntry"><div class="drawerEconomicTop"><span class="economicCaseBadge">${esc(t('economicCaseBadge'))}</span><strong>${(c.strings||[]).map(x=>`<bdi>${esc(x)}</bdi>`).join(' · ')}</strong></div><p class="caseQuestion">${esc(t(c.questionKey))}</p><div class="drawerEconomicModel"><span class="pill">${esc(t(c.modelKey))}</span></div><div class="drawerEconomicMetrics">${(c.metrics||[]).slice(0,2).map(m=>`<div><b>${esc(m.display)}</b><span>${esc(t(m.labelKey))}${m.period?' · '+esc(m.period):''}</span></div>`).join('')}</div><a class="sourceChip" href="?tab=economics#econ-case-${esc(c.id)}" data-open-section="economics" data-open-anchor="econ-case-${esc(c.id)}">${esc(t('economicCaseOpen'))} →</a></article>`).join('')}</div>`;
}
function socialCaseSection(r){
 const cases=socialCasesFor(r);if(!cases.length)return'';
 return `<div class="drawerSection drawerSocialCase"><h3>${epBadge('fact')} ${esc(t('socialCaseDrawerTitle'))}</h3><p class="small">${esc(t('socialCaseDrawerSub'))}</p>${cases.map(c=>`<article class="drawerSocialEntry"><div class="drawerSocialTop"><span class="socialCaseBadge">${esc(t('socialCaseBadge'))}</span><strong>${(c.strings||[]).map(x=>`<bdi>${esc(x)}</bdi>`).join(' · ')}</strong></div><p class="caseQuestion">${esc(t(c.questionKey))}</p><div class="drawerSocialModels">${(c.modelKeys||[]).map(k=>`<span class="pill">${esc(t(k))}</span>`).join('')}</div><div class="drawerSocialSignals">${(c.signals||[]).slice(0,2).map(x=>`<div><b>${esc(t(x.valueKey))}</b><span>${esc(t(x.labelKey))}</span></div>`).join('')}</div><a class="sourceChip" href="?tab=social#social-case-${esc(c.id)}" data-open-section="social" data-open-anchor="social-case-${esc(c.id)}">${esc(t('socialCaseOpen'))} →</a></article>`).join('')}</div>`;
}
function renderExplorerRecord(r){
 const drawer=document.getElementById('explorerDrawer');document.getElementById('drawerContent').removeAttribute('aria-busy');
 const sources=(r.source||[]).map((u,i)=>`<a href="${esc(u)}" target="_blank" rel="noopener">${r.ianaProfile&&i===0?t('ianaOfficialRecord'):t('source')+' '+(i+1)} ↗</a>`).join('');
 const provenance=r.provenanceKey?`<div class="drawerProvenance"><b>${esc(t('exploreProvenance'))}:</b> ${esc(t(r.provenanceKey))}${r.provenanceDate?' · '+esc(fmtDate(r.provenanceDate)):''}${PUB.state==='pre-reveal'&&r.string==='.lugano'?`<br>${esc(t('officialRecordAfterReveal'))}`:''}</div>`:'';
 const curated=r.recordLevel==='curated',applicationOnly=r.recordLevel==='application';
 const context=curated?`<div class="drawerSection"><h3>${esc(t('ianaCuratedContext'))}</h3><dl class="drawerFacts"><dt>${t('exploreOriginRound')}</dt><dd>${r.originRound?esc(t(r.originRound)):'—'}${(r.originRoundSources||[]).map(u=>` <a href="${esc(u)}" target="_blank" rel="noopener">${t('source')} ↗</a>`).join('')}</dd><dt>${t('exploreApplicantEntity')}</dt><dd>${esc(r.applicationEntity||'—')}</dd><dt>${t('exploreDesignation')}</dt><dd>${r.editorialDesignation?esc(t(explorerTypeKey(r.editorialDesignation))):'—'}</dd><dt>${t('exploreGroup')}</dt><dd>${esc(r.group||'—')}</dd><dt>${t('exploreGeography')}</dt><dd>${esc(fmtPlace(r.representedPlace||r.geography)||'—')}</dd><dt>${t('exploreContention')}</dt><dd>${r.contentionCount?fmtNum(r.contentionCount):'—'}</dd><dt>${t('exploreContext')}</dt><dd>${r.noteKey?esc(t(r.noteKey)):'—'}</dd></dl></div>`:'';
 document.getElementById('drawerContent').innerHTML=`<div class="recordLevel">${esc(t(recordLevelKey(r)))}</div><div class="drawerMeta"><span class="explorerState">${esc(t(r.currentRootStatus||r.status))}</span>${(curated||applicationOnly||r.applicationCount)?`<span class="pill">${esc(fmtRounds(r))}</span>`:''}<span class="pill">${esc(t(explorerTypeKey(r.type)))}</span>${curated?explorerThemePills(r):''}</div>${provenance}${explorerIntroductionSection(r)}${applicationArchaeologySection(r)}${ianaFactFields(r)}${r.ianaProfile?`<p class="drawerProvenance">${esc(t('ianaRecordNote'))}</p>`:''}${context}${governanceCaseSection(r)}${economicCaseSection(r)}${socialCaseSection(r)}${explorerHistory(r)}${gtldAgreementSection(r)}${r.readingKey?`<div class="drawerSection"><h3>${epBadge('reading')} ${t('exploreReadingFields')}</h3><div class="drawerReading">${esc(t(r.readingKey))}</div></div>`:''}${ianaProfileSections(r)}<div class="drawerSection"><h3>${t('exploreSources')}</h3><div class="drawerSources">${sources||(r.provenanceKey?`<span class="small">${esc(t('officialRecordAfterReveal'))}</span>`:'—')}</div></div>`;
 const panel=drawer.querySelector('.explorerDrawerPanel');if(panel)panel.scrollTop=0;
}
function closeExplorerDrawer({historyMode='replace',restoreFocus=true}={}){
 drawerLoadId++;explorerProfileId='';const d=document.getElementById('explorerDrawer');
 const wasOpen=d?.classList.contains('open');
 if(d){d.classList.remove('open');d.setAttribute('aria-hidden','true');document.body.style.overflow='';}
 const target=lastDrawerTrigger;lastDrawerTrigger=null;
 if(historyMode!=='none')setQuery(historyMode);
 if(wasOpen&&restoreFocus)requestAnimationFrame(()=>{const fallback=document.getElementById('explorerSearch');(target?.isConnected&&target!==document.body?target:fallback)?.focus?.()});
}
function setExplorerPreset(v){explorerPreset=v||'all';if(!['all','root','outsideRoot','curated'].includes(explorerPreset)){const advanced=document.getElementById('explorerAdvanced');if(advanced)advanced.open=true;}renderExplorer(true)}
function resetExplorer(){showProfileLinkNotice(false);explorerPreset='all';const advanced=document.getElementById('explorerAdvanced');if(advanced)advanced.open=false;['explorerSearch','exploreRoundFilter','exploreStatusFilter','exploreTypeFilter','exploreThemeFilter','exploreCountryFilter'].forEach(id=>{const el=document.getElementById(id);if(!el)return;if(el.tagName==='INPUT')el.value='';else el.value='all'});renderExplorer(true)}
function renderDisputes(){
 const mech=document.getElementById('disputeMechanisms'),grid=document.getElementById('disputeGrid'),data=D.governanceCases||{};
 if(mech)mech.innerHTML=(data.mechanisms||[]).map((m,i)=>`<article class="disputeMechanism"><span class="disputeMechanismNo">0${i+1}</span><h3>${esc(t(m.labelKey))}</h3><p>${esc(t(m.bodyKey))}</p></article>`).join('');
 if(!grid)return;
 grid.innerHTML=(data.cases||[]).map(c=>`<article class="disputeCase" id="case-${esc(c.id)}"><div class="disputeCaseTop"><div class="caseStrings">${(c.strings||[]).map(x=>`<bdi>${esc(x)}</bdi>`).join('<span aria-hidden="true"> · </span>')}</div><span class="pill">${esc(c.period)}</span></div><div class="caseMeta">${(c.categoryKeys||[]).map(k=>`<span class="pill">${esc(t(k))}</span>`).join('')}${(c.mechanisms||[]).map(id=>{const m=(data.mechanisms||[]).find(x=>x.id===id);return m?`<span class="pill mechanismPill">${esc(t(m.labelKey))}</span>`:''}).join('')}</div><div class="caseQuestion"><span class="label">${esc(t('caseCoreQuestion'))}</span><h3>${esc(t(c.questionKey))}</h3></div><div class="caseFact">${epBadge('fact')}<p>${esc(t(c.factKey))}</p></div><div class="caseReading">${epBadge('reading')}<p>${esc(t(c.readingKey))}</p></div><div class="caseOutcome"><b>${esc(t('caseOutcome'))}</b><p>${esc(t(c.outcomeKey))}</p></div><details class="caseTimeline"><summary>${esc(t('caseMilestones'))} · ${fmtNum((c.events||[]).length)}</summary>${(c.events||[]).map(e=>`<div class="caseMilestone"><time>${esc(e.period)}</time><div><p>${esc(t(e.textKey))}</p><div class="srcs">${(e.sources||[]).map((u,i)=>`<a href="${esc(u)}" target="_blank" rel="noopener">${esc(t('source'))}${e.sources.length>1?' '+(i+1):''} ↗</a>`).join('')}</div></div></div>`).join('')}</details><div class="caseSources">${(c.sources||[]).map(s=>`<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)} ↗</a>`).join('')}</div><button class="control disputeExplore" type="button" data-dispute-explore="${esc(c.strings?.[0]||'')}">${esc(t('disputesExplore'))}</button></article>`).join('');
 grid.querySelectorAll('[data-dispute-explore]').forEach(b=>b.addEventListener('click',()=>{const input=document.getElementById('explorerSearch');if(input)input.value=b.dataset.disputeExplore||'';explorerPreset='disputes';activateTab('explore',true);renderExplorer(true);document.getElementById('explorerSearch')?.focus()}));
}
function renderEconomics(){
 const data=D.economicCases||{},models=document.getElementById('economicModels'),grid=document.getElementById('economicGrid');
 if(models)models.innerHTML=(data.models||[]).map((m,i)=>`<article class="economicModel"><span class="economicModelNo">0${i+1}</span>${m.contextKey?`<span class="pill">${esc(t(m.contextKey))}</span>`:''}<h3>${esc(t(m.labelKey))}</h3><p>${esc(t(m.bodyKey))}</p></article>`).join('');
 if(!grid)return;
 grid.innerHTML=(data.cases||[]).map(c=>`<article class="economicCase" id="econ-case-${esc(c.id)}"><div class="economicCaseTop"><div class="caseStrings">${(c.strings||[]).length?(c.strings||[]).map(x=>`<bdi>${esc(x)}</bdi>`).join('<span aria-hidden="true"> · </span>'):`<span>${esc(t('economicSystemCase'))}</span>`}</div><span class="pill">${esc(c.period)}</span></div><div class="caseMeta"><span class="pill mechanismPill">${esc(t(c.modelKey))}</span></div><div class="caseQuestion"><span class="label">${esc(t('economicCoreQuestion'))}</span><h3>${esc(t(c.questionKey))}</h3></div><div class="caseFact">${epBadge('fact')}<p>${esc(t(c.factKey))}</p></div><div class="economicMetrics">${(c.metrics||[]).map(m=>`<div class="economicMetric"><strong>${esc(m.display)}</strong><span>${esc(t(m.labelKey))}</span><small>${esc(m.period)} · ${esc(m.currency)}</small></div>`).join('')}</div><div class="caseReading">${epBadge('reading')}<p>${esc(t(c.readingKey))}</p></div><div class="caseSources">${(c.sources||[]).map(s=>`<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)} ↗</a>`).join('')}</div>${(c.strings||[]).length?`<button class="control economicExplore" type="button" data-economic-explore="${esc(c.strings[0])}">${esc(t('economicCaseExplore'))}</button>`:''}</article>`).join('');
 grid.querySelectorAll('[data-economic-explore]').forEach(b=>b.addEventListener('click',()=>{const input=document.getElementById('explorerSearch');if(input)input.value=b.dataset.economicExplore||'';explorerPreset='economics';activateTab('explore',true);renderExplorer(true);document.getElementById('explorerSearch')?.focus()}));
}
function renderStrange(){const el=document.getElementById('strangeGrid');if(!el)return;const rows=D.strange||[];el.innerHTML=rows.map(r=>`<article class="strangeCard"><div class="factMeta">${epBadge('fact')}</div><div class="tld">${r.string}</div><div class="meta"><span class="pill">${r.displayRound}</span><span class="pill">${t(r.category)}</span><span class="pill">${t(r.status)}</span></div><div class="label">${t('whatItWas')}</div><p>${t(r.noteKey)}</p><div class="label readingLine">${epBadge('reading')}${t('whatItSays')}</div><p>${t(r.insightKey)}</p><div class="srcs">${r.sources.map((s,i)=>`<a href="${s}" target="_blank" rel="noopener">${r.sources.length>1?t('source')+' '+(i+1):t('source')} ↗</a>`).join('')}</div></article>`).join('')}
function renderSemanticDrift(){const el=document.getElementById('semanticDriftGrid');if(!el)return;const rows=D.semanticDrift||[];el.innerHTML=rows.map(r=>{const cat=r.category==='media'?'driftMedia':r.category;return `<article class="strangeCard semanticDriftCard"><div class="factMeta">${epBadge('fact')}</div><div class="tld">${r.string}</div><div class="meta"><span class="pill">${t(cat)}</span><span class="pill">${t('semanticDrift')}</span></div><div class="driftPair"><div class="driftSide"><div class="label">${t('driftFormalLabel')}</div><strong>${t(r.formalKey)}</strong></div><span class="driftArrow" aria-hidden="true">→</span><div class="driftSide"><div class="label">${t('driftAdoptedLabel')}</div><strong>${t(r.adoptedKey)}</strong></div></div><div class="label readingLine">${epBadge('reading')}${t('whatItSays')}</div><p>${t(r.readingKey)}</p><div class="srcs">${(r.sources||[]).map((u,i)=>`<a href="${u}" target="_blank" rel="noopener">${t('source')} ${i+1} ↗</a>`).join('')}</div></article>`}).join('')}
function renderDnsOddities(){const el=document.getElementById('dnsOddities');if(!el)return;const groups=D.dnsOddities||[];el.innerHTML=groups.map(g=>`<section class="oddityFamily"><div class="oddityFamilyHead"><h3>${t(g.titleKey)}</h3><p>${t(g.subKey)}</p></div><div class="oddityCases">${(g.cases||[]).map(c=>`<article class="oddityCase"><div class="oddityCaseTop"><strong class="oddityString">${c.string}</strong><span class="pill">${t(c.status)}</span></div><div class="oddityFact">${epBadge('fact')}<span>${t(c.factKey)}</span></div><div class="oddityReadingLine">${epBadge('reading')}<span>${t(c.readingKey)}</span></div><div class="srcs">${(c.sources||[]).map((u,i)=>`<a href="${u}" target="_blank" rel="noopener">${t('source')} ${i+1} ↗</a>`).join('')}</div></article>`).join('')}</div></section>`).join('')}
function renderNamespaceDimensions(){const el=document.getElementById('namespaceDimensions');if(!el)return;el.innerHTML=(D.namespaceDimensions||[]).map((x,i)=>`<article class="dimensionCard"><span class="dimensionNo">0${i+1}</span><h3>${t(x.labelKey)}</h3><p>${t(x.bodyKey)}</p></article>`).join('')}
function renderDomainLifecycle(){const el=document.getElementById('domainLifecycle');if(!el)return;const m=Object.fromEntries((D.domainLifecycle||[]).map(x=>[x.id,x]));const card=(id,n,extra='')=>{const x=m[id];return x?`<div class="lifecycleItem ${extra}"><span class="lifeIndex">${n}</span><b>${t(x.labelKey)}</b><p>${t(x.bodyKey)}</p></div>`:''};el.innerHTML=`<div class="lifecyclePrimary">${card('available','01','availableItem')}<span class="lifecycleArrow toRegistered" aria-hidden="true">→</span>${card('registered','02','registeredItem')}<span class="lifecycleLoop">↺ ${esc(t('lifeRenewed'))}</span><span class="lifecycleArrow toExpired" aria-hidden="true">→</span>${card('expired','03','expiredItem')}</div><div class="lifecycleDeletionLabel">${esc(t('lifeDeletionPath'))}</div><div class="lifecycleDeletion">${card('redemption','04')}<span class="lifecycleArrow" aria-hidden="true">→</span>${card('pendingDelete','05')}<span class="lifecycleArrow" aria-hidden="true">→</span>${card('availableAgain','06')}</div>`}
function renderControlLevers(){const el=document.getElementById('controlLevers');if(!el)return;el.innerHTML=(D.controlLevers||[]).map((x,i)=>`<article class="leverCard"><span class="leverNo">0${i+1}</span><h3>${t(x.labelKey)}</h3><p>${t(x.bodyKey)}</p></article>`).join('')}
function renderDnsCapabilities(){const el=document.getElementById('dnsCapabilities');if(!el)return;el.innerHTML=(D.dnsCapabilities||[]).map(x=>`<article class="dnsCapability"><div class="dnsCode">${esc(x.code)}</div><h3>${t(x.labelKey)}</h3><p>${t(x.bodyKey)}</p><div class="srcs">${(x.sources||[]).map((u,i)=>`<a href="${u}" target="_blank" rel="noopener">${t('source')}${x.sources.length>1?' '+(i+1):''} ↗</a>`).join('')}</div></article>`).join('')}
function renderTldModels(){const app=document.getElementById('applicationModels'),access=document.getElementById('accessModels');const card=x=>`<article class="modelCard">${x.example?`<div class="modelExample">${esc(x.example)}</div>`:''}<h4>${t(x.labelKey)}</h4><p>${t(x.bodyKey)}</p></article>`;if(app)app.innerHTML=(D.tldModels||[]).filter(x=>x.axis==='application').map(card).join('');if(access)access.innerHTML=(D.tldModels||[]).filter(x=>x.axis==='access').map(card).join('')}
function renderSuccessFramework(){const el=document.getElementById('successFramework');if(!el)return;el.innerHTML=(D.successFramework||[]).map((x,i)=>`<article class="successCard"><span class="successNo">0${i+1}</span><h3>${t(x.labelKey)}</h3><p>${t(x.bodyKey)}</p></article>`).join('')}
function renderPress(){document.getElementById('pressFacts').innerHTML=D.pressFacts.map((f,i)=>`<div class="fact"><div class="factMeta">${epBadge('fact')}</div><div class="num">${typeof f.num==='number'?fmtNum(f.num):esc(f.num)}</div><p>${t(f.key)}</p><div class="factActions"><a class="linkBtn" href="${f.source}" target="_blank" rel="noopener">${t('source')} ↗</a><button class="miniBtn" data-copy="${f.key}">${t('copyFact')}</button></div></div>`).join('');document.querySelectorAll('[data-copy]').forEach(b=>b.onclick=async()=>{const f=D.pressFacts.find(x=>x.key===b.dataset.copy),tx=t(b.dataset.copy)+(f?.source?`\nSource: ${f.source}`:'');try{await navigator.clipboard.writeText(tx);const old=b.textContent;b.textContent=t('copied');setTimeout(()=>b.textContent=old,900)}catch(e){}});const guideCard=(n,kind)=>`<div class="precisionCard"><div class="precisionSide"><div class="precisionMeta">${epBadge(kind)}</div><span class="precisionLabel">${t('sayThis')}</span><p>${t('safe'+n)}</p></div><div class="precisionDivider"></div><div class="precisionSide mutedSide"><span class="precisionLabel">${t('notThis')}</span><p>${t('avoid'+n)}</p></div></div>`;document.getElementById('guideRows').innerHTML=[2,3].map(n=>guideCard(n,'fact')).join('');const lgr=document.getElementById('luganoGuideRows');if(lgr)lgr.innerHTML=[1,4].map(n=>guideCard(n,n===1?'fact':'vision')).join('');document.getElementById('angleGrid').innerHTML=[1,2,3,4,5,6,7].map(n=>`<div class="angle">${t('angle'+n)}</div>`).join('')}
function renderLists(){document.getElementById('guardrailList').innerHTML=[1,2,3,4,5,6].map(n=>`<li>${t('guard'+n)}</li>`).join('');const seen=new Set(),sources=(D.sources||[]).filter(s=>{const u=String((s&&s[1])||'').trim();if(!u||seen.has(u))return false;seen.add(u);return true});document.getElementById('sourceList').innerHTML=sources.map(s=>`<div class="sourceRow"><span class="dot"></span><div class="sourceLabel"><a href="${s[1]}" target="_blank" rel="noopener">${s[0]}</a><span class="tag">${t(s[2])}</span></div></div>`).join('')}

function renderBeyond(){
 const ladder=[1,2,3,4,5]; const le=document.getElementById('trustLadder'); if(le)le.innerHTML=ladder.map(n=>`<div class="trustStep"><div class="k">0${n}</div><b>${t('m'+n)}</b><p>${t('m'+n+'b')}</p></div>`).join('');
 const ce=document.getElementById('beyondCases'); if(ce)ce.innerHTML=D.beyondCases.map(c=>`<article class="caseCard"><div class="caseTop">${epBadge('fact')}</div><div class="tld">${c.string}</div><div class="stage"><span class="pill">${t(c.stageKey)}</span></div><h3>${t(c.headlineKey)}</h3><p>${t(c.bodyKey)}</p><a href="${c.source}" target="_blank" rel="noopener">${t('sourceCase')} ↗</a></article>`).join('');
}
function renderSocial(){
 const data=D.socialCases||{},models=document.getElementById('socialModels'),grid=document.getElementById('socialGrid');
 if(models)models.innerHTML=(data.models||[]).map((m,i)=>`<article class="socialModel"><span class="socialModelNo">0${i+1}</span><h3>${esc(t(m.labelKey))}</h3><p>${esc(t(m.bodyKey))}</p></article>`).join('');
 if(!grid)return;
 grid.innerHTML=(data.cases||[]).map(c=>`<article class="socialCase" id="social-case-${esc(c.id)}"><div class="socialCaseTop"><div class="caseStrings">${(c.strings||[]).length?(c.strings||[]).map(x=>`<bdi>${esc(x)}</bdi>`).join('<span aria-hidden="true"> · </span>'):`<span>${esc(t('socialSystemCase'))}</span>`}</div><span class="pill">${esc(c.period)}</span></div><div class="caseMeta">${(c.modelKeys||[]).map(k=>`<span class="pill mechanismPill">${esc(t(k))}</span>`).join('')}</div><div class="caseQuestion"><span class="label">${esc(t('socialCoreQuestion'))}</span><h3>${esc(t(c.questionKey))}</h3></div><div class="caseFact">${epBadge('fact')}<p>${esc(t(c.factKey))}</p></div><div class="socialSignals">${(c.signals||[]).map(x=>`<div class="socialSignal"><strong>${esc(t(x.valueKey))}</strong><span>${esc(t(x.labelKey))}</span></div>`).join('')}</div><div class="caseReading">${epBadge('reading')}<p>${esc(t(c.readingKey))}</p></div><div class="caseSources">${(c.sources||[]).map(src=>`<a href="${esc(src.url)}" target="_blank" rel="noopener">${esc(src.label)} ↗</a>`).join('')}</div>${(c.strings||[]).length?`<button class="control socialExplore" type="button" data-social-explore="${esc(c.strings[0])}">${esc(t('socialCaseExplore'))}</button>`:''}</article>`).join('');
 grid.querySelectorAll('[data-social-explore]').forEach(b=>b.addEventListener('click',()=>{const input=document.getElementById('explorerSearch');if(input)input.value=b.dataset.socialExplore||'';explorerPreset='social';activateTab('explore',true);renderExplorer(true);document.getElementById('explorerSearch')?.focus()}));
}

function regionLabel(d){const key={NA:'regionNorthAmerica',EUR:'regionEurope',AP:'regionAsiaPacific',LAC:'regionLatinAmerica',AF:'regionAfrica'}[d.code];return key?t(key):d.name}
function mapXY(lon,lat){return{x:(lon+180)/360*1000,y:(90-Math.max(-60,Math.min(85,lat)))/180*500}}
let geoMode=['governance','rsp','applicant2012','applicant2026'].includes(qp.get('map'))?qp.get('map'):'governance';
function renderGeoMap(){
 const el=document.getElementById('geoMap'); if(!el)return; const path=window.DOT_WORLD_PATH||'';
 let layer='';
 if(geoMode==='governance'){
  layer=D.governanceNodes.map(d=>{const p=mapXY(d.lon,d.lat);return `<g class="mapDatum" data-tip="${d.name} — ${t(d.detailKey)}" tabindex="0" role="button" aria-label="${esc(d.name+' — '+t(d.detailKey))}"><circle class="mapPoint ${d.kind}" cx="${p.x}" cy="${p.y}" r="${d.kind==='core'?7:5}"></circle><text class="mapLabel" x="${p.x+8}" y="${p.y-8}">${d.name.replace('ICANN ','')}</text></g>`}).join('');
 }else if(geoMode==='rsp'){
  layer=D.rspRegions.map(d=>{const p=mapXY(d.lon,d.lat),r=d.count?16+Math.sqrt(d.count)*7:14;return `<g class="mapDatum" tabindex="0" role="button" aria-label="${esc(regionLabel(d)+': '+fmtNum(d.count)+' '+t(geoMode==='rsp'?'rspEvaluated':'applications'))}" data-tip="${esc(regionLabel(d))}: ${fmtNum(d.count)} ${t('rspEvaluated')}"><circle class="mapBubble ${d.count?'':'zero'}" cx="${p.x}" cy="${p.y}" r="${r}"></circle><text class="mapBubbleLabel" x="${p.x}" y="${p.y+4}">${fmtNum(d.count)}</text><text class="mapLabel" x="${p.x}" y="${p.y+r+16}" text-anchor="middle">${d.code}</text></g>`}).join('');
 }else if(geoMode==='applicant2012'){
  layer=D.geoApplicantRegions2012.map(d=>{const p=mapXY(d.lon,d.lat),r=16+Math.sqrt(d.count)*1.2;return `<g class="mapDatum" tabindex="0" role="button" aria-label="${esc(regionLabel(d)+': '+fmtNum(d.count)+' '+t(geoMode==='rsp'?'rspEvaluated':'applications'))}" data-tip="${esc(regionLabel(d))}: ${fmtNum(d.count)} ${t('applications')}"><circle class="mapBubble applicantBubble" cx="${p.x}" cy="${p.y}" r="${r}"></circle><text class="mapBubbleLabel" x="${p.x}" y="${p.y+4}">${fmtNum(d.count)}</text><text class="mapLabel" x="${p.x}" y="${p.y+r+16}" text-anchor="middle">${d.code}</text></g>`}).join('');
 }else{
  const ready=(D.geoApplicantRegions2026||[]).some(d=>d.count!==null&&d.count!==undefined);
  layer=ready?D.geoApplicantRegions2026.map(d=>{const p=mapXY(d.lon,d.lat),r=16+Math.sqrt(d.count||0)*1.2;return `<g class="mapDatum" tabindex="0" role="button" aria-label="${esc(regionLabel(d)+': '+fmtNum(d.count)+' '+t(geoMode==='rsp'?'rspEvaluated':'applications'))}" data-tip="${esc(regionLabel(d))}: ${fmtNum(d.count)} ${t('applications')}"><circle class="mapBubble applicantBubble" cx="${p.x}" cy="${p.y}" r="${r}"></circle><text class="mapBubbleLabel" x="${p.x}" y="${p.y+4}">${fmtNum(d.count)}</text><text class="mapLabel" x="${p.x}" y="${p.y+r+16}" text-anchor="middle">${d.code}</text></g>`}).join(''):`<g class="mapPending"><text x="500" y="235" text-anchor="middle" class="mapPendingTitle">${t('awaitRevealShort')}</text><text x="500" y="263" text-anchor="middle" class="mapPendingSub">${t('applicantRegion2026')}</text></g>`;
 }
 el.innerHTML=`<svg viewBox="0 0 1000 500" role="group" aria-label="${t('geoTitle')}"><path class="worldCountry" d="${path}"></path>${layer}</svg>`;
 const note=document.getElementById('geoNote'); if(note)note.innerHTML=t(geoMode==='governance'?'geoGovernanceNote':geoMode==='rsp'?'geoRspNote':geoMode==='applicant2012'?'applicantRegion2012Note':'applicantRegion2026Note');
 let tt=document.getElementById('mapTooltip'); if(tt)tt.style.display='none';if(!tt){tt=document.createElement('div');tt.id='mapTooltip';tt.className='mapTooltip';document.body.appendChild(tt)}
 el.querySelectorAll('.mapDatum').forEach(g=>{g.addEventListener('pointerenter',e=>{tt.textContent=g.dataset.tip;tt.style.display='block'});g.addEventListener('pointermove',e=>{tt.style.left=(e.clientX+14)+'px';tt.style.top=(e.clientY+14)+'px'});g.addEventListener('pointerleave',()=>tt.style.display='none');g.addEventListener('focus',()=>{tt.textContent=g.dataset.tip;tt.style.display='block';const r=g.getBoundingClientRect();tt.style.left=(r.left+12)+'px';tt.style.top=(r.bottom+8)+'px'});g.addEventListener('blur',()=>tt.style.display='none');g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();tt.textContent=g.dataset.tip;tt.style.display='block'}});g.addEventListener('click',e=>{tt.textContent=g.dataset.tip;tt.style.display='block';tt.style.left=(e.clientX+14)+'px';tt.style.top=(e.clientY+14)+'px'})});
 document.querySelectorAll('.mapToggle').forEach(b=>{const selected=b.dataset.mapmode===geoMode;b.classList.toggle('active',selected);b.setAttribute('aria-pressed',String(selected))});setQuery();
}
function regionBars(data,total){return data.map(d=>{const pct=d.count===null?null:d.count/total*100;return `<div class="regionRow"><div class="regionHead"><b>${esc(regionLabel(d))} <span class="regionCode">(${esc(d.code)})</span></b><span>${d.count===null?'—':fmtNum(d.count)}${pct===null?'':` · ${pct.toLocaleString(localeCode(),{minimumFractionDigits:1,maximumFractionDigits:1})}%`}</span></div><div class="regionTrack"><div class="regionFill" style="width:${pct===null?0:pct}%"></div></div></div>`}).join('')}
function renderGeoBars(){const a=document.getElementById('demand2012Bars');if(a)a.innerHTML=regionBars(D.geoApplicantRegions2012,1930);const r=document.getElementById('rsp2026Bars');if(r)r.innerHTML=regionBars(D.rspRegions,29);const d=document.getElementById('demand2026Bars');if(d){const ready=(D.geoApplicantRegions2026||[]).some(x=>x.count!==null&&x.count!==undefined);d.innerHTML=ready?regionBars(D.geoApplicantRegions2026,D.round2026.applications):`<div class="pendingBlock"><span class="stateBadge placeholderState">${t('awaitReveal')}</span><div class="pendingDash">—</div><p>${t('demand2026Sub')}</p></div>`}}
function renderLugano(){const el=document.getElementById('luganoRoadmap');if(el)el.innerHTML=D.luganoStages.map(s=>`<div class="visionStep"><div class="pillarTop"><div class="n">${s.n}</div>${epBadge('vision')}</div><b>${t(s.key)}</b><p>${t(s.body)}</p></div>`).join('')}
function placeholderMetric(value,label,asOf=''){const missing=value===null||value===undefined||value==='';return `<div class="round2026Metric ${missing?'placeholder':''}"><div class="roundMetricTop">${missing?`<span class="stateBadge placeholderState">${t('awaitReveal')}</span>`:epBadge('fact')}</div><div class="value">${fmtNum(value)}</div><div class="label">${label}</div>${!missing&&asOf?`<div class="roundMetricAsOf">${esc(t('asOfLabel'))} ${esc(fmtDate(asOf))}</div>`:''}</div>`}
function renderRound2026(){
 const el=document.getElementById('round2026Grid');
 if(el){
  if(PUB.state==='pre-reveal')el.innerHTML=placeholderMetric(D.round2026.applications,t('paidApps'),D.round2026.asOf)+`<div class="roundAwaiting"><span class="stateBadge placeholderState">${t('awaitReveal')}</span><h3>${t('roundAwaitingTitle')}</h3><p>${t('roundAwaitingBody')}</p></div>`;
  else el.innerHTML=[placeholderMetric(D.round2026.applications,t('paidApps'),D.round2026.asOf),placeholderMetric(D.round2026.uniqueStrings,t('round2026Unique')),placeholderMetric(D.round2026.applicantOrganizations,t('round2026Applicants')),placeholderMetric(D.round2026.countriesTerritories,t('round2026Countries')),placeholderMetric(D.round2026.contentionSets,t('round2026Contention')),placeholderMetric(D.round2026.geographicApplications,t('round2026Geo')),placeholderMetric(D.round2026.communityApplications,t('round2026Community')),placeholderMetric(D.round2026.brandApplications,t('round2026Brand')),placeholderMetric(D.round2026.idnVariantApplications,t('round2026Idn'))].join('');
 }
 const cg=document.getElementById('city2026GeoValue'); if(cg)cg.textContent=fmtNum(D.round2026.geographicApplications);const cc=document.getElementById('city2026CityValue'); if(cc)cc.textContent=fmtNum(D.round2026.cityTerritorialStrings);const cv=document.getElementById('contention2026Value'); if(cv)cv.textContent=fmtNum(D.round2026.contentionSets);const ia=document.getElementById('identity2026TopValue'),inm=document.getElementById('identity2026TopName');if(ia)ia.textContent=fmtNum(D.round2026.topApplicantApplications); if(inm)inm.textContent=D.round2026.topApplicantName||'—';const iga=document.getElementById('identity2026GroupValue'),ign=document.getElementById('identity2026GroupName');if(iga)iga.textContent=fmtNum(D.round2026.topApplicantGroupApplications); if(ign)ign.textContent=D.round2026.topApplicantGroupName||'—';const cityState=document.getElementById('city2026State');if(cityState)cityState.hidden=!(D.round2026.geographicApplications==null||D.round2026.cityTerritorialStrings==null);const contentionState=document.getElementById('contention2026State');if(contentionState)contentionState.hidden=D.round2026.contentionSets!=null;const identityState=document.getElementById('identity2026TopState');if(identityState)identityState.hidden=D.round2026.topApplicantApplications!=null;const identityGroupState=document.getElementById('identity2026GroupState');if(identityGroupState)identityGroupState.hidden=D.round2026.topApplicantGroupApplications!=null;const geoState=document.getElementById('demand2026State');if(geoState)geoState.hidden=(D.geoApplicantRegions2026||[]).some(x=>x.count!==null&&x.count!==undefined);const tc=document.getElementById('topCountries2026');if(tc){const rows=D.round2026.topApplicantCountries||[];tc.innerHTML=rows.length?rows.map((x,i)=>`<div class="countryRank"><b>${i+1}</b><span>${x.name}</span><strong>${fmtNum(x.count)}</strong></div>`).join(''):`<div class="pendingBlock compactPending"><span class="stateBadge placeholderState">${t('awaitReveal')}</span><p>${t('topCountries2026Sub')}</p></div>`;}
}


// A local teaching model: no DNS queries, network probes or example-site requests.
let journeyStep=0;
const JOURNEY_STEPS=7;
const JOURNEY_ADDRESS_FOCUS=[
 ['scheme','host','name','tld','path'], // the URL as a whole
 ['host','name','tld'],               // the readable DNS name
 ['root','tld'],                      // hierarchy: hidden root + TLD
 ['host','name','tld'],               // the name being resolved to an IP address
 [],                                  // packets now use the resolved destination
 ['scheme'],                          // HTTPS
 ['path']                             // requested resource / page
];
function syncJourneyAddressFocus(guide){
 const active=new Set(JOURNEY_ADDRESS_FOCUS[journeyStep]||[]);
 guide.querySelectorAll('[data-journey-address-part]').forEach(part=>part.classList.toggle('is-active',active.has(part.dataset.journeyAddressPart)));
 guide.querySelector('.journeyAddressResult')?.classList.toggle('is-active',journeyStep===3);
}
function syncJourneyTeachingState(guide){
 const from=document.getElementById('journeyNowFrom'),to=document.getElementById('journeyNowTo'),hint=document.getElementById('journeyNowHint');
 if(from)from.textContent=t('journeyNow'+journeyStep+'From');
 if(to)to.textContent=t('journeyNow'+journeyStep+'To');
 if(hint)hint.textContent=t('journeyNow'+journeyStep+'Hint');
 const addressLane=document.getElementById('journeyAddressLane'),dnsLane=document.getElementById('journeyDnsLane'),webLane=document.getElementById('journeyWebLane');
 addressLane?.classList.toggle('is-visible',journeyStep===0);
 dnsLane?.classList.toggle('is-visible',journeyStep>=1&&journeyStep<=3);
 webLane?.classList.toggle('is-visible',journeyStep>=4);
 [addressLane,dnsLane,webLane].forEach(lane=>lane?.classList.toggle('is-active',lane?.classList.contains('is-visible')));
 const resolver=document.getElementById('journeyResolverNode');resolver?.classList.toggle('is-active',journeyStep===1);
 const root=guide.querySelector('[data-journey-node="root"]'),tld=guide.querySelector('[data-journey-node="tld"]'),authority=guide.querySelector('[data-journey-node="authority"]');
 root?.classList.toggle('is-complete',journeyStep>=2);root?.classList.toggle('is-active',false);
 tld?.classList.toggle('is-active',journeyStep===2);tld?.classList.toggle('is-complete',journeyStep>=3);
 authority?.classList.toggle('is-active',journeyStep===3);authority?.classList.toggle('is-complete',false);
}
function renderInternetJourney(){
 const guide=document.getElementById('internet-guide');if(!guide)return;
 const stepper=document.getElementById('journeyStepper');stepper.setAttribute('aria-label',t('journeyStepsLabel'));
 stepper.innerHTML=Array.from({length:JOURNEY_STEPS},(_,i)=>`<li><button type="button" class="journeyStepButton" data-journey-go="${i}" aria-controls="journeyLesson" aria-label="${esc(fmtNum(i+1)+'. '+t('journey'+i+'Label'))}"><span class="journeyStepNumber" aria-hidden="true">${fmtNum(i+1)}</span><span class="journeyStepLabel">${esc(t('journey'+i+'Label'))}</span></button></li>`).join('');
 document.getElementById('journeySteps').innerHTML=Array.from({length:JOURNEY_STEPS},(_,i)=>`<article class="journeyStep" data-journey-scene="${i}" aria-labelledby="journey-title-${i}"><h3 id="journey-title-${i}">${esc(t('journey'+i+'Title'))}</h3><p>${esc(t('journey'+i+'Body'))}</p><div class="journeyKey"><span>${esc(t('journeyKeyLabel'))}</span><strong>${esc(t('journey'+i+'Key'))}</strong></div><details><summary>${esc(t('journeyDetails'))}</summary><p>${esc(t('journey'+i+'Detail'))}</p></details></article>`).join('');
 stepper.querySelectorAll('[data-journey-go]').forEach(button=>button.addEventListener('click',()=>setJourneyStep(Number(button.dataset.journeyGo),true)));
 setJourneyStep(journeyStep);
}
function keepJourneyStepInView(){
 const lesson=document.getElementById('journeyLesson');if(!lesson||!window.matchMedia('(max-width:680px)').matches)return;
 requestAnimationFrame(()=>{const r=lesson.getBoundingClientRect(),topGuard=72,bottomGuard=window.innerHeight*.58;if(r.top>=topGuard&&r.top<=bottomGuard)return;const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;lesson.scrollIntoView({behavior:reduced?'auto':'smooth',block:'start'});});
}
function setJourneyStep(step,userAction=false){
 const guide=document.getElementById('internet-guide');if(!guide)return;
 journeyStep=Number.isInteger(step)?Math.max(0,Math.min(JOURNEY_STEPS-1,step)):0;
 guide.dataset.journeyStep=String(journeyStep);guide.classList.toggle('has-address',journeyStep>=3);guide.classList.toggle('has-connection',journeyStep>=4);guide.classList.toggle('has-security',journeyStep>=5);guide.classList.toggle('has-page',journeyStep===6);syncJourneyAddressFocus(guide);syncJourneyTeachingState(guide);
 guide.querySelectorAll('[data-journey-scene]').forEach(scene=>scene.classList.toggle('is-active',Number(scene.dataset.journeyScene)===journeyStep));
 guide.querySelectorAll('[data-journey-go]').forEach(button=>{const n=Number(button.dataset.journeyGo);button.classList.toggle('is-complete',n<journeyStep);if(n===journeyStep)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current')});
 const phase=journeyStep===0?'journeyPhaseName':journeyStep<4?'journeyPhaseDns':'journeyPhaseWeb';
 const progress=t('journeyStepCount').replace('{step}',fmtNum(journeyStep+1)).replace('{total}',fmtNum(JOURNEY_STEPS));
 document.getElementById('journeyPhase').textContent=t(phase);document.getElementById('journeyProgress').textContent=progress;
 document.getElementById('journeyBack').disabled=journeyStep===0;
 const next=document.getElementById('journeyNext'),key=journeyStep===0?'journeyStart':'journeyNext';next.disabled=journeyStep===JOURNEY_STEPS-1;next.dataset.i18n=key;next.textContent=t(key);
 if(userAction){
  document.getElementById('journeyAnnounce').textContent=progress+'. '+t('journey'+journeyStep+'Title')+'. '+t('journey'+journeyStep+'Body')+'. '+t('journeyKeyLabel')+': '+t('journey'+journeyStep+'Key');
  if(location.protocol==='http:'||location.protocol==='https:'){const url=new URL(location.href);url.searchParams.set('tab','overview');url.searchParams.set('walk',String(journeyStep));url.hash='internet-basics';history.replaceState({tab:'overview'},'',url);syncLanguageLinks();syncSectionLinks();syncFeedbackLinks();}
  keepJourneyStepInView();
 }
}
const SECTION_TOC_KEYS={strange:['tocStrangeFossils','tocStrangeDrift','tocStrangeOddities']};
function renderSectionTocs(){for(const id of ['how','beyond','geography','social','economics','contention','disputes','strange','sources']){const sec=document.getElementById(id);if(!sec)continue;sec.querySelector(':scope > .sectionToc')?.remove();const headings=[...sec.querySelectorAll('h2')].filter(h=>h.textContent.trim());if(headings.length<2)continue;const nav=document.createElement('nav');nav.className='sectionToc';nav.setAttribute('aria-label',t('tocLabel'));headings.forEach((h,i)=>{h.id=h.id||`${id}-part-${i+1}`;h.classList.add('sectionTocTarget');const b=document.createElement('a');b.href='?tab='+id+'#'+h.id;b.className='tocLink';const key=h.dataset.tocKey||SECTION_TOC_KEYS[id]?.[i];b.textContent=key?t(key):h.textContent.trim();b.title=h.textContent.trim();b.addEventListener('click',e=>{if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||(typeof e.button==='number'&&e.button!==0))return;e.preventDefault();const url=new URL(location.href);url.searchParams.set('tab',id);url.hash=h.id;history.pushState({tab:id},'',url);syncLanguageLinks();syncFeedbackLinks();focusNavigationTarget(h);scrollToNavigationTarget(h,true)});nav.appendChild(b)});sec.prepend(nav)}}
let runtimeApplications2012=[];
function parseCsv4180(text){
 const rows=[];let row=[],cell='',quoted=false;
 for(let i=0;i<text.length;i++){const c=text[i];if(quoted){if(c==='"'&&text[i+1]==='"'){cell+='"';i++}else if(c==='"')quoted=false;else cell+=c}else if(c==='"')quoted=true;else if(c===','){row.push(cell);cell=''}else if(c==='\n'){row.push(cell.replace(/\r$/,''));rows.push(row);row=[];cell=''}else cell+=c}
 if(cell||row.length){row.push(cell.replace(/\r$/,''));rows.push(row)}return rows;
}
function applicationAscii(raw,aLabel=''){const label=(aLabel||raw||'').trim().replace(/^\./,'');try{return '.'+new URL('http://'+label).hostname.toLowerCase()}catch(e){return '.'+label.toLowerCase()}}
function sanitize2012Csv(text){
 const rows=parseCsv4180(text),expected=D.applicationArchaeology?.rounds?.['2012'];if(!rows.length||!expected)throw new Error('Missing 2012 archaeology manifest');
 const header=rows.shift(),want=expected.expectedHeader;if(header.length!==want.length||want.some((x,i)=>header[i]!==x))throw new Error('Unexpected 2012 Reveal Day header');
 const apps=rows.filter(r=>r.some(Boolean)).map(r=>({round:'2012',submissionId:'',applicationId:r[13].trim(),string:'.'+r[0].trim().normalize('NFC').toLowerCase(),asciiString:applicationAscii(r[0],r[8]),applicant:r[1].trim(),website:r[2].trim(),location:r[3].trim(),region:r[4].trim(),idn:r[7].trim()==='Yes',aLabel:r[8].trim().toLowerCase(),englishMeaning:r[9].trim(),scriptCode:r[10].trim(),community:r[11].trim()==='Yes',geographic:r[12].trim()==='Yes',relationType:'requested',source:'https://web.archive.org/web/20120613142047if_/http://newgtlds-cloudfront.icann.org/sites/default/files/reveal/strings-1200utc-13jun12-en.html'}));
 validate2012Applications(apps);return apps;
}
function validate2012Applications(apps){
 const e=D.applicationArchaeology.rounds['2012'],uniq=new Set(apps.map(a=>a.string)),ids=new Set(apps.map(a=>a.applicationId)),regions={};apps.forEach(a=>regions[a.region]=(regions[a.region]||0)+1);
 const checks=[apps.length===e.applications,uniq.size===e.uniqueStrings,ids.size===e.applications,apps.filter(a=>a.idn).length===e.idn,apps.filter(a=>a.geographic).length===e.geographic,apps.filter(a=>a.community).length===e.community,...Object.entries(e.regions).map(([k,v])=>regions[k]===v)];
 if(checks.some(x=>!x))throw new Error('2012 Reveal Day corpus failed locked ICANN totals');return true;
}
function recomputeApplicationSummary(r){const local=r.applications||[],remote=runtimeApplicationOverlay.get(r.asciiString)||[],apps=dedupeApplications([...local,...remote]);r.applicationCount=apps.length;r.applicationRounds=[...new Set(apps.map(a=>String(a.round)))];r.applicationApplicants=[...new Set(apps.map(a=>a.applicant).filter(Boolean))];explorerTextCache.delete(r);return apps}
function merge2012Applications(apps){
 const byAscii=new Map(D.explorer.map(r=>[r.asciiString,r]));
 for(const app of apps){let row=byAscii.get(app.asciiString);if(!row){row={string:app.string,asciiString:app.asciiString,recordLevel:'application',ianaProfile:false,rootListed:false,currentRootStatus:'notDelegated',status:'notDelegated',formalType:'notApplicable',type:'notApplicable',currentAsOf:D.explorerMeta.ianaSnapshot,registryEntity:'',entity:'',registryCountry:'',registryCountryCode:'',sourceUrl:app.source,source:[app.source],events:[],themes:[],strange:false,city:false,placeholder:false,programRound:'2012',introductionPath:'intro2012',introductionBasis:'basisDirect',introductionPathSources:[app.source,D.applicationArchaeology.rounds['2012'].sources.slice(-1)[0]],runtimeApplicationRecord:true,applications:[]};D.explorer.push(row);byAscii.set(row.asciiString,row)}
  const list=runtimeApplicationOverlay.get(row.asciiString)||[];list.push(app);runtimeApplicationOverlay.set(row.asciiString,list);if(row.runtimeApplicationRecord)row.applications=list;recomputeApplicationSummary(row);
 }
 D.explorer.sort((a,b)=>a.asciiString.localeCompare(b.asciiString,'en'));runtimeApplications2012=apps;D.explorerMeta.application2012CoverageComplete=true;syncApplicationCorpusComplete();D.explorerMeta.recordCount=D.explorer.length;D.explorerMeta.applicationOnlyCount=D.explorer.filter(r=>!r.ianaProfile&&r.recordLevel==='application').length;
 renderExplorerOptions();renderExplorer(true);renderApplicationCorpusStatus('ready');enable2012Download();
 const p=new URLSearchParams(location.search);if(activeTab==='explore'&&p.has('tld')&&explorerProfileIndex(p.get('tld'))>=0&&explorerProfileId==='')restoreUrlState();
}
function applicationRoundComplete(round){return !!D.explorerMeta?.['application'+round+'CoverageComplete']}
function applicationCorpusStats(){const rounds=D.applicationArchaeology?.rounds||{},completed=[];let count=0;for(const [round,meta] of Object.entries(rounds)){if(applicationRoundComplete(round)){completed.push(round);count+=Number(meta.applications||0)}}return {count,completed}}
function syncApplicationCorpusComplete(){const rounds=D.applicationArchaeology?.rounds||{},required=['2000','2004','2012','2026'];D.explorerMeta.applicationCorpusComplete=required.every(round=>!!rounds[round]&&applicationRoundComplete(round));return D.explorerMeta.applicationCorpusComplete}
function renderApplicationCorpusStatus(state='loading'){
 const el=document.getElementById('applicationCorpusStatus'),count=document.getElementById('exploreApplicationCount'),stats=applicationCorpusStats();if(count)count.textContent=fmtNum(stats.count);if(!el)return;
 el.className='applicationCorpusStatus '+state;let key=state==='ready'?'applicationCorpusReady':state==='error'?'applicationCorpusError':state==='frozen'?'applicationCorpusFrozen':'applicationCorpusLoading';let msg=t(key);if(state==='ready'||state==='frozen')msg=msg.replace('{count}',fmtNum(stats.count)).replace('{rounds}',stats.completed.join(', '));el.textContent=msg;
}
function csvDownload2012(){if(!runtimeApplications2012.length)return;const headers=['string','applicant','website','location','region','idn','a_label','english_meaning','script_code','community','geographic','application_id','source'];const q=v=>{const x=String(v??'');return /[",\n]/.test(x)?'"'+x.replace(/"/g,'""')+'"':x};const text=[headers.join(','),...runtimeApplications2012.map(a=>[a.string,a.applicant,a.website,a.location,a.region,a.idn?'Yes':'',a.aLabel,a.englishMeaning,a.scriptCode,a.community?'Yes':'',a.geographic?'Yes':'',a.applicationId,a.source].map(q).join(','))].join('\n')+'\n';const blob=new Blob([text],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='applications_2012_sanitized.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function enable2012Download(){const b=document.getElementById('downloadApplications2012');if(b){b.disabled=false;b.classList.remove('disabled')}}
function initApplicationArchaeology(){
 renderApplicationCorpusStatus('frozen');const b=document.getElementById('downloadApplications2012');if(b){b.disabled=true;b.classList.add('disabled')}
}
function validateGtldLifecycle(payload){
 const rows=payload?.gTLDs;if(!Array.isArray(rows)||rows.length<1200)throw new Error('Incomplete ICANN gTLD lifecycle dataset');
 const seen=new Set();for(const r of rows){if(typeof r.gTLD!=='string'||!r.gTLD.trim())throw new Error('Invalid gTLD lifecycle row');const key='.'+r.gTLD.trim().toLowerCase();if(seen.has(key))throw new Error('Duplicate gTLD lifecycle row: '+key);seen.add(key)}
 if(!seen.has('.aaa')||!seen.has('.com')||!seen.has('.web'))throw new Error('ICANN gTLD lifecycle sanity check failed');return rows;
}
function mergeGtldLifecycle(rows){
 runtimeGtldLifecycle.clear();for(const g of rows)runtimeGtldLifecycle.set('.'+g.gTLD.trim().toLowerCase(),g);
 D.explorerMeta.lifeHistoryGtldContractsLoaded=true;D.explorerMeta.lifeHistoryGtldContractCount=rows.length;
 if(explorerProfileId){const idx=explorerProfileIndex(explorerProfileId);if(idx>=0){const rec=cachedExplorerProfile(D.explorer[idx]);if(rec)renderExplorerRecord(rec)}}
}
function initGtldLifecycle(){D.explorerMeta.lifeHistoryGtldContractsLoaded=false;D.explorerMeta.lifeHistoryGtldContractsRuntime=false}
function renderPublicationUpdates(){
 const dates=document.getElementById('updateDates');if(dates)dates.innerHTML=[['updatesRelease','v'+PUB.version+' · '+fmtDate(PUB.releasedOn)],['updatesResearch',fmtDate(PUB.asOf)],['updatesIana',fmtDate(D.explorerMeta.ianaSnapshot)]].map(([key,value])=>`<dt>${esc(t(key))}</dt><dd>${esc(value)}</dd>`).join('');
 const list=document.getElementById('releaseHistory');if(list)list.innerHTML=(D.releaseHistory?.releases||[]).map(r=>`<li><b>v${esc(r.version)}</b><time datetime="${esc(r.date)}">${esc(fmtDate(r.date))}</time><p>${esc(t(r.summaryKey))}</p></li>`).join('');
 const stamp=document.getElementById('publicationUpdateStamp');if(stamp)stamp.innerHTML=`<a href="?tab=sources#publication-updates" data-open-section="sources" data-open-anchor="publication-updates">v${esc(PUB.version)} · ${esc(fmtDate(PUB.releasedOn))}</a>`;
}
function renderAll(){renderInternetJourney();renderPublicationUpdates();renderCards();renderTypeStats();renderTimeline();render2000();renderProcess();renderNamespaceDimensions();renderDomainLifecycle();renderControlLevers();renderDnsCapabilities();renderTldModels();renderSuccessFramework();renderExplorerOptions();renderExplorer();renderStrange();renderSemanticDrift();renderDnsOddities();renderPress();renderLists();renderBeyond();renderGeoMap();renderGeoBars();renderLugano();renderRound2026();renderRoundBars();renderContentionBars();renderDisputes();renderEconomics();renderSocial();populateMobileNav();renderSectionTocs();syncFeedbackLinks()}
function closeNavMenus(except=null){document.querySelectorAll('.navMenu.open').forEach(m=>{if(m===except)return;m.classList.remove('open');const tr=m.querySelector('.navMenuTrigger');if(tr)tr.setAttribute('aria-expanded','false')})}
function toggleNavMenu(menu){const willOpen=!menu.classList.contains('open');closeNavMenus(menu);menu.classList.toggle('open',willOpen);const tr=menu.querySelector('.navMenuTrigger');if(tr)tr.setAttribute('aria-expanded',willOpen?'true':'false')}
function activateTab(id,userInitiated=false,historyMode='replace',scrollSection=true){if(!document.getElementById(id))id='overview';const previousTab=activeTab;if(previousTab!==id&&(previousTab==='overview'||id==='overview'))setJourneyStep(0,false);if(id!=='explore')closeExplorerDrawer({historyMode:'none',restoreFocus:false});activeTab=id;document.body.dataset.activeTab=id;document.querySelectorAll('.tab').forEach(x=>{x.classList.toggle('active',x.dataset.target===id);if(x.dataset.target===id)x.setAttribute('aria-current','location');else x.removeAttribute('aria-current')});document.querySelectorAll('.navMenu').forEach(g=>g.classList.toggle('active',!!g.querySelector('.tab.active')));document.querySelectorAll('.section').forEach(x=>x.classList.toggle('active',x.id===id));closeNavMenus();const mn=document.getElementById('mobileNav');if(mn)mn.value=id;if(historyMode!=='none')setQuery(userInitiated?'push':historyMode);if(userInitiated){const heading=document.querySelector('#'+id+' h1, #'+id+' h2');focusNavigationTarget(heading);if(scrollSection)scrollToNavigationTarget(document.getElementById(id),true)}}
function populateMobileNav(){const mn=document.getElementById('mobileNav');if(!mn)return;let html='';document.querySelectorAll('.nav > .tab').forEach(b=>html+=`<option value="${b.dataset.target}">${b.textContent.trim()}</option>`);document.querySelectorAll('.navMenu').forEach(g=>{html+=`<optgroup label="${esc(t(g.dataset.labelKey))}">`;g.querySelectorAll('.tab').forEach(b=>html+=`<option value="${b.dataset.target}">${b.textContent.trim()}</option>`);html+='</optgroup>'});mn.innerHTML=html;mn.value=activeTab}
document.addEventListener('click',e=>{
 const a=e.target.closest?.('[data-open-section]');if(!a)return;
 if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||(typeof e.button==='number'&&e.button!==0))return;e.preventDefault();
 const sectionId=a.dataset.openSection,target=document.getElementById(a.dataset.openAnchor||'');
 activateTab(sectionId,true,'replace',!target);
 if(target&&target.closest('.section')?.id===sectionId){const url=new URL(location.href);url.searchParams.set('tab',sectionId);url.hash=target.id;history.replaceState({tab:activeTab},'',url);syncLanguageLinks();syncSectionLinks();syncFeedbackLinks();focusNavigationTarget(target);scrollToNavigationTarget(target,true)}
});
 document.getElementById('journeyNext')?.addEventListener('click',()=>setJourneyStep(journeyStep+1,true));
 document.getElementById('journeyBack')?.addEventListener('click',()=>setJourneyStep(journeyStep-1,true));
 document.getElementById('journeyRestart')?.addEventListener('click',()=>{document.querySelectorAll('#journeySteps details').forEach(d=>d.open=false);setJourneyStep(0,true)});
document.querySelectorAll('.tab').forEach(b=>b.addEventListener('click',e=>{if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||e.button!==0)return;e.preventDefault();activateTab(b.dataset.target,true)}));
document.querySelectorAll('.navMenuTrigger').forEach(btn=>btn.addEventListener('click',e=>{e.stopPropagation();toggleNavMenu(btn.closest('.navMenu'))}));
document.querySelectorAll('.navDropdown').forEach(d=>d.addEventListener('click',e=>e.stopPropagation()));
document.addEventListener('click',()=>closeNavMenus());
document.querySelectorAll('.mapToggle').forEach(b=>b.addEventListener('click',()=>{geoMode=b.dataset.mapmode;renderGeoMap()}));
document.getElementById('mobileNav')?.addEventListener('change',e=>activateTab(e.target.value,true));
document.getElementById('langSelect')?.addEventListener('change',e=>{const next=e.target.value;if(validLang.includes(next)&&next!==lang){setQuery();storageSet('dotLangChoice',next);location.assign(languageUrl(next))}});
document.addEventListener('click',e=>{const link=e.target.closest?.('[data-language]');const next=link?.dataset?.language;if(validLang.includes(next))storageSet('dotLangChoice',next)});
document.getElementById('themeBtn')?.addEventListener('click',()=>{theme=theme==='dark'?'light':'dark';applyTheme()});
['explorerSearch','exploreRoundFilter','exploreStatusFilter','exploreTypeFilter','exploreThemeFilter','exploreCountryFilter'].forEach(id=>document.getElementById(id)?.addEventListener(id==='explorerSearch'?'input':'change',()=>renderExplorer(true)));
document.getElementById('explorerLoadMore')?.addEventListener('click',()=>{explorerLimit+=50;renderExplorer(false)});
document.getElementById('resetExplorer')?.addEventListener('click',resetExplorer);
document.querySelectorAll('.presetChip').forEach(b=>b.addEventListener('click',()=>setExplorerPreset(b.dataset.preset)));
document.getElementById('exploreFromStrange')?.addEventListener('click',()=>{setExplorerPreset('strange');activateTab('explore',true)});
document.getElementById('drawerClose')?.addEventListener('click',closeExplorerDrawer);
document.querySelector('.explorerDrawerBackdrop')?.addEventListener('click',closeExplorerDrawer);
document.addEventListener('keydown',e=>{const drawer=document.getElementById('explorerDrawer');if(e.key==='Escape'){closeExplorerDrawer();closeNavMenus();}if(e.key==='Tab'&&drawer?.classList.contains('open')){const f=[...drawer.querySelectorAll('button,a,summary,[tabindex]:not([tabindex="-1"])')].filter(x=>!x.disabled&&x.offsetParent!==null);if(!f.length)return;const first=f[0],last=f[f.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
document.getElementById('shareBtn')?.addEventListener('click',async()=>{setQuery();const url=location.href;try{if(navigator.share){await navigator.share({title:document.title,url});return}await navigator.clipboard.writeText(url);const x=document.querySelector('#shareBtn .shareText'),old=x.textContent;x.textContent=t('copied');setTimeout(()=>x.textContent=t('copyLink'),1200)}catch(e){if(e?.name!=='AbortError')prompt(t('copyLink'),url)}});
document.querySelector('.brand')?.addEventListener('click',e=>{if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||(typeof e.button==='number'&&e.button!==0))return;e.preventDefault();activateTab('overview',true,'replace',false);focusNavigationTarget(document.querySelector('.siteTitle'));scrollToDocumentTop(true)});
window.addEventListener('popstate',restoreUrlState);
window.addEventListener('hashchange',restoreUrlState);
window.addEventListener('resize',syncTopbarHeight);
document.documentElement.dataset.theme=theme;applyLanguage();restoreUrlState();applyTheme();restoringState=false;setQuery();initApplicationArchaeology();initGtldLifecycle();

document.documentElement.classList.remove('no-js');document.documentElement.classList.add('js');
