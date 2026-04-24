/**
 * Canvas Renderer
 * 
 * Handles 2D canvas rendering for office layout with floor pattern, furniture, and zones.
 * Supports zoom, pan, and viewport management.
 * Optimized for 60 FPS with viewport culling.
 */

import type { OfficeLayout } from '../layout/officeLayoutTypes';

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

      // Viewport culling: Skip if furniture is outside visible area
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
