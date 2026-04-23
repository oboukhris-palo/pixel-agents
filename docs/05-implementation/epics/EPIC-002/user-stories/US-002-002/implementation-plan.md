# Implementation Plan: US-002-002 - Completeness Meter

**Story**: US-002-002 - Completeness Meter with Project Progress Tracking  
**Epic**: EPIC-002 - Context & Task Management  
**Total Estimated Effort**: 6 story points (~20-24 hours over 4 days)  
**TDD Cycles**: Estimated 10 cycles (2-3 per layer)  
**Plan Version**: v1  
**Created**: 2026-04-23  
**Status**: ⏳ Awaiting Approval

---

## Architecture Overview

**4-Layer Implementation** (Foundation → Communication → Presentation):
1. **Layer 1**: Metrics types and calculation utilities (domain model)
2. **Layer 2**: Completeness calculator service (parses user-stories.md)
3. **Layer 3**: Message protocol and React hook (communication)
4. **Layer 4**: Completeness Meter component + milestone celebrations (UI)

**Dependencies**:
- US-001-003 (Document Watcher) ✅ Complete - monitors `/docs/05-implementation/`
- Data source: `/docs/05-implementation/user-stories.md` (SSOT for story status)

---

## Layer 1: Metrics Types & Calculation Utilities (Domain Model)

**Purpose**: Define project metrics types, completion logic, and milestone thresholds

**Files to Create** (~80-120 lines total):
- `src/completenessTypes.ts` - Metrics type definitions, calculation logic
- `src/completenessTypes.test.ts` - Type validation and calculation tests

**BDD Coverage**:
- Scenario 1: Display completeness percentage
- Scenario 2: Show key project metrics
- Scenario 9: Show breakdown by epic and layer

**Key Types & Functions**:
```typescript
interface ProjectMetrics {
  completionPercentage: number;  // 0-100%
  storiesTotal: number;
  storiesCompleted: number;
  testsTotal: number;
  testsPassing: number;
  codeCoverage: number;  // 0-100%
  linesOfCode: number;
  milestones: MilestoneStatus[];
}

interface MilestoneStatus {
  threshold: 25 | 50 | 75 | 100;
  reached: boolean;
  reachedAt?: Date;
  celebrated: boolean;  // Prevents duplicate celebrations
}

function calculateCompletionPercentage(metrics: ProjectMetrics): number;
function checkMilestoneReached(previousPercentage: number, currentPercentage: number): number | null;
function getMilestoneColor(milestone: number): string;  // Color progression
```

**Testing Strategy**:
- ✅ RED: Test completion percentage calculation (0%, 25%, 50%, 75%, 100%)
- ✅ RED: Test milestone detection logic (crossing thresholds)
- ✅ RED: Test milestone deduplication (no repeat celebrations)
- ✅ RED: Test metrics validation (totals consistency)
- ✅ GREEN: Implement calculation functions
- ✅ REFACTOR: Extract milestone logic, add immutability

**Acceptance Criteria Covered**:
- [x] AC2: Displays 0-100% progress
- [x] AC3: Shows key metrics (stories, tests, coverage, LOC)
- [x] AC5: Milestone celebrations at 25%, 50%, 75%, 100%
- [x] AC6: Breakdown by epic and layer

**Estimated Time**: 3-4 hours (1-2 TDD cycles)

---

## Layer 2: Completeness Calculator Service (Backend)

**Purpose**: Parse `/docs/05-implementation/user-stories.md` and calculate real-time project metrics

**Files to Create** (~250-350 lines total):
- `src/completenessCalculator.ts` - Service class with markdown parsing
- `src/completenessCalculator.test.ts` - Service integration tests

**BDD Coverage**:
- Scenario 3: Calculate completion from user-stories.md parsing
- Scenario 4: Update metrics within 500ms of file changes
- Scenario 10: Handle edge cases (empty project, all complete)

**Service Architecture**:
```typescript
class CompletenessCalculator {
  private currentMetrics: ProjectMetrics | null = null;
  private fileWatcher: FileSystemWatcher | null = null;
  
  constructor(
    private workspaceRoot: vscode.Uri,
    private outputChannel?: vscode.OutputChannel
  ) {}
  
  async calculateMetrics(): Promise<ProjectMetrics>;
  private parseUserStoriesFile(): Promise<StoryStatus[]>;
  private calculateStoriesMetrics(stories: StoryStatus[]): Partial<ProjectMetrics>;
  private calculateTestMetrics(): Promise<{ total: number; passing: number }>;
  private calculateCodeMetrics(): Promise<{ coverage: number; linesOfCode: number }>;
  
  startMonitoring(callback: (metrics: ProjectMetrics) => void): void;
  stopMonitoring(): void;
}
```

**Markdown Parsing Strategy**:
```
/docs/05-implementation/user-stories.md structure:
## Epic Progress Summary
| Epic ID | ... | Progress % |
## User Stories (per epic)
### US-XXX-XXX: Title
**Status**: Not Started / In Progress / Implemented / Delivered

Parsing logic:
1. Read file line by line
2. Extract status from `**Status**: <value>` pattern
3. Count total stories vs. Delivered/Implemented
4. Calculate: (Delivered + Implemented) / Total * 100
```

**Testing Strategy**:
- ✅ RED: Test markdown parsing extracts correct status
- ✅ RED: Test story count calculation (various states)
- ✅ RED: Test test metrics calculation (mock test results)
- ✅ RED: Test code metrics calculation (LOC, coverage)
- ✅ RED: Test file watcher triggers callback
- ✅ RED: Test debouncing (prevent update storms)
- ✅ RED: Test error handling (missing file, malformed markdown)
- ✅ GREEN: Implement completeness calculator service
- ✅ REFACTOR: Extract parsing logic, optimize for large files

**Key Implementation Details**:
- **Debouncing**: 500ms window to prevent excessive recalculations
- **Incremental Parsing**: Parse only changed sections if possible
- **Test Metrics**: Run `npm test -- --coverage` and parse output (or read coverage reports)
- **LOC Calculation**: Use `cloc` or simple line counting in `src/`
- **Error Handling**: Graceful fallback if file unreadable

**Acceptance Criteria Covered**:
- [x] AC1: Completeness Meter displays real-time data
- [x] AC3: Shows key metrics (stories, tests, coverage, LOC)
- [x] AC4: Calculates from /docs/05-implementation/user-stories.md
- [x] AC7: Updates within 500ms of changes

**Estimated Time**: 6-8 hours (3-4 TDD cycles)

---

## Layer 3: Message Protocol & React Hook (Communication)

**Purpose**: Bridge backend completeness calculator to frontend component

**Files to Create** (~120-180 lines total):
- `src/completenessMessageHandler.ts` - Message protocol for metrics updates
- `webview-ui/src/hooks/useCompleteness.ts` - React hook for metrics state
- `src/completenessMessageHandler.test.ts` - Integration tests

**BDD Coverage**:
- Scenario 4: Update metrics within 500ms
- Scenario 5-8: Milestone celebrations trigger correctly

**Message Protocol**:
```typescript
interface CompletenessMessage {
  type: 'completeness.metrics.update';
  data: {
    metrics: ProjectMetrics;
    milestoneReached?: number;  // 25, 50, 75, or 100
    timestamp: string;
  };
}

// React Hook
function useCompleteness() {
  const [metrics, setMetrics] = useState<ProjectMetrics | null>(null);
  const [milestoneReached, setMilestoneReached] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  
  return { metrics, milestoneReached, loading };
}
```

**Testing Strategy**:
- ✅ RED: Test message handler receives backend events
- ✅ RED: Test React hook subscribes to metrics updates
- ✅ RED: Test milestone detection triggers celebration
- ✅ RED: Test celebration deduplication (localStorage persistence)
- ✅ GREEN: Implement message handler and hook
- ✅ REFACTOR: Optimize re-renders, add cleanup logic

**Acceptance Criteria Covered**:
- [x] AC4: Calculates from backend (message protocol)
- [x] AC5: Milestone celebrations (message triggers)
- [x] AC7: Updates within 500ms (debounced)

**Estimated Time**: 3-4 hours (1-2 TDD cycles)

---

## Layer 4: Completeness Meter Component + Celebrations (UI)

**Purpose**: Visual component displaying project progress with milestone celebrations

**Files to Create** (~300-400 lines total):
- `webview-ui/src/components/CompletenessMeter.tsx` - Main component
- `webview-ui/src/components/MilestoneCelebration.tsx` - Celebration animation
- `webview-ui/src/components/CompletenessMeter.test.tsx` - Component tests
- `webview-ui/src/components/CompletenessMeter.module.css` - Styles

**BDD Coverage**:
- Scenario 1: Display completeness meter
- Scenario 2: Show key project metrics
- Scenario 5-8: Milestone celebrations (25%, 50%, 75%, 100%)
- Scenario 9: Show breakdown by epic/layer

**Component Architecture**:
```tsx
interface CompletenessMeterProps {
  metrics?: ProjectMetrics;
  onMilestoneReached?: (milestone: number) => void;
}

export function CompletenessMeter({ metrics, onMilestoneReached }: CompletenessMeterProps) {
  // Visual: Vertical progress bar on right side
  // Progress: Animated fill from 0-100%
  // Metrics: Tooltip or panel with detailed breakdown
  // Celebrations: Confetti animation on milestone reach
}

interface MilestoneCelebrationProps {
  milestone: 25 | 50 | 75 | 100;
  onComplete: () => void;
}

export function MilestoneCelebration({ milestone, onComplete }: MilestoneCelebrationProps) {
  // Animation: Confetti + trophy emoji (🎉, 🏆, ✨)
  // Duration: 2-3 seconds, then auto-dismiss
  // Sound: Optional chime (user-configurable)
}
```

**Testing Strategy** (120+ tests):
- ✅ RED: Test component renders with metrics data
- ✅ RED: Test progress bar displays correct percentage
- ✅ RED: Test metrics breakdown displays correctly
- ✅ RED: Test milestone celebration at 25%
- ✅ RED: Test milestone celebration at 50%
- ✅ RED: Test milestone celebration at 75%
- ✅ RED: Test milestone celebration at 100%
- ✅ RED: Test celebration doesn't repeat (localStorage check)
- ✅ RED: Test accessibility (ARIA labels, keyboard nav)
- ✅ RED: Test edge cases (0%, 100%, null data)
- ✅ GREEN: Implement CompletenessMeter + MilestoneCelebration
- ✅ REFACTOR: Extract sub-components, optimize animations

**Milestone Celebration Implementation**:
- **25% (🎉)**: Confetti animation (blue/green)
- **50% (🏅)**: Medal emoji + confetti (silver)
- **75% (⭐)**: Star burst animation (gold)
- **100% (🏆)**: Trophy + fireworks + fanfare (full celebration)

**Accessibility Requirements**:
- WCAG 2.1 AA compliant
- ARIA role="progressbar"
- ARIA label with percentage and metrics summary
- Keyboard navigation for metrics details
- Reduced motion support (disable animations if user preference set)

**Acceptance Criteria Covered**:
- [x] AC1: Completeness Meter visible on right side
- [x] AC2: Displays 0-100% progress bar
- [x] AC3: Shows key metrics
- [x] AC5: Milestone celebrations with visual effects
- [x] AC6: Breakdown details by epic/layer

**Estimated Time**: 8-10 hours (4-5 TDD cycles)

---

## TDD Cycle Summary

| Layer | RED Cycles | GREEN Cycles | REFACTOR Cycles | Total Hours |
|-------|-----------|-------------|-----------------|-------------|
| Layer 1 (Types) | 2 | 1 | 1 | 3-4h |
| Layer 2 (Backend) | 3 | 2 | 1 | 6-8h |
| Layer 3 (Protocol) | 1 | 1 | 1 | 3-4h |
| Layer 4 (UI) | 4 | 2 | 1 | 8-10h |
| **TOTAL** | **10** | **6** | **4** | **20-26h** |

**Expected Timeline**: 4 days (Day 1: L1-2, Day 2: L2, Day 3: L3-4, Day 4: L4 + code review)

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
- ✅ Performance validated (<500ms updates, handles 1000+ stories)
- ✅ Accessibility tested (WCAG 2.1 AA)
- ✅ No regressions (all existing tests passing)

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Markdown parsing fails with format variations | Robust parser with fallbacks, extensive edge case testing |
| Large file parsing slow (1000+ stories) | Incremental parsing, debouncing, optional Web Worker |
| Celebration animations block UI | CSS-only animations, non-blocking execution |
| Test/coverage metrics unavailable | Graceful fallback (show N/A or estimated values) |

---

## Implementation Notes for TDD Agents

### For dev-tdd-red
- Start with Layer 1 milestone logic (clear, testable)
- Write failing tests for markdown parsing with various formats
- Include edge cases (empty file, all stories complete, malformed markdown)

### For dev-tdd-green
- Implement minimal markdown parsing (regex patterns)
- Use simple line-by-line parsing first
- Defer optimization until REFACTOR

### For dev-tdd-refactor
- Extract parsing logic into reusable functions
- Optimize for large files (incremental parsing)
- Add comprehensive error handling
- Add JSDoc comments for public APIs

---

**Approval Required**: dev-lead must review and approve before TDD execution begins  
**Plan Status**: ⏳ Awaiting Approval → See `plan-approval.yaml`
