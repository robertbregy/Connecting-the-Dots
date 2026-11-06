# Deployment

## Canonical workflow

The GitHub repository is the canonical working master. Ordinary updates are made as Git commits to `main`. Every ordinary push to `main` or `feat/**`, including documentation-only changes, starts **Rebuild published site**. The action regenerates and validates the static publication and commits generated outputs with `[skip build]`. An ordinary main push waits for its successful rebuild before Pages publishes the committed state.

The generated commit is either the unchanged source SHA or its direct child with the builder's exact commit message and identity. Pages also requires that SHA to remain the current main tip. Failed pushes with an unchanged remote tip, and failures to read that tip, fail the rebuild instead of reporting a concurrent update.

Recommended local sequence:

```bash
git checkout main
git pull --ff-only
python3 build.py
python3 scripts/release_check.py
git add -A
git commit -m "Publish Connecting the Dots vX.Y.Z"
git push origin main
```

When ChatGPT is connected through the GitHub integration, the same principle applies: inspect current `main`, prepare and validate the source change, commit it, then verify the automated rebuild and GitHub Pages deployment.

## Reviewed precompiled publications

Use `[skip build]` in the commit message only when the committed publication has already been generated and reviewed. This is the explicit rebuild opt-out. A main push with that marker publishes its committed files directly; ordinary pushes wait for the successful rebuild handoff. Pages runs `python3 scripts/release_check.py` and `node scripts/verify_ia_b2_parity.cjs` before packaging. Those checks do not rebuild or alter the publication.

GitHub does not normally trigger another push workflow for a commit made with the workflow's `GITHUB_TOKEN`. The successful rebuild's `workflow_run` event therefore provides the deployment handoff for its generated commit.

## Recovery and manual verification

If a rebuild fails, resolve the reported failure and rerun **Rebuild published site**, or push a corrected source commit. A later documentation-only push receives its own rebuild, so an older superseded build does not leave its generated outputs stranded.

Use **pages build and deployment → Run workflow → main** to publish the already committed, validated main state without rebuilding. The current-SHA and release/review checks still apply. Use this fallback only when the committed publication is the intended output.

Use **Verify actual GitHub Pages bytes after deployment → Run workflow → main** to repeat the live verification without publishing. Normal live verification starts only after a successful Pages workflow, so it checks the publication that was deployed instead of the earlier source push. Runs for different source SHAs cannot cancel one another.

Automatic live verification first reads the jobs of the exact triggering Pages run and attempt. The `Deploy the committed publication` step must have completed successfully for the expected source SHA. A successful workflow that skipped deployment records `status: not_deployed` and `verified: false`, and performs no site requests, browser installation or measurements. API errors or ambiguous upstream metadata fail the verification. A manual verification has no upstream run to attest, but still enforces the current-SHA and live-byte gates.

## Research releases

Technical/site releases (`v0.x.y`) do not create a new research release. Research releases (`RR1`, `RR2`, …) are milestone snapshots of the evidence base. RR1 is archived on Zenodo with DOI `10.5281/zenodo.23262623`. A new GitHub/Zenodo research release is created only when the evidence set changes materially.

## Build metadata

`publication.json` is the canonical source for the current site version and publication dates. `CITATION.cff` identifies the current immutable research release rather than following every technical site version. `.zenodo.json` stores archival metadata for future research-release deposits.

## Data pack discipline

Each technical release has a new versioned current data package. Set `version`, `currentDataPackVersion`, `currentDataPackPath` and `releasedOn` in `publication.json`, then run the normal build. Existing versioned ZIPs and their checksums are immutable and independently checked. `CTD_REBUILD_DATA_PACK=1` is intentionally rejected: it must never rewrite the historical v0.7.58 archive.

The working paper is generated from its Markdown source by `scripts/render_research.cjs`; manuscript version and review date also come from `publication.json`. New analytical outputs outside RR1/RR2 are labelled as current working research and may be archived only as a subsequent research release, never under an earlier release DOI.

## Fallback archives

Deterministic deployment/source ZIPs may still be generated for rollback or offline preservation, but they are no longer the normal publication path. Do not stack old browser-upload archives over the repository because omitted files are not deleted by that workflow.

After building and checking the publication, generate either offline archive with:

```bash
python3 scripts/package_release.py --kind deploy
python3 scripts/package_release.py --kind source
```

These commands write versioned ZIPs beside the repository. Continue to use Git for repository updates.

## Verification

After each publish:

1. confirm the **Rebuild published site** action completed successfully;
2. confirm the GitHub Pages workflow completed successfully;
3. verify the live footer/version and key research metadata;
4. run the release checker before any tag or research release;
5. keep the working paper, sitemap, DOI metadata and research-release manifest synchronized.

The live check covers the native and standalone pages, the working paper from `publication.json`, their referenced scripts and stylesheets, the map runtime, all Explorer profile shards with their actual version query strings, and the current data package. It compares immutable source bytes before running controlled browser measurements and checks the source again before those measurements. A superseded run records `status: superseded` and `verified: false`, skips measurements, and is not evidence that the current publication passed verification. A `not_deployed` report likewise records a skipped verification rather than a successful publication check.

## robots.txt note

This project is published below `/Connecting-the-Dots/`. Search engines only treat `/robots.txt` at the GitHub Pages host root as authoritative. The project copy is retained for documentation and sitemap discoverability; page-level `meta robots`, canonical metadata and the sitemap remain the effective project-level controls.
