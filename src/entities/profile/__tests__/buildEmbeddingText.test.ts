import { describe, it, expect } from 'vitest';
import { buildEmbeddingText } from '../lib/buildEmbeddingText';

describe('buildEmbeddingText', () => {
  it('joins all fields with spaces', () => {
    const result = buildEmbeddingText({
      interests: ['hiking', 'cooking'],
      values: ['honesty', 'kindness'],
      seeking: 'long-term relationship',
      bio: 'Love the outdoors.',
    });
    expect(result).toBe('hiking, cooking honesty, kindness long-term relationship Love the outdoors.');
  });

  it('omits null/empty fields', () => {
    const result = buildEmbeddingText({
      interests: ['reading'],
      values: ['growth'],
      seeking: null,
      bio: null,
    });
    expect(result).toBe('reading growth');
  });

  it('handles empty arrays', () => {
    const result = buildEmbeddingText({
      interests: [],
      values: [],
      seeking: 'friendship',
      bio: null,
    });
    expect(result).toBe('friendship');
  });
});
