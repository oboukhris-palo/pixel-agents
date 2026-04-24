# Design System: Pixel Agents × Palo IT

**Document Version**: 2.0.0
**Created**: 2026-04-22
**Last Updated**: 2026-04-27 (Complete rewrite — Palo IT branding, VS Code bottom-panel layout)
**Author**: Sophie (UX/UI Designer) with Architect & Dev-Lead input
**Phase**: Phases 3-4 (Architecture & Technical Design)
**Stack**: React 19 + Tailwind CSS + CSS Modules + Canvas 2D
**Penpot Design**: See `dashboard` page (3 boards: Design Tokens, UI Components, Dashboard Layout)

---

## 1. Design System Overview

**Pixel Agents** is a VS Code extension that transforms the **gene2 orchestration framework into a visual, gamified dashboard** for monitoring AI agent collaboration through the complete Product Development Lifecycle (PDLC).

### Design Philosophy: "The Sims for Software Development"

Specialized AI agents appear as animated pixel-art characters working together in a 2D office. Real-time metrics track context budgeting, project completeness, and PDLC workflow advancement — all within the VS Code bottom panel, next to the Terminal tab.

### Design Principles

| Principle | Rule |
|-----------|------|
| **Glanceability** | Developer understands status in < 2 seconds |
| **Dark-first** | VS Code dark theme is the only theme |
| **Density** | Maximum information in minimal vertical space (340px) |
| **Gamification** | Animations and achievements keep AI orchestration engaging |
| **Accessibility** | WCAG 2.1 AA compliance for all interactive UI |
| **Performance** | 60 FPS canvas animation, < 100ms React renders |

### Brand Integration: Palo IT

The dashboard applies the **Palo IT** brand identity adapted for dark-theme VS Code panels. Brand accent colors (Green, Yellow, Orange) appear in highlights and celebrations while the core UI respects VS Code's native dark palette.

---

## 2. Layout Structure: VS Code Bottom Panel

The dashboard renders as a **webview tab** in the VS Code bottom panel, alongside PROBLEMS, OUTPUT, DEBUG CONSOLE, and TERMINAL tabs.

### Panel Constraints

| Property | Value | Notes |
|----------|-------|-------|
| **Width** | Full editor width | Adapts from ~800px to ~2560px |
| **Height** | ~300–400px | User-resizable; design target: **340px** |
| **Position** | Bottom panel tab | Same region as Terminal |
| **Theme** | VS Code dark only | `#1E1E1E` background |

### Layout Grid

```
┌─────────────────────────────────────────────────────────────────┐
│ PROBLEMS  OUTPUT  DEBUG CONSOLE  TERMINAL  [PIXEL AGENTS] ←tab │ 30px
├─────────────────────────────────────────────────────────────────┤
│ [8 Impl] │ ✅ US-044·L1 → 🔄 US-045·L2·RED-03 → ⏭ US-046    │ 36px  Task Bar
├──────────┬──────────────────────────────────────────┬───────────┤
│          │                                          │ CTX │     │
│  AGENTS  │         PIXEL ART OFFICE CANVAS          │     │DONE │
│  sidebar │         (Canvas 2D viewport)             │ 87% │52%  │ 246px
│  180px   │         (flexible width)                 │     │     │
│          │                                          │ 60  │200px│
├──────────┴──────────────────────────────────────────┴───────────┤
│ 🔴 RED Phase │ dev-tdd-red │ EPIC-03·US-045 │ Cycle:03 │ gene2 │ 28px  Status Bar
└─────────────────────────────────────────────────────────────────┘
       180px              960px (flex)              300px
```

### Vertical Space Budget (340px total)

| Section | Height | Purpose |
|---------|--------|---------|
| **Tab Bar** | 30px | VS Code native panel tabs |
| **Task Progression Bar** | 36px | Previous → Current → Next task |
| **Content Area** | 246px | Agent Sidebar + Canvas + Metrics |
| **Status Bar** | 28px | Phase, agent, story, cycle, context, gene2 version |

### Horizontal Layout (Content Area)

| Column | Width | Content |
|--------|-------|---------|
| **Agent Sidebar** | 180px fixed | Agent list with status dots |
| **Office Canvas** | Flexible (fills remaining) | Pixel-art 2D office with agent sprites |
| **Metrics Panel** | 300px fixed | Context Window Bar (60px) + Completeness Meter (200px) + gap |

### Responsive Behavior (within VS Code)

| Panel Width | Adaptation |
|-------------|------------|
| ≥ 1200px | Full layout as designed |
| 800–1199px | Collapse right metrics into compact overlay on canvas |
| < 800px | Hide sidebar; overlay agent count + metrics on canvas |

| Panel Height | Adaptation |
|--------------|------------|
| ≥ 300px | Full layout |
| 200–299px | Hide status bar, compact task bar |
| < 200px | Canvas-only with floating indicators |

---

## 3. Color System & Design Tokens

### 3.1 Palo IT Brand Colors

```css
/* Palo IT Brand — used for accents, celebrations, and branding */
--palo-green: #00C853;           /* Primary brand green */
--palo-yellow: #FFD600;          /* Brand yellow */
--palo-orange: #FF6D00;          /* Brand orange */
--palo-black: #000000;           /* Brand black */
--palo-white: #FFFFFF;           /* Brand white */

/* Extended Palo IT palette */
--palo-tech-blue: #0066CC;       /* Technology & innovation */
--palo-gene2-purple: #7B3FF2;    /* gene2 framework identity */
```

### 3.2 VS Code Dark Theme (Primary Palette)

```css
/* Core backgrounds — all UI surfaces */
--vscode-bg: #1E1E1E;               /* Main panel background */
--vscode-sidebar-bg: #252526;       /* Left/right panel backgrounds */
--vscode-header-bg: #2D2D30;        /* Task bar, tab backgrounds */
--vscode-border: #3E3E42;           /* All borders and separators */
--vscode-hover: #2A2D2E;            /* Hover state background */

/* Interactive */
--vscode-accent: #007ACC;           /* Active tab, focus indicator */
--vscode-button: #0078D4;           /* Primary buttons */
--vscode-selection: #264F78;        /* Selected items */
--vscode-statusbar: #007ACC;        /* Status bar background */

/* Text */
--vscode-foreground: #CCCCCC;       /* Primary text */
--vscode-foreground-dim: #999999;   /* Secondary text */
--vscode-foreground-muted: #808080; /* Tertiary / disabled text */
--vscode-foreground-faint: #666666; /* Placeholder, disabled labels */
```

### 3.3 TDD Phase Colors

```css
/* RED Phase — Test Writing */
--tdd-red: #FF5500;
--tdd-red-hover: #E64A00;
--tdd-red-bg: #3E1D00;             /* Dark background tint for active RED */

/* GREEN Phase — Implementation */
--tdd-green: #10B981;
--tdd-green-hover: #059669;
--tdd-green-bg: #052E16;           /* Dark background tint for active GREEN */

/* REFACTOR Phase — Cleanup */
--tdd-refactor: #8B5CF6;
--tdd-refactor-hover: #7C3AED;
--tdd-refactor-bg: #1E0A3C;        /* Dark background tint */

/* DOCUMENT Phase — Documentation */
--tdd-document: #06B6D4;
--tdd-document-hover: #0891B2;
--tdd-document-bg: #0A2530;        /* Dark background tint */
```

### 3.4 Semantic Colors

```css
/* Feedback */
--color-success: #10B981;           /* Green */
--color-warning: #F59E0B;           /* Amber */
--color-error: #EF4444;             /* Red */
--color-info: #3B82F6;              /* Blue */
--color-primary: #0078D4;           /* VS Code blue */

/* Context Window Thresholds */
--context-safe: #10B981;             /* 0–70%: green */
--context-warning: #F59E0B;          /* 71–89%: amber */
--context-critical: #EF4444;         /* 90%+: red */

/* Context Bar Segments */
--context-github: #3B82F6;           /* .github instructions = blue */
--context-project: #10B981;          /* Project code = green */
--context-chat: #F59E0B;             /* Chat history = yellow */
```

### 3.5 Agent Colors

```css
/* Agent-specific identities (used for sprites, sidebar dots, labels) */
--agent-dev-tdd-red: #FF5500;
--agent-dev-tdd-green: #10B981;
--agent-dev-tdd-refactor: #8B5CF6;
--agent-dev-lead: #3498DB;
--agent-qa: #F39C12;
--agent-architect: #E67E22;
--agent-ba: #1ABC9C;
--agent-po: #E91E63;
--agent-ux: #9C27B0;
--agent-pm: #00BCD4;
--agent-orchestrator: #FF9800;
--agent-ai-engineering: #607D8B;

/* Agent status indicators */
--agent-status-active: #2ECC71;      /* Green pulsing dot */
--agent-status-thinking: #F39C12;    /* Orange dot */
--agent-status-idle: #6B7280;        /* Gray dot */
--agent-status-error: #E74C3C;       /* Red dot */
```

### 3.6 Gamification Colors

```css
/* Achievement & milestone theming */
--achievement-gold: #F59E0B;         /* Badge border, trophy */
--achievement-bg: #1E1E1E;          /* Badge background */
--celebration-green: #10B981;        /* Milestone toast */
--streak-fire: #FF5500;             /* Streak counter */
```

---

## 4. Typography

### Font Stack

```css
/* System fonts only — no external font loading in VS Code extension */
--font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
             "Helvetica Neue", Arial, sans-serif;
--font-mono: "SF Mono", Monaco, "Cascadia Code", "Roboto Mono",
             Consolas, "Courier New", monospace;
```

### Type Scale (optimized for bottom-panel density)

| Token | Size | Weight | Line Height | Use |
|-------|------|--------|-------------|-----|
| `--text-h1` | 24px | 700 | 1.2 | Big metric number (52%, 87%) |
| `--text-h2` | 18px | 600 | 1.3 | Section headers (AGENTS, DONE) |
| `--text-h3` | 14px | 600 | 1.4 | Component titles, active labels |
| `--text-body` | 13px | 400 | 1.5 | Default body text |
| `--text-body-sm` | 11px | 400 | 1.5 | Agent names, legend, stats |
| `--text-code` | 12px | 400 | 1.4 | Code snippets (monospace) |
| `--text-caption` | 10px | 400 | 1.4 | Timestamps, sub-labels |
| `--text-micro` | 9px | 600 | 1.3 | Section headers (AGENTS, CTX) |
| `--text-mini` | 8px | 400 | 1.3 | Canvas labels, zone names |

### Typography Rules

- **No text below 8px** — accessibility floor
- **Monospace for**: code snippets, percentages, counters, story IDs
- **Bold (600+) for**: active elements, current values, section headers
- **Dimmed (#999999) for**: inactive, previous, completed items
- **Muted (#808080) for**: placeholders, decorative labels

---

## 5. Spacing & Layout Tokens

### Spacing Scale (4px base)

```css
--space-0: 0px;
--space-1: 4px;      /* Minimum gap, icon padding */
--space-2: 8px;      /* Default inline spacing */
--space-3: 12px;     /* Card internal padding */
--space-4: 16px;     /* Section padding */
--space-5: 20px;     /* Between major components */
--space-6: 24px;     /* Panel padding */
--space-8: 32px;     /* Large section gaps */
--space-12: 48px;    /* Board-level margins */
--space-16: 64px;    /* Board-level spacing */
```

### Border Radius

```css
--radius-none: 0px;
--radius-sm: 4px;      /* Buttons, small cards, badges */
--radius-md: 6px;      /* Input fields, medium cards */
--radius-lg: 8px;      /* Panels, achievement cards */
--radius-xl: 12px;     /* Large modals, feature cards */
--radius-pill: 14px;   /* Phase pills, status pills */
--radius-full: 9999px; /* Circular elements, dots */
```

### Shadow System

```css
/* Minimal shadows — VS Code dark theme uses borders, not shadows */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.2);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.3);

/* Glow effects for active elements */
--glow-red: 0 0 12px rgba(255, 85, 0, 0.3);
--glow-green: 0 0 12px rgba(16, 185, 129, 0.3);
--glow-purple: 0 0 12px rgba(139, 92, 246, 0.3);
--glow-blue: 0 0 12px rgba(0, 120, 212, 0.3);
--glow-gold: 0 0 12px rgba(245, 158, 11, 0.3);
```

---

## 6. Component Library

### 6.1 Task Progression Bar

**File**: `webview-ui/src/components/TaskProgressionBar.tsx`
**Height**: 36px | **Width**: Full panel width | **Background**: `#2D2D30`

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ [8 Impl] │ ✅ US-044 · L1 Domain  →  🔄 US-045 · L2 Service · RED-03  →  ⏭ US-046 │ CTX 87%⚠ │ Done 52% │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Sub-elements**:

| Element | Style | Notes |
|---------|-------|-------|
| **Phase Pill** | 80×24px, `border-radius: 12px`, border: TDD phase color, bg: phase color @ 15% | Left-most, shows current PDLC phase |
| **Previous Task** | Card 240×24px, `bg: #252526`, `border: #10B981` @ 30%, text: `#999999` | Completed task, dimmed |
| **Arrow (→)** | Text `→`, color `#666666`, 10px | Separator between cards |
| **Current Task** | Card 300×24px, `bg: var(--tdd-red-bg)`, `border: var(--tdd-red)`, text: `var(--tdd-red)`, weight: 600 | Active TDD phase, glowing border |
| **Next Task** | Card 240×24px, `bg: #252526`, `border: #3E3E42` @ 30%, text: `#666666` | Upcoming, faded |
| **Compact Metrics** | Right-aligned, 10px text | Context % + Done % in task bar |

**TDD Phase Color Mapping**:

| Phase | Border | Background | Text |
|-------|--------|------------|------|
| RED | `#FF5500` | `#3E1D00` | `#FF5500` |
| GREEN | `#10B981` | `#052E16` | `#10B981` |
| REFACTOR | `#8B5CF6` | `#1E0A3C` | `#8B5CF6` |
| DOCUMENT | `#06B6D4` | `#0A2530` | `#06B6D4` |

**Interactions**:
- Hover on task card: lighten background, show tooltip with full story details
- Click on task card: navigate to story documentation
- Keyboard: Tab to focus, Enter/Space to activate

**Accessibility**:
- `role="region"`, `aria-label="Task progression"`
- Each card: `aria-label="[status] [story ID] [layer] [phase]"`
- ARIA live region for current task changes

---

### 6.2 Agent Sidebar

**Position**: Left column | **Width**: 180px | **Height**: Full content area (246px)
**Background**: `#252526` | **Right border**: 1px `#3E3E42`

```
┌────────────────────┐
│ AGENTS             │  ← 10px, #808080, weight 600
│                    │
│ ● dev-tdd-red      │  ← green dot = active, white text, left accent bar
│ ● dev-tdd-green    │  ← gray dot = idle, #808080 text
│ ● dev-tdd-refactor │
│ ● dev-lead         │
│ ● qa               │  ← orange dot = thinking, #F39C12 text
│ ● architect        │
│ ● ba               │
└────────────────────┘
```

**Agent Entry** (28px row height):

| Element | Style |
|---------|-------|
| **Active bar** | 3×16px, left edge, agent color, only on active agent |
| **Status dot** | 8×8px ellipse at x:12 |
| **Agent name** | 10px, weight 400 (600 if active) |
| **Active text** | `#FFFFFF` |
| **Thinking text** | `#F39C12` |
| **Idle text** | `#808080` |

**Status Dot Colors**:

| Status | Color | Animation |
|--------|-------|-----------|
| Active | `#2ECC71` | Subtle pulse (opacity 0.7→1.0, 2s loop) |
| Thinking | `#F39C12` | Blink (opacity 0.3→1.0, 1s loop) |
| Idle | `#6B7280` | None |
| Error | `#E74C3C` | Fast blink (0.5s loop) |

**Interactions**:
- Hover: highlight row with `#2A2D2E` background
- Click: center canvas on that agent's sprite
- Virtual scrolling for 10+ agents (ROW_HEIGHT = 28px)

---

### 6.3 Context Window Bar

**Position**: Right panel, left sub-column | **Width**: 60px | **Height**: Full content area
**Background**: Within right panel `#252526`

```
  CTX          ← 9px, #F59E0B, weight 600
┌──────┐
│      │  ← Unused (13%)
│▓▓▓▓▓▓│  ← Chat 16% (#F59E0B @ 70%)
│▓▓▓▓▓▓│
│██████│  ← Project 45% (#10B981 @ 60%)
│██████│
│██████│
│██████│
│▒▒▒▒▒▒│  ← .github 26% (#3B82F6 @ 70%)
│▒▒▒▒▒▒│
└──────┘
  87%          ← 12px, weight 700, warning color

  .github 26%  ← 8px legend items
  code 45%
  chat 16%
```

**Bar Container**: 30×180px, `bg: #1E1E1E`, `border: #3E3E42` @ 50%, `border-radius: 4px`

**Segments** (stacked bottom-to-top):
- `.github` instructions: `#3B82F6` @ 70%
- Project code: `#10B981` @ 60%
- Chat history: `#F59E0B` @ 70%

**Threshold Colors** (percentage label):

| Range | Color | Label |
|-------|-------|-------|
| 0–70% | `#10B981` (green) | Normal |
| 71–89% | `#F59E0B` (amber) | ⚠ Warning |
| 90%+ | `#EF4444` (red) | 🔴 Critical |

**Tooltip** (hover on bar):
```
Context: 174,000 / 200,000 tokens (87%)
├── .github instructions: 45,000 (26%)
├── Project code: 78,000 (45%)
└── Chat history: 28,000 (16%)

⚠ Consider summarizing chat history
```

---

### 6.4 Completeness Meter

**Position**: Right panel, right sub-column | **Width**: 200px | **Height**: Full content area
**Background**: Within right panel `#252526`

```
          DONE                ← 9px, #808080
          52%                 ← 36px, weight 700, #FFFFFF
  ████████████░░░░░░░░░░░░   ← 200×8px progress bar
  ·    ·    ·    ·    ·       ← milestone dots at 25%, 50%, 75%, 90%, 100%

  Epics        3/5            ← stats grid, 9px
  Stories      12/25
  Coverage     83%
  BDD          96%
  LOC          4,250
  Tests        154

  PRU Efficiency  ⚡ 78%
```

**Progress Bar**:
- Track: 200×8px, `bg: #3E3E42`, `border-radius: 4px`
- Fill: proportional width, `bg: #10B981`, `border-radius: 4px`
- Transition: `width 500ms ease`

**Milestone Markers**: 6px circles at 25%, 50%, 75%, 90%, 100% positions
- Achieved: fill `#10B981`, border `#1E1E1E`
- Upcoming: fill `#3E3E42`, border `#1E1E1E`

**Stats Grid**: Two-column layout (label left `#808080`, value right `#FFFFFF` weight 600)

**Milestone Celebrations** (toast notification when reached):

| Milestone | Emoji | Message | Color |
|-----------|-------|---------|-------|
| 25% | 🎉 | "First Quarter Done!" | `#3B82F6` |
| 50% | 🚀 | "Halfway There!" | `#10B981` |
| 75% | 🔥 | "On Fire!" | `#F59E0B` |
| 90% | ⚡ | "Almost There!" | `#8B5CF6` |
| 100% | 🏆 | "Project Victory!" | `#FFD600` (Palo Yellow) |

---

### 6.5 Office Canvas (Center — Pixel Art Viewport)

**Position**: Center column | **Width**: Flexible | **Height**: Full content area (246px)
**Background**: `#1A1A2E` (dark navy, distinct from VS Code gray)
**Rendering**: HTML5 Canvas 2D at 60 FPS via requestAnimationFrame

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   [bubble: ✍️ writing...]                               │
│   ┌───┐  ┌───┐         ┌─────────────────────┐        │
│   │🔴 │  │🟢 │         │   Meeting Room      │        │
│   │desk│  │desk│         │                     │        │
│   └───┘  └───┘         │   ┌───────────┐     │        │
│   ┌───┐  ┌───┐         │   │ conf table│     │        │
│   │🟣 │  │🔷 │         │   └───────────┘     │        │
│   │desk│  │desk│         └─────────────────────┘        │
│                                                         │
│   ┌───┐  ┌───┐  ┌───┐  ┌───┐                          │
│   │🟡 │  │🔶 │  │💎 │  │🩷 │  ← more agents           │
│   └───┘  └───┘  └───┘  └───┘                          │
└─────────────────────────────────────────────────────────┘
```

**Grid System**:
- Tile size: 32×32px
- Floor pattern: alternating `#1C1C30` / `#1A1A2C` (subtle checkerboard)
- Canvas is zoomable and pannable (auto-fit on load)

**Furniture & Zones**:

| Element | Size | Color | Purpose |
|---------|------|-------|---------|
| Desk | 48×32px | `#5D4037` @ 80% | Agent workstation |
| Conference table | 120×60px | `#4E342E` @ 60% | Meeting room |
| Meeting zone | ~240×180px | `#0066CC` @ 6%, border @ 15% | Collaborative area |
| Bookshelf | 16×48px | `#6D4C41` | Decoration |
| Kitchen area | 80×60px | `#37474F` @ 20% | Break zone |

**Agent Sprites**:
- Size: 16×16px (pixel art scale)
- Color: matches agent identity color
- Border: 2px white @ 30% (outline for visibility)
- Shape: Rounded rectangle (`border-radius: 2px`)

**Sprite Animations** (Canvas 2D tweens):

| Animation | Trigger | Duration | Easing |
|-----------|---------|----------|--------|
| Move to desk | Agent becomes active | 1000ms | `Quad.easeInOut` |
| Idle bob | Agent idle at desk | 2000ms, loop | `Sine.easeInOut` |
| Typing wiggle | Agent writing code | 300ms, loop | linear |
| Celebration jump | Milestone reached | 600ms | `Back.easeOut` |
| Move to meeting | Handoff event | 1500ms | `Quad.easeInOut` |

**Action Bubble** (above active agent):
- Size: ~80×18px
- Background: `#1E1E1E` @ 90%
- Border: 1px, agent color @ 50%
- Border radius: 4px
- Text: 8px, agent color @ 80%
- Content: `"✍️ writing..."` or current file name + code snippet

**Zoom Controls** (auto-fit by default):
- Auto-fit: calculate viewport-to-canvas ratio with 90% fill
- Manual zoom: scroll wheel, pinch-to-zoom
- Layout dimensions passed as `cols/rows` props

---

### 6.6 Status Bar

**Position**: Bottom | **Height**: 28px | **Width**: Full panel width
**Background**: `#007ACC` (VS Code blue)
**Text**: `#FFFFFF`, 11px, weight 400 (600 for emphasis)

```
🔴 RED Phase │ Agent: dev-tdd-red │ EPIC-03 · US-045 │ Cycle: 03 │ Layer: L2 Service │ CTX: 87% ⚠ │ Done: 52% │ gene2 v2.0.0
```

**Items** (separated by `│` in `#0066AA`):

| Item | Style | Dynamic |
|------|-------|---------|
| Phase indicator | Weight 600, phase emoji | Changes with TDD cycle |
| Agent name | Weight 400 | Active agent name |
| Epic/Story | Weight 400 | Current EPIC-XX · US-XXX |
| Cycle | Weight 400 | TDD cycle number |
| Layer | Weight 400 | L1 Domain / L2 Service / L3 API / L4 UI |
| Context % | Warning color if > 70% | Real-time token count |
| Done % | Weight 400 | Completeness percentage |
| gene2 version | Weight 600, right-aligned | Framework version |

---

### 6.7 Achievement Badge

**Size**: 160×120px | **Background**: `#1E1E1E`
**Border**: 2px `#F59E0B` @ 60% | **Border Radius**: 12px

```
┌──────────────────┐
│       🏆         │  ← 32px emoji
│   TDD Master     │  ← 14px, weight 700, #F59E0B
│ 10 TDD cycles    │  ← 10px, #808080
│  completed       │
│ Unlocked: Apr 24 │  ← 9px, #666666
└──────────────────┘
```

**Achievement Categories**:

| Badge | Trigger | Icon |
|-------|---------|------|
| TDD Master | 10 complete RED→GREEN→REFACTOR cycles | 🏆 |
| Test Coverage | 80%+ code coverage | 💯 |
| Speed Runner | Complete story in < 1 hour | ⚡ |
| Accuracy | Zero failing tests in 5-story streak | 🎯 |
| Milestone 25% | 25% project completion | 🎉 |
| Milestone 50% | 50% project completion | 🚀 |
| Milestone 75% | 75% project completion | 🔥 |
| Project Victory | 100% project completion | 🏆 |

---

### 6.8 Notification Toast

**Size**: 320×60px | **Background**: `#1E1E1E` @ 95%
**Border**: 1px, semantic color @ 80% | **Border Radius**: 8px
**Position**: Top-right overlay, auto-dismiss after 5 seconds

```
┌─────────────────────────────────────────────┐
│ 🎉 Halfway There!                           │  ← 13px, #10B981, weight 600
│ 50% project completion reached. Keep going! │  ← 10px, #808080
└─────────────────────────────────────────────┘
```

**Toast Types**:

| Type | Border Color | Icon |
|------|-------------|------|
| Success | `#10B981` | ✅ |
| Milestone | `#10B981` | 🎉 🚀 🔥 🏆 |
| Warning | `#F59E0B` | ⚠️ |
| Error | `#EF4444` | ❌ |
| Info | `#3B82F6` | ℹ️ |

---

### 6.9 Buttons & Controls

**Primary Button**: `bg: #0078D4`, text: `#FFFFFF`, `border-radius: 4px`, height: 32px
**Secondary Button**: `bg: #252526`, text: `#CCCCCC`, `border: 1px #3E3E42`
**Danger Button**: `bg: #3E1D00`, text: `#EF4444`, `border: 1px #EF4444`
**Ghost Button**: `bg: transparent`, text: `#808080`, `border: 1px #3E3E42`
**Disabled**: `bg: #2D2D30` @ 50%, text: `#666666` @ 50%, `cursor: not-allowed`

**Button States**:

| State | Change |
|-------|--------|
| Default | As specified above |
| Hover | Lighten bg by 10%, cursor pointer |
| Active | Darken bg by 5%, scale 0.98 |
| Focus | 2px outline `#007ACC`, offset 2px |
| Disabled | Reduced opacity, no pointer events |

---

### 6.10 PDLC Phase Indicators

**Style**: Pill-shaped badges, 120×28px, `border-radius: 14px`

| Phase | Label | Color | Active Style |
|-------|-------|-------|-------------|
| Phase 0 | `0 Assess` | `#F59E0B` | bg @ 20%, border 2px, text weight 600 |
| Phases 1-2 | `1-2 Req` | `#3B82F6` | same pattern |
| Phases 3-4 | `3-4 Arch` | `#8B5CF6` | same pattern |
| Phase 5 | `5 Test` | `#10B981` | same pattern |
| Phases 6-7 | `6-7 Plan` | `#06B6D4` | same pattern |
| Phase 8 | `8 Impl` | `#FF5500` | same pattern |

**Inactive Style**: `bg: #252526`, `border: 1px` @ 30%, text `#808080`

---

## 7. Animation & Microinteractions

### 7.1 CSS Transitions

```css
/* Standard transitions for all interactive elements */
--transition-fast: 150ms ease;     /* Hover effects, dot pulses */
--transition-base: 250ms ease;     /* Panel collapses, fades */
--transition-slow: 350ms ease;     /* Modal open/close */
--transition-progress: 500ms cubic-bezier(0.4, 0, 0.2, 1); /* Progress bars */
```

### 7.2 Keyframe Animations

```css
/* Agent status dot pulse (active) */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
.status-active { animation: pulse 2s ease-in-out infinite; }

/* Agent status dot blink (thinking) */
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
.status-thinking { animation: blink 1s ease-in-out infinite; }

/* Achievement badge appear */
@keyframes celebrate {
  0% { transform: scale(0.3) rotate(-10deg); opacity: 0; }
  50% { transform: scale(1.1); }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}
.badge-appear { animation: celebrate 600ms ease-out; }

/* Toast slide-in */
@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
.toast-enter { animation: slideIn 300ms ease-out; }

/* Progress fill */
@keyframes fillProgress {
  from { width: var(--previous-width); }
  to { width: var(--current-width); }
}
.progress-fill { animation: fillProgress 500ms cubic-bezier(0.4, 0, 0.2, 1); }

/* Milestone marker bounce */
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
.milestone-achieved { animation: bounce 400ms ease-out; }
```

### 7.3 Canvas 2D Sprite Animations

```typescript
// Agent movement (smooth tween)
animateMovement(sprite, targetX, targetY, 1000, 'quadEaseInOut');

// Idle breathing effect (continuous)
animateIdle(sprite, { yOffset: -4, duration: 2000, loop: true, ease: 'sineEaseInOut' });

// Typing animation (rapid wiggle)
animateTyping(sprite, { xOffset: 2, duration: 300, loop: true });

// Celebration (jump + particle burst)
animateCelebration(sprite, { jumpHeight: 20, duration: 600, ease: 'backEaseOut' });
```

**Performance Target**: 60 FPS minimum with 16 agents + 50 furniture items

---

## 8. Gamification Mechanics

### Gameplay Loop

```
1. Read task progression bar → understand what's next
2. Invoke agent via Copilot Chat (@agent-name)
3. Watch character animate in office canvas → visual feedback
4. Monitor action bubble showing live code activity
5. Celebrate as completeness bar fills → milestone unlocks
6. Unlock next task automatically → loop continues
```

### Engagement Features

| Feature | Implementation | Trigger |
|---------|---------------|---------|
| Character animations | Canvas 2D sprite tweens | Agent state changes |
| Milestone celebrations | Toast + badge unlock | 25%, 50%, 75%, 90%, 100% |
| Achievement badges | Modal overlay | Specific conditions met |
| Sound cues | VS Code notification API | Milestone, error, completion |
| Streak counter | Status bar label | Consecutive tasks completed |
| PRU scoring | Completeness meter stat | Per-session efficiency |
| Context pressure | Warning colors + icon | Token usage > 70% |

### Win Condition

🏆 **Project Victory**: Reach 100% project completion with:
- All epics delivered
- All user stories implemented
- Test coverage ≥ 80%
- BDD scenarios ≥ 95% passing
- Zero critical defects

---

## 9. Accessibility (WCAG 2.1 AA)

### 9.1 Color Contrast

All text meets WCAG AA contrast minimums on dark backgrounds:

| Combination | Ratio | Pass |
|-------------|-------|------|
| `#CCCCCC` on `#1E1E1E` | 10.5:1 | ✅ AAA |
| `#999999` on `#1E1E1E` | 5.3:1 | ✅ AA |
| `#808080` on `#1E1E1E` | 4.0:1 | ✅ AA (large text) |
| `#FF5500` on `#1E1E1E` | 4.6:1 | ✅ AA |
| `#10B981` on `#1E1E1E` | 6.8:1 | ✅ AA |
| `#FFFFFF` on `#007ACC` | 5.1:1 | ✅ AA |
| `#F59E0B` on `#1E1E1E` | 7.9:1 | ✅ AAA |

### 9.2 Keyboard Navigation

- **Tab**: Move focus between interactive regions (sidebar, canvas, metrics)
- **Arrow keys**: Navigate within agent list, task cards
- **Enter/Space**: Activate focused button or card
- **Escape**: Close toasts, dismiss modals
- **Focus indicator**: 2px `#007ACC` outline with 2px offset

### 9.3 Screen Reader Support

```tsx
<div role="region" aria-label="Task progression">
  <div aria-label="Previous task: US-044 Layer 1 Domain Model - Complete" />
  <div aria-label="Current task: US-045 Layer 2 Service - RED Phase Cycle 3" aria-current="step" />
  <div aria-label="Next task: US-046 Layer 2 Service - Planned" />
</div>

<div role="region" aria-label="Agent status panel">
  <div role="list" aria-label="Active agents">
    <div role="listitem" aria-label="dev-tdd-red - Active" />
  </div>
</div>

<div role="progressbar" aria-valuenow="87" aria-valuemin="0" aria-valuemax="100"
     aria-label="Context window usage: 87 percent, warning">
</div>

<div role="progressbar" aria-valuenow="52" aria-valuemin="0" aria-valuemax="100"
     aria-label="Project completeness: 52 percent">
</div>
```

### 9.4 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 9.5 Minimum Touch/Click Targets

- All interactive elements: minimum 32×32px click area
- Agent sidebar rows: 28px height with 180px width (exceeds minimum)
- Buttons: minimum 32px height
- Status dots: 8px visual but 28×28px click area

---

## 10. Theme: Dark Mode Only

This extension renders exclusively in VS Code's dark theme. There is no light mode variant.

**Rationale**:
- VS Code dark theme is the dominant user preference (75%+)
- Pixel art aesthetics work best on dark backgrounds
- Reduces implementation surface area
- Consistent with terminal panel appearance

**VS Code Theme API Integration**:
```css
/* The webview inherits VS Code CSS variables */
color: var(--vscode-foreground);
background-color: var(--vscode-editor-background);
font-family: var(--vscode-font-family);
font-size: var(--vscode-font-size);
```

Custom tokens override only where VS Code defaults don't provide sufficient granularity (TDD phase colors, agent colors, gamification accents).

---

## 11. Implementation Checklist

### Component Requirements

- ✅ React 19 functional components with hooks
- ✅ Tailwind CSS for utility styling (80%+)
- ✅ CSS Modules for canvas-specific styles (avoid global conflicts)
- ✅ No hardcoded colors — use design tokens / CSS variables
- ✅ No external fonts — system font stack only
- ✅ No light mode — dark-first, dark-only
- ✅ ARIA labels on all interactive elements
- ✅ `data-testid` attributes for all testable elements
- ✅ `@testing-library/react` + `jest-axe` for component tests
- ✅ Canvas 2D (not WebGL) for office rendering

### Testing Requirements

- ✅ 100% component test coverage (all props, states, interactions)
- ✅ Accessibility audit (jest-axe, WCAG 2.1 AA)
- ✅ Keyboard navigation tests
- ✅ 60 FPS canvas animation verification
- ✅ React render < 100ms for all components
- ✅ Virtual scrolling for 10+ agent lists

### Build & Performance

- ✅ Vite bundler for webview-ui
- ✅ Tree-shaking enabled
- ✅ No unused CSS in production
- ✅ Canvas renders at native resolution (devicePixelRatio aware)
- ✅ Debounced event handlers (300–500ms) for VS Code messages

---

## 12. File Structure Reference

```
webview-ui/src/
├── App.tsx                          # Main dashboard layout
├── components/
│   ├── TaskProgressionBar.tsx       # §6.1
│   ├── TaskProgressionBar.module.css
│   ├── TaskProgressionBar.test.tsx
│   ├── AgentRegistry.tsx            # §6.2 (sidebar)
│   ├── AgentLabels.tsx
│   ├── ContextWindowBar.tsx         # §6.3
│   ├── ContextWindowBar.module.css
│   ├── ContextWindowBar.test.tsx
│   ├── CompletenessMeter.tsx        # §6.4
│   ├── CompletenessMeter.module.css
│   ├── CompletenessMeter.test.tsx
│   ├── ActionBubble.tsx             # §6.5 (canvas overlay)
│   ├── ActionBubble.module.css
│   ├── WorkflowStatusBar.tsx        # §6.6
│   ├── ZoomControls.tsx             # Canvas zoom
│   ├── BottomToolbar.tsx            # Toolbar controls
│   ├── SettingsModal.tsx            # Settings overlay
│   ├── DebugView.tsx                # Debug panel
│   └── DocumentWatcherIndicator.tsx # File change indicator
├── office/
│   ├── OfficeCanvas.tsx             # §6.5 Canvas 2D viewport
│   ├── ToolOverlay.tsx
│   ├── engine/                      # Game loop, rendering
│   ├── editor/                      # Layout editor
│   ├── sprites/                     # Pixel art sprite system
│   └── layout/                      # Office layout data
├── hooks/
│   ├── useExtensionMessages.ts      # VS Code ↔ webview comms
│   ├── useContextWindow.ts          # Context state hook
│   └── useTaskProgression.ts        # Task state hook
└── styles/
    └── tokens.css                   # CSS custom properties (design tokens)
```

---

## 13. Penpot Design Reference

The complete visual design is maintained in Penpot with 3 boards:

| Board | Content |
|-------|---------|
| **🎨 Design Tokens** | All color palettes, typography scale, spacing, border radius, Palo IT logo |
| **🧩 UI Components** | Individual component specs (11 components with states) |
| **📐 Dashboard Layout** | Full assembled wireframe at 1440×340px showing the complete VS Code bottom panel |

---

**Sign-Off Required By**: UX Designer (Sophie), Dev-Lead (Sebastian), Architect (David)

**Linked Documents**:
- Architecture Design: `architecture-design.md`
- Technical Specification: `tech-spec.md`
- Palo IT Styling Guide: `design/PALO-IT-STYLING-GUIDE.md`
- Implementation User Stories: See docs/INDEX.md → "User Stories (Implementation)"

**Next Phase**: Phase 5 (Testing Strategy) — See `.github/workflows/03-testing.workflows.md`
