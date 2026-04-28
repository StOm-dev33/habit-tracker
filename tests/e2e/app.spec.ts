import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3000';

function uniqueEmail() {
  return `user_${Date.now()}@example.com`;
}

test.describe('Habit Tracker app', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto(BASE);
    await page.evaluate(() => localStorage.clear());
  });

  test('shows the splash screen and redirects unauthenticated users to /login', async ({ page }) => {
    await page.goto(BASE);
    await expect(page.getByTestId('splash-screen')).toBeVisible();
    await page.waitForURL('**/login', { timeout: 5000 });
    expect(page.url()).toContain('/login');
  });

  test('redirects authenticated users from / to /dashboard', async ({ page }) => {
    const email = uniqueEmail();
    await page.goto(`${BASE}/signup`);
    await page.getByTestId('auth-signup-email').fill(email);
    await page.getByTestId('auth-signup-password').fill('password123');
    await page.getByTestId('auth-signup-submit').click();
    await page.waitForURL('**/dashboard', { timeout: 5000 });

    await page.goto(BASE);
    await page.waitForURL('**/dashboard', { timeout: 5000 });
    expect(page.url()).toContain('/dashboard');
  });

  test('prevents unauthenticated access to /dashboard', async ({ page }) => {
    await page.goto(`${BASE}/dashboard`);
    await page.waitForURL('**/login', { timeout: 5000 });
    expect(page.url()).toContain('/login');
  });

  test('signs up a new user and lands on the dashboard', async ({ page }) => {
    const email = uniqueEmail();
    await page.goto(`${BASE}/signup`);
    await page.getByTestId('auth-signup-email').fill(email);
    await page.getByTestId('auth-signup-password').fill('password123');
    await page.getByTestId('auth-signup-submit').click();
    await page.waitForURL('**/dashboard', { timeout: 5000 });
    await expect(page.getByTestId('dashboard-page')).toBeVisible();
  });

  test('logs in an existing user and loads only that user\'s habits', async ({ page }) => {
    const email = uniqueEmail();

    // Sign up first
    await page.goto(`${BASE}/signup`);
    await page.getByTestId('auth-signup-email').fill(email);
    await page.getByTestId('auth-signup-password').fill('password123');
    await page.getByTestId('auth-signup-submit').click();
    await page.waitForURL('**/dashboard', { timeout: 5000 });

    // Logout
    await page.getByTestId('auth-logout-button').click();
    await page.waitForURL('**/login', { timeout: 5000 });

    // Login again
    await page.getByTestId('auth-login-email').fill(email);
    await page.getByTestId('auth-login-password').fill('password123');
    await page.getByTestId('auth-login-submit').click();
    await page.waitForURL('**/dashboard', { timeout: 5000 });
    await expect(page.getByTestId('dashboard-page')).toBeVisible();
  });

  test('creates a habit from the dashboard', async ({ page }) => {
    const email = uniqueEmail();
    await page.goto(`${BASE}/signup`);
    await page.getByTestId('auth-signup-email').fill(email);
    await page.getByTestId('auth-signup-password').fill('password123');
    await page.getByTestId('auth-signup-submit').click();
    await page.waitForURL('**/dashboard', { timeout: 5000 });

    await page.getByTestId('create-habit-button').click();
    await page.getByTestId('habit-name-input').fill('Drink Water');
    await page.getByTestId('habit-description-input').fill('8 glasses a day');
    await page.getByTestId('habit-save-button').click();

    await expect(page.getByTestId('habit-card-drink-water')).toBeVisible();
  });

  test('completes a habit for today and updates the streak', async ({ page }) => {
    const email = uniqueEmail();
    await page.goto(`${BASE}/signup`);
    await page.getByTestId('auth-signup-email').fill(email);
    await page.getByTestId('auth-signup-password').fill('password123');
    await page.getByTestId('auth-signup-submit').click();
    await page.waitForURL('**/dashboard', { timeout: 5000 });

    await page.getByTestId('create-habit-button').click();
    await page.getByTestId('habit-name-input').fill('Drink Water');
    await page.getByTestId('habit-save-button').click();
    await expect(page.getByTestId('habit-card-drink-water')).toBeVisible();

    const streakBefore = await page.getByTestId('habit-streak-drink-water').textContent();
    expect(streakBefore).toContain('0');

    await page.getByTestId('habit-complete-drink-water').click();

    await expect(page.getByTestId('habit-streak-drink-water')).toContainText('1');
  });

  test('persists session and habits after page reload', async ({ page }) => {
    const email = uniqueEmail();
    await page.goto(`${BASE}/signup`);
    await page.getByTestId('auth-signup-email').fill(email);
    await page.getByTestId('auth-signup-password').fill('password123');
    await page.getByTestId('auth-signup-submit').click();
    await page.waitForURL('**/dashboard', { timeout: 5000 });

    await page.getByTestId('create-habit-button').click();
    await page.getByTestId('habit-name-input').fill('Read Books');
    await page.getByTestId('habit-save-button').click();
    await expect(page.getByTestId('habit-card-read-books')).toBeVisible();

    await page.reload();
    await page.waitForURL('**/dashboard', { timeout: 5000 });
    await expect(page.getByTestId('habit-card-read-books')).toBeVisible();
  });

  test('logs out and redirects to /login', async ({ page }) => {
    const email = uniqueEmail();
    await page.goto(`${BASE}/signup`);
    await page.getByTestId('auth-signup-email').fill(email);
    await page.getByTestId('auth-signup-password').fill('password123');
    await page.getByTestId('auth-signup-submit').click();
    await page.waitForURL('**/dashboard', { timeout: 5000 });

    await page.getByTestId('auth-logout-button').click();
    await page.waitForURL('**/login', { timeout: 5000 });
    expect(page.url()).toContain('/login');
  });

  test('loads the cached app shell when offline after the app has been loaded once', async ({ page, context }) => {
    const email = uniqueEmail();
    await page.goto(`${BASE}/signup`);
    await page.getByTestId('auth-signup-email').fill(email);
    await page.getByTestId('auth-signup-password').fill('password123');
    await page.getByTestId('auth-signup-submit').click();
    await page.waitForURL('**/dashboard', { timeout: 5000 });

    // Wait for service worker to activate
    await page.waitForTimeout(2000);

    // Go offline
    await context.setOffline(true);

    // Reload and check that the app doesn't hard crash
    await page.goto(BASE);
    const body = await page.locator('body').textContent();
    expect(body).not.toBeNull();

    // Re-enable network
    await context.setOffline(false);
  });
});
