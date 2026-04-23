Feature: Display Active Agent Metadata and Code Snippets
  As a developer
  I want to see the active agent's name, role, and icon
  So that I understand which agent is currently implementing code

  Scenario: Display Active Agent Name and Role Icon
    Given AgentActivityMonitor is mounted and has received an active agent
    When the active agent is "dev-tdd-red"
    Then the component displays "🔴 dev-tdd-red" with RED phase color
    And the role icon reflects the agent type from .github/agents metadata

  Scenario: Display Real-Time Code Snippet with Syntax Highlighting
    Given AgentActivityMonitor has received an ActionBubbleMessage
    When the code snippet is "const validate = (email) => /^[^@]+@[^@]+$/.test(email);"
    Then the code renders in a code block with TypeScript syntax highlighting
    And the code is readable with proper indentation and styling

  Scenario: Show Action Type and Timestamp
    Given the current TDD cycle is RED-01
    When ActionBubbleMessage includes timestamp "2026-04-23T09:45:33Z"
    Then the component displays "[RED-01] Implement validation @ 09:45:33Z"
    And the timestamp uses UTC time with seconds precision
    And the action type is extracted from the commit message pattern

  Scenario: Handle Multiple Code Snippets Sequentially
    Given the active agent is implementing a complex feature
    When multiple code updates arrive in sequence
    Then each code snippet replaces the previous one in the UI
    And the timestamp updates to reflect the latest change
