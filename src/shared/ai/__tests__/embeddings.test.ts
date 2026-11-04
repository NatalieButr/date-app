import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/shared/config/env.server', () => ({
  serverEnv: () => ({
    VOYAGE_API_KEY: 'test-key',
    VOYAGE_MODEL: 'voyage-3',
    CLAUDE_MODEL_SMART: 'claude-smart',
    CLAUDE_MODEL_FAST: 'claude-fast',
  }),
}));
vi.mock('../log');

import { embed } from '../embeddings';

const VOYAGE_URL = 'https://api.voyageai.com/v1/embeddings';

function mockFetch(response: unknown, ok = true, status = 200) {
  return vi.spyOn(global, 'fetch').mockResolvedValue({
    ok,
    status,
    json: () => Promise.resolve(response),
    text: () => Promise.resolve(JSON.stringify(response)),
  } as Response);
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('embed', () => {
  it('returns embeddings from a valid Voyage response', async () => {
    mockFetch({
      data: [
        { embedding: [0.1, 0.2], index: 0 },
        { embedding: [0.3, 0.4], index: 1 },
      ],
      usage: { total_tokens: 42 },
    });

    const result = await embed(['hello', 'world'], 'query');
    expect(result).toEqual([[0.1, 0.2], [0.3, 0.4]]);
  });

  it('calls Voyage API with correct body', async () => {
    const spy = mockFetch({
      data: [{ embedding: [0.5], index: 0 }],
      usage: { total_tokens: 10 },
    });

    await embed(['test'], 'document');
    expect(spy).toHaveBeenCalledWith(
      VOYAGE_URL,
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"input_type":"document"'),
      }),
    );
  });

  it('throws when Voyage returns a non-ok status', async () => {
    mockFetch('Bad Request', false, 400);
    await expect(embed(['x'], 'query')).rejects.toThrow('Voyage API error 400');
  });

  it('throws ZodError when response shape is invalid', async () => {
    mockFetch({ unexpected: true });
    await expect(embed(['x'], 'query')).rejects.toThrow();
  });
});
