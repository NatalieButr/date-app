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
  onboarded_at: z.string().nullable(),
  is_seed: z.boolean(),
  created_at: z.string(),
});

export type ProfileRow = z.infer<typeof ProfileRowSchema>;

export const ViewerSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  profile: ProfileRowSchema,
});

export type Viewer = z.infer<typeof ViewerSchema>;
