# Revisione indipendente dei sorgenti 0.7.99 — prima della build

**Baseline:** candidato tecnico non pubblicato `dee7b777d5ca6ac042167ed02d2e1fe253a36931` (0.7.98). **Worktree esaminata:** `experience-repository`, con modifiche non ancora consolidate. **Esito della lettura iniziale:** nessun problema bloccante individuato nel perimetro esaminato; la successiva guardia di release ha rilevato l’errore del registro descritto sotto. **Esito finale dopo la correzione e la seconda build:** audit indipendente di conservazione PASS, 353/353 controlli.

## Contenuti e promesse

README e CHANGELOG descrivono interventi circoscritti: metadati accessibili delle card mobili, ordine della ricerca, stato Atlas nell’URL, conservazione dei dettagli aperti, precisione dell’etichetta DNS e riparazione della navigazione APS. Non assegnano un voto 10/10, non dichiarano conformità WCAG completa e non trasformano controlli automatici in uno studio con persone. README dichiara gli studi con lettori ancora pendenti e precisa che il candidato 0.7.98 non è stato distribuito su main/Pages.

Le relazioni editoriali e strutturali distinguono difetti riprodotti, valutazioni euristiche e ipotesi da verificare. La relazione strutturale espone i limiti del DOM locale e dell’algoritmo AccName, la necessità della CI browser e l’assenza di prove assistive manuali complete. Le scansioni axe sono descritte come controlli automatici circoscritti, non come certificazioni. La relazione dell’assembly dichiara il workflow preparato e i controlli strutturali, senza inventare esiti remoti 0.7.99.

La matrice fattuale resta un campione di dodici affermazioni sensibili. Non certifica ogni importo economico, ogni proposizione nelle quattro lingue o ogni dossier remoto. La formulazione C08 è stata corretta: il presente riguardava la baseline; il candidato 0.7.99 ha già passato la revisione delle quattro forme al passato. I limiti scientifici, cronologici e metodologici restano dichiarati.

## Perimetro della modifica

- I quattro `presetRoot` descrivono la presenza nella radice DNS e non promettono servizio attivo o apertura delle registrazioni.
- Le etichette `apsAtlasSource` e `field18SourceExport` descrivono la lista ufficiale, coerentemente con la nuova destinazione. Restano le chiavi di traduzione originali; i JSON scientifici e la metadata citation/isBasedOn conservano l’URL storico.
- `dataStatusSub` usa il passato nelle quattro lingue, conservando i numeri di data e la clausola che presenta il 17 novembre come previsto.
- `publication.json` cambia versione, data tecnica, pacchetto corrente e percorso della nuova review. La rimozione temporanea del vecchio pin è uno stato di preparazione, non una provenienza finale: il confronto post-build richiederà un pin esplicito.
- `research/research_release_manifest.json` cambia soltanto `currentSiteVersion`; le descrizioni e i riferimenti RR1/RR2 restano identici.
- Il registro degli archivi deve aggiungere soltanto il pacchetto ZIP candidato 0.7.98, mantenendo i digest precedenti. Il sidecar fisico resta conservato e verificato separatamente; il registro non ammette file checksum come voci. Riordinare le chiavi JSON non altera i riferimenti.

## Lettura delle guardie e del comportamento

La nuova eccezione di navigazione è vincolata a un solo URL originale, una sola destinazione ufficiale e al rationale esplicito UX99. La guardia controlla il contesto Atlas, gli attributi dell’ancora e la conservazione degli URL di acquisizione nei dati. Il controllo successivo mantiene il multinsieme dei collegamenti storici dopo questa sola normalizzazione e verifica la presenza nelle posizioni previste. Non è stata introdotta una sostituzione generica o una tolleranza per perdite arbitrarie di link.

Le modifiche Atlas separano i parametri embedded `aps_q`, `aps_type`, `aps_role`, `aps_region` da quelli dello standalone, conservano le altre query e il frammento e ripristinano i controlli su `popstate`. Il valore esplicitamente vuoto evita che il reset riattivi la vecchia query Explorer. I dettagli aperti sono recuperati dal DOM prima di aggiungere risultati. Questa lettura è coerente con le promesse del CHANGELOG; le prove browser restano un gate separato.

## Verifica di conservazione predisposta

`verify-data-preservation-0799.py --prepare` ha acquisito direttamente dagli oggetti Git della baseline hash, dimensioni e inventari. Nessun sorgente condiviso è stato modificato e non è stata avviata una build.

| Ambito | Copertura predisposta |
|---|---:|
| CSV | 67 file, 51.085 record |
| JSON di dati congelati | 53 file |
| Evidenze congelate | 6 file, in parte già inclusi nei JSON |
| ZIP precedenti | 23, incluso il candidato 0.7.98 |
| Checksum precedenti | 22 |
| CITATION e documenti RR integralmente immutabili | 3 file |
| Paper Markdown/HTML, README e indice di ricerca | 4 file: solo riferimenti tecnici puntuali autorizzati |
| Review precedenti | 15 file |
| Inventario del pacchetto dati precedente | 112 membri |

La verifica dopo build confronterà tutti questi contenuti con la baseline, controllerà i riferimenti scientifici nella pubblicazione e nel manifesto RR, gli hash/righe/dimensioni dei CSV nel manifesto generato, l’estensione della storia di release e del registro di immutabilità, il checksum e il CRC del nuovo ZIP e l’identità di ogni suo membro con il sorgente corrispondente. Nel nuovo pacchetto sono previste soltanto tre modifiche: `manifest.json`, `release_history.json`, `frozen_technical_packages.json`. Qualsiasi ulteriore variazione sarà segnalata per revisione, non accettata automaticamente.

**Stato di quella fase:** preparazione completata e verifica in attesa del coordinatore. La verifica post-build è stata poi eseguita con successo; esito e perimetro sono riportati nel riepilogo finale sotto.

## Integrazione successiva: intestazioni e osservazioni sul peso

Il coordinatore ha integrato la proposta E05/E06 nelle quattro risorse esterne: `assets/reader-first.js`, `assets/aps-atlas.js`, `assets/aps-atlas.css`, `assets/style.css`. La prova specifica delle intestazioni registra +546 byte complessivi rispetto alla 0.7.99 prima di questo intervento e zero variazione attesa dell’HTML statico attribuibile a questi soli file. Questo dato non va confuso con il delta totale fra 0.7.98 e 0.7.99.

Il confronto post-build verificherà gli hash dei quattro asset contro la proposta e registrerà separatamente i byte delle cinque pagine principali e dell’HTML più i due payload estratti. La policy osservata resta quella di `scripts/validate_delivery.js`: HTML inferiore a 1.240.000 byte e carico aggregato entro la baseline storica più 2.048 byte. La verifica ufficiale, che comprende anche la parità dei dati e il corretto caricamento, resta obbligatoria e separata. Queste misure aggiuntive non sono presentate come sostituzione del checker.

## Primo esito reale della build e correzione del registro

La prima generazione 0.7.99 è arrivata a `release_check`, che ha rifiutato la voce aggiunta `downloads/connecting-the-dots-data-pack-v0.7.98.sha256`: il registro ammette soltanto ZIP. Questo è stato un errore della preparazione del candidato, rilevato dalla guardia esistente. La precedente lettura dei diff non lo aveva individuato. Il coordinatore rimuove soltanto la voce non ammessa, conserva il sidecar fisico, crea un nuovo checkpoint/pin e ripete la build completa. Nessuna guardia o baseline scientifica viene allentata.

Il harness di conservazione è stato allineato alla policy corretta: richiede la sola nuova voce ZIP 0.7.98 nel registro; mantiene il confronto byte per byte e la verifica del digest archivio per tutti e 22 i sidecar precedenti. Il confronto finale è stato eseguito dopo la seconda build riuscita. Il primo fallimento resta documentato e non viene descritto come un successo.

## Esito post-build definitivo di questo audit

`generated-data-audit-0799.json` riporta `passed:true`, **353/353 controlli**. Il pin autorizzato `d00e948c35fa3353b15a5db7f130fec988867888` corrisponde a `publication.json` ed è risolto come commit Git. Oltre agli hash dei CSV, sono verificati le note scientifiche del manifest, il digest della storia di release e inventario, dimensione e digest degli asset di consegna.

### Documenti di ricerca: eccezioni tecniche delimitate

Il generatore esistente aggiorna anche il Markdown del paper; il coordinatore ha autorizzato esplicitamente questo perimetro dopo l’ispezione. L’audit non dichiara più l’intero Markdown identico byte per byte. Verifica invece la trasformazione esatta della baseline e poi l’identità di ogni byte restante, senza normalizzare nemmeno gli a capo:

- Markdown del paper: una sola riga “Current technical data package”, con versione 0.7.99 e URL del relativo ZIP.
- HTML del paper: la corrispondente indicazione tecnica e il meta digest SHA-256 del Markdown così aggiornato.
- `research/README.md`: una sola indicazione “Latest technical site”.
- `research/index.html`: una sola ancora del pacchetto corrente, una sola nota della sua versione e i due riferimenti cache di `reader-first.css` / `reader-first.js`.

Ogni sostituzione ha un numero di occorrenze controllato pari a uno. `paperVersion`, `paperRevisedOn`, RR1/RR2, DOI, numeri, ragionamenti e ogni altro testo restano invariati. Questi aggiornamenti mantengono corretti i riferimenti alla versione corrente; non attestano una nuova revisione scientifica.

### Pacchetto 0.7.99

- Dimensione: **4,346,009 byte**.
- SHA-256: `5c2f5f9c344378e98990a09aea3776882479b27e3d17114b5918194c84487eba`.
- **112 membri**, senza duplicati; CRC valido e checksum corretto.
- **109 membri identici** al pacchetto 0.7.98.
- Tre soli membri diversi: `frozen_technical_packages.json`, `manifest.json`, `release_history.json`.
- Ogni membro corrisponde esattamente al rispettivo sorgente del candidato.

### Osservazioni sul peso, distinte dal gate ufficiale

I quattro asset corrispondono agli hash della proposta delle intestazioni e confermano **+546 byte** rispetto alla versione 0.7.99 prima di quell’intervento. Il delta totale HTML 0.7.98 → 0.7.99 è riportato separatamente:

| Pagina | HTML, byte | Delta da 0.7.98 | HTML + due payload estratti, byte | Margine rispetto al limite aggregato |
|---|---:|---:|---:|---:|
| `index.html` | 1,172,369 | -62 | 1,619,195 | 869 |
| `en/index.html` | 1,172,755 | -62 | 1,619,581 | 863 |
| `it/index.html` | 1,197,273 | -36 | 1,657,778 | 739 |
| `de/index.html` | 1,203,248 | -43 | 1,665,432 | 711 |
| `fr/index.html` | 1,219,867 | -14 | 1,693,429 | 641 |

Tutte le pagine osservate restano sotto il limite HTML e sotto il limite aggregato della policy. Il checker `scripts/validate_delivery.js` è byte per byte quello della baseline. Il suo esito ufficiale resta un gate separato, eseguito dal coordinatore: queste misure non lo sostituiscono e non pretendono di rappresentare ogni risorsa di rete della pagina. Browser e assembly remoto rimangono verifiche ulteriori.
