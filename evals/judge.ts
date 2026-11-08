import { z } from 'zod';

import { structured } from '@/shared/ai';

export const JudgeResultSchema = z.object({
  score: z.number().int().min(1).max(5),
  rationale: z.string(),
});
export type JudgeResult = z.infer<typeof JudgeResultSchema>;

const PROMPT_VERSION = 'judge-1.0.0';

const JUDGE_SYSTEM = `You are an evaluator for a dating app's AI matchmaking feature. Your job is to score the quality of a one-sentence explanation of why two people might be a good match.

You will be given two profiles and the explanation that the AI generated. Score the explanation from 1 to 5.

## Scoring rubric

**5 — Excellent**
Mentions at least one specific shared detail present in BOTH profiles (a shared interest, a matching value, a compatible goal from their "seeking" field, or a lifestyle overlap visible in both bios). The sentence is concise, natural, and reads as if written by someone who actually read the profiles. Nothing is invented.

**4 — Good**
Grounded in real profile data, but slightly vague — mentions one profile well but only gestures at the other, or the shared detail is real but generic (e.g. "you both enjoy travel" when only one bio mentions travel explicitly).

**3 — Acceptable**
References at least one concrete field from either profile (an interest, a value, or a bio quote). The connection may be inferred rather than explicit. No fabrications, but the sentence doesn't feel personalised to both people.

**2 — Weak**
Almost entirely generic. Could apply to any two profiles. May mention a category (e.g. "you share similar values") without naming any actual value. No clear grounding in what was written.

**1 — Poor**
Ignores the profiles entirely, makes up facts not present in either profile, or is not a valid sentence.

## Rules

- Only use information visible in the two profiles. Do not infer from names, ages, or any other source.
- A "shared interest" counts only if it appears in both profiles — either in the interests list, values list, bio, or seeking field.
- Partial matches are fine for a score of 3–4 (e.g. one person lists "hiking", the other mentions "outdoor activities" in their bio).
- Do not penalise for style or grammar unless the sentence is incomprehensible.

## Output

Return a JSON object with:
- score: integer 1–5
- rationale: one sentence explaining your score, citing the specific evidence (or lack of it) from the profiles`;

export async function judgeExplanation(
  viewerBio: string,
  targetBio: string,
  explanation: string,
): Promise<JudgeResult> {
  return structured(
    {
      tier: 'smart',
      feature: 'judge',
      promptVer: PROMPT_VERSION,
      system: JUDGE_SYSTEM,
      messages: [
        {
          role: 'user',
          content: `<viewer_bio>${viewerBio}</viewer_bio>
<target_bio>${targetBio}</target_bio>
<explanation>${explanation}</explanation>

Score the explanation 1–5 and explain your reasoning.`,
        },
      ],
      maxTokens: 200,
    },
    JudgeResultSchema,
  );
}
