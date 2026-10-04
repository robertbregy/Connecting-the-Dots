# Connecting the Dots v0.7.10 — pubblicazione completa

Il pacchetto contiene le pagine già compilate nelle quattro lingue, i dati e tutti i sorgenti necessari per ricompilarle. È organizzato in meno di 100 file per un singolo caricamento dal browser GitHub. Le 1.597 fonti IANA sono conservate in un archivio interno verificato con SHA-256.

1. Estrai lo ZIP della release. Non estrarre gli archivi interni.
2. Nella root di `robertbregy/Connecting-the-Dots`, branch `main`, scegli **Add file → Upload files**.
3. Trascina tutti i file e le cartelle estratti, non lo ZIP e non una cartella esterna. `index.html`, `en/`, `it/`, `de/`, `fr/`, `assets/`, `data/`, `downloads/`, `src/` e `scripts/` devono essere nella root del repository.
4. Conferma il commit `Update Connecting the Dots to v0.7.10` e attendi la riuscita del deployment Pages.
5. Ricarica il sito e verifica che il footer mostri `v0.7.10`. Prova «Segui un clic», apri una scheda nell'Explorer, condividi il suo link, prova Indietro, cambia lingua e controlla la pagina anche sul telefono.

Non occorre cancellare il repository né cambiare le impostazioni Pages. I vecchi file delle fonti IANA, se già presenti, non compromettono il funzionamento; la build usa l'archivio compresso. Per pubblicare non serve installare dipendenze.

Per modifiche future: Node.js 18+, Python 3, `npm ci`, poi `python3 build.py`. `python3 scripts/package_release.py` produce un nuovo pacchetto completo e controlla il limite di 100 file. Non caricare `node_modules/`.

Release: 4 ottobre 2026. Stato: pre-Reveal. Snapshot generale: 2 ottobre 2026. Verifica IANA: 4 ottobre 2026. I dati individuali 2026 restano vuoti in attesa della pubblicazione ICANN.

La 0.7.9 ha aggiunto **«Dietro un clic»** all’inizio di «Come funziona», con un accesso dalla homepage: sette passaggi guidati, pulsanti avanti/indietro, approfondimenti, link condivisibili e traduzioni complete. La simulazione distingue ricerca DNS e trasporto dei contenuti. Non interroga il sito di esempio.

La 0.7.10 completa le traduzioni delle regioni, espone lo stato selezionato dei controlli della mappa e dei filtri, aggiunge link diretti e condivisione per ogni scheda e una funzione «Segnala un errore» in Fonti, nel footer e nelle schede. Le segnalazioni sono bozze modificabili su GitHub: serve un account e diventano pubbliche dopo l’invio da parte del lettore.

La struttura introdotta nella 0.7.8 alleggerisce il caricamento, rende più essenziale l'Explorer e aggiunge date e cronologia degli aggiornamenti nella sezione Fonti. Le schede complete arrivano quando vengono aperte; ricerca e filtri usano subito l'indice completo. Le pagine ora condividono le risorse: vanno caricati anche `assets/`, `data/site_bundle.js` e tutti gli otto file `data/explorer_profiles_*.js`.

Restano invariati i dati della 0.7.7: tutte le 1.595 schede IANA, i 1.437 nomi dell'elenco della root e 11 casi storici o di candidatura aggiuntivi, per 1.606 voci complessive. Gli 87 approfondimenti editoriali e tutti i CSV sono preservati. Nessun aggiornamento automatico delle fonti è attivo.

I controlli automatici coprono quattro lingue, dati, navigazione e recupero delle schede dopo errori. La verifica visiva sul browser resta da completare: nell'ambiente di preparazione Firefox non ha potuto aprire le pagine per un limite di permessi.

I vecchi file di correzioni `data/v*.js` e `data/i18n_v*.js`, se ancora presenti nel repository, non sono più caricati dalla build. Non serve cancellarli per pubblicare questa release. I sorgenti attivi sono documentati in `README.md`.
