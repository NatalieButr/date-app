import { describe, expect, it } from 'vitest';

import { LoginSchema, SignUpSchema } from '../model/schemas';

describe('LoginSchema', () => {
  it('accepts valid email and password', () => {
    expect(LoginSchema.safeParse({ email: 'user@example.com', password: 'secret' }).success).toBe(true);
  });

  it('rejects invalid email', () => {
    expect(LoginSchema.safeParse({ email: 'not-an-email', password: 'secret' }).success).toBe(false);
  });

  it('rejects password shorter than 6 chars', () => {
    expect(LoginSchema.safeParse({ email: 'user@example.com', password: '12345' }).success).toBe(false);
  });
});

describe('SignUpSchema', () => {
  it('accepts valid email and 8-char password', () => {
    expect(SignUpSchema.safeParse({ email: 'user@example.com', password: 'password1' }).success).toBe(true);
  });

  it('rejects password shorter than 8 chars', () => {
    expect(SignUpSchema.safeParse({ email: 'user@example.com', password: 'short1' }).success).toBe(false);
  });
});
