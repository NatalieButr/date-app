import 'server-only';

import { z } from 'zod';
import { type NextRequest, NextResponse } from 'next/server';

import { getMatchForViewer } from '@/entities/match/server';
import { requireViewer } from '@/entities/viewer/server';
import { badRequest, forbidden, unauthorized } from '@/shared/lib/http';

import { listMessages } from './index';

const GetMessagesQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  before: z.string().uuid().optional(),
});

export async function listMessagesGET(req: NextRequest, matchId: string) {
  let viewer;
  try {
    viewer = await requireViewer();
  } catch {
    return unauthorized();
  }

  const match = await getMatchForViewer(matchId, viewer.id);
  if (!match) return forbidden();

  const { searchParams } = req.nextUrl;
  const parsed = GetMessagesQuerySchema.safeParse({
    limit: searchParams.get('limit'),
    before: searchParams.get('before') ?? undefined,
  });
  if (!parsed.success) {
    return badRequest('validation_error', parsed.error.issues[0]?.message ?? 'Invalid query');
  }

  const messages = await listMessages(matchId, parsed.data.limit, parsed.data.before);
  return NextResponse.json({ messages });
}
