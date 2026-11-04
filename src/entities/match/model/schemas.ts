import { z } from 'zod';

export const MatchRowSchema = z.object({
  id: z.string().uuid(),
  user_a: z.string().uuid(),
  user_b: z.string().uuid(),
  created_at: z.string(),
});

export type MatchRow = z.infer<typeof MatchRowSchema>;

export const MatchSchema = MatchRowSchema.extend({
  other_user_id: z.string().uuid(),
});

export type Match = z.infer<typeof MatchSchema>;
