import { defineConfig, devices } from '@playwright/test';

// Конфиг лежит вне src/, поэтому читает process.env напрямую (правило env-хелперов касается кода приложения).
const isCI = Boolean(process.env.CI);
const PORT = Number(process.env.PORT ?? 3000);
// E2E_BASE_URL — прогнать тесты против уже поднятого стенда (например, preview-деплоя Vercel)
const externalBaseURL = process.env.E2E_BASE_URL;
const baseURL = externalBaseURL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: isCI ? [['github'], ['html', { open: 'never' }]] : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    // Mobile-first: минимальная ширина по CLAUDE.md — 360 px
    { name: 'mobile-360', use: { ...devices['Pixel 7'], viewport: { width: 360, height: 780 } } },
  ],
  webServer: externalBaseURL
    ? undefined
    : {
        // В CI тестируем продакшен-сборку (npm run build делается шагом раньше)
        command: isCI ? 'npm run start' : 'npm run dev',
        url: baseURL,
        reuseExistingServer: !isCI,
        timeout: 120_000,
      },
});
