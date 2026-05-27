# Phase 5: Testing Quality Gate

gate_id: "gate-03-testing"
phase: "03-testing"
executed_by: "qa.agent.md + ba.agent.md"

## Prerequisites

- [ ] BDD scenarios created for all user stories (Given/When/Then format)
- [ ] BDD scenarios map to acceptance criteria (1:1 or 1:N)
- [ ] Test strategy defined (unit, integration, E2E, manual testing)
- [ ] Test coverage targets set (>= 80% code coverage)
- [ ] Non-functional testing approach documented (performance, security, load)
- [ ] Test data & fixtures prepared
- [ ] Test environment requirements specified

## Artifacts Required

- [ ] `test-strategies.md` (overall testing approach)
- [ ] `features/*/bdd-scenarios.feature` files (Gherkin format)
- [ ] `test-coverage-targets.md` (by component/layer)
- [ ] `test-data-strategy.md` (fixtures, datasets, seeding)
- [ ] `non-functional-testing-plan.md` (perf, security, load)
- [ ] `test-environment-spec.md` (required infrastructure)

## Quality Metrics

| Metric | Threshold | Measurement | Status |
|--------|-----------|-------------|--------|
| BDD scenario coverage | >= 95% of acceptance criteria have matching BDD | Map acceptance criteria → BDD scenarios | |
| BDD quality | >= 85% of scenarios are implementation-ready | Evaluate scenario clarity and testability | |
| Test coverage targets | Targets set by component (aim for 80%+) | Review test-coverage-targets.md | |
| Test strategy completeness | All testing types addressed | Checklist in test-strategies.md | |

## Approval Process

- **Gatekeeper:** qa.agent.md + ba.agent.md
- **Review Time:** < 3 hours
- **Approval Method:** Automated checklist + QA review
- **Decision Format:** ✅ PASS | ⚠️ CONDITIONAL | ❌ FAIL

## Outcomes

- **On PASS:** Proceed to Phase 6-7 (`04-planning.workflows.yml`)
- **On CONDITIONAL:** Return to BA/QA for BDD refinement; re-run gate within 1 day
- **On FAIL:** BLOCK progression; conduct BDD workshop

## Post-Gate Artifact

`testing-gate-report.md` (generated after review using `gate-report-tmpl.md`)

## Override Procedures

If gate FAILS and override is justified, follow `.github/validation/override-mechanisms.md`.
Use `.github/templates/approval-block-tmpl.md` to document override approval.
Use `.github/templates/approval-gate-tmpl.md` for structured approval gate records.
Orchestrator enforces `.github/validation/workflow-compliance.yml` risk levels.
