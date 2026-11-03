import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const sdkRestriction = {
  paths: [
    { name: '@anthropic-ai/sdk', message: 'Вызовы Claude — только через @/shared/ai.' },
    { name: 'voyageai', message: 'Эмбеддинги — только через @/shared/ai.' },
  ],
  patterns: [{ group: ['@anthropic-ai/sdk/*'], message: 'Вызовы Claude — только через @/shared/ai.' }],
};

const adminRestriction = {
  name: '@/shared/api/supabase/admin',
  message: 'Admin-клиент Supabase — только в server/, scripts/, evals/ и shared/ai.',
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
  // Клиентский и общий код: нельзя SDK и admin-клиент
  {
    files: ['app/**/*.{ts,tsx}', 'src/**/*.{ts,tsx}', 'proxy.ts'],
    ignores: ['src/shared/ai/**', 'src/shared/api/supabase/**', 'src/**/server/**', 'src/**/server.ts'],
    rules: {
      'no-restricted-imports': ['error', { ...sdkRestriction, paths: [...sdkRestriction.paths, adminRestriction] }],
    },
  },
  // Серверный код слайсов, скрипты, evals: admin можно, SDK нельзя
  {
    files: ['src/**/server/**/*.ts', 'src/**/server.ts', 'scripts/**/*.ts', 'evals/**/*.ts'],
    ignores: ['src/shared/ai/**'],
    rules: {
      'no-restricted-imports': ['error', sdkRestriction],
    },
  },
]);
