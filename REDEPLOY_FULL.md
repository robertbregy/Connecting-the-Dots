# Connecting the Dots v0.7.7 — pubblicazione completa

Il pacchetto contiene le pagine già compilate nelle quattro lingue, i dati e tutti i sorgenti necessari per ricompilarle. È organizzato in meno di 100 file per un singolo caricamento dal browser GitHub. Le 1.597 fonti IANA sono conservate in un archivio interno verificato con SHA-256.

1. Estrai lo ZIP della release. Non estrarre gli archivi interni.
2. Nella root di `robertbregy/Connecting-the-Dots`, branch `main`, scegli **Add file → Upload files**.
3. Trascina tutti i file e le cartelle estratti, non lo ZIP e non una cartella esterna. `index.html`, `en/`, `it/`, `de/`, `fr/`, `assets/`, `data/`, `downloads/`, `src/` e `scripts/` devono essere nella root del repository.
4. Conferma il commit `Update Connecting the Dots to v0.7.7` e attendi la riuscita del deployment Pages.
5. Ricarica il sito e verifica che il footer mostri `v0.7.7`.

Non occorre cancellare il repository né cambiare le impostazioni Pages. I vecchi file delle fonti IANA, se già presenti, non compromettono il funzionamento; la build usa l'archivio compresso. Per pubblicare non serve installare dipendenze.

Per modifiche future: Node.js 18+, Python 3, `npm ci`, poi `python3 build.py`. `python3 scripts/package_release.py` produce un nuovo pacchetto completo e controlla il limite di 100 file. Non caricare `node_modules/`.

Release: 4 ottobre 2026. Stato: pre-Reveal. Snapshot generale: 2 ottobre 2026. Verifica IANA: 4 ottobre 2026. I dati individuali 2026 restano vuoti in attesa della pubblicazione ICANN.

La 0.7.7 porta nell’Explorer tutte le 1.595 schede della Root Zone Database IANA, con i dati disponibili su gestori, paesi, contatti organizzativi, date, DNS, WHOIS/RDAP e rapporti. Include tutti i 1.437 nomi dell’elenco della root e 11 casi storici o di candidatura aggiuntivi: 1.606 voci in totale. Aggiunge il filtro per paese e i CSV dei server DNS e dei rapporti IANA. Gli 87 approfondimenti editoriali restano distinti dai campi ufficiali.

I vecchi file di correzioni `data/v*.js` e `data/i18n_v*.js`, se ancora presenti nel repository, non sono più caricati dalla build. Non serve cancellarli per pubblicare questa release. I sorgenti attivi sono documentati in `README.md`.
