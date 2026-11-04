import 'server-only';

import { type NextRequest, NextResponse } from 'next/server';

import { requireViewer } from '@/entities/viewer/server';
import { createSupabaseServerClient } from '@/shared/api/supabase/server';
import { badRequest, unauthorized } from '@/shared/lib/http';

import { SwipeRequestSchema, type SwipeResponse } from '../model/schemas';

export async function handleSwipe(
  targetId: string,
  direction: 'like' | 'dislike',
): Promise<SwipeResponse> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc('record_swipe', {
    target: targetId,
    dir: direction,
  });

  if (error) throw new Error(`record_swipe failed: ${error.message}`);

  const row = data?.[0];
  if (!row) throw new Error('record_swipe returned no rows');

  return {
    matched: row.matched,
    matchId: row.match_id ?? undefined,
  };
}

export async function POST(req: NextRequest) {
  try {
    await requireViewer();
  } catch {
    return unauthorized();
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest('invalid_json', 'Request body must be valid JSON');
  }

  const parsed = SwipeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest('validation_error', parsed.error.issues[0]?.message ?? 'Invalid request');
  }

  const { targetId, direction } = parsed.data;

  try {
    const result = await handleSwipe(targetId, direction);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: { code: 'swipe_failed', message: err instanceof Error ? err.message : 'Unknown error' } },
      { status: 500 },
    );
  }
}
