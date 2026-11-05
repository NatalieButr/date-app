import 'server-only';

import { type NextRequest, NextResponse } from 'next/server';
import { structured, stream, rateLimit, RateLimitError } from '@/shared/ai';
import { requireViewer } from '@/entities/viewer/server';
import { badRequest, unauthorized, rateLimited, aiGatewayError } from '@/shared/lib/http';
import { ChatRequestSchema, BioOptionsSchema } from '../model/schemas';
import { buildOnboardingSystemPrompt, buildBioPrompt, onboardingPromptVersion, bioPromptVersion } from './prompts';
import { extractProfileFromChat, extractPromptVersion } from './extractProfile';

export async function onboardingChatPOST(req: NextRequest): Promise<Response> {
  let viewer;
  try { viewer = await requireViewer(); } catch { return unauthorized(); }

  try { await rateLimit(viewer.id, 'default'); } catch (e) {
    if (e instanceof RateLimitError) return rateLimited();
    throw e;
  }

  let body: unknown;
  try { body = await req.json(); } catch { return badRequest('invalid_json', 'Request body must be valid JSON'); }

  const parsed = ChatRequestSchema.safeParse(body);
  if (!parsed.success) return badRequest('validation_error', parsed.error.issues[0]?.message ?? 'Invalid request');

  const { messages } = parsed.data;

  // The H-zone prompt builder is not yet implemented — return stub SSE until Natallia fills it.
  const basicInfo = parsed.data.basicInfo ?? { name: '', age: 18, gender: '', looking_for: [], city: '' };
  let systemPrompt: string;
  try {
    systemPrompt = buildOnboardingSystemPrompt(basicInfo);
  } catch {
    return new Response(
      'data: {"type":"content_block_delta","delta":{"type":"text_delta","text":"(onboarding prompt not yet implemented)"}}\n\ndata: {"type":"message_stop"}\n\n',
      { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' } },
    );
  }

  const readable = stream({
    tier: 'smart',
    feature: 'onboarding',
    promptVer: onboardingPromptVersion,
    maxTokens: 512,
    system: systemPrompt,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

export async function extractProfilePOST(req: NextRequest): Promise<NextResponse> {
  let viewer;
  try { viewer = await requireViewer(); } catch { return unauthorized(); }

  try { await rateLimit(viewer.id, 'default'); } catch (e) {
    if (e instanceof RateLimitError) return rateLimited();
    throw e;
  }

  let body: unknown;
  try { body = await req.json(); } catch { return badRequest('invalid_json', 'Request body must be valid JSON'); }

  const parsed = ChatRequestSchema.safeParse(body);
  if (!parsed.success) return badRequest('validation_error', parsed.error.issues[0]?.message ?? 'Invalid request');

  try {
    const result = await extractProfileFromChat(parsed.data.messages, parsed.data.basicInfo?.name);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof Error && err.message.startsWith('TODO(human)')) {
      return NextResponse.json({ error: { code: 'not_implemented', message: 'Extract not yet implemented' } }, { status: 501 });
    }
    return aiGatewayError();
  }
}

export async function bioPOST(req: NextRequest): Promise<NextResponse> {
  let viewer;
  try { viewer = await requireViewer(); } catch { return unauthorized(); }

  try { await rateLimit(viewer.id, 'default'); } catch (e) {
    if (e instanceof RateLimitError) return rateLimited();
    throw e;
  }

  let body: unknown;
  try { body = await req.json(); } catch { return badRequest('invalid_json', 'Request body must be valid JSON'); }

  const parsed = ChatRequestSchema.safeParse(body);
  if (!parsed.success) return badRequest('validation_error', parsed.error.issues[0]?.message ?? 'Invalid request');

  const { messages } = parsed.data;

  const basicInfo = parsed.data.basicInfo ?? { name: '', age: 18, gender: '', looking_for: [], city: '' };
  let bioPrompt: { system: string; user: string };
  try {
    bioPrompt = buildBioPrompt(basicInfo, messages);
  } catch {
    return NextResponse.json({ error: { code: 'not_implemented', message: 'Bio prompt not yet implemented' } }, { status: 501 });
  }

  try {
    const result = await structured(
      {
        tier: 'smart',
        feature: 'bio',
        promptVer: bioPromptVersion,
        maxTokens: 1024,
        system: bioPrompt.system,
        messages: [{ role: 'user', content: bioPrompt.user }],
      },
      BioOptionsSchema,
    );
    return NextResponse.json(result);
  } catch {
    return aiGatewayError();
  }
}

// Re-export prompt versions so they can be referenced externally if needed
export { extractPromptVersion };
