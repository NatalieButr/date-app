'use client';

import { Skeleton } from '@/shared/ui/skeleton';

export function GeneratingBioStep() {
  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <div className="flex flex-col gap-3 w-full">
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
      </div>
      <p className="text-sm text-muted-foreground">Crafting your bio options…</p>
    </div>
  );
}
