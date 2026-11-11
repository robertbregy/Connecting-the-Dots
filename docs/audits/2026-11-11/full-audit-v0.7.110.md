# Full-site audit closure · v0.7.110

**Reviewed:** 11 November 2026  
**Scope:** editorial architecture, legal/procedural accuracy, source freshness, multilingual consistency, SEO/discovery metadata, agent access, accessibility, performance, release integrity and live-delivery evidence.

## Executive finding

The site is structurally strong. The audit did not find a fragile navigation model, broken internal link graph, accessibility regression or corrupted research archive. The remaining defects were mostly editorial and governance defects that ordinary pass/fail browser tests cannot detect.

v0.7.110 closes the issues that can be corrected from verified evidence before String Confirmation Day without rewriting frozen research snapshots.

## Closed in v0.7.110

### 1. Legal procedure and historical disputes were still partially duplicated

v0.7.109 added the dedicated **Rights, objections & remedies** chapter, but **Disputed Dots** still retained its older procedural explainer and a duplicated pre-String-Confirmation status panel.

**Correction:** Disputed Dots now remains a historical-case layer and links to Legal for procedure. Contention, legal procedure, dispute stories, application outcomes and lifecycle are separate concepts.

### 2. The Legal chapter said that standing was required without answering who has standing

The 2026 Applicant Guidebook distinguishes standing by objection ground.

**Correction:** the Legal chapter now explains:
- String Confusion standing for defined existing TLD interests and 2026 applicants, subject to the Guidebook constraints;
- Legal Rights standing for documented rights holders and qualifying IGOs;
- Limited Public Interest standing for anyone, but only on that defined ground;
- Community standing for established institutions with an ongoing relationship to a clearly delineated community.

It also records the additional 30-day filing windows and the seven-day Independent Objector extension to the initial window.

### 3. .helsinki had changed after the frozen IANA snapshot

The project intentionally preserves an IANA/root snapshot dated **4 October 2026**. Later primary evidence shows that IANA completed the .helsinki revocation process on **28 October 2026** and the current root state no longer includes HELSINKI.

**Correction:** the frozen snapshot is unchanged. A dated **11 November editorial overlay** records the later revocation and explicitly explains the distinction between historical evidence and current editorial status.

### 4. Source freshness measured observation age but not editorial review age

An old observation is not necessarily unreviewed; conversely, a recent technical release does not make an old observation current.

**Correction:** mutable-source policy now records both:
- the observation date;
- the latest editorial review date and outcome.

The release gate evaluates mutable-source review state against the technical release date. A milestone such as String Confirmation still forces reconciliation even after a prior editorial review.

### 5. Current-release documentation drifted

The README header identified v0.7.109 while its **Current release** block still described v0.7.108. The data README still called the current phase the Replacement Period, which ended on 21 October. The v0.7.109 machine-readable release history also reused an obsolete dispute-mechanism title as its summary key.

**Correction:** all three are synchronized.

### 6. Lifecycle copy contained a brittle count

The cemetery text referred to a fixed number of paths while the chapter already contained a different number of concrete cases.

**Correction:** the copy now describes the distinct lifecycle outcomes without a count that becomes false whenever another documented case is added.

## Static SEO, discovery and agent audit

Verified in the deployed/public corpus before this remediation:
- indexable pages expose title, description, canonical and one H1;
- no malformed JSON-LD was found;
- no broken internal link or fragment was found in the public corpus;
- sitemap URLs correspond to canonical public URLs;
- language pages and Legal guides expose reciprocal language alternatives;
- Legal guides are present in the discovery manifest and agent catalog;
- `llms.txt` and `agent-catalog.json` retain explicit dataset units, dates and provenance.

### Sitemap `lastmod` and JSON-LD modification dates

The audit found that generated discovery URLs inherited the technical release date as `lastmod` and JSON-LD `dateModified`, even when a page had not received a significant editorial change.

**Correction:** v0.7.110 omits those optional fields for generated discovery pages until a reliable per-page modification date can be derived. The sitemap still contains the canonical URLs and reciprocal language alternatives. This follows Google guidance that `lastmod` should be consistently accurate and may be omitted where it is not.

### Search Console limitation

The connected GSC Wizard service returned `payment_required` during this audit. Actual Google URL Inspection, landing-page performance and cannibalization data were therefore not available. No indexing conclusion is inferred from generic web-search results.

## Accessibility and browser behaviour

Required browser/WCAG, Atlas, city-namespace, focus/reflow and multilingual checks passed on v0.7.109 before this audit branch. v0.7.110 must pass the same required checks on its exact final candidate before merge.

## Controlled live performance baseline from v0.7.109

GitHub Actions Chromium, 390×844 viewport, cold cache, artificial network and CPU slowdown, three repeats:

| Route | Median synthetic LCP | Median synthetic CLS | Median transferred bytes |
| --- | ---: | ---: | ---: |
| Overview | 1,380 ms | 0.011 | 891,899 |
| Explorer | 1,360 ms | 0.011 | 891,899 |
| Economics | 2,596 ms | 0.011 | 891,899 |

These are controlled laboratory observations, not field Core Web Vitals percentiles.

### Deferred: Economics performance

Economics is the only tested path materially slower than Overview and Explorer. It remains within the project's current lab gate. Optimisation should target the actual critical path rather than removing content or weakening the reader-first structure.

## Frozen evidence and non-goals

v0.7.110 does **not**:
- reconcile post-String-Confirmation APS data before 17 November;
- rewrite the 4 October IANA/root snapshot;
- rewrite RR1 or RR2;
- infer application outcomes;
- infer motives for .helsinki;
- claim Search Console results that were unavailable;
- convert synthetic performance measurements into field-performance claims.

## Next mandatory review

**17 November 2026 · String Confirmation Day**

The APS current-view evidence must be reconciled on or after that milestone before a post-confirmation state is presented as current.
