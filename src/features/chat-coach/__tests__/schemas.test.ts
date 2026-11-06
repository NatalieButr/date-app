import { describe, it, expect } from 'vitest';
import { CoachBodySchema } from '../model/schemas';

describe('CoachBodySchema', () => {
  it('accepts an empty object', () => {
    expect(CoachBodySchema.safeParse({}).success).toBe(true);
  });

  it('rejects extra fields', () => {
    expect(CoachBodySchema.safeParse({ extra: 'field' }).success).toBe(false);
  });
});
