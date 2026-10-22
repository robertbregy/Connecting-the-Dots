"""Run independent regression checks without turning failures into skipped coverage."""
from pathlib import Path
import json
import os
import subprocess

CHECKS = [
    ("layout", "scripts/audit_browser_20261010.js", {}),
    ("export-settled", "scripts/audit_20261018_browser.cjs", {"CTD_EXPORT_MODE": "settled"}),
    ("export-cold", "scripts/audit_20261018_browser.cjs", {"CTD_EXPORT_MODE": "cold", "CTD_AUDIT_OUTPUT": "audit-20261018-cold"}),
    ("economics", "scripts/audit_economics_order.cjs", {}),
    ("navigation", "scripts/audit_ia_b2.cjs", {}),
    ("legacy-links", "scripts/audit_legacy_deeplinks.cjs", {}),
    ("accessibility", "scripts/audit_axe_20261010.js", {}),
    ("usability-remediation", "scripts/usability_remediation_qa.cjs", {}),
]

def main() -> int:
    results = []
    output = Path("audit-regression-logs")
    output.mkdir(exist_ok=True)
    for name, script, overrides in CHECKS:
        with (output / (name + ".log")).open("w") as log:
            try:
                result = subprocess.run(["node", script], env={**os.environ, **overrides}, stdout=log, stderr=subprocess.STDOUT, timeout=720)
                code = result.returncode
            except subprocess.TimeoutExpired:
                code = 124
                log.write("\nCheck exceeded 720 seconds; other checks will still run.\n")
        results.append({"check": name, "script": script, "exitCode": code, "passed": code == 0})
        Path("audit-regression-status.json").write_text(json.dumps({"checks": results, "passed": all(r["passed"] for r in results)}, indent=2) + "\n")
        print(json.dumps(results[-1]), flush=True)
    return int(any(not r["passed"] for r in results))

if __name__ == "__main__":
    raise SystemExit(main())
