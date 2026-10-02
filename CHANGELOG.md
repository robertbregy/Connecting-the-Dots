# Changelog

## v0.6.7 · 2 October 2026

- Replaced native `<details>` navigation groups with controlled desktop dropdown menus.
- Restored a single-line primary navigation bar on desktop.
- Added click, hover, keyboard focus and Escape/outside-click behavior for grouped menus.
- Preserved the compact mobile section selector and all v0.6.6 hotfix behavior.

# v0.6.6 — deployment hotfix

- Restored a self-contained `index.html` runtime after the v0.6.5 external-bundle deployment proved fragile on GitHub Pages.
- Inlined CSS, data, translations, map data, publication state and application JavaScript.
- Embedded the visual logo used by the page.
- Preserved the v0.6.5 information architecture, navigation, accessibility and Explorer improvements.
- Kept CSV/ZIP research assets external for download and reproducibility.


## v0.6.5 — architecture and UX pass

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
- Web build externalizes CSS/JS/data/download assets to reduce monolithic HTML.
- Long chapters now expose a local section index (How it works, Geography, Methodology).
- Timeline events carry explicit semantic stage labels (idea, application round, delegation/launch, etc.).
- Ambiguous evaluative wording and the Geography framing were tightened.
- Pre-Reveal `applications_2026.csv` is now a header-only schema: no fake placeholder observation.
- `data/manifest.json` adds SHA-256 hashes, record counts and snapshot metadata.
- The downloadable data pack includes the corrected 2026 schema and manifest.
- `build.py` now validates local assets, key JavaScript syntax and the pre-Reveal dataset state.
- Runtime data and translations are consolidated into generated bundles, eliminating browser-time override chains.
