# Deploy

Il progetto è statico e non richiede build. Per GitHub Pages va pubblicato il contenuto della cartella nella root del repository `Connecting-the-Dots`, branch `main`.

URL pubblico: https://robertbregy.github.io/Connecting-the-Dots/

## Aggiornamento da browser GitHub

1. Scompatta lo ZIP sul computer.
2. Apri il repository `robertbregy/Connecting-the-Dots` su GitHub.
3. Entra nella root del repository e scegli **Add file → Upload files**.
4. Trascina **il contenuto** della cartella estratta, non la cartella esterna che la contiene. Devono quindi arrivare in root `index.html`, `README.md`, `assets/`, `data/`, `downloads/`, ecc.
5. Verifica l'elenco dei file modificati e crea un commit con un messaggio come `Update Connecting the Dots to v0.6.2`.
6. GitHub Pages ridistribuirà automaticamente il sito dal branch configurato.

Nota: l'upload web sostituisce i file con lo stesso percorso, ma non elimina automaticamente eventuali file obsoleti che non sono presenti nel nuovo pacchetto. Questa release non richiede la rimozione di file esistenti.

## Aggiornamento da Git / terminale

Se il repository è già clonato localmente, copia il contenuto della nuova release nella cartella del repository e poi esegui:

```bash
git add -A
git commit -m "Update Connecting the Dots to v0.6.2"
git push origin main
```

## Repository “About”

Dalla pagina principale del repository, usa l'icona a forma di ingranaggio accanto a **About** e imposta:

- Description: `An interactive research publication on TLDs, Internet governance and the 2026 ICANN round`
- Website: `https://robertbregy.github.io/Connecting-the-Dots/`
- Topics: `icann`, `dns`, `tld`, `internet-governance`, `data-visualization`, `digital-identity`, `cities`

## Social preview

`og:url`, `og:image` e `twitter:image` puntano già al percorso pubblico corretto. La social preview è in `assets/og-preview.png`.

## Apertura locale

`index.html` è self-contained per la presentazione e può essere aperto direttamente nel browser. Per testare anche i percorsi HTTP, dalla cartella del progetto:

```bash
python3 -m http.server 8000
```
