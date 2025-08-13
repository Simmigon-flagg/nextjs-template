const nextJest = require('next/jest');
const path = require('path');
const dotenv = require('dotenv');

// Load env variables for test environment
dotenv.config({ path: './.env.test' });

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  testEnvironment: 'node',
  moduleDirectories: ['node_modules', '<rootDir>/'],
  testMatch: ['**/?(*.)+(test).[jt]s?(x)'],
  moduleFileExtensions: ['js', 'mjs', 'cjs', 'jsx', 'ts', 'tsx', 'json', 'node'],
  globalSetup: './jest-mongodb-setup.js',
  globalTeardown: './jest-mongodb-teardown.js',
  transformIgnorePatterns: ["/node_modules/(?!mongoose)/"]


};


module.exports = createJestConfig(customJestConfig);
