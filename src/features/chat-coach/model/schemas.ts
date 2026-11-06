import { z } from 'zod';

// POST body is empty; matchId comes from the route segment
export const CoachBodySchema = z.object({}).strict();
export type CoachBody = z.infer<typeof CoachBodySchema>;
