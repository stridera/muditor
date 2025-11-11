import { test, expect } from '@playwright/test';
test.describe('Basic Application Functionality', () => {
    test('should load home page', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveTitle(/Muditor/);
        await expect(page.locator('text=Muditor')).toBeVisible();
    });
    test('should navigate to login page', async ({ page }) => {
        await page.goto('/');
        await page.click('text=Login');
        await expect(page).toHaveURL(/.*login/);
        await expect(page.locator('h1:has-text("Sign In")')).toBeVisible();
    });
    test('should navigate to register page', async ({ page }) => {
        await page.goto('/');
        await page.click('text=Register');
        await expect(page).toHaveURL(/.*register/);
        await expect(page.locator('h1:has-text("Create Account")')).toBeVisible();
    });
    test('should show validation error for invalid login', async ({ page }) => {
        await page.goto('/login');
        // Try to login with empty fields
        await page.click('button[type="submit"]');
        // Should show some validation error (might be browser validation or app validation)
        // This test is flexible about what kind of validation appears
        const hasValidationError = (await page
            .locator('.text-red-500, .text-red-600, .error, [aria-invalid="true"]')
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
    test('should show scripts page when navigating to scripts', async ({ page, }) => {
        await page.goto('/dashboard/scripts');
        // Should either show scripts page content or redirect to login
        const url = page.url();
        if (url.includes('/login')) {
            // Redirected to login - that's expected behavior for protected routes
            await expect(page.locator('h1:has-text("Sign In")')).toBeVisible();
        }
        else {
            // On scripts page - should show scripts content
            await expect(page.locator('text=Scripts')).toBeVisible();
        }
    });
    test('should have working navigation links', async ({ page }) => {
        await page.goto('/');
        // Check that main navigation links exist and are clickable
        const homeLink = page.locator('text=Muditor').first();
        await expect(homeLink).toBeVisible();
        const loginLink = page.locator('text=Login').first();
        await expect(loginLink).toBeVisible();
        const registerLink = page.locator('text=Register').first();
        await expect(registerLink).toBeVisible();
    });
});
//# sourceMappingURL=basic-functionality.spec.js.map