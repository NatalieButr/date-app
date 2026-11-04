import 'server-only';

import Anthropic from '@anthropic-ai/sdk';

import { serverEnv } from '@/shared/config/env.server';

let client: Anthropic | undefined;

export function getAnthropic(): Anthropic {
  client ??= new Anthropic({
    apiKey: serverEnv().ANTHROPIC_API_KEY,
    defaultHeaders: { 'anthropic-beta': 'prompt-caching-2024-07-31' },
  });
  return client;
}
