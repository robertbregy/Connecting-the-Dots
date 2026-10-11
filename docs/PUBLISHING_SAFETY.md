# Publishing safety and data provenance

The repository is a **living technical site** with **immutable scientific releases**. Never conflate site version, snapshot date, public APS application list and Zenodo RR1/RR2 DOI.

## Safe publication sequence

1. Prepare changes on `feat/**`. GitHub Actions rebuilds all derived assets, runs integrity and multilingual checks and commits generated outputs **to that feature branch**.
2. Require the `browser-qa` job of the Full browser and WCAG regression audit, including 160 WCAG A/AA scans plus independent mobile/Explorer checks. Fix failures before promotion.
3. Fast-forward a verified feature commit, preferably via pull request, to `main`; make a `safety/**` rollback ref first. Do not amend or force-update research tags RR1/RR2.
4. GitHub Pages must deploy the *exact promoted SHA*. Verify HTTP 200, live canonical/JSON-LD versions, and the post-publish `browser-qa` run.
5. Current technical ZIP must have matching manifest version, member bytes, SHA-256 sidecar and correct public link. Preserve historic ZIP v0.7.58.

## Branch protection: requires a manual repository-admin change

The installed GitHub connector has no branch protection / ruleset write capability. An updated workflow cannot prevent **every** direct push to an unprotected `main`. The repository owner must visit:

**GitHub repository > Settings > Rules > Rulesets > New branch ruleset**, target `main`, mark it active.

- Block force pushes and deletion; require successful browser-qa/release integrity checks.
- Require pull requests when the repository's permissions and one-person reviewer model can support them. Avoid requiring self-approval (not permitted by GitHub).
- After enabling, confirm the feature-branch rebuild bot is permitted to write to `feat/**` but **not** to bypass reviews on `main`.
- Check that Pages still deploys from the protected, reviewed `main`.

Do not mark branch protection done before GitHub reports main as protected.

## Official APS data

Official source: https://newgtldprogram-aps.icann.org/applications
Export endpoint: https://newgtldprogram-aps.icann.org/aps/applications/export/csv

Acquired 11 October 2026; source SHA-256 `a3e2bdba5d3950e87f173e3f576413d9600a6651c99b6946c35bcfd0b9d3553b`, normalized CSV SHA-256 `520ea8433b96322816fb03fa66072acc29e7251e16839093b4446ada401bd887`.

**2,783 rows = 1,614 published base application IDs + 1,169 replacement rows**. Official statistics: 1,615 applications. Missing published listing: WDO2627T-T45217, pending administrative check. These are different from 980 distinct primary strings in the secondary nTLDData index and from individually archived application questionnaires. Keep the ICANN notice that `In Contention=false` is not a reliable negative determination before String Evaluation.

Reconcile fresh sources after String Confirmation Day 17 November. Do not silently alter old dated snapshots.

## Communication / monitoring limits

Connected condition-watch automations may be enabled while notification delivery is disabled by the user's notification configuration. Treat them as scheduled checks, **not reliable user alerts**, until the user has enabled delivery in ChatGPT's notifications.
