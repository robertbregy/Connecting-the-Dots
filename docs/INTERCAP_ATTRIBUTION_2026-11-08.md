# Intercap attribution correction - 8 November 2026

## Finding and correction

The four-language `econEditorialPortfolioBody` published in v0.7.101 attributed a precise identical-string criterion to the [Domain Name Wire article of 7 October 2026](https://domainnamewire.com/2026/10/07/surprise-intercap-registry-is-one-of-biggest-new-tld-applicants/). The article describes 58 strings as “in contention” and 13 as not contested, without defining its method as an exact comparison of original primary strings. The attribution was more specific than the source supported. The surrounding reconciliation caveat did not correct that overstatement.

The v0.7.102 correction keeps DNW's 71 applications and its attributed 58/13 classification. It separately states the project's reproducible 54/17 exact-primary-string comparison of the preserved 11 October APS snapshot. This is a derived analytical count, not an official ICANN contention classification. The portfolio interpretation and the distinction from completed acquisitions are retained. Only this existing paragraph changes substantively in IT, EN, DE and FR; the technical release adds its own dated summary and package.

This note corrects the same overly specific formulation in the historical brief `docs/EDITORIAL_UPDATE_2026-10-14.md`. That dated brief is preserved as history rather than silently rewritten. The v0.7.101 package, its checksum and its published review are retained byte for byte.

## Reproducible primary-source comparison

Source: `data/applications_2026_aps_official_listing.csv`, the normalized official APS export acquired at `2026-10-11T21:27:40.214Z`.

SHA-256: `520ea8433b96322816fb03fa66072acc29e7251e16839093b4446ada401bd887`.

Method: select distinct base Application IDs, excluding IDs ending in `-R`; group their original `Primary String` values using case-insensitive exact equality. Select the exact applicant name `Intercap Registry Inc.`. A shared primary requires at least one other distinct base ID with the same original primary string. This does not include string similarity, singular/plural relationships, alternatives, or later evaluated contention findings.

The preserved CSV has 71 Intercap base IDs and 69 associated replacement records, hence 140 rows for that applicant. The 71 base IDs exactly match the local application graph. The exact-original-primary comparison gives 54 shared strings and 17 without such a match. There are no declared Intercap variants in this snapshot.

The following read-only calculation reproduces the comparison without changing any dataset:

```python
import csv
from collections import defaultdict

with open("data/applications_2026_aps_official_listing.csv", encoding="utf-8") as source:
    rows = list(csv.DictReader(source))
base = [row for row in rows if not row["Application ID"].endswith("-R")]
ids_by_primary = defaultdict(set)
for row in base:
    ids_by_primary[row["Primary String"].casefold()].add(row["Application ID"])
intercap = [row for row in base if row["Applicant Name"] == "Intercap Registry Inc."]
shared = [row for row in intercap
          if len(ids_by_primary[row["Primary String"].casefold()]) > 1]
print(len(intercap), len(shared), len(intercap) - len(shared))  # 71 54 17
```

## The four differences in the article's explicit list

All 54 derived shared-primary labels appear in DNW's list of 58. The four additional labels in that article are:

| Label | Intercap base ID | Records visible in the preserved APS CSV |
| --- | --- | --- |
| `.files` | `IRI2679T-T20440` | Only one original primary `.files`. There is one original primary `.file` under another applicant. These strings are not identical. |
| `.forms` | `IRI2679T-T28359` | Only one original primary `.forms`. Three other base applications use `.form`. These strings are not identical. |
| `.product` | `IRI2679T-T26488` | One original primary; three replacement records have this string, all marked Deactivated in the snapshot, including one belonging to Intercap itself. |
| `.vid` | `IRI2679T-T32633` | One original primary; one other applicant's replacement record has this string and is marked Deactivated in the snapshot. |

These observations locate the disagreement and show why exact original-primary matches must be distinguished from broader notions of competition. They do not establish how DNW handled singular/plural forms, replacement eligibility, applicants or source timing. No change in an application's history, final contention set or error by the article's author is inferred from this comparison.

Additional checks of the same frozen snapshot did not supply a uniform explanation for 58/13. Including active replacement records yields 56/15; the two additional matches are within Intercap's own portfolio. Including all replacement records yields 63/8. The source `In Contention` flag is FALSE for all base and replacement rows and cannot establish an absence of contention before evaluation.

## Publication calendar and remaining research

[APS About](https://newgtldprogram-aps.icann.org/about) states that the public site is not updated between Reveal Day and String Confirmation Day. The [official ICANN calendar](https://www.icann.org/en/announcements/details/icann-announces-date-for-reveal-day-and-other-2026-round-milestones-29-09-2026-en) gives the 8-21 October Replacement Period and 17 November 2026 String Confirmation Day. [APS Applications](https://newgtldprogram-aps.icann.org/applications) distinguishes original/replacement records from application counts and explains when evaluated contention sets appear.

The 21 October deadline is already recorded as past in the project's chronology reviewed on 30 October. A subsequent public snapshot must be separately acquired, dated and hashed when ICANN publishes it. Preserve the current snapshot and compare actual records; do not infer an individual replacement choice merely because the deadline passed.

The remaining source-method reconciliation and post-confirmation review stay in [issue #3](https://github.com/robertbregy/Connecting-the-Dots/issues/3). The correction does not create a new research release or amend RR1/RR2, their DOIs, the working-paper revision, official datasets, or historical technical archives. Source review, required PR checks, actual deployment and live-byte verification are separate evidence stages; this note alone is not an attestation that all later stages have completed.
