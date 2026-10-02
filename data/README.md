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
