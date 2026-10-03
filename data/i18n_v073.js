/* v0.7.3: metadata and static-page accessibility labels */
(function(){
const T=window.DOT_I18N;if(!T)return;
const patch={
 en:{metaTitle:'Connecting the Dots — Internet domains, identity and trust',languageVersions:'Language versions',staticReading:'JavaScript is disabled. All sections are available below; use the links to navigate or choose another language.',metaDatasetName:'Connecting the Dots — TLD research data pack',metaDatasetDescription:'Curated and normalized data supporting the Connecting the Dots research publication on TLDs, Internet governance and the 2026 ICANN round.'},
 it:{metaTitle:'Connecting the Dots — Domini Internet, identità e fiducia',languageVersions:'Versioni linguistiche',staticReading:'JavaScript è disattivato. Tutte le sezioni sono disponibili qui sotto; usa i collegamenti per navigare o scegliere un’altra lingua.',metaDatasetName:'Connecting the Dots — Dati di ricerca sui TLD',metaDatasetDescription:'Dati selezionati e normalizzati a supporto della ricerca Connecting the Dots sui TLD, sulla governance di Internet e sul round ICANN 2026.'},
 de:{metaTitle:'Connecting the Dots — Internetdomains, Identität und Vertrauen',languageVersions:'Sprachversionen',staticReading:'JavaScript ist deaktiviert. Alle Abschnitte stehen unten zur Verfügung; verwenden Sie die Links zur Navigation oder zur Sprachauswahl.',metaDatasetName:'Connecting the Dots — TLD-Forschungsdaten',metaDatasetDescription:'Kuratierte und normalisierte Daten zur Forschungsarbeit Connecting the Dots über TLDs, Internet-Governance und die ICANN-Runde 2026.'},
 fr:{metaTitle:'Connecting the Dots — Domaines Internet, identité et confiance',languageVersions:'Versions linguistiques',staticReading:'JavaScript est désactivé. Toutes les sections sont disponibles ci-dessous ; utilisez les liens pour naviguer ou choisir une autre langue.',metaDatasetName:'Connecting the Dots — Données de recherche sur les TLD',metaDatasetDescription:'Données sélectionnées et normalisées à l’appui de la recherche Connecting the Dots sur les TLD, la gouvernance d’Internet et le cycle ICANN 2026.'}
};
for(const [lang,values] of Object.entries(patch))Object.assign(T[lang],values);
})();
