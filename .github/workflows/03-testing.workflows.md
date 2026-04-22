# Testing Strategy Workflow (Phase 5)

**Workflow ID:** TESTING-001  
**PDLC Phase:** Phase 5 (Testing Strategy)  
**Output Location:** `/docs/03-testing/`  
**Input:** Architecture gate passed from `02-architecture.workflows.md`  
**Handoff Target:** `04-planning.workflows.md`  
**Agents:** Dev-Lead (strategy), BA (BDD consolidation), QA (validation), PO (approval)  
**Logging:** `/logs/03-testing/agent-{name}-YYYYMMDD.md`  
**Quality Gate:** `.github/gates/gate-03-testing.md`

---

## Referenced Artifacts

### Templates
- `.github/templates/agent-log-tmpl.md` — Agent logging format
- `.github/templates/gate-report-tmpl.md` — Quality gate report format
- `.github/templates/user-story-tmpl.yml` — BDD scenario reference from user stories

### Quality Gates
- `.github/gates/gate-03-testing.md` — Phase 5 validation (BDD coverage ≥95%, test data, environment specs)

### Guides
- `.github/guides/gate-blocker-resolution.guide.md` — Blocker resolution strategies
- `.github/guides/tdd-enforcement.guide.md` — TDD cycle standards and enforcement

### Instructions
- `.github/instructions/test-strategy.instructions.md` — Test strategy design patterns and edge case identification
- `.github/instructions/documentation.instructions.md` — Documentation standards
- `.github/instructions/agent-logging.instructions.md` — Mandatory logging rules
- `.github/instructions/framework-standards.instructions.md` — Naming conventions

### Scripts
- `.github/scripts/update-decision-trail.mjs` — Decision trail automation (after gate execution)

### Patterns
- `.github/patterns/testing/bdd-scenarios/template-library.md` — BDD scenario templates (40-50% PRU savings)

---

## Overview

This workflow covers **Phase 5** of the PDLC: Testing Strategy. It consolidates BDD scenarios from user stories, defines comprehensive testing approach across all layers, and establishes coverage targets.

**Note:** BDD scenarios are already attached to each user story from Stage 3. This phase consolidates the overall testing strategy and validates coverage.

---

## STAGE 5: Testing Strategy

**Inputs:** user-stories.md (with BDD), tech-spec.md, flow-diagrams.md  
**Output:** `test-strategies.md`  
**Agents:** Dev-Lead (strategy), BA (BDD consolidation), QA (validation), PO (approval)

### Steps

1. **Dev-Lead** (`dev-lead-test-strategies`) → Define testing approach:
   - Unit testing (80%+ coverage target)
   - Integration testing (API contracts, service layer)
   - End-to-end testing (user journey flows)
   - Performance testing (load, stress, scalability)
   - Security testing (OWASP, penetration, vulnerability)

2. **BA** (`ba-bdd-scenarios-consolidation`) → Verify BDD coverage:
   - Map acceptance criteria → BDD scenarios (1:1 or 1:N)
   - Organize scenarios by epic/story
   - Validate scenario quality (specific, actionable, implementation-ready)

3. **QA** (`qa-test-strategy-review`) → Review and validate:
   - Test data and fixtures strategy
   - Test environment requirements
   - Non-functional testing approach
   - Edge case coverage analysis

4. **PO** (`po-test-strategies-approval`) → Validate coverage, approve

### Approval Gate
✓ BDD covers acceptance criteria  
✓ Unit coverage 80%+ targeted  
✓ Integration tests cover flows  
✓ E2E tests cover user journeys  
✓ Performance/security aligned with requirements

---

## Test Strategy Artifacts

### Required Outputs
- `test-strategies.md` — Overall testing approach
- BDD feature files organized by epic/story in `features/` directories
- `test-coverage-targets.md` — Coverage targets by component/layer
- `test-data-strategy.md` — Fixtures, datasets, seeding approach
- `non-functional-testing-plan.md` — Performance, security, load testing

---

## Phase Exit: Quality Gate

Execute `.github/gates/gate-03-testing.md`. Gate outcome determines progression:

- ✅ PASS → Proceed to `04-planning.workflows.md`
- ⚠️ CONDITIONAL → Return to BA for BDD refinement; re-run within 1 day
- ❌ FAIL → BLOCK; see `.github/guides/gate-blocker-resolution.guide.md` for resolution

---

## Agent Logging Requirements (MANDATORY)

| Agent | Activities | Log Path |
|-------|-----------|----------|
| **ba** | BDD scenario consolidation, acceptance criteria | `/logs/03-testing/agent-ba-YYYYMMDD.md` |
| **qa** | Test strategy review, validation | `/logs/03-testing/agent-qa-YYYYMMDD.md` |
| **dev-lead** | Testing strategy definition | `/logs/03-testing/agent-dev-lead-YYYYMMDD.md` |
| **orchestrator** | Phase transitions, quality gate execution | `/logs/03-testing/agent-orchestrator-YYYYMMDD.md` |

**Template:** `.github/templates/agent-log-tmpl.md`

---

**Status:** ACTIVE | **Version:** 2.0 | **Last Updated:** April 21, 2026
