/* Source-content parity guard for IA B2. No rewrites, only validation.
   Reference: main@ec231cc12d35fa91ff5340ad057a483ce23a5ca4 (v0.7.78).
   Baseline segment strings were directly compared A vs B on 13 Oct 2026.
   64-bit FNV checks detect accidental drift; they are NOT a cryptographic archive.
   Legitimate editorial changes require review and a deliberate manifest refresh.
   14 October 2026: Explore now includes a native application-level 2026 Atlas panel,
   reusing the existing official graph and filtering engine. This reviewed addition
   deliberately updates only the Explore section digest.
   Economics intentionally extended 14 Oct 2026: source-linked ICANN contention, Intercap portfolio and brand/AI analysis.
   See docs/EDITORIAL_UPDATE_2026-10-14.md; other 20 section digests remain frozen. */
'use strict';
const fs=require('node:fs');
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const path=require('node:path');
// Same-day releases have distinct manifests; archived dated reviews stay intact.
function resolveReviewPath(publication){
 assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(publication.releasedOn||''),'Review requires an exact publication date');
 assert.ok(/^\d+\.\d+\.\d+$/.test(publication.version||''),'Review requires an exact publication version');
 const dated='docs/editorial-review-'+publication.releasedOn+'.json';
 if(!Object.prototype.hasOwnProperty.call(publication,'editorialReviewPath'))return relativeFile(dated);
 const versioned='docs/editorial-review-'+publication.releasedOn+'-v'+publication.version+'.json';
 assert.equal(publication.editorialReviewPath,versioned,'Explicit review path must match this exact release date and version');
 return relativeFile(publication.editorialReviewPath);
}
const ARCHIVED_REVIEW_V85={path:'docs/editorial-review-2026-10-19.json',sha256:'03b48a852312d6385c524c6966d6f290e718560890af1d9112bdc0cb199bcc42'};
const REVIEW_BASE='65e0fbe2080c2ee841e8abc01e1ddec113a74b8e';
const INVARIANTS_SHA='0abaa5eb1c9c93ac506790a79768e8859079baa8800a79d1851e6590d4890844';
const IMMUTABLE_SHA='b3499c7678cba3eb0fea84eb9f0fc1b87fd06248997ecd60ab0573e88d97592c';
const IMMUTABLE_JSON_SHA='8d6b9d120ae8ecab73d39bf38ea3ad8b988e7f171a4129cefb04d0bf33fccdf5';
const BASELINE_SECTIONS_SHA='ec07da4e5f5de455af93f742d2d66362b1ddd305edc2e3d720585c228aa9cda7';
const BASELINE_SOURCE_SHA='b6a65c951dc6c990671ca558580dbfaec97f33d6bf0b1050e83d1b9399c028c2';
const baseline={
 overview:['a800715bf0b3f09f',9849],
 explore:['54b4920fd42ef0cc',10168],
 timeline:['2cb0d00b3b4d421f',1599],
 how:['d1d1e55939463c66',11713],
 beyond:['d5ce05ac3253ca8a',3136],
 cities:['1cdd26be34d79885',2070],
 geography:['5a19ad9c0070e2da',9613],
 economics:['025e46bdaede1f70',13112],
 social:['f1248df8c136df10',2801],
 contention:['6ac6dcf1629b1d8e',3028],
 refusals:['0102bee7eebcb306',1985],
 disputes:['d9f6604986c083ee',2694],
 strange:['dc9c8f1b713fe2c8',1845],
 reveal:['d562f751ea2340a1',2487],
 'inside-round':['1e99763f73e91218',2936],
 'behind-round':['b841f9ad3079193d',2167],
 lugano:['70b39984754f64e4',6378],
 research:['f524fb4d39e0f357',3729],
 paper:['138d1eab640df9a3',1236],
 resources:['00c8fd7ffb8f4cf1',8508],
 sources:['c1c89c7f18cf28fa',2716]
};
function fnv64(s){
 let h=14695981039346656037n;
 for(let i=0;i<s.length;i++){
   h^=BigInt(s.charCodeAt(i));
   h=(h*1099511628211n)&0xffffffffffffffffn;
 }
 return h.toString(16).padStart(16,'0');
}
function sourceSections(source){
const ids=Object.keys(baseline),start=source.indexOf('<div class="iaHomeEntry">');
const end=source.indexOf('<div class="eyebrow" data-i18n="homeGuideLabel">',start);
assert.ok(start>=0&&end>start&&end-start>950&&end-start<1350,'The new Home introduction must be a separate, inspectable addition');
const unwrappedRaw=source.slice(0,start)+source.slice(end);
// Approved 14 October editorial relocation: restore the moved cemetery panel
// *temporarily for the parity comparison*, and check that its standalone
// destination plus Economics teaser exist exactly once. All original 21
// section digests are still checked against their frozen pre-B2 baselines.
const cemeteryOpen='<section class="section" id="cemetery">';
const cemeteryStart=unwrappedRaw.indexOf(cemeteryOpen);
const socialBoundary='</section>\n<section class="section" id="social">';
const cemeteryEnd=unwrappedRaw.indexOf(socialBoundary,cemeteryStart);
const teaserStart=unwrappedRaw.indexOf('<div class="panel" id="economics-cemetery-link">');
assert.ok(cemeteryStart>0&&cemeteryEnd>cemeteryStart&&teaserStart>0&&teaserStart<cemeteryStart,'Cemetery must have one separate Stories chapter and one Economics crosslink');
assert.equal(unwrappedRaw.split(cemeteryOpen).length,2,'Cemetery chapter duplicated');
assert.equal(unwrappedRaw.split('id="economics-cemetery-link"').length,2,'Economics cemetery teaser duplicated');
const movedPanel=unwrappedRaw.slice(cemeteryStart+cemeteryOpen.length,cemeteryEnd);
assert.ok(movedPanel.startsWith('<div class="panel" id="gtld-cemetery">')&&movedPanel.includes('id="helsinki-termination"')&&movedPanel.endsWith('</div>'),'Original cemetery evidence or Helsinki case missing');
const parityRaw=unwrappedRaw.slice(0,teaserStart)+movedPanel+'</section>'+unwrappedRaw.slice(cemeteryEnd+('</section>\n').length);
// .helsinki was added as a reviewed, source-backed editorial supplement
// after the A->B freeze. Subtract ONLY these two exactly identified inserts
// before comparing the untouched 21 A sections against their frozen hashes.
// Assert they exist exactly once, so neither the legacy text nor Helsinki
// may silently disappear on subsequent builds.
const bridge=/<div class="panel cityHelsinkiBridge">[\s\S]*?<\/div>\n(?=<\/section>)/g;
const caseArticle=/\n<article class="helsinkiCase"[\s\S]*?<\/article>/g;
assert.equal((parityRaw.match(bridge)||[]).length,1,'Missing or repeated Helsinki city-context card');
assert.equal((parityRaw.match(caseArticle)||[]).length,1,'Missing or repeated Helsinki termination case');
// Reviewed cross-reference from application outcomes to the independently
// maintained gTLD cemetery: exclude only this exact added link from the
// historic A/B text digest while requiring the live source to retain it.
const outcomesCemeteryLink='<p class="small"><a class="sourceChip" href="#cemetery" data-open-section="cemetery" data-i18n="cemeteryOpenChapter"></a></p>';
assert.equal(parityRaw.split(outcomesCemeteryLink).length,2,'Application outcomes cemetery cross-reference missing or duplicated');
const unwrapped=parityRaw.replace(bridge,'').replace(caseArticle,'').replace(outcomesCemeteryLink,'');
const ranges=ids.map(id=>{
 const re=new RegExp('<section\\b[^>]*\\bid="'+id+'"[^>]*>');
 const found=re.exec(unwrapped);
 assert.ok(found,'Missing canonical editorial section '+id);
 return{id,start:found.index};
}).sort((a,b)=>a.start-b.start);
const sections={};
for(let i=0;i<ranges.length;i++){
 const {id,start}=ranges[i];
 const endPos=ranges[i+1]?.start??unwrapped.indexOf('</main>',start);
 assert.ok(endPos>start,'Missing canonical end boundary '+id);
 sections[id]=unwrapped.slice(start,endPos);
}
assert.equal(Object.keys(sections).length,21,'Lost a canonical A section');
assert.equal((source.match(/class="iaPrimaryLink"/g)||[]).length,6,'Six B2 routes missing');
assert.equal((source.match(/<!-- CTD_IA_B2_HUBS -->/g)||[]).length,1,'B2 hubs not integrated into the normal generator');
return {sections,purposeLedHomeAddedChars:end-start};
}

function sha256(value){return crypto.createHash('sha256').update(value).digest('hex');}
function canonical(value){
 if(Array.isArray(value))return value.map(canonical);
 if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().map(k=>[k,canonical(value[k])]));
 return value;
}
function digestObject(value){return sha256(JSON.stringify(canonical(value)));}
function sectionDigests(source){
 return Object.fromEntries(Object.entries(sourceSections(source).sections).map(([id,segment])=>[id,{sha256:sha256(segment),characters:segment.length}]));
}
function relativeFile(filename){
 assert.ok(typeof filename==='string'&&filename.length>0&&!path.isAbsolute(filename)&&path.posix.normalize(filename)===filename&&!filename.split('/').includes('..')&&!/[?*\\]/.test(filename),'Review must name one exact local file: '+filename);
 if(fs.existsSync(filename))assert.ok(fs.realpathSync(filename).startsWith(fs.realpathSync('.')+path.sep),'Review file must remain in this checkout: '+filename);
 return filename;
}
function checkProtection(review,source,publication){
 relativeFile(ARCHIVED_REVIEW_V85.path);
 assert.ok(fs.existsSync(ARCHIVED_REVIEW_V85.path),'Archived v0.7.85 review is missing');
 assert.equal(sha256(fs.readFileSync(ARCHIVED_REVIEW_V85.path)),ARCHIVED_REVIEW_V85.sha256,'Archived v0.7.85 editorial review was modified');
 assert.equal(review.schemaVersion,1,'Unknown editorial-review schema');
 assert.equal(review.baselineCommit,REVIEW_BASE,'Pre-audit baseline must remain immutable');
 assert.equal(review.originalABBaseline,'safety/main-v0.7.78-before-b2-switch-20261013','Original A backup changed');
 assert.equal(review.originalSectionBaseline,'ec231cc12d35fa91ff5340ad057a483ce23a5ca4','Original section baseline changed');
 assert.equal(review.normalization,'ia-b2-v1','Unknown source normalization');
 assert.equal(digestObject(review.sourceInvariants),INVARIANTS_SHA,'Pre-audit IDs, sections, translation references or links were rewritten');
 assert.equal(digestObject(review.immutableFiles),IMMUTABLE_SHA,'Historical file inventory was rewritten');
 for(const [filename,digest] of Object.entries(review.immutableFiles)){
  relativeFile(filename);
  assert.ok(fs.existsSync(filename),'Historical file missing: '+filename);
  assert.equal(sha256(fs.readFileSync(filename)),digest,'Historical file modified: '+filename);
 }
 assert.equal(digestObject(review.immutableJSON),IMMUTABLE_JSON_SHA,'Historical scientific metadata inventory was rewritten');
 for(const [filename,protection] of Object.entries(review.immutableJSON)){
  relativeFile(filename);
  const value=JSON.parse(fs.readFileSync(filename,'utf8'));
  // Only two current-site metadata properties are mutable. The complete file
  // still needs a reviewed fingerprint; every scientific snapshot property is
  // independently compared to its pre-audit canonical JSON fingerprint.
  for(const key of protection.excludedCurrentMetadata)delete value[key];
  assert.equal(digestObject(value),protection.sha256,'Historical scientific metadata modified: '+filename);
 }
 assert.deepEqual(review.immutableResearchIdentifiers,{RR1:'10.5281/zenodo.23262623',RR2:'10.5281/zenodo.23288603',concept:'10.5281/zenodo.23262622'},'Historical research identifiers changed');
 assert.equal(publication.doi,'10.5281/zenodo.23288603','Published RR2 DOI changed');
 assert.equal(publication.conceptDoi,'10.5281/zenodo.23262622','Published DOI series changed');
 assert.equal(publication.asOf,'2026-10-10','Frozen research cutoff changed');
 const patterns={
  ids:/\bid="([^"]+)"/g,
  sections:/<section\b[^>]*\bclass="[^"]*\bsection\b[^"]*"[^>]*\bid="([^"]+)"/g,
  i18nReferences:/data-i18n="([^"]+)"/g,
  hrefs:/\bhref="([^"]+)"/g
 };
 const replacements=[
  {from:'downloads/connecting-the-dots-data-pack-v0.7.78.zip',to:'{{CURRENT_PACK_PATH}}',publishedPath:publication.currentDataPackPath,rationaleIds:['C01']},
  {from:'downloads/connecting-the-dots-data-pack-v0.7.78.sha256',to:'{{CURRENT_CHECKSUM_PATH}}',publishedPath:publication.currentDataPackPath.replace(/\.zip$/,'.sha256'),rationaleIds:['C01']}
 ];
 assert.deepEqual(review.linkReplacements,replacements,'Only the two reviewed current-pack link replacements are allowed');
 for(const [kind,pattern] of Object.entries(patterns)){
  const actual=new Set([...source.matchAll(pattern)].map(m=>m[1]));
  const missing=review.sourceInvariants[kind].filter(value=>!actual.has(value));
  const unapproved=missing.filter(value=>kind!=='hrefs'||!replacements.some(r=>r.from===value&&actual.has(r.to)&&fs.existsSync(r.from)));
  assert.deepEqual(unapproved,[],'Original source '+kind+' missing: '+unapproved.join(', '));
 }
}
function validateReviewedFiles(review,publication){
 assert.equal(review.status,'reviewed','EDITORIAL_REVIEW_REQUIRED: final hashes have not been reviewed');
 assert.equal(review.reviewedOn,publication.releasedOn,'Review must cover the exact publication date');
 assert.equal(review.publicationVersion,publication.version,'This review does not cover another release');
 assert.equal(publication.releasedOn,review.reviewedOn,'Publication and review dates differ');
 assert.ok(review.files&&review.files['src/index.web.html']&&review.files['data/translations.json'],'Review must include the source and four-language dictionary');
 assert.equal(review.files['src/index.web.html'].baselineSHA256,BASELINE_SOURCE_SHA,'Original source fingerprint changed');
 for(const [filename,item] of Object.entries(review.files)){
  relativeFile(filename);
  assert.ok(/^[a-f0-9]{64}$/.test(item.sha256||''),'Unreviewed file fingerprint: '+filename);
  assert.ok(item.baselineSHA256===null||/^[a-f0-9]{64}$/.test(item.baselineSHA256||''),'Missing baseline fingerprint: '+filename);
  assert.ok(item.rationaleIds?.length&&item.rationaleIds.every(id=>review.rationales[id]),'Unexplained reviewed file: '+filename);
  assert.ok(fs.existsSync(filename),'Reviewed file missing: '+filename);
  assert.equal(sha256(fs.readFileSync(filename)),item.sha256,'File drift after editorial review: '+filename);
 }
 const oldSections=Object.fromEntries(Object.entries(review.sourceSections||{}).map(([id,item])=>[id,{sha256:item.baselineSHA256,characters:item.baselineCharacters}]));
 assert.equal(digestObject(oldSections),BASELINE_SECTIONS_SHA,'Pre-audit section fingerprints were rewritten');
 for(const [id,item] of Object.entries(review.sourceSections)){
  assert.ok(/^[a-f0-9]{64}$/.test(item.sha256||'')&&Number.isInteger(item.characters)&&item.characters>0,'Unreviewed source section: '+id);
  assert.ok(item.rationaleIds?.length&&item.rationaleIds.every(key=>review.rationales[key]),'Editorial section needs a review rationale: '+id);
 }
}
function main(){
 const sourceFile=process.argv.includes('--review-candidates')&&process.argv[3]?process.argv[3]:'src/index.web.html';
 const source=fs.readFileSync(sourceFile,'utf8');
 const {sections,purposeLedHomeAddedChars}=sourceSections(source);
 if(process.argv.includes('--review-candidates')){
  // Inspection only. This command never writes a manifest or declares a review passed.
  console.log(JSON.stringify({sourceSHA256:sha256(source),normalization:'ia-b2-v1',sourceSections:sectionDigests(source)},null,2));
  return;
 }
 const publication=JSON.parse(fs.readFileSync('publication.json','utf8'));
 const REVIEW_PATH=resolveReviewPath(publication);
 const review=fs.existsSync(REVIEW_PATH)?JSON.parse(fs.readFileSync(REVIEW_PATH,'utf8')):null;
 assert.ok(review||['0.7.82','0.7.83'].includes(publication.version),'EDITORIAL_REVIEW_REQUIRED: no exact-file review manifest for this release');
 if(review){checkProtection(review,source,publication);validateReviewedFiles(review,publication);}
 const reviewedSections=[];
 for(const [id,segment] of Object.entries(sections)){
  if(review){
   assert.equal(sha256(segment),review.sourceSections[id].sha256,'Editorial section drift after reviewed changes: '+id);
   assert.equal(segment.length,review.sourceSections[id].characters,'Editorial section size changed after review: '+id);
  }
  const [digest,length]=baseline[id];
  if(segment.length===length&&fnv64(segment)===digest)continue;
  const approved=review?.sourceSections?.[id];
  assert.ok(approved&&/^[a-f0-9]{64}$/.test(approved.sha256||'')&&/^[a-f0-9]{64}$/.test(approved.baselineSHA256||''),'Editorial section requires a specific reviewed SHA-256: '+id);
  assert.ok(approved.rationaleIds?.length&&approved.rationaleIds.every(key=>review.rationales[key]),'Editorial section needs a review rationale: '+id);
  assert.equal(sha256(segment),approved.sha256,'Editorial section drift after reviewed changes: '+id);
  reviewedSections.push(id);
 }
 console.log('IA_B2_SOURCE_PARITY_VERIFIED '+JSON.stringify({baselineMain:'ec231cc12d35fa91ff5340ad057a483ce23a5ca4',reviewedAgainst:review?.baselineCommit||null,preservedSections:Object.keys(sections).length,reviewedSections,purposeLedHomeAddedChars,immutableFilesVerified:review?Object.keys(review.immutableFiles).length:0}));
}
module.exports={sourceSections,sectionDigests,sha256,canonical,checkProtection,validateReviewedFiles,resolveReviewPath};
if(require.main===module){try{main();}catch(error){console.error(error.stack||String(error));process.exitCode=2;}}
