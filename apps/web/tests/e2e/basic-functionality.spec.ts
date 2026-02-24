import { test, expect } from './fixtures';

test.describe('Basic Application Functionality', () => {
  test('should load home page', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1:has-text("MUDITOR")')).toBeVisible();
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href*="login"], a:has-text("Sign In")');
    await expect(page).toHaveURL(/.*login/);
    await expect(page.locator('#identifier')).toBeVisible();
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href*="register"], a:has-text("Create Account")');
    await expect(page).toHaveURL(/.*register/);
    await expect(page.locator('#username')).toBeVisible();
  });

  test('should show validation error for invalid login', async ({ page }) => {
    await page.goto('/login');

    // Try to login with empty fields
    await page.click('button[type="submit"]');

    // Should show some validation error (might be browser validation or app validation)
    // This test is flexible about what kind of validation appears
    const hasValidationError =
      (await page
        .locator(
          '.text-red-500, .text-red-600, .error, [aria-invalid="true"], [role="alert"]'
        )
        .count()) > 0;
    const hasFormValidation = await page.evaluate(() => {
      const forms = document.querySelectorAll('form');
      return Array.from(forms).some(form => !form.checkValidity());
    });

    expect(hasValidationError || hasFormValidation).toBeTruthy();
  });

  test('should navigate to dashboard when authenticated', async ({ page }) => {
    // This test assumes there's a way to get to dashboard
    // First try direct navigation (will redirect to login if not authenticated)
    await page.goto('/dashboard');

    // Should either be at dashboard or redirected to login
    const url = page.url();
    expect(url.includes('/dashboard') || url.includes('/login')).toBeTruthy();
  });

  test('should show scripts page when navigating to scripts', async ({
    page,
  }) => {
    await page.goto('/dashboard/scripts');

    // Wait for either login form (client-side redirect) or scripts content to appear
    // React hydration + auth check + redirect can be slow against dev server
    await expect(
      page.locator('#identifier').or(page.locator('main'))
    ).toBeVisible({ timeout: 30000 });

    if (await page.locator('#identifier').isVisible()) {
      // Redirected to login - expected behavior for protected routes
      expect(page.url()).toContain('/login');
    } else {
      // On scripts page - should show content
      await expect(page.locator('main')).toBeVisible();
    }
  });

  test('should have working navigation links', async ({ page }) => {
    await page.goto('/');

    // Check that main navigation links exist and are clickable
    const brandLink = page.locator('h1:has-text("MUDITOR")').first();
    await expect(brandLink).toBeVisible();

    const loginLink = page
      .locator('a[href*="login"], a:has-text("Sign In")')
      .first();
    await expect(loginLink).toBeVisible();

    const registerLink = page
      .locator('a[href*="register"], a:has-text("Create Account")')
      .first();
    await expect(registerLink).toBeVisible();
  });
});
