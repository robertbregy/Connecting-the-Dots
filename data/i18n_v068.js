/* v0.6.8: event history, provenance and navigation refinements */
(function(){
const O={
 en:{
  roundOverviewNav:'Round overview',
  exploreHistory:'Event history',exploreHistorySub:'Separate events are kept separate so an earlier application is not overwritten by a later delegation or a later round.',
  exploreLatestIndexed:'Latest indexed state',exploreProvenance:'Provenance',applicantDisclosure:'Applicant disclosure',applicantDisclosureDate:'Applicant disclosure · 2 Oct 2026',officialRecordAfterReveal:'Official ICANN application record expected at Reveal Day',
  exploreOpenRecordLabel:'Open record for {name}',idea:'Idea',notSelected:'Not selected',current:'Current',
  luganoProvenanceNote:'Applicant disclosure · 2 Oct 2026. ICANN has confirmed the total number of applications proceeding, but the official public record for individual strings is published at Reveal Day.',
  cityMiniIdea:'IDEA',cityMiniApplication:'APPLICATION',cityMiniLaunch:'DELEGATION / LAUNCH',
  asOfLabel:'as of',
 },
 it:{
  roundOverviewNav:'Quadro generale',
  exploreHistory:'Storia degli eventi',exploreHistorySub:'Gli eventi restano distinti, così una candidatura precedente non viene sovrascritta da una delega successiva o da un round successivo.',
  exploreLatestIndexed:'Ultimo stato indicizzato',exploreProvenance:'Provenienza',applicantDisclosure:'Dichiarazione del candidato',applicantDisclosureDate:'Dichiarazione del candidato · 2 ott 2026',officialRecordAfterReveal:'Record ufficiale ICANN atteso al Reveal Day',
  exploreOpenRecordLabel:'Apri la scheda di {name}',idea:'Idea',notSelected:'Non selezionato',current:'Attuale',
  luganoProvenanceNote:'Dichiarazione del candidato · 2 ottobre 2026. ICANN ha confermato il numero totale delle candidature che procedono, ma il record pubblico ufficiale delle singole stringhe sarà pubblicato al Reveal Day.',
  cityMiniIdea:'IDEA',cityMiniApplication:'CANDIDATURA',cityMiniLaunch:'DELEGA / LANCIO',
  asOfLabel:'dato al',
 },
 de:{
  roundOverviewNav:'Überblick',
  exploreHistory:'Ereignisverlauf',exploreHistorySub:'Getrennte Ereignisse bleiben getrennt, damit eine frühere Bewerbung nicht durch eine spätere Delegation oder Runde überschrieben wird.',
  exploreLatestIndexed:'Letzter indexierter Stand',exploreProvenance:'Provenienz',applicantDisclosure:'Offenlegung durch den Bewerber',applicantDisclosureDate:'Offenlegung durch den Bewerber · 2. Okt. 2026',officialRecordAfterReveal:'Offizieller ICANN-Bewerbungsdatensatz am Reveal Day erwartet',
  exploreOpenRecordLabel:'Datensatz für {name} öffnen',idea:'Idee',notSelected:'Nicht ausgewählt',current:'Aktuell',
  luganoProvenanceNote:'Offenlegung durch den Bewerber · 2. Oktober 2026. ICANN hat die Gesamtzahl der fortgeführten Bewerbungen bestätigt; der offizielle öffentliche Datensatz zu einzelnen Strings wird jedoch erst am Reveal Day veröffentlicht.',
  cityMiniIdea:'IDEE',cityMiniApplication:'BEWERBUNG',cityMiniLaunch:'DELEGATION / START',
  asOfLabel:'Stand',
 },
 fr:{
  roundOverviewNav:'Vue d’ensemble',
  exploreHistory:'Historique des événements',exploreHistorySub:'Les événements restent distincts afin qu’une candidature antérieure ne soit pas écrasée par une délégation ou un round ultérieur.',
  exploreLatestIndexed:'Dernier état indexé',exploreProvenance:'Provenance',applicantDisclosure:'Déclaration du candidat',applicantDisclosureDate:'Déclaration du candidat · 2 oct. 2026',officialRecordAfterReveal:'Dossier ICANN officiel attendu au Reveal Day',
  exploreOpenRecordLabel:'Ouvrir la fiche de {name}',idea:'Idée',notSelected:'Non sélectionné',current:'Actuel',
  luganoProvenanceNote:'Déclaration du candidat · 2 octobre 2026. L’ICANN a confirmé le nombre total de candidatures qui poursuivent le processus, mais le dossier public officiel des chaînes individuelles sera publié au Reveal Day.',
  cityMiniIdea:'IDÉE',cityMiniApplication:'CANDIDATURE',cityMiniLaunch:'DÉLÉGATION / LANCEMENT',
  asOfLabel:'au',
 }
};
for(const [l,o] of Object.entries(O)){Object.assign(window.DOT_I18N[l],o)}
})();
