import fs from 'node:fs';
import path from 'node:path';

// Direct import bypasses listMessagesGET (which pulls in Next.js React context
// via NextRequest/NextResponse and breaks the eval runner outside Next.js).
// evals/server.ts re-export is not viable until listMessagesGET is split out.
import { moderateMessage } from '@/entities/message/server/moderate';

import { judgeExplanation } from './judge';
import { explanationCases } from './cases/explanations';
import { injectionCases } from './cases/injection';
import { moderationCases } from './cases/moderation';
import type { EvalCase, EvalReport, EvalResult } from './types';

// Bump this string when moderation or rerank prompt versions change.
// Keep in sync with PROMPT_VERSION in src/entities/message/server/moderate.ts.
// TODO(spec): SPEC §F10 requires "% valid JSON on first attempt" — currently
//   structured() retries silently; surfacing retry count needs a change to
//   shared/ai/structured.ts or an ai_calls flag. Left for Natallia to decide.
const PROMPT_VER = 'mod-1.0.1';

// ── Verdict ordering ──────────────────────────────────────────────────────────

const VERDICT_RANK: Record<string, number> = { ok: 0, warn: 1, block: 2 };

function verdictAtLeast(actual: string, min: 'warn' | 'block'): boolean {
  return (VERDICT_RANK[actual] ?? 0) >= (VERDICT_RANK[min] ?? 0);
}

// ── Runner ────────────────────────────────────────────────────────────────────

async function runCase(c: EvalCase): Promise<EvalResult> {
  const start = Date.now();

  if (c.kind === 'moderation') {
    try {
      const result = await moderateMessage(c.messageBody, c.recentMessages);
      const passed = result.verdict === c.expected;
      return {
        caseId: c.id,
        kind: 'moderation',
        passed,
        skipped: false,
        actual: result.verdict,
        expected: c.expected,
        durationMs: Date.now() - start,
      };
    } catch (err) {
      return {
        caseId: c.id,
        kind: 'moderation',
        passed: false,
        skipped: false,
        durationMs: Date.now() - start,
        error: String(err),
      };
    }
  }

  if (c.kind === 'injection') {
    try {
      const result = await moderateMessage(c.messageBody, c.recentMessages);
      const passed = verdictAtLeast(result.verdict, c.expectedMinVerdict);
      return {
        caseId: c.id,
        kind: 'injection',
        passed,
        skipped: false,
        actual: result.verdict,
        expected: `>= ${c.expectedMinVerdict}`,
        durationMs: Date.now() - start,
      };
    } catch (err) {
      return {
        caseId: c.id,
        kind: 'injection',
        passed: false,
        skipped: false,
        durationMs: Date.now() - start,
        error: String(err),
      };
    }
  }

  // explanation — requires TODO(human) judge rubric; skip gracefully
  try {
    const result = await judgeExplanation(c.viewerBio, c.targetBio, c.explanation);
    const passed = result.score >= c.minScore;
    return {
      caseId: c.id,
      kind: 'explanation',
      passed,
      skipped: false,
      score: result.score,
      actual: result.score,
      expected: `>= ${c.minScore}`,
      durationMs: Date.now() - start,
    };
  } catch (err) {
    const isTodo = String(err).includes('TODO(human)');
    return {
      caseId: c.id,
      kind: 'explanation',
      passed: false,
      skipped: isTodo,
      durationMs: Date.now() - start,
      error: isTodo ? 'skipped — judge rubric not yet implemented (TODO(human))' : String(err),
    };
  }
}

// ── Aggregation ───────────────────────────────────────────────────────────────

function buildReport(results: EvalResult[]): EvalReport {
  const date = new Date().toISOString().slice(0, 10);

  const modResults = results.filter((r) => r.kind === 'moderation' && !r.skipped);
  const injResults = results.filter((r) => r.kind === 'injection' && !r.skipped);
  const expResults = results.filter((r) => r.kind === 'explanation' && !r.skipped);

  const total = results.length;
  const skipped = results.filter((r) => r.skipped).length;
  const passed = results.filter((r) => r.passed).length;
  const failed = total - passed - skipped;

  // Moderation precision/recall: treat 'warn'+'block' as "positive" (detected threat)
  const modPositiveActual = modResults.filter(
    (r) => r.actual === 'warn' || r.actual === 'block',
  ).length;
  const modPositiveExpected = modResults.filter(
    (r) => r.expected === 'warn' || r.expected === 'block',
  ).length;
  const modTruePositive = modResults.filter(
    (r) =>
      (r.actual === 'warn' || r.actual === 'block') &&
      (r.expected === 'warn' || r.expected === 'block'),
  ).length;
  const modPrecision = modPositiveActual > 0 ? modTruePositive / modPositiveActual : 0;
  const modRecall = modPositiveExpected > 0 ? modTruePositive / modPositiveExpected : 0;
  const modAccuracy =
    modResults.length > 0 ? modResults.filter((r) => r.passed).length / modResults.length : 0;

  const expScored = expResults.filter((r) => r.score !== undefined);
  const expAvgScore =
    expScored.length > 0 ? expScored.reduce((s, r) => s + (r.score ?? 0), 0) / expScored.length : 0;
  const expPassRate =
    expScored.length > 0 ? expScored.filter((r) => r.passed).length / expScored.length : 0;

  const injPassed = injResults.filter((r) => r.passed).length;
  const injResistanceRate = injResults.length > 0 ? injPassed / injResults.length : 0;

  return {
    date,
    promptVer: PROMPT_VER,
    total,
    passed,
    failed,
    skipped,
    byKind: {
      ...(modResults.length > 0 && {
        moderation: {
          total: modResults.length,
          passed: modResults.filter((r) => r.passed).length,
          accuracy: modAccuracy,
          precision: modPrecision,
          recall: modRecall,
        },
      }),
      ...(injResults.length > 0 && {
        injection: {
          total: injResults.length,
          passed: injPassed,
          resistanceRate: injResistanceRate,
        },
      }),
      ...(expScored.length > 0 && {
        explanation: {
          total: expResults.length,
          scored: expScored.length,
          avgScore: expAvgScore,
          passRate: expPassRate,
        },
      }),
    },
    results,
  };
}

// ── Console table ─────────────────────────────────────────────────────────────

function pct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

function printReport(report: EvalReport): void {
  console.log('\n═══ Eval results ══════════════════════════════════════════');
  console.log(`Date:       ${report.date}`);
  console.log(`Prompt ver: ${report.promptVer}`);
  console.log(
    `Total:      ${report.total}  passed: ${report.passed}  failed: ${report.failed}  skipped: ${report.skipped}`,
  );

  if (report.byKind.moderation) {
    const m = report.byKind.moderation;
    console.log(
      `\nModeration (${m.total} cases)` +
        `  accuracy=${pct(m.accuracy)}` +
        `  precision=${pct(m.precision)}` +
        `  recall=${pct(m.recall)}`,
    );
  }

  if (report.byKind.injection) {
    const i = report.byKind.injection;
    console.log(`\nInjection resistance (${i.total} cases)  rate=${pct(i.resistanceRate)}`);
  }

  if (report.byKind.explanation) {
    const e = report.byKind.explanation;
    console.log(
      `\nExplanation quality (${e.scored}/${e.total} scored)` +
        `  avgScore=${e.avgScore.toFixed(2)}/5` +
        `  passRate=${pct(e.passRate)}`,
    );
  }

  console.log('\n── Per-case ────────────────────────────────────────────────');
  const col = (s: string, w: number) => s.padEnd(w).slice(0, w);
  console.log(col('ID', 24) + col('KIND', 12) + col('PASS', 6) + col('ACTUAL', 10) + 'NOTE');
  for (const r of report.results) {
    const status = r.skipped ? 'SKIP' : r.passed ? 'PASS' : 'FAIL';
    const actual = r.skipped ? '—' : String(r.actual ?? r.error ?? '');
    const note = r.error && !r.skipped ? r.error.slice(0, 60) : '';
    console.log(col(r.caseId, 24) + col(r.kind, 12) + col(status, 6) + col(actual, 10) + note);
  }
  console.log('═══════════════════════════════════════════════════════════\n');
}

// ── Save JSON ─────────────────────────────────────────────────────────────────

function saveReport(report: EvalReport): void {
  const dir = path.join(process.cwd(), 'evals', 'results');
  fs.mkdirSync(dir, { recursive: true });
  const filename = `${report.date}-${report.promptVer}.json`;
  const dest = path.join(dir, filename);
  fs.writeFileSync(dest, JSON.stringify(report, null, 2));
  console.log(`Saved: evals/results/${filename}`);
}

// ── Entry point ───────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const allCases: EvalCase[] = [...moderationCases, ...injectionCases, ...explanationCases];

  console.log(`Running ${allCases.length} eval cases…`);

  const results = await Promise.all(allCases.map(runCase));
  const report = buildReport(results);
  printReport(report);
  saveReport(report);

  process.exit(report.failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
