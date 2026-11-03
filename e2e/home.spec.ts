import { expect, test } from '@playwright/test';

test.describe('Главная', () => {
  test('открывается и показывает название', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Spark/);
    await expect(page.getByRole('heading', { level: 1, name: 'Spark' })).toBeVisible();
  });

  test('нет горизонтального скролла', async ({ page }) => {
    await page.goto('/');

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test('нет ошибок в консоли', async ({ page }) => {
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
