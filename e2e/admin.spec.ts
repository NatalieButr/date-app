import { expect, test } from '@playwright/test';

test.describe('Admin page (unauthenticated)', () => {
  test('redirects unauthenticated users to /login', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Admin API (unauthenticated)', () => {
  test('GET /api/admin/metrics returns 401', async ({ request }) => {
    const res = await request.get('/api/admin/metrics');
    expect(res.status()).toBe(401);
  });
});

test.describe('Admin landmark structure (KAN-32)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin-landmark-test');
  });

  test('page has exactly one main landmark (no nested main inside AppShell)', async ({ page }) => {
    await expect(page.getByRole('main')).toHaveCount(1);
  });
});
