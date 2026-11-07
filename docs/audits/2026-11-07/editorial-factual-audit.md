# Audit editoriale e fattuale — Connecting the Dots

**Baseline esaminata:** `dee7b777d5ca6ac042167ed02d2e1fe253a36931`, candidato tecnico 0.7.98 con data di release predisposta al 6 novembre 2026. **Il candidato 0.7.98 non è stato pubblicato su main o Pages:** sarà superseduto dal candidato 0.7.99; il suo pacchetto resta conservato per tracciabilità. Verifica svolta tra il 6 e il 7 novembre UTC. La copia 0.7.98 è rimasta in sola lettura; le correzioni operative autorizzate sono nella worktree distinta `experience-repository`.

## Esito

Nel campione motivato di dodici affermazioni sensibili non è emersa una contraddizione fattuale sostanziale rispetto alle fonti primarie e al perimetro dello snapshot dichiarato. Il sito separa bene dati ufficiali, misure derivate, interpretazione e scenari. I problemi riproducibili individuati riguardano la precisione di una voce di filtro e la raggiungibilità di una fonte, non il contenuto dei dataset.

Sono confermati due rilievi di priorità P2:

1. **“Estensioni operative” descriveva in modo troppo ampio un filtro sulla presenza nella radice DNS.** La delega non dimostra un sito o un servizio disponibile e non implica registrazioni aperte. La nuova etichetta è precisa nelle quattro lingue.
2. **Un endpoint storico dell’export APS risponde HTTP 404.** Lo stesso indirizzo ricorre in 22 collegamenti pubblicati su 17 pagine HTML. È un solo endpoint non disponibile, ripetuto in più viste. Il CSV locale e la sua provenienza restano disponibili e integri. La correzione autorizzata aggiorna la navigazione visibile e mantiene l’indirizzo storico nei dati e nei metadati di citazione.

Una terza osservazione era editoriale: nella baseline un testo usava il presente per un periodo concluso il 21 ottobre. Le date erano corrette, ma il lettore di novembre poteva confondere lo stato dello snapshot con lo stato attuale. **Correzione ora applicata dal coordinatore nel candidato 0.7.99 e verificata nelle quattro lingue:** passato per il periodo 8–21 ottobre, date invariate e 17 novembre mantenuto come previsione. Lo snapshot scientifico resta congelato.

## Perimetro e metodo

Sono stati esaminati gli ingressi e i passaggi decisivi di home e guida breve, Explorer, economia, governance, cronologia `inside-the-round`, caso `.lugano`, ricerca e working paper. Per la lingua italiana sono stati letti i testi e gli elementi generati; per le correzioni operative sono state controllate tutte e quattro le localizzazioni. Le traduzioni complete non sono state sottoposte a revisione linguistica madrelingua.

Le affermazioni ad alto rischio sono state confrontate con ICANN, IANA e RFC. Le indicazioni sulla scrittura accessibile sono riferite alle [raccomandazioni W3C WAI](https://www.w3.org/WAI/tips/writing/). La verifica riguarda accuratezza e chiarezza rispetto ai dati datati: **non costituisce un aggiornamento scientifico del corpus, di RR2 o dello snapshot IANA**. Non sono state aggiunte fonti ai dataset, né cambiate date, stati o classificazioni scientifiche.

Questo è un audit esperto di testo, fonti e comportamento documentato. Non è uno studio con lettori: comprensione effettiva, soddisfazione, ritorni e coinvolgimento non sono stati misurati.

## Dodici affermazioni verificate

### C01 — Il DNS usa una gerarchia radice/TLD/nome; example.com e 192.0.2.10 sono esempi documentali. DNS e trasporto del contenuto web sono distinti.

**Dove:** `it/index.html#internet-guide`; `it/index.html#journey-title-2`; `it/index.html#quick-step-1`.

**Esito:** Confermato, con semplificazione didattica dichiarata. Non è una misura della risoluzione reale di example.com; la guida chiarisce cache e passi semplificati.

**Fonti primarie:**

- https://www.rfc-editor.org/rfc/rfc1034.html
- https://www.iana.org/help/example-domains
- https://www.rfc-editor.org/rfc/rfc5737.html

### C02 — HTTPS/TLS e DNSSEC proteggono aspetti diversi; nessuno dei due dimostra che un contenuto o un commerciante sia affidabile.

**Dove:** `it/index.html#journey-title-5`; `it/index.html#lugano`.

**Esito:** Confermato. La conclusione sull’affidabilità dei contenuti è un’inferenza esplicita dai limiti tecnici dei protocolli, non una citazione letterale degli RFC.

**Fonti primarie:**

- https://www.rfc-editor.org/rfc/rfc4033.html
- https://www.rfc-editor.org/rfc/rfc8446.html

### C03 — .ai è il ccTLD di Anguilla; la reinterpretazione commerciale legata all’intelligenza artificiale non cambia questa classificazione.

**Dove:** `it/index.html#quick-step-2`; `it/index.html#economics`.

**Esito:** Confermato. Verificata la classificazione stabile, non aggiornati contatti o dati del corpus congelato. Non sono state ri-verificate tutte le previsioni finanziarie di Anguilla.

**Fonti primarie:**

- https://www.iana.org/domains/root/db/ai.html

### C04 — .cat nasce per la comunità linguistica e culturale catalana, non come codice paese.

**Dove:** `it/index.html#quick-step-3`.

**Esito:** Confermato. L’obiettivo documentato del dominio non è una misura empirica del suo impatto culturale.

**Fonti primarie:**

- https://www.iana.org/reports/2005/cat-report-18nov2005.html

### C05 — Il riferimento al Reveal Day 2012 distingue 1.930 domande e 1.409 stringhe distinte.

**Dove:** `it/index.html#reveal`; `it/index.html#explore`; `research/connecting-the-dots-working-paper-v1.html — sezione 3`.

**Esito:** Confermato per il perimetro originale del Reveal Day 2012. Non confrontare senza spiegazione con conteggi successivi che usano perimetri o stati diversi; il secondo documento riporta entrambi i numeri a pagina 8 stampata.

**Fonti primarie:**

- https://www.icann.org/en/announcements/details/new-gtld-reveal-day---applied-for-strings-13-6-2012-en
- https://www.icann.org/en/about/ceo/connections-conflict-30jun12-en.pdf

### C06 — Il dato ufficiale è 1.615 candidature e 481 richiedenti. Il CSV pubblico congelato ha 2.783 record: 1.614 ID base e 1.169 sostituzioni. Il conteggio di 980 stringhe è identificato come inventario derivato e distinto dall’aggregato ufficiale.

**Dove:** `it/index.html#reveal`; `it/index.html#explore`; `data/application_2026_snapshot.json`; `data/applications_2026_aps_official_listing.csv`.

**Esito:** Confermato, mantenendo separate le unità di conteggio e la provenienza. Il numero delle righe deriva dalla copia locale già sottoposta all’audit dati. L’endpoint storico CSV restituisce 404: non viene asserita uguaglianza byte per byte con un nuovo download remoto. WDO è esplicitamente esclusa dalla lista pubblica mentre resta nel totale ufficiale.

**Fonti primarie:**

- https://newgtldprogram-aps.icann.org/statistics
- https://www.icann.org/en/announcements/details/icann-reveals-2026-round-applications-for-new-generic-top-level-domains-07-10-2026-en
- https://newgtldprogram-aps.icann.org/help
- https://newgtldprogram-aps.icann.org/applications

### C07 — .lugano è la candidatura CDL2651T-T31516 della Città di Lugano, geografica autodichiarata; una candidatura attiva in pre-valutazione non equivale ad approvazione, delega o servizio operativo.

**Dove:** `it/index.html#lugano-status-sources`; `it/index.html#lugano`; `data/applications_2026.csv`.

**Esito:** Confermato nel record primario consultato, pubblicato il 7 ottobre. La scheda specifica è stata verificata con HTTP diretto 200: la ricerca web non riusciva a renderla. Prova normalizzata in primary-http-checks.json con timestamp, dimensione e SHA-256. Nessuna previsione sull’esito della procedura.

**Fonti primarie:**

- https://newgtldprogram-aps.icann.org/applications/CDL2651T-T31516/summary
- https://newgtldprogram-aps.icann.org/statistics

### C08 — Reveal Day il 7 ottobre; Replacement Period 8–21 ottobre 2026; String Confirmation Day previsto il 17 novembre.

**Dove:** `it/index.html#reveal`; `inside-the-round/it/index.html`; `data/translations.json /it/dataStatusSub`; `data/application_2026_snapshot.json /period`.

**Esito sulla baseline:** Date confermate; tempo verbale da migliorare in un punto dell’interfaccia. **Follow-up 0.7.99:** correzione del passato verificata nelle quattro lingue, con tutte le date e la previsione del 17 novembre invariate. Nella baseline, dataStatusSub usava il presente “è aperto”: il calendario era corretto, ma il lettore di novembre poteva interpretarlo come stato attuale. Il candidato 0.7.99 ha corretto il tempo verbale nelle quattro lingue. Il corpus resta uno snapshot datato, non un feed in tempo reale.

**Fonti primarie:**

- https://www.icann.org/en/announcements/details/icann-announces-date-for-reveal-day-and-other-2026-round-milestones-29-09-2026-en
- https://newgtldprogram-aps.icann.org/about

### C09 — La tariffa base di valutazione 2026 è 227.000 USD per domanda; non equivale al denaro effettivamente incassato e non comprende necessariamente ogni costo condizionale.

**Dove:** `it/index.html#economics`; `data/round_application_fees.json`.

**Esito:** Confermato, inclusa la prudenza sul confronto economico. La fonte prevede costi condizionali e riduzioni ASP; il sito non deve calcolare ricavi reali moltiplicando semplicemente tariffa e candidature. Non è stato svolto un audit contabile di ogni caso economico.

**Fonti primarie:**

- https://newgtldprogram.icann.org/en/application-rounds/round2/2026-round-general/gtld-evaluation-fee/faqs

### C10 — Nel round 2026 la risoluzione privata dei contention set, comprese aste private o accordi equivalenti, non è consentita; i casi 2012 restano storici.

**Dove:** `it/index.html#contention`; `it/index.html#economics`.

**Esito:** Confermato rispetto alle regole pubblicate consultate. Non confondere commenti di stakeholder o proposte con una modifica già entrata nelle regole.

**Fonti primarie:**

- https://newgtldprogram.icann.org/en/application-rounds/round2/2026-round-general/string-contention-resolution/faqs/general/can-applicants-resolve-contention-privately

### C11 — ICANN non controlla da sola l’accesso a Internet o i suoi contenuti e non dispone di un potere generale di disconnettere paesi tramite sanzioni DNS.

**Dove:** `it/index.html#governance-access`; `it/index.html#governance-sanctions`.

**Esito:** Confermato, con distinzione corretta tra ruoli tecnici e obblighi di legge. La lettera del 2 marzo 2022 sostiene il limite istituzionale descritto. Non è una verifica legale universale delle sanzioni in ogni giurisdizione.

**Fonti primarie:**

- https://itp.cdn.icann.org/en/files/correspondence/marby-to-fedorov-02mar22-en.pdf

### C12 — Per il ciclo gTLD illustrato, redemptionPeriod dura 30 giorni dopo l’eliminazione richiesta dal registrar, seguito dal periodo pendingDelete di cinque giorni; scadenza ed eliminazione non sono sinonimi.

**Dove:** `it/index.html#how`.

**Esito:** Confermato con il perimetro indicato. Non presentare questo ciclo come universale per ogni ccTLD; il testo campionato contiene già la cautela.

**Fonti primarie:**

- https://www.icann.org/resources/pages/epp-status-codes-2014-06-16-en

## Valutazione della comprensione e dell’interesse

### Cosa funziona già

La home parte da domande concrete, non da un inventario tecnico: Anguilla e `.ai`, un nome per una città, il rapporto tra nomi, denaro e identità. La distinzione FATTO / LETTURA / VISIONE rende visibile lo statuto delle affermazioni. Il caso `.lugano` precisa il ruolo dell’autore e l’indipendenza del progetto dalla posizione ufficiale della Città; distingue candidatura, valutazione, delega e possibile utilità futura.

La guida breve definisce TLD tramite un esempio riconoscibile. Il testo della guida è nell’ordine di alcune centinaia di parole, compatibile come ordine di grandezza con un percorso breve; la promessa di tre minuti resta una stima editoriale, non un tempo verificato con lettori. La presentazione di `.com` come nato per attività commerciali riguarda l’origine: non afferma che oggi il suffisso certifichi un’attività commerciale. La destinazione storica è coerente con [RFC 1591, sezione 2](https://www.rfc-editor.org/rfc/rfc1591.html); IANA lo classifica come [dominio generico](https://www.iana.org/domains/root/db/com.html). Non è stato svolto un controllo separato di ogni data della cronologia storica.

La sezione economica distingue ricavi, imposte stimate, valori di acquisizione e risultati d’asta. Le cautele sui denominatori e sulla tariffa di candidatura sono utili: impediscono confronti apparentemente immediati ma fuorvianti. L’audit non certifica ogni cifra dei casi finanziari.

La ricerca offre tre percorsi di citazione con oggetti diversi: dati correnti del sito, archivio RR2 e working paper. Nel candidato 0.7.98 la scheda dei dati correnti mostra versione e data correnti; archivio e paper conservano le proprie date. Il paper dichiara limiti classificatori, valori non classificati, differenze tra tassonomie 2012 e 2026 e limiti inferenziali. Un sospetto iniziale di attribuzione errata del totale 2026 a RR1 è stato scartato dopo la lettura del file nel commit RR1 congelato: il conteggio 1.615 era già presente. Nessun rilievo è stato costruito su campi diagnostici storici non pertinenti.

### Dove il lettore può ancora inciampare

Il carico di spiegazioni è consistente nelle sezioni economia e `.lugano`. Questo non è di per sé un difetto: parte del contenuto è organizzato in approfondimenti o controlli espandibili. L’estrazione del testo HTML comprende anche contenuto non sempre visibile; non va usata per sostenere che tutta la pagina sia presentata contemporaneamente.

I termini “delega”, “namespace”, “stewardship”, “discovery” e “agent-ready” richiedono una prima spiegazione concreta. Il sito ha già limiti e definizioni, ma non sempre la spiegazione più semplice è vicina alla prima occorrenza. Un lettore generalista può capire la tesi generale senza distinguere ancora una candidatura, un’estensione nella radice e un servizio accessibile.

Nella baseline il testo `data/translations.json /it/dataStatusSub` diceva che dall’8 al 21 ottobre “è aperto” il Replacement Period. Il contesto espone lo snapshot del 7 ottobre e le date restano corrette. Tuttavia il tempo verbale non aiuta a leggere oggi un dato congelato. In `inside-the-round` il periodo è già descritto come concluso: era una questione di coerenza editoriale locale, non un calendario scientifico da aggiornare. Il candidato 0.7.99 usa ora il passato nelle quattro lingue; la revisione mirata è registrata in `temporal-label-review.json`.

## Cinque raccomandazioni operative

1. **Completare le due correzioni già autorizzate:** etichetta “Nella radice DNS” e link di navigazione alla lista APS disponibile. Le fonti storiche rimangono in provenienza; il testo del link deve descrivere l’elenco, senza promettere un download CSV diretto. La patch è pronta nella worktree della prossima versione.
2. **Ancorare i tempi verbali alle date.** Per i dati congelati usare una formula come “Nello snapshot del 7 ottobre…” o indicare esplicitamente che il periodo si è svolto dall’8 al 21 ottobre. **Applicato nel candidato 0.7.99:** il coordinatore ha corretto la voce nelle quattro lingue; la verifica indipendente ha confermato il passato, gli stessi numeri di data e la clausola futura del 17 novembre letteralmente invariata. Nessun nuovo dato è stato acquisito e nessuno stato di candidatura è stato cambiato.
3. **Spiegare i tre stati al punto d’uso.** Candidatura significa domanda presentata; nella radice DNS significa delega tecnica; servizio disponibile o registrazioni aperte richiedono evidenze ulteriori. Una frase vicino al filtro e al caso `.lugano` può risolvere l’ambiguità senza aggiungere un altro blocco introduttivo esteso.
4. **Ridurre il gergo alla prima occorrenza e concentrare l’orientamento.** Conservare i termini tecnici negli approfondimenti e affiancarli inizialmente a parole comuni o a un esempio. Evitare di ripetere la stessa istruzione di navigazione in più blocchi consecutivi; mantenere invece una domanda guida e un passo successivo riconoscibile. Il criterio segue le raccomandazioni W3C per chiarezza, titoli descrittivi e link significativi; non è una dichiarazione automatica di non conformità WCAG.
5. **Verificare comprensione e interesse con compiti reali.** Far svolgere a lettori esterni tre azioni: spiegare la differenza tra `.ai` e `.lugano`, trovare una candidatura e la fonte ufficiale, scegliere come citare il dataset. Registrare dove esitano e che cosa ricordano; il tempo di lettura da solo non dimostra comprensione. Non sono stati introdotti strumenti di tracciamento né raccolti dati di utenti.

## Correzione del collegamento APS: ambito esatto

URL storico indisponibile:

`https://newgtldprogram-aps.icann.org/aps/applications/export/csv`

Destinazione attuale della navigazione:

https://newgtldprogram-aps.icann.org/applications

La pagina ufficiale pubblica l’elenco e presenta il comando CSV. Non viene presentata come un endpoint di download diretto. La risposta 404 dell’indirizzo storico e la risposta 200 della scheda `.lugano` sono registrate in `primary-http-checks.json`, con timestamp e hash per la risposta utile. L’inventario completo dei collegamenti è in `dead-source-link-inventory.json`.

| Ambito pubblicato | Elemento | Collegamenti modificati attesi |
|---|---|---:|
| Cinque ingressi principali | `#aps-native` | 5 |
| Quattro Atlas autonomi | `#aps-main .apsSources` | 4 |
| Cinque ingressi principali | `#behind-case-reveal-day-counts li[data-source-id="aps-export-20261018"]` | 5 |
| Quattro raccolte behind-the-round | stesso ID sorgente | 4 |
| Quattro approfondimenti replacement-strings | stesso ID sorgente, dentro `#behind-round` | 4 |
| **Totale** | **17 file HTML pubblicati** | **22** |

L’HTML sorgente `src/index.web.html` contiene inoltre una singola ancora da cui derivano i primi cinque link. La modifica non è una sostituzione globale: i renderer risolvono soltanto l’indirizzo storico esatto. URL diversi, suffissi, query aggiunte e collegamenti alle singole candidature non vengono trasformati.

Restano identici `data/behind_round_stories.json`, `data/field_investigations.json`, `data/applications_2026_aps_official_provenance.json` e `data/aps_2026_application_graph.json`. Restano invariati anche i campi strutturati `citation` e `isBasedOn` che riportano la fonte acquisita storicamente. Gli attributi `data-i18n` conservano la chiave originaria `field18SourceExport`; cambia soltanto la sua etichetta di navigazione nelle quattro lingue.

### File sorgenti modificati, senza generazione globale

- `scripts/render_aps_application_atlas.py`: href visibile della fonte, mantenendo `isBasedOn` originale.
- `scripts/render_behind_round.py`: risoluzione puntuale dell’href visibile, conservando labelKey, ID sorgente e citation.
- `scripts/render_field_investigations.py`: stessa risoluzione della navigazione, conservando citation.
- `src/index.web.html`: un href esplicito in `#aps-native`.
- `data/translations.json`: soltanto tre chiavi nelle quattro lingue: `presetRoot`, `apsAtlasSource`, `field18SourceExport`. Il coordinatore ha inoltre corretto `dataStatusSub` nelle quattro lingue e aggiunto i metadati della release successiva; la revisione qui documentata del passato è separata dalla patch iniziale.

### Verifica mirata della patch

`check-source-link-fix.py` ha eseguito **50 controlli superati**, producendo fuori dal repository 12 pagine autonome e quattro frammenti dinamici. Sono stati verificati la risoluzione esatta e i casi che non devono essere risolti, i link visibili, le etichette, la permanenza dell’URL storico nei metadati e l’identità dei quattro JSON scientifici pertinenti. Risultati in `source-link-fix-checks.json`.

La verifica non sostituisce le guardie di rilascio sull’inventario dei link, la review esplicita della singola sostituzione di URL o la suite browser completa. Queste restano in carico al coordinatore della release. Nessuna guardia è stata modificata o aggirata da questo intervento.

## Limiti residui e materiale di prova

Il campione copre le affermazioni a maggiore rischio semantico e istituzionale, non ogni proposizione del sito. Non è stato compiuto un nuovo censimento dei dati ICANN, non sono stati confrontati tutti i dossier PDF remoti e non è stata ricontrollata ogni cifra finanziaria o ogni traduzione. La scheda `.lugano` è stata letta via HTTPS diretto perché il motore di ricerca non riusciva a renderla: il limite dello strumento non è stato confuso con un’interruzione del sito ufficiale.

La matrice persistente `editorial-claims.json` contiene per ciascuna delle dodici affermazioni file/elemento, esito, qualificazioni e URL completi delle fonti. `rr1-attribution-check.json` documenta il controllo che ha escluso un falso allarme sul conteggio RR1. I report di questo audit non attestano una nuova revisione scientifica umana del corpus e non modificano gli archivi pubblicati.
