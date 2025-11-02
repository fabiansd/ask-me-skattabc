/** @type {import('jest').Config} */
module.exports = {
  displayName: 'Integration Tests',
  rootDir: process.cwd(),
  testMatch: ['**/tests/integration/**/*.test.ts'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  testEnvironment: 'node',
  setupFilesAfterEnv: [process.cwd() + '/tests/integration/setup.ts'],
  testTimeout: 30000,
  collectCoverageFrom: ['app/api/**/*.ts', 'app/src/**/*.ts', '!**/*.d.ts'],
  testEnvironmentOptions: {
    NODE_ENV: 'test',
  },
  moduleNameMapper: {
    '^@/(.*)$': process.cwd() + '/$1',
  },
};
