import { describe, it, expect } from 'vitest';

import { SwipeRequestSchema, SwipeResponseSchema } from '../model/schemas';

describe('SwipeRequestSchema', () => {
  const validUuid = 'a0000000-0000-4000-8000-000000000001';

  it('accepts valid like', () => {
    expect(SwipeRequestSchema.parse({ targetId: validUuid, direction: 'like' }))
      .toEqual({ targetId: validUuid, direction: 'like' });
  });

  it('accepts valid dislike', () => {
    expect(SwipeRequestSchema.parse({ targetId: validUuid, direction: 'dislike' }))
      .toEqual({ targetId: validUuid, direction: 'dislike' });
  });

  it('rejects invalid direction', () => {
    expect(() => SwipeRequestSchema.parse({ targetId: validUuid, direction: 'nope' }))
      .toThrow();
  });

  it('rejects non-uuid targetId', () => {
    expect(() => SwipeRequestSchema.parse({ targetId: 'not-a-uuid', direction: 'like' }))
      .toThrow();
  });
});

describe('SwipeResponseSchema', () => {
  it('accepts matched with matchId', () => {
    const matchId = 'a0000000-0000-4000-8000-000000000002';
    expect(SwipeResponseSchema.parse({ matched: true, matchId }))
      .toEqual({ matched: true, matchId });
  });

  it('accepts not matched without matchId', () => {
    expect(SwipeResponseSchema.parse({ matched: false }))
      .toEqual({ matched: false });
  });
});
