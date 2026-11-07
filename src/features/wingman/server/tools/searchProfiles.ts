import 'server-only';

import { searchProfilesByQuery } from '@/entities/profile/server';
import type { PublicProfile } from '@/entities/profile';

import { SearchProfilesInputSchema } from '../../model/schemas';

export async function searchProfilesTool(
  viewerId: string,
  rawInput: unknown,
): Promise<PublicProfile[]> {
  const input = SearchProfilesInputSchema.parse(rawInput);
  return searchProfilesByQuery(viewerId, input.query, input.limit ?? 5, input.city);
}
