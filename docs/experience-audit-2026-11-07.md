# Connecting the Dots — qualità dell’esperienza, contenuti e accessibilità

**Data dell’audit:** 7 novembre 2026. **Baseline esaminata:** candidato tecnico 0.7.98, commit `dee7b777d5ca6ac042167ed02d2e1fe253a36931`. **Interventi:** release 0.7.99. La 0.7.98 ha superato i propri controlli, ma viene superata dalla 0.7.99 prima di qualsiasi pubblicazione su main e GitHub Pages. La versione pubblica di partenza è 0.7.97.

Questa relazione documenta problemi, decisioni ed evidenze dell’audit. Gli esiti dei controlli sul candidato completo e sulla pubblicazione reale sono registrati separatamente: una prova del DOM, una scansione automatica e una sessione con un lettore di schermo non sono intercambiabili. Nessuna sessione con persone è stata svolta.

## Valutazione complessiva

Connecting the Dots ha una base editoriale riconoscibile: spiega Internet attraverso nomi, storie, istituzioni e conseguenze concrete; consente poi di controllare le fonti e riusare i dati. La distinzione fra FATTO, LETTURA e VISIONE, fra candidatura e delega, e fra archivio scientifico e versione corrente è una qualità sostanziale. Il sito non ha bisogno di accumulare ulteriori pannelli per sembrare più ricco.

Il miglioramento prioritario riguarda la continuità dell’esperienza: raggiungere subito l’azione scelta, ritrovare la stessa ricerca dopo un cambio lingua o un reload, ascoltare tutte le informazioni visibili e capire che cosa si può concludere da ciascun dato. Sono stati individuati difetti reali in questi passaggi e corretti nel candidato 0.7.99.

Il giudizio sull’engagement resta qualitativo. Non sono disponibili misure di comprensione, completamento dei compiti o ritorno dei lettori. Un punteggio «10/10» assegnato dal realizzatore non colmerebbe questa mancanza. L’obiettivo utile è un’esperienza che permetta a persone diverse di arrivare a una risposta, valutarne i limiti e scegliere un approfondimento sensato.

| Dimensione | Risultato dell’audit | Decisione |
|---|---|---|
| Accuratezza | Nessuna contraddizione sostanziale nelle 12 affermazioni sensibili campionate; un filtro semanticamente troppo ampio e un tempo verbale da correggere. | Etichette più precise in tutte le lingue; snapshot scientifici invariati. |
| Fonti e fiducia | Provenienza ben documentata; un vecchio endpoint APS non disponibile, ripetuto in 22 link. | Aggiornare la destinazione di consultazione, conservando l’indirizzo storico di acquisizione. |
| Accessibilità | Un nome ARIA nascondeva i metadati delle schede mobili; mancava un livello principale nelle viste e un heading per le candidature Atlas. | Nomi derivati dai dati visibili e gerarchia esplicita; verifica dell’albero AX e della tastiera. |
| Facilità di comprensione | Introduzione concreta; maggiore densità di termini e cautele in Economia e .lugano, con possibile difficoltà da validare. | Conservare cautele e definizioni; chiarire gli stati al punto d’uso, senza diluire i dati. |
| UX | Stato Atlas perso con reload/lingua, reset troppo esteso, dettagli richiusi durante la paginazione. | URL riproducibili, filtri indipendenti, dettagli conservati. |
| UI mobile | Ricerca primaria preceduta da spiegazioni ripetute. | Anticipare il campo nel DOM, mantenendo integralmente i testi. |
| Engagement | Storie e domande concrete sono buoni ingressi; la home offre più punti di partenza potenzialmente sovrapposti. | Verificare con compiti reali se gli ingressi si sovrappongono; migliorare quelli esistenti quando emerge una difficoltà. |
| Prestazioni | Budget di peso ripristinati nella manutenzione tecnica; misure locali e pubbliche hanno condizioni diverse. | Mantenere i limiti, misurare il sito reale e non spacciare il laboratorio per esperienza sul campo. |

## Correzioni verificabili

### Le schede mobili devono comunicare tutti i dati

Nel TLD Explorer il bottone che contiene una scheda aveva un nome ARIA equivalente a «Apri la scheda di .aaa». Questo sostituiva nell’accessibilità il riepilogo visibile di stato, anno, tipo e gestore. Nella visualizzazione mobile la tabella alternativa è nascosta: la perdita era quindi concreta.

Il bottone ora ottiene il nome dal contenuto visibile. Il testo dell’azione rimane come descrizione, mentre ruolo, superficie cliccabile, ordine di tabulazione e gestione del profilo restano gli stessi. Nessun dato essenziale è affidato a un tooltip. La prova sul DOM effettivamente prerenderizzato copre 250 schede nelle quattro lingue e nell’alias; tre varianti errate vengono respinte. La soluzione riduce di 250 byte ogni pagina principale.

La nuova accettazione browser controlla il nome e la descrizione calcolati da Chromium, l’apertura da tastiera, Escape e il ritorno del focus alla scheda. Le scansioni axe comprendono anche le regole WCAG 2.2 AA disponibili nello strumento. Questi controlli non sostituiscono VoiceOver, NVDA o una revisione umana completa dei criteri WCAG.

Riferimento metodologico: [W3C APG — Providing Accessible Names and Descriptions](https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/).

### Le intestazioni devono permettere di orientarsi

Fuori dalla home, il titolo principale visibile del capitolo era un H2, mentre l’H1 della hero era nascosto. L’arricchimento JavaScript assegna ora il livello accessibile 1 soltanto al titolo della vista attiva, rimuovendolo dal precedente quando si cambia pagina interna. Il nodo rimane lo stesso, conservando focus e ID. Nel documento completo senza JavaScript, gli H2 restano subordinati all’H1 della home. È una correzione del livello nell’albero di accessibilità, non una conversione generalizzata del markup in H1.

Le stringhe delle candidature Atlas diventano heading reali: H3 nell’Atlas autonomo, dopo il titolo H2 della ricerca; H4 nell’Atlas incorporato, dopo i suoi H2 e H3. I margini vengono esplicitamente conservati. Questo permette di saltare fra candidature attraverso le intestazioni senza cambiare l’aspetto delle schede o aggiungere testo.

La prova mirata sul DOM copre 116 cambi di vista e 480 candidature nelle quattro lingue; conferma anche 12 fallimenti della baseline precedente. I quattro asset esterni crescono complessivamente di 546 byte per queste sole correzioni semantiche, senza crescita dell’HTML statico. La verifica del livello AX reale resta parte dell’accettazione browser della release.

### La ricerca deve essere raggiungibile all’ingresso

Il campo principale dell’Explorer viene spostato subito dopo il titolo dello strumento, prima della seconda spiegazione. È lo stesso elemento: ID, link, traduzioni e contenuti restano presenti. La sequenza visiva coincide con quella del DOM e della tastiera. Il riordino aggiunge zero byte.

La verifica browser misura il rettangolo completo del campo nel viewport iniziale, prima di qualunque focus o scorrimento automatico. Copre EN, IT, DE e FR, a 320 e 390 pixel di larghezza e 844 pixel di altezza. La visibilità in queste otto condizioni non viene generalizzata a ogni dispositivo possibile.

### L’Atlas deve ricordare la ricerca

Il difetto è stato riprodotto nel sito pubblico: partendo da .lugano, una ricerca di Tether mostrava due candidature, ma ricaricare ripristinava .lugano. Anche i filtri non entravano nell’URL. Il reset dell’Atlas incorporato cancellava l’intera query e il frammento, compreso il contesto del sito. «Carica altre candidature» ricreava invece le schede e richiudeva i dettagli già aperti.

La correzione separa le chiavi dell’Atlas incorporato (`aps_q`, `aps_type`, `aps_role`, `aps_region`) da quelle dell’Explorer. L’Atlas autonomo conserva le chiavi storiche. I permalink delle singole candidature continuano a funzionare, una ricerca vuota resta esplicitamente vuota e i valori di filtro non validi tornano alla selezione generale. Reload, cambio lingua e link condivisi ricostruiscono la stessa selezione. La paginazione conserva i dettagli aperti.

La prova esegue il JavaScript reale e il corpus congelato completo: quattro lingue, due superfici, nove scenari per superficie. Il codice precedente fallisce la stessa verifica della conservazione dell’URL. È prevista inoltre l’accettazione browser sulle due superfici e sulle pagine realmente pubblicate.

### Le etichette devono rispettare ciò che il dato dimostra

«Estensioni operative» è sostituito da «Nella radice DNS», con equivalenti nelle altre tre lingue. La delega tecnica non dimostra che un sito sia disponibile, che le registrazioni siano aperte o che un progetto abbia prodotto benefici. La modifica rende il filtro coerente con il suo criterio effettivo.

Il Replacement Period dell’8–21 ottobre è descritto al passato. Le date restano le stesse; il 17 novembre resta una tappa prevista. Non viene fatta passare una correzione editoriale di novembre per un nuovo snapshot ICANN.

### Un link di consultazione deve portare a una fonte disponibile

Il vecchio indirizzo `/aps/applications/export/csv` restituisce HTTP 404. È un endpoint ripetuto in 22 collegamenti di navigazione su 17 pagine, non 22 fonti diverse. I collegamenti visibili vengono indirizzati all’[elenco pubblico APS](https://newgtldprogram-aps.icann.org/applications), con etichette che descrivono un elenco ufficiale e non promettono un download diretto.

La trasformazione ammette solo quell’indirizzo esatto. Nei JSON scientifici e nei metadati di provenienza rimane l’URL da cui i dati furono acquisiti. Le guardie di rilascio verificano l’eccezione in modo esplicito, mantenendo gli inventari e gli hash storici. La prova mirata dei renderer supera 50 controlli; quella delle guardie comprende sei casi validi e 24 mutazioni da respingere.

## Accuratezza: che cosa è stato effettivamente approfondito

Il campione riguarda dodici affermazioni che, se imprecise, altererebbero la comprensione del sito: gerarchia DNS ed esempi riservati; DNSSEC e TLS; classificazione di .ai; origine culturale di .cat; conteggi del Reveal Day 2012; unità di conteggio APS 2026; stato di .lugano; calendario 2026; tariffa di valutazione; regole sulla contention; ruolo di ICANN; ciclo di eliminazione dei gTLD.

La matrice [editorial-claims.json](audits/2026-11-07/editorial-claims.json) indica per ogni affermazione la posizione, le fonti primarie, l’esito e le qualificazioni. Non sono emerse contraddizioni sostanziali nel campione. Questo risultato non certifica ogni cifra economica, ogni dossier PDF remoto o ogni frase delle quattro traduzioni.

Tre distinzioni meritano particolare tutela editoriale:

- Il conteggio ufficiale delle candidature, il numero di record del CSV, gli ID base, le sostituzioni e le stringhe distinte sono unità diverse. Le differenze documentate non vanno eliminate per ottenere numeri apparentemente uniformi.
- .lugano è presentata nel perimetro dello snapshot come candidatura. Possibili impieghi e risultati futuri richiedono decisioni ed evidenze ulteriori; non diventano fatti perché compaiono accanto a una scheda ufficiale.
- La citazione del dataset corrente, l’archivio RR2 e il working paper identificano oggetti diversi. Data di aggiornamento del sito, data del corpus e data bibliografica devono restare distinguibili.

## Comprensione ed engagement: dove investire dopo le correzioni

### Un percorso principale e approfondimenti leggibili

La home offre tre azioni, storie, guida breve, aree tematiche e altre domande di orientamento. Ogni elemento ha un’utilità, ma la loro somma può far ripetere al lettore la scelta iniziale. È un rilievo euristico, non un tasso di abbandono misurato.

La direzione raccomandata è mantenere leggibili le tre intenzioni — capire, cercare, usare la ricerca — e assegnare ai blocchi successivi un compito distinto. Non serve un settimo menu. Prima di riorganizzare ampiamente la home, occorre osservare se un lettore sa scegliere il proprio percorso e se trova un seguito naturale alla prima storia.

### Una spiegazione concreta vicino al termine tecnico

Parole come «delega», «namespace», «stewardship» e «agent-ready» possono essere necessarie negli approfondimenti, ma richiedono una prima spiegazione comprensibile. L’obiettivo non è togliere precisione: è permettere di capire la distinzione prima di impararne l’etichetta.

Il sito ha già molte cautele e definizioni. Va controllata la loro prossimità al primo uso, evitando nuovi blocchi introduttivi che ripetano quelli esistenti. Per le sezioni dense, una domanda guida, una risposta breve e un accesso chiaro alle prove sono più utili di un testo uniformemente lungo.

Riferimento metodologico: [W3C WAI — Use Clear and Understandable Content](https://www.w3.org/WAI/WCAG2/supplemental/objectives/o3-clear-content/). Si tratta di indicazioni supplementari per l’accessibilità cognitiva, non di un criterio che da solo determini conformità WCAG.

### Un percorso riconoscibile per chi valuta un progetto

I materiali per valutare un progetto sono distribuiti fra Città, Economia, .lugano e Round 2026; il percorso collega già Città a .lugano. Non è stato misurato se questa distribuzione ostacoli chi deve prendere una decisione.

Prima di modificare l’orientamento, verificare se un lettore riesce a trovare lo stato documentato, distinguere fatti e proposta e recuperare le prove. Se emerge una difficoltà, migliorare l’etichetta o la destinazione di un ingresso esistente. Non è prevista una nuova carta.

## Protocollo per verificare l’eccellenza con persone

I materiali del sito consentono tre compiti concreti. Un curioso dovrebbe spiegare, con parole proprie, perché .ai e .lugano non hanno lo stesso stato. Un decisore dovrebbe trovare lo stato documentato di una candidatura, un limite e una domanda da risolvere prima di valutarne l’utilità. Un ricercatore dovrebbe recuperare una fonte, condividere una ricerca riproducibile e scegliere l’oggetto corretto da citare.

La sessione deve registrare completamento senza aiuto, esitazioni, errori di interpretazione e ciò che la persona ricorda. Velocità di lettura e permanenza da sole non dimostrano comprensione. Vanno inclusi telefono, tastiera e almeno una sessione con tecnologia assistiva, oltre a una revisione linguistica madrelingua dei passaggi decisivi.

Questo è un protocollo proposto. Non sono stati reclutati partecipanti, raccolti dati di utenti, aggiunti tracciamenti o inventati risultati di engagement.

## Conservazione, prove e limiti

La 0.7.99 comprende le correzioni tecniche della 0.7.98 e gli interventi di esperienza descritti qui. Restano congelati i dati scientifici, i riferimenti RR1/RR2, le acquisizioni IANA/APS e gli archivi precedenti. Il pacchetto 0.7.98 viene conservato come candidato tecnico verificato, senza attribuirgli una pubblicazione mai avvenuta su Pages.

Il generatore aggiorna i riferimenti al pacchetto tecnico corrente anche nel Markdown del working paper, negli HTML e nel README della ricerca. Queste indicazioni di versione e collegamento sono distinte dal testo scientifico, dalla versione del paper e dalla sua data di revisione. La verifica di conservazione ammette soltanto le sostituzioni tecniche esatte e controlla tutto il contenuto restante.

Le evidenze di base sono conservate in `docs/audits/2026-11-07/`: rapporto strutturale, rapporto editoriale, matrice delle affermazioni, osservazioni manuali, prove sul DOM, controlli dei link e mutazioni negative delle guardie. La review della release conserva gli hash dei file e tutte le invarianti storiche; non riscrive la baseline per far passare i controlli.

Per chiudere la pubblicazione sono richiesti build deterministica, confronto dell’albero Git, parità A/B, suite browser sul candidato esatto, deploy reale, identità dei byte pubblici e verifiche sulle pagine pubblicate. I risultati devono specificare commit e condizioni. Un vecchio test verde, un deploy saltato o un server locale non dimostrano che la release corrente sia pubblicata correttamente.

Restano limiti espliciti: nessuna certificazione WCAG, nessuna prova con lettori di schermo reali, nessuno studio di comprensione con persone, nessuna revisione madrelingua completa, nessun nuovo censimento scientifico e nessun audit contabile integrale. Sono confini dell’evidenza, non motivi per lasciare irrisolti i difetti già riprodotti.
