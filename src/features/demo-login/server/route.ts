import 'server-only';

import { demoLogin } from './demoLogin';

// Called by POST /api/auth/demo for external / programmatic access.
// On success demoLogin() throws a redirect — Next.js handles it upstream.
// On error it returns a string message which we surface as JSON.
export async function demoLoginPOST(): Promise<Response> {
  const error = await demoLogin();

  if (error) {
    return new Response(JSON.stringify({ error: { code: 'auth_failed', message: error } }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Unreachable: demoLogin() either redirects (throws) or returns a string.
  return new Response(null, { status: 204 });
}
