/* Canonical assembly: dated root membership, current registry details and curated history. */
const fs=require('fs'),path=require('path'),crypto=require('crypto'),zlib=require('zlib');
const {domainToASCII,domainToUnicode}=require('node:url');
const root=path.resolve(__dirname,'..');
const json=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const digest=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const ascii=string=>'.'+domainToASCII(string.replace(/^\./,'')).toLowerCase();
const eventOrder=e=>{const m=String(e.period).match(/^\d{4}(?:-\d{2}){0,2}/);return e.current?'99999999':m?m[0].replace(/-/g,'').padEnd(8,'0'):'00000000'};
const GTLD_LIFECYCLE_SOURCE='https://www.icann.org/resources/registries/gtlds/v2/gtlds.json';
function classifyIanaReport(title='',asciiString=''){
 const x=String(title).toLowerCase(),label=String(asciiString).toLowerCase().replace(/^\./,'').replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 if(/revocation|revoked/.test(x))return 'ianaRevocationReport';
 if(/redelegation|re-delegation|transfer/.test(x))return 'ianaTransferReport';
 if(/retirement|retired|removal|deletion/.test(x))return 'ianaRetirementReport';
 if(label&&new RegExp('delegation of (?:the )?\\.'+label+'(?:\\s|$)','i').test(x))return 'ianaDelegationReport';
 if(/delegation/.test(x))return 'ianaReportEvent';
 return 'ianaReportEvent';
}
function pushEvent(record,event){
 if(!event||!event.period||!event.status)return;
 record.events=record.events||[];
 const urls=[...(event.source||[])].filter(Boolean);
 const key=[event.period,event.status,event.entity||'',event.detail||'',urls.join('|')].join('::');
 if(record.events.some(e=>[e.period,e.status,e.entity||'',e.detail||'',(e.source||[]).join('|')].join('::')===key))return;
 record.events.push({...event,source:urls,current:!!event.current});
}

// Universal Explorer: "program round" and "introduction path" are deliberately
// separate. A ccTLD does not become a "legacy round" merely because it predates
// ICANN, and an application-only string is not silently promoted to a TLD.
const INTRO_SOURCES={
 cc:'https://www.iana.org/help/cctld-delegation-answers',
 ccRetirement:'https://www.iana.org/help/cctld-retirement',
 idnCc:'https://www.icann.org/resources/pages/string-evaluation-completion-2014-02-19-en',
 legacy:'https://archive.icann.org/en/tlds/',
 round2000:'https://www.icann.org/en/announcements/details/icann-announces-selections-for-new-top-level-domains-16-11-2000-en',
 round2004:'https://www.icann.org/en/announcements/details/icann-progress-in-process-for-introducing-new-sponsored-top-level-domains-19-3-2004-en',
 round2012:'https://newgtlds.icann.org/en/program-status/statistics',
 round2026:'https://newgtldprogram-2026-agb.icann.org/en',
 test:'https://www.iana.org/domains/root/db',
 infrastructure:'https://www.iana.org/domains/arpa'
};
const ROUND2000=new Set(['.aero','.biz','.coop','.info','.museum','.name','.pro']);
const ROUND2004=new Set(['.asia','.cat','.jobs','.mobi','.post','.tel','.travel','.xxx']);
const LEGACY_GTLD=new Set(['.com','.edu','.gov','.int','.mil','.net','.org']);
function intro(programRound,introductionPath,introductionBasis,sources){return {programRound,introductionPath,introductionBasis,introductionPathSources:[...new Set(sources.filter(Boolean))]}}
function introductionFor(r){
 const explicit=String(r.originRound||r.round||'');
 if(explicit==='2000')return intro('2000','intro2000','basisDirect',[...(r.originRoundSources||[]),...((r.source)||[]),INTRO_SOURCES.round2000]);
 if(explicit==='2004')return intro('2004','intro2004','basisDirect',[...(r.originRoundSources||[]),...((r.source)||[]),INTRO_SOURCES.round2004]);
 if(explicit==='2012')return intro('2012','intro2012','basisDirect',[...(r.originRoundSources||[]),...((r.source)||[]),INTRO_SOURCES.round2012]);
 if(explicit==='2026')return intro('2026','intro2026Application','basisDirect',[...((r.source)||[]),INTRO_SOURCES.round2026]);
 if(r.formalType==='country-code'){
  if(r.currentRootStatus==='retired'||(!r.ianaProfile&&r.recordLevel==='curated'))return intro('','introHistoricalCcTld','basisDirect',[...((r.source)||[]),INTRO_SOURCES.ccRetirement]);
  if(r.asciiString?.startsWith('.xn--'))return intro('','introIdnCcTld','basisFormalType',[r.source?.[0],INTRO_SOURCES.idnCc]);
  return intro('','introCcTld','basisFormalType',[r.source?.[0],INTRO_SOURCES.cc]);
 }
 if(r.formalType==='infrastructure'||r.asciiString==='.arpa')return intro('','introInfrastructure','basisFormalType',[r.source?.[0],INTRO_SOURCES.infrastructure]);
 if(r.formalType==='test')return intro('','introTest','basisFormalType',[r.source?.[0],INTRO_SOURCES.test]);
 if(ROUND2000.has(r.asciiString))return intro('2000','intro2000','basisDocumentedSet',[r.source?.[0],INTRO_SOURCES.round2000]);
 if(ROUND2004.has(r.asciiString))return intro('2004','intro2004','basisDocumentedSet',[r.source?.[0],INTRO_SOURCES.round2004]);
 if(LEGACY_GTLD.has(r.asciiString))return intro('legacy','introLegacyGtld','basisDocumentedSet',[r.source?.[0],INTRO_SOURCES.legacy]);
 if(r.ianaProfile&&['generic','generic-restricted','sponsored'].includes(r.formalType)){
  // The pre-2012 generic/sponsored families are exhausted by the explicit
  // legacy, 2000 and 2004 sets above. Everything else in IANA's generic
  // corpus descends from the 2012 New gTLD Program, even when delegation
  // happened much later and the current IANA profile omits a date.
  return intro('2012','intro2012','basisDerivedEra',[r.source?.[0],INTRO_SOURCES.round2012]);
 }
 if(!r.ianaProfile&&r.recordLevel==='curated'&&r.currentRootStatus==='retired')return intro('','introHistoricalTld','basisDirect',r.source||[]);
 if(!r.ianaProfile&&r.recordLevel==='curated')return intro(explicit==='legacy'?'legacy':'','introApplicationOnly','basisDirect',r.source||[]);
 return intro('','introUnknown','basisFormalType',r.source||[]);
}

module.exports=function assembleData(){
 const D=json('data/research.json'),S=json('data/iana_snapshot.json'),curated=json('data/explorer_curated.json'),archaeology=json('data/application_archaeology_local.json'),archaeologyManifest=json('data/application_archaeology_manifest.json'),governance=json('data/governance_cases.json');
 if(curated.schemaVersion!==1)throw new Error('Unsupported curated record schema');
 const bytes=fs.readFileSync(path.join(root,S.archive_path));
 if(digest(bytes)!==S.archive_sha256)throw new Error('IANA evidence archive checksum mismatch');
 const evidence=JSON.parse(zlib.gunzipSync(bytes));
 function source(name){const file='data/evidence/iana/'+name;const bytes=Buffer.from(evidence.files[file]||'','base64');if(digest(bytes)!==S.files.find(f=>f.path===file)?.sha256)throw new Error('IANA source checksum mismatch: '+file);return bytes.toString('utf8')}
 const labels=source('tlds-alpha-by-domain.txt').split(/\r?\n/).map(s=>s.trim()).filter(s=>s&&!s.startsWith('#')).map(s=>s.toLowerCase());
 if(new Set(labels).size!==labels.length||labels.length!==S.rootListCount)throw new Error('Root list count mismatch');
 const rootRows=new Map();
 for(const current of Object.values(S.records)){
  const label=current.asciiString.slice(1);
  if(rootRows.has(label))throw new Error('Duplicate IANA label: '+label);
  rootRows.set(label,{formalType:current.formalType,registryEntity:current.registryEntity,source:current.source});
 }
 // root-db.html is still preserved byte-for-byte in the evidence archive. The
 // normalized snapshot is authoritative for assembly and its archive checksum
 // above guarantees the captured evidence package has not drifted.
 source('root-db.html');
 if(S.schemaVersion!==2||rootRows.size!==S.databaseCount||Object.keys(S.records).length!==rootRows.size)throw new Error('Incomplete individual IANA profiles; run fetch_iana.py and normalize_iana.js');
 const byAscii=new Map(),rootSet=new Set(labels.map(s=>'.'+s));
 for(const [label,facts] of rootRows){
  const string='.'+domainToUnicode(label),current=S.records[string];
  if(!current||current.asciiString!=='.'+label)throw new Error('Missing IANA profile: '+label);
  const reserved=current.registryEntity==='Reserved Domain - IANA';
  const registryEntity=reserved||current.registryEntity==='Not assigned'?'':current.registryEntity;
  const r={...current,string,recordLevel:'iana',ianaProfile:true,currentAsOf:S.asOf,status:current.currentRootStatus,type:facts.formalType,registryEntity,entity:registryEntity,source:[current.source,S.listSource]};
  if(r.rootListed!==rootSet.has(r.asciiString))throw new Error('Profile membership mismatch: '+label);
  byAscii.set(r.asciiString,r);
 }
 for(const key of rootSet)if(!byAscii.has(key))throw new Error('Root list label missing from database: '+key);
 const seen=new Set();
 for(const item of curated.records){
  const key=ascii(item.string);if(seen.has(key))throw new Error('Duplicate curated record: '+key);seen.add(key);
  const base=byAscii.get(key),current=S.records['.'+domainToUnicode(key.slice(1))],r={...item,...(base||{})};
  r.string=item.string;r.asciiString=key;r.recordLevel='curated';r.rootListed=rootSet.has(key);
  r.currentAsOf=S.asOf;r.currentRootStatus=base?.currentRootStatus||item.historicalRootStatus||'notDelegated';
  if(item.historicalRootStatus==='retired'&&!r.rootListed)r.currentRootStatus='retired';
  r.formalType=current?.formalType||base?.formalType||item.historicalFormalType||'notApplicable';r.type=r.formalType;
  r.status=r.currentRootStatus==='delegated'?'delegated':item.historicalStatus;
  r.registryEntity=current?(current.currentRootStatus==='reserved'||current.registryEntity==='Not assigned'?'':current.registryEntity):(base?.registryEntity||'');
  r.ianaProfile=!!base;
  r.registryCountry=current?.registryCountry||'';r.technicalContactOrganization=current?.technicalContactOrganization||'';r.technicalContactCountry=current?.technicalContactCountry||'';r.registrationDate=current?.registrationDate||'';
  r.entity=r.registryEntity||item.applicationEntity||'';
  r.events=item.events.map(e=>({...e,current:false}));
  if(current&&r.currentRootStatus==='delegated'){
   if(!r.originRound||!['legacy','2000','2004','2012'].includes(r.originRound))throw new Error('Missing curated origin round: '+key);
   if(r.registrationDate)r.events.push({period:r.registrationDate,status:'ianaRegistration',type:'',entity:'',geography:'',source:[current.source],current:false});
   r.events.push({period:S.asOf,status:'delegated',type:r.formalType,entity:r.registryEntity,geography:r.registryCountry,source:[current.source],current:true});
  }
  r.events.sort((a,b)=>eventOrder(a).localeCompare(eventOrder(b)));
  r.source=[...new Set([...(current?[current.source]:[]),...(base?.source||[]),...(item.source||[])])];
  delete r.historicalRootStatus;delete r.historicalStatus;
  byAscii.set(key,r);
 }
 // Attach the locally vendored 2000/2004 archaeology. Never-delegated
 // strings become application-only Explorer records; existing TLD records
 // retain their independent IANA/delegation identity.
 if(archaeology.schemaVersion!==1||archaeologyManifest.schemaVersion!==1)throw new Error('Unsupported application archaeology schema');
 for(const app of archaeology.applications){
  const key=ascii(app.string);
  let r=byAscii.get(key);
  if(!r){
   r={string:app.string,asciiString:key,recordLevel:'application',ianaProfile:false,rootListed:false,currentRootStatus:'notDelegated',status:'notDelegated',formalType:'notApplicable',type:'notApplicable',currentAsOf:S.asOf,registryEntity:'',entity:'',registryCountry:'',registryCountryCode:'',source:[],events:[],themes:[],strange:false,city:false,placeholder:false,originRound:String(app.round)};
   byAscii.set(key,r);
  }
  r.applications=r.applications||[];
  r.applications.push(app);
  r.source=[...new Set([...(r.source||[]),app.source].filter(Boolean))];
 }
 for(const r of byAscii.values()){
  if(r.applications?.length){
   r.applications.sort((a,b)=>String(a.round).localeCompare(String(b.round))||String(a.submissionId||a.applicationId).localeCompare(String(b.submissionId||b.applicationId)));
   r.applicationCount=r.applications.length;
   r.applicationRounds=[...new Set(r.applications.map(a=>String(a.round)))];
   r.applicationApplicants=[...new Set(r.applications.map(a=>a.applicant).filter(Boolean))];
   if(!r.ianaProfile&&!r.entity&&r.applicationApplicants.length===1)r.entity=r.applicationApplicants[0];
   if(!r.ianaProfile&&!r.applicationEntity&&r.applicationApplicants.length===1)r.applicationEntity=r.applicationApplicants[0];
  }else{r.applicationCount=0;r.applicationRounds=[];r.applicationApplicants=[]}
  // Life history is a chronology, not a replacement for the application or
  // IANA detail panels. It combines only events supported by the preserved
  // central sources and keeps application identity distinct from delegation.
  r.events=r.events||[];
  for(const app of (r.applications||[]))pushEvent(r,{period:String(app.round),status:'applicationSubmitted',type:r.formalType||'',entity:app.applicant||'',geography:app.location||'',detail:app.applicationId||app.submissionId||'',outcomeKey:String(app.round)==='2000'?'':(app.outcome?('outcome_'+String(app.outcome).replace(/[ -]/g,'_')):''),eventClass:'application',source:[app.source]});
  if(r.ianaProfile&&r.registrationDate&&!r.events.some(e=>e.period===r.registrationDate&&e.status==='ianaRegistration'))pushEvent(r,{period:r.registrationDate,status:'ianaRegistration',type:r.formalType||'',entity:r.registryEntity||'',geography:r.registryCountry||'',eventClass:'iana-registration',source:[r.source?.[0]]});
  for(const report of (r.ianaReports||[]))pushEvent(r,{period:report.date,status:classifyIanaReport(report.title,r.asciiString),type:r.formalType||'',entity:'',geography:'',detail:report.title,eventClass:'iana-report',source:[report.url]});
  if(!r.events.some(e=>e.current))pushEvent(r,{period:S.asOf,status:r.currentRootStatus||r.status,type:r.formalType||'',entity:r.registryEntity||r.entity||'',geography:r.registryCountry||r.geography||'',detail:'',eventClass:'current-snapshot',source:[r.source?.[0]],current:true});
  r.events.sort((a,b)=>eventOrder(a).localeCompare(eventOrder(b))||String(a.status).localeCompare(String(b.status)));
  Object.assign(r,introductionFor(r));
 }
 D.governanceCases=governance;
 if(governance.schemaVersion!==1||!Array.isArray(governance.cases)||governance.cases.length<1)throw new Error('Unsupported governance cases schema');
 const governanceByAscii=new Map();
 for(const c of governance.cases){
  for(const string of (c.strings||[])){
   const key=ascii(string),ids=governanceByAscii.get(key)||[];ids.push(c.id);governanceByAscii.set(key,ids);
  }
  for(const src of (c.sources||[]))if(src?.url&&!D.sources.some(x=>x[1]===src.url))D.sources.push([src.label||('Governance case '+c.id),src.url,src.role||'primary']);
 }
 for(const r of byAscii.values())r.governanceCaseIds=[...new Set(governanceByAscii.get(r.asciiString)||[])];
 D.explorer=[...byAscii.values()].sort((a,b)=>a.asciiString.localeCompare(b.asciiString,'en'));
 const applicationOnly=D.explorer.filter(r=>!r.ianaProfile&&['intro2000','intro2004','intro2012','intro2026Application','introApplicationOnly'].includes(r.introductionPath)).length;
 const historicalExtras=D.explorer.filter(r=>!r.ianaProfile&&r.currentRootStatus==='retired').length;
 D.explorerMeta={seedCount:curated.records.length,curatedCount:curated.records.length,recordCount:D.explorer.length,ianaRootCount:labels.length,rootIndexedCount:D.explorer.filter(r=>r.rootListed).length,ianaDatabaseCount:S.databaseCount,ianaProfileCount:D.explorer.filter(r=>r.ianaProfile).length,tldRecordCount:D.explorer.length-applicationOnly,applicationOnlyCount:applicationOnly,historicalExtraCount:historicalExtras,ianaSnapshot:S.asOf,ianaSource:S.listSource,ianaDatabaseSource:S.databaseSource,rootCoverageComplete:true,ianaProfileCoverageComplete:true,tldCoverageComplete:true,introductionPathCoverageComplete:true,historicalCoverageComplete:true,historicalCoverageExtended:true,tldCoverageDefinition:'Dated IANA database plus historically delegated TLDs absent from the current IANA database; excludes never-delegated ISO codes and application-only strings',applicationCorpusComplete:false,applicationLocalRoundsComplete:true,application2000CoverageComplete:true,application2004CoverageComplete:true,application2012RuntimeValidated:true,application2012CoverageComplete:false,application2026CoverageComplete:false,applicationArchaeologyManifest:archaeologyManifest};
 D.explorerMeta.lifeHistoryRecordCount=D.explorer.filter(r=>(r.events||[]).length>0).length;D.explorerMeta.lifeHistoryStaticEventCount=D.explorer.reduce((n,r)=>n+(r.events||[]).length,0);D.explorerMeta.governanceCaseCount=governance.cases.length;D.explorerMeta.governanceCaseStringCount=new Set(governance.cases.flatMap(c=>c.strings||[]).map(ascii)).size;
 D.applicationArchaeology=archaeologyManifest;
 D.tldLifeHistory={schemaVersion:1,asOf:S.asOf,staticCoverage:'IANA registration dates, IANA delegation/transfer/revocation reports, current root state, curated historical events and vendored 2000/2004 applications',gtldContractSource:GTLD_LIFECYCLE_SOURCE,gtldContractFields:['applicationId','dateOfContractSignature','delegationDate','contractTerminated','removalDate','registryOperator'],ccTldMethod:'IANA registration data and delegation/redelegation reports; ICANN gTLD Registry Agreement data is not applied to ccTLDs',sourcePolicy:'Only dated, attributable events from preserved or live ICANN/IANA sources are rendered as facts'};
 D.explorerMeta.lifeHistoryStaticCoverageComplete=true;D.explorerMeta.lifeHistoryGtldContractsRuntime=true;D.explorerMeta.lifeHistoryGtldContractSource=GTLD_LIFECYCLE_SOURCE;
 D.ianaCountryCodes=Object.fromEntries(Object.values(S.records).flatMap(r=>[['registryCountry','registryCountryCode'],['administrativeContactCountry','administrativeContactCountryCode'],['technicalContactCountry','technicalContactCountryCode']].filter(([name,code])=>r[name]&&r[code]).map(([name,code])=>[r[name],r[code]])));
 D.normalizationVersion=json('package.json').version;
 return D;
};
