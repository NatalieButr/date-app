import { z } from 'zod';

export const ProfileRowSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  age: z.number().int(),
  gender: z.string(),
  looking_for: z.array(z.string()),
  city: z.string(),
  bio: z.string().nullable(),
  interests: z.array(z.string()),
  values: z.array(z.string()),
  seeking: z.string().nullable(),
  red_flags: z.array(z.string()),
  avatar_url: z.string().nullable(),
  is_seed: z.boolean(),
  onboarded_at: z.string().nullable(),
  created_at: z.string(),
});
export type ProfileRow = z.infer<typeof ProfileRowSchema>;

export const PublicProfileSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  age: z.number().int(),
  gender: z.string(),
  city: z.string(),
  bio: z.string().nullable(),
  interests: z.array(z.string()),
  values: z.array(z.string()),
  seeking: z.string().nullable(),
  avatar_url: z.string().nullable(),
});
export type PublicProfile = z.infer<typeof PublicProfileSchema>;

export const SeedProfileSchema = z.object({
  name: z.string(),
  age: z.number().int().min(18).max(99),
  gender: z.string(),
  looking_for: z.array(z.string()).min(1),
  city: z.string(),
  bio: z.string(),
  interests: z.array(z.string()).min(1),
  values: z.array(z.string()).min(1),
  seeking: z.string(),
  red_flags: z.array(z.string()),
});
export type SeedProfile = z.infer<typeof SeedProfileSchema>;

export const SeedBatchSchema = z.object({
  profiles: z.array(SeedProfileSchema).length(10),
});
export type SeedBatch = z.infer<typeof SeedBatchSchema>;
