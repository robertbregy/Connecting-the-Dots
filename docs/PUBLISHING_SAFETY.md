# Publishing safety and data provenance

The repository is a **living technical site** with **immutable scientific releases**. Never conflate site version, snapshot date, public APS application list and Zenodo RR1/RR2 DOI.

## Safe publication sequence

1. Prepare changes on `feat/**`. GitHub Actions rebuilds all derived assets, runs integrity and multilingual checks and commits generated outputs **to that feature branch**.
2. Open a pull request to `main` from the completed generated commit through the maintainer or GitHub connector. The read-only browser, archival-parity and focus workflows run on every PR to `main`, including documentation-only changes. Require all seven checks listed below, including 192 WCAG A/AA scans plus independent mobile/Explorer checks. Fix failures before promotion.
3. Merge the verified pull request to `main`; make a `safety/**` rollback ref first. Use the repository's enabled merge-commit method and include `[skip build]` in the merge commit message so protected `main` publishes the reviewed files without a generated follow-up write. Do not amend or force-update research tags RR1/RR2.
4. GitHub Pages must deploy the *exact promoted SHA*. Require the actual deployment step and a live-byte report with `status: verified` and `verified: true` for that SHA. Verify HTTP 200 and live canonical/JSON-LD versions; inspect post-publish browser checks when triggered. The seven required PR checks remain mandatory for documentation-only PRs as well.
5. Current technical ZIP must have matching manifest version, member bytes, SHA-256 sidecar and correct public link. Preserve historic ZIP v0.7.58.

## Required PR checks and branch protection

The seven PR checks are enforced by active ruleset [Protect main - reviewed publication](https://github.com/robertbregy/Connecting-the-Dots/rules/26778298), verified on 8 November 2026: `main.protected=true`, only `refs/heads/main` is targeted, and there are no bypass actors. Workflow changes alone do not activate or modify an administrative ruleset; the installed GitHub connector has no branch protection / ruleset write capability. [`main-protection-policy.json`](main-protection-policy.json) records the intended settings, while GitHub remains the source of truth. The following configuration is retained for administrator verification and maintenance:

Inspect **GitHub repository > Settings > Rules > Rulesets > Protect main - reviewed publication** (ruleset `26778298`). Create a new branch ruleset only when restoring this configuration where it does not already exist; target `main` and mark it active.

- Target only `refs/heads/main`; leave the bypass list empty, including GitHub Actions.
- Block force pushes and branch deletion. Require pull requests with **zero required approvals**, without code-owner or last-push approval requirements; a maintainer cannot approve their own PR.
- Require these exact check names, with **GitHub Actions** as their source and the branch required to be up to date:
  - `browser-qa`
  - `Independent four-language and Explorer audit`
  - `APS Atlas all-language interaction and mobile regression`
  - `City namespace four-language and accessibility audit`
  - `Audit corrections, mobile semantics and controlled performance`
  - `compare`
  - `focus-reflow`
- Leave **Restrict updates** off: with no bypass actors it would prevent normal updates. Do not require linear history while the repository permits only merge commits.
- Do not require `rebuild`, `deploy`, `verify-live` or the post-main standalone B2 check before merging. Those jobs may intentionally be skipped or depend on publication after the merge.
- After enabling, confirm the feature-branch rebuild bot is permitted to write to `feat/**` but cannot bypass the rules on `main`.
- Check that Pages still deploys from the protected, reviewed `main`.

The `compare` check validates committed outputs without rebuilding. A source-only PR must not be merged: its generated files must be committed and verified before promotion, so the rebuild never needs to write an unreviewed follow-up commit to protected `main`.

A push performed with `GITHUB_TOKEN` does not trigger ordinary push workflows. Open the PR after generation, or inspect the approval-required PR workflow runs when the rebuild bot updates an existing PR. A maintainer may need to select **Approve workflows to run**. Do not use `workflow_dispatch` success as a substitute for an eligible required PR check. No token expansion or bot bypass is needed for this process.

Do not mark branch protection done before GitHub reports the configured active rules for `main`. Also confirm those rules do not apply to `feat/**`.

## Official APS data

Official source: https://newgtldprogram-aps.icann.org/applications
Export endpoint: https://newgtldprogram-aps.icann.org/aps/applications/export/csv

Acquired 11 October 2026; source SHA-256 `a3e2bdba5d3950e87f173e3f576413d9600a6651c99b6946c35bcfd0b9d3553b`, normalized CSV SHA-256 `520ea8433b96322816fb03fa66072acc29e7251e16839093b4446ada401bd887`.

**2,783 rows = 1,614 published base application IDs + 1,169 replacement rows**. Official statistics: 1,615 applications. Missing published listing: WDO2627T-T45217, pending administrative check. These are different from 980 distinct primary strings in the secondary nTLDData index and from individually archived application questionnaires. Keep the ICANN notice that `In Contention=false` is not a reliable negative determination before String Evaluation.

Reconcile fresh sources after String Confirmation Day 17 November. Do not silently alter old dated snapshots.

## Communication / monitoring limits

Connected condition-watch automations may be enabled while notification delivery is disabled by the user's notification configuration. Treat them as scheduled checks, **not reliable user alerts**, until the user has enabled delivery in ChatGPT's notifications.
