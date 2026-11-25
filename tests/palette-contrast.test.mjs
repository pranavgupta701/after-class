import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const css=readFileSync(new URL('../src/appearance.css',import.meta.url),'utf8');
function luminance(hex) {
 const c=hex.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);
 return c[0]*.2126+c[1]*.7152+c[2]*.0722;
}
function contrast(a,b) { const v=[luminance(a),luminance(b)].sort((a,b)=>a-b);return (v[1]+.05)/(v[0]+.05); }
for(const theme of ['classic','campus','pastel']) for(const mode of ['light','dark']) {
 test(`${theme} ${mode}: text, actions, selections and focus remain readable`,()=>{
  const block=css.match(new RegExp(`html\\[data-palette=${theme}\\]\\[data-theme=${mode}\\] \\{([^}]+)`))[1];
  const t=Object.fromEntries([...block.matchAll(/--([\w-]+):\s*(#[\da-f]{6})/g)].map(m=>[m[1],m[2]]));
  for(const bg of ['paper','surface','surface-soft','surface-hover']) for(const fg of ['ink','muted','accent']) {
   const ratio=contrast(t[fg],t[bg]);assert.ok(ratio>=4.5,`${fg} on ${bg}: ${ratio.toFixed(2)}`);
  }
  for(const [fg,bg] of [['on-accent','accent'],['on-accent','accent-hover'],['selected-ink','selected-bg']]) assert.ok(contrast(t[fg],t[bg])>=4.5,`${fg}/${bg}`);
  assert.ok(contrast(t.focus,t.surface)>=3,'focus indicator');
  assert.ok(contrast(t['control-border'],t.surface)>=3,'input boundary');
 });
}
