import {
  GridPosition,
  FurnitureItem,
  Zone,
  OfficeLayout,
  isValidGridPosition,
  isValidFurnitureItem,
  isValidZone,
  isValidOfficeLayout,
  createDesk,
  createConferenceTable,
  createBookshelf,
  createKitchen,
} from './officeLayoutTypes';

describe('officeLayoutTypes', () => {
  describe('GridPosition validation', () => {
    it('should accept valid positions', () => {
      expect(isValidGridPosition({ x: 0, y: 0 })).toBe(true);
      expect(isValidGridPosition({ x: 10, y: 5 })).toBe(true);
      expect(isValidGridPosition({ x: 100, y: 100 })).toBe(true);
    });

    it('should reject negative x positions', () => {
      expect(isValidGridPosition({ x: -1, y: 0 })).toBe(false);
      expect(isValidGridPosition({ x: -10, y: 5 })).toBe(false);
    });

    it('should reject negative y positions', () => {
      expect(isValidGridPosition({ x: 0, y: -1 })).toBe(false);
      expect(isValidGridPosition({ x: 5, y: -10 })).toBe(false);
    });

    it('should reject both negative coordinates', () => {
      expect(isValidGridPosition({ x: -1, y: -1 })).toBe(false);
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
        opacity: 0.8,
      };
      expect(isValidFurnitureItem(item)).toBe(true);
    });

    it('should reject empty id', () => {
      const item: FurnitureItem = {
        id: '',
        type: 'desk',
        position: { x: 0, y: 0 },
        width: 48,
        height: 32,
        color: '#5D4037',
        opacity: 0.8,
      };
      expect(isValidFurnitureItem(item)).toBe(false);
    });

    it('should reject invalid furniture type', () => {
      const item = {
        id: 'invalid',
        type: 'invalid_type',
        position: { x: 0, y: 0 },
        width: 48,
        height: 32,
        color: '#5D4037',
        opacity: 1,
      } as any;
      expect(isValidFurnitureItem(item)).toBe(false);
    });

    it('should accept all valid furniture types', () => {
      const types: Array<'desk' | 'conference_table' | 'bookshelf' | 'kitchen'> = [
        'desk',
        'conference_table',
        'bookshelf',
        'kitchen',
      ];

      types.forEach((type) => {
        const item: FurnitureItem = {
          id: `${type}-1`,
          type,
          position: { x: 0, y: 0 },
          width: 48,
          height: 32,
          color: '#5D4037',
          opacity: 0.8,
        };
        expect(isValidFurnitureItem(item)).toBe(true);
      });
    });

    it('should reject invalid position', () => {
      const item: FurnitureItem = {
        id: 'desk-1',
        type: 'desk',
        position: { x: -1, y: 0 },
        width: 48,
        height: 32,
        color: '#5D4037',
        opacity: 0.8,
      };
      expect(isValidFurnitureItem(item)).toBe(false);
    });

    it('should reject zero width', () => {
      const item: FurnitureItem = {
        id: 'desk-1',
        type: 'desk',
        position: { x: 0, y: 0 },
        width: 0,
        height: 32,
        color: '#5D4037',
        opacity: 0.8,
      };
      expect(isValidFurnitureItem(item)).toBe(false);
    });

    it('should reject negative width', () => {
      const item: FurnitureItem = {
        id: 'desk-1',
        type: 'desk',
        position: { x: 0, y: 0 },
        width: -10,
        height: 32,
        color: '#5D4037',
        opacity: 0.8,
      };
      expect(isValidFurnitureItem(item)).toBe(false);
    });

    it('should reject zero height', () => {
      const item: FurnitureItem = {
        id: 'desk-1',
        type: 'desk',
        position: { x: 0, y: 0 },
        width: 48,
        height: 0,
        color: '#5D4037',
        opacity: 0.8,
      };
      expect(isValidFurnitureItem(item)).toBe(false);
    });

    it('should reject negative height', () => {
      const item: FurnitureItem = {
        id: 'desk-1',
        type: 'desk',
        position: { x: 0, y: 0 },
        width: 48,
        height: -10,
        color: '#5D4037',
        opacity: 0.8,
      };
      expect(isValidFurnitureItem(item)).toBe(false);
    });

    it('should reject opacity below 0', () => {
      const item: FurnitureItem = {
        id: 'desk-1',
        type: 'desk',
        position: { x: 0, y: 0 },
        width: 48,
        height: 32,
        color: '#5D4037',
        opacity: -0.1,
      };
      expect(isValidFurnitureItem(item)).toBe(false);
    });

    it('should reject opacity above 1', () => {
      const item: FurnitureItem = {
        id: 'desk-1',
        type: 'desk',
        position: { x: 0, y: 0 },
        width: 48,
        height: 32,
        color: '#5D4037',
        opacity: 1.5,
      };
      expect(isValidFurnitureItem(item)).toBe(false);
    });

    it('should accept opacity at boundaries (0 and 1)', () => {
      const item1: FurnitureItem = {
        id: 'desk-1',
        type: 'desk',
        position: { x: 0, y: 0 },
        width: 48,
        height: 32,
        color: '#5D4037',
        opacity: 0,
      };
      expect(isValidFurnitureItem(item1)).toBe(true);

      const item2: FurnitureItem = {
        id: 'desk-2',
        type: 'desk',
        position: { x: 0, y: 0 },
        width: 48,
        height: 32,
        color: '#5D4037',
        opacity: 1,
      };
      expect(isValidFurnitureItem(item2)).toBe(true);
    });
  });

  describe('Zone validation', () => {
    it('should accept valid zone', () => {
      const zone: Zone = {
        id: 'meeting-room',
        name: 'Meeting Room',
        position: { x: 14, y: 1 },
        width: 240,
        height: 180,
        backgroundColor: 'rgba(0, 102, 204, 0.06)',
        borderColor: 'rgba(0, 102, 204, 0.15)',
      };
      expect(isValidZone(zone)).toBe(true);
    });

    it('should reject empty id', () => {
      const zone: Zone = {
        id: '',
        name: 'Meeting Room',
        position: { x: 0, y: 0 },
        width: 240,
        height: 180,
        backgroundColor: 'rgba(0, 102, 204, 0.06)',
        borderColor: 'rgba(0, 102, 204, 0.15)',
      };
      expect(isValidZone(zone)).toBe(false);
    });

    it('should reject invalid position', () => {
      const zone: Zone = {
        id: 'meeting-room',
        name: 'Meeting Room',
        position: { x: -1, y: 0 },
        width: 240,
        height: 180,
        backgroundColor: 'rgba(0, 102, 204, 0.06)',
        borderColor: 'rgba(0, 102, 204, 0.15)',
      };
      expect(isValidZone(zone)).toBe(false);
    });

    it('should reject zero or negative dimensions', () => {
      const zone1: Zone = {
        id: 'meeting-room',
        name: 'Meeting Room',
        position: { x: 0, y: 0 },
        width: 0,
        height: 180,
        backgroundColor: 'rgba(0, 102, 204, 0.06)',
        borderColor: 'rgba(0, 102, 204, 0.15)',
      };
      expect(isValidZone(zone1)).toBe(false);

      const zone2: Zone = {
        id: 'meeting-room',
        name: 'Meeting Room',
        position: { x: 0, y: 0 },
        width: 240,
        height: 0,
        backgroundColor: 'rgba(0, 102, 204, 0.06)',
        borderColor: 'rgba(0, 102, 204, 0.15)',
      };
      expect(isValidZone(zone2)).toBe(false);
    });
  });

  describe('OfficeLayout validation', () => {
    it('should accept valid layout', () => {
      const layout: OfficeLayout = {
        gridSize: 32,
        cols: 30,
        rows: 15,
        furniture: [
          {
            id: 'desk-1',
            type: 'desk',
            position: { x: 0, y: 0 },
            width: 48,
            height: 32,
            color: '#5D4037',
            opacity: 0.8,
          },
        ],
        zones: [
          {
            id: 'meeting-room',
            name: 'Meeting Room',
            position: { x: 14, y: 1 },
            width: 240,
            height: 180,
            backgroundColor: 'rgba(0, 102, 204, 0.06)',
            borderColor: 'rgba(0, 102, 204, 0.15)',
          },
        ],
      };
      expect(isValidOfficeLayout(layout)).toBe(true);
    });

    it('should accept layout with empty furniture array', () => {
      const layout: OfficeLayout = {
        gridSize: 32,
        cols: 30,
        rows: 15,
        furniture: [],
        zones: [],
      };
      expect(isValidOfficeLayout(layout)).toBe(true);
    });

    it('should reject zero gridSize', () => {
      const layout: OfficeLayout = {
        gridSize: 0,
        cols: 30,
        rows: 15,
        furniture: [],
        zones: [],
      };
      expect(isValidOfficeLayout(layout)).toBe(false);
    });

    it('should reject negative gridSize', () => {
      const layout: OfficeLayout = {
        gridSize: -1,
        cols: 30,
        rows: 15,
        furniture: [],
        zones: [],
      };
      expect(isValidOfficeLayout(layout)).toBe(false);
    });

    it('should reject zero cols', () => {
      const layout: OfficeLayout = {
        gridSize: 32,
        cols: 0,
        rows: 15,
        furniture: [],
        zones: [],
      };
      expect(isValidOfficeLayout(layout)).toBe(false);
    });

    it('should reject zero rows', () => {
      const layout: OfficeLayout = {
        gridSize: 32,
        cols: 30,
        rows: 0,
        furniture: [],
        zones: [],
      };
      expect(isValidOfficeLayout(layout)).toBe(false);
    });

    it('should reject layout with invalid furniture', () => {
      const layout: OfficeLayout = {
        gridSize: 32,
        cols: 30,
        rows: 15,
        furniture: [
          {
            id: '',
            type: 'desk',
            position: { x: 0, y: 0 },
            width: 48,
            height: 32,
            color: '#5D4037',
            opacity: 0.8,
          },
        ],
        zones: [],
      };
      expect(isValidOfficeLayout(layout)).toBe(false);
    });

    it('should reject layout with invalid zone', () => {
      const layout: OfficeLayout = {
        gridSize: 32,
        cols: 30,
        rows: 15,
        furniture: [],
        zones: [
          {
            id: '',
            name: 'Meeting Room',
            position: { x: 0, y: 0 },
            width: 240,
            height: 180,
            backgroundColor: 'rgba(0, 102, 204, 0.06)',
            borderColor: 'rgba(0, 102, 204, 0.15)',
          },
        ],
      };
      expect(isValidOfficeLayout(layout)).toBe(false);
    });

    it('should validate all furniture items', () => {
      const layout: OfficeLayout = {
        gridSize: 32,
        cols: 30,
        rows: 15,
        furniture: [
          {
            id: 'desk-1',
            type: 'desk',
            position: { x: 0, y: 0 },
            width: 48,
            height: 32,
            color: '#5D4037',
            opacity: 0.8,
          },
          {
            id: 'desk-2',
            type: 'desk',
            position: { x: -1, y: 0 }, // Invalid position
            width: 48,
            height: 32,
            color: '#5D4037',
            opacity: 0.8,
          },
        ],
        zones: [],
      };
      expect(isValidOfficeLayout(layout)).toBe(false);
    });

    it('should validate all zones', () => {
      const layout: OfficeLayout = {
        gridSize: 32,
        cols: 30,
        rows: 15,
        furniture: [],
        zones: [
          {
            id: 'zone-1',
            name: 'Zone 1',
            position: { x: 0, y: 0 },
            width: 100,
            height: 100,
            backgroundColor: '#000',
            borderColor: '#FFF',
          },
          {
            id: 'zone-2',
            name: 'Zone 2',
            position: { x: 0, y: 0 },
            width: 0, // Invalid width
            height: 100,
            backgroundColor: '#000',
            borderColor: '#FFF',
          },
        ],
      };
      expect(isValidOfficeLayout(layout)).toBe(false);
    });
  });

  describe('Factory functions', () => {
    describe('createDesk', () => {
      it('creates a valid FurnitureItem with type desk', () => {
        const desk = createDesk('d1', 2, 3);
        expect(desk.id).toBe('d1');
        expect(desk.type).toBe('desk');
        expect(desk.position).toEqual({ x: 2, y: 3 });
        expect(isValidFurnitureItem(desk)).toBe(true);
      });

      it('creates desks with positive dimensions', () => {
        const desk = createDesk('d2', 0, 0);
        expect(desk.width).toBeGreaterThan(0);
        expect(desk.height).toBeGreaterThan(0);
      });

      it('creates desk with valid opacity (0-1)', () => {
        const desk = createDesk('d3', 0, 0);
        expect(desk.opacity).toBeGreaterThanOrEqual(0);
        expect(desk.opacity).toBeLessThanOrEqual(1);
      });
    });

    describe('createConferenceTable', () => {
      it('creates a valid FurnitureItem with type conference_table', () => {
        const table = createConferenceTable('ct1', 10, 5);
        expect(table.id).toBe('ct1');
        expect(table.type).toBe('conference_table');
        expect(table.position).toEqual({ x: 10, y: 5 });
        expect(isValidFurnitureItem(table)).toBe(true);
      });

      it('conference table is wider than a desk', () => {
        const table = createConferenceTable('ct2', 0, 0);
        const desk = createDesk('d4', 0, 0);
        expect(table.width).toBeGreaterThan(desk.width);
      });
    });

    describe('createBookshelf', () => {
      it('creates a valid FurnitureItem with type bookshelf', () => {
        const shelf = createBookshelf('bs1', 1, 8);
        expect(shelf.id).toBe('bs1');
        expect(shelf.type).toBe('bookshelf');
        expect(shelf.position).toEqual({ x: 1, y: 8 });
        expect(isValidFurnitureItem(shelf)).toBe(true);
      });
    });

    describe('createKitchen', () => {
      it('creates a valid FurnitureItem with type kitchen', () => {
        const kitchen = createKitchen('k1', 25, 10);
        expect(kitchen.id).toBe('k1');
        expect(kitchen.type).toBe('kitchen');
        expect(kitchen.position).toEqual({ x: 25, y: 10 });
        expect(isValidFurnitureItem(kitchen)).toBe(true);
      });
    });

    describe('all factory functions', () => {
      it('each factory produces a layout-compatible item', () => {
        const items = [
          createDesk('d', 0, 0),
          createConferenceTable('ct', 5, 0),
          createBookshelf('bs', 10, 0),
          createKitchen('k', 15, 0),
        ];
        items.forEach(item => expect(isValidFurnitureItem(item)).toBe(true));
      });
    });
  });
});
