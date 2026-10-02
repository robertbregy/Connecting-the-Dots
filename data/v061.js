/* v0.6.1: namespace explorer */
(function(){
const D=window.DOT_DATA;
const map=new Map();
function clean(s){return String(s||'').trim().toLowerCase()}
function add(r){
  if(!r||!r.string)return;
  let s=String(r.string).trim(); if(!s.startsWith('.'))s='.'+s;
  const k=clean(s);
  const prev=map.get(k)||{string:s,round:'',status:'',type:'',entity:'',group:'',geography:'',themes:[],contentionCount:null,strange:false,city:false,source:[],noteKey:null,readingKey:null,placeholder:false};
  const next=Object.assign({},prev,r,{string:s});
  next.themes=[...new Set([...(prev.themes||[]),...(r.themes||[])])];
  next.source=[...new Set([...(prev.source||[]),...((r.source||r.sources||[]))])];
  next.strange=Boolean(prev.strange||r.strange); next.city=Boolean(prev.city||r.city);
  next.contentionCount=(r.contentionCount!==undefined&&r.contentionCount!==null)?r.contentionCount:prev.contentionCount;
  map.set(k,next);
}
const IANA='https://www.iana.org/domains/root/db';
const ICANN2012='https://newgtlds.icann.org/en/program-status/statistics';
const legacy=[
 ['.arpa','legacy','delegated','infrastructure','IANA / PTI','United States',['infrastructure','trust']],
 ['.com','legacy','delegated','generic','Verisign','United States',['business']],
 ['.net','legacy','delegated','generic','Verisign','United States',['technology']],
 ['.org','legacy','delegated','generic','','',['community']],
 ['.edu','legacy','delegated','sponsored','','United States',['education']],
 ['.gov','legacy','delegated','sponsored','CISA','United States',['government','trust']],
 ['.mil','legacy','delegated','sponsored','','United States',['government']],
 ['.int','legacy','delegated','sponsored','IANA / PTI','','publicInfrastructure']
];
legacy.forEach(x=>add({string:x[0],round:x[1],status:x[2],type:x[3],entity:x[4],geography:x[5],themes:Array.isArray(x[6])?x[6]:[x[6]],source:[IANA]}));
(D.strange||[]).forEach(r=>add({string:r.string,round:String(r.round),status:r.status,type:'application',themes:[r.category],strange:true,source:r.sources,noteKey:r.noteKey,readingKey:r.insightKey}));
(D.curated2000||[]).forEach(r=>add({string:r.string,round:'2000',status:r.statusKey,type:r.themeKey==='city'?'geographic':'application',themes:[r.themeKey],city:r.themeKey==='city',source:['https://archive.icann.org/en/tlds/']}));
[
 ['.asia','DotAsia Organisation Limited','Hong Kong, China','delegated','sponsored'],['.cat','Fundació puntCAT','Spain / Catalan-speaking community','delegated','sponsored'],['.jobs','Society for Human Resource Management','United States','delegated','sponsored'],['.mail','Anti-Spam Community Registry','United Kingdom','notDelegated','sponsored'],['.mobi','Mobi JV','Finland','delegated','sponsored'],['.post','Universal Postal Union','Switzerland','delegated','sponsored'],['.tel','Telnic Limited','United Kingdom','delegated','sponsored'],['.travel','The Travel Partnership Corporation','United States','delegated','sponsored'],['.xxx','ICM Registry','Canada / United States','delegated','sponsored']
].forEach(x=>add({string:x[0],round:'2004',entity:x[1],geography:x[2],status:x[3],type:x[4],themes:[],source:['https://www.icann.org/en/announcements/details/icann-progress-in-process-for-introducing-new-sponsored-top-level-domains-19-3-2004-en']}));
(D.contention2012||[]).forEach(([s,n])=>add({string:s,round:'2012',status:'application',type:'generic',themes:[],contentionCount:n,source:[ICANN2012]}));
(D.geoExamples||[]).forEach(g=>add({string:g.name,round:'2012',status:'delegated',type:'geographic',entity:g.place,geography:g.place,themes:['city'],city:true,source:[IANA]}));
(D.beyondCases||[]).forEach(c=>String(c.string).split('/').map(s=>s.trim()).filter(Boolean).forEach(s=>add({string:s,round:s==='.gov'?'legacy':'2012',status:'delegated',type:s==='.gov'?'sponsored':'generic',themes:['trust'],source:[c.source]})));
// Known 2026 Lugano candidacy is included as a publication placeholder until the official Reveal dataset is imported.
add({string:'.lugano',round:'2026',status:'application',type:'geographic',entity:'City of Lugano',group:'City of Lugano',geography:'Switzerland',themes:['city','trust'],city:true,placeholder:true,source:[]});
D.explorer=[...map.values()].sort((a,b)=>a.string.localeCompare(b.string));
D.sources.push(['IANA active TLD list snapshot','https://data.iana.org/TLD/tlds-alpha-by-domain.txt','primary']);
D.explorerMeta={
  seedCount:D.explorer.length,
  ianaRootCount:1437,
  ianaSnapshot:'2026-10-02',
  ianaSource:'https://data.iana.org/TLD/tlds-alpha-by-domain.txt',
  target:'IANA root + 2000/2004/2012/2026 application corpus',
  fullImportReady:false
};
})();
