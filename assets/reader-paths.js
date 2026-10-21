/* Progressive enhancement only: reading routes, labels and indexes are static HTML. */
(() => {
  'use strict';
  function initialize() {
    // The legacy runtime rebuilds a flat heading index. The editorial build already
    // provides a complete, ordered disclosure; remove only this duplicate navigation.
    // Observe direct children of those chapters, never the document or its data grids.
    document.querySelectorAll('.section[data-reader-has-index]').forEach(section => {
      const reconcile = () => {
        section.querySelectorAll(':scope > nav.sectionToc').forEach(nav => nav.remove());
      };
      reconcile();
      new MutationObserver(reconcile).observe(section, {childList:true});
    });
    document.documentElement.dataset.readerEnhancement = 'ready';
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, {once:true});
  else initialize();
})();
