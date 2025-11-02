module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: ['**/tests/src/**/*.test.ts', '**/tests/src/**/*.test.js'],
  testPathIgnorePatterns: ['/node_modules/', '/tests/integration/'],
};
