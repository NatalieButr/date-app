import 'server-only';

// H-zone: prompt text lives here — Natallia writes this.

/** Bump to invalidate cached system blocks. */
export const ICEBREAKER_PROMPT_VERSION = '0.0.0';

/**
 * User-turn message asking the model to generate icebreakers.
 * H-zone: write the actual prompt text.
 */
export function getIcebreakerUserPrompt(): string {
  throw new Error('TODO(human): write the icebreaker user-turn prompt text');
}
