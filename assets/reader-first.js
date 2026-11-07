/* Progressive enhancement; navigation remains ordinary links and native details. */
(function () {
  'use strict';
  const root = document.documentElement;
  if (!root.hasAttribute('data-reader-first') && !document.body.hasAttribute('data-reader-first')) return;
  root.dataset.readerFirst = '1';
  const initialTitle = document.title;
  let activeHeading = null;
  // Keep the first phone screen for the article, not a long contents list.
  // This runs once; it never overrides a reader's later disclosure choices.
  if (window.matchMedia('(max-width:700px)').matches) {
    for (const details of document.querySelectorAll('.readerToc:not(.readerTocCurated) > details')) details.open = false;
  }
  function sync() {
    const current = document.body.dataset.activeTab;
    const section = current && document.getElementById(current);
    // The complete no-JS document keeps H1 > H2. A routed view exposes its
    // existing primary heading at level 1 without replacing a focused node.
    const heading = section && section.querySelector('.readerChapterTitle, .iaHubHead h2');
    if (activeHeading && activeHeading !== heading) activeHeading.removeAttribute('aria-level');
    if (heading) heading.setAttribute('aria-level', '1');
    activeHeading = heading;
    if (!current) return;
    const question = section && section.dataset.readerTitle;
    const hubTitle = section && section.querySelector('.iaHubHead h2');
    document.title = question ? question + ' | Connecting the Dots' : hubTitle ? hubTitle.textContent.trim() + ' | Connecting the Dots' : initialTitle;
    const skip = document.querySelector('.skipLink');
    if (skip) skip.setAttribute('href', document.getElementById('reader-start-' + current) ? '#reader-start-' + current : '#main-content');
  }
  const observer = new MutationObserver(sync);
  observer.observe(document.body, {attributes: true, attributeFilter: ['data-active-tab']});
  window.addEventListener('pageshow', sync);
  sync();
  function revealHash() {
    if (document.body.dataset.activeTab) return;
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch (_) { return; }
    const target = document.getElementById(id);
    if (!target) return;
    for (let n = target; n; n = n.parentElement) if (n.tagName === 'DETAILS') n.open = true;
  }
  window.addEventListener('hashchange', revealHash);
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
})();
