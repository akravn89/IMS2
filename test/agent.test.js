import test from 'node:test';
import assert from 'node:assert/strict';
import { answerQuestion, checkIn, findAttendeeByPhone, getRewards, normalizePhone, routeMessage } from '../src/agent.js';

test('normalizes only plausible E.164 phone numbers', () => {
  assert.equal(normalizePhone('+919810000001'), '+919810000001');
  assert.equal(normalizePhone('9810000001'), null);
  assert.equal(normalizePhone('+12'), null);
});

test('finds a sample attendee by phone', () => {
  assert.equal(findAttendeeByPhone('+919810000001')?.name, 'Priya Sharma');
  assert.equal(findAttendeeByPhone('+919999999999'), null);
});

test('welcome route is personalized', () => {
  const result = routeMessage({ phone: '+919810000001', action: 'welcome' });
  assert.equal(result.status, 200);
  assert.match(result.body.text, /Priya Sharma/);
  assert.equal(result.body.menu.length, 3);
});

test('booth check-ins are idempotent', () => {
  const first = checkIn('IMC002', 'B01');
  const second = checkIn('IMC002', 'B01');
  assert.equal(first.ok, true);
  assert.equal(first.duplicate, false);
  assert.equal(second.duplicate, true);
  assert.equal(getRewards('IMC002').cardsCollected, 1);
  assert.equal(getRewards('IMC002').points, 10);
});

test('unknown booth does not award points', () => {
  const before = getRewards('IMC003').points;
  const result = checkIn('IMC003', 'B99');
  assert.equal(result.ok, false);
  assert.equal(result.code, 'BOOTH_NOT_FOUND');
  assert.equal(getRewards('IMC003').points, before);
});

test('sample Q&A is grounded and refuses unknown information', () => {
  const booth = answerQuestion('Where is AI Gallery?');
  assert.equal(booth.source, 'booth:B01');
  assert.match(booth.answer, /Hall A/);

  const unknown = answerQuestion('What is the Wi-Fi password?');
  assert.equal(unknown.source, null);
  assert.match(unknown.answer, /do not have enough event information/i);
});
