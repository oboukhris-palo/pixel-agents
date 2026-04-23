Feature: Handle Edge Cases and Error Scenarios
  As a developer
  I want the component to handle unusual situations gracefully
  So that the dashboard remains stable even when unexpected data arrives

  Scenario: Display Placeholder When No Code Snippet Available
    Given the ActionBubbleMessage has been received
    When the code snippet field is null or empty
    Then the component displays "Waiting for code..." placeholder text
    And the placeholder appears in the same location as code would
    And the status indicator is still visible

  Scenario: Handle Very Long Code Lines
    Given a code line is longer than 200 characters
    When the component renders the code block
    Then the line is truncated with "..." indicator
    And the truncated line is still syntax-highlighted correctly
    And horizontal scroll or wrapping is available

  Scenario: Unmount Component When No Active Agent
    Given the ActionBubble component is mounted and displaying an agent
    When the active agent completes and no next agent is assigned
    Then the component gracefully unmounts or grays out
    And no errors are thrown
    And other dashboard components are unaffected

  Scenario: Handle Null Agent Metadata
    Given agent metadata is requested but unavailable
    When the component tries to display the agent name/icon
    Then a generic "Unknown Agent" label is shown
    And the component continues to display the code snippet
    And no errors are thrown

  Scenario: Handle Rapid Agent Transitions
    Given one agent is completing (status = "success")
    When a new agent immediately starts (different agent name)
    Then the old agent's snippet is cleared
    And the new agent's snippet appears with proper animation
    And no console errors or warnings appear

  Scenario: Handle Empty Action Description
    Given an ActionBubbleMessage with empty description field
    When the component renders the action metadata
    Then it displays "[RED-01] @ HH:MM:SSZ" (without description)
    And the timestamp and cycle are still visible
    And the component does not break or show errors

  Scenario: Limit Memory Usage with Snippet History
    Given the component stores up to 50 code snippets
    When the 51st snippet arrives
    Then the oldest snippet is removed from memory
    And total memory usage stays under 5MB
    And the UI only displays the current snippet (not history)

  Scenario: Handle Malformed ActionBubbleMessage
    Given a corrupted or malformed ActionBubbleMessage arrives
    When the message handler tries to process it
    Then the message is safely ignored
    And the component does not crash
    And the previous valid state is maintained
