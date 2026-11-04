import Link from 'next/link';

import { Button } from '@/shared/ui/button';

export function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-4xl font-bold tracking-tight">Spark</h1>
      <p className="text-muted-foreground">AI dating powered by Claude</p>
      <Button asChild>
        <Link href="/login">Get started</Link>
      </Button>
    </main>
  );
}
