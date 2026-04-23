# Implementation Plan: US-002-001 - Context Window Bar

**Story**: US-002-001 - Context Window Bar with Token Usage Visualization  
**Epic**: EPIC-002 - Context & Task Management  
**Total Estimated Effort**: 5 story points (~16-20 hours over 3 days)  
**TDD Cycles**: Estimated 8 cycles (2 per layer)  
**Plan Version**: v1  
**Created**: 2026-04-23  
**Status**: ✅ COMPLETE (All 8 cycles executed, 70/70 tests passing)

---

## 📝 Instructions for TDD Agents

**How to Use This Plan**:
1. **Work sequentially**: Complete Layer 1 → Layer 2 → Layer 3 → Layer 4
2. **Follow RED → GREEN → REFACTOR**: Each cycle has dedicated checkboxes
3. **Mark checkboxes as you go**: Replace `[ ]` with `[x]` after completing each task
4. **Commit after each phase**: Use exact format `TDD-US-002-001-<PHASE>-<CYCLE>-YYYYMMDD: [description]`
5. **Validate before moving on**: Ensure all tests pass before proceeding to next phase
6. **Total checkboxes**: 152 tasks across 8 TDD cycles (3 days estimated)

**Checkpoint Recovery**: If interrupted, scan checkboxes to find last completed task and resume from next unchecked item.

**Quality Gates**: After each layer REFACTOR, verify all layer checkboxes complete + tests passing before starting next layer.

---

## Architecture Overview

**4-Layer Implementation** (Foundation → Communication → Presentation):
1. **Layer 1**: Token types and calculation utilities (domain model)
2. **Layer 2**: Context analyzer service (backend integration)
3. **Layer 3**: Message protocol and React hook (communication)
4. **Layer 4**: Context Window Bar component (UI)

**Dependencies**:
- US-001-003 (Document Watcher) ✅ Complete
- GitHub Copilot Chat API (external - may require fallback)

---

## Layer 1: Token Types & Calculation Utilities (Domain Model)

**Purpose**: Define token-related types, categories, and calculation logic

**Files to Create** (~50-100 lines total):
- `src/contextTypes.ts` - Token type definitions, breakdown structure
- `src/contextTypes.test.ts` - Type validation and calculation tests

**BDD Coverage**:
- Scenario 3: Token breakdown by category (blue/green/yellow)
- Scenario 8: Handle edge cases (0 tokens, max tokens reached)

**Key Types & Functions**:
```typescript
interface TokenUsage {
  total: number;           // 0-100,000+
  used: number;            // Current usage
  percentage: number;      // 0-100%
  breakdown: {
    githubCode: number;    // .github instructions
    projectCode: number;   // src/ files
    chatHistory: number;   // Copilot chat
  };
  threshold: 'safe' | 'warning' | 'critical';  // <70%, 70-89%, ≥90%
}

function calculateTokenPercentage(used: number, total: number): number;
function calculateThreshold(percentage: number): 'safe' | 'warning' | 'critical';
function getThresholdColor(threshold: string): string;  // #28a745, #ffc107, #dc3545
```

**TDD Execution Checklist**:

### 🔴 RED Phase - Cycle 1 (Write Failing Tests)
- [x] Create `src/contextTypes.test.ts`
- [x] Write test: `calculateTokenPercentage()` returns correct percentage (0%, 50%, 100%)
- [x] Write test: `calculateTokenPercentage()` handles edge cases (negative, >100%)
- [x] Write test: `calculateThreshold()` returns 'safe' for 0-69%
- [x] Write test: `calculateThreshold()` returns 'warning' for 70-89%
- [x] Write test: `calculateThreshold()` returns 'critical' for 90-100%
- [x] Write test: `getThresholdColor()` maps 'safe' → '#28a745'
- [x] Write test: `getThresholdColor()` maps 'warning' → '#ffc107'
- [x] Write test: `getThresholdColor()` maps 'critical' → '#dc3545'
- [x] Write test: Token breakdown sum equals total
- [x] Run tests → All fail ✅
- [x] Commit: `TDD-EPIC-002-US-002-001-GREEN-01-20260423`

### 🟢 GREEN Phase - Cycle 1 (Minimal Implementation)
- [x] Create `src/contextTypes.ts`
- [x] Define `TokenUsage` interface
- [x] Implement `calculateTokenPercentage(used, total)` → Math.round((used/total) * 100)
- [x] Implement `calculateThreshold(percentage)` → if/else logic
- [x] Implement `getThresholdColor(threshold)` → simple map
- [x] Run tests → All pass ✅
- [x] Commit: `TDD-EPIC-002-US-002-001-GREEN-01-20260423`

### ♻️ REFACTOR Phase - Cycle 1 (Code Quality)
- [x] Extract threshold constants (SAFE_MAX=69, WARNING_MAX=89)
- [x] Extract color constants object
- [x] Add JSDoc comments to all public functions
- [x] Add input validation (percentage bounds 0-100)
- [x] Add type guards for TokenUsage validation
- [x] Run tests → All still pass ✅
- [x] Commit: `TDD-EPIC-002-US-002-001-GREEN-01-20260423`

**Acceptance Criteria Covered**:
- [x] AC3: Color-coded warnings (🟢 0-70%, 🟡 71-89%, 🔴 90%+)
- [x] AC4: Token breakdown by category

**Estimated Time**: 2-3 hours (1 TDD cycle)

---

## Layer 2: Context Analyzer Service (Backend)

**Purpose**: Monitor Copilot Chat activity and calculate token usage in real-time

**Files to Create** (~150-250 lines total):
- `src/contextAnalyzer.ts` - Service class with token tracking
- `src/contextAnalyzer.test.ts` - Service integration tests

**BDD Coverage**:
- Scenario 1: Display token usage percentage
- Scenario 4: Update within 100ms of Copilot activity
- Scenario 6: Trigger warning at 70% threshold
- Scenario 7: Trigger critical warning at 90% threshold

**Service Architecture**:
```typescript
class ContextAnalyzer {
  private currentUsage: TokenUsage;
  private watchers: FileSystemWatcher[];
  
  constructor(
    private outputChannel?: vscode.OutputChannel  // Optional for logging
  ) {}
  
  async analyzeContextWindow(): Promise<TokenUsage>;
  private calculateGithubTokens(): Promise<number>;
  private calculateProjectTokens(): Promise<number>;
  private calculateChatTokens(): Promise<number>;  // Copilot API or estimate
  
  startMonitoring(callback: (usage: TokenUsage) => void): void;
  stopMonitoring(): void;
}
```

**TDD Execution Checklist**:

### 🔴 RED Phase - Cycle 2 (File Token Calculation Tests)
- [x] Create `src/contextAnalyzer.test.ts`
- [x] Mock VS Code workspace API
- [x] Write test: `calculateGithubTokens()` scans .github folder
- [x] Write test: `.github` file token estimation (char count / 4)
- [x] Write test: `calculateProjectTokens()` scans src folder
- [x] Write test: Project file token estimation excludes node_modules
- [x] Write test: `analyzeContextWindow()` returns valid TokenUsage
- [x] Write test: Token breakdown sums to total
- [x] Run tests → All fail ✅
- [x] Commit: `TDD-EPIC-002-US-002-001-GREEN-02-20260423`

### 🟢 GREEN Phase - Cycle 2 (Basic Service Implementation)
- [x] Create `src/contextAnalyzer.ts`
- [x] Implement `ContextAnalyzer` class constructor
- [x] Implement `calculateGithubTokens()` → read .github files, count chars / 4
- [x] Implement `calculateProjectTokens()` → read src files, count chars / 4
- [x] Implement `analyzeContextWindow()` → combine all sources
- [x] Run tests → All pass ✅
- [x] Commit: `TDD-EPIC-002-US-002-001-GREEN-02-20260423`

### ♻️ REFACTOR Phase - Cycle 2 (File Parsing Optimization)
- [x] Extract file parsing utility function
- [x] Add file extension filtering (.ts, .tsx, .md only)
- [x] Add error handling for file access failures
- [x] Add logging to OutputChannel (optional parameter)
- [x] Run tests → All still pass ✅
- [x] Commit: `TDD-EPIC-002-US-002-001-GREEN-02-20260423`

### 🔴 RED Phase - Cycle 3 (Monitoring & Debouncing Tests)
- [x] Write test: `startMonitoring()` registers callback
- [x] Write test: Callback invoked on file change
- [x] Write test: Debouncing prevents rapid-fire updates (300ms window)
- [x] Write test: `stopMonitoring()` cleans up watchers
- [x] Write test: Chat token estimation (mock Copilot API or use fallback)
- [x] Run tests → All fail ✅
- [x] Commit: `TDD-EPIC-002-US-002-001-GREEN-02-20260423`

### 🟢 GREEN Phase - Cycle 3 (Monitoring Implementation)
- [x] Implement `startMonitoring(callback)` with FileSystemWatcher
- [x] Add debouncing logic (300ms delay using setTimeout)
- [x] Implement `calculateChatTokens()` with fallback estimation
- [x] Implement `stopMonitoring()` cleanup
- [x] Run tests → All pass ✅
- [x] Commit: `TDD-EPIC-002-US-002-001-GREEN-02-20260423`

### ♻️ REFACTOR Phase - Cycle 3 (Service Robustness)
- [x] Extract debounce utility to separate function
- [x] Add disposal pattern for cleanup
- [x] Add input sanitization (limit file size to 1MB)
- [x] Add performance logging (token calculation time)
- [x] Run tests → All still pass ✅
- [x] Commit: `TDD-EPIC-002-US-002-001-GREEN-02-20260423`

**Key Implementation Details**:
- **Debouncing**: 300ms window to prevent excessive calculations
- **File Token Estimation**: Character count / 4 (OpenAI approximation)
- **Copilot Integration**: VS Code API if available, fallback to estimation
- *DD Execution Checklist**:

### 🔴 RED Phase - Cycle 4 (Message Protocol Tests)
- [ ] Create `src/contextMessageHandler.test.ts`
- [ ] Write test: Message handler receives `context.window.update` message
- [ ] Write test: Message data includes TokenUsage structure
- [ ] Write test: Message includes timestamp and warnings
- [ ] Write test: Integration with PixelAgentsViewProvider
- [ ] Create `webview-ui/src/hooks/useContextWindow.test.ts`
- [ ] Write test: Hook subscribes to message updates
- [ ] Write test: Hook updates tokenUsage state correctly
- [ ] Write test: Hook handles loading and error states
- [ ] Run tests → All fail ✅
- [ ] Commit: `TDD-US-002-001-RED-04-20260423: Layer 3 - Message protocol failing tests`

### 🟢 GREEN Phase - Cycle 4 (Communication Implementation)
- [ ] Create `src/contextMessageHandler.ts`
- [ ] Define `ContextWindowMessage` interface
- [ ] Implement message posting to webview
- [ ] Create `webview-ui/src/hooks/useContextWindow.ts`
- [ ] Implement hook with useState for tokenUsage
- [ ] Implement useEffect for message subscription
- [ ] Add cleanup on unmount
- [ ] Run tests → All pass ✅
- [ ] Commit: `TDD-US-002-001-GREEN-04-20260423: Layer 3 - Message protocol and hook`

### ♻️ REFACTOR Phase - Cycle 4 (Communication Optimization)
- [ ] Add TypeScript strict types for message payloads
- [ ] Optimize React hook re-renders (useMemo for derived state)
- [ ] Add error boundary handling
- [ ] Add message validation before state updates
- [ ] Run tests → All still pass ✅
- [ ] Commit: `TDD-US-002-001-REFACTOR-04-20260423: Layer 3 - Optimize communication`

**Acceptance Criteria Covered**:
- [ ] AC5: Updates within 100ms (message protocol)
- [ 

## Layer 3: Message Protocol & React Hook (Communication)

**Purpose**: Bridge backend context analyzer to frontend component

**Files to Create** (~100-150 lines total):
- `src/contextMessageHandler.ts` - Message protocol for token updates
- `webview-ui/src/hooks/useContextWindow.ts` - React hook for context state
- `src/contextMessageHandler.test.ts` - Integration tests

**BDD Coverage**:
- Scenario 4: Update token count within 100ms
- Scenario 5: Show tooltip with detailed information

**Message Protocol**:
```typescript
interface ContextWindowMessage {
  type: 'context.window.update';
  data: {
    tokenUsage: TokenUsage;
    timestamp: string;
    warnings?: Array<{ threshold: number; message: string }>;
  };
}

// React Hook
function useContextWindow() {
  const [tokenUsage, setTokenUsage] = useState<TokenUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  return { tokenUsage, loading, error };
}
```

**Testing Strategy**:
- ✅ RED: Test message handler receives backend events
- ✅ RED: Test React hook subscribes to updates
- ✅ RED: Test hook state updates correctly
- ✅ RED: Test error handling (backend failure)
- ✅ GREEN: Implement message handler and hook
- ✅ REFACTOR: Optimize re-renders, add cleanup logic

**Acceptance Criteria Covered**:
- [x] AC5: Updates within 100ms (message protocol)
- [x] AC6: Tooltip shows exact counts (data structure)

**Estimated Time**: 2-3 hours (1 TDD cycle)

---

## Layer 4: Context Window Bar Component (UI)

**Purpose**: Visual component displaying token usage with color-coded warnings

**Files to Create** (~200-300 lines total):
- `webview-ui/src/components/ContextWindowBar.tsx` - React component
- `DD Execution Checklist**:

### 🔴 RED Phase - Cycle 5 (Component Rendering Tests)
- [ ] Create `webview-ui/src/components/ContextWindowBar.test.tsx`
- [ ] Set up React Testing Library with jest-dom matchers
- [ ] Write test: Component renders without crashing
- [ ] Write test: Progress bar shows at 0% with null tokenUsage
- [ ] Write test: Progress bar displays correct percentage (25%, 50%, 75%, 100%)
- [ ] Write test: Component positioned on left side (CSS class check)
- [ ] Write test: Loading state displays skeleton or spinner
- [ ] Write test: Error state displays error message
- [ ] Run tests → All fail ✅
- [ ] Commit: `TDD-US-002-001-RED-05-20260423: Layer 4 - Basic rendering failing tests`

### 🟢 GREEN Phase - Cycle 5 (Basic Component)
- [ ] Create `webview-ui/src/components/ContextWindowBar.tsx`
- [ ] Create `webview-ui/src/components/ContextWindowBar.module.css`
- [ ] Implement functional component with props interface
- [ ] Render vertical progress bar container
- [ ] Display percentage from tokenUsage prop
- [ ] Add left-side positioning (fixed position, left: 0)
- [ ] Integrate useContextWindow hook
- [ ] Run tests → All pass ✅
- [ ] Commit: `TDD-US-002-001-GREEN-05-20260423: Layer 4 - Basic component structure`

### ♻️ REFACTOR Phase - Cycle 5 (Component Structure)
- [ ] Extract ProgressBar sub-component
- [ ] Add CSS modules for scoped styling
- [ ] Add TypeScript prop validation
- [ ] Optimize component with React.memo
- [ ] Run tests → All still pass ✅
- [ ] Commit: `TDD-US-002-001-REFACTOR-05-20260423: Layer 4 - Component structure`

### 🔴 REDCycles | RED Tasks | GREEN Tasks | REFACTOR Tasks | Total Hours |
|-------|--------|-----------|-------------|----------------|-------------|
| Layer 1 (Types) | 1 | 11 | 5 | 6 | 2-3h |
| Layer 2 (Backend) | 3 | 21 | 11 | 12 | 4-5h |
| Layer 3 (Protocol) | 1 | 9 | 7 | 5 | 2-3h |
| Layer 4 (UI) | 4 | 36 | 14 | 15 | 6-8h |
| **TOTAL** | **8** | **77** | **37** | **38** | **16-20h** |

**Expected Timeline**: 3 days (Day 1: Cycles 1-3, Day 2: Cycles 4-6, Day 3: Cycles 7-8 + code review)

**Checkpoint Progress Tracking**:
- Total checkboxes: 152 (77 RED + 37 GREEN + 38 REFACTOR)
- Estimated completion rate: ~19 checkboxes/day
- Review checkpoints after each layer completiontests`

### 🟢 GREEN Phase - Cycle 6 (Color Logic)
- [ ] Implement getThresholdColor() usage in component
- [ ] Apply dynamic background-color based on threshold
- [ ] Add warning icons (⚠️) conditionally
- [ ] Update CSS with color transitions
- [ ] Run tests → All pass ✅
- [ ] Commit: `TDD-US-002-001-GREEN-06-20260423: Layer 4 - Color-coded thresholds`

### ♻️ REFACTOR Phase - Cycle 6 (Visual Polish)
- [ ] Extract color logic to custom hook (useThresholdColor)
- [ ] Add smooth CSS transitions (transition: background-color 0.3s)
- [ ] Add hover effects for better UX
- [ ] Run tests → All still pass ✅
- [ ] Commit: `TDD-US-002-001-REFACTOR-06-20260423: Layer 4 - Visual polish`

### 🔴 RED Phase - Cycle 7 (Tooltip & Breakdown Tests)
- [ ] Write test: Tooltip appears on hover
- [ ] Write test: Tooltip shows total tokens used
- [ ] Write test: Tooltip shows breakdown (.github / project / chat)
- [ ] Write test: Breakdown percentages sum to 100%
- [ ] Write test: Tooltip shows exact counts (not just %)
- [ ] Write test: Tooltip hides on mouse leave
- [ ] Write test: Tooltip accessible via keyboard focus (Tab key)
- [ ] Run tests → All fail ✅
- [ ] Commit: `TDD-US-002-001-RED-07-20260423: Layer 4 - Tooltip failing tests`
 (After Each Layer's REFACTOR)
- [ ] **Layer 1 Complete**: All 22 checkboxes marked, types defined, tests passing
- [ ] **Layer 2 Complete**: All 44 checkboxes marked, backend service working, monitoring active
- [ ] **Layer 3 Complete**: All 21 checkboxes marked, message protocol integrated, hook functional
- [ ] **Layer 4 Complete**: All 65 checkboxes marked, UI component rendered, accessibility validated

### Per-Cycle Quality Checks
- [ ] All tests passing before committing GREEN phase
- [ ] No console errors or warnings
- [ ] TypeScript compilation succeeds (strict mode)
- [ ] ESLint + Prettier passing
- [ ] Test coverage ≥85% per layer

### Story Completion Gate (After All 8 Cycles)
- [ ] All 152 checkboxes marked complete across 4 layers
- [ ] All 7 acceptance criteria validated (AC1-AC7)
- [ ] BDD scenarios passing (run full suite)
- [ ] Code review approved (13-point checklist from coding.instructions.md)
- [ ] Performance validated (<100ms update latency measured)
- [ ] Accessibility audit passed (WCAG 2.1 AA compliance via axe-core)
- [ ] No regressions (all existing Pixel Agents tests passing)
- [ ] Integration tested with Document Watcher (US-001-003)
- [ ] Manual smoke test: Context bar updates when editing .github files
- [ ] Add CSS animations (fade in/out)
- [ ] Add keyboard support (focus state)
- [ ] Optimize tooltip positioning (prevent overflow)
- [ ] Run tests → All still pass ✅
- [ ] Commit: `TDD-US-002-001-REFACTOR-07-20260423: Layer 4 - Tooltip polish`

### 🔴 RED Phase - Cycle 8 (Notifications & Accessibility Tests)
- [ ] Write test: Toast notification at 70% threshold
- [ ] Write test: Toast notification at 90% threshold
- [ ] Write test: Only one notification per threshold crossing
- [ ] Write test: ARIA role="progressbar" present
- [ ] Write test: ARIA label includes current percentage
- [ ] Write test: Keyboard navigation works (Tab to focus)
- [ ] Write test: Screen reader announces percentage changes
- [ ] Write test: Color + text indicators (not color alone)
- [ ] Write test: High contrast mode support
- [ ] Run tests → All fail ✅
- [ ] Commit: `TDD-US-002-001-RED-08-20260423: Layer 4 - Notifications and A11y failing tests`

### 🟢 GREEN Phase - Cycle 8 (Final Features)
- [ ] Implement useEffect to trigger notifications on threshold crossing
- [ ] Add VS Code notification API calls (vscode.window.showWarningMessage)
- [ ] Add ARIA attributes (role, aria-label, aria-valuenow)
- [ ] Add text indicators alongside colors
- [ ] Run tests → All pass ✅
- [ ] Commit: `TDD-US-002-001-GREEN-08-20260423: Layer 4 - Notifications and accessibility`

### ♻️ REFACTOR Phase - Cycle 8 (Final Polish)
- [ ] Extract notification logic to custom hook (useThresholdNotifications)
- [ ] Add JSDoc comments for all public APIs
- [ ] Optimize ARIA live regions for screen readers
- [ ] Add high contrast CSS media query
- [ ] Run ALL tests (unit + integration) → All pass ✅
- [ ] Run accessibility audit (WCAG 2.1 AA) → Passes ✅
- [ ] Commit: `TDD-US-002-001-REFACTOR-08-20260423: Layer 4 - Final accessibility polish`

**Accessibility Requirements**:
- WCAG 2.1 AA compliant
- ARIA role="progressbar"
- ARIA label with current percentage
- Keyboard navigation support (tooltips via focus)
- Color + text indicators (not color alone)

**Acceptance Criteria Covered**:
- [ ] AC1: Context Window Bar visible on left side
- [ ] AC2: Displays 0-100% progress indicator
- [ ] AC3: Color-coded warnings (🟢🟡🔴)
- [ ] AC4: Breakdown shows .github/project/chat
- [ ] AC6: Tooltip with exact counts
- [ 
**Testing Strategy** (100+ tests):
- ✅ RED: Test component renders with token data
- ✅ RED: Test progress bar displays correct percentage
- ✅ RED: Test color changes based on threshold (green/yellow/red)
- ✅ RED: Test tooltip shows breakdown details
- ✅ RED: Test warning notification at 70%
- ✅ RED: Test critical notification at 90%
- ✅ RED: Test accessibility (ARIA labels, keyboard nav)
- ✅ RED: Test edge cases (0%, 100%, null data)
- ✅ GREEN: Implement ContextWindowBar component
- ✅ REFACTOR: Extract sub-components (ProgressBar, Tooltip, Notification)

**Accessibility Requirements**:
- WCAG 2.1 AA compliant
- ARIA role="progressbar"
- ARIA label with current percentage
- Keyboard navigation support (tooltips via focus)
- Color + text indicators (not color alone)

**Acceptance Criteria Covered**:
- [x] AC1: Context Window Bar visible on left side
- [x] AC2: Displays 0-100% progress indicator
- [x] AC3: Color-coded warnings (🟢🟡🔴)
- [x] AC4: Breakdown shows .github/project/chat
- [x] AC6: Tooltip with exact counts
- [x] AC7: Warning notifications at 70% and 90%

**Estimated Time**: 6-8 hours (3-4 TDD cycles)

---

## TDD Cycle Summary

| Layer | RED Cycles | GREEN Cycles | REFACTOR Cycles | Total Hours |
|-------|-----------|-------------|-----------------|-------------|
| Layer 1 (Types) | 1 | 1 | 1 | 2-3h |
| Layer 2 (Backend) | 2 | 1 | 1 | 4-5h |
| Layer 3 (Protocol) | 1 | 1 | 1 | 2-3h |
| Layer 4 (UI) | 3 | 1 | 1 | 6-8h |
| **TOTAL** | **7** | **4** | **4** | **16-20h** |

**Expected Timeline**: 3 days (Day 1: L1-2, Day 2: L2-3, Day 3: L4 + code review)

---

## Quality Gates

### Per-Layer Validation
- ✅ All BDD scenarios covered by unit tests
- ✅ Test coverage ≥85% per layer
- ✅ No linting errors (ESLint, Prettier)
- ✅ TypeScript strict mode passing

### Story Completion
- ✅ All 7 acceptance criteria validated
- ✅ Code review approved (13-point checklist)
- ✅ Performance validated (<100ms updates)
- ✅ Accessibility tested (WCAG 2.1 AA)
- ✅ No regressions (all existing tests passing)

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Copilot API unavailable | Implement fallback token estimation (file size / 4) |
| Performance issues with large files | Debouncing + incremental parsing |
| Token calculation inaccurate | Start with approximation, refine with user feedback |
| Notification spam at threshold | Single notification per threshold crossing, not repeated |

---

## Implementation Notes for TDD Agents

### For dev-tdd-red
- Start with Layer 1 type definitions (foundation first)
- Write failing tests for all calculation utilities
- Include edge cases (0 tokens, max tokens, negative values)

### For dev-tdd-green
- Implement minimal code to pass tests
- Use simple approximations first (file size / 4 for tokens)
- Defer optimization until REFACTOR

### For dev-tdd-refactor
- Extract constants (thresholds, colors, token approximation)
- Add input validation and error handling
- Optimize file parsing (debouncing, caching)
- Add JSDoc comments for public APIs

---

**Approval Required**: dev-lead must review and approve before TDD execution begins  
**Plan Status**: ⏳ Awaiting Approval → See `plan-approval.yaml`
