Feature: Context Window Bar with Token Usage Visualization
  As a developer using GitHub Copilot
  I want to see real-time context window usage (0-100%)
  So that I can optimize my prompts and prevent token overflow

  Background:
    Given the Pixel Agents dashboard is active
    And the Context Window Bar is visible on the left side
    And the extension is connected to GitHub Copilot

  @critical @layer-4
  Scenario: Display Context Window Bar on left side
    Given the dashboard is loaded
    Then I should see a vertical progress bar on the left side
    And the progress bar should display "Context Window" label
    And the bar should show current usage percentage

  @critical @layer-1 @layer-4
  Scenario: Show context usage percentage from 0-100%
    Given the current token usage is 45000 out of 100000
    When the Context Window Bar updates
    Then the progress bar should display "45%"
    And the filled portion should represent 45% of the total height

  @critical @layer-1 @layer-4
  Scenario: Color-code warnings (green, yellow, red)
    Given the current token usage is <usage_percentage>%
    When the Context Window Bar updates
    Then the progress bar color should be "<color>"
    And the warning level should be "<level>"

    Examples:
      | usage_percentage | color  | level   |
      | 30               | green  | safe    |
      | 50               | green  | safe    |
      | 70               | green  | safe    |
      | 75               | yellow | caution |
      | 85               | yellow | caution |
      | 90               | red    | danger  |
      | 95               | red    | danger  |

  @critical @layer-2 @layer-4
  Scenario: Show token breakdown (.github vs. project vs. chat)
    Given the total token usage is 80000
    And .github instructions use 30000 tokens
    And project code uses 35000 tokens
    And chat history uses 15000 tokens
    When I hover over the Context Window Bar
    Then I should see a tooltip with the breakdown:
      | Category      | Tokens | Percentage |
      | .github       | 30000  | 37.5%      |
      | Project Code  | 35000  | 43.75%     |
      | Chat History  | 15000  | 18.75%     |
      | Total         | 80000  | 100%       |

  @critical @layer-2 @layer-3
  Scenario: Update within 100ms of token usage change
    Given the current token usage is 50000
    When a new message is sent to Copilot Chat
    And the token usage increases to 55000
    Then the Context Window Bar should update within 100ms
    And the new percentage should display "55%"

  @medium @layer-4
  Scenario: Display tooltip with exact token counts
    Given the current token usage is 75000 out of 100000
    When I hover over the Context Window Bar
    Then I should see a tooltip displaying:
      """
      Context Window Usage
      75,000 / 100,000 tokens (75%)
      
      Breakdown:
      • .github: 28,000 (37%)
      • Project: 32,000 (43%)
      • Chat: 15,000 (20%)
      
      Remaining: 25,000 tokens
      """

  @critical @layer-2 @layer-4
  Scenario: Show warning notification at 70% threshold
    Given the current token usage is 68000 (68%)
    When a new file is opened
    And the token usage increases to 72000 (72%)
    Then I should see a yellow warning notification:
      """
      ⚠️ Context Window 72% Full
      Consider clearing chat history or reducing context
      """

  @critical @layer-2 @layer-4
  Scenario: Show critical warning at 90% threshold
    Given the current token usage is 88000 (88%)
    When a large file is analyzed
    And the token usage increases to 92000 (92%)
    Then I should see a red critical notification:
      """
      🚨 Context Window 92% Full
      CRITICAL: Close to token limit. Clear context immediately.
      """

  @edge-case @layer-2
  Scenario: Handle missing Copilot API gracefully
    Given the GitHub Copilot extension is not active
    When the Context Window Bar attempts to fetch token usage
    Then the bar should display "N/A"
    And the tooltip should show:
      """
      Context Window Unavailable
      GitHub Copilot API not accessible
      """

  @edge-case @layer-2
  Scenario: Handle token usage calculation errors
    Given the Copilot API returns invalid token data
    When the Context Window Bar processes the response
    Then the bar should display "Error"
    And the tooltip should show:
      """
      Unable to calculate token usage
      Check Copilot connection
      """

  @performance @layer-2
  Scenario: Debounce rapid token usage updates
    Given rapid token usage changes occur (10 updates per second)
    When the Context Window Bar receives update events
    Then updates should be debounced to maximum 10 per second
    And the UI should remain responsive

  @accessibility @layer-4
  Scenario: Support keyboard navigation and screen readers
    Given a user navigates with keyboard only
    When the user tabs to the Context Window Bar
    Then the bar should receive focus
    And the screen reader should announce:
      """
      Context Window Bar, 75% full, 75000 of 100000 tokens used, warning level caution
      """

  @accessibility @layer-4
  Scenario: Support reduced motion preferences
    Given the user has "prefers-reduced-motion" enabled
    When the Context Window Bar updates
    Then progress bar transitions should be instant (no animation)
    And warning color changes should be immediate
