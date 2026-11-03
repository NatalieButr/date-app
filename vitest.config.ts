import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    alias: {
      // server-only бросает ошибку вне React Server-окружения; в тестах подменяем пустым модулем
      'server-only': new URL('./test/server-only-stub.ts', import.meta.url).pathname,
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/__tests__/**/*.test.{ts,tsx}', 'evals/**/*.test.ts'],
  },
});
