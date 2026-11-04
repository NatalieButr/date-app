import Link from 'next/link';

import type { Match } from '../model/schemas';

interface Props {
  match: Match;
  otherName: string;
  otherAvatar: string | null;
}

export function MatchListItem({ match, otherName, otherAvatar }: Props) {
  return (
    <Link
      href={`/chat/${match.id}`}
      className="flex items-center gap-3 rounded-xl p-3 hover:bg-muted transition-colors"
    >
      {otherAvatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={otherAvatar}
          alt={otherName}
          className="h-12 w-12 rounded-full object-cover"
        />
      ) : (
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-lg font-semibold">
          {otherName[0]}
        </div>
      )}
      <div className="flex flex-col min-w-0">
        <span className="font-medium truncate">{otherName}</span>
        <span className="text-sm text-muted-foreground">Matched</span>
      </div>
    </Link>
  );
}
