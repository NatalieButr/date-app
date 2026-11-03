import { defineConfig } from 'steiger'
import fsd from '@feature-sliced/steiger-plugin'

export default defineConfig([
  ...fsd.configs.recommended,
  {
    // _app and _pages are the FSD-recommended names for Next.js to avoid
    // conflicts with the framework's own app/ and pages/ directories.
    // See: https://feature-sliced.design/docs/guides/tech/with-nextjs
    rules: {
      'fsd/typo-in-layer-name': 'off',
    },
  },
])
