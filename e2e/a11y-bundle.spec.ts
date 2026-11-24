import { test, expect } from '@playwright/test';

test.describe('A11y bundle fixes (KAN-36)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/a11y-bundle-test');
  });

  test('nav link has aria-current="page"', async ({ page }) => {
    const link = page.getByRole('link', { name: 'Feed (active)' });
    await expect(link).toHaveAttribute('aria-current', 'page');
  });

  test('matches badge has accessible label', async ({ page }) => {
    const badge = page.getByLabel('0 new matches');
    await expect(badge).toBeVisible();
  });

  test('error message has role=alert', async ({ page }) => {
    const section = page.getByRole('region', { name: 'DemoLoginButton error' });
    const alert = section.getByRole('alert');
    await expect(alert).toBeVisible();
    await expect(alert).toHaveText('Demo login failed');
  });

  test('send button has aria-label="Send"', async ({ page }) => {
    const sendBtn = page.getByRole('button', { name: 'Send', exact: true });
    await expect(sendBtn).toBeVisible();
    await expect(sendBtn).toHaveAttribute('aria-label', 'Send');
  });

  test('sending button has aria-label="Sending message"', async ({ page }) => {
    const sendingBtn = page.getByRole('button', { name: 'Sending message' });
    await expect(sendingBtn).toBeVisible();
    await expect(sendingBtn).toHaveAttribute('aria-label', 'Sending message');
  });

  test('avatar fallback div has aria-hidden="true"', async ({ page }) => {
    const section = page.getByRole('region', { name: 'Avatar fallback divs' });
    const fallback = section.locator('[aria-hidden="true"]');
    await expect(fallback).toHaveCount(1);
  });

  test('admin metrics table has aria-label', async ({ page }) => {
    const table = page.getByRole('table', { name: 'AI call metrics' });
    await expect(table).toBeVisible();
  });
});
