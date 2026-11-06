/* Prepare exactly one source-attributed editorial release; freeze old data archives. */
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const read=p=>fs.readFileSync(p,'utf8'),load=p=>JSON.parse(read(p)),write=(p,v)=>fs.writeFileSync(p,JSON.stringify(v,null,2)+'\n');
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const pub=load('publication.json'),before=structuredClone(pub);
assert.equal(pub.version,'0.7.96');
assert.equal(pub.editorialReviewPath,'docs/editorial-review-2026-11-06-v0.7.96.json');
assert.equal(pub.releasedOn,'2026-11-06');
assert.equal(pub.asOf,'2026-10-10');
assert.equal(pub.doi,'10.5281/zenodo.23288603');
const stable=(process.env.GITHUB_SHA||'').trim();
assert.match(stable,/^[0-9a-f]{40}$/,'A deterministic source provenance commit is required');
pub.version='0.7.97';pub.releasedOn='2026-11-06';pub.currentDataPackVersion=pub.version;
pub.currentDataPackPath='downloads/connecting-the-dots-data-pack-v0.7.97.zip';
pub.editorialReviewPath='docs/editorial-review-2026-11-06-v0.7.97.json';
pub.buildProvenanceCommit=stable;
assert.deepEqual({...pub,version:before.version,currentDataPackVersion:before.currentDataPackVersion,currentDataPackPath:before.currentDataPackPath,editorialReviewPath:before.editorialReviewPath,buildProvenanceCommit:before.buildProvenanceCommit},before,'Unexpected metadata change');
write('publication.json',pub);
const releases=load('data/release_history.json');
assert.equal(releases.releases[0].version,'0.7.96');
releases.releases.unshift({...releases.releases[0],version:'0.7.97',date:'2026-11-06',summaryKey:'release0797'});
write('data/release_history.json',releases);
const tr=load('data/translations.json');
const summaries={
 it:'Due posizioni del 4 novembre 2026, BRS Media sulla valutazione dei domini comunitari e INTA sulle aste private: Note dal campo e capitolo Contese, senza modifiche ai dati APS.',
 en:'Two 4 November 2026 stakeholder perspectives, BRS Media on community-TLD outcomes and INTA on private auctions: Field Notes and Contention, with no changes to APS data.',
 de:'Zwei Positionen vom 4. November 2026: BRS Media zur Wirkung von Community-Domains und INTA zu privaten Auktionen; Feldnotizen und Konflikte, ohne Änderung der APS-Daten.',
 fr:'Deux positions du 4 novembre 2026 : BRS Media sur les domaines communautaires et INTA sur les enchères privées, dans les Notes de terrain et les conflits, sans changement des données APS.'
};
for(const [lang,v] of Object.entries(summaries)){
 assert.ok(tr[lang].release0796);
 assert.equal(tr[lang].release0797,undefined);
 tr[lang].release0797=v;
}
write('data/translations.json',tr);
const frozen=load('data/frozen_technical_packages.json');
const old='downloads/connecting-the-dots-data-pack-v0.7.96.zip';
assert.ok(fs.existsSync(old));assert.equal(frozen.files[old],undefined,'Old package already frozen');
frozen.files[old]=sha(old);write('data/frozen_technical_packages.json',frozen);
const prev=load('docs/editorial-review-2026-11-06-v0.7.96.json');
assert.equal(prev.status,'reviewed');
const review=structuredClone(prev);
review.reviewId='round-2026-stakeholder-debate-2026-11-06-v0.7.97';
review.status='candidate-pending-editorial-signoff';review.reviewedOn='2026-11-06';review.publicationVersion='0.7.97';
review.parentReview='docs/editorial-review-2026-11-06-v0.7.96.json';
review.rationales.E97='Add four-language, dated, source-linked BRS Media CPE outcome-review request to Field Notes and INTA trademark/auction critique to Field Notes and the existing Contention chapter. Classify both as stakeholder perspectives, not ICANN decisions, not new official numbers, and not an outcome for any application.';
review.rationales.V97='Rebuild one new deterministic technical release v0.7.97, preserving all frozen 2012/2026 APS scientific datasets, RR1/RR2 identifiers and historical ZIPs, including v0.7.96.';
review.linkReplacements=review.linkReplacements.map(x=>({...x,publishedPath:x.publishedPath.replace('0.7.96','0.7.97')}));
review.reviewInstruction='Candidate only. Record exact SHA-256s of generated files, independently confirm historical scientific data unchanged, and require all A/B/browser gates before publication.';
review.verification={...review.verification,reviewedFiles:'pending exact rendered-file signoff',qualityGates:'Independent A/B, four-language native/standalone, browser/WCAG and live-byte checks required'};
review.buildProvenancePolicy={version:'0.7.97',sourceCommit:stable,semantics:'Pinned reviewed generator source commit, not necessarily the final deployment SHA'};
write(pub.editorialReviewPath,review);
const editorial=load('data/round_debate_20261106.json');
assert.deepEqual(editorial.items.map(x=>x.publishedOn),['2026-11-04','2026-11-04']);
write('docs/round-debate-v0797-evidence.json',{
 release:'0.7.97',observedDate:'2026-11-06',sourcePublicationDate:'2026-11-04',
 status:'stakeholder perspectives, NOT official actions',
 sourceIdentifiers:editorial.sources.map(x=>({id:x.id,kind:x.kind,url:x.url})),
 limitedTo:['Field Notes entry','existing Contention chapter','four languages','technical publication identifiers'],
 officialAPS:'frozen as in v0.7.96',scientificArchives:'RR1/RR2 frozen',oldTechnicalZipSHA256:sha(old),
 qualityGates:'pending',humanParticipants:0
});
console.log('DEBATE_V0797_SOURCE_READY',JSON.stringify({sourceCommit:stable,oldZip:sha(old),langs:Object.keys(editorial.languages),pub:pub.version}));
