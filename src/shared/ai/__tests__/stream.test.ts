import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../client');
vi.mock('../log');
vi.mock('../models', () => ({ modelFor: (tier: string) => (tier === 'smart' ? 'claude-smart' : 'claude-fast') }));

import { stream } from '../stream';
import { getAnthropic } from '../client';
import { logAiCall } from '../log';
import type { Message } from '@anthropic-ai/sdk/resources';

function makeAsyncIterable<T>(items: T[]): AsyncIterable<T> {
  return {
    [Symbol.asyncIterator]: async function* () {
      for (const item of items) yield item;
    },
  };
}

function makeFinalMessage(usage = { input_tokens: 10, output_tokens: 5 }): Message {
  return {
    id: 'msg_1',
    type: 'message',
    role: 'assistant',
    content: [{ type: 'text', text: 'hello' }],
    model: 'claude-smart',
    stop_reason: 'end_turn',
    stop_sequence: null,
    usage,
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

async function readStream(readable: ReadableStream<Uint8Array>): Promise<string> {
  const reader = readable.getReader();
  const decoder = new TextDecoder();
  let result = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    result += decoder.decode(value);
  }
  return result;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('stream — success path', () => {
  it('encodes SSE events and appends [DONE]', async () => {
    const events = [
      { type: 'content_block_delta', delta: { type: 'text_delta', text: 'hi' } },
    ];
    const mockApiStream = {
      ...makeAsyncIterable(events),
      finalMessage: vi.fn().mockResolvedValue(makeFinalMessage()),
    };
    vi.mocked(getAnthropic).mockReturnValue({
      messages: { stream: vi.fn().mockReturnValue(mockApiStream) },
    } as unknown as ReturnType<typeof getAnthropic>);

    const output = await readStream(stream(baseOpts));

    expect(output).toContain('data: ');
    expect(output).toContain('"type":"content_block_delta"');
    expect(output).toContain('data: [DONE]\n\n');
  });

  it('calls logAiCall with token counts on success', async () => {
    const mockApiStream = {
      ...makeAsyncIterable([]),
      finalMessage: vi.fn().mockResolvedValue(makeFinalMessage({ input_tokens: 20, output_tokens: 8 })),
    };
    vi.mocked(getAnthropic).mockReturnValue({
      messages: { stream: vi.fn().mockReturnValue(mockApiStream) },
    } as unknown as ReturnType<typeof getAnthropic>);

    await readStream(stream(baseOpts));

    expect(logAiCall).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'ok',
        inputTokens: 20,
        outputTokens: 8,
        error: undefined,
      }),
    );
  });
});

describe('stream — error path', () => {
  it('errors the stream and logs with status=error', async () => {
    const boom = new Error('network failure');
    const mockApiStream = {
      [Symbol.asyncIterator]: async function* () {
        throw boom;
      },
      finalMessage: vi.fn(),
    };
    vi.mocked(getAnthropic).mockReturnValue({
      messages: { stream: vi.fn().mockReturnValue(mockApiStream) },
    } as unknown as ReturnType<typeof getAnthropic>);

    const readable = stream(baseOpts);
    const reader = readable.getReader();
    await expect(reader.read()).rejects.toThrow('network failure');

    // logAiCall is fire-and-forget in finally; give microtasks a tick
    await Promise.resolve();
    expect(logAiCall).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'error',
        inputTokens: 0,
        outputTokens: 0,
        error: 'network failure',
      }),
    );
  });
});
