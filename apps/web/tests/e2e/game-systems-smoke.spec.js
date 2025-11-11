import { test, expect } from '@playwright/test';
/**
 * Smoke tests to verify game systems editor pages compile and load without errors.
 * These tests don't require authentication - just verifying TypeScript compilation worked.
 */
test.describe('Game Systems Editors - Smoke Tests', () => {
    test('Skills editor page compiles and responds', async ({ request }) => {
        const response = await request.get('http://localhost:3000/dashboard/skills');
        // Page should return 200 or 307 (redirect to login)
        expect([200, 307]).toContain(response.status());
        // If 200, check it has HTML content
        if (response.status() === 200) {
            const body = await response.text();
            expect(body).toContain('<!DOCTYPE html>');
        }
    });
    test('Spells editor page compiles and responds', async ({ request }) => {
        const response = await request.get('http://localhost:3000/dashboard/spells');
        expect([200, 307]).toContain(response.status());
        if (response.status() === 200) {
            const body = await response.text();
            expect(body).toContain('<!DOCTYPE html>');
        }
    });
    test('Classes editor page compiles and responds', async ({ request }) => {
        const response = await request.get('http://localhost:3000/dashboard/classes');
        expect([200, 307]).toContain(response.status());
        if (response.status() === 200) {
            const body = await response.text();
            expect(body).toContain('<!DOCTYPE html>');
        }
    });
    test('Races editor page compiles and responds', async ({ request }) => {
        const response = await request.get('http://localhost:3000/dashboard/races');
        expect([200, 307]).toContain(response.status());
        if (response.status() === 200) {
            const body = await response.text();
            expect(body).toContain('<!DOCTYPE html>');
        }
    });
    test('All editor pages should not have JavaScript errors', async ({ page }) => {
        const jsErrors = [];
        // Capture console errors
        page.on('pageerror', (error) => {
            jsErrors.push(error.message);
        });
        // Try to visit each page (will redirect to login but should load without JS errors)
        const pages = [
            '/dashboard/skills',
            '/dashboard/spells',
            '/dashboard/classes',
            '/dashboard/races',
        ];
        for (const pagePath of pages) {
            await page.goto(`http://localhost:3000${pagePath}`, {
                waitUntil: 'domcontentloaded',
                timeout: 10000,
            });
            // Wait a bit for any async errors
            await page.waitForTimeout(1000);
        }
        // Check no critical JavaScript errors occurred
        const criticalErrors = jsErrors.filter((err) => !err.includes('404') && // Ignore 404s
            !err.includes('Failed to fetch') && // Ignore network errors
            !err.includes('NetworkError') // Ignore network errors
        );
        if (criticalErrors.length > 0) {
            console.log('JavaScript errors found:', criticalErrors);
        }
        expect(criticalErrors.length).toBe(0);
    });
});
//# sourceMappingURL=game-systems-smoke.spec.js.map