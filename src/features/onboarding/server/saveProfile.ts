'use server';

import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/shared/api/supabase/server';
import { embed } from '@/shared/ai';
import { upsertProfileEmbedding } from '@/entities/profile/server';
import { buildEmbeddingText } from '@/entities/profile';
import { SaveProfileSchema, type SaveProfileInput } from '../model/schemas';

export async function saveProfile(input: SaveProfileInput): Promise<void> {
  const parsed = SaveProfileSchema.safeParse(input);
  if (!parsed.success) throw new Error('Invalid profile data');

  const { basicInfo, extracted, bio } = parsed.data;

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { error } = await supabase.from('profiles').upsert({
    id: user.id,
    name: basicInfo.name,
    age: basicInfo.age,
    gender: basicInfo.gender,
    looking_for: basicInfo.looking_for,
    city: basicInfo.city,
    bio,
    interests: extracted.interests,
    values: extracted.values,
    seeking: extracted.seeking,
    red_flags: extracted.red_flags,
    onboarded_at: new Date().toISOString(),
  });
  if (error) throw new Error(`saveProfile failed: ${error.message}`);

  // Generate and store embedding
  const embeddingText = buildEmbeddingText({
    interests: extracted.interests,
    values: extracted.values,
    seeking: extracted.seeking,
    bio,
  });
  const [embedding] = await embed([embeddingText], 'document', { feature: 'onboarding' });
  if (embedding) {
    await upsertProfileEmbedding(user.id, embedding);
  }

  redirect('/feed');
}
