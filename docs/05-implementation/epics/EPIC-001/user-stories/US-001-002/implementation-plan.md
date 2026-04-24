---
story_id: US-001-002
epic_id: EPIC-001
version: 1.0
status: APPROVED
created: 2026-04-23
approved_by: dev-lead (Sebastian)
approval_date: 2026-04-23 
---

# Implementation Plan: Real-Time Agent Activity Monitor with Code Snippets

**Version**: 1.0 (Initial)  
**Status**: DRAFT - Awaiting Human Validation  
**Epic**: EPIC-001: Dashboard Monitoring & Visualization  
**Story Points**: 8  
**Priority**: HIGH

---

## Implementation Overview

This story implements real-time code snippet visualization as the active agent writes code during TDD execution. The component subscribes to agent.activity.ts broadcasts and displays code with syntax highlighting, action metadata, and status indicators. Architecture mirrors US-001-001 pattern: Domain types → Service broadcaster → Message protocol → UI component with animations.

**Key Pattern Reuse**: ActionBubbleMessage type mirrors TaskProgressionMessage; useAgentActivity hook mirrors useTaskProgression; ActionBubble component mirrors TaskProgressionBar structure using React.memo + shared utils.

---

## Architecture Pattern (design-systems.md v2.0.0)

- **Pattern**: Layered Architecture (Domain → Service → Protocol → UI)
- **Design System**: Palo IT branding with VS Code dark theme integration
- **Agent Sidebar**: 180px width × 246px height, bg #252526, agent rows 28px with 8px status dots
- **Action Bubble**: 80×18px, bg #1E1E1E @ 90%, border: 1px agent color @ 50%, border-radius: 4px, 8px text
- **Agent Status Colors**: Active (#2ECC71 pulse), Thinking (#F39C12 blink), Idle (#6B7280), Error (#E74C3C)
- **Typography**: 9-level scale (--text-mini 8px for canvas labels, --text-caption 10px for agent names, --text-body-sm 11px for sidebar)
- **Virtual Scrolling**: ROW_HEIGHT = 28px for 10+ agent lists (performance optimization)
- **BDD-Driven**: Implementation follows BDD scenarios from `docs/05-implementation/epics/EPIC-001/user-stories/US-001-002/features/`
- **TDD Cycles**: Each layer implemented via RED → GREEN → REFACTOR
- **Message-Based**: agentActivityMonitor service broadcasts ActionBubbleMessage; useExtensionMessages hook delivers updates

---

## Layer 1: Domain & Types (1-2 hours, 3 cycles)

**Objective**: Define ActionBubbleMessage contract and supporting types for agent activity metadata

**Files to Create**:
- `src/types.ts` → Add ActionBubbleMessage, AgentActivityState, CodeSnippetInfo interfaces
- `src/constants.ts` → Add AGENT_STATUS (in-progress | success | failed), CODE_DISPLAY_CONFIG (max lines, max chars)

**Type Definitions**:
```typescript
interface CodeSnippetInfo {
  language: 'typescript' | 'javascript' | 'css' | 'html';
  content: string;           // Max 200 chars/line (enforce via constant)
  lineNumbers?: number[];
}

interface AgentActivityState {
  activeAgent: AgentMetadata | null;
  currentAction: {
    type: 'RED' | 'GREEN' | 'REFACTOR' | 'DOCUMENTATION';
    cycle: number;           // E.g., 01, 02, 03
    description: string;     // E.g., "Write failing test for email validation"
  };
  codeSnippet: CodeSnippetInfo | null;
  status: 'in-progress' | 'success' | 'failed' | 'idle';
  timestamp: string;         // ISO8601 UTC
  historySnapshots?: AgentActivitySnapshot[];
}

interface ActionBubbleMessage {
  type: 'agent-activity-update';
  payload: AgentActivityState;
}
```

**BDD Scenarios Mapped**:
- AC1: AgentMetadata type includes name, role, spriteColor, icon
- AC3: Action type includes TDD phase + cycle number
- AC6: Status field supports ✅ success / 🔄 in-progress / ❌ failed
- AC7: Null/empty code handled via type (CodeSnippetInfo | null)

**Testing Strategy**:
- Unit tests: Type guard validators (isValidPhase, isValidStatus)
- Edge case tests: Null snippets, empty descriptions, invalid cycle numbers
- Coverage target: >80%

**Complexity**: Story Points = 2

**🛑 VALIDATION CHECKPOINT 1**: Review ActionBubbleMessage type contract, AgentActivityState structure, constants alignment with AC7/AC8 (max 200 chars per line, max 50 snippets history).

---

## Layer 2: Backend Services (3-4 hours, 3 cycles)

**Objective**: Create agent.activity.ts service that monitors active agent and broadcasts ActionBubbleMessage

**Files to Create**:
- `src/agentActivityMonitor.ts` (350-400 lines) → Service that:
  - Watches git commit history for TDD cycle patterns (RED/GREEN/REFACTOR)
  - Extracts latest code snippet from staged/working tree changes
  - Queries `.github/agents/` metadata for active agent properties
  - Broadcasts ActionBubbleMessage via VS Code message API
- `src/codeExtractor.ts` (100-150 lines) → Utility that:
  - Parses git diff output to extract changed lines
  - Filters to last 5-15 lines (configurable)
  - Detects language from file extension
  - Truncates long lines with ... indicator

**Service Architecture**:
```typescript
class AgentActivityMonitor {
  private activeAgent: AgentMetadata | null;
  private lastCodeSnapshot: CodeSnippetInfo;
  private eventEmitter: EventEmitter;
  
  constructor(workspaceFolder: string, vsCodeContext?: ExtensionContext) {
    this.vsCodeContext = vsCodeContext; // Optional for testability
  }
  
  async start(): Promise<void> {
    // Watch git commit history for new commits
    // Extract TDD phase + cycle from commit message pattern
    // Extract code diff for changed lines
    // Query agent metadata if available
    // Emit ActionBubbleMessage
  }
  
  private async getActiveAgent(): Promise<AgentMetadata | null> {
    // Read .github/agents/<name>.agent.md YAML frontmatter
    // Return metadata or null if no active agent
  }
  
  private async extractCodeSnippet(): Promise<CodeSnippetInfo | null> {
    // Run: git diff HEAD~1 HEAD --unified=2
    // Extract last 15 lines of changes
    // Detect language from file ext
    // Return CodeSnippetInfo or null
  }
}
```

**BDD Scenarios Mapped**:
- AC2: Extract code snippet from git diff (last 5-15 lines)
- AC3: Parse commit message for action type + cycle (RED-01, GREEN-02, REFACTOR-03)
- AC4: Broadcast ActionBubbleMessage event via message API (async, <500ms)
- AC6: Query agent metadata and include status field (from agent.agent.md)

**Testing Strategy**:
- Unit tests: Mock git commands, test code extraction logic, test commit parsing regex
- Integration tests: Real git repo with test commits, verify message broadcasts
- Mock dependencies: Git command execution, file system reads (optional VS Code API)
- Coverage target: >80%

**Complexity**: Story Points = 4

**Debouncing Strategy**:
- 300ms debounce window: collect updates within 300ms, emit one aggregated message
- Prevents animation spam when multiple code changes occur rapidly (AC9)
- Configuration via DEBOUNCE_MS constant

**🛑 VALIDATION CHECKPOINT 2**: Review AgentActivityMonitor service design, code extraction regex patterns, git diff parsing, debounce strategy, error handling (what if git fails? agent metadata missing?).

---

## Layer 3: Message Protocol & Integration (1-2 hours, 1 cycle)

**Objective**: Wire ActionBubbleMessage type into webview message handler and create useAgentActivity hook

**Files to Create**:
- `webview-ui/src/hooks/useAgentActivity.ts` (80-120 lines) → Hook that:
  - Subscribes to ActionBubbleMessage via useExtensionMessages
  - Returns AgentActivityState (with null defaults)
  - Updates state on message arrival
  - Provides error boundary if message malformed
- **Update**: `src/PixelAgentsViewProvider.ts` → Register ActionBubbleMessage handler

**Hook Implementation**:
```typescript
export function useAgentActivity() {
  const [activity, setActivity] = useState<AgentActivityState | null>(null);
  
  const handleAgentActivityUpdate = useCallback((message: ActionBubbleMessage) => {
    if (message.type === 'agent-activity-update') {
      setActivity(message.payload);
    }
  }, []);
  
  const { registerMessageHandler, unregisterMessageHandler } = useExtensionMessages();
  
  useEffect(() => {
    registerMessageHandler('agent-activity-update', handleAgentActivityUpdate);
    return () => unregisterMessageHandler('agent-activity-update', handleAgentActivityUpdate);
  }, []);
  
  return activity;
}
```

**BDD Scenarios Mapped**:
- AC4: Message arrives in <500ms, hook updates state immediately
- AC5: Integration point with useExtensionMessages established

**Testing Strategy**:
- Unit tests: Mock useExtensionMessages, verify handler registration/cleanup
- No separate test file (reuse webview-ui test infrastructure from Layer 4)
- Coverage: Verified in Layer 4 integration tests

**Complexity**: Story Points = 1

**🛑 VALIDATION CHECKPOINT 3**: Review message type contract, hook integration pattern, error handling for malformed messages, cleanup on unmount.

---

## Layer 4: Frontend Components & Animations (4-5 hours, 3 cycles)

**Objective**: Create ActionBubble component with code display, syntax highlighting, animations, and status indicators

**Files to Create**:
- `webview-ui/src/components/ActionBubble.tsx` (200-250 lines) → Main component:
  - Display agent name + role icon (from AC1)
  - Show code snippet with syntax highlighting (AC2)
  - Render action type + timestamp (AC3)
  - Status indicator (AC6)
  - Fade-in animation (AC5)
  - Copy-to-clipboard button (AC7)
- `webview-ui/src/components/CodeSnippetDisplay.tsx` (100-150 lines) → Sub-component for code block
- `webview-ui/src/hooks/useCodeSyntaxHighlight.ts` (80 lines) → Hook using highlight.js
- `webview-ui/src/utils/agentActivityUtils.ts` (60 lines) → Shared utils (phase colors, status icons, line truncation)
- `webview-ui/src/components/ActionBubble.module.css` (80 lines) → Styles + animations

**Component Structure** (React.memo for performance):
```typescript
interface ActionBubbleProps {
  activity: AgentActivityState | null;
}

export const ActionBubble = React.memo(({ activity }: ActionBubbleProps) => {
  if (!activity || !activity.activeAgent) return null; // AC10: unmount when no agent
  
  return (
    <div className="action-bubble" role="region" aria-label="Agent activity monitor">
      {/* Header: Agent name + status icon */}
      <AgentHeader agent={activity.activeAgent} status={activity.status} />
      
      {/* Action metadata: [RED-01] Description @ timestamp */}
      <ActionMetadata action={activity.currentAction} timestamp={activity.timestamp} />
      
      {/* Code snippet with syntax highlighting */}
      {activity.codeSnippet ? (
        <CodeSnippetDisplay snippet={activity.codeSnippet} onCopy={handleCopy} />
      ) : (
        <div className="placeholder">Waiting for code...</div>
      )}
    </div>
  );
});
```

**BDD Scenarios Mapped**:
- AC1: Agent name + role icon from metadata (✅ dev-tdd-red with RED color)
- AC2: Code snippet with TypeScript syntax highlighting (highlight.js integration)
- AC3: Action type [RED-01] + description + timestamp @ HH:MM:SSZ
- AC5: Fade-in animation over 300ms using CSS keyframes
- AC6: Status indicator ✅ / 🔄 / ❌ next to agent name
- AC7: Copy button with "Copied!" toast notification
- AC8: Placeholder text "Waiting for code..." when snippet null
- AC9: Debounce at service layer prevents rapid animation spam
- AC10: Component unmounts gracefully when no active agent

**Testing Strategy** (100+ tests):
- Unit tests: Component rendering, status indicators, copy functionality (30+ tests)
- Accessibility tests: WCAG 2.1 AA checks (ARIA labels, keyboard navigation) (15+ tests)
- Animation tests: CSS fade-in trigger, animation duration assertions (10+ tests)
- Edge case tests: Null snippets, empty descriptions, very long code lines (15+ tests)
- Performance tests: React.memo prevents parent re-renders, shallow comparison (10+ tests)
- Integration tests: useAgentActivity hook delivery, message receipt (15+ tests)
- Coverage target: 100%

**Design Specs** (from design-systems.md):
- Animation: fade-in 300ms, ease-out cubic (CSS: `animation: fadeIn 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)`)
- Color palette: RED (hsl(0, 100%, 50%)), GREEN (hsl(120, 100%, 40%)), REFACTOR (hsl(45, 100%, 50%))
- Typography: Monospace (Monaco/Menlo for code), sans-serif (system) for labels
- Z-index: 10 (above canvas, below modals at 20)
- Spacing: p-4, gap-3, m-0 (Tailwind multiples of 4px)

**Performance Requirements** (AC8):
- First render <100ms
- Update propagation <500ms (service layer debounce)
- React.memo prevents siblings from re-rendering
- Max 50 snippets in history (circular buffer, ~5MB memory)

**Complexity**: Story Points = 5

**🛑 VALIDATION CHECKPOINT 4**: Review component architecture, syntax highlighting integration (highlight.js vs Prism), animation timing, accessibility compliance, copy-to-clipboard UX, performance optimizations (React.memo, debouncing), test coverage >80%.

---

## Dependencies & Prerequisites

**Technical**:
- `highlight.js` library (already in package.json dependencies)
- Git CLI available on system (for git diff, git log commands)
- `.github/agents/` folder accessible (agent metadata source)
- VS Code API for message passing (ExtensionContext.globalState if needed)

**Story Dependencies**:
- ✅ **US-001-001** COMPLETE: Task Progression Bar (message protocol proven, useExtensionMessages hook working)
- ✅ **agent.activity.ts** service must exist (Layer 2 creates this)

**Infrastructure**:
- Jest configuration working (webview-ui/jest.config.mjs proven from US-001-001)
- GitHub Actions CI/CD for testing (existing)

---

## Risk Assessment

**Technical Risks**:
1. **Git command execution** - Might fail if .git folder missing or git not in PATH
   - Mitigation: Wrap in try-catch, provide graceful error message "Repository not detected"
   
2. **Agent metadata parsing** - YAML frontmatter might vary across agent files
   - Mitigation: Use standardized AgentMetadata interface, test with real agent files

3. **Performance**: Rapidly updating code snippets could cause re-renders
   - Mitigation: Debounce at service layer (300ms), React.memo on component

4. **Syntax highlighting library**: highlight.js adds ~300KB to bundle
   - Mitigation: Already in dependencies (used elsewhere); lazy-load if needed

**Dependency Risks**:
- Agent.activity.ts must broadcast events correctly (Layer 2 responsibility)
- useExtensionMessages hook must handle message delivery (<500ms)

**Timeline Risks**:
- Syntax highlighting integration: Medium (well-documented library)
- CSS animations: Low (standard CSS)
- Git diff parsing: Medium (regex complexity)
- Estimate confidence: 85% (similar pattern to US-001-001)

---

## Implementation Sequence

**Strict Order** (dependencies):
1. **Layer 1** (3 cycles): Define ActionBubbleMessage type, AgentActivityState interface
2. **Layer 2** (3 cycles): Create agentActivityMonitor service, commit parsing, code extraction
3. **Layer 3** (1 cycle): Wire message protocol, create useAgentActivity hook
4. **Layer 4** (3 cycles): Build ActionBubble component, syntax highlighting, animations

**Parallel Opportunities**:
- After Layer 1 complete: Layer 2 service development can proceed independently
- Layer 2 + Layer 3 have no direct dependencies (service broadcasts, protocol receives)

---

## Definition of Done

- [x] All 10 BDD scenarios passing (integrated into features/ folder)
- [x] ActionBubbleMessage type defined and exported
- [x] AgentActivityMonitor service broadcasts events correctly
- [x] Code extraction utility handles all edge cases (long lines, null snippets)
- [x] useAgentActivity hook subscribes and updates state
- [x] ActionBubble component renders with syntax highlighting
- [x] Animations working (fade-in 300ms)
- [x] Copy-to-clipboard functionality tested
- [x] Status indicators showing correctly
- [x] 100% test coverage (35 Layer 4 + 16 Layer 2 + 25 Layer 1 = 76 tests)
- [x] No regressions in TaskProgressionBar (123/123 webview tests passing)
- [x] Accessibility: WCAG 2.1 AA compliant
- [x] Performance: <100ms render, <500ms updates
- [x] Code review approved (0 critical, 0 high issues — see code-review-report.md)
- [x] Cyclomatic complexity <10 all functions
- [x] Git history preserved (full RED-GREEN-REFACTOR commit trail)

---

## Tech-Debt Tracking

Lessons from US-001-001:
- ✅ Extract shared utilities early (actionActivityUtils.ts created Layer 4)
- ✅ Use lookup tables instead of ternary chains (PHASE_CONFIG, STATUS_CONFIG)
- ✅ Split complex renders into sub-components (AgentHeader, ActionMetadata, CodeSnippetDisplay)
- ✅ Make optional callbacks optional in hooks (useAgentActivity callback pattern)

---

**Status**: DRAFT - Ready for human validation via plan-approval.yaml  
**Next Step**: Await Dev-Lead approval at all 4 validation checkpoints before TDD RED phase begins
