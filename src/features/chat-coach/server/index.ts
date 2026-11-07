import 'server-only';

import { type NextRequest, NextResponse } from 'next/server';

import { getMatchForViewer } from '@/entities/match/server';
import { listMessages } from '@/entities/message/server';
import { PublicProfileSchema } from '@/entities/profile';
import { getProfile } from '@/entities/profile/server';
import { requireViewer } from '@/entities/viewer/server';
import { rateLimit, RateLimitError, stream } from '@/shared/ai';
import { badRequest, forbidden, rateLimited, unauthorized } from '@/shared/lib/http';
import { trimToTokenBudget } from '@/shared/lib/tokenBudget';

import { CoachBodySchema } from '../model/schemas';
import { buildCoachSystem } from './buildSystem';
import { buildCoachUserMessage, COACH_PROMPT_VERSION } from './prompts';

const SSE_HEADERS = {
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache',
  Connection: 'keep-alive',
};

/** ~2 000 tokens of conversation history passed to the coach (rest trimmed). */
const HISTORY_TOKEN_BUDGET = 2_000;

export async function coachPOST(req: NextRequest, matchId: string): Promise<Response> {
  const body = CoachBodySchema.safeParse(await req.json().catch(() => ({})));
  if (!body.success) return badRequest('invalid_body', body.error.message);

  let viewer;
  try {
    viewer = await requireViewer();
  } catch {
    return unauthorized();
  }

  try {
    await rateLimit(viewer.id, 'coach');
  } catch (e) {
    if (e instanceof RateLimitError) return rateLimited();
    throw e;
  }

  const match = await getMatchForViewer(matchId, viewer.id);
  if (!match) return forbidden();

  const otherId = match.user_a === viewer.id ? match.user_b : match.user_a;

  const [viewerProfile, otherProfile, recentMessages] = await Promise.all([
    getProfile(viewer.id),
    getProfile(otherId),
    listMessages(matchId, 20),
  ]);

  if (!viewerProfile || !otherProfile) {
    return NextResponse.json(
      { error: { code: 'profile_not_found', message: 'Could not load profiles' } },
      { status: 500 },
    );
  }

  // listMessages returns newest-first; reverse for chronological order then trim
  const chronological = recentMessages.slice().reverse();
  const trimmed = trimToTokenBudget(chronological, HISTORY_TOKEN_BUDGET);

  const system = buildCoachSystem(
    PublicProfileSchema.parse(viewerProfile),
    PublicProfileSchema.parse(otherProfile),
  );
  const userMessage = buildCoachUserMessage(trimmed);

  const aiStream = stream({
    tier: 'smart',
    feature: 'coach',
    promptVer: COACH_PROMPT_VERSION,
    system,
    messages: [{ role: 'user', content: userMessage }],
    maxTokens: 500,
    userId: viewer.id,
  });

  return new Response(aiStream, { headers: SSE_HEADERS });
}
