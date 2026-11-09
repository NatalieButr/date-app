'use client';

import { useEffect } from 'react';

import { Button } from '@/shared/ui/button';

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="text-muted-foreground max-w-sm text-sm">
        An unexpected error occurred. Try again or reload the page.
      </p>
      <Button onClick={reset}>Try again</Button>
    </main>
  );
}
