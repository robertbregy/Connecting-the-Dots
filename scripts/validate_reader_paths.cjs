#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),{parseHTML}=require('linkedom');
const guide=JSON.parse(fs.readFileSync('data/reading_routes.json','utf8'));
const expected=Object.keys(guide.chapters),reports=[];
for(const locale of ['it','en','de','fr']){
 const {document}=parseHTML(fs.readFileSync(locale+'/index.html','utf8'));
 const seen=new Set();
 assert.equal(document.querySelectorAll('.readerOrientation').length,expected.length,locale+' missing chapter orientation');
 assert.equal(document.querySelectorAll('.readerNext').length,expected.length,locale+' missing continued reading');
 for(const id of expected){
  const sec=document.getElementById(id),orientation=sec?.querySelector(':scope > .readerOrientation'),next=sec?.querySelector(':scope > .readerNext');
  assert.ok(orientation&&next,locale+' incomplete route '+id);
  assert.equal(orientation.dataset.readerOrientation,id);
  assert.equal(orientation.querySelectorAll('.readerBreadcrumb a').length,2);
  assert.equal(next.querySelectorAll('a').length,2);
  assert.equal(next.querySelector('.readerNextPrimary').dataset.openSection,guide.chapters[id].next);
  assert.equal(next.querySelector('.readerNextEvidence').dataset.openSection,guide.chapters[id].verify);
  assert.ok(orientation.querySelector('.readerQuestion').textContent.length>12);
  const outline=sec.querySelector(':scope > .readerOutline');
  if(outline){
    for(const a of outline.querySelectorAll('a')){
      const anchor=a.dataset.openAnchor;
      assert.ok(document.getElementById(anchor)&&sec.contains(document.getElementById(anchor)),locale+' invalid waypoint '+anchor);
      assert.ok(a.textContent.trim().length>2);
      seen.add(id+':'+anchor);
    }
  }
 }
 assert.equal(document.querySelectorAll('.readerResearchShortcut').length,1);
 assert.ok(document.querySelector('link[href*="reading-paths.css"]'));
 assert.equal(document.querySelectorAll('.iaPrimaryLink').length,6,'Navigation must retain six existing areas');
 assert.equal(document.querySelectorAll('.iaHomeJumpList a').length,6,'Home must retain six task routes');
 reports.push({locale,chapters:expected.length,waypoints:seen.size});
}
console.log('READER_PATHS_STATIC_PASS '+JSON.stringify(reports));
