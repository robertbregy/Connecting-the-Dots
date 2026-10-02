/* v0.6.10: semantic drift of country-code TLDs */
(function(){
const D=window.DOT_DATA;
if(!D) return;
const cases=[
 {string:'.io',formalType:'country-code',formalOrigin:'British Indian Ocean Territory',adoptedAssociation:'input/output; technology & startups',category:'technology',formalKey:'driftIoFormal',adoptedKey:'driftIoAdopted',readingKey:'driftIoReading',sources:['https://www.iana.org/domains/root/db/io.html','https://www.nic.io/']},
 {string:'.ai',formalType:'country-code',formalOrigin:'Anguilla',adoptedAssociation:'artificial intelligence',category:'technology',formalKey:'driftAiFormal',adoptedKey:'driftAiAdopted',readingKey:'driftAiReading',sources:['https://www.iana.org/domains/root/db/ai.html','https://registry.ai/']},
 {string:'.tv',formalType:'country-code',formalOrigin:'Tuvalu',adoptedAssociation:'television, video & creators',category:'media',formalKey:'driftTvFormal',adoptedKey:'driftTvAdopted',readingKey:'driftTvReading',sources:['https://www.iana.org/domains/root/db/tv.html','https://www.turnon.tv/']},
 {string:'.me',formalType:'country-code',formalOrigin:'Montenegro',adoptedAssociation:'personal identity & personal branding',category:'identity',formalKey:'driftMeFormal',adoptedKey:'driftMeAdopted',readingKey:'driftMeReading',sources:['https://www.iana.org/domains/root/db/me.html','https://domain.me/about-me/']},
 {string:'.co',formalType:'country-code',formalOrigin:'Colombia',adoptedAssociation:'company / business',category:'business',formalKey:'driftCoFormal',adoptedKey:'driftCoAdopted',readingKey:'driftCoReading',sources:['https://www.iana.org/domains/root/db/co.html','https://www.iana.org/reports/2009/co-report-24nov2009.html']},
 {string:'.fm',formalType:'country-code',formalOrigin:'Micronesia (Federated States of)',adoptedAssociation:'radio, streaming & audio',category:'media',formalKey:'driftFmFormal',adoptedKey:'driftFmAdopted',readingKey:'driftFmReading',sources:['https://www.iana.org/domains/root/db/fm.html','https://dot.fm/registrar/']}
];
D.semanticDrift=cases;

// Surface these cases in the Explorer without rewriting their formal ccTLD status.
const byString=new Map((D.explorer||[]).map(r=>[String(r.string||'').toLowerCase(),r]));
for(const c of cases){
 const k=c.string.toLowerCase();
 let r=byString.get(k);
 if(!r){
   r={string:c.string,round:'legacy',status:'delegated',type:'country-code',entity:'',group:'',geography:c.formalOrigin,themes:[c.category,'semanticDrift'],contentionCount:null,strange:true,city:false,source:[...c.sources],noteKey:null,readingKey:c.readingKey,placeholder:false,events:[{period:'current',status:'delegated',type:'country-code',entity:'',geography:c.formalOrigin,source:[...c.sources],current:true}]};
   D.explorer.push(r); byString.set(k,r);
 } else {
   r.type='country-code'; r.status='delegated'; r.geography=r.geography||c.formalOrigin; r.strange=true;
   r.themes=[...new Set([...(r.themes||[]),c.category,'semanticDrift'])];
   r.source=[...new Set([...(r.source||[]),...c.sources])];
   r.readingKey=r.readingKey||c.readingKey;
   if(!Array.isArray(r.events)||!r.events.length) r.events=[{period:'current',status:'delegated',type:'country-code',entity:'',geography:c.formalOrigin,source:[...c.sources],current:true}];
 }
}
D.explorer.sort((a,b)=>String(a.string).localeCompare(String(b.string)));
if(D.explorerMeta) D.explorerMeta.seedCount=D.explorer.length;

function addSource(label,url){if(!(D.sources||[]).some(s=>s&&s[1]===url))D.sources.push([label,url,'primary'])}
addSource('IANA — .io delegation record','https://www.iana.org/domains/root/db/io.html');
addSource('NIC.IO — .io meaning and technology positioning','https://www.nic.io/');
addSource('IANA — .ai delegation record','https://www.iana.org/domains/root/db/ai.html');
addSource('Registry.ai — .AI as a domain of artificial intelligence','https://registry.ai/');
addSource('IANA — .tv delegation record','https://www.iana.org/domains/root/db/tv.html');
addSource('.TV Registry — creator and video positioning','https://www.turnon.tv/');
addSource('IANA — .me delegation record','https://www.iana.org/domains/root/db/me.html');
addSource('.ME Registry — global personal-domain positioning','https://domain.me/about-me/');
addSource('IANA — .co delegation record','https://www.iana.org/domains/root/db/co.html');
addSource('IANA — 2009 .CO redelegation report','https://www.iana.org/reports/2009/co-report-24nov2009.html');
addSource('IANA — .fm delegation record','https://www.iana.org/domains/root/db/fm.html');
addSource('dotFM Registry — media-industry positioning','https://dot.fm/registrar/');
D.semanticDriftVersion='0.6.10';
})();
