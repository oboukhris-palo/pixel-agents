/**
 * Performance Monitor (US-003-004 Layer 2)
 *
 * Tracks FPS, render time, memory usage, and React component render counts.
 * Logs warnings to VS Code OutputChannel when performance thresholds are exceeded.
 *
 * Target: 60 FPS (16.67ms per frame) with 16 agents + 50 furniture + 200 particles
 */

import * as vscode from 'vscode';

export interface PerformanceMetrics {
  fps: number;
  renderTime: number;
  memoryUsage: number;
  componentRenderCount: number;
  activeObjects: number;
}

export interface PerformanceThresholds {
  minFps: number;
  maxRenderTime: number;
  maxMemoryMB: number;
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    fps: 0,
    renderTime: 0,
    memoryUsage: 0,
    componentRenderCount: 0,
    activeObjects: 0,
  };

  private frameCount = 0;
  private componentRenderCount = 0;
  private lastTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
  private readonly thresholds: PerformanceThresholds;
  private readonly outputChannel: vscode.OutputChannel;

  constructor(
    outputChannel: vscode.OutputChannel,
    thresholds?: Partial<PerformanceThresholds>,
  ) {
    this.outputChannel = outputChannel;
    this.thresholds = {
      minFps: thresholds?.minFps ?? 55,
      maxRenderTime: thresholds?.maxRenderTime ?? 17,
      maxMemoryMB: thresholds?.maxMemoryMB ?? 100,
    };
  }

  // ── Frame recording ────────────────────────────────────────────────────────

  /**
   * Record a completed render frame (AC7).
   * FPS is recalculated once per second.
   */
  recordFrame(renderTime: number, activeObjects: number): void {
    this.frameCount++;
    this.metrics.renderTime = renderTime;
    this.metrics.activeObjects = activeObjects;

    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const elapsed = now - this.lastTime;

    if (elapsed >= 1000) {
      this.metrics.fps = Math.round((this.frameCount / elapsed) * 1000);
      this.metrics.componentRenderCount = this.componentRenderCount;

      this.frameCount = 0;
      this.componentRenderCount = 0;
      this.lastTime = now;

      this.updateMemoryUsage();
      this.logMetrics();
      this.checkThresholds();
    }
  }

  /**
   * Simulate multiple frames for testing purposes only.
   * Advances the internal clock by totalElapsedMs and records frameCount frames.
   */
  simulateFrames(frameCount: number, totalElapsedMs: number): void {
    const renderTimePerFrame = totalElapsedMs / frameCount;
    this.frameCount = frameCount;
    this.lastTime = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - totalElapsedMs - 1;
    this.recordFrame(renderTimePerFrame, this.metrics.activeObjects);
  }

  // ── Component render tracking ──────────────────────────────────────────────

  /**
   * Increment React component render counter (AC4).
   * Call from useEffect or render functions to track re-render rate.
   */
  recordComponentRender(): void {
    this.componentRenderCount++;
  }

  getComponentRenderCount(): number {
    return this.componentRenderCount;
  }

  // ── Threshold checking ─────────────────────────────────────────────────────

  /**
   * Explicit threshold check for testing — accepts partial metrics to check.
   */
  triggerThresholdCheck(partial: Partial<PerformanceMetrics>): void {
    const merged = { ...this.metrics, ...partial };
    this.checkThresholdsWithMetrics(merged);
  }

  // ── Memory monitoring ──────────────────────────────────────────────────────

  private updateMemoryUsage(): void {
    const mem = (performance as any)?.memory;
    if (mem) {
      this.metrics.memoryUsage = Math.round(mem.usedJSHeapSize / 1_048_576);
    }
  }

  // ── Logging ────────────────────────────────────────────────────────────────

  private logMetrics(): void {
    this.outputChannel.appendLine(
      `[Performance] FPS: ${this.metrics.fps}, ` +
      `Render: ${this.metrics.renderTime.toFixed(2)}ms, ` +
      `Memory: ${this.metrics.memoryUsage}MB, ` +
      `Objects: ${this.metrics.activeObjects}, ` +
      `React Renders/s: ${this.metrics.componentRenderCount}`
    );
  }

  private checkThresholds(): void {
    this.checkThresholdsWithMetrics(this.metrics);
  }

  private checkThresholdsWithMetrics(m: PerformanceMetrics): void {
    if (m.fps > 0 && m.fps < this.thresholds.minFps) {
      this.outputChannel.appendLine(
        `⚠️ [Performance Warning] FPS below threshold: ${m.fps} < ${this.thresholds.minFps}`
      );
    }
    if (m.renderTime > this.thresholds.maxRenderTime) {
      this.outputChannel.appendLine(
        `⚠️ [Performance Warning] Render time exceeded: ${m.renderTime.toFixed(2)}ms > ${this.thresholds.maxRenderTime}ms`
      );
    }
    if (m.memoryUsage > this.thresholds.maxMemoryMB) {
      this.outputChannel.appendLine(
        `⚠️ [Performance Warning] Memory usage high: ${m.memoryUsage}MB > ${this.thresholds.maxMemoryMB}MB`
      );
    }
  }

  // ── Getters ────────────────────────────────────────────────────────────────

  getCurrentMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  getAverageFPS(): number {
    return this.metrics.fps;
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  reset(): void {
    this.frameCount = 0;
    this.componentRenderCount = 0;
    this.lastTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
    this.metrics = {
      fps: 0,
      renderTime: 0,
      memoryUsage: 0,
      componentRenderCount: 0,
      activeObjects: 0,
    };
  }
}
