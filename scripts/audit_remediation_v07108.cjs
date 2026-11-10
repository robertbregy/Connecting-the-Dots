'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {parseHTML}=require('linkedom');
const {markdown}=require('./render_discovery.cjs');
const root=path.resolve(__dirname,'..'),pub=JSON.parse(fs.readFileSync(path.join(root,'publication.json'),'utf8'));
const BASE=pub.deployment,L=['en','it','de','fr'];
const type={
en:{guide:'Guide',tld:'TLD profile',field:'Field note',timeline:'Round timeline',applications:'Application atlas',economics:'Economic analysis',reader:'Research protocol',research:'Research',paper:'Working paper'},
it:{guide:'Guida',tld:'Scheda TLD',field:'Nota dal campo',timeline:'Cronologia del round',applications:'Atlante candidature',economics:'Analisi economica',reader:'Protocollo di ricerca',research:'Ricerca',paper:'Working paper'},
de:{guide:'Leitfaden',tld:'TLD-Profil',field:'Feldnotiz',timeline:'Chronologie der Runde',applications:'Bewerbungsatlas',economics:'Wirtschaftsanalyse',reader:'Forschungsprotokoll',research:'Forschung',paper:'Working Paper'},
fr:{guide:'Guide',tld:'Fiche TLD',field:'Note de terrain',timeline:'Chronologie du round',applications:'Atlas des candidatures',economics:'Analyse économique',reader:'Protocole de recherche',research:'Recherche',paper:'Working paper'}};
const round={
en:['Pre-String Confirmation Day snapshot','These data describe the public 2026 round before 17 November 2026. ICANN is scheduled to publish the confirmed strings and updated contention sets on String Confirmation Day.'],
it:['Snapshot precedente allo String Confirmation Day','Questi dati descrivono il round 2026 prima del 17 novembre 2026. In quella data ICANN prevede di pubblicare le stringhe confermate e i contention set aggiornati.'],
de:['Snapshot vor dem String Confirmation Day','Diese Daten beschreiben die öffentliche Runde 2026 vor dem 17. November 2026. An diesem Tag will ICANN die bestätigten Zeichenfolgen und aktualisierten Contention Sets veröffentlichen.'],
fr:['Instantané avant le String Confirmation Day','Ces données décrivent le round 2026 avant le 17 novembre 2026. Ce jour-là, ICANN prévoit de publier les chaînes confirmées et les contention sets mis à jour.']};
const profile={
en:['Status at the documented check','Root status at the documented check','Status check date'],
it:['Stato alla verifica documentata','Stato nella root alla verifica documentata','Data della verifica dello stato'],
de:['Status bei der dokumentierten Prüfung','Status in der Root-Zone bei der dokumentierten Prüfung','Datum der Statusprüfung'],
fr:['Statut lors de la vérification documentée','Statut dans la racine lors de la vérification documentée','Date de vérification du statut']};
const appDesc={
en:'Explore the 1,614 published ICANN APS base applications in the archived 11 October 2026 export, with replacement rows kept distinct.',
it:'Esplora le 1.614 candidature di base pubblicate nell’APS ICANN acquisito l’11 ottobre 2026, distinguendo i record di sostituzione.',
de:'Erkunden Sie die 1.614 veröffentlichten Basisbewerbungen im ICANN-APS-Export vom 11. Oktober 2026; Ersatzzeilen bleiben getrennt.',
fr:'Explorez les 1 614 candidatures de base publiées dans l’export APS ICANN du 11 octobre 2026, en distinguant les lignes de remplacement.'};
const readerDesc={
en:'A 15-minute formative reader-study protocol to observe comprehension, curiosity and navigation friction. No participant results are claimed.',
it:'Protocollo formativo di circa 15 minuti per osservare comprensione, curiosità e attriti di navigazione. Non vengono presentati risultati.',
de:'Ein etwa 15-minütiges formatives Leserprotokoll zu Verständnis, Neugier und Navigationshürden. Es werden keine Ergebnisse behauptet.',
fr:'Protocole formatif d’environ 15 minutes sur compréhension, curiosité et friction de navigation. Aucun résultat de participants n’est revendiqué.'};
const econDesc={
en:{market:'Compare TLD website presence and registered-domain counts with filters, dates, sources and downloadable data.',cases:'Eight documented cases show how renewals, auctions, acquisitions, regulation and public revenue create value in the domain economy.',portfolios:'Portfolios, multiple applications and contention: compare operator strategies and selected cases from the ICANN 2026 round.','round-2026':'Application costs, string themes, applicant activity and economic strategies in the ICANN 2026 round.'},
it:{market:'Confronta presenza sui siti e domini registrati nei TLD, con filtri, date, fonti e dati scaricabili.',cases:'Otto casi documentati mostrano come rinnovi, aste, acquisizioni, regolazione ed entrate pubbliche producono valore nei domini.',portfolios:'Portafogli, candidature multiple e contese: confronta strategie degli operatori e casi del round ICANN 2026.','round-2026':'Costi di candidatura, temi delle stringhe, attività dei candidati e strategie economiche nel round ICANN 2026.'},
de:{market:'Vergleichen Sie Website-Nutzung und registrierte Domains von TLDs mit Filtern, Daten, Quellen und Downloads.',cases:'Acht dokumentierte Fälle zeigen, wie Verlängerungen, Auktionen, Übernahmen, Regulierung und öffentliche Einnahmen Wert erzeugen.',portfolios:'Portfolios, Mehrfachbewerbungen und Konflikte: Strategien der Betreiber und Fälle aus der ICANN-Runde 2026 im Vergleich.','round-2026':'Bewerbungskosten, Themen der Zeichenfolgen, Tätigkeiten der Bewerber und wirtschaftliche Strategien der ICANN-Runde 2026.'},
fr:{market:'Comparez présence sur les sites et volumes de domaines des TLD, avec filtres, dates, sources et données téléchargeables.',cases:'Huit cas documentés montrent comment renouvellements, enchères, acquisitions, régulation et recettes publiques créent de la valeur.',portfolios:'Portefeuilles, candidatures multiples et contention : comparez les stratégies et des cas du round ICANN 2026.','round-2026':'Coûts de candidature, thèmes des chaînes, activités des candidats et stratégies économiques du round ICANN 2026.'}};

// Keep each shared stylesheet at the original inline block's position. This
// preserves the cascade and avoids loading unrelated module rules on a page.
const styleIds=['city-namespace-style','tld-cultural-style','tld-market-style','audit-20261019-style','ctd-b2-cross-style','ctd-native-governance-css'];
const https=new Map([['http://nic.berlin/','https://nic.berlin/'],['http://www.domini.cat/','https://domini.cat/'],['http://www.nic.amazon/','https://www.nic.amazon/'],['http://www.nic.io/','https://www.nic.io/'],['http://www.nic.swiss/','https://www.nic.swiss/'],['http://www.verisigninc.com/','https://www.verisigninc.com/']]);
const rel=p=>path.relative(root,p).split(path.sep).join('/');
const prefix=r=>'../'.repeat(r.split('/').length-1);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rx=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
function files(d){return fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>{const p=path.join(d,e.name);return e.isDirectory()?files(p):e.isFile()&&e.name.endsWith('.html')?[p]:[]});}
const pages=['index.html',...['en','it','de','fr','applications','inside-the-round','behind-the-round','guides','tlds','economics','research','explorer','discovery'].flatMap(d=>files(path.join(root,d)).map(rel))];
function language(src,r){return (src.match(/<html\b[^>]*\blang="(en|it|de|fr)"/)||[])[1]||(r.match(/(?:^|\/)(en|it|de|fr)(?:\/|$)/)||[])[1]||'en';}
function kind(r){if(/^guides\//.test(r))return'guide';if(/^tlds\//.test(r))return'tld';if(/^behind-the-round\//.test(r))return'field';if(/^inside-the-round\//.test(r))return'timeline';if(/^applications\//.test(r))return'applications';if(/^economics\//.test(r))return'economics';if(/^research\/reader-study\//.test(r))return'reader';if(r==='research/index.html')return'research';if(r===pub.paperPath)return'paper';return null;}
function meta(src,attr,key,value){const tag='<meta '+attr+'="'+key+'" content="'+esc(value)+'">';const pattern=new RegExp('<meta\\b(?=[^>]*\\b'+attr+'="'+rx(key)+'")[^>]*>','i');return pattern.test(src)?src.replace(pattern,()=>tag):src.replace('</head>',tag+'\n</head>');}
function social(src,description,canonical,title){for(const [attr,key,value] of [
 ['name','description',description],['property','og:type','article'],['property','og:title',title],['property','og:description',description],['property','og:url',canonical],['property','og:image',BASE+'assets/og-preview.png'],['name','twitter:card','summary_large_image'],['name','twitter:title',title],['name','twitter:description',description],['name','twitter:image',BASE+'assets/og-preview.png']])src=meta(src,attr,key,value);return src;}
function pageDescription(src,description,canonical){
 return src.replace(/(<script\b[^>]*\btype="application\/ld\+json"[^>]*>)([\s\S]*?)(<\/script>)/g,(whole,open,body,close)=>{
  const record=JSON.parse(body),entries=Array.isArray(record['@graph'])?record['@graph']:[record];let changed=false;
  for(const entry of entries){
   if(entry['@type']==='WebPage'&&entry.url===canonical&&entry.description!==description){entry.description=description;changed=true;}
  }
  return changed?open+JSON.stringify(record).replace(/</g,'\\u003c')+close:whole;
 });
}
const snapshot={
 en:['APS snapshot · 11 October 2026','The application data come from the public APS export acquired on 11 October 2026. This snapshot precedes String Confirmation Day (17 November), the announced milestone for confirmed strings and updated contention sets. It does not establish individual evaluation outcomes.','Official timetable'],
 it:['Snapshot APS · 11 ottobre 2026','I dati delle candidature provengono dall’esportazione pubblica APS acquisita l’11 ottobre 2026. Questo snapshot precede lo String Confirmation Day (17 novembre), previsto per la pubblicazione delle stringhe confermate e delle contese aggiornate. Non attesta esiti individuali delle valutazioni.','Calendario ufficiale'],
 de:['APS-Snapshot · 11. Oktober 2026','Die Bewerbungsdaten stammen aus dem am 11. Oktober 2026 erfassten öffentlichen APS-Export. Dieser Snapshot liegt vor dem String Confirmation Day (17. November), dem angekündigten Termin für bestätigte Zeichenfolgen und aktualisierte Contention Sets. Er belegt keine individuellen Bewertungsergebnisse.','Offizieller Zeitplan'],
 fr:['Instantané APS · 11 octobre 2026','Les données des candidatures proviennent de l’export public APS acquis le 11 octobre 2026. Cet instantané précède le String Confirmation Day (17 novembre), prévu pour la publication des chaînes confirmées et des ensembles de candidatures en concurrence actualisés. Il n’atteste aucun résultat individuel d’évaluation.','Calendrier officiel']
};
const milestoneUrl='https://www.icann.org/en/announcements/details/icann-announces-date-for-reveal-day-and-other-2026-round-milestones-29-09-2026-en';
const studyLinks={en:'Reader study: protocol and observation sheet',it:'Studio con i lettori: protocollo e scheda di osservazione',de:'Leserstudie: Protokoll und Beobachtungsbogen',fr:'Étude auprès des lecteurs : protocole et grille d’observation'};
const studyNotes={en:'Formative research materials; no participant results have been collected.',it:'Materiali per uno studio formativo; non sono stati raccolti risultati da partecipanti.',de:'Materialien für eine formative Studie; es wurden noch keine Ergebnisse von Teilnehmenden erhoben.',fr:'Documents pour une étude formative ; aucun résultat de participants n’a été recueilli.'};
const styleMap=new Map();let extracted=0,savedBytes=0;
for(const r of [...new Set(pages)]){
 const file=path.join(root,r);let src=fs.readFileSync(file,'utf8');const original=src,l=language(src,r),k=kind(r);
 for(const id of styleIds){
  const pattern=new RegExp('<style\\b(?=[^>]*\\bid="'+id+'")[^>]*>([\\s\\S]*?)</style>','g');
  src=src.replace(pattern,(_all,body)=>{
   const css=body.trim()+'\n',digest=crypto.createHash('sha256').update(css).digest('hex'),existing=styleMap.get(id);
   if(existing&&existing.digest!==digest)throw Error('Shared CSS drift: '+id+' in '+r);
   if(!existing)styleMap.set(id,{css,digest});
   const link='<link rel="stylesheet" data-shared-style="'+id+'" href="'+prefix(r)+'assets/shared/'+id+'.css?v='+pub.version+'">';
   extracted++;savedBytes+=_all.length-link.length;return link;
  });
 }
 // Reused research pages may already contain extracted modules from an older
 // release. Refresh only these stylesheet URLs, retaining cascade position.
 src=src.replace(/(<link\b[^>]*\bhref=")([^"?]*assets\/(?:shared\/(?:city-namespace-style|tld-cultural-style|tld-market-style|audit-20261019-style|ctd-b2-cross-style|ctd-native-governance-css)|editorial-shared)\.css)(?:\?[^"#]*)?("[^>]*>)/g,(_m,open,url,close)=>open+url+'?v='+pub.version+close);
 const {document}=parseHTML(src),canonical=document.querySelector('link[rel="canonical"]')?.getAttribute('href')||BASE+r.replace(/index\.html$/,'');
 let title=document.title,description=document.querySelector('meta[name="description"]')?.getAttribute('content')||'';
 // Canonical reading pages receive one compact shared label; native tabbed
 // pages retain their established chapter grammar.
 if(k&&/<h1\b/.test(src)){
  const eyebrow=document.querySelector('.discoveryHero > .discoveryEyebrow');
  if(eyebrow){
   // Reuse the existing page-type label. A second badge repeats the same
   // information and makes the reading-page opening unnecessarily crowded.
   const old=eyebrow.outerHTML;
   for(const duplicate of document.querySelectorAll('.discoveryHero > .editorialType'))if(duplicate!==eyebrow)src=src.replace(duplicate.outerHTML,'');
   eyebrow.classList.add('editorialType');eyebrow.textContent=type[l][k];
   src=src.replace(old,eyebrow.outerHTML);
  }else if(!document.querySelector('.editorialType'))src=src.replace(/<h1\b/, '<p class="editorialType">'+esc(type[l][k])+'</p>\n<h1');
  if(!src.includes('data-page-type='))src=src.replace('<body','<body data-page-type="'+k+'"');
  if(!src.includes('assets/editorial-shared.css'))src=src.replace('</head>','<link rel="stylesheet" href="'+prefix(r)+'assets/editorial-shared.css?v='+pub.version+'">\n</head>');
 }
 if(/^applications\//.test(r))description=appDesc[l];
 const economic=r.match(/^economics\/(en|it|de|fr)\/(market|cases|portfolios|round-2026)\/index\.html$/);
 if(economic)description=econDesc[l][economic[2]];
 if(k==='tld'){
  const pairs=[
   ['Current status',profile[l][0]],['Stato attuale',profile[l][0]],['Aktueller Status',profile[l][0]],['Statut actuel',profile[l][0]],
   ['Current root status',profile[l][1]],['Stato attuale nella root',profile[l][1]],['Aktueller Status in der Root-Zone',profile[l][1]],['Statut actuel dans la racine',profile[l][1]],
   ['Current-state verification',profile[l][2]],['Verifica dello stato attuale',profile[l][2]],['Prüfung des aktuellen Status',profile[l][2]],['Vérification de l’état actuel',profile[l][2]]
  ].sort((a,b)=>b[0].length-a[0].length);
  // Replace only full labels, never source quotations or JSON provenance.
  for(const [a,b]of pairs)src=src.split('>'+esc(a)+'<').join('>'+esc(b)+'<');
  if(description.length<90){const tails={en:' Explore its dated status, history and IANA/ICANN sources in this Connecting the Dots profile.',it:' Consulta stato datato, cronologia e fonti IANA/ICANN nella scheda di Connecting the Dots.',de:' Das Profil zeigt datierten Status, Verlauf sowie IANA- und ICANN-Quellen.',fr:' Consultez son statut daté, son historique et les sources IANA/ICANN dans cette fiche.'};description+=tails[l];}
 }
 if(k==='reader'){
  description=readerDesc[l];
  for(const x of [...L,'x-default'])if(!src.includes('rel="alternate" hreflang="'+x+'"'))src=src.replace('</head>','<link rel="alternate" hreflang="'+x+'" href="'+BASE+'research/reader-study/'+(x==='x-default'?'en':x)+'/">\n</head>');
  src=meta(src,'name','robots','index,follow,max-image-preview:large');
 }
 if(k==='paper')src=meta(src,'name','robots','index,follow,max-image-preview:large');
 // Complete social descriptions from the same descriptive source, preserving
 // every canonical URL and original Article/ScholarlyArticle record.
 if(k&&description){src=social(src,description,canonical,title);src=pageDescription(src,description,canonical);}
 const roundPage=/^(applications|inside-the-round)\//.test(r)||/^economics\/(en|it|de|fr)\/(round-2026|portfolios)\//.test(r)||/^tlds\/(en|it|de|fr)\/lugano\//.test(r)||/^behind-the-round\/(en|it|de|fr)\/(index\.html|wdo-identity\/|replacement-strings\/|objectors-eoi\/|background-screening\/)/.test(r);
 if(roundPage&&!src.includes('class="roundStatus"')){
  const text=snapshot[l],notice='<aside class="roundStatus" data-aps-snapshot="2026-10-11" aria-label="'+esc(text[0])+'"><strong>'+esc(text[0])+'</strong><p>'+esc(text[1])+' <a href="'+milestoneUrl+'">'+esc(text[2])+' ↗</a></p></aside>';
  src=src.replace(/(<h1\b[^>]*>[\s\S]*?<\/h1>)/,(_m,h)=>h+'\n'+notice);
 }
 src=src.replace(/(<[^>]*\bid="aps-current-economics")(?![^>]*data-aps-snapshot)/, '$1 data-aps-snapshot="2026-10-11"');
 // The fee section is a top-level section in its standalone chapter. Its
 // child headings move with it; there is no invisible heading placeholder.
 if(/^economics\/(en|it|de|fr)\/round-2026\/index\.html$/.test(r)){
  let inOpening=false,done=false;
  src=src.replace(/<h([1-6])\b([^>]*)>([\s\S]*?)<\/h\1>/g,(whole,level,attrs,content)=>{
   const n=Number(level);if(n===1){inOpening=true;return whole;}if(!inOpening||done)return whole;if(n===2){done=true;return whole;}return '<h'+(n-1)+attrs+'>'+content+'</h'+(n-1)+'>';
  });
 }
 // Reader Study is an ordinary, citable methodology page, with the same
 // destination available from Research on every locale.
 if(r==='research/index.html'||/^(en|it|de|fr)\/index\.html$/.test(r)||r==='index.html'||/^guides\/(en|it|de|fr)\/research\//.test(r)){
  const href=prefix(r)+'research/reader-study/'+l+'/',link='<p class="readerStudyEntry"><a href="'+href+'">'+esc(studyLinks[l])+' →</a><br><small>'+esc(studyNotes[l])+'</small></p>';
  if(r==='research/index.html'){
   // reader_first replaces its closing navigation on every build. Keep this
   // editorial link immediately before it, without adding whitespace each time.
   const entry=/(?:\r?\n)*<p class="readerStudyEntry">[\s\S]*?<\/p>(?:\r?\n)*/g;
   if([...src.matchAll(entry)].length>1)throw Error('Duplicate Reader Study entry');
   src=src.replace(entry,'');
   const next=/<nav\b(?=[^>]*\bclass="[^"]*\breaderNext\b[^"]*")[^>]*>/;
   src=next.test(src)?src.replace(next,opening=>link+opening):src.replace('</main>',link+'</main>');
  }else if(!src.includes('research/reader-study/'+l+'/'))src=src.replace(/(<[^>]*\bid="reader-study-protocol"[^>]*>)/,(_m,open)=>open+link);
 }
 for(const [a,b]of https)src=src.replaceAll('href="'+a+'"','href="'+b+'"');
 // These text editions are another representation of the final reading page.
 // Regenerate them after all date notes, heading repairs and source-link
 // corrections, using the same converter and preface as the original renderer.
 if(/^(guides|tlds|economics|discovery)\/(en|it|de|fr)\//.test(r)){
  const markdownFile=file.replace(/\.html$/,'.md');
  if(!fs.existsSync(markdownFile))throw Error('Missing reading-page text edition: '+r);
  const finalDocument=parseHTML(src).document,main=finalDocument.querySelector('main');
  if(!main)throw Error('Missing reading-page main content: '+r);
  const text='<!-- Canonical: '+canonical+' | Site edition: '+pub.version+' | Language: '+l+' -->\n\n'+markdown(main,canonical);
  if(fs.readFileSync(markdownFile,'utf8')!==text)fs.writeFileSync(markdownFile,text);
 }
 if(src!==original)fs.writeFileSync(file,src);
}
fs.mkdirSync(path.join(root,'assets/shared'),{recursive:true});
for(const [id,v]of styleMap)fs.writeFileSync(path.join(root,'assets/shared',id+'.css'),v.css);
const css=`/* Shared publication modules · badges and dated source notes · v${pub.version} */
.editorialType{display:inline-flex;align-items:center;max-width:100%;margin:0 0 10px;padding:5px 9px;border:1px solid var(--border,#c9d1d9);border-radius:999px;color:var(--muted,#53606c);font-size:12px;font-weight:750;letter-spacing:.04em;text-transform:uppercase;line-height:1.35}
.roundStatus{margin:16px 0 22px;padding:14px 16px;border-left:3px solid var(--accent-text,#1769aa);background:var(--surface2,#f4f7fa);border-radius:0 10px 10px 0;line-height:1.55;font-size:14px}
.roundStatus strong{display:block;margin-bottom:4px}.roundStatus p{margin:0;color:var(--muted,#53606c)}
@media(max-width:600px){.editorialType{font-size:11px}.roundStatus{padding:12px 14px;margin:12px 0 18px}}
`;
fs.writeFileSync(path.join(root,'assets/editorial-shared.css'),css);
let sitemap=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
if(!sitemap.includes('/research/reader-study/en/')){
 const alternates=[...L,'x-default'].map(x=>'    <xhtml:link rel="alternate" hreflang="'+x+'" href="'+BASE+'research/reader-study/'+(x==='x-default'?'en':x)+'/" />').join('\n');
 sitemap=sitemap.replace('</urlset>',L.map(x=>'  <url>\n    <loc>'+BASE+'research/reader-study/'+x+'/</loc>\n    <lastmod>'+pub.releasedOn+'</lastmod>\n'+alternates+'\n  </url>').join('\n')+'\n</urlset>');
}
if(sitemap.includes('/prototype/')||sitemap.includes('/src/'))throw Error('Development route in sitemap');
fs.writeFileSync(path.join(root,'sitemap.xml'),sitemap);
const manifestPath=path.join(root,'discovery/manifest.json'),manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
for(const page of manifest.pages){const {document}=parseHTML(fs.readFileSync(path.join(root,page.path,'index.html'),'utf8'));page.description=document.querySelector('meta[name="description"]').getAttribute('content');}
fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n');
console.log('AUDIT_REMEDIATION_PASS',JSON.stringify({version:pub.version,html:pages.length,sharedStyles:styleMap.size,extractedBlocks:extracted,inlineBytesRemoved:savedBytes}));
