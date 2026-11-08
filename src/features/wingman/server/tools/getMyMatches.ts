import 'server-only';

import { getMyMatches } from '@/entities/match/server';
import { listMessages } from '@/entities/message/server';
import type { Message } from '@/entities/message';
import { getProfile } from '@/entities/profile/server';
import { PublicProfileSchema } from '@/entities/profile';
import type { Match } from '@/entities/match';
import type { PublicProfile } from '@/entities/profile';

export interface MatchWithProfile {
  match: Match;
  profile: PublicProfile | null;
  // TODO(spec): getLastMessages batch call would avoid N+1 queries here.
  lastMessage: Message | null;
}

export async function getMyMatchesTool(viewerId: string): Promise<MatchWithProfile[]> {
  const matches = await getMyMatches(viewerId);
  const enriched = await Promise.all(
    matches.map(async (match) => {
      const [row, messages] = await Promise.all([
        getProfile(match.other_user_id),
        listMessages(match.id, 1),
      ]);
      const profile = row ? PublicProfileSchema.parse(row) : null;
      const lastMessage = messages[0] ?? null;
      return { match, profile, lastMessage };
    }),
  );
  return enriched;
}
