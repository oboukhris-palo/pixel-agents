# US-003-002 Implementation Plan: Agent Sprite Animation Engine

**Epic**: EPIC-003 — Office Canvas & Agent Visualization  
**Story**: US-003-002 — Agent Sprite Animation Engine  
**Priority**: P1 (Critical Feature)  
**Story Points**: 8  
**Estimated Effort**: 3-4 days (24-32 hours)  
**Dependencies**: US-003-001 (Office Canvas Grid — COMPLETE)  
**Assignee**: TDD Team (dev-tdd-red → dev-tdd-green → dev-tdd-refactor)  
**Created**: 2026-04-27  
**Dev-Lead**: Sebastian

---

## 📋 Story Overview

### Business Value
Transform the Pixel Agents dashboard from a static visualization into an engaging, game-like experience by animating AI agent characters. Each agent becomes a visually distinct sprite that moves between desks, bobs when idle, wiggles while typing code, and celebrates milestones — making AI orchestration intuitive and delightful.

### User Story
> **As a** developer using Pixel Agents  
> **I want to** see animated agent sprites moving around the office canvas  
> **So that** I can visually track which agents are active, understand their current tasks, and experience the "Sims for Software Development" vision

### Acceptance Criteria

✅ **AC1**: Agent sprites rendered at 16×16px with agent identity color from `.github/agents/*.agent.md` metadata  
✅ **AC2**: 2px white outline for visibility (@ 30% opacity) on all sprites  
✅ **AC3**: Rounded rectangle shape (border-radius: 2px) for modern look  
✅ **AC4**: Move-to-desk animation (1000ms duration, Quad.easeInOut tween) when agent becomes active  
✅ **AC5**: Idle bob animation (2000ms Sine.easeInOut loop, ±4px vertical oscillation) for waiting agents  
✅ **AC6**: Typing wiggle animation (300ms linear loop, ±2px horizontal shake) while agent writes code  
✅ **AC7**: Celebration jump animation (600ms Back.easeOut, 20px peak height) on milestone completion  
✅ **AC8**: Sprites positioned based on agent metadata (desk assignments from `agent-team-layout.json`)  
✅ **AC9**: Sprites respond to agent status changes from backend (`AgentActivityMonitor` events)  
✅ **AC10**: Performance: 60 FPS with 16 animated sprites simultaneously  
✅ **AC11**: Visual match to Penpot export (`design-systems.md v2.0.0` colors)

### BDD Scenarios
Reference: `/docs/05-implementation/epics/EPIC-003/user-stories/US-003-002/features/agent-sprite-animation.feature`

---

## 🏗️ Architecture & Layer Breakdown

### Layer 1: Sprite Data Models & Type System
**Purpose**: Define TypeScript interfaces, validation functions, and factory utilities for agent sprites and animations

**Files to create**:
- `webview-ui/src/office/sprites/spriteTypes.ts` (120 lines)

**Key Types**:
```typescript
export interface AgentSprite {
  id: string;                    // Unique sprite instance ID (e.g., "sprite-dev-tdd-red")
  agentId: string;               // Agent identifier from .github/agents/ (e.g., "dev-tdd-red")
  position: Position;            // Current render position (world coordinates)
  targetPosition: Position | null; // Movement destination (null if not moving)
  color: string;                 // Agent identity color from metadata (#FF5500, #10B981, etc.)
  size: Size;                    // Sprite dimensions (default: 16×16px)
  animation: Animation | null;   // Current animation state (null if static)
  status: AgentStatus;           // Current agent status (idle, moving, typing, celebrating)
}

export interface Position {
  x: number; // Grid position (not pixel coordinates)
  y: number;
}

export interface Size {
  width: number;  // Sprite width in pixels (default: 16)
  height: number; // Sprite height in pixels (default: 16)
}

export interface Animation {
  type: AnimationType;           // Animation variant
  startTime: number;             // performance.now() timestamp when animation started
  duration: number;              // Total animation duration in milliseconds
  easing: EasingFunction;        // Easing curve name
  params: AnimationParams;       // Type-specific parameters
  loop: boolean;                 // True for idle/typing (continuous), false for move/celebration
}

export type AnimationType = 'move' | 'idle' | 'typing' | 'celebration';

export type AgentStatus = 'inactive' | 'idle' | 'active' | 'thinking' | 'celebrating';

export type EasingFunction = 
  | 'linear'           // t => t (constant speed)
  | 'quadEaseInOut'    // t => smooth acceleration/deceleration (for move)
  | 'sineEaseInOut'    // t => smooth oscillation (for idle bob)
  | 'backEaseOut';     // t => overshoot then settle (for celebration bounce)

export interface AnimationParams {
  // Move animation params
  startX?: number;
  startY?: number;
  endX?: number;
  endY?: number;
  
  // Idle animation params
  baseY?: number;
  yOffset?: number;
  
  // Typing animation params
  baseX?: number;
  xOffset?: number;
  
  // Celebration animation params
  peakHeight?: number;
}
```

**Validation Functions**:
```typescript
export function isValidSprite(sprite: unknown): sprite is AgentSprite {
  if (typeof sprite !== 'object' || sprite === null) return false;
  const s = sprite as Partial<AgentSprite>;
  return (
    typeof s.id === 'string' &&
    typeof s.agentId === 'string' &&
    isValidPosition(s.position) &&
    (s.targetPosition === null || isValidPosition(s.targetPosition)) &&
    typeof s.color === 'string' &&
    isValidSize(s.size) &&
    (s.animation === null || isValidAnimation(s.animation)) &&
    isValidAgentStatus(s.status)
  );
}

export function isValidPosition(pos: unknown): pos is Position {
  if (typeof pos !== 'object' || pos === null) return false;
  const p = pos as Partial<Position>;
  return typeof p.x === 'number' && typeof p.y === 'number';
}

export function isValidSize(size: unknown): size is Size {
  if (typeof size !== 'object' || size === null) return false;
  const s = size as Partial<Size>;
  return (
    typeof s.width === 'number' && s.width > 0 &&
    typeof s.height === 'number' && s.height > 0
  );
}

export function isValidAnimation(anim: unknown): anim is Animation {
  if (typeof anim !== 'object' || anim === null) return false;
  const a = anim as Partial<Animation>;
  return (
    isValidAnimationType(a.type) &&
    typeof a.startTime === 'number' &&
    typeof a.duration === 'number' && a.duration > 0 &&
    isValidEasingFunction(a.easing) &&
    typeof a.params === 'object' &&
    typeof a.loop === 'boolean'
  );
}

export function isValidAnimationType(type: unknown): type is AnimationType {
  return ['move', 'idle', 'typing', 'celebration'].includes(type as string);
}

export function isValidAgentStatus(status: unknown): status is AgentStatus {
  return ['inactive', 'idle', 'active', 'thinking', 'celebrating'].includes(status as string);
}

export function isValidEasingFunction(easing: unknown): easing is EasingFunction {
  return ['linear', 'quadEaseInOut', 'sineEaseInOut', 'backEaseOut'].includes(easing as string);
}
```

**Factory Functions**:
```typescript
export function createAgentSprite(
  agentId: string,
  color: string,
  gridX: number,
  gridY: number
): AgentSprite {
  return {
    id: `sprite-${agentId}`,
    agentId,
    position: { x: gridX, y: gridY },
    targetPosition: null,
    color,
    size: { width: 16, height: 16 },
    animation: null,
    status: 'inactive'
  };
}

export function createMoveAnimation(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  duration: number = 1000
): Animation {
  return {
    type: 'move',
    startTime: performance.now(),
    duration,
    easing: 'quadEaseInOut',
    params: { startX, startY, endX, endY },
    loop: false
  };
}

export function createIdleAnimation(baseY: number, yOffset: number = 4, duration: number = 2000): Animation {
  return {
    type: 'idle',
    startTime: performance.now(),
    duration,
    easing: 'sineEaseInOut',
    params: { baseY, yOffset },
    loop: true
  };
}

export function createTypingAnimation(baseX: number, xOffset: number = 2, duration: number = 300): Animation {
  return {
    type: 'typing',
    startTime: performance.now(),
    duration,
    easing: 'linear',
    params: { baseX, xOffset },
    loop: true
  };
}

export function createCelebrationAnimation(peakHeight: number = 20, duration: number = 600): Animation {
  return {
    type: 'celebration',
    startTime: performance.now(),
    duration,
    easing: 'backEaseOut',
    params: { peakHeight },
    loop: false
  };
}
```

**TDD Approach**:
- **RED (30 min)**: Write comprehensive tests for all validation functions
  - Test `isValidSprite` with complete, partial, and invalid sprites
  - Test `isValidPosition` with valid/invalid coordinates
  - Test `isValidAnimation` with all 4 animation types
  - Test `isValidEasingFunction` with all easing curves
- **GREEN (30 min)**: Implement validation functions ensuring all tests pass
- **REFACTOR (20 min)**: Extract reusable guard functions, add JSDoc comments

**Test Coverage Target**: 100% (30-40 tests)

---

### Layer 2: Animation Engine & Easing Functions
**Purpose**: Core animation state machine that updates sprite positions per frame based on elapsed time and easing curves

**Files to create**:
- `webview-ui/src/office/engine/animationEngine.ts` (280 lines)
- `webview-ui/src/office/engine/easingFunctions.ts` (80 lines)

**AnimationEngine Class** (`animationEngine.ts`):
```typescript
/**
 * Animation Engine for Agent Sprites
 * 
 * Manages sprite animation state, applies easing functions, and updates positions
 * per frame. Designed for 60 FPS performance with 16+ sprites.
 * 
 * Usage:
 * ```ts
 * const engine = new AnimationEngine();
 * engine.addSprite(sprite);
 * engine.startMove(spriteId, targetX, targetY, 1000, 'quadEaseInOut');
 * 
 * // In game loop (60 FPS):
 * engine.update(performance.now());
 * const sprites = engine.getSprites();
 * ```
 */
export class AnimationEngine {
  private sprites: Map<string, AgentSprite> = new Map();
  private startTime: number = 0;
  private lastUpdateTime: number = 0;

  /**
   * Add a sprite to the animation engine
   * @param sprite - AgentSprite to manage
   * @throws Error if sprite with same ID already exists
   */
  addSprite(sprite: AgentSprite): void {
    if (this.sprites.has(sprite.id)) {
      throw new Error(`Sprite with ID ${sprite.id} already exists`);
    }
    if (!isValidSprite(sprite)) {
      throw new Error('Invalid sprite object');
    }
    this.sprites.set(sprite.id, sprite);
  }

  /**
   * Remove a sprite from the engine
   * @param spriteId - ID of sprite to remove
   * @returns True if sprite was removed, false if not found
   */
  removeSprite(spriteId: string): boolean {
    return this.sprites.delete(spriteId);
  }

  /**
   * Get a sprite by ID
   * @param spriteId - Sprite ID
   * @returns AgentSprite or undefined if not found
   */
  getSprite(spriteId: string): AgentSprite | undefined {
    return this.sprites.get(spriteId);
  }

  /**
   * Get all sprites (returns array copy to prevent mutation)
   * @returns Array of all managed sprites
   */
  getSprites(): AgentSprite[] {
    return Array.from(this.sprites.values());
  }

  /**
   * Start a move animation for a sprite
   * @param spriteId - ID of sprite to animate
   * @param targetX - Target X position (grid coordinates)
   * @param targetY - Target Y position (grid coordinates)
   * @param duration - Animation duration in milliseconds (default: 1000ms)
   * @param easing - Easing function name (default: 'quadEaseInOut')
   */
  startMove(
    spriteId: string,
    targetX: number,
    targetY: number,
    duration: number = 1000,
    easing: EasingFunction = 'quadEaseInOut'
  ): void {
    const sprite = this.sprites.get(spriteId);
    if (!sprite) {
      throw new Error(`Sprite ${spriteId} not found`);
    }

    sprite.targetPosition = { x: targetX, y: targetY };
    sprite.animation = createMoveAnimation(
      sprite.position.x,
      sprite.position.y,
      targetX,
      targetY,
      duration
    );
    sprite.animation.easing = easing;
    sprite.status = 'active';
  }

  /**
   * Start an idle bob animation for a sprite
   * @param spriteId - ID of sprite to animate
   * @param yOffset - Vertical oscillation range in pixels (default: 4px)
   * @param duration - Full cycle duration in milliseconds (default: 2000ms)
   */
  startIdle(spriteId: string, yOffset: number = 4, duration: number = 2000): void {
    const sprite = this.sprites.get(spriteId);
    if (!sprite) {
      throw new Error(`Sprite ${spriteId} not found`);
    }

    sprite.animation = createIdleAnimation(sprite.position.y, yOffset, duration);
    sprite.status = 'idle';
  }

  /**
   * Start a typing wiggle animation for a sprite
   * @param spriteId - ID of sprite to animate
   * @param xOffset - Horizontal shake range in pixels (default: 2px)
   * @param duration - Full shake cycle duration in milliseconds (default: 300ms)
   */
  startTyping(spriteId: string, xOffset: number = 2, duration: number = 300): void {
    const sprite = this.sprites.get(spriteId);
    if (!sprite) {
      throw new Error(`Sprite ${spriteId} not found`);
    }

    sprite.animation = createTypingAnimation(sprite.position.x, xOffset, duration);
    sprite.status = 'thinking';
  }

  /**
   * Start a celebration jump animation for a sprite
   * @param spriteId - ID of sprite to animate
   * @param peakHeight - Jump peak height in pixels (default: 20px)
   * @param duration - Jump duration in milliseconds (default: 600ms)
   */
  startCelebration(spriteId: string, peakHeight: number = 20, duration: number = 600): void {
    const sprite = this.sprites.get(spriteId);
    if (!sprite) {
      throw new Error(`Sprite ${spriteId} not found`);
    }

    const baseY = sprite.position.y;
    sprite.animation = createCelebrationAnimation(peakHeight, duration);
    sprite.animation.params.baseY = baseY;
    sprite.status = 'celebrating';
  }

  /**
   * Stop all animations for a sprite and set to inactive
   * @param spriteId - ID of sprite to stop
   */
  stopAnimation(spriteId: string): void {
    const sprite = this.sprites.get(spriteId);
    if (!sprite) return;

    sprite.animation = null;
    sprite.targetPosition = null;
    sprite.status = 'inactive';
  }

  /**
   * Update all sprite animations (call this every frame)
   * @param currentTime - Current timestamp from performance.now()
   */
  update(currentTime: number): void {
    if (this.startTime === 0) {
      this.startTime = currentTime;
      this.lastUpdateTime = currentTime;
    }

    const deltaTime = currentTime - this.lastUpdateTime;
    this.lastUpdateTime = currentTime;

    this.sprites.forEach(sprite => {
      if (!sprite.animation) return;

      const elapsed = currentTime - sprite.animation.startTime;
      const rawProgress = Math.min(elapsed / sprite.animation.duration, 1);
      const easedProgress = this.applyEasing(rawProgress, sprite.animation.easing);

      switch (sprite.animation.type) {
        case 'move':
          this.updateMoveAnimation(sprite, easedProgress, rawProgress);
          break;
        case 'idle':
          this.updateIdleAnimation(sprite, easedProgress, rawProgress, currentTime);
          break;
        case 'typing':
          this.updateTypingAnimation(sprite, easedProgress, rawProgress, currentTime);
          break;
        case 'celebration':
          this.updateCelebrationAnimation(sprite, easedProgress, rawProgress);
          break;
      }
    });
  }

  private updateMoveAnimation(sprite: AgentSprite, easedProgress: number, rawProgress: number): void {
    if (!sprite.animation) return;
    const { startX, startY, endX, endY } = sprite.animation.params;

    sprite.position.x = startX! + (endX! - startX!) * easedProgress;
    sprite.position.y = startY! + (endY! - startY!) * easedProgress;

    // Animation complete
    if (rawProgress >= 1) {
      sprite.position.x = endX!;
      sprite.position.y = endY!;
      sprite.animation = null;
      sprite.targetPosition = null;
      sprite.status = 'idle';
    }
  }

  private updateIdleAnimation(sprite: AgentSprite, easedProgress: number, rawProgress: number, currentTime: number): void {
    if (!sprite.animation) return;
    const { baseY, yOffset } = sprite.animation.params;

    // Sine wave oscillation: y = baseY + yOffset * sin(progress * 2π)
    sprite.position.y = baseY! + yOffset! * Math.sin(easedProgress * Math.PI * 2);

    // Loop animation
    if (rawProgress >= 1 && sprite.animation.loop) {
      sprite.animation.startTime = currentTime;
    }
  }

  private updateTypingAnimation(sprite: AgentSprite, easedProgress: number, rawProgress: number, currentTime: number): void {
    if (!sprite.animation) return;
    const { baseX, xOffset } = sprite.animation.params;

    // Horizontal shake: x = baseX + xOffset * sin(progress * 2π * 4) [4 shakes per cycle]
    sprite.position.x = baseX! + xOffset! * Math.sin(easedProgress * Math.PI * 2 * 4);

    // Loop animation
    if (rawProgress >= 1 && sprite.animation.loop) {
      sprite.animation.startTime = currentTime;
    }
  }

  private updateCelebrationAnimation(sprite: AgentSprite, easedProgress: number, rawProgress: number): void {
    if (!sprite.animation) return;
    const { baseY, peakHeight } = sprite.animation.params;

    // Parabolic jump: y = baseY - peakHeight * sin(progress * π)
    // sin(0) = 0 (ground), sin(π/2) = 1 (peak), sin(π) = 0 (ground)
    sprite.position.y = baseY! - peakHeight! * Math.sin(easedProgress * Math.PI);

    // Animation complete
    if (rawProgress >= 1) {
      sprite.position.y = baseY!;
      sprite.animation = null;
      sprite.status = 'idle';
    }
  }

  private applyEasing(t: number, easing: EasingFunction): number {
    return Easing[easing](t);
  }

  /**
   * Reset the engine (remove all sprites and clear state)
   */
  reset(): void {
    this.sprites.clear();
    this.startTime = 0;
    this.lastUpdateTime = 0;
  }
}
```

**Easing Functions** (`easingFunctions.ts`):
```typescript
/**
 * Easing Functions for Smooth Animations
 * 
 * All functions take t ∈ [0, 1] and return eased value ∈ [0, 1]
 * Reference: https://easings.net/
 */
export const Easing = {
  /**
   * Linear easing (constant speed)
   * f(t) = t
   */
  linear: (t: number): number => t,

  /**
   * Quadratic ease-in-out (smooth acceleration/deceleration)
   * Used for move animations
   * f(t) = t < 0.5 ? 2t² : -1 + (4 - 2t)t
   */
  quadEaseInOut: (t: number): number => {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  },

  /**
   * Sine ease-in-out (smooth oscillation)
   * Used for idle bob animations
   * f(t) = -(cos(πt) - 1) / 2
   */
  sineEaseInOut: (t: number): number => {
    return -(Math.cos(Math.PI * t) - 1) / 2;
  },

  /**
   * Back ease-out (overshoot then settle)
   * Used for celebration jump animations
   * f(t) = 1 + c₃(t-1)³ + c₁(t-1)²
   * where c₁ = 1.70158, c₃ = c₁ + 1 = 2.70158
   */
  backEaseOut: (t: number): number => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }
};
```

**TDD Approach**:
- **RED (2 hours)**: Write comprehensive tests for AnimationEngine
  - Test sprite addition/removal/retrieval
  - Test each animation type (move, idle, typing, celebration)
  - Test animation completion (one-shot vs. looping)
  - Test easing function application
  - Test edge cases (sprite not found, duplicate sprite IDs)
  - Test performance (update 16 sprites in <16ms)
- **GREEN (4 hours)**: Implement AnimationEngine and easing functions
- **REFACTOR (1 hour)**: Extract update methods, optimize calculations, add inline comments

**Test Coverage Target**: 95% (50-60 tests)

---

### Layer 3: Sprite Renderer Integration
**Purpose**: Integrate sprite rendering into existing `CanvasRenderer` class, respecting zoom/pan viewport and applying sprite transformations

**Files to modify**:
- `webview-ui/src/office/engine/canvasRenderer.ts` (add sprite rendering methods)

**Key Changes**:
```typescript
// Add to CanvasRenderer class
export class CanvasRenderer {
  // ... existing properties ...
  private animationEngine: AnimationEngine;

  constructor(canvas: HTMLCanvasElement, layout: OfficeLayout) {
    // ... existing initialization ...
    this.animationEngine = new AnimationEngine();
  }

  /**
   * Get the animation engine for external sprite management
   */
  getAnimationEngine(): AnimationEngine {
    return this.animationEngine;
  }

  render(): void {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    // Render floor pattern
    this.renderFloor();

    // Render zones
    this.renderZones();

    // Render furniture
    this.renderFurniture();

    // Render sprites (NEW)
    this.renderSprites();
  }

  /**
   * Render all agent sprites with animations
   * Sprites are drawn as 16×16px rounded rectangles with identity colors
   */
  private renderSprites(): void {
    const sprites = this.animationEngine.getSprites();

    sprites.forEach(sprite => {
      // Convert grid position to canvas coordinates
      const canvasX = sprite.position.x * this.layout.gridSize * this.viewport.zoom + this.viewport.x;
      const canvasY = sprite.position.y * this.layout.gridSize * this.viewport.zoom + this.viewport.y;
      const width = sprite.size.width * this.viewport.zoom;
      const height = sprite.size.height * this.viewport.zoom;

      // Apply devicePixelRatio for sharp rendering
      const dpr = window.devicePixelRatio || 1;
      const x = canvasX * dpr;
      const y = canvasY * dpr;
      const w = width * dpr;
      const h = height * dpr;

      // Draw sprite background (rounded rectangle)
      this.ctx.fillStyle = sprite.color;
      this.ctx.beginPath();
      this.ctx.roundRect(x, y, w, h, 2 * dpr * this.viewport.zoom);
      this.ctx.fill();

      // Draw white outline for visibility
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      this.ctx.lineWidth = 2 * dpr;
      this.ctx.stroke();
    });
  }
}
```

**TDD Approach**:
- **RED (1 hour)**: Write tests for sprite rendering integration
  - Test sprites render at correct positions
  - Test zoom/pan viewport transformation applied to sprites
  - Test devicePixelRatio scaling
  - Test sprite colors match agent metadata
  - Test white outline rendering
  - Test sprites render after furniture (correct z-order)
- **GREEN (2 hours)**: Implement `renderSprites()` method
- **REFACTOR (30 min)**: Extract coordinate transformation logic

**Test Coverage Target**: 90% (15-20 tests)

---

### Layer 4: React Component Integration & Agent Status Binding
**Purpose**: Connect React component lifecycle to animation engine, load agent metadata, and bind agent status changes to animations

**Files to modify**:
- `webview-ui/src/office/OfficeCanvas.tsx` (add sprite initialization and status handlers)

**Key Changes**:
```typescript
// Add to OfficeCanvas component
export function OfficeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<CanvasRenderer | null>(null);
  const [agents, setAgents] = useState<AgentMetadata[]>([]);

  // Initialize canvas and load agent sprites
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const layout = loadDefaultLayout();
    const renderer = new CanvasRenderer(canvas, layout);
    renderer.autoFit();
    rendererRef.current = renderer;

    // Load agent metadata from .github/agents/*.agent.md
    const agentMetadata = loadAgentMetadata();
    setAgents(agentMetadata);

    // Load team layout (desk assignments)
    const teamLayout = loadTeamLayout(); // from agent-team-layout.json

    // Initialize sprites for all agents
    agentMetadata.forEach(agent => {
      const deskPosition = teamLayout.assignments[agent.id];
      if (!deskPosition) {
        console.warn(`No desk assignment for agent ${agent.id}`);
        return;
      }

      const sprite = createAgentSprite(
        agent.id,
        agent.spriteColor,
        deskPosition.x,
        deskPosition.y
      );

      renderer.getAnimationEngine().addSprite(sprite);
    });

    // Start game loop with animation updates
    const stopLoop = startGameLoop(canvas, {
      update: (dt: number) => {
        renderer.getAnimationEngine().update(performance.now());
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

  // Listen for agent status changes from backend
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;

      if (message.type === 'activity-update') {
        const { agentId, status, action } = message.payload;
        const spriteId = `sprite-${agentId}`;
        const engine = rendererRef.current?.getAnimationEngine();
        if (!engine) return;

        // Map agent status to animation
        switch (status) {
          case 'active':
            // Agent became active → move to desk
            const sprite = engine.getSprite(spriteId);
            if (sprite && sprite.targetPosition) {
              engine.startMove(spriteId, sprite.targetPosition.x, sprite.targetPosition.y, 1000);
            }
            break;

          case 'idle':
            // Agent waiting → idle bob animation
            engine.startIdle(spriteId, 4, 2000);
            break;

          case 'thinking':
            // Agent writing code → typing wiggle
            engine.startTyping(spriteId, 2, 300);
            break;

          case 'celebrating':
            // Milestone reached → celebration jump
            engine.startCelebration(spriteId, 20, 600);
            break;

          case 'inactive':
            // Agent stopped → no animation
            engine.stopAnimation(spriteId);
            break;
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div className={styles.canvasContainer}>
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
```

**Helper Functions** (new files):
```typescript
// webview-ui/src/office/agentMetadataLoader.ts
export interface AgentMetadata {
  id: string;
  displayName: string;
  spriteColor: string;
  spriteShape: 'circle' | 'square' | 'triangle' | 'star';
  icon: string;
}

export function loadAgentMetadata(): AgentMetadata[] {
  // In production: Parse .github/agents/*.agent.md frontmatter
  // For MVP: Hardcoded agent metadata
  return [
    { id: 'dev-tdd-red', displayName: 'RED Phase Agent', spriteColor: '#FF5500', spriteShape: 'circle', icon: '🔴' },
    { id: 'dev-tdd-green', displayName: 'GREEN Phase Agent', spriteColor: '#10B981', spriteShape: 'circle', icon: '🟢' },
    { id: 'dev-tdd-refactor', displayName: 'REFACTOR Phase Agent', spriteColor: '#8B5CF6', spriteShape: 'circle', icon: '🔵' },
    { id: 'dev-lead', displayName: 'Dev Lead', spriteColor: '#3498DB', spriteShape: 'square', icon: '💼' },
    { id: 'qa', displayName: 'QA Engineer', spriteColor: '#F39C12', spriteShape: 'square', icon: '🔍' },
    { id: 'architect', displayName: 'Architect', spriteColor: '#E67E22', spriteShape: 'star', icon: '🏗️' },
    { id: 'ba', displayName: 'Business Analyst', spriteColor: '#1ABC9C', spriteShape: 'square', icon: '📋' },
    { id: 'po', displayName: 'Product Owner', spriteColor: '#E91E63', spriteShape: 'square', icon: '📊' },
    { id: 'ux', displayName: 'UX Designer', spriteColor: '#9C27B0', spriteShape: 'triangle', icon: '🎨' },
    { id: 'pm', displayName: 'Project Manager', spriteColor: '#00BCD4', spriteShape: 'square', icon: '📅' },
    { id: 'orchestrator', displayName: 'Orchestrator', spriteColor: '#FF9800', spriteShape: 'star', icon: '🎭' },
    { id: 'ai-engineering', displayName: 'AI Engineering', spriteColor: '#607D8B', spriteShape: 'circle', icon: '🤖' }
  ];
}

// webview-ui/src/office/teamLayoutLoader.ts
export interface TeamLayout {
  assignments: Record<string, { x: number; y: number }>;
}

export function loadTeamLayout(): TeamLayout {
  // In production: Fetch from agent-team-layout.json
  // For MVP: Hardcoded desk assignments
  return {
    assignments: {
      'dev-tdd-red': { x: 2, y: 3 },
      'dev-tdd-green': { x: 4, y: 3 },
      'dev-tdd-refactor': { x: 6, y: 3 },
      'dev-lead': { x: 2, y: 5 },
      'qa': { x: 4, y: 5 },
      'architect': { x: 6, y: 5 },
      'ba': { x: 8, y: 3 },
      'po': { x: 10, y: 3 },
      'ux': { x: 8, y: 5 },
      'pm': { x: 10, y: 5 },
      'orchestrator': { x: 12, y: 3 },
      'ai-engineering': { x: 12, y: 5 }
    }
  };
}
```

**TDD Approach**:
- **RED (2 hours)**: Write comprehensive integration tests
  - Test sprites load on mount
  - Test agent metadata parsing
  - Test team layout loading
  - Test animation engine receives status updates
  - Test message handler dispatches correct animations
  - Test cleanup on unmount
- **GREEN (4 hours)**: Implement sprite initialization and status binding
- **REFACTOR (1 hour)**: Extract metadata/layout loaders, optimize message handling

**Test Coverage Target**: 90% (25-30 tests)

---

## 🧪 Testing Strategy

### Test Files to Create
1. `webview-ui/src/office/sprites/spriteTypes.test.ts` (Layer 1: 30-40 tests)
2. `webview-ui/src/office/engine/animationEngine.test.ts` (Layer 2: 50-60 tests)
3. `webview-ui/src/office/engine/easingFunctions.test.ts` (Layer 2: 8-10 tests)
4. `webview-ui/src/office/engine/canvasRenderer.test.ts` (Layer 3: add 15-20 sprite tests)
5. `webview-ui/src/office/OfficeCanvas.test.tsx` (Layer 4: add 25-30 integration tests)

### Total Test Count Target
**130-160 new tests** across all layers

### Performance Benchmarks
- **Animation Engine Update**: <1ms for 16 sprites @ 60 FPS
- **Sprite Rendering**: <2ms for 16 sprites (within 16.67ms frame budget)
- **Total Frame Time**: <16ms (60 FPS maintained)

### Manual Testing Checklist
- [ ] All 12 agents load with correct colors from metadata
- [ ] Sprites move smoothly to desks (1000ms duration)
- [ ] Idle bob animation loops continuously (±4px vertical)
- [ ] Typing wiggle animation loops while agent active (±2px horizontal)
- [ ] Celebration jump has overshoot effect (Back.easeOut)
- [ ] 60 FPS maintained with all sprites animating simultaneously
- [ ] Zoom/pan does not break sprite positioning
- [ ] Sprites render above furniture (correct z-order)
- [ ] White outline visible on all backgrounds

---

## 📦 Definition of Done

✅ All 11 acceptance criteria verified (AC1-AC11)  
✅ All 4 layers implemented and tested (130-160 tests passing)  
✅ Test coverage >90% (AnimationEngine >95%, other layers >85%)  
✅ Performance benchmarks met (<16ms frame time with 16 sprites)  
✅ Code review approved (13-point checklist, 0 critical issues)  
✅ Visual regression test passed (screenshot comparison to Penpot)  
✅ BDD scenarios passing (agent-sprite-animation.feature)  
✅ Documentation updated (inline comments, JSDoc for public APIs)  
✅ Zero regressions (full webview-ui test suite passing)  
✅ Accessibility: sprites have `aria-label` attributes (Layer 4)  
✅ Design system compliance: colors match `design-systems.md v2.0.0`  
✅ Git commit: `TDD-EPIC-003-US-003-002-GREEN-01: Implement agent sprite animation engine`

---

## 🎯 Implementation Sequence

**Critical Path**: Layer 1 → Layer 2 → Layer 3 → Layer 4 (strict dependencies)

**Day 1** (8 hours):
- ✅ Layer 1: Types, validation, factories (2 hours)
- ✅ Layer 2: AnimationEngine core (6 hours — most complex)

**Day 2** (8 hours):
- ✅ Layer 2: Easing functions + performance testing (2 hours)
- ✅ Layer 3: Sprite renderer integration (3 hours)
- ✅ Layer 4: React integration start (3 hours)

**Day 3** (8 hours):
- ✅ Layer 4: Agent status binding + metadata loaders (5 hours)
- ✅ Integration testing & performance tuning (3 hours)

**Day 4** (optional polish, 4-8 hours):
- ✅ Visual regression testing
- ✅ Code review fixes
- ✅ Documentation polish

---

## 🚨 Risk Areas & Mitigation

### Risk 1: Animation Performance Degrades at 60 FPS
**Likelihood**: Medium  
**Impact**: High (breaks AC10)  
**Mitigation**:
- Profile animation engine update loop (Chrome DevTools Performance tab)
- Use `requestAnimationFrame` timestamp (not Date.now())
- Batch sprite updates in single loop iteration
- Avoid object allocations in hot path (reuse position objects)
- Test with 20+ sprites (exceeds 16 agent requirement)

### Risk 2: Easing Functions Produce Incorrect Curves
**Likelihood**: Low  
**Impact**: Medium (animations look jerky)  
**Mitigation**:
- Visual comparison to https://easings.net/
- Plot easing curves in test suite (snapshot testing)
- Test boundary conditions (t=0, t=0.5, t=1)
- Reference implementation from trusted library (e.g., tween.js)

### Risk 3: Agent Status Updates Lost or Delayed
**Likelihood**: Medium  
**Impact**: Medium (sprites don't reflect actual agent activity)  
**Mitigation**:
- Add message sequence numbers (detect drops)
- Implement retry logic for critical status changes
- Log all agent status transitions
- Add visual debugging overlay (show last message timestamp)

### Risk 4: Z-Order Issues (Sprites Behind Furniture)
**Likelihood**: Low  
**Impact**: Low (visual glitch, not functional)  
**Mitigation**:
- Render sprites AFTER furniture in `render()` method
- Add z-index test (verify sprite rendering last)
- Visual regression test with furniture overlap

---

## 💡 Technical Notes

### Canvas Rendering Optimization
- Use `ctx.roundRect()` (modern API, no polyfill needed in VS Code webview)
- Apply `devicePixelRatio` scaling for sharp sprites on Retina displays
- Batch sprite rendering (single `fillStyle` set per color group)

### Animation State Machine
- Animations are **fire-and-forget** (no promises, no callbacks)
- Loop animations reset `startTime` on completion
- One-shot animations set `animation = null` on completion
- Status changes override current animation immediately

### Agent Metadata Loading
- **Phase 1** (MVP): Hardcoded metadata in `agentMetadataLoader.ts`
- **Phase 2** (future): Parse `.github/agents/*.agent.md` YAML frontmatter via backend service
- **Phase 3** (future): Live updates from GitHub repo watcher

### Message Protocol
- Backend: `AgentActivityMonitor` emits `activity-update` events
- Frontend: `PixelAgentsViewProvider` forwards to webview via `postMessage`
- Webview: `OfficeCanvas` listens to `window.addEventListener('message', ...)`
- Format: `{ type: 'activity-update', payload: { agentId, status, action, code } }`

---

## 🔗 Related Documentation

- **Architecture**: `/docs/02-architecture/architecture-design.md` (canvas rendering, game loop)
- **Design System**: `/docs/02-architecture/design-systems.md` v2.0.0 (agent colors, TDD phase colors)
- **Agent Metadata**: `.github/agents/*.agent.md` (spriteColor, displayName, icon)
- **Team Layout**: `agent-team-layout.json` (desk assignments)
- **US-003-001**: Office Canvas Grid (dependency — COMPLETE)
- **US-001-002**: Agent Activity Monitor (provides status updates — COMPLETE)
- **Penpot Export**: Figma/Penpot design boards (visual reference)

---

**Dev-Lead Approval**: ⬜ Pending  
**Plan Version**: 1.0  
**Last Updated**: 2026-04-27
