# US-003-004 Implementation Plan: Performance Optimization & Virtual Rendering

**User Story**: As a developer, I want the dashboard to maintain 60 FPS performance even with many agents and particles so that the experience feels smooth and responsive.

**Epic**: EPIC-003 (Office Canvas & Pixel Art Visualization)  
**Priority**: P1 (CRITICAL)  
**Story Points**: 4  
**Estimated Effort**: 12 hours (1.5 days)  
**Dependencies**: All Phase 2 stories complete ✅

---

## Overview

Optimize rendering performance to guarantee 60 FPS with 16 agents, 50 furniture items, and 200 particles simultaneously. Implement viewport culling, virtual scrolling, debounced event handlers, and performance monitoring to ensure smooth user experience on all hardware.

## Acceptance Criteria

✅ **AC1**: 60 FPS maintained with 16 agents + 50 furniture items + 200 particles  
✅ **AC2**: Viewport culling implemented (only render visible objects)  
✅ **AC3**: Canvas renders at correct devicePixelRatio (crisp on retina displays)  
✅ **AC4**: React re-renders optimized (< 100ms for all components)  
✅ **AC5**: Virtual scrolling for agent list (handles 100+ agents)  
✅ **AC6**: Debounced event handlers (300ms for VS Code messages)  
✅ **AC7**: Performance metrics logged (FPS, render time, memory)  
✅ **AC8**: No memory leaks (event listeners cleaned up properly)  
✅ **AC9**: Bundle size optimized (< 500KB total for webview)  
✅ **AC10**: Lighthouse performance score > 90

---

## Technical Architecture

### Layer 1: Performance Types & Metrics — Not applicable

**Dependencies**: Use existing types, add performance metric interfaces

---

### Layer 2: Performance Monitoring Service — 4 hours

**Purpose**: Track FPS, render time, memory usage, and identify bottlenecks

**Files to Create**:
- `src/performanceMonitor.ts` (200+ lines)

**Performance Monitor Class**:
```typescript
/**
 * Performance Monitor (US-003-004 Layer 2)
 * 
 * Tracks FPS, render time, memory usage, and component render counts.
 * Logs warnings when performance thresholds are exceeded.
 * 
 * Target: 60 FPS (16.67ms per frame)
 */

import * as vscode from 'vscode';

export interface PerformanceMetrics {
  fps: number;              // Current frames per second
  renderTime: number;       // Last frame render time (ms)
  memoryUsage: number;      // Memory usage in MB
  componentRenderCount: number; // React component renders per second
  activeObjects: number;    // Objects being rendered (agents + furniture + particles)
}

export interface PerformanceThresholds {
  minFps: number;           // Minimum acceptable FPS (default: 55)
  maxRenderTime: number;    // Maximum frame time (default: 17ms for 60 FPS)
  maxMemoryMB: number;      // Maximum memory usage (default: 100MB)
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    fps: 0,
    renderTime: 0,
    memoryUsage: 0,
    componentRenderCount: 0,
    activeObjects: 0
  };

  private frameCount = 0;
  private componentRenderCount = 0;
  private lastTime = performance.now();
  private thresholds: PerformanceThresholds;
  private outputChannel: vscode.OutputChannel;

  constructor(outputChannel: vscode.OutputChannel, thresholds?: Partial<PerformanceThresholds>) {
    this.outputChannel = outputChannel;
    this.thresholds = {
      minFps: thresholds?.minFps ?? 55,
      maxRenderTime: thresholds?.maxRenderTime ?? 17,
      maxMemoryMB: thresholds?.maxMemoryMB ?? 100
    };
  }

  // ── Frame recording ────────────────────────────────────────────────────────

  /**
   * Record frame completion (AC7: log FPS)
   * Call this at end of each render loop iteration
   */
  recordFrame(renderTime: number, activeObjects: number): void {
    this.frameCount++;
    this.metrics.renderTime = renderTime;
    this.metrics.activeObjects = activeObjects;

    const now = performance.now();
    const elapsed = now - this.lastTime;

    // Calculate FPS every 1 second
    if (elapsed >= 1000) {
      this.metrics.fps = Math.round((this.frameCount / elapsed) * 1000);
      this.metrics.componentRenderCount = this.componentRenderCount;
      
      // Reset counters
      this.frameCount = 0;
      this.componentRenderCount = 0;
      this.lastTime = now;

      this.updateMemoryUsage();
      this.logMetrics();
      this.checkThresholds();
    }
  }

  /**
   * Record React component render (AC4)
   */
  recordComponentRender(): void {
    this.componentRenderCount++;
  }

  // ── Memory monitoring ──────────────────────────────────────────────────────

  /**
   * Update memory usage metrics (AC7)
   */
  private updateMemoryUsage(): void {
    const memory = (performance as any).memory;
    if (memory) {
      this.metrics.memoryUsage = Math.round(memory.usedJSHeapSize / 1048576); // MB
    }
  }

  // ── Logging & warnings ─────────────────────────────────────────────────────

  /**
   * Log current performance metrics (AC7)
   */
  private logMetrics(): void {
    this.outputChannel.appendLine(
      `[Performance] FPS: ${this.metrics.fps}, ` +
      `Render: ${this.metrics.renderTime.toFixed(2)}ms, ` +
      `Memory: ${this.metrics.memoryUsage}MB, ` +
      `Objects: ${this.metrics.activeObjects}, ` +
      `React Renders: ${this.metrics.componentRenderCount}/s`
    );
  }

  /**
   * Check performance thresholds and log warnings (AC1)
   */
  private checkThresholds(): void {
    if (this.metrics.fps < this.thresholds.minFps) {
      this.outputChannel.appendLine(
        `⚠️ [Performance Warning] FPS below threshold: ${this.metrics.fps} < ${this.thresholds.minFps}`
      );
    }

    if (this.metrics.renderTime > this.thresholds.maxRenderTime) {
      this.outputChannel.appendLine(
        `⚠️ [Performance Warning] Render time exceeded: ${this.metrics.renderTime.toFixed(2)}ms > ${this.thresholds.maxRenderTime}ms`
      );
    }

    if (this.metrics.memoryUsage > this.thresholds.maxMemoryMB) {
      this.outputChannel.appendLine(
        `⚠️ [Performance Warning] Memory usage high: ${this.metrics.memoryUsage}MB > ${this.thresholds.maxMemoryMB}MB`
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

  // ── Utilities ──────────────────────────────────────────────────────────────

  reset(): void {
    this.frameCount = 0;
    this.componentRenderCount = 0;
    this.lastTime = performance.now();
  }
}
```

**TDD Approach**:
- **RED**: Write tests for frame recording, FPS calculation, threshold warnings
- **GREEN**: Implement performance monitoring with accurate metrics
- **REFACTOR**: Extract threshold configuration to settings

**Test Coverage**:
- Frame recording calculates FPS correctly
- Memory usage tracked accurately
- Threshold warnings logged when limits exceeded
- Component render counting works
- Reset clears all counters

**Architectural Constraints**:
- Use `performance.now()` for high-resolution timing
- Log to VS Code OutputChannel (AC7)
- Monitor 60 FPS target (16.67ms per frame)
- Track memory via `performance.memory` API

**Estimated Effort**: 4 hours

---

### Layer 2B: Viewport Culling & Optimization — 4 hours

**Purpose**: Only render objects visible in viewport (AC2)

**Files to Modify**:
- `webview-ui/src/office/engine/canvasRenderer.ts` (add culling logic)

**Viewport Culling Implementation**:
```typescript
/**
 * Viewport Culling (US-003-004 Layer 2)
 * 
 * Only render objects within visible viewport bounds.
 * Dramatically reduces draw calls for large layouts.
 */

export class CanvasRenderer {
  // ... existing properties

  // ── Viewport culling ───────────────────────────────────────────────────────

  /**
   * Check if object is visible in current viewport (AC2)
   */
  private shouldRenderObject(obj: { x: number; y: number; width: number; height: number }): boolean {
    const viewportLeft = -this.viewport.x / this.viewport.zoom;
    const viewportTop = -this.viewport.y / this.viewport.zoom;
    const viewportRight = viewportLeft + (this.ctx.canvas.width / window.devicePixelRatio) / this.viewport.zoom;
    const viewportBottom = viewportTop + (this.ctx.canvas.height / window.devicePixelRatio) / this.viewport.zoom;

    // Check AABB (Axis-Aligned Bounding Box) intersection
    return !(
      obj.x + obj.width < viewportLeft ||
      obj.x > viewportRight ||
      obj.y + obj.height < viewportTop ||
      obj.y > viewportBottom
    );
  }

  /**
   * Render with culling applied (AC2)
   */
  render(
    layout: OfficeLayout,
    sprites: AgentSprite[],
    particles: Particle[],
    performanceMonitor: PerformanceMonitor
  ): void {
    const startTime = performance.now();

    // Clear canvas
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    // Apply viewport transform
    this.ctx.save();
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio); // AC3: Retina support
    this.ctx.translate(this.viewport.x, this.viewport.y);
    this.ctx.scale(this.viewport.zoom, this.viewport.zoom);

    let renderedCount = 0;

    // Render grid (always visible)
    this.renderGrid(layout);

    // Render furniture with culling
    layout.furniture.forEach(item => {
      if (this.shouldRenderObject(item)) {
        this.renderFurniture(item);
        renderedCount++;
      }
    });

    // Render zones with culling
    layout.zones.forEach(zone => {
      if (this.shouldRenderObject(zone)) {
        this.renderZone(zone);
        renderedCount++;
      }
    });

    // Render sprites with culling
    sprites.forEach(sprite => {
      if (this.shouldRenderObject({ ...sprite.position, width: sprite.size.width, height: sprite.size.height })) {
        this.renderSprite(sprite);
        renderedCount++;
      }
    });

    // Render particles (always visible, short-lived)
    particles.forEach(particle => {
      this.renderParticle(particle);
      renderedCount++;
    });

    this.ctx.restore();

    // Record performance metrics (AC7)
    const renderTime = performance.now() - startTime;
    performanceMonitor.recordFrame(renderTime, renderedCount);
  }
}
```

**TDD Approach**:
- **RED**: Write tests for culling logic (objects outside viewport not rendered)
- **GREEN**: Implement AABB intersection test and culling
- **REFACTOR**: Optimize culling checks (early exit patterns)

**Test Coverage**:
- Objects outside viewport not rendered (AC2)
- Objects partially visible are rendered
- Culling works correctly at different zoom levels
- devicePixelRatio applied correctly (AC3)
- Performance improved (fewer draw calls)

**Estimated Effort**: 4 hours

---

### Layer 3: React Optimization — 2 hours

**Purpose**: Minimize unnecessary re-renders (AC4)

**Files to Modify**:
- All component files (add React.memo, useMemo, useCallback)

**Optimization Patterns**:
```tsx
/**
 * React Optimization (US-003-004 Layer 3)
 * 
 * Use React.memo, useMemo, and useCallback to prevent unnecessary re-renders.
 * Target: Component re-renders < 100ms (AC4)
 */

// Example: TaskProgressionBar optimization
export const TaskProgressionBar = React.memo<TaskProgressionBarProps>(({ previous, current, next, onClick }) => {
  // Memoize expensive computations
  const phaseColor = useMemo(() => getPhaseColor(current.phase), [current.phase]);
  
  // Memoize event handlers to prevent child re-renders
  const handleClick = useCallback((taskId: string) => {
    onClick?.(taskId);
  }, [onClick]);

  // Memoize child components
  const taskCards = useMemo(() => {
    return [previous, current, next].map(task => (
      <TaskCard 
        key={task.id} 
        task={task} 
        phaseColor={phaseColor}
        onClick={handleClick} 
      />
    ));
  }, [previous, current, next, phaseColor, handleClick]);

  return <div className="task-progression-bar">{taskCards}</div>;
}, (prevProps, nextProps) => {
  // Custom comparison function for shallow equality check
  return (
    prevProps.previous.id === nextProps.previous.id &&
    prevProps.current.id === nextProps.current.id &&
    prevProps.next.id === nextProps.next.id &&
    prevProps.onClick === nextProps.onClick
  );
});
TaskProgressionBar.displayName = 'TaskProgressionBar';

// Example: Virtual scrolling for agent list (AC5)
export function AgentRegistry({ agents }: AgentRegistryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 10 });

  // Calculate visible range based on scroll position
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    
    const scrollTop = containerRef.current.scrollTop;
    const itemHeight = 32; // ROW_HEIGHT constant
    const visibleCount = Math.ceil(containerRef.current.clientHeight / itemHeight);
    
    const start = Math.floor(scrollTop / itemHeight);
    const end = start + visibleCount + 5; // Buffer 5 items

    setVisibleRange({ start, end });
  }, []);

  // Debounce scroll handler (AC6)
  const debouncedScroll = useMemo(() => debounce(handleScroll, 100), [handleScroll]);

  // Render only visible items (AC5: virtual scrolling)
  const visibleAgents = useMemo(() => {
    return agents.slice(visibleRange.start, visibleRange.end);
  }, [agents, visibleRange]);

  return (
    <div ref={containerRef} onScroll={debouncedScroll} style={{ overflowY: 'auto', height: '100%' }}>
      <div style={{ height: agents.length * 32 }}>
        <div style={{ transform: `translateY(${visibleRange.start * 32}px)` }}>
          {visibleAgents.map(agent => (
            <AgentRow key={agent.id} agent={agent} />
          ))}
        </div>
      </div>
    </div>
  );
}
```

**TDD Approach**:
- **RED**: Write tests for React optimization (verify memo prevents re-renders)
- **GREEN**: Apply React.memo, useMemo, useCallback to all components
- **REFACTOR**: Extract shared optimization patterns to custom hooks

**Test Coverage**:
- React.memo prevents unnecessary re-renders
- useMemo caches expensive computations
- useCallback stabilizes event handlers
- Virtual scrolling renders only visible items (AC5)
- Component render time < 100ms (AC4)

**Estimated Effort**: 2 hours

---

### Layer 4: Testing & Validation — 2 hours

**Purpose**: Verify performance optimizations work correctly

**Files to Create**:
- `src/performanceMonitor.test.ts` (15-20 tests)
- `webview-ui/src/__tests__/performance.test.tsx` (15-20 tests)

**Test Suites**:

1. **Performance Monitor Tests** (10 tests)
   - FPS calculated correctly over 1 second window
   - Render time tracked accurately
   - Memory usage monitored
   - Threshold warnings logged when exceeded
   - Component render counting works

2. **Viewport Culling Tests** (10 tests)
   - Objects outside viewport not rendered (AC2)
   - Objects inside viewport rendered
   - Culling works at different zoom levels
   - devicePixelRatio applied correctly (AC3)
   - Performance improvement measured (fewer draw calls)

3. **React Optimization Tests** (10 tests)
   - React.memo prevents unnecessary re-renders
   - useMemo caches expensive computations
   - useCallback stabilizes event handlers
   - Virtual scrolling renders only visible range (AC5)
   - Component render time < 100ms (AC4)

4. **Memory Leak Tests** (10 tests)
   - Event listeners cleaned up on unmount (AC8)
   - Canvas contexts released properly
   - Animation frames canceled on cleanup
   - No lingering timers or intervals
   - Memory usage stable over time

**TDD Approach**:
- **RED**: Write comprehensive performance test suite
- **GREEN**: Verify all optimizations pass tests
- **REFACTOR**: Use shared test utilities for performance measurement

**Estimated Effort**: 2 hours

---

## Definition of Done

- ✅ All 10 acceptance criteria met
- ✅ 60 FPS maintained with 16 agents + 50 furniture + 200 particles (AC1)
- ✅ Viewport culling implemented (AC2)
- ✅ Canvas retina-ready (devicePixelRatio applied) (AC3)
- ✅ React re-renders < 100ms (AC4)
- ✅ Virtual scrolling for 100+ agents (AC5)
- ✅ Debounced event handlers (300ms) (AC6)
- ✅ Performance metrics logged (AC7)
- ✅ No memory leaks (event cleanup) (AC8)
- ✅ Bundle size < 500KB (AC9)
- ✅ Lighthouse score > 90 (AC10)
- ✅ 40-50 tests passing (performance + optimization)
- ✅ Code review approved (13-point checklist)

---

## Effort Summary

| Layer | Effort | Key Deliverables |
|-------|--------|------------------|
| Layer 2 | 4 hours | Performance monitoring service |
| Layer 2B | 4 hours | Viewport culling + optimization |
| Layer 3 | 2 hours | React optimization (memo, virtual scrolling) |
| Layer 4 | 2 hours | Testing + validation |
| **Total** | **12 hours (1.5 days)** | **60 FPS guaranteed** |

---

## Dependencies & Blockers

**Dependencies**:
- ✅ Canvas infrastructure (US-003-001) — Complete
- ✅ Sprite animation engine (US-003-002) — Complete
- ✅ All rendering systems in place — Complete

**No blockers** — Optimization work on existing code

---

## Success Metrics

- 60 FPS validated with stress test (16 agents + 50 furniture + 200 particles) ✅
- Viewport culling reduces draw calls by 50-70% ✅
- React re-renders < 100ms for all components ✅
- Virtual scrolling handles 100+ agents smoothly ✅
- No memory leaks after 10 minutes of operation ✅
- Lighthouse performance score > 90 ✅

---

**Document Version**: 1.0  
**Created**: 2026-04-27  
**Last Updated**: 2026-04-27  
**Author**: Sebastian (Dev-Lead)  
**Status**: READY FOR APPROVAL
