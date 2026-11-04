import 'server-only';

// Prices in USD per 1M tokens.
// TODO(spec): update when Anthropic / Voyage change pricing (https://www.anthropic.com/pricing).
// Consider adding env-var overrides if prices need to differ between deployments.

interface TierPricing {
  inputPerMtk: number;
  outputPerMtk: number;
  cacheWritePerMtk: number;
  cacheReadPerMtk: number;
}

const TIER_PRICING: Record<'smart' | 'fast', TierPricing> = {
  smart: {
    inputPerMtk: 3.0,
    outputPerMtk: 15.0,
    cacheWritePerMtk: 3.75,
    cacheReadPerMtk: 0.3,
  },
  fast: {
    inputPerMtk: 0.8,
    outputPerMtk: 4.0,
    cacheWritePerMtk: 1.0,
    cacheReadPerMtk: 0.08,
  },
};

// USD per 1M tokens for Voyage AI embeddings
const VOYAGE_PRICE_PER_MTK = 0.06;

export interface TokenUsage {
  input_tokens: number;
  output_tokens: number;
  cache_creation_input_tokens?: number;
  cache_read_input_tokens?: number;
}

export function calculateCost(tier: 'smart' | 'fast', usage: TokenUsage): number {
  const p = TIER_PRICING[tier];
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
