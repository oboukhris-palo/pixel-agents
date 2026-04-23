# BDD Scenarios for US-001-002: Agent Activity Monitor

This directory will contain Gherkin feature files for the AgentActivityMonitor story.

## Scenario Structure

After BA agent creates detailed BDD scenarios, the following feature files will be generated:

- `agent-activity-display.feature` — Display active agent metadata and code snippets
- `agent-status-indicator.feature` — Show status indicators (✅/🔄/❌)
- `code-animation.feature` — Verify fade-in animations and timing
- `copy-to-clipboard.feature` — Copy functionality and toast notifications
- `real-time-updates.feature` — Message protocol integration and <500ms latency
- `edge-cases.feature` — Null snippets, empty code, no active agent handling

## Current Status

**Status**: Awaiting BA agent to create BDD scenarios from description.md acceptance criteria

**10 Acceptance Criteria** to drive BDD scenarios:
1. Display active agent's name and role icon
2. Display real-time code snippet with syntax highlighting
3. Show action type and timestamp
4. Update UI in real-time (<500ms)
5. Animate code snippet appearance (300ms fade-in)
6. Display agent status indicators (✅/🔄/❌)
7. Handle edge cases gracefully
8. Performance requirements (<100ms render, <500ms updates)
9. Debounce rapid updates
10. Unmount when no active agent

## Next Step

Once BA creates feature files from these criteria, they will be placed in this directory:
- `features/agent-activity/agent-activity-display.feature`
- `features/agent-activity/agent-status-indicator.feature`
- etc.

Feature files will include:
- Feature description (business value)
- Scenario: ... (Given/When/Then format)
- Scenario Outline: ... (parameterized tests)
- Background: (common setup, if needed)

## Integration with TDD

1. **RED Phase**: dev-tdd-red creates step definitions + failing unit tests
2. **GREEN Phase**: dev-tdd-green implements code to pass BDD tests
3. **REFACTOR Phase**: dev-tdd-refactor improves code quality while keeping tests green

All BDD scenarios must pass by story completion.
