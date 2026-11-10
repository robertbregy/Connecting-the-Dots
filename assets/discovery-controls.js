/* Optional reading-page controls. The complete document remains readable if
   scripts or storage are unavailable. Theme preference is shared with the atlas. */
(() => {
  'use strict';
  function init() {
    const button = document.querySelector('[data-discovery-theme]');
    if (!button) return;
    const root = document.documentElement;
    const system = window.matchMedia?.('(prefers-color-scheme: dark)');
    let preference = null;
    try {
      const saved = localStorage.getItem('dotTheme');
      if (saved === 'dark' || saved === 'light') preference = saved;
    } catch (_) { /* Storage is optional, including in private browsing. */ }
    function apply() {
      const theme = preference || (system?.matches ? 'dark' : 'light');
      root.dataset.theme = theme;
      button.setAttribute('aria-pressed', String(theme === 'dark'));
    }
    button.addEventListener('click', () => {
      preference = root.dataset.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('dotTheme', preference); } catch (_) {}
      apply();
    });
    window.addEventListener('storage', event => {
      if (event.key !== 'dotTheme' && event.key !== null) return;
      preference = event.newValue === 'dark' || event.newValue === 'light' ? event.newValue : null;
      apply();
    });
    system?.addEventListener?.('change', () => { if (!preference) apply(); });
    apply();
    button.hidden = false;
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
