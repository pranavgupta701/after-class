/* Run before paint; shared by the initial document and the app controls. */
(() => {
  const key = 'afterclass.appearance';
  const modes = ['system', 'light', 'dark', 'classic', 'classic-light'];
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  let preference = 'system';
  try { const saved = localStorage.getItem(key); if (modes.includes(saved)) preference = saved; } catch {}
  function apply() {
    const mode = preference === 'system' ? (media.matches ? 'dark' : 'light') : preference === 'classic' ? 'dark' : preference === 'classic-light' ? 'light' : preference;
    document.documentElement.dataset.theme = mode;
    document.documentElement.dataset.palette = preference.startsWith('classic') ? 'classic' : 'campus';
    document.documentElement.style.colorScheme = mode;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', preference === 'classic-light' ? '#fff7ef' : preference === 'classic' ? '#1c1917' : mode === 'dark' ? '#141d1a' : '#f8f7f1');
    document.querySelectorAll('[data-appearance]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.appearance === preference)));
    document.querySelectorAll('[data-appearance-toggle]').forEach(button => {
      const label = mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
      button.setAttribute('aria-label', label);
      button.setAttribute('title', label);
    });
    window.dispatchEvent(new CustomEvent('appearancechange', { detail: { preference, mode } }));
  }
  window.afterclassAppearance = {
    get: () => preference,
    toggle() {
      const dark = document.documentElement.dataset.theme === 'dark';
      this.set(preference.startsWith('classic') ? (dark ? 'classic-light' : 'classic') : (dark ? 'light' : 'dark'));
    },
    set(value) {
      if (!modes.includes(value)) return;
      preference = value;
      try { localStorage.setItem(key, value); } catch {}
      apply();
    }
  };
  media.addEventListener('change', () => { if (preference === 'system') apply(); });
  window.addEventListener('storage', event => {
    if (event.key !== key && event.key !== null) return;
    preference = modes.includes(event.newValue) ? event.newValue : 'system';
    apply();
  });
  apply();
})();
