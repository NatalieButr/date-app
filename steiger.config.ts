import { defineConfig } from 'steiger';
import fsd from '@feature-sliced/steiger-plugin';

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
  {
    // shared uses direct imports by file/segment (SPEC §4.3), not a barrel index.ts.
    // fsd/public-api is intentionally disabled for the entire shared layer.
    files: ['src/shared/**'],
    rules: {
      'fsd/public-api': 'off',
    },
  },
  {
    // All consumers of shared use file-level imports per SPEC §4.3.
    // no-public-api-sidestep would otherwise fire on every @/shared/api/…,
    // @/shared/config/… and @/shared/ui/… import, which is the intended pattern.
    rules: {
      'fsd/no-public-api-sidestep': 'off',
    },
  },
  {
    // These three slices each have one reference today but will gain more as
    // the app grows (viewer → feeds/matches/wingman, auth-by-email → settings,
    // app-shell → every authenticated page). Scoped to these paths only so
    // future single-reference slices still surface as warnings.
    files: [
      'src/entities/viewer/**',
      'src/entities/profile/**',
      'src/entities/match/**',
      'src/features/auth-by-email/**',
      'src/features/onboarding/**',
      'src/features/swipe-profile/**',
      'src/entities/message/**',
      'src/features/rank-feed/**',
      'src/features/send-message/**',
      'src/features/icebreakers/**',
      'src/features/chat-coach/**',
      'src/features/wingman/**',
      'src/widgets/wingman-panel/**',
      'src/widgets/app-shell/**',
      'src/widgets/swipe-deck/**',
      'src/widgets/chat-window/**',
      'src/widgets/match-list/**',
    ],
    rules: {
      'fsd/insignificant-slice': 'off',
    },
  },
  {
    // _app/providers is the FSD-recommended convention for Next.js global providers.
    files: ['src/_app/**'],
    rules: {
      'fsd/segments-by-purpose': 'off',
    },
  },
]);
