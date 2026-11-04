// H-zone: rerank logic is written by Natallia (see CLAUDE.md §Human-authored zones).
// Agent scaffold only.

import type { PublicProfile } from '@/entities/profile';

export interface RerankResult {
  id: string;
  score: number;
  reason: string;
}

// TODO(human): call structured() with the rerank prompt, validate with RerankSchema,
// cross-check IDs against input set, fill missing with score=0 and neutral reason.
export async function rerankCandidates(
  _viewer: PublicProfile,
  _candidates: PublicProfile[],
): Promise<RerankResult[]> {
  throw new Error('TODO(human): implement rerankCandidates');
}
