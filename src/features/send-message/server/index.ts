import 'server-only';

import { type NextRequest, NextResponse } from 'next/server';

import { getMatchForViewer } from '@/entities/match/server';
import {
  createMessage,
  insertWarningAndCount,
  listMessages,
  moderateMessage,
} from '@/entities/message/server';
import { requireViewer } from '@/entities/viewer/server';
import { rateLimit, RateLimitError } from '@/shared/ai';
import { badRequest, forbidden, rateLimited, unauthorized } from '@/shared/lib/http';

import { SendMessageBodySchema } from '../model/schemas';

const WARNINGS_BLOCK_THRESHOLD = 5;

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

  // Fetch recent messages for context (scam vs. humour detection)
  const recentMessages = await listMessages(matchId, 20);

  let moderation: 'ok' | 'warn' | 'block' = 'ok';
  let modReason: string | null = null;
  let isErrorFallback = false;

  try {
    const result = await moderateMessage(body.body, recentMessages);
    moderation = result.verdict;
    modReason = result.reason !== '' ? result.reason : null;
  } catch {
    // fail-open: treat moderation errors as 'warn' per SPEC §F7.
    // isErrorFallback prevents transient AI outages from counting toward the
    // suspension threshold (user_warnings is for real content violations only).
    moderation = 'warn';
    modReason = 'moderation_error';
    isErrorFallback = true;
  }

  if (moderation === 'block') {
    return NextResponse.json(
      { error: { code: 'blocked', message: modReason ?? 'Message blocked by moderation' } },
      { status: 422 },
    );
  }

  // Save the message first so we can reference its id in the warning
  const message = await createMessage(matchId, viewer.id, body.body, moderation, modReason);

  if (moderation === 'warn' && !isErrorFallback) {
    try {
      const total = await insertWarningAndCount(
        viewer.id,
        matchId,
        message.id,
        modReason ?? 'suspicious_content',
      );
      if (total >= WARNINGS_BLOCK_THRESHOLD) {
        return NextResponse.json(
          {
            error: {
              code: 'user_blocked_repeated_warnings',
              message: `Account suspended: ${modReason ?? 'repeated policy violations'}`,
            },
          },
          { status: 422 },
        );
      }
    } catch {
      // fail-open: warning insertion errors don't block the message
    }
  }

  return NextResponse.json({ message }, { status: 201 });
}
