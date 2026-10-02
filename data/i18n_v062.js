/* v0.6.2: attribution, disclaimer and i18n audit */
(function(){
const X={
 en:{
  projectByline:'Independent research project by <strong>Robert Bregy</strong>.',
  projectDisclaimer:'This project does not represent an official position of the City of Lugano.',
  footerAttribution:'Research, analysis and editorial interpretation by Robert Bregy.',
  explorePlaceholderBadge:'PROVISIONAL DATASET'
 },
 it:{
  projectByline:'Progetto di ricerca indipendente di <strong>Robert Bregy</strong>.',
  projectDisclaimer:'Il progetto non rappresenta una posizione ufficiale della Città di Lugano.',
  footerAttribution:'Ricerca, analisi e interpretazione editoriale di Robert Bregy.',
  roleRegistry:'Operatore del registro',roleRsp:'Registry Service Provider (RSP)',roleRegistrar:'Registrar',roleRegistrant:'Titolare (registrant)',
  round2000:'Prova di concetto',tl2000Title:'Prova di concetto',adult:'Adulti',personalBrand:'Brand personale',lifestyle:'Stile di vita',
  beyondDownload:'Oltre il punto',rspDownload:'Geografia RSP',milestoneConfirm:'17 NOV · CONFERMA DELLA STRINGA',typeCountryCode:'Codice paese',
  explorePlaceholderBadge:'DATASET PROVVISORIO'
 },
 de:{
  projectByline:'Unabhängiges Forschungsprojekt von <strong>Robert Bregy</strong>.',
  projectDisclaimer:'Dieses Projekt gibt keine offizielle Position der Stadt Lugano wieder.',
  footerAttribution:'Recherche, Analyse und redaktionelle Einordnung: Robert Bregy.',
  roleRegistry:'Registry-Betreiber',roleRegistrar:'Registrar / Registrierungsstelle',roleRegistrant:'Domaininhaber (Registrant)',
  applications:'Bewerbungen',applicants:'Bewerber',geographic:'Geografisch',
  round2000:'Proof of Concept',round2004:'Runde für gesponserte TLDs',round2012:'Massive Erweiterung',round2026:'Nächste Runde',
  tl1999Title:'Die Idee der Stadt-TLD entsteht',tl1999Body:'Das Konzept für .berlin lässt sich bis 1999 zurückverfolgen.',
  tl2000Title:'Proof of Concept',tl2000Body:'47 Bewerbungen. Sogar .nyc ist dabei, wird später jedoch zurückgezogen.',
  tl2004Title:'Gesponserte Gemeinschaften',tl2004Body:'10 Bewerbungen für 9 Strings: .asia, .cat, .jobs, .mail, .mobi, .post, .tel, .travel und .xxx.',
  tl2012Title:'Die Explosion',tl2012Body:'1.930 Bewerbungen, rund 1.400 eindeutige Strings und 66 geografische Bewerbungen.',
  tl2014Title:'Städte gehen online',tl2014Body:'.berlin öffnet für die Öffentlichkeit; .nyc und .paris werden delegiert.',
  tl2026Title:'Die nächste Ebene',tl2026Body:'1.616 bezahlte Bewerbungen gehen in das Verfahren. Reveal Day: 7. Oktober 2026. .lugano kommt ins Spiel.',
  adult:'Inhalte für Erwachsene',
  plan1:'Offiziellen APS-Datensatz erfassen.',
  plan2:'Primäre, Ersatz- und Varianten-Strings normalisieren.',
  plan3:'Konfliktgruppen und Bewerberzahlen aufbauen.',
  plan4:'Geografie/Städte, Marken, Communities, KI/Agenten, Identität/Vertrauen, Finanzen/Krypto und weitere redaktionelle Themen klassifizieren.',
  plan5:'Mit 2000, 2004 und 2012 vergleichen.',
  plan6:'LinkedIn-taugliche Fakten und herunterladbare Datenexporte erzeugen.',
  beyondDownload:'Jenseits des Punkts',rspDownload:'RSP-Geografie',explorePlaceholderBadge:'VORLÄUFIGER DATENSATZ'
 },
 fr:{
  projectByline:'Projet de recherche indépendant de <strong>Robert Bregy</strong>.',
  projectDisclaimer:'Ce projet ne représente pas une position officielle de la Ville de Lugano.',
  footerAttribution:'Recherche, analyse et interprétation éditoriale : Robert Bregy.',
  roleRegistry:'Opérateur de registre',roleRsp:'Fournisseur de services de registre (RSP)',roleRegistrar:'Bureau d’enregistrement',roleRegistrant:'Titulaire (registrant)',
  applications:'candidatures',applicants:'candidats',geographic:'Géographique',community:'Communauté',
  round2000:'Preuve de concept',round2004:'Round des TLD sponsorisés',round2012:'Expansion massive',round2026:'Prochain round',
  tl1999Title:'L’idée du TLD urbain apparaît',tl1999Body:'Le concept .berlin remonte à 1999.',
  tl2000Title:'Preuve de concept',tl2000Body:'47 candidatures. Même .nyc apparaît, puis est retiré.',
  tl2004Title:'Communautés sponsorisées',tl2004Body:'10 candidatures pour 9 chaînes : .asia, .cat, .jobs, .mail, .mobi, .post, .tel, .travel et .xxx.',
  tl2012Title:'L’explosion',tl2012Body:'1 930 candidatures, environ 1 400 chaînes uniques et 66 candidatures géographiques.',
  tl2014Title:'Les villes passent en ligne',tl2014Body:'.berlin ouvre au public ; .nyc et .paris sont délégués.',
  tl2026Title:'La couche suivante',tl2026Body:'1 616 candidatures payées poursuivent le processus. Reveal Day : 7 octobre 2026. .lugano entre en scène.',
  adult:'Adulte',personalBrand:'Marque personnelle',
  plan1:'Capturer le jeu de données APS officiel.',
  plan2:'Normaliser les chaînes principales, de remplacement et variantes.',
  plan3:'Construire les ensembles de contention et les décomptes par candidat.',
  plan4:'Classer la géographie/les villes, les marques, les communautés, l’IA/les agents, l’identité/la confiance, la finance/crypto et les autres thèmes éditoriaux.',
  plan5:'Comparer avec 2000, 2004 et 2012.',
  plan6:'Produire des faits prêts pour LinkedIn et des exports de données téléchargeables.',
  beyondDownload:'Au-delà du point',rspDownload:'Géographie des RSP',explorePlaceholderBadge:'JEU DE DONNÉES PROVISOIRE'
 }
};
for(const [l,o] of Object.entries(X))Object.assign(window.DOT_I18N[l],o);
})();
