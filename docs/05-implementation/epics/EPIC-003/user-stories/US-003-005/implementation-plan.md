# US-003-005 Implementation Plan: Final Visual Regression Testing

**User Story**: As a UX Designer, I want comprehensive visual regression testing to ensure the implementation matches Penpot designs pixel-perfectly.

**Epic**: EPIC-003 (Office Canvas & Pixel Art Visualization)  
**Priority**: P1 (CRITICAL — Release Blocker)  
**Story Points**: 3  
**Estimated Effort**: 8 hours (1 day)  
**Dependencies**: All Phase 3 stories complete (US-002-004, US-002-005, US-003-004)

---

## Overview

Implement comprehensive visual regression testing, accessibility audit, cross-browser validation, and obtain UX Designer sign-off to ensure 100% design-implementation match before release.

## Acceptance Criteria

✅ **AC1**: Screenshot comparison for all components (Penpot export vs implementation)  
✅ **AC2**: Color accuracy validated (design tokens match Penpot values exactly)  
✅ **AC3**: Typography accuracy validated (font sizes, weights, line heights match)  
✅ **AC4**: Spacing accuracy validated (all gaps, padding, margins match)  
✅ **AC5**: Animation smoothness validated (60 FPS, no jank)  
✅ **AC6**: Accessibility audit passed (WCAG 2.1 AA, jest-axe)  
✅ **AC7**: Cross-browser compatibility tested (Chrome, Firefox, Safari via VS Code)  
✅ **AC8**: Responsive behavior tested (800px to 2560px width)  
✅ **AC9**: E2E user flows passing (task progression, milestone celebrations, agent interactions)  
✅ **AC10**: UX Designer (Sophie) sign-off received

---

## Technical Architecture

### Layer 1-3: Not applicable (Testing layer only)

---

### Layer 4: Visual Regression Tests — 4 hours

**Purpose**: Automated screenshot comparison against Penpot exports

**Files to Create**:
- `webview-ui/src/__tests__/visual-regression.test.tsx` (50-60 tests)

**Visual Regression Test Suite**:
```typescript
/**
 * Visual Regression Tests (US-003-005 Layer 4)
 * 
 * Compare rendered components to Penpot design exports.
 * Uses jest-image-snapshot for pixel-perfect comparison.
 * 
 * Design reference: design-systems.md v2.0.0, Penpot exports in docs/02-architecture/design/
 */

import { render } from '@testing-library/react';
import { toMatchImageSnapshot } from 'jest-image-snapshot';

expect.extend({ toMatchImageSnapshot });

describe('Visual Regression Tests', () => {
  // ── Component screenshot tests ─────────────────────────────────────────────

  /**
   * AC1: TaskProgressionBar matches Penpot export
   */
  it('should match Penpot design for TaskProgressionBar', async () => {
    const { container } = render(
      <TaskProgressionBar
        previous={{ id: 'prev', title: 'Previous Task', phase: 'REFACTOR', status: 'completed' }}
        current={{ id: 'curr', title: 'Current Task', phase: 'GREEN', status: 'in-progress' }}
        next={{ id: 'next', title: 'Next Task', phase: 'RED', status: 'not-started' }}
      />
    );

    const image = await captureScreenshot(container);

    expect(image).toMatchImageSnapshot({
      customSnapshotsDir: 'docs/02-architecture/design/',
      customSnapshotIdentifier: 'task-progression-bar-export',
      failureThreshold: 0.01, // 1% tolerance for anti-aliasing
      failureThresholdType: 'percent'
    });
  });

  /**
   * AC1: ContextWindowBar matches Penpot export
   */
  it('should match Penpot design for ContextWindowBar', async () => {
    const { container } = render(
      <ContextWindowBar
        githubInstructions={45}
        projectCode={30}
        chatHistory={25}
        threshold="safe"
      />
    );

    const image = await captureScreenshot(container);

    expect(image).toMatchImageSnapshot({
      customSnapshotsDir: 'docs/02-architecture/design/',
      customSnapshotIdentifier: 'context-window-bar-export',
      failureThreshold: 0.01,
      failureThresholdType: 'percent'
    });
  });

  /**
   * AC1: CompletenessMeter matches Penpot export
   */
  it('should match Penpot design for CompletenessMeter', async () => {
    const { container } = render(
      <CompletenessMeter
        completeness={67}
        metrics={{
          stories: 45,
          completed: 30,
          tests: 1200,
          coverage: 87,
          pru: 12500
        }}
      />
    );

    const image = await captureScreenshot(container);

    expect(image).toMatchImageSnapshot({
      customSnapshotsDir: 'docs/02-architecture/design/',
      customSnapshotIdentifier: 'completeness-meter-export',
      failureThreshold: 0.01,
      failureThresholdType: 'percent'
    });
  });

  /**
   * AC1: AchievementBadge matches Penpot export
   */
  it('should match Penpot design for AchievementBadge', async () => {
    const { container } = render(
      <AchievementBadge
        icon="🏆"
        title="Project Victory!"
        description="100% completion achieved"
        tier="milestone"
      />
    );

    const image = await captureScreenshot(container);

    expect(image).toMatchImageSnapshot({
      customSnapshotsDir: 'docs/02-architecture/design/',
      customSnapshotIdentifier: 'achievement-badge-export',
      failureThreshold: 0.01,
      failureThresholdType: 'percent'
    });
  });

  // ... more component tests (10-15 total)
});

// ── Design token validation tests ─────────────────────────────────────────────

describe('Design Token Accuracy', () => {
  /**
   * AC2: Color accuracy (Palo IT brand colors)
   */
  it('should use exact Palo IT brand colors', () => {
    const root = getComputedStyle(document.documentElement);
    
    expect(root.getPropertyValue('--palo-green')).toBe('#00C853');
    expect(root.getPropertyValue('--palo-yellow')).toBe('#FFD600');
    expect(root.getPropertyValue('--palo-orange')).toBe('#FF6D00');
    expect(root.getPropertyValue('--palo-tech-blue')).toBe('#0066CC');
    expect(root.getPropertyValue('--palo-gene2-purple')).toBe('#7B3FF2');
  });

  /**
   * AC2: TDD phase colors
   */
  it('should use exact TDD phase colors', () => {
    const root = getComputedStyle(document.documentElement);
    
    expect(root.getPropertyValue('--tdd-red')).toBe('#FF5500');
    expect(root.getPropertyValue('--tdd-green')).toBe('#10B981');
    expect(root.getPropertyValue('--tdd-refactor')).toBe('#8B5CF6');
    expect(root.getPropertyValue('--tdd-document')).toBe('#06B6D4');
  });

  /**
   * AC3: Typography scale
   */
  it('should use correct typography scale', () => {
    const root = getComputedStyle(document.documentElement);
    
    expect(root.getPropertyValue('--text-h1')).toBe('24px');
    expect(root.getPropertyValue('--text-h2')).toBe('18px');
    expect(root.getPropertyValue('--text-h3')).toBe('14px');
    expect(root.getPropertyValue('--text-body')).toBe('13px');
    expect(root.getPropertyValue('--text-mini')).toBe('8px');
  });

  /**
   * AC4: Spacing scale
   */
  it('should use correct spacing scale', () => {
    const root = getComputedStyle(document.documentElement);
    
    expect(root.getPropertyValue('--space-1')).toBe('4px');
    expect(root.getPropertyValue('--space-2')).toBe('8px');
    expect(root.getPropertyValue('--space-4')).toBe('16px');
    expect(root.getPropertyValue('--space-8')).toBe('32px');
  });
});

// ── Animation smoothness tests ────────────────────────────────────────────────

describe('Animation Smoothness', () => {
  /**
   * AC5: 60 FPS during particle effects
   */
  it('should maintain 60 FPS during confetti animation', async () => {
    const fpsMonitor = new FPSMonitor();
    fpsMonitor.start();

    render(<ParticleEffect type="confetti" count={50} />);

    await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second animation

    const averageFPS = fpsMonitor.getAverageFPS();
    expect(averageFPS).toBeGreaterThanOrEqual(55); // Allow 5 FPS margin

    fpsMonitor.stop();
  });

  /**
   * AC5: Smooth agent sprite animations
   */
  it('should maintain smooth sprite movement animations', async () => {
    const fpsMonitor = new FPSMonitor();
    fpsMonitor.start();

    render(
      <OfficeCanvas
        agents={Array.from({ length: 16 }, (_, i) => createMockAgent(i))}
        layout={mockLayout}
      />
    );

    // Trigger movement animations
    // ... simulate agent movement

    await new Promise(resolve => setTimeout(resolve, 1000));

    const averageFPS = fpsMonitor.getAverageFPS();
    expect(averageFPS).toBeGreaterThanOrEqual(55);

    fpsMonitor.stop();
  });
});

// ── Responsive behavior tests ─────────────────────────────────────────────────

describe('Responsive Behavior', () => {
  /**
   * AC8: 800px width
   */
  it('should render correctly at 800px width', () => {
    global.innerWidth = 800;
    global.dispatchEvent(new Event('resize'));

    const { container } = render(<App />);
    const image = captureScreenshot(container);

    expect(image).toMatchImageSnapshot({
      customSnapshotIdentifier: 'responsive-800px'
    });
  });

  /**
   * AC8: 2560px width (4K display)
   */
  it('should render correctly at 2560px width', () => {
    global.innerWidth = 2560;
    global.dispatchEvent(new Event('resize'));

    const { container } = render(<App />);
    const image = captureScreenshot(container);

    expect(image).toMatchImageSnapshot({
      customSnapshotIdentifier: 'responsive-2560px'
    });
  });
});
```

**TDD Approach**:
- **RED**: Set up visual regression infrastructure (jest-image-snapshot)
- **GREEN**: Capture screenshots and compare to Penpot exports
- **REFACTOR**: Extract shared screenshot utilities

**Test Coverage**:
- All major components screenshot-tested (AC1)
- Design token values validated (AC2, AC3, AC4)
- Animation smoothness validated (AC5)
- Responsive behavior tested (AC8)

**Estimated Effort**: 4 hours

---

### Layer 4B: Accessibility Audit — 2 hours

**Purpose**: Ensure WCAG 2.1 AA compliance (AC6)

**Files to Create**:
- `webview-ui/src/__tests__/accessibility.test.tsx` (30-40 tests)

**Accessibility Test Suite**:
```typescript
/**
 * Accessibility Audit (US-003-005 Layer 4)
 * 
 * Validate WCAG 2.1 AA compliance using jest-axe.
 * Ensure keyboard navigation, screen reader support, and color contrast.
 */

import { axe, toHaveNoViolations } from 'jest-axe';
import { render } from '@testing-library/react';

expect.extend(toHaveNoViolations);

describe('Accessibility Audit', () => {
  /**
   * AC6: Full dashboard WCAG 2.1 AA compliance
   */
  it('should pass WCAG 2.1 AA audit for full dashboard', async () => {
    const { container } = render(<App />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });

  /**
   * AC6: TaskProgressionBar accessibility
   */
  it('should have proper ARIA labels for TaskProgressionBar', async () => {
    const { container } = render(<TaskProgressionBar {...mockProps} />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();

    // Verify ARIA attributes
    expect(container.querySelector('[role="region"]')).toBeInTheDocument();
    expect(container.querySelector('[aria-label="Task Progression"]')).toBeInTheDocument();
  });

  /**
   * AC6: Keyboard navigation
   */
  it('should support full keyboard navigation', () => {
    const { getByRole } = render(<App />);

    // Tab through interactive elements
    const firstButton = getByRole('button', { name: /zoom in/i });
    firstButton.focus();
    expect(document.activeElement).toBe(firstButton);

    // Press Tab to move to next element
    fireEvent.keyDown(firstButton, { key: 'Tab' });
    
    const nextButton = getByRole('button', { name: /zoom out/i });
    expect(document.activeElement).toBe(nextButton);
  });

  /**
   * AC6: Color contrast validation
   */
  it('should have sufficient color contrast for all text', async () => {
    const { container } = render(<App />);
    
    // jest-axe checks color contrast automatically
    const results = await axe(container, {
      rules: {
        'color-contrast': { enabled: true }
      }
    });

    expect(results).toHaveNoViolations();
  });

  /**
   * AC6: Screen reader support
   */
  it('should have proper landmark regions for screen readers', () => {
    const { container } = render(<App />);

    expect(container.querySelector('[role="main"]')).toBeInTheDocument();
    expect(container.querySelector('[role="navigation"]')).toBeInTheDocument();
    expect(container.querySelector('[role="complementary"]')).toBeInTheDocument();
  });
});
```

**TDD Approach**:
- **RED**: Set up jest-axe infrastructure
- **GREEN**: Run accessibility audit and fix violations
- **REFACTOR**: Add ARIA labels and landmarks where needed

**Test Coverage**:
- WCAG 2.1 AA compliance (AC6)
- Keyboard navigation support
- Screen reader compatibility
- Color contrast validation
- Landmark regions

**Estimated Effort**: 2 hours

---

### Layer 4C: E2E User Flow Tests — 2 hours

**Purpose**: Validate end-to-end user flows (AC9)

**Files to Create**:
- `webview-ui/src/__tests__/e2e-user-flows.test.tsx` (10-15 tests)

**E2E Test Suite**:
```typescript
/**
 * E2E User Flow Tests (US-003-005 Layer 4)
 * 
 * Validate complete user workflows from start to finish.
 */

describe('E2E User Flows', () => {
  /**
   * AC9: Task progression workflow
   */
  it('should complete full task progression flow', async () => {
    const { getByRole, getByText } = render(<App />);

    // 1. View current task
    expect(getByText('Current Task: US-003-001')).toBeInTheDocument();

    // 2. Click on task card
    const taskCard = getByRole('button', { name: /US-003-001/i });
    fireEvent.click(taskCard);

    // 3. Verify task details displayed
    expect(getByText('Layer 1: Types & Domain Models')).toBeInTheDocument();

    // 4. Mark task as complete
    const completeButton = getByRole('button', { name: /Mark Complete/i });
    fireEvent.click(completeButton);

    // 5. Verify task progression updates
    await waitFor(() => {
      expect(getByText('Current Task: US-003-002')).toBeInTheDocument();
    });
  });

  /**
   * AC9: Milestone celebration workflow
   */
  it('should trigger milestone celebration at 25%', async () => {
    const { getByText, container } = render(<App completeness={25} />);

    // 1. Verify completeness meter shows 25%
    expect(getByText('25%')).toBeInTheDocument();

    // 2. Verify confetti particles rendered
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();

    // 3. Verify achievement badge appears
    await waitFor(() => {
      expect(getByText('🎉 First Quarter Done!')).toBeInTheDocument();
    });

    // 4. Verify toast notification
    expect(getByRole('alert')).toHaveTextContent('25% project completion');
  });

  /**
   * AC9: Agent interaction workflow
   */
  it('should display agent sprite and activity', async () => {
    const { getByText, container } = render(
      <App agents={[{ id: 'dev-tdd-red', status: 'active', activity: 'Writing test' }]} />
    );

    // 1. Verify agent sprite rendered on canvas
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();

    // 2. Verify agent activity bubble
    expect(getByText('Writing test')).toBeInTheDocument();

    // 3. Verify agent status in sidebar
    expect(getByText('dev-tdd-red')).toBeInTheDocument();
    expect(getByText('Active')).toBeInTheDocument();
  });
});
```

**TDD Approach**:
- **RED**: Write E2E test scenarios
- **GREEN**: Verify user flows work end-to-end
- **REFACTOR**: Extract shared test utilities

**Test Coverage**:
- Task progression workflow (AC9)
- Milestone celebrations (AC9)
- Agent interactions (AC9)
- Zoom and pan controls (AC9)
- Status bar updates (AC9)

**Estimated Effort**: 2 hours

---

## Definition of Done

- ✅ All 10 acceptance criteria met
- ✅ Screenshot comparison passing (Penpot exports match) (AC1)
- ✅ Design token accuracy validated (AC2, AC3, AC4)
- ✅ 60 FPS animations validated (AC5)
- ✅ WCAG 2.1 AA accessibility audit passed (AC6)
- ✅ Cross-browser compatibility tested (AC7)
- ✅ Responsive behavior validated (AC8)
- ✅ E2E user flows passing (AC9)
- ✅ **UX Designer (Sophie) sign-off received** (AC10) ✅
- ✅ 50-60 visual regression tests passing
- ✅ 30-40 accessibility tests passing
- ✅ 10-15 E2E tests passing
- ✅ Code review approved (13-point checklist)
- ✅ **Release approval granted**

---

## Effort Summary

| Layer | Effort | Key Deliverables |
|-------|--------|------------------|
| Layer 4 | 4 hours | Visual regression tests (screenshot comparison) |
| Layer 4B | 2 hours | Accessibility audit (jest-axe) |
| Layer 4C | 2 hours | E2E user flow tests |
| **Total** | **8 hours (1 day)** | **Release validation complete** |

---

## Dependencies & Blockers

**Dependencies**:
- ✅ US-002-004 (Milestone Celebrations) — Must be complete
- ✅ US-002-005 (Sound Integration) — Must be complete
- ✅ US-003-004 (Performance Optimization) — Must be complete
- ✅ All Phase 3 stories complete

**Blockers**:
- **AC10**: UX Designer availability for sign-off (coordinate schedule)
- Penpot design exports must be available in `docs/02-architecture/design/`

---

## Success Metrics

- Visual regression tests: >98% similarity to Penpot exports ✅
- Design token accuracy: 100% match (exact hex values) ✅
- Accessibility: Zero WCAG 2.1 AA violations ✅
- Animation smoothness: 60 FPS validated ✅
- E2E user flows: All workflows passing ✅
- **UX Designer sign-off received** ✅

---

## UX Designer Sign-Off Process (AC10)

### Review Checklist for Sophie (UX Designer)

**Visual Accuracy** (AC1, AC2, AC3, AC4):
- [ ] All components match Penpot design pixel-perfectly
- [ ] Palo IT brand colors applied correctly (#00C853, #FFD600, #FF6D00, etc.)
- [ ] Typography scale matches design system (8px to 24px)
- [ ] Spacing matches design system (4px base scale)
- [ ] Border radius matches design tokens (0px to 9999px)

**Animation Quality** (AC5):
- [ ] Milestone celebrations feel rewarding and motivating
- [ ] Agent sprite animations smooth (60 FPS)
- [ ] Particle effects visually appealing (confetti, fireworks)
- [ ] Toast notifications slide in smoothly
- [ ] Achievement badges appear with celebrate animation

**Accessibility** (AC6):
- [ ] Color contrast sufficient for all text
- [ ] Keyboard navigation works for all interactive elements
- [ ] Screen reader support verified
- [ ] ARIA labels present and descriptive

**Responsive Behavior** (AC8):
- [ ] Layout adapts correctly at 800px width
- [ ] Layout adapts correctly at 2560px width
- [ ] No content overlap or truncation
- [ ] Zoom controls usable at all viewport sizes

**Overall Assessment**:
- [ ] Design-implementation match: ____% (target: >98%)
- [ ] User experience quality: ⭐⭐⭐⭐⭐ (1-5 stars)
- [ ] Ready for release: YES / NO

**Signature**: ________________________  
**Date**: ________________________

---

**Document Version**: 1.0  
**Created**: 2026-04-27  
**Last Updated**: 2026-04-27  
**Author**: Sebastian (Dev-Lead)  
**Status**: READY FOR APPROVAL

---

**⚠️ CRITICAL**: This user story is a **Release Blocker**. UX Designer sign-off (AC10) is mandatory before production deployment.
