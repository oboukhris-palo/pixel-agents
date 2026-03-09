---
description: Development rules and patterns for pixel-agents VS Code extension
applyTo: "src/**,webview-ui/src/**"
---

# Pixel Agents — AI Agent Instructions

> VS Code extension with embedded React webview: pixel art office where AI agents are animated characters.

## Critical Architecture Principle: Backend ↔ Rendering Separation

**This is the MOST important rule.** The codebase is fundamentally split:
- **Backend (`src/`)**: AI agent platform integration (Copilot Chat, events, timers, persistence)
- **Rendering (`webview-ui/`)**: Game loop, pixel art, character FSM, layout editor (COMPLETELY AGENT-AGNOSTIC)

**When coding**:
- ✅ Agent platform changes ONLY touch `src/`
- ✅ UI/animation changes ONLY touch `webview-ui/`
- ✅ Message protocol (`agentToolStart`, `agentToolDone`, etc.) is the BRIDGE — keep it stable
- ❌ Never add agent-specific logic to rendering code
- ❌ Never touch rendering when fixing platform issues

**Why**: 75% of codebase is rendering. If backend/rendering are entangled, maintenance becomes 10x harder. The message protocol shields rendering from platform changes.

---

## Event-Driven Activity Detection (Never File Watching)

**Pattern**: Use stable VS Code event APIs, NOT file watching or heuristics.

```typescript
// ✅ GOOD (stable API, responsive, works across platforms)
vscode.workspace.onDidChangeTextDocument(e => { /* handle activity */ })
vscode.window.onDidStartTerminalShellExecution(e => { /* handle activity */ })

// ❌ BAD (unreliable, deprecated approach)
fs.watch(logFile, () => { /* stale data */ })
```

**Reference**: See `src/activityDetector.ts` pattern — this is the template for new agent platforms.

---

## Type Safety — Strict TypeScript

This project enforces:
- ✅ `import type` for type-only imports (prevents runtime leaks)
- ✅ `as const` instead of `enum` (erasableSyntaxOnly)
- ✅ No unused locals or parameters (`noUnusedLocals`, `noUnusedParameters`)
- ✅ Explicit types (`Record<number, AgentState>` not `any`)
- ✅ Always use strict types

**Before runtime testing**: Compile must pass (`npm run build`). TypeScript errors become runtime disasters.

---

## Constants Are Centralized — No Magic Numbers

**All magic values must live in constants files**:
- `src/constants.ts` — backend timing, thresholds, message formatting
- `webview-ui/src/constants.ts` — rendering timing, grid sizes, animation speeds
- `webview-ui/src/index.css` — CSS variables (`--pixel-bg`, `--pixel-accent`, etc.)

**Rule**: If you type a number twice, extract it to constants.

```typescript
// ✅ GOOD
const ACTIVITY_IDLE_THRESHOLD_MS = 8000;
const EDIT_BATCH_WINDOW_MS = 500;

// ❌ BAD
if (timeSinceActivity > 8000) { /* magic number */ }
```

---

## Message Protocol Stability

The TypeScript interface between extension and webview is the CONTRACT:
- ✅ Adding new message types is safe
- ✅ Adding trailing fields to existing types is safe
- ✅ Deprecating old messages with dual support is safe
- ❌ Removing message types = breaking change
- ❌ Removing/renaming fields = breaking change
- ❌ Changing field types (`id: number` → `id: string`) without migration = breaking change

**If breaking**: Document message protocol changes in git commit message and update copilot-instructions.md.

---

## Test Strategy — Phase-Gated Implementation

**When adding features**:
1. Write failing tests first (RED phase)
2. Implement minimal code to pass (GREEN phase)
3. Refactor while keeping tests green (REFACTOR phase)
4. Run full test suite before each phase transition

**After each major phase**:
```bash
npm run build       # Must pass
npm run lint        # Must pass
npm test            # Must pass
```

**Test coverage requirements**:
- Agent launch, restoration, removal: ✅ REQUIRED
- Activity detection (file edits, terminal commands): ✅ REQUIRED
- Idle detection (8s silence → waiting state): ✅ REQUIRED
- Layout editor (paint, place, undo/redo, persistence): ✅ REQUIRED
- Integration scenarios (end-to-end workflows): ✅ REQUIRED

**Reference**: See `TESTS.md` for complete test documentation and patterns.

---

## vscode Mock for Testing

The project uses custom vscode mocks in `src/__mocks__/vscode.ts`:
- ✅ Update mock when adding new VS Code listeners
- ✅ Export all workspace/window/commands APIs your code uses
- ✅ Use jest.fn() with proper return values ({ dispose: jest.fn() })
- ❌ Never hardcode mock logic in test files

**Pattern for activity detector tests**:
```typescript
// In test file: lazy require to ensure mock is active
const { registerActivityListeners } = require('./activityDetector');
const vscode = require('vscode');
expect(vscode.workspace.onDidOpenTextDocument).toBeDefined();
```

---

## Naming Conventions

- **Agent IDs**: Sequential integers (1, 2, 3…) — NO UUIDs (breaks localStorage keys)
- **Agent names**: Format `"Copilot Agent #1"` (from `TERMINAL_NAME_PREFIX` constant)
- **Tool IDs**: Scoped format `<agentId>_<toolType>_<timestamp>` (e.g., `1_write_1709608343000`)
- **File paths**: Use `path.basename()` for display; normalize on Windows
- **Status messages**: Use present tense ("Writing file.ts", "Reading package.json")

---

## Common Patterns

### Listening to VS Code Events

```typescript
// ✅ GOOD
context.subscriptions.push(
  vscode.workspace.onDidChangeTextDocument((e) => {
    if (e.document.uri.scheme !== 'file') return;
    handleActivity(activeAgent, 'edit');
  })
);

// ✅ GOOD - Terminal execution
context.subscriptions.push(
  vscode.window.onDidStartTerminalShellExecution((e) => {
    handleActivity(activeAgent, 'bash');
  })
);
```

### Sending Messages to Webview

```typescript
// ✅ GOOD
webview?.postMessage({
  type: 'agentToolStart',
  id: agentId,
  toolId: tool.id,
  status: `Editing ${path.basename(file)}`,
});

// ❌ BAD - including platform-specific data
webview?.postMessage({
  type: 'agentToolStart',
  id: agentId,
  jsonlLine: lineNumber,  // ← platform-specific!
  status: 'claude_tool_use',  // ← raw platform value!
});
```

### Idle Detection Pattern

```typescript
// ✅ GOOD - Two signals:
// 1. System turn_duration (reliable, ~98% of turns)
// 2. Text-idle timer (5s for text-only turns)
const ACTIVITY_IDLE_THRESHOLD_MS = 8000;
const TEXT_IDLE_DELAY_MS = 5000;

// Activity timestamp is updated by event listener
agent.lastActivityTimestamp = Date.now();

// Idle detection runs independently → sets agent.isWaiting = true
```

---

## Debugging Checklist

When code doesn't work:

- [ ] Did `npm run build` pass? (type errors block everything)
- [ ] Did `npm test` pass? (run specific test with `--testNamePattern`)
- [ ] Did Extension Dev Host load? (F5, wait 3 sec, check Output panel)
- [ ] Are logs visible? (Extension logs in Output; webview logs in browser console Ctrl+Shift+I)
- [ ] Is agent created? (debug mode shows agent state)
- [ ] Did `agentCreated` message fire? (check extension logs)
- [ ] Did `agentToolStart` message fire? (check webview logs)
- [ ] Is character on-screen? (check zoom level, camera position)

---

## Phase-Gated Workflow for New Features

```
PHASE 1: Plan & Constants
├─ Read copilot-instructions.md (detailed reference)
├─ Identify affected layers (backend/rendering/both)
└─ Update src/constants.ts FIRST

PHASE 2: Backend Implementation
├─ Write failing tests (agentManager, activityDetector, timerManager)
├─ Implement minimal code to pass tests
├─ Verify: npm run build, npm run lint, npm test

PHASE 3: Webview Integration
├─ Update message types in useExtensionMessages.ts
├─ Implement UI component (avoid logic)
├─ Verify: npm run build (webview-ui), npm test

PHASE 4: Integration Testing
├─ Write end-to-end test scenario
├─ Test in Extension Dev Host (F5)
├─ Verify: all tests pass, no regressions

PHASE 5: Documentation
├─ Update copilot-instructions.md if architectural change
├─ Add inline comments for complex logic (WHY not WHAT)
├─ Update TESTS.md if test patterns changed
```

---

## When Something Breaks

1. **Identify the layer**: extension backend (src/) or webview (webview-ui/)?
2. **Copy error message** to new test or trace with console.log()
3. **Run isolated test**: `npm test -- --testNamePattern="exact test name"`
4. **Check recent changes**: did you modify constants? types? message protocol?
5. **Build vs. Runtime**: is it a TypeScript error (build) or runtime error?
   - Build errors: easier to fix (usually type mismatch)
   - Runtime errors: trace the message → handler → state update flow

---

## Files You'll Modify Most Often

| File | Why | Frequency |
|---|---|---|
| `src/constants.ts` | Timing, thresholds, prefixes | Weekly |
| `src/types.ts` | Agent state shape, message types | Monthly |
| `src/activityDetector.ts` | Platform event detection | Per-platform |
| `webview-ui/src/office/toolUtils.ts` | Status → animation mapping | When adding tools |
| `webview-ui/src/constants.ts` | Render timing, grid, zoom | Weekly |
| `TESTS.md` | Test documentation | When adding tests |

---

## Reference Documents

- **copilot-instructions.md** — Complete architectural reference (read before major work)
- **TESTS.md** — Test strategy, patterns, and command reference
- **MIGRATION-PLAN.md** — Historical reference (architecture evolution)
- **CLAUDE.md** — Historical reference (deprecated legacy architecture)
- **README.md** — User-facing features and setup
- **package.json** — Dependencies, scripts, extension manifest

---

## Key Gotchas

1. **localStorage persists across reloads** — debug flags, tokens, settings stick. Clear with `localStorage.clear()` if needed.
2. **WebviewViewProvider is NOT WebviewPanel** — this extension uses sidebar panels, not floating windows.
3. **postMessage is fire-and-forget** — can't await responses; listen for corresponding messages instead.
4. **File paths need normalization** — always use `path.normalize()` on Windows.
5. **CSS variables are shared** — check `webview-ui/src/index.css` `:root` before adding new styles.
6. **vscode mock must be complete** — if test fails with "not a function", add listener to `src/__mocks__/vscode.ts`.

---

## When Adding a New Agent Platform

Follow this checklist (from copilot-instructions.md):
1. Read MIGRATION-PLAN.md (case study)
2. Create `src/<platform>ActivityDetector.ts` (use `activityDetector.ts` as template)
3. Update `src/agentManager.ts` (platform launcher logic)
4. Map tools in `webview-ui/src/office/toolUtils.ts` — only `STATUS_TO_TOOL` needs update
5. Follow phase gates: Phase 1 (launch) → Phase 2 (activity) → Phase 3 (messages) → Phase 4+ (polish)
6. Test each phase before moving to next

---

**Last Updated**: March 9, 2026  
**Test Suite**: 62/62 passing ✅  
**Architecture**: Backend ↔ Rendering separation enforced
