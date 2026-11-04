import 'server-only';

import { z } from 'zod';
import { serverEnv } from '@/shared/config/env.server';
import { logAiCall } from './log';
import { calculateEmbeddingCost } from './pricing';
import type { Feature } from './complete';

const VOYAGE_API_URL = 'https://api.voyageai.com/v1/embeddings';
const VOYAGE_TIMEOUT_MS = 30_000;

const VoyageResponseSchema = z.object({
  data: z.array(
    z.object({
      embedding: z.array(z.number()),
      index: z.number(),
    }),
  ),
  usage: z.object({ total_tokens: z.number() }),
});

export async function embed(
  texts: string[],
  inputType: 'document' | 'query',
  opts?: { feature?: Feature; userId?: string },
): Promise<number[][]> {
  const env = serverEnv();
  const start = Date.now();
  let status = 'ok';
  let error: string | undefined;
  let totalTokens = 0;

  try {
    const response = await fetch(VOYAGE_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.VOYAGE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: env.VOYAGE_MODEL,
        input: texts,
        input_type: inputType,
      }),
      signal: AbortSignal.timeout(VOYAGE_TIMEOUT_MS),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Voyage API error ${response.status}: ${text}`);
    }

    const data = VoyageResponseSchema.parse(await response.json());
    totalTokens = data.usage.total_tokens;
    return data.data.map((item) => item.embedding);
  } catch (err) {
    status = 'error';
    error = err instanceof Error ? err.message : String(err);
    throw err;
  } finally {
    logAiCall({
      userId: opts?.userId,
      feature: opts?.feature ?? 'seed',
      model: env.VOYAGE_MODEL,
      promptVer: 'embed@1',
      inputTokens: totalTokens,
      outputTokens: 0,
      cacheReadTokens: 0,
      cacheWriteTokens: 0,
      costUsd: calculateEmbeddingCost(totalTokens),
      latencyMs: Date.now() - start,
      status,
      error,
    });
  }
}
