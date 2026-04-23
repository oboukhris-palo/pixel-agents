/**
 * Layer 3 RED: Failing tests for DocumentWatcherMessageHandler
 * Story: US-001-003 - Real-Time Document Monitoring Engine
 * BDD: AC2 (latency), AC10 (integration with existing components)
 */

import { DocumentWatcherMessageHandler } from '../documentWatcherMessageHandler';
import { DocumentWatcherService } from '../documentWatcherService';
import { FileChangeEvent } from '../documentChangeTypes';
import type { DocumentChange, ParsedMetrics } from '../documentChangeTypes';
import type { DocumentWatcherMessage } from '../documentWatcherMessageHandler';

// ── Mock webview ──────────────────────────────────────────────────────────────
function makeWebviewMock(): { postMessage: jest.Mock; messages: unknown[] } {
  const messages: unknown[] = [];
  return {
    postMessage: jest.fn((msg) => messages.push(msg)),
    messages,
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function makeChange(
  filePath: string,
  changeType: FileChangeEvent = FileChangeEvent.Modified,
): DocumentChange {
  return {
    path: filePath,
    changeType,
    timestamp: Date.now(),
    isMarkdown: filePath.endsWith('.md'),
    isYaml: filePath.endsWith('.yml'),
    isFeature: filePath.endsWith('.feature'),
  };
}

describe('DocumentWatcherMessageHandler — constructor', () => {
  it('creates an instance without throwing', () => {
    const service = new DocumentWatcherService('/workspace');
    const webview = makeWebviewMock();
    const handler = new DocumentWatcherMessageHandler(service, webview);
    expect(handler).toBeDefined();
  });
});

describe('DocumentWatcherMessageHandler — message shape (AC2)', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('broadcasts a document-changed message when changes occur', (done) => {
    const service = new DocumentWatcherService('/workspace');
    const webview = makeWebviewMock();
    const handler = new DocumentWatcherMessageHandler(service, webview);

    handler.start();
    service.start();

    service.simulateChange(makeChange('/docs/01-requirements/user-stories.md'));
    jest.advanceTimersByTime(350);

    expect(webview.postMessage).toHaveBeenCalledTimes(1);
    const msg = webview.messages[0] as DocumentWatcherMessage;
    expect(msg.type).toBe('document-changed');
    expect(Array.isArray(msg.changes)).toBe(true);
    expect(msg.changes.length).toBe(1);
    expect(msg.timestamp).toBeGreaterThan(0);

    handler.stop();
    service.stop();
    done();
  });

  it('includes ParsedMetrics in the message payload', (done) => {
    const service = new DocumentWatcherService('/workspace');
    const webview = makeWebviewMock();
    const handler = new DocumentWatcherMessageHandler(service, webview);

    handler.start();
    service.start();

    service.simulateChange(makeChange('/docs/05-implementation/user-stories.md'));
    jest.advanceTimersByTime(350);

    const msg = webview.messages[0] as DocumentWatcherMessage;
    expect(msg.metrics).toBeDefined();
    expect(typeof msg.metrics.storyCount).toBe('number');
    expect(typeof msg.metrics.completionPercent).toBe('number');

    handler.stop();
    service.stop();
    done();
  });
});

describe('DocumentWatcherMessageHandler — error resilience', () => {
  it('does not crash when webview postMessage throws', () => {
    const service = new DocumentWatcherService('/workspace');
    const webview = {
      postMessage: jest.fn(() => { throw new Error('Webview unavailable'); }),
      messages: [],
    };

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const handler = new DocumentWatcherMessageHandler(service, webview);

    handler.start();
    service.start();

    jest.useFakeTimers();
    service.simulateChange(makeChange('/docs/file.md'));
    jest.advanceTimersByTime(350);
    jest.useRealTimers();

    expect(() => handler.stop()).not.toThrow();
    consoleSpy.mockRestore();
    service.stop();
  });

  it('uses OutputChannel for logging when provided', () => {
    const mockOutputChannel = {
      appendLine: jest.fn(),
    };
    
    const service = new DocumentWatcherService('/workspace');
    const webview = {
      postMessage: jest.fn(() => { throw new Error('Webview error'); }),
      messages: [],
    };

    const handler = new DocumentWatcherMessageHandler(service, webview, mockOutputChannel);
    
    handler.start();
    service.start();

    jest.useFakeTimers();
    service.simulateChange(makeChange('/docs/file.md'));
    jest.advanceTimersByTime(350);
    jest.useRealTimers();
    
    expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(
      expect.stringContaining('[DocumentWatcherMessageHandler] Failed to post message')
    );

    handler.stop();
    service.stop();
  });
});

describe('DocumentWatcherMessageHandler — start / stop', () => {
  it('stop() is safe to call before start()', () => {
    const service = new DocumentWatcherService('/workspace');
    const webview = makeWebviewMock();
    const handler = new DocumentWatcherMessageHandler(service, webview);
    expect(() => handler.stop()).not.toThrow();
  });

  it('does not broadcast after stop()', () => {
    const service = new DocumentWatcherService('/workspace');
    const webview = makeWebviewMock();
    const handler = new DocumentWatcherMessageHandler(service, webview);

    handler.start();
    service.start();
    handler.stop();

    jest.useFakeTimers();
    service.simulateChange(makeChange('/docs/file.md'));
    jest.advanceTimersByTime(350);
    jest.useRealTimers();

    expect(webview.postMessage).not.toHaveBeenCalled();
    service.stop();
  });
});

describe('DocumentWatcherMessage — type validation', () => {
  it('message type literal is exactly "document-changed"', (done) => {
    const service = new DocumentWatcherService('/workspace');
    const webview = makeWebviewMock();
    const handler = new DocumentWatcherMessageHandler(service, webview);

    handler.start();
    service.start();

    jest.useFakeTimers();
    service.simulateChange(makeChange('/docs/test.md'));
    jest.advanceTimersByTime(350);
    jest.useRealTimers();

    const msg = webview.messages[0] as DocumentWatcherMessage;
    expect(msg.type).toStrictEqual('document-changed');
    expect(msg.debounceDelayMs).toBe(300);

    handler.stop();
    service.stop();
    done();
  });
});
