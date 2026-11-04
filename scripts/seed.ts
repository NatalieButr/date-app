// runs with: tsx --conditions=react-server scripts/seed.ts [--reset]
// Do not run without intent — uses API credits.

import { createSupabaseAdminClient } from '@/shared/api/supabase/admin';
import { structured } from '@/shared/ai';
import { SeedBatchSchema, buildEmbeddingText } from '@/entities/profile';
import { upsertProfileEmbedding } from '@/entities/profile/server';

const TOTAL = 50;
const BATCH_SIZE = 10;
const DICEBEAR_BASE = 'https://api.dicebear.com/7.x/avataaars/svg';

const reset = process.argv.includes('--reset');
const startedAt = new Date().toISOString();

async function main() {
  const supabase = createSupabaseAdminClient();

  if (reset) {
    console.log('Deleting existing seed profiles...');
    const { data: seeds } = await supabase.from('profiles').select('id').eq('is_seed', true);
    if (seeds?.length) {
      for (const { id } of seeds) {
        await supabase.auth.admin.deleteUser(id);
      }
      console.log(`Deleted ${seeds.length} seed profiles and their auth users.`);
    } else {
      console.log('No seed profiles to delete.');
    }
  }

  const numBatches = TOTAL / BATCH_SIZE;
  let created = 0;

  for (let i = 0; i < numBatches; i++) {
    console.log(`\nGenerating batch ${i + 1}/${numBatches}...`);

    const batch = await structured(
      {
        feature: 'seed',
        tier: 'fast',
        system: `You generate realistic fictional dating profiles for a demo app.
Profiles must be diverse in age (18-45), gender (man/woman/non-binary), US city, interests, and personality.
Each batch must contain exactly 10 unique profiles. Make each person feel real and relatable.
<instruction>Return only the structured JSON — no commentary.</instruction>`,
        messages: [
          {
            role: 'user',
            content: `<request>Generate batch ${i + 1} of ${numBatches}. Each batch should cover different demographics and interests.</request>`,
          },
        ],
        maxTokens: 4000,
        promptVer: 'seed@1',
      },
      SeedBatchSchema,
    );

    for (const profile of batch.profiles) {
      const email = `seed-${crypto.randomUUID()}@spark-demo.test`;

      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password: crypto.randomUUID(),
        email_confirm: true,
      });

      if (authError || !authData.user) {
        console.error(`  Failed to create auth user: ${authError?.message}`);
        continue;
      }

      const id = authData.user.id;
      const avatarUrl = `${DICEBEAR_BASE}?seed=${id}`;

      const { error: profileError } = await supabase.from('profiles').insert({
        id,
        name: profile.name,
        age: profile.age,
        gender: profile.gender,
        looking_for: profile.looking_for,
        city: profile.city,
        bio: profile.bio,
        interests: profile.interests,
        values: profile.values,
        seeking: profile.seeking,
        red_flags: profile.red_flags,
        avatar_url: avatarUrl,
        is_seed: true,
        onboarded_at: new Date().toISOString(),
      });

      if (profileError) {
        console.error(`  Failed to insert profile ${id}: ${profileError.message}`);
        await supabase.auth.admin.deleteUser(id);
        continue;
      }

      // Embed immediately after insert
      const embeddingText = buildEmbeddingText(profile);
      try {
        const { embed } = await import('@/shared/ai');
        const [vec] = await embed([embeddingText], 'document', { feature: 'seed' });
        if (vec) await upsertProfileEmbedding(id, vec);
      } catch (err) {
        console.error(`  Embedding failed for ${id}: ${err instanceof Error ? err.message : String(err)}`);
      }

      created++;
      console.log(`  [${created}/${TOTAL}] ${profile.name}, ${profile.age}, ${profile.city}`);
    }
  }

  // Print total cost from this run
  const { data: calls } = await supabase
    .from('ai_calls')
    .select('cost_usd')
    .eq('feature', 'seed')
    .gte('created_at', startedAt);

  const totalCost = (calls ?? []).reduce((sum, row) => sum + Number(row.cost_usd), 0);
  console.log(`\nSeed complete: ${created}/${TOTAL} profiles created.`);
  console.log(`Total AI cost: $${totalCost.toFixed(4)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
