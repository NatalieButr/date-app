import 'server-only';

import { createSupabaseAdminClient } from '@/shared/api/supabase/admin';
import type { Feature } from './complete';

export interface LogAiCallParams {
  userId?: string;
  feature: Feature;
  model: string;
  promptVer: string;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  costUsd: number;
  latencyMs: number;
  status: string;
  error?: string;
}

// Fire-and-forget: intentionally not awaited. Must never throw.
export function logAiCall(params: LogAiCallParams): void {
  try {
    createSupabaseAdminClient()
      .from('ai_calls')
      .insert({
        user_id: params.userId ?? null,
        feature: params.feature,
        model: params.model,
        prompt_ver: params.promptVer,
        input_tokens: params.inputTokens,
        output_tokens: params.outputTokens,
        cache_read_tokens: params.cacheReadTokens,
        cache_write_tokens: params.cacheWriteTokens,
        cost_usd: params.costUsd,
        latency_ms: params.latencyMs,
        status: params.status,
        error: params.error ?? null,
      })
      .then(({ error }) => {
        if (error) console.error('[ai/log] Failed to log AI call:', error.message);
      });
  } catch (err) {
    console.error('[ai/log] Unexpected error:', err);
  }
}
