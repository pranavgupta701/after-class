const choices = [['light', 'Light'], ['dark', 'Dark'], ['system', 'System']];
const themes = [['classic', 'Afterclass Classic', 'Warm orange'], ['campus', 'Campus Green', 'Soft sage'], ['pastel', 'Pastel', 'Lavender & peach']];
export function appearanceControl() {
  const label = document.documentElement.dataset.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
  return `<button type="button" class="appearance-control" data-appearance-toggle aria-label="${label}" title="${label}" onclick="afterclassAppearance.toggle()"><svg class="appearance-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 13.1A8.5 8.5 0 0 1 10.9 3.2a8.5 8.5 0 1 0 9.9 9.9Z"/></svg><svg class="appearance-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg></button>`;
}
export function appearanceSettings() {
  return `<section class="preference-group appearance-settings"><h2>Appearance</h2><p>Pick your colours, then choose how light or dark they appear.</p>
    <h3 id="appearance-theme-label">Theme</h3>
    <div class="appearance-options appearance-themes" role="group" aria-labelledby="appearance-theme-label">${themes.map(([value,label,description]) => `<button type="button" data-palette-choice="${value}" aria-pressed="${window.afterclassAppearance.getTheme() === value}" onclick="afterclassAppearance.setTheme('${value}')"><span class="appearance-preview appearance-swatch-${value}" aria-hidden="true"><i></i><b></b><em></em></span>${label}<small>${description}</small></button>`).join('')}</div>
    <h3 id="appearance-mode-label">Mode</h3><p>System follows your device’s light or dark setting.</p>
    <div class="appearance-options appearance-modes" role="group" aria-labelledby="appearance-mode-label">${choices.map(([value,label]) => `<button type="button" data-appearance="${value}" aria-pressed="${window.afterclassAppearance.get() === value}" onclick="afterclassAppearance.set('${value}')">${label}</button>`).join('')}</div></section>`;
}
