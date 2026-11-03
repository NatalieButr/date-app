import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const sdkRestriction = {
  paths: [
    { name: '@anthropic-ai/sdk', message: 'Claude calls must go through @/shared/ai only.' },
    { name: 'voyageai', message: 'Embeddings must go through @/shared/ai only.' },
  ],
  patterns: [{ group: ['@anthropic-ai/sdk/*'], message: 'Claude calls must go through @/shared/ai only.' }],
};

const adminRestriction = {
  name: '@/shared/api/supabase/admin',
  message: 'Supabase admin client is allowed only in server/, scripts/, evals/, and shared/ai.',
};

// SPEC §4.6: forbid deep imports into slice internals; only index.ts / server.ts public API is allowed.
// @/features/*/server (the server.ts file) is allowed; @/features/*/server/** (internals) is not.
const deepImportRestriction = {
  group: [
    '@/features/*/ui/**', '@/features/*/model/**', '@/features/*/api/**',
    '@/features/*/lib/**', '@/features/*/config/**', '@/features/*/server/**',
    '@/entities/*/ui/**', '@/entities/*/model/**', '@/entities/*/api/**',
    '@/entities/*/lib/**', '@/entities/*/config/**', '@/entities/*/server/**',
    '@/widgets/*/ui/**',  '@/widgets/*/model/**',  '@/widgets/*/api/**',
    '@/widgets/*/lib/**', '@/widgets/*/config/**', '@/widgets/*/server/**',
    '@/_pages/*/ui/**',   '@/_pages/*/model/**',   '@/_pages/*/api/**',
    '@/_pages/*/lib/**',  '@/_pages/*/config/**',  '@/_pages/*/server/**',
  ],
  message: 'Import only via the slice public API (index.ts or server.ts).',
};

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'src/shared/api/supabase/database.types.ts',
  ]),
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
  // Client and shared code: no SDK, no admin client, no deep slice imports
  {
    files: ['app/**/*.{ts,tsx}', 'src/**/*.{ts,tsx}', 'proxy.ts'],
    ignores: ['src/shared/ai/**', 'src/shared/api/supabase/**', 'src/**/server/**', 'src/**/server.ts'],
    rules: {
      'no-restricted-imports': ['error', {
        paths: [...sdkRestriction.paths, adminRestriction],
        patterns: [...sdkRestriction.patterns, deepImportRestriction],
      }],
    },
  },
  // Slice server code, scripts, evals: admin OK, no SDK, no deep slice imports
  {
    files: ['src/**/server/**/*.ts', 'src/**/server.ts', 'scripts/**/*.ts', 'evals/**/*.ts'],
    ignores: ['src/shared/ai/**'],
    rules: {
      'no-restricted-imports': ['error', {
        paths: sdkRestriction.paths,
        patterns: [...sdkRestriction.patterns, deepImportRestriction],
      }],
    },
  },
]);
