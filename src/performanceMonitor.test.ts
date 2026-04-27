/**
 * PerformanceMonitor Tests (US-003-004 Layer 2 - RED phase)
 *
 * Tests for FPS tracking, render time, memory usage, and threshold warnings.
 * Target: 60 FPS (16.67ms per frame) with 16 agents + 50 furniture + 200 particles.
 */

import * as vscode from 'vscode';
import { PerformanceMonitor, PerformanceThresholds } from './performanceMonitor';

jest.mock('vscode');

const mockOutputChannel = {
  appendLine: jest.fn(),
} as unknown as vscode.OutputChannel;

function createMonitor(thresholds?: Partial<PerformanceThresholds>) {
  return new PerformanceMonitor(mockOutputChannel, thresholds);
}

// ── Instantiation ──────────────────────────────────────────────────────────────

describe('PerformanceMonitor – Instantiation', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should create with default thresholds', () => {
    const monitor = createMonitor();
    expect(monitor).toBeDefined();
    const metrics = monitor.getCurrentMetrics();
    expect(metrics.fps).toBe(0);
    expect(metrics.renderTime).toBe(0);
    expect(metrics.activeObjects).toBe(0);
  });

  it('should create with custom thresholds', () => {
    const monitor = createMonitor({ minFps: 30, maxRenderTime: 33, maxMemoryMB: 200 });
    expect(monitor).toBeDefined();
  });
});

// ── Frame recording ────────────────────────────────────────────────────────────

describe('PerformanceMonitor – Frame recording (AC7)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should record render time on recordFrame()', () => {
    const monitor = createMonitor();
    monitor.recordFrame(8.5, 50);
    expect(monitor.getCurrentMetrics().renderTime).toBe(8.5);
  });

  it('should record active object count', () => {
    const monitor = createMonitor();
    monitor.recordFrame(10, 266); // 16 agents + 50 furniture + 200 particles
    expect(monitor.getCurrentMetrics().activeObjects).toBe(266);
  });

  it('should calculate FPS after 1 second of frames (AC1)', () => {
    const monitor = createMonitor();
    // Simulate 60 frames over 1 second by manipulating internal timing
    // We access the calculated FPS after enough frames
    monitor.simulateFrames(60, 1000);
    const metrics = monitor.getCurrentMetrics();
    expect(metrics.fps).toBeGreaterThan(0);
  });
});

// ── Threshold warnings ─────────────────────────────────────────────────────────

describe('PerformanceMonitor – Threshold warnings (AC1)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should warn when FPS drops below minimum threshold', () => {
    const monitor = createMonitor({ minFps: 55 });
    // Simulate low FPS scenario
    monitor.triggerThresholdCheck({ fps: 30, renderTime: 16, memoryUsage: 50 });
    expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(
      expect.stringContaining('FPS below threshold')
    );
  });

  it('should warn when render time exceeds maximum', () => {
    const monitor = createMonitor({ maxRenderTime: 17 });
    monitor.triggerThresholdCheck({ fps: 60, renderTime: 25, memoryUsage: 50 });
    expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(
      expect.stringContaining('Render time exceeded')
    );
  });

  it('should warn when memory usage exceeds maximum', () => {
    const monitor = createMonitor({ maxMemoryMB: 100 });
    monitor.triggerThresholdCheck({ fps: 60, renderTime: 16, memoryUsage: 150 });
    expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(
      expect.stringContaining('Memory usage high')
    );
  });

  it('should not warn when all metrics are within thresholds', () => {
    const monitor = createMonitor({ minFps: 55, maxRenderTime: 17, maxMemoryMB: 100 });
    monitor.triggerThresholdCheck({ fps: 60, renderTime: 14, memoryUsage: 50 });
    expect(mockOutputChannel.appendLine).not.toHaveBeenCalledWith(
      expect.stringContaining('Warning')
    );
  });
});

// ── Component render tracking ─────────────────────────────────────────────────

describe('PerformanceMonitor – Component render tracking (AC4)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should count component renders', () => {
    const monitor = createMonitor();
    monitor.recordComponentRender();
    monitor.recordComponentRender();
    monitor.recordComponentRender();
    expect(monitor.getComponentRenderCount()).toBe(3);
  });

  it('should reset component render count', () => {
    const monitor = createMonitor();
    monitor.recordComponentRender();
    monitor.reset();
    expect(monitor.getComponentRenderCount()).toBe(0);
  });
});

// ── Metrics access ────────────────────────────────────────────────────────────

describe('PerformanceMonitor – Metrics access', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should return current metrics snapshot', () => {
    const monitor = createMonitor();
    monitor.recordFrame(12.3, 100);
    const metrics = monitor.getCurrentMetrics();
    expect(metrics).toMatchObject({
      renderTime: 12.3,
      activeObjects: 100,
    });
  });

  it('should return independent snapshot (not a live reference)', () => {
    const monitor = createMonitor();
    monitor.recordFrame(10, 50);
    const snapshot = monitor.getCurrentMetrics();
    monitor.recordFrame(20, 100);
    // Original snapshot should be unchanged
    expect(snapshot.renderTime).toBe(10);
  });

  it('should reset all counters on reset()', () => {
    const monitor = createMonitor();
    monitor.recordFrame(10, 50);
    monitor.reset();
    const metrics = monitor.getCurrentMetrics();
    expect(metrics.fps).toBe(0);
    expect(metrics.renderTime).toBe(0);
    expect(metrics.activeObjects).toBe(0);
  });
});
