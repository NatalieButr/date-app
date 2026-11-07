import 'server-only';

import type { WingmanEvent } from '../model/schemas';

export type ToolDispatch = Record<string, (input: unknown) => Promise<unknown>>;

// H-zone: Natallia implements the agentic loop.
// Spec §F8: max 8 steps, 60 s total timeout, parallel tool_use via Promise.all,
// error → tool_result with is_error: true, step limit → final answer with what was found.
// Uses complete() from @/shared/ai with allowFallback: false (wingman bucket).
export async function wingmanLoop(
  viewerId: string,
  query: string,
  toolDispatch: ToolDispatch,
  sendEvent: (event: WingmanEvent) => void,
): Promise<void> {
  // Suppress unused-variable warnings in the scaffold.
  void viewerId;
  void query;
  void toolDispatch;
  void sendEvent;
  throw new Error('TODO(human): implement wingman agentic loop');
}
