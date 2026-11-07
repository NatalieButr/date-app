import { z } from 'zod';

import { PublicProfileSchema } from '@/entities/profile';

// POST /api/wingman body
export const WingmanBodySchema = z.object({
  query: z.string().min(1).max(500),
});
export type WingmanBody = z.infer<typeof WingmanBodySchema>;

// POST /api/wingman/confirm body
export const WingmanConfirmBodySchema = z.object({
  targetId: z.string().uuid(),
  text: z.string().min(1).max(2000),
});
export type WingmanConfirmBody = z.infer<typeof WingmanConfirmBodySchema>;

// SSE event shapes (SPEC §F8)
export const WingmanStepEventSchema = z.object({
  type: z.literal('step'),
  tool: z.string(),
  label: z.string(),
});

export const WingmanDraftSchema = z.object({
  targetId: z.string().uuid(),
  text: z.string(),
});

export const WingmanFinalEventSchema = z.object({
  type: z.literal('final'),
  text: z.string(),
  profiles: z.array(PublicProfileSchema),
  drafts: z.array(WingmanDraftSchema),
});

export const WingmanErrorEventSchema = z.object({
  type: z.literal('error'),
  message: z.string(),
});

export const WingmanEventSchema = z.discriminatedUnion('type', [
  WingmanStepEventSchema,
  WingmanFinalEventSchema,
  WingmanErrorEventSchema,
]);

export type WingmanEvent = z.infer<typeof WingmanEventSchema>;
export type WingmanDraft = z.infer<typeof WingmanDraftSchema>;

// Tool input schemas
export const SearchProfilesInputSchema = z.object({
  query: z.string().min(1),
  city: z.string().optional(),
  limit: z.number().int().min(1).max(10).optional().default(5),
});
export type SearchProfilesInput = z.infer<typeof SearchProfilesInputSchema>;

export const GetProfileInputSchema = z.object({
  id: z.string().uuid(),
});
export type GetProfileInput = z.infer<typeof GetProfileInputSchema>;

export const GetMyMatchesInputSchema = z.object({});
export type GetMyMatchesInput = z.infer<typeof GetMyMatchesInputSchema>;

export const SuggestDateIdeasInputSchema = z.object({
  city: z.string().min(1),
  interests: z.array(z.string()).min(1),
});
export type SuggestDateIdeasInput = z.infer<typeof SuggestDateIdeasInputSchema>;

export const DraftMessageInputSchema = z.object({
  target_id: z.string().uuid(),
  intent: z.string().min(1).max(500),
});
export type DraftMessageInput = z.infer<typeof DraftMessageInputSchema>;
