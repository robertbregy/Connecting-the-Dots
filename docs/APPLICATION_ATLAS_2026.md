# ICANN 2026 Application Atlas · Data model and provenance

**Technical publication:** v0.7.78 (12 October 2026). **Research release:** RR2 (unchanged, immutable). No claim is made that a technical rebuild is a new scientific archive.

## Source and snapshot

The authoritative input is the ICANN **Application Publication and Statistics (APS)** public applications CSV, captured on **11 October 2026** and preserved at \`data/applications_2026_aps_official_listing.csv\`. The exact original and normalized SHA-256 values, capture instant, schema (34 columns), and ICANN warnings are in \`data/applications_2026_aps_official_provenance.json\`.

- Source page: https://newgtldprogram-aps.icann.org/applications
- Official export: https://newgtldprogram-aps.icann.org/aps/applications/export/csv
- ICANN program aggregate: https://newgtldprogram-aps.icann.org/statistics
- ICANN initial Reveal Day contention list (not yet the later evaluated contention sets): https://newgtldprogram.icann.org/en/application-rounds/round2/reveal-day-contention-sets.csv

## Identity and relationships

**One base Application ID = one application.** For example, \`EXAMPLE-ID\` and \`EXAMPLE-ID-R\` are *one application* with two public APS records. A replacement record is a string option, not a second applicant or a second paid application.

The 2,783 public rows reconcile as **1,614 original application records + 1,169 replacement records**. The ICANN Statistics tab reports **1,615** applications, but \`WDO2627T-T45217\` for \`.wdo\` is withheld from the main public listing pending administrative review. No synthetic complete WDO record is inserted.

The application-to-string graph has three role labels:

1. **Primary:** original applied-for label (1,608 base applications yield 980 distinct *new* primary labels).
2. **Replacement:** corresponding \`-R\` alternative, where present (1,169 edges). A status of \`Active\` or \`Deactivated\` is copied **verbatim**, without guessing selection decisions.
3. **Variant:** explicitly published \`TLD Variants\` relation (13 edges). Six primary records refer exclusively to variants of **existing** TLDs and are excluded from the 980-new-string denominator.

The 263 identical **original primary** string groups (891 applications) are derived by exact label equality across base records, excluding those six existing-TLD variant-only cases. These are **not** validated as ICANN's final contention sets. Similar strings, possible contention involving replacement choices and ICANN string-evaluation decisions are independent layers. In particular, \`Label: In Contention = FALSE\` in the original CSV is *not* evidence of no contention before ICANN String Evaluation.

## Generated files

| Path | Purpose |
|---|---|
| \`aps_2026_application_graph.json\` | Unique base application nodes, applicants, original/replacement records, variant relationships, exact-string overlap counts, source-linked APS summary paths |
| \`aps_2026_application_graph.js\` | Generated read-only browser payload for the four-language public atlas |
| \`aps_2026_application_edges.csv\` | Application ID → original/replacement/variant string edges, with record ID, observed status, source hash and time |
| \`aps_2026_record_observations.csv\` | Append-only, source-dated public *record* observations, not guessed transitions |
| \`aps_2026_application_graph_manifest.json\` | Counts and SHA-256 of derived products, pinned to exact official source |
| \`applications_2026_aps_official_provenance.json\` | Original APS export provenance, caveats and checksums |

\`scripts/build_aps_application_graph.py\` builds the graph deterministically from the pinned CSV. \`build.py\` invokes it before generating the data manifest and versioned data pack. Browser payload and ZIP are technical-publication artifacts, distinct from archived RR1 and RR2 Zenodo research records.

## State changes over time

When ICANN publishes a newer public export, **archive the prior official CSV and update its provenance manifest with the new export's exact digest and retrieval timestamp**. The generator adds one observation per APS record/source digest; running it again with the same input must make **no changes**. Fields describe states observed at those snapshot instants only. A record absent from a subsequent public list is not inferred to have been withdrawn, denied or delegated.

The current baseline has one snapshot. No claim is made to reconstruct private decisions, earlier unobserved transitions, definitive string contention or future outcomes.

## Public dossiers and PDFs: what is, and is not, complete

The atlas links each public Application ID to ICANN's official pages using its verified APS detail URL structure:
- \`/applications/{Application ID}/summary\` – identification, type, status and applicant.
- \`/applications/{Application ID}/application-responses\` – publicly available questionnaire responses.
- \`/applications/{Application ID}/documents\` – public attachments/PDFs as published by ICANN.
- Additional pages, if published, can be opened at ICANN.

**These pages and PDFs are not locally bulk-copied.** The code does not claim to have individually verified every link or downloaded every questionnaire attachment. Confidential/private application portions are outside project scope. Official ICANN source terms apply; copying third-party facts into a derived index does not relicense ICANN's source material.

## Integrity gates

The builder aborts on source hash mismatch, unexpected APS column change, orphan \`-R\` records, duplicate IDs, unexpected base/string/variant cardinalities, mutated immutable observations, lost string edges or missing dossier attribution. The release tests compare the generated graph to the 1,614 official base records and all 2,783 official rows. Browser QA exercises four languages, responsive widths, \`.lugano\` ID search, replacement/exact-match filters, permalink opening and official detail links.

**Important limitation:** "complete" here means **the publicly downloadable APS application listing as captured**, excluding the administratively withheld case; **not** all 1,615 detailed questionnaires or attachments.
