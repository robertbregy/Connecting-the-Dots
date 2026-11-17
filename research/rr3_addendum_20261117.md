# RR3 candidate addendum: String Confirmation Day 2026

**Robert Bregy · prepared 17 November 2026 · unpublished scientific candidate**

This addendum documents the evidence change proposed for Research Release RR3.
It accompanies the existing working paper, whose scholarly revision remains
v1.4-draft of 19 October 2026. Neither the earlier manuscript nor the archived
RR1/RR2 datasets is silently rewritten. RR3 has no assigned DOI at this stage;
the latest verified research release remains [RR2](https://doi.org/10.5281/zenodo.23288603).

## 1. Observation protocol and chronology

The primary application observation is the official ICANN APS CSV captured on
**17 November 2026 at 18:30:10 UTC**. The raw response, normalized CSV, official
Reveal Day and String Confirmation Day contention files, source hashes and
comparison outputs are preserved in
[`data/evidence/string-confirmation-2026-11-17`](../data/evidence/string-confirmation-2026-11-17/).
The technical site's subsequent revision time is not the observation time.

Three publication clocks must remain separate:

| Observation | Evidential role |
|---|---|
| APS export captured at 18:30:10 UTC | Frozen public application records used for before/after analysis |
| APS Statistics published at 18:09 and rechecked after its 18:39 republication | Contemporaneous aggregate comparison: 1,615 total, 1,606 Active, nine Withdrawn |
| Statistics published at 20:09:15.884 UTC and CSV rechecked at 20:38:11 UTC | Later asynchronous observation, recorded separately and not substituted into the frozen analysis |

The official [17 November announcement][announcement] labels its figures as
current on 16 November. The APS [Statistics][statistics] and [Applications][applications]
pages are live sources; the locally recorded observations and hashes identify
which states this analysis compares. The preserved announcement-observation JSON
is a structured observation, not a byte-for-byte archive of the announcement page.

## 2. Units, coverage and selected strings

The frozen CSV contains **2,783 records** representing **1,614 public application
families**. A family comprises a base Application ID and, where submitted, its
`-R` replacement record. The two records are choices within one application,
not two independent applications. Both the Reveal-period listing and the
confirmation listing contain the same set of public record IDs.

After confirmation, the public records comprise 1,605 Active, nine Withdrawn
and 1,169 Deactivated records. Exactly 152 application families select a
replacement: the original record is Deactivated and the `-R` record remains
Active. The prior observation showed both alternatives Active. APS promotes
selected replacement records to the applicable new-gTLD application type;
the analysis therefore uses record identities and observed transitions, rather
than assuming that a selected replacement retains the type `Replacement String`.

Six Active applications concern variants of existing gTLDs. Excluding those
from the comparable new-primary application population leaves **1,599 Active
applications across 1,120 distinct primary labels**. All Active public records,
including the six existing-gTLD variant applications, contain 1,126 labels.
The contemporaneous Statistics page reports 1,127 unique strings. These are
different populations and must not share an unqualified denominator.

The application [`.wdo`, WDO2627T-T45217][wdo], is explicitly excluded from the
public Applications listing while its administrative check continues. It is a
separately documented coverage limitation. The public overview/listing does
not constitute a local archive of every application questionnaire or PDF.

The official announcement reports 287 eligible replacement applications and
152 selections. The earlier APS export had 442 Active replacement records.
That earlier record status did not establish final replacement eligibility;
it should not be reused as the denominator for the selection rate.

## 3. Reconstructing the contention change

Contention membership is taken from ICANN's separately published CSV files.
The APS export warns that a `FALSE` value in `Label: In Contention` does not
establish that the application is outside contention before the relevant
evaluations are completed. That field is not used as a substitute for the
published membership list.

| Public evidence population | Sets | Application memberships |
|---|---:|---:|
| [Reveal Day contention CSV][reveal-contention] | 263 | 891 |
| Reveal membership after removing nine withdrawn applications and the resulting `.src` singleton | 262 | 881 |
| [String Confirmation Day contention CSV][confirmed-contention] | 226 | 705 |

All nine withdrawn public applications were members of the Reveal Day
contention file. Removing those nine records leaves one `.src` applicant
without an identical-string opponent; excluding that singleton explains
the reduction from 891 to 881 memberships. Against this withdrawal-adjusted
population, replacement selection reduces the count by 36 sets and 176
memberships. These deltas are reproducible without replacing the raw baseline
with the announcement's incompatible aggregates.

All 705 confirmed membership IDs are Active in the frozen application export.
The existence of these published sets does not predict final evaluation,
objection, auction, contracting or delegation outcomes.

## 4. The four-unit aggregate discrepancy

The announcement reports 1,610 proceeding applications and nine withdrawals.
Contemporaneous APS Statistics reports 1,615 total applications, 1,606 Active
and nine Withdrawn. The public export contains 1,605 Active application
families; the separately excluded `.wdo` case accounts for the known
one-record listing/Statistics difference at that observation.

The reproducible arithmetic is:

**1,615 − 9 = 1,606; 1,605 + 1 = 1,606; 1,610 − 1,606 = 4.**

Related differences recur in the announcement's aggregate tables:

| Comparison | Announcement | Public reconstruction | Difference |
|---|---:|---:|---:|
| Proceeding applications versus contemporaneous Statistics | 1,610 | 1,606 | 4 |
| AP applications, allowing separately for the known `.wdo` exclusion | 215 | 210 + 1 | 4 |
| Active Applicant Support applications in the public export | 50 | 46 | 4 |
| Contention memberships before replacements, after withdrawal adjustment | 885 | 881 | 4 |
| Confirmed contention memberships | 709 | 705 | 4 |

**These are differences between marginal aggregates, not identified missing
applications.** Equal differences do not establish that the same records
underlie every column, or that four applications share an AP, Applicant Support
and contention profile. No four additional or missing Application IDs have
been demonstrated. An arithmetic/editorial error, differences in aggregate
scope or publication timing remain possible explanations. The sources do not
establish the cause, and this addendum does not select one as fact.

The earlier difference between 1,616 paid applications reported before Reveal
Day and 1,615 on Reveal Day remains a separate historical question. It is not
combined with this four-unit discrepancy.

## 5. The later asynchronous Statistics/export observation

Statistics generated at 20:09:14.755 UTC and published at 20:09:15.884 UTC
reports **1,605 Active and ten Withdrawn**, retaining 1,615 total applications.
However, the CSV returned at 20:38:11 UTC is byte-identical to the frozen
18:30 export and still contains **1,605 Active and nine Withdrawn public records**.
The confirmed contention CSV is also byte-identical.

The tenth withdrawal cannot be identified from that export. It must not be
assigned to `.wdo` or another application by inference. The observed difference
shows that the published statistics and the export were not synchronized at
this later check; it does not retrospectively change the earlier snapshot.
In particular, subtracting the `.wdo` case from the later Active aggregate to
invent 1,604 public Active applications would contradict the inspected CSV.

The [later observation record](../data/evidence/string-confirmation-2026-11-17/aps-statistics-export-recheck-2038.json)
preserves the raw Statistics hash, timestamps and checks against both CSV hashes.

## 6. `.lugano` as a dated observation

Application CDL2651T-T31516 remains Active with the string `.lugano`, at
`String Evaluation Processing`, with an open comment period. It does not appear
in the published confirmed contention CSV. These observations document the
public milestone and do not establish approval, delegation, immunity from
objections or completion of subsequent assessments.

The author's professional involvement in the City's application remains a
disclosed participant-observer position. This addendum uses public application
evidence, not privileged administrative information, to state its status.

## 7. Reproducibility and publication boundary

[`scripts/rr3_preflight.py`](../scripts/rr3_preflight.py) independently recomputes
record counts, family selection, replacement transitions, contention changes,
source hashes and the separation of the two observation times. It packages
the relevant source evidence, historical tables, analytical datasets, methods,
this addendum and per-file SHA-256 hashes into a deterministic review archive.
Checksummed inclusion of supporting datasets does not constitute a new audit
of every historical or editorial assertion in those files.

The preflight verifies immutable tag identities for RR1 and RR2. It discloses
whether every selected input equals the recorded source HEAD; worktree
candidates remain review artifacts and must be rebuilt from a reviewed frozen
commit before publication. Fixed ZIP timestamps and sorted entries support
byte-for-byte reproducibility from identical inputs.

The script does not publish a tag, GitHub Release or Zenodo record. A future
RR3 publication must receive its own real DOI in the existing
[concept series](https://doi.org/10.5281/zenodo.23262622). Public citation
metadata is promoted only after that version and archive have been independently
verified; RR1 and RR2 remain separately citable.

[announcement]: https://www.icann.org/en/announcements/details/icann-confirms-2026-round-applications-input-and-objections-period-begins-17-11-2026-en
[statistics]: https://newgtldprogram-aps.icann.org/statistics
[applications]: https://newgtldprogram-aps.icann.org/applications
[wdo]: https://newgtldprogram-aps.icann.org/applications/WDO2627T-T45217/summary
[reveal-contention]: https://newgtldprogram.icann.org/en/application-rounds/round2/reveal-day-contention-sets.csv
[confirmed-contention]: https://newgtldprogram.icann.org/en/application-rounds/round2/string-confirmation-contention-sets.csv
