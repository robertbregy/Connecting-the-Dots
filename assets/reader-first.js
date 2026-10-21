/* Small progressive enhancement; navigation itself remains ordinary links and details. */
(function () {
  'use strict';
  const root = document.documentElement;
  if (!root.hasAttribute('data-reader-first')) return;
  const initialTitle = document.title;
  function sync() {
    const current = document.body.dataset.activeTab;
    if (!current) return;
    const section = document.getElementById(current);
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
  // Independent articles do not load the application router. A hash target inside
  // a disclosure must still become visible, both on entry and on local clicks.
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
})();
