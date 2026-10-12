# Connecting the Dots | B2, criteri di accettazione e pubblicazione

**Stato:** piano operativo, nessuna autorizzazione al merge.  
**Baseline A:** `main` al commit `ec231cc12d35fa91ff5340ad057a483ce23a5ca4`, snapshot `v0.7.78`.  
**Candidato B:** `feat/ia-rearchitecture-20261012`, sempre separato da produzione.

## Cosa significherebbe «B completa»

B non è una seconda copia del progetto. È la stessa pubblicazione strutturata con cinque accessi per scopo: **Capire, Esplorare, Storie e questioni, Round 2026, Ricerca**. Devono essere verificabili contemporaneamente:

1. **Home di primo incontro:** il progetto è descritto esplicitamente come atlante multilingue di ricerca e divulgazione, non servizio di registrazione di domini; le cinque scelte sono visibili da subito anche da smartphone.
2. **Completezza:** 21 sezioni originali conservate, nuova Home composta per aggiunta, Explorer e archivio delle candidature intatti; non basta avere card che rimandano a contenuti esterni.
3. **Continuità:** 39 URL canonici totali, 35 pagine autonome con navigazione coerente, deep link storici, query `?tab=`, ancore, lingua e ritorno dalle pagine scientifiche.
4. **Integrità scientifica:** distinzione fra TLD delegato, stringa, Application ID, record `-R`; 1.615 ufficiale ICANN vs 1.614 ID pubblicati vs 2.783 righe APS come quantità diverse con fonti/date. Non inventare perché alcuni conteggi divergono.
5. **Citazione:** DOI RR2 `10.5281/zenodo.23288603`, RR1 `10.5281/zenodo.23262623` e concept DOI restano immutati; il sito tecnico `v0.7.78` non viene spacciato per una nuova release scientifica.
6. **Qualità d'uso:** smartphone (anche 320/360/390px), desktop, quattro lingue, tastiera, focus, contrasto, dark mode, Explorer, Atlas, filtri, simulatori, WCAG A/AA.
7. **SEO e provenienza:** canonical, hreflang reciproci, 39 indirizzi del sitemap, fonte primaria, idempotenza del generatore, determinismo del pacchetto e link funzionanti.
8. **Reversibilità:** produzione congelata e recuperabile prima del merge; nuova release soltanto dopo un esito completo dei workflow e approvazione esplicita.

## Evidenze automatizzate già disponibili

- `scripts/verify_ia_b2_parity.cjs`: controlla le 21 sezioni rispetto alle impronte della baseline A. Sul confronto eseguito il 13 ottobre, venti risultavano identiche; la Home torna identica una volta rimosso il nuovo blocco introduttivo. Una modifica editoriale intenzionale deve aggiornare il contratto **solo dopo** controllo documentato.
- `scripts/audit_ia_b2.cjs`: browser Chromium, 8 combinazioni di lingua e dispositivo, 25 accessi ai contenuti, 35 pagine autonome, ritorno dall'Atlas, orientamento nella prima schermata, fonti/link preview e alcune verifiche axe.
- `scripts/validate_multilingual.js`: traduzioni, canonical/hreflang, 21 sezioni e contenuti di riferimento.
- `scripts/release_check.py`: integrità dati e stati temporali, RR2, pacchetti; include controllo dei riferimenti correnti nelle pagine di ricerca e nelle due versioni del paper.
- `.github/workflows/audit-browser.yml`: regressione generale completa, indipendente dall'audit B2, comprensiva di accessibilità e degli strumenti dinamici.
- `.github/workflows/rebuild.yml`: ricostruzione deterministica in feature senza scrivere su `main`; se il branch cambia durante la build evita rebase e force push.

**Nota:** il verde di una suite automatizzata non equivale ad accessibilità certificata o comprensione verificata da un gruppo rappresentativo. Il feedback beta è utile, ma descrittivo e limitato.

## Gate finale vincolante

- [ ] `main` aggiornato e confronto `main...B` senza divergenze di contenuto involontarie; dati recenti da A riportati in B se il sito A è cambiato.
- [ ] Build/rebuild feature **success** sull'ultimo SHA effettivo.
- [ ] IA B2 acceptance **success** sull'ultimo SHA effettivo.
- [ ] Full browser/WCAG regression **success** sull'ultimo SHA effettivo, senza errori severi occultati o controlli rimossi.
- [ ] Verifica a campione della leggibilità dei testi e delle pagine scientifiche IT/EN/DE/FR, e delle ancore profonde pubbliche.
- [ ] Comportamento della Home e dei cinque accessi accettabile in desktop e mobile.
- [ ] Prima del merge, attribuire alla release pubblicabile una **nuova versione tecnica** (obiettivo 1.0.0 solo quando giustificato), sincronizzando publication.json, package/version, release_history, asset cache-busting, build, manifesti e nuovo data pack versionato. Non sovrascrivere pacchetti storici, RR1 o RR2; un redesign non è automaticamente RR3.
- [ ] Rollback predisposto; riservatezza dei dati e dati di ricerca non modificati indirettamente.
- [ ] **Esplicita approvazione del committente alla pubblicazione.**

La pubblicazione **non è autorizzata** finché una di queste condizioni è aperta.

## Procedura di promozione a produzione

1. Registrare gli SHA `main` e B, confrontare HEAD e le versioni correnti del sito; eseguire un rebuild definitivo se `main` ha avuto nuovi aggiornamenti dopo la baseline.
2. Preparare una release candidate con la versione tecnica **nuova** e le risorse generate in modo deterministico: pubblicare B continuando a usare la stringa cache v0.7.78 renderebbe possibile servire CSS/JS della precedente A dal browser. Poi aprire una pull request **B → main**, senza merge automatico. Allegare esiti CI, screenshot di mobile/desktop e un confronto finale di contenuti, dati e URL.
3. Conservare un riferimento immutabile o un branch di backup al commit pre-merge di A, con inventario delle risorse di produzione.
4. Solo dopo approvazione esplicita: procedere al merge controllato, verificare GitHub Pages e i permalink storici, homepage mobile, DOI e collegamenti alle applicazioni.
5. Se emergono regressioni sostanziali, revert del merge tramite nuova PR o ripristino controllato dal backup. **Niente force push** su `main` e niente manipolazione dei tag scientifici RR1/RR2.
6. Aggiornare release notes e documentazione della nuova identità visiva; annunciare **Connecting the Dots 1.0** solo quando stabilità e completezza sono effettivamente dimostrate.

## Materiali di accompagnamento

- [Stato dell'implementazione](IA_B2_BUILD_STATUS.md)
- [Inventario originale, 21 sezioni e 39 URL](IA_CONTENT_AUDIT_20261012.md)
- [Architettura delle cinque aree](IA_TARGET_ARCHITECTURE_V1.md)
- [Feedback beta e limitazioni del campione](IA_BETA_FEEDBACK_20261012.md)

**Principio guida:** la semplicità deve riguardare l'accesso alla conoscenza, mai la sparizione di contenuti, eccezioni o fonti.
