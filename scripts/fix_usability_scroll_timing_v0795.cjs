// Preserve strict viewport assertions but wait for the app's queued requestAnimationFrame scroll.
// The old test sampled the rect synchronously even though app.js schedules scrolling in rAF.
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const p='scripts/usability_remediation_qa.cjs',original=fs.readFileSync(p,'utf8');
const match="      const rect=await page.locator('#'+id).boundingBox();assert.ok(rect&&rect.y>=0&&rect.y<900,'Legacy destination not reached: '+id);";
assert.equal(original.split(match).length,2,'Original legacy-link assertion changed: review test instead of patching blindly');
const replacement="      // app.js schedules the actual scroll in requestAnimationFrame. Wait for that scroll,\n"+
"      // but still fail if the original target does not enter the viewport within 3.5s.\n"+
"      await page.waitForFunction(id=>{const el=document.getElementById(id);if(!el)return false;const r=el.getBoundingClientRect();return r.height>0&&r.y>=0&&r.y<innerHeight;},id,{timeout:3500});\n"+
match;
fs.writeFileSync(p,original.replace(match,replacement));
console.log('W95_RAF_TIMING_ACCEPTANCE_GUARD_INSTALLED');
