import 'server-only';

import { createSupabaseAdminClient } from '@/shared/api/supabase/admin';
import { PublicProfileSchema, ProfileRowSchema, type PublicProfile, type ProfileRow } from '../model/schemas';

export async function upsertProfileEmbedding(id: string, embedding: number[]): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from('profiles')
    .update({ embedding: `[${embedding.join(',')}]` })
    .eq('id', id);
  if (error) throw new Error(`upsertProfileEmbedding failed for ${id}: ${error.message}`);
}

// TODO(spec): match_candidates RPC filters by viewer's looking_for — viewer UUID required.
// When called from Wingman search (no viewer context), pass a sentinel or extend the RPC.
export async function searchProfilesByVector(
  viewerId: string,
  limit: number,
): Promise<PublicProfile[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.rpc('match_candidates', {
    viewer: viewerId,
    k: limit,
  });
  if (error) throw new Error(`searchProfilesByVector failed: ${error.message}`);
  return (data ?? []).map((row: unknown) => PublicProfileSchema.parse(row));
}

// TODO(spec): uses admin client (bypasses RLS). T-06 feed endpoint should use the
// RLS server client instead so users cannot fetch arbitrary profiles directly.
export async function getProfile(id: string): Promise<ProfileRow | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`getProfile failed for ${id}: ${error.message}`);
  }
  return ProfileRowSchema.parse(data);
}
