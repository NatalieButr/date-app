import type { ProfileRow } from '../model/schemas';

type EmbeddingInput = Pick<ProfileRow, 'interests' | 'values' | 'seeking' | 'bio'>;

export function buildEmbeddingText(profile: EmbeddingInput): string {
  return [
    profile.interests.join(', '),
    profile.values.join(', '),
    profile.seeking ?? '',
    profile.bio ?? '',
  ]
    .filter(Boolean)
    .join(' ');
}
