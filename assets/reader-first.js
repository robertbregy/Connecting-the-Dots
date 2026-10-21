/* Progressive enhancement; navigation remains ordinary links and native details. */
(function () {
  'use strict';
  const root = document.documentElement;
  if (!root.hasAttribute('data-reader-first') && !document.body.hasAttribute('data-reader-first')) return;
  root.dataset.readerFirst = '1';
  const initialTitle = document.title;
  // Keep the first phone screen for the article, not a long contents list.
  // This runs once; it never overrides a reader's later disclosure choices.
  if (window.matchMedia('(max-width:700px)').matches) {
    for (const details of document.querySelectorAll('.readerToc > details')) details.open = false;
  }
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
