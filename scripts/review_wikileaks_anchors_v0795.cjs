// Read-only baseline comparison and explicit review of the exact stable-anchor delta.
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto'),cp=require('node:child_process'),{parseHTML}=require('linkedom');
const path=require('node:path');
const sh=(...args)=>cp.execFileSync('git',args,{encoding:'utf8',maxBuffer:40*1024*1024});
const digest=x=>crypto.createHash('sha256').update(x).digest('hex');
const root=process.cwd();
const pub=JSON.parse(fs.readFileSync('publication.json','utf8'));
assert.equal(pub.version,'0.7.95');
const reviewPath=pub.editorialReviewPath,review=JSON.parse(fs.readFileSync(reviewPath,'utf8'));
assert.equal(review.status,'reviewed');
const pages=['index.html',...['en','it','de','fr'].map(l=>l+'/index.html'),...['en','it','de','fr'].map(l=>'behind-the-round/'+l+'/who-controls-internet-access/index.html')];
const allowed=new Set(['scripts/reader_first.cjs','scripts/usability_remediation_qa.cjs','docs/reader-first-structure.json',...pages]);
const changed=sh('diff','--name-only').trim().split('\n').filter(Boolean);
assert.ok(changed.includes('scripts/reader_first.cjs'),'Missing targeted generator repair');
for(const file of changed)assert.ok(allowed.has(file),'Unexpected change outside targeted anchor repair: '+file);
const proof=[];
for(const file of pages){
  const before=fs.readFileSync(file,'utf8');
  const rawOld=sh('show','c5fb79225488abf787602872585a398705579a54:'+file);
  const rawCandidate=sh('show','HEAD:'+file);
  const old=parseHTML(rawOld).document,orig=parseHTML(rawCandidate).document,now=parseHTML(before).document;
  const ids=[...now.querySelectorAll('[id]')].map(n=>n.id);
  assert.equal(new Set(ids).size,ids.length,'Duplicate document IDs in '+file);
  const oldIds=[...old.querySelectorAll('[id]')].map(n=>n.id);
  for(const id of oldIds)assert.ok(now.getElementById(id),'Lost previously published fragment: '+file+'#'+id);
  let headings=0;
  for(const h of old.querySelectorAll('h2[id^="reader-anchor-governance-access-"],h2[id^="reader-anchor-reader-main-"]')){
    if(!file.includes('who-controls-internet-access')&&!h.id.startsWith('reader-anchor-governance-access-'))continue;
    const target=now.getElementById(h.id);
    assert.ok(target&&target.textContent===h.textContent,'Published heading shifted: '+file+'#'+h.id);headings++;
  }
  const oldTitle=old.querySelector('h2#reader-anchor-governance-access-1');
  if(oldTitle)assert.equal(now.getElementById(oldTitle.id)?.textContent,oldTitle.textContent,'Old title anchor lost');
  const clean=d=>{
    for(const n of d.querySelectorAll('[data-reader-ui]'))n.remove();
    return {text:d.querySelector('main')?.textContent,links:[...d.querySelectorAll('main a[href]')].map(x=>x.getAttribute('href')).sort()};
  };
  assert.deepEqual(clean(now),clean(orig),'Editorial text or source links changed during anchor repair: '+file);
  proof.push({file,publishedIdsRetained:oldIds.length,publishedHeadingTargetsChecked:headings,sha256:digest(fs.readFileSync(file))});
}
review.rationales.A95='Maintain v0.7.94 public heading anchors after inserting WikiLeaks payment case: exact published fragment IDs still refer to the same headings; no text, source, URL, dataset or frozen archive changes.';
review.rationales.Q95='The existing usability acceptance sometimes asserted scroll before the application requestAnimationFrame callback ran. Keep the identical strict viewport destination assertion and allow up to 3.5 seconds for the real asynchronous scroll to complete; do not skip tests, alter routes or accept an offscreen target.';
const finalPaths=[...changed];
for(const file of finalPaths){
  const next=digest(fs.readFileSync(file));
  const prior=review.files[file];
  if(prior){prior.sha256=next;prior.rationaleIds=[...new Set([...prior.rationaleIds,file==='scripts/usability_remediation_qa.cjs'?'Q95':'A95'])];}
  else{review.files[file]={baselineSHA256:digest(sh('show','HEAD:'+file)),sha256:next,rationaleIds:[file==='scripts/usability_remediation_qa.cjs'?'Q95':'A95']};}
}
review.anchorCompatibilityReview={reviewedOn:'2026-11-06',priorFailure:'reader-anchor-governance-access-6 missing',proof,changedPaths:finalPaths,scope:'stable heading IDs and strict rAF-aware QA timing only; unchanged editorial and research evidence',humanParticipants:0,gate:'A/B plus independent browser/WCAG suite required on committed branch'};
fs.writeFileSync(reviewPath,JSON.stringify(review,null,2)+'\n');
fs.writeFileSync('docs/v0795-anchor-compatibility-review.json',JSON.stringify({reviewedOn:'2026-11-06',base:'c5fb79225488abf787602872585a398705579a54',changedPaths:finalPaths,proof},null,2)+'\n');
console.log('W95_PREVIOUS_PUBLIC_ANCHORS_VALIDATED',JSON.stringify({files:proof.length,changed:changed.length,legacyIds:proof.reduce((a,b)=>a+b.publishedIdsRetained,0),headings:proof.reduce((a,b)=>a+b.publishedHeadingTargetsChecked,0)}));
