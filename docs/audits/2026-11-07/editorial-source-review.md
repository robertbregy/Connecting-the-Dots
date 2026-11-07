# Revisione indipendente dei sorgenti 0.7.99 — prima della build

**Baseline:** candidato tecnico non pubblicato `dee7b777d5ca6ac042167ed02d2e1fe253a36931` (0.7.98). **Worktree esaminata:** `experience-repository`, con modifiche non ancora consolidate. **Esito della lettura:** nessun problema bloccante individuato nel perimetro esaminato; la validazione degli output rimane da eseguire dopo la build.

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
- Il registro degli archivi aggiunge il pacchetto candidato 0.7.98 e il suo checksum, mantenendo i digest precedenti. Riordinare le chiavi JSON non altera i riferimenti.

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
| Paper, CITATION e documenti di ricerca immutabili | 6 file |
| Review precedenti | 15 file |
| Inventario del pacchetto dati precedente | 112 membri |

La verifica dopo build confronterà tutti questi contenuti con la baseline, controllerà i riferimenti scientifici nella pubblicazione e nel manifesto RR, gli hash/righe/dimensioni dei CSV nel manifesto generato, l’estensione della storia di release e del registro di immutabilità, il checksum e il CRC del nuovo ZIP e l’identità di ogni suo membro con il sorgente corrispondente. Nel nuovo pacchetto sono previste soltanto tre modifiche: `manifest.json`, `release_history.json`, `frozen_technical_packages.json`. Qualsiasi ulteriore variazione sarà segnalata per revisione, non accettata automaticamente.

**Stato:** preparazione completata; esecuzione post-build in attesa dell’avviso del coordinatore. Non viene dichiarata una conservazione già verificata sulla build 0.7.99 finale.
