Feature: Permission Errors Handled Gracefully
  As a developer
  I want the file watcher to handle permission errors gracefully
  So that the watcher continues monitoring even if file access fails

  Scenario: Permission denied error is caught and logged
    Given a file watcher is monitoring /docs/
    When a file permission is changed to remove read access (chmod 000)
    And the watcher attempts to read that file
    Then a "permission denied" error is caught (EACCES or EPERM)
    And the error is logged to the VS Code output channel
    And the watcher does NOT crash
    And monitoring continues for other files

  Scenario: Watcher remains active after permission error
    Given a file watcher is monitoring /docs/
    And a file becomes unreadable (permission denied)
    When the watcher encounters the permission denied error
    Then the watcher catches the error and logs it
    And the watcher's watch state remains ACTIVE
    And subsequent file changes are still detected
    And no error is thrown to the extension caller

  Scenario: Directory becomes unavailable (unmounted or deleted)
    Given a file watcher is monitoring a directory
    When the directory becomes unavailable (e.g., network drive unmounted)
    Then the watcher detects the "no such file or directory" error (ENOENT)
    And the error is logged with retry information
    And the watcher enters a RECOVERING state
    And retries watching the directory with exponential backoff (1s, 2s, 4s, 8s)

  Scenario: Disk space exhausted error is handled
    Given a file watcher is active on a system with low disk space
    When a file write fails due to "no space left on device" error
    Then the error is caught and logged
    And the user is notified via an error notification
    And the watcher remains active
    And the extension continues to function

  Scenario: Multiple permission errors in sequence
    Given 10 files become unreadable simultaneously
    When all 10 permission denied errors occur
    Then each error is caught and logged individually
    And the watcher does NOT crash after multiple errors
    And a consolidated error message is shown to the user (e.g., "5 files unreadable")
    And monitoring continues for accessible files

  Scenario: Error recovery and file becomes readable again
    Given a file was unreadable (permission denied)
    When the file permission is restored (chmod 644)
    And the file is modified
    Then the watcher detects the change
    And the file is now successfully read and processed
    And the watcher has recovered from the previous error state

  Scenario: Permission error stack trace logged for debugging
    Given a permission denied error occurs
    When the error is caught by the watcher
    Then the full stack trace is logged to debug output
    And the error timestamp is recorded
    And the affected file path is logged
    And developers can diagnose permission issues from logs
