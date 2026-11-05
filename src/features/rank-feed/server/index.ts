import 'server-only';

import { type NextRequest, NextResponse } from 'next/server';

import { PublicProfileSchema, type PublicProfile } from '@/entities/profile';
import { requireViewer } from '@/entities/viewer/server';
import { createSupabaseServerClient } from '@/shared/api/supabase/server';
import { createSupabaseAdminClient } from '@/shared/api/supabase/admin';
import { badRequest, unauthorized, rateLimited } from '@/shared/lib/http';
import { rateLimit, RateLimitError } from '@/shared/ai';

import { FeedQuerySchema } from '../model/schemas';
import { rerankCandidates } from './rerank';
import { rerankPromptVersion } from './prompts';

export async function getFeed(viewerId: string, limit = 10): Promise<PublicProfile[]> {
  const supabase = await createSupabaseServerClient();
  const admin = createSupabaseAdminClient();

  // 1. Retrieval: vector similarity via match_candidates RPC
  const { data: candidateRows, error: rpcError } = await supabase.rpc('match_candidates', {
    viewer: viewerId,
    k: 20,
  });
  if (rpcError) throw new Error(`match_candidates failed: ${rpcError.message}`);

  const candidates: PublicProfile[] = (candidateRows ?? []).map((row) =>
    PublicProfileSchema.parse(row),
  );
  if (candidates.length === 0) return [];

  const candidateIds = candidates.map((c) => c.id);

  // 2. Check explanation cache for current prompt_ver
  const { data: cachedRows } = await admin
    .from('match_explanations')
    .select('target_id, score, reason')
    .eq('viewer_id', viewerId)
    .eq('prompt_ver', rerankPromptVersion)
    .in('target_id', candidateIds);

  const cachedMap = new Map<string, { score: number; reason: string }>(
    (cachedRows ?? []).map((r) => [r.target_id, { score: r.score, reason: r.reason }]),
  );

  const uncached = candidates.filter((c) => !cachedMap.has(c.id));

  // 3. Rerank uncached candidates — fetch viewer's full profile first
  if (uncached.length > 0) {
    const { data: viewerRow } = await supabase
      .from('public_profiles')
      .select('*')
      .eq('id', viewerId)
      .single();

    if (!viewerRow) {
      // Authenticated viewer has no public profile — onboarding incomplete; skip rerank.
      throw new Error(`getFeed: viewer ${viewerId} has no public profile`);
    }

    const viewer = PublicProfileSchema.parse(viewerRow);
    const results = await rerankCandidates(viewer, uncached);

    // 4. Write results to match_explanations (upsert, PK is viewer_id + target_id)
    const inserts = results.map((r) => ({
      viewer_id: viewerId,
      target_id: r.id,
      score: r.score,
      reason: r.reason,
      prompt_ver: rerankPromptVersion,
    }));

    const { error: upsertError } = await admin
      .from('match_explanations')
      .upsert(inserts, { onConflict: 'viewer_id,target_id' });

    if (upsertError) {
      // Cache write failed — log and continue; next request will re-call the AI.
      console.error('match_explanations upsert failed:', upsertError.message);
    }

    for (const r of results) {
      cachedMap.set(r.id, { score: r.score, reason: r.reason });
    }
  }

  // 5. Sort by score desc, return top N profiles
  return candidates
    .map((c) => ({ profile: c, score: cachedMap.get(c.id)?.score ?? 0 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.profile);
}

export async function GET(req: NextRequest) {
  let viewer;
  try {
    viewer = await requireViewer();
  } catch {
    return unauthorized();
  }

  try { await rateLimit(viewer.id, 'default'); } catch (e) {
    if (e instanceof RateLimitError) return rateLimited();
    throw e;
  }

  const { searchParams } = req.nextUrl;
  const parsed = FeedQuerySchema.safeParse({ limit: searchParams.get('limit') ?? 20 });
  if (!parsed.success) {
    return badRequest('validation_error', parsed.error.issues[0]?.message ?? 'Invalid request');
  }

  try {
    const profiles = await getFeed(viewer.id, parsed.data.limit);
    return NextResponse.json({ profiles });
  } catch (err) {
    return NextResponse.json(
      { error: { code: 'feed_failed', message: err instanceof Error ? err.message : 'Unknown error' } },
      { status: 500 },
    );
  }
}
