import Link from 'next/link';

import { DemoLoginButton } from '@/features/demo-login';
import { Button } from '@/shared/ui/button';
import { serverEnv } from '@/shared/config/env.server';

export function HomePage() {
  const { DEMO_USER_EMAIL } = serverEnv();
  const demoEnabled = Boolean(DEMO_USER_EMAIL);

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight">Spark ✨</h1>
        <p className="text-muted-foreground">AI dating powered by Claude</p>
      </div>
      <div className="flex w-full flex-col gap-3">
        {demoEnabled && <DemoLoginButton className="w-full" />}
        <Button variant={demoEnabled ? 'outline' : 'default'} asChild className="w-full">
          <Link href="/login">Sign in</Link>
        </Button>
      </div>
    </main>
  );
}
