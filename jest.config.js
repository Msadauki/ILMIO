module.exports = {
  testEnvironment: 'node', // Test in a Node.js environment
  verbose: true,           // Shows each test case result
  setupFiles: ['<rootDir>/test/setup.js'], // For mocking db connection and other setup
};