Feature: Completeness Meter with Project Progress Tracking
  As a product owner and developer
  I want to see project completion percentage (0-100%) with detailed metrics
  So that I can track progress toward delivery goals

  Background:
    Given the Pixel Agents dashboard is active
    And the Completeness Meter is visible on the right side
    And the user-stories.md file exists in /docs/05-implementation/

  @critical @layer-4
  Scenario: Display Completeness Meter on right side
    Given the dashboard is loaded
    Then I should see a vertical progress bar on the right side
    And the progress bar should display "Project Completion" label
    And the bar should show current completion percentage

  @critical @layer-1 @layer-4
  Scenario: Show completion percentage from 0-100%
    Given 7 out of 14 user stories are delivered
    When the Completeness Meter updates
    Then the progress bar should display "50%"
    And the filled portion should represent 50% of the total height

  @critical @layer-1 @layer-2 @layer-4
  Scenario: Display key project metrics
    Given the project has the following metrics:
      | Metric              | Value |
      | Stories Total       | 14    |
      | Stories Completed   | 7     |
      | Tests Total         | 500   |
      | Tests Passing       | 485   |
      | Code Coverage       | 92%   |
      | Lines of Code       | 8500  |
    When I hover over the Completeness Meter
    Then I should see a tooltip displaying all metrics:
      """
      Project Completion: 50%
      
      Stories: 7 / 14 (50%)
      Tests: 485 / 500 passing (97%)
      Coverage: 92%
      Lines of Code: 8,500
      """

  @critical @layer-2
  Scenario: Calculate completion from user-stories.md
    Given the user-stories.md file contains:
      """
      ## User Stories
      ### US-001-001: Task Progression Bar
      **Status**: Delivered
      
      ### US-001-002: Agent Activity Display
      **Status**: Implemented
      
      ### US-001-003: Document Watcher
      **Status**: In Progress
      
      ### US-002-001: Context Window Bar
      **Status**: Not Started
      """
    When the Completeness Calculator parses the file
    Then the calculated completion should be 50%
    And the stories breakdown should show:
      | Status       | Count |
      | Delivered    | 1     |
      | Implemented  | 1     |
      | In Progress  | 1     |
      | Not Started  | 1     |

  @critical @layer-2 @layer-3
  Scenario: Update metrics within 500ms of file changes
    Given the project completion is 50%
    When a user story status changes from "In Progress" to "Delivered"
    And the user-stories.md file is saved
    Then the Completeness Meter should update within 500ms
    And the new completion percentage should be 57% (8/14)

  @critical @layer-1 @layer-4
  Scenario: Trigger milestone celebration at 25% completion
    Given the project completion is 21%
    When a story is completed
    And the completion reaches 25%
    Then I should see a milestone celebration with:
      | Element    | Value                 |
      | Badge      | 🎉                    |
      | Message    | "Quarter Mark!"       |
      | Animation  | Confetti (blue/green) |
      | Duration   | 3 seconds             |

  @critical @layer-1 @layer-4
  Scenario: Trigger milestone celebration at 50% completion
    Given the project completion is 48%
    When a story is completed
    And the completion reaches 50%
    Then I should see a milestone celebration with:
      | Element    | Value                 |
      | Badge      | 🏅                    |
      | Message    | "Halfway There!"      |
      | Animation  | Confetti (silver)     |
      | Duration   | 3 seconds             |

  @critical @layer-1 @layer-4
  Scenario: Trigger milestone celebration at 75% completion
    Given the project completion is 73%
    When a story is completed
    And the completion reaches 75%
    Then I should see a milestone celebration with:
      | Element    | Value                 |
      | Badge      | ⭐                    |
      | Message    | "Almost Done!"        |
      | Animation  | Star burst (gold)     |
      | Duration   | 3 seconds             |

  @critical @layer-1 @layer-4
  Scenario: Trigger milestone celebration at 100% completion
    Given the project completion is 98%
    When the final story is completed
    And the completion reaches 100%
    Then I should see a milestone celebration with:
      | Element    | Value                         |
      | Badge      | 🏆                            |
      | Message    | "Project Victory!"            |
      | Animation  | Trophy + Fireworks + Fanfare  |
      | Duration   | 5 seconds                     |

  @medium @layer-2 @layer-4
  Scenario: Show breakdown by epic and layer
    Given the project has 3 epics:
      | Epic       | Stories | Completed | Progress |
      | EPIC-001   | 3       | 3         | 100%     |
      | EPIC-002   | 3       | 1         | 33%      |
      | EPIC-003   | 8       | 0         | 0%       |
    When I click on the Completeness Meter
    Then I should see a detailed breakdown:
      """
      Project Completion: 28% (4/14)
      
      By Epic:
      • EPIC-001: 3/3 ✅ (100%)
      • EPIC-002: 1/3 🟡 (33%)
      • EPIC-003: 0/8 ⏳ (0%)
      
      By Layer:
      • Layer 1: 100%
      • Layer 2: 50%
      • Layer 3: 25%
      • Layer 4: 25%
      """

  @edge-case @layer-2
  Scenario: Handle empty project (no stories)
    Given the user-stories.md file contains no stories
    When the Completeness Meter attempts to calculate metrics
    Then the meter should display "0%"
    And the tooltip should show:
      """
      Project Completion: 0%
      No user stories found.
      """

  @edge-case @layer-2
  Scenario: Handle 100% completion (all stories delivered)
    Given all 14 stories are marked as "Delivered"
    When the Completeness Meter calculates metrics
    Then the meter should display "100%"
    And the milestone celebration should trigger once
    And the tooltip should show:
      """
      Project Completion: 100%
      🎉 All stories delivered!
      """

  @edge-case @layer-2
  Scenario: Handle malformed user-stories.md file
    Given the user-stories.md file has invalid status values
    When the Completeness Calculator parses the file
    Then the calculator should use default status "Unknown"
    And the meter should display a warning:
      """
      ⚠️ Unable to parse some story statuses
      Check user-stories.md formatting
      """

  @performance @layer-2
  Scenario: Handle large projects (1000+ stories) efficiently
    Given the user-stories.md file contains 1200 user stories
    When the Completeness Calculator parses the file
    Then parsing should complete within 500ms
    And the meter should update without lag

  @accessibility @layer-4
  Scenario: Support keyboard navigation and screen readers
    Given a user navigates with keyboard only
    When the user tabs to the Completeness Meter
    Then the meter should receive focus
    And the screen reader should announce:
      """
      Project Completion Meter, 50% complete, 7 of 14 stories delivered
      """

  @accessibility @layer-4
  Scenario: Support reduced motion preferences
    Given the user has "prefers-reduced-motion" enabled
    When a milestone celebration is triggered
    Then animations should be disabled
    And the badge should display instantly without animation
