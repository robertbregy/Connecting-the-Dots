# Connecting the Dots: Reconstructing Twenty-Five Years of Top-Level Domain Expansion as a Living Research Atlas

**Robert Bregy**  
**Working Paper v1.0-draft · Research Release RR1 · 9 October 2026**  
**Status:** working paper; not peer reviewed.  
**Living publication:** https://robertbregy.github.io/Connecting-the-Dots/

## Abstract

Top-level domains are usually studied through separate snapshots: the current DNS root, individual ICANN application rounds, registry agreements, contention records, or retrospective policy documents. This fragmentation makes it difficult to follow the full trajectory of a string from application to delegation, non-delegation, transfer, retirement, dispute, economic use, or later reappearance. Connecting the Dots addresses this problem by building a living research atlas that integrates formal application corpora, IANA root data, historical events, governance cases, economic classifications and social interpretations across more than twenty-five years of namespace expansion.

The current research release covers the formal 2000, 2004 and 2012 application corpora and a frozen Reveal Day view of the 2026 New gTLD Round. It distinguishes applications, applied-for strings, delegated TLDs and current-root identities rather than collapsing them into a single count. The project also introduces cross-round analytical layers for contention, application outcomes, portfolio strategies, sectoral change, geographic and city namespaces, governance disputes and the social meaning of the DNS. The result is intended not as a static catalogue but as a reproducible, versioned research resource whose major evidence changes are published as milestone research releases.

## 1. Introduction

The Domain Name System is simultaneously technical infrastructure and a governed namespace. A top-level domain can function as an address component, a commercial asset, a brand namespace, a community identifier, a territorial marker, a policy object, or a trust signal. These dimensions are normally documented in different institutional and historical sources.

The New gTLD Program makes this fragmentation particularly visible. ICANN publishes application records and program statistics; IANA documents delegated top-level domains; registry agreements describe contractual status; objections and accountability mechanisms live elsewhere; and the economic or social significance of a string often becomes legible only after deployment. Historical rounds add another problem: similar or identical strings may appear in different rounds, while unsuccessful applications can disappear from current-root datasets even though they remain important evidence of what actors once attempted to build.

Connecting the Dots was created to reconstruct these layers in one research model and to make the result explorable by specialists and non-specialists alike.

## 2. Research problem

The core research problem is not a lack of records but a lack of longitudinal integration. Four distinctions are essential:

1. **Application is not delegation.** An application may be withdrawn, rejected, lose contention or never reach the root.
2. **String is not application.** Multiple applicants may seek the same string.
3. **Delegation is not current operation.** A TLD can later be transferred, retired or removed.
4. **Current-root presence is not historical completeness.** The IANA root describes the present authoritative namespace, not the full history of failed or earlier proposals.

The project therefore treats application records, string identities, delegation events and present-root status as related but distinct entities.

## 3. Data architecture

Research Release RR1 integrates four formal application periods:

- **2000:** 47 applications.
- **2004:** 10 sponsored-TLD applications.
- **2012:** 1,930 applications across 1,409 distinct strings.
- **2026:** 1,615 active applications in the official ICANN Reveal Day aggregate. The locally frozen secondary string layer identifies 980 unique primary strings representing 1,608 applications associated with a primary string; six further secondary records are variant-only applications. The project does not claim a complete locally vendored 2026 APS application-level corpus at RR1.

The Explorer contains 1,849 research records spanning current-root, historical and application-only identities, while the life-history layer contains 7,678 dated events.

The data model also includes governance cases, economic cases, social cases, contention records, geographic analysis, registry concentration, sector classification and technical IANA profile data.

## 4. Method

### 4.1 Source hierarchy

Formal application and program status are grounded primarily in ICANN records. Current and historical root status is grounded in IANA material. Secondary sources are used only where they add structured access, historical context or analytical evidence and are labelled as such.

### 4.2 Provenance and epistemic status

The publication separates three editorial states:

- **FACT:** directly supported by source records.
- **READING:** an interpretation derived from multiple facts or structured comparison.
- **VISION:** a forward-looking scenario or design hypothesis.

Derived datasets retain provenance, dates and caveats. Unknown values are kept unknown rather than inferred from absence.

### 4.3 Snapshotting

Fast-changing evidence is frozen into dated research snapshots. The 2026 round is therefore treated as a sequence of observable states rather than one final dataset. RR1 is anchored to Reveal Day, 7 October 2026. A second research release is planned for String Confirmation Day, 17 November 2026, after the replacement-string process has concluded.

### 4.4 Cross-round classification

The project uses consistent cross-round taxonomies where ICANN itself does not provide one. The economic analysis, for example, separates the **sector represented** from the **naming strategy** of the string. Thus `.ubs` and `.bank` can both map to finance while remaining different types of namespace strategy; likewise `.tether` and `.bitcoin` can both map to digital assets while one may be a brand namespace and the other a contested generic or ecosystem term.

These classifications are editorial research outputs, not ICANN categories, and unresolved mappings remain explicit.

## 5. Findings from a longitudinal view

### 5.1 Namespace expansion is not a single growth curve

Application rounds reflect different policy regimes and different conceptions of what a TLD is for. The 2000 proof-of-concept round tested a small set of models. The 2004 sponsored round focused on defined communities. The 2012 program industrialised large-scale application portfolios and introduced extensive brand participation. The 2026 round retains many mature sectors while adding economic vocabularies that were not comparably represented in 2012.

### 5.2 Portfolio strategies matter

The unit of analysis cannot be only the string. In 2012, applicants such as Donuts, Google and Amazon pursued large portfolios. In 2026, high-volume applicants again account for substantial groups of applications. Portfolio strategy changes the economics of participation by distributing risk across strings, increasing exposure to contention and rewarding shared registry infrastructure.

### 5.3 The economic vocabulary changes

A cross-round application-level economic map shows both continuity and discontinuity. Finance, technology, media, health, retail, travel and automotive were already visible in 2012 through both generic and brand strings. By 2026, AI and digital assets emerge as distinct economic clusters, while infrastructure vocabulary shifts toward concepts such as agents, APIs, identity, wallets, tokens and compute.

The important methodological result is that sectoral analysis must classify the applicant or represented economic activity as well as the literal string. Otherwise brand namespaces disappear from sector counts.

### 5.4 Trust becomes a more explicit namespace function

The 2026 string set contains a denser vocabulary around authentication, identity, certification, security and verification. This does not prove that the DNS is becoming an identity system, but it does show increased economic and institutional interest in using namespaces as part of trust architectures.

### 5.5 Cities and territories remain a distinct governance problem

Geographic TLDs differ from ordinary generic or brand namespaces because a place name can simultaneously denote public identity, economic activity, political jurisdiction and community. Existing city and territorial TLDs demonstrate multiple governance models. The 2026 `.lugano` application is treated in the atlas as a contemporary case study, not as the organising centre of the research.

## 6. The 2026 round as a living event

The 2026 New gTLD Round is still unfolding. Reveal Day exposed applicants, primary strings and public application material, but replacement strings can alter the applied-for set before String Confirmation Day. For that reason, Connecting the Dots does not continuously overwrite RR1 with live external data.

Instead, the project separates:

- the official ICANN aggregate at a defined milestone;
- locally frozen string-level evidence;
- application-level records that have been individually vendored and verified;
- later research releases that update the evidence base.

This structure makes historical comparison reproducible while preserving the ability to follow the round as it changes.

## 7. Reproducibility and publication model

Connecting the Dots is published as a **living research publication** with two version layers:

- **technical/site versions** (`v0.x.y`) for code, editorial and interface changes;
- **research releases** (`RR1`, `RR2`, …) for material changes to the evidence base or major derived datasets.

RR1 is the **Reveal Day 2026** research release. RR2 is planned around **String Confirmation Day, 17 November 2026**.

The repository includes machine-readable manifests, downloadable CSV datasets, data hashes, release history and a `CITATION.cff` record. A DOI is intentionally not stated until an archival deposit has actually been created.

## 8. Limitations

The project has five main limitations at RR1.

First, the 2026 locally vendored application-level corpus is not yet complete; the official aggregate and the frozen secondary string layer must therefore remain distinct. Second, economic-sector and strategy classifications are editorial taxonomies and require judgement for diversified groups or ambiguous strings. Third, historical source quality varies between rounds. Fourth, registration volume and commercial success are not equivalent to social or institutional importance. Fifth, a living resource can change after citation, making dated research releases essential.

## 9. Conclusion

Top-level domains are not only technical suffixes. Across successive application rounds they record changing assumptions about markets, brands, communities, cities, identity and infrastructure. Connecting the Dots reconstructs that history by linking applications to strings, strings to delegation histories, and formal records to economic, social and governance analysis.

The purpose of the living-publication model is not to keep a paper perpetually unfinished. It is to keep the changing evidence separate from the stable scholarly claim. Each research release captures a reproducible state; the online atlas continues to connect the dots between them.

## Data availability

Interactive publication: https://robertbregy.github.io/Connecting-the-Dots/  
Repository: https://github.com/robertbregy/Connecting-the-Dots  
Data pack: https://robertbregy.github.io/Connecting-the-Dots/downloads/connecting-the-dots-data-pack.zip

## Primary references

- IANA Root Zone Database: https://www.iana.org/domains/root/db
- ICANN 2000 TLD applications archive: https://archive.icann.org/en/tlds/app-index.htm
- ICANN 2012 New gTLD statistics: https://newgtlds.icann.org/en/program-status/statistics
- ICANN 2026 APS statistics: https://newgtldprogram-aps.icann.org/statistics
- ICANN 2026 applications: https://newgtldprogram-aps.icann.org/applications
- ICANN Reveal Day 2026 announcement: https://www.icann.org/en/announcements/details/icann-reveals-2026-round-applications-for-new-generic-top-level-domains-07-10-2026-en
- ICANN 2026 milestone schedule: https://www.icann.org/en/announcements/details/icann-announces-date-for-reveal-day-and-other-2026-round-milestones-29-09-2026-en

## Suggested citation for RR1

Bregy, Robert. 2026. *Connecting the Dots: A Living Research Atlas of Top-Level Domain Expansion*. Research Release 1: Reveal Day 2026. Version 0.7.55. https://robertbregy.github.io/Connecting-the-Dots/
