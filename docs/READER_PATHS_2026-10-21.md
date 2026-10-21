# Reader-first navigation review, 21 October 2026

## Scope

Technical/editorial release 0.7.92 implements issue #4's cross-site reading architecture. It is not a new scientific research release, an assertion of WCAG conformance, or a completed human usability study.

The release covers all 24 native chapters in English, Italian, German and French, the compatible root alias, and 31 active independent pages. The eight legacy governance URLs keep their existing redirects and archival fallback. All 26 hub cards remain reachable.

## Editorial decisions

Twelve chapters use a revised order of their existing blocks. The renderer checks a complete permutation and exact original wording and links for every captured block, rather than dropping difficult content to make the page shorter.

| Chapter | Reading progression |
| --- | --- |
| Application history | Rounds, the cultural trajectory of names, the 2000 case, analytical patterns and limits. |
| How it works | Address and roles, lifecycle and control, economics and naming models, definitions, 2026 context, applied .lugano case. |
| Cities | Rationale, governance, evaluation, application cohorts, Helsinki lifecycle. |
| Society | Question, concrete cases, social models, historical analysis, current rules, cross-round comparison. |
| Contention | Control of a name, applicable rules, comparisons, scarcity, cross-round context. |
| Application outcomes | Distinct mechanisms and cases before the 2012 funnel and the unfinished 2026 round. |
| Disputes | Concrete controversies, mechanisms, current cases and their documented status. |
| Strange Internet | Unexpected meanings and geopolitical traces before cross-round comparison. |
| 2026 overview | Definition of the round, metric scope, provisional status, publication calendar, interpretation. |
| Research | Purpose, choice of citable object, citation, paper, provenance, older release, unresolved validation. |
| Resources | Dataset selection and downloads before reference facts and research questions. |
| Methods and sources | Author context, evidence categories, sources and limitations, success criteria, versions, corrections, feedback. |

Economics keeps its existing six-stage structure. Seventeen other chapters receive 67 compact guide stops per locale. Long chapters expose their full index on demand; this replaces the duplicate flat index, not the content. Each of the 24 chapters has two explicit onward-reading/evidence links. The APS shortcut correctly opens the nested atlas inside Explore rather than inventing a top-level tab.

Home adds direct access to data and citation guidance alongside the introductory and exploratory actions. The stories landing starts with accessible examples, then society, cities and economics. Independent articles identify the actual article in their breadcrumb and link back to its context and sources.

## Accessibility and implementation

Navigation and translated guidance are generated as static HTML. The JavaScript only reconciles a legacy duplicate index. New controls retain ordinary hrefs, native disclosure semantics, visible keyboard focus, responsive layouts, 44-pixel or larger target heights and reduced-motion support. No visitor tracking, forced path, automatic page change or reading-time claim has been added.

`data/reader_paths.json` is the four-language source of truth. `scripts/render_reader_paths.cjs` runs after the existing content renderers and checks original blocks and fragments before writing the result. Independent pages are edited through bounded insertions so archival entity encoding and article bytes are not normalized by an unrelated serializer.

## Reproducible gates

The existing release, multilingual, delivery, source-parity, Economics and dataset validators remain enabled. The new `scripts/reader_paths_review.cjs` checks all main-page routes, new guide links and onward links, four languages, both themes, 320-pixel reflow, keyboard activation, static no-JavaScript markup and independent-page return paths. Axe scans check the rendered states; raw reports and screenshots remain workflow artifacts rather than publication evidence.

The exact-hash editorial review selects this version only. The original scientific baselines, RR1/RR2 DOI identifiers and previous technical ZIPs are preserved. The 0.7.91 ZIP is added to the protected package inventory; 0.7.92 gets its own archive.

## Limits

Automated and synthetic checks cannot establish that ordinary readers or researchers find the site engaging. Real reader studies and independent semantic coding remain explicitly pending. No real participant observations are fabricated. The work implements a cross-site editorial structure; it does not claim that every sentence or every diagram has undergone a new expert review.
