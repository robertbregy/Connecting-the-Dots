const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const ctx={window:{}};vm.runInNewContext(read('data/data_bundle.js'),ctx);const D=ctx.window.DOT_DATA;
assert.equal(D.explorer.length,1688,'static Explorer baseline');
assert.equal(D.explorerMeta.lifeHistoryRecordCount,D.explorer.length,'every static Explorer record has history');
assert.ok(D.explorerMeta.lifeHistoryStaticEventCount>5500,'life-history event floor');
assert.equal(D.tldLifeHistory.gtldContractSource,'https://www.icann.org/resources/registries/gtlds/v2/gtlds.json');
const by=new Map(D.explorer.map(r=>[r.asciiString,r]));
for(const r of D.explorer){
 assert.ok((r.events||[]).length>0,r.string+' missing history');
 if(r.ianaProfile&&r.registrationDate)assert.ok(r.events.some(e=>e.status==='ianaRegistration'&&e.period===r.registrationDate),r.string+' missing IANA registration event');
 if(r.ianaProfile)for(const rep of (r.ianaReports||[]))assert.ok(r.events.some(e=>(e.source||[]).includes(rep.url)&&e.period===rep.date),r.string+' missing IANA report event '+rep.url);
 assert.ok(r.events.some(e=>e.current),r.string+' missing current-state event');
}
assert.ok(by.get('.abarth').events.some(e=>e.status==='ianaRevocationReport'&&e.period==='2023-06-05'));
assert.ok(by.get('.org').events.some(e=>e.status==='ianaTransferReport'&&e.period==='2002-12-09'));
assert.ok(by.get('.web').events.some(e=>e.status==='ianaDelegationReport'&&e.period==='2026-07-23'));
assert.ok(!by.get('.an').events.some(e=>e.status==='ianaDelegationReport'&&e.period==='2011-10-03'),'.an transitional report misclassified');
assert.ok(by.get('.ch').events.some(e=>e.status==='ianaRegistration'&&e.period==='1987-05-20'));
const translations=JSON.parse(read('data/translations.json'));for(const lang of ['en','it','de','fr'])for(const k of ['applicationSubmitted','registryAgreementSigned','registryAgreementTerminated','rootDelegation','registryTransfer','ianaReportEvent','removedFromRoot','revoked','ianaDelegationReport','ianaTransferReport','ianaRevocationReport','ianaRetirementReport','lifeHistorySub','lifeHistoryMethod','gtldAgreementHistoryTitle','release0713'])assert.ok(translations[lang][k],lang+' missing '+k);
const app=read('assets/app.js');for(const token of ['initGtldLifecycle','gtldAgreementSection','lifeHistoryEvents'])assert.ok(app.includes(token),'app missing '+token);
console.log(`TLD Life Histories validated: ${D.explorer.length} records, ${D.explorerMeta.lifeHistoryStaticEventCount} static events, IANA report parity and gTLD contract runtime configured.`);
