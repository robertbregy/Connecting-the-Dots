# APS follow-up — source comparison and publication review

**Technical publication:** v0.8.3, 27 November 2026.  
**Scope:** the current Application Atlas, a new Field Note in Italian, English, French and German, the current application graph and exact-string overlap calculations, and three editorial corrections.  
**Research boundary:** RR1, RR2 and RR3, their original evidence and prior technical packages retain their original bytes and identifiers. No new research release is created.

## Evidence and dates

The [new provenance record](../data/applications_2026_aps_followup_20261127_provenance.json) and [machine-readable comparison](../data/round_2026_followup_20261127.json) link the archived responses, SHA-256 hashes and request parameters. Raw acquisitions remain separate from normalized CSVs and calculated results.

| Source | Earlier observation | Current observation | Publication date |
|---|---|---|---|
| [Official APS export endpoint](https://newgtldprogram-aps.icann.org/aps/applications/export/csv), POST from [Applications](https://newgtldprogram-aps.icann.org/applications) | Acquired 22 November, 10:51:04 UTC | Acquired and reconfirmed 27 November, 14:08:17.570742 UTC | Neither export supplies its publication timestamp; acquisition is not publication |
| [APS Statistics](https://newgtldprogram-aps.icann.org/statistics), [official JSON](https://newgtldprogram-aps.icann.org/aps/applications/stats) | Published 22 November, 10:39:14.813 UTC; acquired 10:50:25 UTC | Published 27 November, 13:39:14.999 UTC; acquired 14:08:10.671025 UTC | Explicit `lastPublishedAt` values, distinct from `generatedAt` and acquisition |
| 42 individual application summaries | Prior status is established by the 22 November CSV | 42 public summaries corroborate Withdrawn; acquired 27 November | Two summaries published 23 November, 27 on 25 November and 13 on 26 November; these are page-publication dates, not withdrawal event dates |
| 34 application-family change-request lists | Historical CSV labels are false | Current official labels and detailed request lists archived | Approval dates are retained separately; the earlier request pages are not available for page-by-page comparison |
| [APS About](https://newgtldprogram-aps.icann.org/about) | Earlier documented update policy | Reconfirmed 27 November at 14:08:10.868310 UTC | No explicit page revision date; updates after the Reveal-to-Confirmation freeze are not real time |

The earlier export is retained at [its original dated path](../data/applications_2026_aps_followup_20261122.csv), with [its original provenance](../data/applications_2026_aps_followup_20261122_provenance.json). Its raw SHA-256 is `ae3e8366e8512672146b1f3709fc58c2400eb57106d6376909366bfe3168b447`. The new raw SHA-256 is `defc901116c1faacdd332530b31f777a1b6865bebc1e08b351e729c08588a50a`. Repeated acquisition of that same new file is not treated as another substantive export.

## Verified comparison by Application ID

The comparison retains every original column. Application ID identifies a CSV record; the base ID identifies an application family, with a terminal `-R` denoting the related replacement record. A replacement record is not an additional application or applicant.

| Measure | 22 November export | 27 November export | Verified difference |
|---|---:|---:|---:|
| CSV rows | 2,783 | 2,783 | 0 |
| Base application families | 1,614 | 1,614 | 0 |
| Replacement records | 1,169 | 1,169 | 0 |
| Active families | 1,595 | 1,553 | −42 |
| Withdrawn families | 19 | 61 | +42 |
| Selected replacement records | 152 | 152 | 0 |
| Active new-primary applications | 1,589 | 1,547 | −42 |
| Distinct active new-primary strings | 1,119 | 1,119 | 0 |
| Derived exact-string overlap groups | 225 | 222 | −3 |
| Active applications in those groups | 695 | 650 | −45 |

These are **project calculations on official data**, not ICANN-declared aggregate totals. No record IDs are added or removed. There are 42 Active → Withdrawn changes and 36 false → true Change Request label changes, affecting 78 distinct records and 76 base application families; no other fields differ. All affected IDs and before/after field values are included in the machine-readable comparison and evidence CSVs.

The 36 label rows represent 34 application families. `.hall` / `.venue` and `.ver` / `.verified` each contribute a base and a replacement record. The current effective strings remain `.hall` and `.ver`; a changed request label does not reactivate their deactivated alternatives. Thirty families have 34 explicitly approved request records. Four labelled families have empty public request lists; no missing content or approval is inferred. An approved change request is not approval of the application, its string or its eventual delegation.

## Unreconciled official-source differences

| Official source or calculation | Active | Withdrawn | Application total |
|---|---:|---:|---:|
| APS Statistics, published 22 November | 1,596 | 19 | 1,615 |
| APS Statistics, published 27 November | 1,543 | 72 | 1,615 |
| Current export, calculated by application family | 1,553 | 61 | 1,614 |
| Current statistics minus current export | −10 | +11 | +1 |

The 27 November statistics declare 481 applicants, 1,127 unique primary strings and nine variants. These are different units from export rows, exact applicant-name strings and current active new-primary strings. The statistics/export differences are observable; their causes and the identities behind the extra aggregate withdrawals are not established by an official reconciliation. They are not assigned to `.wdo`, sanctions, rejection, withdrawal timing or an access error.

The unchanged [`.wdo` summary](https://newgtldprogram-aps.icann.org/applications/WDO2627T-T45217/summary) preserves the last published administrative-check status. It does not disclose the current internal state. No direct new impact on `.lugano` is documented.

## Contention and interpretation

The official [String Confirmation contention CSV](https://newgtldprogram.icann.org/en/application-rounds/round2/string-confirmation-contention-sets.csv) remains a separately dated 17 November snapshot with 226 sets and 705 application rows. Its bytes match the archived source. The [27 November acquisition register](../data/evidence/round-2026-followup-20261127/contention-recheck/provenance-validated.json) and [byte/ID comparison](../data/evidence/round-2026-followup-20261127/contention-recheck/contention-byte-and-id-comparison.json) are included in this release. The current 222 exact-primary-string groups and 650 active applications are a fresh calculation from the current export, not a new official contention-set publication.

The observed `.loop`, `.order` and `.path` groups each fall to one active application in this calculation. This does not certify a resolved official contention, a winner or an exclusive right. An objection is a distinct procedure. An APS false contention flag is not a negative determination before the relevant evaluation.

The Field Note explains these limits alongside the substantive observations. Any portfolio reading is labelled as interpretation; it does not infer the financial or strategic reasons for withdrawal, confidential change-request content, sanctions links or definitive replacement choices beyond the public fields.

## Editorial corrections and release checks

The standalone Atlas banner now follows the dated current graph instead of being overwritten by an 11 October banner. The contention chapter separates the frozen Reveal Day analysis, the 17 November official file and the current calculation. The `.official` withdrawal chronicle item is assigned to the round rather than the unrelated `.lugano` case.

The new import script reproduces the normalized CSV and comparison from archived official responses without network access. The current graph and append-only observation history are regenerated deterministically. The previous v0.8.2 package is pinned before creating v0.8.3. The reviewed candidate must pass the repository's seven required pull-request checks, deploy the exact merged tree and pass live-byte verification. This document describes the release scope; deployment success is established by the actual workflow and live verification records.
