/* Candidate exact-file review: prepares evidence, never self-approves the release. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {sectionDigests,checkProtection}=require('./verify_ia_b2_parity.cjs');
const root=path.resolve(__dirname,'..');process.chdir(root);
const read=p=>fs.readFileSync(p);
const hash=p=>crypto.createHash('sha256').update(read(p)).digest('hex');
const base=JSON.parse(read('docs/editorial-review-2026-10-30-v0.7.94.json'));
const publication=JSON.parse(read('publication.json'));
assert.equal(publication.version,'0.7.95');
assert.equal(publication.releasedOn,'2026-11-05');
const review=structuredClone(base), changes=[];
review.reviewId='wikileaks-domain-dns-finance-2026-11-05-v0.7.95';
review.status='candidate-pending-editorial-signoff';
review.reviewedOn=publication.releasedOn;
review.publicationVersion=publication.version;
review.rationales.W95='Source-backed WikiLeaks 2008 and 2010 chronology: distinguish registrar/registration orders from authoritative DNS withdrawal, provider hosting, and payment services, in four languages, without altering frozen RR1/RR2/APS datasets.';
review.rationales.V95='New technical release 0.7.95: update generated cross-language URLs, versioned assets, manifest and reproducible data package; preserve the historical technical archives and scientific DOI identifiers.';
review.linkReplacements=review.linkReplacements.map(item=>({ ...item,publishedPath:item.publishedPath.replace('0.7.94','0.7.95') }));
for(const [filename,item] of Object.entries(review.files)){
 if(!fs.existsSync(filename))throw new Error('Previously reviewed file missing: '+filename);
 const current=hash(filename);
 if(current!==item.sha256){
  changes.push({path:filename,previousSHA256:item.sha256,currentSHA256:current,classification:filename.includes('who-controls-internet-access')?'direct-editorial':filename==='scripts/release_check.py'?'release-gate':'version-or-generated',reviewRequired:true});
  item.sha256=current;item.rationaleIds=[...new Set([...item.rationaleIds,'V95',...(filename.includes('who-controls-internet-access')?['W95']:[])])];
 }
}
const directSources=['data/internet_access_explainer.json','scripts/render_internet_access.py','scripts/validate_internet_access.js','scripts/validate_multilingual.js','data/frozen_technical_packages.json'];
for(const filename of directSources){
 if(!fs.existsSync(filename))throw new Error('Required new direct source missing: '+filename);
 if(review.files[filename])continue;
 review.files[filename]={baselineSHA256:null,sha256:hash(filename),rationaleIds:[filename.includes('internet_access')? 'W95':'V95']};
 changes.push({path:filename,currentSHA256:hash(filename),classification:'new-direct-fingerprint',reviewRequired:true});
}
const src=read('src/index.web.html').toString();
const sectionNow=sectionDigests(src);
for(const [name,now] of Object.entries(sectionNow)){
 if(!review.sourceSections[name])throw new Error('Unreviewed new section: '+name);
 const previous=review.sourceSections[name];
 if(previous.sha256!==now.sha256||previous.characters!==now.characters){
  changes.push({path:'src/index.web.html#'+name,previousSHA256:previous.sha256,currentSHA256:now.sha256,classification:'canonical-section',reviewRequired:true});
  previous.sha256=now.sha256;previous.characters=now.characters;previous.rationaleIds=[...new Set([...previous.rationaleIds,'V95'])];
 }
}
review.approvedCandidateSHA256=hash('src/index.web.html');
review.verification={...review.verification,scope:'5 November 2026: WikiLeaks 2008/2010 editorial update, historical archival protection and v0.7.95 four-language technical release; signoff pending independent gates',reviewType:'AI-assisted evidence-based exact-file and rendered-diff review (pending signoff)',reviewedFiles:'pending-final-signoff',reviewedPaths:Object.keys(review.files).length,changedPathsWithActualSourceHashes:changes.length,currentArchiveSHA256:hash(publication.currentDataPackPath),qualityGates:'A/B continuity, browser/WCAG, multilingual, live-byte verification required before main merge'};
checkProtection(review,src,publication);
const report={release:'0.7.95',reviewedOn:'2026-11-05',baseline:base.publicationVersion,sourceReviewStatus:'candidate-pending-editorial-signoff',requiredSections:Object.keys(review.sourceSections).length,exactFileFingerprints:Object.keys(review.files).length,changedFingerprints:changes.length,changes,sourceLinks:['https://www.aclunorcal.org/cases/bank-julius-baer-co-ltd-v-wikileaks/','https://epic.org/documents/epic-v-doj-fbi-wikileaks/','https://www.theregister.com/on-prem/2010/12/03/wikileaks-dns-pulls-plug-citing-collateral_ddos_damage/','https://www.theguardian.com/media/2010/dec/07/wikileaks-under-attack-definitive-timeline'],invariants:{rootSourceInvariants:'unchanged; validated',historicalTechnicalArchives:'validated by checkProtection',RR1RR2:'unchanged; validated',frozenAPS:'unchanged; validated'}};
fs.writeFileSync(publication.editorialReviewPath,JSON.stringify(review,null,2)+'\n');
fs.writeFileSync('docs/review-v0795-diff-audit.json',JSON.stringify(report,null,2)+'\n');
console.log('W95_CANDIDATE_DIGESTS_PREPARED',JSON.stringify({fileFingerprints:report.exactFileFingerprints,changed:changes.length,sections:report.requiredSections,status:review.status,changes:changes.map(x=>x.path)}));
