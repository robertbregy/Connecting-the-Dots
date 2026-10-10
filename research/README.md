# Research publication layer

This directory contains the scholarly-publication layer of **Connecting the Dots**.

- `connecting-the-dots-working-paper-v1.md` — working paper draft describing the research problem, data architecture, method, findings and living-publication protocol.
- `connecting-the-dots-working-paper-v1.html` — browser-readable rendering of the same draft.
- `research_release_manifest.json` — machine-readable distinction between technical site versions and milestone research releases.

## Current research release

**RR1 · Reveal Day 2026**  
Published online: 9 October 2026  
Evidence milestone: ICANN Reveal Day, 7 October 2026  
Current site version: v0.7.68  
RR1 introduced in site version: v0.7.55

RR1 is archived on Zenodo with DOI **10.5281/zenodo.23262623**. This DOI identifies the immutable Reveal Day 2026 research release; a concept DOI is not stated until explicitly verified from Zenodo.

Working paper editorial revision: **v1.1-draft · 10 October 2026**. This mutable working paper is distinct from the frozen RR1 Zenodo deposit.

The separate [Field Notes](../behind-the-round/en/) field-note register records sourced, corrigible 2026 observations. It is not part of the frozen RR1 corpus and is not an institutional account.

Field Notes include a documented 2026 regional/independent CSV reconciliation and a separate WDO identity article in four languages. These are source-tracked editorial observations, not new RR1 data or a new research release.

## RR2 prepublication test · 10 October 2026

The source-backed post-Reveal RR2 **candidate** is described in
[`rr2_candidate.json`](rr2_candidate.json) and
[`../docs/SCIENTIFIC_RELEASE_AUTOMATION.md`](../docs/SCIENTIFIC_RELEASE_AUTOMATION.md).
A dedicated GitHub Action builds a reproducible scientific ZIP and SHA-256
manifest from the verified source commit, comparing substantive data changes
with the tagged RR1 baseline. This **does not publish RR2** or replace RR1's
Zenodo DOI. Release to Zenodo and the concept-series connection must be
verified independently before CITATION.cff and public research metadata can
change. If RR2 is released in October, the November 17 String Confirmation
milestone moves to RR3.

