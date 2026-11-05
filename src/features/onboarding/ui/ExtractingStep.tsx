'use client';

import { Skeleton } from '@/shared/ui/skeleton';

export function ExtractingStep() {
  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <div className="flex flex-col gap-2 w-full max-w-xs">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-3/5" />
      </div>
      <p className="text-sm text-muted-foreground">Analyzing your answers…</p>
    </div>
  );
}
