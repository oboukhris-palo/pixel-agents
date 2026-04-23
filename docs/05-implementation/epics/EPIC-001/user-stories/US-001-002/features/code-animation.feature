Feature: Animate Code Snippet Appearance with Fade-In
  As a developer
  I want code snippets to appear smoothly with animation
  So that the UI feels polished and I notice when new code appears

  Scenario: Fade-In Animation on Code Snippet Appearance
    Given a new code snippet is about to be displayed
    When the ActionBubble component renders the code block
    Then the code block fades in over 300ms using CSS animation
    And the animation uses ease-out cubic-bezier timing (0.25, 0.46, 0.45, 0.94)
    And the animation is smooth and not jarring

  Scenario: Animation Timing Matches Specification
    Given the code block animation is starting
    When the component applies the fade-in CSS keyframes
    Then the animation duration is exactly 300ms
    And the animation completes within ±50ms of expected time
    And the animation does not block any other UI interactions

  Scenario: No Animation Flickering on Rapid Updates
    Given rapid code updates are arriving (every 100ms)
    When each update triggers a fade-in animation
    Then animations are debounced to prevent flickering
    And only the final update animates to the user
    And the UI remains smooth and responsive

  Scenario: Animation Works Across Different Browsers
    Given the ActionBubble component runs in Chrome, Firefox, Safari
    When the fade-in animation is applied
    Then the animation works consistently across all browsers
    And the timing is accurate on all platforms
