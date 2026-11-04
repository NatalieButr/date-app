import 'server-only';

import type { Message, MessageParam, TextBlockParam, Tool, ToolChoice } from '@anthropic-ai/sdk/resources';
import { getAnthropic } from './client';
import { modelFor } from './models';
import { logAiCall } from './log';
import { calculateCost, type TokenUsage } from './pricing';
import { AiCallError } from './errors';

export type Feature =
  | 'onboarding'
  | 'bio'
  | 'rerank'
  | 'icebreaker'
  | 'coach'
  | 'moderation'
  | 'wingman'
  | 'seed'
  | 'judge';

export interface CallOptions {
  feature: Feature;
  tier: 'smart' | 'fast';
  system: string | TextBlockParam[];
  messages: MessageParam[];
  tools?: Tool[];
  toolChoice?: ToolChoice;
  maxTokens: number;
  // TODO(spec): temperature not in SDK 1.4.0 — remove from CallOptions if unused, or update when SDK adds it back
  temperature?: number;
  promptVer: string;
  userId?: string;
  allowFallback?: boolean;
}

const TIMEOUT_MS = 30_000;
const MAX_RETRIES = 2;

function isRetryable(err: unknown): boolean {
  if (err != null && typeof err === 'object' && 'status' in err) {
    const status = (err as { status: number }).status;
    return status === 429 || status === 529 || status >= 500;
  }
  return false;
}

function extractUsage(message: Message): TokenUsage {
  // SDK 1.4.0 MessageUsage type omits cache fields; they are present at runtime per Anthropic docs.
  const u = message.usage as TokenUsage & {
    cache_read_input_tokens?: number;
    cache_creation_input_tokens?: number;
  };
  return {
    input_tokens: u.input_tokens,
    output_tokens: u.output_tokens,
    cache_read_input_tokens: u.cache_read_input_tokens ?? 0,
    cache_creation_input_tokens: u.cache_creation_input_tokens ?? 0,
  };
}

async function attemptCall(opts: CallOptions, tier: 'smart' | 'fast', status: string): Promise<Message> {
  const model = modelFor(tier);
  const client = getAnthropic();
  const start = Date.now();
  let callStatus = status;
  let callError: string | undefined;
  let message: Message | undefined;

  try {
    message = await client.messages.create(
      {
        model,
        max_tokens: opts.maxTokens,
        system: opts.system,
        messages: opts.messages,
        ...(opts.tools ? { tools: opts.tools } : {}),
        ...(opts.toolChoice ? { tool_choice: opts.toolChoice } : {}),
      },
      { timeout: TIMEOUT_MS },
    );
    return message;
  } catch (err) {
    callStatus = 'error';
    callError = err instanceof Error ? err.message : String(err);
    throw err;
  } finally {
    const latencyMs = Date.now() - start;
    const usage = message ? extractUsage(message) : null;
    logAiCall({
      userId: opts.userId,
      feature: opts.feature,
      model,
      promptVer: opts.promptVer,
      inputTokens: usage?.input_tokens ?? 0,
      outputTokens: usage?.output_tokens ?? 0,
      cacheReadTokens: usage?.cache_read_input_tokens ?? 0,
      cacheWriteTokens: usage?.cache_creation_input_tokens ?? 0,
      costUsd: usage ? calculateCost(tier, usage) : 0,
      latencyMs,
      status: callStatus,
      error: callError,
    });
  }
}

export async function complete(opts: CallOptions): Promise<Message> {
  const { allowFallback = true } = opts;
  let lastErr: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt - 1) * 1_000));
    }
    try {
      return await attemptCall(opts, opts.tier, attempt === 0 ? 'ok' : 'retry');
    } catch (err) {
      lastErr = err;
      if (!isRetryable(err)) break;
    }
  }

  if (allowFallback && opts.tier === 'smart') {
    try {
      return await attemptCall(opts, 'fast', 'fallback');
    } catch (err) {
      throw new AiCallError('AI call failed after retries and fallback', undefined, err);
    }
  }

  throw new AiCallError('AI call failed after retries', undefined, lastErr);
}
