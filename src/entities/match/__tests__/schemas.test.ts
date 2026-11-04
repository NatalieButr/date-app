import { describe, it, expect } from 'vitest';

import { MatchRowSchema, MatchSchema } from '../model/schemas';

const uuid1 = 'a0000000-0000-4000-8000-000000000001';
const uuid2 = 'a0000000-0000-4000-8000-000000000002';
const uuid3 = 'a0000000-0000-4000-8000-000000000003';

describe('MatchRowSchema', () => {
  it('parses a valid match row', () => {
    const row = { id: uuid1, user_a: uuid2, user_b: uuid3, created_at: '2026-01-01T00:00:00Z' };
    expect(MatchRowSchema.parse(row)).toEqual(row);
  });

  it('rejects non-uuid id', () => {
    expect(() => MatchRowSchema.parse({ id: 'bad', user_a: uuid2, user_b: uuid3, created_at: '2026-01-01T00:00:00Z' })).toThrow();
  });
});

describe('MatchSchema', () => {
  it('parses match with other_user_id', () => {
    const row = { id: uuid1, user_a: uuid2, user_b: uuid3, created_at: '2026-01-01T00:00:00Z', other_user_id: uuid3 };
    expect(MatchSchema.parse(row).other_user_id).toBe(uuid3);
  });
});
