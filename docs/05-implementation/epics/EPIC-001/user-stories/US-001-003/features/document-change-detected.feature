Feature: File System Watcher Monitors /docs/ Recursively
  As a developer
  I want the file system watcher to monitor all files in /docs/ recursively
  So that all document changes are detected across all PDLC phases

  Scenario: Markdown file added to /docs/ is detected
    Given a file watcher is active for /docs/
    When a developer creates a new file /docs/05-implementation/epics/EPIC-001/user-stories/US-001-004/description.md
    Then the watcher detects 'added' event within 100ms
    And the event contains the correct file path
    And the file type is identified as 'markdown'

  Scenario: YAML configuration file modified is detected
    Given a file watcher is active for /docs/
    When a developer modifies /docs/05-implementation/epics/EPIC-001/user-stories/US-001-003/plan-approval.yaml
    Then the watcher detects 'modified' event within 100ms
    And the event contains the correct file path
    And the file type is identified as 'yaml'

  Scenario: Nested feature file deleted is detected
    Given a file watcher is active for /docs/
    When a developer deletes /docs/05-implementation/epics/EPIC-001/user-stories/US-001-003/features/document-change-detected.feature
    Then the watcher detects 'deleted' event within 100ms
    And the event contains the correct file path
    And the file type is identified as 'feature'

  Scenario: Non-target files are ignored
    Given a file watcher is active for /docs/
    When a developer creates a temporary file /docs/.tmp_file
    And a developer modifies /docs/node_modules/package.json
    Then no events are triggered for .tmp_file
    And no events are triggered for node_modules/package.json
    And watcher remains active and listening

  Scenario: Deeply nested files in subdirectories are detected
    Given a file watcher is active for /docs/
    When a developer creates a file in deeply nested directory /docs/05-implementation/epics/EPIC-001/user-stories/US-001-003/features/subfolder/deep-scenario.feature
    Then the watcher detects 'added' event for the deeply nested file
    And the event path correctly reflects the full nesting depth
