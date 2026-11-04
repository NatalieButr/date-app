import { describe, it, expect } from 'vitest';
import { calculateCost, calculateEmbeddingCost } from '../pricing';

describe('calculateCost', () => {
  it('calculates cost for smart tier (input + output, no cache)', () => {
    // 1000 input * (3/1M) + 500 output * (15/1M) = 0.003 + 0.0075 = 0.0105
    const cost = calculateCost('smart', { input_tokens: 1000, output_tokens: 500 });
    expect(cost).toBeCloseTo(0.0105, 6);
  });

  it('calculates cost for fast tier', () => {
    // 2000 * (0.8/1M) + 1000 * (4/1M) = 0.0016 + 0.004 = 0.0056
    const cost = calculateCost('fast', { input_tokens: 2000, output_tokens: 1000 });
    expect(cost).toBeCloseTo(0.0056, 6);
  });

  it('includes cache read tokens in cost', () => {
    // 100 input * (3/1M) + 100 output * (15/1M) + 1000 cache_read * (0.3/1M)
    // = 0.0003 + 0.0015 + 0.0003 = 0.0021
    const cost = calculateCost('smart', {
      input_tokens: 100,
      output_tokens: 100,
      cache_read_input_tokens: 1000,
    });
    expect(cost).toBeCloseTo(0.0021, 6);
  });

  it('includes cache write tokens in cost', () => {
    // 500 * (0.8/1M) + 200 * (4/1M) + 1000 cache_write * (1.0/1M)
    // = 0.0004 + 0.0008 + 0.001 = 0.0022
    const cost = calculateCost('fast', {
      input_tokens: 500,
      output_tokens: 200,
      cache_creation_input_tokens: 1000,
    });
    expect(cost).toBeCloseTo(0.0022, 6);
  });

  it('handles all token types simultaneously', () => {
    // smart: 1000 in + 500 out + 2000 cache_write + 3000 cache_read
    // = 1000*(3/1M) + 500*(15/1M) + 2000*(3.75/1M) + 3000*(0.3/1M)
    // = 0.003 + 0.0075 + 0.0075 + 0.0009 = 0.0189
    const cost = calculateCost('smart', {
      input_tokens: 1000,
      output_tokens: 500,
      cache_creation_input_tokens: 2000,
      cache_read_input_tokens: 3000,
    });
    expect(cost).toBeCloseTo(0.0189, 6);
  });

  it('returns 0 for all-zero usage', () => {
    const cost = calculateCost('smart', { input_tokens: 0, output_tokens: 0 });
    expect(cost).toBe(0);
  });
});

describe('calculateEmbeddingCost', () => {
  it('calculates cost for Voyage embeddings', () => {
    // 1_000_000 tokens * (0.06/1M) = 0.06
    const cost = calculateEmbeddingCost(1_000_000);
    expect(cost).toBeCloseTo(0.06, 6);
  });

  it('returns 0 for 0 tokens', () => {
    expect(calculateEmbeddingCost(0)).toBe(0);
  });
});
