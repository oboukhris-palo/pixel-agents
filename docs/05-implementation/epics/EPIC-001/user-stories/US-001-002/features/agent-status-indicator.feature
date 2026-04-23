Feature: Display Agent Status Indicators
  As a developer
  I want to see the agent's current status (in-progress, success, failed)
  So that I know whether the agent is actively working or has encountered an issue

  Scenario: Display Green Checkmark for Success Status
    Given the active agent is "dev-tdd-green"
    When the status field is "success"
    Then the component displays a green checkmark (✅) next to the agent name
    And the checkmark appears after the code snippet is displayed

  Scenario: Display Yellow Spinner for In-Progress Status
    Given the active agent is implementing code
    When the status field is "in-progress"
    Then the component displays a yellow spinner (🔄) next to the agent name
    And the spinner animates continuously

  Scenario: Display Red X for Failed Status
    Given the active agent encountered an error
    When the status field is "failed"
    Then the component displays a red X (❌) next to the agent name
    And the error is indicated clearly to the user

  Scenario: Update Status Indicator When Status Changes
    Given the component is displaying a status indicator
    When ActionBubbleMessage arrives with a different status
    Then the status indicator updates immediately
    And the change is visually distinct (not confusing)
