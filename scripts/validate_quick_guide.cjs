'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {parseHTML}=require('linkedom');
const root=path.resolve(__dirname,'..'),read=name=>JSON.parse(fs.readFileSync(path.join(root,name),'utf8'));
const data=read('data/audience_editorial.json'),materials=read('data/independent_review_materials.json'),pub=read('publication.json');
assert.equal(materials.humanParticipants,0);assert.equal(materials.independentCoders,0);assert.equal(materials.readerStudy.observedParticipants,0);
assert.deepEqual(materials.readerStudy.plannedParticipants,{nonSpecialists:6,researchers:2});
const blank=fs.readFileSync(path.join(root,'data/reader_observations_blank.csv'),'utf8').trim().split(/\r?\n/);
assert.equal(blank.length,1,'Observation template must contain headers, not fabricated results');
assert.deepEqual(blank[0].split(','),materials.readerStudy.blankObservationFields);
const words={};
for(const lang of ['it','en','de','fr']){
 const t=data.locales[lang].quickGuide;assert.equal(t.steps.length,4);assert.equal(t.ideas.length,3);
 const file=path.join(root,lang,'index.html'),{document}=parseHTML(fs.readFileSync(file,'utf8'));
 const guide=document.getElementById('three-minute-guide');assert.ok(guide&&guide.tagName==='DETAILS');
 assert.equal(guide.querySelectorAll('.quickSteps>li').length,4);
 assert.equal(document.querySelector('.heroPrimary').getAttribute('data-open-anchor'),'three-minute-guide');
 for(const a of guide.querySelectorAll('[data-open-anchor]'))assert.ok(document.getElementById(a.dataset.openAnchor),lang+' missing destination '+a.dataset.openAnchor);
 for(const a of guide.querySelectorAll('a[href^="https:"]'))assert.ok(Object.values(data.everydaySources).some(s=>s.url===a.href),'Unreviewed primary source');
 const text=[t.lead,...t.steps.flatMap(x=>[x.title,x.hook,x.body,x.takeaway]),t.takeawayIntro,...t.ideas].join(' ');
 words[lang]=text.match(/\S+/g).length;assert.ok(words[lang]>=300&&words[lang]<=650,'Estimated short reading path became too long: '+words[lang]);
 const studyFile=path.join(root,'research/reader-study',lang,'index.html');assert.ok(fs.existsSync(studyFile));
 const {document:study}=parseHTML(fs.readFileSync(studyFile,'utf8'));assert.equal(study.documentElement.lang,lang);
 assert.ok(study.querySelector('.status').textContent.includes(materials.readerStudy.locales[lang].observed));
 assert.ok(study.querySelector('.meta').textContent.includes(pub.version));
 assert.equal(study.querySelectorAll('form,input,textarea,script').length,0,'Materials must not collect or transmit participant responses');
 assert.equal(study.querySelectorAll('nav a').length,4);assert.equal(study.querySelectorAll('.phases>ol>li').length,4);
 for(const a of study.querySelectorAll('a[href]')){const rel=a.getAttribute('href').split(/[?#]/)[0];if(!rel||/^https?:/.test(rel))continue;let target=path.resolve(path.dirname(studyFile),rel);if(rel.endsWith('/'))target=path.join(target,'index.html');assert.ok(fs.existsSync(target),'Missing study link '+target)}
}
console.log('QUICK_GUIDE_STATIC_PASS',JSON.stringify({languages:4,readingWords:words,estimatedMinutes:3,observedParticipants:0}));
