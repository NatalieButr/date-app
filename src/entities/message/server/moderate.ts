import 'server-only';

import { z } from 'zod';

export const ModerationSchema = z.object({
  verdict: z.enum(['ok', 'warn', 'block']),
  category: z.enum(['none', 'harassment', 'sexual', 'scam', 'spam', 'hate', 'self_harm', 'other']),
  reason: z.string().max(140),
});

export type ModerationResult = z.infer<typeof ModerationSchema>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function moderateMessage(body: string): Promise<ModerationResult> {
  throw new Error('TODO(human): implement moderation prompt and structured() call');
}
