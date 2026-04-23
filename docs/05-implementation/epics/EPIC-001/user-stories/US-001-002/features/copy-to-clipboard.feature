Feature: Copy Code Snippet to Clipboard
  As a developer
  I want to copy code snippets with a single click
  So that I can paste them into my editor or notes

  Scenario: Copy Button Appears on Code Block Header
    Given the code block is displayed
    When the user hovers over the code block header
    Then a copy button appears (icon: 📋 or similar)
    And the button is clearly visible and clickable

  Scenario: Copy Code to Clipboard on Button Click
    Given the copy button is visible and active
    When the user clicks the copy button
    Then the code snippet content is copied to the system clipboard
    And the clipboard now contains the exact code text

  Scenario: Display Toast Notification on Successful Copy
    Given the code has been copied to clipboard
    When the copy action completes
    Then a toast notification appears: "Copied!"
    And the notification appears for 2-3 seconds
    And the notification auto-dismisses

  Scenario: Handle Copy Failure Gracefully
    Given the system clipboard is unavailable
    When the user clicks the copy button
    Then an error toast appears: "Failed to copy"
    And the user can still see the code to manually select/copy
    And the error notification disappears after 3 seconds

  Scenario: Copy Button Works for All Code Snippet Lengths
    Given various code snippet lengths (short 1-liner to long 15-liner)
    When the user clicks the copy button for each
    Then all code is copied correctly
    And the full content is preserved (no truncation)
