/**
 * Sprite Types & Data Models (US-003-002 Layer 1)
 *
 * Defines the type system for agent sprites, animations, and easing functions.
 * Used by AnimationEngine and CanvasRenderer for 2D sprite animation.
 *
 * Design reference: design-systems.md v2.0.0 (Palo IT branding)
 */

// ── Position & Size ───────────────────────────────────────────────────────────

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

// ── Animation types ───────────────────────────────────────────────────────────

export type AnimationType = 'move' | 'idle' | 'typing' | 'celebration';

export type AgentStatus = 'inactive' | 'idle' | 'active' | 'thinking' | 'celebrating';

export type EasingFunctionName = 'linear' | 'quadEaseInOut' | 'sineEaseInOut' | 'backEaseOut';

// ── Animation params (polymorphic by type) ────────────────────────────────────

export interface MoveParams {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export interface IdleParams {
  baseY: number;
  yOffset: number; // ±px bob range (default 4)
}

export interface TypingParams {
  baseX: number;
  xOffset: number; // ±px shake range (default 2)
}

export interface CelebrationParams {
  peakHeight: number; // px jump height (default 20)
}

export type AnimationParams = MoveParams | IdleParams | TypingParams | CelebrationParams;

// ── Animation ─────────────────────────────────────────────────────────────────

export interface Animation {
  type: AnimationType;
  startTime: number;
  duration: number;
  easing: EasingFunctionName;
  params: AnimationParams;
  loop: boolean;
}

// ── Agent Sprite ──────────────────────────────────────────────────────────────

export interface AgentSprite {
  id: string;
  agentId: string;
  position: Position;
  targetPosition: Position;
  color: string;
  size: Size;
  animation: Animation | null;
  status: AgentStatus;
}

// ── Validation functions ──────────────────────────────────────────────────────

export function isValidPosition(pos: unknown): pos is Position {
  if (typeof pos !== 'object' || pos === null) return false;
  const p = pos as Record<string, unknown>;
  return typeof p.x === 'number' && typeof p.y === 'number' &&
    Number.isFinite(p.x) && Number.isFinite(p.y) && p.x >= 0 && p.y >= 0;
}

export function isValidSize(size: unknown): size is Size {
  if (typeof size !== 'object' || size === null) return false;
  const s = size as Record<string, unknown>;
  return typeof s.width === 'number' && typeof s.height === 'number' &&
    s.width > 0 && s.height > 0;
}

const VALID_ANIMATION_TYPES: AnimationType[] = ['move', 'idle', 'typing', 'celebration'];

export function isValidAnimationType(type: unknown): type is AnimationType {
  return typeof type === 'string' && VALID_ANIMATION_TYPES.includes(type as AnimationType);
}

const VALID_AGENT_STATUSES: AgentStatus[] = ['inactive', 'idle', 'active', 'thinking', 'celebrating'];

export function isValidAgentStatus(status: unknown): status is AgentStatus {
  return typeof status === 'string' && VALID_AGENT_STATUSES.includes(status as AgentStatus);
}

const VALID_EASING_NAMES: EasingFunctionName[] = ['linear', 'quadEaseInOut', 'sineEaseInOut', 'backEaseOut'];

export function isValidEasingFunction(name: unknown): name is EasingFunctionName {
  return typeof name === 'string' && VALID_EASING_NAMES.includes(name as EasingFunctionName);
}

export function isValidAnimation(anim: unknown): anim is Animation {
  if (typeof anim !== 'object' || anim === null) return false;
  const a = anim as Record<string, unknown>;
  return (
    isValidAnimationType(a.type) &&
    typeof a.startTime === 'number' && a.startTime >= 0 &&
    typeof a.duration === 'number' && a.duration > 0 &&
    isValidEasingFunction(a.easing) &&
    typeof a.params === 'object' && a.params !== null &&
    typeof a.loop === 'boolean'
  );
}

export function isValidSprite(sprite: unknown): sprite is AgentSprite {
  if (typeof sprite !== 'object' || sprite === null) return false;
  const s = sprite as Record<string, unknown>;
  return (
    typeof s.id === 'string' && s.id.length > 0 &&
    typeof s.agentId === 'string' && s.agentId.length > 0 &&
    isValidPosition(s.position) &&
    isValidPosition(s.targetPosition) &&
    typeof s.color === 'string' && s.color.length > 0 &&
    isValidSize(s.size) &&
    (s.animation === null || isValidAnimation(s.animation)) &&
    isValidAgentStatus(s.status)
  );
}

// ── Factory functions ─────────────────────────────────────────────────────────

/** Default sprite size: 16×16 pixels */
const DEFAULT_SPRITE_SIZE: Size = { width: 16, height: 16 };

/** Creates an agent sprite at the given grid position. */
export function createAgentSprite(
  id: string,
  agentId: string,
  x: number,
  y: number,
  color: string,
): AgentSprite {
  return {
    id,
    agentId,
    position: { x, y },
    targetPosition: { x, y },
    color,
    size: { ...DEFAULT_SPRITE_SIZE },
    animation: null,
    status: 'inactive',
  };
}

/** Creates a move animation from start to end position. */
export function createMoveAnimation(
  startX: number, startY: number,
  endX: number, endY: number,
  startTime: number,
): Animation {
  return {
    type: 'move',
    startTime,
    duration: 1000,
    easing: 'quadEaseInOut',
    params: { startX, startY, endX, endY } as MoveParams,
    loop: false,
  };
}

/** Creates a looping idle bob animation. */
export function createIdleAnimation(baseY: number, startTime: number): Animation {
  return {
    type: 'idle',
    startTime,
    duration: 2000,
    easing: 'sineEaseInOut',
    params: { baseY, yOffset: 4 } as IdleParams,
    loop: true,
  };
}

/** Creates a looping typing shake animation. */
export function createTypingAnimation(baseX: number, startTime: number): Animation {
  return {
    type: 'typing',
    startTime,
    duration: 300,
    easing: 'linear',
    params: { baseX, xOffset: 2 } as TypingParams,
    loop: true,
  };
}

/** Creates a one-shot celebration jump animation. */
export function createCelebrationAnimation(startTime: number): Animation {
  return {
    type: 'celebration',
    startTime,
    duration: 600,
    easing: 'backEaseOut',
    params: { peakHeight: 20 } as CelebrationParams,
    loop: false,
  };
}
