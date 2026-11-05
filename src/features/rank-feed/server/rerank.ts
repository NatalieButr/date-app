import 'server-only';

import { z } from 'zod';
import type { PublicProfile } from '@/entities/profile';
import { structured } from '@/shared/ai';
import { buildRerankPrompt, rerankPromptVersion } from './prompts';

export interface RerankResult {
  id: string;
  score: number;
  reason: string;
}

const RerankSchema = z.object({
  ranked_ids: z.array(z.string().uuid()),
});

export async function rerankCandidates(
  viewer: PublicProfile,
  candidates: PublicProfile[],
): Promise<RerankResult[]> {
  if (candidates.length === 0) return [];

  const { system, user } = buildRerankPrompt(viewer, candidates);

  const inputIds = new Set(candidates.map((c) => c.id));

  let rankedIds: string[];
  try {
    const result = await structured(
      {
        tier: 'fast',
        feature: 'rerank',
        promptVer: rerankPromptVersion,
        maxTokens: 512,
        system,
        messages: [{ role: 'user', content: user }],
      },
      RerankSchema,
    );
    // Keep only IDs that exist in the input set (verify against input data per CLAUDE.md)
    rankedIds = result.ranked_ids.filter((id) => inputIds.has(id));
  } catch {
    // Fallback: return candidates in original order
    return candidates.map((c, i) => ({ id: c.id, score: candidates.length - i, reason: 'fallback' }));
  }

  // Fill any missing IDs at the end with score 0
  const rankedSet = new Set(rankedIds);
  const missing = candidates.filter((c) => !rankedSet.has(c.id)).map((c) => c.id);

  const allIds = [...rankedIds, ...missing];
  return allIds.map((id, i) => ({
    id,
    score: missing.includes(id) ? 0 : allIds.length - i,
    reason: missing.includes(id) ? 'not ranked' : 'ranked',
  }));
}
