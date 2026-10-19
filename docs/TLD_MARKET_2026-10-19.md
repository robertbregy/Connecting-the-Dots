# TLD reach and technical platform footprint — 19 October 2026

This current working analysis belongs to technical release v0.7.86. It is outside the immutable RR1/RR2 research snapshots and does not inherit their DOIs.

## Placement and measurement

Economics contains two top-50 views, connected to the cultural trajectory in Timeline. The website view uses the first 50 entries in the [W3Techs survey](https://w3techs.com/technologies/overview/top_level_domain), dated 18 October 2026, including territorial ccTLDs. It preserves source order. Published percentages are rounded: ties cannot establish a unique rank, and an exact total number of websites cannot be reconstructed. The [survey methodology](https://w3techs.com/technologies) excludes empty, duplicate and redirected sites and groups subdomains according to its website definition. The figures describe that observed population, not every website on the Internet.

The other view sorts measured gTLDs by delegated domains in the 18 October DNS zones, from [nTLDData](https://ntlddata.com/api/v1/tld?scope=all&per=500). It includes the new and legacy gTLD scope, excludes ccTLDs, and keeps missing zone observations unknown. These counts do not prove active websites, unique users, ownership, revenue or social impact. No multiplication of W3Techs percentages by an assumed global site total is used.

## Origin and dates

Round attribution follows ICANN's [explicit cohort definitions](https://compliance-reports.icann.org/compliance/complaints-by-tld.html): the seven selected 2000 gTLDs and eight 2004 gTLDs. The 2012 labels are joined to the project's historical corpus. A proposal in an earlier round is not evidence of selection in that round: `.mobi`, for example, belongs to the selected 2004 cohort. ccTLDs have no ICANN application round. IANA registration dates are joined from the dated local inventory and are labelled as such; they are not claimed as public launch dates. Undelegated applications from 2026 enter neither ranking.

## Power map

A fifth view, “TLDs per RSP”, accompanies the existing geography and coordination views. It charts named technical platforms by their attributed gTLD counts. It is a concentration chart, without implying geographic deployment. A table beside the map retains every named platform, unnamed infrastructure groups and the unattributed remainder. The 2026 evaluated-RSP regional inventory remains a separate population.

[nTLDData's backend methodology](https://ntlddata.com/methodology) uses root nameserver patterns, RDAP endpoints and reverse DNS. All attribution is inferred, including rows associated with known operators. The upstream `inferred` flag only distinguishes unnamed auto-groups from curated named fingerprints; `false` is not proof of a contractual RSP relationship. We export the clearer `attributionKind` field. Shared DNS infrastructure may identify a DNS provider rather than the contracted full registry backend. The counts must therefore be read as technical footprint, not a definitive register of RSP contracts. Company portfolio figures may also include ccTLDs or different dates and should not be substituted into this denominator.

## Reproduction and attribution

Raw public aggregate API responses are archived under `data/evidence/tld-market-2026-10-19/`, with acquisition dates, URLs and SHA-256 fingerprints in `data/tld_market_provenance.json`. W3Techs evidence contains the 50 numeric observations with the source date, order and acquisition fingerprint, rather than a copy of the entire proprietary page. nTLDData aggregate statistics are CC BY 4.0 and carry visible attribution; W3Techs / Q-Success is linked with its observation date.

Run `python3 scripts/build_tld_market.py --check` to verify archived source hashes and deterministic tables. `scripts/validate_tld_market.cjs` checks denominators, counts, cohort examples and every translated table. No network request runs when a visitor opens the site. A future refresh requires a new dated evidence directory and review; the build never silently updates this snapshot.
