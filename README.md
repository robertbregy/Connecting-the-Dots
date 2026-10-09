# Connecting the Dots — v0.7.52

**Connecting the Dots** is an independent, multilingual research and public-information project on the evolution of Internet top-level domains: applications, delegations, governance, economics, social meaning and the ICANN New gTLD Program.

Public site: https://robertbregy.github.io/Connecting-the-Dots/

## Current release

**v0.7.52 · 9 October 2026**

This release enriches the `.lugano` case study while preserving the frozen 2026 Reveal Day research state. The page now separates the official City project from the independent research layer, links directly to lugano.ch, explains the application status and public-interest rationale, compares city and territorial gTLD precedents, and distinguishes `.zuerich` correctly as a TLD operated by the Canton of Zurich. The Swiss-first statement is deliberately conditional: if approved and delegated, `.lugano` would be the first Swiss gTLD directly associated with a city and promoted by its municipal authority.

The 2026 browsing layer remains frozen locally: **980 unique primary strings** observed in the secondary Reveal Day index, representing **1,608 applications associated with a primary string**, plus six variant-only application records in that secondary source. ICANN's official Reveal Day aggregate remains **1,615 applications / 481 applicants**. The project does **not** claim a complete locally vendored APS application-level corpus for 2026.

## What the project covers

- TLD Explorer with **1,849 research records** across current-root, historical and application-only identities.
- **7,678 life-history events** connecting applications, delegation, retirement and other documented states.
- Complete locally vendored formal application corpora for **2000 (47)**, **2004 (10)** and **2012 (1,930)**.
- Frozen 2026 Reveal Day aggregate and string-level layers, with explicit provenance and limitations.
- Cross-round analysis of contention, application outcomes, disputes, economics, social meaning and unusual strings.
- City and territorial TLD analysis, including the `.lugano` 2026 application as a documented case study.
- Four languages: **EN · IT · DE · FR**.

## Research method

The publication distinguishes **FACT**, **READING** and **VISION**. Official ICANN/IANA material is preferred for formal status and program facts; secondary sources are attributed where used. Derived classifications and editorial lenses are kept separate from official terminology.

The 2026 round is still in progress. Reveal Day data are treated as a dated snapshot, not as a prediction of final delegation. Replacement and confirmation milestones are documented separately.

## `.lugano`

The City of Lugano's institutional project page is the authoritative source for the City's objectives, public information and future decisions concerning `.lugano`:

https://www.lugano.ch/la-mia-citta/la-citta-si-racconta/progetti/dominio-primo-livello-lugano.html

Connecting the Dots remains a personal, independent research project. Its interpretations and scenarios do not constitute an official position or decision of the City of Lugano.

## Data and reproducibility

Public CSV datasets and the downloadable data pack are exposed through the site. The full source release also retains build scripts, validation checks and frozen evidence used to reproduce the publication. The visitor-facing site performs no live 2026 inventory fetch: the Reveal Day browsing layer is vendored locally for deterministic results.

## Deployment

For browser-based GitHub publication use the release package named:

`Connecting-the-Dots-v0.7.52-WEB-UPLOAD.zip`

Extract the archive and upload its contents to the repository root. The package deliberately stays below the project's browser-upload file ceiling and now includes this root `README.md`, so the repository landing page stays aligned with the deployed release.

For the full source/build archive use:

`Connecting-the-Dots-v0.7.52-COMPLETO.zip`

## Release history

The detailed release log is maintained in [`CHANGELOG.md`](CHANGELOG.md) and the machine-readable publication history in [`data/release_history.json`](data/release_history.json).

## Licence and attribution

See [`CONTENT_LICENSE.md`](CONTENT_LICENSE.md) and the source-level provenance embedded in the publication and datasets. Third-party source material remains subject to its original terms.
