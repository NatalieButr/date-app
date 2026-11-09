import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculateCost, calculateEmbeddingCost, _resetPricingCache } from '../pricing';

// Mock the Supabase admin client so tests don't make real DB calls.
vi.mock('@/shared/api/supabase/admin', () => ({
  createSupabaseAdminClient: vi.fn(),
}));

import { createSupabaseAdminClient } from '@/shared/api/supabase/admin';

function mockAdminClient(rows: Record<string, unknown>[] | null, error: unknown = null) {
  const single = vi.fn().mockResolvedValue({ data: rows?.[0] ?? null, error });
  const inFn = vi.fn().mockReturnValue({ data: rows, error });
  const select = vi.fn().mockReturnValue({ in: inFn, single });
  const from = vi.fn().mockReturnValue({ select });
  vi.mocked(createSupabaseAdminClient).mockReturnValue({ from } as unknown as ReturnType<
    typeof createSupabaseAdminClient
  >);
}

beforeEach(() => {
  _resetPricingCache();
  vi.clearAllMocks();
});

describe('calculateCost — fallback (cold cache)', () => {
  beforeEach(() => {
    // DB fails → fallback constants must be used
    mockAdminClient(null, new Error('DB unavailable'));
  });

  it('calculates cost for smart tier using fallback constants', () => {
    // 1000 input * (3/1M) + 500 output * (15/1M) = 0.003 + 0.0075 = 0.0105
    expect(calculateCost('smart', { input_tokens: 1000, output_tokens: 500 })).toBeCloseTo(
      0.0105,
      6,
    );
  });

  it('calculates cost for fast tier using fallback constants', () => {
    // 2000 * (0.8/1M) + 1000 * (4/1M) = 0.0016 + 0.004 = 0.0056
    expect(calculateCost('fast', { input_tokens: 2000, output_tokens: 1000 })).toBeCloseTo(
      0.0056,
      6,
    );
  });

  it('includes cache read tokens', () => {
    // 100*(3/1M) + 100*(15/1M) + 1000*(0.3/1M) = 0.0003 + 0.0015 + 0.0003 = 0.0021
    expect(
      calculateCost('smart', {
        input_tokens: 100,
        output_tokens: 100,
        cache_read_input_tokens: 1000,
      }),
    ).toBeCloseTo(0.0021, 6);
  });

  it('includes cache write tokens', () => {
    // 500*(0.8/1M) + 200*(4/1M) + 1000*(1.0/1M) = 0.0004 + 0.0008 + 0.001 = 0.0022
    expect(
      calculateCost('fast', {
        input_tokens: 500,
        output_tokens: 200,
        cache_creation_input_tokens: 1000,
      }),
    ).toBeCloseTo(0.0022, 6);
  });

  it('handles all token types', () => {
    // smart: 1000*(3/1M) + 500*(15/1M) + 2000*(3.75/1M) + 3000*(0.3/1M)
    // = 0.003 + 0.0075 + 0.0075 + 0.0009 = 0.0189
    expect(
      calculateCost('smart', {
        input_tokens: 1000,
        output_tokens: 500,
        cache_creation_input_tokens: 2000,
        cache_read_input_tokens: 3000,
      }),
    ).toBeCloseTo(0.0189, 6);
  });

  it('returns 0 for all-zero usage', () => {
    expect(calculateCost('smart', { input_tokens: 0, output_tokens: 0 })).toBe(0);
  });
});

describe('calculateCost — warm cache (DB values)', () => {
  it('uses DB pricing when cache is warm', async () => {
    // Seed cache with custom DB values: smart input = 6.0 $/MTk (2× default)
    mockAdminClient([
      {
        tier: 'smart',
        input_per_mtk: '6.0',
        output_per_mtk: '30.0',
        cache_write_per_mtk: '7.5',
        cache_read_per_mtk: '0.6',
      },
      {
        tier: 'fast',
        input_per_mtk: '1.6',
        output_per_mtk: '8.0',
        cache_write_per_mtk: '2.0',
        cache_read_per_mtk: '0.16',
      },
    ]);

    // Trigger a background refresh and wait for it to complete
    calculateCost('smart', { input_tokens: 0, output_tokens: 0 }); // triggers refresh
    // Wait one microtask tick for the refresh to settle
    await new Promise((r) => setTimeout(r, 0));

    // Now the cache should be warm with DB values (6.0 $/MTk input)
    // 1000 * (6.0/1M) + 500 * (30.0/1M) = 0.006 + 0.015 = 0.021
    expect(calculateCost('smart', { input_tokens: 1000, output_tokens: 500 })).toBeCloseTo(
      0.021,
      6,
    );
  });
});

describe('calculateEmbeddingCost', () => {
  it('calculates Voyage embedding cost', () => {
    // 1_000_000 tokens * (0.06/1M) = 0.06
    expect(calculateEmbeddingCost(1_000_000)).toBeCloseTo(0.06, 6);
  });

  it('returns 0 for 0 tokens', () => {
    expect(calculateEmbeddingCost(0)).toBe(0);
  });
});
