import 'server-only';

import { type NextRequest, NextResponse } from 'next/server';

import { PublicProfileSchema, type PublicProfile } from '@/entities/profile';
import { requireViewer } from '@/entities/viewer/server';
import { createSupabaseServerClient } from '@/shared/api/supabase/server';
import { badRequest, unauthorized } from '@/shared/lib/http';

import { FeedQuerySchema } from '../model/schemas';

// TODO(spec): T-08 will replace this with ranked feed via match_candidates + LLM rerank.
// For now returns random unswiped profiles using two separate queries (PostgREST does not
// support SQL subqueries in filter values).
export async function getFeed(viewerId: string, limit = 10): Promise<PublicProfile[]> {
  const supabase = await createSupabaseServerClient();

  const { data: swiped } = await supabase
    .from('swipes')
    .select('target_id')
    .eq('swiper_id', viewerId);
  const swipedIds = swiped?.map((s) => s.target_id) ?? [];

  const baseQuery = supabase
    .from('public_profiles')
    .select('*')
    .neq('id', viewerId);

  const filteredQuery =
    swipedIds.length > 0
      ? baseQuery.not('id', 'in', `(${swipedIds.join(',')})`)
      : baseQuery;

  const { data, error } = await filteredQuery.limit(limit);

  if (error) throw new Error(`getFeed failed: ${error.message}`);

  return (data ?? []).map((row) => PublicProfileSchema.parse(row));
}

export async function GET(req: NextRequest) {
  let viewer;
  try {
    viewer = await requireViewer();
  } catch {
    return unauthorized();
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
