'use strict';
const assert=require('node:assert/strict');

// CLS is the largest session window: gaps < 1 s and duration < 5 s.
// Match GoogleChrome/web-vitals LayoutShiftManager, including leading zero shifts.
function calculateLayoutShiftMetrics(entries){
 assert.ok(Array.isArray(entries),'Layout-shift observations must be an array');
 for(const entry of entries){
  assert.ok(Number.isFinite(entry.startTime)&&entry.startTime>=0,'Invalid layout-shift startTime');
  assert.ok(Number.isFinite(entry.value)&&entry.value>=0,'Invalid layout-shift value');
  assert.equal(typeof entry.hadRecentInput,'boolean','Missing layout-shift input classification');
 }
 let first=null,last=null,session=0,cls=0,observedLayoutShiftSum=0;
 for(const entry of [...entries].sort((a,b)=>a.startTime-b.startTime)){
  if(entry.hadRecentInput)continue;
  observedLayoutShiftSum+=entry.value;
  if(session===0||first===null||entry.startTime-last>=1000||entry.startTime-first>=5000){
   first=entry.startTime;session=entry.value;
  }else session+=entry.value;
  last=entry.startTime;cls=Math.max(cls,session);
 }
 return {cls,observedLayoutShiftSum};
}
module.exports={calculateLayoutShiftMetrics};
