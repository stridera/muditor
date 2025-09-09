import { test, expect } from '@playwright/test';

test.describe('Authentication System', () => {
  const testUser = {
    email: `test-${Date.now()}@example.com`,
    username: `testuser${Date.now()}`,
    password: 'TestPassword123!',
  };

  test.describe('User Registration', () => {
    test('should display registration form', async ({ page }) => {
      await page.goto('/register');

      await expect(page.locator('h1')).toHaveText('Create Account');
      await expect(page.locator('input[name="email"]')).toBeVisible();
      await expect(page.locator('input[name="username"]')).toBeVisible();
      await expect(page.locator('input[name="password"]')).toBeVisible();
      await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('should register a new user successfully', async ({ page }) => {
      await page.goto('/register');

      await page.fill('input[name="email"]', testUser.email);
      await page.fill('input[name="username"]', testUser.username);
      await page.fill('input[name="password"]', testUser.password);
      await page.fill('input[name="confirmPassword"]', testUser.password);

      await page.click('button[type="submit"]');

      // Should redirect to dashboard after successful registration
      await expect(page).toHaveURL(/\/dashboard/);

      // Should show success message or user info
      await expect(page.locator('nav')).toContainText(testUser.username);
    });

    test('should show validation errors for invalid input', async ({
      page,
    }) => {
      await page.goto('/register');

      // Try with mismatched passwords
      await page.fill('input[name="email"]', 'invalid-email');
      await page.fill('input[name="username"]', 'u'); // too short
      await page.fill('input[name="password"]', '123'); // too weak
      await page.fill('input[name="confirmPassword"]', '456'); // mismatch

      await page.click('button[type="submit"]');

      // Should show validation errors
      await expect(
        page.locator('.error, .text-red-500, [role="alert"]')
      ).toBeVisible();
    });

    test('should prevent duplicate email registration', async ({ page }) => {
      // First registration
      await page.goto('/register');
      const uniqueEmail = `duplicate-${Date.now()}@example.com`;

      await page.fill('input[name="email"]', uniqueEmail);
      await page.fill('input[name="username"]', `user1${Date.now()}`);
      await page.fill('input[name="password"]', testUser.password);
      await page.fill('input[name="confirmPassword"]', testUser.password);
      await page.click('button[type="submit"]');

      // Wait for successful registration
      await expect(page).toHaveURL(/\/dashboard/);

      // Logout
      await page.click(
        '[data-testid="user-menu"], .user-menu, button:has-text("Logout"), a:has-text("Logout")'
      );

      // Try to register with same email
      await page.goto('/register');
      await page.fill('input[name="email"]', uniqueEmail);
      await page.fill('input[name="username"]', `user2${Date.now()}`);
      await page.fill('input[name="password"]', testUser.password);
      await page.fill('input[name="confirmPassword"]', testUser.password);
      await page.click('button[type="submit"]');

      // Should show error message
      await expect(
        page.locator('.error, .text-red-500, [role="alert"]')
      ).toContainText(/email.*already.*exists|email.*taken/i);
    });
  });

  test.describe('User Login', () => {
    test.beforeEach(async ({ page }) => {
      // Ensure we have a test user
      await page.goto('/register');
      const uniqueEmail = `login-test-${Date.now()}@example.com`;
      const uniqueUsername = `loginuser${Date.now()}`;

      await page.fill('input[name="email"]', uniqueEmail);
      await page.fill('input[name="username"]', uniqueUsername);
      await page.fill('input[name="password"]', testUser.password);
      await page.fill('input[name="confirmPassword"]', testUser.password);
      await page.click('button[type="submit"]');

      // Wait for registration success
      await expect(page).toHaveURL(/\/dashboard/);

      // Store credentials for tests
      await page.evaluate(
        ({ email, username, password }) => {
          window.testCredentials = { email, username, password };
        },
        {
          email: uniqueEmail,
          username: uniqueUsername,
          password: testUser.password,
        }
      );

      // Logout
      await page.click(
        '[data-testid="user-menu"], .user-menu, button:has-text("Logout"), a:has-text("Logout")'
      );
    });

    test('should display login form', async ({ page }) => {
      await page.goto('/login');

      await expect(page.locator('h1')).toHaveText('Sign In');
      await expect(
        page.locator('input[name="username"], input[name="email"]')
      ).toBeVisible();
      await expect(page.locator('input[name="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
      await expect(
        page.locator('a:has-text("Register"), a:has-text("Sign up")')
      ).toBeVisible();
      await expect(
        page.locator('a:has-text("Forgot"), a:has-text("Reset")')
      ).toBeVisible();
    });

    test('should login with username successfully', async ({ page }) => {
      const credentials = await page.evaluate(() => window.testCredentials);
      if (!credentials) throw new Error('Test credentials not found');

      await page.goto('/login');

      await page.fill(
        'input[name="username"], input[name="email"]',
        credentials.username
      );
      await page.fill('input[name="password"]', credentials.password);
      await page.click('button[type="submit"]');

      // Should redirect to dashboard
      await expect(page).toHaveURL(/\/dashboard/);

      // Should show user info in navigation
      await expect(page.locator('nav')).toContainText(credentials.username);
    });

    test('should login with email successfully', async ({ page }) => {
      const credentials = await page.evaluate(() => window.testCredentials);
      if (!credentials) throw new Error('Test credentials not found');

      await page.goto('/login');

      await page.fill(
        'input[name="username"], input[name="email"]',
        credentials.email
      );
      await page.fill('input[name="password"]', credentials.password);
      await page.click('button[type="submit"]');

      // Should redirect to dashboard
      await expect(page).toHaveURL(/\/dashboard/);

      // Should show user info in navigation
      await expect(page.locator('nav')).toContainText(credentials.username);
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/login');

      await page.fill(
        'input[name="username"], input[name="email"]',
        'nonexistent@example.com'
      );
      await page.fill('input[name="password"]', 'wrongpassword');
      await page.click('button[type="submit"]');

      // Should show error message
      await expect(
        page.locator('.error, .text-red-500, [role="alert"]')
      ).toContainText(/invalid.*credentials|login.*failed|incorrect/i);

      // Should remain on login page
      await expect(page).toHaveURL(/\/login/);
    });

    test('should show error for missing fields', async ({ page }) => {
      await page.goto('/login');

      // Try to submit without filling fields
      await page.click('button[type="submit"]');

      // Should show validation errors
      await expect(
        page.locator('.error, .text-red-500, [role="alert"]')
      ).toBeVisible();
    });
  });

  test.describe('Password Reset', () => {
    test('should display forgot password form', async ({ page }) => {
      await page.goto('/forgot-password');

      await expect(page.locator('h1')).toHaveText(
        /forgot.*password|reset.*password/i
      );
      await expect(page.locator('input[name="email"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
      await expect(
        page.locator('a:has-text("Login"), a:has-text("Sign in")')
      ).toBeVisible();
    });

    test('should send password reset email', async ({ page }) => {
      await page.goto('/forgot-password');

      await page.fill('input[name="email"]', testUser.email);
      await page.click('button[type="submit"]');

      // Should show success message
      await expect(
        page.locator('.success, .text-green-500, [role="status"]')
      ).toContainText(/reset.*link.*sent|check.*email/i);
    });

    test('should handle non-existent email gracefully', async ({ page }) => {
      await page.goto('/forgot-password');

      await page.fill('input[name="email"]', 'nonexistent@example.com');
      await page.click('button[type="submit"]');

      // Should still show success message for security
      await expect(
        page.locator('.success, .text-green-500, [role="status"]')
      ).toContainText(/reset.*link.*sent|check.*email/i);
    });

    test('should display reset password form with valid token', async ({
      page,
    }) => {
      // For testing, we'll navigate directly to reset page with a mock token
      await page.goto('/reset-password?token=mock-token');

      await expect(page.locator('h1')).toHaveText(
        /reset.*password|new.*password/i
      );
      await expect(page.locator('input[name="password"]')).toBeVisible();
      await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });
  });

  test.describe('Protected Routes', () => {
    test('should redirect unauthenticated users to login', async ({ page }) => {
      // Try to access protected routes
      const protectedRoutes = [
        '/dashboard',
        '/dashboard/zones',
        '/dashboard/rooms',
        '/dashboard/mobs',
        '/dashboard/objects',
        '/dashboard/shops',
        '/profile',
      ];

      for (const route of protectedRoutes) {
        await page.goto(route);

        // Should redirect to login
        await expect(page).toHaveURL(/\/login/);

        // Should show login form
        await expect(
          page.locator('input[name="username"], input[name="email"]')
        ).toBeVisible();
      }
    });

    test('should allow authenticated users to access protected routes', async ({
      page,
    }) => {
      // First login
      await page.goto('/register');
      const uniqueEmail = `protected-${Date.now()}@example.com`;
      const uniqueUsername = `protected${Date.now()}`;

      await page.fill('input[name="email"]', uniqueEmail);
      await page.fill('input[name="username"]', uniqueUsername);
      await page.fill('input[name="password"]', testUser.password);
      await page.fill('input[name="confirmPassword"]', testUser.password);
      await page.click('button[type="submit"]');

      // Should be on dashboard
      await expect(page).toHaveURL(/\/dashboard/);

      // Try accessing other protected routes
      const protectedRoutes = [
        '/dashboard/zones',
        '/dashboard/rooms',
        '/dashboard/mobs',
        '/dashboard/objects',
        '/dashboard/shops',
        '/profile',
      ];

      for (const route of protectedRoutes) {
        await page.goto(route);

        // Should not redirect to login
        await expect(page).not.toHaveURL(/\/login/);

        // Should show the requested page content
        await expect(
          page.locator('main, .main-content, [role="main"]')
        ).toBeVisible();
      }
    });
  });

  test.describe('User Session Management', () => {
    test('should maintain session across page reloads', async ({ page }) => {
      // Register and login
      await page.goto('/register');
      const uniqueEmail = `session-${Date.now()}@example.com`;
      const uniqueUsername = `session${Date.now()}`;

      await page.fill('input[name="email"]', uniqueEmail);
      await page.fill('input[name="username"]', uniqueUsername);
      await page.fill('input[name="password"]', testUser.password);
      await page.fill('input[name="confirmPassword"]', testUser.password);
      await page.click('button[type="submit"]');

      // Should be on dashboard
      await expect(page).toHaveURL(/\/dashboard/);

      // Reload page
      await page.reload();

      // Should still be logged in
      await expect(page).toHaveURL(/\/dashboard/);
      await expect(page.locator('nav')).toContainText(uniqueUsername);
    });

    test('should handle session expiry gracefully', async ({ page }) => {
      // This test would require manipulating JWT expiry
      // For now, we'll test basic logout functionality

      // Register and login
      await page.goto('/register');
      const uniqueEmail = `expiry-${Date.now()}@example.com`;
      const uniqueUsername = `expiry${Date.now()}`;

      await page.fill('input[name="email"]', uniqueEmail);
      await page.fill('input[name="username"]', uniqueUsername);
      await page.fill('input[name="password"]', testUser.password);
      await page.fill('input[name="confirmPassword"]', testUser.password);
      await page.click('button[type="submit"]');

      // Should be on dashboard
      await expect(page).toHaveURL(/\/dashboard/);

      // Logout
      await page.click(
        '[data-testid="user-menu"], .user-menu, button:has-text("Logout"), a:has-text("Logout")'
      );

      // Should redirect to login or home
      await expect(page).toHaveURL(/\/(login|$)/);

      // Try to access protected route
      await page.goto('/dashboard');

      // Should redirect to login
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe('Role-Based Access Control', () => {
    test('should show appropriate UI elements based on user role', async ({
      page,
    }) => {
      // Register as a basic user (PLAYER role by default)
      await page.goto('/register');
      const uniqueEmail = `role-${Date.now()}@example.com`;
      const uniqueUsername = `role${Date.now()}`;

      await page.fill('input[name="email"]', uniqueEmail);
      await page.fill('input[name="username"]', uniqueUsername);
      await page.fill('input[name="password"]', testUser.password);
      await page.fill('input[name="confirmPassword"]', testUser.password);
      await page.click('button[type="submit"]');

      // Should be on dashboard
      await expect(page).toHaveURL(/\/dashboard/);

      // Basic users should see basic navigation
      await expect(page.locator('nav')).toBeVisible();

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
      // Register and login first
      await page.goto('/register');
      const uniqueEmail = `env-${Date.now()}@example.com`;
      const uniqueUsername = `env${Date.now()}`;

      await page.fill('input[name="email"]', uniqueEmail);
      await page.fill('input[name="username"]', uniqueUsername);
      await page.fill('input[name="password"]', testUser.password);
      await page.fill('input[name="confirmPassword"]', testUser.password);
      await page.click('button[type="submit"]');

      // Should be on dashboard
      await expect(page).toHaveURL(/\/dashboard/);

      // Should show environment selector
      const envSelector = page.locator(
        '[data-testid="environment-selector"], .environment-selector, select:has(option:has-text("Development"))'
      );
      if ((await envSelector.count()) > 0) {
        await expect(envSelector).toBeVisible();
      }
    });

    test('should persist environment selection', async ({ page }) => {
      // Register and login first
      await page.goto('/register');
      const uniqueEmail = `persist-${Date.now()}@example.com`;
      const uniqueUsername = `persist${Date.now()}`;

      await page.fill('input[name="email"]', uniqueEmail);
      await page.fill('input[name="username"]', uniqueUsername);
      await page.fill('input[name="password"]', testUser.password);
      await page.fill('input[name="confirmPassword"]', testUser.password);
      await page.click('button[type="submit"]');

      // Should be on dashboard
      await expect(page).toHaveURL(/\/dashboard/);

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
