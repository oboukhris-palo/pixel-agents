---
description: Standards for organizing PRD documentation by Epic and User Stories with versioned implementation plans
applyTo: "docs/05-implementation/epics/**"
---

# Epic-Based User Story Organization Instructions

## Overview

This document provides systematic instructions for organizing Product Requirements Documentation (PRD) by Epic and User Stories using the AI-first delivery methodology. This instruction defines the folder structure, file organization, versioning strategy, and human validation process that transforms Epic-level requirements into executable User Story implementation plans with proper traceability and version control.

## Process Overview

**Epic-Based User Story Organization** transforms high-level Epic requirements from PRD documentation into a structured hierarchy of User Story folders containing versioned implementation plans that enable systematic development, maintain clear traceability from requirements to implementation, and ensure human validation at critical decision points.

## Implementation Process

### 1. Epic Folder Structure Creation
**Objective**: Establish the foundational folder hierarchy under PRD architecture that organizes User Stories by their parent Epic.

**Activities**:
- Read `docs/01-requirements/user-stories.md` to identify all Epics (EPIC-001, EPIC-002, etc.) and their associated User Stories
- Create Epic folder: `docs/05-implementation/epics/epic-01/` (where 01 is zero-padded Epic number, e.g., epic-01, epic-02)
- Create `user-stories/` subfolder within each Epic folder
- Ensure folder names use lowercase kebab-case per naming conventions
- Document Epic-to-User-Story mapping for traceability

**Quality Standards**:
- ✅ All Epic folders follow naming pattern: `epic-[zero-padded-number]` (e.g., epic-01, epic-07)
- ✅ Each Epic folder contains exactly one `user-stories/` subfolder
- ✅ Folder structure matches Epic definitions in `docs/01-requirements/user-stories.md`
- ✅ No uppercase letters or underscores in folder names

**Folder Structure Example**:
```
docs/05-implementation/epics/
├── epic-01/                    # Epic 1: Authentication
│   └── user-stories/
├── epic-02/                    # Epic 2: Vote Management
│   └── user-stories/
├── epic-03/                    # Epic 3: Session Orchestration
│   └── user-stories/
└── epic-07/                    # Epic 7: Proposal Management
    └── user-stories/
```

---

### 2. User Story Folder Creation
**Objective**: Create individual User Story folders under their respective Epic's user-stories directory.

**Activities**:
- For each User Story in the Epic, create folder: `docs/05-implementation/epics/epic-XX/user-stories/<US-REF>/`
- Use User Story reference from PRD (e.g., US-001, US-002, US-015)
- Maintain lowercase kebab-case format: `us-001`, `us-002`, etc.
- Preserve Epic-to-Story relationship by folder hierarchy
- Document folder creation in git commit following `.github/instructions/git-workflow.instructions.md` commit message standards

**Quality Standards**:
- ✅ User Story folder names match exact references from `docs/01-requirements/user-stories.md`
- ✅ All folder names use lowercase with hyphens (e.g., `us-001`, not `US-001` or `US_001`)
- ✅ Each User Story folder is placed under correct Epic's `user-stories/` directory
- ✅ No duplicate User Story folders across different Epics

**User Story Folder Example**:
```
docs/05-implementation/epics/epic-01/user-stories/
├── us-001/                     # US-001: SSO Authentication via Entra ID
└── us-002/                     # US-002: RBAC Implementation

docs/05-implementation/epics/epic-02/user-stories/
├── us-003/                     # US-003: Display Research Packages
├── us-004/                     # US-004: Enter Votes
├── us-005/                     # US-005: Add Justifications
├── us-006/                     # US-006: Validate Sum=100
├── us-007/                     # US-007: Lock Votes
└── us-008/                     # US-008: Pre-Initialize N-1 Session
```

---

### 3. User Story Description Document Creation
**Objective**: Create standardized `description.md` file for each User Story containing complete story definition from PRD.

**Activities**:
- Copy User Story content from `docs/01-requirements/user-stories.md`
- Create `description.md` in User Story folder: `docs/05-implementation/epics/epic-XX/user-stories/us-YYY/description.md`
- Include all sections: Story statement, Acceptance Criteria, BDD scenarios references, Dependencies, Technical Constraints
- Add metadata: Story ID, Epic reference, Story points, Priority, Status
- Link back to original PRD location for traceability

**Quality Standards**:
- ✅ File named exactly `description.md` (lowercase)
- ✅ Content matches User Story definition in PRD (no modifications or interpretations)
- ✅ All acceptance criteria copied verbatim from PRD
- ✅ Includes metadata section at top with Story ID, Epic, and status
- ✅ Contains links to related BDD scenarios in `docs/05-implementation/epics/<EPIC-REF>/user-stories/<US-REF>/bdd-scenarios/`

**description.md Template Structure**:
```markdown
---
story_id: US-XXX
epic_id: E0X
story_points: X
priority: HIGH|MEDIUM|LOW
status: Not Started|In Progress|Implemented|Delivered
created: YYYY-MM-DD
last_updated: YYYY-MM-DD
---

# User Story: [Story Title]

## Story Statement
As a [user role], I want to [action], so that [benefit].

## Acceptance Criteria
- **AC1**: [Criterion description]
- **AC2**: [Criterion description]
- **AC3**: [Criterion description]

## BDD Scenarios
See: `docs/05-implementation/epics/<EPIC-REF>/user-stories/<US-REF>/bdd-scenarios/*.feature`

## Dependencies
- **Depends on**: US-XXX (prerequisite stories)
- **Technical Prerequisites**: [Infrastructure, tools, configurations]
- **External Dependencies**: [Third-party services, APIs]

## Technical Constraints
- [Constraint from architecture-design.md]
- [Performance requirements]
- [Security requirements]

## Related Documentation
- PRD: [docs/01-requirements/user-stories.md](../../../01-requirements/user-stories.md#us-xxx)
- Implementation Plan: [implementation-plan.md](./implementation-plan.md)
- BDD Scenarios: [docs/05-implementation/epics/<EPIC-REF>/user-stories/<US-REF>/bdd-scenarios/](./bdd-scenarios/)
```

---

### 4. Initial Implementation Plan Creation
**Objective**: Create the first version of the implementation plan (`implementation-plan.md`) with layer-by-layer breakdown ready for human validation.

**Activities**:
- Analyze User Story acceptance criteria and technical constraints
- Design implementation approach using layer architecture pattern (Database → Service → API → Frontend)
- Create `implementation-plan.md` in User Story folder: `docs/05-implementation/epics/epic-XX/user-stories/us-YYY/implementation-plan.md`
- Document each layer with: Objectives, Components, BDD scenario mapping, Testing strategy, Estimated complexity
- Mark as **DRAFT** status requiring human validation before TDD execution
- Include placeholders for validation checkpoints

**Quality Standards**:
- ✅ File named exactly `implementation-plan.md` (lowercase)
- ✅ Status marked as **DRAFT** until human validation completes
- ✅ All layers documented: Layer 1 (Database), Layer 2 (Service), Layer 3 (API), Layer 4 (Frontend)
- ✅ Each layer includes BDD scenario mapping from acceptance criteria
- ✅ Testing strategy defined for each layer (unit tests, integration tests, E2E tests)
- ✅ Complexity estimates provided (Story Points or T-shirt sizes)

**implementation-plan.md Template Structure**:
```markdown
---
story_id: US-XXX
version: 1.0
status: DRAFT|APPROVED|OBSOLETE
created: YYYY-MM-DD
approved_by: [Name]
approval_date: YYYY-MM-DD
---

# Implementation Plan: [Story Title]

**Version**: 1.0 (Initial)  
**Status**: DRAFT - Awaiting Human Validation  
**Epic**: [Epic Name]  
**Story Points**: X

## Implementation Overview
[High-level summary of implementation approach]

## Architecture Pattern
- **Pattern**: Layered Architecture (Database → Service → API → Frontend)
- **BDD-Driven**: Implementation follows BDD scenarios from `docs/05-implementation/epics/<EPIC-REF>/user-stories/<US-REF>/bdd-scenarios/`
- **TDD Cycles**: Each layer implemented via RED → GREEN → REFACTOR

---

## Layer 1: Database & Domain Model
**Objective**: [What this layer achieves]

**Components**:
- Entity: `src/backend/Core/Entities/[EntityName].cs`
- Repository: `src/backend/Infrastructure/Data/[RepositoryName].cs`
- Migration: `src/backend/Infrastructure/Migrations/[MigrationName].cs`

**BDD Scenarios Mapped**:
- AC1: [Scenario name] → Database validation logic
- AC2: [Scenario name] → Data persistence

**Testing Strategy**:
- Unit tests: Repository CRUD operations
- Integration tests: Database migrations and constraints
- Coverage target: >80%

**Complexity**: [Story points or T-shirt size]

**🛑 VALIDATION CHECKPOINT 1**: Review database schema, entity relationships, and migration strategy before proceeding to Layer 2.

---

## Layer 2: Backend Services
**Objective**: [What this layer achieves]

**Components**:
- Service: `src/backend/Core/Services/[ServiceName].cs`
- Interfaces: `src/backend/Core/Interfaces/I[ServiceName].cs`
- DTOs: `src/backend/API/DTOs/[DtoName].cs`

**BDD Scenarios Mapped**:
- AC3: [Scenario name] → Business logic validation
- AC4: [Scenario name] → Error handling

**Testing Strategy**:
- Unit tests: Service methods with mocked repositories
- Integration tests: Service layer with real database
- Coverage target: >80%

**Complexity**: [Story points or T-shirt size]

**🛑 VALIDATION CHECKPOINT 2**: Review service design, business logic implementation, and DTO structure before proceeding to Layer 3.

---

## Layer 3: API Controllers
**Objective**: [What this layer achieves]

**Components**:
- Controller: `src/backend/API/Controllers/[ControllerName].cs`
- Routes: POST, GET, PUT, DELETE endpoints
- Middleware: Authentication, validation, error handling

**BDD Scenarios Mapped**:
- AC5: [Scenario name] → API endpoint validation
- AC6: [Scenario name] → Authorization checks

**Testing Strategy**:
- Unit tests: Controller actions with mocked services
- Integration tests: Full HTTP request/response cycle
- API documentation: OpenAPI/Swagger specs
- Coverage target: >80%

**Complexity**: [Story points or T-shirt size]

**🛑 VALIDATION CHECKPOINT 3**: Review API design, endpoint structure, and authentication/authorization approach before proceeding to Layer 4.

---

## Layer 4: Frontend Components
**Objective**: [What this layer achieves]

**Components**:
- Component: `src/frontend/src/app/[feature]/[component].component.ts`
- Template: `src/frontend/src/app/[feature]/[component].component.html`
- Service: `src/frontend/src/app/core/services/[service].service.ts`
- Guard: `src/frontend/src/app/core/guards/[guard].guard.ts` (if needed)

**BDD Scenarios Mapped**:
- AC7: [Scenario name] → UI component behavior
- AC8: [Scenario name] → Form validation

**Testing Strategy**:
- Unit tests: Component logic with Jasmine/Karma
- E2E tests: User flows with Playwright
- Coverage target: >80%

**Complexity**: [Story points or T-shirt size]

**🛑 VALIDATION CHECKPOINT 4**: Review Angular component design, reactive forms approach, and E2E test scenarios before final approval.

---

## Dependencies & Prerequisites
- **Technical**: [Required tools, packages, configurations]
- **Story Dependencies**: US-XXX must be complete before starting
- **Infrastructure**: [Database, authentication, deployment requirements]

## Risk Assessment
- **Technical Risks**: [Potential blockers or challenges]
- **Dependency Risks**: [External service availability]
- **Timeline Risks**: [Complexity or scope concerns]

## Definition of Done
- [ ] All 4 layers implemented and tested
- [ ] All BDD scenarios passing (unit + integration + E2E)
- [ ] Code review approved (96/100 quality score minimum)
- [ ] Documentation updated (README, API docs, inline comments)
- [ ] Performance benchmarks met
- [ ] Security scan passed (no critical vulnerabilities)
- [ ] Deployed to UAT environment

---

**Related Documentation**:
- Description: [description.md](./description.md)
- BDD Scenarios: [docs/05-implementation/epics/<EPIC-REF>/user-stories/<US-REF>/bdd-scenarios/](./bdd-scenarios/)
- Architecture Design: [docs/02-architecture/architecture-design.md](../../../02-architecture/architecture-design.md)
```

---

### 5. Human Validation Process for Implementation Plan
**Objective**: Ensure human review and approval of implementation plan before TDD execution begins.

**Activities**:
- Present implementation plan to Dev-Lead or Architect for review
- Request validation for each layer's design, BDD mapping, and testing strategy
- Address feedback and revisions in iterative review cycles
- Document validation checkpoints with reviewer name and approval date
- Update plan status from **DRAFT** to **APPROVED** only after all checkpoints validated
- Create `plan-approval.yaml` file to track approval status per Framework 2.0.0

**Quality Standards**:
- ✅ All 4 validation checkpoints explicitly approved by reviewer
- ✅ Reviewer name and approval date recorded in plan metadata
- ✅ All feedback addressed and documented in plan revisions
- ✅ Status changed to **APPROVED** only after complete validation
- ✅ `plan-approval.yaml` created with status: `approved` and checklist completed

**Validation Checkpoint Process**:
1. **Checkpoint 1 (Layer 1)**: Present database schema, entity design, migration strategy
   - Reviewer validates: Schema correctness, Entity relationships, Migration safety
   - Decision: APPROVED | CHANGES REQUESTED
   
2. **Checkpoint 2 (Layer 2)**: Present service layer design, business logic approach, DTOs
   - Reviewer validates: Business logic correctness, DTO structure, Error handling
   - Decision: APPROVED | CHANGES REQUESTED

3. **Checkpoint 3 (Layer 3)**: Present API design, endpoint structure, authentication approach
   - Reviewer validates: RESTful design, Security implementation, API documentation
   - Decision: APPROVED | CHANGES REQUESTED

4. **Checkpoint 4 (Layer 4)**: Present frontend component design, Angular patterns, E2E tests
   - Reviewer validates: Component architecture, Reactive forms approach, E2E coverage
   - Decision: APPROVED | CHANGES REQUESTED

**Approval Metadata Update**:
After final approval, update `implementation-plan.md` frontmatter:
```yaml
---
status: APPROVED
approved_by: [Reviewer Name]
approval_date: 2026-03-23
validation_checkpoints:
  layer_1: approved
  layer_2: approved
  layer_3: approved
  layer_4: approved
---
```

**plan-approval.yaml Creation**:
```yaml
---
story_id: US-XXX
plan_version: 1.0
status: approved  # approved | changes-requested | revoked
approved_by: [Reviewer Name]
approval_date: 2026-03-23
last_modified: 2026-03-23

validation_checklist:
  - item: Implementation plan follows layer architecture (DB → Service → API → UI)
    status: approved
  - item: BDD scenarios map to implementation layers
    status: approved
  - item: All external dependencies documented
    status: approved
  - item: Database migration order correct
    status: approved
  - item: Critical business logic addressed
    status: approved
  - item: Error handling strategy defined
    status: approved

comments: |
  All layers reviewed and approved. Dependencies validated.
  Ready for TDD execution.
---
```

---

### 6. Implementation Plan Versioning
**Objective**: Manage implementation plan evolution through versioned snapshots while maintaining current version as `implementation-plan.md`.

**Activities**:
- When significant changes required to approved plan, create versioned snapshot before modification
- Copy current `implementation-plan.md` to `implementation-plan-v1.md` (first version)
- Modify `implementation-plan.md` with new content (becomes current version)
- Update version number in frontmatter: `version: 2.0`
- Reset status to **DRAFT** requiring new human validation cycle
- Auto-revoke approval in `plan-approval.yaml` by changing status to `revoked`
- Document rationale for plan changes in commit message and plan changelog section

**Quality Standards**:
- ✅ Previous version archived as immutable snapshot: `implementation-plan-v[N].md`
- ✅ Current version always named `implementation-plan.md` (no version suffix)
- ✅ Version numbers incremented sequentially (v1, v2, v3)
- ✅ Status reset to **DRAFT** after any modification to approved plan
- ✅ Approval automatically revoked when plan modified
- ✅ Changelog section documents reason for version change

**Versioning Workflow**:
```bash
# Step 1: Snapshot current approved version
cp implementation-plan.md implementation-plan-v1.md

# Step 2: Update version metadata in snapshot
# Edit implementation-plan-v1.md frontmatter:
# version: 1.0
# status: OBSOLETE (archived)

# Step 3: Modify current plan
# Edit implementation-plan.md with new content

# Step 4: Update current plan metadata
# version: 2.0
# status: DRAFT (awaiting re-approval)

# Step 5: Revoke approval
# Edit plan-approval.yaml:
# status: revoked
# revoked_reason: "Plan modified - Layer 2 service design changed"

# Step 6: Commit with changelog
git commit -m "feat(US-XXX): Update implementation plan v2.0 - revised service layer design"
```

**Versioned Implementation Plan Example**:
```
docs/prd/architecture/epic-01/user-stories/us-001/
├── description.md                  # Story definition (unchanged)
├── implementation-plan.md          # Current version (v2.0 DRAFT)
├── implementation-plan-v1.md       # First version (OBSOLETE)
└── plan-approval.yaml              # Status: revoked (requires re-approval)
```

**Changelog Section in implementation-plan.md**:
```markdown
## Version History

### Version 2.0 (2026-03-24) - DRAFT
**Changes**:
- Revised Layer 2 service design to use Repository pattern
- Added caching strategy for frequently accessed data
- Updated BDD scenario mapping for AC3

**Rationale**: Performance testing revealed N+1 query issues in initial design

**Status**: Awaiting human validation

---

### Version 1.0 (2026-03-23) - OBSOLETE
**Changes**: Initial implementation plan
**Status**: Archived in `implementation-plan-v1.md`
```

---

### 7. Linking to Existing TDD Execution Folders
**Objective**: Maintain traceability between PRD requirements documentation and actual TDD execution artifacts in `docs/05-implementation/epics/` hierarchy.

**Activities**:
- Add cross-reference links in PRD implementation plans to TDD execution folders
- Link from `docs/05-implementation/epics/epic-XX/user-stories/us-YYY/implementation-plan.md` to execution artifacts
- Ensure bidirectional links: PRD → TDD execution AND TDD execution → PRD
- Update links when folder structure changes or stories move between epics
- Use relative paths for portability across environments

**Quality Standards**:
- ✅ All implementation plans include link to TDD execution folder
- ✅ TDD execution folders include link back to PRD implementation plan
- ✅ Links use relative paths (not absolute paths)
- ✅ Links validated before committing (no broken references)

**Cross-Reference Example in implementation-plan.md**:
```markdown
---

## TDD Execution

**Execution Folder**: [docs/05-implementation/epics/<EPIC-REF>/user-stories/us-001/](./)

**Artifacts**:
- BDD Scenarios: [features/](./features/)
- Implementation Plan with Checkboxes: [implementation-plan.md](./implementation-plan.md)
- Plan Approval Gate: [plan-approval.yaml](./plan-approval.yaml)

**Status**: See [docs/05-implementation/user-stories.md](../../user-stories.md) for current implementation status
```

**Cross-Reference Example in docs/05-implementation/epics/epic-01/user-stories/us-001/description.md**:
```markdown
---

## PRD Documentation

**Epic**: Epic 1 - Authentication  
**Implementation Plan**: [implementation-plan.md](./implementation-plan.md)  
**Story Description**: [description.md](./description.md)
```

---

## File Location Standards

**Output Location**: Store completed User Story documentation in the following hierarchy:

```
docs/05-implementation/epics/epic-XX/user-stories/us-YYY/
├── description.md              # Story definition: requirements, acceptance criteria, DoD
├── implementation-plan.md      # Layer-by-layer guide with checkboxes
├── plan-approval.yaml          # Human validation gate (approved before TDD starts)
└── features/                   # BDD scenarios from BA agent (Given/When/Then)
    ├── user-authentication.feature
    └── profile-management.feature
```

**Source Materials**:
- **PRD User Stories**: `docs/01-requirements/user-stories.md` (Epic and User Story definitions)
- **Architecture Design**: `docs/02-architecture/architecture-design.md` (Technical constraints)
- **Tech Spec**: `docs/02-architecture/tech-spec.md` (API contracts, database schemas)
- **BDD Scenarios**: `docs/05-implementation/epics/<EPIC-REF>/user-stories/<US-REF>/features/*.feature` (Acceptance criteria)

---

## Quality Assurance Process

### Pre-Generation Validation
- ✅ All Epics identified from `docs/01-requirements/user-stories.md` with correct numbering
- ✅ All User Stories mapped to correct parent Epic
- ✅ Folder naming follows lowercase kebab-case convention
- ✅ No duplicate User Story folders across different Epics

### Post-Generation Review
- ✅ All `description.md` files contain complete story definitions
- ✅ All `implementation-plan.md` files include 4 layers with validation checkpoints
- ✅ All plans marked **DRAFT** until human validation completes
- ✅ All folders follow standard structure (description + plan + approval YAML)
- ✅ Cross-reference links validated and functional

### Confidence Validation Requirements
- **Structural Correctness**: 100% - Folder hierarchy must match Epic → User Story relationships exactly
- **Content Completeness**: 95% - All required files present with no placeholders or TODO sections
- **Traceability**: 100% - All links between PRD, TDD execution, and BDD scenarios functional
- **Approval Status**: 100% - No TDD execution begins until plan status = **APPROVED**

---

## Integration with Overall Development Workflow

Epic-Based User Story documentation serves as foundational inputs for:

- **TDD Execution** Implementation plans guide RED → GREEN → REFACTOR cycles via checkboxes in `implementation-plan.md`
- **BDD Validation** BA agent creates BDD feature files in `docs/05-implementation/epics/<EPIC-REF>/user-stories/<US-REF>/features/`
- **QA Validation** Definition of Done included in `description.md` drives acceptance testing
- **Sprint Planning** PM agent uses Epic-organized stories for sprint scope selection and velocity tracking
- **Architecture Review** Architect agent validates technical approach in implementation plans via `plan-approval.yaml`
- **GitHub Issues** PM agent syncs User Story status between local documentation and GitHub Issues for team visibility

---

**Related Resources**:
- [User Stories Master Document](../../user-stories.md)
- [Architecture Design](../../architecture-design.md)
- [Tech Specification](../../tech-spec.md)
- [Implementation Workflow](./../../../workflows/05-implementation.workflows.yml)
- [Plan Approval Template](./../../../templates/plan-approval-tmpl.yaml)

---

**Document Status**: Active Framework | **Version**: 1.0 | **Last Updated**: 2026-03-23  
**Scope**: AI-first delivery PDLC Phase 8 (Implementation)  
**Usage**: Organize PRD documentation by Epic and User Stories with versioned implementation plans and human validation gates for LBP AM Research Manager project
