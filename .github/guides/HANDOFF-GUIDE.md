# Handoff Guide: Agent-to-Agent Contract & Execution

**Status**: Production Ready | **Last Updated**: January 20, 2026 | **Single Source of Truth**: This file replaces handoff-contracts.yaml, handoff-contract-format.md, and layer-handoff.prompts.md

---

## Quick Start

**For orchestrator**: Use the [Agent Responsibilities](#agent-responsibilities) table to understand who does what  
**For agents creating handoffs**: Use the [Handoff Format](#handoff-format) to structure your handoff  
**For agents receiving handoffs**: Use the [Handoff Execution](#handoff-execution-pattern) pattern to understand your task

---

## Part 1: Agent Responsibilities & Quality Gates

### PDLC Workflow Handoffs

| From Agent | To Agent | Phase | Required Files | Quality Gates | Next Agent Task |
|-----------|----------|-------|-----------------|---|---|
| **PM** | **PO** | Stage 1 | project-charter.md | ✅ Charter complete with 3+ objectives ✅ Stakeholders identified ✅ Success metrics defined | Create requirements.md |
| **PO** | **BA** | Stage 2 | requirements.md | ✅ Requirements prioritized ✅ User archetypes identified ✅ Success criteria measurable | Create personas.md + business-case.md |
| **BA** | **UX** | Stage 2-3 | personas.md, business-case.md | ✅ Personas distinct and testable ✅ Business case justified ✅ Key pain points identified | Create journey-maps.md |
| **UX** | **Architect** | Stage 3 | journey-maps.md | ✅ Journey maps have 5-8 steps ✅ Core user flows identified ✅ Technical constraints noted | Design architecture-design.md + tech-spec.md |
| **Architect** | **PO** | Stage 4 | architecture-design.md | ✅ Architecture justified (vs. alternatives) ✅ API contracts defined ✅ Tech stack locked | Create user-stories.md with BDD |
| **PO** | **BA** | Stage 4-5 | user-stories.md (PRD) | ✅ Stories testable ✅ Epic groupings clear ✅ Dependencies mapped | Add BDD scenarios to user-stories.md |
| **BA** | **Dev-Lead** | Stage 5 → Impl Phase 2 | user-stories.md (BDD) | ✅ Gherkin scenarios valid ✅ Feature files executable structure ✅ Blocking dependencies identified | Create implementation-plan.md |

### Implementation Workflow Handoffs

| From Agent | To Agent | Phase | Required Files | Quality Gates | Escalation Trigger |
|-----------|----------|-------|-----------------|---|---|
| **Dev-Lead** | **BA** | Phase 2: BDD Integration | <US-REF>.md (enriched) | ✅ API endpoints defined ✅ Schemas matched to OpenAPI ✅ BDD assertions mapped to operationIds | If API conflicts with architecture-design.md |
| **BA** | **Dev-Lead** | Phase 2: BDD Validation | <US-REF>.md (validated) | ✅ All ambiguities resolved ✅ DOR 100% complete ✅ Ready for TDD | If BDD scenario unmappable |
| **Dev-Lead** | **Dev-TDD** | Phase 3: TDD Execution (Layer 1) | implementation-plan.md | ✅ Plan has all 4 layers ✅ BDD assertions listed per layer ✅ Architectural constraints included | If plan conflicts with architecture |
| **Dev-TDD** | **Dev-TDD-RED** | TDD RED Phase | implementation-plan.md (current layer) | ✅ Test target clear ✅ BDD assertion to test defined | If test structure unclear |
| **Dev-TDD-RED** | **Dev-TDD** | RED Output | test file created | ✅ Test FAILS with clear error ✅ Test is readable | If test runs GREEN (not failing) |
| **Dev-TDD** | **Dev-TDD-GREEN** | TDD GREEN Phase | test file (from RED) | ✅ Test file runs | If test cannot execute |
| **Dev-TDD-GREEN** | **Dev-TDD** | GREEN Output | implementation code | ✅ Test PASSES ✅ Minimal implementation only | If test still fails |
| **Dev-TDD** | **Dev-TDD-REFACTOR** | TDD REFACTOR Phase | implementation code | ✅ Code passes RED test ✅ Architectural constraints listed | If code violates constraints |
| **Dev-TDD-REFACTOR** | **Dev-TDD** | REFACTOR Output | refactored code | ✅ Test STILL PASSES ✅ Code quality improved | If test breaks after refactor |
| **Dev-TDD** | **Dev-Lead** | Layer Complete | all layer files + test results | ✅ BDD layer assertions passing ✅ Code review approved ✅ Test coverage >80% | If code fails 13-point checklist |
| **Dev-Lead** | **Dev-Lead** (internal) | Layer Verification | implementation-plan.md | ✅ All layer dependencies met ✅ Next layer prerequisites ready | If dependencies broken |
| **Dev-Lead** | **BA** | Story Validation | all 4 layers complete + test results | ✅ All BDD scenarios passing ✅ Design requirements met | If BDD scenario fails |
| **BA** | **Orchestrator** | Story Acceptance | story validation report | ✅ Story meets definition of done ✅ No breaking changes | If acceptance criteria not met |

---

## Part 2: Handoff Format

### Structure: What Every Handoff Contains

```json
{
  "metadata": {
    "handoff_id": "[US-REF]-HO-[LAYER]",
    "story_ref": "US-XXX",
    "from_agent": "agent-name",
    "to_agent": "next-agent-name",
    "layer": "1 (database) | 2 (backend) | 3 (config) | 4 (frontend) | null (PDLC)",
    "timestamp": "ISO8601",
    "phase": "PDLC Stage X | Implementation Phase Y"
  },

  "summary": {
    "subject": "What was completed",
    "status": "ready_for_next_phase",
    "decision_required": false,
    "next_gate": "What comes next"
  },

  "delta": {
    "what_changed": [
      "Created: /path/to/file",
      "Updated: /path/to/file",
      "Validated: /path/to/file"
    ],
    "estimated_effort": {
      "current_layer": "X hours",
      "total_remaining": "Y hours"
    }
  },

  "critical_context": {
    "canonical_sources": {
      "key_file": "/path/to/file"
    },
    "critical_constraints": [
      {
        "priority": "CRITICAL | HIGH | MEDIUM",
        "constraint": "What must not be violated",
        "impact": "What breaks if violated",
        "test_coverage": "How BDD validates this"
      }
    ],
    "architectural_decisions": [
      {
        "decision": "What was decided",
        "rationale": "Why this way",
        "files_affected": ["list of files"]
      }
    ]
  },

  "layer_by_layer_status": {
    "layer_1_database": {
      "status": "ready_for_red | in_progress | complete",
      "failing_test": "Description of what test should fail",
      "files_to_create": ["list"],
      "expected_schema": "What columns/tables/models needed"
    },
    "layer_2_backend": { },
    "layer_3_configuration": { },
    "layer_4_frontend": { }
  },

  "next_agent_instructions": {
    "agent_role": "Who receives this",
    "task": "What they do",
    "prompt_template": "/path/to/agent/prompt",
    "files_to_review": ["list"],
    "specific_instructions": ["step 1", "step 2"],
    "acceptance_criteria": ["criteria 1", "criteria 2"]
  },

  "quality_gates": {
    "validation_checklist": [
      {
        "check": "What to validate",
        "method": "How to check",
        "status": "PASS | FAIL"
      }
    ],
    "gate_decision": "PASS → ready | BLOCK → needs rework"
  },

  "rollback_plan": {
    "if_issue_X": "How to recover",
    "escalation": "Who to contact if stuck"
  }
}
```

### Layer 1 Handoff Example (FULL - Most Detailed)

```json
{
  "metadata": {
    "handoff_id": "US-001-HO-01",
    "story_ref": "US-001",
    "from_agent": "dev-lead",
    "to_agent": "dev-tdd-red",
    "layer": 1,
    "phase": "Implementation Phase 3"
  },

  "summary": {
    "subject": "Layer 1 Database Ready for RED Phase",
    "status": "ready_for_next_phase",
    "next_gate": "RED test created and failing"
  },

  "delta": {
    "what_changed": [
      "Created: /docs/user-stories/US-001/implementation-plan.md",
      "Updated: /api/openapi.yaml (schema definitions)",
      "Created: /docs/user-stories/US-001/bdd-scenarios/ (copied from PRD)"
    ],
    "estimated_effort": {
      "layer_1_database": "2-3 hours",
      "layer_2_backend": "4-5 hours",
      "layer_3_configuration": "1-2 hours",
      "layer_4_frontend": "3-4 hours",
      "total_remaining": "10-14 hours"
    }
  },

  "critical_context": {
    "canonical_sources": {
      "story_yaml": "/docs/user-stories/US-001/story.yaml",
      "implementation_plan": "/docs/user-stories/US-001/implementation-plan.md",
      "bdd_scenarios": "/docs/prd/user-stories.md#US-001"
    },
    "critical_constraints": [
      {
        "priority": "CRITICAL",
        "constraint": "Service layer must sync Tier fields across User and Subscription",
        "impact": "Data integrity failure if tiers don't match",
        "test_coverage": "BDD: 'Subscription tier matches user tier'"
      },
      {
        "priority": "HIGH",
        "constraint": "Error codes must match OpenAPI schema enum",
        "impact": "API contract violation causes client errors",
        "allowed_codes": ["VALIDATION_ERROR", "EMAIL_TAKEN", "UNAUTHORIZED", "NOT_FOUND", "CONFLICT"]
      }
    ]
  },

  "layer_by_layer_status": {
    "layer_1_database": {
      "status": "ready_for_red",
      "failing_test": "Migration creates <table-name> with required columns",
      "files_to_create": [
        "migrations/<timestamp>_create_<resource>_table.sql"
      ],
      "expected_columns": [
        "id (UUID, PRIMARY KEY)",
        "email (VARCHAR, NOT NULL UNIQUE)",
        "createdAt (TIMESTAMP, NOT NULL)"
      ],
      "expected_indexes": ["email (UNIQUE)"]
    },
    "layer_2_backend": {
      "status": "awaiting_layer_1",
      "failing_test": "POST /api/v1/<resource> returns 201"
    },
    "layer_3_configuration": {
      "status": "awaiting_layer_2",
      "failing_test": "Route registered for POST /api/v1/<resource>"
    },
    "layer_4_frontend": {
      "status": "awaiting_layer_3",
      "failing_test": "Form submission calls API and displays response"
    }
  },

  "next_agent_instructions": {
    "agent_role": "dev-tdd-red",
    "task": "Write failing test for Layer 1 database",
    "files_to_review": [
      "/docs/user-stories/US-001/implementation-plan.md (Layer 1 section)"
    ],
    "specific_instructions": [
      "Read Layer 1 section of implementation-plan.md",
      "Understand: failing test should verify migration creates table",
      "Create test file: tests/migrations/<timestamp>.test.ts",
      "Test describes: 'Migration creates table with required columns'",
      "Assert on: table exists, columns present, data types correct",
      "Ensure test FAILS (migration file doesn't exist yet)",
      "Commit test before handing to GREEN agent"
    ],
    "acceptance_criteria": [
      "✅ Test file created at expected path",
      "✅ Test runs and FAILS with clear error message",
      "✅ Test is readable with inline comments",
      "✅ No external dependencies or network calls"
    ]
  },

  "quality_gates": {
    "validation_checklist": [
      {
        "check": "All canonical sources valid and linked",
        "method": "Verify /docs/user-stories/US-001/ paths exist"
      },
      {
        "check": "OpenAPI spec syntactically valid",
        "method": "Run: spectral lint api/openapi.yaml"
      },
      {
        "check": "BDD scenarios copied to features/",
        "method": "Verify: features/<domain>/<feature>.feature exists"
      }
    ],
    "gate_decision": "PASS ✅ Ready for Layer 1 RED phase"
  }
}
```

### Layers 2-4 Handoff Example (COMPACT - References Canonical Sources)

After Layer 1 is complete, use this shorter format:

```json
{
  "metadata": {
    "handoff_id": "US-001-HO-02",
    "story_ref": "US-001",
    "from_agent": "dev-tdd-refactor",
    "to_agent": "dev-tdd-red",
    "layer": 2,
    "phase": "Implementation Phase 3"
  },

  "summary": {
    "subject": "Layer 1 Complete → Layer 2 Backend Ready",
    "status": "ready_for_next_layer",
    "progress": "25% complete (1 of 4 layers)"
  },

  "delta": {
    "what_changed": "Layer 1 migration created and tested ✅",
    "files_completed": [
      "migrations/<timestamp>_create_<resource>_table.sql",
      "tests/migrations/<timestamp>.test.ts"
    ]
  },

  "canonical_references": {
    "full_plan": "/docs/user-stories/US-001/implementation-plan.md",
    "layer_2_section": "/docs/user-stories/US-001/implementation-plan.md#L85"
  },

  "critical_reminders": [
    "⚠️ Service layer must sync User.tier ↔ Subscription.tier",
    "⚠️ Error codes must match OpenAPI schema enum"
  ],

  "next_layer_task": "Write RED test for Layer 2: POST /api/v1/<resource> returns 201"
}
```

---

## Part 3: Handoff Execution Pattern

### When Creating a Handoff (Sender)

1. **Gather context**: Review implementation-plan.md, any code written, BDD status
2. **Fill metadata**: Who am I, who receives this, what layer/phase
3. **Describe delta**: What changed since last handoff
4. **List canonical sources**: Where should receiver go for full details (DON'T copy files)
5. **Flag constraints**: What must NOT be violated (from user preferences + architecture)
6. **Describe next task**: What does receiver do, where are the instructions
7. **Validate quality gates**: Does this handoff meet all checks (PASS/BLOCK)
8. **Create handoff file**: Save as `/docs/user-stories/<US-REF>/<US-REF>-HO-<LAYER>.json`
9. **Commit**: Git commit with message "Handoff: US-001 Layer 2 ready for TDD"

### When Receiving a Handoff (Receiver)

1. **Read metadata**: Understand phase, layer, who handed this off
2. **Review summary**: Current status, what comes next
3. **Check canonical sources**: Click links to get full details (don't assume handoff has everything)
4. **Review critical reminders**: From user preferences + previous layers
5. **Understand next task**: Clear instructions in `next_agent_instructions`
6. **Validate acceptance criteria**: Know what "done" means before starting
7. **Execute task**: Follow prompt template if available
8. **Create output**: Files specified in "files_to_create"
9. **Validate before handoff**: Ensure all quality gates PASS
10. **Hand off**: Pass to next agent with new handoff JSON

---

## Part 4: Validation Rules

### Quality Gate Checks (All Handoffs)

- ✅ All canonical source paths exist
- ✅ Required files listed are actually created
- ✅ Next agent instructions are clear and unambiguous
- ✅ Acceptance criteria are testable
- ✅ Critical constraints are priority-ordered
- ✅ No broken cross-references
- ✅ Estimated effort is realistic (within 1-2 hours)

### Layer-Specific Checks

**Layer 1 (Database)**:
- ✅ Migration file path follows convention: `migrations/<YYYYMMDD>_<description>.sql`
- ✅ Migration includes up script (CREATE) and down script (DROP)
- ✅ All BDD assertions for Layer 1 are listed
- ✅ Schema matches OpenAPI component definitions

**Layer 2 (Backend)**:
- ✅ All endpoints have operationIds that match OpenAPI spec
- ✅ Request/response schemas match OpenAPI definitions
- ✅ Error codes come from OpenAPI schema enum
- ✅ Service layer responsibilities documented (especially tier sync)
- ✅ Curl examples provided for testing

**Layer 3 (Configuration)**:
- ✅ Routes registered for all Layer 2 endpoints
- ✅ Middleware chain defined
- ✅ Dependency injection configured
- ✅ Feature flags set up (if applicable)

**Layer 4 (Frontend)**:
- ✅ Components match design-systems.md definitions
- ✅ State management for API responses documented
- ✅ Error handling for all possible error codes
- ✅ Loading states and fallbacks implemented

---

## Part 5: Escalation Contracts

If any of these conditions occur, escalate immediately:

| Trigger | Severity | Escalate To | Expected Resolution |
|---------|----------|-------------|---|
| API endpoint conflicts with architecture-design.md | CRITICAL | Architect + Dev-Lead | Architecture decision or endpoint redesign (4-8 hours) |
| BDD scenario cannot be mapped to any layer | CRITICAL | BA + Dev-Lead | Scenario clarification or split into multiple stories (4-8 hours) |
| Code fails 13-point code review OR coverage <80% | HIGH | Dev-Lead + Tech Lead | Rework quality or extend timeline (4-24 hours) |
| Test failures after refactoring (REFACTOR broken GREEN) | HIGH | Dev-TDD + Dev-Lead | Root cause analysis and fix (2-4 hours) |
| Data model conflicts between layers | MEDIUM | Dev-Lead | Reconcile schemas across layers (1-2 hours) |
| OpenAPI spec outdated vs implementation | MEDIUM | Dev-Lead + Architect | Sync spec with code (1-2 hours) |

---

## Part 6: Integration with Existing Tools

### Git Workflow

```bash
# Create handoff artifact
/docs/user-stories/<US-REF>/<US-REF>-HO-<LAYER>.json

# Commit with clear message
git commit -m "Handoff: US-001 Layer 2 backend ready for TDD

- API endpoints: POST/GET /api/v1/users
- OpenAPI spec: updated with UserCreateRequest schema
- Critical: User.tier ↔ Subscription.tier sync required
- Next: dev-tdd-red writes RED tests for Layer 2"
```

### Issue Tracker Integration

- **GitHub Issue**: Link to user story (US-001)
- **Milestone**: Current sprint
- **Labels**: `implementation`, `layer-2`, `tdd-ready`
- **Comments**: Handoff link and next agent assignment

### Todo List Integration

```
@orchestrator Layer checkpoint for US-001 Layer 2

Current: Layer 1 COMPLETE ✅ Layer 2 READY FOR TDD 🔴
Status: 25% complete (1 of 4 layers)
Next: dev-tdd-red starts RED phase for Layer 2 backend
Blocker: None
```

---

## Part 7: How to Use This Guide

**You are a PM?**
→ Read: [Agent Responsibilities](#agent-responsibilities) table (PDLC section)  
→ Track: Handoffs between PM → PO → BA → UX → Architect

**You are a Dev-Lead?**
→ Read: [Handoff Format](#handoff-format) (Layer 1 example)  
→ Create: `/docs/user-stories/<US-REF>/<US-REF>-HO-01.json` per story

**You are a TDD Agent (RED/GREEN/REFACTOR)?**
→ Read: [Handoff Execution](#handoff-execution-pattern) (When Receiving)  
→ Review: `next_agent_instructions` in handoff JSON  
→ Validate: Acceptance criteria before handing off to next layer

**You are the Orchestrator?**
→ Use: [Quality Gate Checks](#quality-gate-checks)  
→ Escalate: Per [Escalation Contracts](#escalation-contracts)  
→ Track: Handoff history in GitHub issues + todo lists

---

**Last Update**: January 20, 2026 | **Files Deprecated**: handoff-contracts.yaml, handoff-contract-format.md, layer-handoff.prompts.md | **Status**: Ready for production use with AUTH-003+ stories

