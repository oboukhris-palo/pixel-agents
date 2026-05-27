# Phase 6-7: Planning Quality Gate

gate_id: "gate-04-planning"
phase: "04-planning"
executed_by: "pm.agent.md + dev-lead.agent.md"

## Prerequisites

- [ ] All user stories estimated in story points (1-13 range)
- [ ] Sprint plan created (stories assigned to sprints)
- [ ] Dependencies documented (internal, external, blocking relationships)
- [ ] Resource plan confirmed (team capacity, skill availability)
- [ ] Deployment strategy defined (deployment sequence, rollback plan)
- [ ] Success criteria & KPIs defined
- [ ] Risk register created (identified risks + mitigations)
- [ ] Code generation strategy documented (TDD approach)

## Artifacts Required

- [ ] `iteration-planning.md` (sprint plan + schedules)
- [ ] `deployment-plan.md` (deployment strategy + rollback)
- [ ] `code-generation.md` (TDD approach, code review standards)
- [ ] `dependency-graph.md` (story interdependencies)
- [ ] `resource-plan.md` (team assignments)
- [ ] `risk-register.md` (risks + mitigations)
- [ ] `success-criteria.md` (KPIs + measurement)

## Quality Metrics

| Metric | Threshold | Measurement | Status |
|--------|-----------|-------------|--------|
| Story estimation completeness | 100% of stories have point estimates | Validate story_points in all story YAML | |
| Sprint plan feasibility | Velocity realistic vs team capacity | Compare planned points vs team capacity | |
| Dependency clarity | All blocking dependencies documented | Cross-validate dependency-graph.md | |
| Resource availability | All required skills committed | Validate resource-plan.md vs availability | |

## Approval Process

- **Gatekeeper:** pm.agent.md + dev-lead.agent.md
- **Review Time:** < 4 hours
- **Approval Method:** Automated checklist + PM + Dev-Lead sign-off
- **Decision Format:** ✅ PASS | ⚠️ CONDITIONAL | ❌ FAIL

## Outcomes

- **On PASS:** Proceed to Phase 8 (`.github/workflows/05-implementation.workflows.yml`; TDD begins)
- **On CONDITIONAL:** Resolve scheduling conflicts; re-run gate within 1 day
- **On FAIL:** BLOCK progression; conduct sprint planning workshop

## Post-Gate Artifact

`planning-gate-report.md` (generated after review using `gate-report-tmpl.md`)

## Override Procedures

If gate FAILS and override is justified, follow `.github/validation/override-mechanisms.md`.
Use `.github/templates/approval-block-tmpl.md` to document override approval.
Use `.github/templates/approval-gate-tmpl.md` for structured approval gate records.
Orchestrator enforces `.github/validation/workflow-compliance.yml` risk levels.
