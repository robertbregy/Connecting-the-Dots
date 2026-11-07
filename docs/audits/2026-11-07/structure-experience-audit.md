# Connecting the Dots — audit dell’esperienza e della struttura

**Baseline osservata:** candidato `dee7b777d5ca6ac042167ed02d2e1fe253a36931`, versione 0.7.98, mai pubblicato. La pubblicazione prevista passa direttamente alla 0.7.99. **Data:** 7 novembre 2026.

L’audit ha individuato tre difetti riproducibili nelle interazioni, tre miglioramenti circoscritti di accessibilità e gerarchia e due ipotesi di orientamento da verificare con lettori. La ricerca non richiede una riscrittura: il lavoro utile riguarda soprattutto come si raggiunge, si conserva e si ascolta l’informazione.

Non è un voto del sito né una certificazione di conformità. Non sono stati coinvolti partecipanti umani. Le osservazioni provengono da HTML, CSS, JavaScript, dizionari nelle quattro lingue e schermate già prodotte dalla CI. Il comportamento Atlas è stato riprodotto eseguendo il JavaScript di produzione su DOM locale senza browser; il coordinatore ha inoltre riprodotto la perdita dello stato nel browser live. Nessun Chromium locale è stato lanciato.

## 1. Che cosa funziona già

Il sito offre tre modi concreti per entrare: una lettura introduttiva, la ricerca di un’estensione e l’uso delle fonti. Le storie di .com, .ai e .cat danno un motivo comprensibile per proseguire. La distinzione fra nomi, siti, candidature e deleghe compare nel testo principale; non è relegata a una nota legale. Questi sono elementi da conservare.

Nel candidato 0.7.98 la struttura `reader-first` aggiunge domande leggibili ai capitoli, un contesto di navigazione, indici locali e due direzioni successive. Il lettore può approfondire e poi tornare alle prove. La pagina di citazione distingue esplicitamente archivio RR2, dati correnti e working paper: la scheda della versione corrente nella baseline indica 0.7.98 e 6 novembre 2026; versione e data sono ora alimentate dal manifesto di pubblicazione. Lo stato di bozza e la lingua inglese del paper sono dichiarati. I collegamenti alle fonti restano parte della lettura.

Non propongo di eliminare avvertenze, fondere unità di conteggio, rendere “attuali” gli archivi, tradurre liberamente stati ufficiali APS o riscrivere le analisi per renderle più promozionali. Il miglioramento deve conservare queste distinzioni.

## 2. Percorsi dei tre pubblici

| Persona | Percorso disponibile | Valutazione circoscritta |
|---|---|---|
| Curioso | Home → guida di tre minuti → caso .ai/.cat/.com → capitolo e fonti | L’invito iniziale è concreto. Più in basso la home ripete diversi inviti a cominciare e orientarsi; la gerarchia può diventare più netta. |
| Decisore | Storie → Città; oppure Round 2026 → .lugano; Economia per misure e costi | I materiali esistono e distinguono proposta, stato e verifiche. Il percorso fra Città e .lugano è già collegato; resta da verificare se chi deve valutare un progetto riconosce questo ingresso. Non è una difficoltà misurata con utenti. |
| Ricercatore | Home → Usa la ricerca → oggetto da citare → archivio, ZIP corrente o paper | Il percorso di citazione è ben definito. Nella baseline la perdita dei filtri Atlas e la chiusura dei dettagli penalizzavano l’esplorazione; le correzioni sono implementate nella 0.7.99, con verifica browser ancora pendente. |

Riferimenti: `.heroActions`, `#three-minute-guide`, `#research-citation-guide`; `data/reader_first.json` contiene aree e relazioni fra capitoli; `scripts/reader_first.cjs` costruisce le introduzioni e le carte successive.

## 3. Rilievi prioritizzati

### E01 — I metadati delle card mobili non entrano nel nome accessibile

**P1 · difetto semantico confermato.** Percorso: Esplorare → TLD Explorer a larghezza mobile. Elemento: `.explorerCardButton`. Sorgente: `assets/app.js`, funzione `renderExplorer` (riga 159 nella baseline); `assets/style.css`, regola mobile alla riga 73 e stili dei bottoni alla riga 117.

La card contiene nome, provenienza, stato, anno, tipo, tema e gestore. Il bottone aveva però `aria-label="Apri la scheda di .aaa"`. Il calcolo AccName sulla card realmente prerenderizzata restituiva soltanto questa azione e una descrizione vuota. Sul desktop parte dei dati resta in celle autonome; sul mobile la tabella è nascosta e tutto il riepilogo è dentro il bottone. Il problema interessa quindi proprio l’alternativa mobile.

La W3C APG avverte che un nome ARIA applicato a un bottone può sostituire il contenuto discendente nell’esperienza assistiva. La stessa guida distingue il nome ottenuto dal testo visibile dalla descrizione ottenibile tramite `title`: [Providing Accessible Names and Descriptions](https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/).

**Rimedio implementato nel solo worktree 0.7.99:** il bottone deriva il nome dal contenuto visibile; la precedente etichetta d’azione diventa `title`, dunque descrizione accessibile. Non si fa affidamento sul tooltip per comunicare un dato essenziale: tutti i dati sono già nel nome, nel testo visibile e nel ruolo del bottone. Restano identici dimensioni, click sull’intera card, ordine di tabulazione, traduzioni e gestore dell’apertura.

Prova: 250 card su EN/IT/DE/FR e alias, metadati accessibili e testo invariato; tre negativi respinti. Il markup scende di 250 byte per pagina. La prima soluzione con tre ID e `aria-describedby` è stata scartata perché aggiungeva diversi kilobyte e violava il margine del budget. La prova locale usa l’algoritmo AccName su DOM, non un lettore di schermo reale; la nuova QA CI misura anche l’albero AX di Chromium.

### E02 — Ricerca e filtri Atlas non sono riproducibili nell’URL

**P1 · difetto funzionale riprodotto.** Percorsi: `/applications/{lingua}/` e Atlas incorporato in `/{lingua}/?tab=explore`. Sorgente: `assets/aps-atlas.js`, inizializzazione delle query e gestori degli input alle righe 20–24 e 100–107; selettore lingua in `scripts/render_aps_application_atlas.py`, righe 159–164.

Nella baseline, cercare `tether` produce .tether e .usdt ma non modifica l’indirizzo. Il cambio lingua conserva query e frammento già presenti nell’indirizzo, non i filtri rimasti soltanto nell’interfaccia. Ricaricare o condividere perde quindi l’esplorazione. Il coordinatore ha riprodotto nel browser live il caso embedded `?tab=explore&q=.lugano#aps-native`: dopo la ricerca `tether`, il reload ripristina .lugano. Il confronto del file 94a → dee mostra solo l’opzione di raggruppamento numerico: questa logica era immutata.

In più, il reset embedded esegue `uri.search=''` e `uri.hash=''`: cancella anche `tab=explore`, oltre allo stato che dovrebbe appartenere soltanto all’Atlas.

**Rimedio implementato dal coordinatore nel worktree 0.7.99:** l’Atlas embedded usa `aps_q`, `aps_type`, `aps_role`, `aps_region`, preservando `tab`, `q`, `tld` e il contesto del frammento. Lo standalone usa `q`, `type`, `role`, `region`. Restano leggibili i permalink storici `application` nell’embedded e `id` nello standalone; il vecchio `q` alimenta ancora l’embedded quando non esiste uno stato Atlas esplicito. `aps_q=` rappresenta una ricerca vuota esplicita e non riattiva `q=.lugano`. Il reset modifica soltanto le chiavi possedute dall’Atlas. La prova DOM sulle otto combinazioni di lingua e superficie, con nove casi ciascuna, è passata; la verifica browser della build 0.7.99 è pendente.

### E03 — “Carica altre candidature” richiude i dettagli già aperti

**P2 · difetto funzionale riprodotto.** Elementi: `.apsCardDetails`, `#apsMore`. Sorgente: `assets/aps-atlas.js`, `render()` alle righe 90–97 e gestore `more` alla riga 103.

La paginazione aumenta il limite da 30 a 60, poi sostituisce tutto `results.innerHTML`. Aprire il dettaglio della prima candidatura e caricarne altre richiude il dettaglio precedente. La prova con il JavaScript originale conferma il comportamento nello standalone e nell’embedded. Il codice riapre soltanto l’eventuale `directId` iniziale.

Il lettore che confronta dossier perdeva così uno stato utile, anche senza cambiare filtro. **Rimedio implementato dal coordinatore nella 0.7.99:** il renderer conserva gli ID dei dettagli aperti e li riapre fra i risultati mantenuti, anche dopo “Carica altre candidature”; il reset li azzera esplicitamente. E02/E03 passano la prova DOM 8 × 9. La verifica browser 0.7.99 è pendente. Resta da osservare il focus quando il bottone di caricamento scompare all’ultima pagina: non lo dichiaro come difetto già dimostrato.

### E04 — La ricerca primaria arriva dopo due introduzioni

**P2 · attrito osservato; priorità euristica.** Percorso: Home → Cerca un’estensione → Explorer. Evidenza visiva: `artifacts/feature-independent/audit-independent-it-320-explore.png`. Struttura: `#reader-start-explore`, indice locale, pannello TLD Explorer, `exploreSub`, poi `.explorerSearchPrimary`.

Nella schermata a 320 px il campo di ricerca compare a fondo viewport, dopo la domanda del capitolo, il lead, l’indice, il titolo TLD Explorer e un secondo paragrafo di circa sette righe. Chi ha già scelto di cercare deve attraversare nuovamente l’introduzione allo strumento. Non è una violazione automatica di accessibilità, ma un costo evitabile per un’azione primaria.

**Rimedio applicato nel worktree 0.7.99:** spostare lo stesso nodo di ricerca immediatamente dopo il titolo TLD Explorer e prima del secondo paragrafo. Nessun testo viene chiuso, nascosto o cancellato. Anche senza JavaScript, la spiegazione resta al suo posto nel documento; il CSS esistente gestisce i controlli interattivi. La sequenza visuale coincide con il DOM e la tastiera. Prova su cinque pagine: tutti gli ID, href e testi tradotti identici, zero byte aggiuntivi. Il nuovo controllo browser misura l’intero rettangolo del campo nella schermata iniziale 844 px e verifica che il centro non sia coperto, senza auto-scroll preliminare.

### E05 — I capitoli non home iniziano semanticamente da H2

**P2 · miglioramento semantico, non una dichiarazione autonoma di non conformità WCAG.** Sorgenti: `assets/style.css:574` nasconde `.hero` fuori da overview; il solo H1 è nella hero. `scripts/reader_first.cjs` crea `.readerChapterTitle` come H2.

Visivamente il capitolo ha un titolo evidente, ma la vista attiva di Explorer, Economia o Ricerca non espone un H1 del capitolo. Il titolo del documento viene invece correttamente aggiornato da `assets/reader-first.js`. Questo scarto rende meno lineare l’orientamento per intestazioni.

**Rimedio implementato nella 0.7.99:** `reader-first.js` espone il solo titolo della vista attiva con `aria-level="1"`; al cambio vista o ritorno alla home rimuove l’attributo dal precedente. Il tag resta H2 nel documento HTML completo, dove il titolo della hero è l’H1. La correzione riguarda il livello accessibile della vista interattiva: non aggiunge un secondo H1 nel DOM, non sostituisce il nodo focalizzato e non cambia gli heading scientifici, gli anchor o il testo. L’uso di `aria-level` sugli heading nativi rientra negli attributi ammessi da [W3C ARIA in HTML](https://www.w3.org/TR/html-aria/#el-h1-h6).

Prova DOM: 29 viste × 4 lingue, ripristino Home e documento senza routing, identità dei nodi e markup dei titoli preservati, semantica di altri elementi non toccata. La baseline fallisce il controllo del livello principale. Il controllo browser integrato nella suite esistente verifica il livello AX effettivo sulla rotta diretta, nel passaggio Storie → Economia e al ritorno Home; questa parte è ancora pendente.

### E06 — I risultati Atlas non hanno intestazioni proprie

**P2 · limite semantico confermato dal markup.** Sorgente: `assets/aps-atlas.js:66–71`. Ogni risultato è un `article.apsCard`, ma il nome della stringa è un `div.apsCardString`, con `bdi`; non esiste un heading per il risultato.

Le 30 candidature iniziali possono essere percorse e i dettagli sono nativi, ma la navigazione per intestazioni non permette di saltare fra nomi. Il peso aumenta quando si caricano altri risultati.

**Rimedio implementato nella 0.7.99:** `.apsCardString` diventa H3 nello standalone, sotto il titolo H2 della ricerca, e H4 nell’embedded, sotto Atlas H2 e ricerca H3. Un `margin:0` nelle due regole esistenti neutralizza il margine nativo dell’heading; dimensione, peso, display e altri stili restano identici. Gli ID degli articoli, i permalink, la stringa ASCII e la forma Unicode sono preservati. Non si aggiungono ulteriori etichette ARIA o ID.

Prova: 60 candidature × 4 lingue × 2 superfici, un heading per card e tutto il restante markup identico dopo aver normalizzato i soli tag. La baseline espone DIV e fallisce il controllo. La QA Atlas esistente verifica anche ruolo e livello AX, senza creare una nuova suite. I quattro asset E05/E06 crescono complessivamente di 546 byte; l’HTML statico non cambia. Questa misura riguarda esclusivamente la correzione delle intestazioni; il delta complessivo della 0.7.99 va misurato sulla build aggregata. Nessun build completo o browser locale è stato eseguito per questa prova.

### E07 — La home ripete diversi livelli di orientamento

**P3 · giudizio euristico supportato dalla schermata, da validare con lettori.** Evidenze: `artifacts/feature-browser/audit-ia-b2/it-390-home.png` e `en-1440-home.png`; `.heroActions`, `#three-minute-guide`, `.iaHomeEntry`, `.iaHomeJumpList`, `#internet-guide`.

La pagina offre le tre azioni iniziali e le tre storie, poi la guida di tre minuti, una nuova introduzione ai percorsi, sei aree già disponibili nella navigazione, altre domande e la simulazione “Dietro un clic”. I contenuti hanno valore, ma più passaggi si presentano come il punto da cui cominciare. La pagina dà molto spazio all’orientamento prima di arrivare a una singola esperienza completa.

**Decisione di triage: nessun riordino della home in questa release.** I tre ingressi della hero sono già concreti e le aree hanno funzioni diverse. Una schermata lunga non dimostra che il lettore si perda. Prima di raggruppare o chiudere blocchi occorre osservare se persone esterne sanno scegliere un percorso, raggiungere una risposta e ritrovare la fonte. Se emerge ambiguità, migliorare l’etichetta o la destinazione di un ingresso esistente; non aggiungere altre carte di orientamento.

Non sono disponibili dati che consentano di attribuire a questa ripetizione un tasso di abbandono o una perdita misurata di engagement.

### E08 — Il decisore deve costruirsi il percorso fra più aree

**P3 · opportunità di architettura informativa, non difetto dei contenuti.** Evidenze: sei aree in `data/reader_first.json`; città/economia appartengono a Storie, mentre .lugano appartiene a Round 2026. Le azioni iniziali nominano lettura, ricerca di nomi e uso della ricerca.

Per il curioso e il ricercatore esistono inviti riconoscibili. Per chi vuole valutare una proposta territoriale, i materiali utili sono distribuiti fra stato, governance, impieghi, misure e costi. La distribuzione è osservabile; la sua inefficienza non è dimostrata. Esiste già una relazione fra Città e .lugano nei percorsi successivi: un nuovo ingresso potrebbe duplicarla.

**Decisione di triage: nessuna nuova carta e nessun nuovo menu.** La verifica utile consiste nel chiedere a lettori con quel compito di trovare lo stato di .lugano, separare fatti e proposta, identificare una misura e recuperare la fonte. Solo se il percorso esistente fallisce, correggere l’etichetta o il collegamento della carta Città già presente. Il materiale di ricerca non richiede una riscrittura e non va trasformato in una promessa di consulenza.

## 4. Interventi utili per la 0.7.99 e ipotesi successive

1. **Parità dell’informazione accessibile.** I metadati mobili sono ora nel nome accessibile; restano da eseguire in CI AX, tastiera e ritorno del focus. Sono implementati anche il livello del titolo attivo e gli heading dei risultati Atlas, senza crescita dell’HTML statico; DOM e CSS passano, AX browser resta da eseguire.
2. **Esplorazione riproducibile.** La 0.7.99 serializza lo stato Atlas senza danneggiare quello dell’Explorer e mantiene i dettagli aperti quando si aggiungono risultati. Il beneficio concreto è poter riprendere e condividere la stessa vista. Prova DOM 8 × 9 passata; browser pendente.
3. **Ricerca raggiungibile subito.** Riordinare il DOM del pannello, preservando integralmente la spiegazione. Non servono nuove stringhe né un redesign. La prova locale conferma zero crescita dell’HTML.
**Dopo la release:** E07/E08 restano ipotesi da verificare con lettori. Non giustificano una nuova carta, un redesign o una riscrittura. L’eventuale intervento dovrà migliorare un ingresso esistente sulla base di una difficoltà osservata.

## 5. Prove, limiti e file consegnati

- `structure-mobile-card-semantics.json`: 250 card, quattro lingue più alias, tre negativi, dati visibili invariati, −250 byte per pagina. Il confronto usa il codice reale prerenderizzato con Node.
- `structure-mobile-card-description.patch`: unica modifica mobile, già applicata a `experience-repository/assets/app.js`; il coordinatore possiede ora questo file per l’integrazione Atlas.
- `structure-atlas-current-behavior.json`: prova storica del candidato 0.7.98, con JS originale su DOM; URL perso e dettagli richiusi riprodotti. `atlas-state-positive.json` documenta la verifica della correzione 0.7.99, svolta dal coordinatore: 8 superfici × 9 casi passati.
- `structure-explorer-search-order-proposal.patch` e `structure-search-order-proof.json`: riordino zero byte, applicato al worktree su successiva istruzione del coordinatore. Il JSON conserva lo stato della prova iniziale, eseguita quando era ancora una proposta in memoria.
- `experience-repository/scripts/experience_browser_qa.cjs`: otto scenari, quattro lingue × 320/390, viewport 844, misurazione iniziale senza auto-scroll, AX CDP della card .lugano, Enter/Escape e ritorno del focus; livello AX del titolo sulla rotta diretta e dopo Storie → Economia → Home, con identità del nodo e focus conservati; otto scansioni axe con tag WCAG 2 A/AA, 2.1 A/AA e 2.2 AA. Sono registrati anche gli esiti incompleti da esaminare. Localmente è stato eseguito soltanto `node --check`.
- `heading-proposal/headings-proof.json`: 116 viste, 480 card, 12 fallimenti della baseline confermati e due regole CSS controllate. Il focus della prova DOM è un riferimento simulato: il focus reale e il livello AX sono verifiche distinte della CI.
- `experience-repository/scripts/audit_aps_application_atlas.js`: nei flussi esistenti controlla tag H3/H4 di tutte le card e livello AX della prima, all’ingresso nelle quattro lingue e dopo l’espansione a 60 risultati. Tutti i precedenti controlli e viewport restano presenti.

La nuova suite browser deve essere eseguita sulla build aggregata 0.7.99 in CI: non è stata dichiarata passata qui. Rimangono fuori dalla prova locale la resa assistiva su VoiceOver/NVDA, lo zoom del testo al 200%, una verifica manuale completa delle modalità di reflow e la comprensione misurata con lettori indipendenti. Le schermate a 320/390 px e le scansioni automatiche sono evidenza utile, non una sostituzione di queste verifiche.

I dati, le traduzioni di ricerca, i riferimenti RR2 e le evidenze scientifiche non sono stati modificati da questo lavoro. Il candidato 0.7.98 è rimasto immutato e non è mai stato pubblicato; gli interventi autorizzati sono nel worktree della 0.7.99, che sarà pubblicata direttamente dopo i gate previsti.
