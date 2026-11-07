import { test, expect } from '@playwright/test';

test.describe('Wingman page (unauthenticated)', () => {
  test('redirects unauthenticated users to /login', async ({ page }) => {
    await page.goto('/wingman');
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Wingman API (unauthenticated)', () => {
  test('POST /api/wingman returns 401', async ({ request }) => {
    const res = await request.post('/api/wingman', {
      data: { query: 'find someone who loves hiking' },
    });
    expect(res.status()).toBe(401);
  });

  test('POST /api/wingman/confirm returns 401', async ({ request }) => {
    const res = await request.post('/api/wingman/confirm', {
      data: { targetId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', text: 'Hello!' },
    });
    expect(res.status()).toBe(401);
  });
});
