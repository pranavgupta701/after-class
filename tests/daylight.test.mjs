import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dayPeriod, installDaylight } from '../src/daylight.mjs';
test('local day boundaries cover sunrise, noon, sunset and midnight', () => {
 for (const [hour, expected] of [[0,'night'],[4,'night'],[5,'morning'],[11,'morning'],[12,'afternoon'],[16,'afternoon'],[17,'evening'],[19,'evening'],[20,'night'],[23,'night']]) assert.equal(dayPeriod(hour),expected);
});
test('background preference persists independently and survives blocked storage', () => {
 const root = {dataset:{theme:'dark',palette:'classic'}};
 const listeners = {};
 let stored='off', tick;
 const win={localStorage:{getItem:()=>stored,setItem:(k,v)=>stored=v},setInterval:fn=>{tick=fn;return 1;},clearInterval:()=>{},addEventListener:(e,fn)=>listeners[e]=fn};
 const doc={documentElement:root,querySelectorAll:()=>[],addEventListener:()=>{}};
 installDaylight(win,doc);
 assert.equal(root.dataset.daylight,'off');
 win.afterclassDaylight.set('on');tick();
 assert.equal(root.dataset.daylight,dayPeriod(new Date().getHours()));
 assert.equal(root.dataset.theme,'dark');assert.equal(root.dataset.palette,'classic');
 listeners.storage({key:'afterclass.daylight',newValue:'off'});
 assert.equal(root.dataset.daylight,'off');
 win.localStorage.setItem=()=>{throw Error('blocked')};
 assert.doesNotThrow(()=>win.afterclassDaylight.set('on'));
});
