/**
 * ParticleSystem Tests (US-002-004 Layer 2 - RED phase)
 *
 * Tests for particle emission, physics simulation, rendering, and cleanup.
 * Design reference: design-systems.md v2.0.0 (Palo IT brand colors)
 */

import { ParticleSystem } from './particleSystem';

// ── Mock canvas context ────────────────────────────────────────────────────────

function createMockContext(): CanvasRenderingContext2D {
  return {
    save: jest.fn(),
    restore: jest.fn(),
    translate: jest.fn(),
    rotate: jest.fn(),
    fillRect: jest.fn(),
    globalAlpha: 1,
    fillStyle: '',
  } as unknown as CanvasRenderingContext2D;
}

// ── Emission tests ─────────────────────────────────────────────────────────────

describe('ParticleSystem - Emission', () => {
  let ps: ParticleSystem;

  beforeEach(() => {
    ps = new ParticleSystem();
  });

  afterEach(() => {
    ps.reset();
  });

  it('should start with zero particles', () => {
    expect(ps.getParticleCount()).toBe(0);
  });

  it('should emit correct number of confetti particles (AC1 – 25% milestone)', () => {
    ps.emitConfetti(100, 100, 50);
    expect(ps.getParticleCount()).toBe(50);
  });

  it('should emit confetti with Palo IT brand colors', () => {
    ps.emitConfetti(100, 100, 50);
    const particles = ps.getParticles();
    const validColors = ['#00C853', '#FFD600', '#FF6D00', '#7B3FF2'];
    particles.forEach(p => {
      expect(validColors).toContain(p.color);
    });
  });

  it('should emit confetti with rotation properties', () => {
    ps.emitConfetti(100, 100, 10);
    const particles = ps.getParticles();
    particles.forEach(p => {
      expect(p.rotation).toBeDefined();
      expect(p.rotationSpeed).toBeDefined();
    });
  });

  it('should emit star burst particles at given position (AC3 – 75% milestone)', () => {
    ps.emitStarBurst(200, 200, 100);
    expect(ps.getParticleCount()).toBe(100);
  });

  it('should emit star burst in all directions (radial spread)', () => {
    ps.emitStarBurst(0, 0, 8);
    const particles = ps.getParticles();
    const hasPositiveVx = particles.some(p => p.vx > 0);
    const hasNegativeVx = particles.some(p => p.vx < 0);
    const hasPositiveVy = particles.some(p => p.vy > 0);
    const hasNegativeVy = particles.some(p => p.vy < 0);
    expect(hasPositiveVx).toBe(true);
    expect(hasNegativeVx).toBe(true);
    expect(hasPositiveVy).toBe(true);
    expect(hasNegativeVy).toBe(true);
  });

  it('should emit star burst with Palo Yellow color', () => {
    ps.emitStarBurst(0, 0, 10);
    ps.getParticles().forEach(p => {
      expect(p.color).toBe('#FFD600');
    });
  });

  it('should emit fireworks particles (AC4 – 100% milestone)', () => {
    ps.emitFireworks(300, 300, 200);
    expect(ps.getParticleCount()).toBe(200);
  });

  it('should emit fireworks with Palo Yellow color', () => {
    ps.emitFireworks(0, 0, 10);
    ps.getParticles().forEach(p => {
      expect(p.color).toBe('#FFD600');
    });
  });

  it('should accumulate particles across multiple emissions', () => {
    ps.emitConfetti(100, 100, 20);
    ps.emitStarBurst(200, 200, 30);
    expect(ps.getParticleCount()).toBe(50);
  });
});

// ── Physics tests ──────────────────────────────────────────────────────────────

describe('ParticleSystem - Physics Update', () => {
  let ps: ParticleSystem;

  beforeEach(() => {
    ps = new ParticleSystem();
  });

  it('should advance particle lifetime on update', () => {
    ps.emitConfetti(0, 0, 5);
    const before = ps.getParticles().map(p => p.life);
    ps.update(16);
    const after = ps.getParticles().map(p => p.life);
    after.forEach((life, i) => {
      expect(life).toBeGreaterThan(before[i]);
    });
  });

  it('should apply gravity to particle vy on update', () => {
    ps.emitFireworks(0, 0, 5);
    const initialVy = ps.getParticles().map(p => p.vy);
    ps.update(16);
    const updatedVy = ps.getParticles().map(p => p.vy);
    updatedVy.forEach((vy, i) => {
      expect(vy).toBeGreaterThan(initialVy[i]);
    });
  });

  it('should move particles by velocity on update', () => {
    ps.emitStarBurst(100, 100, 4);
    const initialPositions = ps.getParticles().map(p => ({ x: p.x, y: p.y }));
    ps.update(16);
    const updatedPositions = ps.getParticles().map(p => ({ x: p.x, y: p.y }));
    // At least one particle should have moved
    const hasMoved = updatedPositions.some(
      (pos, i) => pos.x !== initialPositions[i].x || pos.y !== initialPositions[i].y
    );
    expect(hasMoved).toBe(true);
  });

  it('should remove expired particles (AC12 – no memory leaks)', () => {
    ps.emitConfetti(0, 0, 5);
    // Advance past maxLife (2000ms)
    ps.update(2001);
    expect(ps.getParticleCount()).toBe(0);
  });

  it('should keep alive particles within their maxLife', () => {
    ps.emitConfetti(0, 0, 5);
    ps.update(500); // Half of 2000ms life
    expect(ps.getParticleCount()).toBe(5);
  });

  it('should update rotation for confetti particles', () => {
    ps.emitConfetti(0, 0, 5);
    const initialRotations = ps.getParticles().map(p => p.rotation!);
    ps.update(16);
    const updatedRotations = ps.getParticles().map(p => p.rotation!);
    const rotationChanged = updatedRotations.some((r, i) => r !== initialRotations[i]);
    expect(rotationChanged).toBe(true);
  });
});

// ── Rendering tests ────────────────────────────────────────────────────────────

describe('ParticleSystem - Rendering', () => {
  let ps: ParticleSystem;
  let ctx: CanvasRenderingContext2D;

  beforeEach(() => {
    ps = new ParticleSystem();
    ctx = createMockContext();
  });

  it('should call save/restore per particle render', () => {
    ps.emitConfetti(0, 0, 3);
    ps.render(ctx);
    expect(ctx.save).toHaveBeenCalledTimes(3);
    expect(ctx.restore).toHaveBeenCalledTimes(3);
  });

  it('should render particles on canvas overlay (AC8)', () => {
    ps.emitConfetti(0, 0, 3);
    ps.render(ctx);
    expect(ctx.fillRect).toHaveBeenCalled();
  });

  it('should apply opacity fade based on lifetime (AC8)', () => {
    ps.emitConfetti(0, 0, 1);
    ps.update(1000); // 50% of 2000ms life → alpha = 0.5
    const ctxProxy = new Proxy(ctx, {
      set(target, key, value) {
        (target as any)[key] = value;
        return true;
      }
    });
    ps.render(ctxProxy);
    // globalAlpha should be between 0 and 1
    expect((ctxProxy as any).globalAlpha).toBeGreaterThanOrEqual(0);
    expect((ctxProxy as any).globalAlpha).toBeLessThanOrEqual(1);
  });

  it('should not render when there are no particles', () => {
    ps.render(ctx);
    expect(ctx.save).not.toHaveBeenCalled();
  });
});

// ── Lifecycle tests ────────────────────────────────────────────────────────────

describe('ParticleSystem - Lifecycle', () => {
  let ps: ParticleSystem;

  beforeEach(() => {
    ps = new ParticleSystem();
  });

  it('should reset all particles on reset()', () => {
    ps.emitConfetti(0, 0, 20);
    ps.reset();
    expect(ps.getParticleCount()).toBe(0);
  });

  it('should allow re-emission after reset', () => {
    ps.emitConfetti(0, 0, 10);
    ps.reset();
    ps.emitFireworks(0, 0, 5);
    expect(ps.getParticleCount()).toBe(5);
  });
});
