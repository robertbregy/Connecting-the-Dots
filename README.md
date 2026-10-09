# Connecting the Dots — v0.7.60

**Connecting the Dots** is an independent, multilingual research and public-information project on the evolution of Internet top-level domains: applications, delegations, governance, economics, social meaning and the ICANN New gTLD Program.

Public site: https://robertbregy.github.io/Connecting-the-Dots/

## Current release

**v0.7.60 · 9 October 2026**

This release adds **Inside the Round**, a multilingual editorial chronicle of the 2026 ICANN New gTLD Program. It follows significant public milestones from the start of the application window to its eventual outcomes, using `.lugano` as a disclosed participant-observer case while keeping the publication independent. The 7-event editorial register is separate from the frozen RR1 evidence, and each entry distinguishes past, current, scheduled, evolving and conditional stages.

The preceding release hardened the research-publication infrastructure after a full repository/live-site audit. It separates the immutable RR1 citation from mutable technical site versions, restores Zenodo metadata to the repository, makes the working paper indexable and citable, reconciles Explorer counting semantics, removes stale 2026 methodology copy, and updates deployment documentation for direct Git-based publication.

The 2026 browsing layer remains frozen locally: **980 unique primary strings** observed in the secondary Reveal Day index, representing **1,608 applications associated with a primary string**, plus six variant-only application records in that secondary source. ICANN's official Reveal Day aggregate remains **1,615 applications / 481 applicants**. The project does **not** claim a complete locally vendored APS application-level corpus for 2026.

## What the project covers

- TLD Explorer with **1,849 core research records** across current-root, historical and application-only identities. The frozen 2026 Reveal Day overlay contributes **939 additional net identities** after deduplication (980 observed primary strings, 41 already present in the core), for **2,788 currently explorable identities**.
- **7,679 life-history events** connecting applications, delegation, retirement and other documented states.
- Complete locally vendored formal application corpora for **2000 (47)**, **2004 (10)** and **2012 (1,930)**.
- Frozen 2026 Reveal Day aggregate and string-level layers, with explicit provenance and limitations.
- Cross-round analysis of contention, application outcomes, disputes, economics, social meaning and unusual strings.
- Economic-sector mapping for the complete 2012 application corpus and the 1,608 primary-string applications represented in the frozen 2026 secondary snapshot, with unresolved mappings explicitly retained.
- City and territorial TLD analysis, including the `.lugano` 2026 application as a documented case study.
- Four languages: **EN · IT · DE · FR**.

## Research method

The publication distinguishes **FACT**, **READING** and **VISION**. Official ICANN/IANA material is preferred for formal status and program facts; secondary sources are attributed where used. Derived classifications and editorial lenses are kept separate from official terminology.

The 2026 round is still in progress. Reveal Day data are treated as a dated snapshot, not as a prediction of final delegation. Replacement and confirmation milestones are documented separately.

## Search and research entry points

- [Inside the Round](inside-the-round/en/index.html) — four-language chronological observation of the ICANN 2026 round, with clear source and status labels.
- [TLD Explorer guide](explorer/index.html) — a separately indexable introduction to the interactive explorer and evidence limits.
- [Research & citation](research/index.html) — RR1 DOI, method, reproducibility and citation resources.
- [Working paper](research/connecting-the-dots-working-paper-v1.html) — independently readable HTML draft.
- [Sitemap](sitemap.xml) — multilingual canonical and scholarly-entry URLs.

## Living research publication

The project now has two version layers:

- **Site releases** (`v0.x.y`) for software, editorial, accessibility and interface changes.
- **Research releases** (`RR1`, `RR2`, …) for material changes to the evidence base or major derived datasets.

Current research release: **RR1 · Reveal Day 2026**. The next planned research release is **RR2 · String Confirmation 2026**, triggered by ICANN's 17 November 2026 String Confirmation Day.

Citation metadata are stored in [`CITATION.cff`](CITATION.cff). Zenodo-ready metadata are stored in [`.zenodo.json`](.zenodo.json). The research-release manifest and working paper are in [`research/`](research/). RR1 is archived on Zenodo: `10.5281/zenodo.23262623`.

## Inside the Round

The program-wide chronology is maintained in [`data/inside_the_round_events.json`](data/inside_the_round_events.json), an **editorial event register** rather than a replacement of or addition to the RR1 research snapshot. The shared event register builds the four-language interactive section and separately indexable HTML pages. Status labels distinguish observed events, events in progress, future ICANN dates, uncertain phases and conditional outcomes. The author's involvement in the City's `.lugano` application is disclosed: only publishable observations and primary public sources may appear in the independent chronicle.

## `.lugano`

The City of Lugano's institutional project page is the authoritative source for the City's objectives, public information and future decisions concerning `.lugano`:

https://www.lugano.ch/la-mia-citta/la-citta-si-racconta/progetti/dominio-primo-livello-lugano.html

Connecting the Dots remains a personal, independent research project. Its interpretations and scenarios do not constitute an official position or decision of the City of Lugano.

## Data and reproducibility

Current publication metadata are maintained once in root `publication.json`. The build propagates them to runtime labels, footer/version stamps, structured metadata and citation metadata. When built in GitHub Actions, `GITHUB_SHA` can also be embedded as the build commit; manual browser-upload builds intentionally leave that field empty rather than guessing a commit that does not yet exist.

Public CSV datasets and the downloadable data pack are exposed through the site. The full source release also retains build scripts, validation checks and frozen evidence used to reproduce the publication. The visitor-facing site performs no live 2026 inventory fetch: the Reveal Day browsing layer is vendored locally for deterministic results.

## Deployment

The GitHub repository is now the canonical working master. Ordinary publication updates are committed directly to `main`. The **Rebuild published site** GitHub Action regenerates and validates the static publication, commits generated outputs with `[skip build]`, and GitHub Pages deploys the committed state. Browser-upload ZIPs are retained only as secondary archival/fallback packages.

See [`DEPLOY.md`](DEPLOY.md) for the current commit / verification procedure.

## Release history

The detailed release log is maintained in [`CHANGELOG.md`](CHANGELOG.md) and the machine-readable publication history in [`data/release_history.json`](data/release_history.json).

## Licence and attribution

See [`CONTENT_LICENSE.md`](CONTENT_LICENSE.md) and the source-level provenance embedded in the publication and datasets. Third-party source material remains subject to its original terms.
