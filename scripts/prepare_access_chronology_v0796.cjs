/* Chronological case order: evidence-preserving preparation for release v0.7.96. */
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto'),cp=require('node:child_process');
const read=p=>fs.readFileSync(p,'utf8'),json=p=>JSON.parse(read(p)),write=(p,x)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+'\n'),sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const expected=['china-2023','russia-2024','iran-2025','swiss-2026','catalonia-2017','wikileaks-2008','wikileaks-2010'];
const order=['wikileaks-2008','wikileaks-2010','catalonia-2017','china-2023','russia-2024','iran-2025','swiss-2026'];
const obj=json('data/internet_access_explainer.json');
assert.equal(obj.reviewedOn,'2026-11-05');
assert.deepEqual(obj.cases.map(c=>c.id),expected,'Historical order changed; inspect before editing');
const preserved=Object.fromEntries(obj.cases.map(c=>[c.id,JSON.stringify(c)]));
obj.cases.sort((a,b)=>order.indexOf(a.id)-order.indexOf(b.id));
assert.deepEqual(obj.cases.map(c=>c.id),order);
for(const c of obj.cases)assert.equal(JSON.stringify(c),preserved[c.id],'Historical case mutated');
const leads={
 it:'Sette casi documentati in ordine cronologico, dal 2008 al 2026. Episodi e meccanismi differenti: non una classifica mondiale della censura.',
 en:'Seven documented cases in chronological order, from 2008 to 2026. Distinct events and mechanisms, not a global censorship ranking.',
 de:'Sieben dokumentierte Fälle in chronologischer Reihenfolge, von 2008 bis 2026. Unterschiedliche Ereignisse und Mechanismen, keine weltweite Zensurrangliste.',
 fr:'Sept cas documentés dans l’ordre chronologique, de 2008 à 2026. Des épisodes et des mécanismes distincts, pas un classement mondial de la censure.'
};
for(const [lang,lead] of Object.entries(leads)){assert.ok(obj.languages[lang].examplesLead);obj.languages[lang].examplesLead=lead}
obj.reviewedOn='2026-11-06';
write('data/internet_access_explainer.json',obj);

const pub=json('publication.json');
assert.equal(pub.version,'0.7.95');assert.equal(pub.editorialReviewPath,'docs/editorial-review-2026-11-05-v0.7.95.json');
pub.version='0.7.96';pub.releasedOn='2026-11-06';pub.currentDataPackVersion='0.7.96';
pub.currentDataPackPath='downloads/connecting-the-dots-data-pack-v0.7.96.zip';
pub.editorialReviewPath='docs/editorial-review-2026-11-06-v0.7.96.json';
write('publication.json',pub);

const release=json('data/release_history.json');
assert.equal(release.releases[0].version,'0.7.95');
release.releases.unshift({...release.releases[0],version:'0.7.96',date:'2026-11-06',summaryKey:'release0796'});
write('data/release_history.json',release);
const tr=json('data/translations.json');
const labels={
 it:'Sette casi sul controllo dell’accesso a Internet in ordine cronologico (2008–2026), in quattro lingue: contenuti e fonti invariati, con i due episodi WikiLeaks distinti.',
 en:'Seven Internet-access control case studies presented chronologically (2008–2026) across four languages; unchanged evidence and separate WikiLeaks episodes.',
 de:'Sieben Fallbeispiele zur Internetzugangskontrolle in chronologischer Reihenfolge (2008–2026), in vier Sprachen; unveränderte Belege und getrennte WikiLeaks-Ereignisse.',
 fr:'Sept études de cas sur le contrôle de l’accès à Internet, classées chronologiquement (2008–2026) en quatre langues ; sources inchangées et épisodes WikiLeaks distincts.'
};
for(const lang of Object.keys(labels)){assert.ok(tr[lang].release0795,'Missing old release summary');assert.equal(tr[lang].release0796,undefined,'Already versioned');tr[lang].release0796=labels[lang]}
write('data/translations.json',tr);

const frozen=json('data/frozen_technical_packages.json');
const old='downloads/connecting-the-dots-data-pack-v0.7.95.zip';
assert.equal(frozen.files[old],undefined);
assert.ok(fs.existsSync(old),'Previous published technical ZIP missing');
frozen.files[old]=sha(old);
write('data/frozen_technical_packages.json',frozen);

const prev=json('docs/editorial-review-2026-11-05-v0.7.95.json');
assert.equal(prev.status,'reviewed');
const review=structuredClone(prev);
review.reviewId='access-cases-chronology-2026-11-06-v0.7.96';
review.status='candidate-pending-editorial-signoff';
review.reviewedOn='2026-11-06';review.publicationVersion='0.7.96';
review.parentReview='docs/editorial-review-2026-11-05-v0.7.95.json';
review.rationales.C96='Present exactly the same seven evidence-backed cases in historical order 2008, 2010, 2017, 2023, 2023-2024, 2025 and 2026. Keep every case body, date, source and source ID byte-for-byte; only reorder the canonical array and refresh a localized introductory sentence in four languages.';
review.rationales.V96='New v0.7.96 site/data-package identity, new review date, versioned download and manifest. Freeze previous v0.7.95 archive by SHA-256; retain immutable RR1/RR2 and all earlier technical packages.';
review.linkReplacements=review.linkReplacements.map(r=>({...r,publishedPath:r.publishedPath.replace('0.7.95','0.7.96')}));
review.reviewInstruction='Candidate only: record generated exact-file SHA-256, verify case equivalence and protected scientific archives, run independent browser and A/B acceptance before main.';
review.verification={...review.verification,qualityGates:'Pending independent A/B and browser/WCAG on exact candidate'};
write(pub.editorialReviewPath,review);
write('docs/access-chronology-v0796-evidence.json',{
 release:'0.7.96',reviewedOn:'2026-11-06',
 before:expected,after:order,unchangedCaseContent:Object.keys(preserved),caseFingerprints:Object.fromEntries(Object.entries(preserved).map(([k,v])=>[k,crypto.createHash('sha256').update(v).digest('hex')])),
 dataDiffScope:'order, four localized introductory leads, review date only',
 previousTechnicalArchiveSHA256:sha(old),
 frozenScientificArchives:'must remain unchanged',
 humanParticipants:0,
 qualityGates:'pending'
});
console.log('ACCESS_CHRONOLOGY_SOURCE_READY',JSON.stringify({order,langs:Object.keys(leads),version:pub.version,oldZip:sha(old)}));
