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

// Canvas 2D context mock — JSDOM does not implement the Canvas API.
// We provide a lightweight mock so CanvasRenderer and GameLoop tests work without
// a headless browser. All drawing calls are no-ops; state (fillStyle, globalAlpha,
// strokeStyle, imageSmoothingEnabled) is tracked so tests can assert on them.
(function mockCanvas() {
  function makeCtx() {
    const ctx = {
      fillStyle: '',
      strokeStyle: '',
      globalAlpha: 1.0,
      lineWidth: 1,
      imageSmoothingEnabled: true,
      fillRect: jest.fn(),
      strokeRect: jest.fn(),
      clearRect: jest.fn(),
      beginPath: jest.fn(),
      closePath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      stroke: jest.fn(),
      fill: jest.fn(),
      arc: jest.fn(),
      scale: jest.fn(),
      save: jest.fn(),
      restore: jest.fn(),
      translate: jest.fn(),
      rotate: jest.fn(),
      drawImage: jest.fn(),
      createLinearGradient: jest.fn(() => ({ addColorStop: jest.fn() })),
      measureText: jest.fn(() => ({ width: 0 })),
      fillText: jest.fn(),
      strokeText: jest.fn(),
      setTransform: jest.fn(),
      resetTransform: jest.fn(),
      getImageData: jest.fn(() => ({ data: new Uint8ClampedArray(4) })),
      putImageData: jest.fn(),
      createImageData: jest.fn(() => ({ data: new Uint8ClampedArray(4) })),
      roundRect: jest.fn(),
    };
    return ctx;
  }

  // Per-canvas instance context so spies on one canvas don't bleed into another
  const originalGetContext = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function(type) {
    if (type === '2d') {
      if (!this.__mockCtx) {
        this.__mockCtx = makeCtx();
      }
      return this.__mockCtx;
    }
    return originalGetContext.call(this, type);
  };
})();

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
