import { z } from 'zod';

// ── Case types ────────────────────────────────────────────────────────────────

export const ModerationCaseSchema = z.object({
  kind: z.literal('moderation'),
  id: z.string(),
  description: z.string(),
  messageBody: z.string(),
  recentMessages: z.array(
    z.object({
      id: z.string(),
      match_id: z.string(),
      sender_id: z.string(),
      body: z.string(),
      moderation: z.enum(['ok', 'warn', 'block']),
      mod_reason: z.string().nullable(),
      created_at: z.string(),
    }),
  ),
  expected: z.enum(['ok', 'warn', 'block']),
});
export type ModerationCase = z.infer<typeof ModerationCaseSchema>;

export const InjectionCaseSchema = z.object({
  kind: z.literal('injection'),
  id: z.string(),
  description: z.string(),
  messageBody: z.string(),
  recentMessages: z.array(
    z.object({
      id: z.string(),
      match_id: z.string(),
      sender_id: z.string(),
      body: z.string(),
      moderation: z.enum(['ok', 'warn', 'block']),
      mod_reason: z.string().nullable(),
      created_at: z.string(),
    }),
  ),
  // The injection attempt must NOT produce verdict 'ok' — the model must not be fooled.
  // expected is the minimum verdict level: 'warn' means 'warn' or 'block', 'block' means exactly 'block'.
  expectedMinVerdict: z.enum(['warn', 'block']),
});
export type InjectionCase = z.infer<typeof InjectionCaseSchema>;

export const ExplanationCaseSchema = z.object({
  kind: z.literal('explanation'),
  id: z.string(),
  description: z.string(),
  viewerBio: z.string(),
  targetBio: z.string(),
  explanation: z.string(),
  minScore: z.number().int().min(1).max(5).default(3),
});
export type ExplanationCase = z.infer<typeof ExplanationCaseSchema>;

export const EvalCaseSchema = z.discriminatedUnion('kind', [
  ModerationCaseSchema,
  InjectionCaseSchema,
  ExplanationCaseSchema,
]);
export type EvalCase = z.infer<typeof EvalCaseSchema>;

// ── Result types ──────────────────────────────────────────────────────────────

export const EvalResultSchema = z.object({
  caseId: z.string(),
  kind: z.enum(['moderation', 'injection', 'explanation']),
  passed: z.boolean(),
  skipped: z.boolean().default(false),
  score: z.number().optional(), // 1–5 for explanation cases
  actual: z.unknown().optional(),
  expected: z.unknown().optional(),
  durationMs: z.number().int(),
  error: z.string().optional(),
});
export type EvalResult = z.infer<typeof EvalResultSchema>;

export const EvalReportSchema = z.object({
  date: z.string(),
  promptVer: z.string(),
  total: z.number().int(),
  passed: z.number().int(),
  failed: z.number().int(),
  skipped: z.number().int(),
  byKind: z.object({
    moderation: z
      .object({
        total: z.number().int(),
        passed: z.number().int(),
        accuracy: z.number(),
        // precision/recall treat 'warn'+'block' as "positive" (detected threat)
        precision: z.number(),
        recall: z.number(),
      })
      .optional(),
    injection: z
      .object({
        total: z.number().int(),
        passed: z.number().int(),
        resistanceRate: z.number(),
      })
      .optional(),
    explanation: z
      .object({
        total: z.number().int(),
        scored: z.number().int(),
        avgScore: z.number(),
        passRate: z.number(),
      })
      .optional(),
  }),
  results: z.array(EvalResultSchema),
});
export type EvalReport = z.infer<typeof EvalReportSchema>;
