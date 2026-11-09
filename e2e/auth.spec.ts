import { expect, test } from '@playwright/test';

test.describe('Redirects (unauthenticated)', () => {
  test('/feed redirects to /login', async ({ page }) => {
    await page.goto('/feed');
    await expect(page).toHaveURL(/\/login/);
  });

  test('/onboarding redirects to /login', async ({ page }) => {
    await page.goto('/onboarding');
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Auth pages', () => {
  test('sign-in tab shows Forgot password link', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('link', { name: 'Forgot password?' })).toBeVisible();
  });

  test('forgot-password page renders form', async ({ page }) => {
    await page.goto('/forgot-password');
    await expect(page.getByText('Reset password')).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Send reset link' })).toBeVisible();
  });

  test('forgot-password form shows field error for invalid email', async ({ page }) => {
    await page.goto('/forgot-password');
    await page.getByRole('textbox', { name: 'Email' }).fill('not-an-email');
    await page.getByRole('button', { name: 'Send reset link' }).click();
    // Use span[role="alert"] to avoid matching the Next.js route announcer div.
    await expect(page.locator('span[role="alert"]').first()).toBeVisible();
  });

  test('reset-password page renders loading state', async ({ page }) => {
    await page.goto('/reset-password');
    await expect(page.getByText('Verifying reset link')).toBeVisible();
  });

  test('sign-up tab shows per-field validation errors', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('tab', { name: 'Sign up' }).click();
    await page.getByRole('button', { name: 'Sign up' }).click();
    // At least one field error span should appear (excludes the Next.js route announcer div).
    await expect(page.locator('span[role="alert"]').first()).toBeVisible();
  });
});
