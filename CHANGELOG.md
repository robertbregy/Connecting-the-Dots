# Changelog

## v0.6.8 · 2 October 2026

- Introduced an event-history layer for the Namespace Explorer so repeated strings are no longer flattened into one misleading record.
- Added `explorer_events.csv` alongside the latest-state `explorer_catalog.csv`.
- Corrected `.cat` and `.post` to the 2004 sponsored round in the current Explorer view and preserved multi-round histories such as `.nyc`.
- Marked `.lugano` as an applicant disclosure before Reveal Day; the official ICANN individual-string record remains explicitly pending.
- Added provenance and event history to Explorer record details.
- Replaced clickable Explorer rows/cards with actual buttons and simplified disclosure-navigation ARIA semantics.
- Deduplicated rendered source entries by URL.
- Added explicit event types to the compact city timeline.
- Added `As of` dates to changing round-level figures.
- Moved the KPI grid to 2×2 at medium widths and switched to mobile navigation earlier to prevent French-language overflow.
- Right-aligned the final desktop dropdown so it remains inside the viewport.
- Hardened the 2012 stat trio against French and other long labels at medium desktop widths.
- Kept the runtime self-contained while externalizing the repeated logo asset to reduce HTML weight without reintroducing bundle fragility.
- Extended build validation to cover Explorer history, `.lugano` provenance, header-only pre-Reveal application data and downloadable data-pack parity.

## v0.6.7 · 2 October 2026

- Replaced native `<details>` navigation groups with controlled desktop dropdown menus.
- Restored a single-line primary navigation bar on desktop.
- Added click, hover, keyboard focus and Escape/outside-click behavior for grouped menus.
- Preserved the compact mobile section selector and all v0.6.6 hotfix behavior.

## v0.6.6 · 2 October 2026 — deployment hotfix

- Restored a self-contained `index.html` runtime after the v0.6.5 external-bundle deployment proved fragile on GitHub Pages.
- Inlined CSS, data, translations, map data, publication state and application JavaScript.
- Preserved the v0.6.5 information architecture, navigation, accessibility and Explorer improvements.
- Kept CSV/ZIP research assets external for download and reproducibility.

## v0.6.5 · 2 October 2026 — architecture and UX pass

- Grouped information architecture: 7 top-level navigation choices.
- Pre-Reveal publication state centralized and future-tense copy corrected.
- Explorer reframed as preview, capped rendering + “Load more”.
- Browser history for section changes.
- Drawer focus trap/return, map accessible names, localized control labels.
- Native share sheet where supported.
- Brand returns to Overview.
- 320 px KPI overflow fixed.
- Round 2026 placeholders consolidated before Reveal.
- `.lugano` vision explicitly marked “if delegated”.
- Light-mode text links use a higher-contrast accent.
- Dataset structured metadata coverage corrected to 1984–2026.
- Long chapters expose a local section index (How it works, Geography, Methodology).
- Pre-Reveal `applications_2026.csv` became a header-only schema: no fake placeholder observation.
- `data/manifest.json` added SHA-256 hashes, record counts and snapshot metadata.
