import Link from 'next/link';

import { Button } from '@/shared/ui/button';

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
      <h2 className="text-xl font-semibold">Page not found</h2>
      <p className="text-muted-foreground max-w-sm text-sm">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Button asChild>
        <Link href="/">Go home</Link>
      </Button>
    </main>
  );
}
