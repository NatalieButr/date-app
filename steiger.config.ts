import fsd from '@feature-sliced/steiger-plugin';
import { defineConfig } from 'steiger';

export default defineConfig([
  ...fsd.configs.recommended,
  {
    ignores: ['**/.gitkeep', '**/__tests__/**', '**/__mocks__/**'],
  },
  {
    // shared импортируется по сегментам: @/shared/ui/button, @/shared/ai, @/shared/config/env.public
    files: ['./src/shared/**'],
    rules: {
      'fsd/public-api': 'off',
    },
  },
]);
