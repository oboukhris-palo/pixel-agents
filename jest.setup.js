/**
 * Jest Setup File
 * Runs after Jest is initialized but before test execution
 */

// Add custom Jest matchers from jest-dom
try {
  require('@testing-library/jest-dom');
} catch (e) {
  // jest-dom is optional, skip if not installed
}

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
