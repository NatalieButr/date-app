import 'server-only';

// H-zone: prompt text lives here — Natallia writes this.

/** Bump to invalidate cached system blocks. */
export const ICEBREAKER_PROMPT_VERSION = '1.0.0';

export function getIcebreakerUserPrompt(): string {
  return 'Generate 3 icebreaker messages I could send to start the conversation.';
}
