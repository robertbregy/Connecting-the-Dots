# Repository protection plan

Verified on 16 October 2026: `main.protected=false`. The connected GitHub capability does **not** expose administrative ruleset creation, so this repository **is not yet protected**.

Safety branch `safety/main-20261016-pre-observatory` points to the pre-change commit `d785cade202f795eb82d50100d864c2a68215d3f`. Planned feature branch: `feat/observatory-20261016`.

## Repository owner action

Open https://github.com/robertbregy/Connecting-the-Dots/settings/rules and establish an active branch ruleset for `main` that blocks deletion and force pushes and requires verified pull request checks. Use the **actual** check contexts shown after running the APS integrity workflow and the existing browser/WCAG audit. Preserve an auditable emergency procedure; don't impose an unattainable approval rule on a single-maintainer project.

**Critical compatibility caveat:** `.github/workflows/rebuild.yml` currently uses `contents:write` and commits generated HTML/data artifacts to the triggering branch, including `main`. Requiring PRs for every write can block this bot. Either migrate publication to a separate checked deploy path, or explicitly test a narrowly scoped GitHub Actions bypass. Do not silently force changes to branch rules and break the live site.

Protect the immutable research tags `RR1` and `RR2` from rewriting and deletion if supported by the repository's plan. Research tags must never be force-moved.

Before any merge: confirm actual checks, source provenance, language coverage and visual/browser QA. After a merge: confirm deployed Pages SHA and important live URLs. A green GitHub commit alone is not deployment proof.


## Technical package identity after the 19 October audit

`data/frozen_technical_packages.json` locks every package published before v0.7.87 by SHA-256. The builder refuses either a changed protected ZIP or reuse of its version as the current release. Before preparing the next release, add the final published v0.7.87 package hash to that registry, then select a new version. Do not merge the separate `feat/tld-power-adoption-20261019` draft under its already published v0.7.86 number. Reconcile its registered-domain metric with the current separate zone-domain and surveyed-website measures before incorporating any of its content. This is a local integration risk; the draft was not published by this audit fix. Current bibliography corrections are appended outside the frozen RR1/RR2 metadata; the current CFF permits only the verified one-field date correction and retains exact protection of all other bytes.
