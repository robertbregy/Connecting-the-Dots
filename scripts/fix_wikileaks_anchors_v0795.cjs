// Narrow compatibility repair for stable, publicly linked reader anchors.
// Run on the v0.7.95 candidate, not on main. This changes only the renderer.
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const file='scripts/reader_first.cjs';
const before=fs.readFileSync(file,'utf8');
const actual=crypto.createHash('sha256').update(before).digest('hex');
const planned=[
'function headingsFor(section) {',
"    headingsFor(section).forEach((h, i) => { if (!h.id) h.id = 'reader-anchor-' + id + '-' + (i + 1); });",
'  const index = toc(d, main, lang, true); if (index) {'
];
for(const fragment of planned)assert.equal(before.split(fragment).length,2,'Renderer insertion point changed: '+fragment);
const helper=`// Stable v0.7.94 heading fragments must survive extra editorial sections.
// The other headings already have semantic IDs used by ARIA and MUST NOT be renamed.
function preserveAccessHeadingIds(section) {
  const native=section.id==='governance-access';
  if(!native && !section.matches('main.accessArticle'))return;
  const stem='reader-anchor-'+(native?'governance-access':'reader-main')+'-';
  const intro=section.querySelector('.accessIntro > h2');
  const panels=[...section.querySelectorAll('section.accessPanel > h2')];
  assert.ok(intro && panels.length===4,'Unexpected access guide headings; abort compatibility fix');
  if(native){
    const title=section.querySelector('.ctdNativeHeading');
    assert.ok(title && !title.id,'Unexpected original access title ID');
    title.id=stem+'1';
  }
  assert.ok(!intro.id,'Unexpected original access intro ID');
  intro.id=stem+(native?2:1);
  for(const [i,heading] of panels.entries()){
    assert.ok(!heading.id,'Unexpected original access panel ID');
    heading.id=stem+(i+(native?6:5));
  }
}
`;
let out=before.replace(planned[0],helper+planned[0]);
out=out.replace(planned[1],'    preserveAccessHeadingIds(section);\n'+planned[1]);
out=out.replace(planned[2],'  preserveAccessHeadingIds(main);\n'+planned[2]);
assert.notEqual(out,before);
fs.writeFileSync(file,out);
console.log('W95_STABLE_ANCHOR_GENERATOR_PATCHED',actual);
