# RR3 preparation and publication boundary

## Current preparation

`scripts/rr3_preflight.py` creates an unpublished scientific review package.
It preserves public RR2 citations and cannot create Git tags, releases or DOIs.
Its default output is a sibling directory of the checkout; explicit output
directories inside the repository are rejected.

```bash
python3 scripts/rr3_preflight.py preflight --output-dir /absolute/staging/rr3
python3 scripts/rr3_preflight.py verify --output-dir /absolute/staging/rr3
```

Expected outputs are `RR3-candidate-scientific-data.zip`,
`RR3-candidate-manifest.json`, `RR3-preflight-report.md`,
`CITATION_RR3_CANDIDATE.cff` and `SHA256SUMS.txt`.

For a reproducibility check, build into two distinct external directories and
compare the ZIPs and manifests. Changing output directories does not change
archive bytes. The manifest explicitly identifies uncommitted selected inputs;
such a package is reviewable but is not an immutable Git release.

After all selected source changes have been reviewed and committed, rerun:

```bash
python3 scripts/rr3_preflight.py preflight --require-frozen --output-dir /absolute/staging/rr3-frozen
```

This gate compares every selected source byte with HEAD and verifies:

- RR1 commit `5d52274935cda7712172873f46d456e4c0a09c7e`;
- RR2 commit `33803aa3fa69f1abb4cce7fbd49a0788ee9a33c9`;
- the preserved 18:30 export and separate 20:09/20:38 observations;
- unchanged current public RR2 citation metadata;
- deterministic package contents and independent recomputation from the ZIP.

Tags can be obtained with a read-only fetch when absent. Never replace an
existing tag to satisfy the baseline checks.

## Publication steps not performed by the preflight

1. Prepare RR3-specific `.zenodo.json` metadata before freezing the intended
   release commit. Do not assign or reuse a version DOI. The published
   `CITATION.cff` remains RR2 pending verification.
2. Rebuild and validate the candidate from the frozen reviewed commit.
3. Create the RR3 GitHub tag/release from that exact commit. The previously
   verified GitHub–Zenodo integration is the intended version-series route.
4. Verify the resulting public Zenodo record: version exactly RR3, a new DOI
   distinct from RR1 and RR2, concept record `23262622`, concept DOI
   `10.5281/zenodo.23262622`, and archive/GitHub origin matching the RR3 release.
   A passing preflight or successful GitHub release alone is not this proof.
5. Preserve the verification evidence and promote the public research manifest,
   publication metadata, citation files, Research pages and matching validation
   invariants together. Keep RR1 and RR2 in the release history. Do not move the
   scientific RR3 tag to incorporate the subsequently assigned DOI.

The older `scripts/scientific_release.py` and
`.github/workflows/research-release-preflight.yml` are RR2-specific. They are
not the RR3 preflight and their Zenodo checker does not validate RR3 identity.

The [official Zenodo metadata documentation](https://help.zenodo.org/docs/github/describe-software/zenodo-json/)
states that `.zenodo.json` takes precedence over `CITATION.cff` when both exist.
The earlier manuscript retains its revision date; the
[`RR3 addendum`](../research/rr3_addendum_20261117.md) records the newly reviewed
scientific evidence. Subsequent DOI synchronization is bibliographic work,
not permission to rewrite an archived release.
