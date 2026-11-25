import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
function setup(api) {
  const state = { authStep: 'form' };
  const input = { value: ' Student@college.edu ' };
  const context = { state, window: {}, document: { querySelector: () => input }, api, toast() {}, render() { input.value = state.authPendingEmail || ''; } };
  vm.createContext(context);
  vm.runInContext(source.slice(source.indexOf('window.stateAuthEmail ='), source.indexOf('window.handleAuthPageResetEmail =')), context);
  return { ...context, input };
}
const event = { preventDefault() {} };
test('gender redraw preserves typed or autofilled email', () => {
  const c = setup(); c.window.selectAuthGender('man');
  assert.equal(c.input.value, ' Student@college.edu ');
  c.window.stateAuthEmail('new@college.edu'); c.render();
  assert.equal(c.input.value, 'new@college.edu');
});
test('failed code request preserves email, shows error and permits retry', async () => {
  let fail = true;
  const c = setup(async () => { if (fail) throw new Error('Please wait before requesting another code'); return {}; });
  await c.window.handleAuthPageSendOtp(event);
  assert.equal(c.input.value, 'student@college.edu');
  assert.equal(c.state.authStep, 'form');
  assert.match(c.state.authSendError, /Please wait/);
  assert.equal(c.state.authSending, false);
  fail = false; await c.window.handleAuthPageSendOtp(event);
  assert.equal(c.state.authStep, 'otp'); assert.equal(c.state.authSendError, '');
});
test('repeated submit while sending makes only one request', async () => {
  let resolve; let calls = 0;
  const c = setup(() => { calls++; return new Promise(r => { resolve = r; }); });
  const first = c.window.handleAuthPageSendOtp(event);
  await c.window.handleAuthPageSendOtp(event);
  assert.equal(calls, 1); assert.equal(c.state.authSending, true);
  resolve({}); await first; assert.equal(c.state.authSending, false);
});
