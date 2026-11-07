import 'server-only';

import { type NextRequest, NextResponse } from 'next/server';

import { getMatchByTarget } from '@/entities/match/server';
import { createMessage, listMessages, moderateMessage } from '@/entities/message/server';
import { requireViewer } from '@/entities/viewer/server';
import { rateLimit, RateLimitError } from '@/shared/ai';
import { badRequest, rateLimited, unauthorized } from '@/shared/lib/http';

import { WingmanBodySchema, WingmanConfirmBodySchema, type WingmanEvent } from '../model/schemas';
import { wingmanLoop, type ToolDispatch } from './loop';
import { searchProfilesTool } from './tools/searchProfiles';
import { getProfileTool } from './tools/getProfile';
import { getMyMatchesTool } from './tools/getMyMatches';
import { suggestDateIdeasTool } from './tools/suggestDateIdeas';
import { draftMessageTool } from './tools/draftMessage';

const SSE_HEADERS = {
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache',
  Connection: 'keep-alive',
};

export async function wingmanPOST(req: NextRequest): Promise<Response> {
  let viewer;
  try {
    viewer = await requireViewer();
  } catch {
    return unauthorized();
  }

  try {
    await rateLimit(viewer.id, 'wingman');
  } catch (e) {
    if (e instanceof RateLimitError) return rateLimited();
    throw e;
  }

  const body = WingmanBodySchema.safeParse(await req.json().catch(() => ({})));
  if (!body.success) return badRequest('invalid_body', body.error.message);

  const { query } = body.data;
  const viewerId = viewer.id;

  const toolDispatch: ToolDispatch = {
    search_profiles: (input) => searchProfilesTool(viewerId, input),
    get_profile: (input) => getProfileTool(input),
    get_my_matches: () => getMyMatchesTool(viewerId),
    suggest_date_ideas: (input) => suggestDateIdeasTool(viewerId, input),
    draft_message: (input) => draftMessageTool(viewerId, input),
  };

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: WingmanEvent) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };

      try {
        await wingmanLoop(viewerId, query, toolDispatch, send);
      } catch (err) {
        const message =
          err instanceof Error && err.message.startsWith('TODO')
            ? 'Agent not yet implemented'
            : 'An unexpected error occurred';
        send({ type: 'error', message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, { headers: SSE_HEADERS });
}

export async function wingmanConfirmPOST(req: NextRequest): Promise<Response> {
  let viewer;
  try {
    viewer = await requireViewer();
  } catch {
    return unauthorized();
  }

  try {
    await rateLimit(viewer.id, 'wingman');
  } catch (e) {
    if (e instanceof RateLimitError) return rateLimited();
    throw e;
  }

  const body = WingmanConfirmBodySchema.safeParse(await req.json().catch(() => ({})));
  if (!body.success) return badRequest('invalid_body', body.error.message);

  const { targetId, text } = body.data;

  const match = await getMatchByTarget(viewer.id, targetId);
  if (!match) {
    return NextResponse.json(
      { error: { code: 'no_match', message: 'No match found with this profile' } },
      { status: 404 },
    );
  }

  const recentMessages = await listMessages(match.id, 20);

  let moderation: 'ok' | 'warn' | 'block' = 'ok';
  let modReason: string | null = null;

  try {
    const result = await moderateMessage(text, recentMessages);
    moderation = result.verdict;
    modReason = result.reason !== '' ? result.reason : null;
  } catch {
    moderation = 'warn';
    modReason = 'moderation_error';
  }

  if (moderation === 'block') {
    return NextResponse.json(
      { error: { code: 'blocked', message: modReason ?? 'Message blocked by moderation' } },
      { status: 422 },
    );
  }

  const message = await createMessage(match.id, viewer.id, text, moderation, modReason);
  return NextResponse.json({ message }, { status: 201 });
}
