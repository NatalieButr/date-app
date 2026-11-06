import 'server-only';

import { z } from 'zod';

import { structured } from '@/shared/ai';

import { type Message } from '../model/schemas';

export const ModerationSchema = z.object({
  verdict: z.enum(['ok', 'warn', 'block']),
  category: z.enum(['none', 'harassment', 'sexual', 'scam', 'spam', 'hate', 'self_harm', 'other']),
  reason: z.string().max(140),
});

export type ModerationResult = z.infer<typeof ModerationSchema>;

const PROMPT_VERSION = '1.0.0';

const SYSTEM = `You are a content safety assistant for a dating app. Your job is to analyze a user's message and return a moderation verdict.

## Verdicts

**ok** — the message is clean. Set category to "none" and reason to "".

**warn** — the message contains something suspicious or potentially harmful. The message will still be delivered, but the sender will see a caution notice. Use warn for:
- Payment requests or financial details (bank cards, wire transfers, crypto wallets, money requests of any kind)
- Personal contact sharing (phone numbers, email addresses, social media handles, WhatsApp, Telegram, Instagram links)
- Phishing-style links or suspicious URLs
- Scam patterns (urgency, too-good-to-be-true offers, requests to move off the platform)
- Harassment, insults, or threats that do not cross the block threshold

**block** — the message contains severe content that must not be delivered. Use block ONLY for: credible threats of violence, child sexual abuse material (CSAM), or extreme hate speech calling for physical harm. Do NOT use block for payment requests or contact sharing — those are warn.

## How to use conversation context

Before deciding, read the conversation history. Something that looks like a scam in isolation may be an obvious joke between people who have been joking around. If the recent messages show a clearly playful or ironic tone and the new message fits that pattern, lean towards ok rather than warn. Use your judgment — context changes everything.

## Output

Return a JSON object with verdict, category, and reason (max 140 characters). If verdict is ok, set category to "none" and reason to "".`;

export async function moderateMessage(
  _body: string,
  _recentMessages: Message[],
): Promise<ModerationResult> {
  // listMessages returns newest-first; reverse for chronological context
  const context = _recentMessages
    .slice()
    .reverse()
    .map((m) => `  <msg>${m.body}</msg>`)
    .join('\n');

  return structured(
    {
      tier: 'fast',
      feature: 'moderation',
      promptVer: PROMPT_VERSION,
      system: SYSTEM,
      messages: [
        {
          role: 'user',
          content: `<conversation_history>
${context || '  (no prior messages)'}
</conversation_history>

<message>${_body}</message>

Analyze the message in the context of the conversation above and return your verdict.`,
        },
      ],
      maxTokens: 200,
    },
    ModerationSchema,
  );
}
