# Connecting the Dots | The reading paths

**21 October 2026 · Editorial and UX revision.** Covers 23 substantive chapters in the four publication languages. Changes the reading guidance, not the underlying research dataset or historic DOI.

## The editorial contract

A reader should never have to learn the project's taxonomy just to answer a question. Each chapter therefore starts with (1) where it sits in the six-area publication, (2) one genuine question and a concise, qualified answer, (3) a handful of direct waypoints only where needed, and finishes with (4) one next step and (5) one independent way to examine the evidence. No new global reading-mode switch, scoring, behavioural profiling, sticky third navigation bar or artificial "minutes to read" claims.

The four languages have separate, reviewed strings in data/reading_routes.json. A compact source-controlled renderer (scripts/reconcile_reader_paths.cjs) adds semantic landmarks to all four static pages plus the root English alias. The persistent canonical chapters, their URLs, fragment identifiers, embedded source links, app navigation, Atlas, governance explainers and scientific archives are left intact. New waypoints only receive new IDs when there was no stable ID.

The Home's existing short explainer and three historical discovery routes remain unchanged; a **tertiary research shortcut** now offers direct access to the DOI/citation guide without forcing scholarly readers through the public introduction. Source-oriented readers and first-time visitors reach the same work at different levels of detail. Each chapter's new "next" direction is a suggested thread, not a forced serial order. The existing six primary areas remain the navigation.

## QA and limits

Build-time tests assert all 23 chapter entry/exit pairs, internal anchor integrity, localized copy, unchanged six-area navigation and Home jump links. Browser tests click a real mobile/desktop journey, verify hash, keyboard focus, and handoff back to the correct navigation area. Existing four-language, WCAG A/AA, legacy links, full-Explorer and live-Pages tests remain mandatory. The wider independent pages already retain the six-area cross-site navigation and canonical URLs, so they are not given a second competing navigation layer.

This is an editorial/heuristic improvement, **not** evidence that users find it better: no actual reader sample has been recruited and no conversion or satisfaction data exists. Do not invent these metrics. RR1/RR2, current official APS application identifiers, financial accounting denominators and review dates remain separate from this publication UX release.
