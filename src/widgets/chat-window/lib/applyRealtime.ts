import type { Message } from '@/entities/message';

/**
 * Pure state-update function used by ChatWindow's subscribeToMatch callback.
 *
 * Rules (applied in order):
 * 1. Exact-id match → return prev unchanged (guards against double Realtime delivery).
 * 2. sender_id === viewerId → replace the first optimistic-* entry with matching body
 *    so the aria-live region announces the message only once.
 * 3. Otherwise → append.
 */
export function applyRealtime(prev: Message[], msg: Message, viewerId: string): Message[] {
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
