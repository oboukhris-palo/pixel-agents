Feature: Task Progression Bar Implementation
  As a developer using Pixel Agents
  I want to see the previous, current, and next tasks in real-time
  So that I can understand my workflow context and plan ahead

  Background:
    Given I have Pixel Agents extension installed
    And VS Code is running with a valid workspace
    And the /docs/ folder contains PDLC phase information
    And there are active user stories in /docs/05-implementation/

  @priority-p1 @essential
  Scenario: Display task progression bar with three sections
    When I open the Pixel Agents dashboard
    Then I should see the Task Progression Bar at the top
    And the bar shows three sections: "Previous", "Current", and "Next"
    And the "Previous" section displays a checkmark (✅) icon
    And the "Current" section displays a loading spinner (🔄) icon
    And the "Next" section displays an arrow (⏭️) icon

  @priority-p1 @essential
  Scenario: Show previous task details
    Given the current story is US-001-001 (Task Progression Bar)
    And the previous story was "Kickoff Planning"
    When I look at the Task Progression Bar
    Then the "Previous" section should show:
      | Field | Value |
      | Task Name | Kickoff Planning |
      | Status | Completed |
      | Icon | ✅ |

  @priority-p1 @essential
  Scenario: Show current task details with layer and cycle information
    Given I'm working on US-001-001 in EPIC-001
    And the current implementation layer is "Layer 1: Database & Domain"
    And the current TDD cycle is "RED-01"
    When I look at the Task Progression Bar
    Then the "Current" section should display:
      | Field | Value |
      | Story ID | US-001-001 |
      | Title | Task Progression Bar Implementation |
      | Epic | EPIC-001 |
      | Layer | Layer 1 |
      | Cycle | RED-01 |

  @priority-p1 @essential
  Scenario: Show next task prediction
    Given I'm currently on US-001-001
    And the next story in the epic is US-001-002
    When I look at the Task Progression Bar
    Then the "Next" section should show:
      | Field | Value |
      | Story ID | US-001-002 |
      | Title | Workflow Status Bar Implementation |
      | Icon | ⏭️ |

  @priority-p1 @essential
  Scenario: Update task progression within 1 second of changes
    Given I'm viewing the Task Progression Bar
    And the current story is US-001-001
    When the story status changes to complete in /docs/05-implementation/
    Then the Task Progression Bar should update within 500ms
    And the "Previous" section should show US-001-001
    And the "Current" section should show US-001-002

  @priority-p1 @essential
  Scenario: Color-code task sections by PDLC phase
    Given the current story is in EPIC-001 (Phase DOCUMENT)
    When I view the Task Progression Bar
    Then the color scheme should reflect the PDLC phase:
      | Phase | Color |
      | Documentation | Blue |
      | RED (TDD) | Red |
      | GREEN (TDD) | Green |
      | REFACTOR (TDD) | Purple |

  @priority-p1 @essential
  Scenario: Navigate to story by clicking task
    Given I'm viewing the Task Progression Bar
    When I click on the "Current" section showing "US-001-001"
    Then the file browser should open the implementation-plan.md for that story
    And the correct user story folder should be highlighted
    And the implementation details should be displayed

  @edge-case
  Scenario: Handle empty/incomplete story information gracefully
    Given a story has missing layer or cycle information
    When I view the Task Progression Bar
    Then it should display "Unknown" or "N/A" for missing fields
    And the bar should still function normally
    And no error messages should appear

  @edge-case
  Scenario: Show multiple parallel tasks (TDD zones)
    Given the current story uses parallel work zones
    And multiple TDD cycles are active (RED, GREEN, REFACTOR simultaneously)
    When I view the Task Progression Bar
    Then it should indicate parallel work zones
    And show which zones are active
    And explain the parallel work coordination

---

Feature: Workflow Status Bar with PDLC Phase Detection
  As a developer
  I want to see the current PDLC phase and phase progression
  So that I understand where we are in the development lifecycle

  Background:
    Given the Pixel Agents dashboard is open
    And the /docs/ folder has proper PDLC structure (00-assessment through 05-implementation)

  @priority-p1 @essential
  Scenario: Detect and display current PDLC phase
    Given the workspace has /docs/05-implementation/ folder with active stories
    When I open the Pixel Agents dashboard
    Then the Workflow Status Bar should display:
      | Field | Value |
      | Current Phase | Phase 8: Implementation |
      | Phase Number | 8 |
      | Status | In Progress |

  @priority-p1 @essential
  Scenario: Show phase progression timeline
    When I view the Workflow Status Bar
    Then I should see a horizontal timeline showing all phases:
      | Phase | Status |
      | Phase 0: Assessment | ✅ Complete |
      | Phase 1-2: Requirements | ✅ Complete |
      | Phase 3-4: Architecture | ⏳ In Progress |
      | Phase 5: Testing | ⏳ Planned |
      | Phase 6-7: Planning | ⏳ Planned |
      | Phase 8: Implementation | 🔄 Active |

  @priority-p1 @essential
  Scenario: Detect phase from /docs/ folder structure
    Given the workspace has the following folders:
      | Folder | Exists |
      | /docs/00-assessment/ | Yes |
      | /docs/01-requirements/ | Yes |
      | /docs/02-architecture/ | Yes |
      | /docs/03-testing/ | No |
      | /docs/05-implementation/ | Yes |
    When the workflow detector scans the workspace
    Then it should determine:
      | Phase | Status |
      | Highest completed phase | 2 (Architecture) |
      | Current active phase | 8 (Implementation) |

  @priority-p1 @essential
  Scenario: Show phase-specific agent assignments
    Given the current phase is Phase 8 (Implementation)
    And phase-specific agents are reading from .github/agents/
    When I view the Workflow Status Bar
    Then it should display assigned agents:
      | Role | Agent |
      | TDD Red | dev-tdd-red |
      | TDD Green | dev-tdd-green |
      | TDD Refactor | dev-tdd-refactor |
      | QA | qa |

  @priority-p1 @essential
  Scenario: Auto-update phase when documents change
    Given I'm viewing the Workflow Status Bar showing Phase 8
    When new files are added to /docs/03-testing/
    Then the status bar should update within 500ms
    And reflect the new phase detection
    And show "Planning" phase now has activity

  @priority-p1 @essential
  Scenario: Color-code phase indicators by status
    When I view the Workflow Status Bar timeline
    Then the colors should indicate phase status:
      | Status | Color |
      | Complete (✅) | Green |
      | In Progress (🔄) | Blue |
      | Planned (⏳) | Gray |
      | Blocked | Red |

  @ui-ux
  Scenario: Show tooltip with detailed phase information
    Given the Workflow Status Bar is displayed
    When I hover over "Phase 8: Implementation"
    Then a tooltip should appear showing:
      | Information | Value |
      | Phase Name | Implementation (TDD-Driven) |
      | Duration | 4 weeks estimated |
      | Stories Active | 3 of 5 epics |
      | Progress | 62% complete |
      | Next Milestone | 50% completion (50%) |

  @edge-case
  Scenario: Handle incomplete phase structure gracefully
    Given the workspace is missing some PDLC phase folders
    When I open the Pixel Agents dashboard
    Then the Workflow Status Bar should still display
    And show available phases with their statuses
    And flag missing phases as "Not Started"

---

Feature: Real-Time Document Monitoring Engine
  As a developer
  I want the dashboard to automatically detect changes in /docs/ files
  So that I see up-to-date workflow information without manual refresh

  Background:
    Given the Pixel Agents dashboard is open
    And the file system watcher is initialized
    And the /docs/ directory is being monitored

  @priority-p1 @essential @performance
  Scenario: File system watcher monitors /docs/ recursively
    Given the Pixel Agents extension is running
    When a file is created in /docs/05-implementation/epics/EPIC-001/user-stories/US-001-001/
    Then the file system watcher should detect it within 100ms
    And trigger appropriate dashboard updates

  @priority-p1 @essential @performance
  Scenario: Update dashboard within 500ms of file changes
    Given I'm viewing the Task Progression Bar
    And the current implementation-plan.md is displayed
    When the file is modified in /docs/05-implementation/
    Then the dashboard should update within 500ms
    And show the new content accurately

  @priority-p1 @essential
  Scenario: Handle file adds, modifications, and deletions
    Given the file system watcher is monitoring
    When the following operations occur:
      | Operation | File | Timing |
      | Add | /docs/05-implementation/epics/EPIC-002/epic.yml | Immediate |
      | Modify | /docs/01-requirements/requirements.md | Immediate |
      | Delete | /docs/05-implementation/archive/old-epic.yml | Immediate |
    Then the dashboard should reflect each change
    And update the UI appropriately for each operation type

  @priority-p1 @performance
  Scenario: Debouncing prevents excessive updates
    Given multiple files change simultaneously
    When 10 files in /docs/ are modified within 100ms of each other
    Then the dashboard should:
      | Behavior | Expected |
      | Number of updates | 1 (batched) |
      | Debounce window | 200ms |
      | Update timing | Within 500ms total |

  @priority-p1 @performance
  Scenario: Performance optimized for large projects
    Given a workspace with:
      | Metric | Value |
      | Total files in /docs/ | 500+ |
      | Total size | 50+ MB |
      | Active stories | 50+ |
    When I open the Pixel Agents dashboard
    Then startup time should be <2 seconds
    And memory usage should be <100MB
    And updates should remain responsive

  @edge-case
  Scenario: Handle permission errors gracefully
    Given the /docs/ directory has restricted permissions
    When the file system watcher attempts to read files
    Then it should:
      | Behavior | Expected |
      | Error handling | Graceful fallback |
      | User notification | "Permission denied" message |
      | Dashboard state | Continues functioning |
      | Retry interval | Exponential backoff (1s, 2s, 4s...) |

  @edge-case
  Scenario: No memory leaks with long-running watchers
    Given the Pixel Agents dashboard is open
    And the file system watcher is running
    When 24 hours of continuous operation occur
    And 1000+ file change events are processed
    Then memory usage should remain stable
    And not exceed initial baseline + 50%
    And the watcher should remain responsive

  @edge-case
  Scenario: Resume watching after file system interruption
    Given the file system watcher is monitoring
    When a temporary file system interruption occurs (e.g., network drive disconnect)
    Then the watcher should:
      | Behavior | Expected |
      | Detect interruption | Within 5 seconds |
      | Notify user | "Reconnecting..." message |
      | Resume watching | Automatically when connection restored |
      | Rescan changes | Catch up on missed changes |
