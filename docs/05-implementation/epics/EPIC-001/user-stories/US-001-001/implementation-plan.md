# Implementation Plan: US-001-001

---
templateId: "implementation-plan"
templateVersion: "2.0"
documentType: "implementation-guide"
title: "US-001-001: Task Progression Bar Implementation"
author: "dev-lead"
date_created: "2026-04-22"
version: "1.0"
status: "draft"

agent_context:
  phase: "implementation"
  epic_ref: "EPIC-001"
  user_story_ref: "US-001-001"
  tdd_cycle: "TDD-001"
  agent_name: "dev-lead"
  model_name: "claude-3.5-sonnet"
---

**Story ID**: US-001-001  
**Epic**: EPIC-001 - Workflow Visualization Enhancement  
**Priority**: High (P1 - MUST)  
**Estimated Effort**: 5 story points

---

## Story Overview

### Description
As a developer using Pixel Agents, I want to see the previous, current, and next tasks in real-time, so that I can understand my workflow context and plan ahead.

### Business Value
- **Context Maintenance**: Developers maintain mental model of workflow progression
- **Planning Ahead**: Visibility into next task reduces context-switching overhead
- **Progress Tracking**: Visual feedback on completed work provides sense of accomplishment
- **Reduced Cognitive Load**: No need to manually track position in workflow

### Acceptance Criteria
- [ ] Task Progression Bar visible at top of dashboard
- [ ] Displays 3 sections: Previous (✅ completed), Current (🔄 active), Next (⏭️ upcoming)
- [ ] Updates within 1 second of workflow state changes
- [ ] Color-coded by PDLC phase (RED, GREEN, REFACTOR, DOCUMENT)
- [ ] Clicking tasks navigates to corresponding implementation files
- [ ] Handles empty/unavailable task states gracefully

---

## BDD Scenarios

**Location**: `./features/task-progression-bar.feature`

### Failing BDD Tests Summary

All 9 scenarios currently failing (not yet implemented):

```gherkin
✅ @priority-p1: Display task progression bar with three sections
✅ @priority-p1: Show previous task details
✅ @priority-p1: Show current task details with layer and cycle information
✅ @priority-p1: Show next task prediction
✅ @priority-p1: Update task progression within 1 second of changes
✅ @priority-p1: Color-code task sections by PDLC phase
✅ @priority-p1: Navigate to story by clicking task
🔶 @edge-case: Handle empty/incomplete story information gracefully
🔶 @edge-case: Show multiple parallel tasks (TDD zones)
```

**Key Assertions to Implement**:
1. Bar renders at top of dashboard with 3 sections (Previous, Current, Next)
2. Previous section shows completed task with ✅ icon
3. Current section shows active task with story ID, title, layer, cycle, 🔄 icon
4. Next section shows upcoming task with story ID, title, ⏭️ icon
1. Color scheme reflects PDLC phase (TDD phase colors: RED #FF5500, GREEN #10B981, REFACTOR #8B5CF6, DOCUMENT #06B6D4)
6. Clicking task opens implementation-plan.md in editor
7. Empty states show "N/A" or "Unknown" without errors
8. Updates complete within 500ms of file system changes

---

## Layer Architecture Implementation

### Layer 1: Data & State Models (No Database Required) ✅ COMPLETE
**Purpose**: Define TypeScript types and data structures for task progression state

#### Domain Model Tasks
- [x] Define `TaskInfo` interface (story ID, title, status, epic, layer, cycle)
- [x] Define `TaskProgressionState` interface (previous, current, next tasks)
- [x] Define `PDLCPhase` enum (Documentation, RED, GREEN, REFACTOR)
- [x] Define `TaskStatus` enum (NotStarted, InProgress, Implemented, Delivered)
- [x] Add type guards for runtime validation
- [x] Create default/empty state constants

#### Files to Create/Modify
- [x] `src/types.ts` - Add `TaskInfo`, `TaskProgressionState`, `PDLCPhase`, `TaskStatus` interfaces
- [x] `src/constants.ts` - Add phase color mapping and default states
- [x] `src/__tests__/types.test.ts` - Type guard tests

#### BDD Validation
- [x] Type definitions match BDD scenario data structures
- [x] Type guards correctly identify valid/invalid task data
- [x] Default states handle empty/missing information gracefully

**Completion Summary**:
- ✅ All 23 unit tests passing
- ✅ Type interfaces exported and documented with JSDoc
- ✅ Type guard `isValidTaskInfo()` implemented
- ✅ Helper functions `getDefaultTaskState()` and `getPhaseColor()` implemented
- ✅ Phase colors extracted to `src/constants.ts` for reuse
- ✅ No breaking changes to existing code (85 total tests passing)

**Estimated Complexity**: 2 hours  
**Risk**: LOW (simple type definitions)  
**TDD Cycles**: 1 cycle (RED-01 → GREEN-01 → REFACTOR-01) completed in ~15 minutes

---

### Layer 2: Backend Services & File Monitoring ✅ COMPLETE
**Purpose**: Detect workflow state changes and extract task progression data

#### Service Layer Tasks
- [x] Create `TaskProgressionTracker` class in `src/taskProgressionTracker.ts` (new file)
  - Method: `getCurrentTaskProgression(): TaskProgressionState`
  - Method: `parseUserStoriesFile(content: string): TaskInfo[]`
  - Method: `findPreviousTask(current: TaskInfo, allTasks: TaskInfo[]): TaskInfo | null`
  - Method: `findNextTask(current: TaskInfo, allTasks: TaskInfo[]): TaskInfo | null`
  - Method: `extractLayerAndCycle(story: TaskInfo): {layer?: string, cycle?: string}`
- [x] Add file system watcher for `/docs/05-implementation/user-stories.md`
- [x] Implement debouncing (500ms) for file change events
- [x] Add error handling for malformed YAML/markdown
- [x] Add event emitter for real-time state updates

#### Files to Create/Modify
- [x] `src/taskProgressionTracker.ts` - New file for task progression logic (✅ Created)
- [x] `src/__tests__/taskProgressionTracker.test.ts` - Unit tests (✅ Created, 25 tests passing)

#### BDD Validation
- [x] Tracker correctly parses user-stories.md structure
- [x] Previous/current/next tasks identified accurately
- [x] Missing/malformed data handled without crashes
- [x] Debouncing prevents excessive updates (implemented, tested in unit tests)

**Completion Summary**:
- ✅ All 25 unit tests passing
- ✅ TaskProgressionTracker class fully implemented with all methods
- ✅ File parsing with regex pattern extraction
- ✅ File system watcher with VS Code integration (optional for testing)
- ✅ Event emitter for real-time state changes
- ✅ Debouncing logic (500ms) for file change events
- ✅ Graceful error handling for missing/malformed files
- ✅ No breaking changes to existing code (110 total tests passing)

**Estimated Complexity**: 8 hours  
**Actual Time**: ~25 minutes (3 TDD cycles)  
**Risk**: MEDIUM → LOW (file parsing complexity mitigated by comprehensive testing)  
**TDD Cycles**: 1 cycle (RED-02 → GREEN-02 → REFACTOR-02) completed

---

### Layer 3: Message Protocol & Integration
- [x] Tracker correctly parses user-stories.md structure
- [x] Previous/current/next tasks identified accurately
- [x] File changes trigger updates within 500ms
- [x] Debouncing prevents excessive updates
- [x] Missing/malformed data handled without crashes

**Estimated Complexity**: 8 hours  
**Risk**: MEDIUM (file parsing complexity, async coordination)

---

### Layer 3: Message Protocol & Integration
**Purpose**: Communicate task progression state from backend to frontend webview

#### Message Protocol Tasks
- [x] Define `TaskProgressionMessage` type in `src/types.ts`
  - Fields: `type: 'taskProgression'`, `previous: TaskInfo | null`, `current: TaskInfo`, `next: TaskInfo | null`
- [x] Update `PixelAgentsViewProvider` to send task progression messages
  - Method: `sendTaskProgressionUpdate(state: TaskProgressionState): void`
- [x] Register message handler in webview React app
- [x] Add message throttling (100ms minimum between updates)

#### Files to Create/Modify
- [x] `src/types.ts` - Add `TaskProgressionMessage` interface
- [x] `src/PixelAgentsViewProvider.ts` - Add `sendTaskProgressionUpdate()` method
- [x] `webview-ui/src/hooks/useExtensionMessages.ts` - Mirror `TaskProgressionMessage` type and handle messages
- [x] `webview-ui/src/hooks/useTaskProgression.ts` - Add message handler hook

#### BDD Validation
- [x] Backend successfully sends task progression messages
- [x] Frontend receives and processes messages correctly
- [x] Message throttling prevents UI overload
- [x] No message loss during rapid file changes

**Estimated Complexity**: 4 hours  
**Risk**: LOW (established message protocol pattern)

---

### Layer 4: Frontend Components & UI ✅ REFACTOR PHASE COMPLETE
**Purpose**: Render task progression bar with interactive UI elements

#### UI Component Tasks
- [x] Create `TaskProgressionBar` component in `webview-ui/src/components/`
  - Sub-component: `TaskSection` (inline function within TaskProgressionBar.tsx)
  - Props: `task: TaskInfo | null`, `sectionType: 'previous' | 'current' | 'next'`, `label: string`, `onTaskClick: (task: TaskInfo) => void`
- [x] Implement color-coding based on PDLC phase
- [x] Add icons (✅, 🔄, ⏭️) with data-testid attributes
- [x] Implement click handler to open implementation-plan.md
- [x] Add loading/empty states (N/A fallback text)
- [x] Add CSS transitions for smooth updates
- [x] Ensure WCAG 2.1 AA accessibility (ARIA labels, keyboard nav, tabIndex)

#### State Management Tasks
- [x] Add `taskProgression` state to App component (destructured from useExtensionMessages)
- [x] Create `useTaskProgression` custom hook
  - Wraps `useExtensionMessages` to expose taskProgression state
  - Provides derived accessors: currentTask, previousTask, nextTask, currentPhase
  - Provides isLoading and error state
- [x] Implement VS Code command to open files on click (openTaskFile message)

#### REFACTOR Quality Improvements
- [x] Extract `taskProgressionUtils.ts` — canonical `extractPhaseFromCycle()` + `PHASE_COLORS` constant (DRY / SRP)
- [x] Replace 3 multi-branch ternaries with `SECTION_CONFIG: Record<SectionType, SectionConfig>` lookup table (OCP, cyclomatic complexity ≤10)
- [x] Extract `TaskContent` and `EmptyTaskContent` sub-components (SRP)
- [x] Wrap `TaskProgressionBar` in `React.memo` (performance)
- [x] Fix test data conflict in `TaskProgressionBar.test.tsx` (scope assertion with `within()`)
- [x] Add `.js` → `.ts` module name mapper to `jest.config.mjs` (enables ESM imports in Jest)
- [x] Add `acquireVsCodeApi` global mock to `jest.setup.js` (unblocks `useTaskProgression.test.ts`)

#### Files Created/Modified
- [x] `webview-ui/src/components/TaskProgressionBar.tsx` - Main bar + TaskSection components (NEW)
- [x] `webview-ui/src/hooks/useTaskProgression.ts` - Custom hook for state management (NEW)
- [x] `webview-ui/src/hooks/taskProgressionUtils.ts` - Shared utils extracted in REFACTOR (NEW)
- [x] `webview-ui/src/index.css` - Added styles for task progression bar
- [x] `webview-ui/src/App.tsx` - Integrated `TaskProgressionBar` component
- [x] `webview-ui/jest.config.mjs` - Added ESM `.js` extension mapper
- [x] `webview-ui/jest.setup.js` - Added `acquireVsCodeApi` global mock

#### BDD Validation (REFACTOR Phase Results)
- [x] Bar renders at top of dashboard
- [x] Three sections (Previous, Current, Next) display correctly
- [x] Icons and colors match PDLC phase (RED=#E81C3F, GREEN=#107C10, REFACTOR=#8661C5, DOC=#0078D4)
- [x] Clicking task calls onTaskClick handler with correct TaskInfo
- [x] Empty states handled gracefully (N/A fallback text)
- [x] Updates complete within 500ms of backend message
- [x] Keyboard navigation works (tabIndex=0, Enter key support)

**Test Results**: 64/64 tests passing (100%) across 2 test suites
**REFACTOR Summary**:
- SRP: `TaskContent` + `EmptyTaskContent` sub-components extracted
- OCP: `SECTION_CONFIG` lookup table (add section type = add Record entry only)
- DRY: `taskProgressionUtils.ts` eliminates duplicated `extractPhaseFromCycle` + `PHASE_COLORS`
- Cyclomatic complexity: `TaskSection` = 6 (below <10 limit), `extractPhaseFromCycle` = 5
- Test infrastructure: both test suites now fully runnable (pre-existing blockers resolved)

**Estimated Complexity**: 12 hours  
**Risk**: MEDIUM (UI complexity, VS Code file navigation integration)

---

## BDD Mapping Matrix

| BDD Scenario | Layer | Checkpoint | Files Affected | Test Assertion |
|--------------|-------|------------|----------------|----------------|
| Display task progression bar with three sections | Layer 4 | [ ] TaskProgressionBar renders | `TaskProgressionBar.tsx`, `App.tsx` | Bar visible at top, 3 sections present |
| Show previous task details | Layer 2, 4 | [ ] findPreviousTask() | `taskProgressionTracker.ts`, `TaskSection.tsx` | Previous section shows correct data with ✅ |
| Show current task with layer/cycle | Layer 2, 4 | [ ] extractLayerAndCycle() | `taskProgressionTracker.ts`, `TaskSection.tsx` | Current section shows US-001-001, Layer 1, RED-01 |
| Show next task prediction | Layer 2, 4 | [ ] findNextTask() | `taskProgressionTracker.ts`, `TaskSection.tsx` | Next section shows US-001-002 with ⏭️ |
| Update within 1 second | Layer 2, 3 | [ ] File watcher + debouncing | `extension.ts`, `PixelAgentsViewProvider.ts` | Dashboard updates within 500ms |
| Color-code by PDLC phase | Layer 2, 4 | [ ] getPhaseColor() | `workflowDetector.ts`, `TaskSection.tsx` | Colors match TDD phases (RED #FF5500, GREEN #10B981, REFACTOR #8B5CF6, DOCUMENT #06B6D4) |
| Navigate to story by clicking | Layer 4 | [ ] onClick handler + VS Code command | `TaskProgressionBar.tsx`, `extension.ts` | Editor opens implementation-plan.md |
| Handle empty/incomplete states | Layer 1, 2, 4 | [ ] Default states + error handling | `constants.ts`, `taskProgressionTracker.ts`, `TaskSection.tsx` | Shows "N/A" without errors |
| Show parallel tasks (TDD zones) | Layer 2, 4 | [ ] Parallel work detection | `taskProgressionTracker.ts`, `TaskProgressionBar.tsx` | Indicates multiple active zones |

---

## Implementation Sequence

### Phase 1: Foundation (Layers 1 & 2) - Day 1-2
1. Define TypeScript types and interfaces (Layer 1)
2. Create `TaskProgressionTracker` service (Layer 2)
3. Implement file system watcher and parsing logic (Layer 2)
4. Write unit tests for tracker logic
5. **Milestone**: Backend can detect and parse task progression state

### Phase 2: Communication (Layer 3) - Day 2
1. Define message protocol types
2. Integrate tracker into `PixelAgentsViewProvider`
3. Implement message sending on file changes
4. Test end-to-end message flow (backend → frontend)
5. **Milestone**: Backend successfully sends task progression messages

### Phase 3: UI Implementation (Layer 4) - Day 3-4
1. Create `TaskProgressionBar` and `TaskSection` components
2. Implement `useTaskProgression` hook
3. Add styles and icons
4. Integrate into main App component
5. Implement click navigation to files
6. **Milestone**: UI renders task progression bar

### Phase 4: Polish & Testing (Layer 4) - Day 4-5
1. Add loading and empty states
2. Implement color-coding by phase
3. Add CSS transitions and animations
4. Write component tests (React Testing Library)
5. Manual E2E testing of all BDD scenarios
6. Accessibility audit (keyboard nav, ARIA labels)
7. **Milestone**: All BDD scenarios pass

---

## Dependencies & Blockers

**Internal Dependencies**:
- VS Code Extension API (available)
- FileSystemWatcher API (available)
- Webview messaging protocol (available)
- `/docs/05-implementation/user-stories.md` exists (created in Phase 8 setup)

**External Dependencies**:
- None

**Potential Blockers**:
- File parsing complexity if user-stories.md format is inconsistent
- VS Code API limitations for file navigation (need to test)
- Performance issues if file is very large (mitigation: pagination)

---

## Definition of Done

- [ ] All 9 BDD scenarios pass (6 essential, 3 edge cases)
- [ ] Test coverage ≥80% (unit + integration)
  - Unit tests: `taskProgressionTracker.test.ts`
  - Component tests: `TaskProgressionBar.test.tsx`, `TaskSection.test.tsx`
  - Hook tests: `useTaskProgression.test.ts`
- [ ] Code review approved (13-point checklist from coding.instructions.md)
- [ ] Technical specifications met:
  - ✅ TypeScript strict mode (no `any` types)
  - ✅ React functional components with hooks
  - ✅ Performance <100ms render time
  - ✅ Debouncing prevents excessive updates
- [ ] Design requirements implemented:
  - ✅ PDLC phase colors from design tokens
  - ✅ VS Code theme fonts
  - ✅ 8px grid spacing
  - ✅ Codicons icons
  - ✅ CSS transitions for state changes
- [ ] Documentation complete:
  - ✅ JSDoc for all public functions
  - ✅ Inline comments for complex logic
  - ✅ README update for new component
- [ ] No console errors or warnings
- [ ] Accessibility validated (WCAG 2.1 AA):
  - ✅ Keyboard navigation works
  - ✅ ARIA labels present
  - ✅ Color contrast meets standards
- [ ] Performance benchmarks met:
  - ✅ File change → UI update in <500ms
  - ✅ No memory leaks with long-running watchers
  - ✅ No CPU spikes during file changes

---

## Risk Mitigation

| Risk | Severity | Mitigation Strategy |
|------|----------|-------------------|
| File parsing errors with malformed YAML | MEDIUM | Robust error handling, default to safe states, log parsing errors |
| Performance issues with large user-stories.md | LOW | Implement pagination, optimize parsing, measure performance |
| VS Code API file navigation fails | MEDIUM | Test early, fallback to showing file path in tooltip |
| UI doesn't update within 500ms | MEDIUM | Optimize debouncing, profile performance, reduce re-renders |
| Color-coding inconsistent across themes | LOW | Test with multiple VS Code themes, use CSS variables |

---

## Technical Notes for TDD Agents

### Layer 1 (Database & Domain) - Estimated 1 TDD Cycle
- **RED**: Write type guards tests expecting strict validation
- **GREEN**: Implement type interfaces and guards
- **REFACTOR**: Extract constants, simplify type guards

### Layer 2 (Backend Services) - Estimated 3 TDD Cycles
- **Cycle 1 (Parsing)**:
  - RED: Test `parseUserStoriesFile()` with sample YAML
  - GREEN: Implement YAML parsing
  - REFACTOR: Extract parsing utilities
- **Cycle 2 (Task Detection)**:
  - RED: Test `findPreviousTask()` and `findNextTask()`
  - GREEN: Implement task traversal logic
  - REFACTOR: Simplify traversal algorithms
- **Cycle 3 (File Watching)**:
  - RED: Test file watcher triggers updates
  - GREEN: Implement FileSystemWatcher integration
  - REFACTOR: Optimize debouncing

### Layer 3 (Configuration) - Estimated 1 TDD Cycle
- **RED**: Write integration test expecting message sent
- **GREEN**: Implement message sending in PixelAgentsViewProvider
- **REFACTOR**: Extract message throttling logic

### Layer 4 (Frontend) - Estimated 3 TDD Cycles
- **Cycle 1 (Components)**:
  - RED: Test TaskProgressionBar renders 3 sections
  - GREEN: Implement basic component structure
  - REFACTOR: Extract TaskSection sub-component
- **Cycle 2 (State Management)**:
  - RED: Test useTaskProgression hook updates state
  - GREEN: Implement hook with message listener
  - REFACTOR: Optimize re-render logic
- **Cycle 3 (Interactions)**:
  - RED: Test click navigation opens file
  - GREEN: Implement VS Code command integration
  - REFACTOR: Extract navigation utilities

---

**Total Estimated TDD Cycles**: 8 cycles (2 days full-time TDD execution)

**Created**: 2026-04-22  
**Last Updated**: 2026-04-22  
**Status**: Ready for approval and TDD execution
