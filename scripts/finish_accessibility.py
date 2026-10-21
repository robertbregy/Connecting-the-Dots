"""Resolve keyboard-scroll and target-size findings; collect all remaining findings."""
from pathlib import Path
import json
root=Path(__file__).resolve().parents[1]
def patch(name,a,b):
 p=root/name;s=p.read_text()
 if b in s and a not in s:return
 assert s.count(a)==1,'Patch is not unique: '+name+' '+a[:80]
 p.write_text(s.replace(a,b,1))
p=root/'data/reader_journeys.json';d=json.loads(p.read_text())
for lang,label in {'it':'Dati della tabella','en':'Table data','de':'Tabellendaten','fr':'Donn\u00e9es du tableau'}.items():d['locales'][lang]['ui']['table']=label
p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
# These containers can scroll horizontally on a narrow viewport. Give the
# native scroll area keyboard access without altering its data or table roles.
patch('scripts/reorder_reader_journeys.cjs'," const js=el('script');",r''' for(const box of document.querySelectorAll('.tableWrap,.tldTable')){
  if(box.matches('table')||!box.querySelector('table'))continue;
  if(!box.hasAttribute('tabindex'))box.setAttribute('tabindex','0');
  if(!box.hasAttribute('role'))box.setAttribute('role','region');
  if(!box.hasAttribute('aria-label')&&!box.hasAttribute('aria-labelledby')){
   const caption=box.querySelector('caption')?.textContent.trim();
   const heading=box.closest('.panel,.tldResearch,.readerStage')?.querySelector('h1,h2,h3')?.textContent.trim();
   box.setAttribute('aria-label',caption||heading||U.table);
  }
 }
 const js=el('script');''')
p=root/'assets/reader-journeys.css';s=p.read_text()
if 'Keyboard table access and adequately sized source targets' not in s:
 s+='''\n/* Keyboard table access and adequately sized source targets. */
.iaPrimaryNav{background:var(--bg)}
.tableWrap[tabindex]:focus-visible,.tldTable[tabindex]:focus-visible{outline:3px solid var(--accent-text);outline-offset:4px}
.tldSources a,.sourceCluster a,.srcs a,.eventSources a{display:inline-flex;align-items:center;min-height:28px;min-width:24px;max-width:100%;padding:3px 5px;line-height:1.5;overflow-wrap:anywhere}
.tldSources{row-gap:8px}
@media(max-width:700px){.iaPrimaryNav>a{font-size:12px;min-height:44px}}
'''
p.write_text(s)
# Do not stop the accessibility census at the first failing chapter. Every
# violation is still fatal at the end, but all chapters and themes are observed.
patch('scripts/audit_reader_journeys.cjs',"assert.deepEqual(result.violations.map(v=>({id:v.id,impact:v.impact,targets:v.nodes.map(n=>n.target)})),[],id+' '+theme+' accessibility');", "report.axeScans=(report.axeScans||0)+1;\n    if(result.violations.length)report.issues.push({kind:'accessibility',lang,width,chapter:id,theme,violations:result.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,html:n.html,summary:n.failureSummary}))}))});")
patch('scripts/audit_reader_journeys.cjs',"assert.deepEqual(errors,[],'Runtime errors');report.scenarios.push(","assert.deepEqual(errors,[],'Runtime errors');assert.ok(!report.issues.some(x=>x.lang===lang&&x.width===width),'Recorded accessibility findings must be resolved');report.scenarios.push(")
print('KEYBOARD_AND_SOURCE_TARGETS_REPAIRED')
