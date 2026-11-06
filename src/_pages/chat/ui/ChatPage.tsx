import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { getMatchForViewer } from '@/entities/match/server';
import { listMessages } from '@/entities/message/server';
import { getProfile } from '@/entities/profile/server';
import { requireViewer } from '@/entities/viewer/server';
import { ChatWindow } from '@/widgets/chat-window';
import { AppShell } from '@/widgets/app-shell';
import { publicEnv } from '@/shared/config/env.public';
import { Skeleton } from '@/shared/ui/skeleton';

interface Props {
  matchId: string;
}

function ChatSkeleton() {
  return (
    <div className="flex flex-col gap-3 p-4">
      <Skeleton className="h-8 w-48 self-end" />
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-8 w-40 self-end" />
    </div>
  );
}

async function ChatContent({ matchId }: Props) {
  const viewer = await requireViewer();
  const matchRow = await getMatchForViewer(matchId, viewer.id);
  if (!matchRow) notFound();

  const otherUserId = matchRow.user_a === viewer.id ? matchRow.user_b : matchRow.user_a;

  const [messages, otherProfile] = await Promise.all([
    listMessages(matchId, 50),
    getProfile(otherUserId),
  ]);

  const env = publicEnv();

  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      <div className="border-b px-4 py-3 flex items-center gap-3">
        {otherProfile?.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={otherProfile.avatar_url}
            alt={otherProfile.name}
            className="h-9 w-9 rounded-full object-cover"
          />
        ) : (
          <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">
            {(otherProfile?.name ?? '?')[0]}
          </div>
        )}
        <span className="font-medium">{otherProfile?.name ?? 'Unknown'}</span>
      </div>
      <ChatWindow
        matchId={matchId}
        viewerId={viewer.id}
        initialMessages={messages}
        supabaseUrl={env.NEXT_PUBLIC_SUPABASE_URL}
        supabaseKey={env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY}
      />
    </div>
  );
}

export function ChatPage({ matchId }: Props) {
  return (
    <AppShell>
      <Suspense fallback={<ChatSkeleton />}>
        <ChatContent matchId={matchId} />
      </Suspense>
    </AppShell>
  );
}
