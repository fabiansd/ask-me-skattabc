/** @type {import('jest').Config} */
module.exports = {
  displayName: 'Integration Tests',
  testMatch: ['<rootDir>/tests/integration/**/*.test.ts'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/integration/setup.ts'],
  testTimeout: 30000,
  collectCoverageFrom: ['<rootDir>/app/api/**/*.ts', '<rootDir>/app/src/**/*.ts', '!**/*.d.ts'],
  testEnvironmentOptions: {
    NODE_ENV: 'test',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
};
