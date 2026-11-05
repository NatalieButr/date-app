// H-zone: extraction logic is written by Natallia (see CLAUDE.md §Human-authored zones).
// Agent scaffold only.

import 'server-only';

import type { ChatMessage, ProfileExtract } from '../model/schemas';

export const extractPromptVersion = 'extract@1';

// TODO(human): call structured(opts, ProfileExtractSchema) to extract profile data
// from the onboarding conversation. Include retry logic and error handling.
// Pass the conversation inside <conversation> XML tags as data.
export async function extractProfileFromChat(
  _messages: ChatMessage[],
): Promise<ProfileExtract> {
  throw new Error('TODO(human): implement extractProfileFromChat');
}
