import 'server-only';

import { redirect } from 'next/navigation';

import { createSupabaseServerClient } from '@/shared/api/supabase/server';
import { serverEnv } from '@/shared/config/env.server';

import { ProfileRowSchema, type ProfileRow, type Viewer } from '../model/schemas';

export interface ViewerSession {
  id: string;
  email: string;
  profile: ProfileRow;
}

export async function getCurrentViewer(): Promise<ViewerSession | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return null;

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  if (!profile) return null;

  const parsed = ProfileRowSchema.safeParse(profile);
  if (!parsed.success) return null;

  return { id: user.id, email: user.email, profile: parsed.data };
}

export async function requireViewer(): Promise<ViewerSession> {
  const viewer = await getCurrentViewer();
  if (!viewer) redirect('/login');
  return viewer;
}

export function isOnboarded(profile: ProfileRow): boolean {
  return profile.onboarded_at !== null;
}

export function isAdmin(email: string): boolean {
  const { ADMIN_EMAILS } = serverEnv();
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

export type { Viewer, ProfileRow };
