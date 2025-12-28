import type { FullConfig } from '@playwright/test';

async function globalSetup(_config: FullConfig) {
  console.log('🔧 Starting global E2E test setup...');

  // Ensure database and API are ready
  await waitForServer('http://localhost:3001/graphql', 30000);
  await waitForServer('http://localhost:3000', 30000);

  console.log('✅ E2E test setup complete');
}

async function waitForServer(
  url: string,
  timeout: number = 30000
): Promise<void> {
  const start = Date.now();

  while (Date.now() - start < timeout) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        console.log(`✅ Server ready at ${url}`);
        return;
      }
    } catch (_error) {
      // Server not ready, continue waiting
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  throw new Error(`Server at ${url} not ready after ${timeout}ms`);
}

export default globalSetup;
