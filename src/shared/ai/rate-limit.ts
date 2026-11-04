import 'server-only';

import { RateLimitError } from './errors';

// TODO(spec): this is in-memory and per-instance. For multi-instance Vercel deploys,
// replace with a distributed store (e.g. Redis via Upstash).

interface BucketConfig {
  limit: number;
  windowMs: number;
}

const BUCKET_CONFIGS: Record<string, BucketConfig> = {
  default: { limit: 30, windowMs: 60_000 },
  wingman: { limit: 100, windowMs: 86_400_000 },
};

interface Window {
  count: number;
  resetAt: number;
}

const windows = new Map<string, Window>();

export async function rateLimit(userId: string, bucket: string): Promise<void> {
  const config = BUCKET_CONFIGS[bucket] ?? BUCKET_CONFIGS['default']!;
  const key = `${userId}:${bucket}`;
  const now = Date.now();

  let win = windows.get(key);
  if (!win || now >= win.resetAt) {
    win = { count: 0, resetAt: now + config.windowMs };
    windows.set(key, win);
  }

  if (win.count >= config.limit) {
    throw new RateLimitError(bucket, win.resetAt - now);
  }

  win.count++;
}
