# Deployment

## Browser upload

Use `Connecting-the-Dots-vX.Y.Z-PUBBLICAZIONE.zip`. Extract it locally, remove obsolete repository files that are not present in the archive, then upload the archive contents to the repository root. The deploy archive is intentionally limited to 99 files.

A Git commit is the recommended deployment path because it records deletions correctly:

```bash
git checkout main
git pull --ff-only
# replace the working tree with the PUBBLICAZIONE archive contents
git add -A
git commit -m "Publish Connecting the Dots vX.Y.Z"
git push origin main
```

Do not stack browser-upload ZIPs over older repository contents without removing obsolete files. That practice leaves stale data and documentation behind.

## Rebuild from source

Use the SOURCE archive:

```bash
npm ci
python3 build.py
python3 scripts/release_check.py
python3 scripts/package_release.py --kind deploy
python3 scripts/package_release.py --kind source
```

`npm ci` uses the committed lockfile. The primary prerenderer is Node + linkedom. The optional Python fallback requires the packages listed in `requirements-fallback.txt` plus Chromium; set `CHROMIUM_PATH` if Chromium is not discoverable on `PATH`.

## Release discipline

Create a Git tag and GitHub Release for each published version, attach both archives and record their SHA-256 hashes. The live `main` branch is mutable; a release tag is the immutable citation/rollback point.

## Known stale browser-upload residues

Browser uploads overwrite matching paths but do not delete files omitted by later releases. Before or immediately after publishing v0.7.36, remove these obsolete repository-root files if they are still present:

- `REDEPLOY_FULL.md`
- `start.command`

`RELEASE_NOTES_0.7.4.md` may remain only as an explicitly historical release note. `DEPLOY.md` and `package-lock.json` must match the current source release rather than an older browser-upload residue.
