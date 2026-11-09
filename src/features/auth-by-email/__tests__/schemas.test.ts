import { describe, expect, it } from 'vitest';

import {
  ForgotPasswordSchema,
  LoginSchema,
  ResetPasswordSchema,
  SignUpFormSchema,
  SignUpSchema,
} from '../model/schemas';

describe('LoginSchema', () => {
  it('accepts valid email and password', () => {
    expect(LoginSchema.safeParse({ email: 'user@example.com', password: 'secret' }).success).toBe(
      true,
    );
  });

  it('rejects invalid email', () => {
    expect(LoginSchema.safeParse({ email: 'not-an-email', password: 'secret' }).success).toBe(
      false,
    );
  });

  it('rejects empty password', () => {
    expect(LoginSchema.safeParse({ email: 'user@example.com', password: '' }).success).toBe(false);
  });
});

describe('SignUpSchema — strong password policy', () => {
  const validPassword = 'StrongP@ss1';

  it('accepts a password meeting all requirements', () => {
    expect(
      SignUpSchema.safeParse({ email: 'user@example.com', password: validPassword }).success,
    ).toBe(true);
  });

  it('rejects password shorter than 8 characters', () => {
    const result = SignUpSchema.safeParse({ email: 'user@example.com', password: 'Ab1!' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toContain('8 characters');
  });

  it('rejects password without uppercase letter', () => {
    const result = SignUpSchema.safeParse({ email: 'user@example.com', password: 'nouppercase1!' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toContain('uppercase');
  });

  it('rejects password without digit', () => {
    const result = SignUpSchema.safeParse({ email: 'user@example.com', password: 'NoDigitHere!' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toContain('digit');
  });

  it('rejects password without special character', () => {
    const result = SignUpSchema.safeParse({ email: 'user@example.com', password: 'NoSpecial1' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toContain('special character');
  });
});

describe('SignUpFormSchema — confirm password', () => {
  it('accepts matching passwords', () => {
    expect(
      SignUpFormSchema.safeParse({
        email: 'user@example.com',
        password: 'StrongP@ss1',
        confirmPassword: 'StrongP@ss1',
      }).success,
    ).toBe(true);
  });

  it('rejects mismatched passwords', () => {
    const result = SignUpFormSchema.safeParse({
      email: 'user@example.com',
      password: 'StrongP@ss1',
      confirmPassword: 'different',
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toContain('do not match');
  });
});

describe('ForgotPasswordSchema', () => {
  it('accepts a valid email', () => {
    expect(ForgotPasswordSchema.safeParse({ email: 'user@example.com' }).success).toBe(true);
  });

  it('rejects an invalid email', () => {
    expect(ForgotPasswordSchema.safeParse({ email: 'bad' }).success).toBe(false);
  });
});

describe('ResetPasswordSchema', () => {
  it('accepts a strong matching password', () => {
    expect(
      ResetPasswordSchema.safeParse({ password: 'StrongP@ss1', confirmPassword: 'StrongP@ss1' })
        .success,
    ).toBe(true);
  });

  it('rejects a weak password', () => {
    expect(
      ResetPasswordSchema.safeParse({ password: 'weakpassword', confirmPassword: 'weakpassword' })
        .success,
    ).toBe(false);
  });

  it('rejects mismatched passwords', () => {
    const result = ResetPasswordSchema.safeParse({
      password: 'StrongP@ss1',
      confirmPassword: 'other',
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toContain('do not match');
  });
});
