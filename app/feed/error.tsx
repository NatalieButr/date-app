'use client';

import { useEffect } from 'react';

import { Button } from '@/shared/ui/button';

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function FeedError({ error, reset }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 px-4 text-center">
      <div className="text-4xl">😕</div>
      <h2 className="text-lg font-semibold">Could not load your feed</h2>
      <p className="text-muted-foreground max-w-xs text-sm">
        Something went wrong while fetching profiles. Try again in a moment.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
