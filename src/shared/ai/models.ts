import 'server-only';

import { serverEnv } from '@/shared/config/env.server';

export type ModelTier = 'smart' | 'fast';

export function modelFor(tier: ModelTier): string {
  const env = serverEnv();
  return tier === 'smart' ? env.CLAUDE_MODEL_SMART : env.CLAUDE_MODEL_FAST;
}
