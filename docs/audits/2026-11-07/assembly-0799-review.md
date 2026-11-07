# Temporary v0.7.99 assembly workflow — review

**Result: PASS for the prepared workflow. No product checkout or remote ref was changed.**

The deliverable is `assemble-audit-release-0799.yml`. When the v0.7.99 source checkpoint and exact review are final, it is intended to be added under the canonical temporary path `.github/workflows/assemble-audit-release.yml` on **`qa/assemble-v0799-20261107` only**.

The workflow differs from the supplied v0.7.98 reference only in release/date/branch identity and two final read-only gates. The supplied reference matches the workflow successfully executed in run **42311673214**, source commit **1af7e7f25264ae2d5c71859564fe000448e2d8c6**, except for a trailing blank line.

## Preserved behavior

- Exact triggering-SHA checkout, complete baseline history, repository and literal branch guards.
- Remote source-tip checks before the build and before staging; ordinary push to the same literal assembly branch, with failure on error and no retry, rebase or force.
- Python 3.12, Node 22 and `npm ci`, with no new dependency or browser installation.
- Two complete builds; current ZIP, historical legacy ZIP and research manuscript determinism comparisons.
- Final version assertion, release checker, exact reviewed-source parity, multilingual, Internet access and static-delivery gates.
- Refusal to commit source, review, dependency or workflow drift. The only workflow deletion allowed by the staged diff is the temporary workflow itself.
- A direct child of the triggering source commit, with the explicit `[skip build]` marker.

## Added gates

Both gates execute after the second build, before staging:

1. `node scripts/atlas_state_qa.cjs` exercises the actual Atlas code and frozen corpus in a DOM across four languages and both native/standalone surfaces.
2. `node scripts/usability_remediation_qa.cjs --static-only` checks all five rendered pages, exact review/source protection, historical anchors and links, and immutable research references.

Their reports go under `$RUNNER_TEMP`, outside the checkout. They therefore cannot enter the assembled commit through `git add -A`. These checks do not launch Chromium and do not replace the later full browser acceptance suite.

## Verification

`check-assembly-0799.py` passed **24/24** structural and shell checks. The comparison proves the write/source-protection steps and determinism code are unchanged after the explicit identity substitutions. YAML parsed successfully; every `run` block passed `bash -n`.

- Workflow SHA256: `baa2e44c9885559ca8717866b5c7c20e134ac8061099457c0f7f988ba7bcf545`
- Detailed proof: `assembly-0799-review.json`
- Reproduction: `python3 check-assembly-0799.py`

The complete v0.7.99 exact-file review and all source inputs must exist before publishing the assembly source ref. Any generated source/metadata drift remains an error under the preserved source guard. After assembly, the resulting commit still requires its own A/B and complete browser run before promotion to main. No v0.7.99 remote assembly, browser result or deployment is claimed by this review.
