# User Story Folder Template - Simplified Structure

**Purpose**: This template defines the REQUIRED files for every user story folder under `/docs/05-implementation/epics/<EPIC-REF>/user-stories/<US-REF>/`. Dev-Lead creates these files upfront; TDD agents execute against implementation-plan.md checkboxes.

---

## Required Folder Structure 

```
/docs/05-implementation/epics/<EPIC-REF>/user-stories/<US-REF>/
├── description.md                       # Single source of truth: functional/non-functional requirements, acceptance criteria
├── implementation-plan.md               # Layer-by-layer implementation guide with checkboxes for TDD execution
├── plan-approval.yaml                   # Human validation gate (required before TDD execution)
└── features/                            # BDD feature files from BA agent
    └── {feature-name}.feature           # Gherkin scenarios (Given/When/Then)
```

---

## File Purposes & Creation Rules

### 1. **description.md** (Story Definition - SSOT)

**Created by**: BA or Dev-Lead  
**Updated by**: PO/BA only (with approval)  
**Purpose**: Complete story definition including functional requirements, non-functional requirements, acceptance criteria, and Definition of Done  
**Content**: Single source of truth for what needs to be built

**Template Content**:
```markdown
# User Story: {US-REF}

## Story Description

**As a** [user type]
**I want** [goal/functionality]  
**So that** [business value/benefit]

## Functional Requirements

- [Specific functional requirement 1]
- [Specific functional requirement 2]
- [Specific functional requirement 3]

## Non-Functional Requirements  

- **Performance**: [Response time requirements]
- **Security**: [Authentication/authorization requirements]
- **Compatibility**: [Browser/device compatibility]
- **Accessibility**: [WCAG compliance level]

## Acceptance Criteria (Measurable)

1. **Given** [context/setup]  
   **When** [action/event]  
   **Then** [expected result/outcome]

2. **Given** [context/setup]
   **When** [action/event] 
   **Then** [expected result/outcome]

3. **Given** [context/setup]
   **When** [action/event]
   **Then** [expected result/outcome]

## Technical Notes

- [Integration dependencies]
- [Data migration requirements]
- [Third-party service integrations]
- [Security considerations]

## Definition of Done

- [ ] All acceptance criteria validated
- [ ] All BDD scenarios passing
- [ ] Code review completed
- [ ] Unit test coverage ≥ 80%
- [ ] Integration tests pass
- [ ] Security review passed (if applicable)
- [ ] Performance requirements met
- [ ] Documentation updated

---

**Story ID**: {US-REF}
**Epic**: {EPIC-REF}  
**Created**: {YYYY-MM-DD}
**Status**: Draft
**Framework**: Simplified Structure v3.0
```

---

### 2. **implementation-plan.md** (TDD Execution Guide)

**Created by**: Dev-Lead  
**Updated by**: Dev-Lead (initial creation only), TDD agents (mark checkboxes during execution)  
**Purpose**: Layer-by-layer implementation guide with concrete checkboxes - drives TDD agent execution  
**Content**: Uses implementation-plan-tmpl.md with checkbox tasks per layer

**Key Rules**:
- Each checkbox `[ ]` represents a specific task/file to create or modify
- TDD agents execute checkboxes sequentially by layer
- Mark `[ ]` as `[x]` when task completed
- BDD mapping matrix connects scenarios to implementation layers
- Layer N+1 blocked until Layer N complete

**Checkbox Format**:
```markdown
## Layer 1: Database & Domain Model

**BDD Scenarios Covered**: `features/user-registration.feature` lines 5-12

- [ ] Create migration: `migrations/001_create_users_table.sql`
- [ ] Create model: `models/User.ts`
- [ ] Write unit test: `models/__tests__/User.test.ts`
- [ ] Verify BDD scenario passes: "User data persists to database"

## Layer 2: Backend Services & API

**BDD Scenarios Covered**: `features/user-registration.feature` lines 13-25

- [ ] Create service: `services/UserService.ts`
- [ ] Create controller: `controllers/UserController.ts`
- [ ] Write integration test: `services/__tests__/UserService.test.ts`
- [ ] Verify BDD scenario passes: "POST /api/users returns 201 Created"
```

---

### 3. **plan-approval.yaml** (Human Validation Gate)

**Created by**: Dev-Lead (automatically when implementation-plan.md created)  
**Updated by**: Dev-Lead or authorized reviewer  
**Purpose**: Human validation gate that blocks TDD execution until approved  
**Content**: Uses plan-approval-tmpl.yaml format

**Status Values**:
- `changes-requested`: TDD BLOCKED, plan needs revision
- `approved`: TDD execution can proceed  
- `revoked`: Auto-set when plan modified after approval

**Approval Checklist** (in YAML file):
```yaml
status: changes-requested  # approved | changes-requested | revoked
reviewer: {reviewer-name}
review_date: {YYYY-MM-DD}
approval_checklist:
  architecture_follows_layers: false
  bdd_scenarios_mapped: false  
  dependencies_documented: false
  database_migrations_ordered: false
  business_logic_addressed: false
  error_handling_defined: false
comments: |
  - Review feedback item 1
  - Review feedback item 2
```

**Critical Rule**: TDD agents MUST validate plan-approval.yaml status = "approved" before starting any implementation work.

---

### 4. **features/** (BDD Scenarios from BA Agent)

**Created by**: BA agent  
**Updated by**: BA (scenarios), Dev-TDD (during implementation to validate)  
**Purpose**: Executable BDD specifications that define acceptance criteria as executable tests  
**Content**: Gherkin feature files with Given/When/Then scenarios

**Structure**:
```
features/
├── user-authentication.feature      # Login/logout scenarios
├── profile-management.feature       # CRUD operations  
└── tier-synchronization.feature     # Business logic scenarios
```

**Example Feature File**:
```gherkin
Feature: User Registration
  As a new user
  I want to register an account
  So that I can access the application

  Scenario: Successful registration with valid data
    Given I am on the registration page
    And I have no existing account
    When I submit valid registration details
      | email           | password     | name         |
      | john@example.com| SecurePass1! | John Doe     |
    Then I should see a "Registration successful" message
    And my account should be created in the database
    And I should receive a welcome email

  Scenario: Registration fails with duplicate email
    Given an account exists with email "existing@example.com"
    When I try to register with email "existing@example.com"
    Then I should see an error "Email already in use"
    And no new account should be created
```

**Usage**:
- BA creates BDD scenarios during story elaboration
- Scenarios define acceptance criteria as executable tests
- Implementation plan references BDD scenarios in layer breakdown
- TDD agents implement code to make BDD scenarios pass
- QA agent validates all scenarios pass before story completion

---

## Workflow Integration

### Creation Sequence (Dev-Lead + BA)
1. **BA creates `features/`** with BDD scenarios (Given/When/Then) during story elaboration
2. **Dev-Lead creates `description.md`** with complete story definition (requirements, DoD)
3. **Dev-Lead creates `implementation-plan.md`** using implementation-plan-tmpl.md (checkboxes per layer)  
4. **Dev-Lead auto-creates `plan-approval.yaml`** with status `changes-requested`
5. **Dev-Lead reviews** implementation plan validates BDD mapping, dependencies, approach
6. **Dev-Lead marks `plan-approval.yaml`** as `approved` (enables TDD execution)

### Execution Sequence (TDD Agents)
1. **Validation**: Check `plan-approval.yaml` status = "approved" (blocks if not approved)
2. **Layer 1**: Execute Database & Domain Model checkboxes
3. **Layer 2**: Execute Backend Services & API checkboxes  
4. **Layer 3**: Execute Configuration & Integration checkboxes
5. **Layer 4**: Execute Frontend & Components checkboxes
6. **Validation**: Verify all BDD scenarios in `features/` pass and acceptance criteria met

### Quality Gates  
- ✅ TDD execution BLOCKED if `plan-approval.yaml` ≠ "approved"
- ✅ Layer N+1 BLOCKED until Layer N checkboxes 100% complete
- ✅ Story completion BLOCKED until all checkboxes marked `[x]`
- ✅ Story acceptance BLOCKED until all BDD scenarios pass

---

## File Creation Checklist (Dev-Lead)

Before handing off to TDD agents, Dev-Lead ensures:

```
✅ Created folder: /docs/05-implementation/epics/<EPIC-REF>/user-stories/<US-REF>/
✅ BA created features/ folder with complete BDD scenarios
✅ Created description.md (functional/non-functional requirements, acceptance criteria, DoD)
✅ Created implementation-plan.md (500 words/layer max, checkboxes per concrete task)
✅ Created plan-approval.yaml (status: changes-requested initially)
✅ Reviewed implementation plan for completeness and feasibility
✅ Verified BDD scenarios map to implementation layers
✅ Set plan-approval.yaml status to "approved"
✅ Folder structure matches this template exactly (3 files + 1 folder only)
```

---

## Key Rules for Agents

### Implementation Plan Execution
- ✅ Read `implementation-plan.md` for layer-by-layer guidance
- ✅ Execute checkboxes sequentially within each layer
- ✅ Mark checkbox `[x]` immediately after task completion
- ✅ Reference `features/` for BDD scenario validation
- ✅ Commit after each meaningful checkpoint with proper message format: `TDD-<US-REF>-<PHASE>-<CYCLE>-YYYYMMDD: [description]` (date in YYYYMMDD)
- ❌ Skip ahead to Layer N+1 before Layer N complete
- ❌ Modify plan after approval without re-approval
- ❌ Work on multiple layers in parallel (sequential execution only)

### Checkbox Completion Rules
- Checkbox marked `[x]` means: code written, tests passing, committed to git
- Never mark checkbox as complete until code is committed
- Each checkbox should result in at least one git commit
- Commit message must reference the checkbox task

### Git Commit Message Rules
```
TDD-<US-REF>-<PHASE>-<CYCLE>-YYYYMMDD: [Description]

Examples:
- TDD-US-001-RED-01: Write failing test for user registration
- TDD-US-001-GREEN-01: Implement UserService.register()  
- TDD-US-001-REFACTOR-01: Extract validation logic to middleware
```

---

## Folder Lifecycle Example

### T=0 (Dev-Lead - Story Planning)
```
Dev-Lead creates:
/docs/05-implementation/epics/<EPIC-REF>/user-stories/US-001/
├── description.md (complete story definition, DoD)
├── implementation-plan.md (Layer 1-4 with checkboxes, all [ ])
├── plan-approval.yaml (status: approved after review)
└── features/ (BA created)
    ├── user-registration.feature
    └── email-validation.feature
```

### T=1h (Dev-TDD - Layer 1, Checkpoint 1)
```
Dev-TDD executes:
1. Validates plan-approval.yaml status = "approved" ✅
2. Reads implementation-plan.md Layer 1, first checkbox
3. Writes failing test: UserRepository.test.ts
4. Marks checkbox: [x] Write unit test for User creation
5. Commits: TDD-US-001-RED-01: Write failing test for User creation

implementation-plan.md now shows:
## Layer 1: Database & Domain Model
- [x] Create migration: `migrations/001_create_users_table.sql`
- [ ] Create model: `models/User.ts`
- [ ] Write unit test: `models/__tests__/User.test.ts`
```

### T=2h (Dev-TDD - Layer 1, Checkpoint 2)  
```
Dev-TDD continues:
1. Reads failing test from previous checkpoint
2. Implements minimal UserRepository.ts to make test pass
3. Marks checkbox: [x] Implement UserRepository.create()
4. Commits: TDD-US-001-GREEN-01: Implement UserRepository.create()

implementation-plan.md now shows:
## Layer 1: Database & Domain Model
- [x] Create migration: `migrations/001_create_users_table.sql`
- [x] Create model: `models/User.ts`
- [ ] Write unit test: `models/__tests__/User.test.ts`
```

### T=3h (Dev-TDD - Layer 1, Checkpoint 3)
```
Dev-TDD refactors:
1. Reviews code quality and identifies improvements
2. Extracts password hashing to utility function
3. Marks checkbox: [x] Refactor password handling
4. Commits: TDD-US-001-REFACTOR-01: Extract password hashing utility

implementation-plan.md now shows:
## Layer 1: Database & Domain Model
- [x] Create migration: `migrations/001_create_users_table.sql`
- [x] Create model: `models/User.ts`
- [x] Write unit test: `models/__tests__/User.test.ts`
- [x] Verify BDD scenario passes: "User data persists to database"

✅ Layer 1 complete - proceed to Layer 2
```

### T=∞ (After All Layers Complete)
```
/docs/05-implementation/epics/<EPIC-REF>/user-stories/US-001/
├── description.md (unchanged)
├── implementation-plan.md (all checkboxes [x])
├── plan-approval.yaml (status: approved)
└── features/ (all scenarios passing ✅)
    ├── user-registration.feature ✅
    └── email-validation.feature ✅

✅ All checkboxes marked [x] = Story implementation complete
✅ All BDD scenarios passing = Acceptance criteria met
✅ Ready for QA validation and merge
```

---

## Benefits of This Structure

| Aspect | Benefit |
|--------|---------|
| **Simplicity** | Only 3 files + 1 folder = easy to understand and maintain |
| **Clarity** | Clear separation: description (WHAT), plan (HOW), features (ACCEPTANCE) |
| **Traceability** | Checkbox progress in implementation-plan.md tracks status directly |
| **Quality Gates** | Human approval required before TDD, BDD scenarios validate completion |
| **Scalability** | Pattern works for 1 story or 100 stories consistently |
| **Auditability** | Git commits directly reference checkboxes and BDD scenarios |
| **No Sprawl** | Zero auxiliary files = no documentation inflation |

---

## Summary

**Create Upfront (Dev-Lead + BA)**:
- ✅ Folder `/docs/05-implementation/epics/<EPIC-REF>/user-stories/<US-REF>/`
- ✅ BA creates `features/` with BDD scenarios (Given/When/Then)
- ✅ Dev-Lead creates `description.md` (requirements, acceptance criteria, DoD)
- ✅ Dev-Lead creates `implementation-plan.md` (checkboxes per layer, BDD mapping)
- ✅ Dev-Lead creates and approves `plan-approval.yaml`

**Agents Execute During TDD**:
- ✅ Mark checkboxes `[x]` in `implementation-plan.md` as work progresses
- ✅ Validate BDD scenarios in `features/` pass after each layer
- ✅ Commit with proper `TDD-<US-REF>-<PHASE>-<CYCLE>-YYYYMMDD` format (date in YYYYMMDD)

**Never Create (FORBIDDEN)**:
- ❌ **tdd-execution.md** (progress tracked via checkboxes in implementation-plan.md)
- ❌ **tdd-execution/ folder** (no separate cycle tracking needed)
- ❌ **api-design.md** (API details belong in description.md, tech-spec.md, or OpenAPI spec)
- ❌ **us-completion-checklist.md** (Definition of Done already in description.md)
- ❌ **handoff.md or handoff.json** (agents read plan + features directly)
- ❌ **cycle-specific files** (e.g., cycle-5-handoff.md, red-summary.md, green-18-notes.md)
- ❌ **agent-specific logs** (e.g., dev-tdd-red-notes.md, dev-tdd-green-log.md)
- ❌ **Any other files or folders** not listed in "Required Folder Structure" above

**Result**: Clean, minimal, auditable structure with ZERO document sprawl. Progress tracked via checkbox completion in implementation-plan.md and git commits.

---

**Framework**: Simplified User Story Structure v3.0  
**Template**: User Story Folder (3 Files + 1 Folder Only)  
**Usage**: Dev-Lead creates structure; BA provides BDD scenarios; TDD agents execute checkboxes  
**Last Updated**: 2026-04-02  
**Status**: ACTIVE
