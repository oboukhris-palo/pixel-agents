Feature: Debouncing Prevents Update Storms
  As a developer
  I want file change events to be debounced
  So that rapid file saves don't trigger excessive dashboard updates

  Scenario: Multiple rapid changes debounced into single update
    Given a debounce window of 300ms is configured
    And a dashboard update handler is listening
    When a developer saves a file 5 times in 200ms
    And each save triggers a 'modified' event
    Then exactly 1 debounced update is emitted
    And the update occurs after the 300ms window closes
    And no duplicate updates are received

  Scenario: Events within debounce window are batched
    Given multiple files are modified within a 300ms window
    When /docs/01-requirements/user-stories.md is modified
    And /docs/02-architecture/tech-spec.md is modified within 150ms
    And /docs/04-planning/iteration-planning.md is modified within 250ms
    Then all three modifications are batched into 1 dashboard update
    And the batched update contains all 3 file changes
    And the update is emitted 300ms after the first event

  Scenario: Second update waits for new debounce window
    Given a debounce window of 300ms
    When the first batch of events (5 changes) is debounced and emitted
    And the debounce window closes
    And new events arrive 100ms after debounce window closes
    Then a new debounce window starts for these new events
    And a second update is emitted 300ms after the new first event

  Scenario: Very rapid saves (git merge) handled correctly
    Given a file system with 100+ rapid file writes (simulating git merge)
    When all 100+ changes occur within 500ms
    Then exactly 1 dashboard update is emitted
    And no event queue overflow occurs
    And all 100+ changes are included in the batched update
    And memory usage remains bounded (<50MB spike)

  Scenario: CPU usage remains low during debouncing
    Given a debouncing watcher is active
    When 1000 file change events occur in rapid succession
    Then CPU usage during debouncing remains <5% above baseline
    And no "runaway" CPU spikes observed
    And debounce queue remains bounded (max 100 entries)

  Scenario: Dashboard update latency measured end-to-end
    Given a file change triggers a debounced update
    When /docs/05-implementation/user-stories.md is modified
    Then file write completes at time T
    And dashboard receives 'document-changed' message at time T+debounce+network
    And total latency is <500ms (including debounce + message delivery + UI render)
