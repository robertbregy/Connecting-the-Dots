# Research publication layer

This directory contains the scholarly-publication layer of **Connecting the Dots**.

- `connecting-the-dots-working-paper-v1.md` — working paper draft describing the research problem, data architecture, method, findings and living-publication protocol.
- `connecting-the-dots-working-paper-v1.html` — browser-readable rendering of the same draft.
- `research_release_manifest.json` — machine-readable distinction between technical site versions and milestone research releases.

## Current research release

**RR2 · Post-Reveal Evidence Consolidation**  
Published on GitHub and automatically archived by Zenodo: **10 October 2026 (UTC)**  
Evidence observation: **ICANN Reveal Day, 7 October 2026**  
Latest technical site: **v0.7.75**  
**RR2-specific DOI:** https://doi.org/10.5281/zenodo.23288603  
**Version-series concept DOI:** https://doi.org/10.5281/zenodo.23262622  
**RR2 GitHub tag:** `33803aa3fa69f1abb4cce7fbd49a0788ee9a33c9`

RR2 is the verified second dataset version in the original Zenodo concept series. The earlier **RR1** remains immutable, independently citable and available at https://doi.org/10.5281/zenodo.23262623. The frozen RR1 Git tag remains `5d52274935cda7712172873f46d456e4c0a09c7e`.

The official ICANN 2026 aggregate (1,615 applications and 481 applicants) and preliminary identical-string contention sets are kept distinct from the incomplete local 2026 APS application corpus and the secondary frozen 980-string index. Website editorial Field Notes and the mutable v1.1 working-paper draft remain separate from both archived research releases. The planned 17 November String Confirmation milestone will be eligible for a future **RR3** after source verification.

Machine-readable evidence of the GitHub-to-Zenodo continuity check is in [`rr2_publication_verification.json`](rr2_publication_verification.json). The archived original source tree, rather than later site edits, determines the scientific snapshot.

## RR2 prepublication test · completed 10 October 2026 (historical audit)

The source-backed post-Reveal RR2 **candidate** is described in
[`rr2_candidate.json`](rr2_candidate.json) and
[`../docs/SCIENTIFIC_RELEASE_AUTOMATION.md`](../docs/SCIENTIFIC_RELEASE_AUTOMATION.md).
A dedicated GitHub Action builds a reproducible scientific ZIP and SHA-256
manifest from the verified source commit, comparing substantive data changes
with the tagged RR1 baseline. The preflight step **did not itself publish RR2** or replace RR1's
Zenodo DOI. The subsequent GitHub Release and Zenodo concept-series check
succeeded independently, before the public site metadata was promoted.
November 17 String Confirmation is the next potential RR3 milestone.


Zenodo's public API independently verified both records: RR1 specific DOI **10.5281/zenodo.23262623** and RR2 specific DOI **10.5281/zenodo.23288603** share **concept DOI 10.5281/zenodo.23262622** (concept record 23262622). The integration successfully archived GitHub Release RR2. The preflight remains a separately auditable step; see the DOI verification record.
