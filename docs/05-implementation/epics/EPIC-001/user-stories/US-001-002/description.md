---
story_id: US-001-002
epic_id: EPIC-001
epic_name: Dashboard Monitoring & Visualization
story_points: 8
priority: HIGH
status: Not Started
created: 2026-04-23
last_updated: 2026-04-23
---

# User Story: Real-Time Agent Activity Monitor with Code Snippets

## Story Statement

As a developer watching Pixel Agents execute TDD cycles, I want to see real-time code snippets being written by the active agent, so that I can monitor implementation progress and understand what code changes are happening in real-time.

---

## Business Value

**Engagement**: Shows live coding activity creates visual feedback loop that makes agent work tangible  
**Transparency**: Code snippets prove agents are actually implementing, not just talking  
**Debugging**: Code display helps identify when agent is going wrong direction before full layer completion  
**Learning**: Developers see patterns of how AI agents solve problems (educational value)

---

## Acceptance Criteria

**AC1**: Display Agent Sidebar (180px width × 246px height) with agent list and status indicators
- Sidebar background: #252526 (VS Code sidebar), right border: 1px #3E3E42
- "AGENTS" header: 10px text, #808080, weight 600, uppercase
- Agent rows: 28px height, virtual scrolling for 10+ agents (ROW_HEIGHT = 28px)
- Status dots: 8×8px circles at x:12 position
  - Active: #2ECC71 (green) with subtle pulse animation (opacity 0.7→1.0, 2s loop)
  - Thinking: #F39C12 (orange) with blink animation (opacity 0.3→1.0, 1s loop)
  - Idle: #6B7280 (gray) no animation
  - Error: #E74C3C (red) fast blink (0.5s loop)
- Agent names: 10px text, weight 400 (600 if active), color varies by status
- Active bar: 3×16px colored strip on left edge for active agent only

**AC2**: Display Action Bubble (80×18px) above active agent in Office Canvas
- Background: #1E1E1E @ 90% opacity, border: 1px agent color @ 50%, border-radius: 4px
- Text: 8px, agent color @ 80%, content: "✍️ writing..." or current file name
- Code snippet: Last 5-15 lines in syntax-highlighted code block below bubble
- Scrolls to show latest code (auto-scroll on new content)
- Maximum 200 characters per line with truncation indicator (...)
- Copy-to-clipboard button on code block header (12px, hover reveals)

**AC3**: Show action type and timestamp for clarity
- Format: "[RED-01] Implement validation" @ 09:45:33Z
- Time is UTC with seconds precision
- Action type pulled from commit message pattern

**AC4**: Update UI in real-time (within 500ms) when agent.activity.ts broadcasts updates
- Uses ActionBubbleMessage via useExtensionMessages hook
- No flickering or lag (component updates via shallow comparison)
- Gracefully handles rapid successive updates

**AC5**: Animate code snippet appearance with subtle fade-in (300ms)
- Toast-like notification style above office canvas
- Not disruptive to other dashboard elements
- Positions above TaskProgressionBar

**AC6**: Display agent status indicators in sidebar and Action Bubble
- ✅ Success (green #10B981): checkmark when code compiles/tests pass
- 🔄 In Progress (yellow #F59E0B): spinner during implementation
- ❌ Failed (red #EF4444): X if agent reports error or tests fail
- Status updates from agentActivityMonitor.ts broadcaster
- Indicator appears next to agent name in sidebar (12px icon)

**AC7**: Handle edge cases gracefully
- Empty/null code snippets → show "Waiting for code..." placeholder
- Rapid updates → debounce to prevent animation spam
- Invisible if no active agent → component unmounts or grayed out
- Very long code lines → truncate with scroll indicator

**AC8**: Performance requirements
- First render <100ms
- Update propagation <500ms
- No re-renders of siblings when ActionBubble updates
- Memory usage <5MB for history (max 50 snippets in memory)

---

## BDD Scenarios

5. **Display Agent Sidebar with Status Dots**
   - Given: AgentActivityMonitor mounted with multiple agents
   - When: Agent "dev-tdd-red" is active
   - Then: Sidebar displays agent list with green status dot next to dev-tdd-red, 3px left accent bar in RED phase color (#FF5500)

2. **Display Code Snippet with Syntax Highlighting**
   - Given: Component has received ActionBubbleMessage with code snippet
   - When: Code snippet is "const validate = (email) => /^[^@]+@[^@]+$/.test(email);"
   - Then: Code renders in code block with TypeScript syntax highlighting

3. **Show Action Type and Timestamp**
   - Given: Current TDD cycle is RED-01
   - When: ActionBubbleMessage includes timestamp "2026-04-23T09:45:33Z"
   - Then: Component displays "[RED-01] Implement validation @ 09:45:33Z"

4. **Update in Real-Time When Broadcaster Sends Event**
   - Given: Agent.activity.ts broadcasts new ActionBubbleMessage
   - When: Code snippet changes to different content
   - Then: Component updates within 500ms and old snippet is replaced

5. **Display Agent Status Indicator**
   - Given: Agent is actively implementing (status = "in-progress")
   - When: Component receives ActionBubbleMessage with status field
   - Then: Component displays yellow 🔄 spinner next to agent name

6. **Animate Code Snippet Appearance**
   - Given: New code snippet arrives
   - When: Component renders new ActionBubble
   - Then: Code block fades in over 300ms (CSS animation)

7. **Copy Code to Clipboard**
   - Given: User hovers over code block header
   - When: User clicks copy button
   - Then: Code snippet is copied to clipboard and toast shows "Copied!"

8. **Handle Empty Code Gracefully**
   - Given: Agent hasn't generated code yet
   - When: ActionBubbleMessage has null/empty code field
   - Then: Component displays "Waiting for code..." placeholder text

9. **Debounce Rapid Updates**
   - Given: Agent broadcasts 10 code updates in 1 second
   - When: All updates arrive with timestamps
   - Then: Component shows only final update, preventing animation spam (debounce 300ms)

10. **Unmount When No Active Agent**
    - Given: Active agent completes and no next agent assigned
    - When: Agent.activity.ts broadcasts "no active agent"
    - Then: Component grays out or unmounts cleanly

---

## Dependencies

**Prerequisite Stories**:
- ✅ **US-001-001**: Task Progression Bar (message protocol established, useExtensionMessages hook proven)

**Technical Prerequisites**:
- Agent.activity.ts service broadcasting ActionBubbleMessage events
- `.github/agents/` folder accessible for agent metadata (name, role, spriteColor, icon)
- Code syntax highlighter library (highlight.js or Prism.js already in dependencies)

**External Dependencies**:
- None (internal monitoring only, no external APIs)

---

## Technical Constraints

**From architecture-design.md**:
- Max 5 concurrent ActionBubble instances (prevent dashboard clutter)
- Must not block TaskProgressionBar or other monitors
- Message protocol must match existing ActionBubbleMessage type contract

**From design-systems.md**:
- Animation timing: fade-in 300ms, ease-out cubic
- Color palette: Phase colors (RED/GREEN/REFACTOR/DOCUMENTATION)
- Typography: Monospace font (Monaco/Menlo/Courier) for code blocks
- Z-index: Above canvas (z-10) but below modal dialogs (z-20)

**Performance**:
- Component must use React.memo to prevent parent re-renders
- useExtensionMessages hook must not cause re-renders of TaskProgressionBar
- Max 50 code snippets in memory history (circular buffer)

---

## Related Documentation

**PRD User Story**: [docs/01-requirements/user-stories.md](../../../../01-requirements/user-stories.md#us-001-002)  
**Architecture Design**: [docs/02-architecture/architecture-design.md](../../../../02-architecture/architecture-design.md)  
**Tech Spec**: [docs/02-architecture/tech-spec.md](../../../../02-architecture/tech-spec.md)  
**Design System**: [docs/02-architecture/design-systems.md](../../../../02-architecture/design-systems.md)  
**Previous Story (Patterns)**: [US-001-001 Completion Summary](../US-001-001/COMPLETION-SUMMARY.md)  
**Agent Metadata**: [.github/agents/](../../../../../../.github/agents/)  
**Implementation Plan**: [implementation-plan.md](./implementation-plan.md)  

---

## Definition of Done

- ✅ All 10 BDD scenarios passing and integrated into project
- ✅ ActionBubbleMessage type defined and exported from types.ts
- ✅ Agent.activity.ts service broadcasting ActionBubbleMessage events
- ✅ useAgentActivity hook created for message subscription
- ✅ ActionBubble component renders code with syntax highlighting
- ✅ Real-time updates work within 500ms from broadcast
- ✅ Copy-to-clipboard functionality working
- ✅ 100% test coverage (>80% required, 100% target)
- ✅ Code review approved (0 critical, ≤2 high issues)
- ✅ No regressions in TaskProgressionBar or other components
- ✅ Accessibility: WCAG 2.1 AA compliant (ARIA labels on buttons, keyboard nav)
- ✅ Performance: <100ms first render, <500ms updates
- ✅ Cyclomatic complexity: <10 all functions
- ✅ Documentation: JSDoc on public APIs, inline comments for business logic
- ✅ Git history preserved (full commit trail RED → GREEN → REFACTOR)

---

**Story Status**: Ready for Layer 1 implementation  
**Next Step**: Await plan approval via plan-approval.yaml, then begin Layer 1 RED phase
