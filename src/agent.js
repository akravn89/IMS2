import { attendees, booths, event, sessions, zones } from './data.js';

const checkins = new Map();

export function normalizePhone(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!/^\+[1-9]\d{7,14}$/.test(trimmed)) return null;
  return trimmed;
}

export function findAttendeeByPhone(phone) {
  const normalized = normalizePhone(phone);
  if (!normalized) return null;
  return attendees.find((attendee) => attendee.mobile === normalized) ?? null;
}

export function getWelcome(attendee) {
  if (!attendee) throw new TypeError('attendee is required');
  return {
    text: `Hi ${attendee.name} 👋\nWelcome to ${event.name}. I’m ${event.botName}, your personal event assistant.`,
    menu: [
      { id: 'explore', title: 'Explore Event' },
      { id: 'sessions', title: 'Sessions' },
      { id: 'rewards', title: 'My Rewards' },
    ],
  };
}

export function getEventBasics() {
  return {
    event,
    zones,
    featuredBooths: booths.slice(0, 6),
  };
}

export function getSessions() {
  return sessions;
}

export function getRewards(attendeeId) {
  const visited = [...(checkins.get(attendeeId) ?? new Set())];
  const points = visited.length * event.pointsPerBooth;
  return {
    attendeeId,
    visitedBooths: visited,
    cardsCollected: visited.length,
    target: event.rewardBoothTarget,
    points,
    giftEligible: visited.length >= event.rewardBoothTarget,
  };
}

export function checkIn(attendeeId, boothId) {
  if (!attendees.some((a) => a.id === attendeeId)) {
    return { ok: false, code: 'ATTENDEE_NOT_FOUND' };
  }
  const booth = booths.find((item) => item.id === boothId);
  if (!booth) return { ok: false, code: 'BOOTH_NOT_FOUND' };

  const set = checkins.get(attendeeId) ?? new Set();
  if (set.has(boothId)) {
    return { ok: true, duplicate: true, booth, rewards: getRewards(attendeeId) };
  }

  set.add(boothId);
  checkins.set(attendeeId, set);
  return { ok: true, duplicate: false, booth, rewards: getRewards(attendeeId) };
}

export function answerQuestion(question) {
  if (typeof question !== 'string' || question.trim().length === 0) {
    return { answer: 'Please send an event question.', source: null };
  }

  const q = question.toLowerCase();
  const booth = booths.find((item) =>
    q.includes(item.name.toLowerCase()) || q.includes(item.id.toLowerCase())
  );
  if (booth) {
    return {
      answer: `${booth.name} is at ${booth.location}. ${booth.description}`,
      source: `booth:${booth.id}`,
    };
  }

  if (q.includes('session') || q.includes('agenda')) {
    return {
      answer: sessions.map((s) => `${s.time} — ${s.title} (${s.location})`).join('\n'),
      source: 'sessions:sample',
    };
  }

  if (q.includes('zone')) {
    return {
      answer: zones.map((z) => `${z.name}: ${z.location}`).join('\n'),
      source: 'zones:sample',
    };
  }

  return {
    answer: 'I do not have enough event information to answer that yet. Try asking about a booth, zone, session, or agenda.',
    source: null,
  };
}

export function routeMessage({ phone, text, action }) {
  const attendee = findAttendeeByPhone(phone);
  if (!attendee) {
    return { status: 404, body: { error: 'ATTENDEE_NOT_FOUND', message: 'This phone number is not in the sample attendee list.' } };
  }

  if (!attendee.optedIn) {
    return { status: 403, body: { error: 'NOT_OPTED_IN' } };
  }

  if (action === 'welcome') return { status: 200, body: getWelcome(attendee) };
  if (action === 'explore') return { status: 200, body: getEventBasics() };
  if (action === 'sessions') return { status: 200, body: { sessions: getSessions() } };
  if (action === 'rewards') return { status: 200, body: getRewards(attendee.id) };

  return { status: 200, body: answerQuestion(text ?? '') };
}
