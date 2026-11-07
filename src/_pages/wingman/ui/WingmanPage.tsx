import { requireViewer } from '@/entities/viewer/server';
import { AppShell } from '@/widgets/app-shell';
import { WingmanPanel } from '@/widgets/wingman-panel';

export async function WingmanPage() {
  await requireViewer();

  return (
    <AppShell>
      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Wingman</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ask your AI dating assistant to find matches, suggest date ideas, or draft a message.
          </p>
        </div>
        <WingmanPanel />
      </main>
    </AppShell>
  );
}
