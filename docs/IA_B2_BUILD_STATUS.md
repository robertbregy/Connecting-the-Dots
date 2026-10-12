# Connecting the Dots | B2, costruzione in parallelo

**Data:** 12 ottobre 2026. **Ramo isolato:** `feat/ia-rearchitecture-20261012`.  
**Produzione di confronto:** `main` v0.7.78 (commit `ec231cc12d35fa91ff5340ad057a483ce23a5ca4`).  
**Decisione:** B è la destinazione architetturale. Nessuna fusione su `main` senza accettazione esplicita e QA finale. Questo documento è un registro della migrazione, non un annuncio di pubblicazione.

## 1. Problema della homepage rilevato dai beta tester

Un visitatore può arrivare casualmente su Connecting the Dots senza sapere che cosa si trovi davanti. La vecchia Home iniziava presto dal tema dei TLD e dal processo DNS, ma non dichiarava con sufficiente immediatezza **che cosa sia il progetto, cosa contenga, a chi possa servire e cosa si possa fare**.

La Home B2 apre con:
> **Connecting the Dots è un atlante multilingue e un progetto indipendente di ricerca e divulgazione sui domini di primo livello di Internet (TLD), sulle candidature ICANN e sulle loro conseguenze per economia, società e governance.**

Seguono chiarimenti: non è un sito di vendita/registrazione di domini, è un luogo per capire, esplorare archivi, seguire il 2026 e citare dati; `.lugano` è una candidatura, non un TLD già delegato. Tutti i testi sono tradotti in IT, EN, DE, FR.

**Regola editoriale:** la domanda «Che cos'è questo progetto?» precede la domanda «Che cos'è un TLD?». Il percorso DNS originale resta presente, senza essere ridotto a una frase superficiale.

## 2. Modello architetturale integrato

Cinque aree visibili senza menu giganti:
- **Capire:** spiegazioni, DNS, ruoli, glossario, guide generali sulle sanzioni e sul controllo dell'accesso.
- **Esplorare:** Explorer esistente, Application Archaeology, Application Atlas 2026. Candidatura ≠ stringa ≠ TLD.
- **Storie e questioni:** economia, società, città, geografia, contese, esiti e controversie, curiosità.
- **Round 2026:** dati datati, cronologia, Field Notes specifiche, caso .lugano.
- **Ricerca:** metodo, fonti, DOI specifico RR2, paper e dati. Il DOI di versione non equivale alla versione tecnica del sito.

**25 accessi tematici** conducono direttamente a **21 sezioni complete esistenti** e all'Atlante/guides autonomi. Non sono copie ridotte né ripubblicazioni di dataset: gli strumenti scientifici funzionano sempre sugli stessi record canonici.

Tutti gli URL storici e gli ancoraggi `?tab=` sono lasciati in essere, con selezione della macroarea corrispondente. Un `<details>` secondario conserva le vecchie voci del menu e relativi ancoraggi per accesso diretto e rollback.

## 3. Continuità interpagina

Il generatore `scripts/apply_ia_b2_crossnav.py` inserisce la stessa navigazione task-first su **35 pagine autonome** in quattro lingue dove applicabile:

- 4 Application Atlas;
- 4 cronologie;
- 4 indici Field Notes;
- 20 approfondimenti indipendenti (cinque argomenti × quattro lingue);
- 1 landing /explorer e 1 landing /research in inglese;
- 1 working paper scientifico HTML autonomo in inglese, ora con accesso alle cinque aree senza modificare testo, identità scientifica o citazione.

**Tutela scientifica:** il working paper resta un documento autonomo, non un articolo generico. La navigazione è un livello esterno al testo scientifico. La release RR2 su Zenodo non viene modificata.

Tutti i nuovi link tra pagine sul ramo B usano percorsi relativi. Una piccola routine **attiva solo in anteprima fuori dall'URL ufficiale** mantiene anche i vecchi link assoluti verso le pagine del progetto nello stesso ambiente di test, senza riscrivere le fonti esterne o i DOI. La versione statica conserva canonical e hreflang. La routine viene verificata da test browser su tutti i 35 ingressi.

## 4. Elementi che NON cambiano

- Identità TLD/IANA e candidature, inclusi Application ID e replacement-records `-R`.
- Dataset ufficiali e manifesti, fonte ICANN, campionamenti e limiti dichiarati.
- Explorer e Application Atlas, senza riscritture funzionali necessarie al redesign IA.
- Snapshot `v0.7.78` e data pack corrente deterministico.
- Pacchetto storico v0.7.58, Zenodo RR1 e RR2 con DOI già pubblicati.
- Canonical URL, hreflang e tutte le rotte primarie della produzione fino alla futura approvazione.

## 5. Gate tecnici (solo evidenze verificate)

- Il primo B2 build completo è riuscito sul ramo parallelo, con verifiche multilanguage, manifesti e determinismo degli ZIP: [GitHub Actions 38312786826](https://github.com/robertbregy/Connecting-the-Dots/actions/runs/38312786826).
- La prima matrice B2 degli hub ha superato 8 percorsi Chromium (IT/EN/DE/FR × mobile/desktop), tutte le 25 card e l'integrità delle 21 sezioni: [GitHub Actions 38312786763](https://github.com/robertbregy/Connecting-the-Dots/actions/runs/38312786763).
- **Ultima matrice B2 superata, dopo la revisione della Home:** **8 scenari principali e 35 pagine autonome su 35**, nessun errore, comprese guide evergreen, Atlas e working paper; parità di tutte le 21 sezioni: [GitHub Actions 38314992333](https://github.com/robertbregy/Connecting-the-Dots/actions/runs/38314992333). Il controllo dell'anteprima impedisce l'uscita accidentale dal ramo B e verifica la posizione della presentazione e del menu nella prima schermata.
- Il precedente full browser audit v0.7.78 continua a essere un gate indipendente (160 combinazioni lingua/tema/sezione oltre a Explorer e Atlas). Qualunque regressione **reale** deve essere risolta, non disabilitata per far diventare verde la build.

### Verifica dell'equivalenza editoriale A/B

Il 13 ottobre 2026 è stata effettuata una **comparazione diretta del sorgente** tra `main` (`ec231cc1`) e il ramo B: 20 delle 21 sezioni originali risultano **identiche carattere per carattere**. La Home, unica sezione modificata, torna anch'essa identica quando si rimuove il blocco aggiuntivo di orientamento (1.038 caratteri). La nuova navigazione e i cinque hub sono livelli separati. È stato introdotto `scripts/verify_ia_b2_parity.cjs`, un controllo anticancellazione con un'impronta per ogni sezione, che deve essere deliberatamente aggiornato solo dopo una revisione di ogni futura modifica ai contenuti originali.

**La ricerca non è stata congelata alla versione del sito:** sono stati corretti nei documenti modificabili i link al data pack tecnico corrente `v0.7.78`, con nota di revisione datata del working paper (13 ottobre 2026). La pubblicazione immutabile RR1/RR2, i DOI e i dati non sono stati riscritti.

### Valutazione della Home per il lettore occasionale

La Home ora risponde alla domanda «Che cos'è Connecting the Dots?» e alla domanda «Che cosa posso fare qui?», prima di avviare la spiegazione del DNS. I cinque percorsi sono stati spostati **all'inizio della pagina**, visibili già nella prima schermata; su telefono viene nascosto solo il logo grande puramente decorativo. Un'asserzione browser controlla la posizione iniziale dei percorsi e del testo di presentazione.

## 6. Lavoro ancora necessario prima di poter chiamare B «completa»

1. **Consolidamento dell'esperienza:** completare il controllo qualitativo dei percorsi già integrati, della pagina iniziale e dei collegamenti contestuali fra articoli, dataset ed eventi.
2. **Revisione editoriale a tappeto:** sintesi progressive quando utili, nessuna duplicazione, verifica FACT/READING/VISION, delimitazione di Field Notes, guide generali e controversie.
3. **QA mobile/accessibilità rigoroso:** menu in quattro lingue, focus, overlay, grafici, Explorer, dark mode, tutti i 21 contenuti principali e 35 pagine autonome.
4. **Parità degli URL e dati:** 39 URL canonici + alias, parametri/ancore usati pubblicamente, hreflang, dataset, data pack, DOI, link esterni e redirect solo dove indispensabili.
5. **Regressioni e rollback:** diff integrale con `main`, prova del pacchetto pubblicabile e piano di ripristino.
6. **Giudizio umano finale sul sito completo** e approvazione esplicita alla pubblicazione. La preferenza beta per B giustifica proseguire, non saltare il rilascio controllato.

**Stato attuale:** sviluppo e audit sul branch separato. Nessuna pubblicazione su main.
