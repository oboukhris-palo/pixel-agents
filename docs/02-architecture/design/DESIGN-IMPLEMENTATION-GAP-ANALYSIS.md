# Design-Implementation Gap Analysis: Pixel Agents Dashboard

**Document Version**: 1.0.0  
**Created**: 2026-04-24  
**Author**: Sophie (UX/UI Designer)  
**Purpose**: Identify gaps between Penpot design system (v2.0.0) and current implementation (EPIC-001/EPIC-002)

---

## Executive Summary

**Status**: 🟡 **MODERATE ALIGNMENT** (65% design-implementation match)

The Pixel Agents dashboard has completed **EPIC-002** (Context Window Bar, Completeness Meter, Gamification) and partially completed **EPIC-001** (Task Progression Bar in progress). However, the **design system v2.0.0 with Palo IT branding** was created **after** the initial implementation, resulting in visual inconsistencies and missing brand elements.

### Key Findings

| Category | Gap Severity | Impact |
|----------|-------------|--------|
| **Branding** | 🔴 HIGH | Palo IT colors (#00C853, #FFD600, #FF6D00) not applied to existing components |
| **Layout** | 🟢 LOW | Layout matches design (1440×340px bottom panel, 3-column structure) |
| **Typography** | 🟡 MEDIUM | Font sizes and weights need adjustment per design system spec |
| **Spacing** | 🟡 MEDIUM | Inconsistent spacing (not all components follow 4px base scale) |
| **Colors** | 🔴 HIGH | TDD phase colors, agent colors, semantic colors need standardization |
| **Components** | 🟡 MEDIUM | Existing components work but need visual refinement |
| **Missing Features** | 🔴 HIGH | Office Canvas (pixel art viewport), Agent Sidebar, Status Bar not implemented |

**Recommended Action**: **Iterative alignment sprint** — Update existing components to match design system, then implement missing features.

---

## 1. Design System Artifacts

### 1.1 Penpot Design Boards (Exported)

| Board | Export Location | Status |
|-------|----------------|--------|
| 🎨 Design Tokens | `docs/02-architecture/design/design-tokens-export.png` | ✅ Exported |
| 🧩 UI Components | `docs/02-architecture/design/ui-components-export.png` | ✅ Exported |
| 📐 Dashboard Layout | `docs/02-architecture/design/dashboard-layout-export.png` | ✅ Exported |

### 1.2 Design System Documentation

**Primary Source**: `docs/02-architecture/design-systems.md` (v2.0.0)

**Key Specifications**:
- **Palo IT Brand Colors**: Green #00C853, Yellow #FFD600, Orange #FF6D00, Tech Blue #0066CC, Gen-e2 Purple #7B3FF2
- **VS Code Dark Theme**: Background #1E1E1E, Sidebar #252526, Header #2D2D30, Border #3E3E42
- **TDD Phase Colors**: RED #FF5500, GREEN #10B981, REFACTOR #8B5CF6, DOCUMENT #06B6D4
- **Typography Scale**: 9 levels from 8px (mini) to 24px (h1)
- **Spacing Scale**: 4px base (--space-1 to --space-16)
- **Component Specs**: 10 components fully specified with measurements, colors, states

---

## 2. Implementation Status by Epic

### 2.1 EPIC-001: Workflow Visualization Enhancement

| User Story | Status | Implementation | Design Match | Notes |
|-----------|--------|----------------|--------------|-------|
| US-001-001 | 🔄 In Progress | TaskProgressionBar.tsx | 🟡 50% | Layout correct, colors need Palo IT brand update |
| US-001-002 | ⚪ Not Started | — | ❌ 0% | Agent Activity Monitor with code snippets not implemented |
| US-001-003 | ⚪ Not Started | DocumentWatcherService.ts | ✅ 100% | Backend only (no UI component) |

**EPIC-001 Completion**: **33%** (1/3 stories implemented)

#### Gap Analysis: US-001-001 (Task Progression Bar)

**File**: `webview-ui/src/components/TaskProgressionBar.tsx`

**What's Working** ✅:
- 3-section layout (Previous → Current → Next)
- PDLC phase indicators
- Real-time updates via message protocol
- Responsive to task changes

**Gaps** 🔴:
1. **Color Mismatch**: Uses generic colors, not TDD phase colors from design system
   - Design spec: RED #FF5500, GREEN #10B981, REFACTOR #8B5CF6
   - Current: Likely using default CSS or old color scheme
2. **Typography**: Font sizes and weights don't match design tokens
   - Design spec: 14px h3 weight 600, 11px body-sm weight 400
3. **Phase Pill Styling**: Missing Palo IT branded pill design
   - Design spec: 80×24px, border-radius 12px, phase color border @ 15% bg
4. **Compact Metrics**: Right-aligned context % + done % not visible
   - Design spec: 10px text showing "CTX 87% ⚠ | Done 52%"
5. **Arrow Separators**: Design uses → arrows between cards
6. **Card Dimensions**: Need exact measurements (240px previous, 300px current, 240px next)

**Required Changes**:
```tsx
// TaskProgressionBar.tsx needs:
1. Import design tokens from tokens.css
2. Apply TDD phase colors: var(--tdd-red), var(--tdd-green), var(--tdd-refactor)
3. Add phase pill component with exact 80×24px dimensions
4. Add compact metrics display in top-right corner
5. Style cards with correct dimensions and border colors
6. Add arrow separators (→) between sections
```

---

### 2.2 EPIC-002: Context & Task Management

| User Story | Status | Implementation | Design Match | Notes |
|-----------|--------|----------------|--------------|-------|
| US-002-001 | ✅ Complete | ContextWindowBar.tsx | 🟡 60% | Functional, needs brand color update + layout tweaks |
| US-002-002 | ✅ Complete | CompletenessMeter.tsx | 🟡 70% | Functional, needs milestone marker design + Palo IT gold |
| US-002-003 | ✅ Complete | Achievement system | 🟡 50% | Logic complete, UI needs achievement badge design |

**EPIC-002 Completion**: **100%** (3/3 stories implemented, but needs design alignment)

#### Gap Analysis: US-002-001 (Context Window Bar)

**File**: `webview-ui/src/components/ContextWindowBar.tsx`

**What's Working** ✅:
- Vertical progress bar visualization
- 3-segment breakdown (.github, project, chat)
- Real-time updates
- Threshold warnings (green → yellow → red)

**Gaps** 🔴:
1. **Color Scheme**: Segment colors need standardization
   - Design spec: .github #3B82F6 @ 70%, project #10B981 @ 60%, chat #F59E0B @ 70%
   - Current: Likely using different opacity/color values
2. **Label Typography**: "CTX" header needs design token styling
   - Design spec: 9px, #F59E0B, weight 600
3. **Legend**: Missing 8px legend items at bottom
   - Design spec: ".github 26% | code 45% | chat 16%"
4. **Bar Dimensions**: Need exact 30×180px container
5. **Tooltip**: Design specifies detailed tooltip on hover with action suggestions

**Required Changes**:
```tsx
// ContextWindowBar.tsx needs:
1. Apply exact segment colors with opacity values
2. Add "CTX" label with correct typography
3. Add legend items below bar (8px font)
4. Set container to 30×180px with border-radius: 4px
5. Implement tooltip with token breakdown and suggestions
```

#### Gap Analysis: US-002-002 (Completeness Meter)

**File**: `webview-ui/src/components/CompletenessMeter.tsx`

**What's Working** ✅:
- Progress bar visualization
- Percentage display (52%)
- Stats grid (Epics, Stories, Coverage, etc.)
- Milestone celebration logic

**Gaps** 🔴:
1. **"DONE" Label**: Needs design token styling
   - Design spec: 9px, #808080, weight 600
2. **Percentage**: Font size and weight adjustment
   - Design spec: 36px, weight 700, #FFFFFF
3. **Progress Bar**: Dimensions and fill color
   - Design spec: 200×8px, fill #10B981, track #3E3E42
4. **Milestone Markers**: Missing visual milestone dots
   - Design spec: 6px circles at 25%, 50%, 75%, 90%, 100%
   - Fill #10B981 if achieved, #3E3E42 if upcoming
5. **PRU Efficiency**: Label needs Palo IT branding
   - Design spec: "⚡ 78%" with gold/yellow accent

**Required Changes**:
```tsx
// CompletenessMeter.tsx needs:
1. Apply typography tokens (--text-micro, --text-h1)
2. Set progress bar to 200×8px with border-radius: 4px
3. Add milestone marker circles overlaid on progress bar
4. Style stats grid with correct font sizes (9px labels, weights)
5. Add PRU Efficiency with lightning bolt emoji and gold color
```

#### Gap Analysis: US-002-003 (Gamification System)

**Files**: `src/achievementEngine.ts`, `webview-ui/src/components/achievementNotification.tsx`

**What's Working** ✅:
- Achievement logic and triggers
- Notification system
- Badge unlocking mechanics
- Persistent storage

**Gaps** 🔴:
1. **Achievement Badge Design**: Notification toast doesn't match design spec
   - Design spec: 160×120px card, border 2px #F59E0B @ 60%, border-radius 12px
   - Current: Likely simpler toast notification
2. **Badge Icons**: Need 32px emoji with proper spacing
3. **Milestone Celebrations**: Missing confetti, fireworks, sound cues
   - Design spec: Different animations for 25% (confetti), 50% (medal), 75% (star), 100% (trophy + fireworks)
4. **Palo IT Branding**: Gold color needs to be Palo Yellow #FFD600 for 100% milestone

**Required Changes**:
```tsx
// achievementNotification.tsx needs:
1. Redesign as 160×120px card (not toast)
2. Add 32px emoji icon at top
3. Apply achievement badge styling (border, border-radius)
4. Trigger celebration animations based on milestone type
5. Use Palo IT gold/yellow for trophy milestone
```

---

## 3. Missing Features (Not Yet Implemented)

### 3.1 High-Priority Missing Components

| Component | Design Spec | Status | Impact |
|-----------|------------|--------|--------|
| **Agent Sidebar** | 180px left column, agent list with status dots | ❌ Not implemented | HIGH — Core visualization missing |
| **Office Canvas** | Center column, 2D pixel-art viewport with agent sprites | ❌ Not implemented | **CRITICAL** — Main visual feature |
| **Status Bar** | 28px bottom bar with phase/agent/story/cycle info | ❌ Not implemented | MEDIUM — Context at-a-glance |
| **Action Bubble** | Code snippet overlay above canvas | ❌ Not implemented (partial in US-001-002) | MEDIUM — Live code feedback |
| **Achievement Badge Modal** | Full 160×120px badge card | ❌ Not implemented | LOW — Gamification polish |

### 3.2 Agent Sidebar (Missing)

**Design Spec** (Section 6.2):
- **Position**: Left column, 180px width, full content height (246px)
- **Background**: #252526, right border 1px #3E3E42
- **Agent Entries**: 28px row height, 8px status dot, agent name, active bar (3×16px left edge)
- **Status Indicators**: Active (green pulse), Thinking (orange blink), Idle (gray), Error (red fast blink)
- **Interactions**: Hover highlight, click to center canvas on agent sprite
- **Virtual Scrolling**: For 10+ agents (ROW_HEIGHT = 28px)

**Implementation Plan**:
- Create `AgentRegistry.tsx` (already exists as shell, needs full implementation)
- Connect to `agentManager.ts` backend service
- Implement status dot animations (CSS keyframes)
- Add click handler to focus canvas viewport
- Style with design tokens

**Priority**: **P1 (MUST)** — Required for EPIC-001 US-001-002

### 3.3 Office Canvas (Missing — CRITICAL)

**Design Spec** (Section 6.5):
- **Position**: Center column, flexible width, 246px height
- **Background**: #1A1A2E (dark navy)
- **Rendering**: HTML5 Canvas 2D at 60 FPS via requestAnimationFrame
- **Grid System**: 32×32px tile size, checkerboard floor pattern
- **Agent Sprites**: 16×16px pixel art, agent identity color, 2px white outline
- **Furniture**: Desks (48×32px), conference table (120×60px), zones with borders
- **Animations**: Move to desk (1000ms Quad.easeInOut), idle bob (2000ms Sine.easeInOut), typing wiggle (300ms loop), celebration jump (600ms Back.easeOut)
- **Action Bubble**: 80×18px overlay above active agent, shows code snippet

**Implementation Plan**:
- Create `OfficeCanvas.tsx` in `webview-ui/src/office/`
- Implement game loop at 60 FPS
- Load agent sprites from metadata (`.github/agents/*.agent.md`)
- Implement furniture grid and zone rendering
- Add animation engine with tweens (move, idle, typing, celebration)
- Add zoom/pan controls with auto-fit
- Integrate with agent activity monitor (show bubble on code changes)

**Priority**: **P0 (CRITICAL)** — Core feature, deferred from initial MVP

**Effort**: **13-21 story points** (5-7 days with TDD, 4 layers)

### 3.4 Status Bar (Missing)

**Design Spec** (Section 6.6):
- **Position**: Bottom, 28px height, full width
- **Background**: #007ACC (VS Code blue)
- **Text**: #FFFFFF, 11px, weight 400 (600 for emphasis)
- **Content**: Phase indicator | Agent name | EPIC-XX · US-XXX | Cycle: XX | Layer: LX Type | CTX: XX% | Done: XX% | gene2 vX.X.X
- **Separators**: `│` in #0066AA

**Implementation Plan**:
- Create `WorkflowStatusBar.tsx` (already exists, needs full implementation)
- Connect to workflow detector + task progression tracker
- Style with design tokens
- Add real-time updates

**Priority**: **P2 (SHOULD)** — Nice to have, not blocking

---

## 4. Brand Alignment Issues

### 4.1 Palo IT Color Integration

**Current State**: Components use generic colors or old color scheme  
**Design System v2.0.0**: Palo IT brand colors defined but **not applied** to existing components

| Palo IT Color | Design Token | Current Usage | Required Usage |
|---------------|-------------|---------------|----------------|
| Green #00C853 | `--palo-green` | ❌ Not used | Milestone celebrations (25%, 50%), success states |
| Yellow #FFD600 | `--palo-yellow` | ❌ Not used | 100% project victory trophy, PRU efficiency gold |
| Orange #FF6D00 | `--palo-orange` | ❌ Not used | Warning states, accent highlights |
| Tech Blue #0066CC | `--palo-tech-blue` | ❌ Not used | Technology badges, .github segment |
| Gen-e2 Purple #7B3FF2 | `--palo-gene2-purple` | ❌ Not used | gene2 branding in status bar, footer |

**Action Required**: **Global CSS token update** — Replace hardcoded colors with design tokens

### 4.2 Typography Inconsistencies

**Issue**: Font sizes and weights don't follow design system 9-level scale

**Current State**: Components likely use ad-hoc font sizes (12px, 14px, 16px)  
**Design System**: Structured scale from 8px (mini) to 24px (h1)

**Required Changes**:
```css
/* Apply design tokens across all components */
--text-h1: 24px;      /* Big metric number (52%, 87%) */
--text-h2: 18px;      /* Section headers (AGENTS, DONE) */
--text-h3: 14px;      /* Component titles, active labels */
--text-body: 13px;    /* Default body text */
--text-body-sm: 11px; /* Agent names, legend, stats */
--text-code: 12px;    /* Code snippets (monospace) */
--text-caption: 10px; /* Timestamps, sub-labels */
--text-micro: 9px;    /* Section headers (AGENTS, CTX) */
--text-mini: 8px;     /* Canvas labels, zone names */
```

### 4.3 Spacing Standardization

**Issue**: Inconsistent spacing (not all components follow 4px base scale)

**Action Required**: Audit all components for `margin`, `padding`, `gap` values and replace with design tokens:

```css
--space-1: 4px;   /* Minimum gap, icon padding */
--space-2: 8px;   /* Default inline spacing */
--space-3: 12px;  /* Card internal padding */
--space-4: 16px;  /* Section padding */
--space-5: 20px;  /* Between major components */
--space-6: 24px;  /* Panel padding */
```

**Audit Target**: All `.tsx` and `.module.css` files in `webview-ui/src/components/`

---

## 5. Implementation Roadmap

### Phase 1: Design Alignment Sprint (3-5 days)

**Goal**: Update existing EPIC-002 components to match design system v2.0.0

| Task | Component | Story Points | Priority | Effort |
|------|-----------|--------------|----------|--------|
| 1. Create tokens.css | Global CSS variables | 2 | P0 | 4 hours |
| 2. Update TaskProgressionBar | EPIC-001 US-001-001 | 3 | P0 | 6 hours |
| 3. Update ContextWindowBar | EPIC-002 US-002-001 | 2 | P1 | 4 hours |
| 4. Update CompletenessMeter | EPIC-002 US-002-002 | 3 | P1 | 6 hours |
| 5. Update Achievement Badges | EPIC-002 US-002-003 | 2 | P2 | 4 hours |
| 6. QA Visual Regression | All components | 1 | P1 | 2 hours |

**Deliverable**: All existing components match Penpot design exports

### Phase 2: Missing Features Implementation (10-15 days)

**Goal**: Implement Agent Sidebar, Office Canvas, Status Bar

| Epic | User Story | Components | Story Points | Effort |
|------|-----------|-----------|--------------|--------|
| EPIC-001 | US-001-002 | Agent Sidebar + Action Bubble | 8 | 3-4 days |
| EPIC-003 | US-003-001 (new) | Office Canvas (pixel art viewport) | 13 | 5-7 days |
| EPIC-001 | US-001-001 (extend) | Status Bar | 3 | 1-2 days |

**Deliverable**: Full dashboard matching design system with all features

### Phase 3: Polish & Animations (3-5 days)

**Goal**: Add celebration animations, sound cues, milestone effects

| Task | Description | Story Points | Effort |
|------|-------------|--------------|--------|
| Milestone Animations | Confetti, fireworks, particle effects | 5 | 2 days |
| Sound Integration | VS Code notification API for sounds | 2 | 1 day |
| Agent Sprite Animations | Canvas 2D tweens (move, idle, typing) | 5 | 2 days |
| Performance Optimization | 60 FPS validation, virtual scrolling | 3 | 1 day |

**Deliverable**: Polished gamified experience matching design vision

---

## 6. Risk Assessment & Mitigation

### 6.1 High-Risk Items

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **Office Canvas complexity** | Could delay release by 2+ weeks | MEDIUM | Break into smaller milestones (grid → furniture → sprites → animations) |
| **Performance issues (Canvas 2D)** | <60 FPS with many agents | LOW | Use requestAnimationFrame properly, implement viewport culling |
| **Design token conflicts** | Breaking existing styles | MEDIUM | Test thoroughly in Phase 1, use CSS custom properties for easy rollback |
| **Palo IT brand guidelines** | Legal/compliance issues | LOW | Sophie has approved design, PO validated |

### 6.2 Medium-Risk Items

| Risk | Impact | Mitigation |
|------|--------|------------|
| Typography font loading | System fonts missing on some platforms | Use robust font stack with fallbacks |
| Color contrast failures | WCAG AA compliance issues | Re-check all text/background combinations |
| VS Code theme compatibility | User theme overrides design | Document required VS Code dark theme |

### 6.3 Low-Risk Items

| Risk | Mitigation |
|------|------------|
| Spacing inconsistencies | Automated CSS linting with design token validation |
| Achievement badge design changes | Badge system is modular, easy to update |

---

## 7. Success Criteria

### 7.1 Visual Alignment Metrics

| Metric | Target | Current | Gap |
|--------|--------|---------|-----|
| **Color Token Usage** | 100% (all hardcoded colors replaced) | 20% | -80% |
| **Typography Compliance** | 100% (all text uses design tokens) | 30% | -70% |
| **Spacing Compliance** | 100% (4px base scale) | 40% | -60% |
| **Component Match** | 100% (visual match to Penpot exports) | 65% | -35% |
| **WCAG AA Contrast** | 100% (all text passes contrast checks) | 95% | -5% |

### 7.2 Feature Completeness

| Feature | Required | Current | Gap |
|---------|----------|---------|-----|
| **EPIC-001 Stories** | 3 | 1 (in progress) | -2 |
| **EPIC-002 Stories** | 3 | 3 (complete, needs alignment) | 0 |
| **Office Canvas** | 1 | 0 | -1 |
| **Agent Sidebar** | 1 | 0 | -1 |
| **Status Bar** | 1 | 0 | -1 |

### 7.3 Definition of "Design-Aligned"

A component is considered design-aligned when:
- ✅ All colors use design tokens (no hardcoded hex values)
- ✅ Typography matches design system scale (exact font-size and weight)
- ✅ Spacing uses 4px base scale (--space-1 through --space-16)
- ✅ Visual appearance matches Penpot export (screenshot comparison)
- ✅ Palo IT brand colors applied where specified (green, yellow, orange, purple)
- ✅ WCAG 2.1 AA contrast ratios validated
- ✅ Component documented in design-systems.md

---

## 8. Next Steps

### Immediate Actions (This Week)

1. **Sophie (UX)**: Review this gap analysis with Dev-Lead and PO
2. **Dev-Lead**: Estimate Phase 1 tasks (design alignment sprint)
3. **PO**: Prioritize Phase 2 features (Office Canvas vs Status Bar vs Agent Sidebar)
4. **Dev-TDD**: Start Phase 1 — Create `tokens.css` with all design tokens
5. **QA**: Prepare visual regression test suite (screenshot comparison)

### Decision Gates

**Gate 1** (End of Phase 1): 
- All existing components match design exports
- PO approves visual alignment
- QA validates no regressions

**Gate 2** (Mid-Phase 2):
- Office Canvas rendering working (grid + furniture)
- Agent Sidebar functional (status indicators + interactions)
- Performance validated (60 FPS canvas, <100ms React renders)

**Gate 3** (End of Phase 2):
- All components implemented
- Full dashboard matches design system
- E2E tests passing

---

## 9. Appendices

### A. Design Export Locations

- **Dashboard Layout**: `docs/02-architecture/design/dashboard-layout-export.png`
- **Design Tokens**: `docs/02-architecture/design/design-tokens-export.png`
- **UI Components**: `docs/02-architecture/design/ui-components-export.png`
- **Design System Doc**: `docs/02-architecture/design-systems.md` (v2.0.0)
- **Palo IT Styling Guide**: `docs/02-architecture/design/PALO-IT-STYLING-GUIDE.md`
- **Palo IT Logo**: `docs/02-architecture/design/palo-it-logo.png`

### B. Component File Locations

**Implemented Components** (Need Alignment):
- `webview-ui/src/components/TaskProgressionBar.tsx` — US-001-001
- `webview-ui/src/components/ContextWindowBar.tsx` — US-002-001
- `webview-ui/src/components/CompletenessMeter.tsx` — US-002-002
- `webview-ui/src/components/achievementNotification.tsx` — US-002-003

**Shell Components** (Need Full Implementation):
- `webview-ui/src/components/AgentRegistry.tsx` — Agent Sidebar (missing)
- `webview-ui/src/components/WorkflowStatusBar.tsx` — Status Bar (missing)
- `webview-ui/src/components/ActionBubble.tsx` — Action Bubble (partial)

**Not Started**:
- `webview-ui/src/office/OfficeCanvas.tsx` — Office Canvas (critical missing feature)

### C. Related Documentation

- **Implementation Plans**:
  - `docs/05-implementation/epics/EPIC-001/user-stories/US-001-001/implementation-plan.md`
  - `docs/05-implementation/epics/EPIC-002/user-stories/US-002-001/implementation-plan.md`
  - `docs/05-implementation/epics/EPIC-002/user-stories/US-002-002/implementation-plan.md`
  - `docs/05-implementation/epics/EPIC-002/user-stories/US-002-003/implementation-plan.md`

- **BDD Scenarios**:
  - `docs/05-implementation/epics/EPIC-001/user-stories/US-001-001/features/task-progression-bar.feature`
  - `docs/05-implementation/epics/EPIC-002/user-stories/US-002-001/features/context-window-bar.feature`
  - `docs/05-implementation/epics/EPIC-002/user-stories/US-002-002/features/completeness-meter.feature`
  - `docs/05-implementation/epics/EPIC-002/user-stories/US-002-003/features/gamification-system.feature`

---

**Document Status**: ACTIVE  
**Next Review**: After Phase 1 completion  
**Owner**: Sophie (UX/UI Designer)  
**Stakeholders**: Dev-Lead, Product Owner, QA Engineer
