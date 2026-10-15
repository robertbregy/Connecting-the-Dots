# APS 2026: longitudinal observation protocol

**Prepared:** 16 October 2026. **Status:** comparison tooling prepared; no second official APS snapshot claimed. RR1 and RR2 remain immutable.

## Evidence baseline

Official ICANN APS export of **11 October 2026**: 2,783 public records, comprising **1,614 base application IDs and 1,169 replacement (-R) records**. The official aggregate includes 1,615 applications; .wdo is absent from the public application list pending administrative check. The earlier reduction from 1,616 paid applications to 1,615 at Reveal Day has **not** been explained by the .wdo distinction.

A base application ID counts once. The 980 distinct primary labels and 263 exact-primary analytical groups exclude six existing-gTLD variant-only applications. Those exact matches are **not official evaluated contention sets**.

## Snapshot workflow

1. Download an official CSV from https://newgtldprogram-aps.icann.org/aps/applications/export/csv, preserve original bytes, and record the real retrieval time in ISO 8601 with explicit timezone.
2. Verify the frozen baseline: `python3 scripts/aps_observatory.py verify-baseline`.
3. Stage the newly obtained export: `python3 scripts/aps_observatory.py stage --csv /path/to/export.csv --captured-at 2026-10-22T10:00:00Z`. **The date in this command is merely illustrative**, not a claim that such a capture exists. The command creates a source-hashed CSV and JSON manifest in `data/evidence/aps-2026/`. Existing files with differing contents are rejected.
4. Compare the two published states: `python3 scripts/aps_observatory.py compare --before data/applications_2026_aps_official_listing.csv --after /path/to/export.csv --output dist/aps-compare.json`.
5. Review every anomalous change against ICANN source pages. A missing ID is **not automatically withdrawn**. A replacement record `-R` is **not another application**. Differing record statuses do **not prove why** a substitution happened.
6. Commit verified snapshots and manifests on a feature branch. Only separately reviewed and fully rebuilt releases may replace the production APS baseline. Do not silently alter frozen historical observations or research release tags.
7. Use a separately sourced **official ICANN** contention file to report final contention sets. Never substitute derived exact-string groups.

## Upcoming evidence windows

- **21 October 2026, 23:59 UTC:** end of replacement period. Compare the next APS export **when it actually becomes public**.
- **17 November 2026:** String Confirmation Day. Review updated labels, official contention data and whether a new research snapshot merits RR3.
- **16 March 2027:** scheduled close of comment/objection period, subject to official updates.

Official schedule: https://www.icann.org/en/announcements/details/icann-announces-date-for-reveal-day-and-other-2026-round-milestones-29-09-2026-en

## Interpretation and competing interests

Separate original primary evidence, derived analyses, editorial interpretation, participant-observer insights and prospective scenarios. The working paper already discloses the author's professional involvement in the City of Lugano's .lugano application. That involvement is **not independent verification** and the research does not constitute an official municipal position. No unpublished administrative information is included.

RR1: 10.5281/zenodo.23262623. RR2: 10.5281/zenodo.23288603. Concept DOI: 10.5281/zenodo.23262622. The next potential RR3 is conditional on reviewed source changes, not a routine website update.
