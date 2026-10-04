/* v0.7.5: current IANA state is independent of historical applications and operators. */
(function(){
const D=window.DOT_DATA,S=window.DOT_IANA_SNAPSHOT;
if(!D||!S)throw new Error('Missing curated IANA snapshot');
const fixUrl=u=>String(u).replace('https://46-8.dc.icann.org/reports/','https://www.iana.org/reports/');
function normalize(value){if(typeof value==='string')return fixUrl(value);if(Array.isArray(value))return value.map(normalize);if(value&&typeof value==='object')for(const k of Object.keys(value))value[k]=normalize(value[k]);return value;}
normalize(D);
const round2004Source='https://www.icann.org/en/announcements/details/icann-progress-in-process-for-introducing-new-sponsored-top-level-domains-19-3-2004-en';
const originEvidence={
 '.post':{round:'2004',source:'https://www.iana.org/reports/2012/post-report-20120802.html'},
 '.health':{round:'2012',source:'https://gtldresult.icann.org/applicationstatus/applicationdetails/495',entity:'DotHealth, LLC',geography:'United States'},
 '.kids':{round:'2012',source:'https://gtldresult.icann.org/applicationstatus/applicationdetails/161',entity:'DotKids Foundation Limited',geography:'Hong Kong'},
 '.sucks':{round:'2012'}
};
const orgTransition='https://www.icann.org/en/announcements/details/advisory-concerning-org-transition-7-1-2003-en';
const healthTransfer='https://www.iana.org/reports/tld-transfer/20230626-health';
function eventOrder(e){const date=String(e.period).match(/^\d{4}(?:-\d{2}){0,2}/);return e.current?'9999':date?date[0].replace(/-/g,'').padEnd(8,'0'):'0000';}
for(const r of D.explorer){
 const oldType=r.type,oldStatus=r.status;const current=S.records[r.string];
 // A current root record cannot establish who operated a TLD in an earlier year.
 r.events=(r.events||[]).filter(e=>{
  if(!current||e.status!=='delegated')return true;
  if(e.period==='legacy'||e.period==='current')return false;
  if(/→ current$/.test(e.period)&&!(e.source||[]).some(u=>u.includes('/reports/')))return false;
  // Earlier catalogues used the application round as a delegation date.
  return !(e.period==='2012'&&String(r.round)==='2012');
 }).map(e=>{
  e.current=false;
  if(e.status==='delegated'&&e.period==='2004'&&(e.source||[]).includes(round2004Source))e.status='application';
  if(e.entity===e.geography||e.status==='idea')e.entity='';
  if(current&&e.status==='delegated'&&(e.source||[]).every(u=>u.includes('/domains/root/db'))){e.entity='';}
  e.period=String(e.period).replace(/ → current$/,'');
  return e;
 });
 const origin=originEvidence[r.string];
 if(origin?.entity){
  r.events.push({period:origin.round,status:'application',type:'application',entity:origin.entity,geography:origin.geography,source:[origin.source],current:false});
 }
 if(r.string==='.org')r.events.push({period:'2003-01-01',status:'registryTransition',type:'',entity:'Public Interest Registry (PIR)',geography:'',source:[orgTransition],current:false});
 if(r.string==='.health')r.events.push({period:'2023-06-26',status:'registryTransferReport',type:'',entity:'Registry Services, LLC',geography:'United States',source:[healthTransfer],current:false});
 r.historicalRounds=[...new Set([String(r.round),...(r.events||[]).filter(e=>['application','evaluated','selected','returned','proposed','withdrawn'].includes(e.status)).map(e=>String(e.period))].filter(p=>['legacy','2000','2004','2012','2026'].includes(p)))].sort();
 r.editorialDesignation=['geographic','brand','community'].includes(oldType)?oldType:'';
 r.representedPlace=r.geography||'';
 r.applicationEntity=current?'':(r.entity||'');r.registryEntity='';r.registryCountry='';r.technicalContactOrganization='';r.technicalContactCountry='';r.currentAsOf=S.asOf;
 r.formalType=current?current.formalType:oldType==='country-code'?'country-code':'notApplicable';r.type=r.formalType;
 r.currentRootStatus=current?current.currentRootStatus:oldStatus==='retired'?'retired':'notDelegated';
 if(oldStatus==='retired')r.currentRootStatus='retired';
 r.originRound='';r.originRoundSources=origin?.source?[origin.source]:[];r.contentionYear=r.contentionCount?2012:null;
 if(current){
  r.source=[...new Set([current.source,...(r.source||[])])];
  r.registryEntity=current.currentRootStatus==='reserved'||current.registryEntity==='Not assigned'?'':current.registryEntity;
  r.registryCountry=current.registryCountry;r.technicalContactOrganization=current.technicalContactOrganization;r.technicalContactCountry=current.technicalContactCountry;r.registrationDate=current.registrationDate;
  r.entity=r.registryEntity;r.group='';
  if(r.currentRootStatus==='delegated'){
   r.status='delegated';
   // Explicit curated application round; never inferred from registration year.
   r.originRound=origin?.round||String(r.round);
   if(!['legacy','2000','2004','2012'].includes(r.originRound))throw new Error('Undocumented origin round: '+r.string);
   const events=r.events||(r.events=[]);events.forEach(e=>e.current=false);
   if(!events.some(e=>e.status==='ianaRegistration'&&e.period===current.registrationDate))events.push({period:current.registrationDate,status:'ianaRegistration',type:'',entity:'',geography:'',source:[current.source],current:false});
   events.push({period:S.asOf,status:'delegated',type:r.formalType,entity:r.registryEntity,geography:r.registryCountry,source:[current.source],current:true});
  }
 }
 if(r.string==='.lugano'){
  // Public stewardship does not identify the legal applicant before Reveal Day.
  r.entity='';r.group='';r.applicationEntity='';r.representedPlace='Lugano, Switzerland';r.provenanceKey='applicantDisclosure';
  for(const e of r.events||[]){e.entity='';e.current=false;}
 }
 r.events.sort((a,b)=>eventOrder(a).localeCompare(eventOrder(b)));
 r.source=[...new Set([...(r.source||[]),...r.originRoundSources,...r.events.flatMap(e=>e.source||[])])];
}
const cs=D.explorer.find(r=>r.string==='.cs');
const csSource='https://www.icann.org/en/board-activities-and-meetings/materials/preliminary-report-special-meeting-of-the-board-13-10-2003-en';
const meSource='https://www.iana.org/reports/2007/me-report-11sep2007.html';
if(cs){cs.status='retired';cs.currentRootStatus='retired';cs.representedPlace='Czechoslovakia; Serbia and Montenegro (code reassignment)';cs.geography=cs.representedPlace;cs.noteKey='oddCsFact';cs.readingKey='oddCsReading';cs.source=[csSource,meSource];cs.events=[{period:'Czechoslovakia',status:'retired',type:'country-code',entity:'',geography:'Czechoslovakia',source:[csSource],current:false},{period:'2003–2006',status:'notDelegated',type:'country-code',entity:'',geography:'Serbia and Montenegro',source:[meSource],current:false}];}
for(const g of D.dnsOddities||[])for(const c of g.cases||[])if(c.string==='.cs'){c.sources=[csSource,meSource];c.status='retired';}
const timelineSources={1999:'https://newgtlds.icann.org/en/announcements-and-media/case-studies/berlin-a4-13feb19-en.pdf',2000:'https://archive.icann.org/en/tlds/app-index.htm',2004:'https://www.icann.org/en/announcements/details/icann-progress-in-process-for-introducing-new-sponsored-top-level-domains-19-3-2004-en',2012:'https://newgtlds.icann.org/en/program-status/statistics/applications-overview-13jun12-en.pdf',2014:'https://newgtlds.icann.org/en/announcements-and-media/case-studies/berlin-a4-13feb19-en.pdf',2026:D.metricSources['2026']};
for(const e of D.timeline)if(timelineSources[e.year])e.sources=[timelineSources[e.year]];
for(const f of D.pressFacts)if(/^\d[\d,]*$/.test(f.num))f.num=Number(f.num.replace(/,/g,''));
D.explorerMeta.ianaRootCount=S.rootListCount;D.explorerMeta.ianaSnapshot=S.asOf;
D.sources.push(['ICANN — .CS formerly used for Czechoslovakia',csSource,'primary']);
for(const [label,url] of [['ICANN — .ORG registry transition (2003)',orgTransition],['IANA — .HEALTH transfer report (2023)',healthTransfer],['ICANN — DotHealth application (2012)',originEvidence['.health'].source],['ICANN — DotKids application (2012)',originEvidence['.kids'].source]])D.sources.push([label,url,'primary']);
D.sources=[...new Map(D.sources.map(s=>[s[1],s])).values()];
D.normalizationVersion='0.7.5';
})();
