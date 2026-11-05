import 'server-only';

import { structured } from '@/shared/ai';
import { ProfileExtractSchema, type ChatMessage, type ProfileExtract } from '../model/schemas';

export const extractPromptVersion = 'extract@1';

const SYSTEM = `You are a profile analyst. Given a conversation from a dating app onboarding chat, extract structured data about the user.

Return valid JSON matching this schema:
{
  "interests": string[],   // 3–10 specific interests inferred from answers (cuisine, travel, pets, zodiac curiosity, MBTI type, etc.)
  "values": string[],      // 2–6 values inferred from what they seek and how they describe themselves
  "seeking": string,       // ≤200 chars — what kind of relationship and partner they want, in plain language
  "red_flags": string[],   // 0–5 dealbreakers or strong dislikes mentioned (e.g. "doesn't want pets", "not ready for commitment")
  "summary": string        // ≤300 chars — neutral third-person summary of who this person is, good for embedding
}

Rules:
- Be specific: "Italian food" beats "food lover". "INFJ" beats "introverted".
- Infer, don't invent — only extract what the conversation actually supports.
- summary must be embeddable: dense with concrete facts, no filler adjectives.`;

export async function extractProfileFromChat(
  messages: ChatMessage[],
  userName = 'User',
): Promise<ProfileExtract> {
  const conversation = messages
    .map((m) => `${m.role === 'user' ? userName : 'Spark'}: ${m.content}`)
    .join('\n');

  return structured(
    {
      tier: 'smart',
      feature: 'onboarding',
      promptVer: extractPromptVersion,
      maxTokens: 512,
      system: SYSTEM,
      messages: [
        {
          role: 'user',
          content: `Extract profile data from this onboarding conversation.\n\n<conversation>\n${conversation}\n</conversation>`,
        },
      ],
    },
    ProfileExtractSchema,
  );
}
