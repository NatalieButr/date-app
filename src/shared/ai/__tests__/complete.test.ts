import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../client');
vi.mock('../log');
vi.mock('../models', () => ({ modelFor: (tier: string) => (tier === 'smart' ? 'claude-smart' : 'claude-fast') }));

import { complete } from '../complete';
import { getAnthropic } from '../client';
import { AiCallError } from '../errors';
import type { Message } from '@anthropic-ai/sdk/resources';

function makeMessage(overrides?: Partial<Message>): Message {
  return {
    id: 'msg_1',
    type: 'message',
    role: 'assistant',
    content: [{ type: 'text', text: 'hello' }],
    model: 'claude-smart',
    stop_reason: 'end_turn',
    stop_sequence: null,
    usage: { input_tokens: 10, output_tokens: 5 },
    ...overrides,
  } as Message;
}

function makeApiError(status: number): Error & { status: number } {
  const err = new Error(`API error ${status}`) as Error & { status: number };
  err.status = status;
  return err;
}

const baseOpts = {
  feature: 'seed' as const,
  tier: 'smart' as const,
  system: 'You are helpful.',
  messages: [{ role: 'user' as const, content: 'hi' }],
  maxTokens: 100,
  promptVer: 'test@1',
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('complete — success', () => {
  it('returns message on first attempt', async () => {
    const msg = makeMessage();
    vi.mocked(getAnthropic).mockReturnValue({
      messages: { create: vi.fn().mockResolvedValue(msg) },
    } as unknown as ReturnType<typeof getAnthropic>);

    const result = await complete(baseOpts);
    expect(result).toBe(msg);
  });
});

describe('complete — retry logic', () => {
  it('retries on 429 and succeeds on second attempt', async () => {
    const msg = makeMessage();
    const create = vi.fn().mockRejectedValueOnce(makeApiError(429)).mockResolvedValue(msg);
    vi.mocked(getAnthropic).mockReturnValue({
      messages: { create },
    } as unknown as ReturnType<typeof getAnthropic>);

    const result = await complete({ ...baseOpts, allowFallback: false });
    expect(result).toBe(msg);
    expect(create).toHaveBeenCalledTimes(2);
  });

  it('retries on 529 and succeeds on second attempt', async () => {
    const msg = makeMessage();
    const create = vi.fn().mockRejectedValueOnce(makeApiError(529)).mockResolvedValue(msg);
    vi.mocked(getAnthropic).mockReturnValue({
      messages: { create },
    } as unknown as ReturnType<typeof getAnthropic>);

    const result = await complete({ ...baseOpts, allowFallback: false });
    expect(result).toBe(msg);
    expect(create).toHaveBeenCalledTimes(2);
  });

  it('retries on 500+ and succeeds', async () => {
    const msg = makeMessage();
    const create = vi.fn().mockRejectedValueOnce(makeApiError(503)).mockResolvedValue(msg);
    vi.mocked(getAnthropic).mockReturnValue({
      messages: { create },
    } as unknown as ReturnType<typeof getAnthropic>);

    const result = await complete({ ...baseOpts, allowFallback: false });
    expect(result).toBe(msg);
  });

  it('does not retry on 400 (not retryable)', async () => {
    const create = vi.fn().mockRejectedValue(makeApiError(400));
    vi.mocked(getAnthropic).mockReturnValue({
      messages: { create },
    } as unknown as ReturnType<typeof getAnthropic>);

    await expect(complete({ ...baseOpts, allowFallback: false })).rejects.toBeInstanceOf(AiCallError);
    expect(create).toHaveBeenCalledTimes(1);
  });

  it('exhausts retries and throws AiCallError', async () => {
    const create = vi.fn().mockRejectedValue(makeApiError(429));
    vi.mocked(getAnthropic).mockReturnValue({
      messages: { create },
    } as unknown as ReturnType<typeof getAnthropic>);

    await expect(complete({ ...baseOpts, allowFallback: false })).rejects.toBeInstanceOf(AiCallError);
    // initial + 2 retries = 3 total
    expect(create).toHaveBeenCalledTimes(3);
  });
});

describe('complete — smart→fast fallback', () => {
  it('falls back to fast tier when smart exhausts retries', async () => {
    const fastMsg = makeMessage({ model: 'claude-fast' });
    const smartCreate = vi.fn().mockRejectedValue(makeApiError(429));
    const fastCreate = vi.fn().mockResolvedValue(fastMsg);

    let callCount = 0;
    vi.mocked(getAnthropic).mockReturnValue({
      messages: {
        create: vi.fn().mockImplementation(({ model }) => {
          callCount++;
          if (model === 'claude-smart') return smartCreate();
          return fastCreate();
        }),
      },
    } as unknown as ReturnType<typeof getAnthropic>);

    const result = await complete({ ...baseOpts, allowFallback: true });
    expect(result).toBe(fastMsg);
    expect(fastCreate).toHaveBeenCalledTimes(1);
    void callCount;
  });

  it('throws AiCallError when fast tier also fails', async () => {
    const create = vi.fn().mockRejectedValue(makeApiError(500));
    vi.mocked(getAnthropic).mockReturnValue({
      messages: { create },
    } as unknown as ReturnType<typeof getAnthropic>);

    await expect(complete({ ...baseOpts, allowFallback: true })).rejects.toBeInstanceOf(AiCallError);
  });

  it('does not fall back when tier is already fast', async () => {
    const create = vi.fn().mockRejectedValue(makeApiError(429));
    vi.mocked(getAnthropic).mockReturnValue({
      messages: { create },
    } as unknown as ReturnType<typeof getAnthropic>);

    await expect(complete({ ...baseOpts, tier: 'fast', allowFallback: true })).rejects.toBeInstanceOf(AiCallError);
    // No fallback branch for fast tier: initial + 2 retries = 3 total
    expect(create).toHaveBeenCalledTimes(3);
  });
});
