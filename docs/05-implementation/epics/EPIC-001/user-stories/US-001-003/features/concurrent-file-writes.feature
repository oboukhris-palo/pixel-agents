Feature: Concurrent File Writes Handled Correctly
  As a developer
  I want concurrent file writes to be batched and handled safely
  So that git operations (merge, rebase) don't overwhelm the dashboard

  Scenario: Multiple files written simultaneously are batched
    Given a file watcher is active
    When 10 files in /docs/ are modified simultaneously (within 100ms)
    Then all 10 changes are detected
    And the debounce window batches them into 1 update
    And the watcher processes the batch correctly
    And no duplicate events are emitted

  Scenario: Git merge with 50+ file writes handled
    Given a developer performs a git merge that modifies 50+ doc files
    When the merge operation writes all files concurrently
    Then all file changes are detected
    And events are batched within 300ms debounce window
    Then 1 consolidated dashboard update is emitted
    And no event storm or excessive CPU spike occurs

  Scenario: Partial file writes don't cause parse errors
    Given a file watcher is monitoring /docs/
    When a large file (50KB) is being written in chunks
    And the watcher detects a change mid-write
    Then the watcher either:
      a) Waits for write to complete (awaitWriteFinish), or
      b) Catches parse error gracefully and retries
    And no corruption or parse errors propagate

  Scenario: Atomic operations (rename/replace) handled correctly
    Given a file watcher is monitoring /docs/
    When a developer replaces a file (delete old, write new)
    And both delete and add events fire in sequence
    Then both events are detected within debounce window
    And batched into single update
    And the dashboard correctly reflects the new file state

  Scenario: Multiple watchers don't conflict
    Given 2+ file watchers are initialized independently
    When file changes occur in /docs/
    Then both watchers detect changes independently
    And no deadlocks or race conditions
    And messages are broadcasted correctly to all listeners

  Scenario: Rapid directory creation and deletion handled
    Given a new directory is created in /docs/
    And files are immediately added to that directory
    And the directory is then deleted
    When all these events occur within 500ms
    Then no errors occur
    And the watcher state remains consistent
    And no orphaned file handles remain

  Scenario: File lock handling (Windows-specific)
    Given a file is locked by another process (Windows file locking)
    When the watcher attempts to read the locked file
    Then the lock is respected or error is handled
    And monitoring continues for other files
    And the watcher doesn't hang or timeout indefinitely

  Scenario: Concurrent updates to same file
    Given the same file is modified by 2 processes simultaneously
    When both modifications occur within 300ms debounce
    Then 1 debounced update is emitted
    And the final state of the file is correctly detected
    And no intermediate states cause confusion

  Scenario: Event coalescence prevents redundant processing
    Given identical events (same file, same operation)
    When multiple identical events are queued
    Then duplicate events are coalesced
    And only 1 processing cycle occurs
    And efficiency is maximized

  Scenario: Concurrent file writes during high system load
    Given the system is under high load (CPU 90%+, Disk busy)
    When 20+ file changes occur concurrently
    Then the watcher completes debouncing successfully
    And latency may increase but remains <1000ms (graceful degradation)
    And no crashes or stuck processes
    And extension remains responsive
