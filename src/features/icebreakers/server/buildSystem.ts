import 'server-only';

import type { TextBlockParam } from '@/shared/ai';

import type { PublicProfile } from '@/entities/profile';

/**
 * H-zone: Natallia builds this.
 *
 * Returns the system-prompt blocks for the icebreaker call, with cache_control
 * on the static blocks (instructions + profiles). The conversation history is
 * passed separately in the messages array and must NOT be included here.
 */
export function buildIcebreakerSystem(
  viewerProfile: PublicProfile,
  otherProfile: PublicProfile,
): TextBlockParam[] {
  return [
    {
      type: 'text',
      text: `You are a witty, warm dating-app assistant helping someone start a conversation with a new match.

Your job is to suggest exactly 3 icebreaker messages the user could send. Each should:
- Feel natural and personal — not generic ("Hey!" or "How are you?")
- Reference something specific from the other person's profile (interests, bio)
- Be short: 1–2 sentences max
- Have a light, friendly tone — a little playful is good

Output format: a numbered list, one message per line, nothing else.

1. [first icebreaker]
2. [second icebreaker]
3. [third icebreaker]

Do not add explanations, headers, or extra commentary.`,
      cache_control: { type: 'ephemeral' },
    },
    {
      type: 'text',
      text: `<viewer_profile>
Name: ${viewerProfile.name}, ${viewerProfile.age}
${viewerProfile.bio ? `Bio: ${viewerProfile.bio}` : ''}
Interests: ${viewerProfile.interests.join(', ')}
</viewer_profile>

<other_profile>
Name: ${otherProfile.name}, ${otherProfile.age}
${otherProfile.bio ? `Bio: ${otherProfile.bio}` : ''}
Interests: ${otherProfile.interests.join(', ')}
</other_profile>`,
      cache_control: { type: 'ephemeral' },
    },
  ];
}
