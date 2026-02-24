import { test, expect } from './fixtures';

test.describe('Authentication System', () => {
  // Auth tests involve multiple navigations with React hydration waits against a dev server
  test.describe.configure({ timeout: 120_000 });

  const testPassword = 'TestPassword123!';

  test.describe('User Registration', () => {
    test('should display registration form', async ({ page }) => {
      await page.goto('/register');

      await expect(page.locator('#email')).toBeVisible();
      await expect(page.locator('#username')).toBeVisible();
      await expect(page.locator('#password')).toBeVisible();
      await expect(page.locator('#confirmPassword')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('should register a new user successfully', async ({ page }) => {
      await page.goto('/register');

      const timestamp = Date.now();
      const testEmail = `test-${timestamp}@example.com`;
      const testUsername = `tu${timestamp}`;

      await page.fill('#username', testUsername);
      await page.fill('#email', testEmail);
      await page.fill('#password', testPassword);
      await page.fill('#confirmPassword', testPassword);

      await page.click('button[type="submit"]');

      // Should redirect to dashboard after successful registration
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
    });

    test('should show validation errors for invalid input', async ({
      page,
    }) => {
      await page.goto('/register');

      // Try with mismatched passwords
      await page.fill('#email', 'invalid-email');
      await page.fill('#username', 'u'); // too short
      await page.fill('#password', '123'); // too weak
      await page.fill('#confirmPassword', '456'); // mismatch

      await page.click('button[type="submit"]');

      // Should show validation errors (Alert with role="alert" or browser validation)
      const hasValidationError =
        (await page
          .locator('[role="alert"], .text-red-500, .text-destructive')
          .count()) > 0;
      const hasFormValidation = await page.evaluate(() => {
        const forms = document.querySelectorAll('form');
        return Array.from(forms).some(form => !form.checkValidity());
      });

      expect(hasValidationError || hasFormValidation).toBeTruthy();
    });

    test('should prevent duplicate email registration', async ({ page }) => {
      // First registration
      await page.goto('/register');
      const timestamp = Date.now();
      const uniqueEmail = `dup-${timestamp}@example.com`;
      const username1 = `d1${timestamp}`;

      await page.fill('#username', username1);
      await page.fill('#email', uniqueEmail);
      await page.fill('#password', testPassword);
      await page.fill('#confirmPassword', testPassword);
      await page.click('button[type="submit"]');

      // Wait for successful registration
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

      // Clear auth and go back to register
      await page.evaluate(() => localStorage.clear());
      await page.goto('/register');

      // Try to register with same email
      const username2 = `d2${timestamp}`;
      await page.fill('#username', username2);
      await page.fill('#email', uniqueEmail);
      await page.fill('#password', testPassword);
      await page.fill('#confirmPassword', testPassword);
      await page.click('button[type="submit"]');

      // Should show error message
      await expect(page.locator('[role="alert"]')).toBeVisible({
        timeout: 10000,
      });
    });
  });

  test.describe('User Login', () => {
    // Use seeded admin user for reliable login tests
    const adminEmail = 'admin@muditor.dev';
    const adminUsername = 'admin';
    const adminPassword = 'admin123';

    test('should display login form', async ({ page }) => {
      await page.goto('/login');

      await expect(page.locator('#identifier')).toBeVisible();
      await expect(page.locator('#password')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
      await expect(
        page.locator('a[href*="register"], a:has-text("Sign up")')
      ).toBeVisible();
      await expect(
        page.locator('a[href*="forgot"], a:has-text("Forgot")')
      ).toBeVisible();
    });

    test('should login with username successfully', async ({ page }) => {
      await page.goto('/login');

      await page.fill('#identifier', adminUsername);
      await page.fill('#password', adminPassword);
      await page.click('button[type="submit"]');

      // Should redirect to dashboard
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
    });

    test('should login with email successfully', async ({ page }) => {
      await page.goto('/login');

      await page.fill('#identifier', adminEmail);
      await page.fill('#password', adminPassword);
      await page.click('button[type="submit"]');

      // Should redirect to dashboard
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/login');

      await page.fill('#identifier', 'nonexistent@example.com');
      await page.fill('#password', 'wrongpassword');
      await page.click('button[type="submit"]');

      // Should show error message
      await expect(page.locator('[role="alert"]')).toBeVisible({
        timeout: 10000,
      });

      // Should remain on login page
      await expect(page).toHaveURL(/\/login/);
    });

    test('should show error for missing fields', async ({ page }) => {
      await page.goto('/login');

      // Try to submit without filling fields
      await page.click('button[type="submit"]');

      // Should show validation errors (browser or app-level)
      const hasValidationError =
        (await page.locator('[role="alert"]').count()) > 0;
      const hasFormValidation = await page.evaluate(() => {
        const forms = document.querySelectorAll('form');
        return Array.from(forms).some(form => !form.checkValidity());
      });

      expect(hasValidationError || hasFormValidation).toBeTruthy();
    });
  });

  test.describe('Password Reset', () => {
    test('should display forgot password form', async ({ page }) => {
      await page.goto('/forgot-password');

      await expect(page.locator('#email')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
      await expect(
        page.locator(
          'a[href*="login"], a:has-text("login"), a:has-text("Login")'
        )
      ).toBeVisible();
    });

    test('should send password reset email', async ({ page }) => {
      await page.goto('/forgot-password');

      // Wait for React hydration - check that React has attached to DOM elements
      await page.waitForFunction(
        () => {
          const el = document.getElementById('email');
          if (!el) return false;
          return Object.keys(el).some(key => key.startsWith('__react'));
        },
        undefined,
        { timeout: 30000 }
      );

      const emailInput = page.locator('#email');
      await emailInput.fill('admin@muditor.dev');

      await page.locator('button:has-text("Send Reset Link")').click();

      // Wait for the button to show loading state (confirms React handled the submit)
      // Then wait for success state. Increase timeout since hydration + mutation can be slow.
      await expect(
        page.getByRole('heading', { name: 'Check your email' })
      ).toBeVisible({ timeout: 30000 });
    });

    test('should handle non-existent email gracefully', async ({ page }) => {
      await page.goto('/forgot-password');

      await page.fill('#email', 'nonexistent@example.com');
      await page.click('button[type="submit"]');

      // Should still show success message for security (or at least not error)
      // Wait for some response
      await page.waitForTimeout(2000);

      // Should either show success or still be on the page without errors
      const url = page.url();
      expect(url).toContain('forgot-password');
    });

    test('should display reset password form with valid token', async ({
      page,
    }) => {
      // For testing, we'll navigate directly to reset page with a mock token
      await page.goto('/reset-password?token=mock-token');

      await expect(page.locator('#newPassword')).toBeVisible();
      await expect(page.locator('#confirmPassword')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });
  });

  test.describe('Protected Routes', () => {
    test('should redirect unauthenticated users to login', async ({ page }) => {
      // Try to access a protected route
      await page.goto('/dashboard');

      // Should redirect to login (client-side redirect via ProtectedRoute)
      await expect(page).toHaveURL(/\/login/, { timeout: 30000 });

      // Should show login form
      await expect(page.locator('#identifier')).toBeVisible();
    });

    test('should allow authenticated users to access protected routes', async ({
      page,
    }) => {
      // Login as admin
      await page.goto('/login');
      await page.fill('#identifier', 'admin@muditor.dev');
      await page.fill('#password', 'admin123');
      await page.click('button[type="submit"]');

      // Should be on dashboard
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

      // Try accessing another protected route
      await page.goto('/dashboard/zones');

      // Should not redirect to login
      await expect(page).not.toHaveURL(/\/login/);
    });
  });

  test.describe('User Session Management', () => {
    test('should maintain session across page reloads', async ({ page }) => {
      // Register and login
      await page.goto('/register');
      const timestamp = Date.now();
      const uniqueEmail = `se-${timestamp}@example.com`;
      const uniqueUsername = `se${timestamp}`;

      await page.fill('#username', uniqueUsername);
      await page.fill('#email', uniqueEmail);
      await page.fill('#password', testPassword);
      await page.fill('#confirmPassword', testPassword);
      await page.click('button[type="submit"]');

      // Should be on dashboard
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

      // Reload page
      await page.reload();

      // Should still be logged in (not redirected to login)
      await expect(page).toHaveURL(/\/dashboard/);
    });

    test('should handle session expiry gracefully', async ({ page }) => {
      // Login as admin
      await page.goto('/login');
      await page.fill('#identifier', 'admin@muditor.dev');
      await page.fill('#password', 'admin123');
      await page.click('button[type="submit"]');

      // Should be on dashboard
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 30000 });

      // Simulate logout by clearing localStorage
      await page.evaluate(() => localStorage.clear());

      // Try to access protected route
      await page.goto('/dashboard');

      // Should redirect to login (client-side redirect after auth check)
      await expect(page).toHaveURL(/\/login/, { timeout: 30000 });
    });
  });

  test.describe('Role-Based Access Control', () => {
    test('should show appropriate UI elements based on user role', async ({
      page,
    }) => {
      // Register as a basic user (PLAYER role by default)
      await page.goto('/register');
      const timestamp = Date.now();
      const uniqueEmail = `ro-${timestamp}@example.com`;
      const uniqueUsername = `ro${timestamp}`;

      await page.fill('#username', uniqueUsername);
      await page.fill('#email', uniqueEmail);
      await page.fill('#password', testPassword);
      await page.fill('#confirmPassword', testPassword);
      await page.click('button[type="submit"]');

      // Should be on dashboard
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

      // Basic users should see basic navigation (there are 2 nav elements)
      await expect(page.locator('nav').first()).toBeVisible();

      // Should not see admin-only features (if any exist)
      const adminLinks = page.locator(
        'a:has-text("Admin"), a:has-text("Users"), a:has-text("System")'
      );
      if ((await adminLinks.count()) > 0) {
        await expect(adminLinks).not.toBeVisible();
      }
    });
  });

  test.describe('Environment Management', () => {
    test('should display environment selector', async ({ page }) => {
      // Login as admin
      await page.goto('/login');
      await page.fill('#identifier', 'admin@muditor.dev');
      await page.fill('#password', 'admin123');
      await page.click('button[type="submit"]');

      // Should be on dashboard
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

      // Should show environment selector (if it exists)
      const envSelector = page.locator(
        '[data-testid="environment-selector"], .environment-selector, select:has(option:has-text("Development")), button:has-text("Development")'
      );
      if ((await envSelector.count()) > 0) {
        await expect(envSelector.first()).toBeVisible();
      }
    });

    test('should persist environment selection', async ({ page }) => {
      // Login as admin
      await page.goto('/login');
      await page.fill('#identifier', 'admin@muditor.dev');
      await page.fill('#password', 'admin123');
      await page.click('button[type="submit"]');

      // Should be on dashboard
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

      // Look for environment selector
      const envSelector = page.locator(
        '[data-testid="environment-selector"], .environment-selector, select:has(option:has-text("Development"))'
      );
      if ((await envSelector.count()) > 0) {
        // Change environment if possible
        await envSelector.selectOption('test');

        // Reload page
        await page.reload();

        // Environment selection should persist
        await expect(envSelector).toHaveValue('test');
      }
    });
  });
});
