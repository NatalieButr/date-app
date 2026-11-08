import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { getAdminMetrics } from '@/entities/ai-call/server';
import { isAdmin, requireViewer } from '@/entities/viewer/server';
import { AppShell } from '@/widgets/app-shell';
import { AdminDashboard } from '@/widgets/admin-dashboard';
import { Skeleton } from '@/shared/ui/skeleton';

function AdminSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}

async function AdminContent() {
  const viewer = await requireViewer();
  if (!isAdmin(viewer.email)) notFound();

  const summary = await getAdminMetrics();
  return <AdminDashboard initial={summary} />;
}

export function AdminPage() {
  return (
    <AppShell>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Admin — AI metrics</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Calls, tokens, cost and latency by feature.
          </p>
        </div>
        <Suspense fallback={<AdminSkeleton />}>
          <AdminContent />
        </Suspense>
      </main>
    </AppShell>
  );
}
