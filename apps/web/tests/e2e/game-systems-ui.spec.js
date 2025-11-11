import { test, expect } from '@playwright/test';
test.describe('Game Systems UI - Editor Pages', () => {
    test.beforeEach(async ({ page }) => {
        // Login as admin
        await page.goto('http://localhost:3000/login');
        await page.fill('input[name="identifier"]', 'admin@muditor.dev');
        await page.fill('input[name="password"]', 'admin123');
        await page.click('button[type="submit"]');
        // Wait for navigation to dashboard
        await page.waitForURL('**/dashboard');
    });
    test('Skills editor page should load and display table', async ({ page }) => {
        await page.goto('http://localhost:3000/dashboard/skills');
        // Wait for page to load
        await page.waitForSelector('h1', { state: 'visible' });
        // Check page title
        const title = await page.textContent('h1');
        expect(title).toContain('Skills');
        // Check that table exists
        const table = await page.locator('table');
        await expect(table).toBeVisible();
        // Check for search input
        const searchInput = await page.locator('input[placeholder*="Search"]');
        await expect(searchInput).toBeVisible();
    });
    test('Spells editor page should load and display table', async ({ page }) => {
        await page.goto('http://localhost:3000/dashboard/spells');
        // Wait for page to load
        await page.waitForSelector('h1', { state: 'visible' });
        // Check page title
        const title = await page.textContent('h1');
        expect(title).toContain('Spells');
        // Check that table exists
        const table = await page.locator('table');
        await expect(table).toBeVisible();
    });
    test('Classes editor page should load and display table', async ({ page }) => {
        await page.goto('http://localhost:3000/dashboard/classes');
        // Wait for page to load
        await page.waitForSelector('h1', { state: 'visible' });
        // Check page title
        const title = await page.textContent('h1');
        expect(title).toContain('Classes');
        // Check that table exists
        const table = await page.locator('table');
        await expect(table).toBeVisible();
        // Check for Create button (GOD role should see it)
        const createButton = await page.locator('button:has-text("Create")');
        await expect(createButton).toBeVisible();
    });
    test('Races editor page should load and display table', async ({ page }) => {
        await page.goto('http://localhost:3000/dashboard/races');
        // Wait for page to load
        await page.waitForSelector('h1', { state: 'visible' });
        // Check page title
        const title = await page.textContent('h1');
        expect(title).toContain('Races');
        // Check that table exists
        const table = await page.locator('table');
        await expect(table).toBeVisible();
        // Check for search input
        const searchInput = await page.locator('input[placeholder*="Search"]');
        await expect(searchInput).toBeVisible();
    });
    test('Skills editor should open edit dialog', async ({ page }) => {
        await page.goto('http://localhost:3000/dashboard/skills');
        // Wait for table to load
        await page.waitForSelector('table tbody tr', { state: 'visible' });
        // Click first edit button
        const editButton = page.locator('button[aria-label="Edit"]').first();
        await editButton.click();
        // Check dialog opens
        const dialog = page.locator('[role="dialog"]');
        await expect(dialog).toBeVisible();
        // Check dialog has form elements
        const nameInput = dialog.locator('input[id="name"]');
        await expect(nameInput).toBeVisible();
    });
    test('Classes editor should open create dialog', async ({ page }) => {
        await page.goto('http://localhost:3000/dashboard/classes');
        // Click Create button
        const createButton = page.locator('button:has-text("Create")');
        await createButton.click();
        // Check dialog opens
        const dialog = page.locator('[role="dialog"]');
        await expect(dialog).toBeVisible();
        // Check form fields exist
        const nameInput = dialog.locator('input[id="name"]');
        await expect(nameInput).toBeVisible();
        const hitDiceInput = dialog.locator('input[id="hitDice"]');
        await expect(hitDiceInput).toBeVisible();
    });
    test('Races editor should open edit dialog with tabs', async ({ page }) => {
        await page.goto('http://localhost:3000/dashboard/races');
        // Wait for table to load
        await page.waitForSelector('table tbody tr', { state: 'visible' });
        // Click first edit button
        const editButton = page.locator('button').filter({ has: page.locator('svg') }).first();
        await editButton.click();
        // Check dialog opens
        const dialog = page.locator('[role="dialog"]');
        await expect(dialog).toBeVisible();
        // Check tabs exist
        const flagsTab = dialog.locator('button:has-text("Flags")');
        await expect(flagsTab).toBeVisible();
        const statsTab = dialog.locator('button:has-text("Stats")');
        await expect(statsTab).toBeVisible();
        const factorsTab = dialog.locator('button:has-text("Factors")');
        await expect(factorsTab).toBeVisible();
    });
});
//# sourceMappingURL=game-systems-ui.spec.js.map