const key = 'afterclass.daylight';
export function dayPeriod(hour) {
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 20) return 'evening';
  return 'night';
}
export const periodLabels = { morning: 'Morning light', afternoon: 'Afternoon skies', evening: 'Golden evening', night: 'Under the moon' };
export function installDaylight(win = window, doc = document) {
  let enabled = true;
  try { enabled = win.localStorage.getItem(key) !== 'off'; } catch {}
  function update() {
    const period = dayPeriod(new Date().getHours());
    doc.documentElement.dataset.daylight = enabled ? period : 'off';
    doc.querySelectorAll('[data-daylight-label]').forEach(el => { el.textContent = periodLabels[period]; el.hidden = !enabled; });
    doc.querySelectorAll('[data-daylight-choice]').forEach(el => el.setAttribute('aria-pressed', String((el.dataset.daylightChoice === 'on') === enabled)));
  }
  win.afterclassDaylight = {
    enabled: () => enabled,
    set(value) {
      enabled = value === 'on';
      try { win.localStorage.setItem(key, enabled ? 'on' : 'off'); } catch {}
      update();
    }
  };
  // One lightweight timer; no re-render, network requests or animation loop.
  const timer = win.setInterval(() => { if (!doc.hidden) update(); }, 60000);
  doc.addEventListener('visibilitychange', update);
  win.addEventListener('pageshow', update);
  win.addEventListener('storage', event => {
    if (event.key === key || event.key === null) { enabled = event.newValue !== 'off'; update(); }
  });
  update();
  return () => win.clearInterval(timer);
}
export function daylightLabel() {
  return `<span class="daylight-label" data-daylight-label ${window.afterclassDaylight.enabled() ? '' : 'hidden'}>${periodLabels[dayPeriod(new Date().getHours())]}</span>`;
}
