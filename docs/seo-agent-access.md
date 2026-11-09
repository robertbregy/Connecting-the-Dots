# Search and agent access

The site exposes focused reading pages, a normal XML sitemap, its existing CSV/JSON evidence, and two small navigation aids:

- `discovery/manifest.json`: generated reading pages and alternate Markdown representations.
- `agent-catalog.json`: reading URLs, explicit dataset units, observation dates, provenance, rights, and research-release identities.
- `llms.txt`: a short English route map. The manifest links all four reading languages.

The catalog is an index to the same publication. It is not another research snapshot, an API service, a crawler permission, or a promise that a search engine will index or cite the site.

## Build contract

Run `scripts/build_agent_catalog.py` after the current data files and `discovery/manifest.json` have been generated. The input manifest must contain `schemaVersion: 1`, the current `siteVersion`, and a non-empty `pages` array. Each page identifies `path`, `language`, `kind`, `key`, `title`, `description`, and `interactiveUrl`; `markdownPath` is optional. Paths are relative to the project root.

```sh
python3 scripts/build_agent_catalog.py --check
python3 scripts/build_agent_catalog.py
```

The first command validates and constructs the outputs in memory. The second writes only `agent-catalog.json` and `llms.txt`. Neither command accesses the network or changes an archived release. Output order and dates come from committed inputs, making repeated builds deterministic.

The generator verifies the APS source digest, the application identifiers represented by the graph, replacement-to-base links, the equality of the new-primary string sets, the IANA root count, and the deduplicated Explorer union. It checks that all linked reading and data files exist. Counts are recalculated from the CSVs and graph; they are not inferred from a technical release number.

## Different dates and different populations

| Field | Meaning |
| --- | --- |
| `websiteRelease.releasedOn` | Technical/editorial publication date of the website. |
| Dataset `observationDate` | Source retrieval or snapshot date for the stated scope. A null value means dates vary; read the per-row date fields. |
| `editorialRevisionDate` | Revision of an analytical method or classification, separate from when the source was observed. |
| Archived release `publicationDate` | Bibliographic publication date, including the preserved RR2 clarification. |
| Archived release `evidenceCutoff` | Last date covered by that archived evidence set. |

The base Explorer CSV, the combined interactive name catalog, the dated IANA root, the APS public listing, the reconciled base applications, and the new-primary string set have different units. The small curated file `applications_2026.csv` is a separate partial layer, not an enumeration of the entire APS corpus.

The current derived APS analysis is outside the immutable RR1/RR2 deposits. The catalog links the existing research release manifest and bibliographic clarification; it does not rewrite either deposit or assign its DOI to newer results.

## Host-level crawling

The authoritative Robots Exclusion Protocol URL for this deployment is:

`https://robertbregy.github.io/robots.txt`

The copy at `/Connecting-the-Dots/robots.txt` is in a project subdirectory and cannot govern host-level crawling. The audit on 9 November 2026 received a `404` at the host root and a permissive informational copy under the project. A missing robots file is not itself a Google crawl prohibition.

Publishing a host-root file requires control of the GitHub Pages user site or another host-root deployment mechanism. The project build must not claim to install this file by creating another copy in its own folder. Search crawling, user-requested retrieval, and model training should be considered independently when the owner changes a crawler policy.

`llms.txt` can describe this project's subdirectory. Its links and the catalog provide context; they do not override the host's robots rules, source licenses, or platform policies.

## Measurement remains an account-level step

Publication checks verify HTTP responses, HTML, canonical URLs, language alternates, links, and readable content. They cannot establish actual search indexing, ranking, citations, or referral traffic.

For the URL-prefix property `https://robertbregy.github.io/Connecting-the-Dots/`, inspect the submitted sitemap, indexed-page coverage, selected canonical URLs and search performance in Search Console. Check the property's Search generative AI setting and its Generative AI performance report where available. AI impressions and visits arriving from an assistant are distinct measures.

The 9 November audit could not read the connected GSC Wizard account because its subscription was inactive. That does not establish whether the underlying Search Console property is configured or collecting data. An authorized direct inspection or exported report can complete that check. This code adds no third-party analytics service and creates no account or subscription.

## References

- [Google: robots.txt location and HTTP responses](https://developers.google.com/crawling/docs/robots-txt/robots-txt-spec)
- [Google: JavaScript and indexable pages](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- [Google: generative AI search guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)
- [Search Console: Search generative AI control](https://support.google.com/webmasters/answer/16908024)
- [Search Console: Generative AI performance report](https://support.google.com/webmasters/answer/16984139)
- [OpenAI: crawler purposes and controls](https://developers.openai.com/api/docs/bots)
- [llms.txt proposal](https://llmstxt.org/)
