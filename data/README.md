# Connecting the Dots — data directory

Publication state: **pre-Reveal**  
As of: **2 October 2026**

The CSV files are research inputs and reusable publication data. `applications_2026.csv` intentionally contains the schema header and **zero application records** before ICANN Reveal Day; no synthetic placeholder observation is inserted. Aggregate 2026 scaffold files can contain named rows with empty values only when the row itself is a documented metric or classification bucket and its status explicitly says that official 2026 data is still to be loaded.

The Explorer now separates two layers:

- `explorer_catalog.csv` is the **latest indexed record view** used for search/filtering.
- `explorer_events.csv` preserves **separate historical events** for strings that appear across multiple rounds or stages. An earlier application is therefore not overwritten by a later delegation.

Before Reveal Day, `.lugano` is marked as **applicant disclosure**. The individual official ICANN application record is not treated as publicly confirmed until ICANN publishes the Reveal dataset.

`rounds_summary.csv` includes an **As of** field for live totals that can change over time.

`manifest.json` records file sizes, SHA-256 hashes and record counts for the current public data snapshot. Third-party source data remains subject to its original terms; see `../CONTENT_LICENSE.md`.

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
