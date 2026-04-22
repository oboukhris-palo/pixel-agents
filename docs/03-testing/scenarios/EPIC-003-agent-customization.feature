Feature: Agent Sprite Customization Engine
  As a developer
  I want to customize the appearance of AI agents (colors, shapes, icons)
  So that I can personalize my dashboard and quickly identify agents visually

  Background:
    Given I have Pixel Agents extension installed
    And the Agent Registry is visible in the sidebar
    And agents are loaded from .github/agents/ with metadata
    And the sprite editor is accessible from settings

  @priority-p1 @essential
  Scenario: Display agent sprite with default appearance
    When I open the Pixel Agents dashboard
    Then I should see each agent sprite on the office canvas with:
      | Property | Example |
      | Name | dev-tdd-red, dev-tdd-green, qa, etc. |
      | Color | Unique color per agent (from metadata) |
      | Shape | Circle, square, triangle, star (from metadata) |
      | Icon | Role-specific emoji (📍, 🟢, ✅, etc.) |
      | Display name | Human-readable title |

  @priority-p1 @essential
  Scenario: Open sprite editor to customize agent appearance
    Given I'm viewing the Agent Registry sidebar
    When I right-click on an agent (e.g., "dev-tdd-red")
    Then a context menu should appear with option "Customize appearance"
    And clicking it should open the Sprite Editor dialog
    And the editor should display customization options

  @priority-p1 @essential
  Scenario: Customize agent color
    Given the Sprite Editor is open for dev-tdd-red
    When I click on the "Color" section
    Then I should see:
      | Element | Content |
      | Current color | Red (#FF0000) |
      | Color picker | Interactive color picker |
      | Preset colors | 12 suggested colors based on role |
      | Color name | Text field to name custom color |
    And after selecting a new color (e.g., #CC0000)
    Then the agent sprite should update immediately on the canvas
    And the new color should be saved to .github/agents/dev-tdd-red.agent.md

  @priority-p1 @essential
  Scenario: Customize agent shape
    Given the Sprite Editor is open for qa
    When I select the "Shape" section
    Then I should be able to choose from:
      | Shape | Description |
      | Circle | 32x32px circle (default for most) |
      | Square | 32x32px square with rounded corners |
      | Triangle | 32x32px equilateral triangle |
      | Star | 32x32px 5-point star |
    And clicking a shape should:
      | Action | Result |
      | Update preview | Agent sprite changes immediately |
      | Save to metadata | Shape saved to agent file |
      | Reflect on canvas | All instances of agent use new shape |

  @priority-p1 @essential
  Scenario: Customize agent icon/emoji
    Given the Sprite Editor is open for architect
    When I click on the "Icon" field
    Then I should see:
      | Element | Content |
      | Current icon | 🏗️ (building) |
      | Search box | Search emoji by keyword (e.g., "design", "building") |
      | Emoji picker | 50+ role-relevant emoji suggestions |
      | Custom text | Option to use text character instead of emoji |
    And selecting 🏛️ (classical building)
    Then the agent sprite should show the new icon
    And changes should be persistent

  @priority-p1 @essential
  Scenario: Create custom color profile for team
    Given I have access to team-wide customization settings
    When I access "Shared Color Profiles" in settings
    Then I should be able to:
      | Action | Result |
      | Create profile | "Red Panda Team" custom color scheme |
      | Assign colors | dev-tdd-red→#E63946, dev-tdd-green→#2A9D8F, etc. |
      | Share profile | Generate shareable config file |
      | Import profile | Other team members import .pixel-agents-profile.json |

  @priority-p1 @essential
  Scenario: Batch customize all agents at once
    Given I have many agents to customize
    When I access "Batch Customization" in the editor
    Then I should be able to:
      | Action | Result |
      | Select all agents | Checkbox to select/deselect all |
      | Apply theme | Predefined themes (Dark, Light, Neon, Pastel) |
      | Template assignment | Auto-assign colors/shapes by role |
      | Preview changes | See all agents updated before saving |

  @priority-p1 @essential
  Scenario: Randomize agent appearance for fun
    Given the Sprite Editor is open
    When I click the "Randomize" button
    Then the system should:
      | Action | Result |
      | Generate random colors | Each agent gets unique random color |
      | Vary shapes | Mix of shapes assigned randomly |
      | Select random icons | Thematic emoji assigned per role |
      | Show preview | All agents on canvas show new appearance |
      | Confirm action | "Like it? Save to agents" or "Try again" |

  @priority-p1 @essential
  Scenario: Reset to default appearance
    Given I've heavily customized agent appearances
    When I click "Reset to defaults" in the editor
    Then the system should:
      | Action | Result |
      | Restore defaults | All agents return to original appearance |
      | Confirmation | "Are you sure? This cannot be undone." |
      | After confirmation | Agents reload with default colors/shapes/icons |

  @ui-ux
  Scenario: Show real-time sprite preview on canvas
    Given the Sprite Editor is open
    And the office canvas is visible behind it
    When I adjust agent customization options
    Then the changes should appear:
      | Update | Timing |
      | Color change | Instant |
      | Shape change | Instant |
      | Icon change | Instant |
      | On canvas | All sprite instances update simultaneously |

  @ui-ux
  Scenario: Display agent customization in Agent Registry
    Given the Agent Registry sidebar is visible
    When I look at each agent entry
    Then each should show:
      | Element | Content |
      | Agent name | dev-tdd-red |
      | Sprite preview | 24x24px colored sprite with icon |
      | Status | Online / Offline / Idle |
      | Current task | "Writing test (RED-01)" or similar |
      | Customize button | Gear icon to open editor |

  @edge-case
  Scenario: Handle extreme color accessibility
    Given I select a color with poor accessibility
    When I try to save a color that violates WCAG 2.1 AA contrast
    Then the system should:
      | Action | Result |
      | Warn user | "Warning: This color has poor contrast (3.2:1, need 4.5:1)" |
      | Suggest fix | "Try #FF3333 for better contrast" |
      | Allow save | User can override if desired |
      | Mark as warning | Agent marked with ⚠️ in registry |

  @edge-case
  Scenario: Limit customization to prevent UI breakage
    Given extreme customization options are available
    When I try to set an extremely large icon
    Or set colors that are identical (indistinguishable)
    Then the system should:
      | Validation | Result |
      | Icon size | Clamp to 16-48px max |
      | Color similarity | Warn if multiple agents have similar colors |
      | Shape size | Keep consistent 32x32px footprint |
      | Canvas impact | Ensure sprites don't overlap or break layout |

  @edge-case
  Scenario: Handle agent metadata sync from .github/agents/
    Given agent metadata changes in .github/agents/dev-tdd-red.agent.md
    When the file is reloaded
    Then the dashboard should:
      | Action | Result |
      | Detect change | Within 500ms |
      | Update appearance | Agent sprite reflects new metadata |
      | Notify user | "Agent metadata reloaded" |
      | Persist view | No disruption to current task |

---

Feature: Agent Skill Builder and Trait Configuration
  As a team lead
  I want to configure agent skills and personality traits
  So that agents behave appropriately for different project contexts

  Background:
    Given I have access to agent configuration
    And .github/agents/*.agent.md files are editable
    And the Agent Customization panel is open

  @priority-p2 @essential
  Scenario: Configure agent personality traits
    Given I'm configuring dev-tdd-red agent
    When I access "Personality Traits" section
    Then I should see configurable traits:
      | Trait | Options | Effect |
      | Verbosity | Quiet, Balanced, Chatty | Amount of output messages |
      | Rigor | Pragmatic, Balanced, Strict | Enforces standards strictly or pragmatically |
      | Creativity | Conservative, Balanced, Experimental | Code style variation |
      | Error handling | Permissive, Balanced, Strict | How strictly errors are treated |

  @priority-p2 @essential
  Scenario: Assign skills to agents
    Given I'm configuring architect agent
    When I access "Skills" section
    Then I should see:
      | Skill Category | Available Skills |
      | Architecture | Microservices, Monolith, Serverless, Event-Driven |
      | Languages | TypeScript, C#, Python, Go, Java |
      | Frameworks | Next.js, React, Angular, Spring Boot, FastAPI |
      | Databases | PostgreSQL, MongoDB, DynamoDB, Redis |
      | DevOps | Docker, Kubernetes, Terraform, AWS |
    And I can toggle skills to enable/disable per agent

  @priority-p2 @essential
  Scenario: Configure agent interaction preferences
    Given agent customization is open
    When I access "Interaction Preferences"
    Then I should be able to set:
      | Preference | Options | Impact |
      | Auto-context | Always, Ask, Never | Auto-include files in context |
      | Response format | Concise, Detailed, TL;DR | Length of agent outputs |
      | Async/Sync | Sync (wait), Async (queue), Adaptive | Execution model |
      | Communication | Chat, Comments, Notifications | How agent communicates results |

  @priority-p2 @ui-ux
  Scenario: Show agent profile card
    Given I click on an agent in the Agent Registry
    When the profile card opens
    Then it should display:
      | Section | Content |
      | Header | Agent name, sprite, online status |
      | Role | dev-tdd-red → TDD RED phase orchestrator |
      | Current task | "Writing test for US-001-001" |
      | Skills | Listed as badges (TypeScript ✓, Jest ✓, etc.) |
      | Traits | Verbosity: Balanced, Rigor: Strict, etc. |
      | Statistics | Stories completed, Tests written, PRU spent |
      | Customize | Link to full editor |

  @priority-p2 @ui-ux
  Scenario: Create agent templates for common roles
    Given I'm setting up a new project
    When I access "Agent Templates" in settings
    Then I should see preset templates:
      | Template | Roles | Customization |
      | Standard TDD | RED, GREEN, REFACTOR, QA | Default traits + skills |
      | Strict Quality | QA, Architect, Security | High rigor, strict validation |
      | Rapid MVP | RED, GREEN, QA only | Pragmatic, skip non-essential |
      | Enterprise | All roles + coordinator | Balanced, conservative traits |
    And I can apply template to auto-configure all agents

  @priority-p2 @edge-case
  Scenario: Handle agent trait conflicts gracefully
    Given I set conflicting traits
    When I try to save: Verbosity=Quiet AND ResponseFormat=Detailed
    Then the system should:
      | Action | Result |
      | Detect conflict | "Conflicting traits detected" |
      | Suggest resolution | "Quiet verbosity requires Concise response format" |
      | Auto-fix | Adjust ResponseFormat to Concise |
      | Allow override | User can manually confirm if desired |

  @priority-p2 @edge-case
  Scenario: Validate skill assignments are feasible
    Given I assign skills to an agent
    When I assign incompatible skill combinations
    Like: Monolith architecture + Kubernetes + Serverless
    Then the system should:
      | Action | Result |
      | Warn user | "Architectural styles conflict" |
      | Suggest guidance | "Choose one: Monolith OR Microservices OR Serverless" |
      | Allow override | Can save conflicting config if justified |

---

Feature: Agent Visibility and Transparency
  As a junior developer
  I want to understand what AI agents are doing in real-time
  So that I can learn from their behavior and debug issues

  Background:
    Given Pixel Agents dashboard is open
    And agents are actively working
    And the transparency/visibility panel is accessible

  @priority-p2 @essential
  Scenario: Show agent current activity in real-time
    Given dev-tdd-red is actively working
    When I view the Agent Registry
    Then each agent should display:
      | Information | Example |
      | Agent name | dev-tdd-red |
      | Current task | "Writing test for email validation (RED-01)" |
      | Progress | "3/5 test scenarios completed" |
      | Status | 🔴 Active / 🟡 Waiting / 🟢 Idle |
      | Last activity | "2 minutes ago" |

  @priority-p2 @essential
  Scenario: Show agent action bubble with code snippet
    Given an agent is actively writing code
    When I look at the office canvas
    Then above the agent sprite should appear:
      | Element | Content |
      | Action bubble | Quote bubble with current code |
      | Code snippet | First 80-100 chars of code being written |
      | Action type | Icon indicating (Writing 📝, Testing ✅, Refactoring 🔄) |
      | Fade out | Bubble disappears after 5 seconds |

  @priority-p2 @essential
  Scenario: Show agent context window
    Given I click on an agent in the Agent Registry
    When the agent detail panel opens
    Then I should see:
      | Section | Content |
      | Agent info | Name, role, current task |
      | Context | Files currently in context, token count |
      | Recent actions | Last 5 actions with timestamps |
      | Code output | Latest code written/modified |
      | Messages | Recent messages from agent |

  @priority-p2 @essential
  Scenario: Show agent decision reasoning
    Given an agent just completed a task
    When I click on "View decision log"
    Then I should see:
      | Information | Example |
      | Task | "Implement email validation" |
      | Decision | "Used regex validation over library" |
      | Reasoning | "Simpler, lower dependencies, meets requirements" |
      | Alternatives considered | "Option 1: email-validator lib (rejected: +2KB) | Option 2: Complex regex (rejected: maintainability)" |
      | Confidence | 92% (high) |
      | Time taken | 2 minutes 30 seconds |

  @priority-p2 @ui-ux
  Scenario: Show agent communication history
    Given I open the Agent Registry
    When I expand the "Communications" section
    Then I should see:
      | Item | Content |
      | Recent messages | Agent-to-agent handoffs, notes |
      | Status updates | "Completed test for Layer 1, handing off to dev-tdd-green" |
      | Blockers raised | "Blocked: Missing acceptance criteria for US-001-002" |
      | Timestamps | When each communication occurred |

  @priority-p2 @ui-ux
  Scenario: Filter agent activity by type
    Given the Agent Registry is visible
    When I access the "Activity Filter" dropdown
    Then I should be able to filter by:
      | Filter | Shows |
      | All | All agent activities |
      | Code writes | Only when agents write code |
      | Tests | Only when running tests |
      | Decisions | Only decision logs |
      | Blockers | Only when agents report blockers |

  @priority-p2 @ui-ux
  Scenario: Show agent error explanation
    Given an agent encountered an error
    When I view the agent detail panel
    Then I should see:
      | Element | Content |
      | Error icon | 🔴 Error occurred |
      | Error message | "Test assertion failed: expected 'email@domain.com' to be valid" |
      | Context | Which test, file, line number |
      | Suggested fix | "Add test case for email without TLD" |
      | Learn more | Link to error documentation |

  @edge-case
  Scenario: Privacy-aware information display
    Given sensitive information might appear in code
    When displaying agent context/code/decisions
    Then the system should:
      | Action | Result |
      | Redact secrets | Hide API keys, credentials |
      | Mask data | Replace PII with [REDACTED] |
      | Ask permission | Prompt user before showing sensitive data |
      | Configuration | User can set redaction rules |

  @edge-case
  Scenario: Limit visibility of complex internal operations
    Given an agent performs complex multi-step operations
    When I request to see full context
    Then show:
      | Content | Level |
      | High-level summary | Always visible |
      | Detailed steps | Expandable on-demand |
      | Internal reasoning | Available for learning |
      | Code output | Always visible |
      | Raw telemetry | Only if explicitly enabled |
