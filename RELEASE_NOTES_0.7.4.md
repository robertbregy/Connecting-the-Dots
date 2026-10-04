# Connecting the Dots 0.7.4

Release date: 4 October 2026. Main research snapshot: 2 October 2026. Current IANA verification: 4 October 2026.

## Changes

- Reconcile current root status and formal TLD type against archived IANA records; retain historical applications as separate events.
- Separate registry legal entity, historical applicant, registry country, represented place and IANA technical-contact organization. Do not identify the technical contact automatically as the contractual RSP.
- Correct .CS: former Czechoslovak delegation and subsequent retirement; no redelegation for Serbia and Montenegro. Preserve the .GB reserved exception.
- Keep .lugano as applicant disclosure before Reveal Day; do not infer its public legal-applicant identity from municipal stewardship.
- Date 2012 contention counts explicitly; preserve current evidence URLs and raw IANA snapshots.
- Restore section, query, filters, presets, map and fragment from the URL on load and Back/Forward. Preserve the selected section on language change. Make section links and internal anchors shareable.
- Announce changing result counts, expose active navigation and improve semantic badge contrast in both themes. Explain the CSV alternative to the interactive Explorer without JavaScript.
- Localize repeated numeric facts and current registry-country labels.
- Add direct timeline sources, correct historical source hosts and qualify the Identity Digital biography claim.
- Describe pre-Reveal application data as unavailable scaffolding. Align download copy with the actual CSV pack and include its content licence and normalized IANA evidence.

## Verification

`python3 build.py` passes static metadata/content/link checks for all four language pages and the root alias, legacy redirects and corrective regressions. Corrective checks exercise the actual application in a DOM test environment in EN/IT/DE/FR, including explicit-section precedence, fragment routing, language navigation, complete history restoration, filters, map and internal anchors. They compare runtime records with CSV and the retained source evidence.

The data ZIP has been checked for integrity, manifest/CSV hashes and licence inclusion. This does not constitute a formal WCAG certification, Core Web Vitals measurement or visual Safari/iPhone test. The verification browser could not access the local preview server.

## Deployment

The full redeploy ZIP contains the generated root page, EN/IT/DE/FR pages, assets, data, downloads and rebuild sources at archive root. Extract it and replace the corresponding project files, retaining the repository's Git history. GitHub Pages can serve the repository root without a build step.

Shared-asset performance refactoring is deferred to retain the existing self-contained deployment model. Search Console submission and any origin-root robots configuration are account/hosting tasks and are not changed by this package. Public publication has not been performed by this release preparation.
