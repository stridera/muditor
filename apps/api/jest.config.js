module.exports = {
  displayName: 'api',
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'json', 'ts'],
  // Keep rootDir at project root so coverage paths & mappers resolve cleanly.
  rootDir: '.',
  testMatch: ['<rootDir>/src/**/*.(test|spec).ts'],
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '<rootDir>/src/**/*.(t|j)s',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/dist/**',
  ],
  coverageDirectory: '<rootDir>/coverage',
  moduleNameMapper: {
    '^@muditor/(.*)$': '<rootDir>/../../packages/$1/src',
  },
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  // For quicker feedback loops in editors.
  testTimeout: 30000,
};
