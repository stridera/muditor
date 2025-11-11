import { test, expect } from '@playwright/test';
test.describe('Basic System Check', () => {
    test('should load home page', async ({ page }) => {
        await page.goto('/');
        // Should load without error
        await expect(page).toHaveTitle(/Muditor/);
        // Should have some basic navigation or content
        const bodyContent = await page.textContent('body');
        expect(bodyContent).toBeTruthy();
        expect(bodyContent.length).toBeGreaterThan(0);
    });
    test('should have working navigation to login', async ({ page }) => {
        await page.goto('/');
        // Try to find a login link or button
        await page.click('a[href*="login"], button:has-text("Login"), a:has-text("Login"), a:has-text("Sign In")');
        // Should navigate to login page
        await expect(page).toHaveURL(/login/);
        await expect(page.locator('input[type="password"]')).toBeVisible();
    });
});
//# sourceMappingURL=simple-check.spec.js.map