import 'server-only';

import type { Message } from '@/entities/message';

// H-zone: prompt text lives here — Natallia writes this.

/** Bump to invalidate cached system blocks. */
export const COACH_PROMPT_VERSION = '0.0.0';

/**
 * Builds the user-turn message containing the conversation history for the coach.
 * User content must be wrapped in XML tags and not treated as instructions.
 * H-zone: write the actual prompt structure.
 */
export function buildCoachUserMessage(_messages: Message[]): string {
  throw new Error(
    'TODO(human): build the coach user-turn message from conversation history (wrap in XML)',
  );
}
