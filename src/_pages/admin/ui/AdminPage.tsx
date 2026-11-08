import { notFound } from 'next/navigation';

import { getAdminMetrics } from '@/entities/ai-call/server';
import { isAdmin, requireViewer } from '@/entities/viewer/server';
import { AppShell } from '@/widgets/app-shell';
import { AdminDashboard } from '@/widgets/admin-dashboard';

export async function AdminPage() {
  const viewer = await requireViewer();

  if (!isAdmin(viewer.email)) {
    notFound();
  }

  const summary = await getAdminMetrics();

  return (
    <AppShell>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Admin — AI metrics</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Calls, tokens, cost and latency by feature.
          </p>
        </div>
        <AdminDashboard initial={summary} />
      </main>
    </AppShell>
  );
}
