import { TileType, FurnitureType, DEFAULT_COLS, DEFAULT_ROWS, TILE_SIZE, Direction } from '../types.js'
import type { TileType as TileTypeVal, OfficeLayout, PlacedFurniture, Seat, FurnitureInstance, FloorColor } from '../types.js'
import { getCatalogEntry } from './furnitureCatalog.js'
import { getColorizedSprite } from '../colorize.js'

/** Convert flat tile array from layout into 2D grid */
export function layoutToTileMap(layout: OfficeLayout): TileTypeVal[][] {
  const map: TileTypeVal[][] = []
  for (let r = 0; r < layout.rows; r++) {
    const row: TileTypeVal[] = []
    for (let c = 0; c < layout.cols; c++) {
      row.push(layout.tiles[r * layout.cols + c])
    }
    map.push(row)
  }
  return map
}

/** Convert placed furniture into renderable FurnitureInstance[] */
export function layoutToFurnitureInstances(furniture: PlacedFurniture[]): FurnitureInstance[] {
  // Pre-compute desk zY per tile so surface items can sort in front of desks
  const deskZByTile = new Map<string, number>()
  for (const item of furniture) {
    const entry = getCatalogEntry(item.type)
    if (!entry || !entry.isDesk) continue
    const deskZY = item.row * TILE_SIZE + entry.sprite.length
    for (let dr = 0; dr < entry.footprintH; dr++) {
      for (let dc = 0; dc < entry.footprintW; dc++) {
        const key = `${item.col + dc},${item.row + dr}`
        const prev = deskZByTile.get(key)
        if (prev === undefined || deskZY > prev) deskZByTile.set(key, deskZY)
      }
    }
  }

  const instances: FurnitureInstance[] = []
  for (const item of furniture) {
    const entry = getCatalogEntry(item.type)
    if (!entry) continue
    const x = item.col * TILE_SIZE
    const y = item.row * TILE_SIZE
    const spriteH = entry.sprite.length
    let zY = y + spriteH

    // Chair z-sorting: ensure characters sitting on chairs render correctly
    if (entry.category === 'chairs') {
      if (entry.orientation === 'back') {
        // Back-facing chairs render IN FRONT of the seated character
        // (the chair back visually occludes the character behind it)
        zY = (item.row + 1) * TILE_SIZE + 1
      } else {
        // All other chairs: cap zY to first row bottom so characters
        // at any seat tile render in front of the chair
        zY = (item.row + 1) * TILE_SIZE
      }
    }

    // Surface items render in front of the desk they sit on
    if (entry.canPlaceOnSurfaces) {
      for (let dr = 0; dr < entry.footprintH; dr++) {
        for (let dc = 0; dc < entry.footprintW; dc++) {
          const deskZ = deskZByTile.get(`${item.col + dc},${item.row + dr}`)
          if (deskZ !== undefined && deskZ + 0.5 > zY) zY = deskZ + 0.5
        }
      }
    }

    // Colorize sprite if this furniture has a color override
    let sprite = entry.sprite
    if (item.color) {
      const { h, s, b: bv, c: cv } = item.color
      sprite = getColorizedSprite(`furn-${item.type}-${h}-${s}-${bv}-${cv}-${item.color.colorize ? 1 : 0}`, entry.sprite, item.color)
    }

    instances.push({ sprite, x, y, zY })
  }
  return instances
}

/** Get all tiles blocked by furniture footprints, optionally excluding a set of tiles.
 *  Skips top backgroundTiles rows so characters can walk through them. */
export function getBlockedTiles(furniture: PlacedFurniture[], excludeTiles?: Set<string>): Set<string> {
  const tiles = new Set<string>()
  for (const item of furniture) {
    const entry = getCatalogEntry(item.type)
    if (!entry) continue
    const bgRows = entry.backgroundTiles || 0
    for (let dr = 0; dr < entry.footprintH; dr++) {
      if (dr < bgRows) continue // skip background rows — characters can walk through
      for (let dc = 0; dc < entry.footprintW; dc++) {
        const key = `${item.col + dc},${item.row + dr}`
        if (excludeTiles && excludeTiles.has(key)) continue
        tiles.add(key)
      }
    }
  }
  return tiles
}

/** Get tiles blocked for placement purposes — skips top backgroundTiles rows per item */
export function getPlacementBlockedTiles(furniture: PlacedFurniture[], excludeUid?: string): Set<string> {
  const tiles = new Set<string>()
  for (const item of furniture) {
    if (item.uid === excludeUid) continue
    const entry = getCatalogEntry(item.type)
    if (!entry) continue
    const bgRows = entry.backgroundTiles || 0
    for (let dr = 0; dr < entry.footprintH; dr++) {
      if (dr < bgRows) continue // skip background rows
      for (let dc = 0; dc < entry.footprintW; dc++) {
        tiles.add(`${item.col + dc},${item.row + dr}`)
      }
    }
  }
  return tiles
}

/** Map chair orientation to character facing direction */
function orientationToFacing(orientation: string): Direction {
  switch (orientation) {
    case 'front': return Direction.DOWN
    case 'back': return Direction.UP
    case 'left': return Direction.LEFT
    case 'right': return Direction.RIGHT
    default: return Direction.DOWN
  }
}

/** Generate seats from chair furniture.
 *  Facing priority: 1) chair orientation, 2) adjacent desk, 3) forward (DOWN). */
export function layoutToSeats(furniture: PlacedFurniture[]): Map<string, Seat> {
  const seats = new Map<string, Seat>()

  // Build set of all desk tiles
  const deskTiles = new Set<string>()
  for (const item of furniture) {
    const entry = getCatalogEntry(item.type)
    if (!entry || !entry.isDesk) continue
    for (let dr = 0; dr < entry.footprintH; dr++) {
      for (let dc = 0; dc < entry.footprintW; dc++) {
        deskTiles.add(`${item.col + dc},${item.row + dr}`)
      }
    }
  }

  const dirs: Array<{ dc: number; dr: number; facing: Direction }> = [
    { dc: 0, dr: -1, facing: Direction.UP },    // desk is above chair → face UP
    { dc: 0, dr: 1, facing: Direction.DOWN },   // desk is below chair → face DOWN
    { dc: -1, dr: 0, facing: Direction.LEFT },   // desk is left of chair → face LEFT
    { dc: 1, dr: 0, facing: Direction.RIGHT },   // desk is right of chair → face RIGHT
  ]

  // For each chair, every footprint tile becomes a seat.
  // Multi-tile chairs (e.g. 2-tile couches) produce multiple seats.
  for (const item of furniture) {
    const entry = getCatalogEntry(item.type)
    if (!entry || entry.category !== 'chairs') continue

    let seatCount = 0
    for (let dr = 0; dr < entry.footprintH; dr++) {
      for (let dc = 0; dc < entry.footprintW; dc++) {
        const tileCol = item.col + dc
        const tileRow = item.row + dr

        // Determine facing direction:
        // 1) Chair orientation takes priority
        // 2) Adjacent desk direction
        // 3) Default forward (DOWN)
        let facingDir: Direction = Direction.DOWN
        if (entry.orientation) {
          facingDir = orientationToFacing(entry.orientation)
        } else {
          for (const d of dirs) {
            if (deskTiles.has(`${tileCol + d.dc},${tileRow + d.dr}`)) {
              facingDir = d.facing
              break
            }
          }
        }

        // First seat uses chair uid (backward compat), subsequent use uid:N
        const seatUid = seatCount === 0 ? item.uid : `${item.uid}:${seatCount}`
        seats.set(seatUid, {
          uid: seatUid,
          seatCol: tileCol,
          seatRow: tileRow,
          facingDir,
          assigned: false,
        })
        seatCount++
      }
    }
  }

  return seats
}

/** Get the set of tiles occupied by seats (so they can be excluded from blocked tiles) */
export function getSeatTiles(seats: Map<string, Seat>): Set<string> {
  const tiles = new Set<string>()
  for (const seat of seats.values()) {
    tiles.add(`${seat.seatCol},${seat.seatRow}`)
  }
  return tiles
}

/** Default floor colors — Palo IT brand palette (colorize mode = Photoshop-style hue replacement) */
const DEFAULT_LEFT_ROOM_COLOR: FloorColor  = { h: 142, s: 80, b:  5, c: 0, colorize: true }  // Palo IT green
const DEFAULT_RIGHT_ROOM_COLOR: FloorColor = { h: 142, s: 70, b: -5, c: 5, colorize: true }  // darker green
const DEFAULT_CARPET_COLOR: FloorColor     = { h:  45, s: 80, b:  5, c: 0, colorize: true }  // gold accent
const DEFAULT_DOORWAY_COLOR: FloorColor    = { h: 142, s: 60, b: 10, c: 0, colorize: true }  // lighter green

/** Create the default office layout matching the current hardcoded office */
export function createDefaultLayout(): OfficeLayout {
  const W = TileType.WALL
  const F1 = TileType.FLOOR_1
  const F2 = TileType.FLOOR_2
  const F3 = TileType.FLOOR_3
  const F4 = TileType.FLOOR_4

  const tiles: TileTypeVal[] = []
  const tileColors: Array<FloorColor | null> = []

  // Create office layout with walls and floors
  for (let r = 0; r < DEFAULT_ROWS; r++) {
    for (let c = 0; c < DEFAULT_COLS; c++) {
      // Perimeter walls
      if (r === 0 || r === DEFAULT_ROWS - 1) { tiles.push(W); tileColors.push(null); continue }
      if (c === 0 || c === DEFAULT_COLS - 1) { tiles.push(W); tileColors.push(null); continue }
      
      // Center divider wall with doorway
      if (c === 10) {
        if (r >= 4 && r <= 6) {
          tiles.push(F4); tileColors.push(DEFAULT_DOORWAY_COLOR) // Doorway
        } else {
          tiles.push(W); tileColors.push(null) // Wall
        }
        continue
      }
      
      // Meeting area carpet (right side)
      if (c >= 15 && c <= 18 && r >= 7 && r <= 9) {
        tiles.push(F3); tileColors.push(DEFAULT_CARPET_COLOR); continue
      }
      
      // Different floor colors for left/right rooms
      if (c < 10) {
        tiles.push(F1); tileColors.push(DEFAULT_LEFT_ROOM_COLOR)
      } else {
        tiles.push(F2); tileColors.push(DEFAULT_RIGHT_ROOM_COLOR)
      }
    }
  }

  // Furniture layout with 8 agent desks matching PLACEHOLDER_AGENTS
  const furniture: PlacedFurniture[] = [
    // LEFT ROOM - 4 agents
    // Row 1: orchestrator (top-left) and ai-eng (top-right)
    { uid: 'orchestrator-desk', type: FurnitureType.DESK, col: 2, row: 2 },
    { uid: 'orchestrator-chair', type: FurnitureType.CHAIR, col: 2, row: 1 },
    
    { uid: 'ai-eng-desk', type: FurnitureType.DESK, col: 6, row: 2 },
    { uid: 'ai-eng-chair', type: FurnitureType.CHAIR, col: 6, row: 1 },
    
    // Row 2: architect (bottom-left) and po (bottom-right)
    { uid: 'architect-desk', type: FurnitureType.DESK, col: 2, row: 6 },
    { uid: 'architect-chair', type: FurnitureType.CHAIR, col: 2, row: 5 },
    
    { uid: 'po-desk', type: FurnitureType.DESK, col: 6, row: 6 },
    { uid: 'po-chair', type: FurnitureType.CHAIR, col: 6, row: 5 },
    
    // RIGHT ROOM - 4 agents
    // Row 1: ba (top-left) and pm (top-right)
    { uid: 'ba-desk', type: FurnitureType.DESK, col: 12, row: 2 },
    { uid: 'ba-chair', type: FurnitureType.CHAIR, col: 12, row: 1 },
    
    { uid: 'pm-desk', type: FurnitureType.DESK, col: 16, row: 2 },
    { uid: 'pm-chair', type: FurnitureType.CHAIR, col: 16, row: 1 },
    
    // Row 2: dev-lead (bottom-left) and tdd-orchestrator (bottom-right)
    { uid: 'dev-lead-desk', type: FurnitureType.DESK, col: 12, row: 5 },
    { uid: 'dev-lead-chair', type: FurnitureType.CHAIR, col: 12, row: 4 },
    
    { uid: 'tdd-orchestrator-desk', type: FurnitureType.DESK, col: 16, row: 5 },
    { uid: 'tdd-orchestrator-chair', type: FurnitureType.CHAIR, col: 16, row: 4 },
    
    // Decorative furniture
    { uid: 'bookshelf-1', type: FurnitureType.BOOKSHELF, col: 1, row: 8 },
    { uid: 'plant-left', type: FurnitureType.PLANT, col: 1, row: 1 },
    { uid: 'cooler-1', type: FurnitureType.COOLER, col: 17, row: 8 },
    { uid: 'plant-right', type: FurnitureType.PLANT, col: 18, row: 1 },
    { uid: 'whiteboard-1', type: FurnitureType.WHITEBOARD, col: 14, row: 0 },
  ]

  return { version: 1, cols: DEFAULT_COLS, rows: DEFAULT_ROWS, tiles, tileColors, furniture }
}

/** Serialize layout to JSON string */
export function serializeLayout(layout: OfficeLayout): string {
  return JSON.stringify(layout)
}

/** Deserialize layout from JSON string, migrating old tile types if needed */
export function deserializeLayout(json: string): OfficeLayout | null {
  try {
    const obj = JSON.parse(json)
    if (obj && obj.version === 1 && Array.isArray(obj.tiles) && Array.isArray(obj.furniture)) {
      return migrateLayout(obj as OfficeLayout)
    }
  } catch { /* ignore parse errors */ }
  return null
}

/**
 * Ensure layout has tileColors. If missing, generate defaults based on tile types.
 * Exported for use by message handlers that receive layouts over the wire.
 */
export function migrateLayoutColors(layout: OfficeLayout): OfficeLayout {
  return migrateLayout(layout)
}

/** Map all floor tile types to their default Palo IT colors (used during color migration) */
function regenerateTileColors(tiles: TileTypeVal[]): Array<FloorColor | null> {
  return tiles.map((tile) => {
    switch (tile) {
      case TileType.FLOOR_1: return DEFAULT_LEFT_ROOM_COLOR
      case TileType.FLOOR_2: return DEFAULT_RIGHT_ROOM_COLOR
      case TileType.FLOOR_3: return DEFAULT_CARPET_COLOR
      case TileType.FLOOR_4: return DEFAULT_DOORWAY_COLOR
      case TileType.FLOOR_5: return DEFAULT_LEFT_ROOM_COLOR
      case TileType.FLOOR_6: return DEFAULT_RIGHT_ROOM_COLOR
      default: return tile > 0 ? DEFAULT_LEFT_ROOM_COLOR : null
    }
  })
}

/** Legacy furniture type names used in older saved layouts */
const LEGACY_FURNITURE_TYPE_MAP: Record<string, string> = {
  CHAIR_FRONT: FurnitureType.CHAIR,
  DESK_FRONT: FurnitureType.DESK,
  TABLE_CENTER: FurnitureType.DESK,
}

/**
 * Migrate old layouts that use legacy tile types (TILE_FLOOR=1, WOOD_FLOOR=2, CARPET=3, DOORWAY=4)
 * to the new pattern-based system. If tileColors is already present, no migration needed.
 */
function migrateLayout(layout: OfficeLayout): OfficeLayout {
  // Always translate legacy furniture types (e.g. CHAIR_FRONT → 'chair') regardless of tileColors
  const furniture = layout.furniture.map((item) => {
    const mapped = LEGACY_FURNITURE_TYPE_MAP[item.type]
    return mapped ? { ...item, type: mapped } : item
  })
  layout = { ...layout, furniture }

  if (layout.tileColors && layout.tileColors.length === layout.tiles.length) {
    // Migrate neutral/warm tileColors to Palo IT green colorize scheme
    const firstNonNull = layout.tileColors.find((c) => c !== null)
    if (firstNonNull && !firstNonNull.colorize) {
      return { ...layout, tileColors: regenerateTileColors(layout.tiles) }
    }
    return layout // Already using colorize scheme
  }

  // Check if any tiles use old values (1-4) — these map directly to FLOOR_1-4
  // but need color assignments
  const tileColors: Array<FloorColor | null> = []
  for (const tile of layout.tiles) {
    switch (tile) {
      case 0: // WALL
        tileColors.push(null)
        break
      case 1: // was TILE_FLOOR → FLOOR_1 beige
        tileColors.push(DEFAULT_LEFT_ROOM_COLOR)
        break
      case 2: // was WOOD_FLOOR → FLOOR_2 brown
        tileColors.push(DEFAULT_RIGHT_ROOM_COLOR)
        break
      case 3: // was CARPET → FLOOR_3 purple
        tileColors.push(DEFAULT_CARPET_COLOR)
        break
      case 4: // was DOORWAY → FLOOR_4 tan
        tileColors.push(DEFAULT_DOORWAY_COLOR)
        break
      default:
        // New tile types (5-7) without colors — use neutral gray
        tileColors.push(tile > 0 ? { h: 0, s: 0, b: 0, c: 0 } : null)
    }
  }

  return { ...layout, tileColors }
}
