# v0.7.16 — The Social Life of the Dot

- adds a structured social layer with nine source-backed cases and six analytical models;
- links language, cultural, civic, identity, community, safety and script-inclusion cases directly to Explorer records;
- adds `SOCIAL CASE` badges, a Social preset and social meaning panels inside relevant TLD profiles;
- adds `social_cases.json` and `social_cases.csv` to the reusable data layer;
- expands the publication narrative with a fifth question: who belongs after the dot?;
- explicitly separates documented community rules (FACT) from broader social interpretation (READING), and never treats registration volume as a proxy for social significance.

# v0.7.15 — Economics of the Dot

- adds a structured economics layer with eight distinct mechanisms and source-backed metrics;
- links `.ai`, `.tv`, `.io`, `.ac`, `.sh`, `.com`, `.net`, `.org`, `.web`, `.shop` and `.app` to economic cases in the Explorer;
- keeps public revenue, company results, transaction values, auction prices and application fees explicitly non-comparable;
- adds `economic_cases.csv` and `economic_metrics.csv` to the reusable data layer;
- expands the page narrative from history and governance to the financial incentives and rents created around the DNS root.

## v0.7.14 — Governance Cases + Disputed Dots

- Adds a chronological life-history layer across the complete Explorer corpus.
- Generates dated events from formal applications, IANA registration data and IANA delegation/transfer/revocation reports.
- Adds live ICANN gTLD Registry Agreement lifecycle enrichment: Application ID, contract signature, delegation, termination and root removal.
- Keeps ccTLD history on the IANA delegation/redelegation model rather than applying gTLD contracts.
- Exports `tld_life_histories.csv` and records lifecycle coverage in the manifest.
- Missing historical phases remain missing rather than inferred.

# Changelog

## 0.7.12 · 4 October 2026

- Add complete, submission-level Application Archaeology for the 2000 proof-of-concept round: 47 submissions, 223 formal Item E2 string links and 188 distinct Item E2 strings, plus separately labelled SITA alternatives `.aer` and `.aero`.
- Add the complete 2004 sponsored-TLD round: 10 submissions for 9 strings, preserving the two independent `.tel` proposals.
- Add the complete 2012 Reveal Day corpus architecture: 1,930 applications for 1,409 distinct strings, validated before merge against ICANN's locked IDN, geographic, community and regional totals.
- Keep applications, applied-for strings and delegated TLD identity separate; never-delegated strings become explicit `application-only` Explorer records rather than pretend TLDs.
- Exclude 2012 Primary Contact and Email fields from the research dataset; retain only application metadata needed for historical analysis.
- Extend Explorer search, round filtering, record drawers and CSV exports to expose cross-round application history while preserving each TLD's introduction path.
- The 2000 and 2004 corpora are vendored with the publication. The 2012 Reveal Day snapshot is fetched from a preserved archival copy, sanitized, checked against ICANN totals and cached locally before it is merged; a failed validation is rejected rather than partially displayed.

## 0.7.11 · 4 October 2026

- Universal Explorer origin model for every record.
- Separate `programRound`, `introductionPath`, `introductionBasis`, and field-level introduction sources.
- Added historical `.zr` retirement evidence and the retired `.nato` root TLD.
- Search, filters and Explorer CSV now expose origin/program metadata.
- Complete TLD/profile coverage is declared separately from the cross-round application corpus.
- Export a 1,599-record `tld_universe.csv` plus a separate 9-record curated, non-exhaustive `application_only_strings.csv`.

## 0.7.10 · 4 October 2026

- Localize regional map and chart labels; expose selected map modes and Explorer presets to assistive technology.
- Add stable, language-preserving profile links and sharing, including ASCII/Unicode names, browser history and unknown-link handling.
- Add public correction drafts on GitHub from Sources, the footer and individual profiles.
- Preserve all research data, CSVs and IANA evidence; extend navigation and deferred-loading regression checks.

## 0.7.3 · 3 October 2026

- Generate complete static English, Italian, German and French pages at `/en/`, `/it/`, `/de/` and `/fr/` from the actual application runtime.
- Emit self-referencing canonicals, reciprocal static hreflang and sitemap alternates, localized social metadata and article/dataset structured data.
- Preserve legacy root and `?lang=…` links through early routing; carry tabs, search, filters, map mode and fragments between language pages.
- Make page language follow its URL; stop mutating canonical or social metadata during browser interaction.
- Add crawlable language links, anchor navigation and readable content with JavaScript disabled.
- Rebase shared assets and downloads for language directories and embed only the page's own complete translation dictionary.
- Add a pinned build-time DOM dependency, reproducible lockfile and multilingual content/metadata/link/routing checks. Mark the source template noindex and generated pages indexable.
- Preserve the v0.7.2 factual corrections and the 2 October pre-Reveal research snapshot.

## 0.7.2 · 3 October 2026

- Remove the bare-root sitemap duplicate; align static `x-default` and Open Graph URL with `?lang=en` and refresh sitemap modification dates.
- Use ICANN 2012 Program Statistics as the direct source for 66 geographic applications and 53 historical geographic delegations.
- Add direct root-servers.org and ICANN August 2026 RSP Program Statistics source chips to the root/RSP panel.
- Replace the Anguilla budget URL with the official `gov.ai` copy, preserving the EC$253.6M budget-estimate qualification.
- Clarify preliminary identical-string contention sets consistently in EN, IT, DE, FR and `round_2026.csv`; link to the ICANN Reveal Day FAQ.
- Normalize verified ICANN English/public source URLs and deduplicate the source list.
- Record the release date separately from the unchanged 2 October pre-Reveal data snapshot; rebuild the embedded runtime, manifest and data pack.

## 0.7.1 · 2 October 2026

- Corrected the 2026 application-type model to follow ICANN terminology directly: General, Geographic Name, Reserved Name, Community, .Brand, IDN, Variant string, Government/IGO and Applicant Support. Historical TLDs are no longer displayed as if they were 2026 examples.
- Rebuilt the domain lifecycle so expiration is not shown as automatic deletion: renewal remains a loop; registrar deletion of applicable gTLD registrations leads to a 30-day redemptionPeriod, followed by five days of pendingDelete before purge and possible re-registration.
- Separated PTI/IANA as **Root Zone Manager** from Verisign as **Root Zone Maintainer**, using IANA's published role definitions.
- Scoped ICANN registrar accreditation explicitly to gTLDs and noted that ccTLDs use their own registry/registrar models.
- Updated the Anguilla `.ai` case from the 2025 projection to the Government's 2026 **EC$253.6 million Domain Name Registration budget estimate**, still labelled as an estimate rather than realized revenue.
- Changed the pre-Reveal `.lugano` city-timeline label from application to **applicant disclosure**.
- Added a direct ICANN source beside the control-levers panel for the statement that ICANN does not control Internet content or act as a general website-takedown authority.
- Tightened CAA wording to describe publication of authorized certificate authorities.
- Localized the city-TLD timeline accessibility label.
- Added build validation for release-version consistency, complete 2026 application-type coverage and lifecycle state separation.

## 0.7.0 · 2 October 2026

- Added **What is a dot?**, an eight-dimension conceptual map spanning address, contract, market, jurisdiction, identity, trust, culture and politics.
- Expanded **How it works** with domain-registration lifecycle, economics/value flow, application/access models and a layer-by-layer control-lever map.
- Expanded **Beyond the domain** with invisible DNS functions, IDNs / Universal Acceptance, special-use names and alternative naming systems.
- Added `.ai` as a **digital natural resource** case, with Anguilla's EC$132 million 2025 `.ai` revenue figure clearly labelled as an official budget projection.
- Added a **closed generics** public-interest case to the contention chapter.
- Added a seven-dimension **TLD success framework** to Methodology so success is not reduced to registration volume.
- Added six reusable CSV datasets: `namespace_dimensions.csv`, `dns_capabilities.csv`, `domain_lifecycle.csv`, `tld_models.csv`, `control_levers.csv`, and `success_framework.csv`.
- Extended source documentation with ICANN/IANA, RFC, Anguilla Government, .BANK, ENS and Handshake primary sources.
- Preserved the existing top-level navigation; new material is integrated into current chapters rather than adding menu clutter.

## 0.6.11 · 2 October 2026

- Expanded **Strange Internet** from semantic drift into institutional DNS archaeology.
- Added five anomaly families: geopolitical ghosts, never-delegated codes, historical exceptions, unusual territories, and supranational / multi-script ccTLDs.
- Added `.su`, `.yu`, `.an`, `.tp`, `.cs`, `.gb`, `.uk`, `.aq`, `.bv`, `.sj`, `.eu`, `.ею` and `.ευ` to the curated Explorer corpus with historical status/event context.
- Added `data/dns_oddities.csv`, primary-source citations and a downloadable dataset card.
- Added compact section navigation labels for the expanded Strange Internet chapter.

## 0.6.10 — 2026-10-02
- Added a **semantic drift** chapter inside Strange Internet: ccTLDs that kept their formal geographic meaning while acquiring a second global cultural meaning.
- Added documented cases for `.io`, `.ai`, `.tv`, `.me`, `.co` and `.fm`, with primary IANA and registry sources.
- Added `semantic_drift.csv` to the public data pack.
- Added the same cases to the Namespace Explorer while preserving their formal `country-code` classification.
- Added a closing READING connecting formal namespace governance with meaning that emerges through real-world use.
- Added EN/IT/DE/FR copy and responsive card layout for the new section.

## 0.6.9 — 2026-10-02
- Shortened the in-section navigation labels in **How it works** across EN/IT/DE/FR.
- Full explanatory section titles remain unchanged in the content.
- Kept the mobile section navigation horizontally scrollable while preventing labels from wrapping or being clipped internally.

## v0.6.8 · 2 October 2026

- Introduced an event-history layer for the Namespace Explorer so repeated strings are no longer flattened into one misleading record.
- Added `explorer_events.csv` alongside the latest-state `explorer_catalog.csv`.
- Corrected `.cat` and `.post` to the 2004 sponsored round in the current Explorer view and preserved multi-round histories such as `.nyc`.
- Marked `.lugano` as an applicant disclosure before Reveal Day; the official ICANN individual-string record remains explicitly pending.
- Added provenance and event history to Explorer record details.
- Replaced clickable Explorer rows/cards with actual buttons and simplified disclosure-navigation ARIA semantics.
- Deduplicated rendered source entries by URL.
- Added explicit event types to the compact city timeline.
- Added `As of` dates to changing round-level figures.
- Moved the KPI grid to 2×2 at medium widths and switched to mobile navigation earlier to prevent French-language overflow.
- Right-aligned the final desktop dropdown so it remains inside the viewport.
- Hardened the 2012 stat trio against French and other long labels at medium desktop widths.
- Kept the runtime self-contained while externalizing the repeated logo asset to reduce HTML weight without reintroducing bundle fragility.
- Extended build validation to cover Explorer history, `.lugano` provenance, header-only pre-Reveal application data and downloadable data-pack parity.

## v0.6.7 · 2 October 2026

- Replaced native `<details>` navigation groups with controlled desktop dropdown menus.
- Restored a single-line primary navigation bar on desktop.
- Added click, hover, keyboard focus and Escape/outside-click behavior for grouped menus.
- Preserved the compact mobile section selector and all v0.6.6 hotfix behavior.

## v0.6.6 · 2 October 2026 — deployment hotfix

- Restored a self-contained `index.html` runtime after the v0.6.5 external-bundle deployment proved fragile on GitHub Pages.
- Inlined CSS, data, translations, map data, publication state and application JavaScript.
- Preserved the v0.6.5 information architecture, navigation, accessibility and Explorer improvements.
- Kept CSV/ZIP research assets external for download and reproducibility.

## v0.6.5 · 2 October 2026 — architecture and UX pass

- Grouped information architecture: 7 top-level navigation choices.
- Pre-Reveal publication state centralized and future-tense copy corrected.
- Explorer reframed as preview, capped rendering + “Load more”.
- Browser history for section changes.
- Drawer focus trap/return, map accessible names, localized control labels.
- Native share sheet where supported.
- Brand returns to Overview.
- 320 px KPI overflow fixed.
- Round 2026 placeholders consolidated before Reveal.
- `.lugano` vision explicitly marked “if delegated”.
- Light-mode text links use a higher-contrast accent.
- Dataset structured metadata coverage corrected to 1984–2026.
- Long chapters expose a local section index (How it works, Geography, Methodology).
- Pre-Reveal `applications_2026.csv` became a header-only schema: no fake placeholder observation.
- `data/manifest.json` added SHA-256 hashes, record counts and snapshot metadata.
