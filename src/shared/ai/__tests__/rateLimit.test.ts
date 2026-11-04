import { describe, it, expect, vi } from 'vitest';
import { rateLimit } from '../rate-limit';
import { RateLimitError } from '../errors';

// Each test uses a unique userId so the shared in-memory windows map never bleeds between cases.
let uid = 0;
const nextUser = () => `test-user-${++uid}`;

vi.useFakeTimers();

describe('rateLimit — default bucket (30 req/min)', () => {
  it('allows requests under the limit', async () => {
    const user = nextUser();
    for (let i = 0; i < 30; i++) {
      await expect(rateLimit(user, 'default')).resolves.toBeUndefined();
    }
  });

  it('throws RateLimitError on the 31st request', async () => {
    const user = nextUser();
    for (let i = 0; i < 30; i++) {
      await rateLimit(user, 'default');
    }
    await expect(rateLimit(user, 'default')).rejects.toBeInstanceOf(RateLimitError);
  });

  it('resets the window after windowMs elapses', async () => {
    const user = nextUser();
    for (let i = 0; i < 30; i++) {
      await rateLimit(user, 'default');
    }
    vi.advanceTimersByTime(61_000);
    await expect(rateLimit(user, 'default')).resolves.toBeUndefined();
  });

  it('tracks limits per user independently', async () => {
    const userA = nextUser();
    const userB = nextUser();
    for (let i = 0; i < 30; i++) {
      await rateLimit(userA, 'default');
    }
    await expect(rateLimit(userB, 'default')).resolves.toBeUndefined();
  });

  it('RateLimitError carries the bucket name', async () => {
    const user = nextUser();
    for (let i = 0; i < 30; i++) {
      await rateLimit(user, 'default');
    }
    const err = await rateLimit(user, 'default').catch((e) => e);
    expect(err).toBeInstanceOf(RateLimitError);
    expect((err as RateLimitError).bucket).toBe('default');
  });
});

describe('rateLimit — wingman bucket (100 req/day)', () => {
  it('allows exactly 100 requests then blocks', async () => {
    const user = nextUser();
    for (let i = 0; i < 100; i++) {
      await expect(rateLimit(user, 'wingman')).resolves.toBeUndefined();
    }
    await expect(rateLimit(user, 'wingman')).rejects.toBeInstanceOf(RateLimitError);
  });
});

describe('rateLimit — unknown bucket falls back to default', () => {
  it('uses default limits for unknown bucket names', async () => {
    const user = nextUser();
    for (let i = 0; i < 30; i++) {
      await rateLimit(user, 'unknown');
    }
    await expect(rateLimit(user, 'unknown')).rejects.toBeInstanceOf(RateLimitError);
  });
});
