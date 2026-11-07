import 'server-only';

import { getProfile } from '@/entities/profile/server';
import type { PublicProfile } from '@/entities/profile';
import { PublicProfileSchema } from '@/entities/profile';

import { GetProfileInputSchema } from '../../model/schemas';

export async function getProfileTool(rawInput: unknown): Promise<PublicProfile | null> {
  const { id } = GetProfileInputSchema.parse(rawInput);
  const row = await getProfile(id);
  if (!row) return null;
  return PublicProfileSchema.parse(row);
}
