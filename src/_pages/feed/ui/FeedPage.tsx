import { Suspense } from 'react';

import { AppShell } from '@/widgets/app-shell';
import { SwipeDeck } from '@/widgets/swipe-deck';
import { Skeleton } from '@/shared/ui/skeleton';
import { requireViewer } from '@/entities/viewer/server';
import { getFeed } from '@/features/rank-feed/server';

function FeedSkeleton() {
  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <Skeleton className="h-96 w-full max-w-sm rounded-2xl" />
      <div className="flex gap-6">
        <Skeleton className="h-14 w-14 rounded-full" />
        <Skeleton className="h-14 w-14 rounded-full" />
      </div>
    </div>
  );
}

async function FeedContent() {
  const viewer = await requireViewer();
  const profiles = await getFeed(viewer.id, 20);
  return <SwipeDeck initialProfiles={profiles} />;
}

export function FeedPage() {
  return (
    <AppShell>
      <div className="px-4 py-6">
        <Suspense fallback={<FeedSkeleton />}>
          <FeedContent />
        </Suspense>
      </div>
    </AppShell>
  );
}
