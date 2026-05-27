/**
 * Viewport Types Tests (US-003-003 Layer 1)
 */

import {
  clampZoom,
  calculateAutoFitZoom,
  calculateCenterPan,
  zoomAtPoint,
  isValidViewport,
  MIN_ZOOM,
  MAX_ZOOM,
  AUTO_FIT_FILL,
} from './viewportTypes';

// ── clampZoom ─────────────────────────────────────────────────────────────────

describe('clampZoom', () => {
  it('returns value unchanged when in range', () => {
    expect(clampZoom(1)).toBe(1);
    expect(clampZoom(0.5)).toBe(0.5);
    expect(clampZoom(2.5)).toBe(2.5);
  });

  it('clamps below MIN_ZOOM', () => {
    expect(clampZoom(0.01)).toBe(MIN_ZOOM);
    expect(clampZoom(0)).toBe(MIN_ZOOM);
    expect(clampZoom(-1)).toBe(MIN_ZOOM);
  });

  it('clamps above MAX_ZOOM', () => {
    expect(clampZoom(5)).toBe(MAX_ZOOM);
    expect(clampZoom(100)).toBe(MAX_ZOOM);
  });

  it('returns exact boundary values', () => {
    expect(clampZoom(MIN_ZOOM)).toBe(MIN_ZOOM);
    expect(clampZoom(MAX_ZOOM)).toBe(MAX_ZOOM);
  });
});

// ── calculateAutoFitZoom ──────────────────────────────────────────────────────

describe('calculateAutoFitZoom', () => {
  const layout = { cols: 30, rows: 15, gridSize: 32 };
  const canvas = { width: 960, height: 246 };

  it('returns a zoom that fits layout in canvas', () => {
    const zoom = calculateAutoFitZoom(layout, canvas);
    const layoutWidth = layout.cols * layout.gridSize;
    const layoutHeight = layout.rows * layout.gridSize;
    // Scaled dimensions should fit within canvas
    expect(layoutWidth * zoom).toBeLessThanOrEqual(canvas.width);
    expect(layoutHeight * zoom).toBeLessThanOrEqual(canvas.height);
  });

  it('uses the smaller of width and height ratios', () => {
    const zoom = calculateAutoFitZoom(layout, canvas);
    const zoomX = (canvas.width * AUTO_FIT_FILL) / (layout.cols * layout.gridSize);
    const zoomY = (canvas.height * AUTO_FIT_FILL) / (layout.rows * layout.gridSize);
    expect(zoom).toBeCloseTo(Math.min(zoomX, zoomY), 5);
  });

  it('returns 1 for zero-size layout', () => {
    expect(calculateAutoFitZoom({ cols: 0, rows: 10, gridSize: 32 }, canvas)).toBe(1);
    expect(calculateAutoFitZoom({ cols: 10, rows: 0, gridSize: 32 }, canvas)).toBe(1);
  });

  it('clamps result to zoom range', () => {
    // Tiny canvas → very small zoom → clamped to MIN_ZOOM
    const tinyCanvas = { width: 1, height: 1 };
    const zoom = calculateAutoFitZoom(layout, tinyCanvas);
    expect(zoom).toBeGreaterThanOrEqual(MIN_ZOOM);
  });
});

// ── calculateCenterPan ────────────────────────────────────────────────────────

describe('calculateCenterPan', () => {
  const layout = { cols: 30, rows: 15, gridSize: 32 };
  const canvas = { width: 960, height: 246 };

  it('returns pan offsets that center the layout', () => {
    const zoom = 1;
    const pan = calculateCenterPan(layout, canvas, zoom);
    const scaledW = layout.cols * layout.gridSize * zoom;
    const scaledH = layout.rows * layout.gridSize * zoom;
    expect(pan.x).toBeCloseTo((canvas.width - scaledW) / 2);
    expect(pan.y).toBeCloseTo((canvas.height - scaledH) / 2);
  });

  it('handles zoom factor', () => {
    const zoom = 0.5;
    const pan = calculateCenterPan(layout, canvas, zoom);
    expect(typeof pan.x).toBe('number');
    expect(typeof pan.y).toBe('number');
    expect(Number.isFinite(pan.x)).toBe(true);
  });

  it('at zoom=0 returns canvas center', () => {
    const pan = calculateCenterPan(layout, canvas, 0);
    expect(pan.x).toBe(canvas.width / 2);
    expect(pan.y).toBe(canvas.height / 2);
  });
});

// ── zoomAtPoint ───────────────────────────────────────────────────────────────

describe('zoomAtPoint', () => {
  const viewport = { x: 0, y: 0, zoom: 1 };

  it('zooms in at cursor position', () => {
    const result = zoomAtPoint(viewport, 1.2, 480, 123);
    expect(result.zoom).toBeCloseTo(1.2, 5);
  });

  it('zooms out at cursor position', () => {
    const result = zoomAtPoint(viewport, 0.8, 480, 123);
    expect(result.zoom).toBeCloseTo(0.8, 5);
  });

  it('keeps cursor position fixed (zoom at origin)', () => {
    const result = zoomAtPoint(viewport, 2, 0, 0);
    expect(result.x).toBeCloseTo(0);
    expect(result.y).toBeCloseTo(0);
  });

  it('clamps zoom to MAX_ZOOM', () => {
    const highZoom = { x: 0, y: 0, zoom: 2.8 };
    const result = zoomAtPoint(highZoom, 2, 100, 100);
    expect(result.zoom).toBe(MAX_ZOOM);
  });

  it('clamps zoom to MIN_ZOOM', () => {
    const lowZoom = { x: 0, y: 0, zoom: 0.15 };
    const result = zoomAtPoint(lowZoom, 0.5, 100, 100);
    expect(result.zoom).toBe(MIN_ZOOM);
  });

  it('adjusts pan so cursor stays fixed', () => {
    const vp = { x: 50, y: 30, zoom: 1 };
    const cursorX = 200;
    const cursorY = 100;
    const result = zoomAtPoint(vp, 1.5, cursorX, cursorY);
    // At old zoom: worldX = (cursorX - vp.x) / vp.zoom
    // At new zoom: screenX = worldX * newZoom + newPanX should equal cursorX
    const worldX = (cursorX - vp.x) / vp.zoom;
    expect(worldX * result.zoom + result.x).toBeCloseTo(cursorX, 3);
  });
});

// ── isValidViewport ───────────────────────────────────────────────────────────

describe('isValidViewport', () => {
  it('returns true for valid viewport', () => {
    expect(isValidViewport({ x: 0, y: 0, zoom: 1 })).toBe(true);
    expect(isValidViewport({ x: -100, y: 50.5, zoom: 0.5 })).toBe(true);
  });

  it('returns false for zero or negative zoom', () => {
    expect(isValidViewport({ x: 0, y: 0, zoom: 0 })).toBe(false);
    expect(isValidViewport({ x: 0, y: 0, zoom: -1 })).toBe(false);
  });

  it('returns false for non-finite values', () => {
    expect(isValidViewport({ x: NaN, y: 0, zoom: 1 })).toBe(false);
    expect(isValidViewport({ x: 0, y: Infinity, zoom: 1 })).toBe(false);
  });

  it('returns false for non-objects', () => {
    expect(isValidViewport(null)).toBe(false);
    expect(isValidViewport(undefined)).toBe(false);
    expect(isValidViewport('viewport')).toBe(false);
  });

  it('returns false for missing properties', () => {
    expect(isValidViewport({ x: 0, y: 0 })).toBe(false);
    expect(isValidViewport({ zoom: 1 })).toBe(false);
  });
});
