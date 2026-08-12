import { attendees, booths, sessions, knowledge, event } from './data.js';

const checkins = new Map();

export function normalizePhone(value) {
  if (typeof value !== 'string') return null;
  const cleaned = value.replace(/[\s()-]/g, '');
  return /^\+[1-9]\d{7,14}$/.test(cleaned) ? cleaned : null;
}

export function findAttendeeByPhone(phone) {
  const normalized = normalizePhone(phone);
  if (!normalized) return null;
  return attendees.find((a) => a.mobile === normalized) ?? null;
}

export function getWelcome(attendee) {
  return `Hi ${attendee.name} 👋\n\nWelcome to ${event.name}.\n\nI’m your personal event assistant.\n\nReply with:\n1 - Explore booths\n2 - Sessions\n3 - My rewards\nOr ask me any event question.`;
}

export function listBooths() {
  return booths.map((b) => `${b.id} · ${b.name} · ${b.location}`).join('\n');
}

export function listSessions() {
  return sessions.map((s) => `${s.time} · ${s.title} · ${s.location} · ${s.speaker}`).join('\n');
}

export function getRewardStatus(attendeeId) {
  const uniqueBooths = checkins.get(attendeeId)?.size ?? 0;
  const points = uniqueBooths * event.rewardRule.pointsPerBooth;
  const remaining = Math.max(0, event.rewardRule.giftEligibleAtUniqueBooths - uniqueBooths);
  return {
    attendeeId,
    uniqueBooths,
    points,
    giftEligible: remaining === 0,
    remaining
  };
}

export function checkIn(attendeeId, boothId) {
  const attendee = attendees.find((a) => a.id === attendeeId);
  const booth = booths.find((b) => b.id === boothId);
  if (!attendee) return { ok: false, code: 'ATTENDEE_NOT_FOUND' };
  if (!booth) return { ok: false, code: 'BOOTH_NOT_FOUND' };

  const set = checkins.get(attendeeId) ?? new Set();
  const duplicate = set.has(boothId);
  set.add(boothId);
  checkins.set(attendeeId, set);

  return { ok: true, duplicate, booth, ...getRewardStatus(attendeeId) };
}

function knowledgeAnswer(text) {
  const q = text.toLowerCase();
  const booth = booths.find((b) => q.includes(b.name.toLowerCase()) || q.includes(b.id.toLowerCase()));
  if (booth) return `${booth.name} is at ${booth.location}. ${booth.description}`;

  const session = sessions.find((s) => q.includes(s.title.toLowerCase()));
  if (session) return `${session.title} is at ${session.time} in ${session.location}, with ${session.speaker}.`;

  const item = knowledge.find((k) => k.keywords.some((keyword) => q.includes(keyword)));
  return item?.answer ?? null;
}

export function respondToMessage(phone, text) {
  const attendee = findAttendeeByPhone(phone);
  if (!attendee) {
    return { type: 'text', text: 'I could not match this WhatsApp number to a registered attendee. Please visit the event help desk.' };
  }

  const input = String(text ?? '').trim();
  if (!input || /^(hi|hello|hey|menu)$/i.test(input)) return { type: 'text', text: getWelcome(attendee) };
  if (input === '1' || /booths?/i.test(input)) return { type: 'text', text: `Ericsson booths:\n${listBooths()}` };
  if (input === '2' || /sessions?|agenda/i.test(input)) return { type: 'text', text: `Today’s sample sessions:\n${listSessions()}` };
  if (input === '3' || /points?|rewards?|card status/i.test(input)) {
    const status = getRewardStatus(attendee.id);
    return { type: 'text', text: `You have ${status.points} points from ${status.uniqueBooths} unique booth(s). ${status.giftEligible ? '🎁 You are gift-eligible.' : `${status.remaining} more booth(s) to unlock the gift.`}` };
  }

  const grounded = knowledgeAnswer(input);
  if (grounded) return { type: 'text', text: grounded };

  return { type: 'text', text: 'I don’t have that information in the approved sample event knowledge yet. Try asking about booths, sessions, Wi-Fi, registration, food, or rewards.' };
}

export function resetStateForTests() {
  checkins.clear();
}
