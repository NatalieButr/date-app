import { describe, expect, it } from 'vitest';

import type { Message } from '@/entities/message';

const VIEWER_ID = 'aaaaaaaa-0000-0000-0000-000000000001';
const OTHER_ID = 'bbbbbbbb-0000-0000-0000-000000000002';

function makeMessage(overrides: Partial<Message> & { id: string }): Message {
  return {
    match_id: 'cccccccc-0000-0000-0000-000000000003',
    sender_id: OTHER_ID,
    body: 'hello',
    moderation: 'ok',
    mod_reason: null,
    created_at: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

// Mirrors the setMessages callback in ChatWindow exactly.
function applyRealtime(prev: Message[], msg: Message, viewerId: string): Message[] {
  if (prev.some((m) => m.id === msg.id)) return prev;
  if (msg.sender_id === viewerId) {
    const idx = prev.findIndex((m) => m.id.startsWith('optimistic-') && m.body === msg.body);
    if (idx !== -1) {
      const next = [...prev];
      next[idx] = msg;
      return next;
    }
  }
  return [...prev, msg];
}

describe('ChatWindow optimistic dedup (setMessages callback)', () => {
  it('appends a new message from another user', () => {
    const prev: Message[] = [];
    const msg = makeMessage({ id: 'real-uuid-1' });
    const next = applyRealtime(prev, msg, VIEWER_ID);
    expect(next).toHaveLength(1);
    expect(next[0]?.id).toBe('real-uuid-1');
  });

  it('ignores exact-id duplicates (guards against double Realtime delivery)', () => {
    const existing = makeMessage({ id: 'real-uuid-1' });
    const prev: Message[] = [existing];
    const next = applyRealtime(prev, existing, VIEWER_ID);
    expect(next).toBe(prev); // same reference — no update
  });

  it('replaces the matching optimistic bubble when sender_id === viewerId', () => {
    const optimistic = makeMessage({ id: 'optimistic-1234', sender_id: VIEWER_ID, body: 'hello' });
    const prev: Message[] = [optimistic];
    const real = makeMessage({ id: 'real-uuid-2', sender_id: VIEWER_ID, body: 'hello' });
    const next = applyRealtime(prev, real, VIEWER_ID);
    expect(next).toHaveLength(1);
    expect(next[0]?.id).toBe('real-uuid-2');
  });

  it('replaces only the first matching optimistic when multiple exist', () => {
    const opt1 = makeMessage({ id: 'optimistic-100', sender_id: VIEWER_ID, body: 'hello' });
    const opt2 = makeMessage({ id: 'optimistic-101', sender_id: VIEWER_ID, body: 'hello' });
    const prev: Message[] = [opt1, opt2];
    const real = makeMessage({ id: 'real-uuid-3', sender_id: VIEWER_ID, body: 'hello' });
    const next = applyRealtime(prev, real, VIEWER_ID);
    expect(next).toHaveLength(2);
    expect(next[0]?.id).toBe('real-uuid-3');
    expect(next[1]?.id).toBe('optimistic-101');
  });

  it('appends when sender_id === viewerId but no matching optimistic body', () => {
    const optimistic = makeMessage({ id: 'optimistic-200', sender_id: VIEWER_ID, body: 'world' });
    const prev: Message[] = [optimistic];
    const real = makeMessage({ id: 'real-uuid-4', sender_id: VIEWER_ID, body: 'different body' });
    const next = applyRealtime(prev, real, VIEWER_ID);
    expect(next).toHaveLength(2);
  });

  it('appends when sender_id !== viewerId even if body matches an optimistic entry', () => {
    const optimistic = makeMessage({ id: 'optimistic-300', sender_id: VIEWER_ID, body: 'hello' });
    const prev: Message[] = [optimistic];
    const real = makeMessage({ id: 'real-uuid-5', sender_id: OTHER_ID, body: 'hello' });
    const next = applyRealtime(prev, real, VIEWER_ID);
    expect(next).toHaveLength(2);
  });

  it('preserves message order: replaced entry stays at its original position', () => {
    const before = makeMessage({ id: 'msg-a', sender_id: OTHER_ID, body: 'first' });
    const optimistic = makeMessage({ id: 'optimistic-400', sender_id: VIEWER_ID, body: 'hello' });
    const after = makeMessage({ id: 'msg-b', sender_id: OTHER_ID, body: 'last' });
    const prev: Message[] = [before, optimistic, after];
    const real = makeMessage({ id: 'real-uuid-6', sender_id: VIEWER_ID, body: 'hello' });
    const next = applyRealtime(prev, real, VIEWER_ID);
    expect(next).toHaveLength(3);
    expect(next[0]?.id).toBe('msg-a');
    expect(next[1]?.id).toBe('real-uuid-6');
    expect(next[2]?.id).toBe('msg-b');
  });
});
