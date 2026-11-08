import { describe, expect, it } from 'vitest';

import { AiCallRowSchema, MetricsByFeatureSchema, MetricsSummarySchema } from '../model/schemas';

const validRow = {
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  user_id: null,
  feature: 'wingman',
  model: 'claude-haiku-5-5',
  prompt_ver: '1.0.0',
  input_tokens: 100,
  output_tokens: 50,
  cache_read_tokens: 20,
  cache_write_tokens: 0,
  cost_usd: 0.000123,
  latency_ms: 320,
  status: 'ok',
  error: null,
  created_at: '2026-11-08T00:00:00Z',
};

describe('AiCallRowSchema', () => {
  it('parses a valid row', () => {
    expect(() => AiCallRowSchema.parse(validRow)).not.toThrow();
  });

  it('rejects missing feature', () => {
    const { feature: _feature, ...rest } = validRow;
    expect(AiCallRowSchema.safeParse(rest).success).toBe(false);
  });

  it('allows null user_id', () => {
    const result = AiCallRowSchema.parse({ ...validRow, user_id: null });
    expect(result.user_id).toBeNull();
  });
});

describe('MetricsByFeatureSchema', () => {
  const valid = {
    feature: 'icebreaker',
    calls: 42,
    input_tokens: 1000,
    output_tokens: 500,
    cache_read_tokens: 200,
    cache_write_tokens: 100,
    cost_usd: 0.05,
    latency_p50_ms: 300,
    latency_p95_ms: 800,
    error_rate: 0.02,
    cache_hit_rate: 0.5,
  };

  it('parses valid metrics', () => {
    expect(() => MetricsByFeatureSchema.parse(valid)).not.toThrow();
  });

  it('rejects negative calls', () => {
    expect(MetricsByFeatureSchema.safeParse({ ...valid, calls: -1 }).success).toBe(false);
  });
});

describe('MetricsSummarySchema', () => {
  it('parses a valid summary', () => {
    const summary = {
      metrics: [],
      total_cost_usd: 1.23,
      cost_per_user_day: 0.05,
      from: '2026-11-01T00:00:00Z',
      to: '2026-11-08T00:00:00Z',
    };
    expect(() => MetricsSummarySchema.parse(summary)).not.toThrow();
  });
});
