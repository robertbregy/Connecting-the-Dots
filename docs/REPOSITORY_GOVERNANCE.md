# Repository governance

## Current main protection

Verified on 8 November 2026: `main.protected=true`. Active ruleset [Protect main - reviewed publication](https://github.com/robertbregy/Connecting-the-Dots/rules/26778298) targets only `refs/heads/main`. It blocks deletion and force pushes, requires pull requests with zero required approvals, and requires all seven GitHub Actions checks in [`main-protection-policy.json`](main-protection-policy.json), with the branch up to date. Merge commits are the enabled merge method. The bypass list is empty, including GitHub Actions; feature branches remain outside this ruleset.

The policy file records the intended configuration; the active GitHub rules remain the source of truth. The connected GitHub capability does not expose ruleset administration. An owner can inspect the actual settings at https://github.com/robertbregy/Connecting-the-Dots/settings/rules.

## Publication with protected main

Prepare source and generated outputs on `feat/**`. `.github/workflows/rebuild.yml` may commit generated files to that feature branch. Open the PR from the completed, reviewed generated commit, pass all required checks, create a `safety/**` rollback ref, and merge using a merge commit whose message includes `[skip build]`. Pages validates and deploys that exact promoted SHA without a generated follow-up write to `main`. No GitHub Actions bypass is needed. Follow [`../DEPLOY.md`](../DEPLOY.md) and [`PUBLISHING_SAFETY.md`](PUBLISHING_SAFETY.md).

Before any merge: confirm actual checks, source provenance, language coverage and visual/browser QA. After a merge: confirm the actual deployment step and live-byte verification for the promoted SHA. A green GitHub workflow that skipped deployment or live verification is not publication proof.

## Research tag protection

Verified again on 10 November 2026: ruleset [Protect immutable research tags RR1 and RR2](https://github.com/robertbregy/Connecting-the-Dots/rules/26789664) is **active**. It targets exactly `refs/tags/RR1` and `refs/tags/RR2`, restricts updates and deletion, and has no bypass actors. The administrator completed the import on 8 November; no further import is required.

The tag protection is distinct from GitHub Release's `immutable` flag. RR1 and RR2 remain the existing scientific deposits and must not be moved, recreated or republished as part of a technical-site update. Their targets are `5d52274935cda7712172873f46d456e4c0a09c7e` (RR1) and `33803aa3fa69f1abb4cce7fbd49a0788ee9a33c9` (RR2). The preserved [import proposal](research-tags-ruleset.json) documents the configuration; GitHub's active ruleset is authoritative.

## Current technical package discipline

Use `publication.json` for the current technical version and `data/frozen_technical_packages.json` for protected historical package hashes. Before preparing a new technical release, preserve the final published package in that registry and select a new version. Do not reuse a published package version or rewrite RR1/RR2 metadata for a technical update.

## Historical checkpoints

On 16 October 2026, `main.protected=false`. Safety branch `safety/main-20261016-pre-observatory` pointed to pre-change commit `d785cade202f795eb82d50100d864c2a68215d3f`; the planned feature branch was `feat/observatory-20261016`. This is the historical baseline, superseded by the active main protection above.

### Technical package identity after the 19 October audit

The following audit note is preserved as historical context. Its version-specific integration instructions describe that checkpoint, not the current next-release procedure:

> `data/frozen_technical_packages.json` locks every package published before v0.7.87 by SHA-256. The builder refuses either a changed protected ZIP or reuse of its version as the current release. Before preparing the next release, add the final published v0.7.87 package hash to that registry, then select a new version. Do not merge the separate `feat/tld-power-adoption-20261019` draft under its already published v0.7.86 number. Reconcile its registered-domain metric with the current separate zone-domain and surveyed-website measures before incorporating any of its content. This is a local integration risk; the draft was not published by this audit fix. Current bibliography corrections are appended outside the frozen RR1/RR2 metadata; the current CFF permits only the verified one-field date correction and retains exact protection of all other bytes.
