import 'server-only';

import type { Message } from '@/entities/message';

// H-zone: prompt text lives here — Natallia writes this.

/** Bump to invalidate cached system blocks. */
export const COACH_PROMPT_VERSION = '1.0.0';

export function buildCoachUserMessage(messages: Message[]): string {
  const history = messages.map((m) => `  <msg sender="${m.sender_id}">${m.body}</msg>`).join('\n');

  return `<conversation_history>
${history || '  (no messages yet)'}
</conversation_history>

Suggest 1–2 reply ideas I could send next.`;
}
