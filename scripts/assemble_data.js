/* Canonical assembly: dated root membership, current registry details and curated history. */
const fs=require('fs'),path=require('path'),crypto=require('crypto'),zlib=require('zlib');
const {domainToASCII,domainToUnicode}=require('node:url');
const {parseHTML}=require('linkedom');
const root=path.resolve(__dirname,'..');
const json=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const digest=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const ascii=string=>'.'+domainToASCII(string.replace(/^\./,'')).toLowerCase();
const eventOrder=e=>{const m=String(e.period).match(/^\d{4}(?:-\d{2}){0,2}/);return e.current?'99999999':m?m[0].replace(/-/g,'').padEnd(8,'0'):'00000000'};

module.exports=function assembleData(){
 const D=json('data/research.json'),S=json('data/iana_snapshot.json'),curated=json('data/explorer_curated.json');
 if(curated.schemaVersion!==1)throw new Error('Unsupported curated record schema');
 const bytes=fs.readFileSync(path.join(root,S.archive_path));
 if(digest(bytes)!==S.archive_sha256)throw new Error('IANA evidence archive checksum mismatch');
 const evidence=JSON.parse(zlib.gunzipSync(bytes));
 function source(name){const file='data/evidence/iana/'+name;const bytes=Buffer.from(evidence.files[file]||'','base64');if(digest(bytes)!==S.files.find(f=>f.path===file)?.sha256)throw new Error('IANA source checksum mismatch: '+file);return bytes.toString('utf8')}
 const labels=source('tlds-alpha-by-domain.txt').split(/\r?\n/).map(s=>s.trim()).filter(s=>s&&!s.startsWith('#')).map(s=>s.toLowerCase());
 if(new Set(labels).size!==labels.length||labels.length!==S.rootListCount)throw new Error('Root list count mismatch');
 const {document}=parseHTML(source('root-db.html')),rootRows=new Map();
 for(const row of document.querySelectorAll('#tld-table tbody tr')){
  const cells=row.querySelectorAll('td'),link=cells[0]?.querySelector('a');if(!link)continue;
  const href=link.getAttribute('href'),label=href.split('/').pop().replace(/\.html$/,'');
  if(rootRows.has(label))throw new Error('Duplicate IANA label: '+label);
  rootRows.set(label,{formalType:cells[1].textContent.trim(),registryEntity:cells[2].textContent.trim(),source:new URL(href,'https://www.iana.org').href});
 }
 const byAscii=new Map(),rootSet=new Set(labels.map(s=>'.'+s));
 for(const label of labels){
  const facts=rootRows.get(label);if(!facts)throw new Error('Root list label missing from database: '+label);
  const reserved=facts.registryEntity==='Reserved Domain - IANA';
  if(facts.registryEntity==='Not assigned')throw new Error('Listed root label has no assigned manager: '+label);
  const r={string:'.'+domainToUnicode(label),asciiString:'.'+label,recordLevel:'basic',rootListed:true,currentRootStatus:reserved?'reserved':'delegated',currentAsOf:S.asOf,status:reserved?'reserved':'delegated',type:facts.formalType,formalType:facts.formalType,registryEntity:reserved?'':facts.registryEntity,entity:reserved?'':facts.registryEntity,source:[facts.source,S.listSource]};
  byAscii.set(r.asciiString,r);
 }
 const seen=new Set();
 for(const item of curated.records){
  const key=ascii(item.string);if(seen.has(key))throw new Error('Duplicate curated record: '+key);seen.add(key);
  const base=byAscii.get(key),current=S.records[item.string],r={...item,...(base||{})};
  r.string=item.string;r.asciiString=key;r.recordLevel='curated';r.rootListed=rootSet.has(key);
  r.currentAsOf=S.asOf;r.currentRootStatus=base?.currentRootStatus||item.historicalRootStatus||'notDelegated';
  if(item.historicalRootStatus==='retired'&&!r.rootListed)r.currentRootStatus='retired';
  r.formalType=current?.formalType||base?.formalType||item.historicalFormalType||'notApplicable';r.type=r.formalType;
  r.status=r.currentRootStatus==='delegated'?'delegated':item.historicalStatus;
  r.registryEntity=current?(current.currentRootStatus==='reserved'||current.registryEntity==='Not assigned'?'':current.registryEntity):(base?.registryEntity||'');
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
 D.explorer=[...byAscii.values()].sort((a,b)=>a.asciiString.localeCompare(b.asciiString,'en'));
 D.explorerMeta={seedCount:curated.records.length,curatedCount:curated.records.length,recordCount:D.explorer.length,ianaRootCount:labels.length,rootIndexedCount:D.explorer.filter(r=>r.rootListed).length,ianaSnapshot:S.asOf,ianaSource:S.listSource,rootCoverageComplete:true,historicalCoverageComplete:false,application2026CoverageComplete:false};
 D.normalizationVersion=json('package.json').version;
 return D;
};
