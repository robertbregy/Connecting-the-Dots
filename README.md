# Connecting the Dots — v0.7.72

**Connecting the Dots** is an independent multilingual research and public-information project on top-level domains, application history, governance, economics and society.

Public site: https://robertbregy.github.io/Connecting-the-Dots/

## Current release

**v0.7.72 · 10 October 2026**

Audit-driven release: fixes the verified malformed `.lugano` markup, closed Explorer drawer focusability, height-constrained navigation menus and light/dark contrast defects detected across 160 Chromium/axe section scans. The long Explorer methodology is preserved verbatim in an accessible disclosure; the RR1 research snapshot is explicitly distinguished from the evolving technical site version. The Internet access simulator separates domain registration as a prerequisite from DNS and network requests. Standalone sanctions and access explainers are clearly categorized as general educational resources without changing existing canonical URLs or adding more primary menu items.

The release validation includes browser-level HTML structure assertions, menu geometry, real focus checks, link and localization integrity, interactive simulation checks, and an independent four-language/light-dark axe scan. All underlying research evidence and the archived RR1 DOI are unchanged.

**Previous v0.7.71 · 10 October 2026**

Source-precision follow-up to the Internet access explainer: the Iran WhatsApp case now reflects OONI's qualified inference from multiple network anomalies, rather than claiming conclusive proof of a nationwide application block. The 2017 Catalonia case now distinguishes DNS-level redirection of particular .cat registrations following a court order from separate ISP filtering, showing why registry action on an individual name must not be conflated with deleting a TLD. All four languages and the immutable RR1 remain intact.

**Previous v0.7.70 · 10 October 2026**

A four-language, independently indexable **Who controls access to the Internet?** explainer clarifies which operators can block network access and at which technical layer. Seven interactive, privacy-preserving scenarios demonstrate how DNS filtering, IP and TLS controls, registrar/registry suspensions, hosting restrictions and national network shutdowns differ. The reader can compare five dated, primary-sourced situations: China, Russia, Iran, Switzerland and Catalonia, with explicit warnings against treating isolated measurement anomalies as confirmed censorship. Eleven institutional and measurement-source records document methods and cases.

The explainer lives at `behind-the-round/{lang}/who-controls-internet-access/`, is cross-linked from the How it Works, Social and Disputes sections and the OFAC explainer, and adds no extra primary-menu item. Four additional reciprocal-language routes bring the sitemap to **27 indexable URLs**. The article does not alter frozen Research Release RR1 or its DOI.

**Previous v0.7.69 · 10 October 2026**

A new independently indexable, four-language governance explainer, **When a global Internet meets national sanctions**, documents ICANN's OFAC obligations, the distinction between SDN-listed applicants and licensable transactions, the separate roles of registries, registrars and registrants, and the 2012, 2014 and 2022 precedents. The article links directly to twelve official primary sources and explicitly avoids attributing the 2026 count discrepancy or the .wdo administrative check to unproven sanctions causes.

Localized links connect the explainer to both existing Field Notes without adding another item to the site's primary menu. The new path is `behind-the-round/{lang}/sanctions-and-dns/`. This is an evolving editorial explanation outside immutable RR1. The four-language sitemap and release checks now cover 23 indexable pages.

**Earlier v0.7.68 · 10 October 2026**

The first **Field Note** now reconciles the 7 October official and secondary counts by geographic region: the one-application and one-applicant difference occurs entirely in Asia-Pacific. It adds Stéphane Bortzmeyer's independent CSV analysis (2,783 rows, 1,614 application-level records without replacement-string rows, 480 applicants) and distinguishes the explanation implied by CircleID's reporting from what ICANN's APS footnote actually establishes. The change from 1,616 on 22 September to 1,615 at Reveal Day **remains unexplained**.

A second, independently indexable Field Note examines two distinct organizations sharing the acronym WDO: the new World Data Organization (.wdo applicant) and the established World Design Organization (Canadian trademark holder). It separates prior rights, possible ICANN objections, administrative checks and public OFAC records without alleging an actual legal dispute or explaining ICANN's administrative check by speculation.

Both editorial cases are now backed by dated sources, multilingual revisions, an updated sitemap and deterministic build tests. RR1 and its 9 October 2026 Zenodo DOI remain immutable. Four-language entry pages keep their existing URLs; the second note adds `behind-the-round/{lang}/wdo-identity/`.

**Earlier v0.7.67** harmonized the menu terminology into Timeline and Field Notes.

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

- [Timeline](inside-the-round/en/index.html) — four-language chronological observation of the ICANN 2026 round, with clear source and status labels.
- [Field Notes](behind-the-round/en/index.html) — independent, source-audited observations and open questions. The [second case](behind-the-round/en/wdo-identity/index.html) compares the two unrelated WDO organizations and possible legal-rights issues without asserting a dispute.
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

## Timeline

The program-wide chronology is maintained in [`data/inside_the_round_events.json`](data/inside_the_round_events.json), an **editorial event register** rather than a replacement of or addition to the RR1 research snapshot. The shared event register builds the four-language interactive section and separately indexable HTML pages. Status labels distinguish observed events, events in progress, future ICANN dates, uncertain phases and conditional outcomes. The author's involvement in the City's `.lugano` application is disclosed: only publishable observations and primary public sources may appear in the independent chronicle.

## Field Notes

The public evidence register [`data/behind_round_stories.json`](data/behind_round_stories.json) now contains two source-audited, corrigible field notes and tracks each observation and their source provenance separately from the milestone chronology and the immutable RR1 data. The first case distinguishes a source-backed explanation for the mismatch between the APS aggregate and publicly listed applications from the still unexplained September-to-October official count change. Four standalone language routes are generated deterministically from the editorial register. New explanations are adopted only after public source verification; automated monitoring is advisory, not an unsupervised change to the publication.

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
