# String Confirmation Day 2026 — verified findings and reconciliation

Observed on 17 November 2026. This note distinguishes ICANN announcement aggregates from the public APS export and the two official contention CSVs.

## Executive finding

String Confirmation Day is a material research event.

The post-confirmation public evidence establishes:
- 152 selected replacement strings;
- nine withdrawals since Reveal Day;
- 226 public contention sets after confirmation;
- 705 application rows in the public String Confirmation contention CSV;
- 1,605 publicly visible proceeding application families in the APS export;
- .lugano active and in String Evaluation, with no identical-string contention.

ICANN's 17 November announcement instead reports:
- 1,610 applications proceeding;
- 226 contention sets and 709 applications in contention;
- 50 Applicant Support Program applications;
- 215 applications from the Asia/Australia/Pacific region.

The public files and the announcement therefore do not reconcile at application level. The evidence isolates a systematic four-application gap in the AP / Applicant Support / contention dimensions, plus the separately known .wdo administrative-check application.

This must be presented as an unresolved aggregate/publication discrepancy, not as four identified or newly filed applications.

## 1. Official ICANN announcement

Source:
https://www.icann.org/en/announcements/details/icann-confirms-2026-round-applications-input-and-objections-period-begins-17-11-2026-en

ICANN reports, as of 16 November 2026:
- 1,610 applications proceeding;
- nine applications withdrawn since Reveal Day;
- 152 applications switched to a replacement string;
- 287 applications eligible to switch;
- 226 contention sets;
- 709 applications in contention;
- 50 Applicant Support Program applications;
- 333 brand applications;
- 16 community-based applications;
- 15 self-identified geographic applications;
- 22 IDN applications;
- nine variant applications, including six variant-only applications.

Regional application counts:
- Africa: 16;
- Asia/Australia/Pacific: 215;
- Europe: 504;
- Latin America/Caribbean: 11;
- North America: 864.

## 2. Captured public APS evidence

The project captured the live APS export and both official contention CSVs at 2026-11-17T18:30:10Z.

Pinned SHA-256 values:
- APS raw export: `f7cb0e7ef1098a3b92a7d337676d8802802df21e31c8f156dafe7c410132b7ee`;
- APS normalized export: `c41606e8b58f3e469c0e91fab48e25057c0959f9792d4385871d5c70268fe44c`;
- Reveal Day contention CSV: `86f2ebd3764d1f3ea21d5d844cff004e271a443a3431e8ac440da7f72c67e2bf`;
- String Confirmation contention CSV: `0c65e67703c57794e3c038607feeae4b9dc8126f4739766737d0066d55d76b4f`.

The post-confirmation APS export still contains:
- 2,783 rows;
- 1,614 base Application IDs;
- 1,169 replacement-record IDs.

No base Application ID was newly added to or removed from the public export between the frozen Reveal observation and the captured String Confirmation observation.

Base-record status after String Confirmation:
- 1,453 Active;
- 152 Deactivated;
- nine Withdrawn.

Replacement-record status:
- 152 Active;
- 1,017 Deactivated.

## 3. Replacement strings: exact transition

The diff identifies exactly 152 selected replacements.

For those 152 application families:
- the original base record changed from Active to Deactivated;
- the selected `-R` record remained Active;
- APS changed its Application Type from `Replacement String` to `New gTLD` or the corresponding variant-bearing type.

The Reveal-period APS export had 442 replacement records marked Active. The 17 November announcement states that only 287 applications were eligible to switch.

Therefore:
- 442 was an observed APS record-status count, not the final eligibility denominator;
- 152 of the 287 eligible applications selected the replacement;
- 135 eligible applications did not select it;
- 290 previously Active replacement records are Deactivated in the post-confirmation export;
- the difference shows that Active replacement-record status before String Confirmation was not equivalent to final Replacement Period eligibility.

Any project wording that equated 442 Active replacement records with 442 eligible applications must be corrected.

## 4. The nine withdrawals

The nine withdrawn Application IDs are:
- `QGL2682T-T10263` — .bit — Europe;
- `HMA2553-T17045` — .dao — AP — Applicant Support;
- `MRL2648T-T18053` — .list — AP;
- `HSCC2561-T49850` — .max — AP — Applicant Support;
- `MRL2648T-T99642` — .ops — AP;
- `RIAB2562-T60289` — .park — AP — Applicant Support;
- `PCOC2554-T97118` — .robot — AP — Applicant Support;
- `CA2682T-T18182` — .src — Europe;
- `HERI2445-T27601` — xn--kbt444f — AP — Applicant Support.

This exactly matches the announcement's regional statement: seven AP withdrawals and two European withdrawals. Five of the nine are Applicant Support applications, also matching the announcement.

All nine were members of a Reveal Day contention set.

## 5. Contention: exact public-file sequence

The official Reveal Day contention CSV contains:
- 263 contention sets;
- 891 application rows.

Removing the nine later-withdrawn applications leaves 882 rows.

The .src contention set had only two Reveal Day members. Once `CA2682T-T18182` withdrew, the remaining application was no longer in identical-string contention. Removing that resulting singleton yields the observable pre-replacement state:
- 262 contention sets;
- 881 application memberships.

The official String Confirmation contention CSV contains:
- 226 contention sets;
- 705 application rows.

Therefore the public-file sequence is:

**263 / 891 → withdrawals and .src singleton removal → 262 / 881 → replacement decisions → 226 / 705**

The replacement phase therefore reduced the public contention universe by:
- 36 contention sets;
- 176 contention memberships.

Of the 152 selected replacements, 140 came from applications that were in the visible pre-replacement contention universe. Twelve selected replacements came from applications outside those public identical-string contention sets.

Thirty-six applied-for strings disappear as contention sets after the withdrawal adjustment:
`advisors, agt, anime, bbq, beta, bro, coaching, config, crm, deploy, echo, fam, happy, ify, iii, inn, journey, lfg, line, log, logistics, manga, more, nerd, owl, point, roofing, slides, soul, transport, universe, virtual, vpn, wifi, wise, yeah`.

## 6. Announcement versus public contention files: constant +4

ICANN's 17 November announcement describes:
- 262 contention sets / 885 applications before replacement choices;
- 226 contention sets / 709 applications after replacement choices.

The public files show:
- 262 / 881 after applying the nine withdrawals to the Reveal Day file and removing the resulting singleton;
- 226 / 705 in the String Confirmation file.

The set counts are identical. The application membership counts differ by exactly four both before and after replacement:

- 885 − 881 = 4;
- 709 − 705 = 4.

The four-record gap therefore survives the replacement transition unchanged.

## 7. Application-universe reconciliation

The current public APS records yield 1,605 proceeding application families after selecting the active record within each original/replacement family.

ICANN's announcement reports 1,610 proceeding applications: a difference of five.

One known application is separately absent from the public APS export:
- `WDO2627T-T45217` (.wdo), World Data Organization, AP region;
- APS states that it remains under administrative check and is not available on the public Applications list.

Treating .wdo separately explains one of the five:
- 1,605 visible proceeding families + 1 known .wdo administrative-check application = 1,606;
- ICANN announcement = 1,610;
- residual unexplained gap = four applications.

The same residual four appears in independent dimensions:
- visible proceeding AP applications: 210;
- plus .wdo: 211;
- announcement AP total: 215;
- unexplained AP gap: four.

And:
- visible proceeding Applicant Support applications: 46;
- announcement Applicant Support applications: 50;
- gap: four.

And:
- visible pre-replacement contention memberships: 881 vs announcement 885;
- visible confirmed contention memberships: 705 vs announcement 709;
- gap: four in both cases.

The evidence is therefore consistent with four applications that are:
- counted in ICANN's 17 November announcement aggregates;
- AP-region applications;
- associated with Applicant Support applicants;
- members of contention sets;
- absent from the current public APS export and public contention CSV.

Their identities and the administrative reason for their absence are not yet publicly established. Do not label them as new applications, reinstated applications, withdrawals, or any other specific status without additional official evidence.

## 8. APS Statistics adds a second official counting layer

The APS Statistics page captured after publication states:
- Last published: 17 November 2026 at 18:09 UTC;
- Total Applicants: 481;
- Total Applications: 1,615;
- Total Unique Strings: 1,127;
- Total Variants: nine;
- Active applications: 1,606;
- Withdrawn applications: nine;
- Applications In Contention: --;
- Total Contention Sets: --.

Thus APS Statistics itself reports 1,606 Active applications, while the ICANN announcement reports 1,610 applications proceeding.

This reinforces that the +4 is not a simple arithmetic mistake produced by this project. Two ICANN-controlled publication surfaces expose different application universes on the same date.

A second project capture at 18:57 UTC found the APS Statistics page republished at **18:39 UTC** with the same 1,615 total / 1,606 Active / nine Withdrawn / 1,127 unique-string figures. The discrepancy therefore persisted after a later same-day APS publication and should not be dismissed as an initial synchronization lag.

It also preserves a separate historical issue:
- 22 September: ICANN stated that 1,616 paid applications would proceed;
- Reveal Day: 1,615 applications;
- the unexplained 1,616 → 1,615 transition remains distinct from the new 17 November +4 publication discrepancy.

## 9. .lugano

Application `CDL2651T-T31516` is present in the live APS export with:
- Primary String: `lugano`;
- Applicant: Città di Lugano;
- Application Type: New gTLD;
- Application Status: Active;
- Application Processing Stage: String Evaluation Processing;
- Geo self-designated: TRUE;
- In Contention: FALSE;
- Open Comment Period: TRUE;
- GAC Early Warning: FALSE;
- GAC Advice: FALSE;
- Objection: FALSE;
- Singular/Plural: FALSE.

There is no replacement record for .lugano.

## 10. Editorial consequences

1. String Confirmation Day meets the threshold for RR3.
2. Reveal Day and RR1/RR2 remain immutable historical evidence.
3. The site should add a distinct String Confirmation state rather than overwrite Reveal Day.
4. The current analytical layer should distinguish official announcement aggregates from publicly observable APS/file counts.
5. The 442 Active replacement-record count must no longer be described as the final eligible population.
6. The four-application aggregate/publication gap deserves a dedicated documented anomaly, with identities explicitly unresolved.
7. .wdo remains a separate, known administrative-check case.
8. The historical 1,616 → 1,615 discrepancy remains separate again.
9. .lugano can be advanced in the participant-observer timeline to String Evaluation, with no contention and the comment period open.
