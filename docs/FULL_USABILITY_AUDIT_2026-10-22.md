# Connecting the Dots: audit completo del 22 ottobre 2026

## Versione e natura della verifica

Versione esaminata: 0.7.92.
Commit del sito esaminato: `90d21e6059871c36148e1860d017e7409ed3f8bb`.
Il sito pubblico e il ramo main non sono stati modificati durante questo audit.
Le prove aggiuntive e questo rapporto sono nel ramo `qa/full-usability-20261022`.

Le verifiche combinano analisi statica, browser automatici, ispezione delle schermate e valutazione euristica dei percorsi. Partecipanti umani: **0**. Non si tratta di uno studio con utenti né di una certificazione WCAG.

I browser hanno esaminato una copia esatta del commit pubblico, tramite checkout fissato nei workflow GitHub Actions. La corrispondenza con i file serviti da GitHub Pages è documentata separatamente per lo stesso commit.

## Risultati tecnici

- 47 documenti HTML esaminati: 43 percorsi della sitemap e quattro pagine del protocollo per lettori.
- 4.238 occorrenze di riferimenti locali: nessun file di destinazione mancante. Quattro identificatori di frammento assenti, ripetuti nelle quattro lingue, sono descritti sotto.
- 480 stati in Chromium: 30 viste native, quattro lingue, due larghezze (320 e 1440 pixel), due temi.
- 48 stati aggiuntivi in Firefox: sei viste principali, quattro lingue, due larghezze, tema chiaro.
- In questi 528 stati: destinazione attiva corretta, zero eccezioni JavaScript osservate e zero allargamenti orizzontali della pagina rilevati. Non è una verifica di tutte le possibili interazioni in ogni stato.
- 192 scansioni axe sulle 24 sezioni principali nelle quattro lingue e nei due temi: zero violazioni delle regole WCAG 2.0/2.1 A/AA selezionate.
- Suite delle schede: 26 schede in otto scenari e 39 pagine autonome, senza problemi segnalati.
- Suite dei collegamenti storici già coperti: 224 prove superate. I quattro frammenti scoperti da questo audit non erano compresi in tale suite.
- Economia: otto scenari di ordine, navigazione e conservazione superati.
- Atlante: quattro lingue, 24 configurazioni di larghezza, 44 prove di ricerca, 48 controlli dei link e 48 dei filtri, senza errori segnalati nella suite dedicata.
- Correzione narrativa: 16 scenari browser e 16 controlli senza JavaScript superati.
- Primo collegamento da tastiera al contenuto: focus trasferito a `main-content` in 16 configurazioni dei due browser.
- Cambio italiano-inglese: conservati sezione Esplorare, query `.ai` e parametro `scope=names` nei quattro scenari dei due browser.
- Controllo della distribuzione dello stesso commit: 59/59 risorse pubbliche corrispondenti.

La matrice principale di regressione ha eseguito tutti i 17 programmi: 16 superati, uno fallito. L'esito fallito è conservato e diagnosticato sotto, non retroattivamente cancellato. Alcune suite si sovrappongono: i conteggi non sono utenti né casi unici da sommare indiscriminatamente.

## A01: quattro vecchie destinazioni da ripristinare

Identificatori assenti:

- `social-part-2`
- `contention-part-1`
- `disputes-part-2`
- `strange-part-2`

Aprendo un URL come `/it/?tab=social#social-part-2`, il capitolo corretto si attiva, ma il punto specifico non esiste e non viene raggiunto. Esito confermato in 64 prove complessive: quattro frammenti, quattro lingue, due larghezze e due browser.

I riferimenti residui sono nei vecchi indici nascosti e non interattivi. I percorsi attivi ordinari funzionano. Si tratta di compatibilità con link salvati o condivisi, non di contenuti scomparsi o di un errore 404 della pagina.

Correzione proposta: ripristinare alias stabili presso i passaggi corretti e aggiungere questi quattro casi alle regressioni.

## A02: aggiornare la suite e separare le cause dei fallimenti

Il test `scripts/audit_20261018_browser.cjs` cerca ancora un disclosure in `#lugano-governance-decisions details.editorialDetails`. Quel contenitore è stato spostato intenzionalmente per rendere visibili le motivazioni. Il timeout del controllo generale pubblicato è dunque un'aspettativa obsoleta del test.

Per l'audit si è adattato il selettore solo nell'ambiente di verifica, aggiungendo un controllo che le motivazioni siano fuori da dettagli chiusi. Gli altri gruppi sono stati eseguiti indipendentemente, anche in presenza di errori.

Una seconda asserzione contava qualsiasi richiesta HTTP durante scorrimento e clic sull'export come richiesta causata dall'esportazione. Il caricamento automatico dell'Atlante, visibile nella nuova pagina, può invece avvenire nello stesso intervallo. Il primo tentativo di isolamento con attesa generica non è stato sufficiente: sette scenari su otto sono rimasti rossi.

La diagnosi finale ha eseguito due condizioni, entrambe superate in tutte le otto combinazioni di lingua e larghezza:

1. Registrazione di tutte le richieste durante l'azione, ammettendo soltanto i due file espressamente identificati del caricamento dell'Atlante: `data/aps_2026_application_graph.js` e `assets/aps-atlas.js`. Nessun'altra richiesta ammessa.
2. Attesa esplicita del completamento dell'Atlante prima dell'export, conservando l'asserzione originale di zero richieste HTTP durante l'esportazione, senza eccezioni.

Entrambe conservano i controlli sui 980 nomi dell'inventario previsto, provenienza, versione, filtro `.lugano`, stato vuoto e risorse. I dati CSV sono corretti nelle prove; la segnalazione iniziale confonde caricamento concorrente e azione di esportazione. Anche le verifiche aggiuntive del mercato TLD sono passate in entrambe le condizioni.

Correzione proposta: aggiornare i test ufficiali senza ridurre le garanzie sui dati e separare i gruppi, affinché un test obsoleto non impedisca gli altri. La suite di produzione resta da aggiornare: non viene dichiarato che il suo esito originario sia verde.

## A03: azione principale della Home troppo tardiva sul mobile stretto

Misura a 320 × 900 pixel, italiano: il pulsante principale inizia a 862 pixel in Chromium e a 943 in Firefox. In tedesco inizia rispettivamente a 941 e 1.061 pixel. Il menu generale resta visibile.

La valutazione euristica è che troppi passaggi introduttivi precedano l'invito a iniziare. Correzione proposta: anticipare l'azione dopo il messaggio iniziale e ridurre ripetizioni, senza nascondere nuovamente la definizione del progetto. Non è stato misurato l'effetto sull'abbandono.

## A04: indici più utili, non semplicemente le prime cinque intestazioni

Nella schermata desktop di `.lugano`, le prime voci dell'indice riguardano autore, stato, fonti e motivazioni; gli accessi a governance, usi e rischi sono nella parte supplementare. Questi contenuti restano visibili nel testo: qui si tratta della gerarchia dell'indice, non di capitoli nuovamente nascosti.

Correzione proposta: primo livello sempre visibile con stato, motivazioni, governance, usi proposti e rischi; articolazioni secondarie sotto i gruppi pertinenti. Conservare avvertenza sul ruolo dell'autore e ancore esistenti.

## A05: guidare meglio nelle sezioni lunghe

In italiano, Chromium a 320 pixel misura circa 29.998 pixel di altezza per Economia e 38.400 per Fonti. Il testo visibile rilevato è circa 3.238 e 4.859 parole; include etichette e tabelle e non è una misura del tempo di lettura. `.lugano` ha 39 intestazioni visibili dei primi tre livelli.

Questi numeri non dimostrano da soli un difetto. La valutazione euristica è che una sintesi breve e un accesso più netto a dati, metodo e cronologia aiuterebbero sia il lettore occasionale sia il ricercatore. Non è raccomandato eliminare contenuti o rifare il menu generale.

## Rilievo minore

Nel documento italiano 35 collegamenti del vecchio indice nascosto conservano attributi `title` con un frammento di codice. Non risultano visibili né interattivi nella navigazione attiva. Pulizia raccomandata; nessuna vulnerabilità dimostrata.

## Prestazioni e limiti

Il controllo pubblico dello stesso commit, con cache fredda, latenza 150 ms, download 200 KiB/s, CPU rallentata quattro volte e tre ripetizioni, misura mediane LCP di 1.608 ms per Home, 1.444 ms per Esplorare e 3.024 ms per Economia. Sono misure di laboratorio, non percentili di visitatori reali né dati di coinvolgimento.

Non sono stati eseguiti test con persone esterne, NVDA/VoiceOver, Safari/iOS reali o dispositivi fisici. Non sono stati verificati esaustivamente i 359 URL esterni inventariati né rivalidate tutte le affermazioni scientifiche. I controlli automatici non dimostrano conformità completa WCAG.

Prossima fase proposta: correzioni puntuali, poi studio qualitativo con 8-12 lettori esterni, non specialisti e ricercatori, includendo esigenze di accessibilità. Nessun risultato di tale studio viene anticipato o inventato.

## Evidenze riproducibili

- Matrice principale: run `39746478200`.
- Scoperta indipendente Chromium/Firefox: run `39746828385`.
- Primo isolamento CSV non sufficiente: run `39747551579`.
- Diagnosi CSV finale in due condizioni: run `39748494257`, successo.
- Distribuzione e prestazioni dello stesso commit: run `39740617944`.

Alcuni script ereditati registrano il commit del workflow nel proprio campo `commit`. Il checkout è fissato a `90d21e6059871c36148e1860d017e7409ed3f8bb`; è questa la versione del sito realmente esaminata. Le prove locali iniziali bloccate dalle restrizioni di rete dell'ambiente sono escluse dalla valutazione del sito.
