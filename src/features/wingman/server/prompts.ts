import 'server-only';

import type { Tool } from '@/shared/ai';

export const WINGMAN_PROMPT_VERSION = '1.0.0';

// H-zone: Natallia writes the system prompt and tool descriptions.
// Tool descriptions and input_schema define the agent's capabilities in SPEC §F8.
export function getWingmanSystem(): string {
  throw new Error('TODO(human): write wingman system prompt');
}

export function getWingmanTools(): Tool[] {
  throw new Error('TODO(human): write wingman tool definitions (description + input_schema)');
}
