import { test, expect } from '@playwright/test';

test.describe('Matches page (unauthenticated)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/matches');
  });

  test('redirects unauthenticated users to /login', async ({ page }) => {
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Chat page (unauthenticated)', () => {
  test('redirects unauthenticated users to /login', async ({ page }) => {
    await page.goto('/chat/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
    await expect(page).toHaveURL(/\/login/);
  });
});

const TEST_MATCH_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

test.describe('Icebreakers API (unauthenticated)', () => {
  test('returns 401 for unauthenticated POST', async ({ request }) => {
    const res = await request.post(`/api/chat/${TEST_MATCH_ID}/icebreakers`);
    expect(res.status()).toBe(401);
  });
});

test.describe('Coach API (unauthenticated)', () => {
  test('returns 401 for unauthenticated POST', async ({ request }) => {
    const res = await request.post(`/api/chat/${TEST_MATCH_ID}/coach`);
    expect(res.status()).toBe(401);
  });
});

test.describe('Chat log live regions (KAN-33)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat-log-test');
  });

  test('page has two role="log" live regions with accessible name "Conversation"', async ({
    page,
  }) => {
    await expect(page.getByRole('log', { name: 'Conversation' })).toHaveCount(2);
  });
});
