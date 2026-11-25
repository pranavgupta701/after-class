const choices = [['light', 'Light'], ['dark', 'Dark'], ['classic', 'Afterclass Classic'], ['system', 'System']];
export function appearanceControl() {
  const label = document.documentElement.dataset.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
  return `<button type="button" class="appearance-control" data-appearance-toggle aria-label="${label}" title="${label}" onclick="afterclassAppearance.set(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark')"><svg class="appearance-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 13.1A8.5 8.5 0 0 1 10.9 3.2a8.5 8.5 0 1 0 9.9 9.9Z"/></svg><svg class="appearance-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg></button>`;
}
export function appearanceSettings() {
  return `<section class="preference-group appearance-settings"><h2>Appearance</h2><p>Choose a look, or follow your device.</p><div class="appearance-options" role="group" aria-label="Colour theme">${choices.map(([value,label]) => `<button type="button" data-appearance="${value}" aria-pressed="${window.afterclassAppearance.get() === value}" onclick="afterclassAppearance.set('${value}')"><span class="appearance-preview appearance-preview-${value}" aria-hidden="true"><i></i><b></b><em></em></span>${label}</button>`).join('')}</div></section>`;
}
