# Connecting the Dots — data directory

Publication state: **pre-Reveal**  
As of: **4 October 2026**

The CSV files are research inputs and reusable publication data. `applications_2026.csv` intentionally contains the schema header and **zero application records** before ICANN Reveal Day; no synthetic placeholder observation is inserted. Aggregate 2026 scaffold files can contain named rows with empty values only when the row itself is a documented metric or classification bucket and its status explicitly says that official 2026 data is still to be loaded.

The Explorer separates the current indexed view from researched history:

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

The publication is prerendered in EN, IT, DE and FR. Language metadata in `manifest.json` describes the publication routes; the publication research snapshot is 4 October 2026. All CSV observations, source corrections and pre-Reveal empty fields are preserved from v0.7.2.

## v0.7.4 current-state correction

Current IANA root status, formal type, registry legal organization, registry country, technical-contact organization, represented place and historical applications are distinct fields. The root evidence was retrieved on 4 October 2026; the publication-level pre-Reveal research snapshot is 4 October 2026; individual observations retain their own source dates. `iana_snapshot.json` records retrieval time, source URLs and SHA-256 hashes of the original source files. In v0.7.5, both release ZIPs include those files inside one compressed evidence archive, as described below. The IANA technical contact is not automatically the contractual RSP.

Current `.CS` is retired: its former Czechoslovak delegation and the non-delegation for Serbia and Montenegro are separate historical events. `.GB` remains explicitly reserved. No public legal-applicant identity is inferred for `.lugano` before Reveal Day. `contention_count` refers to 2012 where `contention_year` is 2012. Empty cells represent information not documented in this catalogue.

`current_root_status` is the authoritative current-root field. The compatibility `status` column retains the indexed lifecycle label for historical-only records; consult `explorer_events.csv` for its dated context. `formal_type` and `editorial_designation` must not be merged.


## v0.7.5 history and evidence format

`origin_round` is an explicit curated application-round classification, never a calculation from the IANA registration date. `historical_rounds` includes the documented applications of a string across multiple rounds. `origin_round_sources`, when populated, links directly to the application or delegation report used to resolve an ambiguous case. A date-only IANA registration event has empty entity, geography and type fields. A dated current-state event retains the current registry details. Registry transitions and transfer reports have distinct event statuses; a report date is not asserted to be the effective transfer date.

Events are ordered by their recorded year/date; a year-only event has no implied day or month. Undated historical context precedes dated milestones, and the dated current snapshot is last. Synthetic delegation events created from an application round, or operator histories based only on a current root record, are removed. The IANA state remains as of 4 October 2026; this is distinct from the other research snapshot dated 2 October.

`iana_snapshot.json` identifies `archive_path` (relative to the repository root), the archive SHA-256, and each original file's SHA-256. The gzip file contains UTF-8 JSON with `format: "ctd-evidence-v1"`, `encoding: "base64"` and a `files` object mapping original repository-relative paths to base64-encoded bytes. This preserves all 78 original files without requiring 78 separate GitHub uploads. The data ZIP places this archive under `evidence/`, alongside the normalized snapshot at its root. `node scripts/validate_corrective.js` verifies the archive and all original-file hashes without extracting the evidence.

Legal organization names remain in their source language. The interface localizes descriptive places and periods; CSV values remain stable source labels.


## v0.7.6 complete root index

`explorer_catalog.csv` contains 1,450 records: the 1,437 labels in the preserved IANA root list plus 13 selected historical/application records outside it. `record_level` distinguishes `basic` and `curated`; 87 records are curated. `ascii_string` is the normalized DNS identity; `string` is the Unicode display label. `root_listed` reports membership in that dated list, independently of lifecycle labels such as reserved or retired.

Basic records derive only name, root-list presence, formal type and registry organization from the preserved list and Root Zone Database. Their other fields are blank and they have no constructed history. The list includes `.gb`; its separate reserved state is preserved. Round, theme and city classifications are limited to the curated subset. Do not interpret those filters as comprehensive root-wide classifications.

The source model is now `research.json`, `explorer_curated.json`, `iana_snapshot.json`, the evidence archive, and `translations.json`, assembled by `scripts/assemble_data.js`. It replaces the previous version-patch chain. Changing the current registry does not change a sourced historical event. The complete CSV, visible runtime and downloadable pack are generated from this same model.

## v0.7.7 complete IANA profiles

Current coverage: **1,606 catalogue records**, including **1,595 individual IANA database profiles**, all **1,437 root-list labels**, and **11 additional curated historical/application entries**. The curated subset still has 87 records. Presence in the IANA database does not itself imply current root-list membership or active delegation.

`record_level` is now `iana` or `curated`; `iana_profile` explicitly indicates whether an individual IANA source was imported. Both levels can have the same complete official profile fields. Curated records additionally retain independently sourced history and editorial context. The old `basic` level is no longer generated.

The catalogue adds organization country codes, administrative-contact organization and country, record update and retrieval timestamps, registry URL, WHOIS, RDAP and counts of technical/report records. Country codes normalize IANA's country names for filtering and localized display; original country names remain available. Neither organizational country nor technical contact establishes the TLD's represented territory or contractual RSP.

- `explorer_nameservers.csv`: one row per TLD/name-server association, with `ip_addresses` separated by ` | `. These are the addresses reported on the preserved IANA profile, not a new DNS measurement.
- `explorer_iana_reports.csv`: one row per IANA-linked report, with original title, publication date and URL. The report itself is not downloaded, nor is its publication date converted into an effective transfer/delegation event.
- `iana_snapshot.json`, schema version 2: all normalized profiles, dates, source URLs, country codes, arrays of name servers and reports, and retrieval metadata for each raw source.

The compressed evidence archive now contains **1,597 source files**, replacing the earlier 78-file snapshot. `rootListRetrievedAt`, `retrievalStartedAt` and `retrievedAt` distinguish root-list capture, first source retrieval and last source retrieval; each `files` entry and each profile records its own time. `asOf` is the root-list retrieval day. An ordinary rebuild is offline and uses these exact bytes. To refresh, use `scripts/fetch_iana.py` followed by `scripts/normalize_iana.js`, inspect the extraction review, update the release metadata and history as documented in the main `README.md`, then build and package.

## v0.7.8 delivery and release history

The canonical research, normalized IANA snapshot and all CSV files are unchanged from v0.7.7. `data_bundle.js` remains the full assembled model used by validation and exports. The browser receives `site_bundle.js`, a compact index with the fields needed for search and filters; opening a record loads its complete data from one of eight `explorer_profiles_*.js` batches. These are generated views, not independent data sources.

`release_history.json` records each recent release date, a localized summary key, the IANA snapshot date and evidence SHA-256. It is included in the data pack. The manifest records its hash and the web-delivery assets' sizes and hashes. Updates require manual source review and a new dated entry; no automatic polling or scheduled source refresh is configured.

Unreported values remain blank in CSV. Contact organization extraction respects the source's optional organization slot; a missing slot is not filled from an address or personal contact name. Dedicated personal contact-name, address, email and telephone fields are omitted from the normalized publication, while the complete original public source bytes are preserved for verification.

## v0.7.12 Application Archaeology

Application history is represented separately from TLD identity. The vendored historical layer contains the complete 2000 and 2004 submission corpora and their normalized submission-to-string links. The 2012 layer uses the preserved ICANN Reveal Day CSV snapshot, discards personal contact fields, validates the full 1,930-row corpus against official ICANN totals, and only then merges it into the browser Explorer.

- `applications_2000.csv` — 47 proof-of-concept submissions.
- `application_strings_2000.csv` — 223 formal Item E2 links plus two separately labelled SITA alternatives (`.aer`, `.aero`).
- `applications_2004.csv` — 10 sponsored-TLD submissions for 9 strings.
- `application_archaeology_local.json` — normalized vendored application links used by the build.
- `application_archaeology_manifest.json` — source provenance, privacy exclusions and locked QA totals, including the 2012 Reveal Day corpus.

Application-only strings are valid Explorer records but are **not TLD records**. This prevents an unsuccessful proposal from being counted as a delegated top-level domain.

## v0.7.11 Universal Explorer

The Explorer contains **1,608 records**. Of these, **1,599** belong to the dated TLD/profile universe: all **1,595 individual IANA profiles** in the preserved 4 October 2026 snapshot plus four historically delegated TLDs that are absent from the current IANA database (`.cs`, `.yu`, `.zr`, `.nato`). The remaining **9** records are curated application-only strings and are deliberately kept outside the TLD universe.

`introduction_path` classifies how a record entered, or attempted to enter, the top-level namespace. `program_round` is separate and is left empty where an ICANN application round is not applicable, notably for ordinary ccTLD delegations. `introduction_basis` and `introduction_path_sources` state how the classification was established. This avoids treating a ccTLD registration date as an invented ICANN round.

- `tld_universe.csv` — exhaustive for the publication's dated TLD/profile definition above; 1,599 records.
- `application_only_strings.csv` — 9 curated strings that were proposed/applied for but have no IANA profile in the snapshot. This file is **explicitly non-exhaustive** and is not a substitute for a future complete 2000/2004/2012/2026 application corpus.
- `explorer_catalog.csv` — the combined 1,608-record search/filter catalogue, including both universes with their status and provenance fields.

The TLD-coverage claim excludes never-delegated ISO codes and other labels that were never TLDs in the public DNS root. The cross-round application corpus remains a separate workstream and is not represented as complete.


## TLD life histories (v0.7.13)

`tld_life_histories.csv` is the locally preserved chronological evidence layer assembled from formal application records, IANA registration dates, IANA TLD-change reports, curated historical events and current root state. The web Explorer additionally loads the official ICANN gTLD lifecycle feed at `https://www.icann.org/resources/registries/gtlds/v2/gtlds.json` to add Registry Agreement signature, delegation, termination and removal dates where ICANN publishes them. ccTLDs remain governed by IANA delegation/redelegation evidence rather than the gTLD contract model. Missing historical phases are not inferred.

## Economics of the Dot (v0.7.15)

- `economic_cases.json` is the structured editorial/evidentiary source for the economics layer.
- `economic_cases.csv` exposes cases, strings, economic mechanism and sources.
- `economic_metrics.csv` keeps every value with its original currency, period, accounting basis and source.
- Revenue, operating income, public receipts, transaction value, auction price and evaluation fees are deliberately not normalized into one ranking.

## The Social Life of the Dot (v0.7.16)

- `social_cases.json` is the structured editorial/evidentiary source for the social layer.
- `social_cases.csv` exposes the nine selected cases, linked strings, analytical models and primary sources.
- Social cases cover language and cultural identity, civic belonging, identity and representation, community institutions, safety/norms and script inclusion.
- Documented registry charters, eligibility rules and community policies are FACT; broader interpretation is kept as READING.
- Registration volume is never used as a proxy for social value or cultural significance.


## Frozen pre-Reveal runtime policy

The data pack is the frozen release corpus. In v0.7.25 the publication performs no browser-time external research fetches: the 2012 archival mirrors and the current ICANN gTLD lifecycle feed remain documented maintenance sources but are not requested or merged before the controlled Reveal Day update. This makes the user-visible research state deterministic across visits.
