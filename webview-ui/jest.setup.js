/**
 * Jest setup file for webview-ui React testing
 * Configures the test environment with necessary globals and test utilities
 * 
 * NOTE: This file runs via setupFilesAfterEnv so Jest globals (expect, etc.) are available
 */

// Import jest-dom matchers for better assertions
require('@testing-library/jest-dom');

// VS Code WebView global — required by vscodeApi.ts which calls acquireVsCodeApi()
// at module load time. Jest's jsdom environment does not provide this global.
// This must be defined before any imports of vscodeApi.ts
if (!global.acquireVsCodeApi) {
  global.acquireVsCodeApi = () => ({
    postMessage: jest.fn(),
    getState: jest.fn(),
    setState: jest.fn()
  });
}

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
