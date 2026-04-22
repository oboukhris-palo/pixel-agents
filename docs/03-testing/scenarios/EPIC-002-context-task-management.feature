Feature: Context Window Visualization and Token Management
  As a developer using AI tools
  I want to see my Copilot Chat context window usage in real-time
  So that I can optimize token usage and avoid budget overflows

  Background:
    Given I have Pixel Agents extension installed
    And Copilot Chat is active in my VS Code session
    And the extension is connected to .github/checkpoint.yaml for context tracking
    And the Context Window Bar is visible on the left side of the dashboard

  @priority-p1 @essential
  Scenario: Display context window bar with percentage indicator
    When I open the Pixel Agents dashboard
    Then I should see the Context Window Bar on the left side
    And it should show a vertical progress bar from 0-100%
    And display the current usage as a percentage (e.g., "45%")
    And show the token count (e.g., "22,500 / 50,000 tokens")

  @priority-p1 @essential
  Scenario: Color-code context usage by safety zones
    Given the Context Window Bar is displayed
    When I observe the color coding
    Then it should use the following zones:
      | Zone | Range | Color | Meaning |
      | Safe | 0-70% | 🟢 Green | Plenty of headroom |
      | Warning | 71-89% | 🟡 Yellow | Approaching limit |
      | Critical | 90%+ | 🔴 Red | High overflow risk |

  @priority-p1 @essential
  Scenario: Show token breakdown by component
    Given the context window is at 65% usage
    When I hover over the Context Window Bar
    Then a tooltip should show the breakdown:
      | Component | Tokens | Percentage |
      | .github/ instructions | 5,000 | 22% |
      | Project code | 12,000 | 53% |
      | Chat history | 3,500 | 15% |
      | Extension overhead | 1,500 | 7% |
      | **Total** | **22,000** | **100%** |

  @priority-p1 @essential
  Scenario: Alert when approaching token limit (89%)
    Given the context window usage is at 89%
    When I interact with the Pixel Agents dashboard
    Then I should see a warning notification:
      | Element | Content |
      | Icon | ⚠️ |
      | Title | "Context Approaching Limit" |
      | Message | "You're at 89% of your token budget. Consider clearing chat history or archiving old conversations." |
      | Action | "View recommendations" link |

  @priority-p1 @essential
  Scenario: Emergency alert and mitigation at 95%+
    Given the context window usage exceeds 95%
    When I perform any interaction in Copilot Chat
    Then the dashboard should:
      | Action | Result |
      | Show alert | 🔴 Critical overflow risk |
      | Disable features | Complex analysis temporarily unavailable |
      | Offer options | Clear chat history / Archive context / Simplify request |
      | Prevent overflow | Reject new context additions that would overflow |

  @priority-p1 @essential
  Scenario: Provide smart recommendations for token optimization
    Given context usage is at 85% or above
    When I click "View recommendations"
    Then I should see actionable suggestions:
      | Recommendation | Potential Savings |
      | Archive old chat messages (>7 days) | 30-40% |
      | Remove inactive project files from context | 20-30% |
      | Summarize long conversation history | 15-25% |
      | Use separate Copilot Chat session for new task | 50% (new window) |

  @priority-p1 @essential
  Scenario: Real-time token usage updates
    Given the Context Window Bar is visible
    And Copilot Chat is active
    When I send 10 new messages to Copilot Chat
    Then the Context Window Bar should update within 500ms
    And the percentage should increase by the appropriate token count
    And the breakdown should reflect the new component distribution

  @ui-ux
  Scenario: Customize context window limits
    Given I open the Pixel Agents settings
    When I access "Context Limits" section
    Then I should be able to configure:
      | Setting | Default | Min | Max |
      | Total context limit | 50,000 | 10,000 | 200,000 |
      | Warning threshold | 70% | 50% | 90% |
      | Critical threshold | 90% | 75% | 99% |

  @edge-case
  Scenario: Handle context window reset/flush
    Given the context window is at 80% usage
    When the user manually clears Copilot Chat history via "Clear context" button
    Then the Context Window Bar should:
      | Behavior | Expected |
      | Update | Within 500ms |
      | Show new level | 10-15% (extension overhead only) |
      | Notification | "Context cleared. 40,000 tokens freed." |
      | Dashboard state | Fully functional |

  @edge-case
  Scenario: Gracefully handle context window overflow
    Given the token usage exceeds the maximum
    When an overflow occurs
    Then the system should:
      | Action | Result |
      | Alert user | "Token budget exceeded. Some features unavailable." |
      | Track overflow | Log incident in telemetry |
      | Suggest recovery | "Archive old conversations to recover tokens" |
      | Prevent damage | Disable complex operations temporarily |

---

Feature: Project Completion Metrics and Gamification
  As a developer
  I want to see real-time project completion progress with gamification
  So that I feel motivated and have visibility into project health

  Background:
    Given the Pixel Agents dashboard is open
    And the workspace has /docs/05-implementation/ with active epics and stories
    And the Completeness Meter is visible on the right side of the dashboard

  @priority-p1 @essential
  Scenario: Display overall project completion percentage
    When I view the Pixel Agents dashboard
    Then the Completeness Meter should show:
      | Element | Content |
      | Percentage | "42%" (example) |
      | Progress bar | Visual representation from 0-100% |
      | Metric breakdown | Stories: 6/14 | Tests: 24/45 | Code LOC: 2,500 |

  @priority-p1 @essential
  Scenario: Calculate completion percentage from project artifacts
    Given the project has:
      | Artifact | Value |
      | Total user stories | 14 |
      | Implemented stories | 6 |
      | Passing BDD tests | 24 / 45 |
      | Code coverage | 65% |
    When the Completeness Meter calculates progress
    Then it should show:
      | Metric | Value |
      | Overall completion | 42% (weighted average) |
      | Stories complete | 43% (6/14) |
      | Tests passing | 53% (24/45) |
      | Coverage achieved | 65% |

  @priority-p1 @essential
  Scenario: Celebrate milestone achievements
    Given the current completion is at 25%
    When a milestone threshold is reached
    Then the dashboard should display milestone celebration:
      | Milestone | Trigger | Celebration |
      | 25% | 3.5 stories done | 🎉 1/4 milestone! +50 PRU points |
      | 50% | 7 stories done | 🎊 Halfway there! +100 PRU points |
      | 75% | 10.5 stories done | 🌟 Almost done! +150 PRU points |
      | 100% | 14 stories done | 🏆 Project Victory! +200 PRU points |

  @priority-p1 @essential
  Scenario: Track individual epic progress
    Given the project has 5 epics
    When I view the Completeness Meter details
    Then I should see epic-level breakdown:
      | Epic | Stories | Complete | Progress |
      | EPIC-001 | 3 | 3 | 100% ✅ |
      | EPIC-002 | 3 | 1 | 33% 🔄 |
      | EPIC-003 | 3 | 2 | 67% 🔄 |
      | EPIC-004 | 3 | 0 | 0% ⏳ |
      | EPIC-005 | 2 | 0 | 0% ⏳ |

  @priority-p1 @essential
  Scenario: Show detailed metric breakdown
    When I expand the Completeness Meter details section
    Then I should see comprehensive metrics:
      | Category | Metrics |
      | Stories | Total / Completed / In Progress / Blocked |
      | Tests | BDD Scenarios / Passing / Coverage % |
      | Code | Lines of code / Complexity score / Tech debt |
      | Quality | Issue count / Performance score / Security grade |

  @priority-p1 @essential
  Scenario: Update metrics in real-time as stories complete
    Given I'm viewing the Completeness Meter at 42%
    When a developer marks a story as complete
    And submits the implementation for review
    Then within 5 seconds:
      | Update | Result |
      | Completeness % | Increases to ~47% |
      | Story count | Updates to 7/14 |
      | Progress bar | Animates to new position |
      | Notification | "Story complete! +7.1% progress" |

  @gamification
  Scenario: Award achievement badges for milestones
    Given a developer completes 4 stories
    When the project reaches 25% completion
    Then the system should award:
      | Badge | Title | Description |
      | 🥉 | Quarter Maker | First 25% of project completed |
      | 🔥 | Streak (4) | 4 stories completed in a row |
      | ⚡ | Efficiency Champion | Average 2.5 points/story |

  @gamification
  Scenario: Track and display PRU efficiency score
    Given the project is using Copilot-assisted development
    When completion metrics are calculated
    Then the dashboard should display:
      | Metric | Value | Assessment |
      | Total PRU spent | 15,000 | 60% of budget |
      | PRU per story | 1,071 | Good efficiency |
      | PRU per test | 625 | Excellent efficiency |
      | Overall score | 87% | A rating |

  @ui-ux
  Scenario: Customize completion metric priorities
    Given I open Pixel Agents settings
    When I access "Metrics Configuration"
    Then I should be able to weight metrics:
      | Metric | Default Weight | Adjustable |
      | Story completion | 40% | 20%-50% |
      | Test coverage | 35% | 20%-50% |
      | Code quality | 15% | 5%-30% |
      | Schedule adherence | 10% | 5%-25% |

  @edge-case
  Scenario: Handle projects with incomplete data gracefully
    Given a story lacks implementation-plan.md
    Or a story has no BDD scenarios
    When the Completeness Meter calculates progress
    Then it should:
      | Behavior | Expected |
      | Flag issue | Show "⚠️ Incomplete story data" |
      | Handle calculation | Exclude from completion % |
      | Notify user | "3 stories missing implementation plans" |
      | Suggest action | "View incomplete stories" link |

  @edge-case
  Scenario: Prevent metric manipulation or false positives
    Given a story is marked "complete" but has no tests
    When the Completeness Meter validates metrics
    Then it should:
      | Validation | Result |
      | Check tests | Require passing tests for "complete" status |
      | Check coverage | Verify code coverage meets minimum |
      | Warn user | "Cannot mark complete: 0 passing tests" |
      | Require fix | Story must meet quality gates |

---

Feature: Task and Context Fusion Engine
  As a developer
  I want the dashboard to integrate task progression with context optimization
  So that I can see the relationship between my current work and token budget

  Background:
    Given all components are initialized
    And Task Progression Bar is visible
    And Context Window Bar is visible
    And Completeness Meter is visible

  @priority-p2 @integration
  Scenario: Show task-specific context requirements
    Given I'm on US-001-001 (Task Progression)
    When I view the Task Progression Bar
    Then I should see an overlay showing:
      | Information | Example Value |
      | Task context needed | 3,000 tokens |
      | Current context available | 7,000 tokens (safe) |
      | Context headroom | 4,000 tokens (57% available) |
      | Recommendation | ✅ Safe to proceed |

  @priority-p2 @integration
  Scenario: Warn about context exhaustion for complex tasks
    Given I'm about to start a complex story (8 points)
    And current context usage is at 85%
    When I click "Start implementation"
    Then the dashboard should warn:
      | Alert | Content |
      | Type | ⚠️ Context Warning |
      | Message | "Complex task requires 5,000 tokens, but only 2,500 available (15% remaining). Risk: HIGH" |
      | Options | 1) Clear history + proceed | 2) Simplify task scope | 3) Wait for context reset |

  @priority-p2 @integration
  Scenario: Suggest context optimization when starting new story
    Given a new story is about to start
    And current context is 75%+
    When the story is initiated
    Then the dashboard should suggest:
      | Suggestion | Benefit |
      | Archive old chat (>7 days) | +5,000 tokens (20% headroom) |
      | Summarize previous story context | +3,000 tokens (12% headroom) |
      | Start fresh Copilot Chat session | +15,000 tokens (60% headroom) |

  @priority-p2 @ui-ux
  Scenario: Display integrated dashboard showing all three metrics
    Given the Pixel Agents dashboard is fully loaded
    When I view the main dashboard
    Then I should see a unified view showing:
      | Component | Position | Information |
      | Task Progression Bar | Top | Previous / Current / Next tasks |
      | Context Window Bar | Left | 0-100% usage with breakdown |
      | Completeness Meter | Right | Project progress with metrics |
      | Center Canvas | Center | Animated agent office (full feature) |
      | Bottom Toolbar | Bottom | Agent registry and controls |

  @priority-p2 @performance
  Scenario: Maintain real-time updates across all three components
    Given all three metrics components are visible
    When multiple events occur simultaneously:
      | Event | Timing |
      | Story completes | 0ms |
      | Context usage increases | +250 tokens (5 Copilot messages) |
      | New metrics calculated | +1000ms |
    Then all components should update:
      | Component | Update | Timing |
      | Task Bar | Next task shown | <500ms |
      | Context Bar | Percentage updated | <500ms |
      | Completeness | Percentage updated | <1000ms |
      | No UI lag | Smooth 60fps | Consistent |

  @edge-case
  Scenario: Graceful degradation when one component fails
    Given the dashboard is running
    When the Context Window Bar API fails to get token count
    Then the system should:
      | Behavior | Expected |
      | Show Context Bar | Yes, with "Unable to fetch token count" message |
      | Show other components | Yes, fully functional |
      | Retry | Exponential backoff (1s, 2s, 4s...) |
      | User impact | Minimal; can proceed with work |
