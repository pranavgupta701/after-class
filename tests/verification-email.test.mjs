import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { verificationEmail } = require('../server/verification-email');
test('verification email keeps the code, expiry, brand and text fallback', () => {
  const email = verificationEmail('012345');
  for (const body of [email.html, email.text]) {
    assert.ok(body.includes('012345'));
    assert.ok(body.includes('10 minutes'));
    assert.match(body, /ignore this email|ignore it/);
  }
  assert.match(email.html, /https:\/\/afterclass.neuralagent.dev\/icon-192.png/);
  assert.match(email.html, /alt="Afterclass logo"/);
  assert.doesNotMatch(email.html, /<script|<form|<link/i);
});
test('verification email rejects markup and malformed codes', () => {
  for (const code of ['<img>', '12345', '1234567', '123 45', null]) {
    assert.throws(() => verificationEmail(code));
  }
});
