import { test, expect } from '@playwright/test';

test.describe('Swipe deck', () => {
  test.beforeEach(async ({ page }) => {
    // Unauthenticated users are redirected to login
    await page.goto('/feed');
  });

  test('redirects unauthenticated users to /login', async ({ page }) => {
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Feed page (unauthenticated)', () => {
  test('shows login page at /login', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});
