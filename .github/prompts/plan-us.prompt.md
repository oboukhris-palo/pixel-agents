## Objective
Create comprehensive implementation plan for a user story including layer-by-layer breakdown and BDD scenario coverage with TDD approach.

## Context
You are planning the technical implementation of a user story within an epic structure. The plan must provide clear guidance for TDD execution and ensure proper test coverage across all architectural layers.

## Requirements

### Input Parameters
- **STORY_REF**: User story identifier (e.g., US-001, US-002)
- **EPIC**: Epic reference and name (e.g., E001 Authentication)
- **LAYER**: Current layer focus (database|backend|config|frontend)

### Planning Scope
1. **Four-Layer Architecture**: Database → Backend → Configuration → Frontend
2. **BDD Scenario Coverage**: Map acceptance criteria to testable scenarios
3. **TDD Approach**: Define test-first development steps
4. **Implementation Constraints**: Technical dependencies and limitations
5. **Handoff Requirements**: Clear next steps for development team

## Deliverables

### 1. Implementation Plan Document
Create/update: `/docs/05-implementation/epics/{EPIC_REF}/user-stories/{STORY_REF}/implementation-plan.md`

**Required Structure**:
```markdown
# Implementation Plan - {STORY_REF}

## Story Overview
[Brief description and acceptance criteria]

## Layer Implementation
### Layer 1: Database
- Files to create: [specific file paths]
- BDD coverage: [relevant scenarios]
- Testing approach: [unit/integration tests]

### Layer 2: Backend Services
- Files to create: [specific file paths]
- API endpoints: [if applicable]
- BDD coverage: [relevant scenarios]
- Testing approach: [service tests]

### Layer 3: Configuration
- Configuration files: [if needed]
- Environment setup: [requirements]
- BDD coverage: [configuration scenarios]

### Layer 4: Frontend
- Components to create: [specific components]
- UI interactions: [user flows]
- BDD coverage: [UI scenarios]
- Testing approach: [component/e2e tests]

## Constraints & Dependencies
[Technical limitations and prerequisites]

## TDD Approach
[Test-first development strategy]
```

### 2. Handoff Summary
Ensure exists: `/docs/05-implementation/epics/{EPIC_REF}/user-stories/{STORY_REF}/plan-approval.yaml`

**Content Requirements**:
- Implementation plan summary
- Next steps for TDD execution
- Priority layer for initial development
- Key constraints and dependencies

### 3. BDD Scenario Links
Include references to: `/docs/05-implementation/epics/{EPIC_REF}/user-stories/{STORY_REF}/bdd-scenarios/`
- Map acceptance criteria to BDD feature files
- Ensure scenarios cover all layers
- Define executable specifications

## Quality Standards

- ✅ Implementation plan follows standard four-layer structure
- ✅ All layers include specific file paths and components
- ✅ BDD scenarios map directly to acceptance criteria
- ✅ TDD approach clearly defined for each layer
- ✅ Dependencies and constraints documented
- ✅ Handoff document provides clear next steps
- ✅ Plan is concise and test-driven focus
- ✅ Implementation is technically feasible

## File Management

### Directory Structure
Ensure proper epic/story folder organization:
```
docs/05-implementation/epics/{EPIC_REF}/
└── user-stories/{STORY_REF}/
    ├── implementation-plan.md
    ├── plan-approval.yaml
    └── bdd-scenarios/
        └── [feature files]
```

### Cross-References
- Link to original user story in PRD
- Reference epic context and related stories
- Connect to BDD scenarios and test specifications
- Maintain traceability to acceptance criteria
