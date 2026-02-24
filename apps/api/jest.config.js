export default {
  displayName: 'api',
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testMatch: ['<rootDir>/src/**/*.(test|spec).ts'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.test.json',
      },
    ],
  },
  collectCoverageFrom: [
    '<rootDir>/src/**/*.(t|j)s',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/dist/**',
  ],
  setupFiles: ['<rootDir>/test/jest-setup.ts'],
  coverageDirectory: '<rootDir>/coverage',
  moduleNameMapper: {
    '^@muditor/db$': '<rootDir>/test/db-test-stub.ts',
    '^@muditor/(.*)$': '<rootDir>/../../packages/$1/src',
    '^~/(.*)$': '<rootDir>/src/$1',
  },
  testTimeout: 30000,
};
