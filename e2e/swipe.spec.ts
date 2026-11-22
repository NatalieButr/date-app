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

test.describe('MatchModal dialog (KAN-31)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/match-modal-test');
  });

  test('renders with role="dialog" and accessible title', async ({ page }) => {
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: "It's a Match!" })).toBeVisible();
  });

  test('dialog is labelled by its title (aria-labelledby)', async ({ page }) => {
    const dialog = page.getByRole('dialog');
    // Radix wires aria-labelledby to the DialogTitle element automatically
    await expect(dialog).toHaveAttribute('aria-labelledby');
  });

  test('closes on Escape key', async ({ page }) => {
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('"Keep swiping" button closes the dialog', async ({ page }) => {
    await page.getByRole('button', { name: 'Keep swiping' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });
});
