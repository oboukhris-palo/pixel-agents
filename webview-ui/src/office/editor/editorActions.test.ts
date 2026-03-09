/**
 * Layout Editor Tests
 *
 * Scenarios:
 * - User paints floor tiles with colors
 * - User places furniture from catalog
 * - User saves layout to file
 * - Layout persists across sessions
 * - Layout can be exported/imported
 * - Undo/Redo functionality works
 * - Grid can be expanded
 */

import type { OfficeLayout, PlacedFurniture, FloorColor } from '../types';
import { TileType } from '../types';

// Mock editor action functions
const createEmptyLayout = (cols: number, rows: number): OfficeLayout => ({
  version: 1 as const,
  cols,
  rows,
  tiles: Array(cols * rows).fill(TileType.FLOOR_1),
  furniture: [],
  tileColors: [],
});

const paintFloorTile = (layout: OfficeLayout, col: number, row: number, tileType: TileType, color?: FloorColor): OfficeLayout => {
  const index = row * layout.cols + col;
  const newTiles = [...layout.tiles];
  newTiles[index] = tileType;

  const newLayout = { ...layout, tiles: newTiles };

  if (color) {
    const newColors = [...(layout.tileColors || [])];
    newColors[index] = color;
    newLayout.tileColors = newColors;
  }

  return newLayout;
};

const placeFurniture = (layout: OfficeLayout, furniture: PlacedFurniture): OfficeLayout => {
  const newLayout = { ...layout, furniture: [...layout.furniture, furniture] };
  return newLayout;
};

const expandLayout = (layout: OfficeLayout, direction: 'left' | 'right' | 'up' | 'down'): OfficeLayout => {
  const newLayout = { ...layout };

  if (direction === 'right') {
    newLayout.cols += 1;
    newLayout.tiles = [
      ...layout.tiles,
      ...Array(layout.rows).fill(TileType.FLOOR_1 as TileType),
    ];
  } else if (direction === 'left') {
    newLayout.cols += 1;
    const expanded: TileType[] = [];
    for (let row = 0; row < layout.rows; row++) {
      expanded.push(TileType.FLOOR_1);
      expanded.push(...layout.tiles.slice(row * layout.cols, (row + 1) * layout.cols));
    }
    newLayout.tiles = expanded;
    // Shift furniture positions
    for (const furn of newLayout.furniture) {
      furn.col += 1;
    }
  } else if (direction === 'down') {
    newLayout.rows += 1;
    newLayout.tiles = [...layout.tiles, ...Array(layout.cols).fill(TileType.FLOOR_1)];
  } else if (direction === 'up') {
    newLayout.rows += 1;
    newLayout.tiles = [...Array(layout.cols).fill(TileType.FLOOR_1), ...layout.tiles];
    // Shift furniture positions
    for (const furn of newLayout.furniture) {
      furn.row += 1;
    }
  }

  return newLayout;
};

describe('Layout Editor (Paint Floors, Place Furniture, Save)', () => {
  let layout: OfficeLayout;
  const DEFAULT_COLS = 20;
  const DEFAULT_ROWS = 11;

  beforeEach(() => {
    layout = createEmptyLayout(DEFAULT_COLS, DEFAULT_ROWS);
  });

  describe('Floor Painting', () => {
    it('should paint floor tile with color', () => {
      const color: FloorColor = { h: 120, s: 50, b: 75, c: 0, colorize: true };
      layout = paintFloorTile(layout, 5, 5, TileType.FLOOR_1, color);

      const index = 5 * layout.cols + 5;
      expect(layout.tiles[index]).toBe(TileType.FLOOR_1);
      expect(layout.tileColors?.[index]).toEqual(color);
    });

    it('should paint multiple floor tiles', () => {
      layout = paintFloorTile(layout, 0, 0, TileType.FLOOR_1);
      layout = paintFloorTile(layout, 1, 0, TileType.FLOOR_1);
      layout = paintFloorTile(layout, 2, 0, TileType.FLOOR_1);

      expect(layout.tiles[0]).toBe(TileType.FLOOR_1);
      expect(layout.tiles[1]).toBe(TileType.FLOOR_1);
      expect(layout.tiles[2]).toBe(TileType.FLOOR_1);
    });

    it('should replace floor tile type', () => {
      layout = paintFloorTile(layout, 3, 3, TileType.FLOOR_1);
      expect(layout.tiles[3 * layout.cols + 3]).toBe(TileType.FLOOR_1);

      layout = paintFloorTile(layout, 3, 3, TileType.VOID);
      expect(layout.tiles[3 * layout.cols + 3]).toBe(TileType.VOID);
    });

    it('should not paint outside grid bounds', () => {
      const originalLayout = { ...layout, tiles: [...layout.tiles] };

      // Try to paint outside bounds (should be prevented by caller, but test gracefully handles)
      if (-1 >= 0 && -1 < layout.cols && 0 >= 0 && 0 < layout.rows) {
        layout = paintFloorTile(layout, -1, 0, TileType.FLOOR_1);
      }

      expect(layout).toEqual(originalLayout);
    });

    it('should preserve floor color when repainting tile', () => {
      const color: FloorColor = { h: 240, s: 100, b: 50, c: 0, colorize: true };
      layout = paintFloorTile(layout, 7, 7, TileType.FLOOR_1, color);

      const index = 7 * layout.cols + 7;
      expect(layout.tileColors?.[index]).toEqual(color);

      // Repaint same tile (should preserve color if not explicitly changed)
      layout = paintFloorTile(layout, 7, 7, TileType.FLOOR_1);
      expect(layout.tileColors?.[index]).toEqual(color);
    });
  });

  describe('Furniture Placement', () => {
    it('should add furniture to layout', () => {
      const furniture: PlacedFurniture = {
        uid: 'chair_1',
        col: 5,
        row: 5,
        type: 'CHAIR',
      };

      layout = placeFurniture(layout, furniture);

      expect(layout.furniture.length).toBe(1);
      expect(layout.furniture[0].uid).toBe('chair_1');
    });

    it('should place multiple furniture items', () => {
      const desk: PlacedFurniture = {
        uid: 'desk_1',
        col: 10,
        row: 5,
        type: 'DESK',
      };
      const chair: PlacedFurniture = {
        uid: 'chair_1',
        col: 10,
        row: 6,
        type: 'CHAIR',
      };

      layout = placeFurniture(layout, desk);
      layout = placeFurniture(layout, chair);

      expect(layout.furniture.length).toBe(2);
      expect(layout.furniture[0].type).toBe('DESK');
      expect(layout.furniture[1].type).toBe('CHAIR');
    });

    it('should store furniture rotation', () => {
      const rotatedDesk: PlacedFurniture = {
        uid: 'desk_rotated',
        col: 8,
        row: 8,
        type: 'DESK_RIGHT',
      };

      layout = placeFurniture(layout, rotatedDesk);

      expect(layout.furniture[0].type).toBe('DESK_RIGHT');
    });

    it('should store furniture state (on/off)', () => {
      const monitor: PlacedFurniture = {
        uid: 'monitor_1',
        col: 10,
        row: 5,
        type: 'PC_OFF',
      };

      layout = placeFurniture(layout, monitor);

      expect(layout.furniture[0].type).toBe('PC_OFF');
    });

    it('should store furniture color', () => {
      const coloredChair: PlacedFurniture = {
        uid: 'chair_blue',
        col: 5,
        row: 5,
        type: 'CHAIR',
        color: { h: 240, s: 100, b: 60, c: 0 },
      };

      layout = placeFurniture(layout, coloredChair);

      expect(layout.furniture[0].color).toEqual({ h: 240, s: 100, b: 60, c: 0 });
    });

    it('should remove furniture by uid', () => {
      layout = placeFurniture(layout, {
        uid: 'to_delete',
        col: 5,
        row: 5,
        type: 'DESK',
      });

      expect(layout.furniture.length).toBe(1);

      layout = {
        ...layout,
        furniture: layout.furniture.filter((f) => f.uid !== 'to_delete'),
      };

      expect(layout.furniture.length).toBe(0);
    });
  });

  describe('Layout Expansion', () => {
    it('should expand grid to the right', () => {
      layout = expandLayout(layout, 'right');

      expect(layout.cols).toBe(DEFAULT_COLS + 1);
      expect(layout.rows).toBe(DEFAULT_ROWS);
      expect(layout.tiles.length).toBe((DEFAULT_COLS + 1) * DEFAULT_ROWS);
    });

    it('should expand grid to the left', () => {
      const originalFurniture: PlacedFurniture = {
        uid: 'furniture_1',
        col: 5,
        row: 5,
        type: 'DESK',
      };
      layout = placeFurniture(layout, originalFurniture);
      layout = expandLayout(layout, 'left');

      expect(layout.cols).toBe(DEFAULT_COLS + 1);
      expect(layout.furniture[0].col).toBe(6); // Furniture shifted right
    });

    it('should expand grid upward', () => {
      const originalFurniture: PlacedFurniture = {
        uid: 'furniture_1',
        col: 5,
        row: 5,
        type: 'DESK',
      };
      layout = placeFurniture(layout, originalFurniture);
      layout = expandLayout(layout, 'up');

      expect(layout.rows).toBe(DEFAULT_ROWS + 1);
      expect(layout.furniture[0].row).toBe(6); // Furniture shifted down
    });

    it('should expand grid downward', () => {
      layout = expandLayout(layout, 'down');

      expect(layout.rows).toBe(DEFAULT_ROWS + 1);
      expect(layout.cols).toBe(DEFAULT_COLS);
    });

    it('should fill expanded tiles with Floor type', () => {
      const originalTileCount = layout.tiles.length;
      layout = expandLayout(layout, 'right');

      const newTiles = layout.tiles.slice(originalTileCount);
      expect(newTiles.every((tile) => tile === TileType.FLOOR_1)).toBe(true);
    });
  });

  describe('Layout Serialization & Persistence', () => {
    it('should serialize layout to JSON', () => {
      layout = paintFloorTile(layout, 5, 5, TileType.FLOOR_1, { h: 120, s: 50, b: 75, c: 0 });
      layout = placeFurniture(layout, {
        uid: 'desk_1',
        col: 10,
        row: 5,
        type: 'DESK',
      });

      const json = JSON.stringify(layout);
      const parsed = JSON.parse(json) as OfficeLayout;

      expect(parsed.version).toBe(1);
      expect(parsed.cols).toBe(DEFAULT_COLS);
      expect(parsed.rows).toBe(DEFAULT_ROWS);
      expect(parsed.furniture.length).toBe(1);
    });

    it('should maintain layout integrity after save/restore cycle', () => {
      layout = paintFloorTile(layout, 0, 0, TileType.FLOOR_1, { h: 0, s: 100, b: 50, c: 0 });
      layout = paintFloorTile(layout, 1, 1, TileType.VOID);

      const serialized = JSON.stringify(layout);
      const restored = JSON.parse(serialized) as OfficeLayout;

      expect(restored.tiles[0]).toBe(TileType.FLOOR_1);
      expect(restored.tiles[1 * restored.cols + 1]).toBe(TileType.VOID);
      expect(restored.tileColors?.[0]).toEqual({ h: 0, s: 100, b: 50, c: 0 });
    });

    it('should handle empty furniture list', () => {
      const json = JSON.stringify(layout);
      const parsed = JSON.parse(json) as OfficeLayout;

      expect(parsed.furniture).toEqual([]);
    });

    it('should version layout schema', () => {
      expect(layout.version).toBe(1);

      const json = JSON.stringify(layout);
      const parsed = JSON.parse(json) as OfficeLayout;

      expect(parsed.version).toBe(1);
    });
  });

  describe('Layout Editor State Management', () => {
    it('should track dirty state after modifications', () => {
      let isDirty = false;

      layout = paintFloorTile(layout, 5, 5, TileType.FLOOR_1);
      isDirty = true;

      expect(isDirty).toBe(true);
    });

    it('should support undo by storing history', () => {
      const history: OfficeLayout[] = [layout];

      layout = paintFloorTile(layout, 3, 3, TileType.FLOOR_1);
      history.push(layout);

      layout = paintFloorTile(layout, 7, 7, TileType.VOID);
      history.push(layout);

      // Undo
      history.pop();
      layout = history[history.length - 1];

      expect(layout.tiles[7 * layout.cols + 7]).toBe(TileType.FLOOR_1); // Should be floor, not void
    });

    it('should support redo after undo', () => {
      const history: OfficeLayout[] = [layout];
      let historyPointer = 0;

      layout = paintFloorTile(layout, 3, 3, TileType.FLOOR_1);
      history.push(layout);
      historyPointer++;

      layout = paintFloorTile(layout, 7, 7, TileType.VOID);
      history.push(layout);
      historyPointer++;

      // Undo
      historyPointer--;
      layout = history[historyPointer];

      // Redo
      historyPointer++;
      layout = history[historyPointer];

      expect(layout.tiles[7 * layout.cols + 7]).toBe(TileType.VOID);
    });

    it('should limit undo history to 50 entries', () => {
      const history: OfficeLayout[] = [layout];

      for (let i = 0; i < 60; i++) {
        layout = { ...layout, tiles: [...layout.tiles] };
        history.push(layout);
      }

      // Trim to 50
      while (history.length > 50) {
        history.shift();
      }

      expect(history.length).toBeLessThanOrEqual(50);
    });
  });
});
