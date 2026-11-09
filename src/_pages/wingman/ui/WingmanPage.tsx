import { Suspense } from 'react';

import { requireViewer } from '@/entities/viewer/server';
import { AppShell } from '@/widgets/app-shell';
import { WingmanPanel } from '@/widgets/wingman-panel';
import { Skeleton } from '@/shared/ui/skeleton';

function WingmanSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="h-24 rounded-xl" />
      <Skeleton className="h-12 rounded-xl" />
    </div>
  );
}

async function WingmanContent() {
  await requireViewer();
  return <WingmanPanel />;
}

export function WingmanPage() {
  return (
    <AppShell>
      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Wingman</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ask your AI dating assistant to find matches, suggest date ideas, or draft a message.
          </p>
        </div>
        <Suspense fallback={<WingmanSkeleton />}>
          <WingmanContent />
        </Suspense>
      </main>
    </AppShell>
  );
}
