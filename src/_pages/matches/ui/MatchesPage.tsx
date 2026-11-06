import { Suspense } from 'react';

import { MatchList } from '@/widgets/match-list';
import { AppShell } from '@/widgets/app-shell';
import { Skeleton } from '@/shared/ui/skeleton';

function MatchListSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-xl p-3">
          <Skeleton className="h-12 w-12 rounded-full shrink-0" />
          <div className="flex flex-col gap-2 flex-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function MatchesPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-screen-md px-4 py-6">
        <h1 className="text-xl font-semibold mb-4">Matches</h1>
        <Suspense fallback={<MatchListSkeleton />}>
          <MatchList />
        </Suspense>
      </div>
    </AppShell>
  );
}
