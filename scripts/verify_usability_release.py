"""Independent browser groups retain every result and never publish changes."""
from pathlib import Path
import json
import os
import subprocess
import time

GROUPS = {
    'focused': [('focused', 'scripts/usability_remediation_qa.cjs', {})],
    'exports': [('settled', 'scripts/audit_20261018_browser.cjs', {'CTD_EXPORT_MODE': 'settled'}), ('cold', 'scripts/audit_20261018_browser.cjs', {'CTD_EXPORT_MODE': 'cold', 'CTD_AUDIT_OUTPUT': 'audit-20261018-cold'})],
    'navigation': [('legacy', 'scripts/audit_legacy_deeplinks.cjs', {}), ('economics', 'scripts/audit_economics_order.cjs', {}), ('cards', 'scripts/audit_ia_b2.cjs', {})],
    'accessibility': [('axe', 'scripts/audit_axe_20261010.js', {}), ('audience', 'scripts/audit_audience.cjs', {}), ('city', 'scripts/audit_city_namespace.cjs', {})],
}
group = os.environ['AUDIT_GROUP']
results = []
Path('audit-logs').mkdir(exist_ok=True)
with open('/tmp/usability-http.log', 'w') as log:
    server = subprocess.Popen(['python3', '-m', 'http.server', '8123', '--bind', '127.0.0.1'], stdout=log, stderr=subprocess.STDOUT)
    try:
        time.sleep(2)
        assert server.poll() is None, 'Local audit server failed'
        for name, script, overrides in GROUPS[group]:
            with Path('audit-logs/' + name + '.log').open('w') as out:
                try:
                    code = subprocess.run(['node', script], env={**os.environ, **overrides}, stdout=out, stderr=subprocess.STDOUT, timeout=720).returncode
                except subprocess.TimeoutExpired:
                    code = 124
            results.append({'check': name, 'exitCode': code, 'passed': code == 0})
            Path('audit-group-status.json').write_text(json.dumps({'sourceCommit': os.environ['GITHUB_SHA'], 'group': group, 'checks': results, 'passed': all(x['passed'] for x in results)}, indent=2) + '\n')
            print(results[-1], flush=True)
    finally:
        server.terminate()
        server.wait(timeout=10)
raise SystemExit(int(any(not x['passed'] for x in results)))
