import 'server-only';

import { z } from 'zod';

import { createSupabaseAdminClient } from '@/shared/api/supabase/admin';

// Fallback constants (USD per 1M tokens) used before the DB cache warms up or when DB is unavailable.
// Update ai_model_pricing in Supabase to change prices without a redeploy.
const FALLBACK_TIER_PRICING: Record<'smart' | 'fast', TierPricing> = {
  smart: { inputPerMtk: 3.0, outputPerMtk: 15.0, cacheWritePerMtk: 3.75, cacheReadPerMtk: 0.3 },
  fast: { inputPerMtk: 0.8, outputPerMtk: 4.0, cacheWritePerMtk: 1.0, cacheReadPerMtk: 0.08 },
};

// TODO(spec): add Voyage pricing to ai_model_pricing table so it can be updated without a redeploy.
const VOYAGE_PRICE_PER_MTK = 0.06;

interface TierPricing {
  inputPerMtk: number;
  outputPerMtk: number;
  cacheWritePerMtk: number;
  cacheReadPerMtk: number;
}

const PricingRowSchema = z.object({
  tier: z.enum(['smart', 'fast']),
  input_per_mtk: z.coerce.number().positive().finite(),
  output_per_mtk: z.coerce.number().positive().finite(),
  cache_write_per_mtk: z.coerce.number().positive().finite(),
  cache_read_per_mtk: z.coerce.number().positive().finite(),
});

const TTL_MS = 5 * 60 * 1000;

interface PricingCacheEntry {
  smart: TierPricing;
  fast: TierPricing;
  expiresAt: number;
}

let cachedPricing: PricingCacheEntry | null = null;
let refreshInFlight = false;

async function refreshPricingCache(): Promise<void> {
  if (refreshInFlight) return;
  refreshInFlight = true;
  try {
    const { data, error } = await createSupabaseAdminClient()
      .from('ai_model_pricing')
      .select('tier, input_per_mtk, output_per_mtk, cache_write_per_mtk, cache_read_per_mtk')
      .in('tier', ['smart', 'fast']);

    if (error || !data || data.length < 2) throw error ?? new Error('incomplete data');

    const validated = data.reduce<Partial<Record<'smart' | 'fast', TierPricing>>>((acc, row) => {
      const result = PricingRowSchema.safeParse(row);
      if (!result.success) {
        console.warn(`[pricing] Invalid pricing row, skipping: ${result.error.message}`);
        return acc;
      }
      const { tier, input_per_mtk, output_per_mtk, cache_write_per_mtk, cache_read_per_mtk } =
        result.data;
      acc[tier] = {
        inputPerMtk: input_per_mtk,
        outputPerMtk: output_per_mtk,
        cacheWritePerMtk: cache_write_per_mtk,
        cacheReadPerMtk: cache_read_per_mtk,
      };
      return acc;
    }, {});

    if (!validated.smart || !validated.fast) throw new Error('incomplete validated pricing data');
    cachedPricing = {
      smart: validated.smart,
      fast: validated.fast,
      expiresAt: Date.now() + TTL_MS,
    };
  } catch {
    console.warn('[pricing] Failed to load pricing from DB, using fallback constants');
  } finally {
    refreshInFlight = false;
  }
}

function getTierPricing(tier: 'smart' | 'fast'): TierPricing {
  if (!cachedPricing || cachedPricing.expiresAt <= Date.now()) {
    // Trigger a background refresh; return fallback for this call.
    refreshPricingCache().catch(() => {});
    // SWR: return stale data for this call while refresh runs in background.
    return cachedPricing?.[tier] ?? FALLBACK_TIER_PRICING[tier];
  }
  return cachedPricing[tier];
}

export interface TokenUsage {
  input_tokens: number;
  output_tokens: number;
  cache_creation_input_tokens?: number;
  cache_read_input_tokens?: number;
}

export function calculateCost(tier: 'smart' | 'fast', usage: TokenUsage): number {
  const p = getTierPricing(tier);
  const perTok = (price: number) => price / 1_000_000;
  return (
    usage.input_tokens * perTok(p.inputPerMtk) +
    usage.output_tokens * perTok(p.outputPerMtk) +
    (usage.cache_creation_input_tokens ?? 0) * perTok(p.cacheWritePerMtk) +
    (usage.cache_read_input_tokens ?? 0) * perTok(p.cacheReadPerMtk)
  );
}

export function calculateEmbeddingCost(tokens: number): number {
  return (tokens / 1_000_000) * VOYAGE_PRICE_PER_MTK;
}

// Exported for testing only.
export function _resetPricingCache(): void {
  cachedPricing = null;
  refreshInFlight = false;
}
