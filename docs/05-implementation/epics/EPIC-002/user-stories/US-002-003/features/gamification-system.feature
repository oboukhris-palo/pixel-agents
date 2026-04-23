Feature: Gamification Mechanics System with Achievements and Streaks
  As a developer
  I want to earn achievements, streaks, and PRU efficiency scores
  So that I stay motivated and engaged during development

  Background:
    Given the Pixel Agents dashboard is active
    And the Achievement System is initialized
    And achievement history is loaded from persistent storage

  @critical @layer-1 @layer-2 @layer-4
  Scenario: Award achievement badge on milestone completion
    Given the project completion is 24%
    When a user story is completed
    And the project completion reaches 25%
    Then an achievement should unlock:
      | ID            | Name          | Badge | Color  |
      | milestone-25  | Quarter Mark  | 🏅    | bronze |
    And I should see a notification displaying the achievement
    And the achievement should be saved to persistent storage

  @critical @layer-1 @layer-2 @layer-4
  Scenario: Track consecutive task completion streak
    Given I have completed tasks on 6 consecutive days
    And today is day 7
    When I complete a task today
    Then my streak should update to 7 days
    And I should unlock the "Week Warrior" achievement:
      | ID       | Name          | Badge | Color  |
      | streak-7 | Week Warrior  | 🔥    | silver |
    And the notification should display:
      """
      🔥 Week Warrior Unlocked!
      7-day streak achieved!
      """

  @critical @layer-1 @layer-2
  Scenario: Calculate PRU efficiency score
    Given I have completed 10 story points
    And I have used 18000 PRU tokens total
    When the PRU score is calculated
    Then my efficiency should be 1800 PRU/point
    And my rank should be "expert"
    And I should see the PRU score displayed as:
      """
      PRU Efficiency: 1,800 per story point
      Rank: Expert ⭐
      """

  @critical @layer-4
  Scenario: Display achievement notification with celebration animation
    Given an achievement is unlocked
    When the notification appears
    Then I should see:
      | Element    | Value                          |
      | Position   | Top-right corner               |
      | Animation  | Slide-in from right            |
      | Badge      | Achievement icon + color       |
      | Title      | Achievement name               |
      | Message    | Achievement description        |
      | Duration   | 5 seconds (then auto-dismiss)  |

  @critical @layer-2
  Scenario: Persist achievement history across sessions
    Given I have unlocked 5 achievements
    And I close VS Code
    When I reopen VS Code
    And the Pixel Agents dashboard loads
    Then all 5 achievements should be restored
    And the streak counter should show my current streak
    And the PRU score should display my latest efficiency

  @medium @layer-4
  Scenario: Display leaderboard with all achievements
    Given I have unlocked the following achievements:
      | ID            | Name          | Unlocked At       |
      | first-story   | First Steps   | 2026-04-20 10:00  |
      | milestone-25  | Quarter Mark  | 2026-04-21 14:30  |
      | streak-3      | 3-Day Streak  | 2026-04-22 09:15  |
    When I open the achievement leaderboard
    Then I should see all unlocked achievements displayed
    And they should be sorted by unlock date (newest first)
    And each achievement should show:
      | Field       | Value                |
      | Badge       | Icon + color         |
      | Name        | Achievement name     |
      | Description | Criteria             |
      | Unlocked    | Date and time        |

  @medium @layer-1 @layer-2
  Scenario: Configure achievement difficulty settings
    Given I am in the settings panel
    When I set difficulty to "Casual"
    Then milestone thresholds should be:
      | Threshold  | Stories Required |
      | 25%        | 3 stories        |
      | 50%        | 6 stories        |
      | 75%        | 9 stories        |
      | 100%       | 12 stories       |
    When I set difficulty to "Normal"
    Then milestone thresholds should use actual story percentages
    When I set difficulty to "Hard"
    Then milestone thresholds should be:
      | Threshold  | Stories Required |
      | 25%        | 5 stories        |
      | 50%        | 10 stories       |
      | 75%        | 15 stories       |
      | 100%       | 20 stories       |

  @edge-case @layer-2
  Scenario: Handle streak reset when a day is missed
    Given I have a 5-day streak
    And my last completion was 2 days ago
    When I complete a task today
    Then my current streak should reset to 1
    And my longest streak should remain 5
    And I should see a message:
      """
      Streak Reset
      New streak started: 1 day
      Previous best: 5 days
      """

  @edge-case @layer-2
  Scenario: Prevent duplicate achievement unlocks
    Given I have already unlocked "Quarter Mark" achievement
    When the project reaches 25% again (after dropping below 25%)
    Then the achievement should not unlock again
    And no notification should appear

  @edge-case @layer-2
  Scenario: Handle corrupted achievement state gracefully
    Given the persistent storage is corrupted
    When the Achievement System loads
    Then it should reset to default state
    And I should see a warning:
      """
      ⚠️ Achievement History Corrupted
      Your progress has been reset. This is a one-time event.
      """

  @performance @layer-2 @layer-4
  Scenario: Rate-limit achievement notifications
    Given 5 achievements are unlocked simultaneously
    When the notifications are triggered
    Then notifications should display one at a time
    And there should be a 5-second delay between notifications
    And all 5 notifications should eventually display

  @accessibility @layer-4
  Scenario: Support keyboard navigation for achievement panel
    Given the achievement leaderboard is open
    When the user navigates with keyboard only
    Then the user should be able to:
      | Action              | Key Binding  |
      | Tab through items   | Tab          |
      | Scroll up/down      | Arrow keys   |
      | Close panel         | Escape       |
      | View details        | Enter/Space  |

  @accessibility @layer-4
  Scenario: Support screen reader announcements for achievements
    Given an achievement is unlocked
    When the notification appears
    Then the screen reader should announce:
      """
      Achievement unlocked: Quarter Mark
      You have reached 25% project completion
      Badge: Medal, bronze
      """

  @accessibility @layer-4
  Scenario: Support reduced motion preferences for celebrations
    Given the user has "prefers-reduced-motion" enabled
    When an achievement notification appears
    Then the slide-in animation should be disabled
    And the notification should appear instantly
    And the badge should display without animation

  @integration @layer-2 @layer-3
  Scenario: Subscribe to completeness meter events for milestone achievements
    Given the Completeness Meter is active
    And the Achievement Engine is subscribed to completion events
    When the project completion changes from 24% to 26%
    Then the Achievement Engine should receive the event
    And it should unlock "Quarter Mark" achievement
    And it should broadcast an achievement unlocked message

  @integration @layer-2 @layer-3
  Scenario: Subscribe to story completion events for streak tracking
    Given I have a 2-day streak
    When a story is marked as "Delivered" in user-stories.md
    Then the Achievement Engine should receive the completion event
    And it should update my streak to 3 days
    And if this is a new streak milestone, it should unlock the achievement
