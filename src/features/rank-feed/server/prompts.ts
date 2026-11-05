// H-zone: prompt text written by Natallia per explicit request 2026-11-05.

import type { PublicProfile } from '@/entities/profile';

export const rerankPromptVersion = 'rerank@1';

export function buildRerankPrompt(viewer: PublicProfile, candidates: PublicProfile[]): { system: string; user: string } {
  const system = `You are a compatibility ranker for a dating app. Your job is to sort candidate profiles by how well they match the viewer.

Ranking priorities (most important first):
1. Same city as the viewer — strongly prefer local matches.
2. Number of shared interests — more overlap = higher score.
3. Compatible seeking/values when present.

Return ONLY a JSON object with key "ranked_ids": an array of all candidate IDs in order from best to worst match. Include every ID exactly once. No explanation, no extra fields.`;

  const viewerXml = `<viewer>
  <id>${viewer.id}</id>
  <age>${viewer.age}</age>
  <city>${viewer.city}</city>
  <interests>${viewer.interests.join(', ')}</interests>
  <values>${viewer.values.join(', ')}</values>
  <seeking>${viewer.seeking ?? ''}</seeking>
</viewer>`;

  const candidatesXml = candidates
    .map(
      (c) => `<candidate>
  <id>${c.id}</id>
  <age>${c.age}</age>
  <city>${c.city}</city>
  <interests>${c.interests.join(', ')}</interests>
  <values>${c.values.join(', ')}</values>
  <seeking>${c.seeking ?? ''}</seeking>
</candidate>`,
    )
    .join('\n');

  const user = `${viewerXml}

<candidates>
${candidatesXml}
</candidates>

Rank the candidates for this viewer.`;

  return { system, user };
}
