import { describe, it, expect, vi, beforeEach } from 'vitest';
import { z } from 'zod';

vi.mock('../complete');
vi.mock('../log');

import { structured } from '../structured';
import { complete } from '../complete';
import { StructuredOutputError } from '../errors';
import type { Message } from '@anthropic-ai/sdk/resources';

function makeToolMessage(input: unknown): Message {
  return {
    id: 'msg_1',
    type: 'message',
    role: 'assistant',
    content: [{ type: 'tool_use', id: 'tu_1', name: 'structured_output', input }],
    model: 'claude-smart',
    stop_reason: 'tool_use',
    stop_sequence: null,
    usage: { input_tokens: 10, output_tokens: 5 },
  } as unknown as Message;
}

function makeEmptyMessage(): Message {
  return {
    id: 'msg_2',
    type: 'message',
    role: 'assistant',
    content: [{ type: 'text', text: 'nope' }],
    model: 'claude-smart',
    stop_reason: 'end_turn',
    stop_sequence: null,
    usage: { input_tokens: 10, output_tokens: 5 },
  } as unknown as Message;
}

const baseOpts = {
  feature: 'seed' as const,
  tier: 'smart' as const,
  system: 'You are helpful.',
  messages: [{ role: 'user' as const, content: 'hi' }],
  maxTokens: 100,
  promptVer: 'test@1',
};

const schema = z.object({ name: z.string(), age: z.number() });

beforeEach(() => {
  vi.clearAllMocks();
});

describe('structured — success on first attempt', () => {
  it('parses valid tool output', async () => {
    vi.mocked(complete).mockResolvedValue(makeToolMessage({ name: 'Alice', age: 30 }));
    const result = await structured(baseOpts, schema);
    expect(result).toEqual({ name: 'Alice', age: 30 });
  });
});

describe('structured — retry on validation failure', () => {
  it('retries with error message when first output is invalid, succeeds on second', async () => {
    vi.mocked(complete)
      .mockResolvedValueOnce(makeToolMessage({ name: 'Alice', age: 'not-a-number' }))
      .mockResolvedValueOnce(makeToolMessage({ name: 'Alice', age: 30 }));

    const result = await structured(baseOpts, schema);
    expect(result).toEqual({ name: 'Alice', age: 30 });
    expect(complete).toHaveBeenCalledTimes(2);
  });

  it('throws StructuredOutputError when both attempts produce invalid output', async () => {
    vi.mocked(complete)
      .mockResolvedValueOnce(makeToolMessage({ name: 123, age: 'bad' }))
      .mockResolvedValueOnce(makeToolMessage({ name: 123, age: 'bad' }));

    await expect(structured(baseOpts, schema)).rejects.toBeInstanceOf(StructuredOutputError);
    expect(complete).toHaveBeenCalledTimes(2);
  });

  it('throws StructuredOutputError when no tool_use block returned', async () => {
    vi.mocked(complete).mockResolvedValue(makeEmptyMessage());
    await expect(structured(baseOpts, schema)).rejects.toBeInstanceOf(StructuredOutputError);
  });
});
