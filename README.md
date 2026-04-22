# Pixel Agents

A VS Code extension that turns your AI coding agents into animated pixel art characters in a virtual office.

Each GitHub Copilot agent you launch spawns a character that walks around, sits at desks, and visually reflects what the agent is doing — typing when writing code, reading when searching files, waiting when it needs your attention.

This is the source code for the free [Pixel Agents extension for VS Code](https://marketplace.visualstudio.com/items?itemName=pablodelucca.pixel-agents) — you can install it directly from the marketplace with the full furniture catalog included.


![Pixel Agents screenshot](webview-ui/public/Screenshot.jpg)

## Features

- **One agent, one character** — every GitHub Copilot agent gets its own animated character
- **Live activity tracking** — characters animate based on what the agent is actually doing (writing, reading, running commands)
- **Workflow detection** — automatically detects PDLC stages, implementation phases, and TDD cycles from structured documents in `/docs/`, displaying real-time progress in the status bar
- **Agent Registry** — collapsible panel showing all available agents from `.github/agents/` with real-time status, descriptions, and capabilities
- **GitHub directory highlighting** — automatically highlights when agents access `.github/` configuration files
- **Agent roles and metadata** — displays agent names, descriptions, and capabilities from `.agent.md` definitions
- **Multi-agent handoff animation** — when one agent completes a task and hands off to another, watch directional arrows, animated path lines, and hear a notification chime
- **Office layout editor** — design your office with floors, walls, and furniture using a built-in editor
- **Speech bubbles** — visual indicators when an agent is waiting for input or needs permission
- **Sound notifications** — optional chime when an agent finishes its turn or during handoff transitions
- **Persistent layouts** — your office design is saved and shared across VS Code windows
- **Diverse characters** — 6 diverse characters. These are based on the amazing work of [JIK-A-4, Metro City](https://jik-a-4.itch.io/metrocity-free-topdown-character-pack).

<p align="center">
  <img src="webview-ui/public/characters.png" alt="Pixel Agents characters" width="320" height="72" style="image-rendering: pixelated;">
</p>

## Requirements

- VS Code 1.109.0 or later
- GitHub Copilot (included in VS Code — no additional installation required)

## Getting Started

If you just want to use Pixel Agents, the easiest way is to download the [VS Code extension](https://marketplace.visualstudio.com/items?itemName=pablodelucca.pixel-agents). If you want to play with the code, develop, or contribute, then:

### Install from source

```bash
git clone https://github.com/pablodelucca/pixel-agents.git
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

## Workflow Status Bar

A status bar at the top of the office displays the current development workflow:

- **Workflow Type** — Shows PDLC, Implementation, CI/CD, or None
- **Stage/Phase** — Color-coded badges (PDLC stages 1-8, TDD phases: RED/GREEN/REFACTOR)
- **Active User Story** — Displays the current story being worked on (e.g., "US-001")
- **Progress Tracking** — Visual progress bar with percentage completion
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

## Tech Stack

- **Extension**: TypeScript, VS Code Webview API, esbuild
- **Webview**: React 19, TypeScript, Vite, Canvas 2D

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

## Roadmap

Completed:
- ✅ **Agent Registry** — discover and display agents from `.github/agents/`
- ✅ **GitHub file tracking** — highlight when agents access `.github/` directory
- ✅ **Agent metadata** — show agent roles, descriptions, and capabilities
- ✅ **Workflow status bar** — real-time PDLC stage and TDD phase detection from `/docs/` with progress tracking
- ✅ **Multi-agent display** — show all agents in office layout with automatic desk assignment
- ✅ **Multi-agent handoff animation** — directional arrows, path lines, and sound effects on agent handoff

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

## Contributions

See [CONTRIBUTORS.md](CONTRIBUTORS.md) for instructions on how to contribute to this project.

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before participating.

## Supporting the Project

If you find Pixel Agents useful, consider supporting its development:

<a href="https://github.com/sponsors/pablodelucca">
  <img src="https://img.shields.io/badge/Sponsor-GitHub-ea4aaa?logo=github" alt="GitHub Sponsors">
</a>
<a href="https://ko-fi.com/pablodelucca">
  <img src="https://img.shields.io/badge/Support-Ko--fi-ff5e5b?logo=ko-fi" alt="Ko-fi">
</a>

## License

This project is licensed under the [MIT License](LICENSE).
