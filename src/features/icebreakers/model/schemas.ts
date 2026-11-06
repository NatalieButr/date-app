import { z } from 'zod';

// POST body is empty; matchId comes from the route segment
export const IcebreakersBodySchema = z.object({}).strict();
export type IcebreakersBody = z.infer<typeof IcebreakersBodySchema>;
