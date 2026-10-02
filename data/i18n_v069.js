/* v0.6.9: concise in-section navigation labels */
(function(){
const O={
 en:{
  tocHowAnatomy:'Domain anatomy',tocHowRoles:'Who does what',tocHowBirth:'Creating a TLD',tocHowTerms:'Precise terms',tocHowLuganoCase:'The .lugano case',tocHowLuganoGovernance:'.lugano governance',tocHowLuganoLanguage:'Talking about .lugano'
 },
 it:{
  tocHowAnatomy:'Anatomia del dominio',tocHowRoles:'Chi fa cosa',tocHowBirth:'Come nasce un TLD',tocHowTerms:'Parole precise',tocHowLuganoCase:'Il caso .lugano',tocHowLuganoGovernance:'Governance .lugano',tocHowLuganoLanguage:'Parlare di .lugano'
 },
 de:{
  tocHowAnatomy:'Aufbau einer Domain',tocHowRoles:'Wer macht was',tocHowBirth:'Entstehung einer TLD',tocHowTerms:'Präzise Begriffe',tocHowLuganoCase:'Fall .lugano',tocHowLuganoGovernance:'Governance .lugano',tocHowLuganoLanguage:'Über .lugano sprechen'
 },
 fr:{
  tocHowAnatomy:'Anatomie d’un domaine',tocHowRoles:'Qui fait quoi',tocHowBirth:'Création d’un TLD',tocHowTerms:'Termes précis',tocHowLuganoCase:'Cas .lugano',tocHowLuganoGovernance:'Gouvernance .lugano',tocHowLuganoLanguage:'Parler de .lugano'
 }
};
for(const [l,o] of Object.entries(O)){Object.assign(window.DOT_I18N[l],o)}
})();
