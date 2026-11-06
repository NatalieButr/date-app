import 'server-only';

import { z } from 'zod';

import { type Message } from '../model/schemas';

export const ModerationSchema = z.object({
  verdict: z.enum(['ok', 'warn', 'block']),
  category: z.enum(['none', 'harassment', 'sexual', 'scam', 'spam', 'hate', 'self_harm', 'other']),
  reason: z.string().max(140),
});

export type ModerationResult = z.infer<typeof ModerationSchema>;

export async function moderateMessage(
  _body: string,
  _recentMessages: Message[],
): Promise<ModerationResult> {
  throw new Error('TODO(human): implement moderation prompt and structured() call');
}
