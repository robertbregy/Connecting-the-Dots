// Repair the actual reader URL restoration on initial browser load.
// This file only patches the presentation-layer enhancement script.
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const p='assets/reader-first.js';
const src=fs.readFileSync(p,'utf8');
const expected='16542b3d8b4506ca04aee3e6e9aada3c05d8c29d04165cb4f3fcb4ef3633c010';
assert.equal(crypto.createHash('sha256').update(src).digest('hex'),expected,'Unexpected baseline reader-first.js; manual source review required');
const hook="  window.addEventListener('hashchange', revealHash);\n  revealHash();\n})();";
assert.equal(src.split(hook).length,2,'Reader-first enhancement hook moved');
const patch=`  window.addEventListener('hashchange', revealHash);
  revealHash();

  // A routed deep link may scroll before the late-rendered article has settled.
  // Reconcile the initial hash only, with the same fixed-header offset used by
  // the application. Never commandeer scrolling after a user interaction.
  (function restoreInitialAnchorVisibility() {
    if (!location.hash || !document.body.dataset.activeTab) return;
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch (_) { return; }
    const anchor = document.getElementById(id);
    if (!anchor || anchor.closest('.section')?.id !== document.body.dataset.activeTab) return;
    const openingUrl = location.pathname + location.search + location.hash;
    let cancelled = false;
    const cancel = () => { cancelled = true; };
    for (const event of ['wheel', 'touchstart', 'pointerdown', 'keydown']) {
      window.addEventListener(event, cancel, {once:true, passive:true});
    }
    function offset() {
      let px = 12;
      for (const selector of ['.topbar', '.iaPrimaryNav', '.nav', '.mobileNavWrap']) {
        const el = document.querySelector(selector);
        if (!el) continue;
        const style = getComputedStyle(el);
        if (style.display === 'none' || (style.position !== 'sticky' && style.position !== 'fixed')) continue;
        px += el.getBoundingClientRect().height || 0;
      }
      return Math.ceil(px);
    }
    function ensureVisible() {
      if (cancelled || location.pathname + location.search + location.hash !== openingUrl ||
          !anchor.isConnected || anchor.closest('.section')?.id !== document.body.dataset.activeTab) return;
      const box = anchor.getBoundingClientRect();
      if (!box.height || (box.top >= 0 && box.top < innerHeight - 12)) return;
      window.scrollTo({top: Math.max(0, scrollY + box.top - offset()), behavior: 'instant'});
    }
    window.addEventListener('load', () => {
      requestAnimationFrame(() => requestAnimationFrame(ensureVisible));
      setTimeout(ensureVisible, 150);
      setTimeout(ensureVisible, 450);
    }, {once:true});
  })();
})();`;
const out=src.replace(hook,patch);
assert.notEqual(out,src);
fs.writeFileSync(p,out);
console.log('W95_INITIAL_ROUTE_SCROLL_RESTORATION_PATCHED');
