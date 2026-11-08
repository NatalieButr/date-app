'use server';
import 'server-only';

import { redirect } from 'next/navigation';

import { createSupabaseServerClient } from '@/shared/api/supabase/server';
import { serverEnv } from '@/shared/config/env.server';

export async function demoLogin(): Promise<string | null> {
  const { DEMO_USER_EMAIL, DEMO_USER_PASSWORD } = serverEnv();

  if (!DEMO_USER_EMAIL || !DEMO_USER_PASSWORD) {
    return 'Demo login is not configured.';
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: DEMO_USER_EMAIL,
    password: DEMO_USER_PASSWORD,
  });

  if (error) return error.message;

  redirect('/feed');
}
