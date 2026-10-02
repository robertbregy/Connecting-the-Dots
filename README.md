# Connecting the Dots — v0.6.1

A multilingual, static, GitHub Pages-ready publication about the history, governance, geography and social meaning of top-level domains, with the 2026 ICANN round and the `.lugano` application as the contemporary layer.

## Publication model

This version is deliberately structured as the **post-Reveal publication**. Values that cannot yet be known on 2 October 2026 are explicit placeholders in the working build. The page architecture does not change after Reveal Day: official ICANN public application data simply populate the prepared fields, tables and maps.

The 2026 layer is designed to hold applications, unique strings, applicant organizations, countries and territories, application types, geographic/community/.Brand applications, IDN/variant information, contention sets, applicant concentration and an application-level normalized dataset.

## Namespace Explorer

The search experience has moved out of **Strange Internet** and into a dedicated **Explore** section. The publication target is a single navigable corpus spanning the active IANA root plus the 2000, 2004, 2012 and 2026 application rounds.

The working build contains a 68-record seed catalog to validate filters, presets, responsive tables/cards and record details before the complete post-Reveal import. `Strange Internet` remains an editorial lens; it no longer owns the search UI. The data pack now includes `explorer_catalog.csv`, and the Excel workbook contains an `Explorer` sheet.

## Geography of power

The Geography section does not pretend that Internet power can be reduced to a headquarters pin. It separates five layers: rules/policy, root coordination, registry contracts, technical backend and applicant demand.

It also distinguishes different forms of concentration. Identity Digital illustrates **portfolio breadth** across many TLDs; Verisign illustrates **registration depth** under `.com` and `.net` and holds important operational root roles. None of these measures is treated as equivalent to control of ICANN policy.

Applicant geography maps the public primary business location of applying organizations. The RSP layer maps evaluated technical supply only: the RSP selected by a 2026 applicant is not a public application field.

## Editorial grammar

**FACT / READING / VISION** remain separate from project status. Facts are source-verifiable; readings are analytical interpretations; vision is reserved for future scenarios, principally the possible evolution of `.lugano`.

## Data pack

The public download is a single ZIP containing:
- `Connecting_the_Dots_2000-2026.xlsx`
- application-level and aggregate 2026 data scaffolds
- all supporting CSV datasets
- sources and methodology data

The Excel workbook is intentionally not exposed as a separate download.

## Run locally

```bash
python3 -m http.server 8000
```

Open `http://127.0.0.1:8000/`.

`index.html` is also self-contained for presentation and can be opened directly in a browser.

## GitHub Pages

Publish the repository root from the `main` branch. No build step is required. The current Open Graph URLs assume:

`https://robertbregy.github.io/archaeology-of-the-dot/`
