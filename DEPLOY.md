# Deploy

Il progetto è statico: pubblicare l'intera cartella su un hosting HTTPS (GitHub Pages, Netlify, Cloudflare Pages, server della Città, ecc.).

Per LinkedIn condividere l'URL pubblico della dashboard, non lo ZIP. Lo ZIP resta utile per archivio, sviluppo locale e download del data pack.

Prima della pubblicazione definitiva aggiornare `og:image` con l'URL assoluto dell'immagine social preview se la piattaforma di hosting lo richiede.


## GitHub Pages
All internal site assets and downloads use repository-relative paths, so they work when published at `https://robertbregy.github.io/archaeology-of-the-dot/`. The Open Graph URLs are already set to that public address. The data-pack ZIP includes the complete Excel workbook plus all CSV datasets.


## Robust local opening
`index.html` is self-contained for presentation, so it can also be opened directly in a browser without a local web server. The source folders remain included for maintenance and GitHub deployment.
