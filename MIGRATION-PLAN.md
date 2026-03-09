# Migration Plan: Claude Code → GitHub Copilot Agent Mode

> **Goal**: Replace all Claude Code terminal integrations in Pixel Agents with GitHub Copilot Agent Mode, so characters react to Copilot activity instead of Claude Code JSONL transcripts.

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture Comparison](#architecture-comparison)
3. [Phase 0 — Understand the Gap](#phase-0--understand-the-gap)
4. [Phase 1 — Replace Agent Launching](#phase-1--replace-agent-launching)
5. [Phase 2 — Replace Activity Detection](#phase-2--replace-activity-detection)
6. [Phase 3 — Replace Message Protocol](#phase-3--replace-message-protocol)
7. [Phase 4 — Remove Sub-Agent Support](#phase-4--remove-sub-agent-support)
8. [Phase 5 — Update Focus Behavior](#phase-5--update-focus-behavior)
9. [Phase 6 — Cosmetic & Branding Updates](#phase-6--cosmetic--branding-updates)
10. [File-by-File Impact Matrix](#file-by-file-impact-matrix)
11. [Risk Analysis & Mitigations](#risk-analysis--mitigations)
12. [Recommended Implementation Order](#recommended-implementation-order)
13. [Appendix: VS Code API Reference](#appendix-vs-code-api-reference)

---

## Executive Summary

Pixel Agents currently works by launching **Claude Code terminals** (`claude --session-id <uuid>`) and watching their **JSONL transcript files** at `~/.claude/projects/<project-hash>/<session-id>.jsonl` in real time. Every tool call (Read, Write, Bash, Grep, etc.) appears as a structured JSON record that the extension parses to animate characters.

GitHub Copilot Agent Mode has **no equivalent transcript file**. It runs inside VS Code's Chat panel and performs actions (file edits, terminal commands, searches) through VS Code's own APIs. To make Pixel Agents work with Copilot, we must:

1. **Replace terminal launching** with Copilot Chat opening
2. **Replace JSONL file watching** with VS Code event listeners (file changes, terminal shell executions, document opens)
3. **Remove Claude-specific concepts** (sub-agents via `Task` tool, JSONL project directories, `/clear` detection)
4. **Keep the entire rendering engine intact** — the pixel art office, characters, layout editor, sprites, pathfinding, and animations are 100% agent-agnostic

The webview rendering layer (`webview-ui/`) is approximately **75% of the codebase** and requires only minor prop/message renames. The extension backend (`src/`) needs significant rework in 3 files, deletion of 2 files, and creation of 1 new file.

---

## Architecture Comparison

### How Claude Code Integration Works Today

```
User clicks "+ Agent"
    │
    ▼
Extension creates VS Code terminal
    │
    ▼
Terminal runs: claude --session-id <uuid>
    │
    ▼
Claude Code writes to: ~/.claude/projects/<hash>/<uuid>.jsonl
    │
    ▼
Extension watches JSONL file (fs.watch + polling)
    │
    ▼
Each new line is parsed for tool_use / tool_result / turn_duration
    │
    ▼
Extension sends postMessage to webview (agentToolStart, agentToolDone, agentStatus)
    │
    ▼
Webview updates character animation (idle → walk → type/read)
```

### How GitHub Copilot Integration Will Work

```
User clicks "+ Agent"
    │
    ▼
Extension opens Copilot Chat panel (via VS Code command)
    │
    ▼
Extension registers VS Code event listeners:
  - onDidChangeTextDocument (file edits)
  - onDidCreateFiles / onDidDeleteFiles
  - onDidStartTerminalShellExecution (commands)
  - onDidEndTerminalShellExecution
  - onDidOpenTextDocument (file reads)
    │
    ▼
When events fire, extension infers tool activity:
  - File edit → "Editing filename.ts"
  - Terminal command → "Running: npm test"
  - Document open → "Reading config.json"
    │
    ▼
Extension sends same postMessage to webview (agentToolStart, agentToolDone, agentStatus)
    │
    ▼
Webview updates character animation (UNCHANGED — same as before)
```

### Key Differences Table

| Concept | Claude Code (Current) | GitHub Copilot (Target) |
|---|---|---|
| **Launch mechanism** | `vscode.window.createTerminal()` + `claude --session-id` | `vscode.commands.executeCommand('workbench.action.chat.open')` |
| **Activity stream** | JSONL file at `~/.claude/projects/...` | No file — must use VS Code event APIs |
| **Tool detection** | Structured `tool_use` blocks with tool name + input | Inferred from side effects (file events, terminal events) |
| **Session identity** | UUID session ID → JSONL file path | No exposed session ID; agent is an internal construct |
| **Agent ↔ terminal binding** | 1:1 (each agent owns a terminal) | No terminal binding; Copilot uses its own terminals |
| **Sub-agents** | `Task` tool spawns nested agents with progress records | Not applicable — Copilot has no sub-agent concept |
| **Turn-end signal** | `system` record with `subtype: "turn_duration"` | Must infer from activity silence (heuristic) |
| **Permission needed** | Heuristic: 7s silence after non-exempt tool | Copilot handles permissions in its own UI |
| **File watching** | `fs.watch` + `fs.watchFile` + manual polling | Not needed — replaced by event listeners |
| **Project directory** | `~/.claude/projects/<project-hash>/` | Not applicable |

---

## Phase 0 — Understand the Gap

### VS Code Chat API Status (as of March 2026)

The VS Code Chat extension API (`vscode.chat.*`) provides:

- **`vscode.chat.createChatParticipant()`** — register a custom chat participant (e.g., `@pixel-agent`). This is a **proposed API** and requires `"enabledApiProposals": ["chatParticipants"]` in `package.json`.
- **`vscode.lm.*`** — Language Model API for making LLM calls. Useful if you want to run your own agent logic, but not needed if you just want to observe Copilot.

**For our use case (observation only), we do NOT need the Chat API.** We only need stable VS Code APIs:

| API | Status | Purpose |
|---|---|---|
| `vscode.workspace.onDidChangeTextDocument` | ✅ Stable | Detect file edits |
| `vscode.workspace.onDidCreateFiles` | ✅ Stable | Detect file creation |
| `vscode.workspace.onDidDeleteFiles` | ✅ Stable | Detect file deletion |
| `vscode.workspace.onDidOpenTextDocument` | ✅ Stable | Detect file reads |
| `vscode.window.onDidStartTerminalShellExecution` | ✅ Stable (1.93+) | Detect terminal commands starting |
| `vscode.window.onDidEndTerminalShellExecution` | ✅ Stable (1.93+) | Detect terminal commands finishing |
| `vscode.window.onDidOpenTerminal` | ✅ Stable | Detect new terminals |
| `vscode.window.onDidCloseTerminal` | ✅ Stable | Detect terminal closure |
| `vscode.commands.executeCommand` | ✅ Stable | Open Copilot Chat panel |

### What We Cannot Observe

Even with all available APIs, some things Claude Code's JSONL gave us for free:

1. **Which tool the agent is "thinking about"** — JSONL records appear when Claude *decides* to use a tool, before the tool executes. With event listeners, we only see effects *after* execution.
2. **The agent's internal reasoning/text** — Claude's `assistant` text blocks. Copilot's thinking is opaque.
3. **Clean tool boundaries** — Claude's `tool_use` has an `id` that pairs with `tool_result`. With events, we must synthesize our own IDs and infer when a "tool" starts/ends.
4. **User vs. agent attribution** — When a file changes, we can't always tell if the user typed it or Copilot edited it. (Mitigation: track timing — Copilot edits come in rapid bursts.)

---

## Phase 1 — Replace Agent Launching

### Current Flow

When the user clicks "+ Agent" in the webview:

1. **Webview** sends `{ type: 'openClaude' }` message
2. **Extension** (`PixelAgentsViewProvider.ts`) calls `launchNewTerminal()`
3. **`launchNewTerminal()`** (`agentManager.ts`):
   - Creates a VS Code terminal named `"Claude Code #N"`
   - Runs `claude --session-id <uuid>` in it
   - Computes project dir path (`~/.claude/projects/<hash>/`)
   - Creates `AgentState` with terminal ref, JSONL file path, file offset, etc.
   - Starts polling for the JSONL file to appear
   - Starts project-level scanning for `/clear` reassignment

### New Flow

When the user clicks "+ Agent":

1. **Webview** sends `{ type: 'openAgent' }` message
2. **Extension** opens Copilot Chat and creates a lightweight agent record
3. **Extension** ensures VS Code event listeners are registered (idempotent)

### Files to Modify

#### `src/constants.ts` — Remove JSONL constants, rename prefix

**Remove:**
```typescript
export const JSONL_POLL_INTERVAL_MS = 1000;        // No JSONL polling
export const FILE_WATCHER_POLL_INTERVAL_MS = 1000;  // No file watching
export const PROJECT_SCAN_INTERVAL_MS = 1000;       // No project scanning
```

**Add:**
```typescript
export const ACTIVITY_POLL_INTERVAL_MS = 2000;      // Idle detection polling
export const ACTIVITY_IDLE_THRESHOLD_MS = 8000;      // Time before marking agent as waiting
export const EDIT_BATCH_WINDOW_MS = 500;             // Batch rapid file edits into single activity
```

**Change:**
```typescript
// Before:
export const TERMINAL_NAME_PREFIX = 'Claude Code';

// After:
export const TERMINAL_NAME_PREFIX = 'Copilot Agent';
```

#### `src/types.ts` — Redefine AgentState

**Before:**
```typescript
export interface AgentState {
  id: number;
  terminalRef: vscode.Terminal;           // ← Claude terminal reference
  projectDir: string;                     // ← ~/.claude/projects/<hash>/
  jsonlFile: string;                      // ← JSONL file path
  fileOffset: number;                     // ← Read position in JSONL
  lineBuffer: string;                     // ← Partial line buffer
  activeToolIds: Set<string>;
  activeToolStatuses: Map<string, string>;
  activeToolNames: Map<string, string>;
  activeSubagentToolIds: Map<string, Set<string>>;     // ← Sub-agent tracking
  activeSubagentToolNames: Map<string, Map<string, string>>; // ← Sub-agent tracking
  isWaiting: boolean;
  permissionSent: boolean;
  hadToolsInTurn: boolean;
  folderName?: string;
}
```

**After:**
```typescript
export interface AgentState {
  id: number;
  // Removed: terminalRef, projectDir, jsonlFile, fileOffset, lineBuffer
  // Removed: activeSubagentToolIds, activeSubagentToolNames
  activeToolIds: Set<string>;
  activeToolStatuses: Map<string, string>;
  activeToolNames: Map<string, string>;
  isWaiting: boolean;
  permissionSent: boolean;
  hadToolsInTurn: boolean;
  folderName?: string;
  /** Timestamp of last detected activity (for idle detection) */
  lastActivityTimestamp: number;
}
```

**PersistedAgent — Before:**
```typescript
export interface PersistedAgent {
  id: number;
  terminalName: string;     // ← Terminal name for restore
  jsonlFile: string;        // ← JSONL path for restore
  projectDir: string;       // ← Project dir for restore
  folderName?: string;
}
```

**PersistedAgent — After:**
```typescript
export interface PersistedAgent {
  id: number;
  folderName?: string;
  // Removed: terminalName, jsonlFile, projectDir
}
```

#### `src/agentManager.ts` — Complete rewrite of launch/restore

**Key changes:**
- `getProjectDirPath()` — **Delete entirely** (no `~/.claude/projects/` concept)
- `launchNewTerminal()` — **Replace with `launchNewAgent()`**:
  ```typescript
  export async function launchNewAgent(
    nextAgentIdRef: { current: number },
    agents: Map<number, AgentState>,
    webview: vscode.Webview | undefined,
    persistAgents: () => void,
    folderPath?: string,
  ): Promise<void> {
    // Open Copilot Chat panel
    await vscode.commands.executeCommand('workbench.action.chat.open');

    const folders = vscode.workspace.workspaceFolders;
    const cwd = folderPath || folders?.[0]?.uri.fsPath;
    const isMultiRoot = !!(folders && folders.length > 1);
    const folderName = isMultiRoot && cwd ? path.basename(cwd) : undefined;

    const id = nextAgentIdRef.current++;
    const agent: AgentState = {
      id,
      activeToolIds: new Set(),
      activeToolStatuses: new Map(),
      activeToolNames: new Map(),
      isWaiting: false,
      permissionSent: false,
      hadToolsInTurn: false,
      folderName,
      lastActivityTimestamp: Date.now(),
    };

    agents.set(id, agent);
    persistAgents();
    webview?.postMessage({ type: 'agentCreated', id, folderName });
  }
  ```
- `removeAgent()` — **Simplify**: remove all file watcher/JSONL cleanup, keep only timer cancellation and map cleanup
- `restoreAgents()` — **Simplify**: no terminal matching or JSONL file scanning; just restore agent records
- `persistAgents()` — **Simplify**: only persist `id` and `folderName`
- **Delete entirely**: all `knownJsonlFiles`, `fileWatchers`, `pollingTimers`, `jsonlPollTimers` parameters from every function signature

#### `src/PixelAgentsViewProvider.ts` — Update message handler

**Change `openClaude` handler:**
```typescript
// Before:
if (message.type === 'openClaude') {
  await launchNewTerminal(
    this.nextAgentId, this.nextTerminalIndex,
    this.agents, this.activeAgentId, this.knownJsonlFiles,
    this.fileWatchers, this.pollingTimers, this.waitingTimers, this.permissionTimers,
    this.jsonlPollTimers, this.projectScanTimer,
    this.webview, this.persistAgents,
    message.folderPath as string | undefined,
  );
}

// After:
if (message.type === 'openAgent') {
  await launchNewAgent(
    this.nextAgentId,
    this.agents,
    this.webview,
    this.persistAgents,
    message.folderPath as string | undefined,
  );
}
```

**Remove these instance fields from `PixelAgentsViewProvider`:**
```typescript
// DELETE all of these:
fileWatchers = new Map<number, fs.FSWatcher>();
pollingTimers = new Map<number, ReturnType<typeof setInterval>>();
jsonlPollTimers = new Map<number, ReturnType<typeof setInterval>>();
activeAgentId = { current: null as number | null };
knownJsonlFiles = new Set<string>();
projectScanTimer = { current: null as ReturnType<typeof setInterval> | null };
```

**Remove `openSessionsFolder` handler** (no `~/.claude/projects/` to open).

**Remove `onDidChangeActiveTerminal` listener** that sets `activeAgentId` based on terminal focus — Copilot agents don't have dedicated terminals.

**Modify `onDidCloseTerminal` listener** — this can no longer be used to detect agent closure since agents aren't bound to terminals. Instead, add a manual "close agent" flow via the webview (the `closeAgent` message handler already exists but needs to be decoupled from terminal disposal).

---

## Phase 2 — Replace Activity Detection

This is the biggest architectural change. We're replacing a structured transcript stream with event-based heuristics.

### Files to Delete

| File | Reason |
|---|---|
| `src/fileWatcher.ts` | All JSONL file watching logic — replaced by VS Code event listeners |
| `src/transcriptParser.ts` | All JSONL parsing logic — no transcript to parse |

### New File to Create

#### `src/activityDetector.ts`

This module listens to VS Code workspace/window events and translates them into the same `agentToolStart`/`agentToolDone`/`agentStatus` messages the webview already expects.

```typescript
import * as path from 'path';
import * as vscode from 'vscode';
import type { AgentState } from './types.js';
import {
  ACTIVITY_IDLE_THRESHOLD_MS,
  EDIT_BATCH_WINDOW_MS,
  TOOL_DONE_DELAY_MS,
} from './constants.js';

// ── Internal State ──────────────────────────────────────────

/** Currently active synthetic tool ID for file edit batching */
let currentEditToolId: string | null = null;
let editBatchTimer: ReturnType<typeof setTimeout> | null = null;

/** Map of active terminal execution tool IDs */
const activeTerminalTools = new Map<number, string>(); // terminal.processId → toolId

/** Idle detection interval */
let idleInterval: ReturnType<typeof setInterval> | null = null;

// ── Public API ──────────────────────────────────────────────

/**
 * Register all VS Code event listeners for activity detection.
 * Call once during extension activation. Idempotent — subsequent calls are no-ops.
 */
export function registerActivityListeners(
  context: vscode.ExtensionContext,
  agents: Map<number, AgentState>,
  getActiveAgentId: () => number | null,
  webview: () => vscode.Webview | undefined,
): void {
  // ── File Edit Detection ────────────────────────────────────
  // Fires when any text document changes (user OR Copilot edits)
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((e) => {
      const agentId = getActiveAgentId();
      if (agentId === null) return;
      if (e.contentChanges.length === 0) return;
      // Skip output/log/untitled schemes
      if (e.document.uri.scheme !== 'file') return;

      const fileName = path.basename(e.document.uri.fsPath);
      touchActivity(agentId, agents);
      batchEditActivity(agentId, fileName, agents, webview());
    }),
  );

  // ── File Creation Detection ────────────────────────────────
  context.subscriptions.push(
    vscode.workspace.onDidCreateFiles((e) => {
      const agentId = getActiveAgentId();
      if (agentId === null) return;
      for (const file of e.files) {
        const fileName = path.basename(file.fsPath);
        touchActivity(agentId, agents);
        emitToolStart(agentId, `write_${Date.now()}`, `Writing ${fileName}`, 'Write', agents, webview());
        // Auto-complete write tool after delay
        const toolId = `write_${Date.now()}`;
        setTimeout(() => {
          emitToolDone(agentId, toolId, agents, webview());
        }, TOOL_DONE_DELAY_MS);
      }
    }),
  );

  // ── File Deletion Detection ────────────────────────────────
  context.subscriptions.push(
    vscode.workspace.onDidDeleteFiles((e) => {
      const agentId = getActiveAgentId();
      if (agentId === null) return;
      for (const file of e.files) {
        const fileName = path.basename(file.fsPath);
        touchActivity(agentId, agents);
        const toolId = `delete_${Date.now()}`;
        emitToolStart(agentId, toolId, `Deleting ${fileName}`, 'Bash', agents, webview());
        setTimeout(() => {
          emitToolDone(agentId, toolId, agents, webview());
        }, TOOL_DONE_DELAY_MS);
      }
    }),
  );

  // ── File Open Detection (Read) ─────────────────────────────
  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument((doc) => {
      const agentId = getActiveAgentId();
      if (agentId === null) return;
      if (doc.uri.scheme !== 'file') return;

      const fileName = path.basename(doc.uri.fsPath);
      touchActivity(agentId, agents);
      const toolId = `read_${Date.now()}`;
      emitToolStart(agentId, toolId, `Reading ${fileName}`, 'Read', agents, webview());
      setTimeout(() => {
        emitToolDone(agentId, toolId, agents, webview());
      }, TOOL_DONE_DELAY_MS * 3); // Reads are visible slightly longer
    }),
  );

  // ── Terminal Shell Execution Detection (Bash) ──────────────
  // Stable since VS Code 1.93 — fires when a command runs in any terminal
  context.subscriptions.push(
    vscode.window.onDidStartTerminalShellExecution((e) => {
      const agentId = getActiveAgentId();
      if (agentId === null) return;

      const command = e.execution.commandLine?.value || 'command';
      const truncated = command.length > 30 ? command.slice(0, 30) + '…' : command;
      const toolId = `bash_${Date.now()}`;

      touchActivity(agentId, agents);
      emitToolStart(agentId, toolId, `Running: ${truncated}`, 'Bash', agents, webview());

      // Track so we can complete it in onDidEndTerminalShellExecution
      e.terminal.processId.then((pid) => {
        if (pid !== undefined) {
          activeTerminalTools.set(pid, toolId);
        }
      });
    }),
  );

  context.subscriptions.push(
    vscode.window.onDidEndTerminalShellExecution((e) => {
      const agentId = getActiveAgentId();
      if (agentId === null) return;

      touchActivity(agentId, agents);

      e.terminal.processId.then((pid) => {
        if (pid !== undefined) {
          const toolId = activeTerminalTools.get(pid);
          if (toolId) {
            activeTerminalTools.delete(pid);
            emitToolDone(agentId, toolId, agents, webview());
          }
        }
      });
    }),
  );

  // ── Idle Detection (Waiting/Done state) ────────────────────
  idleInterval = setInterval(() => {
    for (const [agentId, agent] of agents) {
      if (agent.isWaiting) continue;
      const elapsed = Date.now() - agent.lastActivityTimestamp;
      if (elapsed > ACTIVITY_IDLE_THRESHOLD_MS && agent.activeToolIds.size === 0) {
        agent.isWaiting = true;
        webview()?.postMessage({
          type: 'agentStatus',
          id: agentId,
          status: 'waiting',
        });
      }
    }
  }, 2000);

  context.subscriptions.push({
    dispose: () => {
      if (idleInterval) clearInterval(idleInterval);
    },
  });
}

// ── Internal Helpers ────────────────────────────────────────

function touchActivity(agentId: number, agents: Map<number, AgentState>): void {
  const agent = agents.get(agentId);
  if (!agent) return;
  agent.lastActivityTimestamp = Date.now();
  if (agent.isWaiting) {
    agent.isWaiting = false;
    // Agent became active again — but we don't send agentStatus here,
    // the toolStart message will implicitly signal active state
  }
}

function batchEditActivity(
  agentId: number,
  fileName: string,
  agents: Map<number, AgentState>,
  webview: vscode.Webview | undefined,
): void {
  // If there's already an active edit tool, just extend its timer
  if (editBatchTimer) {
    clearTimeout(editBatchTimer);
  }

  if (!currentEditToolId) {
    currentEditToolId = `edit_${Date.now()}`;
    emitToolStart(agentId, currentEditToolId, `Editing ${fileName}`, 'Edit', agents, webview);
  }

  // Auto-complete the edit after EDIT_BATCH_WINDOW_MS of silence
  const toolId = currentEditToolId;
  editBatchTimer = setTimeout(() => {
    emitToolDone(agentId, toolId, agents, webview);
    currentEditToolId = null;
    editBatchTimer = null;
  }, EDIT_BATCH_WINDOW_MS);
}

function emitToolStart(
  agentId: number,
  toolId: string,
  status: string,
  toolName: string,
  agents: Map<number, AgentState>,
  webview: vscode.Webview | undefined,
): void {
  const agent = agents.get(agentId);
  if (!agent) return;

  agent.activeToolIds.add(toolId);
  agent.activeToolStatuses.set(toolId, status);
  agent.activeToolNames.set(toolId, toolName);
  agent.hadToolsInTurn = true;

  webview?.postMessage({ type: 'agentStatus', id: agentId, status: 'active' });
  webview?.postMessage({
    type: 'agentToolStart',
    id: agentId,
    toolId,
    status,
  });
}

function emitToolDone(
  agentId: number,
  toolId: string,
  agents: Map<number, AgentState>,
  webview: vscode.Webview | undefined,
): void {
  const agent = agents.get(agentId);
  if (!agent) return;

  agent.activeToolIds.delete(toolId);
  agent.activeToolStatuses.delete(toolId);
  agent.activeToolNames.delete(toolId);

  setTimeout(() => {
    webview?.postMessage({
      type: 'agentToolDone',
      id: agentId,
      toolId,
    });
  }, TOOL_DONE_DELAY_MS);
}
```

### How Activity Detection Maps to Character Animations

The webview already has a `STATUS_TO_TOOL` mapping in `webview-ui/src/office/toolUtils.ts` that converts status text prefixes into animation types. The `activityDetector.ts` emits status strings that match these prefixes:

| VS Code Event | Status String Emitted | Maps To Tool | Character Animation |
|---|---|---|---|
| `onDidChangeTextDocument` | `"Editing config.ts"` | `Edit` | Typing (keyboard) |
| `onDidCreateFiles` | `"Writing newfile.ts"` | `Write` | Typing (keyboard) |
| `onDidDeleteFiles` | `"Deleting old.ts"` | `Bash` | Typing (keyboard) |
| `onDidOpenTextDocument` | `"Reading utils.ts"` | `Read` | Reading (document) |
| `onDidStartTerminalShellExecution` | `"Running: npm test"` | `Bash` | Typing (keyboard) |
| Idle timeout | (agentStatus: waiting) | — | Idle + speech bubble |

### Handling the "User vs. Copilot" Attribution Problem

This is the biggest challenge. When `onDidChangeTextDocument` fires, was it the user typing or Copilot editing?

**Practical heuristics to implement:**

1. **Copilot edits are bursty**: Copilot applies multiple edits across files in rapid succession. User edits are usually one file at a time with pauses. Batch edits within a 500ms window.

2. **Check active editor**: If the edit happens in a document the user doesn't have focused, it's more likely Copilot.

3. **Track Copilot Chat state**: When the user sends a message in Copilot Chat and edits start appearing, those are Copilot edits. When the user is typing in an editor, those are user edits.

4. **"Reason" field**: `TextDocumentChangeEvent` has a `reason` property (undo/redo). Copilot edits never have undo/redo as the reason on first application.

**Recommended starting approach**: Treat ALL edit activity as agent activity when at least one agent exists. This is imperfect but provides consistent visual feedback. Refine later with heuristics.

---

## Phase 3 — Replace Message Protocol

The extension ↔ webview communication uses `postMessage`. Most messages are agent-agnostic and don't change. Only the launch message needs renaming.

### Messages That Change

| Message | Current | New | Where Used |
|---|---|---|---|
| Agent launch | `{ type: 'openClaude' }` | `{ type: 'openAgent' }` | BottomToolbar → Extension |
| Agent launch (folder) | `{ type: 'openClaude', folderPath }` | `{ type: 'openAgent', folderPath }` | BottomToolbar → Extension |

### Messages That Stay the Same (No Changes Needed)

These messages are completely agent-agnostic — they carry agent IDs and tool statuses without any Claude-specific data:

- `agentCreated` / `agentClosed` — agent lifecycle
- `focusAgent` / `closeAgent` — user actions on agents
- `agentToolStart` / `agentToolDone` / `agentToolsClear` — tool activity
- `agentStatus` (active/waiting) — agent state
- `agentToolPermission` / `agentToolPermissionClear` — permission bubbles
- `agentSelected` — terminal focus sync
- `existingAgents` — restore on reconnect
- `saveAgentSeats` — seat persistence
- All layout messages (`layoutLoaded`, `saveLayout`, `exportLayout`, `importLayout`)
- All asset messages (`furnitureAssetsLoaded`, `floorTilesLoaded`, `wallTilesLoaded`, `characterSpritesLoaded`)
- `settingsLoaded` / `setSoundEnabled` — settings sync
- `workspaceFolders` — multi-root support

### Files to Update

#### `webview-ui/src/hooks/useEditorActions.ts`

```typescript
// Before (line 22):
handleOpenClaude: () => void

// After:
handleOpenAgent: () => void

// Before (line 81-83):
const handleOpenClaude = useCallback(() => {
  vscode.postMessage({ type: 'openClaude' })
}, [])

// After:
const handleOpenAgent = useCallback(() => {
  vscode.postMessage({ type: 'openAgent' })
}, [])
```

#### `webview-ui/src/components/BottomToolbar.tsx`

```typescript
// Before (line 8):
onOpenClaude: () => void

// After:
onOpenAgent: () => void

// Before (line 79):
onOpenClaude()

// After:
onOpenAgent()

// Before (line 85):
vscode.postMessage({ type: 'openClaude', folderPath: folder.path })

// After:
vscode.postMessage({ type: 'openAgent', folderPath: folder.path })
```

#### `webview-ui/src/App.tsx`

```typescript
// Before (line 228):
onOpenClaude={editor.handleOpenClaude}

// After:
onOpenAgent={editor.handleOpenAgent}
```

### Update `webview-ui/src/office/toolUtils.ts` — Extend Tool Mapping

The current mapping handles Claude Code tool names. Add mappings for Copilot-style statuses:

```typescript
export const STATUS_TO_TOOL: Record<string, string> = {
  // Existing (keep — activityDetector emits these same prefixes):
  'Reading': 'Read',
  'Searching': 'Grep',
  'Fetching': 'WebFetch',
  'Searching web': 'WebSearch',
  'Writing': 'Write',
  'Editing': 'Edit',
  'Running': 'Bash',
  'Task': 'Task',         // Can remove if sub-agents are fully stripped
  // New (for Copilot-specific activities):
  'Creating': 'Write',
  'Deleting': 'Bash',
  'Installing': 'Bash',
}
```

---

## Phase 4 — Remove Sub-Agent Support

Claude Code has a `Task` tool that spawns sub-agents. Each sub-agent's activity is forwarded via `progress` records in the parent's JSONL. GitHub Copilot has no equivalent.

### What to Remove

#### In `src/transcriptParser.ts` (file is being deleted entirely)
- The entire `processProgressRecord()` function (handles `agent_progress`, `bash_progress`, `mcp_progress`)
- Sub-agent tool tracking logic

#### In `src/types.ts`
- Remove `activeSubagentToolIds` and `activeSubagentToolNames` from `AgentState`

#### In `src/timerManager.ts`
- Remove sub-agent permission checking from `startPermissionTimer()` (the loop over `activeSubagentToolNames`)
- Simplify to only check `activeToolNames`

#### In `webview-ui/src/hooks/useExtensionMessages.ts`
- Remove `subagentTools` state and its handlers
- Remove `subagentCharacters` state
- Remove handlers for: `subagentToolStart`, `subagentToolDone`, `subagentClear`

#### In `webview-ui/src/office/engine/officeState.ts`
- Remove or no-op: `addSubagent()`, `removeSubagent()`, `removeAllSubagents()`
- Remove sub-agent seat allocation logic

### Alternative: Keep Dormant

If you want to potentially re-enable sub-agents later (for a different backend), keep the code but ensure nothing calls it. The sub-agent webview code is harmless if never triggered — no messages = no sub-agent characters.

---

## Phase 5 — Update Focus Behavior

### Current Behavior

Clicking a character in the webview sends `{ type: 'focusAgent', id }`. The extension handles it by calling `agent.terminalRef.show()` to bring the Claude Code terminal to the foreground.

### Problem

Copilot agents don't own terminals. There's no `terminalRef` to show.

### New Behavior Options

**Option A — Focus Copilot Chat panel** (recommended):
```typescript
// In PixelAgentsViewProvider.ts:
if (message.type === 'focusAgent') {
  await vscode.commands.executeCommand('workbench.action.chat.open');
}
```
This always opens/focuses the Copilot Chat panel regardless of which agent was clicked. Simple but effective for single-agent use.

**Option B — Per-agent chat sessions** (requires proposed API):
If VS Code eventually exposes per-session chat API, you could open a specific chat thread per agent. Not available as of March 2026.

**Option C — No-op focus, visual selection only**:
Clicking a character only selects it visually (white outline, camera follow). No panel switching. The user manually switches to Copilot Chat when needed.

### Removing Terminal Lifecycle Management

#### Current terminal-close detection:
```typescript
vscode.window.onDidCloseTerminal((closed) => {
  for (const [id, agent] of this.agents) {
    if (agent.terminalRef === closed) {
      // Remove agent when its terminal closes
      removeAgent(id, ...);
      webview.postMessage({ type: 'agentClosed', id });
    }
  }
});
```

#### New agent lifecycle:

Since agents aren't tied to terminals, agent removal must be **explicit**:

1. **"Close" button on character** — the `closeAgent` message already exists in the webview; the extension handler needs to work without `terminal.dispose()`
2. **Manual removal** — user clicks character → clicks close (X) button
3. **Session end** — optionally detect when the user clears Copilot Chat history

```typescript
// New closeAgent handler:
if (message.type === 'closeAgent') {
  const agentId = message.id as number;
  removeAgent(agentId, this.agents, this.waitingTimers, this.permissionTimers, this.persistAgents);
  this.webview?.postMessage({ type: 'agentClosed', id: agentId });
}
```

---

## Phase 6 — Cosmetic & Branding Updates

### `package.json`

```json
{
  "description": "Pixel art office where your AI coding agents come to life as animated characters",
  // Remove "Claude Code" from description
}
```

### `src/constants.ts`

```typescript
export const TERMINAL_NAME_PREFIX = 'Copilot Agent';
// (used for display purposes, if any terminal naming is still needed)
```

### `README.md` — Full rewrite needed

Replace all references to:
- "Claude Code" → "GitHub Copilot" or "AI agent"
- "Claude Code CLI" requirement → "GitHub Copilot extension" requirement
- JSONL transcript description → VS Code event-based description
- "claude" terminal command → Copilot Chat panel

### `CLAUDE.md` — Rename and update

Rename to `AGENTS.md` or `COPILOT.md`. Update:
- Architecture descriptions
- Core concepts (remove "Terminal = VS Code terminal running Claude")
- Agent status tracking section
- File watching section
- All JSONL-related documentation

### Remove from `PixelAgentsViewProvider.ts`

The `openSessionsFolder` message handler opens `~/.claude/projects/` in the file explorer. This concept doesn't exist for Copilot. Remove the handler entirely.

---

## File-by-File Impact Matrix

| File | Impact Level | Action |
|---|---|---|
| **`src/agentManager.ts`** | 🔴 Major rewrite | Remove terminal/JSONL creation; replace with Copilot Chat launch; simplify all function signatures to remove file watcher params |
| **`src/fileWatcher.ts`** | 🔴 Delete | Entirely replaced by `activityDetector.ts` |
| **`src/transcriptParser.ts`** | 🔴 Delete | No JSONL to parse; tool detection moves to `activityDetector.ts` |
| **`src/activityDetector.ts`** | 🟢 New file | VS Code event-based tool detection (see Phase 2) |
| **`src/types.ts`** | 🟡 Modify | Remove JSONL/terminal fields from `AgentState` and `PersistedAgent`; add `lastActivityTimestamp` |
| **`src/constants.ts`** | 🟡 Modify | Remove JSONL constants; add activity detection constants; rename `TERMINAL_NAME_PREFIX` |
| **`src/timerManager.ts`** | 🟡 Minor modify | Remove sub-agent permission logic; keep waiting/permission timer core |
| **`src/PixelAgentsViewProvider.ts`** | 🟡 Major modify | Replace `openClaude` handler; remove terminal listeners; remove file watcher fields; remove `openSessionsFolder`; simplify `webviewReady` handler; add `activityDetector` registration |
| **`src/extension.ts`** | 🟢 Minor | No structural change needed |
| **`src/layoutPersistence.ts`** | ⚪ No change | Layout system is completely agent-agnostic |
| **`src/assetLoader.ts`** | ⚪ No change | Asset system is completely agent-agnostic |
| **`webview-ui/src/hooks/useEditorActions.ts`** | 🟡 Minor | Rename `handleOpenClaude` → `handleOpenAgent` |
| **`webview-ui/src/components/BottomToolbar.tsx`** | 🟡 Minor | Rename `onOpenClaude` prop → `onOpenAgent`; update message type |
| **`webview-ui/src/App.tsx`** | 🟡 Minor | Update prop name |
| **`webview-ui/src/hooks/useExtensionMessages.ts`** | 🟡 Minor | Remove sub-agent state if desired; otherwise no changes |
| **`webview-ui/src/office/toolUtils.ts`** | 🟡 Minor | Add Copilot-specific status prefixes |
| **All `webview-ui/src/office/engine/*`** | ⚪ No change | Game loop, renderer, characters, pathfinding — all agent-agnostic |
| **All `webview-ui/src/office/layout/*`** | ⚪ No change | Furniture catalog, layout serializer, tile map — all agent-agnostic |
| **All `webview-ui/src/office/sprites/*`** | ⚪ No change | Sprite data, cache, rendering — all agent-agnostic |
| **All `webview-ui/src/office/editor/*`** | ⚪ No change | Editor tools, state, toolbar — all agent-agnostic |
| **`webview-ui/src/office/components/OfficeCanvas.tsx`** | ⚪ No change | Canvas rendering — agent-agnostic |
| **`webview-ui/src/office/components/ToolOverlay.tsx`** | ⚪ No change | Activity label display — agent-agnostic |
| **`package.json`** | 🟡 Minor | Update description text |
| **`README.md`** | 🟡 Rewrite | Replace Claude Code references with Copilot |
| **`CLAUDE.md`** | 🟡 Rename + rewrite | Rename to `COPILOT.md` or `AGENTS.md` |

---

## Risk Analysis & Mitigations

### Risk 1: Low Activity Detection Fidelity

**Problem**: Claude Code's JSONL gives us tool-level granularity (tool name, input params, start/end IDs). VS Code events only give us side effects.

**Impact**: Characters may not always perfectly reflect what Copilot is doing.

**Mitigation strategies**:
- **Batch rapid events**: Group file edits within 500ms into a single "Editing" activity
- **Use terminal shell execution API**: `onDidStartTerminalShellExecution` (stable since VS Code 1.93) gives command-level granularity for terminal operations — this is the most reliable signal
- **Accept lower fidelity**: Even imperfect animation provides useful visual feedback (character typing while Copilot edits files is still meaningful)
- **Future improvement**: If VS Code adds more Chat API events (e.g., `onDidStartToolExecution`), hook into those

### Risk 2: User vs. Agent Attribution

**Problem**: When `onDidChangeTextDocument` fires, we can't always tell if the user typed it or Copilot edited it.

**Impact**: Characters may animate when the user is typing (false positives).

**Mitigation strategies**:
- **Only attribute to agent during "agent active" windows**: After the user sends a Copilot Chat message, open a time window (e.g., 30 seconds) where edits are attributed to the agent. Outside this window, ignore edits.
- **Track active editor**: If the edit is in a non-focused editor, it's more likely Copilot.
- **Debounce**: Copilot edits are bursty (many files in milliseconds). User edits are sparse. Use timing patterns.
- **Manual toggle**: Add a "pause tracking" button if false positives are annoying.

### Risk 3: No Turn-End Signal

**Problem**: Claude Code emits `system` + `turn_duration` when a turn completes. Copilot has no equivalent.

**Impact**: Characters may not reliably transition to "waiting" state when Copilot finishes a task.

**Mitigation strategies**:
- **Silence-based idle detection**: Already implemented in the current codebase (`TEXT_IDLE_DELAY_MS = 5000`). Reuse the same approach with `ACTIVITY_IDLE_THRESHOLD_MS`.
- **The existing system already has this problem**: The README lists "Heuristic-based status detection" as a known limitation even with Claude Code.

### Risk 4: Single Copilot Session, Multiple Agents

**Problem**: Claude Code gives you one terminal per agent. Copilot has a single Chat panel. How do multiple agents work?

**Impact**: Multiple characters but only one actual Copilot instance.

**Mitigation strategies**:
- **Agents as "projects" or "persona"**: Each agent represents a different workspace folder or task context. Only one is "active" at a time.
- **Activity routing**: Route detected activity to the "active" agent (the last one the user selected).
- **Visual-only multi-agent**: Multiple characters exist for visual interest, but only the active one animates. Others idle/wander.
- **Future**: If VS Code adds multi-session Chat API, bind each agent to a session.

### Risk 5: Proposed API Dependency

**Problem**: Some useful APIs (like `onDidWriteTerminalData`, chat participants) are proposed/experimental.

**Impact**: May break between VS Code versions; can't publish to marketplace with proposed APIs.

**Mitigation**: The implementation plan above uses **only stable APIs**. The `onDidStartTerminalShellExecution` / `onDidEndTerminalShellExecution` APIs have been stable since VS Code 1.93 and cover the most important use case (terminal commands).

---

## Recommended Implementation Order

### Step 1: Phase 1 + Phase 3 (Agent Launching + Message Protocol)

Get the "+ Agent" button working with Copilot. This is the minimum to see a character spawn:

1. Rename all `openClaude` → `openAgent` references
2. Rewrite `launchNewAgent()` to open Copilot Chat
3. Simplify `AgentState` and `PersistedAgent`
4. Strip file watcher fields from `PixelAgentsViewProvider`
5. Update `closeAgent` to work without terminal disposal

**Test**: Click "+ Agent" → character spawns in office → idle animation plays.

### Step 2: Phase 2 (Activity Detection)

Wire up `activityDetector.ts` to make characters react:

1. Create `src/activityDetector.ts`
2. Register event listeners in `PixelAgentsViewProvider.resolveWebviewView()`
3. Delete `src/fileWatcher.ts` and `src/transcriptParser.ts`
4. Test: open files, make edits, run terminal commands → character animates

**Test**: Use Copilot to edit a file → character does typing animation. Run `npm test` → character does bash animation.

### Step 3: Phase 5 (Focus Behavior)

Update character click behavior:

1. Replace `terminalRef.show()` with `vscode.commands.executeCommand('workbench.action.chat.open')`
2. Remove `onDidChangeActiveTerminal` listener
3. Add explicit agent removal flow

**Test**: Click character → Copilot Chat panel opens.

### Step 4: Phase 4 (Sub-Agent Cleanup)

Strip unused sub-agent code:

1. Remove sub-agent fields from `AgentState`
2. Simplify `timerManager.ts`
3. Remove sub-agent handlers from `useExtensionMessages.ts`

**Test**: Build succeeds, no runtime errors.

### Step 5: Phase 6 (Branding)

Update all text references:

1. Update `package.json` description
2. Update `README.md`
3. Rename `CLAUDE.md`
4. Update constants

**Test**: Full build + lint passes.

---

## Appendix: VS Code API Reference

### Stable APIs Used in This Migration

```typescript
// ── Workspace Events (file operations) ──────────────────────
vscode.workspace.onDidChangeTextDocument(listener)    // File content changed
vscode.workspace.onDidCreateFiles(listener)           // Files created
vscode.workspace.onDidDeleteFiles(listener)           // Files deleted
vscode.workspace.onDidOpenTextDocument(listener)      // File opened for reading

// ── Window Events (terminal operations) ─────────────────────
vscode.window.onDidStartTerminalShellExecution(listener) // Command started (1.93+)
vscode.window.onDidEndTerminalShellExecution(listener)   // Command finished (1.93+)
vscode.window.onDidOpenTerminal(listener)                // Terminal created
vscode.window.onDidCloseTerminal(listener)               // Terminal closed

// ── Commands ────────────────────────────────────────────────
vscode.commands.executeCommand('workbench.action.chat.open')  // Open Copilot Chat
vscode.commands.executeCommand('workbench.action.chat.clear') // Clear chat (optional)
```

### Proposed APIs (NOT used — for future reference)

```typescript
// Chat Participant API — could be used to create custom @pixel-agent participant
// Requires: "enabledApiProposals": ["chatParticipants"] in package.json
vscode.chat.createChatParticipant('pixel-agents.agent', handler)

// Terminal Data API — could be used for richer terminal monitoring
// Requires: "enabledApiProposals": ["terminalDataWriteEvent"]
vscode.window.onDidWriteTerminalData(listener)
```

---

## Estimated Scope

| Category | Files | Effort |
|---|---|---|
| Files to delete | 2 (`fileWatcher.ts`, `transcriptParser.ts`) | Trivial |
| Files to create | 1 (`activityDetector.ts`) | Medium |
| Files with major changes | 2 (`agentManager.ts`, `PixelAgentsViewProvider.ts`) | High |
| Files with minor changes | 8 (types, constants, timer, toolUtils, BottomToolbar, App, useEditorActions, useExtensionMessages) | Low each |
| Files unchanged | ~25+ (all rendering, layout, sprites, editor, engine) | None |

The entire rendering engine, layout editor, sprite system, character FSM, pathfinding, and canvas — roughly 75% of the codebase — remains completely untouched.