# Phase 8: Implementation Quality Gate (Per-Story)

gate_id: "gate-05-implementation"
phase: "05-implementation"
executed_by: "dev-lead.agent.md + qa.agent.md"

## Prerequisites (Per User Story)

- [ ] Implementation plan created and approved (`plan-approval.yaml` status: approved)
- [ ] All TDD cycles completed (RED → GREEN → REFACTOR for all layers)
- [ ] All BDD scenarios passing in test environment
- [ ] Code review completed (13-point checklist)
- [ ] Unit test coverage >= 80% for story code
- [ ] Integration tests passing
- [ ] No regressions in existing test suite
- [ ] Implementation checkboxes in `implementation-plan.md` all checked

## Artifacts Required (Per User Story)

- [ ] `implementation-plan.md` (all checkboxes complete)
- [ ] `plan-approval.yaml` (status: approved)
- [ ] `features/*.feature` (BDD scenarios — all passing)
- [ ] TDD agent logs for all cycles
- [ ] Code committed with proper TDD commit messages
- [ ] Story status updated in `docs/05-implementation/user-stories.md`

## Quality Metrics

| Metric | Threshold | Measurement | Status |
|--------|-----------|-------------|--------|
| BDD scenario pass rate | 100% of story BDD scenarios passing | Execute BDD test suite | |
| Unit test coverage | >= 80% for story code | Coverage report | |
| Code review score | All 13 checklist items passed | Code review checklist | |
| Regression safety | 0 failing tests in existing suite | Full test suite run | |
| TDD compliance | All layers have RED-GREEN-REFACTOR commits | Git history audit | |

## Approval Process

- **Gatekeeper:** dev-lead.agent.md + qa.agent.md
- **Review Time:** < 2 hours per story
- **Approval Method:** Automated test results + code review + QA validation
- **Decision Format:** ✅ PASS | ⚠️ CONDITIONAL | ❌ FAIL

## Outcomes

- **On PASS:** Mark story as "Implemented"; proceed to next story or epic completion
- **On CONDITIONAL:** Fix specific issues; re-run gate within 1 day
- **On FAIL:** BLOCK story delivery; identify root cause; rework as needed

## Post-Gate Artifact

Story status update in `docs/05-implementation/user-stories.md`

## Override Procedures

If gate FAILS and override is justified, follow `.github/validation/override-mechanisms.md`.
Use `.github/templates/approval-block-tmpl.md` to document override approval.
Use `.github/templates/approval-gate-tmpl.md` for structured approval gate records.
Orchestrator enforces `.github/validation/workflow-compliance.yml` risk levels.
