# US-002-004 Implementation Plan: Milestone Celebration Animations

**User Story**: As a developer, I want animated celebrations when I reach project milestones so that I feel motivated and rewarded for progress.

**Epic**: EPIC-002 (Context & Task Management)  
**Priority**: P2  
**Story Points**: 5  
**Estimated Effort**: 16 hours (2 days)  
**Dependencies**: US-002-003 (Achievement System) ✅ Complete

---

## Overview

Implement particle-based celebration animations that trigger when project completeness reaches 25%, 50%, 75%, and 100% milestones. Animations include confetti, fireworks, agent sprite celebrations, and toast notifications using Palo IT brand colors from design-systems.md v2.0.0.

## Acceptance Criteria

✅ **AC1**: 25% milestone: Confetti particle effect (50 particles, 2 seconds)  
✅ **AC2**: 50% milestone: Medal icon bounce + glow effect + achievement badge  
✅ **AC3**: 75% milestone: Star burst animation (radial particles) + achievement badge  
✅ **AC4**: 100% milestone: Trophy + fireworks (200 particles, 3 seconds, Palo Yellow) + achievement badge  
✅ **AC5**: Agent sprites perform celebration jump on milestone (600ms Back.easeOut)  
✅ **AC6**: Achievement badge appears with celebrate animation (scale + rotate)  
✅ **AC7**: Milestone toast notification with slide-in animation  
✅ **AC8**: Particle effects render on canvas overlay (not blocking UI)  
✅ **AC9**: Animations use design token colors from design-systems.md v2.0.0  
✅ **AC10**: Visual match to Penpot export  
✅ **AC11**: 60 FPS performance maintained during particle effects  
✅ **AC12**: Particles clean up after animation completes (no memory leaks)

---

## Technical Architecture

### Layer 1: Type Definitions (Not applicable — uses existing types)

**Dependencies**: Use existing `Position`, `Particle` types from sprite system

---

### Layer 2: Particle System Engine (Core Logic) — 6 hours

**Purpose**: Manage particle lifecycle, physics simulation, and rendering

**Files to Create**:
- `webview-ui/src/office/engine/particleSystem.ts` (200+ lines)

**Particle System Class**:
```typescript
/**
 * Particle System (US-002-004 Layer 2)
 * 
 * Manages particle emissions, physics updates, and rendering
 * for celebration effects (confetti, fireworks, star bursts).
 * 
 * Design reference: design-systems.md v2.0.0 (Palo IT brand colors)
 */

export interface Particle {
  x: number;
  y: number;
  vx: number;      // Velocity X
  vy: number;      // Velocity Y
  color: string;   // Palo IT brand color
  size: number;    // Particle radius in pixels
  life: number;    // Current lifetime (ms)
  maxLife: number; // Maximum lifetime (ms)
  rotation?: number;     // Optional rotation for confetti
  rotationSpeed?: number; // Optional rotation velocity
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private readonly gravity = 0.2; // Gravity constant

  // ── Emission methods ───────────────────────────────────────────────────────

  /**
   * Emit confetti particles (AC1, AC2)
   * Used for 25% and 50% milestones
   */
  emitConfetti(x: number, y: number, count: number): void {
    const colors = ['#00C853', '#FFD600', '#FF6D00', '#7B3FF2']; // Palo IT palette
    
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 10,
        vy: Math.random() * -8,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 4 + 2,
        life: 0,
        maxLife: 2000,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2
      });
    }
  }

  /**
   * Emit star burst particles (AC3)
   * Used for 75% milestone
   */
  emitStarBurst(x: number, y: number, count: number): void {
    const color = '#FFD600'; // Palo Yellow
    
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const speed = 4 + Math.random() * 3;
      
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: 3,
        life: 0,
        maxLife: 1500
      });
    }
  }

  /**
   * Emit fireworks particles (AC4)
   * Used for 100% milestone
   */
  emitFireworks(x: number, y: number, count: number): void {
    const color = '#FFD600'; // Palo Yellow
    
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 5;
      
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: 2 + Math.random() * 2,
        life: 0,
        maxLife: 3000
      });
    }
  }

  // ── Physics update ────────────────────────────────────────────────────────

  /**
   * Update particle positions and lifetime
   * Remove expired particles (AC12: no memory leaks)
   */
  update(deltaTime: number): void {
    this.particles = this.particles.filter(p => {
      p.life += deltaTime;
      if (p.life >= p.maxLife) return false; // Remove expired

      // Apply velocity
      p.x += p.vx;
      p.y += p.vy;
      
      // Apply gravity
      p.vy += this.gravity;
      
      // Apply rotation (if confetti)
      if (p.rotation !== undefined && p.rotationSpeed !== undefined) {
        p.rotation += p.rotationSpeed;
      }

      return true;
    });
  }

  // ── Rendering ─────────────────────────────────────────────────────────────

  /**
   * Render all particles with opacity fade (AC8: canvas overlay)
   */
  render(ctx: CanvasRenderingContext2D): void {
    this.particles.forEach(p => {
      ctx.save();
      
      // Fade opacity based on lifetime
      ctx.globalAlpha = 1 - (p.life / p.maxLife);
      ctx.fillStyle = p.color;
      
      // Draw rotated confetti or circle particle
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

  reset(): void {
    this.particles = [];
  }
}
```

**TDD Approach**:
- **RED**: Write tests for particle emission, physics update, rendering, cleanup
- **GREEN**: Implement particle system with proper lifecycle management
- **REFACTOR**: Optimize particle count for 60 FPS (AC11)

**Test Coverage**:
- Emission methods (confetti, star burst, fireworks)
- Physics update (gravity, velocity, rotation)
- Particle cleanup (no memory leaks after expiry)
- Render method (opacity fade, rotation)

**Architectural Constraints**:
- Use Canvas 2D API for rendering (overlay layer)
- Palo IT brand colors from design-systems.md v2.0.0 (#00C853, #FFD600, #FF6D00, #7B3FF2)
- 60 FPS target (max 200 particles simultaneously)

**Estimated Effort**: 6 hours

---

### Layer 3: Celebration Triggers (Integration) — 4 hours

**Purpose**: Detect milestone thresholds and trigger appropriate celebrations

**Files to Modify**:
- `webview-ui/src/components/CompletenessMeter.tsx` (add celebration triggers)

**Integration Points**:
```tsx
/**
 * Milestone Celebration Triggers (US-002-004 Layer 3)
 * 
 * Detect completeness milestones and trigger particle effects
 */

import { ParticleSystem } from '../office/engine/particleSystem';
import { AnimationEngine } from '../office/engine/animationEngine';

export function CompletenessMeter({ completeness, agents }: Props) {
  const particleSystemRef = useRef<ParticleSystem>(new ParticleSystem());
  const animationEngineRef = useRef<AnimationEngine>(/* existing */);
  const prevCompletenessRef = useRef(completeness);

  // ── Milestone detection ────────────────────────────────────────────────────

  useEffect(() => {
    const previousMilestone = Math.floor(prevCompletenessRef.current / 25);
    const currentMilestone = Math.floor(completeness / 25);

    if (currentMilestone > previousMilestone) {
      triggerMilestoneCelebration(currentMilestone * 25);
    }

    prevCompletenessRef.current = completeness;
  }, [completeness]);

  // ── Celebration orchestration ───────────────────────────────────────────────

  function triggerMilestoneCelebration(milestone: number): void {
    const canvasCenter = { x: 480, y: 320 }; // Center of office canvas

    switch (milestone) {
      case 25: // AC1: Confetti (50 particles, 2 seconds)
        particleSystemRef.current.emitConfetti(canvasCenter.x, canvasCenter.y, 50);
        showMilestoneToast('🎉 First Quarter Done!', '25% project completion');
        break;

      case 50: // AC2: Confetti + Medal + Badge
        particleSystemRef.current.emitConfetti(canvasCenter.x, canvasCenter.y, 75);
        showAchievementBadge('🥈', 'Halfway There!', '50% project completion');
        showMilestoneToast('🚀 Halfway There!', '50% project completion');
        break;

      case 75: // AC3: Star burst + Badge
        particleSystemRef.current.emitStarBurst(canvasCenter.x, canvasCenter.y, 100);
        showAchievementBadge('⭐', 'On Fire!', '75% project completion');
        showMilestoneToast('🔥 On Fire!', '75% project completion');
        break;

      case 100: // AC4: Fireworks + Trophy + All agents celebrate
        particleSystemRef.current.emitFireworks(canvasCenter.x, canvasCenter.y, 200);
        showAchievementBadge('🏆', 'Project Victory!', '100% completion achieved');
        showMilestoneToast('🏆 Project Victory!', '100% completion achieved');
        
        // AC5: Trigger agent celebration animations (600ms Back.easeOut)
        agents.forEach(agent => {
          animationEngineRef.current.startCelebration(`sprite-${agent.id}`, performance.now());
        });
        break;
    }
  }

  // AC7: Toast notification with slide-in animation
  function showMilestoneToast(title: string, message: string): void {
    vscode.postMessage({
      type: 'milestone.toast',
      milestone: Math.floor(completeness / 25) * 25,
      title,
      message
    });
  }

  // AC6: Achievement badge with celebrate animation
  function showAchievementBadge(icon: string, title: string, message: string): void {
    vscode.postMessage({
      type: 'achievement.show',
      achievement: {
        id: `milestone-${Math.floor(completeness / 25) * 25}`,
        icon,
        title,
        description: message,
        tier: 'milestone',
        timestamp: Date.now()
      }
    });
  }

  return (
    <div className="completeness-meter">
      {/* Existing meter UI */}
      
      {/* AC8: Particle canvas overlay (non-blocking) */}
      <canvas 
        ref={particleCanvasRef}
        style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 10 }}
      />
    </div>
  );
}
```

**TDD Approach**:
- **RED**: Write tests for milestone detection, celebration triggers
- **GREEN**: Implement milestone threshold detection and celebration orchestration
- **REFACTOR**: Extract celebration configuration to constants

**Test Coverage**:
- Milestone threshold detection (25%, 50%, 75%, 100%)
- Correct particle effect for each milestone
- Achievement badge displays
- Toast notifications
- Agent celebration animations (100% only)

**Estimated Effort**: 4 hours

---

### Layer 4: Component Testing & Validation — 6 hours

**Purpose**: Comprehensive testing of celebration system

**Files to Create**:
- `webview-ui/src/office/engine/particleSystem.test.ts` (60-80 tests)

**Test Suites**:

1. **Particle Emission Tests** (15 tests)
   - Confetti: 50 particles emitted for 25% milestone
   - Star burst: 100 particles emitted for 75% milestone
   - Fireworks: 200 particles emitted for 100% milestone
   - Particle colors use Palo IT palette
   - Particle sizes within expected range

2. **Physics Update Tests** (20 tests)
   - Particles move according to velocity
   - Gravity applied correctly
   - Rotation updates (confetti only)
   - Expired particles removed (AC12)
   - No memory leaks after 3000ms

3. **Rendering Tests** (15 tests)
   - Particles render with correct opacity fade
   - Canvas overlay positioning correct (AC8)
   - Rotated confetti renders correctly
   - Render performance < 16ms (60 FPS)

4. **Integration Tests** (20 tests)
   - 25% milestone triggers confetti
   - 50% milestone triggers confetti + badge
   - 75% milestone triggers star burst + badge
   - 100% milestone triggers fireworks + agents celebrate
   - Milestones only trigger once per threshold
   - Toast notifications appear with correct messages

5. **Performance Tests** (10 tests)
   - 200 particles maintain 60 FPS (AC11)
   - Particle cleanup prevents memory leaks (AC12)
   - Canvas rendering does not block UI (AC8)

**TDD Approach**:
- **RED**: Write comprehensive test suite (60-80 tests)
- **GREEN**: Verify all tests pass
- **REFACTOR**: Optimize for clarity and maintainability

**Estimated Effort**: 6 hours

---

## Definition of Done

- ✅ All 12 acceptance criteria met
- ✅ Particle system implemented with 3 emission types
- ✅ Milestone celebrations trigger on completion thresholds
- ✅ Agent sprites celebrate on 100% milestone
- ✅ Achievement badges display with animations
- ✅ Toast notifications appear
- ✅ 60 FPS performance maintained (AC11)
- ✅ No memory leaks (particles cleaned up after expiry) (AC12)
- ✅ 60-80 tests passing (particle system + integration)
- ✅ Visual match to Penpot export (AC10)
- ✅ Code review approved (13-point checklist)

---

## Effort Summary

| Layer | Effort | Key Deliverables |
|-------|--------|------------------|
| Layer 2 | 6 hours | Particle system engine |
| Layer 3 | 4 hours | Celebration triggers + integration |
| Layer 4 | 6 hours | Testing + validation |
| **Total** | **16 hours (2 days)** | **Complete celebration system** |

---

## Dependencies & Blockers

**Dependencies**:
- ✅ US-002-003 (Achievement System) — Complete
- ✅ US-003-002 (Sprite Animation Engine) — Complete (need celebration animation)
- ✅ Canvas infrastructure — Complete (US-003-001)

**No blockers** — All dependencies satisfied

---

## Success Metrics

- 60 FPS maintained with 200 particles (AC11)
- Zero memory leaks (particles properly cleaned up) (AC12)
- Milestone celebrations trigger within 100ms of threshold
- User satisfaction: Celebrations feel rewarding and motivating
- Visual match to Penpot export: >98% similarity

---

**Document Version**: 1.0  
**Created**: 2026-04-27  
**Last Updated**: 2026-04-27  
**Author**: Sebastian (Dev-Lead)  
**Status**: READY FOR APPROVAL
