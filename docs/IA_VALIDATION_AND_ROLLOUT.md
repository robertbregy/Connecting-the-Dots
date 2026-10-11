# Piano operativo di validazione e migrazione IA

**Stato: definito, non eseguito con partecipanti.** Nessun redesign in produzione.

## Cinque prove reali e comparabili

1. **Capire Internet/TLD.** Partendo dalla homepage, spiega cosa sia un TLD con `www.example.com` e distinguilo dal nome di dominio registrato. Risultato: definizione corretta senza suggerimenti.
2. **Trovare una candidatura.** Trova `.lugano`, identifica la candidatura ufficiale 2026 (Application ID `CDL2651T-T31516`) e l'organizzazione richiedente. Risultato: non confonde richiesta e delega.
3. **Distinguere oggetti e conteggi.** Spiega perché 2.783 righe dell'export APS non rappresentino 2.783 candidature, e distingui candidature, stringhe iniziali, sostitutive e TLD delegati. Risultato: sa spiegare 1.614 Application ID pubblici + 1.169 record sostitutivi, e lo scarto con 1.615 nel totale ICANN, senza inventare cause.
4. **Interpretare una controversia.** Trova un caso del progetto e chiarisce chi sostiene cosa, quale fonte documenta il fatto e che cosa resta incerto. Risultato: distingue obiezione, contention, decisione e osservazione editoriale.
5. **Riconoscere il valore scientifico.** Trova RR2, il suo DOI di versione (`10.5281/zenodo.23288603`), un dataset tecnico corrente, il metodo e i limiti delle fonti. Risultato: non confonde RR2 immutabile con v0.7.78 del sito.

## Protocollo minimo

- Partecipanti: almeno 5 persone non coinvolte nel progetto, con differenti livelli di familiarità Internet; idealmente un secondo gruppo esperto di almeno 3 persone.
- Dispositivi: mobile a 390px e desktop; quattro lingue mediante campione appropriato di lettori competenti. Non pretendere di validare una lingua che i partecipanti non conoscono.
- Design comparativo: compiti identici su esperienza corrente e prototipo, ordine controbilanciato per limitare l'effetto di apprendimento; facilitazione neutrale, senza rivelare il menu giusto.
- Registrare solo metriche anonimizzate: completamento autonomo, successo concettuale, tempo, errori, percorso, ritorni indietro, difficoltà e commenti spontanei.
- Non confondere facilità percepita con accuratezza scientifica: registrare entrambe. Un percorso più veloce che induce conclusioni false è un peggioramento.
- Misurare anche ricerca diretta tramite deep link e comportamento delle ancore esistenti.

| Dimensione | Requisito prima di una migrazione |
| --- | --- |
| Completezza | Tutti i contenuti, riferimenti a fonti e dataset conservati |
| Integrità scientifica | Identità dei record e archivio RR1/RR2 invariati |
| Navigazione | Nessuna regressione sui cinque compiti; correggere se 2+ utenti indipendenti falliscono lo stesso task |
| Accessibilità | Test automatici e manuali con tastiera e screen reader |
| i18n | Etichette e percorsi validati in IT/EN/DE/FR |
| SEO | Mapping 39 URL, hreflang, canonical, metadati, permalink e ancore |
| Versioni | Tutti i link a pacchetti statici etichettati come corrente/storico |
| Tecnico | Browser audit Chromium, mobile, link integrity, build deterministico |
| Reversibilità | Branch separato, commit di origine, piano rollback e nessuna sostituzione dati |

## Backlog ordinato

**IA-01, P0 — Inventario e tassonomia (documentato):** verificare la mappa delle 21 sezioni e 39 URL e assegnare a ogni pagina un tipo primario e relazioni.

**IA-02, P0 — Percorsi e nomenclatura (proposto):** simulare la navigazione Capire, Esplorare, Storie e questioni, Round 2026, Ricerca. Non aggiungere un toggle globale.

**IA-03, P0 — Separare guida da Field Note (proposto):** sanzioni/Internet access nei percorsi tematici corretti, mantenendo fisicamente gli URL.

**IA-04, P0 — Contratto delle entità (proposto):** identificatori chiari e differenze fra TLD, stringa, Application ID e righe APS. Fonti e stati temporali sempre visibili.

**IA-05, P1 — Pilotare 2 pagine (non avviato):** guida accesso Internet e nota delle differenze al Reveal Day, con livelli In breve / Approfondisci / Fonti.

**IA-06, P1 — Consolidare la ricerca (proposto):** confrontare research in-page e /research/ autonoma; un solo accesso concettuale, collegamenti e URL conservati.

**IA-07, P1 — Documentare riferimenti di versione (da verificare):** /research/ e working paper mostrano ancora il download tecnico v0.7.77 nonostante disponibilità della v0.7.78. Stabilire se citazione storica o corrente, correggere soltanto dopo verifica editoriale. `research/README.md` indica ancora v0.7.75 come ultima versione tecnica.

**IA-08, P1 — Verifica sperimentale (non avviato):** test utenti reali con baseline e prototipo, conclusioni basate su esiti osservati.

**IA-09, P2 — Registro relazionale (non avviato):** metadati comuni e collegamenti fra oggetti, evitando duplicazioni di contenuto.

**IA-10, P2 — Graduale migrazione (non avviato):** implementazione in ramo separato, audit completo e rilascio solo dopo accettazione esplicita.

## Regola decisionale finale

Una modifica estetica che non migliora orientamento, accuratezza, reperibilità o accessibilità non giustifica il rischio di regressione. Ogni intervento deve indicare il problema osservato, l'ipotesi di miglioramento e come verificarla.
