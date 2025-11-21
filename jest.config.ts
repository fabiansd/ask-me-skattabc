module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: [
    '**/tests/src/**/*.test.ts',
    '**/tests/src/**/*.test.tsx',
    '**/tests/src/**/*.test.js',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/tests/integration/'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react-jsx',
        },
      },
    ],
  },
};
