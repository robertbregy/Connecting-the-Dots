"""Narrow, idempotent compatibility corrections from the full legacy browser audit.

No scientific data, published archives or editorial content is rewritten.
The original Economics browser assertions are deliberately left unchanged.
"""
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parent.parent

def replace_once(path, before, after):
    target = ROOT / path
    text = target.read_text(encoding='utf-8')
    if after in text:
        return
    if text.count(before) != 1:
        raise SystemExit('Missing or ambiguous inspected patch: ' + path)
    target.write_text(text.replace(before, after, 1), encoding='utf-8')

# Economics has a separate six-stage hierarchy and focus-aware contents.
# Skip the legacy TOC generator only for chapters replaced by reader-first TOCs.
old = "function renderSectionTocs(){if(document.documentElement.hasAttribute('data-reader-first'))return;for(const id of ['beyond','geography','social','economics','contention','disputes','strange','sources']){const sec="
new = "function renderSectionTocs(){const readerFirst=document.documentElement.hasAttribute('data-reader-first');for(const id of ['beyond','geography','social','economics','contention','disputes','strange','sources']){if(readerFirst&&id!=='economics')continue;const sec="
replace_once('assets/app.js', old, new)
replace_once('scripts/reader_first_install.py',
             'if guard not in text:',
             'if guard not in text and "const readerFirst=document.documentElement.hasAttribute(\'data-reader-first\');" not in text:')

# The exhaustive 26-card body-click test already passed on mobile. Its later
# duplicate Economics check lacked the visible-pointer safeguards used above.
# Require that the real pointer hits the intended link, never force a DOM click.
old_click = '''    await economicsDescription.evaluate(el=>el.scrollIntoView({behavior:"instant",block:"center"}));
    await page.waitForTimeout(100);
    const paragraphBox=await economicsDescription.boundingBox();
    assert.ok(paragraphBox,"economics card description missing");
    await page.mouse.click(paragraphBox.x+8,paragraphBox.y+Math.min(8,paragraphBox.height/2));'''
new_click = '''    const pointerSamples=[];
    let economicsPointer=null;
    for(let attempt=0;attempt<6;attempt++){
      await economicsDescription.evaluate(el=>{
        const r=el.getBoundingClientRect();
        const overlays=[...document.querySelectorAll('.topbar,.iaPrimaryNav')]
          .filter(n=>['sticky','fixed'].includes(getComputedStyle(n).position))
          .map(n=>n.getBoundingClientRect().bottom);
        const safeTop=Math.max(0,...overlays)+16;
        const y=safeTop+(innerHeight-safeTop)/2;
        window.scrollBy({top:r.top+Math.min(8,r.height/2)-y,behavior:'instant'});
      });
      await page.waitForTimeout(120);
      const sample=await economicsDescription.evaluate(el=>{
        const r=el.getBoundingClientRect();
        const x=r.left+8,y=r.top+Math.min(8,r.height/2);
        const hit=document.elementFromPoint(x,y)?.closest('a');
        return {x,y,scrollY,hit:hit?.getAttribute('data-open-section')||null,
          href:hit?.getAttribute('href')||null,inside:x>=0&&x<innerWidth&&y>=0&&y<innerHeight};
      });
      pointerSamples.push(sample);
      if(sample.inside&&sample.hit==='economics'){
        economicsPointer=sample;
        break;
      }
    }
    tally.economicsPointerSamples=pointerSamples;
    assert.ok(economicsPointer,'Economics description is not pointer-accessible: '+JSON.stringify(pointerSamples));
    await page.mouse.click(economicsPointer.x,economicsPointer.y);'''
replace_once('scripts/audit_ia_b2.cjs', old_click, new_click)
replace_once('scripts/reader_first_review.cjs',
             "'scripts/reader_first_serialization.cjs', 'assets/reader-first.js'",
             "'scripts/reader_first_serialization.cjs', 'scripts/reader_first_compat.py', 'scripts/audit_ia_b2.cjs', '.github/workflows/reader-first.yml', 'assets/reader-first.js'")

for script in ['assets/app.js', 'scripts/audit_ia_b2.cjs', 'scripts/reader_first_review.cjs']:
    subprocess.run(['node', '--check', str(ROOT / script)], check=True)
print('READER_LEGACY_COMPATIBILITY_APPLIED: Economics semantics retained; real pointer assertions strengthened; data unchanged')
