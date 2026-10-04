# Connecting the Dots — data directory

Publication state: **pre-Reveal**  
As of: **2 October 2026**

The CSV files are research inputs and reusable publication data. `applications_2026.csv` intentionally contains the schema header and **zero application records** before ICANN Reveal Day; no synthetic placeholder observation is inserted. Aggregate 2026 scaffold files can contain named rows with empty values only when the row itself is a documented metric or classification bucket and its status explicitly says that official 2026 data is still to be loaded.

The Explorer now separates two layers:

- `explorer_catalog.csv` is the **latest indexed record view** used for search/filtering.
- `explorer_events.csv` preserves **separate historical events** for strings that appear across multiple rounds or stages. An earlier application is therefore not overwritten by a later delegation.

Before Reveal Day, `.lugano` is marked as **applicant disclosure**. The individual official ICANN application record is not treated as publicly confirmed until ICANN publishes the Reveal dataset.

`rounds_summary.csv` includes an **As of** field for live totals that can change over time.

`manifest.json` records file sizes, SHA-256 hashes and record counts for the current public data snapshot. Third-party source data remains subject to its original terms; see `CONTENT_LICENSE.md`.

`semantic_drift.csv` documents selected ccTLDs whose formal geographic designation is unchanged but whose global use has acquired a second cultural association. Formal status and secondary meaning are kept separate, and each case links to primary IANA and/or registry sources.

`dns_oddities.csv` documents institutional and geopolitical anomalies in the country-code layer: legacy-active codes, retired domains, never-delegated codes, historical exceptions, unusual territories and supranational / multi-script cases. Each row keeps FACT and READING keys separate and cites primary IANA or registry sources.

## v0.7.1 framework datasets

- `namespace_dimensions.csv` — the eight conceptual dimensions used by **What is a dot?**.
- `dns_capabilities.csv` — selected DNS functions beyond simple web naming, with protocol / source references.
- `domain_lifecycle.csv` — a simplified gTLD-oriented lifecycle that separates expiration from deletion and distinguishes redemptionPeriod, pendingDelete and re-availability; policy details can vary by registry, registrar and ccTLD.
- `tld_models.csv` — two deliberately separate axes: ICANN 2026 application designations and operational registration-access models. Historical/delegated TLDs are not used as if they were 2026 application examples.
- `control_levers.csv` — hosting, DNS provider, registrar, registry, browser/security and ICANN intervention layers, preventing the common mistake of treating them as one authority.
- `success_framework.csv` — seven analytical dimensions for comparing TLD outcomes without treating raw registration count as a universal definition of success.

The `.ai` economic case shown in the Geography chapter is sourced to the Government of Anguilla 2026 budget estimates and is labelled as a **2026 budget estimate (EC$253.6 million)** rather than realized revenue. Special-use names and alternative naming systems are kept conceptually separate from delegated TLDs in the ICANN root.

## v0.7.2 evidence hardening

The release date is 3 October 2026; the publication and manifest keep the existing 2 October pre-Reveal data snapshot. Source URLs are normalized to the verified official English ICANN pages and the Government of Anguilla `gov.ai` budget PDF. `round_2026.csv` names the Reveal metric as **preliminary identical-string contention sets**; the value remains blank until official publication.

## v0.7.3 static language pages

The publication is prerendered in EN, IT, DE and FR. Language metadata in `manifest.json` describes the publication routes; the research snapshot remains 2 October 2026. All CSV observations, source corrections and pre-Reveal empty fields are preserved from v0.7.2.

## v0.7.4 current-state correction

Current IANA root status, formal type, registry legal organization, registry country, technical-contact organization, represented place and historical applications are distinct fields. The root evidence was retrieved on 4 October 2026; the other pre-Reveal research snapshot remains 2 October 2026. `iana_snapshot.json` records retrieval time, source URLs and SHA-256 hashes of the source files under `data/evidence/iana/` in the full release. The data ZIP includes the normalized snapshot; the full redeploy ZIP also includes the raw evidence. The IANA technical contact is not automatically the contractual RSP.

Current `.CS` is retired: its former Czechoslovak delegation and the non-delegation for Serbia and Montenegro are separate historical events. `.GB` remains explicitly reserved. No public legal-applicant identity is inferred for `.lugano` before Reveal Day. `contention_count` refers to 2012 where `contention_year` is 2012. Empty cells represent information not documented in this catalogue.

`current_root_status` is the authoritative current-root field. The compatibility `status` column retains the indexed lifecycle label for historical-only records; consult `explorer_events.csv` for its dated context. `formal_type` and `editorial_designation` must not be merged.
