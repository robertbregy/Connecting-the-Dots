# Connecting the Dots — v0.7.31


## v0.7.32 — Application outcomes as a separate factual dimension

The former “Rejections & stops” layer is now presented as **Application outcomes**. The editorial rule is strict: **contention** describes competition for the same string; **controversy** describes conflict over rights, legitimacy, public interest or control; **outcome** describes why an application did not reach the DNS root. A story has one primary editorial home even when more than one dimension applies.

The historical application datasets now carry `outcome` and `outcome_reason` as separate fields, plus `outcome_source_url` where available. Blank outcome fields mean **not documented in this frozen local corpus**, not success and not failure. No final 2012 application result is inferred from present-day root status.

## v0.7.31 — Rejections & stops as a separate layer

The publication now distinguishes **governance controversies** from **formal application stops**. A dispute asks who has rights, legitimacy or public-interest authority over a string; a stop asks why an application could not or chose not to continue. The new layer uses six sourced cases to distinguish administrative return, withdrawal, proof-of-concept non-selection, Applicant Support eligibility, public-policy refusal and technical-safety blocking. Cases already told as governance disputes are deliberately not duplicated.

The Explorer exposes these cases through a dedicated preset and drawer cross-links. The underlying universal corpus is unchanged at 1,849 Explorer identities: the new material is an interpretive/evidentiary layer, not a new claim of additional TLD or application coverage.

For browser upload, `PUBBLICAZIONE.zip` is capped at **99 files**. The build-time-only `data/research.json` remains in SOURCE/COMPLETO but is omitted from the deployment archive because the browser consumes the compiled bundles instead.


## v0.7.30 — Universal historical application archive

The Explorer now vendors the complete formal ICANN application-string/applicant graph for the 2000, 2004 and 2012 rounds. The 2012 layer contains all 1,930 Reveal Day applications across 1,409 distinct applied-for strings, including strings that were never delegated, plus all four later ICANN-approved string corrections. ICANN's two initial non-exact string-similarity contention sets (`.hoteis`/`.hotels` and `.unicom`/`.unicorn`) are documented separately from the 230 exact-match contested strings. The public `applications_2012.csv` deliberately excludes personal contact and email fields from the richer historical transport. Synthetic project record IDs remain internal and are never presented as official ICANN application IDs. No visitor-browser research fetch is used; the 2026 individual application layer remains intentionally incomplete until official Reveal Day publication.

This release therefore separates three concepts explicitly: the current IANA root, the broader historical TLD universe, and the complete pre-2026 formal application-string archive.
## Publication model

The project is deliberately structured for the **post-Reveal publication**. Values that cannot yet be known before Reveal Day remain explicitly marked as pre-Reveal or unavailable. The page architecture does not need to change after Reveal Day: official ICANN public application data can populate the prepared fields, tables, maps and comparisons.

The 2026 layer is designed to hold applications, unique strings, applicant organizations, countries and territories, application types, geographic/community/.Brand applications, IDN/variant information, contention sets, applicant concentration and an application-level normalized dataset.

`data/publication.js` is the single state declaration for the publication (`pre-reveal`, as-of date and Reveal timestamp). Time-sensitive presentation should derive from that state rather than from scattered hard-coded copy.

## Namespace Explorer

The search experience lives in a dedicated **Explore** section. The publication target is a navigable corpus spanning the active IANA root plus the 2000, 2004, 2012 and 2026 application rounds.

The Explorer separates two concepts that must not be conflated:

- `explorer_catalog.csv` is the **latest indexed view** for each string.
- `explorer_events.csv` is the **event history** for strings that appeared in multiple rounds or moved through materially different states.

This matters for strings such as `.nyc`, `.cat` and `.post`: an old application, a later application and eventual delegation are distinct events, not one record whose fields should overwrite one another. The Explorer drawer exposes that history where it is informative.

The frozen Explorer core imports every individual profile in the dated IANA Root Zone Database and indexes every label in the corresponding root list. Profiles expose available registry details, contact organizations, dates, name servers and report links. The curated subset adds documented context and historical events. All labels are searchable in Unicode and ASCII; registry countries and technical names are searchable as well. Historical round fields apply where documented; the Explorer macro-topic facet is an editorial navigation index generated for every record and is explicitly separate from official ICANN/IANA fields. City and other research-specific classifications remain limited to documented records. Individual 2026 application data remains pending official publication.


## TLD Life Histories

v0.7.13 adds a chronological evidence layer to every Explorer profile. The timeline combines formal application records, IANA registration dates, IANA delegation/transfer/revocation reports, the current root-zone state and curated preserved evidence. The ICANN gTLD contract-lifecycle feed (`https://www.icann.org/resources/registries/gtlds/v2/gtlds.json`) remains documented as a maintenance source, but browser-time retrieval is disabled in the pre-Reveal freeze. For ccTLDs, the project uses IANA delegation/redelegation evidence instead of applying the gTLD contract model.

The word “complete” is scoped to each declared corpus. The frozen local chronology represents the dated events exposed by the preserved release sources; missing historical phases remain explicitly missing. During the pre-Reveal freeze no browser-time lifecycle data is fetched or merged, so all visitors see the same chronology. Some early operator changes predate modern structured records and are therefore not reconstructed without a source.

`data/tld_life_histories.csv` exports the locally preserved chronology. The current ICANN contract feed is intentionally not queried by the frozen publication; it is reserved for a controlled post-freeze update.

## `.lugano` provenance before Reveal Day

Before 7 October 2026, ICANN has published the aggregate number of applications proceeding in the round but not the individual strings and applicants. The existence of the `.lugano` application is therefore labelled in the publication as an **applicant disclosure**, dated 2 October 2026. Once the official individual record is available after Reveal Day, the provenance can be replaced by the ICANN application record.

## Geography of power

The Geography section does not reduce Internet power to a headquarters pin. It separates rules/policy, root coordination, registry contracts, technical backend and applicant demand.

It also distinguishes different forms of concentration. Identity Digital illustrates portfolio breadth across many TLDs; Verisign illustrates registration depth under `.com` and `.net` and holds important operational root roles. None of these measures is treated as equivalent to control of ICANN policy.

Applicant geography maps the public primary business location of applying organizations. The RSP layer maps evaluated technical supply only: the RSP selected by a 2026 applicant is not a public application field.

## Editorial grammar

**FACT / READING / VISION** are kept separate from project status. Facts are source-verifiable; readings are analytical interpretations; vision is reserved for future scenarios, principally the possible evolution of `.lugano`.

The compact city timeline also preserves event type explicitly: **idea**, **application**, **delegation/launch**. This prevents visually similar milestones from being mistaken for equivalent legal or operational states.

## Data pack

The public download is a ZIP containing the application-level and aggregate 2026 data scaffolds, supporting CSV datasets, sources and methodology material. Before Reveal Day, `applications_2026.csv` is deliberately header-only: there is no synthetic placeholder record that could be mistaken for an observation.

`data/manifest.json` records the snapshot state, record counts and SHA-256 hashes. `rounds_summary.csv` carries explicit **As of** dates for figures that continue to change. The pack also contains a licensing notice clarifying the distinction between original project material and third-party source data.

## Metadata and discovery

The publication has four static language entry points:

| Language | Canonical URL |
| --- | --- |
| English | https://robertbregy.github.io/Connecting-the-Dots/en/ |
| Italiano | https://robertbregy.github.io/Connecting-the-Dots/it/ |
| Deutsch | https://robertbregy.github.io/Connecting-the-Dots/de/ |
| Français | https://robertbregy.github.io/Connecting-the-Dots/fr/ |

Each page contains its translated editorial text, generated tables, cards and maps before JavaScript runs, plus a self-referencing canonical, reciprocal static `hreflang` annotations, localized Open Graph/Twitter metadata and article structured data. The sitemap lists the four canonical pages and includes the same language alternates; `x-default` points to English.

The root remains an English fallback with canonical `/en/`. Its compatibility script forwards existing root and `?lang=…` links to the corresponding language path while preserving section, search, filters, map and fragment. Language selection navigates to another static page and carries the current view. Explicit language URLs remain stable regardless of browser locale or previously stored preferences.

The site is readable with JavaScript disabled: sections are visible, navigation uses anchor links and language links are ordinary hyperlinks. JavaScript enhances the page with tabs, search, maps, drawers, themes and sharing. The source template is marked `noindex`; generated publication pages are explicitly indexable.

Build-time rendering uses the same application and translation sources as the browser. Each generated page embeds only its own complete translation dictionary. Shared images and downloads resolve to the project root from every language directory.

## Deployment resilience

The root alias and each localized `index.html` contain prerendered editorial content and their own translation dictionary. From v0.7.8, CSS, application code, the map and a compact search index are shared, versioned assets. Full Explorer profiles load only when opened, in eight reusable batches. All four languages use the same records and cached resources.

Publish the **PUBBLICAZIONE archive** together, including `assets/`, `data/site_bundle.js` and all eight `data/explorer_profiles_*.js` files. The build checks their paths, versions and record parity; `data/manifest.json` records their sizes and hashes. If a profile request fails, the drawer offers retry, the original source where available and the complete data download. Prerendered text remains readable when JavaScript is unavailable.

The visual logo remains an ordinary external asset (`assets/logo-mark.png`) rather than being embedded repeatedly as base64. CSV and ZIP research assets also remain external for download and reproducibility. A missing image therefore cannot break the publication runtime.

`src/index.web.html` is the HTML source template. `build.py` compiles the runtime sources, prerenders all four languages and the compatible root alias, regenerates the sitemap and validates the data state, static content, language metadata, local links and legacy routing.

## Build and run locally

For ordinary viewing, no build step is required after downloading a release: serve the repository root over HTTP.

```bash
python3 -m http.server 8000
```

Open `http://127.0.0.1:8000/`.

When changing source code or data, rebuild the deployable artifact with:

```bash
python3 build.py
```

The build regenerates runtime bundles, deferred profile batches, Explorer CSV views, `data/manifest.json`, the downloadable data pack and all static language pages.

## GitHub Pages

Publish the repository root from the `main` branch. No server-side build step is required on GitHub Pages because the generated `index.html` is committed with the release.

Public URL: https://robertbregy.github.io/Connecting-the-Dots/

Recommended repository metadata:

- Description: `An interactive research publication on TLDs, Internet governance and the 2026 ICANN round`
- Website: `https://robertbregy.github.io/Connecting-the-Dots/`
- Topics: `icann`, `dns`, `tld`, `internet-governance`, `data-visualization`, `digital-identity`, `cities`

## Licensing

Code authored for this repository is released under the **MIT License**. Original editorial content, original project visuals and original compilation/schema work are made available under **CC BY 4.0** to the extent applicable. Third-party data, quoted material, trademarks and source material remain subject to their respective rights and source terms. See `LICENSE` and `CONTENT_LICENSE.md`.


## Build the static language pages

The release ZIP includes all generated pages; publication does not require a build.
To rebuild from source, use Node.js 18 or newer and Python 3:

```sh
npm ci
python3 build.py
```

`npm run check` rechecks the generated multilingual pages, legacy routes, preserved evidence, CSV parity and deferred-profile delivery.
`linkedom` is a pinned development dependency used only while building and checking the project. The deployed site has no Node.js or DOM-library dependency.

## v0.7.3 · static multilingual publication

This release implements the language architecture independently of the post-Reveal dataset update. It preserves the v0.7.2 source corrections, research content and 2 October pre-Reveal data snapshot.

## v0.7.2 · final source and metadata hardening

This patch preserves the narrative, the four-language interface and the 2 October pre-Reveal data snapshot. The release date is 3 October 2026 and is recorded separately from the data snapshot date.

- Remove the duplicate bare-root URL from the sitemap and align `x-default` and the static Open Graph URL with the English canonical.
- Cite ICANN 2012 Program Statistics directly for the 66 geographic applications and 53 historical geographic delegations.
- Add direct Root Server Technical Operations Association and ICANN August 2026 RSP statistics links beside the root/RSP figures.
- Use the Government of Anguilla `gov.ai` copy of the 2026 budget estimates. The EC$253.6 million value remains a budget estimate.
- Specify preliminary contention sets for identical strings in EN/IT/DE/FR and in the downloadable 2026 scaffold.
- Normalize the verified ICANN source URLs and remove duplicate entries from the source list.

## v0.7.1 · pre-publication factual hardening

v0.7.1 is a corrective pre-publication pass over the v0.7.0 framework. It keeps the information architecture unchanged and tightens factual classification, lifecycle modelling, root-zone roles, registrar scope, provenance and current economic data.

- **Overview — What is a dot?** Eight dimensions connect the same label to address, contract, market, jurisdiction, identity, trust boundary, cultural sign and political object.
- **How it works — lifecycle, economics and control.** The registration lifecycle now distinguishes expiration from deletion, shows the renewal loop, the 30-day redemptionPeriod triggered by deletion for applicable gTLDs, the subsequent five-day pendingDelete state, and eventual re-availability. The roles of PTI/IANA and Verisign are separated as Root Zone Manager and Root Zone Maintainer, and ICANN registrar accreditation is explicitly scoped to gTLDs.
- **Beyond the domain — the invisible DNS.** MX, SPF/DKIM/DMARC, CAA, DNSSEC, SRV and SVCB/HTTPS show that DNS already carries routing, discovery, authentication and trust-related functions beyond simple web naming. The chapter also adds IDNs / Universal Acceptance and distinguishes the public DNS root from special-use names and alternative naming systems.
- **Geography — a digital natural resource.** `.ai` is used as a documented case of a country-code namespace whose global semantic value can become economically significant for a small territory. The displayed EC$253.6 million figure is the Government of Anguilla **2026 budget estimate for Domain Name Registration**, not realized revenue.
- **Application models — no historical TLDs masquerading as 2026 examples.** The 2026 model now follows ICANN’s application designations directly: General, Geographic Name, Reserved Name, Community, .Brand, IDN, Variant string, Government/IGO and Applicant Support. Historical TLD examples remain in their historical chapters.
- **Contention — who gets to control a word?** Closed generic strings are introduced as a separate public-interest governance question rather than being folded into ordinary contention.
- **Methodology — what makes a TLD successful?** A seven-dimension framework avoids reducing success to registration volume alone: scale, active use, renewal, trust/abuse, diversity, purpose fulfilment and public value.

New reusable datasets are exported in `data/namespace_dimensions.csv`, `data/dns_capabilities.csv`, `data/domain_lifecycle.csv`, `data/tld_models.csv`, `data/control_levers.csv` and `data/success_framework.csv`.

## v0.6.11 institutional-DNS archaeology

**Strange Internet** now adds a second layer beyond semantic drift: institutional and geopolitical anomalies preserved by the DNS. The new `data/dns_oddities.csv` covers active legacy codes, retired ccTLDs, a country code that was never delegated, the `.gb` / `.uk` historical exception, unusual territories such as Antarctica / Bouvet / Svalbard & Jan Mayen, and the European Union across Latin, Cyrillic and Greek top-level forms.

These cases are also surfaced in the Namespace Explorer with explicit historical status and event context.

## v0.6.10 semantic-drift pass

The **Strange Internet** section now includes a documented semantic-drift layer for country-code TLDs whose formal geographic designation remained unchanged while global usage attached a second cultural meaning. The initial set covers `.io`, `.ai`, `.tv`, `.me`, `.co` and `.fm`.

The section keeps the distinction explicit: **formal status is a FACT; the broader cultural meaning is documented through registry positioning and interpreted as READING**. The same cases are exported in `data/semantic_drift.csv` and surfaced in the Namespace Explorer without changing their formal `country-code` type.

## v0.6.9 precision pass

- Explorer now distinguishes the latest indexed state from historical events for the same string.
- `.cat` and `.post` are restored to the 2004 sponsored round in the latest indexed view; `.nyc` retains its distinct 2000, 2012 and 2014 events.
- `.lugano` pre-Reveal provenance is explicitly an applicant disclosure, not an ICANN individual-string confirmation.
- The French/medium-width layout is hardened with earlier KPI and mobile-navigation breakpoints and right-aligned edge dropdowns.
- City milestones carry explicit event types.
- Source rendering is deduplicated by URL.
- Changing aggregate figures carry explicit snapshot dates in the public datasets.
- Disclosure navigation uses ordinary accessible navigation semantics rather than an incomplete ARIA menu pattern.
- Explorer record activation uses real buttons.
- The logo is no longer embedded three times in the generated HTML.

## v0.7.4 · factual and navigation corrections

Release: 4 October 2026. Correct current Explorer state against preserved IANA evidence while retaining historical applications. Separate formal TLD type from editorial designation, legal registry from represented place, and technical contact from contractual RSP. Correct the two historical uses of CS.

URL state is restored as a whole on initial load, language change, browser Back/Forward and hash navigation. Navigation links are shareable ordinary links and internal headings update the fragment. Dynamic result counts and active navigation expose accessible state; light/dark semantic badge contrast is strengthened.

The data ZIP contains CSV, manifest, normalized IANA evidence, README and content licence. No Excel workbook is promised. Before Reveal Day, individual 2026 application observations remain unavailable.

SEO: submit `sitemap.xml` in Search Console for the project URL. A project-directory `robots.txt` is not the origin-root robots file; any origin-level configuration must be made in the user Pages repository. This release keeps self-contained language pages to retain deployment resilience. Shared-asset performance optimization remains a separate future change.


## v0.7.5 · historical provenance and complete release

Release: 4 October 2026. IANA registration events assert only the recorded date, without projecting the current registry organization, country or type into the past. Dated primary sources document the .ORG transition to PIR, the .HEALTH transfer report and the 2012 .HEALTH / .KIDS applications. Unsupported synthetic delegation milestones are removed; application rounds are never inferred from registration dates. .POST remains a 2004-round TLD, despite its later registration.

Chronologies are sorted, historical rounds are displayed together, places and periods are localized, and the IANA date label is generated from the same snapshot as the data. Regression checks cover all four languages, filters, URL restoration, provenance and CSV/runtime consistency.

The PUBBLICAZIONE archive contains the generated site payload in at most 100 files. The SOURCE archive is separate and contains the synchronized build sources, lockfile and deployment documentation. The 78 raw IANA evidence files are preserved byte-for-byte in `data/evidence/iana-snapshot-2026-10-04.json.gz`; validation reads that archive directly. They must not be expanded before a GitHub browser upload. Both the full release and downloadable data pack include the archive. For publication, upload the release contents to the repository root without expanding the evidence archive.

To rebuild and package a release:

```bash
npm ci
python3 build.py
python3 scripts/package_release.py --kind deploy
python3 scripts/package_release.py --kind source
```

The deploy command writes the ≤100-file PUBBLICAZIONE ZIP for a GitHub browser upload. The source command writes a complete reproducible SOURCE ZIP and is not constrained by the browser-upload file limit.


## v0.7.6 · guided reading, complete root index and canonical sources

The homepage introduces three questions: who decides, who operates, and what changes. Round metrics are in the 2026 chapter; the namespace framework is in the explanatory chapter. Existing navigation and language routes remain available.

The Explorer contains **1,450 records**: all **1,437 labels** in the dated IANA root list plus **13 historical or application records** outside that list. **87 records** have curated context and history; the rest have clearly labelled basic records. Root-list membership is separate from the indexed lifecycle state: `.gb` appears in the list but is labelled reserved. No application round, country, technical provider or operator history is inferred for basic records.

The author’s involvement in .lugano is disclosed in the case study and methodology. Public evidence questions concern utility, adoption, accountable rules and interoperability. They introduce no municipal targets, internal financial assessments or commitments on behalf of the City.

### Canonical build inputs

- `data/research.json`: research datasets, source references and editorial data.
- `data/explorer_curated.json`: explicit historical rounds, classifications and sourced events. Current registry details are not copied into historical events.
- `data/iana_snapshot.json` and its compressed evidence archive: dated IANA root list, Root Zone Database and all individual profiles.
- `data/translations.json`: the complete EN, IT, DE and FR dictionaries.
- `scripts/assemble_data.js`: one assembly step merges current root membership with curated history by ASCII DNS label. The build no longer executes the 29 former version-patch files.

No network request occurs during a build. The evidence archive is checked before import. Regression checks validate every root-list identity, formal type and manager in basic records; separate curated histories; Unicode/ASCII searches; filters; navigation; CSV parity; and all language pages. Packages remain below the 100-file browser-upload limit.

### Focus for independent editorial review

This release has automated checks; these are not an independent subject-matter review. A reviewer should examine these specific claims and their linked sources:

1. Root membership, reserved status and the distinction between IANA registration and historical operation, especially `.gb`, `.org`, `.health`, `.post` and `.cs`.
2. Round totals and 2012/2026 comparisons: applications, unique strings and contention sets are different units; 2026 application-level observations remain unpublished in this snapshot.
3. Concentration claims: TLD portfolio breadth, domain-registration volume and contractual/technical roles are separate measures.
4. Trust examples such as `.bank`, `.gov` and `.pharmacy`: published eligibility or security rules do not by themselves demonstrate every user outcome.
5. The .lugano case: applicant disclosure, prospective editorial scenarios and official City decisions must remain distinct.

For a later 2026 import, preserve the official source and publication date first, reconcile identities and status fields, then update the canonical datasets and publication state together. Do not remove the pre-Reveal gate merely to display unsourced records. The final mapping must be checked against the actual official release schema.

## v0.7.7 · complete IANA profiles

The Explorer contains **1,606 entries**: all **1,595 profiles** in the preserved IANA Root Zone Database, plus **11 selected historical/application entries** absent from that database. All **1,437 names** in the dated root list are included. The 87 curated records retain their distinct editorial context and sourced history.

Each IANA profile exposes available registry and contact organizations, localized countries, registration and update dates, retrieval date, registry website, WHOIS/RDAP, name servers with IP addresses, and linked IANA reports. Personal contact names, email addresses, telephone numbers and street addresses are not replicated in the interface; the official source remains available. Missing source fields remain unreported. A country is the country of the named organization, not an inferred geographic designation of the TLD.

Search supports Unicode/ASCII names, organizations, countries and name-server names. A registry-country filter and in-root/outside-root presets complement the existing status and formal-type filters. Round, theme and city classifications remain limited to the researched subset. An absent root entry is not automatically classified as never delegated; IANA report dates are not automatically transfer-effective dates.

The data pack adds `explorer_nameservers.csv` and `explorer_iana_reports.csv`. The normalized snapshot and compressed archive preserve all **1,597 source files**, including the root list and database index, with individual retrieval timestamps and SHA-256 hashes. Ordinary builds remain entirely offline. In v0.7.25 the frozen publication also performs no browser-time external research fetches, so the displayed corpus cannot drift between visitors before Reveal Day.

### Updating the IANA snapshot

Python 3 (standard library only) and the project's existing Node dependencies are sufficient:

```bash
npm ci
python3 scripts/fetch_iana.py --refresh
node scripts/normalize_iana.js
```

Review the normalization results, update the release version and date in `package.json`, `package-lock.json`, `build.py` and `data/publication.js`, then add a dated entry in `data/release_history.json` with the snapshot's `asOf` and `archive_sha256`. Add its summary key to all four dictionaries in `data/translations.json`. The latest history entry must match the release and preserved evidence; the build rejects a mismatch. Then run:

```bash
python3 build.py
python3 scripts/package_release.py
```

The first command to fetch with `--refresh` obtains a new root list, database index and all linked profiles. After an interruption, rerun **without** `--refresh` to resume verified cached downloads. The fetcher uses a bounded worker pool and records failures; normalization refuses incomplete profiles or unrecognized country fields. Inspect `data/evidence/iana/normalization-review.json` for source variations before rebuilding. Its contact-organization entries are extraction review material, not failures. A blank organization slot must never become a street address.

The expanded `data/evidence/iana/` cache is for local maintenance only. The release packager excludes it and ships the compressed, hash-verified evidence archive. Keep that archive compressed for GitHub's browser uploader.

## v0.7.8 · lighter delivery and visible maintenance

This release preserves the v0.7.7 research inputs, all 1,606 Explorer records and every CSV byte-for-byte. It changes delivery and presentation: shared assets, on-demand profile details, fewer initial filters, collapsible coverage notes and technical lists, and a dated update panel in Sources. The Italian HTML is about 434 KB instead of 3.39 MB; the initial HTML plus shared JavaScript and CSS is about 1.88 MB before compression, excluding images. These are payload sizes, not measured loading times.

`data/release_history.json` records release dates and the exact IANA evidence used. The footer and Sources panel distinguish the release date, general research snapshot and IANA snapshot. The data pack includes this history and its manifest hash. Updates are manual: retrieve sources, review changes, update metadata and translations, rebuild, validate and publish the complete package. No background refresh or scheduled update service is configured. Reaching Reveal Day does not populate the 2026 application dataset automatically.

The checks exercise successful loads, cache reuse, failed requests and retry, timeouts, incompatible or missing profiles, and late responses after switching or closing a drawer. Browser layout testing remains a separate gate: the local Firefox test environment could not open pages because its content processes were denied sandbox permissions. No visual or physical-device pass is claimed for this release.

## v0.7.9 · behind a click

The beginning of “How it works” now explains Internet architecture through a seven-step guided journey: readable name, root DNS referral, TLD referral, authoritative answer, packets and transport, HTTPS, and browser rendering. A home-page entry leads directly to it. Root/TLD lookups and website traffic are shown separately; the resolver, not the root, contacts successive DNS authorities.

The simulation runs entirely in the page and makes no DNS probes or requests to the example website. `example.com` and the documentation-only address `192.0.2.10` are explicitly illustrative. Explanations cover caches, IP versus transport, TCP versus QUIC, the limits of HTTPS, DNSSEC and domain versus hosting. Links to MDN, IANA and IETF sources are available in an expandable reference block.

Readers control every step using native buttons; there is no autoplay. The selected step can be shared with `?tab=how&walk=0` through `walk=6` and the `#internet-basics` anchor. Language changes retain it. Screen-reader announcements report the current explanation, controls support keyboard operation, and reduced-motion preferences are respected. Without JavaScript all seven explanations remain readable. Existing `how-part-1` through `how-part-12` anchors are preserved and their table-of-contents labels are corrected.

Research records, CSV files and the IANA evidence snapshot remain unchanged. Automated checks exercise all steps in all four languages, restart, back navigation, direct links, language links and existing chapter anchors. The local browser environment still prevents a real visual pass; verify desktop and phone layouts after deployment.


## v0.7.12 · Application Archaeology

The Explorer separates the history of **applications** from the history of **delegated TLDs**. The 2000, 2004 and 2012 formal application layers are now vendored locally. For 2012, v0.7.30 contains the complete **1,930-row string/applicant graph across 1,409 distinct Reveal-Day strings**, including strings that never reached delegation, plus all four later ICANN-approved applied-for-string corrections. Official ICANN aggregate totals remain locked separately for **116 IDN applications, 66 geographic applications, 84 community applications** and the five regional totals.

The data model distinguishes a submission/application from each string linked to it. That matters especially in 2000, where **47 submissions produced 223 formal Item E2 submission-to-string links across 188 distinct strings**. SITA's `.aer` and `.aero` alternatives are retained separately from its formal `.air` Item E2 request, so later selection of `.aero` does not rewrite the original filing. The 2004 layer contains all **10 submissions for 9 strings**, including both `.tel` applications. The 2012 layer preserves **230 exact-match contested strings covering 751 applications**, while ICANN's two initial non-exact similarity sets (`.hoteis` / `.hotels` and `.unicom` / `.unicorn`) remain explicitly separate.

Never-delegated applied-for strings receive `application-only` Explorer records. They do not increase the **1,599-record TLD/profile universe**; instead they expand the combined Explorer to **1,849 string identities**, of which **250 are application-only**. Every formal 2000, 2004 and 2012 string represented in the local corpora resolves to an Explorer record. The only intentionally incomplete formal application layer is 2026, which remains pending official Reveal Day publication.

For 2012, the publication deliberately republishes the complete **string/applicant graph**, not every field of the historical 14-column Reveal transport. `Primary Contact` and `Email` are excluded by design, and richer fields such as location, region, community/geographic flags and official application ID are not claimed as locally complete. No visitor-browser research fetch is used: the frozen application corpus is built entirely from vendored local data and pinned provenance.

## v0.7.11 · Universal Explorer

- adds an introduction-path classification to every Explorer record without conflating ccTLD history with ICANN application rounds;
- distinguishes `programRound` from `introductionPath` and records the evidence basis for direct, formal-type, documented-set and derived-era classifications;
- adds the historical `.zr` ccTLD retirement record and the retired `.nato` TLD from documented IANA/ICANN historical evidence;
- exposes origin/program fields in the searchable index and CSV export for all records;
- keeps application-only strings explicitly distinct from delegated or formerly delegated TLDs;
- marks the complete IANA-profile/TLD corpus separately from the still-incomplete cross-round application corpus.
- the original v0.7.11 release published a small curated application-only set; in the current v0.7.30 corpus, `tld_universe.csv` remains at 1,599 TLD/profile records while `application_only_strings.csv` contains all 250 application-only Explorer records, with complete 2000/2004/2012 historical coverage and the explicit pre-Reveal 2026 placeholder kept separate.

## v0.7.10 · profile links and corrections

Explorer profiles now have stable links such as `/it/?tab=explore&tld=ch`. The `tld` value uses the ASCII label without its leading dot; Unicode labels and a leading dot are also accepted on input. An exact record opens independently of the current search filters. Language changes preserve it, browser Back/Forward restore it, and closing the drawer removes it from the current URL. Sharing from the profile produces a clean public link without unrelated filters. Unknown labels show a localized message instead of opening an unrelated record.

Regional map names and chart labels are localized in all four languages. Map modes and Explorer presets expose their selected state with `aria-pressed`; map points expose their translated name and value.

“Report an error” is available in Sources, the footer and every profile. It opens a GitHub issue draft with editable context: page/profile link, release and language. A GitHub account is required and submitted issues are public. No issue is sent by the website; the reader reviews and submits it on GitHub. There is no promised response time or automated correction service.

All research records, CSVs and preserved IANA evidence remain unchanged. Automated DOM and asynchronous checks cover localized maps, direct links, Unicode identities, browser history, language changes, sharing and feedback drafts. A real browser visual check remains outstanding because the local browser environment cannot open pages with its required sandbox.
