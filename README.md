# Connecting the Dots — v0.7.56

**Connecting the Dots** is an independent, multilingual research and public-information project on the evolution of Internet top-level domains: applications, delegations, governance, economics, social meaning and the ICANN New gTLD Program.

Public site: https://robertbregy.github.io/Connecting-the-Dots/

## Current release

**v0.7.56 · 9 October 2026**

This release consolidates the living publication infrastructure. Root `publication.json` is now the **single source of truth** for current site version, release date, research release and milestone dates; build outputs, footer stamps, structured metadata and `CITATION.cff` are generated from it. The Working paper also has its own Research navigation entry. **Research Release RR1 · Reveal Day 2026** remains unchanged; no DOI is claimed until an archival deposit actually exists.

The 2026 browsing layer remains frozen locally: **980 unique primary strings** observed in the secondary Reveal Day index, representing **1,608 applications associated with a primary string**, plus six variant-only application records in that secondary source. ICANN's official Reveal Day aggregate remains **1,615 applications / 481 applicants**. The project does **not** claim a complete locally vendored APS application-level corpus for 2026.

## What the project covers

- TLD Explorer with **1,849 research records** across current-root, historical and application-only identities.
- **7,678 life-history events** connecting applications, delegation, retirement and other documented states.
- Complete locally vendored formal application corpora for **2000 (47)**, **2004 (10)** and **2012 (1,930)**.
- Frozen 2026 Reveal Day aggregate and string-level layers, with explicit provenance and limitations.
- Cross-round analysis of contention, application outcomes, disputes, economics, social meaning and unusual strings.
- Economic-sector mapping for the complete 2012 application corpus and the 1,608 primary-string applications represented in the frozen 2026 secondary snapshot, with unresolved mappings explicitly retained.
- City and territorial TLD analysis, including the `.lugano` 2026 application as a documented case study.
- Four languages: **EN · IT · DE · FR**.

## Research method

The publication distinguishes **FACT**, **READING** and **VISION**. Official ICANN/IANA material is preferred for formal status and program facts; secondary sources are attributed where used. Derived classifications and editorial lenses are kept separate from official terminology.

The 2026 round is still in progress. Reveal Day data are treated as a dated snapshot, not as a prediction of final delegation. Replacement and confirmation milestones are documented separately.

## Living research publication

The project now has two version layers:

- **Site releases** (`v0.x.y`) for software, editorial, accessibility and interface changes.
- **Research releases** (`RR1`, `RR2`, …) for material changes to the evidence base or major derived datasets.

Current research release: **RR1 · Reveal Day 2026**. The next planned research release is **RR2 · String Confirmation 2026**, triggered by ICANN's 17 November 2026 String Confirmation Day.

Citation metadata are stored in [`CITATION.cff`](CITATION.cff). Zenodo-ready metadata are stored in [`.zenodo.json`](.zenodo.json). The research-release manifest and working paper are in [`research/`](research/). A DOI will be added only after an actual archival deposit has been created.

## `.lugano`

The City of Lugano's institutional project page is the authoritative source for the City's objectives, public information and future decisions concerning `.lugano`:

https://www.lugano.ch/la-mia-citta/la-citta-si-racconta/progetti/dominio-primo-livello-lugano.html

Connecting the Dots remains a personal, independent research project. Its interpretations and scenarios do not constitute an official position or decision of the City of Lugano.

## Data and reproducibility

Current publication metadata are maintained once in root `publication.json`. The build propagates them to runtime labels, footer/version stamps, structured metadata and citation metadata. When built in GitHub Actions, `GITHUB_SHA` can also be embedded as the build commit; manual browser-upload builds intentionally leave that field empty rather than guessing a commit that does not yet exist.

Public CSV datasets and the downloadable data pack are exposed through the site. The full source release also retains build scripts, validation checks and frozen evidence used to reproduce the publication. The visitor-facing site performs no live 2026 inventory fetch: the Reveal Day browsing layer is vendored locally for deterministic results.

## Deployment

For browser-based GitHub publication use the release package named:

`Connecting-the-Dots-v0.7.56-WEB-UPLOAD.zip`

Extract the archive and upload its contents to the repository root. The package deliberately stays below the project's browser-upload file ceiling and now includes this root `README.md`, so the repository landing page stays aligned with the deployed release.

For the full source/build archive use:

`Connecting-the-Dots-v0.7.56-COMPLETO.zip`

## Release history

The detailed release log is maintained in [`CHANGELOG.md`](CHANGELOG.md) and the machine-readable publication history in [`data/release_history.json`](data/release_history.json).

## Licence and attribution

See [`CONTENT_LICENSE.md`](CONTENT_LICENSE.md) and the source-level provenance embedded in the publication and datasets. Third-party source material remains subject to its original terms.
