import { describe, it, expect } from 'vitest';

import {
  WingmanBodySchema,
  WingmanConfirmBodySchema,
  WingmanEventSchema,
  SearchProfilesInputSchema,
  GetProfileInputSchema,
  SuggestDateIdeasInputSchema,
  DraftMessageInputSchema,
} from '../model/schemas';

describe('WingmanBodySchema', () => {
  it('accepts valid query', () => {
    expect(WingmanBodySchema.parse({ query: 'find someone who loves hiking' })).toEqual({
      query: 'find someone who loves hiking',
    });
  });
  it('rejects empty query', () => {
    expect(() => WingmanBodySchema.parse({ query: '' })).toThrow();
  });
  it('rejects query over 500 chars', () => {
    expect(() => WingmanBodySchema.parse({ query: 'a'.repeat(501) })).toThrow();
  });
});

describe('WingmanConfirmBodySchema', () => {
  it('accepts valid confirm body', () => {
    const result = WingmanConfirmBodySchema.parse({
      targetId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      text: 'Hello!',
    });
    expect(result.targetId).toBe('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
  });
  it('rejects non-uuid targetId', () => {
    expect(() => WingmanConfirmBodySchema.parse({ targetId: 'not-a-uuid', text: 'Hi' })).toThrow();
  });
  it('rejects empty text', () => {
    expect(() =>
      WingmanConfirmBodySchema.parse({
        targetId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        text: '',
      }),
    ).toThrow();
  });
});

describe('WingmanEventSchema', () => {
  it('parses step event', () => {
    const event = WingmanEventSchema.parse({
      type: 'step',
      tool: 'search_profiles',
      label: 'Searching profiles…',
    });
    expect(event.type).toBe('step');
  });
  it('parses error event', () => {
    const event = WingmanEventSchema.parse({ type: 'error', message: 'Something went wrong' });
    expect(event.type).toBe('error');
  });
  it('rejects unknown type', () => {
    expect(() => WingmanEventSchema.parse({ type: 'unknown' })).toThrow();
  });
});

describe('SearchProfilesInputSchema', () => {
  it('applies default limit', () => {
    const result = SearchProfilesInputSchema.parse({ query: 'hiker' });
    expect(result.limit).toBe(5);
  });
  it('rejects limit > 10', () => {
    expect(() => SearchProfilesInputSchema.parse({ query: 'hiker', limit: 11 })).toThrow();
  });
});

describe('GetProfileInputSchema', () => {
  it('requires uuid', () => {
    expect(() => GetProfileInputSchema.parse({ id: 'not-uuid' })).toThrow();
    expect(GetProfileInputSchema.parse({ id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' }).id).toBe(
      'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    );
  });
});

describe('SuggestDateIdeasInputSchema', () => {
  it('requires at least one interest', () => {
    expect(() => SuggestDateIdeasInputSchema.parse({ city: 'Warsaw', interests: [] })).toThrow();
    expect(
      SuggestDateIdeasInputSchema.parse({ city: 'Warsaw', interests: ['hiking'] }),
    ).toBeTruthy();
  });
});

describe('DraftMessageInputSchema', () => {
  it('requires uuid target_id and non-empty intent', () => {
    expect(() => DraftMessageInputSchema.parse({ target_id: 'bad', intent: 'say hi' })).toThrow();
    expect(
      DraftMessageInputSchema.parse({
        target_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        intent: 'mention hiking',
      }),
    ).toBeTruthy();
  });
});
