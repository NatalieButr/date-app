import { test, expect } from '@playwright/test';

test.describe('Matches page (unauthenticated)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/matches');
  });

  test('redirects unauthenticated users to /login', async ({ page }) => {
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Chat page (unauthenticated)', () => {
  test('redirects unauthenticated users to /login', async ({ page }) => {
    await page.goto('/chat/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
    await expect(page).toHaveURL(/\/login/);
  });
});
