# Chiusura degli interventi degli audit — v0.7.101

Verifica del 7 novembre 2026 sulla versione pubblicata v0.7.100, commit `014093cc95c52ef36f976b94564dd1847f2d1688`. La revisione corrente completa le correzioni editoriali circoscritte rimaste fuori dalla precedente pubblicazione. I rapporti di preparazione delle release restano resoconti del loro momento: una verifica allora indicata come pendente va letta insieme ai risultati successivi del relativo commit.

## Interventi completati in questa revisione

| Rilievo verificato nella v0.7.100 | Correzione nelle quattro lingue |
|---|---|
| Le introduzioni della Home ripetono la scelta già presentata dai tre ingressi principali. | Le introduzioni spiegano ora la funzione delle sei aree e delle domande di approfondimento. I tre ingressi esistenti restano guida breve, ricerca di un nome e uso della ricerca. |
| Il lead e il riquadro iniziale di Economia ripetono il percorso già esposto nell'indice. | Il lead introduce la filiera economica; il riquadro invita a confrontare unità, periodo e fonte. Resta esplicita la distinzione fra registrazioni, siti attivi e candidature. |
| Il passaggio sulla diffusione contiene due titoli consecutivi identici. | Il titolo interno delle tabelle diventa «Due classifiche, due misure», con equivalenti inglese, tedesco e francese. Il titolo del passaggio, gli identificatori e le destinazioni rimangono stabili. |

Il perimetro editoriale comprende venti sostituzioni di stringhe, cinque per lingua, in quattro sorgenti. Nessun nuovo menu, pannello o percorso. L'indice di Economia conserva i sei passaggi: valore, diffusione, casi, concentrazione, cicli e round 2026. Restano disponibili tutti gli otto modelli, gli otto casi, le spiegazioni delle misure, le cautele e le fonti.

## Interventi precedenti già presenti nella baseline

| Area | Riscontro nei sorgenti e negli output della v0.7.100 |
|---|---|
| Economia | Ordine in sei passaggi già generato in tutte le lingue. |
| Governance | Geografia DNS, controllo dell'accesso a Internet e sanzioni raggruppati nel percorso Esplorare. Accesso e sanzioni sono capitoli nativi, senza iframe. I casi WikiLeaks sono inclusi. |
| Explorer | Ricerca anticipata e metadati delle schede mobili conservati nel nome accessibile. |
| Atlas | Filtri riproducibili nell'URL, dettagli conservati durante la navigazione dei risultati e intestazioni semantiche delle candidature. |
| Intestazioni | Titolo della vista attiva esposto come livello principale nell'albero di accessibilità. |
| Focus e schermi stretti | Le tre correzioni CSS della v0.7.100 sono presenti: navigazione non fissa nelle finestre basse, skip-link Atlas sopra l'header, metriche su una colonna fino a 360 CSS pixel. |
| Pubblicazione | La pipeline esistente distingue ricostruzione, distribuzione del commit corrente e verifica dei byte pubblicati. La release corrente usa gli stessi controlli. |

## Evidenze e limiti

La verifica indipendente della baseline ha riprodotto il titolo duplicato in tutte le lingue sul sito pubblico. La patch è stata revisionata separatamente; i dati e le cautele metodologiche non richiedono nuove interpretazioni. Il manifest della revisione registra le impronte esatte dei sorgenti e degli output. I risultati di build, parità A/B, browser e pubblicazione sono quelli associati al commit candidato e al commit promosso: questo documento non trasforma un controllo preparatorio in una prova di distribuzione.

Il report `editorial-completion-v0.7.101.json` registra il confronto con la baseline, le venti stringhe, la conservazione dei dati e gli esiti locali. Per la distribuzione valgono il job Pages eseguito sul commit promosso e il successivo controllo dei file serviti dal sito.

Le ipotesi E07/E08 su un ampio riordino della Home o un ingresso specifico per decisori restano temi da valutare con lettori. La revisione corrente interviene sulle ripetizioni direttamente osservabili. Non sono stati svolti studi con partecipanti né sessioni con lettori di schermo; i controlli automatici non equivalgono a una certificazione WCAG.

Gli archivi scientifici RR1/RR2, i DOI, gli snapshot APS, i CSV e tutti i precedenti pacchetti tecnici rimangono invariati. La v0.7.101 ha un proprio pacchetto tecnico e una propria revisione editoriale.
