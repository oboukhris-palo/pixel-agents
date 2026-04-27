/**
 * Animation Engine (US-003-002 Layer 2)
 *
 * Manages sprite lifecycle, applies easing functions, and updates
 * positions per frame. Designed for 60 FPS with 16 sprites.
 */

import type {
  AgentSprite,
  Animation,
  MoveParams,
  IdleParams,
  TypingParams,
  CelebrationParams,
  AgentStatus,
} from '../sprites/spriteTypes';
import {
  createMoveAnimation,
  createIdleAnimation,
  createTypingAnimation,
  createCelebrationAnimation,
} from '../sprites/spriteTypes';
import { Easing } from './easingFunctions';

export class AnimationEngine {
  private sprites: Map<string, AgentSprite> = new Map();

  // ── Sprite management ───────────────────────────────────────────────────────

  addSprite(sprite: AgentSprite): void {
    this.sprites.set(sprite.id, sprite);
  }

  removeSprite(id: string): boolean {
    return this.sprites.delete(id);
  }

  getSprite(id: string): AgentSprite | undefined {
    return this.sprites.get(id);
  }

  getSprites(): AgentSprite[] {
    return Array.from(this.sprites.values());
  }

  getSpriteCount(): number {
    return this.sprites.size;
  }

  // ── Animation triggers ──────────────────────────────────────────────────────

  startMove(id: string, endX: number, endY: number, now: number): void {
    const sprite = this.sprites.get(id);
    if (!sprite) return;
    sprite.animation = createMoveAnimation(
      sprite.position.x, sprite.position.y, endX, endY, now,
    );
    sprite.targetPosition = { x: endX, y: endY };
    sprite.status = 'active';
  }

  startIdle(id: string, now: number): void {
    const sprite = this.sprites.get(id);
    if (!sprite) return;
    sprite.animation = createIdleAnimation(sprite.position.y, now);
    sprite.status = 'idle';
  }

  startTyping(id: string, now: number): void {
    const sprite = this.sprites.get(id);
    if (!sprite) return;
    sprite.animation = createTypingAnimation(sprite.position.x, now);
    sprite.status = 'thinking';
  }

  startCelebration(id: string, now: number): void {
    const sprite = this.sprites.get(id);
    if (!sprite) return;
    sprite.animation = createCelebrationAnimation(now);
    sprite.status = 'celebrating';
  }

  stopAnimation(id: string): void {
    const sprite = this.sprites.get(id);
    if (!sprite) return;
    sprite.animation = null;
    sprite.status = 'inactive';
  }

  // ── Per-frame update ────────────────────────────────────────────────────────

  update(now: number): void {
    for (const sprite of this.sprites.values()) {
      if (!sprite.animation) continue;
      this.updateSprite(sprite, now);
    }
  }

  reset(): void {
    this.sprites.clear();
  }

  // ── Private animation updaters ──────────────────────────────────────────────

  private updateSprite(sprite: AgentSprite, now: number): void {
    const anim = sprite.animation!;
    const elapsed = now - anim.startTime;
    let t = Math.min(elapsed / anim.duration, 1);

    // For looping animations, wrap progress
    if (anim.loop && t >= 1) {
      const cycles = Math.floor(elapsed / anim.duration);
      t = (elapsed - cycles * anim.duration) / anim.duration;
    }

    // Apply easing
    const easingFn = Easing[anim.easing] ?? Easing.linear;
    const eased = easingFn(t);

    switch (anim.type) {
      case 'move':
        this.updateMove(sprite, anim, eased);
        break;
      case 'idle':
        this.updateIdle(sprite, anim, eased);
        break;
      case 'typing':
        this.updateTyping(sprite, anim, eased);
        break;
      case 'celebration':
        this.updateCelebration(sprite, anim, eased);
        break;
    }

    // Clear non-looping animation when complete
    if (!anim.loop && elapsed >= anim.duration) {
      sprite.animation = null;
      if (anim.type === 'move') {
        // Snap to target position
        const p = anim.params as MoveParams;
        sprite.position.x = p.endX;
        sprite.position.y = p.endY;
        sprite.status = 'idle';
      }
    }
  }

  private updateMove(sprite: AgentSprite, anim: Animation, eased: number): void {
    const p = anim.params as MoveParams;
    sprite.position.x = p.startX + (p.endX - p.startX) * eased;
    sprite.position.y = p.startY + (p.endY - p.startY) * eased;
  }

  private updateIdle(sprite: AgentSprite, anim: Animation, eased: number): void {
    const p = anim.params as IdleParams;
    // Bob up and down using sine wave: go to -offset at 0.5, back to 0 at 1.0
    sprite.position.y = p.baseY + Math.sin(eased * Math.PI * 2) * p.yOffset;
  }

  private updateTyping(sprite: AgentSprite, anim: Animation, eased: number): void {
    const p = anim.params as TypingParams;
    // Horizontal shake: 4 shakes per cycle
    sprite.position.x = p.baseX + Math.sin(eased * Math.PI * 8) * p.xOffset;
  }

  private updateCelebration(sprite: AgentSprite, anim: Animation, eased: number): void {
    const p = anim.params as CelebrationParams;
    // Parabolic jump: rises to peak then falls back
    const jumpProgress = 1 - (2 * eased - 1) ** 2; // parabola peaking at t=0.5
    sprite.position.y -= jumpProgress * p.peakHeight;
  }

  // ── Agent status mapping ────────────────────────────────────────────────────

  /** Maps an agent activity status to the appropriate animation. */
  applyAgentStatus(spriteId: string, status: AgentStatus, now: number, targetX?: number, targetY?: number): void {
    switch (status) {
      case 'active':
        if (targetX !== undefined && targetY !== undefined) {
          this.startMove(spriteId, targetX, targetY, now);
        }
        break;
      case 'idle':
        this.startIdle(spriteId, now);
        break;
      case 'thinking':
        this.startTyping(spriteId, now);
        break;
      case 'celebrating':
        this.startCelebration(spriteId, now);
        break;
      case 'inactive':
        this.stopAnimation(spriteId);
        break;
    }
  }
}
