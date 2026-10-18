# Current APS analytics: source identity, two economic variables and explicit denominators

**Editorial revision:** 18 October 2026. **Official source capture:** 11 October 2026 at 21:27:40.214 UTC. **Status:** current project-derived analysis, outside the immutable RR1/RR2 scientific archives.

This layer addresses audit findings M01, M02, M05 and C03. It replaces synthetic identities in the **current** analytical view with the public ICANN Application IDs already preserved by the project. It does not claim that the public listing was refreshed on the editorial revision date.

## 1. What is counted

The pinned [ICANN APS public listing](https://newgtldprogram-aps.icann.org/applications) has 2,783 records. An Application ID ending in `-R` denotes a replacement record attached to its base application; it is not a second application. The generator therefore counts 1,614 base IDs, including six applications of type `Existing gTLD with Variants`. ICANN's separate reported total is 1,615; the unlisted `WDO2627T-T45217` case is not fabricated to fill that gap. The APS application page documents the distinction between records and applications.

| Scope key | Base applications | Distinct primary labels | Distinct published applicant names | Use |
|---|---:|---:|---:|---|
| `all_published` | 1,614 | 986 | 480 | All published base application records |
| `new_primary` | 1,608 | 980 | 477 | Comparability with the frozen 980-string inventory |

The six exclusions are `BTRT2633T-T38161`, `BTRT2633T-T83538`, `CINI2622T-T81530`, `IDOL2621T-T12142`, `IDOL2621T-T53999`, and `NHXN2684T-T27476`. They remain in the full application CSV with `comparable_scope=false` and an explicit reason. The 980-string set equals the frozen secondary inventory by set membership, not only by its cardinality.

Every current row has `application_weight=1`. Replacement records, variants and repeated inherited theme assertions add no weight. These are applications for original primary labels during the replacement period, not a prediction of the final confirmed labels or awarded TLDs. Source status and the original primary label are copied without treating an active replacement as a second or final selected application.

## 2. The two economic variables have separate meanings and evidence

### String theme

`string_theme` describes the topic or market evoked by a primary string. It imports only the old map's 2026 rows with `classification_basis=string-taxonomy` (including its documented contested-string suffix) and `sector_status=classified`. Duplicated synthetic rows collapse to a single editorial theme assertion for each label before that assertion is joined to actual APS IDs.

There are **332 imported theme assertions** represented in **608 official applications**. Their original per-theme confidence is preserved. The status is explicitly `inherited-editorial`; the APS supplies the application identity, not the theme classification. This review does not relabel the inherited confidence as a new independent validation. Rows based on applicant taxonomy, group overrides, brand labels or unresolved classifications are not converted into string themes.

This narrower variable has 608 classified and 1,000 unclassified applications in the 1,608-record scope. The old 690 figure concerned a mixed variable. Its difference from 608 does not mean 82 applications have disappeared.

### Applicant sector

`applicant_sector` concerns the **documented activity of the applying legal entity**. It does not inherit the string theme, the old `economic_group` label or a parent's general industry. A separate source register, `data/aps_2026_applicant_sector_evidence.json`, records each exact applicant name, sector, confidence, review date, primary URLs and the inference made.

The initial review covers **11 legal applicants and 622 applications**: 585 in the registry/domain industry, 20 in identity/trust services, and 17 in AI. **986 applications remain unclassified** in the new-primary scope. The reviewed cases are purposefully selected, with strong coverage of large registry portfolios. This is not a representative industry sample: the 585/622 proportion must not be presented as the registry industry's share of the whole round. A chart may show 585/1,608, provided it shows the unclassified 986 alongside the other categories.

The source register preserves the editorial classification decisions and short evidence summaries, with its own content hash. The linked organization pages and selected APS responses are not bulk-archived as source HTML by this layer; future revalidation must check their current availability and content instead of treating those live URLs as immutable evidence snapshots.

Examples of the evidence include [XYZ's ICANN agreement](https://www.icann.org/en/registry-agreements/details/xyz), [Intercap's own description](https://www.intercap.inc/), [Google Registry's identification of its registry entity](https://www.registry.google/faqs/), [Anthropic's company description](https://www.anthropic.com/company), and [Aruba PEC's legal-provider and service description](https://www.pec.it/). The APS identifies [OPENAI OPCO, LLC's website](https://newgtldprogram-aps.icann.org/applications/OOL2614T-T34282/summary) separately from its requested label.

ShortDot and Squarespace are deliberately marked **medium** confidence: [ShortDot's declaration](https://newgtldprogram-aps.icann.org/applications/NA2626T-T55140/application-responses) and [Squarespace's declaration](https://newgtldprogram-aps.icann.org/applications/SRL2616T-T62801-R/application-responses) document registry/registrar affiliations and the applying vehicles. The sector assignment is an editorial interpretation of their declared domain-industry roles. It does not mean these 2026 applicants already operate approved TLDs.

The `.agent` example makes the distinction observable: its 13 applications share an inherited AI theme; the applicant-sector evidence classifies one as AI (OpenAI), four as registry/domain industry (Charleston Road, Intercap, Radix and XYZ), and leaves eight unclassified. The AI theme does not turn the other twelve applicants into AI companies.

### Naming designation and ownership

The official brand, community and geographic flags remain separate columns. `naming_strategy` is a deterministic combination of positive APS designations, not a new business-model inference. A record without positive flags is `no-positive-APS-designation`, not automatically “generic”. The confidence `source-field-copy` concerns faithful copying, not ICANN's eventual substantive assessment.

The combinations are mutually exclusive, but the original flags are not: **331 brand-only applications plus two brand-and-geographic applications equal 333 TRUE brand flags**. The overlapping cases are `.meta` (`MRHL2653T-T58277`) and `.montecarlo` (`SADB2646T-T18811`). The source flags are copied without assessing their merits. `coverage.<scope>.officialFlagCounts` exposes the inclusive totals: 333 brand, 16 community, 15 self-designated geographic and zero geography-review-confirmed flags. The 331 category is therefore not a correction to ICANN's 333 brand headline.

`corporate_group` is empty on every row and `corporate_group_status` explains that no systematic parent census is included. Several reviewed documents contain some parent information; selectively importing those parents would not establish an exhaustive group ranking. All group calculations remain unavailable rather than being silently replaced with applicant names.

## 3. Geography and concentration are derived observations

Applicant counts use exact published `Applicant Name` values. Sector evidence matching trims outer whitespace only; it neither merges applicant names nor normalizes corporate families. Geographic distributions copy `Location` and `Region` verbatim. Both scopes contain **56 nonempty Location codes**, and neither has missing location or region fields. In the full scope, `US` has 841 applications, `MT` 158 and `KY` 138. These figures are project calculations with the denominator 1,614, not ICANN-published rankings.

The `Region` field is ICANN's reported regional assignment, not a fresh continent lookup: codes such as `KY` retain the region reported by APS. Do not derive headquarters, parent nationality, DNS server geography or the place of economic activity from these columns. The publication's capture instant and source hash accompany every distribution row.

`registry_concentration.csv` now uses two explicit analytical records in place of the old `[official dataset]` work instructions:

- Link Freedom Group Ltd: **158 base applications out of 1,614**, or 9.789343%; the same 158 applications occur in the 1,608-record scope.
- Corporate-group ranking: **missing**, with a blank value and the reason that no systematic parent census exists. Missing is not zero.

Qualitative operator context is preserved separately in `registry_concentration_context.csv` and combined with the generated observations. This makes the output reproducible without reading its prior output as input. Historical group-level Donuts counts must not be presented as directly equivalent to a single legal applicant in 2026.

## 4. Amazon: 76 records and a historically different statement

The current corpus count is **76 rows for the exact applicant `Amazon EU S.à r.l.`** in `data/applications_2012.csv`, a local 1,930-row corpus preserving the published string/applicant graph. The generator asserts that count. This is the value for comparisons that describe the project's local corpus.

The historical figure **78** is not simply deleted. Page 4 of [WIPO determination LRO2013-0021, Scripps Networks Interactive v. Wild Orchard](https://newgtlds.icann.org/sites/default/files/drsp/25sep13/determination-1-1-1462-36448-en.pdf) recounts 78 Amazon strings, with attribution to paragraph 14 of a Donuts executive's declaration. That passage supplies no application-level list that reconciles the two extra strings. It is therefore exported under a separate `Historical contextual statement` layer dated to the 2013 proceeding, with the units and unresolved scope difference stated. It must not overwrite the 76-record corpus total or imply that the source proved a particular withdrawal/change explanation.

## 5. Outputs and browser interface

| File | Contents |
|---|---|
| `aps_2026_current_analytics.csv` | 1,614 source-linked application rows, two separate classifications, confidence and scope columns |
| `aps_2026_current_analytics.json` | Source metadata, coverage, distributions, exclusions and the `.agent` example |
| `aps_2026_current_analytics.js` | Same summary as `window.CTD_APS_ANALYTICS` |
| `aps_2026_applicant_distribution.csv` | Full applicant-name counts for both scopes |
| `aps_2026_location_distribution.csv` | Full APS Location distributions for both scopes |
| `aps_2026_region_distribution.csv` | Full APS Region distributions for both scopes |
| `aps_2026_string_theme_distribution.csv` | Inherited string-theme counts, with unclassified rows |
| `aps_2026_applicant_sector_distribution.csv` | Reviewed applicant-sector counts, with unclassified rows |
| `aps_2026_current_analytics_manifest.json` | Input/output hashes, generator hash, denominator and import rules, limits |

The summary interface has `coverage.all_published` and `coverage.new_primary`. Its `distributions` object contains arrays named `applicants`, `locations`, `regions`, `stringThemes`, `applicantSectors` and `namingDesignations`. Filter each array by `scope`. Every row contains `category`, `applications`, `denominator` and `share_of_all_pct`; geographic/source fields remain available for inspection. The CSV's `comparable_scope` is the lowercase literal `true` or `false`.

Unknown categories remain visible as `[not classified or missing]`. A translated UI may give them a clearer label, but must preserve their counts and denominator. A displayed top-N list should expose its omitted remainder or link the complete distribution; no silent renormalization to the displayed rows is permitted.

## 6. Reproduction and archive policy

Run:

```sh
python scripts/build_aps_current_analytics.py
python scripts/build_aps_current_analytics.py --check
python scripts/test_aps_current_analytics.py
```

The builder is offline and deterministic. It checks the pinned APS digest and column schema, all 2,783 record IDs, the 1,169 linked replacements, the exact six exclusions, string-set equality, the immutable mixed-map digest, conflict-free theme imports, unit weights, distribution conservation and the Amazon corpus count. Focused regressions reject a modified source and duplicated official record, verify `.agent` does not leak its theme into applicant sectors, and verify reruns do not change output bytes.

`application_economic_map_2012_2026.csv`, its old sector aggregates, existing research ZIPs and **RR1/RR2 remain byte-for-byte unchanged** by this generator. The current layer is clearly marked as a derived living analysis outside those archives. It may ship in a new technical data pack with these manifests. A scientific publication that bases revised results on it should issue a new research release, with an explicit change log and a harmonized 2012 two-variable mapping first. The old mixed 2012/2026 sector chart is historical research context, not a harmonized time series for this new model.
