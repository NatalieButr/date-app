import { expect, test } from '@playwright/test';

test.describe('Login page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('renders the auth form', async ({ page }) => {
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('tab', { name: 'Sign in' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Sign up' })).toBeVisible();
  });

  test('Sign in tab — email and password fields', async ({ page }) => {
    await page.getByRole('tab', { name: 'Sign in' }).click();
    await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
  });

  test('Sign up tab — email and password fields', async ({ page }) => {
    await page.getByRole('tab', { name: 'Sign up' }).click();
    await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
  });

  test('does not navigate away on empty submit', async ({ page }) => {
    await page.getByRole('tab', { name: 'Sign in' }).click();
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/\/login/);
  });

  test('no horizontal scroll', async ({ page }) => {
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test('no console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    page.on('pageerror', (error) => errors.push(error.message));

    await page.waitForLoadState('networkidle');

    expect(errors).toEqual([]);
  });
});

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
