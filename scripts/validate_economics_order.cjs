'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {parseHTML}=require('linkedom');
const root=path.resolve(__dirname,'..');
const config=JSON.parse(fs.readFileSync(path.join(root,'data/economics_reading_order.json'),'utf8'));
const paths=[['en','index.html'],...['it','en','de','fr'].map(l=>[l,l+'/index.html'])];
const expected={value:['#economicModels','#round-application-fees'],reach:['#tld-market-reach'],cases:['#economicGrid'],concentration:['.portfolioEconomics','#economics-contention-2026','[data-round-focus="economics"]'],cycles:['#economic-cycles-2026','.crossRoundDisclosure'],round2026:['.economics2026Stats','#aps-current-economics','#economics-brand-strategy','.historicalEconomy']};
for(const [lang,file] of paths){
 const {document}=parseHTML(fs.readFileSync(path.join(root,file),'utf8'));const sec=document.getElementById('economics');
 assert.equal(sec.dataset.economicsReadingOrder,'six-step-v1');
 const chapters=[...sec.querySelectorAll(':scope > .economicsChapter')];
 assert.deepEqual(chapters.map(n=>n.dataset.economicsStage),config.order);
 assert.deepEqual([...sec.querySelectorAll(':scope > .sectionToc a')].map(n=>n.getAttribute('data-open-anchor')),config.order.map(s=>'economics-'+s));
 for(const [i,n] of chapters.entries()){
  const heading=n.querySelector(':scope > h2');assert.ok(heading);
  assert.equal(heading.textContent,config.locales[lang].titles[i]);
  for(const selector of expected[config.order[i]])assert.equal(n.querySelectorAll(selector).length,1,lang+' stage '+config.order[i]+' missing '+selector);
  assert.equal(n.closest('details'),null,'Main reading step must stay visible');
 }
 assert.equal(sec.querySelectorAll('#economicModels .economicModel').length,8);
 assert.equal(sec.querySelectorAll('#economicGrid .economicCase').length,8);
 for(const id of ['economics-part-1','economics-part-2','economics-part-3','economics-part-4','economics-part-5','economics-part-6','economics-part-7','economics-part-8','economics-part-9','economy-sectors','round-application-fees','economics-contention-2026','economic-cycles-2026','aps-current-economics','tld-market-reach'])assert.ok(document.getElementById(id),lang+' lost legacy fragment '+id);
 assert.ok(document.getElementById('economics-cemetery-link').parentNode===sec);
 assert.ok(document.getElementById('cemetery').parentNode===sec.parentNode);
 const ids=[...sec.querySelectorAll('[id]')].map(n=>n.id);assert.equal(new Set(ids).size,ids.length,'Duplicate Economics ID');
 assert.ok(!sec.querySelector('.economicsChapter h2:not([data-economics-stage-title])'),'Unscoped original h2');
 assert.ok(sec.querySelector('#aps-current-economics .note'),'Missing dataset scope');
 assert.ok(sec.querySelector('.historicalEconomy > .note'),'Missing historical-method warning');
 assert.equal(sec.querySelectorAll('[data-i18n="econEditorialIdentityBody"]').length,1);
 assert.equal(sec.querySelectorAll('[data-i18n="econEditorialPortfolioBody"]').length,1);
 for(const a of sec.querySelectorAll('a[href^="?tab=economics#"]'))assert.ok(document.getElementById(a.getAttribute('href').split('#')[1]),'Broken Economics link');
}
console.log('ECONOMICS_ORDER_STATIC_OK '+JSON.stringify({pages:5,steps:6,models:8,cases:8,legacyFragments:'retained'}));
