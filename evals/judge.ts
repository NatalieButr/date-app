import { z } from 'zod';

import { structured } from '@/shared/ai';

export const JudgeResultSchema = z.object({
  score: z.number().int().min(1).max(5),
  rationale: z.string(),
});
export type JudgeResult = z.infer<typeof JudgeResultSchema>;

const PROMPT_VERSION = 'judge-1.0.0';

// TODO(human): write the judge rubric system prompt below.
// Criteria (SPEC §F10): concreteness, grounded in both profiles, single sentence, no fabrications → 1–5.
// Example rubric:
//   5 — specific detail from both profiles, one crisp sentence, nothing invented
//   4 — good but slightly vague
//   3 — references at least one profile field
//   2 — generic, almost no grounding
//   1 — ignores profiles or makes up facts
const JUDGE_SYSTEM = `TODO(human): fill in judge rubric prompt text`;

export async function judgeExplanation(
  _viewerBio: string,
  _targetBio: string,
  _explanation: string,
): Promise<JudgeResult> {
  if (JUDGE_SYSTEM.startsWith('TODO(human)')) {
    throw new Error('TODO(human): implement judge rubric in evals/judge.ts');
  }

  return structured(
    {
      tier: 'smart',
      feature: 'judge',
      promptVer: PROMPT_VERSION,
      system: JUDGE_SYSTEM,
      messages: [
        {
          role: 'user',
          content: `<viewer_bio>${_viewerBio}</viewer_bio>
<target_bio>${_targetBio}</target_bio>
<explanation>${_explanation}</explanation>

Score the explanation 1–5 and explain your reasoning.`,
        },
      ],
      maxTokens: 200,
    },
    JudgeResultSchema,
  );
}
