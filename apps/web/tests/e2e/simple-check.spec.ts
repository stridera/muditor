import { test, expect } from './fixtures';

test.describe('Basic System Check', () => {
  test('should load home page', async ({ page }) => {
    await page.goto('/');

    // Should have some basic content
    const bodyContent = await page.textContent('body');
    expect(bodyContent).toBeTruthy();
    expect(bodyContent!.length).toBeGreaterThan(0);
  });

  test('should have working navigation to login', async ({ page }) => {
    await page.goto('/');

    // Try to find a login link or button
    await page.click(
      'a[href*="login"], button:has-text("Sign In"), a:has-text("Sign In"), a:has-text("Login")'
    );

    // Should navigate to login page
    await expect(page).toHaveURL(/login/);
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });
});
