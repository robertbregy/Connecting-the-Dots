/* v0.6.8: Explorer event history + provenance corrections */
(function(){
const D=window.DOT_DATA;
if(!D||!Array.isArray(D.explorer)) return;
const byString=new Map(D.explorer.map(r=>[String(r.string||'').toLowerCase(),r]));
const ICANN2000='https://archive.icann.org/en/tlds/';
const ICANN2004='https://www.icann.org/en/announcements/details/icann-progress-in-process-for-introducing-new-sponsored-top-level-domains-19-3-2004-en';
const ICANN2012='https://newgtlds.icann.org/en/program-status/statistics';
const IANA='https://www.iana.org/domains/root/db';
// Snapshot dates for figures that can still change over time.
for(const r of (D.rounds||[])){if(r.round===2012)r.asOf='2026-08-31';if(r.round===2026)r.asOf='2026-09-22'}
if(D.round2026)D.round2026.asOf='2026-09-22';
function uniq(a){return [...new Set((a||[]).filter(Boolean))]}
function event(period,status,type,entity,geography,sources,extra={}){
  return Object.assign({period:String(period),status:status||'',type:type||'',entity:entity||'',geography:geography||'',source:uniq(sources),current:false},extra);
}
function setCurrent(s,patch){const r=byString.get(s);if(r)Object.assign(r,patch)}
function setEvents(s,events){const r=byString.get(s);if(!r)return;r.events=events.map((e,i)=>Object.assign({},e,{current:Boolean(e.current||i===events.length-1)}));}
// Every Explorer record has at least one indexed event. Multi-era strings are expanded below.
for(const r of D.explorer){
  r.events=[event(r.round,r.status,r.type,r.entity,r.geography,r.source,{current:true,provenanceKey:r.provenanceKey||null})];
}

// .berlin: idea predates the 2012 application round; public launch followed in 2014.
setEvents('.berlin',[
  event('1999','idea','geographic','dotBERLIN / Berlin','Berlin',['https://newgtlds.icann.org/en/announcements-and-media/case-studies/berlin-a4-13feb19-en.pdf']),
  event('2012','application','geographic','Berlin','Berlin',[ICANN2012]),
  event('2014','delegated','geographic','Berlin','Berlin',['https://newgtlds.icann.org/en/announcements-and-media/case-studies/berlin-a4-13feb19-en.pdf'],{current:true})
]);

// .nyc: the 2000 proof-of-concept application was withdrawn; a later 2012-round application was delegated in 2014.
setEvents('.nyc',[
  event('2000','withdrawn','geographic','','New York',['https://www.icann.org/en/announcements/details/tld-application-review-update-23-10-2000-en']),
  event('2012','application','geographic','City of New York','New York',[ICANN2012]),
  event('2014','delegated','geographic','City of New York','New York',['https://www.iana.org/domains/root/db/nyc.html'],{current:true})
]);

// .cat and .post belong to the 2004 sponsored round. Later delegation dates must not rewrite their round of origin.
setCurrent('.cat',{round:'2004',status:'delegated',type:'sponsored',entity:'Fundació puntCAT',geography:'Spain / Catalan-speaking community'});
setEvents('.cat',[
  event('2004','application','sponsored','Fundació puntCAT','Spain / Catalan-speaking community',[ICANN2004]),
  event('2005','delegated','sponsored','Fundació puntCAT','Spain / Catalan-speaking community',['https://46-8.dc.icann.org/reports/2005/cat-report-18nov2005.html'],{current:true})
]);
setCurrent('.post',{round:'2004',status:'delegated',type:'sponsored',entity:'Universal Postal Union',geography:'Switzerland'});
setEvents('.post',[
  event('2004','application','sponsored','Universal Postal Union','Switzerland',[ICANN2004]),
  event('2012','delegated','sponsored','Universal Postal Union','Switzerland',['https://www.iana.org/domains/root/db/post.html'],{current:true})
]);

// The 2004 sponsored round contained two .tel proposals with different outcomes.
setEvents('.tel',[
  event('2004','application','sponsored','Telname Limited','United Kingdom',[ICANN2004],{outcomeKey:'notSelected'}),
  event('2004','delegated','sponsored','Telnic Limited','United Kingdom',[ICANN2004],{current:true})
]);

// .xxx originated in the 2004 sponsored round and was delegated later.
setEvents('.xxx',[
  event('2004','application','sponsored','ICM Registry','Canada / United States',[ICANN2004]),
  event('2011','delegated','sponsored','ICM Registry','Canada / United States',['https://www.iana.org/domains/root/db/xxx.html'],{current:true})
]);

// Cross-round example: a 2000 proposal later reappeared and is now delegated.
setEvents('.sucks',[
  event('2000','proposed','application','','',['https://archive.icann.org/en/tlds/ads1/']),
  event('2012','application','generic','','',[ICANN2012]),
  event('current','delegated','generic','','',['https://www.iana.org/domains/root/db/sucks.html'],{current:true})
]);
setCurrent('.sucks',{round:'cross',status:'longitudinal'});

// Pre-Reveal .lugano is a public applicant disclosure, not yet an ICANN-published application record.
setCurrent('.lugano',{provenanceKey:'applicantDisclosure',provenanceDate:'2026-10-02',source:[]});
setEvents('.lugano',[
  event('2026','application','geographic','City of Lugano','Switzerland',[],{current:true,provenanceKey:'applicantDisclosure',provenanceDate:'2026-10-02'})
]);

// Keep the bibliography itself unique by URL, not only its rendered view.
{
  const seenSourceUrls=new Set();
  D.sources=(D.sources||[]).filter(s=>{const u=String((s&&s[1])||'');if(!u||seenSourceUrls.has(u))return false;seenSourceUrls.add(u);return true});
}

D.explorerHistoryVersion='0.6.8';
})();
