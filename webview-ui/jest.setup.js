/**
 * Jest setup file for webview-ui React testing
 * Configures the test environment with necessary globals and test utilities
 */

require('@testing-library/jest-dom');

// Mock VS Code API if needed in tests
global.vscode = {
  postMessage: jest.fn(),
  setState: jest.fn(),
  getState: jest.fn(),
};

// Suppress console warnings in tests unless explicitly needed
const originalWarn = console.warn;
const originalError = console.error;

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation((...args) => {
    // Filter out expected warnings
    if (
      args[0]?.includes?.('ReactDOM.render') ||
      args[0]?.includes?.('deprecated')
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  });

  jest.spyOn(console, 'error').mockImplementation((...args) => {
    // Filter out expected errors
    if (args[0]?.includes?.('Not implemented')) {
      return;
    }
    originalError.call(console, ...args);
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});
