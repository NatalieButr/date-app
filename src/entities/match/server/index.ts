import 'server-only';

import { createSupabaseServerClient } from '@/shared/api/supabase/server';

import { MatchRowSchema, MatchSchema, type Match, type MatchRow } from '../model/schemas';

export async function getMyMatches(viewerId: string): Promise<Match[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .or(`user_a.eq.${viewerId},user_b.eq.${viewerId}`)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`getMyMatches failed: ${error.message}`);

  return (data ?? []).map((row) => {
    const r = MatchRowSchema.parse(row);
    return MatchSchema.parse({
      ...r,
      other_user_id: r.user_a === viewerId ? r.user_b : r.user_a,
    });
  });
}

export async function getMatchForViewer(matchId: string, viewerId: string): Promise<MatchRow | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .eq('id', matchId)
    .or(`user_a.eq.${viewerId},user_b.eq.${viewerId}`)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`getMatchForViewer failed: ${error.message}`);
  }
  return MatchRowSchema.parse(data);
}
