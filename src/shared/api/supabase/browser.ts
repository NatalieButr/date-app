import { createBrowserClient } from '@supabase/ssr';

import { publicEnv } from '@/shared/config/env.public';

import type { Database } from './database.types';

export function createSupabaseBrowserClient() {
  const env = publicEnv();
  return createBrowserClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
}
