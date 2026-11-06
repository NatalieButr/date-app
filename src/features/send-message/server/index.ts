import 'server-only';

import { type NextRequest, NextResponse } from 'next/server';

import { getMatchForViewer } from '@/entities/match/server';
import { createMessage, moderateMessage } from '@/entities/message/server';
import { requireViewer } from '@/entities/viewer/server';
import { rateLimit, RateLimitError } from '@/shared/ai';
import { badRequest, forbidden, rateLimited, unauthorized } from '@/shared/lib/http';

import { SendMessageBodySchema } from '../model/schemas';

export async function sendMessagePOST(req: NextRequest, matchId: string) {
  let viewer;
  try {
    viewer = await requireViewer();
  } catch {
    return unauthorized();
  }

  try {
    await rateLimit(viewer.id, 'send-message');
  } catch (e) {
    if (e instanceof RateLimitError) return rateLimited();
    throw e;
  }

  const match = await getMatchForViewer(matchId, viewer.id);
  if (!match) return forbidden();

  let body: { body: string };
  try {
    const json: unknown = await req.json();
    const parsed = SendMessageBodySchema.safeParse(json);
    if (!parsed.success) {
      return badRequest('validation_error', parsed.error.issues[0]?.message ?? 'Invalid request');
    }
    body = parsed.data;
  } catch {
    return badRequest('invalid_json', 'Request body must be valid JSON');
  }

  let moderation: 'ok' | 'warn' | 'block' = 'ok';
  let modReason: string | null = null;

  try {
    const result = await moderateMessage(body.body);
    moderation = result.verdict;
    modReason = result.reason !== '' ? result.reason : null;
  } catch {
    // fail-open: treat moderation errors as 'warn' per SPEC §F7
    moderation = 'warn';
    modReason = 'moderation_error';
  }

  if (moderation === 'block') {
    return NextResponse.json(
      { error: { code: 'blocked', message: modReason ?? 'Message blocked by moderation' } },
      { status: 422 },
    );
  }

  const message = await createMessage(matchId, viewer.id, body.body, moderation, modReason);
  return NextResponse.json({ message }, { status: 201 });
}
