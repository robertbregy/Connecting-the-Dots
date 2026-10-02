# Connecting the Dots — v0.6.8

**Connecting the Dots** is a multilingual, static research publication about the history, governance, geography and social meaning of top-level domains, with the 2026 ICANN round and the `.lugano` application as the contemporary layer.

**Live publication:** https://robertbregy.github.io/Connecting-the-Dots/

Independent research project by **Robert Bregy**. It does not represent an official position of the City of Lugano.

## Publication model

The project is deliberately structured for the **post-Reveal publication**. Values that cannot yet be known on 2 October 2026 remain explicitly marked as pre-Reveal or unavailable. The page architecture does not need to change after Reveal Day: official ICANN public application data can populate the prepared fields, tables, maps and comparisons.

The 2026 layer is designed to hold applications, unique strings, applicant organizations, countries and territories, application types, geographic/community/.Brand applications, IDN/variant information, contention sets, applicant concentration and an application-level normalized dataset.

`data/publication.js` is the single state declaration for the publication (`pre-reveal`, as-of date and Reveal timestamp). Time-sensitive presentation should derive from that state rather than from scattered hard-coded copy.

## Namespace Explorer

The search experience lives in a dedicated **Explore** section. The publication target is a navigable corpus spanning the active IANA root plus the 2000, 2004, 2012 and 2026 application rounds.

v0.6.8 separates two concepts that must not be conflated:

- `explorer_catalog.csv` is the **latest indexed view** for each string.
- `explorer_events.csv` is the **event history** for strings that appeared in multiple rounds or moved through materially different states.

This matters for strings such as `.nyc`, `.cat` and `.post`: an old application, a later application and eventual delegation are distinct events, not one record whose fields should overwrite one another. The Explorer drawer exposes that history where it is informative.

Before the complete post-Reveal import, the Explorer remains explicitly labelled as a curated preview and renders results progressively.

## `.lugano` provenance before Reveal Day

Before 7 October 2026, ICANN has published the aggregate number of applications proceeding in the round but not the individual strings and applicants. The existence of the `.lugano` application is therefore labelled in the publication as an **applicant disclosure**, dated 2 October 2026. Once the official individual record is available after Reveal Day, the provenance can be replaced by the ICANN application record.

## Geography of power

The Geography section does not reduce Internet power to a headquarters pin. It separates rules/policy, root coordination, registry contracts, technical backend and applicant demand.

It also distinguishes different forms of concentration. Identity Digital illustrates portfolio breadth across many TLDs; Verisign illustrates registration depth under `.com` and `.net` and holds important operational root roles. None of these measures is treated as equivalent to control of ICANN policy.

Applicant geography maps the public primary business location of applying organizations. The RSP layer maps evaluated technical supply only: the RSP selected by a 2026 applicant is not a public application field.

## Editorial grammar

**FACT / READING / VISION** are kept separate from project status. Facts are source-verifiable; readings are analytical interpretations; vision is reserved for future scenarios, principally the possible evolution of `.lugano`.

The compact city timeline also preserves event type explicitly: **idea**, **application**, **delegation/launch**. This prevents visually similar milestones from being mistaken for equivalent legal or operational states.

## Data pack

The public download is a ZIP containing the application-level and aggregate 2026 data scaffolds, supporting CSV datasets, sources and methodology material. Before Reveal Day, `applications_2026.csv` is deliberately header-only: there is no synthetic placeholder record that could be mistaken for an observation.

`data/manifest.json` records the snapshot state, record counts and SHA-256 hashes. `rounds_summary.csv` carries explicit **As of** dates for figures that continue to change. The pack also contains a licensing notice clarifying the distinction between original project material and third-party source data.

## Metadata and discovery

The publication includes canonical and `hreflang` metadata, Open Graph/Twitter cards, Schema.org structured data for the article and dataset, `robots.txt` and `sitemap.xml`. Language-specific canonical URLs are updated in the browser without preserving UI-state parameters such as the active tab.

## Deployment resilience

The deployed root `index.html` is intentionally a **self-contained runtime artifact**: CSS, application data, translations, the map path, publication state and JavaScript are embedded in the page. This avoids a repeat of the v0.6.5 deployment failure in which GitHub Pages served the shell while generated runtime bundles were not uploaded in lockstep.

The visual logo remains an ordinary external asset (`assets/logo-mark.png`) rather than being embedded repeatedly as base64. CSV and ZIP research assets also remain external for download and reproducibility. A missing image therefore cannot break the publication runtime.

`src/index.web.html` is the HTML source template. `build.py` compiles the runtime sources into the deployable root `index.html` and validates the data state.

## Build and run locally

For ordinary viewing, no build step is required after downloading a release: serve the repository root over HTTP.

```bash
python3 -m http.server 8000
```

Open `http://127.0.0.1:8000/`.

When changing source code or data, rebuild the deployable artifact with:

```bash
python3 build.py
```

The build regenerates runtime bundles, Explorer CSV views, `data/manifest.json`, the downloadable data pack and the self-contained root `index.html`.

## GitHub Pages

Publish the repository root from the `main` branch. No server-side build step is required on GitHub Pages because the generated `index.html` is committed with the release.

Public URL: https://robertbregy.github.io/Connecting-the-Dots/

Recommended repository metadata:

- Description: `An interactive research publication on TLDs, Internet governance and the 2026 ICANN round`
- Website: `https://robertbregy.github.io/Connecting-the-Dots/`
- Topics: `icann`, `dns`, `tld`, `internet-governance`, `data-visualization`, `digital-identity`, `cities`

## Licensing

Code authored for this repository is released under the **MIT License**. Original editorial content, original project visuals and original compilation/schema work are made available under **CC BY 4.0** to the extent applicable. Third-party data, quoted material, trademarks and source material remain subject to their respective rights and source terms. See `LICENSE` and `CONTENT_LICENSE.md`.

## v0.6.8 precision pass

- Explorer now distinguishes the latest indexed state from historical events for the same string.
- `.cat` and `.post` are restored to the 2004 sponsored round in the latest indexed view; `.nyc` retains its distinct 2000, 2012 and 2014 events.
- `.lugano` pre-Reveal provenance is explicitly an applicant disclosure, not an ICANN individual-string confirmation.
- The French/medium-width layout is hardened with earlier KPI and mobile-navigation breakpoints and right-aligned edge dropdowns.
- City milestones carry explicit event types.
- Source rendering is deduplicated by URL.
- Changing aggregate figures carry explicit snapshot dates in the public datasets.
- Disclosure navigation uses ordinary accessible navigation semantics rather than an incomplete ARIA menu pattern.
- Explorer record activation uses real buttons.
- The logo is no longer embedded three times in the generated HTML.
