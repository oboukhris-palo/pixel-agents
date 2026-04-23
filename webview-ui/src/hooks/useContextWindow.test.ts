import { renderHook, act } from '@testing-library/react';
import { useContextWindow } from './useContextWindow';
import type { TokenUsage } from '../../../src/contextTypes';

// Simulate VS Code webview message API
const mockAddEventListener = jest.fn();
const mockRemoveEventListener = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  Object.defineProperty(window, 'addEventListener', {
    value: mockAddEventListener,
    writable: true,
  });
  Object.defineProperty(window, 'removeEventListener', {
    value: mockRemoveEventListener,
    writable: true,
  });
});

const sampleUsage: TokenUsage = {
  total: 128000,
  used: 64000,
  percentage: 50,
  breakdown: { githubCode: 30000, projectCode: 24000, chatHistory: 10000 },
  threshold: 'safe',
};

describe('useContextWindow', () => {
  it('starts with null tokenUsage and loading true', () => {
    const { result } = renderHook(() => useContextWindow());

    expect(result.current.tokenUsage).toBeNull();
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('subscribes to message events on mount', () => {
    renderHook(() => useContextWindow());
    expect(mockAddEventListener).toHaveBeenCalledWith('message', expect.any(Function));
  });

  it('unsubscribes on unmount', () => {
    const { unmount } = renderHook(() => useContextWindow());
    unmount();
    expect(mockRemoveEventListener).toHaveBeenCalledWith('message', expect.any(Function));
  });

  it('updates tokenUsage state when a valid message is received', () => {
    let capturedHandler: ((e: MessageEvent) => void) | null = null;
    mockAddEventListener.mockImplementation((_event: string, handler: (e: MessageEvent) => void) => {
      capturedHandler = handler;
    });

    const { result } = renderHook(() => useContextWindow());

    act(() => {
      capturedHandler!({
        data: {
          type: 'context.window.update',
          data: {
            tokenUsage: sampleUsage,
            timestamp: new Date().toISOString(),
            warnings: [],
          },
        },
      } as MessageEvent);
    });

    expect(result.current.tokenUsage).toEqual(sampleUsage);
    expect(result.current.loading).toBe(false);
  });

  it('ignores messages with unknown type', () => {
    let capturedHandler: ((e: MessageEvent) => void) | null = null;
    mockAddEventListener.mockImplementation((_event: string, handler: (e: MessageEvent) => void) => {
      capturedHandler = handler;
    });

    const { result } = renderHook(() => useContextWindow());

    act(() => {
      capturedHandler!({ data: { type: 'other.message' } } as MessageEvent);
    });

    expect(result.current.tokenUsage).toBeNull();
    expect(result.current.loading).toBe(true);
  });
});
