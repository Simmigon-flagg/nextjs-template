module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.frontend.js'],
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node'],

  moduleNameMapper: {
    '^@/components/(.*)$': '<rootDir>/app/components/$1',
    '\\.(css|scss|sass)$': 'identity-obj-proxy',
  },

  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },

  testMatch: ['**/__tests__/frontend/**/*.test.{js,jsx,ts,tsx}'],
};
