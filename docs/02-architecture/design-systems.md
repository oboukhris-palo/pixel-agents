# Design Systems: Pixel Agents UI Components & Design Tokens

**Document Version**: 1.0.0  
**Created**: 2026-04-22  
**Author**: Solution Architect (David) with UX Input  
**Phase**: Phases 3-4 (Architecture & Technical Design)  
**Framework**: Tailwind CSS + CSS Modules + Phaser 3

---

## 1. Design System Overview

**Pixel Agents** uses a cohesive design language that brings the **"Sims for Software Development"** vision to life. The design system balances:
- **Real-time clarity** — Developers understand status at a glance
- **Gamification engagement** — Animations and achievements motivate
- **Developer productivity** — No wasted clicks or cognitive load
- **Accessibility** — WCAG 2.1 AA compliance for all UI

---

## 2. Color System & Design Tokens

### 2.1 Semantic Color Palette

**Primary Brand Colors**:
```css
/* Pixel Agents Core Colors */
--color-primary: #6366F1;         /* Indigo - Brand */
--color-primary-hover: #4F46E5;   /* Darker indigo */

--color-success: #10B981;         /* Green - Completion */
--color-warning: #F59E0B;         /* Amber - Caution */
--color-error: #EF4444;           /* Red - Error */
--color-info: #3B82F6;            /* Blue - Information */
```

**TDD Phase Colors**:
```css
/* RED Phase - Test Writing */
--color-tdd-red: #FF5500;         /* Bright Orange */
--color-tdd-red-hover: #E64400;
--color-tdd-red-light: #FFF3E0;   /* Background */

/* GREEN Phase - Implementation */
--color-tdd-green: #10B981;       /* Green */
--color-tdd-green-hover: #059669;
--color-tdd-green-light: #ECFDF5;

/* REFACTOR Phase - Cleanup */
--color-tdd-refactor: #8B5CF6;    /* Purple */
--color-tdd-refactor-hover: #7C3AED;
--color-tdd-refactor-light: #F3E8FF;

/* DOCUMENT Phase - Documentation */
--color-tdd-document: #06B6D4;    /* Cyan */
--color-tdd-document-hover: #0891B2;
--color-tdd-document-light: #ECFDF5;
```

**Neutral Scale**:
```css
--color-gray-50: #F9FAFB;
--color-gray-100: #F3F4F6;
--color-gray-200: #E5E7EB;
--color-gray-300: #D1D5DB;
--color-gray-400: #9CA3AF;
--color-gray-500: #6B7280;        /* Body text */
--color-gray-600: #4B5563;
--color-gray-700: #374151;
--color-gray-800: #1F2937;
--color-gray-900: #111827;        /* Headers */
```

**Context Window Warning States**:
```css
--color-context-safe: #10B981;    /* 0-70% */
--color-context-warning: #F59E0B; /* 71-89% */
--color-context-critical: #EF4444; /* 90%+ */
```

### 2.2 Typography Scale

**Font Stack** (system fonts, no external loads):
```css
--font-family-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
--font-family-mono: "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace;
```

**Type Scale**:
```css
/* Headings */
--text-h1: 32px / 1.2 / 600;      /* 32px, line-height 1.2, weight 600 */
--text-h2: 24px / 1.3 / 600;
--text-h3: 20px / 1.4 / 600;
--text-h4: 16px / 1.5 / 600;

/* Body */
--text-body-lg: 16px / 1.5 / 400;
--text-body: 14px / 1.6 / 400;    /* Default */
--text-body-sm: 12px / 1.5 / 400;

/* Mono (for code) */
--text-code: 12px / 1.4 / 400 (monospace);
--text-code-lg: 13px / 1.4 / 400 (monospace);
```

### 2.3 Spacing Scale

**8px Base Grid**:
```css
--space-0: 0px;
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;    /* Default padding */
--space-6: 24px;
--space-8: 32px;
--space-12: 48px;
--space-16: 64px;
```

### 2.4 Shadow System

**Depth Levels**:
```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);

/* Glow for active elements */
--shadow-glow: 0 0 20px rgba(99, 102, 241, 0.3); /* Indigo glow */
```

### 2.5 Border Radius

```css
--radius-none: 0px;
--radius-sm: 4px;
--radius-md: 8px;              /* Default */
--radius-lg: 12px;
--radius-full: 9999px;         /* Circular */
```

---

## 3. Component Library

### 3.1 Task Progression Bar

**Component**: `TaskProgressionBar.tsx`

**Structure**:
```
┌─────────────────────────────────────────────────────┐
│  [✅ US-044] → [🔄 US-045 - RED] → [⏭️ US-046]     │
│  Layer 1      Layer 2              Layer 2           │
│  Complete    In Progress (65%)     Planned          │
└─────────────────────────────────────────────────────┘
```

**Design Tokens**:
```css
height: 80px;
padding: var(--space-3);
background: var(--color-gray-50);
border-bottom: 1px solid var(--color-gray-200);
gap: var(--space-4);

/* Task cards */
.task-card {
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  background: white;
  border: 2px solid var(--color-gray-200);
  min-width: 120px;
  text-align: center;
}

.task-card.current {
  border-color: var(--color-tdd-red);
  background: var(--color-tdd-red-light);
  box-shadow: var(--shadow-glow);
}

.task-card.complete {
  border-color: var(--color-success);
  opacity: 0.7;
}
```

**Typography**:
- Title (story ID): `--text-h4` (16px, 600 weight)
- Layer label: `--text-body-sm` (12px, 400 weight)
- Progress: `--text-code` (12px mono, for precision)

**Interactions**:
- Hover: Lift shadow + cursor pointer
- Click: Navigate to story docs
- Accessible: Full keyboard navigation, ARIA labels

---

### 3.2 Context Window Bar

**Component**: `ContextWindowBar.tsx`

**Structure**:
```
┌─────────┐
│▓▓▓▓▓▓░░░│ 87%  ← Yellow warning
│▓ Blue  │ .github (26%)
│▓ Green │ project (45%)
│░ Yellow│ chat (29%)
└─────────┘
```

**Design Tokens**:
```css
width: 80px;
height: 100%;
padding: var(--space-3);
background: var(--color-gray-50);
border-left: 4px solid var(--color-gray-200);

/* Progress bar */
.context-bar {
  width: 100%;
  height: 200px;
  background: var(--color-gray-200);
  border-radius: var(--radius-sm);
  overflow: hidden;
  position: relative;
}

/* Segments */
.segment {
  height: proportional;
  transition: background 300ms ease;
}

.segment.github { background: var(--color-info); }
.segment.project { background: var(--color-success); }
.segment.chat { background: var(--color-warning); }

/* Warning indicator */
.bar.warning .segment { filter: brightness(0.95); }
.bar.critical .segment { filter: brightness(0.85); }
```

**Color Coding**:
| State | Color | Threshold |
|-------|-------|-----------|
| Safe | Green | 0-70% |
| Warning | Yellow | 71-89% |
| Critical | Red | 90%+ |

**Tooltip** (on hover):
```
Current: 174,000 / 200,000 tokens (87%)
.github: 45,000 (26%) — Blue
Project: 78,000 (45%) — Green
Chat: 51,000 (29%) — Yellow

Recommendation: Consider summarizing chat history
```

---

### 3.3 Completeness Meter

**Component**: `CompletenessBar.tsx`

**Structure**:
```
┌──────────────────────────────────────────┐
│█████████████░░░░░░░░░░░░░░░░ 52% DONE   │
└──────────────────────────────────────────┘
   ▲         ▲         ▲         ▲
   25%      50%       75%       100%
   ↓        ↓ YOU ARE HERE
   1️⃣        2️⃣        3️⃣        🏆
```

**Design Tokens**:
```css
height: 60px;
background: linear-gradient(to right, var(--color-gray-100), var(--color-gray-50));
padding: var(--space-4);
border-radius: var(--radius-md);
border: 1px solid var(--color-gray-200);

/* Progress bar */
.progress-track {
  height: 16px;
  background: var(--color-gray-200);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), var(--color-success));
  transition: width 500ms ease;
}

/* Milestone markers */
.milestone {
  position: absolute;
  font-size: 20px;
  transform: translateY(-50%);
}

.milestone.achieved {
  animation: celebrate 0.6s ease-out;
}
```

**Milestone Celebrations**:
- 25% Complete: 🎉 "First Quarter Done!"
- 50% Complete: 🚀 "Halfway There!"
- 75% Complete: 🔥 "On Fire!"
- 100% Complete: 🏆 "Project Victory!"

---

### 3.4 Agent Registry Card

**Component**: `AgentRegistryCard.tsx`

**Structure**:
```
┌─────────────────────┐
│ 🔴 dev-tdd-red      │
│ RED Phase Agent     │
│ Status: Active ●    │
│ Current: US-045     │
│ [View Details]      │
└─────────────────────┘
```

**Design Tokens**:
```css
.agent-card {
  padding: var(--space-4);
  background: white;
  border-left: 4px solid ${agentColor};
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  margin-bottom: var(--space-3);
  cursor: pointer;
  transition: box-shadow 200ms ease;
}

.agent-card:hover {
  box-shadow: var(--shadow-lg);
  background: var(--color-gray-50);
}

.agent-card.inactive {
  opacity: 0.5;
  background: var(--color-gray-100);
}
```

**Agent Status Indicators**:
- 🟢 Active (filled green circle)
- 🟡 Thinking (orange circle)
- ⚪ Idle (gray circle)
- 🔴 Error (red circle)

---

### 3.5 Achievement Badge

**Component**: `AchievementBadge.tsx`

**Structure**:
```
┌─────────────────────┐
│     🏆 Badge        │
│  TDD Master         │
│ Completed 10        │
│  TDD cycles         │
│  Unlocked: Apr 22   │
└─────────────────────┘
```

**Design Tokens**:
```css
.badge {
  padding: var(--space-4);
  background: linear-gradient(135deg, #FFD700, #FFA500);
  border-radius: var(--radius-lg);
  text-align: center;
  box-shadow: var(--shadow-lg);
  animation: appear 0.6s ease-out;
}

.badge .icon {
  font-size: 48px;
  margin-bottom: var(--space-2);
}

.badge .name {
  font-size: var(--text-h4);
  font-weight: 600;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.badge .description {
  font-size: var(--text-body-sm);
  color: rgba(255, 255, 255, 0.9);
  margin-top: var(--space-2);
}
```

**Achievement Categories**:
- 🏆 **Milestones**: 25%, 50%, 75%, 100% complete
- 🔴🟢 **TDD Master**: 10 complete TDD cycles
- 💯 **Test Coverage**: 80%+ code coverage
- ⚡ **Speed Runner**: Complete story in <1 hour
- 🎯 **Accuracy**: Zero failing tests in streak

---

## 4. Animation & Microinteractions

### 4.1 Progress Bar Animations

```css
/* Smooth progress fill */
@keyframes fillProgress {
  from { width: var(--previous-width); }
  to { width: var(--current-width); }
}

.progress-fill {
  animation: fillProgress 500ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* Milestone celebration */
@keyframes celebrate {
  0% { transform: scale(0.5) rotate(-10deg); opacity: 0; }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}
```

### 4.2 Canvas Sprite Animations

**Agent Movement** (Phaser 3):
```typescript
// Smooth tween for sprite movement
this.tweens.add({
  targets: sprite,
  x: nextZone.x + randomOffset,
  y: nextZone.y + randomOffset,
  duration: 1000,
  ease: 'Quad.easeInOut'
});

// Idle animations (breathing effect)
this.tweens.add({
  targets: sprite,
  y: sprite.y - 4,
  duration: 2000,
  yoyo: true,
  loop: -1,
  ease: 'Sine.easeInOut'
});
```

**Achievement Pop** (Phaser 3):
```typescript
// Scale-up animation on achievement
this.tweens.add({
  targets: achievementBadge,
  scale: 1,
  duration: 600,
  from: 0.3,
  ease: 'Back.easeOut'
});
```

---

## 5. Dark Mode Support

**CSS Custom Properties** (auto-detected from VS Code theme):
```css
/* Light theme (default) */
:root {
  --bg-primary: #FFFFFF;
  --bg-secondary: #F9FAFB;
  --text-primary: #111827;
  --text-secondary: #6B7280;
  --border: #E5E7EB;
}

/* Dark theme */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #1F2937;
    --bg-secondary: #111827;
    --text-primary: #F9FAFB;
    --text-secondary: #D1D5DB;
    --border: #374151;
  }
}
```

---

## 6. Accessibility (WCAG 2.1 AA)

### 6.1 Keyboard Navigation

- ✅ All interactive elements focusable via Tab key
- ✅ Enter/Space to activate buttons
- ✅ Arrow keys for navigation within lists
- ✅ Escape to close modals
- ✅ Focus indicators visible (minimum 3px outline)

```css
/* Focus styles */
*:focus {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
}
```

### 6.2 Color Contrast

| Element | Ratio | WCAG Level |
|---------|-------|-----------|
| Text on background | 4.5:1 | AA (normal), AAA (large) |
| UI components | 3:1 | AA (all sizes) |
| Context warnings | 5:1+ | AA+ |

**Verification**: All colors checked with WCAG contrast checker before deployment.

### 6.3 Screen Reader Support

```tsx
<TaskProgressionBar
  aria-label="Task progression: Previous completed, current in progress, next planned"
  role="region"
>
  <div aria-label="Previous task: US-044 Layer 1 Domain Model - Complete">
    {/* ... */}
  </div>
</TaskProgressionBar>
```

### 6.4 Font Sizing

- Minimum 12px for body text
- Responsive scaling: 14px → 16px on mobile
- User can zoom to 200% without horizontal scroll

---

## 7. Responsive Design

### 7.1 Breakpoints

```css
/* Mobile-first */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
```

### 7.2 VS Code Window Sizing

**Primary View** (always available):
- Minimum 320px wide (mobile)
- Maximum 1920px wide (3840p)
- Flexible height (100% of pane)

**Side Panel Behavior**:
- Collapses context bar when <600px wide
- Hides achievement badges when <500px wide
- Task bar becomes vertical when height <400px

---

## 8. Implementation Checklist (For Developers)

### 8.1 Component Requirements

- ✅ Use Tailwind for 80%+ styling
- ✅ CSS Modules for canvas-specific styles (to avoid conflicts)
- ✅ No hardcoded colors (use design tokens)
- ✅ No custom fonts (use system fonts)
- ✅ Responsive by default (mobile-first)
- ✅ Dark mode support via `prefers-color-scheme`
- ✅ ARIA labels on interactive elements
- ✅ `data-testid` attributes for E2E tests

### 8.2 Testing

- ✅ Visual regression tests (Percy.io or similar)
- ✅ Accessibility audits (axe-core)
- ✅ Keyboard navigation tests
- ✅ Touch device testing (if applicable)
- ✅ 60fps animation performance (Lighthouse)

---

## 9. Code Generation Templates

**Task Progression Bar** (generated from this spec):
```tsx
// webview-ui/src/components/TaskProgressionBar.tsx
import React from 'react';
import styles from './TaskProgressionBar.module.css';

export interface TaskProgressionBarProps {
  previousTask?: { storyId: string; status: string };
  currentTask: { storyId: string; layer: string; tddPhase: string };
  nextTask?: { storyId: string };
  onTaskClick?: (taskId: string) => void;
}

export function TaskProgressionBar({
  previousTask,
  currentTask,
  nextTask,
  onTaskClick
}: TaskProgressionBarProps) {
  return (
    <div className={styles.container} role="region" aria-label="Task progression">
      {/* Previous task card */}
      {previousTask && (
        <div className={styles.taskCard} data-testid="previous-task">
          ✅ {previousTask.storyId}
        </div>
      )}
      
      {/* Current task card */}
      <div className={`${styles.taskCard} ${styles.current}`} data-testid="current-task">
        🔄 {currentTask.storyId}
      </div>
      
      {/* Next task card */}
      {nextTask && (
        <div className={styles.taskCard} data-testid="next-task">
          ⏭️ {nextTask.storyId}
        </div>
      )}
    </div>
  );
}
```

---

## 10. Quality Gate Checklist

**Before Phase 5 (Testing), validate**:

- ✅ All color tokens accessible (4.5:1 contrast minimum)
- ✅ Typography scale tested at all sizes
- ✅ Dark mode verified in VS Code
- ✅ Responsive behavior tested at breakpoints
- ✅ Keyboard navigation complete
- ✅ Screen reader labels present
- ✅ Animations performant (60fps confirmed)
- ✅ Components implemented from templates
- ✅ Storybook updated with components
- ✅ Design tokens live document published

---

**Sign-Off Required By**: UX Designer, Dev-Lead, QA Lead

**Linked Documents**:
- Architecture Design: `architecture-design.md`
- Technical Specification: `tech-spec.md`
- Component Storybook: `storybook/index.md` (to be generated)

**Next Phase**: Phase 5 (Testing Strategy) - See `03-testing.workflows.md`
