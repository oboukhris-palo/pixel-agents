# Pixel Agents

A VS Code extension that turns your AI coding agents into animated pixel art characters in a virtual office.

Each GitHub Copilot agent you launch spawns a character that walks around, sits at desks, and visually reflects what the agent is doing — typing when writing code, reading when searching files, waiting when it needs your attention.

## Screenshot

![Pixel Agents Dashboard](webview-ui/public/Screenshot.png)

*Note: Screenshot coming soon. The dashboard shows animated agent characters in a 2D office layout with real-time workflow status, agent sidebar, context usage bar, and project completion meter.*

## Features

- **One agent, one character** — every GitHub Copilot agent gets its own animated character
- **Live activity tracking** — characters animate based on what the agent is actually doing (writing, reading, running commands)
- **Workflow detection** — automatically detects PDLC stages, implementation phases, and TDD cycles from structured documents in `/docs/`, displaying real-time progress in the status bar
- **Milestone celebrations** — particle effects (confetti, star bursts, fireworks) trigger automatically at 25%, 50%, 75%, and 100% project completion with visual feedback and sound cues
- **Agent Registry** — collapsible panel showing all available agents from `.github/agents/` with real-time status, descriptions, and capabilities
- **GitHub directory highlighting** — automatically highlights when agents access `.github/` configuration files
- **Agent roles and metadata** — displays agent names, descriptions, and capabilities from `.agent.md` definitions
- **Multi-agent handoff animation** — when one agent completes a task and hands off to another, watch directional arrows, animated path lines, and hear a notification chime
- **Office layout editor** — design your office with floors, walls, and furniture using a built-in editor
- **Action bubbles with captions** — click any agent to see speech bubbles with real-time activity text ("Idle", "Working...", etc.)
- **Agent selection sync** — clicking an agent in the sidebar highlights the character in the office, and vice versa
- **Workflow footer bar** — displays PDLC stage, current sprint, active story, and progress with Palo IT brand colors
- **Sound notifications** — VS Code notification API integration with milestone-specific sounds (info, warning, celebration), error/success/warning audio cues, and optional chimes for agent handoff transitions
- **Performance monitoring** — real-time FPS tracking, render time monitoring, and memory usage tracking with frame throttling (12 FPS) to prevent IDE crashes
- **Accessibility compliance** — WCAG 2.1 AA compliant with full keyboard navigation, screen reader support, and high-contrast design token system
- **Persistent layouts** — your office design is saved and shared across VS Code windows (~/.pixel-agents/layout.json)
- **Diverse characters** — 6 built-in character sprites supporting 11+ agents (orchestrator, ai-eng, architect, ba, ux, qa, pm, po, dev-lead, tdd-orchestrator, meeting-assistant)

## Requirements

- VS Code 1.109.0 or later
- GitHub Copilot (included in VS Code — no additional installation required)

## Getting Started

### Install from source

```bash
git clone <repository-url>
cd pixel-agents
npm install
cd webview-ui && npm install && cd ..
npm run build
```

Then press **F5** in VS Code to launch the Extension Development Host.

### Usage

1. Open the **Pixel Agents** panel (it appears in the bottom panel area alongside your terminal)
2. Click **+ Agent** to launch a new GitHub Copilot agent and its character
3. Start coding with Copilot — watch the character react in real time
4. Click a character to select it, then click a seat to reassign it
5. Click **Layout** to open the office editor and customize your space

## Agent Registry

A collapsible panel in the top-right corner displays:

- **Active Agents** — currently running agents with real-time status (Idle, Reading, Writing, etc.)
- **Available Agents** — all agent definitions from `.github/agents/` directory with descriptions and capabilities
- **GitHub File Highlighting** — agents accessing `.github/` configuration files are highlighted with a red border and glow effect
- **Agent Metadata** — shows agent roles, descriptions, and argument hints from `.agent.md` YAML frontmatter
- **Click to Focus** — click any agent to focus its terminal in VS Code

### Agent Definitions

Agents are defined in `.github/agents/` as `.agent.md` files with YAML frontmatter:

```yaml
---
name: "AI Engineering Agent"
description: "Expert-level AI systems optimization"
argumentHint: "Optimize prompts, select models, or evaluate AI systems"
---

# Agent behavior and instructions...
```

The Agent Registry automatically discovers all agent definitions and displays them, making it easy to see what agents are available in your project.

### GitHub File Access Tracking

When an agent reads, edits, or creates files in the `.github/` directory:
- The agent appears with a **red border** in the registry
- The **last accessed file** is shown in the activity status
- This helps visualize when agents are accessing configuration, workflows, or prompt definitions

## Workflow Footer Bar

A status bar at the bottom of the office displays the current development workflow with Palo IT brand colors:

- **Workflow Type** — Shows PDLC, Implementation, CI/CD, or None (green #00C853)
- **Stage/Phase** — Color-coded display ("Stage X/8" in blue #3B82F6, TDD phases in RED/GREEN/REFACTOR colors)
- **Active User Story** — Displays the current story being worked on (yellow #FFD600)
- **Current Sprint** — Shows active sprint number
- **Progress Tracking** — Visual progress bar with percentage completion
- **PRD Maturity** — Expandable checklist showing document completion status (PDLC workflow only)
- **Real-time Updates** — Automatically updates when documents in `/docs/` change

Workflow detection parses:
- `/docs/01-requirements/`, `/docs/02-architecture/`, `/docs/03-testing/`, `/docs/04-planning/` — PDLC stage completion
- `/docs/05-implementation/user-stories.md` — Implementation status and story progress
- `/docs/05-implementation/epics/<EPIC-REF>/user-stories/<US-REF>/implementation-plan.md` — TDD phase and active layer
- `/docs/05-implementation/current-sprint.md` — Current sprint info

The status bar hides gracefully if no docs folder is detected.

## Layout Editor

The built-in editor lets you design your office:

- **Floor** — Full HSB color control
- **Walls** — Auto-tiling walls with color customization
- **Tools** — Select, paint, erase, place, eyedropper, pick
- **Undo/Redo** — 50 levels with Ctrl+Z / Ctrl+Y
- **Export/Import** — Share layouts as JSON files via the Settings modal

The grid is expandable up to 64×64 tiles. Click the ghost border outside the current grid to grow it.

### Office Assets

The office tileset used in this project and available via the extension is **[Office Interior Tileset (16x16)](https://donarg.itch.io/officetileset)** by **Donarg**, available on itch.io for **$2 USD**.

This is the only part of the project that is not freely available. The tileset is not included in this repository due to its license. To use Pixel Agents locally with the full set of office furniture and decorations, purchase the tileset and run the asset import pipeline:

```bash
npm run import-tileset
```

Fair warning: the import pipeline is not exactly straightforward — the out-of-the-box tileset assets aren't the easiest to work with, and while I've done my best to make the process as smooth as possible, it may require some manual tweaking. If you have experience creating pixel art office assets and would like to contribute freely usable tilesets for the community, that would be hugely appreciated.

The extension will still work without the tileset — you'll get the default characters and basic layout, but the full furniture catalog requires the imported assets.

## How It Works

Pixel Agents uses VS Code's event APIs to track agent activity in real time. When an agent edits a file, runs a terminal command, or performs other development tasks, the extension detects these events and updates the character's animation accordingly. The integration is lightweight and non-intrusive — no external dependencies or configuration needed.

### Activity Detection

The extension monitors:
- **File edits** — detected via `onDidChangeTextDocument`
- **File creation/deletion** — detected via `onDidCreateFiles` / `onDidDeleteFiles`
- **Terminal execution** — detected via `onDidStartTerminalShellExecution`
- **GitHub file access** — flagged when any of the above occur in `.github/` directory

### Agent Metadata Loading

On extension activation:
1. The extension scans `.github/agents/` directory for all `.agent.md` files
2. Parses YAML frontmatter (name, description, argumentHint)
3. Sends agent definitions to the webview as `agentMetadataLoaded` message
4. Agent Registry displays all discovered agents with their metadata

### Workflow Detection

On webview ready:
1. The extension initializes WorkflowDetector with the workspace root
2. Scans `/docs/` directory for workflow state indicators
3. Detects current PDLC stage, implementation phase, user story progress
4. Sets up FileSystemWatcher to monitor `/docs/**/*.{md,yml,yaml}` files
5. Sends initial state and forwards updates to webview via `workflowUpdated` message
6. WorkflowStatusBar renders current state with real-time progress tracking

### Real-time Status Updates

Character animations are driven by activity events:
- **Idle** — no activity detected in last 8 seconds
- **Writing** (typing animation) — agent editing code files
- **Reading** (reading animation) — agent searching or fetching files
- **Waiting** (permission bubble) — agent blocked waiting for user input
- **GitHub access highlight** — red visual indicator when accessing `.github/` files

The webview runs a lightweight game loop with canvas rendering, BFS pathfinding, and a character state machine (idle → walk → type/read). Everything is pixel-perfect at integer zoom levels.

### Milestone Celebrations

The extension tracks project completion across multiple dimensions:
- **Stories completed** — tracks user story implementation progress from `/docs/05-implementation/user-stories.md`
- **Test coverage** — monitors test suite growth and coverage percentages
- **Code coverage** — tracks overall code coverage metrics
- **PRU efficiency** — measures prompt resource unit usage efficiency

When milestones are reached (25%, 50%, 75%, 100%), the extension triggers:
- **Particle effects** — physics-based confetti (25%, 50%), star bursts (75%), and fireworks (100%) using Palo IT brand colors
- **Sound notifications** — VS Code notification API plays milestone-specific sounds with different severity levels for audio variety
- **Visual feedback** — milestone markers on the completeness meter bounce with animations
- **Agent celebrations** — all agent characters perform celebration animations at 100% completion

### Performance Optimization

The extension includes comprehensive performance monitoring with intelligent frame throttling:
- **Frame throttling** — game loop runs at 12 FPS (FRAME_SKIP = 4) to prevent CPU burn and IDE crashes while maintaining smooth animations
- **FPS tracking** — real-time frames-per-second calculation with performance metrics logging
- **Render time monitoring** — tracks frame render time with threshold warnings
- **Memory usage tracking** — monitors memory consumption (threshold: <100MB)
- **Component render counting** — tracks React component re-render frequency
- **Threshold warnings** — logs performance warnings to VS Code OutputChannel when thresholds are exceeded
- **Viewport culling** — only renders objects within the visible canvas area (AABB collision detection)

## Tech Stack

- **Extension**: TypeScript, VS Code Webview API, esbuild
- **Webview**: React 19, TypeScript, Vite, Canvas 2D
- **Testing**: Jest, React Testing Library, jest-axe (accessibility), ts-jest (>80% coverage)
- **Design System**: CSS custom properties with 200+ design tokens (Palo IT branding v2.0.0, VS Code dark theme)
- **Performance**: 12 FPS game loop (throttled) with viewport culling, physics-based particle system
- **Build**: VSIX packaging via @vscode/vsce (~1.03 MB, 104 files)

## Known Limitations

- **Multi-platform testing** — the extension has been tested primarily on Windows 11 and macOS. It should work on Linux, but there could be unexpected issues with file watching, paths, or terminal behavior on those platforms.
- **Activity inference** — character animations are inferred from VS Code events (file edits, terminal executions). Some agent activities may not trigger visible animations if they don't emit detectable events.
- **Agent metadata scoping** — agent definitions in `.github/agents/` are static and loaded once on extension startup. Newly added agents require extension reload to appear in the registry.

## Testing Agent Registry & GitHub File Tracking

To test the Agent Registry and `.github` file access highlighting:

1. **Install from source** and build the extension (see Getting Started above)
2. Press **F5** to launch Extension Development Host
3. Open the **Pixel Agents** panel (View → Open View → "Pixel Agents")
4. Observe **Agent Registry** in top-right corner showing available agents
5. Click **+ Agent** to launch an active agent
6. **Open or edit any file in `.github/` directory** — the active agent should show:
   - Red border + glow effect in the registry
   - File name in the activity status
   - Visual confirmation that agent is accessing configuration files

Expected behavior:
```
┌──────────────────────────────────┐
│ AI Agents                    ▼   │
├──────────────────────────────────┤
│ Active (1)                       │
│ ┌────────────────────────────┐   │ ← Red border (accessing .github)
│ │ Agent #1 [.github]         │   │
│ │ AI Engineering Agent       │   │
│ │ ✓ Reading → copilot-...    │   │
│ └────────────────────────────┘   │
│                                  │
│ Available (5)                    │
│ ┌────────────────────────────┐   │
│ │ Business Analyst           │   │
│ │ Create specs, BDD tests    │   │
│ │ [Click to launch]          │   │
│ └────────────────────────────┘   │
└──────────────────────────────────┘
```

## Recent Improvements (v1.0.4, April 2026)

**Visual Enhancements**:
- Action bubbles now display text captions ("Idle", "Working...") with semi-transparent backgrounds
- Agent selection syncs bidirectionally between sidebar and office canvas
- Workflow footer bar redesigned with Palo IT brand colors (#00C853 green, #FFD600 yellow, #3B82F6 blue)
- All 11 agents visible in office (QA and UX agents added with proper desk mappings)
- TDD sub-agents (red/green/refactor) hidden from UI, showing only orchestrator

**Performance & Stability**:
- Frame throttling implemented (12 FPS) to prevent IDE crashes from CPU burn
- Game loop optimized with FRAME_SKIP = 4 for smooth animations without performance impact
- Backend service initialization patterns standardized across all monitors

**Bug Fixes**:
- Fixed character spawning for QA/UX agents (desk mapping fallbacks)
- Fixed agent selection highlighting in sidebar when clicking canvas characters
- Fixed footer text overflow into sidebar with proper container constraints
- Fixed bubble timer lifecycle to properly clear bubbleText on expiry

## Roadmap

Completed:
- ✅ **Agent Registry** — discover and display agents from `.github/agents/`
- ✅ **GitHub file tracking** — highlight when agents access `.github/` directory
- ✅ **Agent metadata** — show agent roles, descriptions, and capabilities
- ✅ **Workflow status bar** — real-time PDLC stage and TDD phase detection from `/docs/` with progress tracking
- ✅ **Multi-agent display** — show all agents in office layout with automatic desk assignment
- ✅ **Multi-agent handoff animation** — directional arrows, path lines, and sound effects on agent handoff
- ✅ **Milestone celebration animations** — particle effects (confetti, star bursts, fireworks) at completion milestones
- ✅ **Sound integration** — VS Code notification API for milestone sounds, error/success/warning audio cues
- ✅ **Performance monitoring** — real-time FPS, render time, memory usage tracking with threshold warnings
- ✅ **Accessibility compliance** — WCAG 2.1 AA with full keyboard navigation and screen reader support
- ✅ **Design system alignment** — 200+ CSS custom properties with Palo IT branding and VS Code dark theme integration

In progress / future:
- **Workflow dashboard** — clickable status bar that opens detailed workflow visualization with timeline and task breakdown
- **Enhanced workflow tracking** — improved TDD phase detection, epic-level progress tracking, and risk indicators
- **Agent-workflow integration** — auto-assign agents to workflow stages and highlight which agent is working on which document
- **Handoff choreography** — customize handoff animation sequences and transition styles
- **Community assets** — freely usable pixel art tilesets or characters that anyone can use without purchasing third-party assets
- **Agent creation and definition** — define agents with custom skills, system prompts, names, and skins before launching them
- **Desks as directories** — click on a desk to select a working directory, drag and drop agents or click-to-assign to move them to specific desks/projects
- **Git worktree support** — agents working in different worktrees to avoid conflict from parallel work on the same files
- **Support for other agentic frameworks** — integrate with additional AI coding assistants and agentic frameworks beyond GitHub Copilot
- **Activity history** — show recent files and activities for each agent
- **Custom office layout templates** — pre-built layouts based on team structure
