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
test('first paint follows device and saved explicit choices win', () => {
  assert.equal(setup({dark:true}).root.dataset.theme, 'dark');
  assert.equal(setup({saved:'light',dark:true}).root.dataset.theme, 'light');
  assert.equal(setup({saved:'invalid',dark:true}).api.get(), 'system');
});
test('system follows OS changes but manual choice does not', () => {
  const s=setup();s.media.matches=true;s.listeners.media();assert.equal(s.root.dataset.theme,'dark');
  s.api.set('light');s.listeners.media();assert.equal(s.root.dataset.theme,'light');
  assert.equal(s.storage.get('afterclass.appearance'),'light');assert.equal(s.root.style.colorScheme,'light');
  s.api.set('invalid');assert.equal(s.api.get(),'light');
});
test('preference synchronises between tabs and clearing storage restores system', () => {
  const s=setup({dark:true});s.listeners.storage({key:'afterclass.appearance',newValue:'light'});assert.equal(s.root.dataset.theme,'light');
  s.listeners.storage({key:'unrelated',newValue:'dark'});assert.equal(s.root.dataset.theme,'light');
  s.listeners.storage({key:null,newValue:null});assert.equal(s.root.dataset.theme,'dark');assert.equal(s.meta.content,'#141d1a');
});
test('blocked browser storage still allows switching for the current visit', () => {
  const s=setup({storageBlocked:true});s.api.set('dark');assert.equal(s.root.dataset.theme,'dark');
});

test('classic persists independently of OS appearance and uses dark native controls', () => {
  const s = setup({ saved:'classic' });
  assert.equal(s.api.get(), 'classic');
  assert.equal(s.root.dataset.theme, 'dark');
  assert.equal(s.root.dataset.palette, 'classic');
  assert.equal(s.root.style.colorScheme, 'dark');
  assert.equal(s.meta.content, '#1c1917');
  s.listeners.media(); assert.equal(s.root.dataset.palette, 'classic');
  s.api.set('light'); assert.equal(s.root.dataset.palette, 'campus');
  s.api.set('classic'); assert.equal(s.storage.get('afterclass.appearance'), 'classic');
});

test('classic light persists and the toolbar toggles brightness without losing Classic', () => {
 const s=setup({saved:'classic-light',dark:true});
 assert.equal(s.root.dataset.theme,'light');assert.equal(s.root.dataset.palette,'classic');
 assert.equal(s.root.style.colorScheme,'light');assert.equal(s.meta.content,'#fff7ef');
 s.api.toggle();assert.equal(s.api.get(),'classic');assert.equal(s.root.dataset.theme,'dark');
 s.api.toggle();assert.equal(s.api.get(),'classic-light');assert.equal(s.storage.get('afterclass.appearance'),'classic-light');
 s.listeners.storage({key:'afterclass.appearance',newValue:'classic-light'});assert.equal(s.root.dataset.theme,'light');
 s.api.set('light');s.api.toggle();assert.equal(s.api.get(),'dark');assert.equal(s.root.dataset.palette,'campus');
});
