import 'server-only';

import { type NextRequest, NextResponse } from 'next/server';

import { getMatchForViewer } from '@/entities/match/server';
import { PublicProfileSchema } from '@/entities/profile';
import { getProfile } from '@/entities/profile/server';
import { requireViewer } from '@/entities/viewer/server';
import { rateLimit, RateLimitError, stream } from '@/shared/ai';
import { badRequest, forbidden, rateLimited, unauthorized } from '@/shared/lib/http';

import { IcebreakersBodySchema } from '../model/schemas';
import { buildIcebreakerSystem } from './buildSystem';
import { getIcebreakerUserPrompt, ICEBREAKER_PROMPT_VERSION } from './prompts';

const SSE_HEADERS = {
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache',
  Connection: 'keep-alive',
};

export async function icebreakersPOST(req: NextRequest, matchId: string): Promise<Response> {
  const body = IcebreakersBodySchema.safeParse(await req.json().catch(() => ({})));
  if (!body.success) return badRequest('invalid_body', body.error.message);

  let viewer;
  try {
    viewer = await requireViewer();
  } catch {
    return unauthorized();
  }

  try {
    await rateLimit(viewer.id, 'icebreakers');
  } catch (e) {
    if (e instanceof RateLimitError) return rateLimited();
    throw e;
  }

  const match = await getMatchForViewer(matchId, viewer.id);
  if (!match) return forbidden();

  const otherId = match.user_a === viewer.id ? match.user_b : match.user_a;

  const [viewerProfile, otherProfile] = await Promise.all([
    getProfile(viewer.id),
    getProfile(otherId),
  ]);

  if (!viewerProfile || !otherProfile) {
    return NextResponse.json(
      { error: { code: 'profile_not_found', message: 'Could not load profiles' } },
      { status: 500 },
    );
  }

  const system = buildIcebreakerSystem(
    PublicProfileSchema.parse(viewerProfile),
    PublicProfileSchema.parse(otherProfile),
  );
  const userPrompt = getIcebreakerUserPrompt();

  const aiStream = stream({
    tier: 'smart',
    feature: 'icebreaker',
    promptVer: ICEBREAKER_PROMPT_VERSION,
    system,
    messages: [{ role: 'user', content: userPrompt }],
    maxTokens: 400,
    userId: viewer.id,
  });

  return new Response(aiStream, { headers: SSE_HEADERS });
}
