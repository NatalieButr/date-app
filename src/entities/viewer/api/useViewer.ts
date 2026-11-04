'use client';

import { useEffect, useState } from 'react';

import { createSupabaseBrowserClient } from '@/shared/api/supabase/browser';

import type { ProfileRow } from '../model/schemas';

export interface ViewerState {
  id: string;
  email: string;
  profile: ProfileRow | null;
}

export function useViewer(): { viewer: ViewerState | null; loading: boolean } {
  const [viewer, setViewer] = useState<ViewerState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    async function fetchProfile(userId: string, email: string) {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
      setViewer({ id: userId, email, profile: data ?? null });
    }

    // getUser() re-validates the session with the Supabase server (unlike
    // getSession() which reads from local storage and can be spoofed).
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) {
        fetchProfile(user.id, user.email).finally(() => setLoading(false));
      } else {
        setViewer(null);
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user.email) {
        fetchProfile(session.user.id, session.user.email);
      } else {
        setViewer(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return { viewer, loading };
}
