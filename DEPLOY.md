# Deploy

Il progetto è statico. La release include già le pagine generate e tutte le risorse condivise: GitHub Pages deve soltanto pubblicare il contenuto della cartella nella root del repository `Connecting-the-Dots`, branch `main`.

URL pubblico: https://robertbregy.github.io/Connecting-the-Dots/

## Aggiornamento da browser GitHub

1. Scompatta lo ZIP sul computer una sola volta. Lascia compressi gli archivi che trovi al suo interno, compreso quello delle fonti IANA: il pacchetto completo resta sotto i 100 file.
2. Apri il repository `robertbregy/Connecting-the-Dots` su GitHub.
3. Entra nella root del repository e scegli **Add file → Upload files**.
4. Trascina **il contenuto** della cartella estratta, non la cartella esterna che la contiene. Devono quindi arrivare in root `index.html`, `en/`, `it/`, `de/`, `fr/`, `README.md`, `assets/`, `data/`, `downloads/`, `src/`, `scripts/`, ecc.
5. Verifica l'elenco dei file modificati e crea un commit con un messaggio come `Update Connecting the Dots to v0.7.10`.
6. GitHub Pages ridistribuirà automaticamente il sito dal branch configurato.

Nota: l'upload web sostituisce i file con lo stesso percorso, ma non elimina automaticamente eventuali file obsoleti che non sono presenti nel nuovo pacchetto. La v0.7.10 non richiede la rimozione dei vecchi file per funzionare.

Carica il pacchetto **completo**: dalla 0.7.8 le pagine condividono CSS, codice e indice, mentre le schede sono caricate a richiesta. Devono esserci anche `data/site_bundle.js` e tutti gli otto file `data/explorer_profiles_0.js`–`data/explorer_profiles_7.js`. Dopo il deployment verifica il footer `v0.7.10`, apri una scheda nell'Explorer, condividi il suo link, prova Indietro, cambia lingua e controlla l'impaginazione anche sul telefono.

## Aggiornamento da Git / terminale

Se il repository è già clonato localmente, copia il contenuto della nuova release nella cartella del repository e poi esegui:

```bash
git add -A
git commit -m "Update Connecting the Dots to v0.7.10"
git push origin main
```

## Build per modifiche future

La release distribuita non richiede build lato GitHub. Se però modifichi i sorgenti o i dati, rigenera prima l'artefatto finale:

```bash
python3 build.py
```

La build aggiorna tutte le pagine linguistiche, i bundle runtime e le otto raccolte di schede, `explorer_catalog.csv`, `explorer_events.csv`, i CSV di server DNS e rapporti IANA, `data/manifest.json` e il data pack scaricabile. Per aggiornare le fonti e registrare una nuova release, segui il flusso documentato in `README.md`; non sono previsti aggiornamenti automatici dei dati.

## Repository “About”

Dalla pagina principale del repository, usa l'icona a forma di ingranaggio accanto a **About** e imposta:

- Description: `An interactive research publication on TLDs, Internet governance and the 2026 ICANN round`
- Website: `https://robertbregy.github.io/Connecting-the-Dots/`
- Topics: `icann`, `dns`, `tld`, `internet-governance`, `data-visualization`, `digital-identity`, `cities`

## Social preview

`og:url`, `og:image` e `twitter:image` puntano al percorso pubblico. La social preview è in `assets/og-preview.png`.

## Apertura locale

Servi la cartella via HTTP:

```bash
python3 -m http.server 8000
```

Poi apri `http://127.0.0.1:8000/`.

## Pagine linguistiche

Carica anche le quattro cartelle `en/`, `it/`, `de/` e `fr/`: contengono le pagine effettive della pubblicazione. La root e i vecchi link con `?lang=…` portano alla versione corretta.

Il pacchetto è già compilato. Per ricompilarlo occorrono Node.js 18+ e Python 3: esegui prima `npm ci`, quindi `python3 build.py`. Non caricare `node_modules/` nel repository o su GitHub Pages.
