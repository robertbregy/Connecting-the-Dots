/* Normalize every IANA profile from preserved HTML. Never infer application history. */
const fs=require('fs'),path=require('path'),crypto=require('crypto'),zlib=require('zlib');
const {domainToUnicode}=require('node:url'),{isIP}=require('node:net'),{parseHTML}=require('linkedom');
const root=path.resolve(__dirname,'..'),cache=path.join(root,'data/evidence/iana');
const digest=b=>crypto.createHash('sha256').update(b).digest('hex');
const clean=s=>s.replace(/\s+/g,' ').trim();
const normalize=s=>clean(s).toLowerCase().normalize('NFD').replace(/\p{M}/gu,'').replace(/\s*\(the\)\s*/g,'').replace(/&/g,'and').replace(/[^a-z0-9]/g,'');
const english=new Intl.DisplayNames(['en'],{type:'region',fallback:'none'}),countries=new Map();
for(let a=65;a<=90;a++)for(let b=65;b<=90;b++){const code=String.fromCharCode(a,b),name=english.of(code);if(name)countries.set(normalize(name),code);}
const aliases={
 'United States of America (the)':'US','United Kingdom of Great Britain and Northern Ireland (the)':'GB',
 'Russian Federation (the)':'RU','Korea (the Republic of)':'KR',"Korea (the Democratic People’s Republic of)":'KP',
 "Korea (the Democratic People's Republic of)":'KP','Iran (Islamic Republic of)':'IR',
 'Tanzania, United Republic of':'TZ','Tanzania, the United Republic of':'TZ','Viet Nam':'VN',
 'Bolivia (Plurinational State of)':'BO','Venezuela (Bolivarian Republic of)':'VE',
 'Moldova (the Republic of)':'MD','Syrian Arab Republic (the)':'SY','Lao People’s Democratic Republic (the)':'LA',
 "Lao People's Democratic Republic (the)":'LA','Brunei Darussalam':'BN','Micronesia (Federated States of)':'FM',
 'Congo (the Democratic Republic of the)':'CD','Congo (the)':'CG','Côte d’Ivoire':'CI',"Côte d'Ivoire":'CI',
 'Taiwan (Province of China)':'TW','Hong Kong, China':'HK','Macao':'MO','Swaziland':'SZ',
 'Holy See (the)':'VA','Palestine, State of':'PS','Czech Republic (the)':'CZ',
 'Bonaire, Sint Eustatius and Saba':'BQ','Saint Martin (French part)':'MF','Sint Maarten (Dutch part)':'SX',
 'Virgin Islands (British)':'VG','Virgin Islands (U.S.)':'VI','Falkland Islands (the) [Malvinas]':'FK',
 'Saint Helena, Ascension and Tristan da Cunha':'SH','Macedonia (the former Yugoslav Republic of)':'MK',
 'Türkiye':'TR','Turkey':'TR','Netherlands Antilles':'AN','United States Minor Outlying Islands (the)':'UM',
 'Hong Kong':'HK','Cabo Verde':'CV','South Georgia and the South Sandwich Islands':'GS','Saint Kitts and Nevis':'KN',
 'Saint Lucia':'LC','Myanmar':'MM','Saint Vincent and the Grenadines':'VC','Saint Pierre and Miquelon':'PM',
 'Saint Barthélemy':'BL','Sao Tome and Principe':'ST','Grand Cayman':'KY'
};
for(const [name,code] of Object.entries(aliases))countries.set(normalize(name),code);
const warnings=[];
function section(main,title){
 const h=[...main.querySelectorAll('h2')].find(n=>clean(n.textContent)===title);if(!h)return null;
 let html='';for(let n=h.nextSibling;n&&n.nodeName!=='H2'&&n.nodeName!=='SCRIPT';n=n.nextSibling)html+=n.outerHTML??n.textContent;
 return parseHTML('<div>'+html+'</div>').document.querySelector('div');
}
function lines(node){if(!node)return[];const clone=node.cloneNode(true);for(const br of clone.querySelectorAll('br'))br.replaceWith('\n');return clone.textContent.split(/\n/).map(clean).filter(Boolean);}
function countryFrom(items,label){
 const candidate=items.at(-1)||'',code=countries.get(normalize(candidate));
 if(code)return{country:candidate,code};
 if(items.length>1&&candidate!=='Not assigned')warnings.push({label,kind:'country',candidate,lines:items});
 return{country:'',code:''};
}
function contact(main,title,label){
 const node=section(main,title),all=lines(node),end=all.findIndex(s=>/^(Email|Voice|Fax):/.test(s));
 const body=end<0?all:all.slice(0,end),location=countryFrom(body,label+' '+title);
 // IANA's contact name is bold; the following line is optional organization text.
 // A missing organization must not turn an address into an organization.
 const nameNode=node?.querySelector('b');let firstBreak=nameNode?.nextSibling;
 while(firstBreak&&firstBreak.nodeName!=='BR')firstBreak=firstBreak.nextSibling;
 let slot='';for(let n=firstBreak?.nextSibling;n&&n.nodeName!=='BR';n=n.nextSibling)slot+=n.textContent;
 // An empty template organization slot leaves a blank source line before the address.
 // Read the whole slot (organizations may contain newlines), never the next address line.
 let organization=/^\s*\n[ \t]*\n/.test(slot)?'':clean(slot);
 if(!nameNode||body.length<3||organization===location.country||/^(?:Not assigned|CEO|CTO|Director)$/i.test(organization))organization='';
 if(organization)warnings.push({label,kind:'contactOrganization',role:title,organization,body});
 return{organization,country:location.country,countryCode:location.code};
}
function webUrl(value,label){if(!value)return'';const u=new URL(value,'https://www.iana.org');if(!['https:','http:'].includes(u.protocol))throw Error('Unexpected URL '+label+': '+value);return u.href;}
function infoValues(node,label){return[...(node?.querySelectorAll('b')||[])].filter(b=>clean(b.textContent)===label).map(b=>{let value='';for(let n=b.nextSibling;n&&n.nodeName!=='BR';n=n.nextSibling)value+=n.textContent;return clean(value);}).filter(Boolean);}
function dateFrom(text,regex,label){const value=text.match(regex)?.[1]||'';if(value&&(isNaN(Date.parse(value))||new Date(value).toISOString().slice(0,10)!==value))throw Error('Invalid date '+label);return value;}

function normalizeSnapshot({reviewAvailable=false}={}){
 const old=JSON.parse(fs.readFileSync(path.join(root,'data/iana_snapshot.json'))),state=JSON.parse(fs.readFileSync(path.join(cache,'retrieval-log.json')));
 const read=name=>{const raw=fs.readFileSync(path.join(cache,name));if(!state[name]||digest(raw)!==state[name].sha256)throw Error('Missing verified source '+name);return raw;};
 const list=read('tlds-alpha-by-domain.txt').toString(),rootSet=new Set(list.split(/\r?\n/).map(s=>s.trim().toLowerCase()).filter(s=>s&&!s.startsWith('#')));
 const db=parseHTML(read('root-db.html').toString()).document,records={},names=['root-db.html','tlds-alpha-by-domain.txt'];
 for(const row of db.querySelectorAll('#tld-table tbody tr')){
  const cells=row.querySelectorAll('td'),link=cells[0]?.querySelector('a');if(!link)continue;
  const name=link.getAttribute('href').split('/').pop(),label=name.replace(/\.html$/,''),key='.'+domainToUnicode(label),source=new URL(link.getAttribute('href'),'https://www.iana.org').href;
  if(reviewAvailable&&(!state[name]||!fs.existsSync(path.join(cache,name))))continue;
  if(records[key])throw Error('Duplicate record '+label);names.push(name);
  const document=parseHTML(read(name).toString()).document,main=document.querySelector('main');
  if(!main?.querySelector('h1')?.textContent.includes('Delegation Record for'))throw Error('Missing delegation record '+label);
  const sponsor=section(main,'Sponsoring Organisation')||section(main,'ccTLD Manager'),sponsorLines=lines(sponsor);
  const registryEntity=clean(lines(sponsor?.querySelector('b')).join(' ')||sponsorLines[0]||(!rootSet.has(label)?cells[2].textContent:''));
  if(!registryEntity)throw Error('Missing manager/status '+label);
  const manager=countryFrom(sponsorLines,label+' registry'),technical=contact(main,'Technical Contact',label),administrative=contact(main,'Administrative Contact',label);
  const info=section(main,'Registry Information'),allText=main.textContent;
  const registryUrl=webUrl(infoValues(info,'URL for registration services:')[0]||'',label);
  const whoisServer=infoValues(info,'WHOIS Server:')[0]||'';
  const rdapServers=infoValues(info,'RDAP Server:').map(s=>webUrl(s,label));
  const nameServers=[...(section(main,'Name Servers')?.querySelectorAll('tbody tr')||[])].map(row=>{
   const cells=row.querySelectorAll('td'),hostname=clean(cells[0].textContent).toLowerCase(),ipAddresses=lines(cells[1]);
   if(!hostname||ipAddresses.some(ip=>!isIP(ip)))throw Error('Invalid nameserver '+label+': '+JSON.stringify({hostname,ipAddresses}));
   return{hostname,ipAddresses};
  });
  const ianaReports=[...(section(main,'IANA Reports')?.querySelectorAll('li')||[])].map(li=>{const a=li.querySelector('a');if(!a)throw Error('Missing report link '+label);return{title:clean(a.textContent),url:webUrl(a.getAttribute('href'),label),date:dateFrom(li.textContent,/\((\d{4}-\d{2}-\d{2})\)/,label)};});
  const reserved=registryEntity==='Reserved Domain - IANA',unassigned=registryEntity==='Not assigned';
  if(rootSet.has(label)&&unassigned)throw Error('Root list and profile conflict: '+label);
  const rowEntity=clean(cells[2].textContent);if(rowEntity!==registryEntity)warnings.push({label,kind:'managerDifference',rowEntity,registryEntity});
  records[key]={asciiString:'.'+label,formalType:clean(cells[1].textContent),registryEntity,registryCountry:manager.country,registryCountryCode:manager.code,
   administrativeContactOrganization:administrative.organization,administrativeContactCountry:administrative.country,administrativeContactCountryCode:administrative.countryCode,
   technicalContactOrganization:technical.organization,technicalContactCountry:technical.country,technicalContactCountryCode:technical.countryCode,
   registrationDate:dateFrom(allText,/Registration date (\d{4}-\d{2}-\d{2})/,label),lastUpdated:dateFrom(allText,/Record last updated (\d{4}-\d{2}-\d{2})/,label),
   registryUrl,whoisServer,rdapServers,nameServers,ianaReports,
   currentRootStatus:reserved?'reserved':rootSet.has(label)?'delegated':'notDelegated',rootListed:rootSet.has(label),source,sourceRetrievedAt:state[name].retrievedAt};
 }
 if(!reviewAvailable)for(const label of rootSet)if(!records['.'+domainToUnicode(label)])throw Error('Root name missing from profiles: '+label);
 const unknown=warnings.filter(w=>w.kind==='country');
 fs.writeFileSync(path.join(cache,'normalization-review.json'),JSON.stringify(warnings,null,2)+'\n');
 if(reviewAvailable){console.log('Review only: '+Object.keys(records).length+' available profiles; '+unknown.length+' unrecognized country sections. Snapshot unchanged.');return;}
 if(unknown.length)throw Error('Unrecognized country/address in '+unknown.length+' sections. See data/evidence/iana/normalization-review.json before publishing.');
 const files=names.sort().map(name=>({path:'data/evidence/iana/'+name,sha256:state[name].sha256,retrievedAt:state[name].retrievedAt,source:state[name].source||(name==='root-db.html'?'https://www.iana.org/domains/root/db':name==='tlds-alpha-by-domain.txt'?old.listSource:'https://www.iana.org/domains/root/db/'+name)}));
 const timestamps=files.map(f=>f.retrievedAt).sort(),asOf=state['tlds-alpha-by-domain.txt'].retrievedAt.slice(0,10);
 const evidence={format:'ctd-evidence-v1',encoding:'base64',files:Object.fromEntries(names.sort().map(name=>['data/evidence/iana/'+name,read(name).toString('base64')]))};
 const archive=zlib.gzipSync(Buffer.from(JSON.stringify(evidence)),{level:9}),archive_path='data/evidence/iana-snapshot-'+asOf+'.json.gz';
 const snapshot={schemaVersion:2,asOf,retrievedAt:timestamps.at(-1),retrievalStartedAt:timestamps[0],rootListRetrievedAt:state['tlds-alpha-by-domain.txt'].retrievedAt,
  listSource:old.listSource,databaseSource:'https://www.iana.org/domains/root/db',rootListCount:rootSet.size,databaseCount:Object.keys(records).length,
  archive_path,archive_sha256:digest(archive),files,records};
 fs.writeFileSync(path.join(root,archive_path),archive);fs.writeFileSync(path.join(root,'data/iana_snapshot.json'),JSON.stringify(snapshot,null,2)+'\n');
 console.log('Normalized '+Object.keys(records).length+' profiles; '+rootSet.size+' root-list labels; '+files.length+' preserved sources. Review: data/evidence/iana/normalization-review.json');
}
if(require.main===module)normalizeSnapshot({reviewAvailable:process.argv.includes('--review-available')});
module.exports={normalizeSnapshot};
