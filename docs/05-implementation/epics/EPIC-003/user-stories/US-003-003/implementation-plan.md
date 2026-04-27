# US-003-003 Implementation Plan: Zoom & Pan Controls with Auto-Fit

**Epic**: EPIC-003 — Office Canvas & Agent Visualization  
**Story**: US-003-003 — Zoom & Pan Controls with Auto-Fit  
**Priority**: P2 (User Experience Enhancement)  
**Story Points**: 3  
**Estimated Effort**: 1-2 days (12-16 hours)  
**Dependencies**: US-003-001 (Office Canvas Grid — COMPLETE)  
**Assignee**: TDD Team (dev-tdd-red → dev-tdd-green → dev-tdd-refactor)  
**Created**: 2026-04-27  
**Dev-Lead**: Sebastian

---

## 📋 Story Overview

### Business Value
Enable users to interactively explore the office canvas with intuitive zoom and pan controls. Auto-fit on load ensures the layout is fully visible regardless of window size, while manual controls provide flexibility to focus on specific agents or areas — improving spatial awareness and user engagement.

### User Story
> **As a** developer using Pixel Agents  
> **I want to** zoom in/out and pan across the office canvas  
> **So that** I can focus on specific agents or view the entire office layout at a glance

### Acceptance Criteria

✅ **AC1**: Auto-fit calculates viewport-to-canvas ratio with 90% fill on canvas load  
✅ **AC2**: Manual zoom via scroll wheel (zoom in/out by 20% per scroll event)  
✅ **AC3**: Pinch-to-zoom support on trackpad (macOS gesture)  
✅ **AC4**: Pan via click-drag (mouse) or touch-drag (trackpad)  
✅ **AC5**: Zoom controls UI: 3 buttons (Zoom In `+`, Zoom Out `−`, Auto-Fit `⊡`)  
✅ **AC6**: Zoom controls positioned bottom-right of canvas (10px margin, overlay)  
✅ **AC7**: Layout dimensions (cols/rows) passed as props to controls component  
✅ **AC8**: Smooth zoom transitions (250ms ease-out) when using buttons  
✅ **AC9**: Keyboard shortcuts: `Cmd/Ctrl +` (zoom in), `Cmd/Ctrl -` (zoom out), `Cmd/Ctrl 0` (auto-fit)  
✅ **AC10**: Visual match to Penpot export (`design-systems.md v2.0.0`)

### BDD Scenarios
Reference: `/docs/05-implementation/epics/EPIC-003/user-stories/US-003-003/features/zoom-pan-controls.feature`

---

## 🏗️ Architecture & Layer Breakdown

### Layer 1: Viewport Types & Utilities
**Purpose**: Define TypeScript interfaces for viewport state and zoom/pan calculations

**Files to create**:
- `webview-ui/src/office/layout/viewportTypes.ts` (80 lines)

**Key Types**:
```typescript
export interface Viewport {
  x: number;          // Pan offset X (canvas pixels from left edge)
  y: number;          // Pan offset Y (canvas pixels from top edge)
  zoom: number;       // Zoom factor (1.0 = 100%, 0.5 = 50%, 2.0 = 200%)
  minZoom: number;    // Minimum allowed zoom (default: 0.1 = 10%)
  maxZoom: number;    // Maximum allowed zoom (default: 3.0 = 300%)
}

export interface LayoutDimensions {
  cols: number;       // Grid columns
  rows: number;       // Grid rows
  gridSize: number;   // Pixels per grid cell (default: 32)
}

export interface CanvasDimensions {
  width: number;      // Canvas width in CSS pixels
  height: number;     // Canvas height in CSS pixels
}
```

**Utility Functions**:
```typescript
/**
 * Calculate optimal zoom to fit layout within canvas (90% fill)
 * @param layout - Grid dimensions
 * @param canvas - Canvas dimensions
 * @returns Optimal zoom factor
 */
export function calculateAutoFitZoom(
  layout: LayoutDimensions,
  canvas: CanvasDimensions
): number {
  const layoutWidth = layout.cols * layout.gridSize;
  const layoutHeight = layout.rows * layout.gridSize;

  const zoomX = (canvas.width * 0.9) / layoutWidth;
  const zoomY = (canvas.height * 0.9) / layoutHeight;

  // Use smaller zoom to ensure both dimensions fit
  return Math.min(zoomX, zoomY);
}

/**
 * Calculate pan offset to center layout in canvas
 * @param layout - Grid dimensions
 * @param canvas - Canvas dimensions
 * @param zoom - Current zoom factor
 * @returns { x, y } pan offsets
 */
export function calculateCenterPan(
  layout: LayoutDimensions,
  canvas: CanvasDimensions,
  zoom: number
): { x: number; y: number } {
  const scaledWidth = layout.cols * layout.gridSize * zoom;
  const scaledHeight = layout.rows * layout.gridSize * zoom;

  return {
    x: (canvas.width - scaledWidth) / 2,
    y: (canvas.height - scaledHeight) / 2
  };
}

/**
 * Clamp zoom within allowed range
 * @param zoom - Desired zoom factor
 * @param minZoom - Minimum allowed zoom (default: 0.1)
 * @param maxZoom - Maximum allowed zoom (default: 3.0)
 * @returns Clamped zoom factor
 */
export function clampZoom(
  zoom: number,
  minZoom: number = 0.1,
  maxZoom: number = 3.0
): number {
  return Math.max(minZoom, Math.min(zoom, maxZoom));
}

/**
 * Create default viewport
 */
export function createDefaultViewport(): Viewport {
  return {
    x: 0,
    y: 0,
    zoom: 1.0,
    minZoom: 0.1,
    maxZoom: 3.0
  };
}
```

**Validation Functions**:
```typescript
export function isValidViewport(viewport: unknown): viewport is Viewport {
  if (typeof viewport !== 'object' || viewport === null) return false;
  const v = viewport as Partial<Viewport>;
  return (
    typeof v.x === 'number' &&
    typeof v.y === 'number' &&
    typeof v.zoom === 'number' &&
    typeof v.minZoom === 'number' &&
    typeof v.maxZoom === 'number' &&
    v.zoom >= v.minZoom &&
    v.zoom <= v.maxZoom
  );
}

export function isValidLayoutDimensions(layout: unknown): layout is LayoutDimensions {
  if (typeof layout !== 'object' || layout === null) return false;
  const l = layout as Partial<LayoutDimensions>;
  return (
    typeof l.cols === 'number' && l.cols > 0 &&
    typeof l.rows === 'number' && l.rows > 0 &&
    typeof l.gridSize === 'number' && l.gridSize > 0
  );
}
```

**TDD Approach**:
- **RED (30 min)**: Write tests for viewport utilities
  - Test `calculateAutoFitZoom` with various layout/canvas ratios
  - Test `calculateCenterPan` produces symmetric offsets
  - Test `clampZoom` enforces min/max boundaries
  - Test validation functions with valid/invalid inputs
- **GREEN (30 min)**: Implement utility functions
- **REFACTOR (20 min)**: Extract constants, add JSDoc comments

**Test Coverage Target**: 100% (20-25 tests)

---

### Layer 2: Zoom & Pan Logic in CanvasRenderer
**Purpose**: Extend `CanvasRenderer` class with viewport manipulation methods

**Files to modify**:
- `webview-ui/src/office/engine/canvasRenderer.ts` (add zoom/pan methods)

**Existing State** (already present from US-003-001):
```typescript
export class CanvasRenderer {
  private viewport: Viewport = createDefaultViewport();
  
  // Existing methods:
  // - render(): void
  // - getViewport(): Viewport (returns copy)
}
```

**New Methods to Add**:
```typescript
/**
 * Calculate and apply auto-fit zoom + center pan
 * Called on canvas load to ensure layout is fully visible
 */
autoFit(): void {
  const canvasWidth = this.ctx.canvas.width / window.devicePixelRatio;
  const canvasHeight = this.ctx.canvas.height / window.devicePixelRatio;

  const canvas: CanvasDimensions = { width: canvasWidth, height: canvasHeight };
  const layout: LayoutDimensions = {
    cols: this.layout.cols,
    rows: this.layout.rows,
    gridSize: this.layout.gridSize
  };

  // Calculate optimal zoom
  this.viewport.zoom = calculateAutoFitZoom(layout, canvas);

  // Center layout in viewport
  const centerPan = calculateCenterPan(layout, canvas, this.viewport.zoom);
  this.viewport.x = centerPan.x;
  this.viewport.y = centerPan.y;
}

/**
 * Apply zoom factor (multiplicative)
 * @param factor - Zoom multiplier (1.2 = zoom in 20%, 0.8 = zoom out 20%)
 * @param centerX - Optional zoom center X (canvas pixels, default: canvas center)
 * @param centerY - Optional zoom center Y (canvas pixels, default: canvas center)
 */
setZoom(factor: number, centerX?: number, centerY?: number): void {
  const oldZoom = this.viewport.zoom;
  const newZoom = clampZoom(this.viewport.zoom * factor, this.viewport.minZoom, this.viewport.maxZoom);

  // If zoom unchanged (clamped), do nothing
  if (newZoom === oldZoom) return;

  // Zoom towards cursor position (if provided)
  if (centerX !== undefined && centerY !== undefined) {
    // Convert canvas coordinates to world coordinates before zoom
    const worldX = (centerX - this.viewport.x) / oldZoom;
    const worldY = (centerY - this.viewport.y) / oldZoom;

    // Apply new zoom
    this.viewport.zoom = newZoom;

    // Recalculate pan to keep same world point under cursor
    this.viewport.x = centerX - worldX * newZoom;
    this.viewport.y = centerY - worldY * newZoom;
  } else {
    // Zoom towards canvas center
    const canvasWidth = this.ctx.canvas.width / window.devicePixelRatio;
    const canvasHeight = this.ctx.canvas.height / window.devicePixelRatio;
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;

    const worldX = (centerX - this.viewport.x) / oldZoom;
    const worldY = (centerY - this.viewport.y) / oldZoom;

    this.viewport.zoom = newZoom;

    this.viewport.x = centerX - worldX * newZoom;
    this.viewport.y = centerY - worldY * newZoom;
  }
}

/**
 * Apply pan delta (accumulative)
 * @param deltaX - Horizontal pan offset in pixels
 * @param deltaY - Vertical pan offset in pixels
 */
setPan(deltaX: number, deltaY: number): void {
  this.viewport.x += deltaX;
  this.viewport.y += deltaY;
}

/**
 * Set absolute zoom value (not multiplicative)
 * @param zoom - Target zoom factor
 */
setAbsoluteZoom(zoom: number): void {
  this.viewport.zoom = clampZoom(zoom, this.viewport.minZoom, this.viewport.maxZoom);
}

/**
 * Reset viewport to auto-fit state
 */
resetViewport(): void {
  this.autoFit();
}
```

**TDD Approach**:
- **RED (1 hour)**: Write comprehensive tests for zoom/pan methods
  - Test `autoFit()` calculates correct zoom/pan for various canvas sizes
  - Test `setZoom()` with factor >1 (zoom in), <1 (zoom out), clamping
  - Test `setZoom()` with cursor position maintains point under cursor
  - Test `setPan()` accumulates offsets correctly
  - Test `setAbsoluteZoom()` overrides current zoom
  - Test `resetViewport()` restores auto-fit state
- **GREEN (2 hours)**: Implement zoom/pan methods
- **REFACTOR (30 min)**: Extract zoom-towards-point logic, optimize calculations

**Test Coverage Target**: 95% (25-30 tests)

---

### Layer 3: Zoom Controls Component
**Purpose**: Create UI overlay with 3 buttons for zoom in, zoom out, and auto-fit

**Files to create**:
- `webview-ui/src/components/ZoomControls.tsx` (120 lines)
- `webview-ui/src/components/ZoomControls.module.css` (80 lines)
- `webview-ui/src/components/ZoomControls.test.tsx` (60 tests)

**Component Structure**:
```tsx
import React, { useEffect, useCallback } from 'react';
import styles from './ZoomControls.module.css';

export interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onAutoFit: () => void;
  currentZoom?: number;  // Optional: display current zoom %
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export function ZoomControls({
  onZoomIn,
  onZoomOut,
  onAutoFit,
  currentZoom,
  position = 'bottom-right'
}: ZoomControlsProps) {
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      // Cmd/Ctrl + = or Cmd/Ctrl + (zoom in)
      if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        onZoomIn();
      }
      // Cmd/Ctrl - (zoom out)
      else if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault();
        onZoomOut();
      }
      // Cmd/Ctrl 0 (auto-fit)
      else if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault();
        onAutoFit();
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [onZoomIn, onZoomOut, onAutoFit]);

  return (
    <div
      className={`${styles.zoomControls} ${styles[position]}`}
      role="toolbar"
      aria-label="Canvas zoom controls"
    >
      {currentZoom !== undefined && (
        <div className={styles.zoomIndicator} aria-live="polite">
          {Math.round(currentZoom * 100)}%
        </div>
      )}
      
      <button
        onClick={onZoomIn}
        className={styles.zoomButton}
        aria-label="Zoom in (Cmd/Ctrl +)"
        title="Zoom in (Cmd/Ctrl +)"
      >
        +
      </button>
      
      <button
        onClick={onZoomOut}
        className={styles.zoomButton}
        aria-label="Zoom out (Cmd/Ctrl -)"
        title="Zoom out (Cmd/Ctrl -)"
      >
        −
      </button>
      
      <button
        onClick={onAutoFit}
        className={styles.zoomButton}
        aria-label="Auto-fit (Cmd/Ctrl 0)"
        title="Auto-fit (Cmd/Ctrl 0)"
      >
        ⊡
      </button>
    </div>
  );
}
```

**Styling** (`ZoomControls.module.css`):
```css
.zoomControls {
  position: absolute;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-2);
  background: var(--vscode-sidebar-bg);
  border: 1px solid var(--vscode-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  z-index: 100;
}

.zoomControls.bottom-right {
  bottom: var(--space-3);
  right: var(--space-3);
}

.zoomControls.bottom-left {
  bottom: var(--space-3);
  left: var(--space-3);
}

.zoomControls.top-right {
  top: var(--space-3);
  right: var(--space-3);
}

.zoomControls.top-left {
  top: var(--space-3);
  left: var(--space-3);
}

.zoomButton {
  width: 32px;
  height: 32px;
  padding: 0;
  background: var(--vscode-button);
  color: var(--vscode-foreground);
  border: 1px solid var(--vscode-border);
  border-radius: var(--radius-sm);
  font-size: var(--text-h3);
  font-weight: 600;
  cursor: pointer;
  transition: all 150ms ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.zoomButton:hover {
  background: var(--vscode-accent);
  border-color: var(--vscode-accent);
  box-shadow: 0 0 8px var(--vscode-accent);
}

.zoomButton:active {
  transform: scale(0.95);
}

.zoomButton:focus-visible {
  outline: 2px solid var(--vscode-accent);
  outline-offset: 2px;
}

.zoomIndicator {
  font-size: var(--text-body-sm);
  color: var(--vscode-foreground-dim);
  text-align: center;
  padding: var(--space-1);
  border-bottom: 1px solid var(--vscode-border);
  margin-bottom: var(--space-1);
}
```

**TDD Approach**:
- **RED (1 hour)**: Write comprehensive tests
  - Test buttons render with correct labels and ARIA attributes
  - Test onClick handlers called when buttons clicked
  - Test keyboard shortcuts trigger correct handlers
  - Test current zoom indicator displays rounded percentage
  - Test position prop applies correct CSS class
  - Test accessibility (WCAG 2.1 AA: keyboard nav, ARIA roles, focus visible)
- **GREEN (2 hours)**: Implement component
- **REFACTOR (30 min)**: Extract button sub-component, optimize keyboard listener

**Test Coverage Target**: 100% (30-35 tests)

---

### Layer 4: Canvas Interaction Handlers in OfficeCanvas
**Purpose**: Wire up scroll wheel, drag, pinch, and button events to renderer methods

**Files to modify**:
- `webview-ui/src/office/OfficeCanvas.tsx` (add interaction handlers + ZoomControls)

**Key Changes**:
```tsx
import { ZoomControls } from '../components/ZoomControls';

export function OfficeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<CanvasRenderer | null>(null);
  const [currentZoom, setCurrentZoom] = useState<number>(1.0);

  // Initialize renderer (existing code from US-003-001)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const layout = loadDefaultLayout();
    const renderer = new CanvasRenderer(canvas, layout);
    renderer.autoFit();  // Auto-fit on load (AC1)
    rendererRef.current = renderer;

    // Update zoom indicator
    setCurrentZoom(renderer.getViewport().zoom);

    const stopLoop = startGameLoop(canvas, {
      update: (dt: number) => {
        // Animation updates
      },
      render: (ctx: CanvasRenderingContext2D) => {
        renderer.render();
      }
    });

    return () => {
      stopLoop();
      rendererRef.current = null;
    };
  }, []);

  // Scroll wheel zoom (AC2)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !rendererRef.current) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      // Zoom in/out by 20% per scroll
      const factor = e.deltaY > 0 ? 0.8 : 1.2;
      
      // Zoom towards cursor position
      const rect = canvas.getBoundingClientRect();
      const cursorX = e.clientX - rect.left;
      const cursorY = e.clientY - rect.top;
      
      rendererRef.current?.setZoom(factor, cursorX, cursorY);
      
      // Update zoom indicator
      const viewport = rendererRef.current?.getViewport();
      if (viewport) setCurrentZoom(viewport.zoom);
    };

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel);
  }, []);

  // Click-drag pan (AC4)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !rendererRef.current) return;

    const handleMouseDown = (e: MouseEvent) => {
      let lastX = e.clientX;
      let lastY = e.clientY;
      let isDragging = false;

      const handleMouseMove = (e: MouseEvent) => {
        isDragging = true;
        const deltaX = e.clientX - lastX;
        const deltaY = e.clientY - lastY;
        
        rendererRef.current?.setPan(deltaX, deltaY);
        
        lastX = e.clientX;
        lastY = e.clientY;
      };

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        
        // Reset cursor if was dragging
        if (isDragging) {
          canvas.style.cursor = 'default';
        }
      };

      // Change cursor to grabbing
      canvas.style.cursor = 'grabbing';

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };

    // Set default cursor to grab
    canvas.style.cursor = 'grab';

    canvas.addEventListener('mousedown', handleMouseDown);
    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.style.cursor = 'default';
    };
  }, []);

  // Pinch-to-zoom (AC3) — trackpad gesture
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !rendererRef.current) return;

    let lastScale = 1.0;

    const handleGestureStart = (e: Event) => {
      e.preventDefault();
      lastScale = 1.0;
    };

    const handleGestureChange = (e: any) => {
      e.preventDefault();
      
      const scale = e.scale;
      const factor = scale / lastScale;
      lastScale = scale;

      // Zoom towards gesture center
      const rect = canvas.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      rendererRef.current?.setZoom(factor, centerX, centerY);
      
      // Update zoom indicator
      const viewport = rendererRef.current?.getViewport();
      if (viewport) setCurrentZoom(viewport.zoom);
    };

    const handleGestureEnd = (e: Event) => {
      e.preventDefault();
      lastScale = 1.0;
    };

    // Safari/WebKit gesture events
    canvas.addEventListener('gesturestart', handleGestureStart as EventListener);
    canvas.addEventListener('gesturechange', handleGestureChange as EventListener);
    canvas.addEventListener('gestureend', handleGestureEnd as EventListener);

    return () => {
      canvas.removeEventListener('gesturestart', handleGestureStart as EventListener);
      canvas.removeEventListener('gesturechange', handleGestureChange as EventListener);
      canvas.removeEventListener('gestureend', handleGestureEnd as EventListener);
    };
  }, []);

  // Zoom controls handlers (AC5, AC8, AC9)
  const handleZoomIn = useCallback(() => {
    rendererRef.current?.setZoom(1.2);
    const viewport = rendererRef.current?.getViewport();
    if (viewport) setCurrentZoom(viewport.zoom);
  }, []);

  const handleZoomOut = useCallback(() => {
    rendererRef.current?.setZoom(0.8);
    const viewport = rendererRef.current?.getViewport();
    if (viewport) setCurrentZoom(viewport.zoom);
  }, []);

  const handleAutoFit = useCallback(() => {
    rendererRef.current?.autoFit();
    const viewport = rendererRef.current?.getViewport();
    if (viewport) setCurrentZoom(viewport.zoom);
  }, []);

  return (
    <div className={styles.canvasContainer}>
      <canvas ref={canvasRef} className={styles.canvas} />
      <ZoomControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onAutoFit={handleAutoFit}
        currentZoom={currentZoom}
        position="bottom-right"
      />
    </div>
  );
}
```

**TDD Approach**:
- **RED (2 hours)**: Write comprehensive integration tests
  - Test scroll wheel zoom in/out with correct factors
  - Test scroll wheel zooms towards cursor position
  - Test click-drag updates pan offset
  - Test cursor changes (grab → grabbing → grab)
  - Test pinch-to-zoom gesture events
  - Test ZoomControls button handlers update renderer
  - Test keyboard shortcuts via ZoomControls work
  - Test current zoom indicator updates on all zoom events
  - Mock `CanvasRenderer` methods (spy on setZoom, setPan, autoFit)
- **GREEN (3 hours)**: Implement interaction handlers
- **REFACTOR (1 hour)**: Extract gesture handlers, optimize event listeners, debounce zoom indicator updates

**Test Coverage Target**: 90% (40-45 tests)

---

## 🧪 Testing Strategy

### Test Files to Create/Modify
1. `webview-ui/src/office/layout/viewportTypes.test.ts` (Layer 1: 20-25 tests) — NEW
2. `webview-ui/src/office/engine/canvasRenderer.test.ts` (Layer 2: add 25-30 zoom/pan tests) — MODIFY
3. `webview-ui/src/components/ZoomControls.test.tsx` (Layer 3: 30-35 tests) — NEW
4. `webview-ui/src/office/OfficeCanvas.test.tsx` (Layer 4: add 40-45 interaction tests) — MODIFY

### Total Test Count Target
**115-135 new tests** across all layers

### Performance Benchmarks
- **Auto-fit calculation**: <1ms (synchronous, no async)
- **Zoom operation**: <2ms (viewport update + re-render)
- **Pan operation**: <1ms (viewport update only)
- **Frame rate**: 60 FPS maintained during zoom/pan (no dropped frames)

### Manual Testing Checklist
- [ ] Auto-fit centers layout on load with 90% fill
- [ ] Scroll wheel zooms in/out by 20% per scroll
- [ ] Scroll wheel zooms towards cursor position (not canvas center)
- [ ] Click-drag pans canvas smoothly
- [ ] Cursor changes to grab/grabbing during pan
- [ ] Pinch-to-zoom works on trackpad (macOS)
- [ ] Zoom controls buttons respond immediately
- [ ] Keyboard shortcuts work (Cmd/Ctrl +, -, 0)
- [ ] Zoom indicator updates in real-time (shows rounded %)
- [ ] Zoom clamped to 10%-300% range
- [ ] Auto-fit button restores initial view
- [ ] Zoom/pan work with sprites and furniture visible

---

## 📦 Definition of Done

✅ All 10 acceptance criteria verified (AC1-AC10)  
✅ All 4 layers implemented and tested (115-135 tests passing)  
✅ Test coverage >90% (viewport utils 100%, renderer 95%, component 100%, integration 85%)  
✅ Performance benchmarks met (<2ms zoom, 60 FPS maintained)  
✅ Code review approved (13-point checklist, 0 critical issues)  
✅ Visual regression test passed (screenshot comparison to Penpot)  
✅ BDD scenarios passing (zoom-pan-controls.feature)  
✅ Documentation updated (inline comments, JSDoc for public APIs)  
✅ Zero regressions (full webview-ui test suite passing)  
✅ Accessibility: WCAG 2.1 AA (keyboard nav, ARIA labels, focus management)  
✅ Design system compliance: colors/spacing match `design-systems.md v2.0.0`  
✅ Git commit: `TDD-EPIC-003-US-003-003-GREEN-01: Implement zoom & pan controls with auto-fit`

---

## 🎯 Implementation Sequence

**Critical Path**: Layer 1 → Layer 2 → Layer 3 → Layer 4 (strict dependencies)

**Day 1** (8 hours):
- ✅ Layer 1: Viewport types + utilities (2 hours)
- ✅ Layer 2: CanvasRenderer zoom/pan methods (4 hours)
- ✅ Layer 3: ZoomControls component start (2 hours)

**Day 2** (6 hours):
- ✅ Layer 3: ZoomControls finish + tests (2 hours)
- ✅ Layer 4: Canvas interaction handlers (4 hours)

**Optional polish** (2-4 hours):
- ✅ Smooth zoom transitions (CSS transitions or tween library)
- ✅ Visual feedback (zoom level indicator, pan cursor)
- ✅ Performance optimization (throttle zoom updates)

---

## 🚨 Risk Areas & Mitigation

### Risk 1: Pinch-to-Zoom Gesture Events Not Supported in VS Code Webview
**Likelihood**: Medium  
**Impact**: Medium (AC3 fails, but users have alternatives)  
**Mitigation**:
- Test in actual VS Code webview (not just browser)
- Fallback: Detect gesture event support, show warning if unavailable
- Alternative: Two-finger scroll for zoom (standard trackpad behavior)
- Document known limitation in release notes

### Risk 2: Zoom Towards Cursor Math Incorrect
**Likelihood**: Low  
**Impact**: Medium (zooms towards wrong point, confusing UX)  
**Mitigation**:
- Write unit tests with known input/output pairs
- Visual debugging: draw crosshair at cursor position during zoom
- Reference implementation from established libraries (e.g., Leaflet, OpenLayers)
- Test with edge cases (cursor at canvas edge, very high zoom)

### Risk 3: Pan Performance Degrades with Large Offsets
**Likelihood**: Low  
**Impact**: Low (panning feels sluggish)  
**Mitigation**:
- Profile pan operation (Chrome DevTools Performance tab)
- Avoid re-rendering entire canvas on every mousemove
- Throttle/debounce pan updates (max 60 FPS)
- Use `requestAnimationFrame` for smooth updates

### Risk 4: Auto-Fit Calculation Off by a Few Pixels
**Likelihood**: Low  
**Impact**: Low (layout slightly clipped or extra whitespace)  
**Mitigation**:
- Test with various canvas sizes (small, medium, large, extreme aspect ratios)
- Visual regression test with screenshot comparison
- Round zoom/pan values to nearest pixel (avoid sub-pixel rendering issues)

---

## 💡 Technical Notes

### Coordinate Systems
- **Canvas coordinates**: Pixels from top-left corner of canvas element (used by mouse events)
- **World coordinates**: Grid units (e.g., furniture at grid position [4, 3])
- **Viewport coordinates**: Canvas coordinates after zoom/pan transformation

**Transformation**:
```
canvasX = worldX * gridSize * zoom + panX
canvasY = worldY * gridSize * zoom + panY
```

**Inverse transformation** (cursor to world):
```
worldX = (canvasX - panX) / (gridSize * zoom)
worldY = (canvasY - panY) / (gridSize * zoom)
```

### Zoom Clamping
- **Min zoom**: 0.1 (10%) — prevents zooming out too far (layout becomes tiny dot)
- **Max zoom**: 3.0 (300%) — prevents zooming in too far (loses context, only see 1-2 grid cells)
- Users can still pan to see adjacent areas at max zoom

### Browser Compatibility
- **Scroll wheel zoom**: ✅ All modern browsers
- **Click-drag pan**: ✅ All modern browsers
- **Pinch-to-zoom gesture**: ⚠️ Safari/WebKit only (gesturestart/change/end events)
  - Chrome/Firefox: Use wheel event with `e.ctrlKey` for pinch detection
  - Fallback: Two-finger scroll (already handled by wheel event)

### Performance Optimization
- **Throttle zoom updates**: Max 60 FPS (16.67ms between updates)
- **Debounce zoom indicator**: Update display only after 100ms idle (avoid flicker)
- **Skip render if viewport unchanged**: Check zoom/pan delta before calling `render()`
- **Use CSS transforms** for zoom indicator (GPU-accelerated, smoother)

---

## 🔗 Related Documentation

- **Architecture**: `/docs/02-architecture/architecture-design.md` (canvas rendering, viewport management)
- **Design System**: `/docs/02-architecture/design-systems.md` v2.0.0 (button colors, spacing)
- **US-003-001**: Office Canvas Grid (dependency — COMPLETE, provides `CanvasRenderer.autoFit()`)
- **Penpot Export**: Figma/Penpot design boards (zoom controls visual reference)
- **Leaflet Documentation**: https://leafletjs.com/ (reference for zoom/pan math)
- **Canvas API**: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API (roundRect, transforms)

---

**Dev-Lead Approval**: ⬜ Pending  
**Plan Version**: 1.0  
**Last Updated**: 2026-04-27
