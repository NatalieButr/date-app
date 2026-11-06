import { describe, expect, it } from 'vitest';

import { MessageRowSchema, SendMessageBodySchema } from '../model/schemas';

describe('MessageRowSchema', () => {
  it('parses a valid message row', () => {
    const row = {
      id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      match_id: 'b1ffcd88-8d1c-4ef8-aa7e-7cc8ce491b22',
      sender_id: 'c2ddbe77-7e2d-4ef8-9985-8dd9df502c33',
      body: 'Hello!',
      moderation: 'ok',
      mod_reason: null,
      created_at: '2026-01-01T00:00:00Z',
    };
    expect(() => MessageRowSchema.parse(row)).not.toThrow();
  });

  it('rejects an unknown moderation value', () => {
    const row = {
      id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      match_id: 'b1ffcd88-8d1c-4ef8-aa7e-7cc8ce491b22',
      sender_id: 'c2ddbe77-7e2d-4ef8-9985-8dd9df502c33',
      body: 'Hello!',
      moderation: 'unknown',
      mod_reason: null,
      created_at: '2026-01-01T00:00:00Z',
    };
    expect(() => MessageRowSchema.parse(row)).toThrow();
  });
});

describe('SendMessageBodySchema', () => {
  it('rejects an empty body', () => {
    expect(() => SendMessageBodySchema.parse({ body: '' })).toThrow();
  });

  it('rejects a body over 2000 chars', () => {
    expect(() => SendMessageBodySchema.parse({ body: 'x'.repeat(2001) })).toThrow();
  });

  it('accepts a valid body', () => {
    expect(() => SendMessageBodySchema.parse({ body: 'Hello!' })).not.toThrow();
  });
});
