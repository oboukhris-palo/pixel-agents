Feature: Update UI in Real-Time and Handle Performance
  As a developer monitoring agent progress
  I want UI updates to appear quickly with no lag
  So that I can see what the agent is doing as it happens

  Scenario: Update in Real-Time When Broadcaster Sends Event
    Given AgentActivityMonitor is mounted and listening for ActionBubbleMessage
    When agent.activity.ts broadcasts a new ActionBubbleMessage
    Then the component updates within 500ms
    And the old code snippet is replaced with the new one
    And there is no flickering or jarring transitions

  Scenario: Handle Rapid Successive Updates Without Lag
    Given the active agent is rapidly writing code (10 updates in 1 second)
    When all ActionBubbleMessage events arrive in quick succession
    Then the component debounces updates to prevent animation spam
    And only the final update is displayed to the user
    And the UI remains responsive (no freezing)

  Scenario: First Render Performance
    Given ActionBubble component is being mounted with active agent data
    When the component performs its initial render
    Then the first render completes in less than 100ms
    And no sibling components are re-rendered due to this update

  Scenario: Component Isolation with React.memo
    Given TaskProgressionBar and ActionBubble are both in the dashboard
    When ActionBubble receives a new message and re-renders
    Then TaskProgressionBar does NOT re-render
    And other dashboard components remain unaffected
