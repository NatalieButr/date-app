import 'server-only';

import type { TextBlockParam } from '@/shared/ai';

import type { PublicProfile } from '@/entities/profile';

/**
 * H-zone: Natallia builds this.
 *
 * Returns the system-prompt blocks for the coach call, with cache_control on
 * the static blocks (instructions + both profiles). The conversation history
 * is passed separately in the messages array and must NOT be included here.
 */
export function buildCoachSystem(
  _viewerProfile: PublicProfile,
  _otherProfile: PublicProfile,
): TextBlockParam[] {
  throw new Error('TODO(human): build TextBlockParam[] with cache_control for chat-coach');
}
