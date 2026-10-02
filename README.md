# Connecting the Dots — v0.6.6

**Connecting the Dots** is a multilingual, static research publication about the history, governance, geography and social meaning of top-level domains, with the 2026 ICANN round and the `.lugano` application as the contemporary layer.

**Live publication:** https://robertbregy.github.io/Connecting-the-Dots/

Independent research project by **Robert Bregy**. It does not represent an official position of the City of Lugano.

## v0.6.4 overview-specific KPIs

The four headline KPI cards are now structurally part of **Panoramica / Overview** rather than a persistent block above every section. They therefore disappear whenever another section is selected on desktop, tablet and mobile. The responsive navigation feedback introduced in v0.6.3 remains in place: user-initiated navigation scrolls the selected section into view with a short, reduced-motion-aware transition.

## Publication model

The project is deliberately structured for the **post-Reveal publication**. Values that cannot yet be known on 2 October 2026 remain explicit placeholders in the working build. The page architecture does not need to change after Reveal Day: official ICANN public application data can populate the prepared fields, tables, maps and comparisons.

The 2026 layer is designed to hold applications, unique strings, applicant organizations, countries and territories, application types, geographic/community/.Brand applications, IDN/variant information, contention sets, applicant concentration and an application-level normalized dataset.

## Namespace Explorer

The search experience lives in a dedicated **Explore** section. The publication target is a single navigable corpus spanning the active IANA root plus the 2000, 2004, 2012 and 2026 application rounds.

The working build contains a seed catalog to validate filters, presets, responsive tables/cards and record details before the complete post-Reveal import. `Strange Internet` remains an editorial lens; it no longer owns the search UI. The data pack includes `explorer_catalog.csv`, and the workbook contains an `Explorer` sheet.

## Geography of power

The Geography section does not reduce Internet power to a headquarters pin. It separates rules/policy, root coordination, registry contracts, technical backend and applicant demand.

It also distinguishes different forms of concentration. Identity Digital illustrates portfolio breadth across many TLDs; Verisign illustrates registration depth under `.com` and `.net` and holds important operational root roles. None of these measures is treated as equivalent to control of ICANN policy.

Applicant geography maps the public primary business location of applying organizations. The RSP layer maps evaluated technical supply only: the RSP selected by a 2026 applicant is not a public application field.

## Editorial grammar

**FACT / READING / VISION** are kept separate from project status. Facts are source-verifiable; readings are analytical interpretations; vision is reserved for future scenarios, principally the possible evolution of `.lugano`.

## Data pack

The public download is a single ZIP containing the workbook, application-level and aggregate 2026 data scaffolds, supporting CSV datasets, sources and methodology material. Before Reveal Day, `applications_2026.csv` is deliberately header-only: there is no synthetic placeholder record that could be mistaken for an observation. `data/manifest.json` records the snapshot state, record counts and SHA-256 hashes. The pack also contains a licensing notice clarifying the distinction between original project material and third-party source data.

## Metadata and discovery

The publication includes canonical and `hreflang` metadata, Open Graph/Twitter cards, Schema.org structured data for the article and dataset, `robots.txt` and `sitemap.xml`. Language-specific canonical URLs are updated in the browser without preserving UI-state parameters such as the active tab.


## Deployment resilience

`index.html` is again a self-contained runtime artifact. CSS, application data, translations, the map path and JavaScript runtime are embedded in the page, so GitHub Pages does not depend on newly generated bundle files being uploaded in lockstep. External CSV/ZIP files remain available for downloads and reproducibility.

## Run locally

```bash
python3 -m http.server 8000
```

Open `http://127.0.0.1:8000/`.

`index.html` is the lightweight web build: CSS, JavaScript, data and downloads are external assets so browsers can cache them independently. Run it through a local HTTP server when testing.

## GitHub Pages

Publish the repository root from the `main` branch. No build step is required.

Public URL: https://robertbregy.github.io/Connecting-the-Dots/

Recommended repository metadata:

- Description: `An interactive research publication on TLDs, Internet governance and the 2026 ICANN round`
- Website: `https://robertbregy.github.io/Connecting-the-Dots/`
- Topics: `icann`, `dns`, `tld`, `internet-governance`, `data-visualization`, `digital-identity`, `cities`

## Licensing

Code authored for this repository is released under the **MIT License**. Original editorial content, original project visuals and original compilation/schema work are made available under **CC BY 4.0** to the extent applicable. Third-party data, quoted material, trademarks and source material remain subject to their respective rights and source terms. See `LICENSE` and `CONTENT_LICENSE.md`.

## v0.6.5 architecture pass

- Seven top-level navigation choices instead of thirteen flat tabs.
- Single `DOT_PUBLICATION` state (`pre-reveal`) controls time-sensitive 2026 presentation.
- Explorer is explicitly labelled as a curated preview and renders results progressively.
- Browser Back/Forward follows section navigation.
- Drawer focus management, map labels, localized control labels and native mobile sharing improve accessibility.
- Web assets and downloads are externalized from `index.html`; `src/index.web.html` is the web-page source of truth and `build.py` recreates the root `index.html`. The historical data/i18n source layers are compiled into `data/data_bundle.js` and `data/i18n_bundle.js`, so the browser loads one effective dataset and one effective translation object rather than a chain of runtime overrides.
- Long sections expose a local contents bar; the historical timeline labels idea/application/delegation stages explicitly.
- `build.py` validates local references, key JavaScript syntax and the pre-Reveal application dataset before producing the web entry point.
