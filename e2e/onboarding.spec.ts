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

test.describe('Progress bar ARIA (KAN-35)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/onboarding-progress-test');
  });

  test('progress bar has role=progressbar and accessible label', async ({ page }) => {
    const bar = page.getByRole('progressbar', { name: 'Onboarding progress' }).first();
    await expect(bar).toBeVisible();
    await expect(bar).toHaveAttribute('aria-valuemin', '1');
    await expect(bar).toHaveAttribute('aria-valuemax', '3');
  });

  test('progress bar at display step 1 has aria-valuenow=1', async ({ page }) => {
    const section = page.getByRole('region', { name: 'Progress at display step 1' });
    await expect(section.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');
  });

  test('progress bar at display step 2 has aria-valuenow=2', async ({ page }) => {
    const section = page.getByRole('region', { name: 'Progress at display step 2' });
    await expect(section.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '2');
  });

  test('progress bar at display step 3 has aria-valuenow=3', async ({ page }) => {
    const section = page.getByRole('region', { name: 'Progress at display step 3' });
    await expect(section.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '3');
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
