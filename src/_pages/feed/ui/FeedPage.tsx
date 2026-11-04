import { Suspense } from 'react';

import { AppShell } from '@/widgets/app-shell';
import { Skeleton } from '@/shared/ui/skeleton';

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

function FeedEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <p className="text-muted-foreground text-sm">No more profiles for now — check back later.</p>
    </div>
  );
}

// TODO(T-06): replace with real swipe deck
export function FeedPage() {
  return (
    <AppShell>
      <Suspense fallback={<FeedSkeleton />}>
        <FeedEmpty />
      </Suspense>
    </AppShell>
  );
}
