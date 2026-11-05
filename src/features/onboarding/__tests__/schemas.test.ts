import { describe, it, expect } from 'vitest';
import {
  BasicInfoSchema,
  ChatRequestSchema,
  ProfileExtractSchema,
  BioOptionsSchema,
  SaveProfileSchema,
} from '../model/schemas';

describe('BasicInfoSchema', () => {
  it('accepts valid input', () => {
    const result = BasicInfoSchema.safeParse({
      name: 'Alice',
      age: 25,
      gender: 'female',
      looking_for: ['male'],
      city: 'Warsaw',
    });
    expect(result.success).toBe(true);
  });

  it('rejects age below 18', () => {
    const result = BasicInfoSchema.safeParse({
      name: 'Alice',
      age: 17,
      gender: 'female',
      looking_for: ['male'],
      city: 'Warsaw',
    });
    expect(result.success).toBe(false);
  });
});

describe('ChatRequestSchema', () => {
  it('accepts valid messages', () => {
    const result = ChatRequestSchema.safeParse({
      messages: [{ role: 'user', content: 'Hello' }],
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty messages array', () => {
    expect(ChatRequestSchema.safeParse({ messages: [] }).success).toBe(false);
  });
});

describe('ProfileExtractSchema', () => {
  it('accepts valid extracted data', () => {
    const result = ProfileExtractSchema.safeParse({
      interests: ['hiking', 'reading', 'coding'],
      values: ['honesty', 'kindness'],
      seeking: 'long-term relationship',
      red_flags: [],
      summary: 'A curious person',
    });
    expect(result.success).toBe(true);
  });

  it('requires at least 3 interests', () => {
    const result = ProfileExtractSchema.safeParse({
      interests: ['hiking'],
      values: ['honesty', 'kindness'],
      seeking: 'something',
      red_flags: [],
      summary: 'x',
    });
    expect(result.success).toBe(false);
  });
});

describe('BioOptionsSchema', () => {
  it('requires exactly 3 options', () => {
    const twoOptions = {
      options: [
        { tone: 'funny', text: 'Bio A' },
        { tone: 'serious', text: 'Bio B' },
      ],
    };
    expect(BioOptionsSchema.safeParse(twoOptions).success).toBe(false);
  });

  it('accepts exactly 3 options', () => {
    const three = {
      options: [
        { tone: 'funny', text: 'A' },
        { tone: 'serious', text: 'B' },
        { tone: 'warm', text: 'C' },
      ],
    };
    expect(BioOptionsSchema.safeParse(three).success).toBe(true);
  });
});

describe('SaveProfileSchema', () => {
  it('accepts valid save payload', () => {
    const result = SaveProfileSchema.safeParse({
      basicInfo: { name: 'Alice', age: 25, gender: 'female', looking_for: ['male'], city: 'Warsaw' },
      extracted: {
        interests: ['hiking', 'reading', 'coding'],
        values: ['honesty', 'kindness'],
        seeking: 'long-term',
        red_flags: [],
        summary: 'Cool person',
      },
      bio: 'Hi, I love hiking!',
    });
    expect(result.success).toBe(true);
  });
});
