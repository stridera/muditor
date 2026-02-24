import { test, expect } from './fixtures';

test.describe('Game Systems UI - Editor Pages', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('#identifier', 'admin@muditor.dev');
    await page.fill('#password', 'admin123');
    await page.click('button[type="submit"]');

    // Wait for navigation to dashboard
    await page.waitForURL('**/dashboard**', { timeout: 15000 });
  });

  test('Abilities editor page should load and display table', async ({
    page,
  }) => {
    await page.goto('/dashboard/abilities');

    // Wait for page to load - abilities uses h1
    await page.waitForSelector('h1', { state: 'visible', timeout: 30000 });

    // Check page title
    const title = await page.textContent('h1');
    expect(title).toContain('Abilities');

    // Check that table exists
    const table = page.locator('table');
    await expect(table).toBeVisible();

    // Check for search input
    const searchInput = page.locator('input[placeholder*="Search"]');
    await expect(searchInput).toBeVisible();
  });

  test('Classes editor page should load and display list', async ({ page }) => {
    await page.goto('/dashboard/classes');

    // Wait for page to load - classes uses h2 heading
    await page.waitForSelector('h2', { state: 'visible', timeout: 30000 });

    // Check page heading
    const title = await page.textContent('h2');
    expect(title).toContain('Classes');

    // Check for search input
    const searchInput = page.locator('input[placeholder*="Search"]');
    await expect(searchInput).toBeVisible();

    // Check that class items are displayed as buttons
    const classItems = page.locator(
      'button:has-text("Berserker"), button:has-text("Warrior"), button:has-text("Priest")'
    );
    await expect(classItems.first()).toBeVisible();
  });

  test('Races editor page should load and display table', async ({ page }) => {
    await page.goto('/dashboard/races');

    // Wait for page to load
    await page.waitForSelector('h1, h2', { state: 'visible', timeout: 30000 });

    // Check page title
    const heading = page.locator('h1, h2').first();
    const title = await heading.textContent();
    expect(title).toContain('Races');

    // Check that table exists
    const table = page.locator('table');
    await expect(table).toBeVisible();

    // Check for search input
    const searchInput = page.locator('input[placeholder*="Search"]');
    await expect(searchInput).toBeVisible();
  });

  test('Abilities editor should open detail when row is clicked', async ({
    page,
  }) => {
    await page.goto('/dashboard/abilities');

    // Wait for table to load
    await page.waitForSelector('table tbody tr', {
      state: 'visible',
      timeout: 30000,
    });

    // Click first row in the table (rows are clickable)
    await page.locator('table tbody tr').first().click();

    // Should show detail view - either a dialog or a detail panel
    // Check for dialog or expanded content
    const hasDialog = (await page.locator('[role="dialog"]').count()) > 0;
    const hasDetailContent =
      (await page.locator('input[id="name"], input[name="name"]').count()) > 0;

    // At minimum, clicking a row should do something (navigate or show detail)
    expect(
      hasDialog || hasDetailContent || page.url().includes('/abilities/')
    ).toBeTruthy();
  });

  test('Classes editor should show detail when class is clicked', async ({
    page,
  }) => {
    await page.goto('/dashboard/classes');

    // Wait for class items to load
    await page.waitForSelector('button:has-text("Berserker")', {
      state: 'visible',
      timeout: 30000,
    });

    // Click a class button
    await page.locator('button:has-text("Berserker")').click();

    // Should show class details in the right panel (no longer "No class selected")
    await expect(page.locator('text=No class selected')).not.toBeVisible({
      timeout: 5000,
    });
  });

  test('Races editor should load with data', async ({ page }) => {
    await page.goto('/dashboard/races');

    // Wait for table to load
    await page.waitForSelector('table tbody tr, button:has-text("Human")', {
      state: 'visible',
      timeout: 30000,
    });

    // Check that some race data is displayed
    const raceContent = await page.textContent('main');
    expect(raceContent).toBeTruthy();
    expect(raceContent!.length).toBeGreaterThan(0);
  });
});
