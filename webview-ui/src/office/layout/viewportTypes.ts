/**
 * Viewport Types & Utilities (US-003-003 Layer 1)
 *
 * Type definitions and pure calculation functions for viewport management.
 * Used by CanvasRenderer and ZoomControls for zoom/pan operations.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

export interface LayoutDimensions {
  cols: number;
  rows: number;
  gridSize: number;
}

export interface CanvasDimensions {
  width: number;
  height: number;
}

// ── Constants ─────────────────────────────────────────────────────────────────

export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 3.0;
export const SCROLL_ZOOM_IN_FACTOR = 1.2;
export const SCROLL_ZOOM_OUT_FACTOR = 0.8;
export const AUTO_FIT_FILL = 0.9; // 90% fill

// ── Utility functions ─────────────────────────────────────────────────────────

/** Clamp zoom to allowed range [MIN_ZOOM, MAX_ZOOM]. */
export function clampZoom(zoom: number): number {
  return Math.max(MIN_ZOOM, Math.min(zoom, MAX_ZOOM));
}

/** Calculate the zoom level that fits the layout into the canvas at AUTO_FIT_FILL %. */
export function calculateAutoFitZoom(
  layout: LayoutDimensions,
  canvas: CanvasDimensions,
): number {
  const layoutWidth = layout.cols * layout.gridSize;
  const layoutHeight = layout.rows * layout.gridSize;

  if (layoutWidth <= 0 || layoutHeight <= 0) return 1;

  const zoomX = (canvas.width * AUTO_FIT_FILL) / layoutWidth;
  const zoomY = (canvas.height * AUTO_FIT_FILL) / layoutHeight;

  return clampZoom(Math.min(zoomX, zoomY));
}

/** Calculate pan offsets to center the layout in the canvas at the given zoom. */
export function calculateCenterPan(
  layout: LayoutDimensions,
  canvas: CanvasDimensions,
  zoom: number,
): { x: number; y: number } {
  const scaledWidth = layout.cols * layout.gridSize * zoom;
  const scaledHeight = layout.rows * layout.gridSize * zoom;

  return {
    x: (canvas.width - scaledWidth) / 2,
    y: (canvas.height - scaledHeight) / 2,
  };
}

/** Apply a multiplicative zoom factor centered on a cursor position. */
export function zoomAtPoint(
  viewport: Viewport,
  factor: number,
  cursorX: number,
  cursorY: number,
): Viewport {
  const newZoom = clampZoom(viewport.zoom * factor);
  const zoomRatio = newZoom / viewport.zoom;

  // Adjust pan so cursor position stays fixed on screen
  const newX = cursorX - (cursorX - viewport.x) * zoomRatio;
  const newY = cursorY - (cursorY - viewport.y) * zoomRatio;

  return { x: newX, y: newY, zoom: newZoom };
}

/** Check if a viewport is valid (finite numbers, positive zoom). */
export function isValidViewport(vp: unknown): vp is Viewport {
  if (typeof vp !== 'object' || vp === null) return false;
  const v = vp as Record<string, unknown>;
  return (
    typeof v.x === 'number' && Number.isFinite(v.x) &&
    typeof v.y === 'number' && Number.isFinite(v.y) &&
    typeof v.zoom === 'number' && v.zoom > 0 && Number.isFinite(v.zoom)
  );
}
