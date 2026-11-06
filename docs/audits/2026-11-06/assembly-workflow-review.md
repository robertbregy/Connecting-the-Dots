# Temporary v0.7.98 assembly workflow

File: `.github/workflows/assemble-audit-release.yml`

SHA256: `c5d8f4e997310c1180d1fb5621b0025de046b7f3813152360fb287f4c3107869`

Size: 5,437 bytes.

The workflow is restricted to a push on `qa/assemble-v0798-20261106` in `robertbregy/Connecting-the-Dots`. The job condition and both shell guards repeat that exact scope. Checkout uses the triggering SHA. The only write permission is `contents: write`, using the checkout action's existing job token. There is no Pages deployment, workflow dispatch, custom token, main update, rebase or force push.

It uses the existing rebuild environment: Ubuntu 24.04, Python 3.12, Node 22 and `npm ci`. It runs the normal build, then repeats it using the existing deterministic-ZIP, frozen historical ZIP and research-render checks copied from the source checkpoint's `rebuild.yml`. After the repeated build, the final files must pass the release checker, exact reviewed-file parity, multilingual, Internet access and static delivery validators. The requested release version is fixed to 0.7.98.

Before committing, the checkout and remote assembly tip must still equal the triggering SHA. Changes to source, scripts, review documentation, workflow files, build driver or package/publication metadata cause failure. Only after all validation does it remove its own workflow. The staged workflow diff must contain exactly that deletion. Generated outputs are committed as a direct child of the source with the normal GitHub Actions bot identity and `[skip build]` in the message. The sole push target is a literal assembly ref. Any rejected push is a failure; concurrent advancement is not accepted as a successful assembly.

The final commit SHA is written to the job summary. Root can create the normal feature branch from that assembled SHA for the unchanged A/B and full browser gates. No production workflow or test threshold is altered.

The temporary workflow must not become a required file fingerprint in the final publication review, because the reviewed assembly output intentionally removes it. The review should cover the final production source/workflow files and final metadata before this branch is created.

## Validation

YAML, Bash and embedded Python syntax passed. Eight fresh local Git fixtures passed: successful generation/removal/push; wrong branch; remote advanced before commit; rejected push; source changed; production workflow changed; remote read failed; and remote advanced during push. Every fixture confirms main remains unchanged. On success the only workflow diff is deletion of the temporary file, source bytes are unchanged and the generated commit is a direct child of the exact source.

Results: `assembly-workflow-tests.json`. Test driver: `test_assembly_workflow.py`. These fixtures do not claim to execute the full publication build or to prove GitHub's remote token policy; that evidence must come from the assembly run. No GitHub ref or remote workflow was created by this preparation.

The push trigger is intentional: an initial `workflow_dispatch` would depend on default-branch workflow availability. Primary documentation: https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow
