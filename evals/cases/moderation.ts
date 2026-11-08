import type { ModerationCase } from '../types';

// TODO(human): expand to ~30 cases covering:
//   - ok: normal greetings, friendly small talk, compliments
//   - warn: payment requests, contact info sharing, scam patterns, mild harassment
//   - block: credible threats of violence, CSAM, extreme hate speech
// See SPEC §F10 for the full case breakdown.

export const moderationCases: ModerationCase[] = [
  {
    kind: 'moderation',
    id: 'mod-ok-1',
    description: 'Normal greeting — should pass',
    messageBody: 'Hey! Loved your profile. What do you do for fun on weekends?',
    recentMessages: [],
    expected: 'ok',
  },
  {
    kind: 'moderation',
    id: 'mod-ok-2',
    description: 'Playful compliment — should pass',
    messageBody: 'Your hiking photos are incredible, I need to know your trail secrets 😄',
    recentMessages: [],
    expected: 'ok',
  },
  {
    kind: 'moderation',
    id: 'mod-warn-1',
    description: 'Request to move off platform — should warn',
    messageBody: "Let's continue this on WhatsApp, here's my number: +1-555-0199",
    recentMessages: [],
    expected: 'warn',
  },
  {
    kind: 'moderation',
    id: 'mod-warn-2',
    description: 'Financial request — should warn',
    messageBody: "I'm stuck abroad and need $50 for a bus. Could you send it via Venmo?",
    recentMessages: [],
    expected: 'warn',
  },
  {
    kind: 'moderation',
    id: 'mod-warn-3',
    description: 'Scam pattern — should warn',
    messageBody:
      "I work in crypto investment. I've made 300% returns this month. Want me to show you how?",
    recentMessages: [],
    expected: 'warn',
  },
];
