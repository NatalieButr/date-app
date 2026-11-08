import 'server-only';

import { redirect } from 'next/navigation';

import { createSupabaseServerClient } from '@/shared/api/supabase/server';
import { serverEnv } from '@/shared/config/env.server';
import { unauthorized } from '@/shared/lib/http';

export async function demoLoginPOST(): Promise<Response> {
  const { DEMO_USER_EMAIL, DEMO_USER_PASSWORD } = serverEnv();

  if (!DEMO_USER_EMAIL || !DEMO_USER_PASSWORD) {
    return unauthorized();
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: DEMO_USER_EMAIL,
    password: DEMO_USER_PASSWORD,
  });

  if (error)
    return new Response(
      JSON.stringify({ error: { code: 'auth_failed', message: error.message } }),
      { status: 401 },
    );

  redirect('/feed');
}
