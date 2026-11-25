import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
const source = readFileSync(new URL('../public/appearance.js', import.meta.url), 'utf8');
function setup({ saved = null, dark = false, storageBlocked = false } = {}) {
  const listeners = {}, root = { dataset: {}, style: {} }, meta = {};
  const media = { matches: dark, addEventListener: (_, fn) => listeners.media = fn };
  const storage = new Map(saved ? [['afterclass.appearance', saved]] : []);
  const window = { matchMedia: () => media, addEventListener: (event, fn) => listeners[event] = fn, dispatchEvent() {} };
  vm.runInNewContext(source, { window, CustomEvent: class {}, document: { documentElement: root, querySelector: () => ({ setAttribute: (key, value) => meta[key] = value }), querySelectorAll: () => [] }, localStorage: { getItem(key) { if (storageBlocked) throw Error(); return storage.get(key); }, setItem(key,value) { if (storageBlocked) throw Error(); storage.set(key,value); } } });
  return { api: window.afterclassAppearance, root, meta, storage, listeners, media };
}

test('every theme supports every mode and changing one preserves the other', () => {
 for (const theme of ['campus','classic','pastel']) for (const mode of ['light','dark','system']) {
  const s=setup({dark:true}); s.api.setTheme(theme); s.api.set(mode);
  assert.equal(s.root.dataset.palette,theme);
  assert.equal(s.root.dataset.theme,mode==='system'?'dark':mode);
  const saved=JSON.parse(s.storage.get('afterclass.appearance'));
  assert.deepEqual(saved,{mode,theme});
  const restored=setup({saved:JSON.stringify(saved),dark:true});
  assert.equal(restored.api.getTheme(),theme); assert.equal(restored.api.get(),mode);
  s.api.toggle();assert.equal(s.root.dataset.palette,theme);
 }
});
test('system tracks device changes for every theme while manual mode stays fixed', () => {
 for(const theme of ['classic','campus','pastel']) {
  const s=setup();s.api.setTheme(theme);s.media.matches=true;s.listeners.media();
  assert.equal(s.root.dataset.theme,'dark');assert.equal(s.api.getTheme(),theme);
  s.api.set('light');s.listeners.media();assert.equal(s.root.dataset.theme,'light');
 }
});
test('legacy Classic choices migrate without losing brightness or palette', () => {
 for(const [saved,mode] of [['classic','dark'],['classic-light','light']]) {
  const s=setup({saved});assert.equal(s.api.getTheme(),'classic');assert.equal(s.api.get(),mode);
  s.api.set('system');assert.deepEqual(JSON.parse(s.storage.get('afterclass.appearance')),{theme:'classic',mode:'system'});
 }
 assert.equal(setup({saved:'dark'}).api.get(),'dark');
});
test('cross-tab changes update both choices atomically and removal resets defaults', () => {
 const s=setup({dark:true});
 s.listeners.storage({key:'afterclass.appearance',newValue:JSON.stringify({theme:'classic',mode:'light'})});
 assert.equal(s.api.getTheme(),'classic');assert.equal(s.root.dataset.theme,'light');
 s.listeners.storage({key:'unrelated',newValue:null});assert.equal(s.api.getTheme(),'classic');
 s.listeners.storage({key:null,newValue:null});assert.equal(s.api.get(),'system');assert.equal(s.api.getTheme(),'pastel');
});
test('invalid data and blocked storage do not prevent appearance changes', () => {
 for(const saved of ['invalid','{}','null']) assert.equal(setup({saved}).api.get(),'system');
 const s=setup({storageBlocked:true});s.api.setTheme('classic');s.api.set('dark');s.api.set('invalid');s.api.setTheme('invalid');
 assert.equal(s.api.getTheme(),'classic');assert.equal(s.api.get(),'dark');assert.equal(s.meta.content,'#1c1917');
});
