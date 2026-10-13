# Revisione editoriale | 14 ottobre 2026

**Stato:** nota di ricerca verificata, proposta di integrazione editoriale. **Non costituisce pubblicazione delle modifiche nelle pagine HTML.**

## Regola di non duplicazione

La baseline `main` contiene già:
- Nota dal campo sui numeri del Reveal Day (1.616 il 22 settembre, 1.615 il 7 ottobre, 1.614 schede APS pubbliche), con la distinzione tra la candidatura .wdo in verifica e la differenza storica ancora non spiegata.
- Indagine autonoma sull'identità .wdo.
- Grafo candidature ufficiali con 263 gruppi analitici di stringhe primarie identiche e 891 candidature coinvolte.
- Inventario riconciliato di 980 stringhe primarie; sei candidature Existing gTLD with Variants non sono altre sei stringhe primarie.
Non reinserire queste informazioni in nuove schede narrative, ma rimandare alle pagine e al dataset esistenti.

## Nuovo angolo editoriale A: competizione per le parole

**Tesi:** la distribuzione delle contese è un indice di aspettative di mercato e di scarsità dei nomi, non una stima diretta del loro valore economico né l'esito delle future procedure ICANN.

**Dati locali verificabili:** `data/aps_2026_application_graph_manifest.json` riporta 263 gruppi *derived exact primary match* e 891 candidature in tali gruppi. I gruppi sono ricavati dall'uguaglianza letterale delle stringhe primarie del 7 ottobre: non sono gli insiemi di contention finali di ICANN, modificabili in seguito a replacement, valutazione e obiezioni.

**Da pubblicare in Economia:** uno sviluppo di 3–4 paragrafi che distingua (a) scarsità linguistica, (b) rivalità tra modelli di business registry, (c) marchi e uso captive, (d) differenza fra investimento speculativo ed effettivo utilizzo. Collegamento alla sezione Contese e all'Application Atlas.

Fonti:
- ICANN Reveal Day, 7 ottobre: https://www.icann.org/en/announcements/details/icann-reveals-2026-round-applications-for-new-generic-top-level-domains-07-10-2026-en
- ICANN, FAQ contention: https://newgtldprogram.icann.org/en/application-rounds/round2/2026-round-general/pre-evaluation-processes/faqs/reveal-day/where-can-i-find-published-contention-set-information
- Snapshot locale: `data/aps_2026_application_graph_manifest.json`.

## Nuovo angolo editoriale B: Intercap Registry come caso di portafoglio

Il 7 ottobre *Domain Name Wire* attribuisce a Intercap Registry **71 candidature**, **58 stringhe con concorrenti identici** e **13 senza concorrenti identici** nella rilevazione giornalistica. Queste cifre sono di un'**analisi secondaria e datata**, non un conteggio ufficiale ICANN dei contention sets definitivi. Alcune candidature classificate come brand (ad esempio .plex e .owl) mostrano perché la categoria economica non vada appiattita su «TLD generici».

**Lettura da proporre:** «Comprare parole, costruire mercati». L'operatore investe in un paniere di potenziali registri; il rischio deriva dalla concorrenza per la stessa stringa, dalle regole ICANN e dall'incertezza sulla domanda futura. Evitare termini quali «comprare» o «conquistare» se interpretati come acquisizione già avvenuta: al 14 ottobre si tratta di *candidature*.

Fonte secondaria: https://domainnamewire.com/2026/10/07/surprise-intercap-registry-is-one-of-biggest-new-tld-applicants/

**Controllo richiesto prima della pubblicazione di valori definitivi:** riconciliare tutte le candidature riconducibili all'operatore con gli ID del file `data/applications_2026_aps_official_listing.csv`, distinguendo base application ID e righe -R; poi registrare la data dello snapshot.

## Nuovo angolo editoriale C: brand, prodotto, agenti AI

ICANN riporta **333 brand applications** al 7 ottobre. Questo è un conteggio ufficiale di *application type*, non una lista di «brand dell'AI». Distinguere rigorosamente: (i) marchio aziendale, (ii) prodotto/servizio, (iii) possibile identità per agenti e interfacce. L'ultima è una **ipotesi progettuale**, non una funzione già implementata dalle candidature.

Fonte ufficiale: https://www.icann.org/en/announcements/details/icann-reveals-2026-round-applications-for-new-generic-top-level-domains-07-10-2026-en

## Casi da trattenere, non pubblicare ancora

- L'interpretazione di un aumento di registrazioni .si come effetto diretto dell'hype «superintelligence» necessita dati primari del registro e metodo di confronto.
- La differenza 1.616 → 1.615 NON è dimostrata dal caso .wdo: sono due scarti differenti.
- Non sostituire 980 con 986 stringhe uniche senza definizioni omogenee e un nuovo snapshot riproducibile.

## Scadenze e trigger di revisione

- **21 ottobre 2026, 23:59 UTC:** fine del periodo replacement. Verificare i cambiamenti di stringa nel nuovo elenco APS; non attribuire automaticamente una riga -R a un'ulteriore candidatura.
- **17 novembre 2026:** String Confirmation Day. Acquisire snapshot aggiornato; confrontare numeri, tipologie, stringhe e candidature; ricalcolare i gruppi identici, separando i set di contention ufficiali.
- **16 marzo 2027:** chiusura prevista del periodo di commenti/opposizioni; documentare esclusivamente casi verificati.

Calendario ufficiale: https://www.icann.org/en/announcements/details/icann-announces-date-for-reveal-day-and-other-2026-round-milestones-29-09-2026-en

## Regole di pubblicazione

1. Pubblicare in tutte e quattro le lingue solo dopo riconciliazione con dati locali e verifica traduzioni; evitare HTML generato a mano che il build sovrascriverebbe.
2. Aggiornare le sorgenti editoriali e poi rigenerare pagine, sitemap e verifiche i18n tramite pipeline esistente.
3. Non modificare RR1, DOI e snapshot congelati: nuova revisione editoriale non equivale a nuova release scientifica.
4. Per ogni numero specificare *oggetto*, *denominatore*, *data dello snapshot* e *classificazione fonte*.
