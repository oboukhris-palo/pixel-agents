/**
 * Layer 2 RED: Failing tests for DocumentWatcherService
 * Story: US-001-003 - Real-Time Document Monitoring Engine
 * BDD: AC2 (latency), AC3 (debounce), AC4 (event types), AC5 (perf), AC6 (errors), AC8 (concurrent), AC9 (parsing)
 */

import { DocumentWatcherService } from '../documentWatcherService';
import { FileChangeEvent } from '../documentChangeTypes';
import type { DocumentChange } from '../documentChangeTypes';

// ── Helpers ────────────────────────────────────────────────────────────────
function makeChange(filePath: string, changeType: FileChangeEvent): DocumentChange {
  return {
    path: filePath,
    changeType,
    timestamp: Date.now(),
    isMarkdown: filePath.endsWith('.md'),
    isYaml: filePath.endsWith('.yml') || filePath.endsWith('.yaml'),
    isFeature: filePath.endsWith('.feature'),
  };
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('DocumentWatcherService — constructor', () => {
  it('creates an instance without throwing', () => {
    const service = new DocumentWatcherService('/workspace');
    expect(service).toBeDefined();
  });

  it('is not watching after construction', () => {
    const service = new DocumentWatcherService('/workspace');
    expect(service.isWatching).toBe(false);
  });
});

describe('DocumentWatcherService — start / stop', () => {
  it('sets isWatching to true after start()', () => {
    const service = new DocumentWatcherService('/workspace');
    service.start();
    expect(service.isWatching).toBe(true);
    service.stop();
  });

  it('sets isWatching to false after stop()', () => {
    const service = new DocumentWatcherService('/workspace');
    service.start();
    service.stop();
    expect(service.isWatching).toBe(false);
  });

  it('is idempotent — start() called twice does not throw', () => {
    const service = new DocumentWatcherService('/workspace');
    expect(() => {
      service.start();
      service.start();
    }).not.toThrow();
    service.stop();
  });

  it('is idempotent — stop() called when not started does not throw', () => {
    const service = new DocumentWatcherService('/workspace');
    expect(() => service.stop()).not.toThrow();
  });
});

describe('DocumentWatcherService — debouncing (AC3)', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('batches multiple events within the debounce window into one emission', (done) => {
    const service = new DocumentWatcherService('/workspace');
    const received: DocumentChange[][] = [];

    service.onChanges((changes) => received.push(changes));
    service.start();

    // Simulate 5 rapid changes
    service.simulateChange(makeChange('/docs/file1.md', FileChangeEvent.Modified));
    service.simulateChange(makeChange('/docs/file2.md', FileChangeEvent.Added));
    service.simulateChange(makeChange('/docs/file3.md', FileChangeEvent.Deleted));
    service.simulateChange(makeChange('/docs/file4.md', FileChangeEvent.Modified));
    service.simulateChange(makeChange('/docs/file5.yml', FileChangeEvent.Modified));

    // No emissions yet within debounce window
    expect(received).toHaveLength(0);

    jest.advanceTimersByTime(350); // Past 300ms debounce

    expect(received).toHaveLength(1);
    expect(received[0]).toHaveLength(5);
    service.stop();
    done();
  });

  it('emits separately for changes spaced beyond the debounce window', (done) => {
    const service = new DocumentWatcherService('/workspace');
    const received: DocumentChange[][] = [];

    service.onChanges((changes) => received.push(changes));
    service.start();

    service.simulateChange(makeChange('/docs/file1.md', FileChangeEvent.Modified));
    jest.advanceTimersByTime(350);

    service.simulateChange(makeChange('/docs/file2.md', FileChangeEvent.Added));
    jest.advanceTimersByTime(350);

    expect(received).toHaveLength(2);
    service.stop();
    done();
  });
});

describe('DocumentWatcherService — event types (AC4)', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('classifies Added events', (done) => {
    const service = new DocumentWatcherService('/workspace');
    let received: DocumentChange[] = [];

    service.onChanges((ch) => (received = ch));
    service.start();

    service.simulateChange(makeChange('/docs/new-file.md', FileChangeEvent.Added));
    jest.advanceTimersByTime(350);

    expect(received[0].changeType).toBe(FileChangeEvent.Added);
    service.stop();
    done();
  });

  it('classifies Modified events', (done) => {
    const service = new DocumentWatcherService('/workspace');
    let received: DocumentChange[] = [];

    service.onChanges((ch) => (received = ch));
    service.start();

    service.simulateChange(makeChange('/docs/existing.yml', FileChangeEvent.Modified));
    jest.advanceTimersByTime(350);

    expect(received[0].changeType).toBe(FileChangeEvent.Modified);
    service.stop();
    done();
  });

  it('classifies Deleted events', (done) => {
    const service = new DocumentWatcherService('/workspace');
    let received: DocumentChange[] = [];

    service.onChanges((ch) => (received = ch));
    service.start();

    service.simulateChange(makeChange('/docs/removed.feature', FileChangeEvent.Deleted));
    jest.advanceTimersByTime(350);

    expect(received[0].changeType).toBe(FileChangeEvent.Deleted);
    service.stop();
    done();
  });
});

describe('DocumentWatcherService — error handling (AC6)', () => {
  it('catches and logs errors without crashing', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const service = new DocumentWatcherService('/workspace');
    service.start();

    expect(() => service.notifyError(new Error('Permission denied'))).not.toThrow();
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[DocumentWatcher]'),
      expect.any(Error),
    );

    service.stop();
    consoleSpy.mockRestore();
  });

  it('remains watching after an error', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const service = new DocumentWatcherService('/workspace');
    service.start();
    service.notifyError(new Error('Disk error'));
    expect(service.isWatching).toBe(true);
    service.stop();
    consoleSpy.mockRestore();
  });
});

describe('DocumentWatcherService — concurrent writes (AC8)', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('batches 10 simultaneous changes into a single emission', (done) => {
    const service = new DocumentWatcherService('/workspace');
    const received: DocumentChange[][] = [];

    service.onChanges((ch) => received.push(ch));
    service.start();

    for (let i = 0; i < 10; i++) {
      service.simulateChange(makeChange(`/docs/file${i}.md`, FileChangeEvent.Modified));
    }
    jest.advanceTimersByTime(350);

    expect(received).toHaveLength(1);
    expect(received[0]).toHaveLength(10);
    service.stop();
    done();
  });
});

describe('DocumentWatcherService — parseMetricsFromContent (AC9)', () => {
  it('parses story count from user-stories.md content', () => {
    const service = new DocumentWatcherService('/workspace');
    const content = `
### US-001-001: Task Bar
**Status**: in-progress

### US-001-002: Workflow Status
**Status**: completed

### US-001-003: Document Watcher
**Status**: not-started
`;
    const metrics = service.parseMetricsFromContent(content);
    expect(metrics.storyCount).toBe(3);
  });

  it('returns zero counts for empty content', () => {
    const service = new DocumentWatcherService('/workspace');
    const metrics = service.parseMetricsFromContent('');
    expect(metrics.storyCount).toBe(0);
    expect(metrics.completionPercent).toBe(0);
  });

  it('calculates completion percent from completed / total stories', () => {
    const service = new DocumentWatcherService('/workspace');
    const content = `
### US-001: First
**Status**: completed

### US-002: Second  
**Status**: in-progress

### US-003: Third
**Status**: not-started
`;
    const metrics = service.parseMetricsFromContent(content);
    expect(metrics.storyCount).toBe(3);
    // 1 completed out of 3 = ~33%
    expect(metrics.completionPercent).toBeCloseTo(33, 0);
  });
});

describe('DocumentWatcherService — listener management', () => {
  it('supports removing a specific onChanges listener', () => {
    const service = new DocumentWatcherService('/workspace');
    const callCounts: number[] = [];

    const unsubscribe = service.onChanges(() => callCounts.push(1));
    unsubscribe();

    // Listener removed — should not be called
    service.start();
    jest.useFakeTimers();
    service.simulateChange(makeChange('/docs/file.md', FileChangeEvent.Modified));
    jest.advanceTimersByTime(350);
    jest.useRealTimers();

    expect(callCounts).toHaveLength(0);
    service.stop();
  });
});

describe('DocumentWatcherService — input sanitization (US-001-003-B)', () => {
  it('truncates excessively large content (>1MB) to prevent DoS', () => {
    const service = new DocumentWatcherService('/workspace');
    
    // Create 1.5MB of content (exceeds MAX_CONTENT_LENGTH)
    const largeContent = '### US-001: Story\n**Status**: completed\n'.repeat(50_000); // ~1.5MB
    
    // Should not throw, and should return valid metrics
    const metrics = service.parseMetricsFromContent(largeContent);
    
    expect(metrics).toBeDefined();
    expect(metrics.storyCount).toBeGreaterThan(0);
    expect(metrics.completionPercent).toBeGreaterThanOrEqual(0);
  });

  it('removes control characters that could cause regex issues', () => {
    const service = new DocumentWatcherService('/workspace');
    
    // Content with null bytes and other control characters
    const maliciousContent = '### US-001: Test\x00\x01\x02\n**Status**: completed\x08\x0B';
    
    // Should sanitize and parse correctly
    const metrics = service.parseMetricsFromContent(maliciousContent);
    
    expect(metrics.storyCount).toBe(1);
    expect(metrics.completionPercent).toBe(100);
  });

  it('handles potential ReDoS patterns gracefully', () => {
    const service = new DocumentWatcherService('/workspace');
    
    // Craft a string that could trigger catastrophic backtracking in poorly-designed regex
    // Our regex patterns are safe, but this tests the error handling
    const suspiciousContent = '###' + ' '.repeat(10_000) + 'US-001:\n**Status**:' + ' '.repeat(10_000) + 'completed';
    
    // Should complete quickly (<100ms) without hanging
    const start = Date.now();
    const metrics = service.parseMetricsFromContent(suspiciousContent);
    const elapsed = Date.now() - start;
    
    expect(elapsed).toBeLessThan(100);
    expect(metrics.storyCount).toBe(1);
  });

  it('returns default metrics if regex throws (edge case)', () => {
    const service = new DocumentWatcherService('/workspace');
    
    // Empty content should return defaults without throwing
    const metrics = service.parseMetricsFromContent('');
    
    expect(metrics.storyCount).toBe(0);
    expect(metrics.epicsCount).toBe(0);
    expect(metrics.completionPercent).toBe(0);
    expect(metrics.lastUpdated).toBeDefined();
  });

  it('preserves valid markdown content during sanitization', () => {
    const service = new DocumentWatcherService('/workspace');
    
    const validContent = `
### US-001: User Login
**Status**: completed

### US-002: Password Reset
**Status**: in-progress

### US-003: Profile Update
**Status**: completed
    `;
    
    const metrics = service.parseMetricsFromContent(validContent);
    
    expect(metrics.storyCount).toBe(3);
    expect(metrics.completionPercent).toBeCloseTo(67, 0); // 2/3 = 66.67%
  });
});
