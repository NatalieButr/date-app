'use client';

import { useTransition } from 'react';

import { Button } from '@/shared/ui/button';

import { demoLogin } from '../server/demoLogin';

interface Props {
  className?: string;
}

export function DemoLoginButton({ className }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      await demoLogin();
    });
  }

  return (
    <Button
      variant="outline"
      className={className}
      onClick={handleClick}
      disabled={isPending}
      type="button"
    >
      {isPending ? 'Signing in…' : 'Try demo'}
    </Button>
  );
}
