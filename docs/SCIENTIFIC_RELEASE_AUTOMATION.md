# Scientific-release automation · controlled RR2 rehearsal

**Prepared:** 10 October 2026  
**Published research release:** RR1, archived DOI `10.5281/zenodo.23262623`  
**Next research candidate:** RR2, post-Reveal evidence consolidation; **not published yet**  
**Website version:** v0.7.74, independently versioned from scientific releases.

## Why RR2 now merits a scientific preflight

The `RR1` Git tag was created before the current, source-reconciled analysis.
The tagged `data/research.json` contains the 1,663 application submissions
and 1,616 paid applications for earlier 2026 stages, whereas the current
derived layer includes the official Reveal Day snapshot of 1,615
applications, 481 applicants, 263 preliminary identical-string
contention sets and the documented 2026 category counts.

These counts refer to **different phases and/or populations**; they are not
revisions of one intrinsically identical number. The current secondary
inventory contains 980 primary strings, 1,608 applications for those primary
strings and six variant-only application records, for 1,614 indexed
application records. Its coverage **is not a full official APS
application-level corpus**.

The source baseline is the immutable `RR1` Git tag at
`5d52274935cda7712172873f46d456e4c0a09c7e`. The independent
scientific paper remains a non-peer-reviewed working draft.

## What has been automated and can be tested safely

The `RR2 scientific release preflight (unpublished)` GitHub Action runs on
the candidate branch and can also be run manually from Actions. It:

1. Checks the original RR1 tag and DOI identity against the immutable Git tag.
2. Compares `data/research.json` at RR1 against the present evidence and
   checks all official and secondary counts against the source manifest.
3. Verifies the SHA-256 of the preserved IANA archive and checks that no claim
   of complete official 2026 APS local coverage has crept into RR2.
4. Selects research datasets and reproducibility sources, explicitly excluding
   mutable editorial Field Notes and interface translations from the frozen
   scientific corpus.
5. Builds a ZIP with a manifest of **SHA-256 per input file**, source commit,
   evidence snapshot and an explicit *RR2 not published* status.
6. Reopens the ZIP, validates every recorded checksum, recreates the ZIP from
   the same commit, and checks **byte-for-byte reproducibility**.
7. Stores the ZIP, manifest, SHA256SUMS and method report as **GitHub Actions
   artifacts**. An artifact is not a GitHub Release or Zenodo deposit.

Every step fails closed on a mismatch. The script does not create a DOI,
move a scientific tag or change any public scientific citation.

The CLI is:

```bash
python3 scripts/scientific_release.py preflight --out-dir dist/research/RR2
python3 scripts/scientific_release.py verify --out-dir dist/research/RR2
```

Candidate policy and source assumptions: `research/rr2_candidate.json`.
Scientific ZIP: `RR2-candidate-scientific-data.zip`.
The candidate CFF is deliberately labelled *RR2-candidate* with **no DOI**.

## What is NOT yet automated or independently verified

A successful GitHub build is **not** proof that Zenodo archived a new version.
The public RR1 GitHub Release exists, and its specific DOI is in the
repository, but the `RR1` tag predates the addition of `.zenodo.json`.
This does not reveal whether the first Zenodo deposit originated from the
GitHub integration or from a manual upload. Nor does it establish the
Zenodo **concept DOI** that groups versions.

Before minting an RR2 GitHub Release, inspect the Zenodo account
**GitHub integration** page and confirm that this exact repository is enabled
and that the intended RR2 deposit will be a *new version of the RR1 record*.
Using `.zenodo.json` does not by itself guarantee that relationship.

When Zenodo has actually published RR2, run:

```bash
python3 scripts/scientific_release.py verify-zenodo \
  --new-record-id THE_NEW_NUMERIC_RECORD_ID
```

The optional `zenodo_rr2_record_id` input in the GitHub Action runs this
same check against the public Zenodo API. It requires:

- a **new**, real RR2 version-specific DOI distinct from RR1;
- exactly the **same Zenodo concept record ID** as RR1;
- valid public RR2 metadata.

A mismatched concept record fails, rather than silently calling an
independent deposit RR2 in the same series.

### Final promotion is a separate, gated publication action

Only **after** a reviewed research snapshot is frozen, the GitHub Release
exists and the new Zenodo version DOI has been verified, update together:

- `research/research_release_manifest.json`: `currentResearchRelease=RR2`,
  actual specific DOI, verified concept DOI, evidence date and a new
  `nextPlannedResearchRelease=RR3` for **17 November 2026**.
- `CITATION.cff`, metadata displayed on `research/index.html`,
  the public research section and versioned download links.
- The legacy `scripts/release_check.py` invariants hard-coded to RR1,
  retaining **RR1 preservation checks** as well as the new release.
- Any Zenodo metadata links that are actually supported by the final deposit,
  without conflating a concept DOI and a version DOI.

Those changes are **not executed by the preflight**. The current public
record remains RR1, and its DOI must never be retroactively reassigned.

## What this test will establish

A green preflight establishes deterministic scientific selection,
source-data reconciliation, byte-reproducible packaging and local manifest
integrity. It does **not** establish Zenodo transfer, an automatically
created concept-series DOI or publication of RR2. Those require the
separately verifiable live publication step.

The point is to test the scientific pipeline rather than merely increment
a version string.
