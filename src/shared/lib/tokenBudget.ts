/** Estimates tokens for a string (~4 chars per token). */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Trims a message array (newest-last order expected) to fit within maxTokens,
 * dropping the oldest messages first.
 */
export function trimToTokenBudget<T extends { body: string }>(
  messages: T[],
  maxTokens: number,
): T[] {
  let total = 0;
  const result: T[] = [];

  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg === undefined) continue;
    const tokens = estimateTokens(msg.body);
    if (total + tokens > maxTokens) break;
    total += tokens;
    result.unshift(msg);
  }

  return result;
}
