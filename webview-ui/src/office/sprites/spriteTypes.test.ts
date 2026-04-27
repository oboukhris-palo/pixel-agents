/**
 * Sprite Types Tests (US-003-002 Layer 1)
 * Covers: type definitions, validation functions, factory functions
 */

import {
  isValidPosition,
  isValidSize,
  isValidAnimationType,
  isValidAgentStatus,
  isValidEasingFunction,
  isValidAnimation,
  isValidSprite,
  createAgentSprite,
  createMoveAnimation,
  createIdleAnimation,
  createTypingAnimation,
  createCelebrationAnimation,
} from './spriteTypes';
import type {
  Position,
  Size,
  Animation,
  AgentSprite,
  MoveParams,
  IdleParams,
  TypingParams,
  CelebrationParams,
} from './spriteTypes';

// ── isValidPosition ───────────────────────────────────────────────────────────

describe('isValidPosition', () => {
  it('returns true for valid positions', () => {
    expect(isValidPosition({ x: 0, y: 0 })).toBe(true);
    expect(isValidPosition({ x: 10, y: 20 })).toBe(true);
    expect(isValidPosition({ x: 100.5, y: 200.25 })).toBe(true);
  });

  it('returns false for negative coordinates', () => {
    expect(isValidPosition({ x: -1, y: 0 })).toBe(false);
    expect(isValidPosition({ x: 0, y: -1 })).toBe(false);
  });

  it('returns false for non-finite values', () => {
    expect(isValidPosition({ x: NaN, y: 0 })).toBe(false);
    expect(isValidPosition({ x: 0, y: Infinity })).toBe(false);
  });

  it('returns false for non-objects', () => {
    expect(isValidPosition(null)).toBe(false);
    expect(isValidPosition(undefined)).toBe(false);
    expect(isValidPosition('hello')).toBe(false);
    expect(isValidPosition(42)).toBe(false);
  });

  it('returns false for missing properties', () => {
    expect(isValidPosition({ x: 0 })).toBe(false);
    expect(isValidPosition({ y: 0 })).toBe(false);
    expect(isValidPosition({})).toBe(false);
  });
});

// ── isValidSize ───────────────────────────────────────────────────────────────

describe('isValidSize', () => {
  it('returns true for valid sizes', () => {
    expect(isValidSize({ width: 16, height: 16 })).toBe(true);
    expect(isValidSize({ width: 1, height: 0.5 })).toBe(true);
  });

  it('returns false for zero or negative dimensions', () => {
    expect(isValidSize({ width: 0, height: 16 })).toBe(false);
    expect(isValidSize({ width: 16, height: -1 })).toBe(false);
  });

  it('returns false for non-objects', () => {
    expect(isValidSize(null)).toBe(false);
    expect(isValidSize(undefined)).toBe(false);
  });
});

// ── isValidAnimationType ──────────────────────────────────────────────────────

describe('isValidAnimationType', () => {
  it('returns true for all animation types', () => {
    expect(isValidAnimationType('move')).toBe(true);
    expect(isValidAnimationType('idle')).toBe(true);
    expect(isValidAnimationType('typing')).toBe(true);
    expect(isValidAnimationType('celebration')).toBe(true);
  });

  it('returns false for invalid types', () => {
    expect(isValidAnimationType('run')).toBe(false);
    expect(isValidAnimationType('')).toBe(false);
    expect(isValidAnimationType(42)).toBe(false);
    expect(isValidAnimationType(null)).toBe(false);
  });
});

// ── isValidAgentStatus ────────────────────────────────────────────────────────

describe('isValidAgentStatus', () => {
  it('returns true for all statuses', () => {
    expect(isValidAgentStatus('inactive')).toBe(true);
    expect(isValidAgentStatus('idle')).toBe(true);
    expect(isValidAgentStatus('active')).toBe(true);
    expect(isValidAgentStatus('thinking')).toBe(true);
    expect(isValidAgentStatus('celebrating')).toBe(true);
  });

  it('returns false for invalid statuses', () => {
    expect(isValidAgentStatus('running')).toBe(false);
    expect(isValidAgentStatus('')).toBe(false);
    expect(isValidAgentStatus(null)).toBe(false);
  });
});

// ── isValidEasingFunction ─────────────────────────────────────────────────────

describe('isValidEasingFunction', () => {
  it('returns true for all easing names', () => {
    expect(isValidEasingFunction('linear')).toBe(true);
    expect(isValidEasingFunction('quadEaseInOut')).toBe(true);
    expect(isValidEasingFunction('sineEaseInOut')).toBe(true);
    expect(isValidEasingFunction('backEaseOut')).toBe(true);
  });

  it('returns false for invalid easing names', () => {
    expect(isValidEasingFunction('elastic')).toBe(false);
    expect(isValidEasingFunction(123)).toBe(false);
  });
});

// ── isValidAnimation ──────────────────────────────────────────────────────────

describe('isValidAnimation', () => {
  const validAnim: Animation = {
    type: 'move',
    startTime: 0,
    duration: 1000,
    easing: 'linear',
    params: { startX: 0, startY: 0, endX: 10, endY: 10 },
    loop: false,
  };

  it('returns true for valid animation', () => {
    expect(isValidAnimation(validAnim)).toBe(true);
  });

  it('returns false if duration is <= 0', () => {
    expect(isValidAnimation({ ...validAnim, duration: 0 })).toBe(false);
    expect(isValidAnimation({ ...validAnim, duration: -1 })).toBe(false);
  });

  it('returns false if startTime is negative', () => {
    expect(isValidAnimation({ ...validAnim, startTime: -1 })).toBe(false);
  });

  it('returns false for invalid type', () => {
    expect(isValidAnimation({ ...validAnim, type: 'invalid' })).toBe(false);
  });

  it('returns false for invalid easing', () => {
    expect(isValidAnimation({ ...validAnim, easing: 'bounce' })).toBe(false);
  });

  it('returns false for null params', () => {
    expect(isValidAnimation({ ...validAnim, params: null })).toBe(false);
  });

  it('returns false for non-object', () => {
    expect(isValidAnimation(null)).toBe(false);
    expect(isValidAnimation('anim')).toBe(false);
  });
});

// ── isValidSprite ─────────────────────────────────────────────────────────────

describe('isValidSprite', () => {
  const validSprite: AgentSprite = {
    id: 'sprite-1',
    agentId: 'dev-tdd-red',
    position: { x: 5, y: 3 },
    targetPosition: { x: 5, y: 3 },
    color: '#FF5500',
    size: { width: 16, height: 16 },
    animation: null,
    status: 'idle',
  };

  it('returns true for valid sprite', () => {
    expect(isValidSprite(validSprite)).toBe(true);
  });

  it('returns true for sprite with animation', () => {
    const withAnim: AgentSprite = {
      ...validSprite,
      animation: {
        type: 'idle',
        startTime: 0,
        duration: 2000,
        easing: 'sineEaseInOut',
        params: { baseY: 3, yOffset: 4 },
        loop: true,
      },
    };
    expect(isValidSprite(withAnim)).toBe(true);
  });

  it('returns false for empty id', () => {
    expect(isValidSprite({ ...validSprite, id: '' })).toBe(false);
  });

  it('returns false for empty agentId', () => {
    expect(isValidSprite({ ...validSprite, agentId: '' })).toBe(false);
  });

  it('returns false for invalid position', () => {
    expect(isValidSprite({ ...validSprite, position: { x: -1, y: 0 } })).toBe(false);
  });

  it('returns false for invalid size', () => {
    expect(isValidSprite({ ...validSprite, size: { width: 0, height: 16 } })).toBe(false);
  });

  it('returns false for invalid status', () => {
    expect(isValidSprite({ ...validSprite, status: 'running' })).toBe(false);
  });

  it('returns false for non-object', () => {
    expect(isValidSprite(null)).toBe(false);
    expect(isValidSprite(42)).toBe(false);
  });
});

// ── Factory: createAgentSprite ────────────────────────────────────────────────

describe('createAgentSprite', () => {
  it('creates sprite with correct properties', () => {
    const sprite = createAgentSprite('s1', 'dev-lead', 5, 3, '#4CAF50');
    expect(sprite.id).toBe('s1');
    expect(sprite.agentId).toBe('dev-lead');
    expect(sprite.position).toEqual({ x: 5, y: 3 });
    expect(sprite.targetPosition).toEqual({ x: 5, y: 3 });
    expect(sprite.color).toBe('#4CAF50');
    expect(sprite.size).toEqual({ width: 16, height: 16 });
    expect(sprite.animation).toBeNull();
    expect(sprite.status).toBe('inactive');
  });

  it('creates valid sprite (passes validation)', () => {
    const sprite = createAgentSprite('s1', 'orchestrator', 0, 0, '#FFD600');
    expect(isValidSprite(sprite)).toBe(true);
  });

  it('returns independent size objects (no shared reference)', () => {
    const a = createAgentSprite('a', 'agent-a', 0, 0, '#FFF');
    const b = createAgentSprite('b', 'agent-b', 0, 0, '#000');
    a.size.width = 32;
    expect(b.size.width).toBe(16);
  });
});

// ── Factory: createMoveAnimation ──────────────────────────────────────────────

describe('createMoveAnimation', () => {
  it('creates move animation with correct defaults', () => {
    const anim = createMoveAnimation(0, 0, 10, 5, 1000);
    expect(anim.type).toBe('move');
    expect(anim.duration).toBe(1000);
    expect(anim.easing).toBe('quadEaseInOut');
    expect(anim.loop).toBe(false);
    expect(anim.startTime).toBe(1000);
    const params = anim.params as MoveParams;
    expect(params.startX).toBe(0);
    expect(params.startY).toBe(0);
    expect(params.endX).toBe(10);
    expect(params.endY).toBe(5);
  });

  it('passes validation', () => {
    expect(isValidAnimation(createMoveAnimation(0, 0, 5, 5, 0))).toBe(true);
  });
});

// ── Factory: createIdleAnimation ──────────────────────────────────────────────

describe('createIdleAnimation', () => {
  it('creates idle animation with correct defaults', () => {
    const anim = createIdleAnimation(3, 500);
    expect(anim.type).toBe('idle');
    expect(anim.duration).toBe(2000);
    expect(anim.easing).toBe('sineEaseInOut');
    expect(anim.loop).toBe(true);
    const params = anim.params as IdleParams;
    expect(params.baseY).toBe(3);
    expect(params.yOffset).toBe(4);
  });

  it('passes validation', () => {
    expect(isValidAnimation(createIdleAnimation(0, 0))).toBe(true);
  });
});

// ── Factory: createTypingAnimation ────────────────────────────────────────────

describe('createTypingAnimation', () => {
  it('creates typing animation with correct defaults', () => {
    const anim = createTypingAnimation(5, 200);
    expect(anim.type).toBe('typing');
    expect(anim.duration).toBe(300);
    expect(anim.easing).toBe('linear');
    expect(anim.loop).toBe(true);
    const params = anim.params as TypingParams;
    expect(params.baseX).toBe(5);
    expect(params.xOffset).toBe(2);
  });

  it('passes validation', () => {
    expect(isValidAnimation(createTypingAnimation(0, 0))).toBe(true);
  });
});

// ── Factory: createCelebrationAnimation ───────────────────────────────────────

describe('createCelebrationAnimation', () => {
  it('creates celebration animation with correct defaults', () => {
    const anim = createCelebrationAnimation(0);
    expect(anim.type).toBe('celebration');
    expect(anim.duration).toBe(600);
    expect(anim.easing).toBe('backEaseOut');
    expect(anim.loop).toBe(false);
    const params = anim.params as CelebrationParams;
    expect(params.peakHeight).toBe(20);
  });

  it('passes validation', () => {
    expect(isValidAnimation(createCelebrationAnimation(100))).toBe(true);
  });
});
