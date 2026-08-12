import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizePhone,
  findAttendeeByPhone,
  respondToMessage,
  checkIn,
  getRewardStatus,
  resetStateForTests
} from '../src/app.js';

test.beforeEach(() => resetStateForTests());

test('normalizes valid E.164-like numbers', () => {
  assert.equal(normalizePhone('+91 98100 00001'), '+919810000001');
  assert.equal(normalizePhone('9810000001'), null);
});

test('finds sample attendee by phone', () => {
  assert.equal(findAttendeeByPhone('+919810000001')?.name, 'Priya Sharma');
  assert.equal(findAttendeeByPhone('+919999999999'), null);
});

test('returns personalized welcome', () => {
  const reply = respondToMessage('+919810000001', 'hi');
  assert.match(reply.text, /Priya Sharma/);
  assert.match(reply.text, /Explore booths/);
});

test('answers booth location from approved sample data', () => {
  const reply = respondToMessage('+919810000001', 'Where is AI Gallery?');
  assert.match(reply.text, /Hall A · A12/);
});

test('does not invent unsupported answers', () => {
  const reply = respondToMessage('+919810000001', 'What is the CEO dinner password?');
  assert.match(reply.text, /don’t have that information/);
});

test('awards a booth only once', () => {
  const first = checkIn('IMC001', 'B01');
  const second = checkIn('IMC001', 'B01');
  assert.equal(first.ok, true);
  assert.equal(first.duplicate, false);
  assert.equal(second.duplicate, true);
  assert.equal(getRewardStatus('IMC001').points, 10);
});

test('becomes gift eligible after 10 unique booth check-ins', () => {
  for (let i = 1; i <= 10; i += 1) {
    const id = `B${String(i).padStart(2, '0')}`;
    assert.equal(checkIn('IMC001', id).ok, true);
  }
  const status = getRewardStatus('IMC001');
  assert.equal(status.points, 100);
  assert.equal(status.uniqueBooths, 10);
  assert.equal(status.giftEligible, true);
});
