# Behind the Round · Editorial protocol

Behind the Round is a **living, independently authored field-note collection**, not an official report by the City of Lugano or ICANN. It documents observations that a process timeline would miss. Every story is dated, sourced and explicitly distinguishes confirmed facts, interpretations and unresolved questions.

## Case 01 · Reveal Day 2026

- ICANN, **22 September 2026**: **1,616** applications for which payment was received and that were expected to proceed.
- ICANN, **7 October 2026**: **1,615** applications in the Reveal Day statistics.
- Locally frozen secondary index, representing 7 October data and observed on **8 October**: **1,614** applications / **480** applicants.
- ICANN's public APS Applications page states that **WDO2627T-T45217**, the **.wdo** application, is still under administrative check and **does not appear in the public applications list**. This documents a reason why a visible list and an official aggregate can differ; it does **not** independently certify the completeness of the secondary index.
- **Unresolved**: no direct ICANN statement reviewed on 10 October explains which application/reason caused the prior official **1,616 → 1,615** change. Never suggest that .wdo explains that first discrepancy.
- **Explorer interpretation**: the frozen secondary 2026 layer comprises **1,608 primary-string applications** associated with **980 distinct primary strings**, plus **six variant-only applications for existing TLDs**. The total **1,614** counts indexed applications, not unique new strings, and is not a complete official APS application export. Visible numbers use local thousands separators (EN `,`, IT/DE `.`, FR space).

The source-of-truth is `data/behind_round_stories.json`. All public text lives in `data/translations.json`. `scripts/render_behind_round.py` produces the case within the four in-site language pages and four canonical standalone articles. Cross-checked sources are listed in the register.

## Change protocol

1. Check the primary ICANN statement, APS statistics and .wdo application-detail status. Compare with the dated secondary snapshot; distinguish these source types.
2. If a new explanation is credible, add the source, effective date and field-note revision entry to `revisionHistory`. Update all **EN/IT/DE/FR** narratives, state labels and last-reviewed date.
3. Preserve the original dated numbers, even if current totals change. Never silently rewrite 22 September or 7 October snapshots.
4. Update evidence-state validation deliberately if the question is finally resolved; the historical starting discrepancy remains reproducible.
5. Update the site version, run the release build and multilingual regression suite, and verify public canonical pages, reciprocal hreflang and all source links.
6. Publication of an editorial correction does not imply a new Zenodo RR release. Research releases are independently versioned and frozen.

**Monitoring**: the author has requested periodic checking of changes to these sources. An alert proposes a reviewed update; it must not automatically alter the scientific record or claim that a cause has been established before there is evidence.
