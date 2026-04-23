Feature: Performance Optimized (No CPU Spikes)
  As a developer
  I want the file watcher to remain performant
  So that large projects with many files don't cause CPU spikes or memory issues

  Scenario: Large markdown file parsing efficient
    Given a large markdown file (100KB, 3000+ lines)
    When the file is modified and added to the parse queue
    Then parsing completes within 50ms
    And CPU usage during parsing <10%
    And memory allocation is temporary (<5MB spike)

  Scenario: Watcher baseline CPU usage low
    Given a file watcher is active, monitoring 500+ doc files
    When the system is idle (no file changes occurring)
    Then CPU usage is <5% baseline
    And memory usage is <10MB RSS
    And no background processing happening

  Scenario: CPU spike during file changes acceptable
    Given a file watcher is active
    When 20 files are modified within 1 second
    Then CPU usage spikes to <15% peak
    And spike duration is <1 second
    And CPU returns to <5% baseline after debounce window closes

  Scenario: Memory remains stable during long-running watch
    Given a file watcher has been active for 8 hours
    When the system continuously detects file changes (1 per second)
    Then memory usage remains stable (±5% variance)
    And no unbounded memory growth observed
    And garbage collection runs normally
    And RSS memory never exceeds 10MB

  Scenario: Large project with 1000+ doc files handled efficiently
    Given a project with 1000+ markdown, yaml, and feature files
    When the watcher is initialized on /docs/
    Then initialization completes within 500ms
    And no memory spike during initialization
    And baseline monitoring continues with <5% CPU

  Scenario: File descriptor limits respected
    Given a system with file descriptor limit (ulimit -n = 256)
    When the watcher monitors a directory with many files
    Then the watcher does not exhaust file descriptors
    And properly closes file handles after reading
    And operates within system resource limits

  Scenario: Parsing cache prevents redundant work
    Given a file parsing cache is implemented
    When the same file is checked multiple times without modification
    Then the cached parse result is returned
    And no disk I/O occurs (cache hit)
    And lookup time is <1ms

  Scenario: Event queue bounded prevents memory explosion
    Given a bounded event queue (max 100 entries)
    When 500+ events occur in rapid succession
    Then queue size never exceeds 100
    And oldest events are dropped (or batched) as needed
    And memory usage remains bounded

  Scenario: No memory leaks detected
    Given a memory profiler is running
    When the watcher runs for 4 hours with continuous file monitoring
    Then retained heap size is stable
    And no detached DOM nodes or circular references
    And garbage collection frequency is normal
    And memory profile shows no leak indicators

  Scenario: Performance acceptable with concurrent monitoring
    Given multiple dashboard updates occurring simultaneously
    - File watcher detecting changes
    - Agent activity monitor broadcasting updates
    - React components re-rendering
    When all systems are active
    Then no blocking or race conditions observed
    And message delivery latency remains <500ms
    And CPU usage peak <20% across all systems
