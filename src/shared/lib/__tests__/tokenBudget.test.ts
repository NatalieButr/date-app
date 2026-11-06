import { describe, it, expect } from 'vitest';
import { trimToTokenBudget } from '../tokenBudget';

function msgs(bodies: string[]) {
  return bodies.map((body, i) => ({ id: String(i), body }));
}

describe('trimToTokenBudget', () => {
  it('returns all messages when total tokens fit', () => {
    const messages = msgs(['hello', 'world']);
    expect(trimToTokenBudget(messages, 100)).toEqual(messages);
  });

  it('drops oldest messages first when budget is exceeded', () => {
    // 'a'.repeat(400) = 100 tokens each; budget = 150 → keep only last 1
    const long = 'a'.repeat(400);
    const messages = msgs([long, long, long]);
    const result = trimToTokenBudget(messages, 150);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(messages[2]);
  });

  it('returns empty array when first message alone exceeds budget', () => {
    const messages = msgs(['a'.repeat(400)]);
    expect(trimToTokenBudget(messages, 50)).toHaveLength(0);
  });

  it('returns empty array for empty input', () => {
    expect(trimToTokenBudget([], 100)).toHaveLength(0);
  });

  it('keeps newest messages when trimming', () => {
    // Each message ~1 token (4 chars); budget = 2 tokens → keep last 2
    const messages = msgs(['aaaa', 'bbbb', 'cccc', 'dddd']);
    const result = trimToTokenBudget(messages, 2);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(messages[2]);
    expect(result[1]).toEqual(messages[3]);
  });
});
