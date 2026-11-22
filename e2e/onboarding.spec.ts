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

test.describe('Textarea labels (KAN-34)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/textarea-labels-test');
  });

  test('OnboardingChat textarea has accessible label "Your message"', async ({ page }) => {
    await expect(page.getByRole('textbox', { name: 'Your message' })).toBeVisible();
  });

  test('SendMessageForm textarea has accessible label "Message"', async ({ page }) => {
    await expect(page.getByRole('textbox', { name: 'Message', exact: true })).toBeVisible();
  });

  test('BioPicker textarea is associated with its visible label via htmlFor/id', async ({
    page,
  }) => {
    await expect(page.getByRole('textbox', { name: 'Edit your bio' })).toBeVisible();
  });
});
