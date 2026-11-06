# Connecting the Dots — audit completo del 6 novembre 2026

## Esito e perimetro

La pubblicazione v0.7.97, commit `94a01d185f0153c1787751e9a08948d3728e6f3b`, non presenta perdite dei dati scientifici o collegamenti interni interrotti rilevati dall'audit. Sono emersi difetti riproducibili nella pubblicazione, nelle guardie di integrità, nel peso dell'HTML e in alcune informazioni visibili. La manutenzione tecnica v0.7.98 li corregge senza aggiornare le fonti ICANN/IANA o la ricerca archiviata.

L'audit combina codice, ricostruzioni, confronto dei byte pubblicati, prove negative, browser automatici e navigazione manuale assistita. È una verifica tecnica assistita da AI, con **zero partecipanti umani** a studi di lettura o classificazione. Non costituisce una certificazione WCAG, una nuova validazione scientifica indipendente o un penetration test.

## Copertura della baseline

| Ambito | Copertura | Esito osservato |
|---|---:|---|
| Pagine pubbliche | 48 HTML | HTTP 200 e byte identici al commit. |
| Struttura | 53 HTML tracciati, 9.025 riferimenti, 4.998 interni | Nessun file, frammento o tab mancante; nessun ID duplicato o riferimento ARIA statico irrisolto. |
| Pagine e risorse collegate | 138 URL | Tutte HTTP 200; dimensioni dichiarate coerenti. |
| Dati e download | 124 file, 111.844.846 byte | Tutti identici al commit, compresi 67 CSV, 22 ZIP e 21 checksum. |
| CSV | 67 file, 51.085 record effettivi | Byte e hash corretti; un conteggio dichiarato errato, corretto sotto. |
| Evidenza IANA | 1.597 sorgenti interne | Inventario e hash verificati. |
| Pacchetto tecnico v0.7.97 | 112 membri | Ogni membro coincide con la sorgente. |
| Zenodo | RR1: 154 file; RR2: 212 file | Checksum, CRC e identità dei blob corrispondono ai tag congelati. |
| Artifact Pages effettivo | 478 file, 153.112.568 byte non compressi | Nessun file mancante, inatteso o diverso, symlink o percorso non sicuro. |
| Ricostruzione completa | 502 file tracciati | Build riuscita e zero differenze. |
| Dipendenze npm | 16 dipendenze | Nessun advisory restituito da npm audit nella verifica del 6 novembre. |
| Controllo limitato dei sorgenti | 475 file testuali | Nessun pattern riconosciuto di token GitHub, chiave AWS o chiave privata; nessuno script HTML da domini esterni. |

Titoli, descrizioni, JSON-LD, canonical, hreflang e sitemap sono stati verificati. I 369 URL esterni sono inventariati, ma non tutti controllati via HTTP: non si dichiara la disponibilità permanente di ogni fonte remota.

### Browser sul sito pubblico

Il [run 42302967531](https://github.com/robertbregy/Connecting-the-Dots/actions/runs/42302967531) ha confermato prima i byte della pubblicazione e poi superato 32 combinazioni di quattro lingue, quattro larghezze (320/390/768/1440) e due temi; quattro percorsi senza JavaScript; 64 scansioni axe; otto percorsi per pubblico su desktop/mobile. Nessun errore nella suite.

La navigazione manuale assistita ha verificato percorso introduttivo, ricerca `.lugano`, profilo ed Escape con ripristino del focus, cambio lingua conservando il filtro, atlante, citazioni e protocollo di lettura. Ha individuato incongruenze non intercettate dalle suite precedenti.

Sono disponibili anche i [test browser/WCAG 42275697222](https://github.com/robertbregy/Connecting-the-Dots/actions/runs/42275697222) e la [verifica live 42300374290](https://github.com/robertbregy/Connecting-the-Dots/actions/runs/42300374290). Queste sono prove della baseline: non vengono presentate come collaudi delle correzioni successive. Le prove del candidato v0.7.98 sono associate al suo commit nei workflow e nel nuovo verbale tecnico.

## Difetti corretti

| Ambito | Difetto riprodotto | Intervento |
|---|---|---|
| Push generati | Push rifiutato trattato come normale avanzamento del ramo, anche se il remoto non era cambiato. | Errore esplicito quando il remoto è invariato o il suo stato non è verificabile. |
| Concorrenza | Commit README durante il build poteva far scartare i risultati senza avviare un nuovo rebuild. | Ogni normale push main/feat avvia un rebuild; opt-out esplicito solo per commit già compilati e validati. |
| Prepubblicazione | Byte conformi a Git ma metadati e HTML incoerenti potevano essere pubblicati. | Release check e fingerprint verificati sul commit esatto prima del deploy. |
| Verifica online | Omissione di otto shard Explorer, mappa, Explorer autonomo e working paper. | Copertura aggiunta con versioni/query effettive; controllo dell'esatto run/attempt e dello step di deploy realmente riuscito. Run superati o senza deploy hanno report espliciti e non producono misure. |
| Archivi | v0.7.91–93 fuori dal registro completo; uno ZIP valido ma alterato superava i controlli. | Copertura di tutti gli archivi precedenti, hash e sidecar; congelata anche v0.7.97. |
| Fallback | Limite obsoleto di 100 file e requisito di un file inesistente impedivano entrambi i pacchetti offline. | Confezionamento source/deploy ripristinato e verificato. |
| Manifest CSV | round_2026.csv dichiarava 16 righe invece di 15, contando una riga vuota. | Conteggio dei record effettivi e controllo di byte/hash/record per ogni CSV; CSV invariato. |
| Citazioni | Etichetta v0.7.89/19 ottobre con link al pacchetto corrente. | Versione e data da publication.json, già nei cinque HTML statici. RR2 e working paper mantengono le proprie date. |
| Atlante e accessibilità | Link interno chiamato scheda ufficiale APS, nomi accessibili inglesi, skiplink duplicato/mal denominato. | Etichette corrette e localizzate, un solo skiplink, destinazioni preservate. La sostituzione i18n è approvata singolarmente senza alterare le invarianti originali o i veri link ICANN. |
| Localizzazione | Plurale con un risultato, separatori numerici inglesi, meta description troncate. | Singolare per esattamente uno, numeri locali e descrizioni complete. Nessun conteggio o filtro cambia. |
| HTML | Limite 1.240.000 byte disattivato da un escape letterale nel commento. | Limite originale riattivato; dizionario e snapshot condivisi come asset versionati; budget separato di HTML più payload. |
| Metriche | Campo CLS calcolato come somma totale. | Massima finestra di sessione, somma diagnostica distinta e nove prove dei casi limite, inclusi shift iniziali nulli. |
| Documentazione | README e comandi storici scambiabili per indicazioni correnti; renderer legato esattamente a v0.7.97. | Metadati e istruzioni allineati; supporto a release tecniche successive preservando la data delle evidenze. |

Le prove locali precedenti hanno verificato 432 condizioni UI, 16 casi singolare/plurale, 50 condizioni di parità dopo estrazione, quattro fallimenti intenzionali del budget, sette fallimenti intenzionali delle guardie dati, 40 scenari CI e 18 scenari della sostituzione i18n. I rapporti ricostruiti dopo il riavvio dell'ambiente sono distinti dalle nuove esecuzioni, senza dichiarare recuperati log originali non disponibili.

### Verifica del candidato completo

Il checkpoint delle sorgenti combinate è [`579e488d8f0bbb4f4dece0700e6339cbcba0548e`](https://github.com/robertbregy/Connecting-the-Dots/commit/579e488d8f0bbb4f4dece0700e6339cbcba0548e). La build completa con questo pin è riuscita. Le verifiche indipendenti ripetute sul candidato finale hanno superato **421 controlli statici su 48 pagine, sei controlli di provenienza, quattro prove negative del budget e 28 controlli sui dati e sugli archivi**. Sono state rieseguite inoltre 34 prove della pipeline recuperata, otto prove del workflow temporaneo di assemblaggio e nove casi del calcolo CLS.

I 67 CSV e i loro 51.085 record, 56 JSON/evidenze scientifiche, 22 ZIP precedenti e 21 sidecar sono invariati. Lo ZIP v0.7.98 contiene gli stessi 112 membri del precedente: 108 sono byte-identici, cambiano soltanto README.md, frozen_technical_packages.json, manifest.json e release_history.json. Dimensione: 4.345.959 byte; SHA256: `f9bbbf917e26cbe64b6a96f4c3db04e4ddbbe6536db4f37160737e00cdb54299`.

Le prove sono nei JSON [di struttura](audits/2026-11-06/final-static-parity.json), [dei limiti](audits/2026-11-06/final-budget-faults.json), [delle dimensioni](audits/2026-11-06/final-budget-measurements.json) e [dei dati generati](audits/2026-11-06/generated-data-audit-0798.json). Il verbale v0.7.98 registra la review tecnica delle sorgenti e degli output esatti, preservando tutte le baseline storiche. L'accettazione remota è un gate distinto: doppia build deterministica, confronto dell'intero albero Git, A/B e browser sul commit completo, quindi deploy e confronto dei byte pubblicati. Le esecuzioni rimangono consultabili in [GitHub Actions](https://github.com/robertbregy/Connecting-the-Dots/actions); il workflow temporaneo si elimina prima del commit finale e può scrivere soltanto sul ramo di assemblaggio dedicato.

## Eccezione storica v0.7.92

Lo ZIP tecnico v0.7.92 è stato realmente pubblicato tre volte con hash diversi: 21 ottobre alle 22:09:38 e 22:37:33 UTC; 22 ottobre alle 07:28:01 UTC. Cambia soltanto manifest.json; tutti gli altri membri sono identici.

Viene preservata e congelata l'ultima copia già online, senza chiamarla prima copia originale. Commit, digest e deployment sono documentati in [technical-archive-integrity-20261106.json](technical-archive-integrity-20261106.json). Non vengono riscritti vecchi archivi o checksum.

## Prestazioni e limiti

Sulla baseline pubblica, con cache fredda, viewport 390×844, 150 ms di latenza, download 200 KiB/s, CPU 4× e tre ripetizioni, i mediani LCP sono 1.608 ms per Panoramica, 1.460 ms per Explorer e 3.028 ms per Economia. Il trasferimento osservato è 888.638 byte. Il vecchio valore 0,01105377 era una somma degli spostamenti, non viene retroattivamente chiamato CLS corretto.

L'estrazione riduce l'HTML duplicato di circa il 28% e permette il riuso della cache. Non elimina i payload dalla prima visita: HTML più asset resta quasi invariato e viene controllato esplicitamente. Gli HTML finali delle quattro lingue pesano 1.172.817–1.219.881 byte, sotto il limite originale di 1.240.000. L'aggregato HTML più dizionario e snapshot cresce soltanto di 1.084–1.210 byte rispetto alla baseline, entro i 2 KiB consentiti; il margine minimo residuo è 838 byte in francese. I tempi effettivi richiedono il confronto pubblico dopo il rilascio.

Le definizioni di [LCP](https://web.dev/articles/lcp) e [CLS](https://web.dev/articles/cls) distinguono misure sintetiche e percentili sul campo. Economia merita ulteriore attenzione. La soglia CI di 12 secondi intercetta regressioni gravi e non certifica prestazioni ottimali; l'evento del cambio tema non equivale a INP sul campo.

Restano aperti studi con lettori reali, codifica scientifica indipendente, prove manuali con tecnologie assistive, prestazioni dei visitatori e disponibilità continuativa delle fonti esterne. Nessun risultato umano è stato inventato. I 67 CSV, le evidenze APS/IANA, le release scientifiche RR1/RR2, i vecchi ZIP e la revisione del working paper restano invariati; la nuova versione tecnica ha un archivio proprio.

Procedure correnti: [DEPLOY.md](../DEPLOY.md). Evidenze tecniche: [audits/2026-11-06](audits/2026-11-06/). I report, log e screenshot completi dei browser sono negli artifact dei run GitHub.
