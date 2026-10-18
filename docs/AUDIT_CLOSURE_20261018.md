# Chiusura dell’audit dei contenuti · 18 ottobre 2026

## Stato del lavoro

I 20 rilievi C01–C06, M01–M06 ed E01–E08 dell’audit sono stati implementati nella release candidata **v0.7.84** e verificati semanticamente. Per M06 sono verificati anche il prerender nelle quattro lingue e l’esportazione reale del CSV nel browser. Le verifiche locali già concluse sono riportate separatamente dai controlli ancora indicati come **pending final verification**.

Questo documento descrive il contenuto della candidatura di release. Gli esiti locali non attestano ancora la pubblicazione di questi stessi byte su GitHub Pages. La review dei fingerprint è conclusa; il commit finale e gli esiti dei workflow della release saranno registrati a conclusione della pubblicazione.

| Riferimento | Valore |
|---|---|
| Audit di partenza | 17 ottobre 2026, pubblicazione v0.7.83 |
| Commit sottoposto all’audit | `65e0fbe2080c2ee841e8abc01e1ddec113a74b8e` |
| Release tecnica candidata | `0.7.84`, data editoriale `2026-10-18` |
| Working paper corrente | `1.2-draft`, revisione `2026-10-18` |
| Pacchetto tecnico corrente | `downloads/connecting-the-dots-data-pack-v0.7.84.zip` e relativo `.sha256` |
| Snapshot scientifico conservato | RR2; `researchSnapshot: 2026-10-07`, cutoff `asOf: 2026-10-10` |
| Manifesto di review editoriale | `docs/editorial-review-2026-10-18.json`: **reviewed**, 62 file e 21 sezioni; guard Node e confronto A/B **PASS** |
| Backup A del confronto storico | `safety/main-v0.7.78-before-b2-switch-20261013`, commit `ec231cc12d35fa91ff5340ad057a483ce23a5ca4` |
| Commit finale della chiusura | **pending final verification** |

I valori correnti provengono da [`publication.json`](../publication.json), dal [manifesto scientifico](../research/research_release_manifest.json) e dal [manifesto di review editoriale](editorial-review-2026-10-18.json). Le date della fonte, dell’acquisizione, della revisione editoriale e del download restano campi distinti.

## 1. Correzioni prioritarie

| ID | Soluzione concreta e criterio verificabile | File principali | Stato |
|---|---|---|---|
| **C01** | Il download corrente, il nome del file scaricato, il checksum e l’etichetta di versione derivano da `publication.json`. Le due schede usano marcatori dedicati e puntano alla v0.7.84. Anche «Scarica i dati completi» nel pannello di errore dei profili usa il percorso corrente centralizzato. Il vecchio ZIP resta nell’archivio storico. | `src/index.web.html`, `build.py`, `assets/app.js`, `publication.json`, `scripts/release_check.py` | Corretto; verificato semanticamente. |
| **C02** | La data di verifica della cronologia deriva da `inside_the_round_events.json:lastReviewed`, ora 18 ottobre. Il footer nativo usa `INSIDE_REVIEWED`; la data editoriale non sostituisce le date dei singoli eventi o delle fonti. | `data/inside_the_round_events.json`, `src/index.web.html`, `build.py`, `scripts/render_static.js`, `scripts/render_static_fallback.py` | Corretto; verificato semanticamente. |
| **C03** | La comparazione del corpus 2012 usa **76** record per `Amazon EU S.à r.l.`. Il valore storico **78** resta una dichiarazione contestuale distinta, attribuita al procedimento del 2013, senza inventare una spiegazione dello scarto. Il generatore controlla il conteggio locale. | `data/registry_concentration.csv`, `data/registry_concentration_context.csv`, `data/translations.json`, `scripts/build_aps_current_analytics.py` | Corretto; verificato semanticamente. |
| **C04** | Il totale **1.615** è denominato totale ufficiale del Reveal Day. Il corpus pubblico con identificativi di base è **1.614**. Il confronto fra round non applica più al totale ufficiale 2026 l’etichetta generica «corpus locale». | `assets/app.js`, `data/translations.json`, `data/audit_20261018_editorial.json` | Corretto; verificato semanticamente. |
| **C05** | Versione e revisione del manoscritto sono centralizzate: **1.2-draft / 18 ottobre**. Pagina Ricerca, paper HTML/Markdown, riferimenti correnti al pacchetto tecnico e metadati strutturati sono sincronizzati. Il rapporto del manoscritto corrente con RR1/RR2 è dichiarato esplicitamente. | `publication.json`, `research/research_release_manifest.json`, `research/index.html`, `research/connecting-the-dots-working-paper-v1.md`, `scripts/render_research.cjs`, `scripts/sync_publication.py` | Corretto; verificato semanticamente. |
| **C06** | Le definizioni distinguono A-label e algoritmo Punycode; un A-label valido ha il prefisso `xn--`. Gli esempi distinguono etichetta e nome registrato; la classificazione dei TLD non assorbe `.arpa` fra i gTLD e non presenta una candidata come già delegata. | `data/domain_governance_glossary.csv`, `data/translations.json` | Corretto; verificato semanticamente. |

Riferimenti tecnici per C06: [RFC 5890](https://www.rfc-editor.org/rfc/rfc5890), [RFC 3492](https://www.rfc-editor.org/rfc/rfc3492) e [IANA Root Zone Database](https://www.iana.org/domains/root/db).

## 2. Metodo e perimetri dei dati

| ID | Soluzione concreta e criterio verificabile | File principali | Stato |
|---|---|---|---|
| **M01** | Il nuovo livello corrente contiene **1.614 righe con Application ID APS ufficiale**, peso unitario e collegamento alla candidatura. Le **1.608** righe del perimetro comparabile sostituiscono la ricostruzione sintetica nell’analisi corrente. La vecchia mappa rimane disponibile come livello storico congelato. | `scripts/build_aps_current_analytics.py`, `data/aps_2026_current_analytics.csv`, `data/aps_2026_current_analytics.json`, `data/aps_2026_current_analytics_manifest.json`, `scripts/reconcile_editorial.cjs` | Corretto; verificato semanticamente. |
| **M02** | Tema della stringa, settore del candidato e qualificazioni/naming della domanda sono variabili separate. Tema e settore espongono copertura, valori mancanti e confidenza propri. L’esempio `.agent` mostra 13 candidati distinti senza trasferire automaticamente il tema AI al settore di ciascuna organizzazione. | `data/aps_2026_applicant_sector_evidence.json`, `data/aps_2026_string_theme_distribution.csv`, `data/aps_2026_applicant_sector_distribution.csv`, `data/audit_20261018_editorial.json`, `scripts/reconcile_editorial.cjs` | Corretto; verificato semanticamente. |
| **M03** | Una revisione datata 18 ottobre documenta il filtro, i **sei Application ID** esclusi e l’uguaglianza esatta dei due insiemi di **980** stringhe. Il renderer ricalcola risultati e hash dagli input locali. La precedente osservazione del 10 ottobre resta leggibile e datata; lo scarto **1.616 → 1.615** resta separato. | `data/field_investigations.json`, `data/behind_round_stories.json`, `scripts/render_behind_round.py`, `scripts/render_field_investigations.py` | Corretto; verificato semanticamente. |
| **M04** | Note dal campo, cronologia e riepilogo del round spiegano il calendario pubblico APS: nessun aggiornamento fra Reveal Day e String Confirmation Day; successivamente aggiornamenti periodici, senza promessa di tempo reale. Il **21 ottobre** riguarda le scelte di sostituzione; il **17 novembre** riguarda la pubblicazione delle stringhe confermate. Nessun esito individuale è promesso per `.wdo`. | `data/behind_round_stories.json`, `data/inside_the_round_events.json`, `data/translations.json`, `scripts/reconcile_editorial.cjs` | Corretto; verificato semanticamente. |
| **M05** | Sono pubblicate distribuzioni riproducibili per nome legale del candidato, `Location` e regione APS, denominate elaborazioni del progetto. Le istruzioni `[official dataset]` sono rimosse dal CSV fattuale: il primo candidato legale è calcolato; la classifica per controllante resta esplicitamente mancante. I testi geografici e il download del portafoglio corrente usano queste elaborazioni. | `data/aps_2026_applicant_distribution.csv`, `data/aps_2026_location_distribution.csv`, `data/aps_2026_region_distribution.csv`, `data/registry_concentration.csv`, `data/registry_concentration_context.csv`, `src/index.web.html`, `scripts/reconcile_editorial.cjs` | Corretto; verificato semanticamente. |
| **M06** | L’Explorer distingue catalogo storico/tecnico, nomi solo candidati, inventario secondario 2026 e grafo applicativo ufficiale. Il pulsante CSV ricalcola `explorerFilteredRows()` al clic ed esporta tutti i risultati filtrati, indipendentemente dalla paginazione. Il CSV riporta filtri, provenienza, date delle fonti, versione e data del download. Il prerender conserva i conteggi già risolti anziché ripristinare i segnaposto. L’export è dichiarato un indice per nome, distinto dall’analisi per Application ID. | `assets/app.js` (`explorerFilteredRows`, `explorerExportDocument`, `exportExplorerResults`, `renderExplorerExportMeta`), `src/index.web.html`, `data/translations.json`, `scripts/audit_20261018_browser.cjs` | Corretto; prerender verificato nelle quattro lingue (**2.788** nomi complessivi, **980** nel perimetro 2026). CSV reale e cambi dei filtri verificati nel browser. |

Il metodo completo, le fonti delle classificazioni e il contratto dei CSV sono in [`APS_CURRENT_ANALYTICS_20261018.md`](APS_CURRENT_ANALYTICS_20261018.md). I conteggi derivati si possono ricostruire con `python3 scripts/build_aps_current_analytics.py`; `--check` confronta gli output attesi senza rigenerarli.

## 3. Editing, lingua e orientamento

| ID | Soluzione concreta e criterio verificabile | File principali | Stato |
|---|---|---|---|
| **E01** | La guida iniziale offre gli stessi **sei percorsi** della navigazione, compreso «Conflitti ed esiti». Le cinque domande divulgative mantengono la loro funzione distinta. | `assets/app.js`, `data/translations.json`, `scripts/render_static.js`, `scripts/render_static_fallback.py` | Corretto; verificato semanticamente. |
| **E02** | `.lugano` è organizzato in quattro parti: stato e fonti; decisioni di governo; usi e risultati; rischi e verifiche. Il renderer sposta i blocchi esistenti e controlla che ciascuno sia conservato una volta. Mantiene dichiarazione dell’autore, fonti, ancore e cautele su costi, servizi ufficiali, DNSSEC e risultati ancora da misurare. | `scripts/reconcile_editorial.cjs`, `data/translations.json`, `assets/style.css`, `scripts/audit_20261018_browser.cjs` | Corretto; verificato semanticamente. |
| **E03** | Il confronto trasversale fra round diventa un elemento espandibile tramite `<details>`, utilizzabile da tastiera. Contese apre con la domanda centrale e una sintesi. Il contenuto comparativo viene conservato, riducendone il peso prima dei dati e dei casi del capitolo. I nuovi titoli ricevono ID liberi senza modificare quelli storici, evitando collisioni negli indici di sezione. | `scripts/reconcile_editorial.cjs`, `data/translations.json`, `assets/style.css` | Corretto; verificato semanticamente. |
| **E04** | Il titolo «Cimitero dei gTLD» resta, accompagnato da un sottotitolo sugli esiti diversi. Ogni caso mostra separatamente stato contrattuale, stato nella root e data della verifica, con fonti specifiche. Cessazione del contratto, subentro e rimozione dalla root non vengono assimilati. | `data/audit_20261018_editorial.json` (`cemetery`), `data/translations.json`, `scripts/reconcile_editorial.cjs` | Corretto; verificato semanticamente. |
| **E05** | La distinzione fra **1.409** stringhe del Reveal Day 2012 e **1.388** in popolazioni successive è ripristinata anche in tedesco e francese. Sono corretti gli accenti e le umlaut individuati, i periodi temporali localizzati e il gergo di lavorazione. Le nuove precisazioni metodologiche sono presenti nelle quattro lingue. | `data/translations.json`, `data/audit_20261018_editorial.json`, `scripts/validate_multilingual.js` | Corretto; verificato semanticamente sui passaggi dell’audit. |
| **E06** | Badge e note si riferiscono alla singola misura: le **15** candidature con dichiarazione geografica nell’APS restano distinguibili dal totale cittadino/territoriale più ampio non disponibile. Le elaborazioni APS hanno una propria etichetta e un denominatore esplicito. | `src/index.web.html`, `assets/app.js`, `data/translations.json`, `scripts/reconcile_editorial.cjs` | Corretto; verificato semanticamente. |
| **E07** | Risorse è suddiviso in dati ufficiali archiviati, elaborazioni del progetto e release/archivi. I download mostrano descrizione, perimetro o righe e versione del file; la data di acquisizione resta distinta dalla release. La descrizione incompleta del registro delle osservazioni è sostituita con quella pertinente. I collegamenti originari sono conservati, salvo le due sostituzioni precise del pacchetto corrente. | `scripts/reconcile_editorial.cjs`, `data/translations.json`, `data/manifest.json`, `src/index.web.html` | Corretto; verificato semanticamente. |
| **E08** | Gli esempi applicativi futuri, compreso `.official`, sono formulati come possibilità o proposte. I testi distinguono candidatura, approvazione, servizio operativo e impatto misurato; le ipotesi su fiducia e AI non vengono presentate come risultati conseguiti. | `data/translations.json`, `data/audit_20261018_editorial.json` | Corretto; verificato semanticamente sui passaggi dell’audit. |

## 4. Risultati e limiti scientifici mantenuti

### Unità di analisi e denominatori

| Perimetro | Candidature | Stringhe primarie distinte | Nomi legali distinti | Uso |
|---|---:|---:|---:|---|
| Totale ufficiale Reveal Day | 1.615 | — | — | Totale comunicato da ICANN; distinto dal file pubblico acquisito. |
| `all_published` | 1.614 | 986 | 480 | Tutti gli Application ID di base presenti nell’export locale. |
| `new_primary` | 1.608 | 980 | 477 | Confronto con l’inventario congelato delle nuove stringhe primarie. |

L’export locale contiene 2.783 righe: 1.614 candidature di base e 1.169 record di sostituzione. Il filtro elimina i suffissi `-R` dal conteggio delle candidature autonome; nel perimetro comparabile esclude inoltre le sei domande `Existing gTLD with Variants`. I sei ID, gli hash degli input e il confronto normalizzato delle stringhe ASCII sono registrati nella revisione `aps-string-reconciliation` di [`field_investigations.json`](../data/field_investigations.json).

L’uguaglianza dei due insiemi di 980 stringhe verifica il rapporto fra questi due file locali. Non prova quale procedura abbia usato il compilatore dell’indice secondario e non spiega lo scarto precedente 1.616 → 1.615. L’assenza di `.wdo` dall’elenco pubblico resta distinta dalla causa del suo stato amministrativo.

### Copertura delle classificazioni

Nel perimetro di 1.608 candidature, il tema della stringa è classificato per **608** domande e manca per **1.000**. Il settore del candidato è classificato per **622** domande, appartenenti a **11** nomi legali selezionati, e manca per **986**. Le percentuali usano l’intero denominatore, compresi i valori mancanti. Questi dati sono controllabili in [`aps_2026_current_analytics.json`](../data/aps_2026_current_analytics.json), sotto `coverage.new_primary`.

La classificazione del tema è un’eredità editoriale esplicitamente identificata. La verifica di 11 candidati su fonti primarie è una selezione mirata con forte presenza di operatori di registri, non un campione rappresentativo dell’economia del round. La nuova analisi non crea una serie temporale omogenea con il vecchio indicatore misto 2012/2026. Prima di un confronto scientifico omogeneo occorre una riclassificazione 2012 secondo le stesse variabili.

`Applicant Name`, `Location` e `Region` rimangono valori di fonte. I 56 codici di localizzazione permettono distribuzioni del file, senza dimostrare sede effettiva, nazionalità della controllante o localizzazione del DNS. Il primo nome legale, Link Freedom Group Ltd, ha **158 candidature su 1.614**; questo non costituisce una classifica per gruppo societario. La controllante finale resta non risolta sistematicamente; il valore mancante non viene convertito in zero.

Le qualificazioni ufficiali possono sovrapporsi: **331** domande soltanto brand e **2** brand/geografiche corrispondono a **333** flag brand positivi. Le categorie esclusive del naming non correggono il totale inclusivo ICANN.

### Calendario APS e casi individuali

La [pagina About dell’APS](https://newgtldprogram-aps.icann.org/about) distingue la pubblicazione pubblica dalle informazioni aggiornate disponibili ai candidati in TAMS. L’assenza di aggiornamenti pubblici fra Reveal Day e String Confirmation Day non dimostra inattività interna. Il [calendario ICANN](https://www.icann.org/en/announcements/details/icann-announces-date-for-reveal-day-and-other-2026-round-milestones-29-09-2026-en) distingue la scadenza delle scelte del 21 ottobre dalla pubblicazione del 17 novembre. Nessuna delle due fonti promette la soluzione di `.wdo` in quella data; non viene attribuita una causa individuale a sanzioni, omonimie o nomina di un fornitore di screening.

### Archivi, DOI e manoscritto corrente

I DOI rimangono [RR1 — 10.5281/zenodo.23262623](https://doi.org/10.5281/zenodo.23262623), [RR2 — 10.5281/zenodo.23288603](https://doi.org/10.5281/zenodo.23288603) e [serie — 10.5281/zenodo.23262622](https://doi.org/10.5281/zenodo.23262622). La chiusura non modifica i depositi Zenodo.

I precedenti ZIP tecnici, i checksum storici, gli input ufficiali congelati, la vecchia mappa economica e i suoi aggregati sono preservati. Nel manifesto scientifico cambiano soltanto i metadati del sito e del working paper corrente; le altre proprietà scientifiche sono protette separatamente. Il paper **1.2-draft** e la nuova analisi APS sono revisioni correnti **non coperte dai DOI RR1/RR2**. Un futuro rilascio scientifico dei nuovi metodi e risultati richiede un deposito distinto e una propria descrizione delle modifiche.

## 5. Verifiche confermate e controlli da completare

Gli esiti PASS seguenti sono stati confermati nel lavoro locale sulla candidata v0.7.84. La verifica finale deve riferirli al commit e agli artefatti conclusivi; ulteriori modifiche ai file coinvolti richiedono il controllo pertinente prima della pubblicazione.

| Verifica | Esito confermato | Ambito |
|---|---|---|
| `python3 scripts/release_check.py` | **PASS · v0.7.84** | Invarianti della release, dati, pubblicazione e riferimenti scientifici. |
| `python3 scripts/test_aps_current_analytics.py` | **PASS · 7 test** | Elaborazione APS, input, pesi, classificazioni separate, riproducibilità e conservazione dei risultati. |
| `node scripts/validate_multilingual.js` | **PASS** | Coerenza delle quattro lingue e delle strutture editoriali previste. |
| `node scripts/validate_internet_access.js` | **PASS** | Contenuti e invarianti della guida sull’accesso a Internet. |
| `CTD_STATIC_ONLY=1 node scripts/validate_delivery.js` | **PASS** | Indice leggero, profili e consegna statica; non sostituisce i test di interazione nel browser. |
| `node scripts/validate_delivery.js`, percorso completo | **PASS · exit 0 dopo le due build finali** | Integrità di 1.849 profili e otto shard; navigazione nelle quattro lingue; caricamento asincrono nelle quattro lingue e root alias, cache, retry con identità stabile, timeout, payload invalidi, focus e ritorno al controllo, risposte tardive, deep link ASCII/Unicode, Back/Forward e condivisione. |
| `node scripts/audit_browser_20261010.js` | **PASS · 43 route, 4 lingue, 5 viewport, 0 issue** | Audit browser generale sulla candidata locale. |
| `node scripts/validate_audit_20261018.cjs` | **PASS · 26 gruppi di controllo** | Gate statico delle correzioni del 18 ottobre; esito locale precedente alla finalizzazione della release. |
| `node scripts/audit_20261018_browser.cjs` | **PASS · 8 scenari, 4 lingue × 390/1.440 px, 56 gruppi di controllo** | Percorsi Home, struttura `.lugano`, download corrente ed export. Il CSV contiene **980 nomi reali** quando la pagina ne mostra 50; l’esportazione non effettua fetch aggiuntivi. Verificati il cambio del filtro a `.lugano`, il caso con zero risultati e gli ID dopo render ripetuti degli indici. |
| `node scripts/audit_city_namespace.cjs` | **PASS · 48 controlli di pagina, 112 controlli delle fonti, 48 scansioni axe, 0 issue** | Audit dedicato ai namespace cittadini e alle rispettive fonti. |
| `node scripts/audit_axe_20261010.js` | **PASS · 4 pagine, 24 sezioni, 192 scansioni, 0 violazioni** | Il risultato conclusivo `AUDIT_AXE_RESULT` registra zero violazioni critical, serious, moderate e minor. |
| `node scripts/audit_legacy_deeplinks.cjs` | **PASS · 224/224 collegamenti, nessun fallimento** | Il risultato conclusivo `LEGACY_LINK_AUDIT` registra `tested: 224`, `success: 224`, `failed: []`. |
| `node scripts/audit_ia_b2.cjs` | **PASS · 8 scenari, 4 lingue, 39 pagine autonome, 0 issue** | Navigazione mobile/desktop, 208 attivazioni, 26 schede. Le sei destinazioni Home sono confrontate con quelle effettive della navigazione. |
| `node scripts/audit_aps_application_atlas.js` | **PASS · 4 lingue, 24 viewport, 0 overflow o errori** | 44 ricerche, 48 link, 48 filtri e 8 scansioni WCAG. |
| Regressione degli ID e degli indici di sezione | **PASS · 12/12 route, 0 ID duplicati, persi o modificati** | Quattro pagine principali e otto accessi da articoli. Due ulteriori esecuzioni di `renderSectionTocs()` per route mantengono gli ID esistenti e restano idempotenti. |
| `node scripts/verify_ia_b2_parity.cjs` | **PASS** | Manifesto reviewed di 62 file, 21 sezioni preservate e 28 file immutabili verificati, ricontrollati dopo le due build finali. |
| `python3 scripts/audit_content_continuity.py` | **PASS** | Confronto conclusivo dopo le due build con il backup A `ec231cc`; nessuna perdita di file, ID, route o riferimenti protetti, archivi storici identici. |
| Due build complete finali e pacchetto corrente | **PASS · 70 file identici, zero differenze fra le ricostruzioni** | Verifica successiva alle correzioni del runtime: 62 file della review, cinque pagine principali, manifesto dati, ZIP e checksum. SHA-256 ZIP finale: `b2ffb3502559c927a0e61666b1bda232f6bbcb51f4e9f600b8d09c72e1ac57c4`. |
| Raggiungibilità pubblica prima della pubblicazione | **PASS · 5 pagine HTTP 200, TLS standard** | Verificate `/it/`, `/en/`, `/research/`, `/behind-the-round/it/` e `/inside-the-round/it/`. Dimostra la raggiungibilità, non la pubblicazione dei byte candidati. |
| Controllo remoto RR2 prima della pubblicazione | **PASS · 8 controlli, 3 endpoint HTTP 200** | Record e DOI attesi verificati con TLS standard; resta da registrare anche il workflow della release. |

| Controllo finale | Stato | Evidenza da registrare |
|---|---|---|
| Approfondimenti browser (`scripts/deep_audit_20261011.js`) | **pending final verification** | Esecuzione completa sul commit conclusivo; i due tipi di errore del precedente report sono documentati sotto. |
| Workflow GitHub sul commit finale | **pending final verification** | Commit, URL delle esecuzioni e conclusioni effettive. |
| Pages e confronto dei byte pubblicati (`pages-live-smoke.yml`) | **pending final verification** | Stesso commit, pagine, asset del browser, ZIP corrente e checksum. |
| Controllo remoto RR2 (`verify-zenodo-rr2.yml`) | **pending final verification** | DOI/record attesi verificati; un problema di rete resta distinguibile da un record mancante o diverso. |

### Difetti emersi nei controlli conclusivi

Il precedente report di approfondimento registrava 12 collisioni di ID e cinque errori di raggiungibilità del sito. Le collisioni comparivano nel browser: l’assegnazione numerica ai nuovi titoli poteva riusare `geography-part-3` o `economics-part-3`, già presenti nei titoli storici. L’allocatore ora salta gli ID occupati e conserva ogni ID esistente. La regressione mirata sulle 12 route è PASS; il gate browser del 18 ottobre verifica anche unicità e stabilità dopo due ricostruzioni degli indici.

I cinque errori esterni erano `ERR_CERT_AUTHORITY_INVALID` nel browser di prova. Tutte e cinque le stesse pagine sono state raggiunte con HTTP 200 e verifica TLS standard tramite un client indipendente. Questo controllo non disabilita la verifica dei certificati e non attribuisce al sito una disponibilità della nuova release ancora da provare.

Il test completo della consegna ha inoltre individuato un errore nel tentativo successivo al caricamento fallito di un profilo: il caricamento dell’inventario 2026 riordinava l’elenco, mentre il pulsante conservava il vecchio indice numerico. La correzione risolve il profilo al clic dalla sua identità ASCII, evitando che il retry di `.ch` apra `.bit`. Il collegamento di recupero ai dati completi viene allineato al pacchetto corrente. Il test completo della consegna, eseguito dopo le due build finali, ha verificato questi percorsi con esito PASS.

## 6. Continuità editoriale e controlli CI

Il [manifesto di review](editorial-review-2026-10-18.json) mantiene il baseline pre-audit `65e0fbe` e i riferimenti al backup A originale. Ogni file approvato richiede il proprio SHA-256 e una motivazione C01–E08; ogni sezione richiede un fingerprint specifico. La sola versione o la sola etichetta `reviewed` non autorizzano differenze future.

La protezione comprende i 21 segmenti editoriali storici, l’inventario pre-audit di 22 ID di sezione, 181 ID, 883 riferimenti i18n e 183 collegamenti, oltre a 28 file immutabili. Nel manifesto scientifico, tutte le proprietà diverse da `currentSiteVersion` e `workingPaperRevision` sono confrontate con il fingerprint canonico precedente. Il file completo resta comunque soggetto alla review editoriale. L’inventario protetto e i fingerprint del baseline non vengono rigenerati per accettare il nuovo contenuto.

[`verify_ia_b2_parity.cjs`](../scripts/verify_ia_b2_parity.cjs) conserva i digest storici e applica la review esplicita. [`audit_content_continuity.py`](../scripts/audit_content_continuity.py) riusa lo stesso validatore, mantiene il confronto con il checkout A e rifiuta perdite di contenuto strutturale, modifiche non approvate ai CSV e riscritture degli archivi. L’unica sostituzione dei collegamenti correnti riguarda precisamente ZIP e checksum v0.7.78 verso i due token della pubblicazione corrente, lasciando i file precedenti intatti.

Il workflow [A/B](../.github/workflows/a-b-final-parity.yml) ora comprende i branch `feat/**`. Il [live smoke](../.github/workflows/pages-live-smoke.yml) legge il pacchetto da `publication.json` e verifica anche gli asset realmente richiamati dalle pagine. Il [controllo Zenodo](../.github/workflows/verify-zenodo-rr2.yml) non tratta più come successo l’assenza del RR2 già pubblicato o un errore di rete: conserva l’evidenza, distingue le condizioni e fallisce quando la verifica non è disponibile o non coincide con il record atteso.

La review è impostata a `reviewed` con gli SHA-256 approvati e i fingerprint delle sezioni; i baseline restano quelli precedenti all’audit. Il guard Node e il confronto con il checkout `../baseline` al commit `ec231cc` hanno dato PASS. Fra i 62 file è incluso `data/sources.csv`: le tre fonti Helsinki aggiunte prima di questo audit sono conservate e il file è byte per byte identico al main pre-audit `65e0fbe`. La sua inclusione nella review registra tale continuità senza modificarlo. Ogni ulteriore modifica a un file protetto richiede una nuova verifica della sua impronta esatta.
