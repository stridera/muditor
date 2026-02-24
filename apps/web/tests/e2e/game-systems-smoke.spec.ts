import { test, expect } from '@playwright/test';

/**
 * Smoke tests to verify game systems editor pages compile and load without errors.
 * These tests don't require authentication - just verifying TypeScript compilation worked.
 */

test.describe('Game Systems Editors - Smoke Tests', () => {
  test('Abilities editor page compiles and responds', async ({ request }) => {
    const response = await request.get(
      'http://localhost:3000/dashboard/abilities'
    );

    // Page should return 200 or 307 (redirect to login)
    expect([200, 307]).toContain(response.status());

    // If 200, check it has HTML content
    if (response.status() === 200) {
      const body = await response.text();
      expect(body).toContain('<!DOCTYPE html>');
    }
  });

  test('Classes editor page compiles and responds', async ({ request }) => {
    const response = await request.get(
      'http://localhost:3000/dashboard/classes'
    );

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

  test('All editor pages should not have JavaScript errors', async ({
    page,
  }) => {
    const jsErrors: string[] = [];

    // Capture console errors
    page.on('pageerror', error => {
      jsErrors.push(error.message);
    });

    // Try to visit each page (will redirect to login but should load without JS errors)
    const pages = [
      '/dashboard/abilities',
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
    const criticalErrors = jsErrors.filter(
      err =>
        !err.includes('404') && // Ignore 404s
        !err.includes('Failed to fetch') && // Ignore network errors
        !err.includes('NetworkError') && // Ignore network errors
        !err.includes('NEXT_REDIRECT') && // Ignore Next.js redirects
        !err.includes('Hydration') && // Ignore hydration warnings in dev
        !err.includes('fetch') && // Ignore fetch errors (unauthenticated API calls)
        !err.includes('Unauthorized') // Ignore auth errors on protected pages
    );

    // criticalErrors will be caught by the expect below

    expect(criticalErrors.length).toBe(0);
  });
});
