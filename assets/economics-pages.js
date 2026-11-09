/* Small enhancements for the complete Economics reading documents.
 * Evidence, sources, links and both market tables are already in the HTML.
 */
(() => {
  'use strict';
  function init() {
    const page = document.body.dataset.economicsPage;
    if (!page) return;
    const root = document.documentElement;
    const labels = JSON.parse(document.getElementById('economics-page-labels').textContent);
    const marketKeys = ['market', 'origin', 'mq', 'marketall'];
    const languageLinks = [...document.querySelectorAll('.discoveryLanguages a[data-language]')]
      .map(link => ({link, destination: new URL(link.getAttribute('href'), location.href)}));

    function syncLanguages() {
      const current = new URL(location.href);
      for (const {link, destination} of languageLinks) {
        const url = new URL(destination.href);
        if (page === 'market') for (const key of marketKeys) {
          if (current.searchParams.has(key)) url.searchParams.set(key, current.searchParams.get(key));
        }
        url.hash = current.hash;
        link.href = url.href;
      }
    }

    function revealFragment() {
      let id;
      try { id = decodeURIComponent(location.hash.slice(1)); } catch (_) { return; }
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      for (let node = target; node; node = node.parentElement) {
        if (node.tagName === 'DETAILS') node.open = true;
      }
      const panel = target.closest('[data-market-panel]');
      if (panel?.hidden) {
        document.querySelector(`[data-market-view="${panel.dataset.marketPanel}"]`)?.click();
      }
      const openingURL = location.href;
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (location.href !== openingURL || !target.isConnected) return;
        if (!target.matches('a[href],button,input,select,textarea,summary,[tabindex],[contenteditable="true"]')) target.setAttribute('tabindex', '-1');
        target.focus({preventScroll: true});
        target.scrollIntoView({block: 'start', behavior: 'instant'});
      }));
    }

    function marketViewChanged() {
      // Once a reader switches rankings, an old panel-specific hash must not
      // reopen the previous ranking on reload or when the URL is shared.
      let id;
      try { id = decodeURIComponent(location.hash.slice(1)); } catch (_) { id = ''; }
      const panel = id && document.getElementById(id)?.closest('[data-market-panel]');
      if (panel?.hidden) {
        const url = new URL(location.href);
        url.hash = 'tld-market-reach';
        history.replaceState(history.state, '', url);
      }
      syncLanguages();
    }

    const share = document.querySelector('[data-economics-share]');
    const status = document.getElementById('economics-share-status');
    if (share) {
      share.hidden = false;
      share.addEventListener('click', async () => {
        status.textContent = '';
        const url = location.href;
        if (navigator.share) {
          try { await navigator.share({title: document.title, url}); return; }
          catch (error) { if (error.name === 'AbortError') return; }
        }
        try {
          await navigator.clipboard.writeText(url);
          status.textContent = labels.copied;
        } catch (_) {
          status.textContent = labels.copyManually;
        }
      });
    }

    document.addEventListener('ctd:viewchange', marketViewChanged);
    window.addEventListener('popstate', syncLanguages);
    window.addEventListener('hashchange', () => { revealFragment(); syncLanguages(); });
    root.classList.remove('no-js');
    root.classList.add('js');
    syncLanguages();
    revealFragment();
    requestAnimationFrame(() => requestAnimationFrame(() => {
      root.dataset.economicsReady = 'true';
    }));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
