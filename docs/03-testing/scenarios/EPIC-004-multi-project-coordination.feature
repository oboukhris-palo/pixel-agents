Feature: Multi-Project Workspace Switcher
  As a DevOps engineer managing multiple projects
  I want to quickly switch between project dashboards
  So that I can monitor all projects without context loss

  Background:
    Given I have Pixel Agents installed in multiple project workspaces
    And multiple VS Code windows are open with different projects
    And the extension can detect and list all available projects
    And the workspace switcher is accessible from the dashboard

  @priority-p2 @essential
  Scenario: Display list of available projects
    Given I have 5 concurrent projects open
    When I click on the "Projects" dropdown in the dashboard
    Then I should see a list:
      | Project Name | Current Phase | Progress | Status |
      | Pixel Agents | Phase 8 (TDD) | 42% | 🔄 Active |
      | Merchant API | Phase 8 (TDD) | 65% | 🔄 Active |
      | Analytics Dashboard | Phase 6 (Planning) | 30% | ⏳ Planned |
      | Mobile App v2 | Phase 4 (Architecture) | 15% | 🟡 Review |
      | DevOps Platform | Phase 0 (Assessment) | 5% | 🆕 New |

  @priority-p2 @essential
  Scenario: Switch to another project workspace
    Given I'm currently viewing Pixel Agents project
    When I click on "Merchant API" in the project switcher
    Then the dashboard should:
      | Action | Result |
      | Switch context | Load Merchant API /docs/ structure |
      | Update UI | Task bar, context bar, completeness meter refresh |
      | Preserve state | Remember scroll position, settings |
      | Notification | "Switched to Merchant API" |
      | Timing | <1 second total switch time |

  @priority-p2 @essential
  Scenario: Show project-specific agents and status
    Given I switch to "Merchant API" project
    When the dashboard loads
    Then I should see:
      | Component | Content |
      | Current phase | Phase 8 (TDD Implementation) |
      | Active agents | dev-tdd-red (busy), dev-tdd-green (idle), qa (waiting) |
      | Team members | 4 developers, 1 QA, 1 architect |
      | Context usage | 62% (critical zone) |
      | Project progress | 65% complete (2 of 3 epics done) |

  @priority-p2 @essential
  Scenario: Display cross-project metrics dashboard
    Given I want to see overview of all 5 projects
    When I click "Overview" or "Multi-Project Dashboard"
    Then I should see a table with all projects:
      | Metric | P1: Pixel Agents | P2: Merchant | P3: Analytics | P4: Mobile | P5: DevOps |
      | Phase | 8 | 8 | 6 | 4 | 0 |
      | Progress | 42% | 65% | 30% | 15% | 5% |
      | Team size | 3 | 5 | 4 | 6 | 2 |
      | Context usage | 45% | 62% | 28% | 71% | 12% |
      | Risk level | 🟢 Low | 🟡 Medium | 🟢 Low | 🔴 High | 🟢 Low |

  @priority-p2 @essential
  Scenario: Identify bottlenecks across projects
    Given the multi-project dashboard is displayed
    When I scan the "Risk Level" and "Context Usage" columns
    Then I should see warnings for:
      | Project | Issue | Recommendation |
      | Mobile App v2 | Context at 71% (critical) | Archive chat history, reduce scope |
      | Merchant API | Phase 8 taking 3+ weeks (slow) | Check for blockers, add resources |
      | Analytics | 30% progress, no Phase 7 activity | Planning may be stuck, escalate |

  @priority-p2 @essential
  Scenario: Highlight projects requiring immediate attention
    Given multiple projects are active
    When I view the project switcher
    Then projects should be color-coded:
      | Status | Color | Trigger |
      | 🔴 Critical | Red | Context >90% OR blocker OR overdue |
      | 🟡 Warning | Yellow | Context >75% OR phase stuck |
      | 🟢 Healthy | Green | On track, <70% context |
      | 🔵 Idle | Blue | No activity in 24 hours |

  @priority-p2 @ui-ux
  Scenario: Customize project display preferences
    Given I have many projects to track
    When I access settings → "Project Management"
    Then I should be able to:
      | Setting | Options |
      | Projects to display | Show all / Show only active / Custom filter |
      | Sort order | Alphabetical / By phase / By progress / By risk |
      | Auto-switch | Manual / Auto-switch to warning projects / Auto-switch if 15+ min idle |
      | Refresh rate | Real-time / 30s / 1m / Manual |

  @priority-p2 @ui-ux
  Scenario: Save and restore project state across sessions
    Given I switch between multiple projects during a day
    When I close and reopen VS Code
    Then the dashboard should:
      | Action | Result |
      | Remember last project | Open Merchant API (what I was viewing) |
      | Restore layout | Scroll position, expanded sections preserved |
      | Cache data | Quick load (<1s) with cached metrics |
      | Sync updates | Refresh with latest data after 2s |

  @edge-case
  Scenario: Handle projects with different .github/agents/ configurations
    Given Project A uses 5 agents, Project B uses 8 agents
    When I switch from Project A to Project B
    Then the Agent Registry should:
      | Action | Result |
      | Clear old agents | Remove Project A agents from sidebar |
      | Load new agents | Show Project B's 8 agents |
      | Update metadata | Load Project B's agent customizations |
      | Preserve settings | User customizations don't conflict |

  @edge-case
  Scenario: Gracefully handle offline projects
    Given one project's workspace is on a disconnected network drive
    When I try to switch to that project
    Then the system should:
      | Action | Result |
      | Detect unavailable | "Project offline" message |
      | Show cached data | Last known state from 2 hours ago |
      | Reconnect option | "Reconnect to workspace" button |
      | Prevent errors | No crashes or UI breakage |

---

Feature: Cross-Project Activity Feed and Notifications
  As a DevOps or platform engineer
  I want to see aggregated activity across all projects
  So that I can spot trends, blockers, and opportunities

  Background:
    Given Pixel Agents is managing multiple projects
    And the activity feed is accessible from the dashboard
    And notifications are configured in settings

  @priority-p2 @essential
  Scenario: Display activity feed of recent events
    When I open the "Activity Feed" panel
    Then I should see timestamped events:
      | Time | Project | Event | Agent/User |
      | 2 min ago | Pixel Agents | Story US-001-001 complete | dev-tdd-green |
      | 5 min ago | Merchant API | Context warning (85%) | Platform alert |
      | 12 min ago | Analytics | Spike: Architecture blocked | architect |
      | 22 min ago | Mobile App | Phase 8 started | dev-lead |
      | 45 min ago | DevOps | PRU budget exceeded (Q1) | Platform alert |

  @priority-p2 @essential
  Scenario: Categorize and filter activity events
    Given the Activity Feed is displayed
    When I select filters
    Then I should be able to filter by:
      | Category | Examples |
      | Story completion | "US-001-001 complete", "All tests passing" |
      | Phase transitions | "Phase 8 started", "Architecture review complete" |
      | Alerts | "Context warning", "Blocker raised", "PRU budget exceeded" |
      | Agent handoffs | "Handing to dev-tdd-green", "Awaiting QA review" |
      | People | "John completed review", "Sarah marked story done" |

  @priority-p2 @essential
  Scenario: Show trends across projects
    Given I access the "Trends" section
    When I view analytics
    Then I should see:
      | Metric | Current Week | Last Week | Trend |
      | Avg stories/project | 3.2 | 2.8 | 📈 +14% |
      | Avg context usage | 54% | 48% | 📈 +12% |
      | Phase completion time | 1.8 weeks | 2.1 weeks | 📉 -14% (faster!) |
      | Blocker incidents/week | 2.4 | 3.1 | 📉 -23% (fewer!) |
      | Team satisfaction | 4.2/5 | 3.9/5 | 📈 +7% |

  @priority-p2 @essential
  Scenario: Get notified of critical cross-project events
    Given I have notifications enabled
    When critical events occur
    Then I should receive notifications:
      | Event | Notification | Urgency |
      | Any project context >95% | "⚠️ Project {name} context critical (95%)" | 🔴 High |
      | Phase stuck >3 days | "⏱️ Project {name} Phase {N} delayed 3+ days" | 🟡 Medium |
      | Multiple projects blocked | "🚨 3 projects blocked: architect, dev-lead, qa" | 🔴 High |
      | PRU budget exceeded | "💰 PRU budget exceeded: $2,400 / $2,000" | 🟡 Medium |

  @priority-p2 @ui-ux
  Scenario: Show team collaboration across projects
    Given I want to understand team capacity
    When I view "Team Dashboard"
    Then I should see:
      | Information | Details |
      | Team members | 15 people across all projects |
      | Distribution | Sarah: 60% Pixel Agents, 40% Merchant API |
      | Utilization | Avg 85% (4 overallocated, 2 underutilized) |
      | Bottlenecks | "qa" role overloaded: 5 projects waiting for review |
      | Recommendations | "Hire 1 QA or task distribution needed" |

  @priority-p2 @ui-ux
  Scenario: Display resource allocation insights
    Given multiple projects are competing for resources
    When I access "Resource Allocation" view
    Then I should see:
      | Insight | Recommendation |
      | Dev-lead bottleneck | "3 projects awaiting architecture review from 1 architect" |
      | Context saturation | "Merchant API and Mobile App both >70% context" |
      | Opportunity | "Analytics project idle; could accelerate with 1 FTE from DevOps" |

  @priority-p2 @edge-case
  Scenario: Handle high-volume activity feeds efficiently
    Given a project with 500+ events per day
    When I load the Activity Feed
    Then the system should:
      | Action | Result |
      | Paginate | Show 50 most recent, load more on scroll |
      | Cache | In-memory cache of last 1000 events |
      | Performance | Load feed within 500ms |
      | Search | Filter feed by keyword/date/project |

  @priority-p2 @edge-case
  Scenario: Privacy controls for cross-project visibility
    Given different security/access levels
    When a user with limited permissions views activity feed
    Then the system should:
      | Rule | Behavior |
      | Hide private projects | Don't show events from projects user can't access |
      | Redact details | Show "Story completed in {Project}" not specific story details |
      | Respect role permissions | QA sees all events; junior devs see only their project |

---

Feature: Project Health Dashboard and Escalation
  As a project or platform manager
  I want to see aggregated project health with escalation protocols
  So that I can proactively address risks

  Background:
    Given the Health Dashboard is accessible
    And projects have defined SLAs and health thresholds
    And escalation protocols are configured in settings

  @priority-p2 @essential
  Scenario: Display overall project health score
    When I view the "Health Dashboard"
    Then each project should show:
      | Project | Health Score | Factors | Status |
      | Pixel Agents | 82/100 | ✅ Velocity OK | 🟢 Healthy |
      | Merchant API | 65/100 | ⚠️ Context high, phase slow | 🟡 At Risk |
      | Analytics | 58/100 | 🔴 Blocker, phase stuck | 🔴 Critical |
      | Mobile App | 71/100 | ⚠️ Team overallocated | 🟡 Warning |
      | DevOps | 91/100 | ✅ On track | 🟢 Excellent |

  @priority-p2 @essential
  Scenario: Calculate health score from multiple factors
    Given a project with:
      | Factor | Value | Weight |
      | Phase progress | 85% of schedule | 25% |
      | Team velocity | 3.2 stories/week vs 3.0 target | 25% |
      | Context usage | 62% | 20% |
      | Blocker incidents | 0 | 15% |
      | Code quality | 87% coverage | 15% |
    When health score is calculated
    Then: (0.85 * 0.25) + (1.07 * 0.25) + (0.62 * 0.20) + (1.0 * 0.15) + (0.87 * 0.15) = 0.82 = 82/100

  @priority-p2 @essential
  Scenario: Trigger escalation when health drops
    Given project health falls below threshold
    When Merchant API health drops from 75 to 62
    Then system should:
      | Action | Trigger | Recipient |
      | Email alert | "Project health declined 13 points" | Project Manager |
      | Notification | "⚠️ Merchant API health at 62 (threshold: 70)" | Dashboard |
      | Escalation | Create jira ticket for PM review | PM, Team Lead |
      | Meeting | Auto-schedule 30min sync if 2+ projects <65 | Leadership |

  @priority-p2 @essential
  Scenario: Show health trend over time
    Given I view a project's health history
    When I access the "Health Trend" graph
    Then I should see:
      | Period | Health | Annotation |
      | 3 weeks ago | 92 | Strong start |
      | 2 weeks ago | 85 | Slight decline |
      | 1 week ago | 78 | Architecture review lag |
      | Now | 62 | Merchant payment integration blocker |
    And the graph shows declining trend with risk zones marked

  @priority-p2 @ui-ux
  Scenario: Provide actionable recommendations
    Given a project with declining health
    When I click on the health score
    Then I see actionable insights:
      | Recommendation | Priority | Impact |
      | Reduce scope for Phase 8 | High | Could recover 5-10 health points |
      | Archive old chat context | Medium | Frees 25% context headroom |
      | Add QA resource | High | Unblocks testing phase |
      | Escalate architecture decision | High | Unblocks 3 dependent stories |

  @priority-p2 @edge-case
  Scenario: Handle custom health metrics per project
    Given different projects have different SLAs
    When I configure health factors for Analytics project:
      | Factor | Weight |
      | Phase progress | 15% (less critical for analytics) |
      | Data accuracy | 30% (highly critical) |
      | Performance | 25% (critical for dashboards) |
      | Context usage | 20% |
      | Blocker incidents | 10% |
    Then the health score for Analytics should use custom weights
    And reflect priorities specific to data analytics projects
