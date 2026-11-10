# Deployment

## Canonical workflow

The GitHub repository is the canonical working master. Prepare updates on `feat/**` and promote them through a pull request to protected `main`. Ordinary feature-branch pushes, including documentation-only changes, start **Rebuild published site**. The action regenerates and validates the static publication and commits generated outputs to that feature branch with `[skip build]`. Open the PR from the completed, reviewed generated commit; all seven required PR checks must pass before merging.

Create a `safety/**` rollback ref before promotion, then use the enabled merge-commit method and include `[skip build]` in the **merge commit message**. Pages publishes that exact committed merge SHA after its release and review checks, provided it is still the current main tip. The main rebuild is intentionally skipped: GitHub Actions has no bypass and must not write generated follow-up commits to protected `main`. See [`docs/PUBLISHING_SAFETY.md`](docs/PUBLISHING_SAFETY.md) for the seven check names and [`docs/REPOSITORY_GOVERNANCE.md`](docs/REPOSITORY_GOVERNANCE.md) for the active ruleset.

For a locally generated and reviewed publication, prepare the feature branch as follows. Complete the applicable version, provenance and editorial-review updates before committing:

```bash
git checkout main
git pull --ff-only
git checkout -b feat/publication-update
python3 build.py
python3 scripts/release_check.py
node scripts/verify_ia_b2_parity.cjs
git add -A
git commit -m "Prepare reviewed Connecting the Dots publication [skip build]"
git push -u origin HEAD
```

Open a pull request from this feature branch and wait for its required checks. The same sequence applies through the GitHub integration: inspect current `main`, prepare the source and generated changes on a feature branch, complete the PR checks, then merge with `[skip build]` and verify the actual Pages deployment. CI or documentation-only changes may retain the current publication version when its generated assets and data package are unchanged.

## Reviewed precompiled publications

Use `[skip build]` only when the committed publication has already been generated and reviewed. Keep that marker in the merge commit message as well as any precompiled feature commit. The resulting main push publishes its committed files directly. Pages runs `python3 scripts/release_check.py` and `node scripts/verify_ia_b2_parity.cjs` before packaging. Those checks do not rebuild or alter the publication.

GitHub does not normally trigger another push workflow for a commit made with the workflow's `GITHUB_TOKEN`. Open the PR after generation, or inspect approval-required PR workflows when the bot updates an existing PR. A successful manual dispatch is not a substitute for an eligible required PR check. The retained rebuild-to-Pages handoff does not grant the bot permission to bypass main protection.

## Recovery and manual verification

If a feature rebuild fails, resolve the reported failure on that feature branch and rerun **Rebuild published site**, or push a corrected source commit there. A later ordinary feature push receives its own rebuild. A failed publication or a required rollback is repaired through another checked PR; do not push directly to `main` or enable a bot bypass.

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

1. confirm the merged PR passed all seven required checks; any feature-branch **Rebuild published site** run used to generate its files must have succeeded, while the main rebuild is expected to be skipped for `[skip build]`;
2. confirm the actual `Deploy the committed publication` step succeeded for the promoted SHA, not merely that its workflow is green;
3. confirm **Verify actual GitHub Pages bytes after deployment** reports `status: verified`, `verified: true` and matching bytes for that same SHA, then check the live footer/version and key research metadata;
4. run the release checker before any tag or research release;
5. keep the working paper, sitemap, DOI metadata and research-release manifest synchronized.

The live check covers the native and standalone pages, the working paper from `publication.json`, their referenced scripts and stylesheets, the map runtime, all Explorer profile shards with their actual version query strings, and the current data package. It compares immutable source bytes before running controlled browser measurements and checks the source again before those measurements. A superseded run records `status: superseded` and `verified: false`, skips measurements, and is not evidence that the current publication passed verification. A `not_deployed` report likewise records a skipped verification rather than a successful publication check.

## robots.txt note

This project is published below `/Connecting-the-Dots/`. Search engines only treat `/robots.txt` at the GitHub Pages host root as authoritative. The project copy is retained for documentation and sitemap discoverability; page-level `meta robots`, canonical metadata and the sitemap remain the effective project-level controls.

## Explicit public payload and source health (v0.7.108)

Pages stages the committed publication with `python3 scripts/stage_public_site.py --output _site`. The allowlist is validated before copying; sources, development scripts, prototypes and internal audits remain in GitHub. Public pages, runtime assets, cited datasets, scientific documents and historical downloads retain their URLs. `release_check.py` enforces the same dependency check before promotion. Live smoke verifies excluded paths return 404 as well as comparing public bytes.

The **External source health** workflow runs weekly and on manual dispatch. It performs bounded read-only checks and saves JSON/Markdown evidence. HTTP restrictions, successful redirects, confirmed failures and unresolved network checks remain separate. Its age thresholds are editorial reminders; they never alter official data or mark immutable research releases as expired. Read the report before replacing a source.

The v0.7.108 review recorder is an explicit maintenance operation after inspecting the candidate. It is deliberately excluded from `build.py`: rebuilding must validate the signed file hashes, not silently approve new ones.
