import { z } from 'zod';

export const AiCallRowSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid().nullable(),
  feature: z.string(),
  model: z.string(),
  prompt_ver: z.string().nullable(),
  input_tokens: z.number().int(),
  output_tokens: z.number().int(),
  cache_read_tokens: z.number().int(),
  cache_write_tokens: z.number().int(),
  cost_usd: z.number(),
  latency_ms: z.number().int(),
  status: z.string(),
  error: z.string().nullable(),
  created_at: z.string(),
});
export type AiCallRow = z.infer<typeof AiCallRowSchema>;

export const MetricsByFeatureSchema = z.object({
  feature: z.string(),
  calls: z.number().int().nonnegative(),
  input_tokens: z.number().int(),
  output_tokens: z.number().int(),
  cache_read_tokens: z.number().int(),
  cache_write_tokens: z.number().int(),
  cost_usd: z.number(),
  latency_p50_ms: z.number(),
  latency_p95_ms: z.number(),
  error_rate: z.number(),
  cache_hit_rate: z.number(),
});
export type MetricsByFeature = z.infer<typeof MetricsByFeatureSchema>;

export const MetricsSummarySchema = z.object({
  metrics: z.array(MetricsByFeatureSchema),
  total_cost_usd: z.number(),
  cost_per_user_day: z.number(),
  from: z.string(),
  to: z.string(),
});
export type MetricsSummary = z.infer<typeof MetricsSummarySchema>;
