'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { signOut } from '@/features/auth-by-email/server';
import { useViewer } from '@/entities/viewer';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';

const NAV_LINKS = [
  { href: '/feed', label: 'Feed' },
  { href: '/matches', label: 'Matches' },
  { href: '/wingman', label: 'Wingman' },
];

export function NavBar() {
  const pathname = usePathname();
  const { viewer } = useViewer();

  const initials = viewer?.profile?.name
    ? viewer.profile.name.slice(0, 2).toUpperCase()
    : (viewer?.email?.slice(0, 2).toUpperCase() ?? '?');

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <nav className="mx-auto flex h-14 max-w-screen-md items-center gap-4 px-4">
        <Link href="/feed" className="mr-2 font-bold tracking-tight">
          Spark
        </Link>

        <div className="flex flex-1 items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              aria-current={pathname.startsWith(href) ? 'page' : undefined}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent ${
                pathname.startsWith(href)
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              {label}
              {/* TODO(T-06): matches badge */}
              {href === '/matches' && (
                <Badge
                  variant="secondary"
                  className="ml-1.5 h-4 min-w-4 px-1 text-[10px]"
                  aria-label="0 new matches"
                >
                  0
                </Badge>
              )}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={viewer?.profile?.avatar_url ?? undefined}
              alt={viewer?.profile?.name}
            />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <form action={signOut}>
            <Button variant="ghost" size="sm" type="submit" className="text-muted-foreground">
              Sign out
            </Button>
          </form>
        </div>
      </nav>
    </header>
  );
}
