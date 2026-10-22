# Correzioni dell'audit di usabilita del 22 ottobre 2026

## Ambito e provenienza

Correzione tecnica/editoriale della versione 0.7.92, senza nuova release scientifica. Baseline pubblica: `90d21e6059871c36148e1860d017e7409ed3f8bb`. Pagine e risorse del candidato verificato: `c83fd1284e9a50d5965db7617c3d0bfe656ce69b`. La successiva correzione del solo test di scorrimento e dei relativi registri e nel commit `67a56610e8abeea8daf040dcbe01c6a167a78067`; HTML, CSS, JavaScript e dati serviti ai lettori sono identici al candidato verificato.

Revisione assistita da AI, controlli automatici in browser reali e ispezione delle schermate. Partecipanti umani: 0. Non e una certificazione WCAG ne uno studio di soddisfazione o comprensione con lettori esterni.

## Modifiche realizzate

**A01. Collegamenti storici.** Ripristinati `social-part-2`, `contention-part-1`, `disputes-part-2` e `strange-part-2` presso i contenuti pertinenti. Conservati tutti gli identificatori gia esistenti. La suite storica ora comprende 256 prove e controlla anche l'effettivo raggiungimento dei quattro passaggi.

**A02. Affidabilita delle verifiche.** Il test di .lugano usa il confronto territoriale attuale e verifica separatamente che le motivazioni siano nel percorso principale. L'export CSV e controllato in due condizioni: Atlante gia caricato, con zero richieste HTTP durante l'esportazione; caricamento concorrente, ammettendo soltanto i due file locali dell'Atlante espressamente identificati. Restano i controlli su contenuto, filtri, provenienza e risultato vuoto. Il controllo generale esegue i gruppi indipendentemente e conserva tutti gli esiti: un fallimento non impedisce i test successivi e non viene convertito in successo.

**A03. Home mobile.** Il gruppo delle azioni e stato spostato subito dopo il messaggio introduttivo, prima delle spiegazioni lunghe. E cambiato l'ordine reale del documento, non soltanto la disposizione visiva: anche la sequenza da tastiera e coerente. La definizione del progetto rimane visibile, senza pannelli da aprire.

**A04. Indici locali.** .lugano presenta sempre cinque accessi principali: Stato e fonti, Perche .lugano, Governance, Usi proposti, Rischi e verifiche. Fonti distingue Come leggere, Fonti e metodo, Limiti e criteri, Versioni e correzioni, Segnalare un errore. Il primo livello resta aperto anche sul mobile; gli approfondimenti sono raccolti sotto la voce pertinente. La posizione dell'autore rimane esplicita e raggiungibile.

**A05. Sezioni lunghe.** Economia e Fonti iniziano con una breve sintesi e collegamenti diretti. Conservati i sei passaggi di Economia, tutte le analisi, le tabelle e la cronologia delle revisioni. Puliti anche gli attributi title corrotti del vecchio indice nascosto.

Il menu generale non cambia. In Storie e questioni resta: Economia, Vita sociale, Citta e territori, Internet strano. Modifiche applicate alle quattro lingue.

## Miglioramento misurato della Home

Posizione verticale dell'inizio del pulsante principale, pagina italiana a 320 x 900 pixel, tema chiaro:

| Browser | Prima, audit della baseline | Dopo | Anticipo |
| --- | ---: | ---: | ---: |
| Chromium | 862 px | 598 px | 264 px |
| Firefox | 943 px | 655 px | 288 px |

Il pulsante termina rispettivamente a 642 e 699 pixel. Queste sono misure del layout in laboratorio, non dati di conversione o coinvolgimento. La condizione di visibilita nella prima schermata e verificata per tutte le lingue e i temi nelle configurazioni provate.

## Controlli conclusi prima della promozione

- Ricostruzione ripetuta: 44 file HTML/pacchetto identici fra due build.
- Conservazione nelle cinque pagine native: 1.330 elementi tradotti, 513 identificatori preesistenti e 1.051 collegamenti ai contenuti conservati per pagina. Nessuna eliminazione delle fonti. In 38 pagine autonome cambiano soltanto i riferimenti versionati al CSS/JavaScript di navigazione.
- Dati scientifici, archivi, pacchetto corrente, manifest, CITATION e identita DOI invariati. La sola variazione in data riguarda il riferimento tecnico al commit in publication.js.
- Chromium: 32 scenari mirati, quattro lingue, larghezze 320/390/768/1440 pixel, entrambi i temi; navigazione da tastiera, indici, vecchi link, sintesi e assenza di overflow verificati.
- Firefox: 16 scenari equivalenti, quattro lingue, 320/1440 pixel, entrambi i temi.
- Controlli senza JavaScript nelle quattro lingue, in entrambi i browser.
- 64 scansioni axe nel controllo mirato Chromium e 64 nel controllo Firefox, senza violazioni delle regole selezionate.
- 192 scansioni generali, 24 sezioni per quattro lingue e due temi, senza violazioni delle regole WCAG 2.0/2.1 A/AA selezionate.
- Suite CSV: otto scenari in ciascuna delle due condizioni, tutti superati.
- Suite Economia: otto scenari superati. Suite delle schede: 26 schede in otto scenari e 39 pagine autonome, nessun problema segnalato.
- Collegamenti storici: 256 prove superate, includendo i quattro casi aggiunti e il loro raggiungimento con scorrimento animato.
- Suite pubblico: otto scenari superati. Suite domini cittadini: 48 controlli di pagina, 112 dei riferimenti alle fonti e 48 scansioni axe, senza problemi segnalati.

Le suite si sovrappongono: i conteggi non sono persone o casi unici da sommare.

## Fallimenti iniziali conservati e diagnosi

La prima matrice del candidato segnala un errore nel gruppo dei collegamenti storici: la nuova asserzione misurava la posizione prima dell'arrivo dello scorrimento animato. I percorsi mirati con movimento ridotto erano gia passati in Chromium e Firefox. Il test aggiornato attende fino a cinque secondi una posizione realmente visibile e antenati aperti, senza forzare lo scorrimento, disabilitare le animazioni o eliminare asserzioni. La verifica ripetuta supera tutte le 256 prove. L'esito iniziale non e cancellato ne presentato retroattivamente come verde.

La prima preparazione era inoltre terminata prima della pubblicazione per i permessi del token di build sulle modifiche ai workflow. La modifica del workflow e stata registrata tramite il connettore autorizzato; i permessi del token di build non sono stati ampliati.

## Riferimenti riproducibili

- Build, conservazione, Chromium, export, Economia, schede e accessibilita: run `39752663055`.
- Firefox: run `39753170785`, checkout fissato a `c83fd1284e9a50d5965db7617c3d0bfe656ce69b`.
- Accettazione conclusiva dei collegamenti con scorrimento reale: run `39754246045`, prova del medesimo sito e sola correzione del test.

Alcuni report ereditano GITHUB_SHA dall'evento che avvia il workflow, quindi riportano 51b20f0 o 365be86 invece del commit del checkout. I checkout dei browser sono fissati esplicitamente al candidato c83fd128: sono quelle le pagine effettivamente esaminate. Nei pacchetti di prova sono conservati i report originali e questa precisazione, senza riscriverne la provenienza.

Backup della versione pubblica precedente: `backup/pre-usability-audit-20261022`.

Restano fuori da queste prove: lettori esterni, screen reader con persone, Safari/iOS fisici e una nuova rivalidazione integrale delle affermazioni scientifiche. La corrispondenza dei file realmente pubblicati e controllata separatamente dal workflow di GitHub Pages dopo la promozione.
