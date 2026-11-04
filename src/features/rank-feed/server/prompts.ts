// H-zone: prompt text is written by Natallia (see CLAUDE.md §Human-authored zones).
// Agent scaffold only.

export const rerankPromptVersion = 'rerank@1';

// TODO(human): write the rerank system prompt here.
// It receives viewer profile and candidate profiles in XML tags,
// and returns a JSON array of { id, score, reason } sorted by score desc.
export function buildRerankPrompt(): never {
  throw new Error('TODO(human): implement rerank system prompt');
}
