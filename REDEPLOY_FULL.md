# Connecting the Dots v0.7.3 — FULL REDEPLOY

Questo ZIP contiene la pubblicazione completa, già compilata in inglese, italiano, tedesco e francese e pronta per GitHub Pages.

## Caricamento

1. Scompatta lo ZIP.
2. Apri la root del repository `robertbregy/Connecting-the-Dots`, branch `main`.
3. Con **Add file → Upload files**, carica tutti i file e le cartelle nella root dello ZIP, sovrascrivendo quelli con lo stesso percorso.
4. Includi le quattro cartelle **`en/`, `it/`, `de/` e `fr/`**: contengono le pagine linguistiche effettive. Carica anche la root `index.html`, `assets/`, `data/`, `downloads/`, `src/`, `scripts/`, `sitemap.xml`, `robots.txt` e la documentazione.
5. Carica il contenuto, non lo ZIP né una cartella esterna. Non serve cancellare prima il repository o cambiare le impostazioni GitHub Pages.
6. Crea il commit: `Update Connecting the Dots to v0.7.3`.
7. Attendi il completamento del deployment Pages e ricarica il sito svuotando la cache del browser.

Il pacchetto è già compilato: non devi installare dipendenze per pubblicarlo. Per una futura ricompilazione, esegui `npm ci` e poi `python3 build.py` con Node.js 18+ e Python 3.

## Indirizzi

- Inglese: https://robertbregy.github.io/Connecting-the-Dots/en/
- Italiano: https://robertbregy.github.io/Connecting-the-Dots/it/
- Tedesco: https://robertbregy.github.io/Connecting-the-Dots/de/
- Francese: https://robertbregy.github.io/Connecting-the-Dots/fr/

I vecchi indirizzi della root e con `?lang=…` continuano a funzionare attraverso lo script di compatibilità. Sezione, ricerca, filtri, modalità della mappa e frammento sono conservati. Ogni pagina dispone già di contenuti tradotti, canonical, hreflang e metadati social nella propria lingua. Con JavaScript disattivato si possono leggere le sezioni e usare i collegamenti di navigazione e lingua.

## Riferimenti della release

- Versione: `0.7.3`
- Data della release: 3 ottobre 2026
- Stato: `pre-reveal`
- Snapshot dei dati: 2 ottobre 2026
- Tutti i CSV di ricerca sono conservati dalla 0.7.2.

| File | SHA-256 |
| --- | --- |
| `index.html` | `bdccc144f1d6af697cf80025bb48f650fedc5b15b0d6720d107ca3790a0e636d` |
| `en/index.html` | `ea9f9702a11d64100b9189bfaec30188667396765adf28c510d07c5fda06c522` |
| `it/index.html` | `11c9ea11520329718be807c48cce71adf0a37578ca417b404a49280b4690f1e9` |
| `de/index.html` | `1765696d5ff5cf2b734485977c2383fe535a8fe2d84a9f9b0de8c911f5ff46dd` |
| `fr/index.html` | `1ad14044b463d331724b56ab836675f50791e15e536032e21dc71f791aea8d49` |

La 0.7.3 include tutte le correzioni della 0.7.2 e implementa l’architettura multilingue senza dipendere dall’import dei dati del Reveal Day. Il data pack è sincronizzato con il manifest della nuova release.
