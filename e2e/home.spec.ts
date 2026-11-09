import { expect, test } from '@playwright/test';

test.describe('Home page', () => {
  test('renders title and CTA', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Spark/);
    await expect(page.getByRole('heading', { level: 1, name: 'Spark' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Sign in' })).toBeVisible();
  });

  test('no horizontal scroll', async ({ page }) => {
    await page.goto('/');

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

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    expect(errors).toEqual([]);
  });
});
