/* v0.7.2: direct evidence and source-list cleanup */
(function(){
const D=window.DOT_DATA;if(!D)return;
D.metricSources.geo2012='https://newgtlds.icann.org/en/program-status/statistics';
const revealFaq='https://newgtldprogram.icann.org/en/application-rounds/round2/2026-round-general/pre-evaluation-processes/faqs/general/what-happens-on-reveal-day';
if(!D.sources.some(s=>s&&s[1]===revealFaq))D.sources.push(['ICANN — Reveal Day and identical-string contention sets',revealFaq,'primary']);
const seen=new Set();
D.sources=D.sources.filter(s=>{if(!s||!s[1]||seen.has(s[1]))return false;seen.add(s[1]);return true;});
D.v072Version='0.7.2';
})();
