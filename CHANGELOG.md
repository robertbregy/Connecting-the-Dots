# v0.7.60 — 2026-10-09

- Adds **Inside the Round** as a substantive ICANN 2026 section in EN, IT, DE and FR, positioned beside Round overview and the distinct .lugano case.
- Introduces a small public editorial event register for dated milestones, current phases, announced dates and conditional outcomes, each with official sources. This is **not** an application filing tutorial.
- Presents .lugano as a disclosed participant-observer perspective while keeping the independent research and the City's official communications strictly separate.
- Provides four standalone indexable chronicle pages and source-backed linking from the program and .lugano views. Restores all research and Explorer entry points to the generated sitemap on every build.
- Keeps the RR1 DOI, Research Release RR1 snapshot and frozen data pack unchanged. This is a site/editorial release only.

# v0.7.59 — 2026-10-09

- Hardens the living-research publication after a full GitHub/live-site audit.
- Separates immutable Research Release RR1 citation metadata from mutable technical site versions: `CITATION.cff` now identifies RR1, while `publication.json` remains the site-version source of truth.
- Restores `.zenodo.json` to the canonical repository and adds release checks so archival metadata cannot silently disappear again.
- Makes the working paper indexable, adds canonical/citation/ScholarlyArticle metadata, adds it to the sitemap and fixes literal Markdown emphasis leaking into the rendered HTML.
- Clarifies Explorer counting: 1,849 core records + 939 net identities from the deduplicated frozen 2026 overlay = 2,788 currently explorable identities.
- Replaces stale “external enrichment” wording with the actual local-frozen 2026 model and aligns the three-clock publication date with canonical metadata.
- Moves deployment documentation to the direct Git/GitHub Pages workflow, adds an automatic rebuild/validation workflow for source changes, and removes obsolete browser-upload residue from the repository root.
- Keeps RR1 research evidence frozen; this is infrastructure/editorial hardening, not a new research release.

# v0.7.58 — 2026-10-09

- Promotes the RR1 Zenodo DOI (`10.5281/zenodo.23262623`) to first-level research metadata in Research & citation and the Working paper entry.
- Adds the RR1 DOI to the global footer for persistent visibility.
- Rewrites the archival copy to reflect that RR1 is already published on Zenodo, removing the obsolete “future DOI” wording.
- Hardens release QA so every rendered language footer must expose the canonical current version and RR1 DOI.

# Changelog

## v0.7.57 — 2026-10-09

**RR1 archived on Zenodo.** Research Release RR1 · Reveal Day 2026 now has the persistent DOI `10.5281/zenodo.23262623`. The DOI is propagated from `publication.json` into runtime publication metadata, `CITATION.cff`, structured Dataset metadata, the Research & citation interface, the research-release manifest, README and working-paper citation. The concept DOI is intentionally left unset until it is explicitly retrieved from Zenodo; the release DOI is not misrepresented as a concept DOI. Research datasets and RR1 evidence are unchanged.

## v0.7.56 — 2026-10-09

**Publication metadata single source of truth + Working paper discoverability.** Added root `publication.json` as the canonical source for current site version, release date, research release and milestone dates. The build now generates `data/publication.js`, synchronizes package metadata, citation metadata and structured dataset metadata from that source, preventing footer / Methodology / citation drift. The Working paper now has its own entry in the Research navigation and a dedicated in-site landing section. Build metadata supports `GITHUB_SHA` when executed in GitHub Actions; manual browser-upload builds remain deterministic without pretending to know a future commit SHA. Research data and RR1 evidence are unchanged.


## v0.7.55 · 9 October 2026

- Formalized **Connecting the Dots** as a **living research publication** rather than only a website.
- Added **Research Release RR1 · Reveal Day 2026**, distinct from technical/site versioning.
- Added a dedicated **Research & citation** section in EN / IT / DE / FR.
- Added `CITATION.cff` so GitHub can expose a machine-readable citation for the repository.
- Added `.zenodo.json` metadata in preparation for a future archival DOI; no DOI is claimed before deposit.
- Added a methodological working paper draft and a machine-readable research-release manifest.
- Defined **RR2 · String Confirmation 2026** as the next planned milestone research release.


## v0.7.54 — 2026-10-09
- Clarifies Round 2026 headline metrics without conflating official ICANN aggregates with the frozen secondary Reveal Day snapshot.
- Shows 980 unique primary strings as a derived frozen snapshot while keeping the official ICANN unique-string aggregate explicitly unpublished.
- Replaces the empty countries/territories metric with the official 481 applicants across all five ICANN regions, while stating that ICANN has not published a distinct-country aggregate.


## v0.7.53 — 2026-10-09

- Adds **The economy behind the dot**, a cross-round 2012→2026 sector analysis inside the existing Economics theme without adding another top-level page.
- Separates represented economic sector from string strategy, so brand namespaces and generic sector terms are analysed consistently.
- Adds `application_economic_map_2012_2026.csv` with all 1,930 2012 applications and 1,608 represented 2026 primary-string application rows; unresolved 2026 contested-applicant mappings remain explicit rather than guessed.
- Adds `sector_evolution_2012_2026.csv` and `sector_strategy_mix_2012_2026.csv`, plus an accessible comparison chart and downloadable data.
- Documents taxonomy coverage and denominators: 801/1,930 economically classified in 2012 and 690/1,608 in the represented 2026 primary-string layer.
- Adds release checks for dataset row counts, taxonomy coverage, AI/crypto discontinuity and methodological disclosure.

## v0.7.52 — 2026-10-09

- Expands the `.lugano` page from a short vision panel into a documented case study: application facts, official City project link, public-interest rationale, Swiss/international comparison, and internal cross-links.
- Distinguishes `.zuerich` correctly as a cantonal/territorial gTLD operated by the Canton of Zurich, not a municipal city TLD.
- States the Swiss-first claim conditionally: if approved and delegated, `.lugano` would be the first Swiss gTLD directly associated with a city and promoted by its municipal authority.
- Keeps institutional information on lugano.ch separate from the independent research role of Connecting the Dots.
- Rebuilds the root README around the current release and ensures the WEB-UPLOAD package includes it, preventing stale GitHub repository copy.

## v0.7.51 — 2026-10-09

- Freeze the 980 unique 2026 Reveal Day primary-string records locally (`applications_2026_strings_reveal.csv` + runtime JS); remove visitor-time nTLDData API requests and browser caching.
- Document the counting bridge: the frozen string table represents 1,608 primary-string applications; the secondary index reports 1,614 live applications overall because six are variant-only applications for existing TLDs; ICANN officially reports 1,615 applications / 481 applicants.
- Align Amazon's 2012 portfolio count with the complete local Reveal Day corpus: 76 applications.
- Replace the stale “five questions” label with a number-free orientation label in all four languages.
- Align the visible publication-update footer with 9 October 2026.
- Add release guards against reintroducing the external 2026 fetch/cache, Amazon corpus drift and snapshot-count inconsistencies.

## v0.7.50 — 2026-10-09
- rebalances the portfolio-economics section so the 2012→2026 industry pattern remains the main narrative;
- reduces Aruba from a prominent visual case to a compact methodological note on counting units;
- keeps the underlying 39-strings / 20-live-primary-applications evidence in the dataset and sources;
- generalizes the portfolio CSV description so it reflects the dataset rather than one company.

# v0.7.49 — Portfolio economics

- adds **From one application to a portfolio** to the Economics section;
- compares high-volume filing strategies in 2012 and 2026;
- documents Aruba’s 39 announced strings separately from 20 currently counted live primary applications;
- adds `data/portfolio_applications.csv`;
- adds explicit guardrails separating applications, replacement strings, legal applicants, groups, delegated TLDs and registry portfolios;
- updates sources, translations, release metadata and downloadable data.

# v0.7.48 — Publication consolidation

- Align current README/data documentation and provenance manifests with the post-Reveal state.
- Correct the Lugano city-timeline 2026 milestone from a pre-Reveal applicant disclosure to the official APS Reveal Day record.
- Label 1,615 as active applications at Reveal Day rather than as a generic paid/proceeding count.
- Declare the 2026 string inventory consistently as a paginated runtime layer with browser cache; keep full local APS application coverage explicitly unclaimed.
- Add QA guards against stale pre-Reveal life-history metadata and runtime-enrichment contradictions.
- Research corpora and IANA snapshot remain unchanged.

# Changelog

## v0.7.47 — Cross-round analytical rebalance
- Reframed thematic analysis so 2026 is the newest layer rather than the default lens.
- Added explicit 2000 / 2004 / 2012 / 2026 corpus context to Strange Internet, Economics, Social Life, Contention, Application Outcomes and Disputed Dots.
- Rebuilt Strange Internet as a chronological cross-round view; historical cases are no longer collapsed beneath 2026.
- Kept corpus-level application counts separate from curated examples and interpretive readings.

## v0.7.46 - 2026-10-08

- Fixes the 2026 Explorer profile-loader bug: runtime Reveal-Day strings no longer try to load a historical profile shard that does not exist.
- Gives every runtime 2026 string a self-contained profile with Reveal-Day snapshot date, application count, applicant when available, identical-string contention, contention-set identifier and formal application flags.
- Keeps the distinction between string-level inventory and application-level APS records explicit; no missing application detail is fabricated.
- Versions the browser cache to v0.7.46 so stale 2026 runtime rows are discarded automatically.

## v0.7.45 - 2026-10-08

- Hardens the post-Reveal data model around three distinct clocks: 4 October IANA/root snapshot, 7 October 2026 Reveal-Day application snapshot and 8 October publication date.
- Relabels `applications_2026.csv` as the partial local APS layer it actually is: one independently verified `.lugano` record, not the complete 2026 application corpus.
- Adds `application_2026_snapshot.json` with official ICANN totals (1,615 active applications; 481 applicants), the separately observed 980-string secondary inventory and the unresolved 1,615/1,614 enumeration discrepancy.
- Replaces the last stale pre-Reveal placeholder wording with current Replacement Period / String Confirmation Day language.
- Requests larger 500-row pages for the browser-time 2026 string-index enrichment, while still honoring the server-reported page size and pagination, and versions the cache for this release.
- Strengthens release checks so aggregate totals, local APS rows and string-level inventory cannot silently collapse into one false completeness claim.

## v0.7.44 — 2026-10-08

- First post-Reveal editorial patch: moves current-round evidence into thematic sections instead of leaving 2026 isolated in the Reveal tab.
- Adds a 2012 ↔ 2026 contention comparison, with derived 2026 rankings explicitly separated from official ICANN facts.
- Rebuilds Strange Internet around eight 2026 applications, while preserving 2000–2012 as a collapsible historical archive.
- Adds explicit current-round status panels to Application Outcomes and Disputed Dots so historical cases are not mistaken for 2026 results.
- Adds compact 2026 context panels to Economics and Social Life, including the USD 227,000 standard evaluation fee and ICANN Reveal Day application-type counts.
- Introduces a visible DERIVED epistemic label alongside FACT, READING and VISION.
- Keeps the v0.7.43 Explorer pagination repair unchanged.

## v0.7.43 — 2026-10-08

- Fixes the broken 2026 Explorer loader: the public nTLDData endpoint is paginated and cannot return the full 980-string inventory in the single response assumed by v0.7.42.
- Loads the complete inventory page-by-page, validates the final row and uniqueness counts, and caches the validated payload locally.
- Fixes the quick 2026 preset so strings with earlier-round history remain visible, and fixes the contention preset to include 2026 contention counts.
- Keeps the conservative distinction between string-level Reveal Day coverage and locally vendored application-level APS records.

## v0.7.42 — 2026-10-08

- Repairs the post-Reveal 2026 Explorer: the published Reveal Day string inventory is merged into the existing string-centric catalogue at runtime rather than represented by `.lugano` alone.
- Keeps application-level completeness conservative: official aggregate counts, locally vendored APS records, replacement records and string-level inventory are treated as distinct layers.
- Removes stale pre-Reveal wording and updates the publication snapshot to 8 October 2026, during the Replacement Period.
- Adds explicit provenance and graceful fallback if the external string-inventory enrichment is unavailable.

# v0.7.41 — Reveal Day data release

- Replaces the pre-Reveal publication state with the official ICANN Reveal Day snapshot of 7 October 2026.
- Updates the 2026 round to 1,615 active applications and 481 applicants; adds official Brand (333), Community (16), geographic (15), IDN (21), variant (9), Applicant Support (51) and regional application counts.
- Adds 263 preliminary identical-string contention sets covering 891 application records, derived from ICANN’s official Reveal Day contention-set CSV.
- Upgrades `.lugano` from applicant disclosure to the official ICANN APS record `CDL2651T-T31516` for `Città di Lugano`; it is self-designated geographic and is not in a preliminary identical-string contention set.
- Keeps APS fields that ICANN still shows as unavailable blank instead of inferring them.
- Adds a locally vendored official 2026 `.lugano` application record while explicitly retaining `application2026CoverageComplete=false` until the complete APS export is vendored and validated.

## v0.7.40 — 2026-10-07

- Centralizes display counts on the locale-aware number formatter and forces locale-appropriate grouping for four-digit counts; the remaining static 2026 source chip is now localized as well.
- Shortens multilingual meta descriptions while preserving the project scope and independent-research attribution.
- Enriches Dataset JSON-LD with `version`, `dateModified` and primary-source `isBasedOn` references; renderers now keep version/date synchronized automatically.
- Documents the GitHub Pages project-path limitation of `robots.txt`; page-level robots metadata and sitemap remain the effective controls.
- No research corpus, Explorer record/event, layout or application behavior changed.

## v0.7.39 — 2026-10-07

- Strengthens 2012 provenance by distinguishing the secondary row materialization source from ICANN primary corpus authority.
- Adds explicit official ICANN 2012 application-status and Reveal-Day references to the public methodology.
- Documents why 1,409 is the original 13 June 2012 Reveal-Day distinct-string count while later ICANN materials may cite 1,388 for later active/program-state populations.
- Completes public release history for v0.7.37 and v0.7.38 and adds a release-history/version integrity guard.
- Standardizes the German guided journey on formal Sie/Ihr address.
- Leaves the 2026 application-level corpus intentionally empty until official Reveal Day publication.

## v0.7.38 — 2026-10-06
- Completes a 17-section × 4-language pre-Reveal layout sweep after the Strange Internet natural-height fix.
- Prevents the short Sources methodological-guardrails panel from stretching to the height of the full source inventory.
- Keeps the asymmetric two-panel comparisons in Geography and Contention at natural height instead of stretching the shorter panel.
- Keeps Economics model cards at natural height so the long historical private-contention model no longer inflates neighboring cards.
- Changes no research dataset, card content, navigation order, Explorer logic or mobile single-column behavior.


## v0.7.37 — 2026-10-06
- Reflows the institutional-oddities families in Strange Internet into a natural-height two-column masonry-style layout on desktop, eliminating artificial vertical stretching of short `.cs` and `.gb / .uk` cards.
- Preserves DOM reading order, single-column mobile rendering, all research data and all card content.
- Adds a release guard so the oddities layout cannot silently return to equal-height grid stretching.

## v0.7.36 — 2026-10-06
- Deduplicates Explorer card location metadata when the registry country and represented place resolve to the same localized label (the `.ai` / Anguilla case).
- Changes no research CSV, Explorer record, profile detail, application history, contention, controversy, outcome or IANA snapshot.
- Adds a regression guard so duplicate adjacent location labels cannot silently return.

## v0.7.35 — 2026-10-06
- Adds localized alternative text for the Open Graph and Twitter/X social preview image in all four languages.
- Aligns deployment documentation with the actual 99-file browser-upload ceiling and documents stale-file cleanup explicitly.
- Keeps `package-lock.json` aligned with `package.json` and strengthens release checks for social-image metadata and deployment ceiling wording.
- Changes no research CSV, Explorer record, application history, contention, controversy, outcome or IANA snapshot.

## v0.7.34 — 2026-10-06
- Adds a fact-only **In brief** layer to every Explorer profile so readers can understand current root status, manager, application history, contention and documented outcome causes before opening the deeper evidence sections.
- Reorders profile detail into a clearer sequence: summary, current status, origin, applications, researched context, cases, chronology, editorial reading, technical IANA data and sources.
- Cleans curated geography so generic TLDs no longer present an operational-country context as a place they “represent”; the represented-place field is shown only where that concept is meaningful.
- Expands `domain_governance_glossary.csv` to 28 terms in EN/IT/DE/FR and renders it visibly inside “How it works”, separating official ICANN/IANA terminology from three project-methodology concepts.
- Keeps all non-glossary research corpora and the 4 October IANA evidence snapshot unchanged.

## v0.7.33 — 2026-10-06
- Accessibility hardening only: preserves the v0.7.32 research corpus, content hierarchy, layout and resting visual design.
- Makes the Explorer drawer a stricter modal experience: background landmarks become `inert`, initial focus lands on the profile heading, focus remains trapped and returns to the invoking control.
- Corrects disclosure navigation semantics and makes `Escape` close an open disclosure while returning focus to its trigger.
- Replaces false keyboard “buttons” inside the SVG geography map with an equivalent screen-reader-only data list while retaining pointer tooltips visually.
- Adds table captions/column scopes, universal keyboard `:focus-visible` treatment and explicit nonvisual announcements for external links that open in a new tab.

## v0.7.32 — 2026-10-06
- Reframes the editorial layer from “Rejections & stops” to **Application outcomes**; Italian title: **Candidature che non ce l’hanno fatta** with the precise subtitle **Perché alcune stringhe candidate non sono mai entrate nella root DNS**.
- Makes the taxonomy explicit: outcome, contention and governance controversy are independent dimensions; one story has one primary editorial home and cross-links elsewhere.
- Adds `outcome_reason` and `outcome_source_url` to the historical application datasets. 2000 and 2004 retain their existing sourced outcomes; 2012 outcome fields are populated only for the source-backed cases in this frozen corpus and remain blank elsewhere rather than being inferred.
- Preserves the v0.7.30 universal pre-2026 application coverage and the v0.7.31 six-case editorial layer.
- Keeps the pre-Reveal 2026 corpus intentionally empty until official Reveal Day.

## v0.7.31 — 2026-10-05
- Separates formal application rejections/stops from governance controversies as a distinct editorial layer.
- Adds six sourced stop stories covering administrative return, voluntary withdrawal, proof-of-concept non-selection, Applicant Support eligibility, GAC/Board public-policy refusal, and high-risk DNS name collisions.
- Adds a 30 August 2013 Initial Evaluation snapshot to show why “not delegated”, “withdrawn” and “not approved” are not interchangeable statuses.
- Connects stop cases to the Explorer through a dedicated preset, badges and drawer cross-links while deliberately preventing overlap with the existing governance-dispute corpus.
- Keeps all 1,849 Explorer records and the complete pre-2026 formal application-string graph unchanged.
- Reduces the browser-upload publication archive from 100 to 99 files by excluding the build-time-only `data/research.json`; the source release retains it.

## v0.7.30 — 2026-10-05
- Completes the pre-2026 historical application-string universe in Explorer by vendoring all 1,930 2012 Reveal-Day string/applicant rows (1,409 distinct strings), including never-delegated strings.
- Adds a public sanitized `applications_2012.csv`; personal contact/e-mail fields and richer nonessential fields from the original 14-column transport are not republished.
- Keeps browser-time external research enrichment disabled and validates 2012 contention/IDN totals at build and release-check time.
- Documents ICANN's two initial non-exact 2012 string-similarity contention sets separately from the 230 exact-match sets.
- Keeps synthetic local 2012 record IDs internal so the UI never presents them as official ICANN application IDs.

# v0.7.29 — Pre-Reveal editorial consistency freeze

- Align the visible 2012 corpus description in all four languages with the frozen pre-Reveal runtime state: the full 2012 corpus is not fetched or merged before Reveal Day.
- Clarify that the sanitized 2012 CSV download is not included in the pre-Reveal freeze while official ICANN aggregate totals remain documented.
- Correct the Italian `non piu` typo to `non più`.
- Align current-state fallback/status copy and release metadata with the same freeze semantics.
- Add a regression invariant preventing the frozen build from reintroducing contradictory 2012 runtime wording.
- Keep research datasets, Explorer logic, navigation, walkthrough, layout and the 4 October IANA snapshot unchanged.

# v0.7.28 — Sticky navigation offset fix

- Include the sticky desktop section navigation in the shared navigation offset calculation, in addition to the sticky top bar.
- Prevent the first panel/title of every primary section from being hidden beneath the desktop menu after a menu click.
- Preserve the existing mobile sticky-select offset and in-section anchor behavior.
- Add a release invariant so future navigation changes cannot silently drop the desktop nav from the offset calculation.
- Keep all frozen research datasets and the 4 October IANA snapshot unchanged.

# v0.7.27 — Explorer filter repair

- Give every advanced Explorer filter a visible, compact field label and replace verbose per-field “All …” placeholders with one localized `All` option.
- Localize the formal IANA `test` TLD type instead of exposing the raw machine value.
- Add a deterministic editorial macro-topic facet to every Explorer record while preserving the original detailed research themes.
- Make the Explorer topic filter and visible topic pills use the universal macro-topic facet, so thematic filtering covers the complete indexed corpus.
- Keep the macro-topic taxonomy explicitly separate from official ICANN/IANA type, status, programme/round and registry-country fields.
- Keep the frozen IANA snapshot and pre-Reveal publication state unchanged.

# v0.7.26 — Home-only Internet walkthrough

- Move the seven-step “Behind a click” walkthrough structurally from the How section into Overview/Home.
- Hide the walkthrough completely whenever another primary section is active.
- Reset the walkthrough to step 1 when the reader leaves Home and later returns.
- Preserve direct links to `#internet-basics`, now resolving to the Overview section.
- Keep the deeper “How it works” material intact and make it the direct start of that section.
- Keep all frozen research datasets and the 4 October IANA snapshot unchanged.

# v0.7.25 — Pre-Reveal freeze hardening

- Disable browser-time retrieval and cached merging of external 2012 application archaeology during the pre-Reveal freeze.
- Disable browser-time ICANN gTLD contract-lifecycle enrichment until the controlled Reveal Day update.
- Keep external source URLs and locked ICANN totals documented without allowing them to change the frozen visitor experience.
- Generate the data-pack and release ZIPs deterministically with canonical ordering, timestamps, file modes and compression settings.
- Add release checks that reject any browser-time `fetch()` in the frozen app and verify the freeze metadata.
- Keep all frozen research CSVs and the 4 October IANA evidence snapshot unchanged.

# v0.7.24 — Navigation hardening

- Make every user-initiated primary-menu section change scroll to the start of the selected section on both desktop and mobile.
- Replace the JS-only brand button with a real home link and make its enhanced behavior return to the true top of the overview without being overridden by mobile section scrolling.
- Centralize offset-aware scrolling so sticky desktop/mobile navigation never hides the destination.
- Use delegated internal-section navigation so dynamically rendered links inherit the same behavior.
- Convert Explorer governance/economic/social cross-links and the publication stamp to in-app anchored navigation rather than unnecessary page reloads.
- Keep section-index anchors, direct hash restoration, browser history and explicit in-page anchors aligned with the same navigation model.
- Add navigation regression checks across desktop and mobile; frozen research datasets and the 4 October IANA snapshot remain unchanged.

# v0.7.23 — Teaching-first Internet walkthrough

- Reframe the seven-step walkthrough as one coherent story: URL → name → DNS hierarchy → IP → networks → HTTPS → page.
- Move the DNS root inside the hierarchy lesson instead of treating it as a standalone step.
- Add a dynamic “what the Internet is doing now” strip that makes each transformation explicit.
- Add one persistent “remember this” concept to every step, while keeping technical detail behind progressive disclosure.
- Replace the DNS branch picture with a sequential delegation trace: root → .com → authoritative DNS → illustrative IP.
- Add a dedicated URL-anatomy visual for the opening step and a final recap that reconnects all seven concepts.
- Keep the mobile lesson-first layout, explicit address focus and reduced-motion behavior introduced in the previous releases.
- Keep all frozen research datasets and the 4 October IANA snapshot unchanged.

# v0.7.22 — Dynamic guided-address focus

- Make the sample URL participate in the seven-step Internet walkthrough instead of leaving `.com` permanently highlighted.
- Step 1 highlights the readable host name; Step 2 reveals and highlights the normally invisible DNS root dot; Step 3 highlights `.com`.
- Step 4 moves emphasis to the resolved illustrative IP address; later steps move focus to the network path, `https://` and `/news` as the explanation progresses.
- Keep the visual emphasis semantically aligned with the lesson rather than forcing an unrelated URL segment to remain blue.
- Add non-colour emphasis and reduced-motion handling for the dynamic focus states.
- Keep the frozen research data and 4 October IANA snapshot unchanged.

# v0.7.21 — Automatic language entry

- Detect the visitor’s ordered browser language preferences only when entering through the root alias.
- Respect a language explicitly chosen by the visitor before browser detection.
- Preserve direct `/en/`, `/it/`, `/de/` and `/fr/` URLs without automatic language overrides.
- Normalize regional browser variants such as `it-CH`, `de-CH`, `fr-CH` and `en-GB` to the supported language routes.
- Fall back deterministically to English when no supported browser preference is available or a legacy `?lang=` value is invalid.
- Persist language only after an explicit selector or language-link choice; merely opening a localized URL does not rewrite the visitor’s saved preference.
- Use no IP geolocation or location permission for language selection.
- Keep the frozen research data and 4 October IANA snapshot unchanged.

# v0.7.20 — Navigation terminology clarity

- Rename the Italian navigation label `Contese` to `Stringhe contese` so it explicitly refers to competition between applications for the same TLD string.
- Rename the Italian navigation label `Dispute` to `Controversie` so governance, legal and community conflicts are clearly separated from contention sets.
- Keep section structure, URLs, data, filters and research datasets unchanged.
- Keep the frozen 4 October IANA snapshot and pre-Reveal publication state unchanged.

# v0.7.19 — Mobile guided-journey hardening

- Rework the guided Internet walkthrough for phone-sized viewports so the lesson, controls and diagrams remain width-bounded.
- Put the active textual explanation before the visualization on mobile, avoiding the previous diagram-first experience that pushed the lesson below the fold.
- Reflow the DNS chain and browser/network/server path on very narrow screens instead of compressing them into fragile horizontal layouts.
- Make the sample URL, stepper and navigation controls explicitly shrink-safe and wrap-safe.
- Keep the active lesson in view after Next, Back, restart or direct-step navigation, while respecting reduced-motion preferences.
- Add release-level regression checks for the mobile journey contract.
- Keep the frozen research data and 4 October IANA snapshot unchanged.

# v0.7.18 — Release integrity & reader-experience hardening

- Derive the visible publication snapshot and Reveal timestamp from `data/publication.js` instead of duplicating dates in four translation dictionaries.
- Keep 2012 runtime archaeology separate from full-corpus completeness; application counts are now derived from per-round metadata rather than hard-coded 57 / 1,987 constants.
- Compare like with like across rounds: 2026 now shows 1,663 submitted applications in the historical round chart, while the separate 2026 status panel retains 1,616 paid applications proceeding.
- Mark private contention settlement as a historical 2012 mechanism and explicitly state that private resolution is prohibited in the 2026 round.
- Correct the root-server instance observation date to the source state of 12 September 2026.
- Harden static rendering, structured metadata, package/version parity, deployment documentation and release checks.
- Separate the browser-upload publication archive from the reproducible source archive.
- Add a plain-language entry path for readers who do not already know what a TLD is, with immediate routes to the guided Internet explainer and the TLD Explorer.
- Make the Explorer search-first: common search and quick presets stay visible, while advanced filters and corpus/provenance detail move behind progressive disclosure.
- Simplify navigation labels and specialist copy without removing expert-level content or source detail.
- Add a keyboard skip link, larger mobile/touch targets, text-safe accent colours, clearer focus/accessibility semantics and unambiguous copy/external-link iconography.

# v0.7.17 — Final audit hardening

- Correct current ISO country-code normalization for France (FR), Burkina Faso (BF), Benin (BJ), Serbia (RS) and Timor-Leste (TL) across registry, administrative and technical geography fields.
- Align the publication-level editorial snapshot to 4 October 2026 while preserving observation-specific dates such as the 2 October .lugano applicant disclosure.
- Clarify that the archived 2012 Reveal Day transport includes Primary Contact and Email; both are discarded during parsing before the research dataset is constructed and are never exposed or exported.
- Add a release-level self-check so the browser-upload bundle no longer advertises validator commands that are absent from the package.
- Correct stale release documentation discovered by the final audit.

# v0.7.16 — The Social Life of the Dot

- adds a structured social layer with nine source-backed cases and six analytical models;
- links language, cultural, civic, identity, community, safety and script-inclusion cases directly to Explorer records;
- adds `SOCIAL CASE` badges, a Social preset and social meaning panels inside relevant TLD profiles;
- adds `social_cases.json` and `social_cases.csv` to the reusable data layer;
- expands the publication narrative with a fifth question: who belongs after the dot?;
- explicitly separates documented community rules (FACT) from broader social interpretation (READING), and never treats registration volume as a proxy for social significance.

# v0.7.15 — Economics of the Dot

- adds a structured economics layer with eight distinct mechanisms and source-backed metrics;
- links `.ai`, `.tv`, `.io`, `.ac`, `.sh`, `.com`, `.net`, `.org`, `.web`, `.shop` and `.app` to economic cases in the Explorer;
- keeps public revenue, company results, transaction values, auction prices and application fees explicitly non-comparable;
- adds `economic_cases.csv` and `economic_metrics.csv` to the reusable data layer;
- expands the page narrative from history and governance to the financial incentives and rents created around the DNS root.

## v0.7.14 — Governance Cases + Disputed Dots

- Add nine source-backed governance cases connecting application history to disputes that shaped ICANN decision-making.
- Link relevant dispute cases directly into Explorer records while preserving FACT / READING separation.
- Add structured case timelines, mechanisms, outcomes and primary-source references.
- Export `governance_cases.csv` and `governance_case_events.csv` as reusable research datasets.
- Reframe the site narrative around who decides, who operates and what happens when claims to a string collide.

## v0.7.13 — TLD Life Histories

- Add a chronological life-history layer across the complete Explorer corpus.
- Generate dated events from formal applications, IANA registration data and IANA delegation/transfer/revocation reports.
- Add ICANN gTLD Registry Agreement lifecycle runtime enrichment: Application ID, contract signature, delegation, termination and root removal.
- Keep ccTLD history on the IANA delegation/redelegation model rather than applying gTLD contracts.
- Export `tld_life_histories.csv` and record lifecycle coverage in the manifest.
- Leave missing historical phases missing rather than inferred.

## 0.7.12 · 4 October 2026

- Add complete, submission-level Application Archaeology for the 2000 proof-of-concept round: 47 submissions, 223 formal Item E2 string links and 188 distinct Item E2 strings, plus separately labelled SITA alternatives `.aer` and `.aero`.
- Add the complete 2004 sponsored-TLD round: 10 submissions for 9 strings, preserving the two independent `.tel` proposals.
- Add the complete 2012 Reveal Day corpus architecture: 1,930 applications for 1,409 distinct strings, validated before merge against ICANN's locked IDN, geographic, community and regional totals.
- Keep applications, applied-for strings and delegated TLD identity separate; never-delegated strings become explicit `application-only` Explorer records rather than pretend TLDs.
- Exclude 2012 Primary Contact and Email fields from the research dataset; retain only application metadata needed for historical analysis.
- Extend Explorer search, round filtering, record drawers and CSV exports to expose cross-round application history while preserving each TLD's introduction path.
- The 2000 and 2004 corpora are vendored with the publication. The 2012 Reveal Day snapshot is fetched from a preserved archival copy, sanitized, checked against ICANN totals and cached locally before it is merged; a failed validation is rejected rather than partially displayed.

## 0.7.11 · 4 October 2026

- Universal Explorer origin model for every record.
- Separate `programRound`, `introductionPath`, `introductionBasis`, and field-level introduction sources.
- Added historical `.zr` retirement evidence and the retired `.nato` root TLD.
- Search, filters and Explorer CSV now expose origin/program metadata.
- Complete TLD/profile coverage is declared separately from the cross-round application corpus.
- Export a 1,599-record `tld_universe.csv` plus a separate 9-record curated, non-exhaustive `application_only_strings.csv`.

## 0.7.10 · 4 October 2026

- Localize regional map and chart labels; expose selected map modes and Explorer presets to assistive technology.
- Add stable, language-preserving profile links and sharing, including ASCII/Unicode names, browser history and unknown-link handling.
- Add public correction drafts on GitHub from Sources, the footer and individual profiles.
- Preserve all research data, CSVs and IANA evidence; extend navigation and deferred-loading regression checks.

## 0.7.3 · 3 October 2026

- Generate complete static English, Italian, German and French pages at `/en/`, `/it/`, `/de/` and `/fr/` from the actual application runtime.
- Emit self-referencing canonicals, reciprocal static hreflang and sitemap alternates, localized social metadata and article/dataset structured data.
- Preserve legacy root and `?lang=…` links through early routing; carry tabs, search, filters, map mode and fragments between language pages.
- Make page language follow its URL; stop mutating canonical or social metadata during browser interaction.
- Add crawlable language links, anchor navigation and readable content with JavaScript disabled.
- Rebase shared assets and downloads for language directories and embed only the page's own complete translation dictionary.
- Add a pinned build-time DOM dependency, reproducible lockfile and multilingual content/metadata/link/routing checks. Mark the source template noindex and generated pages indexable.
- Preserve the v0.7.2 factual corrections and the 2 October pre-Reveal research snapshot.

## 0.7.2 · 3 October 2026

- Remove the bare-root sitemap duplicate; align static `x-default` and Open Graph URL with `?lang=en` and refresh sitemap modification dates.
- Use ICANN 2012 Program Statistics as the direct source for 66 geographic applications and 53 historical geographic delegations.
- Add direct root-servers.org and ICANN August 2026 RSP Program Statistics source chips to the root/RSP panel.
- Replace the Anguilla budget URL with the official `gov.ai` copy, preserving the EC$253.6M budget-estimate qualification.
- Clarify preliminary identical-string contention sets consistently in EN, IT, DE, FR and `round_2026.csv`; link to the ICANN Reveal Day FAQ.
- Normalize verified ICANN English/public source URLs and deduplicate the source list.
- Record the release date separately from the unchanged 2 October pre-Reveal data snapshot; rebuild the embedded runtime, manifest and data pack.

## 0.7.1 · 2 October 2026

- Corrected the 2026 application-type model to follow ICANN terminology directly: General, Geographic Name, Reserved Name, Community, .Brand, IDN, Variant string, Government/IGO and Applicant Support. Historical TLDs are no longer displayed as if they were 2026 examples.
- Rebuilt the domain lifecycle so expiration is not shown as automatic deletion: renewal remains a loop; registrar deletion of applicable gTLD registrations leads to a 30-day redemptionPeriod, followed by five days of pendingDelete before purge and possible re-registration.
- Separated PTI/IANA as **Root Zone Manager** from Verisign as **Root Zone Maintainer**, using IANA's published role definitions.
- Scoped ICANN registrar accreditation explicitly to gTLDs and noted that ccTLDs use their own registry/registrar models.
- Updated the Anguilla `.ai` case from the 2025 projection to the Government's 2026 **EC$253.6 million Domain Name Registration budget estimate**, still labelled as an estimate rather than realized revenue.
- Changed the pre-Reveal `.lugano` city-timeline label from application to **applicant disclosure**.
- Added a direct ICANN source beside the control-levers panel for the statement that ICANN does not control Internet content or act as a general website-takedown authority.
- Tightened CAA wording to describe publication of authorized certificate authorities.
- Localized the city-TLD timeline accessibility label.
- Added build validation for release-version consistency, complete 2026 application-type coverage and lifecycle state separation.

## 0.7.0 · 2 October 2026

- Added **What is a dot?**, an eight-dimension conceptual map spanning address, contract, market, jurisdiction, identity, trust, culture and politics.
- Expanded **How it works** with domain-registration lifecycle, economics/value flow, application/access models and a layer-by-layer control-lever map.
- Expanded **Beyond the domain** with invisible DNS functions, IDNs / Universal Acceptance, special-use names and alternative naming systems.
- Added `.ai` as a **digital natural resource** case, with Anguilla's EC$132 million 2025 `.ai` revenue figure clearly labelled as an official budget projection.
- Added a **closed generics** public-interest case to the contention chapter.
- Added a seven-dimension **TLD success framework** to Methodology so success is not reduced to registration volume.
- Added six reusable CSV datasets: `namespace_dimensions.csv`, `dns_capabilities.csv`, `domain_lifecycle.csv`, `tld_models.csv`, `control_levers.csv`, and `success_framework.csv`.
- Extended source documentation with ICANN/IANA, RFC, Anguilla Government, .BANK, ENS and Handshake primary sources.
- Preserved the existing top-level navigation; new material is integrated into current chapters rather than adding menu clutter.

## 0.6.11 · 2 October 2026

- Expanded **Strange Internet** from semantic drift into institutional DNS archaeology.
- Added five anomaly families: geopolitical ghosts, never-delegated codes, historical exceptions, unusual territories, and supranational / multi-script ccTLDs.
- Added `.su`, `.yu`, `.an`, `.tp`, `.cs`, `.gb`, `.uk`, `.aq`, `.bv`, `.sj`, `.eu`, `.ею` and `.ευ` to the curated Explorer corpus with historical status/event context.
- Added `data/dns_oddities.csv`, primary-source citations and a downloadable dataset card.
- Added compact section navigation labels for the expanded Strange Internet chapter.

## 0.6.10 — 2026-10-02
- Added a **semantic drift** chapter inside Strange Internet: ccTLDs that kept their formal geographic meaning while acquiring a second global cultural meaning.
- Added documented cases for `.io`, `.ai`, `.tv`, `.me`, `.co` and `.fm`, with primary IANA and registry sources.
- Added `semantic_drift.csv` to the public data pack.
- Added the same cases to the Namespace Explorer while preserving their formal `country-code` classification.
- Added a closing READING connecting formal namespace governance with meaning that emerges through real-world use.
- Added EN/IT/DE/FR copy and responsive card layout for the new section.

## 0.6.9 — 2026-10-02
- Shortened the in-section navigation labels in **How it works** across EN/IT/DE/FR.
- Full explanatory section titles remain unchanged in the content.
- Kept the mobile section navigation horizontally scrollable while preventing labels from wrapping or being clipped internally.

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
