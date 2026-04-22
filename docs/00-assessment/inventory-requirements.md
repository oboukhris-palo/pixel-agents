# Requirements & Project Management Inventory — Pixel Agents Extension

**Assessment Date:** April 22, 2026  
**Confidence:** ⭐⭐⭐⭐ (70-89% - Strong evidence from README roadmap, some assumptions on priorities)

---

## Requirements Sources

### 1. README Roadmap
**Location:** README.md (bottom section)  
**Status:** ✅ Comprehensive and well-categorized

#### Completed Features
- ✅ **Agent Registry** — Discover and display agents from `.github/agents/`
- ✅ **GitHub file tracking** — Highlight when agents access `.github/` directory
- ✅ **Agent metadata** — Show agent roles, descriptions, capabilities
- ✅ **Workflow status bar** — Real-time PDLC stage and TDD phase detection with progress tracking
- ✅ **Multi-agent display** — Show all agents in office layout with automatic desk assignment
- ✅ **Multi-agent handoff animation** — Directional arrows, path lines, sound effects

#### In Progress / Future Features
- 🔄 **Workflow dashboard** — Clickable status bar with detailed workflow visualization, timeline, task breakdown
- 🔄 **Enhanced workflow tracking** — Improved TDD phase detection, epic-level progress tracking, risk indicators
- 🔄 **Agent-workflow integration** — Auto-assign agents to workflow stages, highlight which agent is working on which document
- 🔄 **Handoff choreography** — Customize handoff animation sequences and transition styles
- 🔄 **Community assets** — Freely usable pixel art tilesets/characters (no purchase required)
- 🔄 **Agent creation and definition** — Define agents with custom skills, system prompts, names, skins before launching
- 🔄 **Desks as directories** — Click desk to select working directory, drag/drop agents to assign to specific desks/projects
- 🔄 **Git worktree support** — Agents working in different worktrees to avoid parallel work conflicts
- 🔄 **Support for other agentic frameworks** — Integrate with Cursor, Claude, Continue.dev beyond GitHub Copilot
- 🔄 **Activity history** — Show recent files and activities for each agent
- 🔄 **Custom office layout templates** — Pre-built layouts based on team structure

---

## Feature Categorization

### Core Features (MVP — Implemented)
1. **Agent Visualization** — Animated pixel art characters representing agents
2. **Office Environment** — 2D tile-based office with floor, walls, furniture
3. **Agent Registry** — List of available agents from `.github/agents/`
4. **Activity Detection** — Track agent file edits, terminal executions
5. **Workflow Status Bar** — Display current PDLC stage/phase
6. **Layout Editor** — Design office with paint/erase/place tools, undo/redo
7. **Multi-Agent Display** — Multiple agents with automatic desk assignment
8. **Handoff Animation** — Visual and audio feedback on agent transitions

**Priority:** ✅ COMPLETE (MVP delivered)

---

### Tier 1 Enhancements (Next 1-2 Months)
**Priority:** 🔥 HIGH (Critical for gene2 v2.x transformation)

#### 1. Workflow Dashboard (Clickable Status Bar)
**User Story:** As a developer, I want to click the workflow status bar to see a detailed breakdown of PDLC progress, so I can understand project status at a glance.

**Acceptance Criteria:**
- [ ] Clicking status bar opens modal with detailed workflow view
- [ ] Shows timeline of completed stages and upcoming phases
- [ ] Displays task breakdown by epic and user story
- [ ] Highlights blockers and risks with severity indicators
- [ ] Shows agent assignments to workflow stages
- [ ] Provides quick navigation to related documents

**Estimated Complexity:** Medium (3-5 days)

---

#### 2. Enhanced Workflow Tracking
**User Story:** As a project manager, I want to see epic-level progress and risk indicators, so I can identify bottlenecks before they become blockers.

**Acceptance Criteria:**
- [ ] Epic completion percentage (X/Y stories done)
- [ ] Epic risk indicator (on-track / at-risk / delayed)
- [ ] TDD phase detection improved (RED/GREEN/REFACTOR cycle tracking)
- [ ] Story velocity metrics (average completion time)
- [ ] Predicted completion dates based on velocity

**Estimated Complexity:** Medium (4-6 days)

---

#### 3. Agent-Workflow Integration
**User Story:** As a developer, I want agents auto-assigned to workflow stages, so I can see which agent is working on which document without manual tracking.

**Acceptance Criteria:**
- [ ] Agent auto-assignment based on document type (dev-lead for implementation-plan.md, QA for test-strategies.md)
- [ ] Visual highlighting of agent currently working on a document
- [ ] Document access history per agent
- [ ] Agent handoff tracking (who handed off to whom, when, why)

**Estimated Complexity:** Medium-High (5-7 days)

---

#### 4. Context Window Visualization (CRITICAL)
**User Story:** As a developer, I want to see real-time Copilot Chat context usage, so I can avoid hitting token limits and optimize my prompts.

**Acceptance Criteria:**
- [ ] Left vertical bar shows context usage (0-100%)
- [ ] Breakdown by source (.github instructions, project code, chat history)
- [ ] Color-coded warnings (green 0-70%, yellow 71-89%, red 90%+)
- [ ] "Start New Session" button when critical
- [ ] Context optimization recommendations

**Estimated Complexity:** High (7-10 days) — Requires Copilot Chat API integration

---

#### 5. Task Progression Bar
**User Story:** As a developer, I want to see previous/current/next task at a glance, so I know where I came from and where I'm going.

**Acceptance Criteria:**
- [ ] Top bar shows: Previous Task | Current Task | Next Task
- [ ] Previous task shows completion status and timestamp
- [ ] Current task shows agent, model, layer, cycle
- [ ] Next task predicted from backlog and TDD cycle state
- [ ] Clickable tasks to navigate to related documents

**Estimated Complexity:** Medium (4-5 days)

---

#### 6. Completeness Meter (Gamification)
**User Story:** As a developer, I want to see project completion percentage as a "win condition", so I feel motivated to reach 100%.

**Acceptance Criteria:**
- [ ] Right vertical bar shows completion (0-100%)
- [ ] Real-time stats: epics done, stories delivered, tests passing
- [ ] Milestone celebrations (25%, 50%, 75%, 90%, 100%)
- [ ] Achievement badges unlocked (TDD Master, Project Victory)
- [ ] PRU efficiency scoring

**Estimated Complexity:** Medium (5-6 days)

---

### Tier 2 Enhancements (Month 3-4)
**Priority:** MEDIUM (Nice-to-have for better UX)

#### 7. Handoff Choreography
**User Story:** As a developer, I want customizable handoff animation sequences, so the visual experience matches my team's workflow.

**Acceptance Criteria:**
- [ ] Define handoff animation styles (quick / detailed / celebratory)
- [ ] Customize transition effects (fade / slide / teleport)
- [ ] Configure sound effects (chime / bell / silence)
- [ ] Agent-specific handoff behaviors (architect → dev-lead celebratory)

**Estimated Complexity:** Low-Medium (3-4 days)

---

#### 8. Agent Creation & Definition
**User Story:** As a team lead, I want to define custom agents with unique skills and system prompts, so they match my team's specialized roles.

**Acceptance Criteria:**
- [ ] UI to create new agent definitions
- [ ] Define agent name, role, description, argumentHint
- [ ] Assign custom sprite (color, shape, icon)
- [ ] Set system prompt and skill specializations
- [ ] Export agent definition to `.agent.md` file

**Estimated Complexity:** Medium (5-6 days)

---

#### 9. Desks as Directories
**User Story:** As a developer working on multiple projects, I want to assign agents to specific desks representing different directories, so agents don't conflict.

**Acceptance Criteria:**
- [ ] Click desk to select working directory (folder picker)
- [ ] Drag-and-drop agents to desks to assign them
- [ ] Visual indicator showing desk's assigned directory
- [ ] Agent file operations scoped to desk directory

**Estimated Complexity:** Medium-High (6-8 days)

---

#### 10. Git Worktree Support
**User Story:** As a team lead, I want agents working in different worktrees, so parallel work on the same files doesn't cause conflicts.

**Acceptance Criteria:**
- [ ] Detect git worktrees in workspace
- [ ] Assign agents to worktree folders
- [ ] Visual indicator for worktree boundaries
- [ ] Prevent agent conflicts across worktrees

**Estimated Complexity:** High (8-10 days)

---

### Tier 3 Enhancements (Month 5+)
**Priority:** LOW (Long-term vision)

#### 11. Multi-Framework Support
**User Story:** As a developer using Cursor/Claude/Continue.dev, I want Pixel Agents to visualize agents from any framework, not just GitHub Copilot.

**Acceptance Criteria:**
- [ ] Abstract activity detection layer (framework-agnostic API)
- [ ] Support Cursor agent detection
- [ ] Support Claude Code agent detection
- [ ] Support Continue.dev agent detection
- [ ] Unified agent registry across frameworks

**Estimated Complexity:** Very High (15-20 days) — Requires research and framework-specific APIs

---

#### 12. Community Assets
**User Story:** As a user, I want freely usable pixel art assets, so I don't need to purchase third-party tilesets.

**Acceptance Criteria:**
- [ ] Create or source open-source office tileset (CC0 / MIT)
- [ ] Create or source diverse character sprites (CC0 / MIT)
- [ ] Replace dependency on $2 Office Interior Tileset
- [ ] Asset import pipeline for community contributions

**Estimated Complexity:** High (10-15 days) — Requires pixel art creation or licensing negotiations

---

#### 13. Activity History
**User Story:** As a developer, I want to see recent files and activities for each agent, so I can audit what work was done.

**Acceptance Criteria:**
- [ ] Agent card shows last 5 file operations
- [ ] Timestamped activity log
- [ ] Filter by activity type (read / write / execute)
- [ ] Export activity log to CSV

**Estimated Complexity:** Medium (4-5 days)

---

#### 14. Custom Office Layout Templates
**User Story:** As a team lead, I want pre-built office layout templates, so I can quickly set up layouts matching my team structure.

**Acceptance Criteria:**
- [ ] Template library (Small Team, Agile Squad, Enterprise Team)
- [ ] One-click template application
- [ ] Template preview before applying
- [ ] Custom template creation and sharing

**Estimated Complexity:** Low-Medium (3-4 days)

---

## User Story Structure Analysis

### Current State
- ✅ **README Roadmap** — Clear feature categorization (Completed vs Future)
- ⚠️ **No User Stories** — Features described but not in user story format
- ⚠️ **No Acceptance Criteria** — Features listed without clear definition of done
- ⚠️ **No Story Points** — No effort estimation for features
- ⚠️ **No Epics** — No grouping of related features into epics

### Recommended Epic Structure

#### Epic 1: Workflow Visualization Enhancement
- US-001: Workflow dashboard (clickable status bar)
- US-002: Enhanced workflow tracking (epic-level progress, risk indicators)
- US-003: Agent-workflow integration (auto-assignment to documents)

#### Epic 2: Context & Task Management
- US-004: Context window visualization (left bar)
- US-005: Task progression bar (previous | current | next)
- US-006: Completeness meter (right bar, gamification)

#### Epic 3: Agent Customization
- US-007: Agent creation & definition UI
- US-008: Custom agent sprites and personalities
- US-009: Agent skill specializations

#### Epic 4: Multi-Project & Multi-Agent Coordination
- US-010: Desks as directories (workspace scoping)
- US-011: Git worktree support (parallel work isolation)
- US-012: Activity history per agent

#### Epic 5: Platform Extensibility
- US-013: Multi-framework support (Cursor, Claude, Continue.dev)
- US-014: Plugin architecture for custom visualizations
- US-015: Community asset marketplace

---

## Backlog Management

### Current Tracking
- ✅ README.md roadmap (manual update)
- ❌ No GitHub Issues
- ❌ No GitHub Projects
- ❌ No Sprint Planning
- ❌ No Velocity Tracking

### Recommendations
1. **Create GitHub Issues** for each user story (use issue templates)
2. **Organize into GitHub Project** with Kanban board (Backlog | In Progress | Done)
3. **Add Story Points** to issues (Fibonacci: 1, 2, 3, 5, 8, 13)
4. **Track Velocity** (completed story points per sprint)
5. **Sprint Planning** (2-week sprints, define goals)

---

## Stakeholder Inputs

### User Feedback (Implicit from Roadmap)
- ✅ **Request:** Workflow dashboard for detailed progress tracking
- ✅ **Request:** Support for non-Copilot agentic frameworks
- ✅ **Request:** Custom agent definitions and skills
- ✅ **Request:** Community-contributed assets (avoid $2 tileset requirement)
- ✅ **Request:** Multi-project support (desks as directories)

### Feature Prioritization (Inferred)
1. **Workflow dashboard & tracking** — Highest value (visibility into project status)
2. **Context window visualization** — Critical for LLM optimization
3. **Task progression bar** — Improves developer flow
4. **Completeness meter** — Gamification adds engagement
5. **Multi-framework support** — Expands user base significantly
6. **Agent customization** — Nice-to-have for power users

---

## Requirements Maturity Assessment

### Score: **1.8 / 3.0** (60%) — "Developing"

| Category | Score | Confidence | Rationale |
|----------|-------|------------|-----------|
| **Feature Clarity** | 2.5 / 3.0 | ⭐⭐⭐⭐ | README roadmap clear and comprehensive |
| **User Story Format** | 0.5 / 3.0 | ⭐⭐⭐⭐⭐ | No user stories yet (features described informally) |
| **Acceptance Criteria** | 0.5 / 3.0 | ⭐⭐⭐⭐⭐ | No explicit acceptance criteria defined |
| **Epic Organization** | 0.0 / 3.0 | ⭐⭐⭐⭐⭐ | No epic structure (flat list of features) |
| **Story Points** | 0.0 / 3.0 | ⭐⭐⭐⭐⭐ | No effort estimation |
| **Prioritization** | 2.0 / 3.0 | ⭐⭐⭐⭐ | Implicit prioritization (Completed vs Future), but no explicit ranking |
| **Backlog Management** | 1.5 / 3.0 | ⭐⭐⭐⭐⭐ | README roadmap exists, but no GitHub Issues or Project board |

---

## Recommendations

### High Priority (Week 1-2)
1. **Convert roadmap to user stories** — Format: "As a [user], I want [feature], so that [value]"
2. **Define acceptance criteria** for Tier 1 features (6 stories: US-001 to US-006)
3. **Create epics** — Group related stories into 5 epics (Workflow, Context, Agent, Multi-Project, Platform)
4. **Add story points** — Estimate effort using Fibonacci sequence

### Medium Priority (Week 3-4)
5. **Create GitHub Issues** for all user stories (backlog)
6. **Set up GitHub Project** with Kanban board
7. **Sprint planning** — Define first 2-week sprint with goals (US-001, US-004, US-005)
8. **Track velocity** — Measure completed story points per sprint

### Low Priority (Month 2+)
9. **Stakeholder interviews** — Validate feature prioritization with users
10. **Feature voting** — Community input on what to build next
11. **Release planning** — Multi-sprint roadmap with milestones

---

**Next Steps:** Create inventory for Design & UX Assets (Figma, Miro, pixel art specifications)
