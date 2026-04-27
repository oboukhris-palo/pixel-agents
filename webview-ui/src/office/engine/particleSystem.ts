/**
 * Particle System (US-002-004 Layer 2)
 *
 * Manages particle emissions, physics updates, and rendering
 * for celebration effects (confetti, fireworks, star bursts).
 *
 * Design reference: design-systems.md v2.0.0 (Palo IT brand colors)
 * Palo IT palette: #00C853, #FFD600, #FF6D00, #7B3FF2
 */

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  rotation?: number;
  rotationSpeed?: number;
}

// ── Palo IT brand palette (design-systems.md v2.0.0) ──────────────────────────
const PALO_COLORS = ['#00C853', '#FFD600', '#FF6D00', '#7B3FF2'] as const;
const PALO_YELLOW = '#FFD600';

export class ParticleSystem {
  private particles: Particle[] = [];
  private readonly gravity = 0.2;

  // ── Emission ──────────────────────────────────────────────────────────────

  /**
   * Emit confetti particles (AC1 – 25%, AC2 – 50% milestones)
   * @param x  Canvas X origin
   * @param y  Canvas Y origin
   * @param count  Number of particles to emit
   */
  emitConfetti(x: number, y: number, count: number): void {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 10,
        vy: Math.random() * -8,
        color: PALO_COLORS[Math.floor(Math.random() * PALO_COLORS.length)],
        size: Math.random() * 4 + 2,
        life: 0,
        maxLife: 2000,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
      });
    }
  }

  /**
   * Emit star burst particles (AC3 – 75% milestone)
   * Radiates evenly in all directions using Palo Yellow.
   */
  emitStarBurst(x: number, y: number, count: number): void {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const speed = 4 + Math.random() * 3;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: PALO_YELLOW,
        size: 3,
        life: 0,
        maxLife: 1500,
      });
    }
  }

  /**
   * Emit fireworks particles (AC4 – 100% milestone)
   * Random radial burst with Palo Yellow (200 particles, 3 seconds).
   */
  emitFireworks(x: number, y: number, count: number): void {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 5;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: PALO_YELLOW,
        size: 2 + Math.random() * 2,
        life: 0,
        maxLife: 3000,
      });
    }
  }

  // ── Physics ───────────────────────────────────────────────────────────────

  /**
   * Advance particle physics by deltaTime ms.
   * Removes expired particles to prevent memory leaks (AC12).
   */
  update(deltaTime: number): void {
    this.particles = this.particles.filter(p => {
      p.life += deltaTime;
      if (p.life >= p.maxLife) return false;

      p.x += p.vx;
      p.y += p.vy;
      p.vy += this.gravity;

      if (p.rotation !== undefined && p.rotationSpeed !== undefined) {
        p.rotation += p.rotationSpeed;
      }

      return true;
    });
  }

  // ── Rendering ─────────────────────────────────────────────────────────────

  /**
   * Render all particles onto the canvas overlay (AC8).
   * Applies opacity fade based on remaining lifetime.
   */
  render(ctx: CanvasRenderingContext2D): void {
    this.particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = 1 - p.life / p.maxLife;
      ctx.fillStyle = p.color;

      if (p.rotation !== undefined) {
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      } else {
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      }

      ctx.restore();
    });
  }

  // ── Utilities ─────────────────────────────────────────────────────────────

  getParticleCount(): number {
    return this.particles.length;
  }

  /** Expose particles for test inspection only. */
  getParticles(): ReadonlyArray<Particle> {
    return this.particles;
  }

  reset(): void {
    this.particles = [];
  }
}
