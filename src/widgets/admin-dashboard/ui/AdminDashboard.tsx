'use client';

import { useState } from 'react';

import type { MetricsSummary } from '@/entities/ai-call';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Skeleton } from '@/shared/ui/skeleton';

function fmt(n: number, decimals = 2): string {
  return n.toFixed(decimals);
}

function fmtCost(usd: number): string {
  return `$${usd.toFixed(4)}`;
}

function fmtPct(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`;
}

function toDateInput(iso: string): string {
  return iso.slice(0, 10);
}

interface AdminDashboardProps {
  initial: MetricsSummary;
}

export function AdminDashboard({ initial }: AdminDashboardProps) {
  const [summary, setSummary] = useState<MetricsSummary>(initial);
  const [from, setFrom] = useState(toDateInput(initial.from));
  const [to, setTo] = useState(toDateInput(initial.to));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleFilter(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ from, to });
      const res = await fetch(`/api/admin/metrics?${params.toString()}`);
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
        setError(data.error?.message ?? `Error ${res.status}`);
        return;
      }
      const data = (await res.json()) as MetricsSummary;
      setSummary(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  }

  const totals = summary.metrics.reduce(
    (acc, m) => ({
      calls: acc.calls + m.calls,
      input_tokens: acc.input_tokens + m.input_tokens,
      output_tokens: acc.output_tokens + m.output_tokens,
      cache_read_tokens: acc.cache_read_tokens + m.cache_read_tokens,
      cost_usd: acc.cost_usd + m.cost_usd,
    }),
    { calls: 0, input_tokens: 0, output_tokens: 0, cache_read_tokens: 0, cost_usd: 0 },
  );

  return (
    <div className="space-y-6">
      {/* Date range filter */}
      <form onSubmit={(e) => void handleFilter(e)} className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="from" className="text-xs text-muted-foreground">
            From
          </label>
          <Input
            id="from"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            disabled={loading}
            className="w-40"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="to" className="text-xs text-muted-foreground">
            To
          </label>
          <Input
            id="to"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            disabled={loading}
            className="w-40"
          />
        </div>
        <Button type="submit" disabled={loading} size="sm">
          {loading ? 'Loading…' : 'Apply'}
        </Button>
      </form>

      {error && (
        <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : summary.metrics.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No AI calls in this period.
        </p>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border bg-card p-4">
              <p className="text-xs text-muted-foreground">Total cost</p>
              <p className="mt-1 text-2xl font-semibold">{fmtCost(summary.total_cost_usd)}</p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <p className="text-xs text-muted-foreground">Cost / user / day</p>
              <p className="mt-1 text-2xl font-semibold">{fmtCost(summary.cost_per_user_day)}</p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <p className="text-xs text-muted-foreground">Total calls</p>
              <p className="mt-1 text-2xl font-semibold">{totals.calls.toLocaleString()}</p>
            </div>
          </div>

          {/* Metrics table */}
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Feature</th>
                  <th className="px-3 py-2 text-right font-medium">Calls</th>
                  <th className="px-3 py-2 text-right font-medium">In tokens</th>
                  <th className="px-3 py-2 text-right font-medium">Out tokens</th>
                  <th className="px-3 py-2 text-right font-medium">Cache read</th>
                  <th className="px-3 py-2 text-right font-medium">Cost</th>
                  <th className="px-3 py-2 text-right font-medium">p50 ms</th>
                  <th className="px-3 py-2 text-right font-medium">p95 ms</th>
                  <th className="px-3 py-2 text-right font-medium">Errors</th>
                  <th className="px-3 py-2 text-right font-medium">Cache hit</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {summary.metrics.map((m) => (
                  <tr key={m.feature} className="hover:bg-muted/30">
                    <td className="px-3 py-2 font-mono text-xs">{m.feature}</td>
                    <td className="px-3 py-2 text-right">{m.calls.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right">{m.input_tokens.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right">{m.output_tokens.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right">{m.cache_read_tokens.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right font-medium">{fmtCost(m.cost_usd)}</td>
                    <td className="px-3 py-2 text-right">{fmt(m.latency_p50_ms, 0)}</td>
                    <td className="px-3 py-2 text-right">{fmt(m.latency_p95_ms, 0)}</td>
                    <td className="px-3 py-2 text-right">{fmtPct(m.error_rate)}</td>
                    <td className="px-3 py-2 text-right">{fmtPct(m.cache_hit_rate)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t bg-muted/50 font-medium">
                <tr>
                  <td className="px-3 py-2">Total</td>
                  <td className="px-3 py-2 text-right">{totals.calls.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right">{totals.input_tokens.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right">{totals.output_tokens.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right">
                    {totals.cache_read_tokens.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 text-right">{fmtCost(totals.cost_usd)}</td>
                  <td colSpan={4} />
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
