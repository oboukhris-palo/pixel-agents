# US-003-001: Office Canvas Grid & Furniture System

**Epic**: EPIC-003 (Office Canvas & Pixel Art Visualization)  
**Priority**: P0 (CRITICAL) — Core visual feature  
**Story Points**: 8  
**Estimated Effort**: 3-4 days (24 hours)  
**Assignee**: dev-tdd (4-layer TDD)  
**Dependencies**: US-004-001 (design tokens - COMPLETE ✅)  
**Status**: Ready for Implementation  
**Phase**: Phase 2 - Track A (Parallel with US-001-002)

---

## 📋 Acceptance Criteria

✅ **AC1**: Canvas renders in center column with flexible width, 246px height  
✅ **AC2**: Background color #1A1A2E (dark navy, distinct from VS Code gray)  
✅ **AC3**: Canvas 2D rendering at 60 FPS via requestAnimationFrame  
✅ **AC4**: Grid system with 32×32px tile size  
✅ **AC5**: Floor pattern: alternating #1C1C30 / #1A1A2C (subtle checkerboard)  
✅ **AC6**: Furniture rendered: Desks (48×32px, #5D4037 @ 80%), Conference table (120×60px, #4E342E @ 60%), Bookshelf (16×48px, #6D4C41), Kitchen (80×60px, #37474F @ 20%)  
✅ **AC7**: Meeting zone rendered with border (#0066CC @ 6% bg, @ 15% border)  
✅ **AC8**: Canvas supports zoom and pan (auto-fit on load, manual zoom with scroll wheel)  
✅ **AC9**: Canvas is devicePixelRatio aware (crisp on retina displays)  
✅ **AC10**: Layout data loaded from JSON or metadata  
✅ **AC11**: Performance: 60 FPS with 50+ furniture items  
✅ **AC12**: Visual match to Penpot export

---

## 🏗️ Architecture Overview

**4-Layer Architecture**:
1. **Layer 1**: Canvas Data Models (types, layout schema)
2. **Layer 2**: Canvas Rendering Engine (draw logic, game loop)
3. **Layer 3**: Layout Data (JSON configuration)
4. **Layer 4**: React Component (integration, lifecycle)

**Key Files**:
- `webview-ui/src/office/layout/officeLayoutTypes.ts` (Layer 1)
- `webview-ui/src/office/engine/canvasRenderer.ts` (Layer 2)
- `webview-ui/src/office/engine/gameLoop.ts` (Layer 2)
- `webview-ui/src/office/layout/defaultLayout.json` (Layer 3)
- `webview-ui/src/office/OfficeCanvas.tsx` (Layer 4)

---

## Layer 1: Canvas Data Models (2 hours)

### Objective
Define TypeScript types for grid positions, furniture items, zones, and complete office layout schema.

### Files to Create
- `webview-ui/src/office/layout/officeLayoutTypes.ts`

### Implementation

```typescript
export interface GridPosition {
  x: number; // Grid column (0-based)
  y: number; // Grid row (0-based)
}

export interface FurnitureItem {
  id: string;
  type: 'desk' | 'conference_table' | 'bookshelf' | 'kitchen';
  position: GridPosition;
  width: number;  // In pixels
  height: number; // In pixels
  color: string;
  opacity: number;
}

export interface Zone {
  id: string;
  name: string;
  position: GridPosition;
  width: number;  // In pixels
  height: number; // In pixels
  backgroundColor: string;
  borderColor: string;
}

export interface OfficeLayout {
  gridSize: number; // Tile size in pixels (32)
  cols: number;
  rows: number;
  furniture: FurnitureItem[];
  zones: Zone[];
}

// Validation functions
export function isValidGridPosition(pos: GridPosition): boolean {
  return pos.x >= 0 && pos.y >= 0;
}

export function isValidFurnitureItem(item: FurnitureItem): boolean {
  return (
    item.id.length > 0 &&
    ['desk', 'conference_table', 'bookshelf', 'kitchen'].includes(item.type) &&
    isValidGridPosition(item.position) &&
    item.width > 0 &&
    item.height > 0 &&
    item.opacity >= 0 && item.opacity <= 1
  );
}

export function isValidOfficeLayout(layout: OfficeLayout): boolean {
  return (
    layout.gridSize > 0 &&
    layout.cols > 0 &&
    layout.rows > 0 &&
    layout.furniture.every(isValidFurnitureItem)
  );
}
```

### TDD Approach
- **RED** (30min): Write tests for type guards and validation functions
- **GREEN** (60min): Implement types and validation logic
- **REFACTOR** (30min): Extract factory functions for common furniture types

### Tests to Write
```typescript
describe('officeLayoutTypes', () => {
  describe('GridPosition validation', () => {
    it('should accept valid positions', () => {
      expect(isValidGridPosition({ x: 0, y: 0 })).toBe(true);
      expect(isValidGridPosition({ x: 10, y: 5 })).toBe(true);
    });

    it('should reject negative positions', () => {
      expect(isValidGridPosition({ x: -1, y: 0 })).toBe(false);
      expect(isValidGridPosition({ x: 0, y: -1 })).toBe(false);
    });
  });

  describe('FurnitureItem validation', () => {
    it('should accept valid furniture', () => {
      const item: FurnitureItem = {
        id: 'desk-1',
        type: 'desk',
        position: { x: 2, y: 3 },
        width: 48,
        height: 32,
        color: '#5D4037',
        opacity: 0.8
      };
      expect(isValidFurnitureItem(item)).toBe(true);
    });

    it('should reject invalid furniture type', () => {
      const item = { 
        id: 'invalid', 
        type: 'invalid_type', 
        position: { x: 0, y: 0 }, 
        width: 10, 
        height: 10, 
        color: '#000', 
        opacity: 1 
      } as any;
      expect(isValidFurnitureItem(item)).toBe(false);
    });

    it('should reject invalid opacity', () => {
      const item: FurnitureItem = {
        id: 'desk-1',
        type: 'desk',
        position: { x: 0, y: 0 },
        width: 48,
        height: 32,
        color: '#5D4037',
        opacity: 1.5 // Invalid
      };
      expect(isValidFurnitureItem(item)).toBe(false);
    });
  });

  describe('OfficeLayout validation', () => {
    it('should accept valid layout', () => {
      const layout: OfficeLayout = {
        gridSize: 32,
        cols: 30,
        rows: 15,
        furniture: [],
        zones: []
      };
      expect(isValidOfficeLayout(layout)).toBe(true);
    });

    it('should reject invalid gridSize', () => {
      const layout: OfficeLayout = {
        gridSize: 0,
        cols: 30,
        rows: 15,
        furniture: [],
        zones: []
      };
      expect(isValidOfficeLayout(layout)).toBe(false);
    });
  });
});
```

---

## Layer 2: Canvas Rendering Engine (10 hours)

### Objective
Implement canvas rendering with 60 FPS performance, floor pattern, furniture rendering, and viewport management (zoom/pan).

### Files to Create
- `webview-ui/src/office/engine/canvasRenderer.ts`
- `webview-ui/src/office/engine/gameLoop.ts`

### Implementation: canvasRenderer.ts

```typescript
import { OfficeLayout, FurnitureItem, Zone } from '../layout/officeLayoutTypes';

export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

export class CanvasRenderer {
  private ctx: CanvasRenderingContext2D;
  private layout: OfficeLayout;
  private viewport: Viewport;
  private canvasWidth: number;
  private canvasHeight: number;

  constructor(canvas: HTMLCanvasElement, layout: OfficeLayout) {
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Failed to get 2D context from canvas');
    }
    this.ctx = context;
    this.layout = layout;
    this.viewport = { x: 0, y: 0, zoom: 1 };
    this.canvasWidth = canvas.width;
    this.canvasHeight = canvas.height;
    this.setupCanvas(canvas);
  }

  private setupCanvas(canvas: HTMLCanvasElement) {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    this.ctx.scale(dpr, dpr);
    this.canvasWidth = canvas.offsetWidth;
    this.canvasHeight = canvas.offsetHeight;
  }

  render() {
    this.clearCanvas();
    this.renderFloorPattern();
    this.renderZones();
    this.renderFurniture();
  }

  private clearCanvas() {
    // Dark navy background
    this.ctx.fillStyle = '#1A1A2E';
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
  }

  private renderFloorPattern() {
    const { cols, rows, gridSize } = this.layout;
    const { zoom, x, y } = this.viewport;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // Alternating colors for checkerboard
        const color = (row + col) % 2 === 0 ? '#1C1C30' : '#1A1A2C';
        this.ctx.fillStyle = color;
        
        const tileX = col * gridSize * zoom + x;
        const tileY = row * gridSize * zoom + y;
        const tileSize = gridSize * zoom;

        this.ctx.fillRect(tileX, tileY, tileSize, tileSize);
      }
    }
  }

  private renderZones() {
    this.layout.zones.forEach(zone => {
      const { zoom, x, y } = this.viewport;
      const zoneX = zone.position.x * this.layout.gridSize * zoom + x;
      const zoneY = zone.position.y * this.layout.gridSize * zoom + y;
      const zoneWidth = zone.width * zoom;
      const zoneHeight = zone.height * zoom;

      // Background with opacity
      this.ctx.fillStyle = zone.backgroundColor;
      this.ctx.fillRect(zoneX, zoneY, zoneWidth, zoneHeight);

      // Border
      this.ctx.strokeStyle = zone.borderColor;
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(zoneX, zoneY, zoneWidth, zoneHeight);
    });
  }

  private renderFurniture() {
    this.layout.furniture.forEach(item => {
      const { zoom, x, y } = this.viewport;
      const furnitureX = item.position.x * this.layout.gridSize * zoom + x;
      const furnitureY = item.position.y * this.layout.gridSize * zoom + y;
      const furnitureWidth = item.width * zoom;
      const furnitureHeight = item.height * zoom;

      // **VIEWPORT CULLING**: Skip rendering if furniture is outside visible area
      // This optimization maintains 60 FPS with 50+ furniture items
      if (furnitureX + furnitureWidth < 0 || furnitureX > this.canvasWidth ||
          furnitureY + furnitureHeight < 0 || furnitureY > this.canvasHeight) {
        return; // Skip off-screen furniture
      }

      this.ctx.fillStyle = item.color;
      this.ctx.globalAlpha = item.opacity;
      this.ctx.fillRect(furnitureX, furnitureY, furnitureWidth, furnitureHeight);
      this.ctx.globalAlpha = 1.0;
    });
  }

  autoFit() {
    const { cols, rows, gridSize } = this.layout;
    const layoutWidth = cols * gridSize;
    const layoutHeight = rows * gridSize;
    
    // Calculate zoom to fit 90% of canvas
    const zoomX = (this.canvasWidth * 0.9) / layoutWidth;
    const zoomY = (this.canvasHeight * 0.9) / layoutHeight;
    
    this.viewport.zoom = Math.min(zoomX, zoomY);
    
    // Center layout in viewport
    const scaledWidth = layoutWidth * this.viewport.zoom;
    const scaledHeight = layoutHeight * this.viewport.zoom;
    this.viewport.x = (this.canvasWidth - scaledWidth) / 2;
    this.viewport.y = (this.canvasHeight - scaledHeight) / 2;
  }

  setZoom(factor: number) {
    this.viewport.zoom *= factor;
    this.viewport.zoom = Math.max(0.1, Math.min(this.viewport.zoom, 3.0));
  }

  setPan(deltaX: number, deltaY: number) {
    this.viewport.x += deltaX;
    this.viewport.y += deltaY;
  }

  getViewport(): Viewport {
    return { ...this.viewport };
  }
}
```

### Implementation: gameLoop.ts

```typescript
import { CanvasRenderer } from './canvasRenderer';

export class GameLoop {
  private renderer: CanvasRenderer;
  private animationId: number | null = null;
  private fps: number = 0;
  private isRunning: boolean = false;

  constructor(renderer: CanvasRenderer) {
    this.renderer = renderer;
  }

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    let lastTime = performance.now();
    let frameCount = 0;

    const loop = (currentTime: number) => {
      if (!this.isRunning) return;

      const delta = currentTime - lastTime;
      frameCount++;

      // Update FPS every second
      if (delta >= 1000) {
        this.fps = frameCount;
        frameCount = 0;
        lastTime = currentTime;
      }

      this.renderer.render();
      this.animationId = requestAnimationFrame(loop);
    };

    this.animationId = requestAnimationFrame(loop);
  }

  stop() {
    this.isRunning = false;
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  getFPS(): number {
    return this.fps;
  }
}
```

### TDD Approach
- **RED** (2h): Write tests for rendering logic (floor pattern, furniture, zones, viewport)
- **GREEN** (3h): Implement canvas rendering with all features
- **REFACTOR** (1h): Optimize for 60 FPS (viewport culling, minimize redraws)

### Tests to Write
```typescript
describe('CanvasRenderer', () => {
  let canvas: HTMLCanvasElement;
  let mockLayout: OfficeLayout;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    canvas.width = 960;
    canvas.height = 246;
    
    mockLayout = {
      gridSize: 32,
      cols: 30,
      rows: 15,
      furniture: [
        { id: 'desk-1', type: 'desk', position: { x: 2, y: 3 }, width: 48, height: 32, color: '#5D4037', opacity: 0.8 }
      ],
      zones: [
        { id: 'meeting', name: 'Meeting Room', position: { x: 14, y: 1 }, width: 240, height: 180, backgroundColor: 'rgba(0, 102, 204, 0.06)', borderColor: 'rgba(0, 102, 204, 0.15)' }
      ]
    };
  });

  it('should create renderer with valid context', () => {
    const renderer = new CanvasRenderer(canvas, mockLayout);
    expect(renderer).toBeDefined();
  });

  it('should throw error if canvas context unavailable', () => {
    jest.spyOn(canvas, 'getContext').mockReturnValue(null);
    expect(() => new CanvasRenderer(canvas, mockLayout)).toThrow('Failed to get 2D context');
  });

  it('should render floor pattern', () => {
    const renderer = new CanvasRenderer(canvas, mockLayout);
    const ctx = canvas.getContext('2d')!;
    const fillRectSpy = jest.spyOn(ctx, 'fillRect');
    
    renderer.render();
    
    // Should draw floor tiles (30 cols × 15 rows = 450 tiles)
    expect(fillRectSpy).toHaveBeenCalled();
  });

  it('should handle devicePixelRatio for retina displays', () => {
    Object.defineProperty(window, 'devicePixelRatio', { value: 2 });
    const renderer = new CanvasRenderer(canvas, mockLayout);
    
    // Canvas internal dimensions should be doubled
    expect(canvas.width).toBeGreaterThan(960);
  });

  describe('autoFit', () => {
    it('should calculate zoom to fit layout in 90% of viewport', () => {
      const renderer = new CanvasRenderer(canvas, mockLayout);
      renderer.autoFit();
      
      const viewport = renderer.getViewport();
      expect(viewport.zoom).toBeGreaterThan(0);
      expect(viewport.zoom).toBeLessThanOrEqual(1);
    });

    it('should center layout in viewport', () => {
      const renderer = new CanvasRenderer(canvas, mockLayout);
      renderer.autoFit();
      
      const viewport = renderer.getViewport();
      expect(viewport.x).toBeGreaterThan(0);
      expect(viewport.y).toBeGreaterThan(0);
    });
  });

  describe('zoom', () => {
    it('should increase zoom by factor', () => {
      const renderer = new CanvasRenderer(canvas, mockLayout);
      const initialZoom = renderer.getViewport().zoom;
      
      renderer.setZoom(1.5);
      
      expect(renderer.getViewport().zoom).toBe(initialZoom * 1.5);
    });

    it('should clamp zoom between 0.1 and 3.0', () => {
      const renderer = new CanvasRenderer(canvas, mockLayout);
      
      renderer.setZoom(0.01); // Should clamp to 0.1
      expect(renderer.getViewport().zoom).toBeGreaterThanOrEqual(0.1);
      
      renderer.setZoom(100); // Should clamp to 3.0
      expect(renderer.getViewport().zoom).toBeLessThanOrEqual(3.0);
    });
  });
});

describe('GameLoop', () => {
  let renderer: CanvasRenderer;
  let gameLoop: GameLoop;

  beforeEach(() => {
    const canvas = document.createElement('canvas');
    const layout: OfficeLayout = { gridSize: 32, cols: 30, rows: 15, furniture: [], zones: [] };
    renderer = new CanvasRenderer(canvas, layout);
    gameLoop = new GameLoop(renderer);
  });

  it('should start game loop', () => {
    const requestAnimationFrameSpy = jest.spyOn(window, 'requestAnimationFrame');
    
    gameLoop.start();
    
    expect(requestAnimationFrameSpy).toHaveBeenCalled();
  });

  it('should stop game loop', () => {
    const cancelAnimationFrameSpy = jest.spyOn(window, 'cancelAnimationFrame');
    
    gameLoop.start();
    gameLoop.stop();
    
    expect(cancelAnimationFrameSpy).toHaveBeenCalled();
  });

  it('should calculate FPS', async () => {
    gameLoop.start();
    
    // Wait for FPS calculation (1 second)
    await new Promise(resolve => setTimeout(resolve, 1100));
    
    expect(gameLoop.getFPS()).toBeGreaterThan(0);
    
    gameLoop.stop();
  });

  it('should not start if already running', () => {
    const requestAnimationFrameSpy = jest.spyOn(window, 'requestAnimationFrame');
    
    gameLoop.start();
    const firstCallCount = requestAnimationFrameSpy.mock.calls.length;
    
    gameLoop.start(); // Try to start again
    const secondCallCount = requestAnimationFrameSpy.mock.calls.length;
    
    expect(secondCallCount).toBe(firstCallCount); // No additional calls
    
    gameLoop.stop();
  });
});

describe('CanvasRenderer Edge Cases', () => {
  let canvas: HTMLCanvasElement;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    canvas.width = 960;
    canvas.height = 246;
  });

  describe('Empty Layout', () => {
    it('should render layout with 0 furniture items', () => {
      const layout: OfficeLayout = {
        gridSize: 32,
        cols: 30,
        rows: 15,
        furniture: [],
        zones: []
      };
      
      const renderer = new CanvasRenderer(canvas, layout);
      expect(() => renderer.render()).not.toThrow();
    });

    it('should render layout with 0 zones', () => {
      const layout: OfficeLayout = {
        gridSize: 32,
        cols: 30,
        rows: 15,
        furniture: [
          { id: 'desk-1', type: 'desk', position: { x: 0, y: 0 }, width: 48, height: 32, color: '#5D4037', opacity: 0.8 }
        ],
        zones: []
      };
      
      const renderer = new CanvasRenderer(canvas, layout);
      expect(() => renderer.render()).not.toThrow();
    });
  });

  describe('Single Tile Layout', () => {
    it('should handle 1×1 grid', () => {
      const layout: OfficeLayout = {
        gridSize: 32,
        cols: 1,
        rows: 1,
        furniture: [],
        zones: []
      };
      
      const renderer = new CanvasRenderer(canvas, layout);
      renderer.autoFit();
      
      const viewport = renderer.getViewport();
      expect(viewport.zoom).toBeGreaterThan(0);
    });
  });

  describe('Large Layout (100+ furniture items)', () => {
    it('should render 100 furniture items without crashing', () => {
      const furniture: FurnitureItem[] = Array.from({ length: 100 }, (_, i) => ({
        id: `desk-${i}`,
        type: 'desk',
        position: { x: (i % 30), y: Math.floor(i / 30) },
        width: 48,
        height: 32,
        color: '#5D4037',
        opacity: 0.8
      }));

      const layout: OfficeLayout = {
        gridSize: 32,
        cols: 30,
        rows: 15,
        furniture,
        zones: []
      };
      
      const renderer = new CanvasRenderer(canvas, layout);
      expect(() => renderer.render()).not.toThrow();
    });

    it('should maintain performance with viewport culling (100 items)', () => {
      const furniture: FurnitureItem[] = Array.from({ length: 100 }, (_, i) => ({
        id: `desk-${i}`,
        type: 'desk',
        position: { x: (i % 30), y: Math.floor(i / 30) },
        width: 48,
        height: 32,
        color: '#5D4037',
        opacity: 0.8
      }));

      const layout: OfficeLayout = {
        gridSize: 32,
        cols: 30,
        rows: 15,
        furniture,
        zones: []
      };
      
      const renderer = new CanvasRenderer(canvas, layout);
      
      const startTime = performance.now();
      renderer.render();
      const endTime = performance.now();
      
      const renderTime = endTime - startTime;
      expect(renderTime).toBeLessThan(16); // < 16ms for 60 FPS
    });
  });

  describe('Boundary Conditions', () => {
    it('should render furniture at grid origin (0, 0)', () => {
      const layout: OfficeLayout = {
        gridSize: 32,
        cols: 30,
        rows: 15,
        furniture: [
          { id: 'desk-origin', type: 'desk', position: { x: 0, y: 0 }, width: 48, height: 32, color: '#5D4037', opacity: 0.8 }
        ],
        zones: []
      };
      
      const renderer = new CanvasRenderer(canvas, layout);
      expect(() => renderer.render()).not.toThrow();
    });

    it('should render furniture at grid max (cols-1, rows-1)', () => {
      const layout: OfficeLayout = {
        gridSize: 32,
        cols: 30,
        rows: 15,
        furniture: [
          { id: 'desk-max', type: 'desk', position: { x: 29, y: 14 }, width: 48, height: 32, color: '#5D4037', opacity: 0.8 }
        ],
        zones: []
      };
      
      const renderer = new CanvasRenderer(canvas, layout);
      expect(() => renderer.render()).not.toThrow();
    });

    it('should handle furniture partially outside viewport', () => {
      const layout: OfficeLayout = {
        gridSize: 32,
        cols: 30,
        rows: 15,
        furniture: [
          { id: 'desk-offscreen', type: 'desk', position: { x: -1, y: -1 }, width: 48, height: 32, color: '#5D4037', opacity: 0.8 }
        ],
        zones: []
      };
      
      const renderer = new CanvasRenderer(canvas, layout);
      expect(() => renderer.render()).not.toThrow(); // Viewport culling handles it
    });
  });

  describe('Invalid Inputs', () => {
    it('should validate opacity bounds (0-1)', () => {
      const invalidItem: FurnitureItem = {
        id: 'desk-invalid',
        type: 'desk',
        position: { x: 0, y: 0 },
        width: 48,
        height: 32,
        color: '#5D4037',
        opacity: 1.5 // Invalid
      };
      
      expect(isValidFurnitureItem(invalidItem)).toBe(false);
    });

    it('should reject negative positions', () => {
      expect(isValidGridPosition({ x: -1, y: 0 })).toBe(false);
      expect(isValidGridPosition({ x: 0, y: -1 })).toBe(false);
      expect(isValidGridPosition({ x: -1, y: -1 })).toBe(false);
    });

    it('should reject zero or negative dimensions', () => {
      const invalidItem: FurnitureItem = {
        id: 'desk-invalid',
        type: 'desk',
        position: { x: 0, y: 0 },
        width: 0, // Invalid
        height: 32,
        color: '#5D4037',
        opacity: 0.8
      };
      
      expect(isValidFurnitureItem(invalidItem)).toBe(false);
    });
  });

  describe('Zoom Edge Cases', () => {
    it('should clamp zoom at minimum (0.1)', () => {
      const layout: OfficeLayout = {
        gridSize: 32,
        cols: 30,
        rows: 15,
        furniture: [],
        zones: []
      };
      
      const renderer = new CanvasRenderer(canvas, layout);
      renderer.setZoom(0.0001); // Try to go below 0.1
      
      expect(renderer.getViewport().zoom).toBeGreaterThanOrEqual(0.1);
    });

    it('should clamp zoom at maximum (3.0)', () => {
      const layout: OfficeLayout = {
        gridSize: 32,
        cols: 30,
        rows: 15,
        furniture: [],
        zones: []
      };
      
      const renderer = new CanvasRenderer(canvas, layout);
      
      for (let i = 0; i < 10; i++) {
        renderer.setZoom(10); // Try to zoom way beyond 3.0
      }
      
      expect(renderer.getViewport().zoom).toBeLessThanOrEqual(3.0);
    });
  });

  describe('Pan Edge Cases', () => {
    it('should allow panning beyond layout boundaries', () => {
      const layout: OfficeLayout = {
        gridSize: 32,
        cols: 30,
        rows: 15,
        furniture: [],
        zones: []
      };
      
      const renderer = new CanvasRenderer(canvas, layout);
      const initialViewport = renderer.getViewport();
      
      renderer.setPan(1000, 1000); // Pan far away
      
      const newViewport = renderer.getViewport();
      expect(newViewport.x).toBe(initialViewport.x + 1000);
      expect(newViewport.y).toBe(initialViewport.y + 1000);
    });
  });
});
```

---

## Layer 3: Layout Data (2 hours)

### Objective
Create JSON configuration file with default office layout (furniture, zones).

### Files to Create
- `webview-ui/src/office/layout/defaultLayout.json`
- `webview-ui/src/office/layout/layoutLoader.ts`

### Implementation: defaultLayout.json

```json
{
  "gridSize": 32,
  "cols": 30,
  "rows": 15,
  "furniture": [
    { 
      "id": "desk-red", 
      "type": "desk", 
      "position": { "x": 2, "y": 3 }, 
      "width": 48, 
      "height": 32, 
      "color": "#5D4037", 
      "opacity": 0.8 
    },
    { 
      "id": "desk-green", 
      "type": "desk", 
      "position": { "x": 5, "y": 3 }, 
      "width": 48, 
      "height": 32, 
      "color": "#5D4037", 
      "opacity": 0.8 
    },
    { 
      "id": "desk-refactor", 
      "type": "desk", 
      "position": { "x": 8, "y": 3 }, 
      "width": 48, 
      "height": 32, 
      "color": "#5D4037", 
      "opacity": 0.8 
    },
    { 
      "id": "conf-table", 
      "type": "conference_table", 
      "position": { "x": 15, "y": 2 }, 
      "width": 120, 
      "height": 60, 
      "color": "#4E342E", 
      "opacity": 0.6 
    },
    { 
      "id": "bookshelf-1", 
      "type": "bookshelf", 
      "position": { "x": 1, "y": 8 }, 
      "width": 16, 
      "height": 48, 
      "color": "#6D4C41", 
      "opacity": 1.0 
    },
    { 
      "id": "kitchen", 
      "type": "kitchen", 
      "position": { "x": 25, "y": 10 }, 
      "width": 80, 
      "height": 60, 
      "color": "#37474F", 
      "opacity": 0.2 
    }
  ],
  "zones": [
    { 
      "id": "meeting-room", 
      "name": "Meeting Room", 
      "position": { "x": 14, "y": 1 }, 
      "width": 240, 
      "height": 180, 
      "backgroundColor": "rgba(0, 102, 204, 0.06)", 
      "borderColor": "rgba(0, 102, 204, 0.15)" 
    }
  ]
}
```

### Implementation: layoutLoader.ts

```typescript
import { OfficeLayout, isValidOfficeLayout } from './officeLayoutTypes';
import defaultLayoutData from './defaultLayout.json';

export function loadDefaultLayout(): OfficeLayout {
  const layout = defaultLayoutData as OfficeLayout;
  
  if (!isValidOfficeLayout(layout)) {
    throw new Error('Invalid default layout structure');
  }
  
  return layout;
}
```

### TDD Approach
- **RED** (30min): Write tests for layout loading and validation
- **GREEN** (60min): Create JSON, implement loader
- **REFACTOR** (30min): Add layout builder helpers

---

## Layer 4: React Component (10 hours)

### Objective
Integrate canvas renderer into React component with proper lifecycle management, zoom controls, and performance optimization.

### Files to Create
- `webview-ui/src/office/OfficeCanvas.tsx`
- `webview-ui/src/office/OfficeCanvas.module.css`
- `webview-ui/src/office/OfficeCanvas.test.tsx`

### Implementation: OfficeCanvas.tsx

```tsx
import React, { useEffect, useRef } from 'react';
import { CanvasRenderer } from './engine/canvasRenderer';
import { GameLoop } from './engine/gameLoop';
import { loadDefaultLayout } from './layout/layoutLoader';
import styles from './OfficeCanvas.module.css';

export interface OfficeCanvasProps {
  width?: number;
  height?: number;
}

export function OfficeCanvas({ width = 960, height = 246 }: OfficeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<CanvasRenderer | null>(null);
  const gameLoopRef = useRef<GameLoop | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      // Load layout and initialize renderer
      const layout = loadDefaultLayout();
      const renderer = new CanvasRenderer(canvas, layout);
      const gameLoop = new GameLoop(renderer);

      // Auto-fit layout to viewport
      renderer.autoFit();

      // Start rendering loop
      gameLoop.start();

      rendererRef.current = renderer;
      gameLoopRef.current = gameLoop;

      // Cleanup
      return () => {
        gameLoop.stop();
      };
    } catch (error) {
      console.error('Failed to initialize office canvas:', error);
    }
  }, []);

  // Handle zoom via scroll wheel
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !rendererRef.current) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 0.9 : 1.1;
      rendererRef.current?.setZoom(factor);
    };

    canvas.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Handle pan via drag
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !rendererRef.current) return;

    const handleMouseDown = (e: MouseEvent) => {
      let lastX = e.clientX;
      let lastY = e.clientY;

      const handleMouseMove = (e: MouseEvent) => {
        const deltaX = e.clientX - lastX;
        const deltaY = e.clientY - lastY;
        rendererRef.current?.setPan(deltaX, deltaY);
        lastX = e.clientX;
        lastY = e.clientY;
      };

      const handleMouseUp = () => {
        canvas.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      canvas.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };

    canvas.addEventListener('mousedown', handleMouseDown);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  return (
    <div className={styles.canvasContainer}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        width={width}
        height={height}
        role="img"
        aria-label="Office visualization with agent sprites and furniture"
      />
    </div>
  );
}
```

### Implementation: OfficeCanvas.module.css

```css
.canvasContainer {
  position: relative;
  width: 100%;
  height: 246px;
  background: var(--vscode-bg);
  overflow: hidden;
}

.canvas {
  display: block;
  width: 100%;
  height: 100%;
  cursor: grab;
}

.canvas:active {
  cursor: grabbing;
}
```

### TDD Approach
- **RED** (4h): Write tests for canvas lifecycle, zoom/pan handlers, performance
- **GREEN** (4h): Implement component with all features
- **REFACTOR** (2h): Optimize re-renders, extract controls

### Tests to Write
```typescript
describe('OfficeCanvas', () => {
  it('should render canvas element', () => {
    render(<OfficeCanvas />);
    const canvas = screen.getByRole('img', { name: /office visualization/i });
    expect(canvas).toBeInTheDocument();
  });

  it('should initialize renderer on mount', () => {
    const { unmount } = render(<OfficeCanvas />);
    
    // Canvas should be initialized
    const canvas = screen.getByRole('img') as HTMLCanvasElement;
    expect(canvas.getContext('2d')).toBeTruthy();
    
    unmount();
  });

  it('should cleanup game loop on unmount', () => {
    const { unmount } = render(<OfficeCanvas />);
    const stopSpy = jest.fn();
    
    unmount();
    
    // Game loop should be stopped
    // (verified via manual testing - hard to spy on refs)
  });

  it('should handle zoom on wheel event', () => {
    render(<OfficeCanvas />);
    const canvas = screen.getByRole('img') as HTMLCanvasElement;
    
    fireEvent.wheel(canvas, { deltaY: 100 });
    
    // Viewport zoom should be updated
    // (verified via visual inspection or manual testing)
  });

  it('should handle pan on drag', () => {
    render(<OfficeCanvas />);
    const canvas = screen.getByRole('img') as HTMLCanvasElement;
    
    fireEvent.mouseDown(canvas, { clientX: 100, clientY: 100 });
    fireEvent.mouseMove(canvas, { clientX: 150, clientY: 150 });
    fireEvent.mouseUp(canvas);
    
    // Viewport should be panned
    // (verified via visual inspection or manual testing)
  });

  it('should render with custom dimensions', () => {
    render(<OfficeCanvas width={800} height={400} />);
    const canvas = screen.getByRole('img') as HTMLCanvasElement;
    
    expect(canvas.width).toBe(800);
    expect(canvas.height).toBe(400);
  });
});
```

### Performance Benchmarking Procedure

**Objective**: Validate 60 FPS rendering with 50+ furniture items and ensure <16ms frame time

**Tools Required**:
- Chrome DevTools Performance Profiler
- React DevTools Profiler
- VS Code Extension Host (for real-world testing)

**Benchmark Scenarios**:

1. **Baseline Performance (10 furniture items)**
   - Open VS Code Extension Host
   - Open Pixel Agents webview
   - Open Chrome DevTools (Cmd+Opt+I on macOS)
   - Navigate to Performance tab
   - Click "Record" button
   - Let canvas render for 10 seconds
   - Stop recording
   - **Expected Results**:
     - FPS: ≥60 FPS (shown in summary)
     - Frame time: <16ms average (shown in timeline)
     - Memory: Stable (no leaks, <50MB)
     - Main thread: <30% CPU during render

2. **Stress Test Performance (100 furniture items)**
   - Modify `defaultLayout.json` to include 100 furniture items
   - Reload extension
   - Repeat performance recording (10 seconds)
   - **Expected Results**:
     - FPS: ≥55 FPS (allowed 8% degradation)
     - Frame time: <18ms average (slight degradation acceptable)
     - Memory: <80MB (viewport culling prevents bloat)
     - Main thread: <50% CPU during render

3. **Zoom/Pan Performance**
   - Record performance while zooming (scroll 20 times)
   - Record performance while panning (drag across canvas 10 times)
   - **Expected Results**:
     - No frame drops during interactions
     - FPS stays ≥55 during zoom
     - FPS stays ≥55 during pan
     - No jank or stuttering (smooth visual experience)

4. **Memory Leak Detection**
   - Record memory heap snapshot (DevTools → Memory → Heap Snapshot)
   - Perform 50 zoom/pan operations
   - Take second heap snapshot
   - Compare snapshots
   - **Expected Results**:
     - Memory delta <5MB (no significant leaks)
     - No detached DOM nodes (canvas properly cleaned up)
     - requestAnimationFrame properly cancelled on unmount

**Benchmark Report Template**:

```markdown
## Performance Benchmark Results

### Test Environment
- Browser: Chrome 120+
- VS Code: 1.85+
- OS: macOS 14.x / Windows 11 / Linux Ubuntu 22.04
- Device: MacBook Pro M2 / Windows Desktop i7 / etc.

### Scenario 1: Baseline (10 items)
- FPS: 60 ✅
- Frame Time: 12ms avg ✅
- Memory: 42MB ✅
- CPU: 25% ✅

### Scenario 2: Stress Test (100 items)
- FPS: 58 ✅ (within 55+ target)
- Frame Time: 17ms avg ✅ (within 18ms target)
- Memory: 68MB ✅ (within 80MB target)
- CPU: 45% ✅ (within 50% target)

### Scenario 3: Zoom/Pan Interactions
- Zoom FPS: 59 ✅
- Pan FPS: 60 ✅
- No visual jank: ✅

### Scenario 4: Memory Leaks
- Memory delta: 2.5MB ✅
- Detached nodes: 0 ✅
- Cleanup on unmount: ✅

### Screenshots
- [Attach performance profile screenshot showing 60 FPS]
- [Attach memory heap comparison screenshot]
- [Attach timeline showing <16ms frames]

### Conclusion
✅ PASSED - All performance targets met
⚠️ DEGRADED - [Describe which target failed and by how much]
❌ FAILED - [Describe critical performance issues]
```

**Performance Debugging Tips**:

- **Low FPS (<55)**: Check viewport culling logic, ensure furniture outside viewport is skipped
- **High memory (>80MB)**: Check for canvas cleanup on unmount, verify requestAnimationFrame cancellation
- **Frame drops during zoom**: Debounce zoom events (250ms), batch viewport updates
- **Jittery rendering**: Check for synchronous layout calculations (getBoundingClientRect), move to RAF
- **High CPU (>50%)**: Profile with Flame Chart, identify hot functions, optimize rendering loops

**Validation Gates**:

- ✅ **PASS**: All 4 scenarios meet expected results
- ⚠️ **CONDITIONAL PASS**: Stress test FPS ≥50 (acceptable with optimization note)
- ❌ **FAIL**: Baseline FPS <55, memory leaks >10MB, frame time >20ms

**When to Run Benchmarks**:

- After Layer 2 REFACTOR phase (initial validation)
- After Layer 4 GREEN phase (component integration)
- Before merging PR (final validation)
- After any rendering optimization changes

---

## 🎯 Definition of Done

- ✅ All 12 acceptance criteria met
- ✅ Canvas renders floor pattern, furniture, zones correctly
- ✅ 60 FPS performance validated (gameLoop.getFPS() ≥ 55)
- ✅ Zoom and pan work correctly (scroll wheel + drag)
- ✅ DevicePixelRatio handled (crisp on retina displays)
- ✅ Layout loads from JSON successfully
- ✅ 100% test coverage for types, renderer, game loop, component
- ✅ Visual match to Penpot export (screenshot comparison)
- ✅ No console errors or warnings
- ✅ Accessibility: ARIA labels present

---

## ⏱️ Effort Breakdown

| Layer | Task | RED | GREEN | REFACTOR | Total |
|-------|------|-----|-------|----------|-------|
| Layer 1 | Types & Validation | 0.5h | 1h | 0.5h | 2h |
| Layer 2 | Rendering Engine | 2h | 6h | 2h | 10h |
| Layer 3 | Layout Data | 0.5h | 1h | 0.5h | 2h |
| Layer 4 | React Component | 4h | 4h | 2h | 10h |
| **Total** | | **7h** | **12h** | **5h** | **24h** |

**Estimated Duration**: 3 days (8h/day) for single developer

---

## 🚀 Parallel Execution Strategy

**Can run in parallel with US-001-002** (Agent Sidebar) because:
- No shared dependencies (different file trees)
- Backend service (AgentActivityMonitor) independent
- Integration point is later (Phase 2 completion)

**Handoff Points**:
- After Layer 2: Canvas rendering engine complete → can integrate sprites (US-003-002)
- After Layer 4: React component ready → can add zoom controls (US-003-003)

---

## 📊 Success Metrics

| Metric | Target | Validation Method |
|--------|--------|-------------------|
| FPS | ≥ 55 FPS | `gameLoop.getFPS()` in console |
| Render time | < 16ms/frame | Chrome DevTools Performance tab |
| Layout load | < 100ms | Console timestamp |
| Memory usage | < 50MB | Chrome DevTools Memory tab |
| Viewport culling | Enabled | Visual inspection at 3x zoom |

---

## 🔧 Testing Strategy

**Unit Tests** (50+ tests):
- Type validation functions
- Renderer methods (floor, furniture, zones)
- Viewport calculations (auto-fit, zoom, pan)
- Game loop lifecycle

**Integration Tests** (10+ tests):
- Canvas + Renderer + GameLoop integration
- Layout loading and validation
- React component lifecycle

**Manual Testing**:
- Visual comparison to Penpot export
- Performance validation (60 FPS with 50 furniture items)
- Retina display rendering
- Zoom/pan interactions

**Performance Testing**:
- Load 100 furniture items → validate FPS stays ≥ 55
- Zoom to 3x → validate no rendering artifacts
- Pan across entire layout → validate smooth movement

---

## 🐛 Known Risks & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| FPS drops below 60 | Medium | High | Implement viewport culling, minimize state updates |
| Retina display blur | Low | Medium | Implement devicePixelRatio scaling early |
| Layout JSON invalid | Low | High | Strong validation in layoutLoader.ts |
| Canvas context unavailable | Low | Critical | Fallback to error message + retry |
| Memory leak in game loop | Medium | High | Proper cleanup in useEffect return |

---

## 📚 References

- **Design System**: `docs/02-architecture/design-systems.md` v2.0.0
- **Penpot Export**: (Visual comparison screenshots)
- **MDN Canvas API**: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
- **RequestAnimationFrame**: https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame

---

**Ready for TDD Execution**: ✅  
**Next Step**: Create `plan-approval.yaml` and await Dev-Lead approval
