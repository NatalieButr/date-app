import { test, expect } from '@playwright/test';

test.describe('Onboarding (unauthenticated)', () => {
  test('redirects to /login when not authenticated', async ({ page }) => {
    await page.goto('/onboarding');
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Login page', () => {
  test('shows the login form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});
