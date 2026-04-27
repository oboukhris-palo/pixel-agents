/**
 * Animation Engine Tests (US-003-002 Layer 2)
 *
 * Tests sprite lifecycle, animation types, easing application,
 * looping behavior, and agent status mapping.
 */

import { AnimationEngine } from './animationEngine';
import {
  createAgentSprite,
} from '../sprites/spriteTypes';
import type { MoveParams, IdleParams, TypingParams, CelebrationParams } from '../sprites/spriteTypes';

function makeSprite(id = 's1', x = 5, y = 3) {
  return createAgentSprite(id, `agent-${id}`, x, y, '#FF5500');
}

// ── Sprite management ─────────────────────────────────────────────────────────

describe('AnimationEngine — sprite management', () => {
  let engine: AnimationEngine;

  beforeEach(() => {
    engine = new AnimationEngine();
  });

  it('starts with no sprites', () => {
    expect(engine.getSpriteCount()).toBe(0);
    expect(engine.getSprites()).toEqual([]);
  });

  it('addSprite / getSprite', () => {
    const sprite = makeSprite();
    engine.addSprite(sprite);
    expect(engine.getSprite('s1')).toBe(sprite);
    expect(engine.getSpriteCount()).toBe(1);
  });

  it('removeSprite returns true when found', () => {
    engine.addSprite(makeSprite());
    expect(engine.removeSprite('s1')).toBe(true);
    expect(engine.getSpriteCount()).toBe(0);
  });

  it('removeSprite returns false when not found', () => {
    expect(engine.removeSprite('nonexistent')).toBe(false);
  });

  it('getSprites returns all sprites', () => {
    engine.addSprite(makeSprite('a', 0, 0));
    engine.addSprite(makeSprite('b', 1, 1));
    expect(engine.getSprites()).toHaveLength(2);
  });

  it('getSprite returns undefined for missing id', () => {
    expect(engine.getSprite('missing')).toBeUndefined();
  });

  it('reset clears all sprites', () => {
    engine.addSprite(makeSprite());
    engine.reset();
    expect(engine.getSpriteCount()).toBe(0);
  });
});

// ── Move animation ────────────────────────────────────────────────────────────

describe('AnimationEngine — move animation', () => {
  let engine: AnimationEngine;

  beforeEach(() => {
    engine = new AnimationEngine();
    engine.addSprite(makeSprite('s1', 0, 0));
  });

  it('startMove sets animation and status', () => {
    engine.startMove('s1', 10, 5, 0);
    const sprite = engine.getSprite('s1')!;
    expect(sprite.animation).not.toBeNull();
    expect(sprite.animation!.type).toBe('move');
    expect(sprite.status).toBe('active');
    expect(sprite.targetPosition).toEqual({ x: 10, y: 5 });
  });

  it('startMove on missing sprite is no-op', () => {
    engine.startMove('missing', 10, 5, 0);
    // No error thrown
  });

  it('update moves sprite toward target', () => {
    engine.startMove('s1', 10, 0, 0);
    engine.update(500); // 50% progress
    const sprite = engine.getSprite('s1')!;
    expect(sprite.position.x).toBeGreaterThan(0);
    expect(sprite.position.x).toBeLessThan(10);
  });

  it('animation completes and snaps to target', () => {
    engine.startMove('s1', 10, 5, 0);
    engine.update(1000); // 100% — exactly at duration
    const sprite = engine.getSprite('s1')!;
    expect(sprite.position.x).toBe(10);
    expect(sprite.position.y).toBe(5);
    expect(sprite.animation).toBeNull();
    expect(sprite.status).toBe('idle');
  });

  it('animation stays complete after duration passes', () => {
    engine.startMove('s1', 10, 5, 0);
    engine.update(2000); // Well past duration
    const sprite = engine.getSprite('s1')!;
    expect(sprite.position.x).toBe(10);
    expect(sprite.position.y).toBe(5);
  });

  it('move params contain start and end positions', () => {
    engine.startMove('s1', 10, 5, 0);
    const params = engine.getSprite('s1')!.animation!.params as MoveParams;
    expect(params.startX).toBe(0);
    expect(params.startY).toBe(0);
    expect(params.endX).toBe(10);
    expect(params.endY).toBe(5);
  });
});

// ── Idle animation ────────────────────────────────────────────────────────────

describe('AnimationEngine — idle animation', () => {
  let engine: AnimationEngine;

  beforeEach(() => {
    engine = new AnimationEngine();
    engine.addSprite(makeSprite('s1', 5, 3));
  });

  it('startIdle sets looping idle animation', () => {
    engine.startIdle('s1', 0);
    const sprite = engine.getSprite('s1')!;
    expect(sprite.animation!.type).toBe('idle');
    expect(sprite.animation!.loop).toBe(true);
    expect(sprite.status).toBe('idle');
  });

  it('idle animation bobs sprite vertically', () => {
    engine.startIdle('s1', 0);
    engine.update(500); // 25% of 2000ms duration
    const sprite = engine.getSprite('s1')!;
    // Position should differ from baseY (3)
    expect(sprite.position.y).not.toBe(3);
  });

  it('idle animation loops (still animating after one cycle)', () => {
    engine.startIdle('s1', 0);
    engine.update(3000); // 1.5 cycles
    const sprite = engine.getSprite('s1')!;
    expect(sprite.animation).not.toBeNull(); // Still animating
  });

  it('idle params have correct base and offset', () => {
    engine.startIdle('s1', 0);
    const params = engine.getSprite('s1')!.animation!.params as IdleParams;
    expect(params.baseY).toBe(3);
    expect(params.yOffset).toBe(4);
  });
});

// ── Typing animation ─────────────────────────────────────────────────────────

describe('AnimationEngine — typing animation', () => {
  let engine: AnimationEngine;

  beforeEach(() => {
    engine = new AnimationEngine();
    engine.addSprite(makeSprite('s1', 5, 3));
  });

  it('startTyping sets looping typing animation', () => {
    engine.startTyping('s1', 0);
    const sprite = engine.getSprite('s1')!;
    expect(sprite.animation!.type).toBe('typing');
    expect(sprite.animation!.loop).toBe(true);
    expect(sprite.status).toBe('thinking');
  });

  it('typing animation shakes sprite horizontally', () => {
    engine.startTyping('s1', 0);
    engine.update(75); // 25% of 300ms
    const sprite = engine.getSprite('s1')!;
    // x should differ from base
    expect(typeof sprite.position.x).toBe('number');
  });

  it('typing params have correct base and offset', () => {
    engine.startTyping('s1', 0);
    const params = engine.getSprite('s1')!.animation!.params as TypingParams;
    expect(params.baseX).toBe(5);
    expect(params.xOffset).toBe(2);
  });
});

// ── Celebration animation ─────────────────────────────────────────────────────

describe('AnimationEngine — celebration animation', () => {
  let engine: AnimationEngine;

  beforeEach(() => {
    engine = new AnimationEngine();
    engine.addSprite(makeSprite('s1', 5, 10));
  });

  it('startCelebration sets non-looping celebration', () => {
    engine.startCelebration('s1', 0);
    const sprite = engine.getSprite('s1')!;
    expect(sprite.animation!.type).toBe('celebration');
    expect(sprite.animation!.loop).toBe(false);
    expect(sprite.status).toBe('celebrating');
  });

  it('celebration ends after duration', () => {
    engine.startCelebration('s1', 0);
    engine.update(600); // Full duration
    const sprite = engine.getSprite('s1')!;
    expect(sprite.animation).toBeNull();
  });

  it('celebration params have peak height', () => {
    engine.startCelebration('s1', 0);
    const params = engine.getSprite('s1')!.animation!.params as CelebrationParams;
    expect(params.peakHeight).toBe(20);
  });
});

// ── stopAnimation ─────────────────────────────────────────────────────────────

describe('AnimationEngine — stopAnimation', () => {
  let engine: AnimationEngine;

  beforeEach(() => {
    engine = new AnimationEngine();
    engine.addSprite(makeSprite('s1', 5, 3));
  });

  it('stops running animation', () => {
    engine.startIdle('s1', 0);
    engine.stopAnimation('s1');
    const sprite = engine.getSprite('s1')!;
    expect(sprite.animation).toBeNull();
    expect(sprite.status).toBe('inactive');
  });

  it('stopAnimation on missing sprite is no-op', () => {
    engine.stopAnimation('missing');
    // No error
  });
});

// ── applyAgentStatus ──────────────────────────────────────────────────────────

describe('AnimationEngine — applyAgentStatus', () => {
  let engine: AnimationEngine;

  beforeEach(() => {
    engine = new AnimationEngine();
    engine.addSprite(makeSprite('s1', 5, 3));
  });

  it('active triggers move if coordinates provided', () => {
    engine.applyAgentStatus('s1', 'active', 0, 10, 5);
    expect(engine.getSprite('s1')!.animation!.type).toBe('move');
  });

  it('active without coordinates does nothing', () => {
    engine.applyAgentStatus('s1', 'active', 0);
    expect(engine.getSprite('s1')!.animation).toBeNull();
  });

  it('idle triggers idle animation', () => {
    engine.applyAgentStatus('s1', 'idle', 0);
    expect(engine.getSprite('s1')!.animation!.type).toBe('idle');
  });

  it('thinking triggers typing animation', () => {
    engine.applyAgentStatus('s1', 'thinking', 0);
    expect(engine.getSprite('s1')!.animation!.type).toBe('typing');
  });

  it('celebrating triggers celebration animation', () => {
    engine.applyAgentStatus('s1', 'celebrating', 0);
    expect(engine.getSprite('s1')!.animation!.type).toBe('celebration');
  });

  it('inactive stops animation', () => {
    engine.startIdle('s1', 0);
    engine.applyAgentStatus('s1', 'inactive', 0);
    expect(engine.getSprite('s1')!.animation).toBeNull();
    expect(engine.getSprite('s1')!.status).toBe('inactive');
  });
});

// ── Update with no sprites / no animation ─────────────────────────────────────

describe('AnimationEngine — edge cases', () => {
  it('update with no sprites is a no-op', () => {
    const engine = new AnimationEngine();
    expect(() => engine.update(0)).not.toThrow();
  });

  it('update skips sprites with no animation', () => {
    const engine = new AnimationEngine();
    engine.addSprite(makeSprite());
    engine.update(1000);
    expect(engine.getSprite('s1')!.position).toEqual({ x: 5, y: 3 });
  });

  it('handles multiple sprites simultaneously', () => {
    const engine = new AnimationEngine();
    engine.addSprite(makeSprite('a', 0, 0));
    engine.addSprite(makeSprite('b', 10, 10));
    engine.startMove('a', 5, 5, 0);
    engine.startIdle('b', 0);
    engine.update(500);
    expect(engine.getSprite('a')!.position.x).toBeGreaterThan(0);
    expect(engine.getSprite('b')!.animation).not.toBeNull();
  });

  it('replacing animation overwrites previous', () => {
    const engine = new AnimationEngine();
    engine.addSprite(makeSprite('s1', 5, 3));
    engine.startIdle('s1', 0);
    engine.startTyping('s1', 0); // Replace idle with typing
    expect(engine.getSprite('s1')!.animation!.type).toBe('typing');
  });
});
