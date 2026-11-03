import 'server-only';

import { createClient } from '@supabase/supabase-js';

import { publicEnv } from '@/shared/config/env.public';
import { serverEnv } from '@/shared/config/env.server';

import type { Database } from './database.types';

// Обходит RLS. Только server/, scripts/, evals/, shared/ai (правило ESLint).
export function createSupabaseAdminClient() {
  return createClient<Database>(publicEnv().NEXT_PUBLIC_SUPABASE_URL, serverEnv().SUPABASE_SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
