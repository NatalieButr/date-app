import { describe, it, expect } from 'vitest';
import { IcebreakersBodySchema } from '../model/schemas';

describe('IcebreakersBodySchema', () => {
  it('accepts an empty object', () => {
    expect(IcebreakersBodySchema.safeParse({}).success).toBe(true);
  });

  it('rejects extra fields', () => {
    expect(IcebreakersBodySchema.safeParse({ extra: 'field' }).success).toBe(false);
  });
});
