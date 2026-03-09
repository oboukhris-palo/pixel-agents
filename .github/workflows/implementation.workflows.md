# Implementation Workflow (Streamlined)

## Overview

This document defines the **Implementation & Development Execution Workflow** - the streamlined, layer-by-layer approach for converting completed PRD documents (from [documents.workflows.md](.github/workflows/documents.workflows.md)) into implemented, tested, and validated features.

**Key Architecture**:
- **User-Story Level Granulation**: Work happens one user-story at a time through all 4 layers before moving to the next
- **Layer-by-Layer Decomposition**: Lead Dev Agent decomposes each story into 4 layers (Database → Backend → Config → Frontend) at preparation time
- **TDD Orchestrator-Driven**: Once decomposition is complete, TDD-Orchestrator takes control and drives disciplined RED → GREEN → REFACTOR cycles per layer
- **Epic Completion is Automatic**: An Epic is marked "Implemented" when **ALL of its User Stories are implemented**
- **Clear Handoff Points**: Lead Dev → TDD-Orchestrator → back to Lead Dev for next story

**Prerequisites**: All PDLC stages (1-6) must be completed with approved documents:
- ✅ requirements.md (business requirements) - stored in `/docs/prd/`
- ✅ personas.md (user archetypes) - stored in `/docs/prd/`
- ✅ **user-stories.md** (PRD document) - stored in `/docs/prd/`
  - Created during PDLC Stage 4
  - Contains Epics (organizational groupings) and User Stories (work units)
  - Each user story includes BDD scenarios (Gherkin feature files)
  - **Read-only reference** for implementation
- ✅ **user-stories.md** (status tracking) - stored in `/docs/user-stories/`
  - ⭐ **SINGLE SOURCE OF TRUTH** for implementation progress (local)
  - Mirrors structure from `/docs/prd/user-stories.md`
  - Adds status tracking: Not Started / In Progress / Implemented / Delivered
  - **Synchronized bidirectionally with GitHub Issues** (remote)
  - **PM checks this** to track progress across all user stories
  - **Orchestrator checks this** to determine next user-story
- ✅ architecture-design.md (system design) - stored in `/docs/prd/`
- ✅ tech-spec.md (implementation specifications) - stored in `/docs/prd/`
- ✅ design-systems.md (UI components and design tokens) - stored in `/docs/design/`
- ✅ test-strategies.md (testing approach) - stored in `/docs/prd/`
- ✅ **GitHub Repository Access** - Project must be hosted on GitHub with write access for:
  - Creating GitHub Issues for all user stories
  - Linking issues to parent epics
  - Updating issue status (Open → In Progress → Implemented → Delivered → Closed)
  - Synchronizing local `/docs/user-stories/user-stories.md` with GitHub Issues

**Folder Structure**:
```
/docs/
  ├── prd/                          # All PRD documents
  │   ├── requirements.md
  │   ├── personas.md
  │   ├── user-stories.md           # PRD: All epics & user stories with BDD scenarios
  │   ├── architecture-design.md
  │   ├── tech-spec.md
  │   ├── design-systems.md
  │   └── test-strategies.md
  ├── user-stories/                 # User story implementation tracking
  │   ├── user-stories.md           # ⭐ SINGLE SOURCE OF TRUTH for implementation status
  │   │                             # Status: Not Started / In Progress / Implemented / Delivered
  │   ├── project-status.md         # 📊 Project dashboard (epic progress, metrics, blockers)
  │   ├── current-sprint.md         # 📋 Active sprint planning & daily tracking
  │   ├── sprint-1.md               # Archived sprint (after closure)
  │   ├── sprint-2.md               # Archived sprint (after closure)
  │   └── <USER-STORY-REF>/         # Per-story folders (e.g., US-001/)
  │       ├── <US-REF>.md           # SINGLE STORY FILE: Definition + enrichment (AC, BDD, UI inputs, API contracts)
  │       ├── implementation-plan.md # Layer-by-layer technical decomposition
  │       ├── <US-REF>-HANDOFF.md  # 🔄 TDD agent handoff communication
  │       └── tdd-execution.md      # 📝 TDD cycle execution tracking
  └── design/                       # UX/UI design documents
```

---

## Implementation Checkpoint Documents

### User-Story Level Documents

#### `/docs/user-stories/<US-REF>/<US-REF>-HANDOFF.md` 🔄
**Purpose**: Enable seamless handoffs between TDD agents (tdd-orchestrator, tdd-red, tdd-green, tdd-refactor) per user-story

**Managed by**: TDD agents (tdd-orchestrator, tdd-red, tdd-green, tdd-refactor)

**Content Structure**:
- **Current Phase**: RED / GREEN / REFACTOR / COMPLETE
- **Current Layer**: Database / Backend / Config / Frontend
- **Progress Summary**: What was completed in last cycle
- **Next Actions**: What the next agent should focus on
- **Blockers**: Any issues that need escalation
- **Context**: Key decisions, assumptions, or constraints
- **Files Modified**: List of files created/changed in last cycle
- **Test Status**: Current pass/fail state of tests

**Update Triggers**:
- **TDD-Orchestrator**: Creates file at start, updates after each layer completion
- **TDD-RED**: Updates after writing failing tests
- **TDD-GREEN**: Updates after implementing code to pass tests
- **TDD-REFACTOR**: Updates after improving code quality

#### `/docs/user-stories/<US-REF>/implementation-plan.md` 📋
**Purpose**: Lead-dev implementation plan to execute per user-story (layer-by-layer technical decomposition)

**Managed by**: Dev-Lead agent

**Content Structure** (existing - enhanced for agent communication):
- **Layer 1 (Database)**: Schema, migrations, indexes, files, BDD coverage
- **Layer 2 (Backend)**: Endpoints, services, business logic, files, BDD coverage
- **Layer 3 (Config)**: Routes, DI, middleware, feature flags, files, BDD coverage
- **Layer 4 (Frontend)**: Components, state mgmt, styling, files, BDD coverage
- **Agent Communication Notes**: Special instructions for TDD agents
- **Architectural Constraints**: From architecture-design.md
- **Definition of Done**: All BDD passing, >80% coverage, code review approved

**Update Triggers**:
- **Dev-Lead**: Creates during Phase 3, updates if requirements change
- **TDD-Orchestrator**: May add notes about implementation approach

#### `/docs/user-stories/<US-REF>/tdd-execution.md` 📝
**Purpose**: Document the TDD cycle executions for every user-story (detailed execution log)

**Managed by**: TDD agents (primarily tdd-orchestrator)

**Content Structure**:
- **Story Overview**: US-REF, title, epic, acceptance criteria
- **Layer Progress Tracking**:
  - Layer 1: Status, tests written, code implemented, refactors applied
  - Layer 2: Status, tests written, code implemented, refactors applied
  - Layer 3: Status, tests written, code implemented, refactors applied
  - Layer 4: Status, tests written, code implemented, refactors applied
- **TDD Cycle Log**: Timestamped entries of RED-GREEN-REFACTOR cycles
- **Test Results**: Pass/fail counts, coverage metrics per layer
- **Code Quality Metrics**: Complexity, duplication, SOLID compliance
- **Blockers & Resolutions**: Issues encountered and how they were resolved
- **Final Status**: BDD test results, readiness for BA validation

**Update Triggers**:
- **TDD-Orchestrator**: Creates file, updates after each layer
- **TDD-RED/GREEN/REFACTOR**: Add entries for each cycle
- **Dev-Lead**: Reviews and signs off on completion

### Project Level Documents

#### `/docs/user-stories/project-status.md` 📊
**Purpose**: Project overview dashboard - single source of truth for the PM agent

**Managed by**: PM agent (primary), with contributions from other agents

**Content Structure**:
- **Project Overview**: Name, description, current phase, overall progress
- **Epic Progress**: Status of each epic (% completion, story counts)
- **Sprint Summary**: Current sprint number, start/end dates, capacity utilization
- **Team Velocity**: Stories per sprint, trend analysis, capacity planning
- **Active Blockers**: Issues requiring PM attention (>4 hours blocked)
- **Risk Register**: Identified risks with mitigation plans
- **Quality Metrics**: Test coverage, bug counts, code quality scores
- **Resource Allocation**: Team member assignments, workload distribution
- **Milestones & Deadlines**: Key project dates, dependencies
- **Stakeholder Communication**: Status for external reporting

**Update Triggers**:
- **PM**: Updates daily for blockers, weekly for metrics and progress
- **Dev-Lead**: Updates quality metrics after story completion
- **BA**: Updates validation metrics and bug counts
- **TDD-Orchestrator**: Updates velocity and completion metrics

#### `/docs/user-stories/current-sprint.md` 📋
**Purpose**: The user-stories references to tackle per sprint (active sprint planning & execution)

**Managed by**: PM agent (planning), Dev-Lead agent (execution tracking)

**Content Structure**:
- **Sprint Header**: Sprint number, dates, capacity, selected approach
- **Selected Stories**: Table with US-REF, title, story points, status, assignee
- **Sprint Scope**: Conservative/Balanced/Stretch justification
- **Daily Progress Tracking**: Burndown chart, daily standup notes
- **Dependency Map**: Story dependencies and blockers
- **Definition of Ready/Done**: Sprint-specific acceptance criteria
- **Risk Management**: Sprint risks and mitigation strategies
- **Team Assignments**: Who is working on which stories
- **Sprint Retrospective**: (Added at sprint end before archiving)

**Update Triggers**:
- **PM**: Creates at sprint start, updates daily for progress tracking
- **Dev-Lead**: Updates story status as implementation progresses
- **BA**: Updates validation status after testing
- **TDD-Orchestrator**: Updates technical progress and blockers

#### `/docs/user-stories/user-stories.md` ⭐
**Purpose**: Master user stories document with implementation status (already exists - enhanced for agent communication)

**Managed by**: Multiple agents based on their responsibilities

**Content Structure** (enhanced):
- **Status Tracking**: Not Started / In Progress / Implemented / Delivered
- **GitHub Integration**: Issue numbers, links, synchronization status
- **Epic Grouping**: Stories organized by parent epic
- **Agent Assignment**: Current responsible agent per story
- **Last Updated**: Timestamp and agent who made the change
- **Communication Log**: Key updates from agents about story status

**Update Triggers**:
- **PM**: Updates during sprint planning and closure
- **Dev-Lead**: Updates when starting implementation and marking complete
- **BA**: Updates after validation (Implemented → Delivered)
- **TDD-Orchestrator**: Updates during active development phases

---

## Agent Communication Patterns

### Document-Based Communication Rules

**Agents must communicate their work, research, analysis, and reporting through these checkpoint documents. Agents update these documents when needed as long as it's within their responsibilities.**

**🤖 AI ACTIVITY LOGGING INTEGRATION**: All agents use `ImplementationWorkflowInterceptor` to track patterns, optimize workflows, and generate insights. Logging is enabled by default and captures:
- Agent handoffs and decision points
- TDD cycle efficiency and bottlenecks  
- Sprint planning decisions and velocity trends
- Document synchronization and GitHub integration
- Story lifecycle transitions and validation results
- Epic progression and cross-dependencies

#### PM Agent Communication
- **Primary Documents**: `/docs/user-stories/project-status.md`, `/docs/user-stories/current-sprint.md`
- **Updates**: Daily for blockers and progress tracking, weekly for metrics and planning
- **Communication**: Project status reports, sprint planning decisions, resource allocation
- **Escalation Triggers**: Stories blocked >4 hours, velocity trends, capacity issues
- **🤖 AI Logging**: Sprint scope decisions (Conservative/Balanced/Stretch), capacity utilization, story selection patterns, GitHub issue creation and synchronization

#### Dev-Lead Agent Communication  
- **Primary Documents**: `/docs/user-stories/<US-REF>/implementation-plan.md`, `/docs/user-stories/user-stories.md`
- **Updates**: During Phase 3 (plan creation), Phase 5 (status sync), quality gate reviews
- **Communication**: Technical decomposition, architectural decisions, implementation readiness
- **Handoff Notes**: Clear technical specifications for TDD agents, dependency resolution
- **🤖 AI Logging**: Layer decomposition decisions, architecture choices, technical debt identification, implementation plan quality metrics, status synchronization patterns

#### TDD Agent Communication (tdd-orchestrator, tdd-red, tdd-green, tdd-refactor)
- **Primary Documents**: `/docs/user-stories/<US-REF>/<US-REF>-HANDOFF.md`, `/docs/user-stories/<US-REF>/tdd-execution.md`
- **Updates**: After each TDD cycle (RED-GREEN-REFACTOR), layer completion, issue resolution
- **Communication**: Current phase status, next actions, blockers, technical decisions, test results
- **Chain of Thought**: Detailed execution log for transparency and troubleshooting
- **🤖 AI Logging**: RED-GREEN-REFACTOR cycle efficiency, test coverage trends, code complexity metrics, refactoring frequency, layer-specific bottlenecks, BDD assertion coverage

#### BA Agent Communication
- **Primary Documents**: `/docs/user-stories/user-stories.md`, GitHub Issue comments
- **Updates**: After validation testing, bug discovery, story acceptance
- **Communication**: Validation results, bug reports, acceptance criteria verification
- **Quality Gates**: Feature readiness, design compliance, user experience validation
- **🤖 AI Logging**: Validation pass rates, bug discovery patterns, E2E test results, design system compliance, exploratory testing coverage, acceptance criteria verification

### Document Update Triggers

| Agent | Trigger | Document | Content |
|-------|---------|----------|---------|
| **PM** | Sprint start | `current-sprint.md` | Selected stories, capacity, team assignments |
| **PM** | Daily standup | `project-status.md` | Progress metrics, blockers, risk updates |
| **PM** | Sprint end | Archive to `sprint-N.md` | Retrospective, metrics, lessons learned |
| **Dev-Lead** | Phase 3 start | `implementation-plan.md` | Layer decomposition, technical approach |
| **Dev-Lead** | Phase 3 start | `<US-REF>-HANDOFF.md` | TDD communication template initialization |
| **Dev-Lead** | Phase 3 start | `tdd-execution.md` | Execution tracking template setup |
| **Dev-Lead** | Phase 5 | `user-stories.md` | Status update (In Progress → Implemented) |
| **TDD-Orchestrator** | Layer start | `<US-REF>-HANDOFF.md` | Current phase, layer, next actions |
| **TDD-Orchestrator** | Layer complete | `tdd-execution.md` | Cycle log, test results, metrics |
| **TDD-RED** | Test written | `<US-REF>-HANDOFF.md` | Test details, expected behavior |
| **TDD-GREEN** | Code implemented | `<US-REF>-HANDOFF.md` | Implementation notes, files changed |
| **TDD-REFACTOR** | Code improved | `<US-REF>-HANDOFF.md` | Refactoring summary, quality metrics |
| **BA** | Validation complete | `user-stories.md` | Status update (Implemented → Delivered or bugs) |
| **BA** | Bug found | GitHub Issue comments | Bug details, repro steps, screenshots |

### Communication Quality Standards

1. **Timeliness**: Update documents within 1 hour of completing work
2. **Clarity**: Use clear, actionable language; avoid technical jargon for non-technical stakeholders
3. **Traceability**: Reference exact US-REF, GitHub issue numbers, commit hashes
4. **Context**: Provide enough context for the next agent to continue work seamlessly
5. **Escalation**: Flag blockers immediately; don't wait for daily standup
6. **Consistency**: Use standardized formats and terminology across all documents

**🤖 AI-POWERED OPTIMIZATION**: Weekly analysis reports identify communication bottlenecks, suggest workflow improvements, and track cost optimization opportunities. Generated reports include:
- Agent handoff efficiency scores and bottleneck identification
- TDD cycle optimization recommendations per layer
- Sprint planning velocity trends and capacity utilization
- Story lifecycle bottleneck analysis and improvement suggestions
- Epic progression patterns and cross-dependency optimization
- Cost impact analysis and ROI calculations for process improvements

---

## Workflow Governance

**Scope**: Implementation execution of user stories through disciplined, layer-by-layer TDD cycles  
**Agents Involved**: PM, PO, BA, Dev-Lead, TDD-Orchestrator, TDD-RED, TDD-GREEN, TDD-REFACTOR  
**Key Documents**: [documents.workflows.md](.github/workflows/documents.workflows.md), [architecture-design.md](../docs/prd/architecture-design.md), [tech-spec.md](../docs/prd/tech-spec.md), [design-systems.md](../docs/prd/design-systems.md), [coding.instructions.md](../instructions/coding.instructions.md)  
**Version Control**: Git with feature branches, pull requests, and quality gates  
**Issue Tracking**: GitHub Issues with user-story tagged to parent epic

---

## Development Execution Pipeline (Sprint-Based)

```
PDLC Complete Documents
(/docs/prd/requirements.md, /docs/prd/user-stories.md with epics & BDD scenarios,
/docs/prd/architecture-design.md, /docs/prd/tech-spec.md, 
/docs/design/design-systems.md, /docs/prd/test-strategies.md)
        ↓
PHASE 0: PM INITIALIZES PROJECT & GITHUB INTEGRATION
├─ ✅ Verify GitHub repository exists with write access
├─ ✅ Create /docs/user-stories/user-stories.md (mirrors PRD with status tracking)
├─ ✅ Create /docs/user-stories/project-status.md (dashboard template with project overview, epic progress, team setup)
├─ For EACH user-story in /docs/prd/user-stories.md:
│  ├─ Create GitHub Issue (title, acceptance criteria, BDD scenarios)
│  ├─ Tag with parent epic label
│  ├─ Set initial status: "Not Started"
│  └─ Store issue number in /docs/user-stories/user-stories.md
├─ Initialize sprint planning
└─ Hand off to Orchestrator: "Project initialized. Ready to start Sprint 1."
        ↓
═════════════════════════════════════════════════════════════════════════════════
SPRINT N CYCLE (Repeat until all epics completed)
═════════════════════════════════════════════════════════════════════════════════
        ↓
PHASE 1: PM SPRINT PLANNING (Start of Sprint)
├─ 🎯 ANNOUNCE: "Ready to plan Sprint [N]. Selecting stories from not-started queue."
├─ **🔴 CRITICAL: Read `/docs/prd/user-stories.md` to get EXACT user-story references (US-001, US-002, etc.)**
├─ **NUMBERING RULE: All sprint planning MUST use exact US-REF from `/docs/prd/user-stories.md`**
│  ├─ Do NOT create or use different numbering schemes (e.g., S1, FEAT-01, STORY-1, etc.)
│  ├─ Do NOT truncate or abbreviate references
│  └─ Do NOT reorder or renumber stories in current-sprint.md
├─ Present 3 scope options:
│  ├─ Conservative (50-70% capacity): Safe stories, low risk
│  ├─ Balanced (70-100% capacity): Mix of priorities, reasonable challenge ⭐
│  └─ Stretch (100-120% capacity): High complexity, requires perfect execution
├─ Create /docs/user-stories/current-sprint.md with:
│  ├─ **VALIDATION: Copy each story reference DIRECTLY from `/docs/prd/user-stories.md` (do NOT edit)**
│  ├─ Selected user-stories (marked in table with exact US-REF like US-001, US-002)
│  ├─ Story points and capacity utilization
│  ├─ Dependency map and blocker list
│  ├─ Definition of Ready (DOR) and Definition of Done (DOD)
│  └─ Team assignments
├─ **POST-CREATION VALIDATION: Compare user-story references in current-sprint.md with `/docs/prd/user-stories.md`**
│  └─ Ensure 1:1 match (no typos, no abbreviations, exact format: US-XXX)
├─ Update /docs/user-stories/project-status.md with:
│  ├─ Active sprint section (sprint number, dates, approach)
│  ├─ Selected stories list (use exact US-REF from current-sprint.md)
│  ├─ Epic progress (auto-calculated from `/docs/prd/user-stories.md`)
│  ├─ Team assignments and capacity allocation
│  └─ Risk register for sprint (dependencies, blockers)
├─ Update all GitHub Issues: Add "Sprint-[N]" label and milestone
│  └─ GitHub Issue titles must include exact US-REF (e.g., "[US-001] User can login with email")
└─ Hand off to BA: "Sprint [N] planned. Stories selected using exact US-REF from PRD. Begin enrichment."
        ↓
PHASE 2: BA ENRICHES USER STORIES (During Sprint Planning)
├─ 🎯 ANNOUNCE: "Ready to enrich stories in current sprint. Enriching /docs/user-stories/<US-REF>/<US-REF>.md for each."
├─ **🔴 CRITICAL VALIDATION: Verify <US-REF> in all artifacts MATCHES EXACTLY with `/docs/prd/user-stories.md`**
│  └─ If any divergence found (typos, abbreviations, renumbering), PAUSE and correct before proceeding
├─ For EACH user-story in current-sprint.md:
│  ├─ **VERIFY US-REF**: Confirm reference matches exactly with `/docs/prd/user-stories.md` (no typos, abbreviations)
│  ├─ Open/create /docs/user-stories/<US-REF>/<US-REF>.md (using exact US-REF from PRD)
│  ├─ Import PO-validated acceptance criteria from /docs/prd/user-stories.md (update acceptance_criteria section)
│  ├─ Extract and validate Gherkin BDD scenarios (update bdd_scenarios section)
│  ├─ Integrate UI inputs from UX agent and /docs/design/design-systems.md (update ui_ux_inputs section)
│  ├─ Document form fields, validation rules, error messages (in ui_ux_inputs)
│  ├─ Define API contracts (request/response schemas) (update api_contracts section)
│  ├─ Verify design system component availability (in ui_ux_inputs)
│  ├─ Complete definition_of_ready checklist
│  └─ Update enrichment_metadata (importedFromPRD, poValidated, bddExtracted, uxIntegrated, apiContractDefined, dorValidated)
├─ Present enrichment sign-off options:
│  ├─ Option A: All items complete, ready for Dev-Lead
│  ├─ Option B: Some items need PO clarification
│  └─ Option C: UX inputs missing, request from UX agent
├─ Mark story DOR status in current-sprint.md ("Ready" / "Blocked")
├─ Block stories from dev entry if any DOR item missing
└─ Hand off to Dev-Lead: "Enriched stories ready (US-REF validated against PRD). Begin implementation planning."
        ↓
PHASE 3: DEV-LEAD CREATES IMPLEMENTATION PLANS (During Sprint Planning)
├─ 🎯 ANNOUNCE: "Ready to plan implementation. Creating implementation-plan.md for each story."
├─ For EACH story in current-sprint.md (DOR-ready stories only):
│  ├─ Read /docs/user-stories/<US-REF>/<US-REF>.md (enrichment sections: acceptance_criteria, bdd_scenarios, ui_ux_inputs, api_contracts)
│  ├─ Create /docs/user-stories/<US-REF>/implementation-plan.md with:
│  │  ├─ Layer 1 (Database): Schema, migrations, indexes, files, BDD coverage
│  │  ├─ Layer 2 (Backend): Endpoints, services, business logic, files, BDD coverage
│  │  ├─ Layer 3 (Config): Routes, DI, middleware, feature flags, files, BDD coverage
│  │  ├─ Layer 4 (Frontend): Components, state mgmt, styling, files, BDD coverage
│  │  └─ Definition of Done: All BDD passing, >80% coverage, code review approved, BA validation passed
│  ├─ Create /docs/user-stories/<US-REF>/<US-REF>-HANDOFF.md (TDD agent communication template)
│  ├─ Create /docs/user-stories/<US-REF>/tdd-execution.md (execution tracking template)
│  ├─ Extract BDD/Gherkin scenarios from /docs/user-stories/<US-REF>/<US-REF>.md (bdd_scenarios section)
│  ├─ Create features/<domain>/<story-ref>.feature (Gherkin)
│  ├─ Create features/<domain>/<story-ref>.steps.ts (step definitions, failing tests)
│  ├─ Store copy in /docs/user-stories/<US-REF>/bdd-scenarios/ (reference only)
│  ├─ Run BDD tests → FAIL (expected - driving TDD)
│  └─ Commit artifacts to Git
├─ If DOR not met:
│  ├─ Document why in current-sprint.md "Risk Management" section
│  ├─ Update GitHub Issue: "⚠️ Blocked: [Missing item]"
│  └─ Escalate to PM for resolution
├─ **🔴 CRITICAL: Validate numbering consistency before handoff**
│  ├─ Verify <US-REF> matches exactly across:
│  │  ├─ /docs/user-stories/user-stories.md (status tracking)
│  │  ├─ /docs/user-stories/<US-REF>/implementation-plan.md (path and file name)
│  │  ├─ /docs/prd/user-stories.md (source of truth)
│  │  ├─ GitHub Issue title (should include [US-XXX])
│  │  └─ current-sprint.md (story reference list)
│  └─ If ANY divergence found, PAUSE and correct before handing off to TDD
└─ Hand off to TDD-Orchestrator: "Implementation plans ready (numbering validated). BDD tests failing. Ready for TDD cycles."
        ↓
PHASE 4: TDD-ORCHESTRATOR EXECUTES IMPLEMENTATION (During Sprint)
├─ 🎯 ANNOUNCE: "Ready to implement Sprint [N] stories via TDD. Executing RED→GREEN→REFACTOR per layer."
├─ For EACH story in current-sprint.md (with complete implementation-plan.md):
│  ├─ Update /docs/user-stories/<US-REF>/<US-REF>-HANDOFF.md: Initialize TDD tracking
│  ├─ Update /docs/user-stories/<US-REF>/tdd-execution.md: Start execution log
│  ├─ For each LAYER (L1→L2→L3→L4):
│  │  ├─ RED Phase: Write failing tests (update HANDOFF.md with test details)
│  │  ├─ GREEN Phase: Implement minimal code to pass tests (update HANDOFF.md with implementation notes)
│  │  ├─ REFACTOR Phase: Improve code quality while tests stay green (update HANDOFF.md with refactoring summary)
│  │  ├─ Update /docs/user-stories/<US-REF>/tdd-execution.md: Log cycle completion, metrics
│  │  └─ Verify BDD assertions progress per layer
│  ├─ After all layers: Run full BDD test suite
│  ├─ Target: All BDD scenarios passing for story
│  └─ Commit per-layer implementations to Git
├─ Daily tracking:
│  ├─ Update /docs/user-stories/current-sprint.md "Daily Progress Tracking"
│  ├─ Note stories in progress, blockers, burndown progress
│  ├─ Update /docs/user-stories/project-status.md "Active Blockers" section
│  └─ Flag any blockers >4 hours to PM for escalation
└─ After all sprint stories implemented: Hand off to Dev-Lead for status synchronization
        ↓
PHASE 5: DEV-LEAD SYNCHRONIZES STATUS TO "IMPLEMENTED" (Sprint Mid-Point/End)
├─ For EACH story with completed TDD implementation:
│  ├─ Verify all BDD tests passing
│  ├─ Update /docs/user-stories/user-stories.md: Mark "Implemented"
│  ├─ Update GitHub Issue: Change status "In Progress" → "Implemented"
│  ├─ Add issue comment with:
│  │  ├─ Link to commits
│  │  ├─ Files created/modified
│  │  ├─ Test results (coverage, BDD pass rate)
│  │  └─ Ready for BA validation
│  └─ Commit /docs/user-stories/user-stories.md to Git
├─ Update /docs/user-stories/current-sprint.md status column
└─ Hand off to BA: "Stories implemented. BDD tests passing. Ready for acceptance testing."
        ↓
PHASE 6: BA VALIDATES FEATURES (Sprint Mid-Point/End)
├─ 🎯 ANNOUNCE: "Ready to validate implemented stories. Running E2E tests via Playwright."
├─ For EACH story marked "Implemented":
│  ├─ Read /docs/user-stories/<US-REF>/<US-REF>.md (acceptance_criteria, bdd_scenarios sections)
│  ├─ Execute E2E tests (Playwright or manual per E2E strategy)
│  ├─ Validate against all BDD scenarios
│  ├─ Test form validation, error handling, responsive design
│  ├─ Verify design system compliance
│  ├─ Check accessibility (WCAG target level)
│  ├─ IF TESTS PASS:
│  │  ├─ Update /docs/user-stories/user-stories.md: Mark "Delivered"
│  │  ├─ Update GitHub Issue: status → "Delivered", add ✅ label
│  │  ├─ Add validation report to issue
│  │  └─ Mark complete in current-sprint.md
│  └─ IF TESTS FAIL:
│     ├─ Document bugs in GitHub Issue comments
│     ├─ Keep status "Implemented", add ⚠️ "Bug" label
│     ├─ Hand back to Dev-Lead: "Validation failed. Bugs documented in issue #[N]."
│     └─ Dev-Lead fixes bugs and re-submits for validation
├─ Update /docs/user-stories/current-sprint.md "Daily Progress Tracking"
├─ Update /docs/user-stories/project-status.md metrics
└─ Hand off to PM: "Validation complete. Sprint ready for closure."
        ↓
PHASE 7: SPRINT CLOSURE & ARCHIVE (End of Sprint)
├─ 🎯 ANNOUNCE: "Ready to close Sprint [N]. All stories delivered. Archiving sprint."
├─ Verify completion:
│  ├─ All /docs/user-stories/user-stories.md stories in sprint marked "Delivered"
│  ├─ All GitHub Issues closed
│  ├─ All commits pushed to main/develop branch
│  └─ Sprint burndown complete
├─ Calculate sprint metrics:
│  ├─ Velocity (story points completed)
│  ├─ Completion rate (% of planned stories delivered)
│  ├─ Cycle time (avg days per story)
│  ├─ Code coverage, quality metrics
│  └─ Team health indicators
├─ Archive sprint:
│  ├─ Rename /docs/user-stories/current-sprint.md → /docs/user-stories/sprint-[N].md
│  ├─ Add retrospective notes (lessons learned, improvements for next sprint)
│  ├─ Commit archived sprint to Git
│  └─ Store in project records for historical analysis
├─ Create next sprint planning:
│  ├─ Create new /docs/user-stories/current-sprint.md (use sprint-planning template)
│  ├─ Adjust velocity estimates based on completed sprint
│  ├─ Identify remaining "Not Started" stories for next sprint
│  └─ Commit new sprint file
├─ Update /docs/user-stories/project-status.md:
│  ├─ Add completed sprint metrics to "Project Timeline & Milestones"
│  ├─ Update epic progress (auto-calculated from user-stories.md)
│  ├─ Adjust risk register for upcoming sprint
│  ├─ Update team velocity and capacity metrics
│  └─ Reflect capability changes and lessons learned
├─ Retrospective notes:
│  ├─ What went well? Keep doing it.
│  ├─ What didn't go well? How to improve?
│  ├─ Velocity trends: Increasing, stable, or declining?
│  └─ Document in archived sprint-[N].md
└─ Hand off to PM: "Sprint [N] closed. Sprint [N+1] ready for planning."
        ↓
REPEAT Phases 1-7: Continue sprint cycles until all epics completed
        ↓
PROJECT COMPLETION:
├─ All epics marked "Delivered" (all stories in each epic completed)
├─ Final project-status.md updated with 100% completion
├─ All sprints archived with metrics
├─ Retrospective analysis of project velocity and quality
└─ Project handed off for deployment/release planning
```

---

## Key Concepts

| Concept | Definition |
|---------|-----------|
| **Sprint** | Time-boxed iteration (typically 1-3 weeks) with selected user-stories from not-started queue |
| **current-sprint.md** | Active sprint planning document; archived as sprint-[N].md after closure |
| **project-status.md** | Live dashboard tracking epic progress, metrics, blockers, team assignments |
| **<US-REF>.md** | User story file with story definition + enrichment sections (AC, BDD scenarios, UX inputs, API contracts) |
| **Epic** | Organizational grouping of related user-stories (e.g., "User Authentication") |
| **User-Story** | Granular unit of work implementing specific user value (e.g., "US-001: User can login with email") |
| **Implementation-Plan** | Layer-by-layer technical decomposition created by Dev-Lead, guides TDD-Orchestrator |
| **BDD Scenario** | Gherkin test case (Given-When-Then) that defines story acceptance criteria |
| **TDD Cycle** | RED (write failing test) → GREEN (implement to pass) → REFACTOR (improve while passing) |
| **Layer** | Architectural level: Database (L1) → Backend (L2) → Config (L3) → Frontend (L4) |
| **DOR (Definition of Ready)** | Story ready for dev entry: AC clear, BDD scenarios defined, UX inputs present, no blockers |
| **DOD (Definition of Done)** | Story complete: BDD passing, >80% coverage, code review approved, BA validation passed |
| **Status Flow** | Not Started → In Progress → Implemented → Delivered (→ Epic closure when all stories done) |

---0: PM INITIALIZES GITHUB INTEGRATION

**Goal**: Create GitHub issues for all user stories and establish synchronization between local tracking and remote issue tracker

**Activities**:
1. **Verify GitHub Repository Access**:
   - Confirm repository exists and agent has write access
   - Verify permissions to create issues, labels, and milestones
   - Validate repository structure matches project requirements

2. **Create Tracking Document**:
   - Create `/docs/user-stories/usor "In Progress" user-story that needs implementation
   - Verify GitHub issue number exists for this story

2. **Validate Prerequisites Exist**:
   - ✅ GitHub Issue exists and is accessible
   - ✅ `/docs/user-stories/<USER-STORY-REF>/implementation-plan.md` exists and is complete
   - ✅ `features/<domain>/<story-ref>.feature` file exists with BDD scenarios
   - ✅ `features/<domain>/<story-ref>.steps.ts` exists with failing test definitions
   - ✅ BDD tests have been run and documented as failing

3. **If Prerequisites Missing**:


**Goal**: Create GitHub issues for all user stories and establish synchronization between local tracking and remote issue tracker

**Activities**:
1. **Verify GitHub Repository Access**:
   - Confirm repository exists and agent has write access
   - Verify permissions to create issues, labels, and milestones
   - Validate repository structure matches project requirements

2. **Create Tracking Document**:
   - Create `/docs/user-stories/usor "In Progress" user-story that needs implementation
   - Verify GitHub issue number exists for this story

2. **Validate Prerequisites Exist**:
   - ✅ GitHub Issue exists and is accessible
   - ✅ `/docs/user-stories/<USER-STORY-REF>/implementation-plan.md` exists and is complete
   - ✅ `features/<domain>/<story-ref>.feature` file exists with BDD scenarios
   - ✅ `features/<domain>/<story-ref>.steps.ts` exists with failing test definitions
   - ✅ BDD tests have been run and documented as failing

3. **If Prerequisites Missing**:
   - 🛑 **PAUSE workflow**
   - Present blocker to user: "User-story <USER-STORY-REF> (GitHub Issue #<ISSUE-NUM>) is missing required artifacts"
   - Request Lead Dev complete Phase 2: "Create implementation-plan.md and BDD tests for story <USER-STORY-REF>"
   - Update GitHub Issue: Add comment "⚠️ Blocked: Missing implementation-plan.md and BDD tests"

4. **If Prerequisites Complete**:
   - Proceed to Phase 3: Launch TDD-Orchestrator with implementation-plan.md
   - Verify GitHub Issue status is "In Progress"

**Input**: `/docs/user-stories/user-stories.md` with GitHub issue numbers, status from `/docs/user-stories/<USER-STORY-REF>/`, GitHub Issue API  
**Output**: Validation report, blocker detection with GitHub issue link, handoff to Phase 2 (if needed) or Phase 3 (if ready)  
**Outcome**: Ensure TDD execution starts with complete technical specification and GitHub tracking

5. **Setup PM Dashboard**:
   - PM uses `/docs/user-stories/user-stories.md` as primary tracking view
   - Track counts: Total stories, Not Started, In Progress, Implemented, Delivered
   - Monitor velocity: Stories completed per sprint
   - Identify blockers: Stories stuck in same status >2 days

6. **Commit and Handoff**:
   - Commit `/docs/user-stories/user-stories.md` and GitHub Issue number (e.g., #123)
   - Review `/docs/prd/user-stories.md` for story details and BDD scenarios
   - Review GitHub Issue for acceptance criteria and any stakeholder comments

2. **Update GitHub Issue Status**:
   - Change GitHub Issue status from "Not Started" to "In Progress"
   - Add comment: "🚀 Starting implementation planning. Creating layer decomposition and BDD tests."
   - Update `/docs/user-stories/user-stories.md`: Mark status "In Progress" (synchronized with GitHub)
**PM Continuous Monitoring**:
- **Daily**: Check `/docs/user-stories/user-stories.md` for status changes
- **Weekly**: Report to stakeholders: Stories delivered, stories in progress, projected completion
- **Per Sprint**: Calculate velocity, adjust sprint planning based on team capacity

---

### PHASE 

## Workflow Phases

### PHASE 1: ORCHESTRATOR VALIDATES PREREQUISITES

**Goal**: Verify that all user-stories have implementation-plans and failing BDD tests before launching development

**Activities**:
1. **Check Implementation Status**:
   - Read `/docs/user-stories/user-stories.md`
   - Identify first "Not Started" user-story that needs implementation

2. **Validate Prerequisites Exist**:
   - ✅ `/docs/user-stories/<USER-STORY-REF>/implementation-plan.md` exists and is complete
   - ✅ `features/<domain>/<story-ref>.feature` file exists with BDD scenarios
   - ✅ `features/<domain>/<story-ref>.steps.ts` exists with failing test definitions
   - ✅ BDD tests have been run and documented as failing

3. **If Prerequisites Missing**:
   - 🛑 **PAUSE workflow**
   - Present blocker to user: "User-story <USER-STORY-REF> is missing required artifacts"
   - Request Lead Dev complete Phase 2: "Create implementation-plan.md and BDD tests for story <USER-STORY-REF>"

4. **If Prerequisites Complete**:
   - Proceed to Phase 3: Launch TDD-Orchestrator with implementation-plan.md

**Input**: `/docs/user-stories/user-stories.md`, status from `/docs/user-stories/<USER-STORY-REF>/`  
**Output**: Validation report, blocker detection, handoff to Phase 2 (if needed) or Phase 3 (if ready)  
**Outcome**: Ensure TDD execution starts with complete technical specification

---

### PHASE 2: LEAD DEV PREPARATION & DECOMPOSITION

**Goal**: Prepare user-story by decomposing into 4 layers with detailed implementation-plan and failing BDD tests

**Prerequisites**: Phase 1 identified this user-story as needing preparation
GitHub Issue & Hand Off**:
   - Add comment to GitHub Issue:
     - "✅ Implementation plan complete: `/docs/user-stories/<USER-STORY-REF>/implementation-plan.md`"
     - "✅ BDD tests created and failing (expected): `features/<domain>/<story-ref>.feature`"
     - Link to commit with implementation-plan.md and BDD tests
   - Commit all artifacts to repository (implementation-plan.md, feature files, step definitions)
   - Verify `/docs/user-stories/user-stories.md` status is "In Progress" (already set in step 2)
   - Hand off to Orchestrator with:
     - GitHub Issue number and link
     - Implementation-plan.md path (complete and detailed)
     - BDD feature file path
     - BDD test execution results (failing)
     - Message: "User-story <USER-STORY-REF> (Issue #<ISSUE-NUM>) ready for TDD execution. implementation-plan.md complete, BDD tests failing."

**Input**: User-story reference and GitHub Issue number from Orchestrator, `/docs/prd/user-stories.md` (PRD reference), `/docs/prd/architecture-design.md`, `/docs/prd/tech-spec.md`, `/docs/design/design-systems.md`  
**Output**: implementation-plan.md (complete and committed), BDD feature files with failing tests (committed), GitHub Issue updated with progress, `/docs/user-stories/user-stories.md` status "In Progress"  
**Outcome**: Clear, detailed technical roadmap (implementation-plan.md), failing BDD tests, GitHub Issue tracking active,
3. **Decompose into Implementation Plan**:
   - Create `/docs/user-stories/<USER-STORY-REF>/implementation-plan.md` with:
     - **Layer 1 (Database)**:
       - Tables/columns to create
       - Indexes for performance
       - Migration scripts (Liquibase/SQL)
       - ORM models and validations
       - BDD assertions this layer enables
       - Files to create: List specific migration, model, DAO files
     - **Layer 2 (Backend)**:
       - API endpoints (method, path, request/response schemas)
       - Service classes and business logic
       - Repository/data access layer
       - Validation rules and error handling
       - BDD assertions this layer enables
       - TDD approach: Controller tests (mocking service) → Service tests (mocking repo) → Repo tests
       - Files to create: List specific controller, service, DTO files
     - **Layer 3 (Configuration)**:
       - Route registration
       - Dependency injection setup
       - Feature flags
       - Environment variables
       - Middleware configuration
       - BDD assertions this layer enables
       - Files to create: List specific config files
     - **Layer 4 (Frontend)**:
       - Components to create (hierarchy)
       - State management (reducer, context, etc.)
       - API client integration
       - Styling (design tokens from `/docs/design/design-systems.md`)
       - Responsive design requirements
       - BDD assertions this layer enables
       - TDD approach: Component tests → implement components
       - Files to create: List specific component, style, service files
   - Include architectural constraints from `/docs/prd/architecture-design.md`
   - Include design requirements from `/docs/prd/design-systems.md`
   - Define "Definition of Done": All BDD scenarios pass, test coverage > 80%, code review approved

4. **Extract & Integrate BDD Scenarios**:
   - Extract Gherkin scenarios from `/docs/prd/user-stories.md`
   - Create feature file: `features/<domain>/<story-ref>.feature`
   - Create step definition file: `features/<domain>/<story-ref>.steps.ts`
   - Write step definitions that call actual endpoints/components
   - Run BDD tests → They FAIL (expected - layers not implemented)

5. **Update Status & Hand Off**:
   - Update `/docs/user-stories/user-stories.md`: Mark story "In Progress"
   - Hand off to Orchestrator with:
     - GitHub Issue link
     - Implementation-plan.md path (complete and detailed)
     - BDD feature file path
     - BDD test execution results (failing)
     - Message: "User-story ready for TDD execution. implementation-plan.md complete, BDD tests failing."

**Input**: User-story reference from Orchestrator blocker, `/docs/prd/user-stories.md` (PRD reference), `/docs/prd/architecture-design.md`, `/docs/prd/tech-spec.md`, `/docs/design/design-systems.md`  
**Output**: GitHub Issue, implementation-plan.md (complete), BDD feature files with failing tests, `/docs/user-stories/user-stories.md` updated to "In Progress"  
**Outcome**: Clear, detailed technical roadmap (implementation-plan.md) and failing BDD tests ready for TDD execution

---
   - Validation: GitHub Issue is "In Progress" status
   - Retrieve GitHub Issue number for tracking

2. **Present TDD Execution Options**:
   - Option 1: Fast-track (minimal refactoring, focus on passing tests)
   - Option 2: Balanced (pass tests + basic refactoring per layer)
   - Option 3: Quality-first (pass tests + comprehensive refactoring + documentation)
   - User selects approach

3. **Update GitHub Issue**:
   - Add comment: "⚙️ Starting TDD execution. Approach: <selected-approach>. Will implement 4 layers: DB → Backend → Config → Frontend."

4. **Launch TDD-Orchestrator**:
   - Hand off to TDD-Orchestrator with:
     - GitHub Issue number
     - Implementation-plan.md path
     - Failing BDD test suite details
     - Selected TDD execution approach
     - Message: "Implement per implementation-plan.md. Apply <approach> TDD (RED→GREEN→REFACTOR) per layer. Update GitHub Issue #<ISSUE-NUM> after each layer."

**Input**: Handoff from Lead Dev with complete implementation-plan.md, failing BDD tests, GitHub Issue number  
**Output**: TDD-Orchestrator engagement decision, selected execution approach, GitHub Issue updated  
**Outcome**: Clear handoff to TDD execution with technical specification locked and GitHub tracking active
3. **Launch TDD-Orchestrator**:
   - Hand off to TDD-Orchestrator with:
     - Implementation-plan.md path
     - Failing BDD test suite details
     - Selected TDD execution approach
     - Message: "Implement per implementation-plan.md. Apply selected TDD approach (RED→GREEN→REFACTOR) per layer."

**Input**: Handoff from Lead Dev with complete implementation-plan.md and failing BDD tests  
**Output**: TDD-Orchestrator engagement decision, selected execution approach  
**Outcome**: Clear handoff to TDD execution with technical specification locked

---

PHASE 4: TDD-ORCHESTRATOR EXECUTION (DRIVEN BY IMPLEMENTATION PLAN)

**Goal**: Implement all 4 layers using disciplined TDD cycles, guided by implementation-plan and driven by failing BDD tests. **Implementation IS simply applying TDD to the implementation-plan specification.**

**🔴 CRITICAL VALIDATION BEFORE STARTING**:
- Verify <USER-STORY-REF> matches EXACTLY in:
  - implementation-plan.md file path: `/docs/user-stories/<EXACT-US-REF>/implementation-plan.md`
  - implementation-plan.md header section
  - /docs/user-stories/user-stories.md
  - /docs/prd/user-stories.md (source of truth)
  - GitHub Issue title (should include [US-XXX])
- If ANY divergence found: STOP immediately and escalate to PM/Lead Dev to correct before proceeding
- Do NOT proceed with implementation if numbering is inconsistent

**Flow**:
```
TDD-Orchestrator reads: /docs/user-stories/<USER-STORY-REF>/implementation-plan.md

FOR each layer (Layer 1 → Layer 2 → Layer 3 → Layer 4):
  READ: implementation-plan.md section for this layer
    └─ Note: Files to create, TDD approach, architectural constraints, BDD assertions for this layer
  
  RED PHASE: Write failing test code
    └─ Use TDD-RED Agent to write test code per implementation-plan.md
    └─ Tests verify file creation, structure, and BDD assertion support
    └─ Tests should FAIL (implementation doesn't exist yet)
  
  GREEN PHASE: Implement minimum code to pass tests
    └─ Use TDD-GREEN Agent to write production code per implementation-plan.md
    └─ Follow file list and structure in implementation-plan.md exactly
    └─ Implement just enough to make RED tests pass
    └─ Verify: BDD assertions for this layer now pass
  
  REFACTOR PHASE: Improve code quality while keeping tests passing
    └─ Use TDD-REFACTOR Agent to clean code per implementation-plan.md constraints
    └─ Apply SOLID principles, remove duplication, clarify structure
    └─ Verify: All tests still pass, code quality improved

  COMMIT: Layer complete, tests passing, code reviewed

AFTER ALL LAYERS:
  RUN: Full BDD test suite for entire story → ALL passing
  UPDATE: /docs/user-stories/user-stories.md → Mark "Implemented"
  HAND OFF: Return to Orchestrator "Story complete. All BDD tests passing. Ready for next story."
```

**Layer-Specific TDD Details**:

**Layer 1: Database**
- No TDD cycle (no unit tests needed)
- TDD-GREEN directly writes Liquibase/SQL migration scripts
- Verify: Migration runs, schema created, models can interact with DB
- BDD assertions enabled: Data persistence, schema validation
- No unit tests to refactor

**Layer 2: Backend**
- **TDD-RED**: Write controller tests (mock service calls), then service tests (mock repository calls)
- **TDD-GREEN**: Implement controllers → services → repositories to make tests pass
- **TDD-REFACTOR**: Improve separation of concerns, reduce duplication
- BDD assertions enabled: API endpoints, business logic, data validation

**Output During Execution**:
- **After Each Layer**: Add comment to GitHub Issue:
  - "✅ Layer N complete: <layer-name>. Tests passing. BDD assertions enabled: <list>."
  - Commit code with message referencing issue (e.g., "feat(US-001): Implement database layer #123")
- **After Layer 4**: All implementation code committed to repository

**Input**: Implementation-plan.md (complete specification), failing BDD tests, selected TDD approach, GitHub Issue number, architecture-design.md, test-strategies.md  
**Output**: Implemented and tested code for all 4 layers (following implementation-plan.md), all BDD tests passing, unit/integration tests per layer (>80% coverage), commits linked to GitHub Issue  
**Outcome**: User-story fully implemented per specification, BDD scenarios passing, ready for Dev-Lead status synchronization
GitHub Repository Access**: Project MUST be on GitHub with write access. No GitHub = workflow cannot proceed.
2. **Implementation-Plan Quality**: The more detailed the plan (layer breakdown, files to create, BDD assertions per layer), the faster TDD-Orchestrator executes
3. **Failing BDD Tests as Entry Point**: BDD tests are not validation at the end—they are the specification that drives implementation
4. **One Story at a Time**: Complete all phases (Prep → TDD → Sync → Validation) for one story before moving to next
5. **Synchronization Discipline**: Lead Dev MUST update both `/docs/user-stories/user-stories.md` AND GitHub Issue after each phase (In Progress → Implemented)
6. **BA Validation Gate**: No story moves to "Delivered" without BA validation. Bugs block progression.
7. **Status Tracking**: `/docs/user-stories/user-stories.md` is local source of truth, synchronized with GitHub Issues (remote source of truth)
8. **PM Monitoring**: PM continuously checks progress counts (Not Started, In Progress, Implemented, Delivered) to track team velocity
9. **Epic Tracking**: Stories are tagged with parent epic in GitHub; when all stories of an epic are "Delivered", epic is automatically "Delivered"
10. **Clear Layer Boundaries**: Each layer has specific scope (DB doesn't test code, Backend doesn't test UI), makes TDD cycles clean and fast

**Prereq0 → Phase 1 (PM → Orchestrator)**:
- [ ] GitHub repository access verified (write permissions)
- [ ] `/docs/user-stories/user-stories.md` created with all user-stories
- [ ] GitHub Issues created for ALL user-stories
- [ ] Epic labels created and applied to issues
- [ ] All stories initialized with status "Not Started"
- [ ] All stories have GitHub issue numbers stored in user-stories.md
- [ ] PM dashboard setup complete (tracking counts: Not Started, In Progress, Implemented, Delivered)
- [ ] Message: "GitHub issues created for X user-stories across Y epics. Ready to begin implementation."

**Phase 1 → Phase 2 (Orchestrator → Lead Dev)**:
- [ ] Orchestrator identified user-story <USER-STORY-REF> as "Not Started"
- [ ] GitHub Issue number retrieved (e.g., #123)
- [ ] User-story details available in `/docs/prd/user-stories.md`
- [ ] Message: "User-story <USER-STORY-REF> (Issue #<ISSUE-NUM>) requires implementation-plan.md and BDD tests. Please prepare."

**Phase 2 → Phase 3 (Lead Dev → Orchestrator)**:
- [ ] User-story decomposed into 4 clear layers
- [ ] Implementation-plan.md created with all 4 layers detailed and committed
- [ ] BDD feature file created with Gherkin scenarios and committed
- [ ] Step definitions created with failing test code and committed
- [ ] BDD tests run and confirmed failing
- [ ] GitHub Issue updated: Status changed to "In Progress"
- [ ] GitHub Issue updated: Comment added with implementation-plan.md link and BDD test results
- [ ] `/docs/user-stories/user-stories.md` updated to "In Progress" (synchronized with GitHub)
- [ ] Message: "User-story <USER-STORY-REF> (Issue #<ISSUE-NUM>) ready for TDD execution. implementation-plan.md complete, BDD tests failing."

**Phase 3 → Phase 4 (Orchestrator → TDD-Orchestrator)**:
- [ ] Orchestrator validated implementation-plan.md is complete
- [ ] Orchestrator confirmed failing BDD tests exist
- [ ] User selected TDD execution approach
- [ ] GitHub Issue updated: Comment added "Starting TDD execution with <approach>"
- [ ] GitHub Issue number passed to TDD-Orchestrator
- [ ] Message: "Implement per implementation-plan.md using <approach> TDD (RED→GREEN→REFACTOR) per layer. Update Issue #<ISSUE-NUM> after each layer."

**Phase 4 → Phase 5 (TDD-Orchestrator → Lead Dev)**:
- [ ] All 4 layers implemented following implementation-plan.md
- [ ] All BDD scenarios passing
- [ ] Unit/integration tests written per layer (>80% coverage)
- [ ] Code follows coding.instructions.md
- [ ] All implementation code committed with issue references (e.g., "#123" in commits)
- [ ] GitHub Issue updated: Comments added after each layer completion
- [ ] Message: "User-story <USER-STORY-REF> (Issue #<ISSUE-NUM>) implementation complete. All BDD tests passing. Ready for status sync."
0** | PM | `/docs/prd/user-stories.md`, GitHub credentials | GitHub Issues for all stories, `/docs/user-stories/user-stories.md` with issue numbers | 1-2 hours (one-time setup) |
| **PHASE 1** | Orchestrator | `/docs/user-stories/user-stories.md` with GitHub issue numbers | Validation report, blocker detection, handoff to Phase 2 or Phase 3 | 15-30 min |
| **PHASE 2** | Lead Dev | User-story reference, GitHub Issue #, PRD docs, architectural specs | implementation-plan.md, BDD tests, GitHub Issue updated to "In Progress" | 1-2 hours per story |
| **PHASE 3** | Orchestrator | Handoff from Lead Dev with complete plan, GitHub Issue # | TDD execution launch, selected approach, GitHub Issue updated | 15-30 min |
| **PHASE 4** | TDD-Orchestrator | implementation-plan.md, failing BDD tests, approach, GitHub Issue # | Implemented code, passing BDD tests, >80% coverage, commits linked to issue | 2-5 days per story |
| **PHASE 5** | Lead Dev | Handoff from TDD with BDD results, GitHub Issue # | `/docs/user-stories/user-stories.md` and GitHub Issue both "Implemented", handoff to BA | 15-30 min |
| **PHASE 6** | BA | User-story reference, GitHub Issue #, BDD feature files, running app | Validation report, `/docs/user-stories/user-stories.md` and GitHub Issue both "Delivered" (or bugs documented) | 1-3 hours per story |

**Iteration**: Repeat Phases 1-6 for each user-story in sprint until all selected stories are "Delivered"

**Epic Completion**: Automatic when ALL user-stories in an epic are marked "Delivered" (validated by BA)

**PM Continuous Monitoring**: PM checks `/docs/user-stories/user-stories.md` daily for progress (counts of Not Started, In Progress, Implemented, Delivered)

**Key Constraints**: 
- Phase 0 MUST complete first - no GitHub Issues = workflow cannot proceed
- Phase 4 (TDD execution) CANNOT begin until Phase 2 (implementation-plan.md creation) is complete
- Phase 6 (next story) CANNOT begin until current story is "Delivered" by BA validation
- Bugs found in Phase 6 block progression until fixed and re-validated

**Synchronization Points**:
- **Local**: `/docs/user-stories/user-stories.md` (committed to repository)
- **Remote**: GitHub Issues (status: Open → In Progress → Implemented → Delivered → Closed)
- **Lead Dev Responsibility**: Keep both synchronized after each phase
**Phase 6 → Phase 1 (BA → Orchestrator)**:
- **If Validation PASSES**:
  - [ ] BDD tests passing in browser (E2E validation complete)
  - [ ] Exploratory testing complete (all workflows validated)
  - [ ] Design system compliance verified
  - [ ] All acceptance criteria met
  - [ ] Validation report documented in GitHub Issue
  - [ ] Screenshots attached to GitHub Issue
  - [ ] `/docs/user-stories/user-stories.md` updated to "Delivered" and committed
  - [ ] GitHub Issue updated: Status changed to "Delivered"
  - [ ] Synchronization verified: local status == GitHub Issue status
  - [ ] Message: "User-story <USER-STORY-REF> (Issue #<ISSUE-NUM>) delivered. Validation complete. Ready for next story."
- **If Validation FAILS**:
  - [ ] Bugs documented in GitHub Issue with details (description, repro steps, severity)
  - [ ] Screenshots/logs attached to GitHub Issue
  - [ ] "Bug" label added to GitHub Issue
  - [ ] Status remains "Implemented" (NOT "Delivered")
  - [ ] Message: "User-story <USER-STORY-REF> (Issue #<ISSUE-NUM>) validation failed. Bugs documented. Please fix and notify for re-validation."
  - [ ] **Workflow pauses** - do NOT proceed to next story until bugs fixed
     - BDD feature file path for validation
     - List of implemented features/endpoints
     - Message: "User-story <USER-STORY-REF> (Issue #<ISSUE-NUM>) implemented. All BDD tests passing. Ready for validation testing."

**Input**: Handoff from TDD-Orchestrator with BDD test results and commits, `/docs/user-stories/user-stories.md`, GitHub Issue number  
**Output**: `/docs/user-stories/user-stories.md` updated to "Implemented" (committed), GitHub Issue updated with completion details and "Implemented" status, handoff to BA  
**Outcome**: Complete synchronization between local tracking and GitHub, clear handoff to BA for validation

**Lead Dev Responsibilities Summary**:
- **After each iteration** (Phase 4 completion): Update status to "Implemented"
- **After each user-story** implemented: Synchronize local and GitHub tracking
- **Continuous**: Monitor GitHub Issues for comments, blockers, or status changes from BA

---

### PHASE 6: BA VALIDATES FEATURE (DELIVERED)

**Goal**: Execute comprehensive validation testing using Playwright E2E tests to confirm feature meets acceptance criteria, then mark as "Delivered"

**Prerequisites**: Phase 5 complete with user-story status "Implemented" and all BDD tests passing

**Activities**:
1. **Receive Handoff from Lead Dev**:
   - User-story reference (e.g., US-001)
   - GitHub Issue number and link
   - BDD feature file path: `features/<domain>/<story-ref>.feature`
   - List of implemented features/endpoints
   - Review GitHub Issue acceptance criteria

2. **Setup Validation Environment**:
   - Ensure application is running (local dev server or staging environment)
   - Install Playwright browsers if needed: `mcp_microsoft_pla_browser_install`
   - Review BDD scenarios to understand expected behavior

3. **Execute BDD Tests in Browser (E2E Validation)**:
   - Run BDD tests via Playwright: Execute Gherkin scenarios with browser automation
   - Capture: Screenshots on failure, console logs, network requests
   - Validate: All Given-When-Then steps execute correctly in real browser

4. **Perform Exploratory Testing**:
   - Test user workflows end-to-end (beyond BDD scenarios)
   - Verify edge cases: Empty states, validation errors, boundary conditions
   - Test error handling: Invalid inputs, network failures, timeouts
   - Cross-browser testing (if required): Chrome, Firefox, Safari
   - Mobile responsiveness (if required)

5. **Validate Design System Compliance**:
   - Review `/docs/design/design-systems.md` for design tokens and components
   - Verify: Colors, typography, spacing, component styling match design system
   - Take screenshots for visual regression (optional)

6. **Validate Against Acceptance Criteria**:
   - Cross-reference GitHub Issue acceptance criteria with implemented feature
   - Ensure all criteria are met (checked off in issue comments)

7. **Document Test Results**:
   - Create validation report:
     - BDD test results: X/X scenarios passing
     - Exploratory test findings: Pass/Fail per workflow
     - Design system compliance: Pass/Fail
     - Acceptance criteria checklist: All ✅
     - Screenshots: Key workflows (attach to GitHub Issue)
     - Browser/device coverage: Tested on X browsers

8. **If Validation FAILS**:
   - Document bugs in GitHub Issue:
     - Comment: "❌ Validation failed. Bugs found:"
     - List bugs with: Description, Steps to reproduce, Expected vs Actual, Severity
     - Attach: Screenshots, console logs, network traces
   - Add "Bug" label to GitHub Issue
   - Keep status "Implemented" (not "Delivered")
   - Hand back to Lead Dev: "User-story <USER-STORY-REF> (Issue #<ISSUE-NUM>) validation failed. Bugs documented in issue. Please address and notify when ready for re-validation."
   - **Do NOT proceed to next user-story until bugs are fixed**

9. **If Validation PASSES**:
   - Update `/docs/user-stories/user-stories.md`: Change status from "Implemented" to "Delivered"
   - Commit user-stories.md with message: "chore: Mark US-<REF> as Delivered after BA validation #<ISSUE-NUM>"
   - Update GitHub Issue:
     - Change status to "Delivered" (or add "Delivered" label)
     - Add comment: "✅ Validation complete. All tests passing."
     - Attach validation report (test results, screenshots, coverage)
     - Close issue or move to "Done" column (per project workflow)
   - Hand off to Orchestrator: "User-story <USER-STORY-REF> (Issue #<ISSUE-NUM>) delivered. Validation complete. Ready for next story."

**Input**: Handoff from Lead Dev with user-story reference and GitHub Issue link, BDD feature files, running application  
**Output**: Validation report, `/docs/user-stories/user-stories.md` updated to "Delivered" (or bugs documented), GitHub Issue updated to "Delivered" (or "Bug" label added)  
**Outcome**: Feature validated and delivered (or bugs returned to Dev for fixing), clear gate before moving to next user-story

**BA Validation Checklist**:
- [ ] BDD tests passing in browser (E2E validation)
- [ ] Exploratory testing complete for all workflows
- [ ] Edge cases and error handling validated
- [ ] Design system compliance verified
- [ ] All acceptance criteria met
- [ ] Screenshots captured and attached to GitHub Issue
- [ ] Validation report documented in GitHub Issue
- [ ] Status synchronized: local (user-stories.md) and remote (GitHub Issue)
- **TDD-REFACTOR**: Simplify configuration, reduce coupling
- BDD assertions enabled: API routing, service wiring

**Layer 4: Frontend**
- **TDD-RED**: Write component integration tests (test component behavior with mocked API)
- **TDD-GREEN**: Create components, wire API calls, apply design system styling
- **TDD-REFACTOR**: Simplify component logic, extract subcomponents
- BDD assertions enabled: UI rendering, user interactions, data display

**Input**: Implementation-plan.md (complete specification), failing BDD tests, selected TDD approach, architecture-design.md, test-strategies.md  
**Output**: Implemented and tested code for all 4 layers (following implementation-plan.md), all BDD tests passing, unit/integration tests per layer (>80% coverage), `/docs/user-stories/user-stories.md` updated to "Implemented"  
**Outcome**: User-story fully implemented per specification, BDD scenarios passing, ready for next story iteration

---

## Critical Success Factors

1. **🔴 NUMBERING CONSISTENCY (MOST CRITICAL)**: All references to user-stories MUST use exact <USER-STORY-REF> from `/docs/prd/user-stories.md`. No abbreviations, typos, or renumbering schemes allowed. Any divergence breaks orchestration workflow.
   - Validate at EVERY phase handoff
   - Source of truth: `/docs/prd/user-stories.md`
   - Check: current-sprint.md, implementation-plan.md paths, GitHub Issue titles, /docs/user-stories/user-stories.md
   - Pause workflow immediately if ANY inconsistency found
2. **Implementation-Plan Quality**: The more detailed the plan (layer breakdown, files to create, BDD assertions per layer), the faster TDD-Orchestrator executes
3. **Failing BDD Tests as Entry Point**: BDD tests are not validation at the end—they are the specification that drives implementation
4. **One Story at a Time**: Complete all 4 layers for one story before moving to next, ensures focused work and clean git history
5. **Clear Layer Boundaries**: Each layer has specific scope (DB doesn't test code, Backend doesn't test UI), makes TDD cycles clean and fast
6. **Status Tracking**: `/docs/user-stories/user-stories.md` is the orchestrator's source of truth for what to do next
7. **Epic Tracking**: Stories are tagged with parent epic; when all stories of an epic are "Implemented", epic is automatically "Implemented"

---

## Handoff Checklist

**Phase 1 → Phase 2 (PM → Lead Dev)**:
- [ ] **🔴 CRITICAL: <USER-STORY-REF> is EXACT match from `/docs/prd/user-stories.md`** (e.g., US-001, not S1, FEAT-01, etc.)
- [ ] Orchestrator identified user-story <USER-STORY-REF> as "Not Started" in `/docs/user-stories/user-stories.md`
- [ ] User-story details available in `/docs/prd/user-stories.md` with EXACT same reference
- [ ] GitHub Issue created with title including exact US-REF (e.g., "[US-001] User can login")
- [ ] Message: "User-story <USER-STORY-REF> (Issue #<ISSUE-NUM>) requires implementation-plan.md and BDD tests. Please prepare."

**Phase 2 → Phase 3 (Lead Dev → Orchestrator)**:
- [ ] **🔴 CRITICAL: Verify <USER-STORY-REF> matches EXACTLY across all artifacts:**
  - [ ] `/docs/prd/user-stories.md` (source of truth)
  - [ ] `/docs/user-stories/user-stories.md` (status tracking)
  - [ ] `/docs/user-stories/<US-REF>/` folder path
  - [ ] `/docs/user-stories/<US-REF>/<US-REF>.md` file name
  - [ ] `/docs/user-stories/<US-REF>/implementation-plan.md` header
  - [ ] GitHub Issue title (should be "[US-XXX]")
  - [ ] current-sprint.md reference list
- [ ] User-story decomposed into 4 clear layers
- [ ] Implementation-plan.md created with all 4 layers detailed and committed
- [ ] **Checkpoint documents created**:
  - [ ] `/docs/user-stories/<US-REF>/<US-REF>-HANDOFF.md` (TDD communication template)
  - [ ] `/docs/user-stories/<US-REF>/tdd-execution.md` (execution tracking template)
- [ ] BDD feature file created with Gherkin scenarios and committed
- [ ] Step definitions created with failing test code and committed
- [ ] BDD tests run and confirmed failing
- [ ] `/docs/user-stories/user-stories.md` updated to "In Progress" (synchronized with GitHub)
- [ ] Message: "User-story <USER-STORY-REF> (Issue #<ISSUE-NUM>) ready for TDD execution. Numbering validated against PRD. Implementation-plan.md complete, BDD tests failing."

**Phase 3 → Phase 4 (Orchestrator → TDD-Orchestrator)**:
- [ ] **🔴 CRITICAL: Validate <USER-STORY-REF> matches EXACTLY in implementation-plan.md path and header**
- [ ] Orchestrator validated implementation-plan.md is complete
- [ ] Orchestrator confirmed failing BDD tests exist
- [ ] User selected TDD execution approach
- [ ] Message: "Implement per implementation-plan.md using <approach> TDD (RED→GREEN→REFACTOR) per layer. Numbering pre-validated."

**Phase 4 → Phase 1 (TDD-Orchestrator → Orchestrator)**:
- [ ] All 4 layers implemented following implementation-plan.md
- [ ] All BDD scenarios passing
- [ ] Unit/integration tests written per layer (except Layer 1)
- [ ] Code follows coding.instructions.md
- [ ] Test coverage > 80%
- [ ] Code reviewed and approved
- [ ] **Checkpoint documents completed**:
  - [ ] `/docs/user-stories/<US-REF>/<US-REF>-HANDOFF.md` updated with final TDD status
  - [ ] `/docs/user-stories/<US-REF>/tdd-execution.md` completed with full execution log
- [ ] `/docs/user-stories/user-stories.md` updated to "Implemented" using exact <USER-STORY-REF>
- [ ] GitHub Issue updated with results
- [ ] Commits reference exact US-REF (e.g., "feat(US-001): Implement database layer #123")
- [ ] Message: "User-story <USER-STORY-REF> complete. All BDD tests passing. TDD execution documented. Ready for next story."

---

## Summary Table

| Phase | Agent | Input | Output | Duration | Checkpoint Documents Updated |
|-------|-------|-------|--------|----------|------------------------------|
| **PHASE 0** | PM | `/docs/prd/user-stories.md`, GitHub credentials | GitHub Issues, `/docs/user-stories/user-stories.md`, `/docs/user-stories/project-status.md` | 1-2 hours | `project-status.md` (initial setup) |
| **PHASE 1** | PM | `/docs/prd/user-stories.md` (source of truth for US-REF), `/docs/user-stories/user-stories.md` | Validation: `current-sprint.md` references MATCH `/docs/prd/user-stories.md` exactly, GitHub Issues created with exact US-REF | 15-30 min | `current-sprint.md` (create), `project-status.md` (sprint planning) |
| **PHASE 2** | BA | User-story (exact US-REF from PRD), current-sprint.md (validated references) | `/docs/user-stories/<EXACT-US-REF>/<US-REF>.md` enriched, numbering validated | 1-2 hours per story | `<US-REF>.md` (enrichment sections) |
| **PHASE 3** | Dev-Lead | User-story (exact US-REF), enriched file, PRD/architecture/design docs | `implementation-plan.md`, `<US-REF>-HANDOFF.md`, `tdd-execution.md` templates, BDD tests, numbering pre-validated | 1-2 hours per story | `implementation-plan.md` (create), `<US-REF>-HANDOFF.md` (create), `tdd-execution.md` (create) |
| **PHASE 4** | TDD-Orchestrator | implementation-plan.md (numbering pre-validated), failing BDD tests, approach | Implemented code, passing BDD tests, >80% coverage, commits reference exact US-REF | 2-5 days per story | `<US-REF>-HANDOFF.md` (TDD cycles), `tdd-execution.md` (execution log), `current-sprint.md` (daily updates) |
| **PHASE 5** | Dev-Lead | Handoff from TDD with BDD results, exact US-REF | `/docs/user-stories/user-stories.md` "Implemented" (exact US-REF), GitHub Issue updated, handoff to BA | 15-30 min | `user-stories.md` (status update) |
| **PHASE 6** | BA | User-story (exact US-REF), GitHub Issue, BDD files | `/docs/user-stories/user-stories.md` "Delivered" (exact US-REF), GitHub Issue closed | 1-3 hours per story | `user-stories.md` (validation result) |

**🔴 CRITICAL VALIDATION GATE**: Before every phase handoff, verify <USER-STORY-REF> matches EXACTLY with `/docs/prd/user-stories.md`. Any divergence blocks progression.

**Document Communication**: All agents communicate work, research, analysis, and reporting through these checkpoint documents. Updates are required within their scope of responsibility.

**Iteration**: Repeat Phases 1-6 for each user-story in sprint until all selected stories are "Delivered"

**Epic Completion**: Automatic when ALL user-stories in an epic are marked "Delivered"

**Key Constraints**: 
- Phase 4 (TDD execution) CANNOT begin until Phase 3 (implementation-plan.md creation) is complete
- **NUMBERING CONSISTENCY IS CRITICAL**: All <USER-STORY-REF> must match exactly with `/docs/prd/user-stories.md`
- **Validation Gate**: Before every phase handoff, verify 1:1 match between current-sprint.md, implementation-plan.md paths, GitHub Issue titles, and `/docs/prd/user-stories.md`
