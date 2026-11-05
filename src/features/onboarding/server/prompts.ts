// H-zone: prompt text is written by Natallia (see CLAUDE.md §Human-authored zones).
// Agent scaffold only.
import 'server-only';

import type { BasicInfo, ChatMessage } from '../model/schemas';

export const onboardingPromptVersion = 'onboarding@1';
export const bioPromptVersion = 'bio@1';

// TODO(human): write the onboarding system prompt here.
// Role: friendly matchmaking assistant. Ask 4-5 questions about interests,
// values, what they're looking for, and dealbreakers.
// User answers live inside <conversation> XML tags.
// Include 1-2 few-shot examples.
export function buildOnboardingSystemPrompt(_basicInfo: BasicInfo): never {
  throw new Error('TODO(human): implement onboarding system prompt');
}

// TODO(human): write the bio generation prompt here.
// Receives the conversation and asks Claude for 3 bio variants (tones: warm, witty, sincere).
// Return format matches BioOptionsSchema.
export function buildBioPrompt(_basicInfo: BasicInfo, _messages: ChatMessage[]): never {
  throw new Error('TODO(human): implement bio generation prompt');
}
