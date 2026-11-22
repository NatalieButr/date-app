import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

import { updateSession } from '@/shared/api/supabase/proxy';
import { publicEnv } from '@/shared/config/env.public';
import type { Database } from '@/shared/api/supabase/database.types';

const PUBLIC_PATHS = [
  '/',
  '/login',
  '/forgot-password',
  '/reset-password',
  // /match-modal-test is a test-only route; only expose it when USE_TEST_ROUTES is set
  // (playwright.config.ts webServer.env sets this during e2e runs). In production the
  // var is absent and the route is not public — unauthenticated requests redirect to /login.
  ...(process.env.USE_TEST_ROUTES
    ? ['/match-modal-test', '/admin-landmark-test', '/chat-log-test']
    : []),
];

function isPublicPath(pathname: string): boolean {
  // API routes handle their own auth — do not redirect, let them return 401/403
  if (pathname.startsWith('/api/')) return true;
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

// Next.js 16: formerly middleware.ts. Refreshes the session and applies redirects.
export async function proxy(request: NextRequest) {
  // Refresh and propagate session cookies via the shared helper.
  const response = await updateSession(request);

  // A second lightweight client reuses the now-refreshed request cookies
  // only for auth/profile reads needed by redirect logic below.
  const env = publicEnv();
  const supabase = createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Session was already refreshed by updateSession; just carry any
          // extra Set-Cookie headers through to the existing response.
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (!user) {
    if (!isPublicPath(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
    return response;
  }

  // TODO(spec): entities/viewer/server uses next/headers and cannot be called from
  // middleware. The onboarded_at check is inlined here until a middleware-compatible
  // helper (accepting NextRequest directly) is added to entities/viewer/server.
  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarded_at')
    .eq('id', user.id)
    .single();

  const onboarded = Boolean(profile?.onboarded_at);

  if (pathname === '/login' || pathname.startsWith('/login/')) {
    const url = request.nextUrl.clone();
    url.pathname = onboarded ? '/feed' : '/onboarding';
    return NextResponse.redirect(url);
  }

  if (!onboarded && pathname !== '/onboarding' && !pathname.startsWith('/onboarding/')) {
    const url = request.nextUrl.clone();
    url.pathname = '/onboarding';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
