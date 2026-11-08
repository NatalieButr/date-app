import 'server-only';

import { createSupabaseAdminClient } from '@/shared/api/supabase/admin';

import type { MetricsByFeature, MetricsSummary } from '../model/schemas';

function isoDate(d: Date): string {
  return d.toISOString();
}

function defaultRange(): { from: Date; to: Date } {
  const to = new Date();
  const from = new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000);
  return { from, to };
}

export async function getAdminMetrics(from?: string, to?: string): Promise<MetricsSummary> {
  const range = defaultRange();
  const fromDate = from ? new Date(from) : range.from;
  const toDate = to ? new Date(to) : range.to;

  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from('ai_calls')
    .select(
      'feature, input_tokens, output_tokens, cache_read_tokens, cache_write_tokens, cost_usd, latency_ms, status, user_id, created_at',
    )
    .gte('created_at', isoDate(fromDate))
    .lte('created_at', isoDate(toDate))
    .order('created_at', { ascending: true });

  if (error) throw new Error(`getAdminMetrics failed: ${error.message}`);

  const rows = data ?? [];

  // Aggregate by feature
  const featureMap = new Map<
    string,
    {
      calls: number;
      input_tokens: number;
      output_tokens: number;
      cache_read_tokens: number;
      cache_write_tokens: number;
      cost_usd: number;
      latencies: number[];
      errors: number;
      cache_hits: number;
    }
  >();

  const activeUserDays = new Set<string>();
  let totalCostUsd = 0;

  for (const row of rows) {
    const f = row.feature;
    if (!featureMap.has(f)) {
      featureMap.set(f, {
        calls: 0,
        input_tokens: 0,
        output_tokens: 0,
        cache_read_tokens: 0,
        cache_write_tokens: 0,
        cost_usd: 0,
        latencies: [],
        errors: 0,
        cache_hits: 0,
      });
    }
    const agg = featureMap.get(f)!;
    agg.calls++;
    agg.input_tokens += row.input_tokens;
    agg.output_tokens += row.output_tokens;
    agg.cache_read_tokens += row.cache_read_tokens;
    agg.cache_write_tokens += row.cache_write_tokens;
    agg.cost_usd += Number(row.cost_usd);
    agg.latencies.push(row.latency_ms);
    if (row.status === 'error') agg.errors++;
    if (row.cache_read_tokens > 0) agg.cache_hits++;

    totalCostUsd += Number(row.cost_usd);

    if (row.user_id) {
      const dayKey = `${row.user_id}:${new Date(row.created_at).toISOString().slice(0, 10)}`;
      activeUserDays.add(dayKey);
    }
  }

  function percentile(sorted: number[], p: number): number {
    if (sorted.length === 0) return 0;
    const idx = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, idx)] ?? 0;
  }

  const metrics: MetricsByFeature[] = Array.from(featureMap.entries()).map(([feature, agg]) => {
    const sorted = [...agg.latencies].sort((a, b) => a - b);
    return {
      feature,
      calls: agg.calls,
      input_tokens: agg.input_tokens,
      output_tokens: agg.output_tokens,
      cache_read_tokens: agg.cache_read_tokens,
      cache_write_tokens: agg.cache_write_tokens,
      cost_usd: agg.cost_usd,
      latency_p50_ms: percentile(sorted, 50),
      latency_p95_ms: percentile(sorted, 95),
      error_rate: agg.calls > 0 ? agg.errors / agg.calls : 0,
      cache_hit_rate: agg.calls > 0 ? agg.cache_hits / agg.calls : 0,
    };
  });

  // Sort by cost descending
  metrics.sort((a, b) => b.cost_usd - a.cost_usd);

  // activeUserDays contains "userId:YYYY-MM-DD" keys — its size is the correct denominator
  // for cost per user per day (each user × day counts once).
  const costPerUserDay = activeUserDays.size > 0 ? totalCostUsd / activeUserDays.size : 0;

  return {
    metrics,
    total_cost_usd: totalCostUsd,
    cost_per_user_day: costPerUserDay,
    from: isoDate(fromDate),
    to: isoDate(toDate),
  };
}
