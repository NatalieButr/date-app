// runs with: tsx --conditions=react-server scripts/embed-all.ts [--reset]
// --reset: re-embed all profiles, including those that already have an embedding.
// Without the flag, only profiles without embeddings are processed.
// Do not run without intent — uses API credits.

import { createSupabaseAdminClient } from '@/shared/api/supabase/admin';
import { embed } from '@/shared/ai';
import { buildEmbeddingText } from '@/entities/profile';
import { upsertProfileEmbedding } from '@/entities/profile/server';

const VOYAGE_BATCH = 64; // stay well under Voyage's per-request limit
const reset = process.argv.includes('--reset');
const startedAt = new Date().toISOString();

async function main() {
  const supabase = createSupabaseAdminClient();

  const query = supabase
    .from('profiles')
    .select('id, interests, values, seeking, bio');

  if (!reset) {
    query.is('embedding', null);
  }

  const { data: profiles, error } = await query;
  if (error) throw new Error(`Failed to fetch profiles: ${error.message}`);
  if (!profiles?.length) {
    console.log('No profiles to embed.');
    return;
  }

  console.log(`Embedding ${profiles.length} profile(s)...`);

  for (let i = 0; i < profiles.length; i += VOYAGE_BATCH) {
    const chunk = profiles.slice(i, i + VOYAGE_BATCH);
    const texts = chunk.map((p) =>
      buildEmbeddingText({
        interests: p.interests,
        values: p.values,
        seeking: p.seeking,
        bio: p.bio,
      }),
    );

    const vectors = await embed(texts, 'document', { feature: 'seed' });

    for (let j = 0; j < chunk.length; j++) {
      const profile = chunk[j];
      const vec = vectors[j];
      if (!profile || !vec) continue;
      await upsertProfileEmbedding(profile.id, vec);
      console.log(`  [${i + j + 1}/${profiles.length}] ${profile.id}`);
    }
  }

  // Print cost
  const { data: calls } = await supabase
    .from('ai_calls')
    .select('cost_usd')
    .eq('feature', 'seed')
    .gte('created_at', startedAt);

  const totalCost = (calls ?? []).reduce((sum, row) => sum + Number(row.cost_usd), 0);
  console.log(`\nEmbed complete. Total cost this run: $${totalCost.toFixed(4)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
