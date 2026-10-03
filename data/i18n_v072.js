/* v0.7.2: precise pre-Reveal contention terminology in all four languages */
(function(){
const T=window.DOT_I18N;if(!T)return;
const patch={
 en:{
  known3:'Preliminary contention sets for identical strings.',
  homeContention2026:'preliminary identical-string contention sets · 2026',
  round2026Contention:'preliminary identical-string contention sets',
  contention2026Label:'preliminary identical-string contention sets · 2026',
  contention2026Sub:'Preliminary contention sets for identical applied-for strings will be available on Reveal Day. They may still change through replacement strings and later string-confusion procedures; 17 November will provide a clearer comparison point.',
  milestoneRevealBody:'Applicants, primary strings, applicable variants/replacements, preliminary identical-string contention sets and public application data.'
 },
 it:{
  known3:'I contention set preliminari per stringhe identiche.',
  homeContention2026:'contention set preliminari per stringhe identiche · 2026',
  round2026Contention:'contention set preliminari per stringhe identiche',
  contention2026Label:'contention set preliminari per stringhe identiche · 2026',
  contention2026Sub:'I contention set preliminari per stringhe richieste identiche saranno disponibili al Reveal Day. Potranno ancora cambiare per effetto delle replacement string e delle successive procedure di string confusion; il 17 novembre offrirà un punto di confronto più chiaro.',
  milestoneRevealBody:'Candidati, stringhe primarie, eventuali variant/replacement, contention set preliminari per stringhe identiche e parti pubbliche delle candidature.'
 },
 de:{
  known3:'Vorläufige Contention Sets für identische Strings.',
  homeContention2026:'vorläufige Contention Sets für identische Strings · 2026',
  round2026Contention:'vorläufige Contention Sets für identische Strings',
  contention2026Label:'vorläufige Contention Sets für identische Strings · 2026',
  contention2026Sub:'Vorläufige Contention Sets für identische beantragte Strings werden am Reveal Day verfügbar sein. Sie können sich durch Replacement Strings und spätere String-Confusion-Verfahren noch ändern; der 17. November bietet einen klareren Vergleichspunkt.',
  milestoneRevealBody:'Antragsteller, primäre Strings, gegebenenfalls Varianten/Replacement Strings, vorläufige Contention Sets für identische Strings und öffentliche Bewerbungsdaten.'
 },
 fr:{
  known3:'Les contention sets préliminaires pour des chaînes identiques.',
  homeContention2026:'contention sets préliminaires pour des chaînes identiques · 2026',
  round2026Contention:'contention sets préliminaires pour des chaînes identiques',
  contention2026Label:'contention sets préliminaires pour des chaînes identiques · 2026',
  contention2026Sub:'Les contention sets préliminaires pour des chaînes demandées identiques seront disponibles au Reveal Day. Ils pourront encore évoluer avec les replacement strings et les procédures ultérieures de string confusion ; le 17 novembre offrira un point de comparaison plus clair.',
  milestoneRevealBody:'Candidats, chaînes primaires, variantes/replacement strings éventuelles, contention sets préliminaires pour des chaînes identiques et parties publiques des candidatures.'
 }
};
for(const [lang,values] of Object.entries(patch))Object.assign(T[lang],values);
})();
