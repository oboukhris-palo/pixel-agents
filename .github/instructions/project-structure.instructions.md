---
applyTo: "**"
description: Project structure conventions — greenfield/brownfield directory layouts, source organization, and workflow file conventions
priority: high
enforcement: strict
---

# Project Structure Instructions

## Overview

This document provides systematic instructions for project structure organization and directory conventions using the AI-first delivery methodology. These instructions follow established project organization principles and transform structural requirements into consistent directory layouts, file organization patterns, and architectural boundaries that enhance navigation, maintain separation of concerns, and facilitate team collaboration.

## Process Overview

**Project Structure Implementation** transforms organizational requirements into systematic directory structures that deliver consistent project layouts, clear architectural boundaries, enhanced developer navigation, and maintainable file organization through established patterns for source code, tests, documentation, and configuration across all project types and technology stacks.

## Implementation Process

This document defines the standardized project structure for AI-first delivery projects, covering both **greenfield** (new projects) and **brownfield** (legacy replatforming) scenarios.

**Epic-Based Organization**: For projects with **5+ user stories or 2+ development teams**, organize implementation by Epic under `docs/05-implementation/epics/`. For smaller projects (<5 stories, single team), direct user story folders are acceptable, but epic organization is recommended for future scalability.

## Overview

All AI-first delivery projects follow a consistent structure that supports:
- Clear separation of concerns
- Scalable epic-based organization (for multi-team or enterprise projects)
- Scalable architecture
- Infrastructure as Code
- Comprehensive documentation
- CI/CD automation

## Base Project Structure (Greenfield)

Use this structure when starting a **new project from scratch**:

## 📂 Project Structure (Optimized)

```
project-root/
├── .github/
│   ├── agents/                    # AI agent system prompts
│   ├── instructions/              # Global coding & documentation standards
│   ├── workflows/                 # PDLC workflows (assessment, documents, implementation, cicd)
│   ├── prompts/                   # Reusable copy-paste prompts for agents
│   ├── tasks/                     # Daily task prompts (standup, TDD, code review, etc.)
├── templates/                 # Document templates (user-story, implementation-plan, plan-approval, etc.)
└── guides/                    # Deep-dive guides (context-optimization, TDD-enforcement, etc.)
│
├── docs/
│   ├── 00-assessment/             # Phase 0 assessment outputs (prerequisites, AI-readiness report)
│   │
│   ├── 01-requirements/           # ✅ Phase 1-2 PDLC Documentation (FROZEN - read-only during implementation)
│   │   ├── requirements.md        # Business requirements & user needs
│   │   ├── personas.md            # User archetypes
│   │   ├── user-stories.md        # ⭐ Master user stories catalog (SSOT for story definitions)
│   │   └── business-case.md       # Business case & ROI analysis
│   │
│   ├── 02-architecture/           # ✅ Phase 3-4 Architecture & Design (FROZEN)
│   │   ├── architecture-design.md # System architecture & constraints
│   │   ├── tech-spec.md           # Technical specifications (API, database, etc.)
│   │   ├── design-systems.md      # UI/UX components & design tokens
│   │   ├── flow-diagrams.md       # Process & workflow diagrams
│   │   └── journey-maps.md        # User journey visualizations
│   │
│   ├── 03-testing/                # ✅ Phase 5 Testing Strategy (FROZEN)
│   │   └── test-strategies.md     # Testing approach & BDD scenarios
│   │
│   ├── 04-planning/               # ✅ Phase 6 Planning (FROZEN)
│   │   ├── iteration-planning.md  # Sprint & iteration planning
│   │   ├── code-generation.md     # Code generation strategy
│   │   └── deployment-plan.md     # Deployment approach
│   │
│   ├── 99-operations/             # 📋 Agent action logs & operations
│   │   ├── agent-orchestrator-YYYYMMDD.md    # Orchestrator daily action log
│   │   ├── agent-pm-YYYYMMDD.md              # PM daily action log
│   │   ├── agent-po-YYYYMMDD.md              # PO daily action log
│   │   ├── agent-ba-YYYYMMDD.md              # BA daily action log
│   │   ├── agent-architect-YYYYMMDD.md       # Architect daily action log
│   │   ├── agent-ux-YYYYMMDD.md              # UX daily action log
│   │   ├── agent-dev-lead-YYYYMMDD.md        # Dev-Lead daily action log
│   │   └── agent-qa-YYYYMMDD.md              # QA daily action log
│   │
│   ├── 05-implementation/         # ✅ Phase 8 Implementation Tracking (ACTIVE during sprints)
│   │   ├── epics/                 # Epic-based organization (Enterprise or Large Projects)
│   │   │   ├── epic-01/           # Epic 1: [Domain]
│   │   │   │   ├── description.md # Epic overview and scope
│   │   │   │   └── user-stories/  # User stories belonging to this epic
│   │   │   │       ├── us-001/    # ✨ Per-story implementation folder
│   │   │   │       │   ├── description.md              # Story definition: requirements, acceptance criteria, DoD
│   │   │   │       │   ├── implementation-plan.md      # Layer-by-layer guide with checkboxes
│   │   │   │       │   ├── plan-approval.yaml          # Human validation gate (approved before TDD starts)
│   │   │   │       │   └── features/                   # BDD scenarios from BA agent
│   │   │   │       │       ├── user-authentication.feature
│   │   │   │       │       └── profile-management.feature
│   │   │   │       │
│   │   │   │       └── us-002/    # Additional stories in this epic
│   │   │   │
│   │   │   ├── epic-02/           # Epic 2: [Domain]
│   │   │   │   ├── description.md
│   │   │   │   └── user-stories/
│   │   │   │       ├── us-003/
│   │   │   │       └── [... additional stories ...]
│   │   │   │
│   │   │   └── epic-NN/           # Epic N: [Last Epic]
│   │   │       ├── description.md
│   │   │       └── user-stories/
│   │   │
│   │   ├── user-stories.md        # ⭐ MASTER STATUS TRACKING (SSOT) - story progress across all epics
│   │   ├── current-sprint.md      # 📋 ACTIVE sprint planning & daily tracking
│   │   ├── sprint-1.md            # 📦 ARCHIVED Sprint 1 (retrospective)
│   │   ├── sprint-2.md            # 📦 ARCHIVED Sprint 2 (retrospective)
│   │   └── [... archived sprints ...]
│   │
│   ├── project-status.md          # 📊 Project dashboard (epic progress, velocity, blockers)
│   ├── design/                    # UX/UI design documents & design systems
│   ├── assessment/                # Phase 0 assessment outputs (if applicable)
│   └── [other documentation]/     # Architecture, deployment, etc.
│
├── src/                          # Source code generation root (see Source Code Organization below)
│   └── [modules/components]       # Backend/Frontend or Module-based organization
├── README.md                      # Project overview and setup
└── TODO.md                        # Project task breakdown (by domain)
```

## Source Code Organization

The `/src` folder serves as the **code generation root** with two organizational patterns based on project architecture:

### Pattern 1: Backend/Frontend Applications

For projects with distinct backend and frontend components:

```
src/
├── backend/               # Server-side application components  
│   └── src/              # Backend source code
│       ├── controllers/  # API controllers and route handlers
│       ├── services/     # Business logic layer
│       ├── models/       # Data models and DTOs
│       ├── repositories/ # Data access layer
│       ├── middleware/   # Authentication, validation, logging
│       ├── config/       # Configuration and settings
│       └── utils/        # Shared utilities and helpers
│
└── frontend/              # Client-side application components
    └── src/              # Frontend source code  
        ├── components/   # Reusable UI components
        ├── pages/        # Route-based page components
        ├── hooks/        # Custom React hooks (React/Next.js)
        ├── services/     # API clients and business logic
        ├── stores/       # State management (Zustand, Redux)
        ├── utils/        # Frontend utilities and helpers
        ├── types/        # TypeScript type definitions
        └── styles/       # Global styles and CSS modules
```

### Pattern 2: Module-Based Applications  

For projects with multiple functional modules or microservices:

```
src/
├── module1/               # First functional module (e.g., user-management)
│   └── src/              # Module 1 source code
│       ├── controllers/  # Module-specific API controllers
│       ├── services/     # Module business logic
│       ├── models/       # Module data models
│       ├── repositories/ # Module data access
│       ├── tests/        # Module-specific tests
│       └── config/       # Module configuration
│
├── module2/               # Second functional module (e.g., payment-processing)
│   └── src/              # Module 2 source code  
│       ├── controllers/  # Module-specific API controllers
│       ├── services/     # Module business logic
│       ├── models/       # Module data models
│       ├── repositories/ # Module data access
│       ├── tests/        # Module-specific tests
│       └── config/       # Module configuration
│
└── shared/                # Shared components across modules
    └── src/              # Shared source code
        ├── utils/        # Common utilities
        ├── types/        # Shared TypeScript types  
        ├── middleware/   # Shared middleware
        └── config/       # Global configuration
```

### Code Generation Guidelines

The `/src` folder structure follows these principles:

- **Single source root**: All generated code resides under `/src` for consistency
- **Nested `/src` pattern**: Each major component (backend/frontend or module) has its own `/src` subfolder
- **Clear separation**: Backend, frontend, or modules are isolated with their own dependencies and configurations
- **Shared code**: Common utilities and types are placed in appropriate shared locations
- **Test co-location**: Tests are placed within each component's structure for maintainability

---


## Legacy Replatforming Structure (Brownfield)

Use this structure when **replatforming an existing legacy application**:

```
project-root/
├── README.md                      # Project overview and replatforming goals
├── .github/                       # Same as greenfield
│   ├── agents/
│   ├── instructions/
│   ├── workflows/
│   └── ...
│
├── docs/                          # Project documentation (enhanced for brownfield)
│   ├── 01-requirements/           # ✅ Phase 1-2 PDLC Documentation (FROZEN)
│   │   ├── requirements.md
│   │   ├── personas.md
│   │   ├── user-stories.md        # ⭐ Master user stories (SSOT)
│   │   └── business-case.md
│   │
│   ├── 02-architecture/           # ✅ Phase 3-4 Architecture & Design (FROZEN)
│   │   ├── architecture-design.md
│   │   ├── tech-spec.md
│   │   ├── design-systems.md
│   │   └── ...
│   │
│   ├── 03-testing/                # ✅ Phase 5 Testing (FROZEN)
│   │   └── test-strategies.md
│   │
│   ├── 04-planning/               # ✅ Phase 6 Planning (FROZEN)
│   │   ├── iteration-planning.md
│   │   └── deployment-plan.md
│   │
│   ├── 99-operations/             # 📋 Agent action logs
│   │   └── logs/
│   │
│   ├── 05-implementation/         # ✅ Phase 8 Implementation Tracking (ACTIVE, same as greenfield)
│   │   ├── epics/                 # Epic-based organization (Legacy replatforming always uses epic grouping)
│   │   │   ├── epic-01/
│   │   │   │   ├── description.md
│   │   │   │   └── user-stories/
│   │   │   │       └── us-001/ to us-NNN/  # Per-story folders (same structure as greenfield)
│   │   │   └── epic-NN/
│   │   │       ├── description.md
│   │   │       └── user-stories/
│   │   │
│   │   ├── user-stories.md        # ⭐ MASTER STATUS TRACKING (SSOT)
│   │   ├── current-sprint.md      # 📋 Active sprint
│   │   └── sprint-N.md            # 📦 Archived sprints
│   │
│   ├── project-status.md          # 📊 Project dashboard
│   ├── design/                    # UX/UI documents
│   ├── assessment/                # Phase 0 assessment (if applicable)
│   ├── legacy-app/                # 🔴 BROWNFIELD: Legacy app analysis
│   │   ├── architecture.md        # Legacy system architecture
│   │   ├── features.md            # Current features & functionality
│   │   ├── data-structures.md     # Database schemas & relationships
│   │   ├── api.md                 # Current API documentation
│   │   └── critical-features.md   # Prioritized migration list
│   │
│   ├── migration/                 # 🔴 BROWNFIELD: Migration planning
│   │   ├── migration-plan.md      # Detailed migration strategy
│   │   ├── data-migration.md      # Data migration procedures
│   │   └── rollback-procedures.md # Rollback & disaster recovery
│   │
│   ├── development-environment/   # Dev setup instructions
│   ├── deployment/                # Deployment strategy
│   ├── infrastructure/            # Infrastructure architecture
│   ├── monitoring/                # Monitoring & logging strategy
│   ├── security/                  # Security strategy
│   ├── testing/                   # Testing strategy
│   ├── meeting-transcripts/       # Meeting & mob programming notes
│   ├── index.md                   # Main documentation index
│   └── CONTRIBUTE.md              # Contribution guidelines
│
├── LegacyApps/                    # 🔴 BROWNFIELD: Legacy application archive
│   └── [legacy-app-name]/         # Original legacy codebase (reference only)
├── TODO.md                        # Project task breakdown
└── project-modules/               # 🔴 BROWNFIELD: Legacy app analysis by module
    └── [module-name]/             # Per-module documentation (optional)
        ├── module.md              # Module overview
        ├── features.md            # Module features
        └── data-structures.md     # Data structures
```

## Directory Descriptions

### Core Directories (All Projects)

- **`README.md`**: Project overview, goals, setup instructions, and quick start guide
- **`scripts/`**: Automation scripts for project management, setup, and database initialization
- **`src/`**: **Code generation root** - All application source code organized by backend/frontend or modules
- **`docs/`**: Comprehensive project documentation
- **`infra/`**: Infrastructure as Code (Terraform, CloudFormation, etc.)
- **`DevOps/`**: CI/CD pipeline configurations and automation
- **`services/`**: External services configuration and serverless functions (if applicable)

### Brownfield-Specific Directories

- **`LegacyApps/`**: Archive of the original legacy application code and documentation
- **`docs/legacy-app/`**: Analysis of legacy app architecture, features, and data structures
- **`docs/CriticalFeatures.md`**: Prioritized list of critical features requiring immediate migration
- **`docs/migration/`**: Detailed migration plan, data migration strategies, and rollback procedures

## Key Files

### Greenfield Projects

| File | Purpose |
|------|---------|
| `README.md` | Project overview and goals |
| `docs/index.md` | Documentation index |
| `docs/CONTRIBUTE.md` | Contribution guidelines |
| `infra/docs/feature/authentication/index.md` | Authentication infrastructure documentation |
| `TODO.md` | Task breakdown (if needed) |
| `.gitignore` | Version control exclusions |

### Brownfield Projects (Additional)

| File | Purpose |
|------|---------|
| `docs/CriticalFeatures.md` | Prioritized migration features |
| `docs/legacy-app/*.md` | Legacy app analysis |
| `docs/infrastructure.md` | Infrastructure architecture |
| `docs/api.md` | API architecture |
| `docs/backend.md` | backend architecture |
| `docs/testing.md` | Testing strategy |
| `docs/deployment.md` | Deployment strategy |
| `docs/deployment-pipeline.md` | CI/CD pipeline details |
| `docs/monitoring.md` | Monitoring and logging |
| `docs/security.md` | Security strategy |
| `docs/migration.md` | Migration plan |
| `docs/rollback.md` | Rollback procedures |
| `docs/development-environment.md` | Dev environment setup |
| `docs/issue-tracker.md` | Clarifications and questions |
| `TODO.md` | Task breakdown by domain |

## Documentation Standards

### docs/features/
- **One file per feature**
- Include acceptance criteria, user stories, and technical requirements
- Link to related API documentation and design documents

### docs/api/
- **Swagger/OpenAPI format** for API documentation
- Include examples of requests and responses
- Document authentication mechanisms and error codes

### docs/infrastructure/
- Use **PlantUML** for architecture diagrams
- Document cloud provider, services, and networking
- Include disaster recovery and scaling strategies

### docs/testing/
- Define testing scope (unit, integration, E2E)
- Document testing frameworks and tools
- Include test coverage requirements

## TODO.md Format

For all projects, create `TODO.md` with domain-based task breakdown:

```markdown
## Domain
[ ] Task to be done (owner)
```

**Requirements**:
- Tasks must be small enough to complete in a few hours
- Include tasks outside development (DevOps, security, documentation review)
- Add review tasks for all generated files (architecture, API docs, etc.)
- Organize by domain: frontend, backend, Infrastructure, DevOps, Testing, Security, Documentation

---

## Workflow Conventions & Files

This section documents the `.github/` directory structure and workflow-related files used throughout the PDLC.

### `.github/` Directory Structure

```
.github/
├── agents/                            # Agent system prompts
│   ├── orchestrator.agent.md         # Workflow coordinator (PDLC decisions/gates)
│   ├── po.agent.md                   # Product Owner (requirements/tradeoffs)
│   ├── dev-lead.agent.md             # Dev Lead (architecture/plans)
│   ├── dev-tdd.agent.md              # TDD Orchestrator (cycle management)
│   ├── dev-tdd-red.agent.md          # RED phase executor
│   ├── dev-tdd-green.agent.md        # GREEN phase executor
│   └── dev-tdd-refactor.agent.md     # REFACTOR phase executor
│
├── instructions/                      # System-wide instructions
│   ├── project-structure.instructions.md    # THIS FILE: Project structure conventions
│   ├── coding.instructions.md               # Code standards (SOLID, complexity, coverage)
│   ├── documentation.instructions.md        # Code documentation guidelines
│   ├── api-design.instructions.md           # API design and OpenAPI standards
│   ├── run-merchant-locally.instructions.md # Project-specific setup (if brownfield)
│   └── ...                                  # Other project-specific instructions
│
├── workflows/                         # Workflow definitions (reference only, read all before acting)
│   ├── 00-assessment.workflows.yml     # Phase 0: Assessment & Discovery
│   ├── 01-requirements.workflows.yml   # Phases 1-2: Requirements & Personas
│   ├── 02-architecture.workflows.yml   # Phases 3-4: Architecture & Design
│   ├── 03-testing.workflows.yml        # Phase 5: Testing Strategy
│   ├── 04-planning.workflows.yml       # Phases 6-7: Planning & Deployment
│   ├── 05-implementation.workflows.yml # Phase 8: TDD Implementation
│   ├── cicd.workflows.yml            # CI/CD pipeline definitions
│   └── ...                            # Other workflow definitions
│
├── prompts/                           # Copilot-surfaced prompts (via /commands)
│   ├── quick-reference.prompt.md     # Fast lookup: tasks, roles, files
│   ├── start-implementation.prompt.md # Kick off Phase 8 (TDD)
│   ├── plan-us.prompt.md             # Create user story implementation plan
│   └── ...                            # Other copilot prompts
│
├── tasks/                             # Task starters (copy prompt when starting work)
│   ├── start-implementation.prompts.md   # Copy when beginning TDD phase
│   ├── plan-us.prompts.md               # Copy when creating user story plan
│   └── ...                              # Other task starters
│
├── templates/                         # Document templates (copy when creating new files)
│   ├── user-story-tmpl.md         # User story template
│   ├── implementation-plan-tmpl.md # Implementation plan template
│   ├── plan-approval-tmpl.yaml   # Plan approval gate template
│   ├── tdd-execution-tmpl.md      # TDD execution audit log template
│   └── ...                            # Other templates
│
└── guides/                            # Procedural guides
    ├── bdd-scenario-writing.guide.md  # How to write BDD scenarios
    ├── tdd-red-phase.guide.md         # RED phase execution steps
    ├── tdd-green-phase.guide.md       # GREEN phase execution steps
    ├── tdd-refactor-phase.guide.md    # REFACTOR phase execution steps
    └── ...                            # Other procedural guides
```

### Workflow-Related Files in `docs/`

#### Phase 0: Assessment (Outputs Only)
```
docs/00-assessment/
├── inventory-technical.md             # Technical stack audit and environmental baseline
├── prerequisites-request.yml          # Formal infrastructure and access requirements
│
├── archive/                           # Historical assessment outputs (reference only)
│   ├── README.md                      # Archive index and assessment summary
│   ├── ai-readiness-report.md         # AI/LLM capability maturity assessment
│   ├── multi-dimensional-assessment.md # 8+ dimension capability scores & confidence
│   ├── design-guidance.md             # Architecture patterns and design recommendations
│   ├── project-constraints.md         # Known technical and business constraints
│   └── [other-assessment-outputs]/    # Additional assessment artifacts as needed
│
└── inputs/                            # Client-provided reference materials
    ├── [project-brief].md             # Project overview and strategic goals
    ├── [tech-brief].md                # Current technology landscape and architecture
    ├── [compliance-requirements].md   # Regulatory/compliance frameworks (if applicable)
    └── [other-inputs]/                # Additional reference and context materials
```

#### Phases 1-6: PDLC Documentation (Frozen)
```
docs/01-requirements/                  # ✅ FROZEN after Phase 2
├── requirements.md                    # Master requirements
├── personas.md                        # User personas
├── user-stories.md                    # ⭐ Master user stories (SSOT from 01-requirements)
└── business-case.md                   # Business case & ROI

docs/02-architecture/                  # ✅ FROZEN after Phase 4
├── architecture-design.md             # System architecture
├── tech-spec.md                       # Technical specifications
├── design-systems.md                  # UI/UX design system
├── flow-diagrams.md                   # Process diagrams
└── journey-maps.md                    # User journeys

docs/03-testing/                       # ✅ FROZEN after Phase 5
└── test-strategies.md                 # Testing approach & BDD scenarios

docs/04-planning/                      # ✅ FROZEN after Phase 6
├── iteration-planning.md              # Sprint planning
├── code-generation.md                 # Code generation strategy
└── deployment-plan.md                 # Deployment strategy
```

#### Phase 8: Implementation (ACTIVE, Epic-Based Organization)
```
docs/05-implementation/
├── epics/                               # Epic-based organization (scalable for large projects)
│   ├── epic-01/                         # Epic 1: [Domain/Feature Area]
│   │   ├── description.md               # Epic overview, scope, and goals
│   │   └── user-stories/                # Stories grouped under this epic
│   │       ├── us-001/                  # ✨ First story in epic
│   │       │   ├── description.md              # Story definition (requirements, acceptance criteria, DoD)
│   │       │   ├── implementation-plan.md      # Layer-by-layer guide with checkboxes (CURRENT version)
│   │       │   ├── implementation-plan-v1.md   # IMMUTABLE snapshot v1 (if plan modified)
│   │       │   ├── implementation-plan-v2.md   # IMMUTABLE snapshot v2 (if further evolved)
│   │       │   ├── plan-approval.yaml          # Human validation gate (approved/changes-requested/revoked)
│   │       │   └── features/                   # BDD scenarios from BA agent (Given/When/Then)
│   │       │       ├── domain-us-001.feature   # Feature file with scenarios
│   │       │       └── domain-us-001.steps.ts  # Step definitions & tests
│   │       │
│   │       ├── us-002/                  # Additional stories in epic
│   │       │   ├── description.md
│   │       │   ├── implementation-plan.md
│   │       │   ├── plan-approval.yaml
│   │       │   └── features/
│   │       │
│   │       └── us-NNN/
│   │
│   ├── epic-02/                         # Epic 2: [Domain/Feature Area]
│   │   ├── description.md
│   │   └── user-stories/
│   │       ├── us-003/
│   │       ├── us-004/
│   │       └── [... more stories ...]
│   │
│   └── epic-NN/                         # Epic N
│       ├── description.md
│       └── user-stories/
│
├── user-stories.md                      # ⭐ MASTER STATUS TRACKING (SSOT across all epics)
├── project-status.md                    # 📊 Project dashboard
├── current-sprint.md                    # 📋 Active sprint
├── sprint-1.md                          # 📦 Archived Sprint 1
├── sprint-2.md                          # 📦 Archived Sprint 2
└── [... archived sprints ...]
```

### Key File Purposes & Update Patterns

#### `.github/agents/*.agent.md` (Agent System Prompts)
- **Purpose**: Define agent roles, responsibilities, and decision frameworks
- **Update Pattern**: Read-only (unless role definition changes)
- **Used By**: Every agent action (self-reference before acting)
- **Example**: `orchestrator.agent.md` defines when to present 3-option gates vs. decide

#### `.github/instructions/*.instructions.md` (System-Wide Standards)
- **Purpose**: Document coding standards, API patterns, documentation rules
- **Update Pattern**: Update when standards change (code review checklists, new patterns)
- **Used By**: All developers (reference during code review)
- **Example**: `coding.instructions.md` defines SOLID principles, cyclomatic complexity <10

#### `.github/workflows/*.workflows.yml` (Workflow Definitions)
- **Purpose**: Describe complete workflow phases (assessment, documentation, implementation)
- **Update Pattern**: Read-only reference (define sequence, not execute)
- **Used By**: Orchestrator (decides routing); dev-lead (creates implementation plans)
- **Example**: `implementation.workflows.yml` defines RED → GREEN → REFACTOR sequence

#### `.github/prompts/*.prompt.md` (Copilot Surfaced)
- **Purpose**: Fast lookup, task starters, context bridges for heavy-load agents
- **Update Pattern**: Update when new prompts needed or task patterns change
- **Used By**: Copilot `/` command display; agents copy-paste for context
- **Example**: `quick-reference.prompt.md` maps tasks to files/roles for 1-second lookup

#### `.github/templates/*-tmpl.md` (Document Templates)
- **Purpose**: Canonical structure for user stories, plans, and agent logs
- **Update Pattern**: Update when document schema changes (new required sections)
- **Used By**: Developers (copy when creating new user story/plan)
- **Example**: `agent-log-tmpl.md` ensures consistent daily agent activity logs
- **Note**: Handoffs are chat-based (no file artifacts). Agents read conversation history + `.github/checkpoint.yaml`

#### `docs/01-requirements/`, `docs/02-architecture/`, `docs/03-testing/`, `docs/04-planning/` (PDLC Documentation - FROZEN)
- **Purpose**: Complete requirements, architecture, testing strategy, and planning
- **Update Pattern**: Frozen after respective phases; only updated through formal change request
- **Contents**: user-stories.md in 01-requirements is SSOT for story definitions and acceptance criteria
- **Used By**: dev-lead (creates implementation plans), dev-tdd (reads stories for BDD)
- **Status**: ✅ Read-only after each phase completes

#### `docs/05-implementation/user-stories.md` (Master Status - ACTIVE)
- **Purpose**: Single source of truth for implementation progress across ALL epics and stories
- **Update Pattern**: Update row after story completion; preserve commit history for tracking
- **Columns**: US-REF, Epic, Title, Status (Not-Started/In-Progress/Implemented/Delivered), Owner, Branch, Points
- **Used By**: PM (tracking velocity), orchestrator (routing decisions), developers (visibility)
- **Status**: ⭐ ACTIVE cross-epic; update after each user story completes

#### `docs/05-implementation/epics/epic-XX/user-stories/<US-REF>/implementation-plan.md` (Per-Story Plan)
- **Purpose**: Layer-by-layer architecture (Database → Service → API → Frontend)
- **Update Pattern**: Reference throughoutTDD via checkboxes marked [x] as work completes
- **Content**: 1-2 paragraphs per layer, decision rationale, tech choices, BDD mapping, concrete checkboxes
- **Used By**: All TDD agents (track progress via checkboxes)
- **Status**: 📝 Living document (checkboxes updated during development)

#### `docs/05-implementation/epics/epic-XX/user-stories/<US-REF>/plan-approval.yaml` (Human Validation Gate)
- **Purpose**: Framework 2.0.0 approval gate preventing TDD execution until plan validated
- **Update Pattern**: Auto-revoked when plan modified; requires re-approval after changes
- **Content**: Status (approved/changes-requested/revoked), checklist, reviewer, date
- **Used By**: orchestrator (blocking TDD until approved), dev-lead (reviewing layers)
- **Status**: 🔐 Blocks TDD execution until status = approved

#### `docs/05-implementation/epics/epic-XX/user-stories/<US-REF>/features/` (BDD Feature Files)
- **Purpose**: Executable specifications (Gherkin/BDD syntax) driving TDD implementation
- **Update Pattern**: Created by BA agent during story elaboration
- **Contents**: Feature files (e.g., `user-authentication.feature`, `profile-management.feature`)
- **Used By**: All TDD agents (validate implementation against BDD scenarios)
- **Status**: ⭐ Static after BA creates; drives implementation

### Commit Message Conventions

**See `.github/instructions/git-workflow.instructions.md` for complete commit message standards** including:
- Assessment phase commit format
- Documentation phases commit format  
- Implementation phase (TDD) commit format
- General commit patterns
- Examples and detailed guidance
```

**Rules**:
- One commit per TDD phase (RED/GREEN/REFACTOR)
- Include cycle number (1, 2, 3, etc.) for traceability
- Message should describe what was tested/implemented/improved

### Agent Coordination & Progress Tracking

```
Phase 0: Assessment
↓ (outputs: prerequisites, AI-readiness report)
Phase 1-7: Documentation  
↓ (outputs: docs/01-requirements/, docs/02-architecture/, docs/03-testing/, docs/04-planning/)
Phase 8: Implementation (TDD)
├─ RED phase
│  ├─ Input: Features from features/ + implementation-plan.md checkboxes
│  ├─ Output: Failing tests
│  ├─ Update: Mark checkbox [x] in implementation-plan.md
│  ├─ Commit: TDD-<US>-RED-<CYCLE>
│  └─ Next: dev-tdd-green.agent
├─ GREEN phase
│  ├─ Input: Failing tests + implementation-plan.md constraints
│  ├─ Output: Passing implementation
│  ├─ Update: Mark checkbox [x] in implementation-plan.md
│  ├─ Commit: TDD-<US>-GREEN-<CYCLE>
│  └─ Next: dev-tdd-refactor.agent
└─ REFACTOR phase
   ├─ Input: Passing code + implementation-plan.md constraints
   ├─ Output: Improved code quality
   ├─ Update: Mark checkbox [x] in implementation-plan.md
   ├─ Commit: TDD-<US>-REFACTOR-<CYCLE>
   └─ Next: dev-tdd.agent (new checkpoint or story)
```

---

---

## Action Tracing & Agent Logs

### Overview

All TDD progress is tracked via checkboxes in `implementation-plan.md`. Git commits provide the audit trail. No separate action logs are needed.

### Progress Tracking

**Progress tracked in**: `/docs/05-implementation/epics/epic-XX/user-stories/<US-REF>/implementation-plan.md`

**Checkbox Format**:
```markdown
## Layer 1: Database & Domain Model

- [x] Create migration: `migrations/001_create_users_table.sql`
- [x] Create model: `models/User.ts`
- [ ] Write unit test: `models/__tests__/User.test.ts`
- [ ] Verify BDD scenario passes: "User data persists correctly"
```

**Audit Trail**: Git commit history provides complete trace:

```bash
git log --oneline --grep="TDD-US-001"
# TDD-US-001-REFACTOR-03: Extract validation logic  
# TDD-US-001-GREEN-03: Implement UserService.validate()
# TDD-US-001-RED-03: Write failing test for validation
# TDD-US-001-REFACTOR-02: Improve error messages
# TDD-US-001-GREEN-02: Implement UserRepository.create()
# TDD-US-001-RED-02: Write failing test for user creation
```

## Project Setup Checklist

### Greenfield Projects
1. ✅ Create base directory structure
2. ✅ Initialize Git repository
3. ✅ Create README.md with project overview
4. ✅ Set up .gitignore (language-specific)
5. ✅ Create docs/index.md documentation index
6. ✅ Set up dependency management (package.json, requirements.txt, etc.)
7. ✅ Create infrastructure files (if needed)
8. ✅ Set up CI/CD pipeline
9. ✅ Configure testing frameworks
10. ✅ Install project dependencies

### Brownfield Projects (Additional)
11. ✅ Archive legacy app in LegacyApps/
12. ✅ Document legacy app in docs/legacy-app/
13. ✅ Create feature list from legacy app
14. ✅ Prioritize features in docs/CriticalFeatures.md
15. ✅ Create migration plan in docs/migration/
16. ✅ Document rollback procedures in docs/rollback/
17. ✅ Set up issue tracker in docs/issue-tracker.md
18. ✅ Create API documentation (if legacy app lacks API)
19. ✅ Document interfaces to other systems
20. ✅ Create data migration strategy

## Best Practices

1. **Version Control**: Always initialize Git and create initial commit after setup
2. **Environment Variables**: Use .env files for secrets (add to .gitignore)
3. **Code Quality**: Set up linters and formatters from the start
4. **Security**: Include vulnerability scanning tools
5. **Documentation**: Keep documentation synchronized with code changes
6. **Testing**: Write tests alongside feature development
7. **Deployment**: Use staging environments before production
8. **Monitoring**: Set up logging and monitoring early

## Questions to Ask Before Setup

### All Projects
1. What are the project requirements and features?
2. Which cloud provider? (AWS, Azure, GCP, etc.)
3. What is the target architecture? (Monolith, Microservices, Serverless)
4. API-first or frontend first?
5. Specific languages or frameworks required?
6. Infrastructure format? (Terraform, CloudFormation, etc.)

### Brownfield Projects (Additional)
7. What legacy app needs replatforming?
8. Key challenges in replatforming?
9. Interfaces to other systems that must be maintained?
10. Requirements for replatforming process? (same data structure, UX consistency, etc.)
11. Critical features that must be migrated first?

## Maintenance

- **Review** .gitignore after file creation to ensure proper exclusions
- **Update** docs/index.md when adding new documentation
- **Sync** README.md with current project state
- **Validate** all generated files (architecture, API docs) and update as needed
- **Track** tasks in TODO.md and mark complete when done

---

**Last Updated**: January 2026  
**Version**: 1.0
