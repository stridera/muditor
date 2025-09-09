// Root Jest configuration aggregating individual project configs.
// Currently only the API (NestJS) service uses Jest; add additional package/app
// paths to the `projects` array as unit test setups are introduced elsewhere.
/** @type {import('jest').Config} */
const config = {
  projects: ['<rootDir>/apps/api'],
  // Fail fast on deprecated / incorrect usage.
  notify: false,
  testLocationInResults: true,
  // Helps VS Code Jest extension map workspaces.
  rootDir: '.',
};

export default config;
