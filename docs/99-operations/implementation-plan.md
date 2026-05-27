# Pixel Agents Extension - Field Testing Issue Resolution Plan

**Date**: May 4, 2026  
**Version**: 1.0  
**Status**: Ready for Implementation  
**Priority**: High (Production stability issues)

---

## Executive Summary

After extensive field testing on multiple client projects, we've identified 4 critical UX issues that prevent Pixel Agents from accurately reflecting real project workflows:

1. **Phase Detection Hardcoded**: Always displays "8 Impl" regardless of actual project phase
2. **Agent Activity Bubbles Dead**: Always show "Idle" even when agents are actively working
3. **Context Window Popup Empty**: Tooltip displays no values despite bar showing correct data
4. **Completeness Metrics Delayed**: All counters show 0 until implementation, need dissociation

These issues severely impact the extension's value proposition: real-time visibility into AI agent collaboration throughout the entire PDLC, not just implementation.

---

## Issue #1: Phase Detection Hardcoded to "Implementation"

### Problem Statement

**Current Behavior**: The top bar next to "PALO IT" logo always displays "8 Impl" (Phase 8: Implementation) regardless of the actual project phase.

**Expected Behavior**: Display current phase dynamically based on project artifacts:
- Phase 0: Assessment (when `/docs/00-assessment/` exists)
- Phases 1-2: Requirements (when `/docs/01-requirements/` exists)
- Phases 3-4: Architecture (when `/docs/02-architecture/` exists)
- Phase 5: Testing (when `/docs/03-testing/` exists)
- Phases 6-7: Planning (when `/docs/04-planning/` exists)
- Phase 8: Implementation (when `/docs/05-implementation/` exists)

**Reproduction**:
1. Create fresh project with only `/docs/00-assessment/` or `/docs/02-architecture/`
2. Open Pixel Agents extension panel
3. Observe top bar shows "8 Impl" incorrectly

**Impact**: Users lose confidence in extension accuracy; defeats purpose of phase visualization

---

### Root Cause Analysis

**File**: `src/workflowDetector.ts`  
**Method**: `detectWorkflowState()` and `detectPDLCStage()`

**Issue**: The current implementation defaults to checking `/docs/05-implementation/` first and returns "Implementation" workflow type if any story exists, overriding PDLC stage detection.

**Code Location** (lines 100-115 in `src/workflowDetector.ts`):
```typescript
// Step 2: Check implementation status (user stories)
const implementationStatus = this.detectImplementationStatus();
if (implementationStatus) {
  // ⚠️ BUG: This always overrides workflow even if stories are "Not Started"
  if (implementationStatus.activeUserStory) {
    state.workflow = 'Implementation';
  }
  // ...
}
```

**Problem**: The logic assumes presence of `/docs/05-implementation/user-stories.md` means implementation is active, but this file is often created during Requirements phase when user stories are first written.

---

### Solution Design

#### Approach: Multi-Stage Phase Detection with Prioritization

**Principle**: Detect phase based on **artifact maturity**, not just presence.

**Phase Detection Priority** (most specific first):
1. **Assessment Phase (0)**: `/docs/00-assessment/ai-readiness-report.md` exists AND `/docs/01-requirements/` does NOT exist
2. **Requirements Phase (1-2)**: `/docs/01-requirements/user-stories.md` exists AND no story status = "In Progress"
3. **Architecture Phase (3-4)**: `/docs/02-architecture/architecture-design.md` + `tech-spec.md` exist AND no active TDD cycles
4. **Testing Phase (5)**: `/docs/03-testing/test-strategies.md` exists AND no active TDD cycles
5. **Planning Phase (6-7)**: `/docs/04-planning/iteration-planning.md` exists AND no active TDD cycles
6. **Implementation Phase (8)**: ANY story with status "In Progress" OR active TDD cycles (handoff files)

**Algorithm**:
```typescript
private detectCurrentPhase(): number {
  const docsPath = path.join(this.workspaceRoot, 'docs');
  
  // Check for active implementation (highest priority)
  if (this.hasActiveImplementation()) {
    return 8; // Implementation
  }
  
  // Check PDLC phases in reverse order (latest first)
  if (this.hasArtifact('04-planning', 'iteration-planning.md')) {
    return 6; // Planning (represents phases 6-7)
  }
  
  if (this.hasArtifact('03-testing', 'test-strategies.md')) {
    return 5; // Testing
  }
  
  if (this.hasArtifact('02-architecture', 'architecture-design.md') && 
      this.hasArtifact('02-architecture', 'tech-spec.md')) {
    return 3; // Architecture (represents phases 3-4)
  }
  
  if (this.hasArtifact('01-requirements', 'user-stories.md')) {
    return 1; // Requirements (represents phases 1-2)
  }
  
  if (this.hasArtifact('00-assessment', 'ai-readiness-report.md')) {
    return 0; // Assessment
  }
  
  return 0; // Default to assessment if no artifacts found
}

private hasActiveImplementation(): boolean {
  // Check for stories with "In Progress" status
  const userStoriesPath = path.join(this.workspaceRoot, 'docs', '05-implementation', 'user-stories.md');
  if (!fs.existsSync(userStoriesPath)) return false;
  
  const content = fs.readFileSync(userStoriesPath, 'utf-8');
  
  // Match: **Status**: 🟡 In Progress OR **Status**: ✅ Delivered
  const inProgressRegex = /\*\*Status\*\*:\s*[^a-zA-Z]*(In Progress|Delivered)/i;
  return inProgressRegex.test(content);
}
```

---

### Implementation Tasks

#### Layer 1: Phase Detection Algorithm (Backend Service)

**File**: `src/workflowDetector.ts`

**Changes Required**:

1. **Add Phase Detection Method** (new function):
   ```typescript
   /**
    * Detect current PDLC phase based on artifact maturity
    * Returns phase number: 0 (Assessment) → 8 (Implementation)
    */
   private detectCurrentPhase(): number {
     // Implementation as shown in Solution Design above
   }
   ```

2. **Add Artifact Check Helper** (new function):
   ```typescript
   private hasArtifact(phaseFolder: string, fileName: string): boolean {
     const artifactPath = path.join(this.workspaceRoot, 'docs', phaseFolder, fileName);
     return fs.existsSync(artifactPath);
   }
   ```

3. **Add Active Implementation Check** (new function):
   ```typescript
   private hasActiveImplementation(): boolean {
     // Check for stories with "In Progress" or "Delivered" status
     // Implementation as shown in Solution Design above
   }
   ```

4. **Update Main Detection Logic** (modify existing):
   ```typescript
   public detectWorkflowState(): WorkflowState | null {
     const docsPath = path.join(this.workspaceRoot, 'docs');
     
     if (!fs.existsSync(docsPath)) {
       return null;
     }

     const state: WorkflowState = {
       workflow: 'None',
       lastUpdate: Date.now()
     };

     // ✅ NEW: Detect phase first
     const currentPhase = this.detectCurrentPhase();
     state.pdlcStage = currentPhase;
     
     // Set workflow type based on phase
     if (currentPhase === 8) {
       state.workflow = 'Implementation';
     } else if (currentPhase >= 1) {
       state.workflow = 'PDLC';
     } else {
       state.workflow = 'Assessment';
     }
     
     // ... rest of detection logic
   }
   ```

**Test Cases**:
- ✅ Fresh project with only `/docs/00-assessment/` → Phase 0
- ✅ Project with `/docs/01-requirements/` but no "In Progress" stories → Phase 1-2
- ✅ Project with `/docs/02-architecture/` complete → Phase 3-4
- ✅ Project with any story "In Progress" → Phase 8
- ✅ Empty `/docs/` folder → Phase 0 (default)

**Estimated Effort**: 3 hours (1 dev-day)

---

#### Layer 2: Phase Display Formatting (Frontend)

**File**: `webview-ui/src/components/WorkflowStatusBar.tsx`

**Changes Required**:

1. **Add Phase Label Mapping** (new constant):
   ```typescript
   const PHASE_LABELS: Record<number, string> = {
     0: '0 Assess',
     1: '1-2 Req',
     3: '3-4 Arch',
     5: '5 Test',
     6: '6-7 Plan',
     8: '8 Impl'
   };
   ```

2. **Update Display Logic** (modify existing):
   ```typescript
   // Current: hardcoded "8 Impl"
   const phaseLabel = '8 Impl';
   
   // ✅ NEW: dynamic based on workflowState.pdlcStage
   const phaseLabel = PHASE_LABELS[workflowState.pdlcStage ?? 0] ?? '0 Assess';
   ```

3. **Add Tooltip for Phase Details** (new feature):
   ```typescript
   <span 
     title={`PDLC Phase ${workflowState.pdlcStage}: ${getPhaseDescription(workflowState.pdlcStage)}`}
     style={{ fontSize: '11px', color: PALO_BLUE, fontWeight: 600, cursor: 'help' }}
   >
     {phaseLabel}
   </span>
   ```

**Test Cases**:
- ✅ Phase 0 displays "0 Assess"
- ✅ Phase 1-2 displays "1-2 Req"
- ✅ Phase 3-4 displays "3-4 Arch"
- ✅ Phase 8 displays "8 Impl"
- ✅ Tooltip shows full phase name

**Estimated Effort**: 1 hour

---

#### Layer 3: Integration Testing

**Test Scenarios**:

1. **Scenario 1: Fresh Assessment Project**
   - **Given**: New project with `/docs/00-assessment/ai-readiness-report.md`
   - **When**: Open Pixel Agents panel
   - **Then**: Top bar shows "0 Assess"

2. **Scenario 2: Requirements Phase**
   - **Given**: Project with `/docs/01-requirements/user-stories.md`, all stories "Not Started"
   - **When**: Open Pixel Agents panel
   - **Then**: Top bar shows "1-2 Req"

3. **Scenario 3: Active Implementation**
   - **Given**: Project with one story marked "In Progress"
   - **When**: Open Pixel Agents panel
   - **Then**: Top bar shows "8 Impl"

4. **Scenario 4: Phase Transition**
   - **Given**: Project at phase 3-4 (Architecture)
   - **When**: User updates story to "In Progress"
   - **Then**: Top bar updates to "8 Impl" within 500ms (debounce)

**Estimated Effort**: 2 hours

---

### Acceptance Criteria

- [ ] Phase detection respects artifact maturity (not just presence)
- [ ] Top bar displays correct phase label for all 6 phase ranges
- [ ] Phase label updates within 500ms when artifacts change
- [ ] Tooltip shows full phase description on hover
- [ ] Zero regressions in existing workflow detection
- [ ] Manual test on 3 field projects confirms accuracy

---

## Issue #2: Agent Activity Bubbles Always Show "Idle"

### Problem Statement

**Current Behavior**: Agent character bubbles always display "Idle" even when agents are actively working in Copilot Chat window.

**Expected Behavior**: Bubbles display current agent action in real-time:
- "Creating user stories..." (when BA agent active)
- "Generating RED tests..." (when dev-tdd-red active)
- "Implementing auth service..." (when dev-tdd-green active)
- Recent code snippet (last 5-15 lines of changed file)

**Reproduction**:
1. Invoke agent in Copilot Chat: `@ba create user stories`
2. Observe BA agent character bubble in Pixel Agents panel
3. Bubble shows "Idle" or no bubble at all

**Impact**: Zero visibility into agent activity; defeats core value proposition

---

### Root Cause Analysis

**File**: `src/agentActivityMonitor.ts`  
**Issue**: Activity monitor is not receiving agent activity events from VS Code

**Suspected Causes**:
1. **Git-based detection insufficient**: Current implementation monitors git commits only, but agents may be working without committing yet
2. **Extension API limitation**: Copilot Chat agent activity is not exposed via public VS Code API
3. **Fallback mechanism missing**: No alternative data source when git activity unavailable

**Current Implementation** (lines 60-80 in `src/agentActivityMonitor.ts`):
```typescript
// Only monitors git commits — does NOT capture live agent work
private async detectActivityFromGit(): Promise<void> {
  const diff = await this.gitAdapter.getGitDiff();
  const commitMsg = await this.gitAdapter.getLatestCommitMessage();
  
  // Parse TDD phase from commit
  const match = TDD_COMMIT_RE.exec(commitMsg);
  // ...
}
```

**Problem**: Agents can be actively writing code for 5-30 minutes before committing. Users expect **live feedback**, not post-commit summaries.

---

### Solution Design

#### Approach: Multi-Source Activity Detection

**Strategy**: Combine 3 data sources for comprehensive activity tracking:

1. **Primary: File Watcher** (Real-time, before commit)
   - Monitor `/docs/` and `src/` for file changes
   - Extract agent name from file path or content patterns
   - Display: "Updating {filename}..."

2. **Secondary: Agent Logs** (If available via gene2-core integration)
   - Parse `/logs/{phase}/agent-{name}-YYYYMMDD.md` for latest action
   - Extract action description from log entry
   - Display: Actual action from log (e.g., "Creating implementation plan for US-045")

3. **Fallback: Git Commits** (Post-commit summary, existing)
   - Keep current git-based detection for post-commit bubbles
   - Display: Code snippet from last commit

**Priority Logic**:
```
IF agent log has entry within last 30s:
  Display log action description
ELSE IF file change detected within last 10s:
  Display "Editing {filename}..."
ELSE IF git commit within last 2 minutes:
  Display commit message + code snippet
ELSE:
  Display "Idle"
```

---

### Implementation Tasks

#### Layer 1: File Watcher Activity Detection (Backend)

**File**: `src/agentActivityMonitor.ts`

**Changes Required**:

1. **Add File Watcher** (new feature):
   ```typescript
   private fileWatcher: vscode.FileSystemWatcher | null = null;
   
   public startMonitoring(): void {
     // Watch for file changes in docs/ and src/
     this.fileWatcher = vscode.workspace.createFileSystemWatcher(
       new vscode.RelativePattern(this.workspaceFolder, '{docs/**/*.md,src/**/*.{ts,tsx}}')
     );
     
     this.fileWatcher.onDidChange((uri) => {
       this.handleFileChange(uri);
     });
     
     this.fileWatcher.onDidCreate((uri) => {
       this.handleFileChange(uri);
     });
   }
   ```

2. **Add File Change Handler** (new method):
   ```typescript
   private handleFileChange(uri: vscode.Uri): void {
     const relativePath = vscode.workspace.asRelativePath(uri);
     const agentName = this.inferAgentFromPath(relativePath);
     const action = `Editing ${path.basename(uri.fsPath)}`;
     
     this.currentState = {
       activeAgent: { id: agentName, name: agentName },
       currentAction: { type: 'file-edit', description: action, timestamp: Date.now() },
       codeSnippet: null,
       status: 'active'
     };
     
     this.emit('activity', this.currentState);
   }
   ```

3. **Add Agent Inference Logic** (new method):
   ```typescript
   private inferAgentFromPath(filePath: string): string {
     // /docs/05-implementation/epics/EPIC-001/user-stories/US-045/implementation-plan.md
     // → infer: dev-lead (creates implementation plans)
     
     if (filePath.includes('implementation-plan.md')) return 'dev-lead';
     if (filePath.includes('bdd-scenarios')) return 'ba';
     if (filePath.includes('.feature')) return 'ba';
     if (filePath.includes('architecture-design.md')) return 'architect';
     if (filePath.includes('test-strategies.md')) return 'qa';
     if (filePath.match(/\.test\.tsx?$/)) return 'dev-tdd-red';
     if (filePath.match(/src\/.*\.tsx?$/) && !filePath.includes('.test.')) return 'dev-tdd-green';
     
     return 'unknown'; // Generic agent
   }
   ```

**Test Cases**:
- ✅ Editing `implementation-plan.md` → "dev-lead: Editing implementation-plan.md"
- ✅ Creating `login.feature` → "ba: Editing login.feature"
- ✅ Modifying `auth.test.ts` → "dev-tdd-red: Editing auth.test.ts"
- ✅ Debouncing works (no spam updates)

**Estimated Effort**: 4 hours

---

#### Layer 2: Agent Log Parsing (Optional, if gene2-core available)

**File**: `src/agentActivityMonitor.ts`

**Changes Required**:

1. **Add Log Watcher** (new feature):
   ```typescript
   private logWatcher: vscode.FileSystemWatcher | null = null;
   
   private watchAgentLogs(): void {
     this.logWatcher = vscode.workspace.createFileSystemWatcher(
       new vscode.RelativePattern(this.workspaceFolder, 'logs/**/agent-*-*.md')
     );
     
     this.logWatcher.onDidChange((uri) => {
       this.parseLatestLogEntry(uri);
     });
   }
   ```

2. **Add Log Parser** (new method):
   ```typescript
   private async parseLatestLogEntry(uri: vscode.Uri): Promise<void> {
     const content = await vscode.workspace.fs.readFile(uri);
     const text = Buffer.from(content).toString('utf-8');
     
     // Extract latest log entry (format: ## ISO8601 | Action: DESCRIPTION | Status: ...)
     const entries = text.split('\n## ').filter(line => line.includes('Action:'));
     if (entries.length === 0) return;
     
     const latestEntry = entries[entries.length - 1];
     const actionMatch = /Action:\s*([^|]+)/.exec(latestEntry);
     const statusMatch = /Status:\s*(\w+)/.exec(latestEntry);
     
     if (actionMatch) {
       const agentName = path.basename(uri.fsPath).match(/agent-(\w+)-/)?.[1] ?? 'unknown';
       this.currentState = {
         activeAgent: { id: agentName, name: agentName },
         currentAction: { 
           type: 'log-action', 
           description: actionMatch[1].trim(), 
           timestamp: Date.now() 
         },
         status: statusMatch?.[1] === 'success' ? 'active' : 'busy'
       };
       
       this.emit('activity', this.currentState);
     }
   }
   ```

**Test Cases**:
- ✅ New log entry appended → bubble updates with action description
- ✅ No log file → fallback to file watcher
- ✅ Log parsing handles malformed entries gracefully

**Estimated Effort**: 3 hours (OPTIONAL — defer if gene2-core not available)

---

#### Layer 3: Frontend Bubble Display Update

**File**: `webview-ui/src/office/systems/characterRenderer.ts`

**Changes Required**:

1. **Update Bubble Text Logic** (modify existing):
   ```typescript
   // Current: Always shows "Idle" or hardcoded text
   if (char.bubbleType === 'waiting') {
     char.bubbleText = 'Idle';
   }
   
   // ✅ NEW: Use real-time activity from agentActivity state
   if (char.bubbleType === 'waiting' && agentActivity) {
     if (agentActivity.activeAgent?.id === char.agentRole) {
       // This agent is active — show current action
       char.bubbleText = agentActivity.currentAction.description || 'Working...';
     } else if (char.isActive) {
       // Different agent active, but this one is busy
       char.bubbleText = 'Working...';
     } else {
       // This agent is truly idle
       char.bubbleText = 'Idle';
     }
   }
   ```

2. **Add Truncation for Long Descriptions** (new utility):
   ```typescript
   function truncateAction(description: string, maxLength: number = 40): string {
     if (description.length <= maxLength) return description;
     return description.substring(0, maxLength - 3) + '...';
   }
   ```

**Test Cases**:
- ✅ Active agent shows current action description
- ✅ Long descriptions truncated with ellipsis
- ✅ Idle agents show "Idle"
- ✅ Busy agents (not active) show "Working..."
- ✅ Bubble updates within 1 second of activity change

**Estimated Effort**: 2 hours

---

#### Layer 4: Integration Testing

**Test Scenarios**:

1. **Scenario 1: File Edit Activity**
   - **Given**: No agents invoked
   - **When**: User manually edits `implementation-plan.md`
   - **Then**: "dev-lead" bubble shows "Editing implementation-plan.md" for 3 seconds

2. **Scenario 2: Log-Based Activity** (if implemented)
   - **Given**: Agent logs available
   - **When**: BA agent appends log entry "Creating BDD scenarios for US-045"
   - **Then**: "ba" bubble shows "Creating BDD scenarios for US-045"

3. **Scenario 3: Git Commit Activity**
   - **Given**: Developer commits code
   - **When**: Commit message parsed: "TDD-EPIC-001-US-045-RED-01: Write failing auth test"
   - **Then**: "dev-tdd-red" bubble shows code snippet from commit

4. **Scenario 4: Idle Fallback**
   - **Given**: No activity for 30 seconds
   - **When**: User clicks agent character
   - **Then**: Bubble shows "Idle"

**Estimated Effort**: 2 hours

---

### Acceptance Criteria

- [ ] Bubbles show real-time activity based on file changes
- [ ] Agent inference from file path is accurate (90%+ match rate)
- [ ] Optional: Log-based activity parsing works if gene2-core available
- [ ] Bubbles update within 1 second of activity detection
- [ ] Debouncing prevents update spam (<1 update per 500ms)
- [ ] Fallback to "Idle" when no activity for 30 seconds
- [ ] Manual test on 3 field projects confirms live activity tracking

---

## Issue #3: Context Window Popup Shows No Values

### Problem Statement

**Current Behavior**: When hovering over the context window bar, the tooltip/popup displays no token values, even though the bar itself shows correct percentages and colors.

**Expected Behavior**: Tooltip displays detailed breakdown:
- GitHub (.github): X tokens (Y%)
- Project Code: X tokens (Y%)
- Chat History: X tokens (Y%)
- Total Tokens: X

**Reproduction**:
1. Open Pixel Agents panel
2. Hover mouse over context window bar (left side, vertical blue/green bar)
3. Tooltip appears but shows "0%" or blank values

**Impact**: Users cannot see detailed token breakdown; tooltip feature is non-functional

---

### Root Cause Analysis

**File**: `webview-ui/src/components/ContextWindowBar.tsx`

**Issue**: Tooltip component is rendering but receiving `undefined` or `null` values for `tokenUsage` prop.

**Current Code** (lines 30-50 in `ContextWindowBar.tsx`):
```typescript
function ContextTooltip({ usage }: { usage: TokenUsage }) {
  const { breakdown, used, total } = usage;
  return (
    <div role="tooltip" className={styles.tooltip || 'tooltip'}>
      <div className={styles['tooltip-title'] || 'tooltip-title'}>Token Usage Breakdown</div>
      <hr className={styles['tooltip-divider'] || 'tooltip-divider'} />
      <div className={styles['tooltip-row'] || 'tooltip-row'}>
        <span>GitHub (.github)</span>
        <strong>{pct(breakdown.githubCode, total)}%</strong> {/* ⚠️ NaN if total undefined */}
      </div>
      // ...
    </div>
  );
}
```

**Problem**: The `usage` prop is passed from parent `ContextWindowBar`, which receives `tokenUsage` from `App.tsx`. If the data flow breaks anywhere in this chain, tooltip receives `undefined`.

**Data Flow**:
```
ContextAnalyzer (backend) 
  → postMessage('context.window.update', data) 
  → useContextWindow() hook (frontend) 
  → App.tsx state 
  → ContextWindowBar component 
  → ContextTooltip component
```

**Suspected Break Point**: The tooltip is conditionally rendered based on `tooltipVisible` state, but may be rendered before `tokenUsage` prop is populated.

---

### Solution Design

#### Approach: Defensive Rendering with Null Checks

**Strategy**: Add defensive checks at every level of the data flow to ensure graceful degradation.

1. **Backend**: Ensure `postMessage` always sends complete data structure
2. **Hook**: Return default empty state if no data received
3. **Component**: Check `tokenUsage` prop before rendering tooltip
4. **Tooltip**: Handle `undefined` values with fallback display

**Algorithm**:
```typescript
// In ContextWindowBar component
const percentage = tokenUsage?.percentage ?? 0;
const threshold = tokenUsage?.threshold ?? 'safe';

// ✅ Only show tooltip if tokenUsage is fully populated
const showTooltip = tooltipVisible && tokenUsage && tokenUsage.breakdown;

return (
  <div onMouseEnter={() => setTooltipVisible(true)} onMouseLeave={() => setTooltipVisible(false)}>
    {/* Bar rendering */}
    
    {showTooltip && <ContextTooltip usage={tokenUsage} />}
  </div>
);
```

---

### Implementation Tasks

#### Layer 1: Backend Data Validation (Backend Service)

**File**: `src/contextAnalyzer.ts`

**Changes Required**:

1. **Add Data Completeness Check** (new validation):
   ```typescript
   async analyzeContext(): Promise<TokenUsage> {
     const tokenUsage = await this.calculateTokenUsage();
     
     // ✅ Validate all fields are populated before sending
     if (!tokenUsage.breakdown || 
         tokenUsage.breakdown.githubCode === undefined ||
         tokenUsage.breakdown.projectCode === undefined ||
         tokenUsage.breakdown.chatHistory === undefined) {
       this.log('WARNING: Incomplete token usage data, using defaults');
       return getDefaultTokenUsage();
     }
     
     return tokenUsage;
   }
   ```

2. **Add Logging for Debug** (new debug output):
   ```typescript
   this.log(`Token Usage: total=${tokenUsage.total}, used=${tokenUsage.used}, breakdown=${JSON.stringify(tokenUsage.breakdown)}`);
   ```

**Test Cases**:
- ✅ Valid data structure always sent
- ✅ Missing breakdown fields trigger default values
- ✅ Log output shows complete data before sending

**Estimated Effort**: 1 hour

---

#### Layer 2: Hook Null Safety (Frontend Hook)

**File**: `webview-ui/src/hooks/useContextWindow.ts`

**Changes Required**:

1. **Update Hook Return Type** (modify existing):
   ```typescript
   export function useContextWindow(): UseContextWindowResult {
     const [tokenUsage, setTokenUsage] = useState<TokenUsage | null>(null);
     
     useEffect(() => {
       const handler = (event: MessageEvent) => {
         if (event.data.type === 'context.window.update') {
           const data = event.data.data;
           
           // ✅ Validate data before setting state
           if (data && data.breakdown && data.total > 0) {
             setTokenUsage(data);
           } else {
             console.warn('[useContextWindow] Received incomplete data:', data);
             // Don't update state if data is incomplete
           }
         }
       };
       
       window.addEventListener('message', handler);
       return () => window.removeEventListener('message', handler);
     }, []);
     
     return { tokenUsage };
   }
   ```

**Test Cases**:
- ✅ Valid message updates state
- ✅ Invalid/incomplete message does NOT update state
- ✅ Warning logged for incomplete data

**Estimated Effort**: 30 minutes

---

#### Layer 3: Component Null Checks (Frontend Component)

**File**: `webview-ui/src/components/ContextWindowBar.tsx`

**Changes Required**:

1. **Add Tooltip Conditional Rendering** (modify existing):
   ```typescript
   export const ContextWindowBar = memo(function ContextWindowBar({
     tokenUsage,
     onThresholdReached,
   }: ContextWindowBarProps) {
     const [tooltipVisible, setTooltipVisible] = useState(false);
     
     // ✅ Only show tooltip if data is complete
     const showTooltip = tooltipVisible && 
                         tokenUsage && 
                         tokenUsage.breakdown &&
                         tokenUsage.total > 0;
     
     return (
       <div 
         className={styles.container}
         onMouseEnter={() => setTooltipVisible(true)}
         onMouseLeave={() => setTooltipVisible(false)}
       >
         {/* Bar rendering */}
         
         {showTooltip && <ContextTooltip usage={tokenUsage!} />}
       </div>
     );
   });
   ```

2. **Add Debug Logging** (new debug):
   ```typescript
   useEffect(() => {
     console.log('[ContextWindowBar] tokenUsage prop:', tokenUsage);
     console.log('[ContextWindowBar] showTooltip:', showTooltip);
   }, [tokenUsage, showTooltip]);
   ```

**Test Cases**:
- ✅ Tooltip only renders when data complete
- ✅ No tooltip flash when data loading
- ✅ Debug logs show data flow

**Estimated Effort**: 30 minutes

---

#### Layer 4: Tooltip Fallback Display (Frontend Component)

**File**: `webview-ui/src/components/ContextWindowBar.tsx`

**Changes Required**:

1. **Add Fallback in ContextTooltip** (modify existing):
   ```typescript
   function ContextTooltip({ usage }: { usage: TokenUsage }) {
     const { breakdown, used, total } = usage;
     
     // ✅ Defensive fallbacks for calculations
     const githubPct = breakdown?.githubCode !== undefined && total > 0 
       ? pct(breakdown.githubCode, total) 
       : 0;
     const projectPct = breakdown?.projectCode !== undefined && total > 0 
       ? pct(breakdown.projectCode, total) 
       : 0;
     const chatPct = breakdown?.chatHistory !== undefined && total > 0 
       ? pct(breakdown.chatHistory, total) 
       : 0;
     
     return (
       <div role="tooltip" className={styles.tooltip || 'tooltip'}>
         <div className={styles['tooltip-title'] || 'tooltip-title'}>Token Usage Breakdown</div>
         <hr className={styles['tooltip-divider'] || 'tooltip-divider'} />
         <div className={styles['tooltip-row'] || 'tooltip-row'}>
           <span>GitHub (.github)</span>
           <strong>{githubPct}%</strong>
         </div>
         <div className={styles['tooltip-row'] || 'tooltip-row'}>
           <span>Project Code</span>
           <strong>{projectPct}%</strong>
         </div>
         <div className={styles['tooltip-row'] || 'tooltip-row'}>
           <span>Chat History</span>
           <strong>{chatPct}%</strong>
         </div>
         <hr className={styles['tooltip-divider'] || 'tooltip-divider'} />
         <div className={styles['tooltip-row'] || 'tooltip-row'}>
           <span>Total Tokens</span>
           <strong>{fmt(used || 0)}</strong>
         </div>
       </div>
     );
   }
   ```

**Test Cases**:
- ✅ Tooltip shows "0%" when data incomplete (no NaN)
- ✅ Tooltip shows correct values when data complete
- ✅ Formatting works for large numbers (1,234,567)

**Estimated Effort**: 30 minutes

---

#### Layer 5: Integration Testing

**Test Scenarios**:

1. **Scenario 1: Initial Load**
   - **Given**: Extension just opened
   - **When**: User hovers over context bar before data loaded
   - **Then**: Tooltip shows "0%" or does not appear

2. **Scenario 2: Data Available**
   - **Given**: Context analyzer has calculated token usage
   - **When**: User hovers over context bar
   - **Then**: Tooltip shows correct breakdown values

3. **Scenario 3: Data Update**
   - **Given**: Tooltip visible with initial data
   - **When**: Context analyzer updates token usage
   - **Then**: Tooltip updates to show new values within 500ms

4. **Scenario 4: Incomplete Data**
   - **Given**: Backend sends data with missing breakdown
   - **When**: User hovers over context bar
   - **Then**: Tooltip either doesn't show or shows "0%" gracefully

**Estimated Effort**: 1 hour

---

### Acceptance Criteria

- [ ] Tooltip displays complete token breakdown when data available
- [ ] Tooltip does not flash with NaN or undefined values
- [ ] Tooltip updates within 500ms when token usage changes
- [ ] Fallback to "0%" when data incomplete (graceful degradation)
- [ ] Debug logging helps trace data flow issues
- [ ] Manual test on 3 field projects confirms tooltip functionality

---

## Issue #4: Completeness Bar Shows 0 Until Implementation

### Problem Statement

**Current Behavior**: The completeness meter on the right shows 0% for all counters (epics, stories, tests, coverage) until Phase 8 (Implementation) begins, even though epics and user stories are created during Phases 1-2 (Requirements).

**Expected Behavior**: Counters should update independently as artifacts are created:
- **Epic Counter**: Updates when `/docs/05-implementation/epics/{EPIC-REF}/` folders are created (Requirements phase)
- **User Story Counter**: Updates when stories added to `/docs/01-requirements/user-stories.md` (Requirements phase)
- **BDD Coverage**: Updates when `.feature` files created (Testing phase)
- **Tests/Coverage**: Stay 0 until Implementation phase (current behavior is correct)

**Reproduction**:
1. Create project in Requirements phase
2. Add epics and user stories to `/docs/01-requirements/user-stories.md`
3. Observe completeness meter shows 0/0 epics, 0/0 stories

**Impact**: Meter is useless until implementation; defeats purpose of progress tracking across PDLC

---

### Root Cause Analysis

**File**: `src/completenessCalculator.ts`

**Issue**: The calculator only parses `/docs/05-implementation/user-stories.md`, which doesn't exist until Planning/Implementation phases. It ignores `/docs/01-requirements/user-stories.md` where stories are first defined.

**Current Code** (lines 126-140 in `completenessCalculator.ts`):
```typescript
private async parseUserStoriesFile(): Promise<StoryStatus[]> {
  try {
    const userStoriesPath = vscode.Uri.joinPath(
      this.workspaceRoot,
      'docs',
      '05-implementation',  // ⚠️ BUG: Only checks implementation folder
      'user-stories.md'
    );

    const content = await vscode.workspace.fs.readFile(userStoriesPath);
    const text = Buffer.from(content).toString('utf-8');

    return this.extractStoryStatuses(text);
  } catch (error) {
    this.log(`Error reading user-stories.md: ${error}`);
    return []; // ⚠️ Returns empty array if file not found
  }
}
```

**Problem**: The function returns `[]` if `/docs/05-implementation/user-stories.md` doesn't exist, which means `storiesTotal = 0` even if stories are defined in `/docs/01-requirements/user-stories.md`.

---

### Solution Design

#### Approach: Dual-Source Story Counting with Phase-Aware Metrics

**Strategy**: Check both PRD (requirements) and Implementation folders, prioritize implementation if available.

**Story Counting Logic**:
```
IF /docs/05-implementation/user-stories.md exists:
  Parse statuses from implementation file (authoritative for progress tracking)
  storiesTotal = count(all stories)
  storiesCompleted = count(status = "Delivered")
ELSE IF /docs/01-requirements/user-stories.md exists:
  Parse story definitions from PRD (initial catalog)
  storiesTotal = count(all stories defined in PRD)
  storiesCompleted = 0 (no implementation started)
ELSE:
  storiesTotal = 0
  storiesCompleted = 0
```

**Epic Counting Logic**:
```
epicsTotal = count(folders in /docs/05-implementation/epics/{EPIC-REF}/)

IF epicsTotal = 0 AND /docs/01-requirements/user-stories.md exists:
  epicsTotal = count(distinct epic references in PRD user-stories.md)
  Example: US-001 (EPIC-001), US-002 (EPIC-001), US-003 (EPIC-002) → 2 epics
```

**BDD Coverage Logic** (already partially implemented):
```
bddTotal = count(.feature files in /docs/03-testing/ OR /docs/05-implementation/epics/*/user-stories/*/features/)
bddImplemented = count(.feature files with corresponding step definitions)
bddCoverage = (bddImplemented / bddTotal) * 100
```

**Phase-Gated Metrics**:
```
IF phase < 8 (before Implementation):
  testsTotal = 0 (tests not written yet)
  testsPassing = 0
  codeCoverage = 0 (no code to cover yet)
  linesOfCode = 0
ELSE:
  Calculate actual implementation metrics
```

---

### Implementation Tasks

#### Layer 1: Dual-Source Story Parsing (Backend Service)

**File**: `src/completenessCalculator.ts`

**Changes Required**:

1. **Add PRD Story Parser** (new method):
   ```typescript
   /**
    * Parse user stories from PRD file (/docs/01-requirements/user-stories.md)
    * Returns story definitions without implementation status
    */
   private async parsePRDUserStories(): Promise<string[]> {
     try {
       const prdPath = vscode.Uri.joinPath(
         this.workspaceRoot,
         'docs',
         '01-requirements',
         'user-stories.md'
       );

       const content = await vscode.workspace.fs.readFile(prdPath);
       const text = Buffer.from(content).toString('utf-8');

       // Match: ### US-001: Story Title
       const storyRegex = /###\s+(US-\d+):/gi;
       const matches = text.matchAll(storyRegex);
       const storyRefs = Array.from(matches).map(m => m[1]);
       
       this.log(`Found ${storyRefs.length} stories in PRD`);
       return storyRefs;
     } catch (error) {
       this.log(`PRD user-stories.md not found: ${error}`);
       return [];
     }
   }
   ```

2. **Update Main Story Parser** (modify existing):
   ```typescript
   private async parseUserStoriesFile(): Promise<StoryStatus[]> {
     try {
       // Try implementation file first (authoritative)
       const implPath = vscode.Uri.joinPath(
         this.workspaceRoot,
         'docs',
         '05-implementation',
         'user-stories.md'
       );

       const content = await vscode.workspace.fs.readFile(implPath);
       const text = Buffer.from(content).toString('utf-8');
       const statuses = this.extractStoryStatuses(text);
       
       this.log(`Found ${statuses.length} stories in implementation tracking`);
       return statuses;
     } catch (error) {
       // ✅ Fallback to PRD if implementation file not found
       this.log(`Implementation file not found, checking PRD: ${error}`);
       const prdStories = await this.parsePRDUserStories();
       
       // Convert story refs to "Not Started" status objects
       return prdStories.map(ref => ({
         storyRef: ref,
         status: 'Not Started' as const
       }));
     }
   }
   ```

**Test Cases**:
- ✅ Implementation file exists → parse from there
- ✅ Only PRD file exists → count stories as "Not Started"
- ✅ Neither file exists → return []
- ✅ PRD has 10 stories → storiesTotal = 10

**Estimated Effort**: 2 hours

---

#### Layer 2: Epic Counting from PRD (Backend Service)

**File**: `src/completenessCalculator.ts`

**Changes Required**:

1. **Add Epic Folder Counter** (new method):
   ```typescript
   /**
    * Count epics by checking /docs/05-implementation/epics/{EPIC-REF}/ folders
    */
   private async countEpicFolders(): Promise<number> {
     try {
       const epicsPath = vscode.Uri.joinPath(
         this.workspaceRoot,
         'docs',
         '05-implementation',
         'epics'
       );

       const entries = await vscode.workspace.fs.readDirectory(epicsPath);
       const epicFolders = entries.filter(([name, type]) => 
         type === vscode.FileType.Directory && name.match(/^epic-\d+$/i)
       );
       
       this.log(`Found ${epicFolders.length} epic folders`);
       return epicFolders.length;
     } catch (error) {
       this.log(`Epics folder not found: ${error}`);
       return 0;
     }
   }
   ```

2. **Add Epic Reference Extractor from PRD** (new method):
   ```typescript
   /**
    * Extract distinct epic references from PRD user-stories.md
    * Example: US-001 (EPIC-001), US-002 (EPIC-001), US-003 (EPIC-002) → 2 epics
    */
   private async extractEpicsFromPRD(): Promise<number> {
     try {
       const prdPath = vscode.Uri.joinPath(
         this.workspaceRoot,
         'docs',
         '01-requirements',
         'user-stories.md'
       );

       const content = await vscode.workspace.fs.readFile(prdPath);
       const text = Buffer.from(content).toString('utf-8');

       // Match: **Epic**: EPIC-001 or (EPIC-001)
       const epicRegex = /\*\*Epic\*\*:\s*(EPIC-\d+)|\((EPIC-\d+)\)/gi;
       const matches = text.matchAll(epicRegex);
       const epicRefs = new Set<string>();
       
       for (const match of matches) {
         const epicRef = match[1] || match[2];
         if (epicRef) epicRefs.add(epicRef.toUpperCase());
       }
       
       this.log(`Found ${epicRefs.size} distinct epics in PRD`);
       return epicRefs.size;
     } catch (error) {
       this.log(`Could not extract epics from PRD: ${error}`);
       return 0;
     }
   }
   ```

3. **Update Metrics Calculation** (modify existing):
   ```typescript
   async calculateMetrics(): Promise<ProjectMetrics> {
     try {
       const [stories, epicFolders, epicsPRD, testsTotal, coverageInfo, bddCoverage] = await Promise.all([
         this.parseUserStoriesFile(),
         this.countEpicFolders(),
         this.extractEpicsFromPRD(),
         this.countTestFiles(),
         this.readCoverageFromLcov(),
         this.calculateBddCoverage(),
       ]);
       
       // ✅ Use epic folders if available, otherwise fall back to PRD count
       const epicsTotal = epicFolders > 0 ? epicFolders : epicsPRD;
       
       const metrics = this.calculateStoriesMetrics(stories);
       metrics.epicsTotal = epicsTotal;
       metrics.testsTotal = testsTotal;
       metrics.testsPassing = testsTotal;
       metrics.codeCoverage = coverageInfo.coverage;
       metrics.linesOfCode = coverageInfo.totalLines;
       metrics.bddCoverage = bddCoverage;
       
       this.currentMetrics = metrics;
       return metrics;
     } catch (error) {
       this.log(`Error calculating metrics: ${error}`);
       return getDefaultProjectMetrics();
     }
   }
   ```

**Test Cases**:
- ✅ Epic folders exist → count folders
- ✅ No epic folders, PRD has epic refs → count distinct refs
- ✅ Neither exists → epicsTotal = 0
- ✅ PRD has EPIC-001 (3 stories), EPIC-002 (2 stories) → epicsTotal = 2

**Estimated Effort**: 3 hours

---

#### Layer 3: BDD Coverage from Testing Phase (Backend Service)

**File**: `src/completenessCalculator.ts`

**Changes Required**:

1. **Update BDD Feature Finder** (modify existing):
   ```typescript
   private async calculateBddCoverage(): Promise<number> {
     try {
       // ✅ Search BOTH /docs/03-testing/ AND /docs/05-implementation/
       const searchPaths = [
         'docs/03-testing/**/*.feature',
         'docs/05-implementation/epics/*/user-stories/*/features/*.feature'
       ];
       
       const allFeatures: vscode.Uri[] = [];
       for (const pattern of searchPaths) {
         const relativePattern = new vscode.RelativePattern(this.workspaceRoot, pattern);
         const features = await vscode.workspace.findFiles(relativePattern);
         allFeatures.push(...features);
       }
       
       if (allFeatures.length === 0) {
         this.log('No BDD feature files found');
         return 0;
       }
       
       // Count features with corresponding step definitions
       let implementedCount = 0;
       for (const featureUri of allFeatures) {
         const stepDefPath = featureUri.fsPath.replace('.feature', '.steps.ts');
         if (fs.existsSync(stepDefPath)) {
           implementedCount++;
         }
       }
       
       const coverage = Math.round((implementedCount / allFeatures.length) * 100);
       this.log(`BDD Coverage: ${implementedCount}/${allFeatures.length} features implemented (${coverage}%)`);
       return coverage;
     } catch (error) {
       this.log(`Error calculating BDD coverage: ${error}`);
       return 0;
     }
   }
   ```

**Test Cases**:
- ✅ Features in `/docs/03-testing/` counted
- ✅ Features in `/docs/05-implementation/` counted
- ✅ Step definitions present → counted as implemented
- ✅ No step definitions → counted as not implemented

**Estimated Effort**: 1 hour

---

#### Layer 4: Phase-Aware Metrics (Backend Service)

**File**: `src/completenessCalculator.ts`

**Changes Required**:

1. **Add Phase Detection** (new method):
   ```typescript
   /**
    * Detect current PDLC phase to gate metrics appropriately
    */
   private detectCurrentPhase(): number {
     // Check for implementation activity (stories "In Progress" or "Delivered")
     const implPath = path.join(this.workspaceRoot.fsPath, 'docs', '05-implementation', 'user-stories.md');
     if (fs.existsSync(implPath)) {
       const content = fs.readFileSync(implPath, 'utf-8');
       if (/\*\*Status\*\*:\s*[^a-zA-Z]*(In Progress|Delivered)/i.test(content)) {
         return 8; // Implementation phase
       }
     }
     
     // Check other phases (simplified — can be enhanced later)
     if (fs.existsSync(path.join(this.workspaceRoot.fsPath, 'docs', '04-planning'))) return 6;
     if (fs.existsSync(path.join(this.workspaceRoot.fsPath, 'docs', '03-testing'))) return 5;
     if (fs.existsSync(path.join(this.workspaceRoot.fsPath, 'docs', '02-architecture'))) return 3;
     if (fs.existsSync(path.join(this.workspaceRoot.fsPath, 'docs', '01-requirements'))) return 1;
     
     return 0; // Assessment phase
   }
   ```

2. **Update Metrics Calculation with Phase Gating** (modify existing):
   ```typescript
   async calculateMetrics(): Promise<ProjectMetrics> {
     try {
       const currentPhase = this.detectCurrentPhase();
       
       const [stories, epicFolders, epicsPRD, bddCoverage] = await Promise.all([
         this.parseUserStoriesFile(),
         this.countEpicFolders(),
         this.extractEpicsFromPRD(),
         this.calculateBddCoverage(),
       ]);
       
       const epicsTotal = epicFolders > 0 ? epicFolders : epicsPRD;
       const metrics = this.calculateStoriesMetrics(stories);
       metrics.epicsTotal = epicsTotal;
       metrics.bddCoverage = bddCoverage;
       
       // ✅ Only calculate implementation metrics in Phase 8
       if (currentPhase >= 8) {
         const [testsTotal, coverageInfo] = await Promise.all([
           this.countTestFiles(),
           this.readCoverageFromLcov(),
         ]);
         
         metrics.testsTotal = testsTotal;
         metrics.testsPassing = testsTotal;
         metrics.codeCoverage = coverageInfo.coverage;
         metrics.linesOfCode = coverageInfo.totalLines;
       } else {
         // Before implementation: zero out code metrics
         metrics.testsTotal = 0;
         metrics.testsPassing = 0;
         metrics.codeCoverage = 0;
         metrics.linesOfCode = 0;
       }
       
       this.currentMetrics = metrics;
       return metrics;
     } catch (error) {
       this.log(`Error calculating metrics: ${error}`);
       return getDefaultProjectMetrics();
     }
   }
   ```

**Test Cases**:
- ✅ Phase 1-2 (Requirements): epics + stories counted, tests = 0
- ✅ Phase 3-4 (Architecture): epics + stories counted, tests = 0
- ✅ Phase 5 (Testing): epics + stories + BDD counted, tests = 0
- ✅ Phase 8 (Implementation): all metrics calculated

**Estimated Effort**: 2 hours

---

#### Layer 5: Frontend Display Update (Frontend Component)

**File**: `webview-ui/src/components/CompletenessMeter.tsx`

**Changes Required**:

1. **Update Label Logic** (modify existing):
   ```typescript
   // Current: Shows "0 / 0" always before implementation
   const epicsLabel = `${metrics.epicsCompleted || 0} / ${metrics.epicsTotal || 0}`;
   
   // ✅ NEW: Show actual PRD counts even before implementation
   const epicsLabel = `${metrics.epicsCompleted || 0} / ${metrics.epicsTotal || 0}`;
   const storiesLabel = `${metrics.storiesCompleted || 0} / ${metrics.storiesTotal || 0}`;
   const bddLabel = `${metrics.bddCoverage || 0}%`;
   
   // Tests/coverage stay 0 until implementation (correct behavior)
   const testsLabel = `${metrics.testsPassing || 0} / ${metrics.testsTotal || 0}`;
   const coverageLabel = `${metrics.codeCoverage || 0}%`;
   ```

2. **Add Tooltip Explanation** (new feature):
   ```typescript
   <div className={styles.stat} title="Epics defined in PRD or implementation folders">
     <span className={styles.label}>Epics</span>
     <span className={styles.value}>{epicsLabel}</span>
   </div>
   <div className={styles.stat} title="User stories defined in PRD or tracking file">
     <span className={styles.label}>Stories</span>
     <span className={styles.value}>{storiesLabel}</span>
   </div>
   <div className={styles.stat} title="BDD feature files with step definitions">
     <span className={styles.label}>BDD</span>
     <span className={styles.value}>{bddLabel}</span>
   </div>
   <div className={styles.stat} title="Test files (available after implementation starts)">
     <span className={styles.label}>Tests</span>
     <span className={styles.value}>{testsLabel}</span>
   </div>
   ```

**Test Cases**:
- ✅ PRD has 5 stories → displays "0 / 5" (none completed yet)
- ✅ PRD has 2 epics → displays "0 / 2"
- ✅ Testing phase has 3 .feature files → displays "3" or "0%" based on implementation
- ✅ Tests show "0 / 0" until implementation phase

**Estimated Effort**: 1 hour

---

#### Layer 6: Integration Testing

**Test Scenarios**:

1. **Scenario 1: Requirements Phase**
   - **Given**: Project with `/docs/01-requirements/user-stories.md` defining 10 stories in 3 epics
   - **When**: Open Pixel Agents panel
   - **Then**: Completeness meter shows "Epics: 0 / 3", "Stories: 0 / 10", "Tests: 0 / 0"

2. **Scenario 2: Testing Phase**
   - **Given**: Project with 5 .feature files in `/docs/03-testing/`
   - **When**: Open Pixel Agents panel
   - **Then**: Completeness meter shows "BDD: 0%" (no step definitions yet)

3. **Scenario 3: Implementation Phase**
   - **Given**: Project with 2 stories "In Progress"
   - **When**: Open Pixel Agents panel
   - **Then**: Completeness meter shows "Stories: 2 / 10", "Tests: 15 / 15", "Coverage: 85%"

4. **Scenario 4: Metric Update**
   - **Given**: Completeness meter showing "Stories: 5 / 10"
   - **When**: User adds new story to PRD
   - **Then**: Meter updates to "Stories: 5 / 11" within 500ms

**Estimated Effort**: 2 hours

---

### Acceptance Criteria

- [ ] Epic counter updates when epics defined in PRD (Requirements phase)
- [ ] User story counter updates when stories added to PRD (Requirements phase)
- [ ] BDD coverage updates when .feature files created (Testing phase)
- [ ] Tests/coverage stay 0 until Implementation phase (no regression)
- [ ] Completeness percentage calculated correctly across all phases
- [ ] Metrics update within 500ms when artifacts change
- [ ] Manual test on 3 field projects confirms early metric visibility

---

## Implementation Summary & Timeline

### Total Effort Estimation

| Issue | Estimated Hours | Complexity | Priority |
|-------|----------------|------------|----------|
| **Issue #1: Phase Detection** | 6 hours | Medium | High |
| **Issue #2: Agent Activity Bubbles** | 11 hours (7 without logs) | High | Critical |
| **Issue #3: Context Window Popup** | 3.5 hours | Low | Medium |
| **Issue #4: Completeness Dissociation** | 11 hours | Medium | High |
| **TOTAL** | **31.5 hours** (~4 dev-days) | | |

**Note**: Issue #2 includes optional agent log parsing (3 hours). If gene2-core integration not available, defer this feature, reducing total to **28.5 hours**.

---

### Implementation Order (Recommended)

**Sprint 1: Critical User Experience Fixes** (2 days)
1. **Issue #1: Phase Detection** (Day 1 morning)
   - Most visible bug; easy win
   - Unblocks accurate workflow visualization
2. **Issue #3: Context Window Popup** (Day 1 afternoon)
   - Quick fix; defensive coding
   - Improves data flow reliability
3. **Issue #2: Agent Activity Bubbles** (Day 2)
   - Most complex; highest user value
   - File watcher approach (skip agent logs initially)

**Sprint 2: Metric Completeness** (2 days)
4. **Issue #4: Completeness Dissociation** (Day 3-4)
   - Medium complexity; high business value
   - Enables progress tracking across entire PDLC

**Sprint 3: Optional Enhancements** (if time permits)
5. **Issue #2 Enhancement: Agent Log Parsing** (0.5 day)
   - Only if gene2-core available in client projects
   - Provides richer activity details

---

### Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **VS Code API limitations** | Medium | High | Use file watchers instead of Copilot Chat API |
| **Performance degradation** | Low | Medium | Implement debouncing (300-500ms), limit file watcher scope |
| **Regex parsing failures** | Medium | Medium | Add comprehensive test cases, defensive fallbacks |
| **Field project variability** | High | High | Test on 3 diverse client projects before release |
| **Data flow breaks** | Low | High | Add debug logging at every layer, null checks everywhere |

---

### Success Metrics

**Quantitative**:
- [ ] Phase detection accuracy: >95% across 10 field projects
- [ ] Agent activity bubble lag: <1 second from file change to display
- [ ] Context window popup: 100% reliability (no blank tooltips)
- [ ] Completeness metrics: Update within 500ms of artifact creation

**Qualitative**:
- [ ] User feedback: "Extension accurately reflects project phase"
- [ ] User feedback: "Agent activity feels real-time"
- [ ] User feedback: "Completeness meter useful from day 1"

---

### Testing Strategy

#### Unit Tests (Backend)

**New Test Files**:
- `src/workflowDetector.test.ts` (phase detection algorithm)
- `src/agentActivityMonitor.test.ts` (file watcher, agent inference)
- `src/completenessCalculator.test.ts` (dual-source parsing, epic counting)
- `src/contextAnalyzer.test.ts` (data validation)

**Coverage Target**: 85%+

---

#### Integration Tests (End-to-End)

**Test Environments**:
1. **Mock Project (Requirements Phase)**:
   - `/docs/01-requirements/user-stories.md` with 10 stories, 3 epics
   - No `/docs/05-implementation/`
   - Expected: Phase 1-2, epics = 3, stories = 10

2. **Mock Project (Architecture Phase)**:
   - `/docs/02-architecture/` complete
   - No active stories
   - Expected: Phase 3-4, epics + stories from PRD

3. **Mock Project (Implementation Phase)**:
   - 2 stories "In Progress"
   - Epic folders exist
   - Expected: Phase 8, all metrics active

---

#### Manual Testing (Field Projects)

**Test Projects**:
1. **Project A**: Fresh assessment project (Phase 0)
2. **Project B**: Requirements complete, architecture in progress (Phase 3-4)
3. **Project C**: Active implementation with 5 stories (Phase 8)

**Test Checklist**:
- [ ] Phase label matches actual project phase
- [ ] Agent bubbles show activity when working
- [ ] Context window tooltip displays values
- [ ] Completeness counters update as artifacts created
- [ ] No performance issues (IDE remains responsive)

---

### Deployment Plan

**Version**: v1.1.0 (Field Testing Fixes)

**Release Notes**:
```markdown
## v1.1.0 - Field Testing Stability Improvements

### 🔥 Critical Fixes
- **Phase Detection**: Top bar now displays correct PDLC phase dynamically
- **Agent Activity**: Bubbles show real-time agent actions (file edits, commits)
- **Context Window Tooltip**: Fixed blank values, now shows token breakdown
- **Completeness Metrics**: Epics/Stories/BDD counters update across all phases

### 🎯 Improvements
- Phase detection based on artifact maturity (not just presence)
- File watcher activity tracking (before git commits)
- Defensive null checks in all data flow layers
- Dual-source story counting (PRD + implementation)
- Epic counting from PRD references

### 🐛 Bug Fixes
- Fixed hardcoded "8 Impl" phase label
- Fixed "Idle" bubbles when agents active
- Fixed NaN values in context tooltip
- Fixed 0% completeness in non-implementation phases

### 📚 Documentation
- Added implementation plan for all fixes
- Updated field testing guidelines
```

**Rollout**:
1. **Alpha Testing** (internal): Test on 2 internal projects (1 day)
2. **Beta Testing** (select clients): Deploy to 3 field projects (3 days)
3. **General Release**: Publish to VS Code marketplace (after beta feedback)

---

## Appendix: Gene2-Core Workflow Reference

**For Issue #4 (Completeness Metrics)**: Understanding when epics and user stories are created during PDLC phases.

### Gene2-Core Workflow Timing

Based on `.github/workflows/` in gene2-core repository:

#### Phase 1-2: Requirements (01-requirements.workflows.md)

**Artifact**: `/docs/01-requirements/user-stories.md`

**Timing**: Created during STAGE 2 (PRD Creation)
- Product Owner creates user story catalog
- Format: `### US-001: Title`
- Epic references: `**Epic**: EPIC-001`

**Trigger for Completeness Counter**:
- Watch for file creation/modification: `/docs/01-requirements/user-stories.md`
- Parse story count: `###\s+(US-\d+):`
- Parse epic count: `\*\*Epic\*\*:\s*(EPIC-\d+)` (distinct)

---

#### Phase 6-7: Planning (04-planning.workflows.md)

**Artifact**: `/docs/05-implementation/epics/{EPIC-REF}/` folders

**Timing**: Created during STAGE 6 (Iteration Planning)
- Project Manager creates epic folders
- Format: `/docs/05-implementation/epics/epic-01/`

**Trigger for Completeness Counter**:
- Watch for folder creation: `/docs/05-implementation/epics/`
- Count folders matching: `epic-\d+`

---

#### Phase 8: Implementation (05-implementation.workflows.md)

**Artifact**: `/docs/05-implementation/user-stories.md` (tracking file)

**Timing**: Created during STAGE 8 (Implementation Planning)
- Dev Lead copies stories from PRD and adds status tracking
- Format: `**Status**: 🔵 Not Started | 🟡 In Progress | ✅ Delivered`

**Trigger for Completeness Counter**:
- Watch for file creation/modification: `/docs/05-implementation/user-stories.md`
- Parse story statuses: `\*\*Status\*\*:\s*[^a-zA-Z]*(Not Started|In Progress|Delivered)`
- Count completed: `status = "Delivered"`

---

### Workflow Detection Algorithm (Simplified)

```typescript
function detectArtifactCreationPhase(filePath: string): string {
  if (filePath.includes('/01-requirements/user-stories.md')) {
    return 'Phase 1-2: Requirements (PRD created)';
  }
  
  if (filePath.includes('/05-implementation/epics/epic-')) {
    return 'Phase 6-7: Planning (Epic folders created)';
  }
  
  if (filePath.includes('/05-implementation/user-stories.md')) {
    return 'Phase 8: Implementation (Status tracking created)';
  }
  
  return 'Unknown phase';
}
```

---

## Conclusion

This implementation plan addresses all 4 critical field testing issues with systematic, layer-by-layer solutions. Each issue includes:

✅ **Root Cause Analysis**: Precise identification of code-level failures  
✅ **Solution Design**: Algorithmic approach with decision logic  
✅ **Implementation Tasks**: File-by-file changes with code examples  
✅ **Test Scenarios**: BDD-style acceptance criteria  
✅ **Effort Estimation**: Realistic hour estimates per layer  
✅ **Risk Assessment**: Mitigation strategies for known challenges  

**Total Effort**: ~4 dev-days (31.5 hours)  
**Expected Impact**: Transform extension from "demo" to "production-ready" for field projects  
**Next Step**: Sprint planning → Layer 1 implementation → TDD cycle begins

---

**Document Status**: ✅ Ready for Dev-Lead Approval  
**Version**: 1.0  
**Date**: May 4, 2026  
**Author**: Tech Lead (Sebastian)
