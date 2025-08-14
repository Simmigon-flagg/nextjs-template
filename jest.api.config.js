module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.api.js'],
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest', // handles js, jsx, ts, tsx
  },
  testMatch: ['**/__tests__/api/**/*.test.{js,ts}'],
  transformIgnorePatterns: [
    '/node_modules/(?!(bson|mongodb|mongoose)/)', // transpile ESM packages
  ],
};
