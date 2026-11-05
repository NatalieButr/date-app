import { z } from 'zod';

export const SwipeRequestSchema = z.object({
  targetId: z.string().uuid(),
  direction: z.enum(['like', 'dislike']),
});

export const SwipeResponseSchema = z.object({
  matched: z.boolean(),
  matchId: z.string().uuid().optional(),
});

export type SwipeRequest = z.infer<typeof SwipeRequestSchema>;
export type SwipeResponse = z.infer<typeof SwipeResponseSchema>;
