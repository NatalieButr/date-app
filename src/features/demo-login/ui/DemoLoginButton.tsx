'use client';

import { useState, useTransition } from 'react';

import { Button } from '@/shared/ui/button';

import { demoLogin } from '../server/demoLogin';

interface Props {
  className?: string;
}

export function DemoLoginButton({ className }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const err = await demoLogin();
      if (err) setError(err);
    });
  }

  return (
    <div className="flex flex-col items-center gap-1.5">
      <Button
        variant="outline"
        className={className}
        onClick={handleClick}
        disabled={isPending}
        type="button"
      >
        {isPending ? 'Signing in…' : 'Try demo'}
      </Button>
      {error ? (
        <p role="alert" className="text-destructive text-xs">
          {error}
        </p>
      ) : null}
    </div>
  );
}
