# Phase 1-2: Requirements Quality Gate

gate_id: "gate-01-requirements"
phase: "01-requirements"
executed_by: "po.agent.md"

## Prerequisites

- [ ] All user stories linked to parent epics (epicKey + epicLink fields)
- [ ] User story acceptance criteria formalized (Given/When/Then BDD format)
- [ ] At least 2-3 user personas created with goals/pain points
- [ ] Business case documented (ROI, success metrics, competitive advantage)
- [ ] PO sign-off on all requirements (formal approval in gate report)
- [ ] Functional themes identified and documented
- [ ] Cross-theme dependencies mapped

## Artifacts Required

- [ ] `requirements.md` (master PRD)
- [ ] `personas.md` (2-3 distinct archetypes)
- [ ] `user-stories.md` (complete catalog with epic linkage)
- [ ] `business-case.md` (ROI and success metrics)
- [ ] `themes/` folder (functional theme organization)
- [ ] `epics/*.yml` (all epics using epic-tmpl.yml)
- [ ] `epics/*/stories/*.yml` (all user stories using user-story-tmpl.yml)
- [ ] `cross-theme-dependencies.md`

## Quality Metrics

| Metric | Threshold | Measurement | Status |
|--------|-----------|-------------|--------|
| Epic-story linkage | 100% of stories linked to parent epic | Validate epicKey field in every story YAML | |
| Acceptance criteria format | >= 80% stories have BDD-format criteria | Review acceptance_criteria section in story YAML | |
| User story point estimates | All stories estimated (1-13 points range) | Check story_points field in story YAML | |
| Requirements coverage | >= 85% coverage vs stakeholder inputs | Gap analysis: converted/ inputs vs user-stories.md | |
| PO validation | PO formal sign-off on all stories | Document PO approval in gate-report.md | CRITICAL |

## Approval Process

- **Gatekeeper:** po.agent.md + ba.agent.md
- **Review Time:** < 4 hours
- **Approval Method:** Automated checklist + PO sign-off
- **Decision Format:** ✅ PASS | ⚠️ CONDITIONAL | ❌ FAIL

## Outcomes

- **On PASS:** Proceed to Phase 3-4 (`02-architecture.workflows.yml`)
- **On CONDITIONAL:** Return to BA for refinement; re-run gate within 2 days
- **On FAIL:** BLOCK progression; conduct requirements clarification workshop

## Post-Gate Artifact

`requirements-gate-report.md` (generated after review using `gate-report-tmpl.md`)

## Override Procedures

If gate FAILS and override is justified, follow `.github/validation/override-mechanisms.md`.
Use `.github/templates/approval-block-tmpl.md` to document override approval.
Use `.github/templates/approval-gate-tmpl.md` for structured approval gate records.
Orchestrator enforces `.github/validation/workflow-compliance.yml` risk levels.
