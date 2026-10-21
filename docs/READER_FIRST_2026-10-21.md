# Reader-first navigation, 21 October 2026

Technical release: v0.7.92. Baseline: `639617f5b79cf5524825ab7093f4c7bb722d1d42` (v0.7.91).

## Editorial decisions

The publication has one set of evidence, not separate simplified and scholarly editions. Home offers three intentions: understand, explore and verify. The persistent six-area navigation stays in place. Its 26 entry cards remain available, and a complete chapter index provides a direct route without the hidden legacy dropdown.

The Stories landing progresses from surprising naming histories through communities and cities to the domain economy. Other landings explain what their tools and chapters answer. The existing three-minute guide, three discovery stories, byline, application-stage caveat and scholarly citations remain visible.

Ten chapters are reordered: How it works, Cities, Social life, Contention, Refusals, Disputes, Strange Internet, History, Sources and Resources. Established cases and explanatory mechanisms precede current-round analysis where appropriate. Cities leads with governance and public outcomes before inventories; Resources puts downloads before suggested research questions. Economics keeps its separately verified six-step structure.

Twenty-three non-Home native chapters receive contextual breadcrumbs and two selected onward reading links. Local outlines preserve original fragments and are collapsed until requested, so they do not push down an inbound deep link. All six landings, 23 chapters and Home remain accessible in Italian, English, German and French. Twenty-eight independent atlas, chronicle and investigation pages gain onward routes without serializing or rewriting their existing bodies. Eight legacy governance URLs retain their native-chapter redirects.

The researcher can reach the citation guide from Home immediately. Its current technical-pack label now derives from publication metadata rather than a stale literal. Scientific RR1 and RR2 identifiers, their meanings and immutable archives are unchanged.

## Implementation and preservation

`data/reader_pathways.json` holds the four-language navigation copy, edge choices and explicit block order. `scripts/reconcile_reader_first.cjs` runs after existing renderers. It checks every original substantive text node, source link and stable fragment before and after moving blocks. New navigation is not counted as scientific evidence.

`docs/reader-first-frozen-evidence.json` independently protects the 83 existing CSV and ZIP files against baseline hashes. The longstanding source-parity review and its original A/B baselines remain in force. `docs/reader-first-content-preservation.json` and `docs/reader-first-static-checks.json` record build checks. Historical technical ZIPs are not overwritten.

The JavaScript enhancement only manages the complete index and chapter-specific document titles. Core links, source text and native details controls remain HTML. There is no new tracking, remote font, dependency or animation in the site runtime.

## Verification and limits

Static checks cover all four languages and the root alias, 26 area cards, selected local destinations, original fragments, data hashes, source provenance, metadata and existing Economics and quick-guide safeguards. Browser scenarios exercise route selection through the actual interface, keyboard links, Back, language changes, deep links, both themes and narrow reflow. Screenshots and axe findings are kept as workflow artifacts, not represented as user-study observations.

Automated accessibility checks and visual review are not a complete WCAG conformance assessment. No real participant test or screen-reader user study has been performed, and no such result is claimed. The pre-existing blank reader-study materials remain blank. "Best in the world" is an ambition, not a measured outcome.
