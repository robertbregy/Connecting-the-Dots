# Deployment

## Canonical workflow

The GitHub repository is the canonical working master. Ordinary updates are made as Git commits to `main`. The **Rebuild published site** GitHub Action regenerates and validates the static publication, commits generated outputs with `[skip build]`, and GitHub Pages deploys the committed state.

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

## Research releases

Technical/site releases (`v0.x.y`) do not create a new research release. Research releases (`RR1`, `RR2`, …) are milestone snapshots of the evidence base. RR1 is archived on Zenodo with DOI `10.5281/zenodo.23262623`. A new GitHub/Zenodo research release is created only when the evidence set changes materially.

## Build metadata

`publication.json` is the canonical source for the current site version and publication dates. `CITATION.cff` identifies the current immutable research release rather than following every technical site version. `.zenodo.json` stores archival metadata for future research-release deposits.

## Data pack discipline

Technical-only site releases leave the archived downloadable research data pack unchanged. For a new research release that intentionally refreshes it, run:

```bash
CTD_REBUILD_DATA_PACK=1 python3 build.py
```

## Fallback archives

Deterministic deployment/source ZIPs may still be generated for rollback or offline preservation, but they are no longer the normal publication path. Do not stack old browser-upload archives over the repository because omitted files are not deleted by that workflow.

## Verification

After each publish:

1. confirm the **Rebuild published site** action completed successfully;
2. confirm the GitHub Pages workflow completed successfully;
3. verify the live footer/version and key research metadata;
4. run the release checker before any tag or research release;
5. keep the working paper, sitemap, DOI metadata and research-release manifest synchronized.

## robots.txt note

This project is published below `/Connecting-the-Dots/`. Search engines only treat `/robots.txt` at the GitHub Pages host root as authoritative. The project copy is retained for documentation and sitemap discoverability; page-level `meta robots`, canonical metadata and the sitemap remain the effective project-level controls.
