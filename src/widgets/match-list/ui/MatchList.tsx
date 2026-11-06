import { getMyMatches } from '@/entities/match/server';
import { MatchListItem } from '@/entities/match';
import { getProfile } from '@/entities/profile/server';
import { requireViewer } from '@/entities/viewer/server';

export async function MatchList() {
  const viewer = await requireViewer();
  const matches = await getMyMatches(viewer.id);

  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-muted-foreground">No matches yet.</p>
        <p className="text-sm text-muted-foreground mt-1">Keep swiping to find your match!</p>
      </div>
    );
  }

  const withProfiles = await Promise.all(
    matches.map(async (match) => {
      const profile = await getProfile(match.other_user_id);
      return { match, profile };
    }),
  );

  return (
    <div className="flex flex-col gap-1">
      {withProfiles.map(({ match, profile }) => (
        <MatchListItem
          key={match.id}
          match={match}
          otherName={profile?.name ?? 'Unknown'}
          otherAvatar={profile?.avatar_url ?? null}
        />
      ))}
    </div>
  );
}
