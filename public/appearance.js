/* Run before paint; mode and colour theme are independent preferences. */
(() => {
  const key = 'afterclass.appearance';
  const modes = ['system', 'light', 'dark'];
  const themes = ['campus', 'classic', 'pastel'];
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  function decode(raw) {
    if (raw === 'classic' || raw === 'classic-light') return { mode: raw === 'classic' ? 'dark' : 'light', theme: 'classic' };
    if (modes.includes(raw)) return { mode: raw, theme: 'pastel' };
    try {
      const value = JSON.parse(raw);
      return { mode: modes.includes(value?.mode) ? value.mode : 'system', theme: themes.includes(value?.theme) ? value.theme : 'pastel' };
    } catch { return { mode: 'system', theme: 'pastel' }; }
  }
  let preference = decode(null);
  try { preference = decode(localStorage.getItem(key)); } catch {}
  function apply() {
    const mode = preference.mode === 'system' ? (media.matches ? 'dark' : 'light') : preference.mode;
    document.documentElement.dataset.theme = mode;
    document.documentElement.dataset.palette = preference.theme;
    document.documentElement.style.colorScheme = mode;
    const colors = { classic: { light:'#fff8f2', dark:'#1e1b19' }, campus: { light:'#f7f9f4', dark:'#1c1f1d' }, pastel: { light:'#f8f6fc', dark:'#1e1c23' } };
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', colors[preference.theme][mode]);
    document.querySelectorAll('[data-appearance]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.appearance === preference.mode)));
    document.querySelectorAll('[data-palette-choice]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.paletteChoice === preference.theme)));
    document.querySelectorAll('[data-appearance-toggle]').forEach(button => {
      const label = mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
      button.setAttribute('aria-label', label);
      button.setAttribute('title', label);
    });
    window.dispatchEvent(new CustomEvent('appearancechange', { detail: { preference: preference.mode, mode, theme: preference.theme } }));
  }
  function save() {
    try { localStorage.setItem(key, JSON.stringify(preference)); } catch {}
    apply();
  }
  window.afterclassAppearance = {
    get: () => preference.mode,
    getTheme: () => preference.theme,
    toggle() { this.set(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'); },
    set(value) { if (!modes.includes(value)) return; preference.mode = value; save(); },
    setTheme(value) { if (!themes.includes(value)) return; preference.theme = value; save(); }
  };
  media.addEventListener('change', () => { if (preference.mode === 'system') apply(); });
  window.addEventListener('storage', event => {
    if (event.key !== key && event.key !== null) return;
    preference = decode(event.newValue);
    apply();
  });
  apply();
})();
