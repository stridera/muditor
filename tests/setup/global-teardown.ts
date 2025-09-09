import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global E2E test teardown...');

  // Clean up any test data if needed
  // For now, we'll let the database clean itself up naturally

  console.log('✅ E2E test teardown complete');
}

export default globalTeardown;
