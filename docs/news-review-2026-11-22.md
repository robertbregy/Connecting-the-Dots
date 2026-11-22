# Editorial and evidence review — 22 November 2026

## Scope and publication decision

This review supports technical/editorial release **v0.8.2**, following the published v0.8.1 commit `f8f6b6dbd52b800e9f65fca3ef19094aed008d6b`. It adds dated evidence to the current website in English, Italian, German and French. It does not extend the evidentiary cutoff of RR1, RR2 or RR3, alter their DOI records, or rewrite earlier technical packages.

Selection favours a documented change in status, a correction to an existing finding, a new economic mechanism, or a material development in naming and governance. Publication dates, event dates and our retrieval date remain distinct. Open consultations and ongoing conferences are presented as processes, not completed decisions.

## ICANN announcement correction

The updated [17 November announcement](https://www.icann.org/en/announcements/details/icann-confirms-2026-round-applications-input-and-objections-period-begins-updated-17-11-2026-en) retains a 16 November reference date. Its correction was observed on 22 November; the available page does not establish the precise correction time.

| Measure | Original wording | Corrected wording |
|---|---:|---:|
| Applications proceeding | 1,610 | 1,606 |
| Applications in contention | 709 | 705 |
| Applicant Support applications proceeding | 50 | 46 |
| Asia-Pacific applications | 215 | 211 |
| IDN applications | 22 | 21 |
| Applications for variants | 9 | 8 |
| Replacement-eligible applications | 287 | 442 |
| Replacement selections | 152 | 152 |
| Reveal Day contention groups / members | 262 / 885 | 263 / 891 |
| Confirmed contention groups | 226 | 226 |

The former four-application announcement/publication discrepancy is resolved by the correction. It is not evidence of four missing application records. The separate `.wdo` administrative-check case remains outside the public listing. The older September 1,616-to-1,615 difference remains unresolved. The corrected announcement still says 36 fewer contention sets, whereas 263 minus 226 is 37; the site records this residual inconsistency rather than silently repeating the bullet.

Historical 17 November Field Notes and their source text remain available with an explicit superseding note. The new account distinguishes what was known then from the correction observed now.

## Current APS observation and withdrawals

The public CSV was acquired on **22 November at 10:51:04 UTC**, using the export request exposed by the official APS application. The matching statistics observation was published at **10:39:14.813 UTC**. The raw CSV and normalized public fields have separate SHA-256 hashes in `data/applications_2026_aps_followup_20261122_provenance.json`.

The download contains 2,783 rows: 1,614 stable application families and 1,169 linked replacement rows. Effective family state is **1,595 Active / 19 Withdrawn**. Statistics reports **1,596 Active / 19 Withdrawn**; the one-record coverage difference is the separately documented `.wdo` case. Status observations do not establish the exact withdrawal date or its reason.

Ten application records changed from Active in the frozen 17 November CSV to Withdrawn in the new export:

| String | Applicant | Application ID |
|---|---|---|
| .airliquide | L’Air Liquide | AI2686T-T93348 |
| .bit | Internet Naming Company | INC2624T-T96235 |
| .gaming | Cam Connecting SARL | CCS2640T-T43697 |
| .gym | Cam Connecting SARL | CCS2640T-T59535 |
| .leo | TechEdge Limited | TL2645T-T79897 |
| .max | Cam Connecting SARL | CCS2640T-T75373 |
| .official | Cam Connecting SARL | CCS2640T-T64563 |
| .pop | Beijing Guoxu Network Technology Co., Ltd. | BGNT2696T-T98747 |
| .zen | Cam Connecting SARL | CCS2640T-T99130 |
| .zen | TechEdge Limited | TL2645T-T30242 |

A withdrawal is application-specific. In particular, `.official` still has five other active applicants in the new public export. The 152 replacement selections are unchanged.

The full 34-column comparison also finds ten records, representing seven application families, whose Change Request flag changes from false to true. These are recorded separately from the withdrawals. Available request details mainly concern phonetic representations and organisation URLs; the flag is not an approval of the application or evidence of a substantive policy change.

The current Atlas derives **1,119 active new-primary strings** and **225 exact-string overlap groups / 695 applications** from the new CSV. These are project calculations, not a new ICANN contention determination. The official contention file published on 17 November remains **226 groups / 705 application rows**. Both sources and their dates remain accessible. The observation log is append-only by source digest.

The replacement resolver retains a selected replacement if that application is later withdrawn; withdrawal must not restore its deactivated original string. All ten observed changes in this particular export affect base rows, but the resolver now represents the general state transition correctly.

## Additional material selected

| Topic | Evidence and date | Editorial treatment |
|---|---|---|
| .web launch | [Verisign, 11 November](https://verisigninc.gcs-web.com/news-releases/news-release-details/verisign-announces-web-launch-key-dates); [ICANN launch calendar](https://newgtlds.icann.org/en/program-status/sunrise-claims-periods/web) | Add to the existing dispute case: Sunrise 10 December–11 January, Priority Access 12 January–5 April, general availability 6 April 2027. These are announced future phases. |
| Existing .name services | [Verisign letter, 5 November](https://itp.cdn.icann.org/en/files/consensus-policies/kane-to-fessenden-05-11-2026-en.pdf); [ICANN response, 9 November](https://itp.cdn.icann.org/en/files/consensus-policies/fessenden-to-kane-09-11-2026-en.pdf) | Explain conditional continuation of existing third-level registrations and email forwarding while at least one accredited registrar offers them. Distinguish this from future requests concerning new services; no perpetual guarantee. |
| .helsinki | [ICANN termination notice, 13 November](https://itp.cdn.icann.org/en/files/registry-agreements/helsinki/helsinki-termination-notice-13-11-2026-en.pdf) | Complete the existing chronology: IANA revocation on 28 October and Registry Agreement termination on 13 November are different events. No inference about the city’s financial motives. |
| Domain market, Q3 | [DNIB release, 22 October](https://verisigninc.gcs-web.com/news-releases/news-release-details/dnibcom-reports-internet-has-4116-million-domain-name) | Add the 30 September observation of 411.6 million registrations, distinct from earlier Q2 data. Registrations are not websites or users; identify Verisign’s role. |
| Domain Options | [Identity Digital and Deqo, 10 November](https://www.businesswire.com/news/home/20261110723636/en/Identity-Digital-and-Deqo-Launch-Domain-Options-to-Improve-Capital-Efficiency-for-Investors) | Describe the announced 24-month exclusive marketing/sales right, priced at USD 20–30 across 17 TLDs. No claim of proven returns, uptake or a settled legal classification. |
| French DNS resilience | [ANSSI/Afnic, 17 November](https://www.afnic.fr/observatoire-ressources/actualites/lanssi-et-lafnic-publient-le-rapport-2026-de-lobservatoire-de-la-resilience-de-linternet/) and its report | Explain that 79.73% of examined .fr zones place all authoritative servers within one AS per zone. This does not mean one AS serves 79.73% of .fr. Keep DNSSEC scope and denominators explicit. |
| AI agent naming | [Linux Foundation, 10 November](https://www.linuxfoundation.org/press/linux-foundation-welcomes-agent-name-service-to-bring-verifiable-identity-and-discovery-to-ai-agents); [DNS-AID individual draft, 2 November](https://datatracker.ietf.org/doc/html/draft-mozleywilliams-dawn-dnsaid-00) | Separate the ANS project from the individual DNS-AID proposal. Neither project inclusion nor an Internet-Draft establishes an adopted IETF standard or widespread deployment. |
| PP-26 | [ITU opening, 9 November](https://www.itu.int/en/mediacentre/Pages/PR-2026-11-09-PP-opening.aspx); [Internet Society, 13 November](https://www.internetsociety.org/blog/2026/11/pp-26-whats-at-stake-for-the-internet-and-where-we-stand/) | Conference remains in progress until 27 November. Attribute Internet Society’s concerns; do not present them as adopted conference decisions. |
| Open ICANN consultations | [Latin-script diacritics](https://www.icann.org/en/public-comment/proceeding/latin-script-diacritics-pdp-final-report-for-icann-board-consideration-16-11-2026), [SSAD](https://www.icann.org/en/public-comment/proceeding/system-for-standardized-accessdisclosure-ssad-supplemental-recommendations-10-11-2026), [Review of Reviews](https://www.icann.org/en/public-comment/proceeding/review-of-reviews-second-draft-report-12-11-2026) | Present proposals and closing dates: 6 January 2027, 23 December and 22 December 2026. SSAD does not promise automatic data disclosure. |
| Objection procedures | [WIPO, 19 November](https://www.wipo.int/en/web/amc/w/news-domain-name-disputes/2026/icann-2026-new-gtld-program-reaches-string-confirmation-day-and-opens-objection-filing-period) | Document the 17 November–16 March 2027 filing window and provider roles. Do not reuse the obsolete 1,610 / 709 counts repeated in that article. |

## Items checked without a new headline

The public summaries for `.lugano`, `.tether` and `.usdt` remain Active / String Evaluation Processing; no new approval or delegation is inferred. `.wdo` remains in administrative review. A prioritization draw is still indicated for the first half of 2027, without a newly confirmed date. The 65% withdrawal-refund deadline remains 27 November 2026 at 23:59 UTC.

No fresh primary evidence justified a new conclusion for `.meo`, `.io` or sanctions-related domain outcomes. A recently posted Afnic brand article recycles an older Reveal Day discussion, so its posting date was not used as a new evidence date. Trade-press commercial claims and conference predictions without a matching primary source were not promoted into established facts.

## Review and release controls

The new editorial panels use existing reading paths, localised source labels and explicit observation dates. Economics panels are placed in their complete reading pages; the Field Notes index provides links to the relevant content. Historical chapters and datasets remain separately identifiable.

Generated-page review also identified a superseded Helsinki lifecycle summary still displaying its 25 October state. The current summary now links the 13 November contract termination and 28 October delegation revocation, verified against ICANN and the IANA profile on 22 November. The original October editorial observation is preserved in its historical data file.

The existing source-section baselines, immutable-file inventories, protected native Atlas panel hash and seven required PR checks remain in force. Only the two current Atlas headline-number substitutions are added to the existing exact normalization rule. The final review manifest records inspected files without changing the original baseline hashes.

The technical package includes the new source CSV, provenance, follow-up evidence and editorial records. The exact published v0.8.1 package is added to the frozen-package registry. Promotion requires the completed generated candidate, successful mandatory PR checks, a rollback ref, the protected merge, an actual Pages deployment and a successful live-byte comparison for that merge commit. This document describes those requirements; their execution is recorded separately in the release review and CI history.
