/**
 * Office Canvas Layout Types
 * 
 * Defines the type system for office grid layout, furniture items, zones, and complete office layouts.
 * Used by the canvas renderer for 2D visualization.
 */

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
  opacity: number; // 0.0 to 1.0
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
  gridSize: number; // Tile size in pixels (typically 32)
  cols: number;     // Number of columns in grid
  rows: number;     // Number of rows in grid
  furniture: FurnitureItem[];
  zones: Zone[];
}

// Validation functions

export function isValidGridPosition(pos: GridPosition): boolean {
  return pos.x >= 0 && pos.y >= 0;
}

export function isValidFurnitureItem(item: FurnitureItem): boolean {
  const validTypes = ['desk', 'conference_table', 'bookshelf', 'kitchen'];
  
  return (
    item.id.length > 0 &&
    validTypes.includes(item.type) &&
    isValidGridPosition(item.position) &&
    item.width > 0 &&
    item.height > 0 &&
    item.opacity >= 0 &&
    item.opacity <= 1
  );
}

export function isValidZone(zone: Zone): boolean {
  return (
    zone.id.length > 0 &&
    isValidGridPosition(zone.position) &&
    zone.width > 0 &&
    zone.height > 0
  );
}

export function isValidOfficeLayout(layout: OfficeLayout): boolean {
  return (
    layout.gridSize > 0 &&
    layout.cols > 0 &&
    layout.rows > 0 &&
    layout.furniture.every(isValidFurnitureItem) &&
    layout.zones.every(isValidZone)
  );
}

// ─── Factory functions ────────────────────────────────────────────────────────

/** Creates a desk furniture item at the given grid position. */
export function createDesk(id: string, x: number, y: number): FurnitureItem {
  return { id, type: 'desk', position: { x, y }, width: 48, height: 32, color: '#5D4037', opacity: 0.8 };
}

/** Creates a conference table furniture item at the given grid position. */
export function createConferenceTable(id: string, x: number, y: number): FurnitureItem {
  return { id, type: 'conference_table', position: { x, y }, width: 128, height: 64, color: '#4A148C', opacity: 0.85 };
}

/** Creates a bookshelf furniture item at the given grid position. */
export function createBookshelf(id: string, x: number, y: number): FurnitureItem {
  return { id, type: 'bookshelf', position: { x, y }, width: 32, height: 64, color: '#1B5E20', opacity: 0.9 };
}

/** Creates a kitchen furniture item at the given grid position. */
export function createKitchen(id: string, x: number, y: number): FurnitureItem {
  return { id, type: 'kitchen', position: { x, y }, width: 96, height: 64, color: '#E65100', opacity: 0.85 };
}
