# Planning & Deployment Workflow (Phases 6-7)

**Workflow ID:** PLANNING-001  
**PDLC Phase:** Phases 6-7 (Iteration Planning & Deployment Strategy)  
**Output Location:** `/docs/04-planning/`  
**Input:** Testing gate passed from `03-testing.workflows.md`  
**Handoff Target:** `05-implementation.workflows.md`  
**Agents:** PM (coordination, estimation), PO (planning), Architect (deployment), Dev-Lead (sprint readiness)  
**Logging:** `/logs/04-planning/agent-{name}-YYYYMMDD.md`  
**Quality Gate:** `.github/gates/gate-04-planning.md`

---

## Referenced Artifacts

### Templates
- `.github/templates/agent-log-tmpl.md` — Agent logging format
- `.github/templates/gate-report-tmpl.md` — Quality gate report format
- `.github/templates/implementation-plan-tmpl.md` — Layer-by-layer implementation plan
- `.github/templates/user-story-tmpl.yml` — Story estimation section (populated in Phase 3.5)

### Quality Gates
- `.github/gates/gate-04-planning.md` — Phase 6-7 validation (100% story estimates, deployment plan, sprint readiness)

### Guides
- `.github/guides/gate-blocker-resolution.guide.md` — Blocker resolution strategies
- `.github/guides/tdd-enforcement.guide.md` — TDD readiness validation

### Instructions
- `.github/instructions/estimation.instructions.md` — AI-era estimation framework (reference for validating estimates)
- `.github/instructions/documentation.instructions.md` — Documentation standards
- `.github/instructions/agent-logging.instructions.md` — Mandatory logging rules
- `.github/instructions/framework-standards.instructions.md` — Naming conventions
- `.github/instructions/git-workflow.instructions.md` — Branch naming, commit patterns, PR workflow

### Scripts
- `.github/scripts/update-decision-trail.mjs` — Decision trail automation (after gate execution)

---

## Overview

This workflow covers **Phases 6-7** of the PDLC: Deployment & Monitoring strategy and Development & Testing Execution planning. It creates sprint plans, deployment strategies, and ensures TDD readiness.

---

## STAGE 6: Deployment & Monitoring

**Inputs:** All Stage 4-5 docs, requirements.md, business-case.md  
**Output:** `iteration-planning.md`  
**Agents:** PO (planning), PM (coordination), Architect (deployment)

### Steps

1. **PO** (`po-iteration-planning`) → MVP vs phased rollout, feature phasing, release timeline
2. **Architect** (`architect-deployment`) + **PM** (`pm-deployment-coordination`) → Deployment architecture, logistics
3. **PO** (`po-monitoring-feedback`) → Monitoring metrics, feedback loop

### Approval Gate
✓ Release phases sequenced  
✓ MVP identified  
✓ Deployment sound  
✓ Monitoring covers business/technical metrics  
✓ Feedback loop defined

---

## STAGE 7: Development & Testing Execution Planning

**Inputs:** All Stage 1-6 docs (approved)  
**Agents:** Dev-Lead (sprint orchestration), PM (resource planning)

### Sprint Planning Process

1. **Dev-Lead** (`dev-lead-sprint-planning`) → Plan sprint scope + create implementation plans
2. **Dev-Lead** (`dev-lead-bdd-integration`) → Setup BDD feature files + prepare layer assignments
3. **PM** (`pm-resource-planning`) → Confirm team availability, validate sprint feasibility

### Deployment Strategy Artifacts

**Required Outputs:**
- `iteration-planning.md` — Sprint/iteration schedule
- `deployment-plan.md` — Deployment strategy and rollback procedures
- `dependency-graph.md` — Story interdependencies
- `resource-plan.md` — Team assignments
- `risk-register.md` — Identified risks + mitigations
- `success-criteria.md` — KPIs and measurement approach

---

## Phase Exit: Quality Gate

Execute `.github/gates/gate-04-planning.md`. Gate outcome determines progression:

- ✅ PASS → Proceed to `05-implementation.workflows.md` (TDD begins)
- ⚠️ CONDITIONAL → Resolve scheduling conflicts; re-run gate within 1 day
- ❌ FAIL → BLOCK; see `.github/guides/gate-blocker-resolution.guide.md` for resolution

---

## Agent Logging Requirements (MANDATORY)

| Agent | Activities | Log Path |
|-------|-----------|----------|
| **pm** | Iteration planning, coordination, resource planning | `/logs/04-planning/agent-pm-YYYYMMDD.md` |
| **po** | Feature phasing, monitoring strategy | `/logs/04-planning/agent-po-YYYYMMDD.md` |
| **architect** | Deployment architecture | `/logs/04-planning/agent-architect-YYYYMMDD.md` |
| **dev-lead** | Sprint planning, BDD integration | `/logs/04-planning/agent-dev-lead-YYYYMMDD.md` |
| **orchestrator** | Phase transitions, quality gate execution | `/logs/04-planning/agent-orchestrator-YYYYMMDD.md` |

**Template:** `.github/templates/agent-log-tmpl.md`

---

**Status:** ACTIVE | **Version:** 2.0 | **Last Updated:** April 21, 2026
